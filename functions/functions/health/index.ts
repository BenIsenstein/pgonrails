// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

Deno.serve(async () => {
  return new Response(
    "OK",
    { status: 200 },
  )
})

// To invoke:
// curl 'http://localhost:<KONG_PORT>/functions/v1/hello' \
//   --header 'Authorization: Bearer <anon/service_role API key>'
