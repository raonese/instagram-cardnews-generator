const canvas = document.querySelector('#mainCanvas');
const ctx = canvas.getContext('2d');
const cardList = document.querySelector('#cardList');

const starterCards = [
  { title: '여름, 비건으로\n달콤하게', body: '시원하고 달콤한 한입으로 시작하는 새로운 계절', badge: 'NEW SEASON', bg: '#ef9f74', accent: '#ffdc67' },
  { title: '취향을 담은\n한 장의 이야기', body: '나만의 이미지와 문장으로 시선을 사로잡아 보세요', badge: 'STORY', bg: '#5b7a68', accent: '#d7ee91' },
  { title: '오늘의 영감을\n기록하세요', body: '완성한 카드뉴스는 고화질 PNG로 바로 저장할 수 있어요', badge: 'TIP', bg: '#6654bb', accent: '#ff9eb5' }
];

const makeCard = (seed = {}) => ({
  id: crypto.randomUUID(), title: seed.title || '새로운 이야기를\n입력하세요', body: seed.body || '본문 내용을 입력해 주세요.', badge: seed.badge || '',
  backgroundColor: seed.bg || seed.backgroundColor || '#6654bb', accentColor: seed.accent || seed.accentColor || '#ff9eb5',
  textColor: seed.textColor || '#ffffff', overlayColor: seed.overlayColor || '#151222', overlayOpacity: seed.overlayOpacity ?? 38,
  titleSize: seed.titleSize || 72, bodySize: seed.bodySize || 30, position: seed.position || 'bottom', align: seed.align || 'left', template: seed.template || 'gradient',
  image: seed.image || null, imageUrl: seed.imageUrl || null
});

let cards = starterCards.map(makeCard);
let selectedId = cards[0].id;
let ratio = 'portrait';

const controls = {
  title: document.querySelector('#titleText'), body: document.querySelector('#bodyText'), badge: document.querySelector('#badgeText'),
  titleSize: document.querySelector('#titleSize'), bodySize: document.querySelector('#bodySize'), overlayOpacity: document.querySelector('#overlayOpacity'),
  textColor: document.querySelector('#textColor'), accentColor: document.querySelector('#accentColor'), overlayColor: document.querySelector('#overlayColor'),
  backgroundColor: document.querySelector('#backgroundColor')
};
const selected = () => cards.find(card => card.id === selectedId);

function roundedRect(context, x, y, w, h, r) {
  context.beginPath(); context.roundRect(x, y, w, h, r); context.closePath();
}

function drawCoverImage(context, image, width, height) {
  const scale = Math.max(width / image.width, height / image.height);
  const w = image.width * scale, h = image.height * scale;
  context.drawImage(image, (width - w) / 2, (height - h) / 2, w, h);
}

function wrapText(context, text, maxWidth) {
  const result = [];
  text.split('\n').forEach(paragraph => {
    const words = paragraph.includes(' ') ? paragraph.split(' ') : [...paragraph];
    let line = '';
    words.forEach(word => {
      const joiner = paragraph.includes(' ') && line ? ' ' : '';
      const test = line + joiner + word;
      if (line && context.measureText(test).width > maxWidth) { result.push(line); line = word; }
      else line = test;
    });
    result.push(line);
  });
  return result;
}

