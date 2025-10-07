import type { StrapiApp } from '@strapi/strapi/admin';

// Defensive override: some environments are throwing a runtime error inside the
// Strapi admin <Protect /> component because it tries to run .filter() on an
// undefined permissions array. Until we identify the underlying RBAC load
// issue, we normalize empty / undefined permission collections early.
//
// This is a non-invasive patch: it wraps the app's RBAC state accessor (if
// present) to guarantee arrays instead of undefined, preventing crashes while
// preserving actual permission semantics (empty means no permission).

export default {
  config: {
    // Add any future admin config customizations here.
  },
  bootstrap(app: StrapiApp) {
    try {
      // @ts-ignore internal API access – we guard existence defensively.
      const rbac = app.getPlugin && app.getPlugin('users-permissions');
      // Some Strapi versions expose RBAC through app.rbac or app.getPlugin('users-permissions').rbac
      const possibleStores: any[] = [];
      // @ts-ignore
      if (app.rbac) possibleStores.push(app.rbac);
  // Access dynamic rbac property defensively (typing not exposed in public types)
  if (rbac && (rbac as any).rbac) possibleStores.push((rbac as any).rbac);

      possibleStores.forEach((store) => {
        if (!store) return;
        // Common shape: store.state or store.getState() returning { collectionTypesRelatedPermissions, ... }
        const origGetState = store.getState ? store.getState.bind(store) : null;
        if (origGetState) {
          store.getState = () => {
            const s = origGetState();
            if (!s) return s;
            const patched = { ...s };
            // Normalize any expected arrays.
            const normalize = (key: string) => {
              if (patched[key] === undefined || patched[key] === null) patched[key] = [];
            };
            normalize('collectionTypesRelatedPermissions');
            normalize('singleTypesRelatedPermissions');
            normalize('pluginsRelatedPermissions');
            normalize('settingsRelatedPermissions');
            return patched;
          };
        }
      });

      // Fallback: add a global window hook for quick inspection.
      // @ts-ignore
      if (typeof window !== 'undefined') window.__STRAPI_ADMIN_SAFE_PATCH__ = true;
      // eslint-disable-next-line no-console
      console.info('[admin patch] RBAC permission arrays normalized to avoid Protect crash');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('[admin patch] RBAC normalization skipped:', err);
    }
  },
};
