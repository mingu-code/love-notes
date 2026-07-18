// 컨테이너 안에서 텍스트가 넘치지 않는 가장 큰 폰트 크기를 이진 탐색으로 찾는다.
// el은 고정 너비(CSS width)를 가지고 있어야 한다 — 그래야 폰트 크기 증가에 따라
// 줄바꿈 폭이 변하지 않고 scrollHeight만 단조 증가해서 이진 탐색이 성립한다.
function fitText(el, { min = 16, max = 160, margin = 0.88 } = {}) {
  const parent = el.parentElement;
  const targetHeight = parent.clientHeight * margin;
  let lo = min;
  let hi = max;
  let best = min;

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    el.style.fontSize = mid + 'px';
    const fits = el.scrollHeight <= targetHeight;
    if (fits) {
      best = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  el.style.fontSize = best + 'px';
}
