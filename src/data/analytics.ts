/**
 * Visitor counting with Cloudflare Web Analytics (free, no cookies, no personal data).
 * Both values are public identifiers — the beacon token appears in every page — so they live here.
 * The API token that lets the admin dashboard read the numbers is a secret: CF_ANALYTICS_TOKEN.
 */
export const analytics = {
  /** Cloudflare → Web Analytics → the site → JS snippet: the "token" value in data-cf-beacon. */
  beaconToken: '62266edf790f4fe3bd9281bd69c3bf96',
  /** Cloudflare account ID (in the dashboard address: dash.cloudflare.com/<account id>/…). */
  accountId: '96664ea23f713cbebaa648c0f8faab13',
  /** The site's identifier for the analytics API — not the same as the beacon token. It is the `siteTag` value in the
   *  address of the site's page under Cloudflare → Web Analytics. */
  siteTag: 'f73d36ff7ea2463cb24bdb5b22301359',
};

export const analyticsConfigured = () => Boolean(analytics.accountId && analytics.siteTag);
