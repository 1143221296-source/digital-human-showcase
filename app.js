const MEDIA_BASE = 'https://digital-human-showcase-1315864774.cos.ap-guangzhou.myqcloud.com/digital-human-showcase/';

const normalBackgrounds = Array.from({ length: 10 }, (_, i) => i + 1);
const standardBackgrounds = Array.from({ length: 43 }, (_, i) => i + 11);
const voiceGroups = [
  { title: '男声音', file: 'male', count: 11 },
  { title: '女声音', file: 'female', count: 12 },
  { title: '小男孩声音', file: 'boy', count: 9 },
  { title: '小女孩声音', file: 'girl', count: 5 }
];

function mediaUrl(path) {
  return `${MEDIA_BASE}${path}`;
}

function renderBackgrounds(targetId, numbers, tag, canPreview = false) {
  const target = document.querySelector(targetId);
  if (!target) return;
  target.innerHTML = numbers.map(n => {
    const src = mediaUrl(`assets/backgrounds/bg${n}.jpg`);
    return `
      <article class="asset-card ${canPreview ? 'is-clickable' : ''}">
        <button class="background-thumb" type="button" ${canPreview ? `data-preview="${src}" data-title="背景${n}" data-index="${numbers.indexOf(n)}"` : 'disabled'}>
          <img src="${src}" alt="背景${n}" loading="lazy" draggable="false">
        </button>
        <div class="asset-body"><b>背景${n}</b><span>${tag}</span></div>
      </article>
    `;
  }).join('');
}

function renderVoices() {
  const target = document.querySelector('#voiceGroups');
  if (!target) return;
  target.innerHTML = voiceGroups.map(group => `
    <section class="voice-group">
      <h3>${group.title}</h3>
      <div class="voice-list">
        ${Array.from({ length: group.count }, (_, i) => {
          const n = i + 1;
          const name = `${group.title}${n}`;
          const src = mediaUrl(`assets/voices/${group.file}${n}.wav`);
          return `<article class="voice-item"><b>${name}</b><button class="voice-play" type="button" data-src="${src}" aria-label="播放${name}"><span>▶</span>试听</button></article>`;
        }).join('')}
      </div>
    </section>
  `).join('');
}

const female = Array.from({ length: 33 }, (_, i) => i + 2).map(n => ({
  n,
  gender: 'female',
  cartoon: n >= 35,
  poster: mediaUrl(`assets/posters/female${n}${n >= 35 ? '-cartoon' : ''}.jpg`),
  video: mediaUrl(`videos/female/female${n}${n >= 35 ? '-cartoon' : ''}.mp4`)
}));
const male = Array.from({ length: 30 }, (_, i) => i + 1).filter(n => ![5, 23].includes(n)).map(n => ({
  n,
  gender: 'male',
  cartoon: n >= 31,
  poster: mediaUrl(`assets/posters/male${n}${n >= 31 ? '-cartoon' : ''}.jpg`),
  video: mediaUrl(`videos/male/male${n}${n >= 31 ? '-cartoon' : ''}.mp4`)
}));
const avatars = [...female, ...male];
let filter = 'all';
let limit = 12;
let query = '';
const grid = document.querySelector('#avatarGrid');
const more = document.querySelector('#loadMore');

function label(a) {
  return `${a.gender === 'female' ? '女性' : '男性'}数字人 ${a.n}号`;
}

function visible() {
  return avatars.filter(a =>
    (filter === 'all' || a.gender === filter || (filter === 'cartoon' && a.cartoon)) &&
    (!query || String(a.n).includes(query))
  );
}

