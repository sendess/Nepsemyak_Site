declare namespace App {
  interface Locals {
    /** Allowlisted admin for /admin requests; null elsewhere or when signed out. */
    admin: import('./lib/auth').AdminUser | null;
    /** Email of whoever is signed in, even if they are not on the allowlist. */
    signedInEmail?: string | null;
  }
}

interface ImportMetaEnv {
  /** Local development only — see src/middleware.ts. */
  readonly DEV_ADMIN_EMAIL?: string;
}
