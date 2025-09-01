Edge Functions
Advanced Features

    AI Models

Running AI Models

Run AI models in Edge Functions using the built-in Supabase AI API.

Edge Functions have a built-in API for running AI models. You can use this API to generate embeddings, build conversational workflows, and do other AI related tasks in your Edge Functions.

This allows you to:

    Generate text embeddings without external dependencies
    Run Large Language Models via Ollama or Llamafile
    Build conversational AI workflows

Setup#

There are no external dependencies or packages to install to enable the API.

Create a new inference session:

const model = new Supabase.ai.Session('model-name')

To get type hints and checks for the API, import types from functions-js:

import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

Running a model inference#

Once the session is instantiated, you can call it with inputs to perform inferences:

// For embeddings (gte-small model)const embeddings = await model.run('Hello world', {  mean_pool: true,  normalize: true,})// For text generation (non-streaming)const response = await model.run('Write a haiku about coding', {  stream: false,  timeout: 30,})// For streaming responsesconst stream = await model.run('Tell me a story', {  stream: true,  mode: 'ollama',})

Generate text embeddings#

Generate text embeddings using the built-in gte-small model:

gte-small model exclusively caters to English texts, and any lengthy texts will be truncated to a maximum of 512 tokens. While you can provide inputs longer than 512 tokens, truncation may affect the accuracy.

const model = new Supabase.ai.Session('gte-small')Deno.serve(async (req: Request) => {  const params = new URL(req.url).searchParams  const input = params.get('input')  const output = await model.run(input, { mean_pool: true, normalize: true })  return new Response(JSON.stringify(output), {    headers: {      'Content-Type': 'application/json',      Connection: 'keep-alive',    },  })})

Using Large Language Models (LLM)#

Inference via larger models is supported via Ollama and Mozilla Llamafile. In the first iteration, you can use it with a self-managed Ollama or Llamafile server.

We are progressively rolling out support for the hosted solution. To sign up for early access, fill out this form.
Running locally#
1
Install Ollama

Install Ollama and pull the Mistral model

ollama pull mistral

2
Run the Ollama server

ollama serve

3
Set the function secret

Set a function secret called AI_INFERENCE_API_HOST to point to the Ollama server

echo "AI_INFERENCE_API_HOST=http://host.docker.internal:11434" >> supabase/functions/.env

4
Create a new function

supabase functions new ollama-test

import 'jsr:@supabase/functions-js/edge-runtime.d.ts'const session = new Supabase.ai.Session('mistral')Deno.serve(async (req: Request) => {  const params = new URL(req.url).searchParams  const prompt = params.get('prompt') ?? ''  // Get the output as a stream  const output = await session.run(prompt, { stream: true })  const headers = new Headers({    'Content-Type': 'text/event-stream',    Connection: 'keep-alive',  })  // Create a stream  const stream = new ReadableStream({    async start(controller) {      const encoder = new TextEncoder()      try {        for await (const chunk of output) {          controller.enqueue(encoder.encode(chunk.response ?? ''))        }      } catch (err) {        console.error('Stream error:', err)      } finally {        controller.close()      }    },  })  // Return the stream to the user  return new Response(stream, {    headers,  })})

5
Serve the function

supabase functions serve --env-file supabase/functions/.env

6
Execute the function

curl --get "http://localhost:54321/functions/v1/ollama-test" \--data-urlencode "prompt=write a short rap song about Supabase, the Postgres Developer platform, as sung by Nicki Minaj" \-H "Authorization: $ANON_KEY"

Deploying to production#

Once the function is working locally, it's time to deploy to production.
1
Deploy an Ollama or Llamafile server

Deploy an Ollama or Llamafile server and set a function secret called AI_INFERENCE_API_HOST
to point to the deployed server:

supabase secrets set AI_INFERENCE_API_HOST=https://path-to-your-llm-server/

2
Deploy the function

supabase functions deploy

3
Execute the function

curl --get "https://project-ref.supabase.co/functions/v1/ollama-test" \--data-urlencode "prompt=write a short rap song about Supabase, the Postgres Developer platform, as sung by Nicki Minaj" \-H "Authorization: $ANON_KEY"

As demonstrated in the video above, running Ollama locally is typically slower than running it in on a server with dedicated GPUs. We are collaborating with the Ollama team to improve local performance.

In the future, a hosted LLM API, will be provided as part of the Supabase platform. Supabase will scale and manage the API and GPUs for you. To sign up for early access, fill up this form.