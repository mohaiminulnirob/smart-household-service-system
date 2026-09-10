const EMPTY_ICONS = {
  request: '📋',
  worker: '👷',
  rating: '⭐',
  'pending-worker': '🕐',
  'admin-request': '📄',
  summary: '📊',
};

const EMPTY_TITLES = {
  request: 'No Requests Yet',
  worker: 'No Workers Found',
  rating: 'No Ratings Yet',
  'pending-worker': 'No Pending Workers',
  'admin-request': 'No Work Requests',
  summary: 'No Data',
};

const EMPTY_SUBTITLES = {
  request: 'Your service requests will appear here once you create one.',
  worker: 'No workers match your search. Try a different category.',
  rating: 'Ratings from users will show up after you complete jobs.',
  'pending-worker': 'All worker registrations have been reviewed.',
  'admin-request': 'No service requests have been submitted yet.',
  summary: '',
};

export function emptyState(variant = 'request', subtitle) {
  const div = document.createElement('div');
  div.className = 'empty-state';
  div.innerHTML = `
    <div class="empty-state-icon">${EMPTY_ICONS[variant] || '📭'}</div>
    <h3 class="empty-state-title">${EMPTY_TITLES[variant] || 'Nothing Here'}</h3>
    <p class="empty-state-text">${subtitle || EMPTY_SUBTITLES[variant] || ''}</p>
  `;
  return div;
}

export function skeletonCard(variant = 'request', count = 3) {
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < count; i++) {
    fragment.appendChild(buildCard(variant));
  }
  return fragment;
}

function buildCard(variant) {
  const card = document.createElement('div');
  card.className = 'card skeleton-card';
  card.style.padding = '14px';
  card.style.marginBottom = '14px';

  if (variant === 'summary') {
    card.innerHTML = `
      <div class="skeleton-line skeleton-title" style="width:70%"></div>
      <div class="skeleton-line skeleton-text" style="width:40%;margin-top:8px"></div>
    `;
    return card;
  }

  if (variant === 'rating') {
    card.innerHTML = `
      <div class="skeleton-line skeleton-title" style="width:50%"></div>
      <div class="skeleton-line skeleton-text" style="width:30%;margin-top:6px"></div>
      <div class="skeleton-line skeleton-text" style="width:20%;margin-top:4px"></div>
    `;
    return card;
  }

  if (variant === 'worker') {
    card.innerHTML = `
      <div class="skeleton-line skeleton-title" style="width:55%"></div>
      <div class="skeleton-line skeleton-text" style="width:35%;margin-top:8px"></div>
      <div class="skeleton-line skeleton-text skeleton-text-sm" style="width:25%;margin-top:4px"></div>
    `;
    return card;
  }

  if (variant === 'pending-worker') {
    card.innerHTML = `
      <div class="skeleton-line skeleton-title" style="width:60%"></div>
      <div class="skeleton-line skeleton-text" style="width:45%;margin-top:8px"></div>
      <div class="skeleton-line skeleton-text" style="width:30%;margin-top:4px"></div>
      <div class="skeleton-line skeleton-button" style="width:120px;margin-top:10px"></div>
    `;
    return card;
  }

  if (variant === 'admin-request') {
    card.innerHTML = `
      <div class="skeleton-line skeleton-title" style="width:50%"></div>
      <div class="skeleton-line skeleton-text" style="width:65%;margin-top:8px"></div>
      <div class="skeleton-line skeleton-text" style="width:80%;margin-top:4px"></div>
      <div class="skeleton-line skeleton-text" style="width:40%;margin-top:4px"></div>
      <div class="skeleton-line skeleton-text-sm" style="width:30%;margin-top:4px"></div>
    `;
    return card;
  }

  // default: request card
  card.style.display = 'flex';
  card.style.justifyContent = 'space-between';
  card.style.gap = '14px';
  card.innerHTML = `
    <div style="flex:1">
      <div class="skeleton-line skeleton-title" style="width:50%"></div>
      <div class="skeleton-line skeleton-text" style="width:85%;margin-top:10px"></div>
      <div class="skeleton-line skeleton-text" style="width:60%;margin-top:6px"></div>
      <div class="skeleton-line skeleton-text" style="width:45%;margin-top:6px"></div>
      <div class="skeleton-line skeleton-text-sm" style="width:30%;margin-top:6px"></div>
      <div class="skeleton-line skeleton-button" style="width:100px;margin-top:10px"></div>
    </div>
    <div class="skeleton-image-block">
      <div class="skeleton-line" style="width:80px;height:80px;border-radius:8px"></div>
    </div>
  `;

  return card;
}
