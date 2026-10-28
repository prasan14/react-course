(() => {
  'use strict';

  const STORAGE_KEY = 'reactpath-demo-progress-v1';
  const DEFAULT_PROGRESS = { completed: [1], bookmarked: false };

  function readProgress() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (!parsed || !Array.isArray(parsed.completed)) return { ...DEFAULT_PROGRESS, completed: [...DEFAULT_PROGRESS.completed] };
      return { completed: [...new Set(parsed.completed.map(Number).filter(n => Number.isInteger(n) && n > 0))], bookmarked: Boolean(parsed.bookmarked) };
    } catch (error) {
      return { ...DEFAULT_PROGRESS, completed: [...DEFAULT_PROGRESS.completed] };
    }
  }

  function saveProgress(progress) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); } catch (error) { /* The demo still works for the current page if storage is blocked. */ }
  }

  function toast(message, isError = false) {
    const oldToast = document.querySelector('.toast');
    if (oldToast) oldToast.remove();
    const notice = document.createElement('div');
    notice.className = `toast${isError ? ' toast-error' : ''}`;
    notice.setAttribute('role', 'status');
    notice.textContent = message;
    document.body.appendChild(notice);
    window.setTimeout(() => notice.remove(), 3000);
  }

  function updateProgressUI(progress) {
    const completedCount = progress.completed.length;
    const percentage = Math.min(100, Math.round((completedCount / 18) * 100));
    ['overall-progress', 'lesson-percent'].forEach(id => {
      const element = document.getElementById(id);
      if (element) element.textContent = `${percentage}%`;
    });
    ['overall-progress-bar', 'course-progress-bar', 'sidebar-progress-bar'].forEach(id => {
      const element = document.getElementById(id);
      if (element) element.style.width = `${percentage}%`;
    });
    const text = document.getElementById('course-progress-text');
    if (text) text.textContent = `${completedCount} of 18 lessons`;
    const completeCount = document.getElementById('lesson-complete-count');
    if (completeCount) completeCount.textContent = `${completedCount} of 18 lessons complete`;
    const sidebarLabel = document.getElementById('sidebar-progress-label');
    if (sidebarLabel) sidebarLabel.textContent = `${percentage}% complete`;
    const ring = document.getElementById('lesson-ring');
    if (ring) ring.style.strokeDashoffset = `${113.1 - (113.1 * percentage / 100)}`;
    const completeButton = document.getElementById('complete-lesson');
    if (completeButton) {
      const completed = progress.completed.includes(2);
      completeButton.innerHTML = completed
        ? 'Lesson completed <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>'
        : 'Mark as complete <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>';
      completeButton.classList.toggle('button-complete', completed);
    }
    document.querySelectorAll('[data-lesson]').forEach(item => {
      const number = Number(item.dataset.lesson);
      const state = item.querySelector('.lesson-nav-state');
      if (!state) return;
      if (progress.completed.includes(number)) {
        state.classList.add('done');
        state.textContent = '✓';
      } else {
        state.classList.remove('done');
        state.textContent = String(number);
      }
    });
    const bookmark = document.getElementById('bookmark-button');
    if (bookmark) {
      bookmark.setAttribute('aria-pressed', String(progress.bookmarked));
      const label = bookmark.querySelector('span');
      if (label) label.textContent = progress.bookmarked ? 'Saved' : 'Save lesson';
    }
  }

  function initDate() {
    const dateEl = document.getElementById('current-date');
    if (!dateEl) return;
    const now = new Date();
    dateEl.textContent = new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'short', day: 'numeric' }).format(now);
  }

  function initMobileNavigation() {
    const button = document.querySelector('.mobile-menu-button');
    const nav = document.getElementById('primary-nav');
    if (!button || !nav) return;
    button.addEventListener('click', () => {
      const open = button.getAttribute('aria-expanded') !== 'true';
      button.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
    });
    nav.addEventListener('click', event => {
      if (event.target.closest('a')) {
        button.setAttribute('aria-expanded', 'false');
        nav.classList.remove('is-open');
      }
    });
  }

  function initCourseFilters() {
    const searchInput = document.getElementById('course-search');
    const cards = [...document.querySelectorAll('.library-card')];
    if (!searchInput || !cards.length) return;
    const filterButtons = [...document.querySelectorAll('[data-filter]')];
    const emptyState = document.getElementById('empty-state');
    let selectedFilter = 'all';

    function filter() {
      const query = searchInput.value.trim().toLowerCase();
      let visible = 0;
      cards.forEach(card => {
        const category = card.dataset.category || '';
        const searchable = `${card.dataset.search || ''} ${card.textContent}`.toLowerCase();
        const matches = (selectedFilter === 'all' || category === selectedFilter) && searchable.includes(query);
        card.hidden = !matches;
        if (matches) visible += 1;
      });
      if (emptyState) emptyState.hidden = visible > 0;
    }
    searchInput.addEventListener('input', filter);
    filterButtons.forEach(button => button.addEventListener('click', () => {
      selectedFilter = button.dataset.filter || 'all';
      filterButtons.forEach(item => {
        const active = item === button;
        item.classList.toggle('active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      filter();
    }));
    const clear = document.getElementById('clear-search');
    if (clear) clear.addEventListener('click', () => {
      searchInput.value = '';
      selectedFilter = 'all';
      filterButtons.forEach(item => {
        const active = item.dataset.filter === 'all';
        item.classList.toggle('active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      filter();
      searchInput.focus();
    });
    // Lightweight keyboard shortcut for quick discovery.
    document.addEventListener('keydown', event => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchInput.focus();
      }
    });
  }

  function initLessonActions(progress) {
    const completeButton = document.getElementById('complete-lesson');
    if (completeButton) completeButton.addEventListener('click', () => {
      const index = progress.completed.indexOf(2);
      if (index >= 0) {
        progress.completed.splice(index, 1);
        toast('Lesson marked as incomplete.');
      } else {
        progress.completed.push(2);
        toast('Nice work! Your progress has been saved.');
      }
      saveProgress(progress);
      updateProgressUI(progress);
    });

    const bookmarkButton = document.getElementById('bookmark-button');
    if (bookmarkButton) bookmarkButton.addEventListener('click', () => {
      progress.bookmarked = !progress.bookmarked;
      saveProgress(progress);
      updateProgressUI(progress);
      toast(progress.bookmarked ? 'Lesson saved to your bookmarks.' : 'Lesson removed from bookmarks.');
    });

    document.querySelectorAll('.quiz-option').forEach(option => option.addEventListener('click', () => {
      const options = [...document.querySelectorAll('.quiz-option')];
      options.forEach(item => {
        item.classList.remove('correct', 'incorrect');
        item.disabled = true;
      });
      const correct = option.dataset.answer === 'correct';
      option.classList.add(correct ? 'correct' : 'incorrect');
      const feedback = document.getElementById('quiz-feedback');
      if (feedback) {
        feedback.textContent = correct ? 'Correct! Components render reusable pieces of your interface.' : 'Not quite. A component is a reusable piece of UI—try reviewing the section above.';
        feedback.style.color = correct ? '#2a9473' : '#c76c63';
      }
      if (!correct) {
        const answer = options.find(item => item.dataset.answer === 'correct');
        if (answer) answer.classList.add('correct');
      }
    }));

    document.querySelectorAll('[data-copy]').forEach(button => button.addEventListener('click', async () => {
      const text = button.dataset.copy || '';
      try {
        await navigator.clipboard.writeText(text);
        button.textContent = 'Copied!';
        toast('Code copied to clipboard.');
      } catch (error) {
        const field = document.createElement('textarea');
        field.value = text;
        field.setAttribute('readonly', '');
        field.style.position = 'fixed'; field.style.opacity = '0';
        document.body.appendChild(field); field.select();
        const copied = document.execCommand('copy');
        field.remove();
        button.textContent = copied ? 'Copied!' : 'Select code';
        toast(copied ? 'Code copied to clipboard.' : 'Clipboard access was blocked.', !copied);
      }
      window.setTimeout(() => { button.textContent = 'Copy code'; }, 1800);
    }));

    const collapseButton = document.querySelector('.sidebar-collapse');
    const sidebar = document.querySelector('.lesson-sidebar');
    if (collapseButton && sidebar) collapseButton.addEventListener('click', () => {
      const collapsed = !sidebar.classList.contains('collapsed');
      sidebar.classList.toggle('collapsed', collapsed);
      collapseButton.setAttribute('aria-expanded', String(!collapsed));
      collapseButton.textContent = collapsed ? '+' : '−';
    });

    document.querySelectorAll('[data-lesson]').forEach(item => item.addEventListener('click', event => {
      const number = Number(item.dataset.lesson);
      if (number > 2 && !progress.completed.includes(number - 1)) {
        // This static demo permits navigation, but gently indicates that the remaining content is illustrative.
        if (number === 3) toast('Demo lesson selected. Continue exploring the example content below.');
      }
      document.querySelectorAll('[data-lesson]').forEach(link => link.classList.toggle('is-current', link === item));
    }));

    document.querySelectorAll('[data-toast]').forEach(button => button.addEventListener('click', () => toast(button.dataset.toast || 'Done.')));
  }

  document.addEventListener('DOMContentLoaded', () => {
    const progress = readProgress();
    initDate();
    initMobileNavigation();
    initCourseFilters();
    initLessonActions(progress);
    updateProgressUI(progress);
  });
})();
