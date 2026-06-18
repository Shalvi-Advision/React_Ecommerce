import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { bootstrapTenant } from './bootstrap/tenant';
import { TenantConfigProvider } from './context/TenantConfigContext';

const root = ReactDOM.createRoot(document.getElementById('root'));

// Minimal inline splash + error screens (no app chrome — these render before the
// tenant theme/branding is known, so they stay neutral).
function Splash() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', fontFamily: 'system-ui, sans-serif', color: '#555',
    }}>
      Loading…
    </div>
  );
}

function StoreNotFound() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      height: '100vh', fontFamily: 'system-ui, sans-serif', color: '#333', textAlign: 'center', padding: 24,
    }}>
      <h1 style={{ margin: 0, fontSize: 22 }}>Store not found</h1>
      <p style={{ color: '#777', maxWidth: 420 }}>
        We couldn't find a store at this address. Please check the link or contact support.
      </p>
    </div>
  );
}

// Block first paint on the tenant config (plan §7): resolve the store, apply
// branding/theme, THEN render the app with the config available everywhere.
root.render(<Splash />);

bootstrapTenant()
  .then((config) => {
    root.render(
      <React.StrictMode>
        <TenantConfigProvider value={config}>
          <App />
        </TenantConfigProvider>
      </React.StrictMode>
    );
  })
  .catch((err) => {
    // 404 (unknown host) -> neutral store-not-found; anything else -> same neutral
    // screen but logged, so a transient network error doesn't render a broken app.
    if (!err.notFound) console.error('Tenant bootstrap failed:', err);
    root.render(<StoreNotFound />);
  });
