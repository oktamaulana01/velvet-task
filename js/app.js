/* ============================================================
   VELVET TASK — app logic
   State disimpan di localStorage (key: velvetTask.v1)
   ============================================================ */

const ARCANA = [
  { id: 'fool',      name: 'THE FOOL',      life: 'Petualangan & hal baru' },
  { id: 'magician',  name: 'THE MAGICIAN',  life: 'Belajar & skill' },
  { id: 'priestess', name: 'THE PRIESTESS', life: 'Membaca & refleksi' },
  { id: 'empress',   name: 'THE EMPRESS',   life: 'Kesehatan & self-care' },
  { id: 'emperor',   name: 'THE EMPEROR',   life: 'Kerja & proyek' },
  { id: 'chariot',   name: 'THE CHARIOT',   life: 'Olahraga & disiplin' },
  { id: 'star',      name: 'THE STAR',      life: 'Mimpi & tujuan besar' },
  { id: 'sun',       name: 'THE SUN',       life: 'Teman & sosial' },
];

const BOND_NAMES = {
  1: 'Stranger', 2: 'Acquaintance', 3: 'Ally', 4: 'Friend', 5: 'Confidant',
  6: 'Partner', 7: 'Comrade', 8: 'Kindred', 9: 'Soulmate', 10: 'MAX BOND',
};

const XP_PER_RANK = 3;   // XP untuk naik 1 rank
const MAX_RANK = 10;
const STORE_KEY = 'velvetTask.v1';

/* ---------- state ---------- */
let state = loadState();

function defaultState() {
  return { name: '', tasks: [], xp: {}, streak: { count: 0, lastDate: null }, filter: 'all', sound: true };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return defaultState();
    return Object.assign(defaultState(), JSON.parse(raw));
  } catch (e) {
    return defaultState();
  }
}

function saveState() {
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
}

/* ---------- helpers ---------- */
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function todayStr() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function daysBetween(a, b) {
  const da = new Date(a + 'T00:00:00');
  const db = new Date(b + 'T00:00:00');
  return Math.round((db - da) / 86400000);
}

function arcanaById(id) {
  return ARCANA.find(a => a.id === id) || ARCANA[0];
}

