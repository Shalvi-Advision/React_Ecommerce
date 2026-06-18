// Runtime tenant config singleton (plan §7).
//
// The storefront boots from GET /api/tenant/config, resolved per Host. That
// config drives branding, theme, Firebase and the active store. React code reads
// it via TenantConfigContext, but several NON-React consumers also need it
// synchronously after boot — the axios interceptor (api.js), Firebase init
// (firebase.js), and the dynamic manifest/theme. This module is the shared,
// framework-agnostic holder they all read.
//
// Set ONCE by src/bootstrap/tenant.js before the app renders.

let _config = null;

export function setTenantConfig(config) {
  _config = config;
}

export function getTenantConfig() {
  return _config;
}

// The tenant slug, used as the X-Tenant header on localhost (dev). In production
// the Host header is authoritative, so this is only a dev convenience.
export function getTenantSlug() {
  return _config?.tenant?.slug || null;
}

// X-Tenant only matters on localhost (no per-tenant Host in dev). Sourced from
// REACT_APP_TENANT_SLUG. Lives here (a dependency-free module) so both the
// bootstrap and the low-level fetch helpers can use it without import cycles.
export function devTenantSlug() {
  const h = typeof window !== 'undefined' ? window.location.hostname : '';
  const isLocal = h === 'localhost' || h === '127.0.0.1';
  return isLocal ? (process.env.REACT_APP_TENANT_SLUG || null) : null;
}

// Header object to spread into any fetch/axios request. Empty in production.
export function tenantHeaders() {
  const slug = devTenantSlug();
  return slug ? { 'X-Tenant': slug } : {};
}

// Convenience accessors with safe fallbacks for the most-used fields.
export function getBranding() {
  return _config?.branding || {};
}

export function getFirebaseConfig() {
  return _config?.firebase || null; // { config, vapidKey } | null when push disabled
}

export function getRazorpayKeyId() {
  return _config?.razorpayKeyId || null;
}

export function getFeatures() {
  return _config?.features || {};
}