function renderCard(context, card, width, height) {
  context.clearRect(0, 0, width, height);
  context.fillStyle = card.backgroundColor; context.fillRect(0, 0, width, height);
  if (card.image?.complete) drawCoverImage(context, card.image, width, height);
  else {
    const gradient = context.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, card.backgroundColor); gradient.addColorStop(1, card.accentColor);
    context.fillStyle = gradient; context.fillRect(0, 0, width, height);
    context.globalAlpha = .12;
    context.fillStyle = '#fff'; context.beginPath(); context.arc(width * .78, height * .22, width * .3, 0, Math.PI * 2); context.fill();
    context.beginPath(); context.arc(width * .18, height * .82, width * .38, 0, Math.PI * 2); context.fill(); context.globalAlpha = 1;
  }
  context.fillStyle = card.overlayColor; context.globalAlpha = card.overlayOpacity / 100; context.fillRect(0, 0, width, height); context.globalAlpha = 1;

  if (card.template === 'outline') {
    context.strokeStyle = card.textColor; context.globalAlpha = .75; context.lineWidth = 4;
    roundedRect(context, 40, 40, width - 80, height - 80, 15); context.stroke(); context.globalAlpha = 1;
  }

  const pad = width * .075; const contentWidth = width - pad * 2;
  context.textAlign = card.align; context.textBaseline = 'top';
  const x = card.align === 'left' ? pad : card.align === 'right' ? width - pad : width / 2;

  context.font = `800 ${card.titleSize}px Pretendard, sans-serif`;
  const titleLines = wrapText(context, card.title, contentWidth);
  const titleLineHeight = card.titleSize * 1.17;
  context.font = `500 ${card.bodySize}px Pretendard, sans-serif`;
  const bodyLines = wrapText(context, card.body, contentWidth);
  const bodyLineHeight = card.bodySize * 1.45;
  const badgeHeight = card.badge ? 48 : 0;
  const totalHeight = badgeHeight + (card.badge ? 26 : 0) + titleLines.length * titleLineHeight + 27 + bodyLines.length * bodyLineHeight;
  let y = card.position === 'top' ? pad : card.position === 'center' ? (height - totalHeight) / 2 : height - pad - totalHeight;

  if (card.template === 'box') {
    const boxY = y - 44; const boxH = totalHeight + 88;
    context.fillStyle = card.overlayColor; context.globalAlpha = Math.min(.88, card.overlayOpacity / 100 + .28);
    roundedRect(context, pad - 30, boxY, contentWidth + 60, boxH, 24); context.fill(); context.globalAlpha = 1;
  } else if (card.template === 'minimal') {
    context.fillStyle = card.backgroundColor; context.globalAlpha = .94;
    const panelY = card.position === 'top' ? 0 : card.position === 'center' ? y - 70 : height - totalHeight - pad - 58;
    context.fillRect(0, panelY, width, totalHeight + pad + 70); context.globalAlpha = 1;
  }

  if (card.badge) {
    context.font = '700 22px Pretendard, sans-serif';
    const badgeWidth = context.measureText(card.badge).width + 34;
    const badgeX = card.align === 'left' ? x : card.align === 'right' ? x - badgeWidth : x - badgeWidth / 2;
    context.fillStyle = card.accentColor; roundedRect(context, badgeX, y, badgeWidth, badgeHeight, 24); context.fill();
    context.fillStyle = '#18171c'; context.textAlign = 'center'; context.fillText(card.badge, badgeX + badgeWidth / 2, y + 11);
    context.textAlign = card.align; y += badgeHeight + 26;
  }
  context.fillStyle = card.textColor; context.font = `800 ${card.titleSize}px Pretendard, sans-serif`;
  titleLines.forEach(line => { context.fillText(line, x, y); y += titleLineHeight; });
  y += 27; context.globalAlpha = .9; context.font = `500 ${card.bodySize}px Pretendard, sans-serif`;
  bodyLines.forEach(line => { context.fillText(line, x, y); y += bodyLineHeight; }); context.globalAlpha = 1;

  context.fillStyle = card.accentColor;
  const barX = card.align === 'left' ? pad : card.align === 'right' ? width - pad - 72 : width / 2 - 36;
  roundedRect(context, barX, height - 35, 72, 7, 4); context.fill();
}

function renderMain() {
  canvas.width = 1080; canvas.height = ratio === 'square' ? 1080 : 1350;
  renderCard(ctx, selected(), canvas.width, canvas.height);
  document.querySelector('#canvasSize').textContent = ratio === 'square' ? '1080 × 1080 px · Instagram 정사각형' : '1080 × 1350 px · Instagram 세로형';
  document.querySelector('#cardPosition').textContent = `${cards.findIndex(card => card.id === selectedId) + 1} / ${cards.length} 카드`;
  requestAnimationFrame(updateZoom);
}

