// js/controllers/UiPolish.js
(function () {
  // ---- helpers ----
  function authHeaders() {
    try {
      const token = localStorage.getItem('token');
      return token ? { 'Authorization': `Bearer ${token}` } : {};
    } catch { return {}; }
  }
  function setMsg(el, text, ok = true) {
    if (!el) return;
    el.style.color = ok ? '#0a7' : '#b00';
    el.textContent = text;
  }

  function openModal() {
    const m = document.getElementById('add-device-modal');
    if (!m) return;
    // lock scroll (avoid background moving)
    document.documentElement.classList.add('no-scroll');
    document.body.classList.add('no-scroll');
    m.style.display = 'flex';
    // focus first input
    const first = m.querySelector('input[name="name"]');
    if (first) setTimeout(() => first.focus(), 10);
  }

  function closeModal() {
    const m = document.getElementById('add-device-modal');
    if (!m) return;
    m.style.display = 'none';
    document.documentElement.classList.remove('no-scroll');
    document.body.classList.remove('no-scroll');
    const msg = document.getElementById('add-device-msg');
    if (msg) msg.textContent = '';
    document.getElementById('add-device-form')?.reset();
  }

  async function postDevice(payload) {
    const res = await fetch('/api/devices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(payload)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
    return data;
  }

  // ---- wire up once DOM is ready ----
  window.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('add-device-form');
    const cancelBtn = document.getElementById('cancel-add-device');
    const msg = document.getElementById('add-device-msg');

    // 1) Hard Intercept: Using CAPTURE on document ensures this runs before other listeners.
    document.addEventListener('click', (e) => {
      const target = e.target;
      if (!target) return;
      // match the button or its child elements
      const btn = target.id === 'add-device-btn'
        ? target
        : target.closest && target.closest('#add-device-btn');
      if (!btn) return;

      // Intercept and stop legacy handlers completely
      e.preventDefault();
      e.stopPropagation();
      if (e.stopImmediatePropagation) e.stopImmediatePropagation();

      openModal();
    }, true); // <-- capture

    // 2) Cancel closes modal
    cancelBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      closeModal();
    });

    // 3) Escape closes modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });

    // 4) Submit -> POST -> refresh list
    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const payload = {
        name: String(fd.get('name') || '').trim(),
        type: fd.get('type'),
        powerRating: Number(fd.get('powerRating') || 0),
        status: fd.get('status') || 'active',
        location: String(fd.get('location') || '').trim()
      };
      if (!payload.name) return setMsg(msg, 'Device name is required.', false);

      try {
        await postDevice(payload);
        setMsg(msg, 'Saved! Refreshing…', true);
        // Let other code refresh if it listens
        window.dispatchEvent(new CustomEvent('devices:refresh'));
        // Fallback refresh
        setTimeout(() => {
          if (document.getElementById('devices-grid')) location.reload();
        }, 500);
        setTimeout(closeModal, 300);
      } catch (err) {
        setMsg(msg, err?.message || 'Failed to save device.', false);
      }
    });
  });
})();
