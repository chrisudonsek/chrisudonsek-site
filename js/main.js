/* ============================================
   CHRIS UDONSEK — chrisudonsek.com
   Main JS: interactions, state, share
   ============================================ */

// ── HERO ANIMATION ──────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  // Trigger the underline after a short delay
  const nameEl = document.getElementById('heroName');
  const cursor = document.getElementById('cursor');

  setTimeout(() => {
    if (nameEl) nameEl.classList.add('animate');
  }, 300);

  // Fade cursor out after animation completes
  setTimeout(() => {
    if (cursor) cursor.classList.add('hidden');
  }, 2400);
});

// ── LOCAL STATE (localStorage for persistence) ──────────────────
function getState() {
  try {
    const raw = localStorage.getItem('cu_interactions');
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function setState(state) {
  try { localStorage.setItem('cu_interactions', JSON.stringify(state)); } catch {}
}

// ── VOTE (API-backed, shared across all visitors) ───────────────
const API_BASE = 'https://chrisudonsek-admin.orgbytetech.workers.dev';

async function vote(postId, btn) {
  const state = getState();
  const key = `vote_${postId}`;
  const countEl = btn.querySelector('.vote-count');
  const current = parseInt(countEl.textContent, 10);
  const isVoted = state[key];

  // Optimistic UI update
  if (isVoted) {
    state[key] = false;
    countEl.textContent = current - 1;
    btn.classList.remove('voted');
    btn.title = 'Upvote';
  } else {
    state[key] = true;
    countEl.textContent = current + 1;
    btn.classList.add('voted');
    btn.title = 'Remove upvote';
  }
  setState(state);

  // Sync to server
  try {
    const res = await fetch(`${API_BASE}/api/posts/${postId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: isVoted ? 'down' : 'up' })
    });
    const data = await res.json();
    if (data.votes !== undefined) countEl.textContent = data.votes;
  } catch (e) { /* keep optimistic value */ }
}

// ── LIKE (API-backed, shared across all visitors) ────────────────
async function like(postId, btn) {
  const state = getState();
  const key = `like_${postId}`;
  const countEl = btn.querySelector('.like-count');
  const current = parseInt(countEl.textContent, 10);

  const isLiked = state[key];

  if (isLiked) {
    state[key] = false;
    countEl.textContent = current - 1;
    btn.classList.remove('liked');
    btn.title = 'Like';
  } else {
    state[key] = true;
    countEl.textContent = current + 1;
    btn.classList.add('liked');
    btn.title = 'Unlike';
  }
  setState(state);

  // Sync to server
  try {
    const res = await fetch(`${API_BASE}/api/posts/${postId}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: isLiked ? 'down' : 'up' })
    });
    const data = await res.json();
    if (data.likes !== undefined) countEl.textContent = data.likes;
  } catch (e) { /* keep optimistic value */ }
}

// ── RESTORE STATE ON LOAD ────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  const state = getState();

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
});

// ── FILTER POSTS ─────────────────────────────────────────────────
function filterPosts(type, btn) {
  // Update active button
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  // Show/hide posts
  document.querySelectorAll('.post-card').forEach(card => {
    if (type === 'all' || card.dataset.type === type) {
      card.classList.remove('hidden');
    } else {
      card.classList.add('hidden');
    }
  });
}

// ── SHARE MODAL ──────────────────────────────────────────────────
let currentShareId = null;
let currentShareTitle = '';
let currentShareUrl = '';

function sharePost(postId, title) {
  currentShareId = postId;
  currentShareTitle = title;
  currentShareUrl = `${window.location.origin}/post.html?id=${postId}`;

  const modal = document.getElementById('shareModal');
  const overlay = document.getElementById('shareOverlay');
  const titleEl = document.getElementById('shareModalTitle');

  titleEl.textContent = title;
  modal.classList.add('open');
  overlay.classList.add('open');
  document.getElementById('copyBtnText').textContent = 'Copy link';

  // Try native share on mobile first
  if (navigator.share && window.innerWidth < 640) {
    navigator.share({ title, url: currentShareUrl }).catch(() => {
      // Fallback to modal if share is dismissed
    });
    return;
  }
}

function closeShareModal() {
  document.getElementById('shareModal').classList.remove('open');
  document.getElementById('shareOverlay').classList.remove('open');
}

function shareToX() {
  const text = `"${currentShareTitle}" by @chrisudonsek`;
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(currentShareUrl)}`;
  window.open(url, '_blank', 'noopener');
  closeShareModal();
}

function shareToLinkedIn() {
  const text = `"${currentShareTitle}" by Chris Udonsek`;
  const url = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(text + '\n\n' + currentShareUrl)}`;
  window.open(url, '_blank', 'noopener');
  closeShareModal();
}

