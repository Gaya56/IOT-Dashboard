import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

// Initialize AI model
const model = new Supabase.ai.Session('gte-small')

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface IoTEvent {
  id: number
  device_id: string
  type: string
  value: string
  status: string
  metadata: any
  created_at: string
}

function createEmbeddingText(event: IoTEvent): string {
  // Create meaningful text representation for embedding
  const parts = [
    `${event.type} sensor`,
    `device ${event.device_id}`,
    `value ${event.value}`,
    `status ${event.status}`
  ]
  
  // Add metadata context if available
  if (event.metadata) {
    if (event.metadata.location) parts.push(`location ${event.metadata.location}`)
    if (event.metadata.device_name) parts.push(`${event.metadata.device_name}`)
    if (event.metadata.system_health) parts.push(`health ${event.metadata.system_health}`)
  }
  
  return parts.join(' ')
}

Deno.serve(async (req: Request) => {
  try {
    const url = new URL(req.url)
    const limit = parseInt(url.searchParams.get('limit') || '50')
    
    console.log(`Starting backfill for last ${limit} events`)
    
    // First get existing embedding event_ids
    const { data: existingEmbeddings, error: embeddingsError } = await supabase
      .from('event_embeddings')
      .select('event_id')
    
    if (embeddingsError) {
      throw new Error(`Failed to fetch existing embeddings: ${embeddingsError.message}`)
    }
    
    const existingIds = existingEmbeddings?.map(e => e.event_id) || []
    
    // Get events that don't have embeddings yet
    let query = supabase
      .from('iot_events')
      .select('id, device_id, type, value, status, metadata, created_at')
      .order('created_at', { ascending: false })
      .limit(limit)
    
    // Filter out events that already have embeddings
    if (existingIds.length > 0) {
      query = query.not('id', 'in', `(${existingIds.join(',')})`)
    }
    
    const { data: events, error: eventsError } = await query
    
    if (eventsError) {
      throw new Error(`Failed to fetch events: ${eventsError.message}`)
    }
    
    if (!events || events.length === 0) {
      return new Response(JSON.stringify({
        message: 'No events need embeddings',
        processed: 0,
        existing_embeddings: existingIds.length
      }), {
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    console.log(`Processing ${events.length} events`)
    
    const results = []
    let processed = 0
    let errors = 0
    
    // Process events in batches to avoid timeouts
    for (const event of events) {
      try {
        // Create embedding text
        const inputText = createEmbeddingText(event)
        
        // Generate embedding using AI model
        const embedding = await model.run(inputText, { 
          mean_pool: true, 
          normalize: true 
        })
        
        // Insert into event_embeddings table
        const { error: insertError } = await supabase
          .from('event_embeddings')
          .insert({
            event_id: event.id,
            embedding: embedding
          })
        
        if (insertError) {
          console.error(`Failed to insert embedding for event ${event.id}:`, insertError)
          errors++
        } else {
          processed++
          results.push({
            event_id: event.id,
            input_text: inputText,
            embedding_dimensions: embedding.length
          })
        }
        
        // Small delay to prevent rate limiting
        if (processed % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }
        
      } catch (error) {
        console.error(`Error processing event ${event.id}:`, error)
        errors++
      }
    }
    
    return new Response(JSON.stringify({
      message: 'Backfill completed',
      total_events: events.length,
      processed: processed,
      errors: errors,
      existing_embeddings: existingIds.length,
      sample_results: results.slice(0, 5)
    }), {
      headers: { 'Content-Type': 'application/json' }
    })
    
  } catch (error) {
    console.error('Backfill function error:', error)
    return new Response(JSON.stringify({
      error: 'Backfill failed',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})