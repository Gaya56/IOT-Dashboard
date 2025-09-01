import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

const session = new Supabase.ai.Session('gte-small')

Deno.serve(async (req) => {
  const q = new URL(req.url).searchParams
  const input = q.get('input') ?? 'hello world'
  const out = await session.run(input, { mean_pool: true, normalize: true })
  return new Response(JSON.stringify(out), { headers: { 'Content-Type': 'application/json' } })
})