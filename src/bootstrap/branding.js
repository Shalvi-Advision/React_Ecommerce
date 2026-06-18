// Per-Host document branding (plan §7): runtime <title>, favicon, theme-color
// meta and a dynamically-generated web manifest. One build serves every tenant,
// so none of these can be baked into public/index.html at build time.

function setFavicon(href) {
  if (!href) return;
  let link = document.querySelector("link[rel~='icon']");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.href = href;
}

function setThemeColorMeta(color) {
  if (!color) return;
  let meta = document.querySelector("meta[name='theme-color']");
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = 'theme-color';
    document.head.appendChild(meta);
  }
  meta.content = color;
}

// Build a web app manifest as a blob URL so the PWA install uses the tenant's
// name/icons/colors. (A server-rendered /manifest.webmanifest per Host is the
// production-grade option; this runtime blob keeps the storefront self-contained.)
function setManifest(config) {
  const b = config.branding || {};
  const name = b.appName || config.tenant?.name || 'Store';
  const themeColor = b.themeColor || b.primaryColor || '#000000';
  const icons = b.logoUrl
    ? [{ src: b.logoUrl, sizes: '512x512', type: 'image/png', purpose: 'any maskable' }]
    : [];

  const manifest = {
    name,
    short_name: name,
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: themeColor,
    icons,
  };

  const blob = new Blob([JSON.stringify(manifest)], { type: 'application/manifest+json' });
  const url = URL.createObjectURL(blob);

  let link = document.querySelector("link[rel='manifest']");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'manifest';
    document.head.appendChild(link);
  }
  link.href = url;
}

/**
 * Apply title, favicon, theme-color and manifest from the tenant config.
 * @param {object} config - the tenant config `data`
 */
export function applyDocumentBranding(config) {
  const b = config.branding || {};
  const name = b.appName || config.tenant?.name;
  if (name) document.title = name;
  setFavicon(b.faviconUrl || b.logoUrl);
  setThemeColorMeta(b.themeColor || b.primaryColor);
  setManifest(config);
}
