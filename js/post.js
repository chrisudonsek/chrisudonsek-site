// ============================================
// POST PAGE JS — post.js
// Loads post data from posts-data.js
// Fetches live counts from API
// ============================================

const POST_API = 'https://chrisudonsek-admin.orgbytetech.workers.dev';

(function () {
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get('id'), 10);
  const post = POSTS[id];

  if (!post) {
    document.getElementById('postPageTitle').textContent = 'Post not found';
    document.getElementById('postBody').innerHTML = '<p>This post doesn\'t exist. <a href="/">Go back home.</a></p>';
    return;
  }

  // Update page meta
  document.getElementById('pageTitle').textContent = `${post.title} | Chris Udonsek`;
  document.getElementById('metaDesc').content = post.body.replace(/<[^>]+>/g, '').substring(0, 160);
  document.getElementById('ogUrl').content = `https://chrisudonsek.com/post.html?id=${id}`;

  // Post header
  const typeEl = document.getElementById('postTypeLabel');
  const typeMap = {
    essay: { label: 'Essay', cls: 'post-type--essay' },
    linkedin: { label: 'LinkedIn', cls: 'post-type--linkedin' },
    x: { label: 'X Thread', cls: 'post-type--x' }
  };
  const typeInfo = typeMap[post.type] || { label: post.type, cls: '' };
  typeEl.textContent = typeInfo.label;
  typeEl.className = `post-type ${typeInfo.cls}`;

  document.getElementById('postDate').textContent = post.date;
  if (post.readTime) {
    document.getElementById('postReadTime').textContent = post.readTime;
  }

  document.getElementById('postPageTitle').textContent = post.title;
  document.getElementById('postBody').innerHTML = post.body;

  // Show static counts first (instant)
  document.getElementById('postVoteCount').textContent = post.votes || 0;
  document.getElementById('postLikeCount').textContent = post.likes || 0;

  // Then fetch live counts from API and update
  fetch(`${POST_API}/api/posts/${id}`)
    .then(r => r.json())
    .then(data => {
      if (data.post) {
        document.getElementById('postVoteCount').textContent = data.post.votes || 0;
        document.getElementById('postLikeCount').textContent = data.post.likes || 0;
      }
    })
    .catch(() => {}); // keep static counts on error

  // Restore interaction state
  const state = (() => {
    try { return JSON.parse(localStorage.getItem('cu_interactions') || '{}'); } catch { return {}; }
  })();

  const voteBtn = document.getElementById('postVoteBtn');
  const likeBtn = document.getElementById('postLikeBtn');

  if (state[`vote_${id}`]) voteBtn.classList.add('voted');
  if (state[`like_${id}`]) likeBtn.classList.add('liked');

  // Wire up vote/like on post page
  voteBtn.addEventListener('click', () => vote(id, voteBtn));
  likeBtn.addEventListener('click', () => like(id, likeBtn));

  // Share button
  document.getElementById('postShareBtn').addEventListener('click', () => {
    sharePost(id, post.title);
  });

  // Source link for mirrored content
  if (post.sourceUrl) {
    const block = document.getElementById('sourceLinkBlock');
    const link = document.getElementById('sourceLink');
    block.style.display = 'flex';
    link.href = post.sourceUrl;
    link.textContent = `View original on ${post.sourcePlatform} ↗`;
  }
})();
