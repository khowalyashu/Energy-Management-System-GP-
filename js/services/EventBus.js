(function () {
  const listeners = new Map();
  function on(event, handler) {
    if (!listeners.has(event)) listeners.set(event, new Set());
    listeners.get(event).add(handler);
    return () => off(event, handler);
  }
  function off(event, handler) {
    listeners.get(event)?.delete(handler);
  }
  function emit(event, payload) {
    listeners.get(event)?.forEach(fn => {
      try { fn(payload); } catch (e) { console.error('EventBus handler error:', e); }
    });
  }
  window.EventBus = { on, off, emit };
})();