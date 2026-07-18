const params = new URLSearchParams(location.search);
const token = params.get('t');

let phrases = [];
let idx = 0;

function showEmpty(msg) {
  document.getElementById('cover').classList.add('hidden');
  const empty = document.getElementById('empty-state');
  empty.textContent = msg;
  empty.classList.remove('hidden');
}

function renderPhrase() {
  const textEl = document.getElementById('phrase-text');
  textEl.textContent = phrases[idx];
  fitText(textEl, { min: 20, max: 120 });
}

function next() {
  const view = document.getElementById('phrase-view');
  view.classList.add('fade-out');
  setTimeout(() => {
    idx = (idx + 1) % phrases.length;
    renderPhrase();
    view.classList.remove('fade-out');
  }, 400);
}

function openFirst() {
  document.getElementById('cover').classList.add('hidden');
  const view = document.getElementById('phrase-view');
  view.classList.remove('hidden');
  idx = 0;
  renderPhrase();
  view.addEventListener('click', next);
}

async function init() {
  if (!token) {
    showEmpty('링크가 올바르지 않아요.');
    return;
  }
  let data;
  try {
    data = await fetchPhraseList(token);
  } catch (e) {
    showEmpty('불러오는 중 문제가 생겼어요.');
    return;
  }
  if (!data || !data.phrases || data.phrases.length === 0) {
    showEmpty('아직 준비된 문구가 없어요.');
    return;
  }
  phrases = data.phrases;
  document.getElementById('cover').addEventListener('click', openFirst);
}

window.addEventListener('resize', () => {
  if (!document.getElementById('phrase-view').classList.contains('hidden')) {
    renderPhrase();
  }
});

init();