function renderList() {
  cardList.innerHTML = '';
  cards.forEach((card, index) => {
    const item = document.createElement('article'); item.className = `card-item${card.id === selectedId ? ' active' : ''}`;
    const thumb = document.createElement('canvas'); thumb.width = 420; thumb.height = 420;
    renderCard(thumb.getContext('2d'), { ...card, titleSize: 44, bodySize: 18 }, 420, 420);
    const wrap = document.createElement('div'); wrap.className = 'thumbnail-wrap'; wrap.append(thumb);
    const number = document.createElement('span'); number.className = 'card-number'; number.textContent = index + 1; wrap.append(number);
    const caption = document.createElement('div'); caption.className = 'card-caption';
    caption.innerHTML = `<strong>${escapeHtml(card.title.replaceAll('\n', ' '))}</strong><span>${escapeHtml(card.body)}</span>`;
    item.append(wrap, caption); item.addEventListener('click', () => selectCard(card.id)); cardList.append(item);
  });
  document.querySelector('#cardCount').textContent = `${cards.length}장`;
}

function escapeHtml(value) { const div = document.createElement('div'); div.textContent = value; return div.innerHTML; }

function syncControls() {
  const card = selected();
  controls.title.value = card.title; controls.body.value = card.body; controls.badge.value = card.badge;
  controls.titleSize.value = card.titleSize; controls.bodySize.value = card.bodySize; controls.overlayOpacity.value = card.overlayOpacity;
  controls.textColor.value = card.textColor; controls.accentColor.value = card.accentColor; controls.overlayColor.value = card.overlayColor; controls.backgroundColor.value = card.backgroundColor;
  document.querySelector('#titleSizeValue').textContent = `${card.titleSize}px`; document.querySelector('#bodySizeValue').textContent = `${card.bodySize}px`;
  document.querySelector('#overlayValue').textContent = `${card.overlayOpacity}%`;
  syncSegment('#positionControl', card.position); syncSegment('#alignControl', card.align);
  syncSegment('#templateControl', card.template);
}

function syncSegment(selector, value) { document.querySelectorAll(`${selector} button`).forEach(button => button.classList.toggle('active', button.dataset.value === value)); }
function refresh() { renderMain(); renderList(); syncControls(); saveProject(); }
function selectCard(id) { selectedId = id; refresh(); }

function addCard(copy = null) {
  const newCard = makeCard(copy ? { ...copy, image: copy.image, imageUrl: copy.imageUrl } : {});
  cards.push(newCard); selectedId = newCard.id; refresh(); showToast(copy ? '카드를 복제했어요.' : '새 카드를 추가했어요.');
}

function deleteCard() {
  if (cards.length === 1) return showToast('카드는 최소 한 장 필요해요.');
  const index = cards.findIndex(card => card.id === selectedId); cards.splice(index, 1); selectedId = cards[Math.min(index, cards.length - 1)].id; refresh(); showToast('카드를 삭제했어요.');
}

Object.entries(controls).forEach(([key, element]) => {
  const event = element.type === 'color' ? 'input' : 'input';
  element.addEventListener(event, () => {
    let cardKey = key;
    if (key === 'title') cardKey = 'title'; if (key === 'body') cardKey = 'body'; if (key === 'badge') cardKey = 'badge';
    selected()[cardKey] = ['titleSize','bodySize','overlayOpacity'].includes(key) ? Number(element.value) : element.value;
    renderMain(); renderList(); syncControls(); saveProject();
  });
});

function bindSegment(selector, key) { document.querySelectorAll(`${selector} button`).forEach(button => button.addEventListener('click', () => { selected()[key] = button.dataset.value; refresh(); })); }
bindSegment('#positionControl', 'position'); bindSegment('#alignControl', 'align');
bindSegment('#templateControl', 'template');

