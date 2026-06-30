
// ============================================
// DYNAMIC POSTS RENDERING — loads from live API
// Replaces static homepage cards with live data
// ============================================

const POSTS_API_BASE = 'https://chrisudonsek-admin.orgbytetech.workers.dev';
let allPostsCache = {};

async function loadAndRenderPosts() {
  const grid = document.getElementById('postsGrid');
  try {
    const res = await fetch(`${POSTS_API_BASE}/api/posts`);
    const data = await res.json();

    if (!data.posts || Object.keys(data.posts).length === 0) {
      grid.innerHTML = '<div class="posts-error">No posts published yet.</div>';
      return;
    }

    allPostsCache = data.posts;

    // Sort newest first by id (timestamp-based ids sort correctly; legacy 1-6 ids too)
    const sorted = Object.values(data.posts).sort((a, b) => b.id - a.id);

    grid.innerHTML = sorted.map(p => renderPostCard(p)).join('');

    // Restore vote/like button states from localStorage
    restoreInteractionState();

  } catch (e) {
    grid.innerHTML = '<div class="posts-error">Could not load posts. Please refresh.</div>';
    console.error('Failed to load posts:', e);
  }
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function getTypeMeta(type) {
  const map = {
    essay: { label: 'Essay', cls: 'post-type--essay', icon: '' },
    linkedin: {
      label: 'LinkedIn',
      cls: 'post-type--linkedin',
      icon: '<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>'
    },
    x: {
      label: 'X Thread',
      cls: 'post-type--x',
      icon: '<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>'
    }
  };
  return map[type] || map.essay;
}

function renderPostCard(p) {
  const typeMeta = getTypeMeta(p.type);
  const safeTitle = escapeHtml(p.title);
  const safeExcerpt = escapeHtml(p.excerpt || '');
  const shareTitle = safeTitle.replace(/'/g, "\\'");

  const footerRight = p.sourceUrl
    ? `<a href="${escapeHtml(p.sourceUrl)}" target="_blank" rel="noopener" class="original-link">View on ${p.type === 'linkedin' ? 'LinkedIn' : 'X'} ↗</a>`
    : (p.readTime ? `<span class="read-time">${escapeHtml(p.readTime)}</span>` : '');

  return `
    <article class="post-card" data-type="${p.type}" data-id="${p.id}" onclick="if(!event.target.closest('button,a'))window.location='post.html?id=${p.id}'" style="cursor:pointer;">
      <div class="post-meta">
        <span class="post-type ${typeMeta.cls}">${typeMeta.icon}${typeMeta.label}</span>
        <time class="post-date">${escapeHtml(p.date)}</time>
      </div>
      <h2 class="post-title">
        <a href="post.html?id=${p.id}">${safeTitle}</a>
      </h2>
      <p class="post-excerpt">${safeExcerpt}</p>
      <div class="post-footer">
        <div class="post-actions">
          <button class="action-btn vote-btn" onclick="vote(${p.id}, this)" title="Upvote">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
            <span class="vote-count">${p.votes || 0}</span>
          </button>
          <button class="action-btn like-btn" onclick="like(${p.id}, this)" title="Like">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            <span class="like-count">${p.likes || 0}</span>
          </button>
          <button class="action-btn share-btn" onclick="sharePost(${p.id}, '${shareTitle}')" title="Share">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            Share
          </button>
        </div>
        ${footerRight}
      </div>
    </article>
  `;
}

function restoreInteractionState() {
  const state = (() => {
    try { return JSON.parse(localStorage.getItem('cu_interactions') || '{}'); } catch { return {}; }
  })();

  document.querySelectorAll('.vote-btn').forEach(btn => {
    const card = btn.closest('.post-card');
    if (!card) return;
    const id = card.dataset.id;
    if (state[`vote_${id}`]) btn.classList.add('voted');
  });

  document.querySelectorAll('.like-btn').forEach(btn => {
    const card = btn.closest('.post-card');
    if (!card) return;
    const id = card.dataset.id;
    if (state[`like_${id}`]) btn.classList.add('liked');
  });
}

// Re-apply filter after dynamic render
function filterPosts(type, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  document.querySelectorAll('.post-card').forEach(card => {
    if (type === 'all' || card.dataset.type === type) {
      card.classList.remove('hidden');
    } else {
      card.classList.add('hidden');
    }
  });
}

window.addEventListener('DOMContentLoaded', () => {
  loadAndRenderPosts();
});
