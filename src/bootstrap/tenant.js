// Tenant bootstrap (plan §7).
//
// Runs ONCE before the React tree renders. Resolves the active tenant from the
// Host (the API does this from the Host header; on localhost we send X-Tenant),
// fetches the public config, stores it in the runtime singleton, and applies the
// branding that must be live before first paint (CSS theme vars, <title>,
// favicon, manifest). The caller (index.js) blocks rendering on this promise and
// shows a neutral "store not found" page if it rejects with notFound.

import { APP_CONSTANTS } from '../constants';
import { setTenantConfig, devTenantSlug } from '../config/runtimeConfig';
import { applyTheme } from '../constants/theme';
import { applyDocumentBranding } from './branding';

const API_BASE_URL = APP_CONSTANTS.API_BASE_URL;

// Re-export so existing imports (`../bootstrap/tenant`) keep working; the source
// of truth is the dependency-free runtimeConfig module.
export { devTenantSlug };

/**
 * Fetch the tenant config, populate the runtime singleton, and apply branding.
 * @returns {Promise<object>} the tenant config `data`
 * @throws {Error & {notFound?: boolean}} on unknown host (404) or network failure
 */
export async function bootstrapTenant() {
  const headers = { 'Content-Type': 'application/json' };
  const slug = devTenantSlug();
  if (slug) headers['X-Tenant'] = slug;

  let res;
  try {
    res = await fetch(`${API_BASE_URL}/tenant/config`, { headers });
  } catch (e) {
    const err = new Error('Unable to reach the server. Please try again.');
    err.network = true;
    throw err;
  }

  if (res.status === 404) {
    const err = new Error('Store not found');
    err.notFound = true;
    throw err;
  }
  if (!res.ok) {
    throw new Error(`Failed to load store config (${res.status})`);
  }

  const body = await res.json();
  const config = body?.data;
  if (!config || !config.tenant) {
    throw new Error('Malformed store config');
  }

  setTenantConfig(config);
  applyTheme(config.branding || {});
  applyDocumentBranding(config);
  return config;
}
