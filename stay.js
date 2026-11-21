'use strict';

const filterForm = document.querySelector('#stay-filters');
const results = document.querySelector('#stay-results');
const candidates = [...results.children];
const resultCount = document.querySelector('#stay-count');

function filterStays() {
  const filters = new FormData(filterForm);
  const sortByPrice = filters.get('sort') === 'price';
  const price = (card) => card.dataset.price ? Number(card.dataset.price) : Infinity;
  const budget = Number(filters.get('budget'));
  const bed = filters.get('bed');
  const focus = filters.get('focus');

  candidates.sort((a, b) => (sortByPrice && a.dataset.price !== b.dataset.price ? price(a) - price(b) : 0)
    || Number(a.dataset.rank) - Number(b.dataset.rank));
  let count = 0;

  for (const card of candidates) {
    const { rank, stock, cancel } = card.dataset;
    card.hidden = (filters.get('scope') === 'top' && Number(rank) >= 3)
      || (budget > 0 && price(card) > budget)
      || Boolean(bed && bed !== card.dataset.bed)
      || Boolean(focus && (focus === 'review' ? card.dataset.review !== '1' : focus !== card.dataset.focus))
      || (filters.has('cancel') && cancel !== '1')
      || (filters.has('stock') && stock !== 'available');
    if (!card.hidden) count += 1;
    results.append(card);
  }
  resultCount.textContent = count ? `객실 옵션 ${count}개` : '조건에 맞는 객실이 없습니다. 범위나 예산을 변경해 보세요.';
}

filterForm.addEventListener('input', (event) => {
  if (event.target.name !== 'scope' && event.target.name !== 'sort') {
    filterForm.elements.scope.value = 'all';
  }
  filterStays();
});
filterForm.addEventListener('reset', () => requestAnimationFrame(filterStays));
filterStays();

const mapTarget = document.querySelector('#stay-map');
if (window.L) {
  const hotels = [
    ['파크 플라자 왕푸징', [39.91290, 116.41120]],
    ['선월드 호텔 왕푸징', [39.91698, 116.40705]],
    ['선월드 다이너스티', [39.91668, 116.40559]],
  ];
  const map = L.map(mapTarget, { scrollWheelZoom: false });
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(map);
  hotels.forEach(([name, coordinates], index) => {
    const label = document.createElement('a');
    label.href = `#hotel-${index}`;
    label.textContent = name;
    label.addEventListener('click', () => {
      filterForm.reset();
      filterStays();
    });
    L.marker(coordinates, { title: name }).addTo(map).bindPopup(label);
  });
  map.fitBounds(hotels.map(([, coordinates]) => coordinates), { padding: [45, 45], maxZoom: 16 });
} else {
  mapTarget.hidden = true;
}
