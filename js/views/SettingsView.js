// js/views/SettingsView.js

class SettingsView {
  constructor() {
    this.form = document.getElementById('profile-form');
    this.nameInput = document.getElementById('profile-name');
    this.emailInput = document.getElementById('profile-email');

    this.prefNotify = document.getElementById('notifications');
    this.prefDark   = document.getElementById('dark-mode');
    this.prefRefresh = document.getElementById('data-refresh');

    this.saveBtn = this.form?.querySelector('button[type="submit"]');

    this.PREFS_KEY = 'myems.prefs';

    this.loadPrefs();

    if (this.form) {
      this.form.addEventListener('submit', (e) => this.onSave(e));
    }
    [this.prefNotify, this.prefDark, this.prefRefresh].forEach(el => {
      if (el) el.addEventListener('change', () => this.persistPrefs());
    });
  }

  async onSave(e) {
    e.preventDefault();
    if (!this.saveBtn) return;
    this.saveBtn.disabled = true;
    this.saveBtn.textContent = 'Saving…';

    try {
      await ApiService.updateProfile({
        name: this.nameInput?.value?.trim(),
        email: this.emailInput?.value?.trim(),
      });
      this.flash('Saved');
    } catch (err) {
      this.flash(err?.message || 'Failed to save', true);
    } finally {
      this.saveBtn.disabled = false;
      this.saveBtn.textContent = 'Save Changes';
    }
  }

  loadPrefs() {
    try {
      const raw = localStorage.getItem(this.PREFS_KEY);
      if (!raw) return;
      const p = JSON.parse(raw);
      if (this.prefNotify) this.prefNotify.checked = !!p.notify;
      if (this.prefDark)   this.prefDark.checked   = !!p.dark;
      if (this.prefRefresh && p.refresh) this.prefRefresh.value = String(p.refresh);
    } catch {}
  }

  persistPrefs() {
    const prefs = {
      notify: !!(this.prefNotify && this.prefNotify.checked),
      dark: !!(this.prefDark && this.prefDark.checked),
      refresh: this.prefRefresh ? Number(this.prefRefresh.value) : 5,
    };
    try { localStorage.setItem(this.PREFS_KEY, JSON.stringify(prefs)); } catch {}
    this.flash('Preferences updated');
  }

  flash(text, isErr = false) {
    let el = document.getElementById('settings-flash');
    if (!el) {
      el = document.createElement('div');
      el.id = 'settings-flash';
      el.style.cssText = `
        position: fixed; left: 50%; transform: translateX(-50%);
        bottom: 20px; background: #111827; color:#fff; padding:10px 14px;
        border-radius: 8px; z-index: 9999; display:none; box-shadow:0 6px 22px rgba(0,0,0,.18)
      `;
      document.body.appendChild(el);
    }
    el.textContent = text;
    el.style.background = isErr ? '#c0392b' : '#111827';
    el.style.display = 'block';
    clearTimeout(this._fTimer);
    this._fTimer = setTimeout(() => (el.style.display = 'none'), 1800);
  }
}

window.SettingsView = SettingsView;