function rankOf(arcanaId) {
  const xp = state.xp[arcanaId] || 0;
  const rank = Math.min(MAX_RANK, Math.floor(xp / XP_PER_RANK) + 1);
  const into = xp % XP_PER_RANK;
  const pct = rank >= MAX_RANK ? 100 : (into / XP_PER_RANK) * 100;
  return { xp, rank, pct, maxed: rank >= MAX_RANK };
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

/* ---------- streak ---------- */
function touchStreak() {
  const today = todayStr();
  const last = state.streak.lastDate;
  if (last === today) return;
  if (last && daysBetween(last, today) === 1) {
    state.streak.count += 1;
  } else {
    state.streak.count = 1;
  }
  state.streak.lastDate = today;
}

function checkStreakDecay() {
  const last = state.streak.lastDate;
  if (last && daysBetween(last, todayStr()) > 1) {
    state.streak.count = 0;
    state.streak.lastDate = null;
  }
}

/* ---------- actions ---------- */
function addTask(title, arcanaId, dueDate = null) {
  state.tasks.unshift({
    id: uid(),
    title,
    arcana: arcanaId,
    dueDate: dueDate || null,
    done: false,
    createdAt: Date.now(),
    doneAt: null
  });
  if (window.velvetAudio) window.velvetAudio.playAddTarget();
  saveState();
  render();
}

function toggleTask(id) {
  const t = state.tasks.find(t => t.id === id);
  if (!t) return;
  t.done = !t.done;
  t.doneAt = t.done ? Date.now() : null;
  if (t.done) {
    const prevRankInfo = rankOf(t.arcana);
    state.xp[t.arcana] = (state.xp[t.arcana] || 0) + 1;
    const newRankInfo = rankOf(t.arcana);
    const didRankUp = newRankInfo.rank > prevRankInfo.rank;
    const didMaxOut = didRankUp && newRankInfo.maxed;

    touchStreak();
    flashEliminated(didRankUp, newRankInfo);

    if (window.velvetAudio) {
      if (didMaxOut) {
        window.velvetAudio.playMaxBond();
      } else if (didRankUp) {
        window.velvetAudio.playEliminated(true);
      } else {
        window.velvetAudio.playEliminated(false);
      }
    }
  } else {
    if (window.velvetAudio) window.velvetAudio.playClick();
  }
  saveState();
  render();
}

function deleteTask(id) {
  state.tasks = state.tasks.filter(t => t.id !== id);
  if (window.velvetAudio) window.velvetAudio.playDelete();
  saveState();
  render();
}

function setFilter(f) {
  if (state.filter !== f && window.velvetAudio) {
    window.velvetAudio.playClick();
  }
  state.filter = f;
  saveState();
  render();
}

/* ---------- deadline helper ---------- */
function getDeadlineInfo(dueDateStr, isDone) {
  if (!dueDateStr) return null;
  const today = todayStr();
  const diff = daysBetween(today, dueDateStr);

  if (isDone) {
    return {
      status: 'settled',
      label: '✓ Deadline: ' + dueDateStr,
      badgeClass: 'deadline-settled',
      isUrgent: false
    };
  }

  if (diff < 0) {
    const overdue = Math.abs(diff);
    return {
      status: 'overdue',
      label: '⚠️ OVERDUE ' + overdue + 'D (' + dueDateStr + ')',
      badgeClass: 'deadline-overdue',
      isUrgent: true
    };
  } else if (diff === 0) {
    return {
      status: 'today',
      label: '🔥 DUE TODAY!',
      badgeClass: 'deadline-today',
      isUrgent: true
    };
  } else if (diff === 1) {
    return {
      status: 'tomorrow',
      label: '⏳ DUE TOMORROW',
      badgeClass: 'deadline-soon',
      isUrgent: true
    };
  } else {
    return {
      status: 'future',
      label: '📅 ' + diff + ' days left (' + dueDateStr + ')',
      badgeClass: 'deadline-future',
      isUrgent: diff <= 3
    };
  }
}

/* ---------- render ---------- */
const $ = sel => document.querySelector(sel);

function render() {
  renderGuest();
  renderStreak();
  renderSound();
  renderTasks();
  renderRanks();
  renderChips();
}

function renderGuest() {
  $('#guestLine').textContent = state.name
    ? 'Guest: ' + state.name + ' — the contract is sealed.'
    : '';
  const reopenBtn = $('#reopenContract');
  if (reopenBtn) {
    reopenBtn.classList.toggle('hidden', !state.name);
  }
}

function renderStreak() {
  $('#streakNum').textContent = state.streak.count;
}

function renderSound() {
  const btn = $('#soundToggle');
  const icon = $('#soundIcon');
  const label = $('#soundLabel');
  if (!btn || !icon || !label) return;
  const isOn = state.sound !== false;
  btn.classList.toggle('muted', !isOn);
  icon.textContent = isOn ? '🔊' : '🔇';
  label.textContent = isOn ? 'SFX ON' : 'SFX OFF';
  btn.title = isOn ? 'Audio FX Aktif (Klik untuk matikan)' : 'Audio FX Nonaktif (Klik untuk hidupkan)';
}

function filteredTasks() {
  if (state.filter === 'active') return state.tasks.filter(t => !t.done);
  if (state.filter === 'done') return state.tasks.filter(t => t.done);
  if (state.filter === 'urgent') {
    return state.tasks.filter(t => {
      if (t.done || !t.dueDate) return false;
      const info = getDeadlineInfo(t.dueDate, false);
      return info && info.isUrgent;
    });
  }
  return state.tasks;
}

function renderTasks() {
  const list = $('#taskList');
  const tasks = filteredTasks();
  $('#emptyMsg').style.display = tasks.length ? 'none' : 'block';
  list.innerHTML = tasks.map(t => {
    const a = arcanaById(t.arcana);
    const dInfo = getDeadlineInfo(t.dueDate, t.done);
    const isUrgent = !t.done && dInfo && dInfo.isUrgent;
    const urgencyClass = isUrgent ? ' task-urgent' : '';
    const deadlineHtml = dInfo
      ? '<div class="t-deadline ' + dInfo.badgeClass + '">' + dInfo.label + '</div>'
      : '';

    return (
      '<li class="task' + (t.done ? ' done' : '') + urgencyClass + '" data-id="' + t.id + '">' +
        '<button class="check" aria-label="Tandai selesai"></button>' +
        '<div class="t-body">' +
          '<div class="t-main">' +
            '<span class="t-title">' + esc(t.title) + '</span>' +
            '<span class="arcana-badge">' + a.name + '</span>' +
          '</div>' +
          deadlineHtml +
        '</div>' +
        '<button class="del" aria-label="Hapus tugas">&times;</button>' +
      '</li>'
    );
  }).join('');
}

function renderRanks() {
  $('#ranks').innerHTML = ARCANA.map(a => {
    const r = rankOf(a.id);
    const bond = r.maxed ? 'MAX BOND — your bond is unbreakable!' : 'Bond: ' + BOND_NAMES[r.rank];
    return (
      '<div class="rank-card' + (r.maxed ? ' maxed' : '') + '">' +
        '<div class="rank-top">' +
          '<div><div class="rank-name">' + a.name + '</div>' +
          '<div class="rank-life">' + esc(a.life) + '</div></div>' +
          '<div class="rank-lvl">RANK ' + r.rank + '</div>' +
        '</div>' +
        '<div class="rank-bond">' + bond + ' &middot; ' + r.xp + ' XP</div>' +
        '<div class="rank-bar"><div class="rank-fill" style="width:' + r.pct + '%"></div></div>' +
      '</div>'
    );
  }).join('');
}

function renderChips() {
  document.querySelectorAll('.chip').forEach(ch => {
    ch.classList.toggle('active', ch.dataset.filter === state.filter);
  });
}

/* ---------- eliminated flash ---------- */
let flashTimer = null;
function flashEliminated(didRankUp = false, rankInfo = null) {
  const f = $('#flash');
  const txt = $('#flashText');
  if (txt) {
    if (rankInfo && rankInfo.maxed && didRankUp) {
      txt.innerHTML = 'MAX BOND!<br><span style="font-size:0.5em; letter-spacing:1px;">RANK 10 UNLOCKED</span>';
    } else if (didRankUp && rankInfo) {
      txt.innerHTML = 'RANK UP!<br><span style="font-size:0.5em; letter-spacing:1px;">RANK ' + rankInfo.rank + ' REACHED</span>';
    } else {
      txt.innerHTML = 'TARGET<br>ELIMINATED!';
    }
  }
  f.classList.remove('show');
  void f.offsetWidth; // restart animation
  f.classList.add('show');
  clearTimeout(flashTimer);
  flashTimer = setTimeout(() => f.classList.remove('show'), 1200);
}

/* ---------- system data archive (export/import) ---------- */
let noticeTimer = null;
function showSystemNotice(msg, type = 'success') {
  const notice = $('#systemNotice');
  if (!notice) return;
  notice.textContent = msg;
  notice.className = 'system-notice ' + type;
  clearTimeout(noticeTimer);
  noticeTimer = setTimeout(() => {
    notice.classList.add('hidden');
  }, 4000);
}

function exportBackup() {
  try {
    const payload = {
      app: 'velvet-task',
      version: '1.0',
      exportedAt: new Date().toISOString(),
      state: state
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'velvet-task-backup-' + todayStr() + '.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showSystemNotice('Data misi berhasil diekspor ke berkas JSON!', 'success');
    if (window.velvetAudio) window.velvetAudio.playAddTarget();
  } catch (err) {
    showSystemNotice('Gagal mengekspor data: ' + err.message, 'error');
    if (window.velvetAudio) window.velvetAudio.playDelete();
  }
}

function importBackup(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const parsed = JSON.parse(e.target.result);
      const importedState = parsed.state || parsed;

      if (!importedState || typeof importedState !== 'object') {
        throw new Error('Struktur berkas JSON tidak valid.');
      }
      if (!Array.isArray(importedState.tasks)) {
        throw new Error('Data target tidak ditemukan dalam berkas backup.');
      }

      state = Object.assign(defaultState(), importedState);
      saveState();
      render();

      showSystemNotice('Data misi berhasil dipulihkan! (' + state.tasks.length + ' target dimuat)', 'success');
      if (window.velvetAudio) window.velvetAudio.playRankUp();
    } catch (err) {
      showSystemNotice('Gagal mengimpor berkas: ' + err.message, 'error');
      if (window.velvetAudio) window.velvetAudio.playDelete();
    }
  };
  reader.onerror = function() {
    showSystemNotice('Gagal membaca berkas.', 'error');
    if (window.velvetAudio) window.velvetAudio.playDelete();
  };
  reader.readAsText(file);
}

