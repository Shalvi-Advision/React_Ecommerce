import React, { createContext, useContext } from 'react';
import { getTenantConfig } from '../config/runtimeConfig';

// Tenant config context (plan §7). The config is fetched once at boot by
// src/bootstrap/tenant.js and stored in the runtime singleton; this context just
// surfaces it to React components. It is provided AFTER bootstrap resolves, so
// the value is always present inside the tree (never null at render time).

const TenantConfigContext = createContext(null);

export const TenantConfigProvider = ({ value, children }) => {
  // Default to the runtime singleton so the provider works even if no explicit
  // value is passed (e.g. in tests that bootstrapped first).
  const config = value || getTenantConfig();
  return (
    <TenantConfigContext.Provider value={config}>
      {children}
    </TenantConfigContext.Provider>
  );
};

export const useTenantConfig = () => {
  const ctx = useContext(TenantConfigContext);
  if (ctx === null) {
    throw new Error('useTenantConfig must be used within a TenantConfigProvider');
  }
  return ctx;
};

// Convenience hooks for the most common reads.
export const useBranding = () => useTenantConfig().branding || {};
export const useFeatures = () => useTenantConfig().features || {};
export const useTenant = () => useTenantConfig().tenant || {};

export default TenantConfigContext;
