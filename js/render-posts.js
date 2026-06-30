// render-posts.js — fetches posts live from the admin Worker API and renders them
const POSTS_API_URL = "https://chrisudonsek-admin.orgbytetech.workers.dev/api/posts";

async function fetchAndRenderPosts() {
  const container = document.getElementById("postsGrid");
  if (!container) return;

  try {
    const res = await fetch(POSTS_API_URL);
    if (!res.ok) throw new Error(`API responded with status ${res.status}`);
    const data = await res.json();

    // data.posts is an object keyed by id — convert to array and sort newest first
    const posts = Object.values(data.posts || {}).sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });

    if (posts.length === 0) return; // keep loading state / fallback if API returns nothing

    container.innerHTML = posts.map(renderPostCard).join("");
  } catch (err) {
    console.error("Failed to fetch posts from admin API:", err);
    // Leave existing loading/fallback markup in place if the fetch fails
  }
}

function renderPostCard(post) {
  return `
    <article class="post-card" data-id="${post.id}" data-type="${post.type || ""}">
      <a href="post.html?id=${post.id}" class="post-card-link">
        <span class="post-type">${post.type || ""}</span>
        <h2 class="post-title">${post.title}</h2>
        <p class="post-excerpt">${post.excerpt || ""}</p>
        <div class="post-meta">
          <span>${post.date || ""}</span>
          ${post.readTime ? `<span>${post.readTime}</span>` : ""}
        </div>
      </a>
    </article>
  `;
}

document.addEventListener("DOMContentLoaded", fetchAndRenderPosts);