document.querySelector('#imageUpload').addEventListener('change', event => {
  const file = event.target.files[0]; if (!file) return;
  if (file.size > 10 * 1024 * 1024) return showToast('10MB 이하 이미지를 선택해 주세요.');
  const reader = new FileReader(); reader.onload = () => {
    const image = new Image(); image.onload = () => { selected().image = image; selected().imageUrl = reader.result; refresh(); showToast('이미지를 적용했어요.'); };
    image.src = reader.result;
  }; reader.readAsDataURL(file); event.target.value = '';
});
document.querySelector('#removeImage').addEventListener('click', () => {
  if (!selected().imageUrl) return showToast('제거할 이미지가 없어요.');
  selected().image = null; selected().imageUrl = null; refresh(); showToast('배경 이미지를 제거했어요.');
});

document.querySelectorAll('#addCard, #addCardBottom').forEach(button => button.addEventListener('click', () => addCard()));
document.querySelector('#duplicateCard').addEventListener('click', () => addCard(selected()));
document.querySelector('#deleteCard').addEventListener('click', deleteCard);
function moveCard(direction) {
  const index = cards.findIndex(card => card.id === selectedId);
  const nextIndex = (index + direction + cards.length) % cards.length;
  selectCard(cards[nextIndex].id);
}
document.querySelector('#previousCard').addEventListener('click', () => moveCard(-1));
document.querySelector('#nextCard').addEventListener('click', () => moveCard(1));
document.querySelectorAll('.view-tab').forEach(button => button.addEventListener('click', () => {
  ratio = button.dataset.ratio; document.querySelectorAll('.view-tab').forEach(tab => tab.classList.toggle('active', tab === button)); renderMain();
}));

function downloadCanvas(source, filename) { const link = document.createElement('a'); link.download = filename; link.href = source.toDataURL('image/png'); link.click(); }
function downloadCurrentCard() {
  const pageNumber = cards.findIndex(card => card.id === selectedId) + 1;
  downloadCanvas(canvas, `card-${String(pageNumber).padStart(2, '0')}.png`);
  showToast(`${pageNumber}페이지 PNG 저장을 시작했어요.`);
}
document.querySelector('#downloadCard').addEventListener('click', downloadCurrentCard);
document.querySelector('#downloadCurrentTop').addEventListener('click', downloadCurrentCard);
document.querySelector('#downloadAll').addEventListener('click', async () => {
  for (let i = 0; i < cards.length; i++) {
    const output = document.createElement('canvas'); output.width = 1080; output.height = ratio === 'square' ? 1080 : 1350;
    renderCard(output.getContext('2d'), cards[i], output.width, output.height); downloadCanvas(output, `card-${String(i + 1).padStart(2, '0')}.png`);
    await new Promise(resolve => setTimeout(resolve, 180));
  } showToast(`${cards.length}장 저장을 시작했어요.`);
});

document.querySelector('#resetProject').addEventListener('click', () => {
  if (!confirm('모든 작업을 초기 상태로 되돌릴까요?')) return;
  localStorage.removeItem('cardnews-project'); cards = starterCards.map(makeCard); selectedId = cards[0].id; refresh(); showToast('프로젝트를 초기화했어요.');
});

function saveProject() {
  const safeCards = cards.map(({ image, ...card }) => card);
  try { localStorage.setItem('cardnews-project', JSON.stringify({ cards: safeCards, title: document.querySelector('#projectTitle').value })); } catch { /* large images can exceed storage quota */ }
}
function loadProject() {
  try {
    const saved = JSON.parse(localStorage.getItem('cardnews-project')); if (!saved?.cards?.length) return;
    cards = saved.cards.map(makeCard); selectedId = cards[0].id; document.querySelector('#projectTitle').value = saved.title || '나의 카드뉴스';
    cards.forEach(card => { if (card.imageUrl) { const image = new Image(); image.onload = () => { card.image = image; refresh(); }; image.src = card.imageUrl; } });
  } catch { localStorage.removeItem('cardnews-project'); }
}
document.querySelector('#projectTitle').addEventListener('input', saveProject);

let toastTimer;
function showToast(message) { const toast = document.querySelector('#toast'); toast.textContent = message; toast.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('show'), 2200); }
function updateZoom() { document.querySelector('#zoomLabel').textContent = `${Math.round(canvas.getBoundingClientRect().width / canvas.width * 100)}%`; }
window.addEventListener('resize', updateZoom);
loadProject(); refresh();
