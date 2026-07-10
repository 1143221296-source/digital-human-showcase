const MEDIA_BASE = 'https://digital-human-showcase-1315864774.cos.ap-guangzhou.myqcloud.com/digital-human-showcase/';
const normalBackgrounds = Array.from({length: 10}, (_, i) => i + 1);
const standardBackgrounds = Array.from({length: 43}, (_, i) => i + 11);
const voiceGroups = [
  {title: '男声音', file: 'male', count: 11},
  {title: '女声音', file: 'female', count: 12},
  {title: '小男孩声音', file: 'boy', count: 9},
  {title: '小女孩声音', file: 'girl', count: 5}
];

function renderBackgrounds(targetId, numbers, tag) {
  const target = document.querySelector(targetId);
  if (!target) return;
  target.innerHTML = numbers.map(n => `
    <article class="asset-card">
      <div class="background-thumb">
        <img src="${MEDIA_BASE}assets/backgrounds/bg${n}.jpg" alt="背景${n}" loading="lazy" draggable="false">
      </div>
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
          const name = `${group.title}${n}`;
          return `<article class="voice-item"><b>${name}</b><button class="voice-play" type="button" data-src="${MEDIA_BASE}assets/voices/${group.file}${n}.wav" aria-label="播放${name}"><span>▶</span>试听</button></article>`;
        }).join('')}
      </div>
    </section>
  `).join('');
}

const female = Array.from({length: 42}, (_, i) => i + 2).map(n => ({n, gender: 'female', cartoon: n >= 35, src: `${MEDIA_BASE}videos/female/female${n}${n >= 35 ? '-cartoon' : ''}.mp4`}));
const male = Array.from({length: 35}, (_, i) => i + 1).filter(n => ![5, 23].includes(n)).map(n => ({n, gender: 'male', cartoon: n >= 31, src: `${MEDIA_BASE}videos/male/male${n}${n >= 31 ? '-cartoon' : ''}.mp4`}));
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
    card.innerHTML = `<div class="card-media"><video muted loop playsinline preload="none" data-src="${a.src}"></video></div><div class="card-body"><b>${label(a)}</b><span>${a.cartoon ? '卡通' : '真人'}</span></div>`;
    const vid = card.querySelector('video');
    const loadVideo = () => {
      if (!vid.src) vid.src = vid.dataset.src;
    };
    vid.addEventListener('loadedmetadata', () => { vid.currentTime = .05; }, {once: true});
    card.addEventListener('mouseenter', () => { loadVideo(); vid.play().catch(() => {}); });
    card.addEventListener('mouseleave', () => { vid.pause(); vid.currentTime = 0; });
    card.addEventListener('click', () => { loadVideo(); openPreview(a); });
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

let activeAudio = null;
let activeButton = null;
document.addEventListener('click', e => {
  const button = e.target.closest('.voice-play');
  if (!button) return;
  if (activeAudio && activeButton === button && !activeAudio.paused) {
    activeAudio.pause();
    button.classList.remove('playing');
    button.querySelector('span').textContent = '▶';
    return;
  }
  if (activeAudio) {
    activeAudio.pause();
    activeAudio.currentTime = 0;
  }
  if (activeButton) {
    activeButton.classList.remove('playing');
    activeButton.querySelector('span').textContent = '▶';
  }
  activeButton = button;
  activeAudio = new Audio(button.dataset.src);
  activeAudio.preload = 'auto';
  activeAudio.addEventListener('ended', () => {
    button.classList.remove('playing');
    button.querySelector('span').textContent = '▶';
  }, {once: true});
  button.classList.add('playing');
  button.querySelector('span').textContent = '❚❚';
  activeAudio.play().catch(() => {
    button.classList.remove('playing');
    button.querySelector('span').textContent = '▶';
  });
});
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('dragstart', e => e.preventDefault());
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && ['s', 'u'].includes(e.key.toLowerCase())) e.preventDefault();
});