function copyLink() {
  navigator.clipboard.writeText(currentShareUrl).then(() => {
    const btn = document.getElementById('copyBtnText');
    btn.textContent = 'Copied!';
    setTimeout(() => { btn.textContent = 'Copy link'; }, 2000);
  }).catch(() => {
    // Fallback for older browsers
    const ta = document.createElement('textarea');
    ta.value = currentShareUrl;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    const btn = document.getElementById('copyBtnText');
    btn.textContent = 'Copied!';
    setTimeout(() => { btn.textContent = 'Copy link'; }, 2000);
  });
}

// Close modal on Escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeShareModal();
});

// ── MOBILE MENU ───────────────────────────────────────────────────
function toggleMenu() {
  const nav = document.getElementById('mobileNav');
  nav.classList.toggle('open');
}

// Close mobile menu on scroll
window.addEventListener('scroll', () => {
  const nav = document.getElementById('mobileNav');
  if (nav.classList.contains('open')) nav.classList.remove('open');
}, { passive: true });

// ── THEME TOGGLE ─────────────────────────────────────────────────
function toggleTheme() {
  const isNight = document.documentElement.classList.toggle('night');
  try { localStorage.setItem('cu_theme', isNight ? 'night' : 'dark'); } catch {}
}

// Restore theme on load
(function () {
  try {
    if (localStorage.getItem('cu_theme') === 'night') {
      document.documentElement.classList.add('night');
    }
  } catch {}
})();

// ── REDDIT SHARE ─────────────────────────────────────────────────
function shareToReddit() {
  const url = `https://www.reddit.com/submit?url=${encodeURIComponent(currentShareUrl)}&title=${encodeURIComponent(currentShareTitle)}`;
  window.open(url, '_blank', 'noopener');
  closeShareModal();
}

// ── READ MORE TOGGLE ─────────────────────────────────────────────
function toggleReadMore(postId) {
  const expanded = document.getElementById(`expanded-${postId}`);
  const btn = document.getElementById(`readmore-${postId}`);
  const textEl = btn.querySelector('.read-more-text');

  const isOpen = !expanded.classList.contains('hidden');

  if (isOpen) {
    expanded.classList.add('hidden');
    btn.classList.remove('expanded');
    textEl.textContent = 'Read more';
  } else {
    expanded.classList.remove('hidden');
    btn.classList.add('expanded');
    textEl.textContent = 'Show less';
  }
}

// ── CONTACT FORM ─────────────────────────────────────────────────
// Using Formspree — sign up at formspree.io and replace YOUR_FORM_ID
async function submitForm(e) {
  e.preventDefault();
  const btn = document.getElementById('submitBtn');
  const btnText = document.getElementById('submitText');
  const success = document.getElementById('formSuccess');
  const error = document.getElementById('formError');

  btn.disabled = true;
  btnText.textContent = 'Sending...';
  success.classList.add('hidden');
  error.classList.add('hidden');

  const form = document.getElementById('contactForm');
  const data = {
    name: form.name.value,
    email: form.email.value,
    subject: form.subject.value,
    message: form.message.value,
    _replyto: form.email.value,
    _subject: `[chrisudonsek.com] ${form.subject.value}`
  };

  try {
    // Replace YOUR_FORM_ID below with your Formspree form ID
    const res = await fetch('https://formspree.io/f/mvznbbdp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(data)
    });

    if (res.ok) {
      success.classList.remove('hidden');
      form.reset();
    } else {
      throw new Error('Failed');
    }
  } catch {
    error.classList.remove('hidden');
  } finally {
    btn.disabled = false;
    btnText.textContent = 'Send message';
  }
}

// ── LOAD REAL COUNTS FROM API ────────────────────────────────────
async function loadCounts() {
  try {
    const res = await fetch(`${API_BASE}/api/posts`);
    const data = await res.json();
    if (!data.posts) return;

    Object.values(data.posts).forEach(post => {
      // Update vote counts on page
      const cards = document.querySelectorAll(`[data-id="${post.id}"]`);
      cards.forEach(card => {
        const voteEl = card.querySelector('.vote-count');
        const likeEl = card.querySelector('.like-count');
        if (voteEl) voteEl.textContent = post.votes || 0;
        if (likeEl) likeEl.textContent = post.likes || 0;
      });
    });
  } catch (e) { /* use static counts as fallback */ }
}

window.addEventListener('DOMContentLoaded', () => {
  loadCounts();
});
