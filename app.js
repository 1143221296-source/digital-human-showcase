const normalBackgrounds = Array.from({length: 10}, (_, i) => i + 1);
const standardBackgrounds = Array.from({length: 43}, (_, i) => i + 11);
const voiceGroups = [
  {title: '男声音', prefix: '男声音', count: 11},
  {title: '女声音', prefix: '女声音', count: 12},
  {title: '小男孩声音', prefix: '小男孩声音', count: 9},
  {title: '小女孩声音', prefix: '小女孩声音', count: 5}
];

function renderBackgrounds(targetId, numbers, tag) {
  const target = document.querySelector(targetId);
  if (!target) return;
  target.innerHTML = numbers.map(n => `
    <article class="asset-card">
      <a class="background-thumb" href="assets/backgrounds/背景${n}.jpg" target="_blank" rel="noopener">
        <img src="assets/backgrounds/背景${n}.jpg" alt="背景${n}" loading="lazy">
      </a>
      <div class="asset-body"><b>背景${n}</b><span>${tag}</span></div>
    </article>
  `).join('');
}

function renderVoices() {
  const target = document.querySelector('#voiceGroups');
  if (!target) return;
  target.innerHTML = voiceGroups.map(group => `
    <section class="voice-group">
      <h3>${group.title}</h3>
      <div class="voice-list">
        ${Array.from({length: group.count}, (_, i) => {
          const n = i + 1;
          const name = `${group.prefix}${n}`;
          return `<article class="voice-item"><b>${name}</b><audio controls preload="none" src="assets/voices/${name}.wav"></audio></article>`;
        }).join('')}
      </div>
    </section>
  `).join('');
}

const female = Array.from({length: 42}, (_, i) => i + 2).map(n => ({n, gender: 'female', cartoon: n >= 35, src: `女视频/女${n}${n >= 35 ? '卡通' : ''}.mp4`}));
const male = Array.from({length: 35}, (_, i) => i + 1).filter(n => ![5, 23].includes(n)).map(n => ({n, gender: 'male', cartoon: n >= 31, src: `男视频/男${n}${n >= 31 ? '卡通' : ''}.mp4`}));
const avatars = [...female, ...male];
let filter = 'all', limit = 12, query = '';
const grid = document.querySelector('#avatarGrid'), more = document.querySelector('#loadMore');

function label(a) { return `${a.gender === 'female' ? '女性' : '男性'}数字人 ${a.n}号`; }
function visible() { return avatars.filter(a => (filter === 'all' || a.gender === filter || (filter === 'cartoon' && a.cartoon)) && (!query || String(a.n).includes(query))); }
function render() {
  const list = visible();
  grid.innerHTML = '';
  list.slice(0, limit).forEach(a => {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `<div class="card-media"><video muted loop playsinline preload="metadata" src="${a.src}"></video></div><div class="card-body"><b>${label(a)}</b><span>${a.cartoon ? '卡通' : '真人'}</span></div>`;
    const vid = card.querySelector('video');
    vid.addEventListener('loadedmetadata', () => { vid.currentTime = .05; }, {once: true});
    card.addEventListener('mouseenter', () => vid.play().catch(() => {}));
    card.addEventListener('mouseleave', () => { vid.pause(); vid.currentTime = 0; });
    card.addEventListener('click', () => openPreview(a));
    grid.append(card);
  });
  more.hidden = list.length <= limit;
}

document.querySelectorAll('.filters button').forEach(btn => btn.onclick = () => {
  document.querySelector('.filters .active').classList.remove('active');
  btn.classList.add('active');
  filter = btn.dataset.filter;
  limit = 12;
  render();
});
document.querySelector('#search').oninput = e => { query = e.target.value.trim(); limit = 12; render(); };
more.onclick = () => { limit += 12; render(); };

const dialog = document.querySelector('#preview'), pv = document.querySelector('#previewVideo');
function openPreview(a) {
  document.querySelector('#previewTitle').textContent = label(a);
  pv.src = a.src;
  dialog.showModal();
  pv.onloadeddata = () => pv.play().catch(() => {});
}
document.querySelector('.close').onclick = () => dialog.close();
dialog.addEventListener('close', () => { pv.pause(); pv.removeAttribute('src'); pv.load(); });
dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
document.querySelector('.inquire').onclick = () => { dialog.close(); document.querySelector('#contact').scrollIntoView({behavior: 'smooth'}); };

renderBackgrounds('#normalBackgroundGrid', normalBackgrounds, '普通背景');
renderBackgrounds('#standardBackgroundGrid', standardBackgrounds, '标准背景');
renderVoices();
render();
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('dragstart', e => e.preventDefault());