/* ---------- init ---------- */
function init() {
  // Sync initial sound state
  if (window.velvetAudio) {
    window.velvetAudio.setEnabled(state.sound !== false);
  }

  // Tombol Toggle Audio FX
  const soundBtn = $('#soundToggle');
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      state.sound = state.sound === false ? true : false;
      if (window.velvetAudio) {
        window.velvetAudio.setEnabled(state.sound);
        window.velvetAudio.playToggleChirp(state.sound);
      }
      saveState();
      renderSound();
    });
  }

  // isi dropdown arcana
  $('#arcanaSelect').innerHTML = ARCANA.map(a =>
    '<option value="' + a.id + '">' + a.name + ' — ' + esc(a.life) + '</option>'
  ).join('');

  // form tambah tugas
  $('#taskForm').addEventListener('submit', e => {
    e.preventDefault();
    const input = $('#taskInput');
    const dueInput = $('#taskDueDate');
    const title = input.value.trim();
    if (!title) return;
    const dueDate = dueInput ? dueInput.value : null;
    addTask(title, $('#arcanaSelect').value, dueDate);
    input.value = '';
    if (dueInput) dueInput.value = '';
    input.focus();
  });

  // klik pada daftar tugas (event delegation)
  $('#taskList').addEventListener('click', e => {
    const li = e.target.closest('.task');
    if (!li) return;
    const id = li.dataset.id;
    if (e.target.classList.contains('check')) toggleTask(id);
    if (e.target.classList.contains('del')) deleteTask(id);
  });

  // filter chips
  document.querySelectorAll('.chip').forEach(ch => {
    ch.addEventListener('click', () => setFilter(ch.dataset.filter));
  });

  // Export & Import backup buttons
  const exportBtn = $('#exportBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', exportBackup);
  }

  const importInput = $('#importFileInput');
  if (importInput) {
    importInput.addEventListener('change', e => {
      const file = e.target.files && e.target.files[0];
      if (file) {
        importBackup(file);
        e.target.value = '';
      }
    });
  }

  // modal kontrak (Velvet Room)
  const modal = $('#introModal');
  if (!state.name) {
    modal.classList.remove('hidden');
    setTimeout(() => {
      if (window.velvetAudio && !modal.classList.contains('hidden')) {
        window.velvetAudio.playVelvetBell();
      }
    }, 400);
  }

  // Tombol buka kembali kontrak
  const reopenBtn = $('#reopenContract');
  if (reopenBtn) {
    reopenBtn.addEventListener('click', () => {
      $('#nameInput').value = state.name || '';
      modal.classList.remove('hidden');
      if (window.velvetAudio) window.velvetAudio.playVelvetBell();
    });
  }

  // Tombol tutup modal kontrak
  const closeBtn = $('#closeModalBtn');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.classList.add('hidden');
      if (window.velvetAudio) window.velvetAudio.playClick();
    });
  }

  $('#nameForm').addEventListener('submit', e => {
    e.preventDefault();
    const name = $('#nameInput').value.trim();
    if (!name) return;
    state.name = name;
    if (window.velvetAudio) window.velvetAudio.playContractSeal();
    saveState();
    modal.classList.add('hidden');
    render();
  });

  checkStreakDecay();
  saveState();
  render();
}

document.addEventListener('DOMContentLoaded', init);
