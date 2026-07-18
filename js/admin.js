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

function renderList() {
  document.getElementById('count').textContent = phrases.length;
  const ul = document.getElementById('phrase-list');
  ul.innerHTML = '';
  phrases.forEach((p, i) => {
    const li = document.createElement('li');

    const badge = document.createElement('span');
    badge.className = 'order-badge';
    badge.textContent = i + 1 + '.';

    const text = document.createElement('span');
    text.className = 'text';
    text.textContent = p;

    const actions = document.createElement('span');
    actions.className = 'row-actions';

    const upBtn = document.createElement('button');
    upBtn.textContent = '↑';
    upBtn.disabled = i === 0;
    upBtn.onclick = () => moveItem(i, -1);

    const downBtn = document.createElement('button');
    downBtn.textContent = '↓';
    downBtn.disabled = i === phrases.length - 1;
    downBtn.onclick = () => moveItem(i, 1);

    const delBtn = document.createElement('button');
    delBtn.textContent = '삭제';
    delBtn.onclick = () => deleteItem(i);

    actions.append(upBtn, downBtn, delBtn);
    li.append(badge, text, actions);
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
  const textarea = document.getElementById('new-phrase');
  const value = textarea.value.trim();
  if (!value) return;
  phrases.push(value);
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
  [phrases[i], phrases[j]] = [phrases[j], phrases[i]];
  renderList();
  await persist();
}

function showEditor() {
  document.getElementById('new-list-block').classList.add('admin-hidden');
  document.getElementById('error-block').classList.add('admin-hidden');
  document.getElementById('editor-block').classList.remove('admin-hidden');
  document.getElementById('view-link').value = viewerUrl();
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
        phrases = data.phrases || [];
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
    phrases = data.phrases || [];
    showEditor();
  } catch (e) {
    showError('불러오는 중 문제가 생겼어요. Supabase 설정을 확인해주세요.');
    return;
  }
}

init();
