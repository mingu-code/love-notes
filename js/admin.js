const params = new URLSearchParams(location.search);
let token = params.get('t');
let phrases = [];

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 1600);
}

function viewerUrl() {
  return new URL('index.html?t=' + encodeURIComponent(token), location.href).href;
}

// 옛 데이터(단순 문자열)와 새 데이터({date, text})를 모두 지원
function normalizePhrase(p) {
  return typeof p === 'string' ? { date: '', text: p } : p;
}

// 날짜 오름차순 정렬, 날짜 없는 항목은 맨 뒤로. 같은 날짜끼리는 배열상 순서(수동 정렬) 유지.
function sortPhrases(list) {
  return list
    .map(normalizePhrase)
    .map((p, i) => ({ p, i }))
    .sort((a, b) => {
      const da = a.p.date || '9999-99-99';
      const db = b.p.date || '9999-99-99';
      if (da !== db) return da < db ? -1 : 1;
      return a.i - b.i;
    })
    .map(({ p }) => p);
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function renderList() {
  document.getElementById('count').textContent = phrases.length;
  const ul = document.getElementById('phrase-list');
  ul.innerHTML = '';
  phrases.forEach((p, i) => {
    const li = document.createElement('li');

    const dateBadge = document.createElement('span');
    dateBadge.className = 'order-badge';
    dateBadge.textContent = p.date || '날짜 없음';

    const text = document.createElement('span');
    text.className = 'text';
    text.textContent = p.text;

    const actions = document.createElement('span');
    actions.className = 'row-actions';

    const prevSame = i > 0 && phrases[i - 1].date === p.date;
    const nextSame = i < phrases.length - 1 && phrases[i + 1].date === p.date;

    const upBtn = document.createElement('button');
    upBtn.textContent = '↑';
    upBtn.disabled = !prevSame;
    upBtn.onclick = () => moveItem(i, -1);

    const downBtn = document.createElement('button');
    downBtn.textContent = '↓';
    downBtn.disabled = !nextSame;
    downBtn.onclick = () => moveItem(i, 1);

    const delBtn = document.createElement('button');
    delBtn.textContent = '삭제';
    delBtn.onclick = () => deleteItem(i);

    actions.append(upBtn, downBtn, delBtn);
    li.append(dateBadge, text, actions);
    ul.appendChild(li);
  });
}

async function persist() {
  try {
    await savePhrases(token, phrases);
  } catch (e) {
    showToast('저장에 실패했어요. 다시 시도해주세요.');
  }
}

async function addPhrase() {
  const dateInput = document.getElementById('new-date');
  const textarea = document.getElementById('new-phrase');
  const date = dateInput.value;
  const value = textarea.value.trim();
  if (!date) {
    showToast('날짜를 선택해주세요.');
    return;
  }
  if (!value) return;
  phrases = sortPhrases([...phrases, { date, text: value }]);
  textarea.value = '';
  renderList();
  await persist();
}

async function deleteItem(i) {
  phrases.splice(i, 1);
  renderList();
  await persist();
}

async function moveItem(i, dir) {
  const j = i + dir;
  if (j < 0 || j >= phrases.length) return;
  if (phrases[j].date !== phrases[i].date) return;
  [phrases[i], phrases[j]] = [phrases[j], phrases[i]];
  renderList();
  await persist();
}

function showEditor() {
  document.getElementById('new-list-block').classList.add('admin-hidden');
  document.getElementById('error-block').classList.add('admin-hidden');
  document.getElementById('editor-block').classList.remove('admin-hidden');
  document.getElementById('view-link').value = viewerUrl();
  const dateInput = document.getElementById('new-date');
  if (dateInput && !dateInput.value) dateInput.value = todayStr();
  renderList();
}

function showCreateBlock() {
  document.getElementById('new-list-block').classList.remove('admin-hidden');
  document.getElementById('editor-block').classList.add('admin-hidden');
  document.getElementById('error-block').classList.add('admin-hidden');
}

function showError(msg) {
  document.getElementById('editor-block').classList.add('admin-hidden');
  document.getElementById('new-list-block').classList.add('admin-hidden');
  document.getElementById('error-block').classList.remove('admin-hidden');
  document.getElementById('error-msg').textContent = msg;
}

async function init() {
  document.getElementById('add-btn').onclick = addPhrase;
  document.getElementById('copy-btn').onclick = async () => {
    await navigator.clipboard.writeText(viewerUrl());
    showToast('링크가 복사됐어요');
  };

  if (!token) {
    showCreateBlock();
    document.getElementById('create-btn').onclick = async () => {
      try {
        const data = await createPhraseList();
        token = data.token;
        phrases = sortPhrases(data.phrases || []);
        const url = new URL(location.href);
        url.searchParams.set('t', token);
        history.replaceState(null, '', url.toString());
        showEditor();
      } catch (e) {
        showError('리스트를 만드는 중 문제가 생겼어요. Supabase 설정을 확인해주세요.');
      }
    };
    return;
  }

  try {
    const data = await fetchPhraseList(token);
    if (!data) {
      showError('이 링크에 해당하는 리스트를 찾을 수 없어요.');
      return;
    }
    phrases = sortPhrases(data.phrases || []);
    showEditor();
  } catch (e) {
    showError('불러오는 중 문제가 생겼어요. Supabase 설정을 확인해주세요.');
    return;
  }
}

init();
