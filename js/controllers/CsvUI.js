// js/controllers/CsvUI.js
(function () {
  const API_BASE = ''; 

  function authHeaders() {
    try {
      const token = localStorage.getItem('token');
      return token ? { 'Authorization': `Bearer ${token}` } : {};
    } catch { return {}; }
  }

  function showMsg(el, text, isErr = false) {
    if (!el) return;
    el.style.color = isErr ? '#b00' : '#0a7';
    el.textContent = text;
  }

  async function downloadCsv(endpoint) {
    const res = await fetch(`${API_BASE}${endpoint}`, { headers: { ...authHeaders() } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const disp = res.headers.get('content-disposition') || '';
    const match = disp.match(/filename="?([^"]+)"?/i);
    const filename = match?.[1] || 'export.csv';
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
    return filename;
  }

  async function uploadCsv(endpoint, file) {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: { ...authHeaders() },
      body: fd
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
    return data;
  }

  function wireDevicesCsv() {
    const root = document.getElementById('csv-tools-devices');
    if (!root) return;

    const btnExport = root.querySelector('#btnExportDevices');
    const fileInput = root.querySelector('#fileDevicesCsv');
    const btnImport = root.querySelector('#btnImportDevices');
    const msg = root.querySelector('#csvMsgDevices');

    btnExport?.addEventListener('click', async () => {
      try { const fn = await downloadCsv('/api/csv/devices/export'); showMsg(msg, `Downloaded ${fn}`); }
      catch (e) { showMsg(msg, `Download failed: ${e.message}`, true); }
    });

    btnImport?.addEventListener('click', async () => {
      try {
        if (!fileInput?.files?.[0]) return showMsg(msg, 'Please choose a CSV file first.', true);
        const data = await uploadCsv('/api/csv/devices/import', fileInput.files[0]);
        showMsg(msg, `Import OK: ${JSON.stringify(data)}`);
      } catch (e) { showMsg(msg, `Import failed: ${e.message}`, true); }
    });
  }

  function wireEnergyCsv() {
    const root = document.getElementById('csv-tools-energy');
    if (!root) return;

    const btnExport = root.querySelector('#btnExportEnergy');
    const fileInput = root.querySelector('#fileEnergyCsv');
    const btnImport = root.querySelector('#btnImportEnergy');
    const msg = root.querySelector('#csvMsgEnergy');

    btnExport?.addEventListener('click', async () => {
      try { const fn = await downloadCsv('/api/csv/energy/export'); showMsg(msg, `Downloaded ${fn}`); }
      catch (e) { showMsg(msg, `Download failed: ${e.message}`, true); }
    });

    btnImport?.addEventListener('click', async () => {
      try {
        if (!fileInput?.files?.[0]) return showMsg(msg, 'Please choose a CSV file first.', true);
        const data = await uploadCsv('/api/csv/energy/import', fileInput.files[0]);
        showMsg(msg, `Import OK: ${JSON.stringify(data)}`);
      } catch (e) { showMsg(msg, `Import failed: ${e.message}`, true); }
    });
  }

  // Bind once DOM is ready (sections exist even if hidden by view switching)
  window.addEventListener('DOMContentLoaded', () => {
    wireDevicesCsv();
    wireEnergyCsv();
  });
})();
