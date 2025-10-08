(function () {
  function wrap(obj, method, after) {
    if (!obj || typeof obj[method] !== 'function') return;
    const orig = obj[method].bind(obj);
    obj[method] = async function (...args) {
      const res = await orig(...args);
      try { after?.(res, args); } catch (e) { console.error('after hook error', e); }
      return res;
    };
  }

  function hookApiService() {
    if (!window.ApiService) return false;
    wrap(ApiService, 'createDevice', (doc) => EventBus?.emit('devices:changed', { type: 'create', doc }));
    wrap(ApiService, 'updateDevice', (doc, args) => EventBus?.emit('devices:changed', { type: 'update', id: args?.[0], doc }));
    wrap(ApiService, 'deleteDevice', (_res, args) => EventBus?.emit('devices:changed', { type: 'delete', id: args?.[0] }));
    return true;
  }

  function hookFetch() {
    if (!window.fetch || window.fetch.__myemsHooked) return;
    const origFetch = window.fetch.bind(window);
    window.fetch = async function (input, init = {}) {
      const url = (typeof input === 'string') ? input : input?.url || '';
      const method = (init?.method || 'GET').toUpperCase();
      const isDevicesImport = method === 'POST' && /\/api\/csv\/devices\/import/.test(url);
      const isEnergyImport  = method === 'POST' && /\/api\/csv\/energy\/import/.test(url);

      const res = await origFetch(input, init);
      try {
        if (res.ok && (isDevicesImport || isEnergyImport)) {
          if (isDevicesImport) EventBus?.emit('devices:changed', { type: 'import' });
          if (isEnergyImport)  EventBus?.emit('energy:changed',  { type: 'import' });
        }
      } catch (e) { console.error('fetch hook emit error', e); }
      return res;
    };
    window.fetch.__myemsHooked = true;
  }

  hookFetch();
  if (!hookApiService()) {
    const iv = setInterval(() => { if (hookApiService()) clearInterval(iv); }, 50);
    setTimeout(() => clearInterval(iv), 5000);
  }
})();