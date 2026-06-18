// Firebase SDK initialization for Cloud Messaging (plan §7).
//
// Per-tenant: the web config + VAPID key come from the tenant config fetched at
// boot, NOT from a build-time constant. Initialization is LAZY — it happens on
// first use, after bootstrapTenant() has populated the runtime config. If the
// active tenant has push disabled, getMessagingInstance() returns null and
// callers skip push silently.

import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { getFirebaseWebConfig, getFirebaseVapidKey } from './constants';

let _app = null;
let _messaging = null;
let _initTried = false;

function ensureInit() {
  if (_initTried) return;
  _initTried = true;
  const config = getFirebaseWebConfig();
  if (!config) {
    // Push not configured for this tenant — leave _messaging null.
    return;
  }
  _app = initializeApp(config);
  _messaging = getMessaging(_app);
}

// Returns the Messaging instance for the active tenant, or null if push is off.
export function getMessagingInstance() {
  ensureInit();
  return _messaging;
}

// The active tenant's VAPID key (needed by getToken). Null when push is off.
export function getVapidKey() {
  return getFirebaseVapidKey();
}

export { getToken, onMessage };
