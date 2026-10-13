const $ = (selector) => document.querySelector(selector);
const patternEl = $('#pattern');
const flagsEl = $('#flags');
const sampleEl = $('#sample');
const replacementEl = $('#replacement');
const matchesEl = $('#matches');
const previewEl = $('#preview');
const statusEl = $('#status');
const countEl = $('#count');
const workerUrl = new URL('./worker.js', import.meta.url);
let worker;
let timer;
let debounceTimer;
let runId = 0;

function cancelPendingRun() {
  runId += 1;
  clearTimeout(timer);
  worker?.terminate();
  worker = null;
}

function getWorker() {
  if (!worker) {
    const activeWorker = new Worker(workerUrl, { type: 'module' });
    worker = activeWorker;
    activeWorker.onmessage = ({ data }) => {
      if (worker !== activeWorker) return;
      if (data.id !== runId) return;
      clearTimeout(timer);
      if (!data.ok) {
        statusEl.textContent = data.error;
        statusEl.className = 'status error';
        countEl.textContent = '—';
        matchesEl.replaceChildren();
        previewEl.textContent = '';
        return;
      }
      countEl.textContent = `${data.matches.length}${data.capped ? '+' : ''}`;
      statusEl.textContent = data.capped ? 'Показаны первые 1 000 совпадений.' : 'Шаблон выполнен локально.';
      statusEl.className = 'status success';
      matchesEl.replaceChildren(...data.matches.map((item, index) => {
        const row = document.createElement('button');
        row.type = 'button';
        row.className = 'match-row';
        row.innerHTML = `<span class="match-number">${index + 1}</span><span class="match-content"></span><span class="match-position"></span>`;
        row.querySelector('.match-content').textContent = item.value || '(пустое совпадение)';
        row.querySelector('.match-position').textContent = `${item.line}:${item.column}`;
        row.addEventListener('click', () => {
          sampleEl.focus();
          sampleEl.setSelectionRange(item.index, item.index + item.value.length);
        });
        if (item.groups.length || item.namedGroups) {
          const groups = document.createElement('small');
          const named = item.namedGroups ? Object.entries(item.namedGroups).map(([key, value]) => `${key}: ${value ?? '∅'}`) : [];
          groups.textContent = `Группы: ${[...item.groups.map((value, i) => `$${i + 1}: ${value ?? '∅'}`), ...named].join(' · ')}`;
          row.append(groups);
        }
        return row;
      }));
      previewEl.textContent = data.preview;
      if (data.truncated) statusEl.textContent += ' Предпросмотр обрезан до 200 000 символов.';
      persist();
    };
    activeWorker.onerror = () => {
      if (worker !== activeWorker) return;
      clearTimeout(timer);
      statusEl.textContent = 'Не удалось выполнить шаблон. Проверьте его синтаксис и повторите.';
      statusEl.className = 'status error';
      worker = null;
      activeWorker.terminate();
    };
  }
  return worker;
}

function persist() {
  try {
    localStorage.setItem('regexbench:v1', JSON.stringify({ pattern: patternEl.value, flags: flagsEl.value, sample: sampleEl.value, replacement: replacementEl.value }));
  } catch { /* Private browsing can disable storage; current editing still works. */ }
}

function run() {
  clearTimeout(debounceTimer);
  cancelPendingRun();
  const pattern = patternEl.value;
  const flags = flagsEl.value;
  const text = sampleEl.value;
  if (!pattern) {
    statusEl.textContent = 'Введите шаблон, чтобы увидеть совпадения.';
    statusEl.className = 'status';
    matchesEl.replaceChildren();
    previewEl.textContent = text;
    countEl.textContent = '0';
    persist();
    return;
  }
  const id = runId;
  statusEl.textContent = 'Проверяю шаблон…';
  statusEl.className = 'status';
  timer = setTimeout(() => {
    if (id !== runId) return;
    worker?.terminate();
    worker = null;
    statusEl.textContent = 'Шаблон превысил лимит времени (300 мс). Упростите его и попробуйте снова.';
    statusEl.className = 'status error';
    countEl.textContent = 'timeout';
    matchesEl.replaceChildren();
    previewEl.textContent = '';
  }, 300);
  getWorker().postMessage({ id, pattern, flags, text, replacement: replacementEl.value });
}

for (const element of [patternEl, flagsEl, sampleEl, replacementEl]) element.addEventListener('input', () => { clearTimeout(debounceTimer); debounceTimer = setTimeout(run, 130); });
$('#run').addEventListener('click', run);
$('#clear').addEventListener('click', () => { clearTimeout(debounceTimer); cancelPendingRun(); patternEl.value = ''; flagsEl.value = 'g'; replacementEl.value = ''; sampleEl.value = ''; matchesEl.replaceChildren(); previewEl.textContent = ''; countEl.textContent = '0'; statusEl.textContent = 'Поля очищены.'; statusEl.className = 'status'; persist(); });
$('#copy-preview').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(previewEl.textContent); statusEl.textContent = 'Предпросмотр скопирован.'; }
  catch { statusEl.textContent = 'Браузер не разрешил доступ к буферу обмена.'; }
});
$('#download').addEventListener('click', () => {
  const blob = new Blob([previewEl.textContent], { type: 'text/plain;charset=utf-8' });
  const link = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'regexbench-replacement-preview.txt' });
  link.click(); URL.revokeObjectURL(link.href);
});
document.querySelectorAll('[data-example]').forEach((button) => button.addEventListener('click', () => {
  const example = JSON.parse(button.dataset.example);
  patternEl.value = example.pattern; flagsEl.value = example.flags; replacementEl.value = example.replacement; sampleEl.value = example.sample; run();
}));
$('#import').addEventListener('change', async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  if (file.size > 200_000) { statusEl.textContent = 'Файл больше лимита 200 КБ.'; statusEl.className = 'status error'; event.target.value = ''; return; }
  sampleEl.value = await file.text();
  run();
  event.target.value = '';
});
try {
  const saved = JSON.parse(localStorage.getItem('regexbench:v1') || 'null');
  if (saved) { patternEl.value = saved.pattern || ''; flagsEl.value = saved.flags || 'g'; sampleEl.value = saved.sample || ''; replacementEl.value = saved.replacement || ''; }
} catch { /* Ignore invalid local settings. */ }
run();