function render() {
  if (!grid || !more) return;
  const list = visible();
  grid.innerHTML = '';
  list.slice(0, limit).forEach(a => {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-media">
        <img class="avatar-poster" src="${a.poster}" alt="${label(a)}" loading="lazy" draggable="false">
      </div>
      <div class="card-body"><b>${label(a)}</b><span>${a.cartoon ? '卡通' : '真人'}</span></div>
    `;
    const media = card.querySelector('.card-media');
    let video = null;
    let hovering = false;
    const playPreview = () => {
      if (!media) return;
      hovering = true;
      if (!video) {
        video = document.createElement('video');
        video.className = 'avatar-video';
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.preload = 'none';
        video.dataset.src = a.video;
        video.addEventListener('contextmenu', e => e.preventDefault());
        video.addEventListener('canplay', () => {
          if (hovering) card.classList.add('is-playing');
        });
        video.addEventListener('playing', () => {
          if (hovering) card.classList.add('is-playing');
        });
        media.append(video);
      }
      if (!video.src) video.src = video.dataset.src || '';
      video.play().catch(() => card.classList.remove('is-playing'));
    };
    const stopPreview = () => {
      hovering = false;
      if (!video) return;
      video.pause();
      video.currentTime = 0;
      card.classList.remove('is-playing');
    };
    card.addEventListener('mouseenter', playPreview);
    card.addEventListener('mouseleave', stopPreview);
    grid.append(card);
  });
  more.hidden = list.length <= limit;
}

document.querySelectorAll('.filters button').forEach(btn => {
  btn.onclick = () => {
    const active = document.querySelector('.filters .active');
    if (active) active.classList.remove('active');
    btn.classList.add('active');
    filter = btn.dataset.filter || 'all';
    limit = 12;
    render();
  };
});

const search = document.querySelector('#search');
if (search) {
  search.oninput = e => {
    query = e.target.value.trim();
    limit = 12;
    render();
  };
}
if (more) more.onclick = () => { limit += 12; render(); };

const imageDialog = document.querySelector('#imagePreview');
const imagePreviewImg = document.querySelector('#imagePreviewImg');
const imagePreviewTitle = document.querySelector('#imagePreviewTitle');
let currentBackgroundIndex = -1;
let wheelSwitchLocked = false;

function openBackgroundPreviewByIndex(index) {
  if (!imageDialog || !imagePreviewImg || !imagePreviewTitle || !standardBackgrounds.length) return;
  const total = standardBackgrounds.length;
  const nextIndex = ((index % total) + total) % total;
  const number = standardBackgrounds[nextIndex];
  const title = `背景${number}`;
  currentBackgroundIndex = nextIndex;
  imagePreviewImg.src = mediaUrl(`assets/backgrounds/bg${number}.jpg`);
  imagePreviewImg.alt = title;
  imagePreviewTitle.textContent = title;
  if (!imageDialog.open) imageDialog.showModal();
}

document.addEventListener('click', e => {
  const thumb = e.target.closest('.background-thumb[data-preview]');
  if (!thumb || !imageDialog || !imagePreviewImg || !imagePreviewTitle) return;
  const index = Number.parseInt(thumb.dataset.index || '0', 10);
  openBackgroundPreviewByIndex(Number.isNaN(index) ? 0 : index);
});
document.querySelectorAll('[data-close-dialog]').forEach(btn => {
  btn.addEventListener('click', () => {
    const dialog = btn.closest('dialog');
    if (dialog) dialog.close();
  });
});

if (imageDialog) {
  imageDialog.addEventListener('wheel', e => {
    if (!imageDialog.open || currentBackgroundIndex < 0 || wheelSwitchLocked) return;
    e.preventDefault();
    wheelSwitchLocked = true;
    openBackgroundPreviewByIndex(currentBackgroundIndex + (e.deltaY > 0 ? 1 : -1));
    window.setTimeout(() => { wheelSwitchLocked = false; }, 220);
  }, { passive: false });
  imageDialog.addEventListener('click', e => {
    if (e.target === imageDialog || e.target === imagePreviewImg) imageDialog.close();
  });
  imageDialog.addEventListener('close', () => {
    if (imagePreviewImg) imagePreviewImg.removeAttribute('src');
    currentBackgroundIndex = -1;
  });
}

document.addEventListener('keydown', e => {
  if (!imageDialog || !imageDialog.open || currentBackgroundIndex < 0) return;
  if (e.key === 'ArrowRight') openBackgroundPreviewByIndex(currentBackgroundIndex + 1);
  if (e.key === 'ArrowLeft') openBackgroundPreviewByIndex(currentBackgroundIndex - 1);
});
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
  }, { once: true });
  button.classList.add('playing');
  button.querySelector('span').textContent = '❚❚';
  activeAudio.play().catch(() => {
    button.classList.remove('playing');
    button.querySelector('span').textContent = '▶';
  });
});

renderBackgrounds('#normalBackgroundGrid', normalBackgrounds, '普通背景', false);
renderBackgrounds('#standardBackgroundGrid', standardBackgrounds, '标准背景', true);
renderVoices();
render();

document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('dragstart', e => e.preventDefault());
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && ['s', 'u'].includes(e.key.toLowerCase())) e.preventDefault();
});

const customerPet = document.querySelector('#customerPet');
const customerPanel = document.querySelector('#customerPanel');
const customerClose = document.querySelector('#customerClose');

function setCustomerPanel(open) {
  if (!customerPet || !customerPanel) return;
  customerPet.setAttribute('aria-expanded', String(open));
  customerPanel.classList.toggle('is-open', open);
  customerPanel.setAttribute('aria-hidden', String(!open));
}

if (customerPet && customerPanel) {
  customerPet.addEventListener('click', e => {
    e.stopPropagation();
    setCustomerPanel(!customerPanel.classList.contains('is-open'));
  });
  customerPanel.addEventListener('click', e => e.stopPropagation());
  if (customerClose) {
    customerClose.addEventListener('click', () => setCustomerPanel(false));
  }
  document.addEventListener('click', () => setCustomerPanel(false));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') setCustomerPanel(false);
  });
}

document.querySelectorAll('.case-preview-video').forEach(video => {
  const playWithSound = () => {
    video.muted = false;
    video.volume = 1;
    video.play().catch(() => {
      video.dataset.soundBlocked = 'true';
    });
  };
  video.addEventListener('pointerenter', playWithSound);
  video.addEventListener('mouseenter', playWithSound);
  video.addEventListener('mouseleave', () => {
    video.pause();
    video.currentTime = 0;
  });
  video.addEventListener('contextmenu', e => e.preventDefault());
});

