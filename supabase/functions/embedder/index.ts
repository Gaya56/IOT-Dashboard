import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

const model = new Supabase.ai.Session('gte-small')

Deno.serve(async (req: Request) => {
  const params = new URL(req.url).searchParams
  const input = params.get('input') || 'IoT sensor data temperature reading'
  
  try {
    const output = await model.run(input, { mean_pool: true, normalize: true })
    
    return new Response(JSON.stringify({
      input: input,
      embeddings: output,
      dimensions: output.length,
      model: 'gte-small'
    }), {
      headers: {
        'Content-Type': 'application/json',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Failed to generate embeddings',
      message: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }
})