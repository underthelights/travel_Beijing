'use strict';

const points = {
  airport: ['서우두공항 T2', 40.07892, 116.58890],
  sunworld: ['선월드 호텔 왕푸징', 39.91698, 116.40705],
  wangfujing: ['왕푸징 보행거리', 39.91501, 116.40561],
  wangjing: ['왕징역 · SUNNY 집결권', 39.99657, 116.46243],
  wall: ['무톈위 매표소', 40.41643, 116.53790],
  summer: ['이화원 북문권', 40.00119, 116.27137],
  square: ['천안문 광장', 39.90309, 116.39158],
  palace: ['자금성 오문', 39.91272, 116.39071],
  jingshan: ['경산공원', 39.92441, 116.39038],
  temple: ['천단공원 기년전', 39.88225, 116.40662],
  qianmen: ['첸먼역 · 전문대가', 39.89868, 116.39250],
};
const routes = {
  13: ['#356c65', ['airport', 'sunworld', 'wangfujing']],
  14: ['#985b43', ['sunworld', 'wall', 'summer']],
  15: ['#846a37', ['square', 'palace', 'jingshan']],
  16: ['#435d83', ['temple', 'qianmen']],
  17: ['#705978', ['sunworld', 'airport']],
};

const mainDay = document.querySelector('[data-route-day]');
const day = mainDay ? Number(mainDay.dataset.routeDay) : 0;
const mapElement = document.getElementById(day ? 'dayMap' : 'homeMap');

function newNode(type, label) {
  const node = document.createElement(type);
  node.textContent = label;
  return node;
}

function pointLink(name, lat, lng) {
  const link = newNode('a', name);
  link.href = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  return link;
}

function initializeMap() {
  if (!mapElement || !window.L) return {};
  const map = L.map(mapElement, { scrollWheelZoom: false });
  const tile = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);
  tile.on('tileerror', () => mapElement.classList.add('tile-unavailable'));
  const markers = new Map();
  const selectedDays = day ? [day] : Object.keys(routes).map(Number);
  for (const selectedDay of selectedDays) {
    const [color, ids] = routes[selectedDay];
    const markerIds = day === 14 ? [...ids, 'wangjing'] : ids;
    const coordinates = ids.map((id) => points[id].slice(1));
    L.polyline(coordinates, { color, weight: 2, opacity: .65, dashArray: '6 8' }).addTo(map);
    for (const [i, id] of markerIds.entries()) {
      const [name, lat, lng] = points[id];
      if (markers.has(id)) continue;
      const pin = newNode('div', String(day ? i + 1 : selectedDay - 12));
      pin.className = 'marker-pin beijing-pin';
      pin.style.backgroundColor = color;
      const marker = L.marker([lat, lng], {
        title: name,
        icon: L.divIcon({ className: 'route-pin-icon', html: pin, iconSize: [26, 26], iconAnchor: [13, 26], popupAnchor: [0, -26] }),
      }).addTo(map);
      const popup = newNode('div', '');
      popup.append(newNode('strong', name), newNode('br', ''));
      const link = day ? pointLink('지도에서 열기', lat, lng) : newNode('a', '일차별 일정');
      if (!day) link.href = `day-${selectedDay}.html`;
      popup.append(link);
      marker.bindPopup(popup);
      markers.set(id, marker);
    }
  }
  map.fitBounds(L.featureGroup([...markers.values()]).getBounds().pad(.16), { maxZoom: 14 });
  return { map, markers };
}

const { map, markers } = initializeMap();
if (mapElement && !map) {
  const ids = day ? routes[day][1] : [...new Set(Object.values(routes).flatMap(([, locations]) => locations))];
  const list = newNode('ul', '');
  for (const id of ids) {
    const item = newNode('li', '');
    item.append(pointLink(...points[id]));
    list.append(item);
  }
  mapElement.append(list);
}

const filters = [...document.querySelectorAll('[data-route-filter]')];
const routeItems = [...document.querySelectorAll('[data-route-kind]')];
for (const button of filters) {
  button.addEventListener('click', () => {
    const kind = button.dataset.routeFilter;
    for (const other of filters) {
      const active = other === button;
      other.classList.toggle('active', active);
      other.setAttribute('aria-pressed', String(active));
    }
    for (const item of routeItems) {
      item.hidden = kind !== 'all' && item.dataset.routeKind !== kind;
    }
  });
}
const requestedKind = new URLSearchParams(location.search).get('kind');
filters.find((button) => button.dataset.routeFilter === requestedKind)?.click();
for (const item of routeItems) {
  const button = item.querySelector('.stop-map-button');
  if (!button) continue;
  button.addEventListener('click', () => {
    const marker = markers?.get(item.dataset.location);
    if (!marker) {
      const [name, lat, lng] = points[item.dataset.location];
      location.href = pointLink(name, lat, lng).href;
      return;
    }
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    mapElement.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'nearest' });
    if (reduced) map.setView(marker.getLatLng(), 14);
    else map.flyTo(marker.getLatLng(), 14, { duration: .6 });
    marker.openPopup();
    for (const other of routeItems) other.classList.toggle('sel', other === item);
  });
}

const share = document.getElementById('shareBtn');
share?.addEventListener('click', async () => {
  const url = new URL('index.html', location.href).href;
  try {
    if (navigator.share) await navigator.share({ title: 'Winter in Beijing', url });
    else {
      await navigator.clipboard.writeText(url);
      share.textContent = '링크 복사됨';
    }
  } catch (error) {
    if (error.name !== 'AbortError') share.textContent = '주소창에서 링크 복사';
  }
});
