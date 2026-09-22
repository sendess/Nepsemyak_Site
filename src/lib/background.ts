/**
 * Lets slow work (sending emails) finish after the response has gone. On Netlify the function is kept
 * alive for it; elsewhere (local development) we simply wait for it.
 */
export async function afterResponse(locals: App.Locals, work: Promise<unknown>) {
  const netlify = locals.netlify?.context;
  if (netlify) netlify.waitUntil(work);
  else await work;
}
