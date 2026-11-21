'use strict';

const storageKey = 'travel-beijing:prep:2026-12';
const checkboxes = [...document.querySelectorAll('[data-check]')];
const prepSummary = document.querySelector('[data-prep-summary]');
const completedCount = document.querySelector('#prep-count');
const progress = document.querySelector('#prep-progress');
let completed = new Set();

try {
  const stored = JSON.parse(localStorage.getItem(storageKey) || '[]');
  if (Array.isArray(stored)) completed = new Set(stored);
} catch {
  // The checklist remains usable when storage is unavailable.
}

if (prepSummary) prepSummary.textContent = completed.size ? `${completed.size}개 완료 · 체크리스트 열기` : '체크리스트 열기';
if (checkboxes.length) {
  function updateProgress() {
    const count = checkboxes.filter((item) => item.checked).length;
    completedCount.textContent = `${count} / ${checkboxes.length} 완료`;
    progress.max = checkboxes.length;
    progress.value = count;
  }
  for (const item of checkboxes) {
    item.checked = completed.has(item.dataset.check);
    item.addEventListener('change', () => {
      if (item.checked) completed.add(item.dataset.check);
      else completed.delete(item.dataset.check);
      try {
        localStorage.setItem(storageKey, JSON.stringify([...completed]));
      } catch {
        // Progress remains visible for the current visit.
      }
      updateProgress();
    });
  }
  updateProgress();
}

const dates = [...document.querySelectorAll('[data-plan-link]')];
const panels = [...document.querySelectorAll('[data-plan-day]')];
if (dates.length) {
  function showDate() {
    const requested = location.hash.match(/^#plan-(\d+)$/)?.[1];
    const active = dates.some((date) => date.dataset.planLink === requested) ? requested : dates[0].dataset.planLink;
    for (const date of dates) {
      if (date.dataset.planLink === active) date.setAttribute('aria-current', 'date');
      else date.removeAttribute('aria-current');
    }
    for (const panel of panels) panel.hidden = panel.dataset.planDay !== active;
  }
  for (const date of dates) {
    date.addEventListener('click', (event) => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      const hash = date.getAttribute('href');
      if (location.hash !== hash) history.pushState(null, '', hash);
      showDate();
    });
  }
  window.addEventListener('hashchange', showDate);
  window.addEventListener('popstate', showDate);
  showDate();
}
