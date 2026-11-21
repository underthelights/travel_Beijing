'use strict';

const navCounts = {"13":{"move":1,"sight":1,"food":1,"stay":1,"shop":1},"14":{"move":1,"sight":3,"food":3,"stay":0,"shop":0},"15":{"move":0,"sight":3,"food":3,"stay":1,"shop":0},"16":{"move":1,"sight":2,"food":2,"stay":1,"shop":1},"17":{"move":3,"sight":0,"food":1,"stay":1,"shop":1}};
const placeKinds = {
  move: ['이동', '#42647a'],
  sight: ['관람·산책', '#326859'],
  food: ['식사', '#a64431'],
  stay: ['숙소·휴식', '#775687'],
  shop: ['선택', '#785825'],
};

const entries = [];
let hideTimer;
function closeMenus() {
  for (const { toggle, menu } of entries) {
    menu.classList.remove('show');
    toggle.setAttribute('aria-expanded', 'false');
  }
}
function openMenu(entry) {
  closeMenus();
  const bounds = entry.wrapper.getBoundingClientRect();
  entry.menu.classList.add('show');
  entry.menu.style.left = Math.max(8, Math.min(bounds.left, innerWidth - entry.menu.offsetWidth - 8)) + 'px';
  entry.menu.style.top = (bounds.bottom + 8) + 'px';
  entry.toggle.setAttribute('aria-expanded', 'true');
}
for (const [day, counts] of Object.entries(navCounts)) {
  const link = document.querySelector(`.nav a[href="day-${day}.html"]`);
  if (!link) continue;
  const wrapper = document.createElement('div');
  wrapper.className = 'nav-day';
  link.before(wrapper);
  wrapper.append(link);
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'nav-day-caret';
  toggle.textContent = '▾';
  toggle.setAttribute('aria-label', link.textContent + ' 일정 분류');
  toggle.setAttribute('aria-expanded', 'false');
  wrapper.append(toggle);
  const menu = document.createElement('div');
  menu.className = 'day-pop';
  menu.id = 'day-pop-' + day;
  toggle.setAttribute('aria-controls', menu.id);

  const all = document.createElement('a');
  all.className = 'day-pop-all';
  all.href = link.href;
  all.textContent = '전체 일정';
  menu.append(all);
  for (const [kind, count] of Object.entries(counts)) {
    if (!count) continue;
    const [label, color] = placeKinds[kind];
    const row = document.createElement('a');
    row.className = 'day-pop-row';
    row.href = link.href + '?kind=' + kind + '#detailed-slots';
    row.style.setProperty('--kc', color);
    const text = document.createElement('span');
    text.textContent = label;
    const number = document.createElement('b');
    number.textContent = String(count);
    row.append(text, number);
    menu.append(row);
  }
  document.body.append(menu);
  const entry = { wrapper, toggle, menu };
  entries.push(entry);
  wrapper.addEventListener('pointerenter', (event) => {
    if (event.pointerType !== 'mouse') return;
    clearTimeout(hideTimer);
    openMenu(entry);
  });
  const delayedClose = () => { hideTimer = setTimeout(closeMenus, 130); };
  wrapper.addEventListener('mouseleave', delayedClose);
  menu.addEventListener('mouseenter', () => clearTimeout(hideTimer));
  menu.addEventListener('mouseleave', delayedClose);
  toggle.addEventListener('click', () => {
    if (menu.classList.contains('show')) closeMenus();
    else openMenu(entry);
  });
  toggle.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowDown') return;
    event.preventDefault();
    openMenu(entry);
    all.focus();
  });
}
document.addEventListener('click', (event) => {
  if (!event.target.closest('.nav-day, .day-pop')) closeMenus();
});
document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  const entry = entries.find(({ menu }) => menu.classList.contains('show'));
  if (!entry) return;
  closeMenus();
  entry.toggle.focus();
});
window.addEventListener('resize', closeMenus);
window.addEventListener('scroll', closeMenus, true);
