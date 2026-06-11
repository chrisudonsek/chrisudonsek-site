# chrisudonsek.com

Personal blog and writing hub — mirrors LinkedIn and X content, plus original essays.

Built as a static site for deployment on **Cloudflare Pages** with the custom domain `chrisudonsek.com`.

---

## Project Structure

```
chrisudonsek/
├── index.html          — Homepage (writing list + about)
├── post.html           — Individual post template
├── css/
│   ├── style.css       — Main styles (shared across pages)
│   └── post.css        — Post page styles
├── js/
│   ├── main.js         — Interactions: vote, like, share, filter, mobile nav
│   ├── posts-data.js   — All post content (add new posts here)
│   └── post.js         — Post page logic
└── README.md
```

---

## Adding a New Post

1. Open `js/posts-data.js`
2. Add a new entry to the `POSTS` object:

```javascript
7: {
  id: 7,
  type: 'essay',           // 'essay' | 'linkedin' | 'x'
  date: 'Jun 15, 2026',
  readTime: '5 min read',  // null for social posts
  title: "Your Post Title Here",
  votes: 0,
  likes: 0,
  sourceUrl: null,         // LinkedIn/X URL for mirrored posts, null for essays
  sourcePlatform: null,    // 'LinkedIn' | 'X (Twitter)' | null
  body: `<p>Your HTML content here.</p>`
}
```

3. Add a matching card in `index.html` inside `<div class="posts-grid">` — copy an existing card and update the `data-id`, title, excerpt, type, date, and counts.

---

## Deploying to Cloudflare Pages

### First Deploy

1. Push this folder to a GitHub repository (e.g. `chrisudonsek-site`)
2. Go to [Cloudflare Pages](https://pages.cloudflare.com/)
3. Click **Create a project → Connect to Git**
4. Select your repository
5. Build settings:
   - **Framework preset:** None
   - **Build command:** *(leave empty)*
   - **Build output directory:** `/` (root)
6. Click **Save and Deploy**

### Custom Domain

1. In Cloudflare Pages → your project → **Custom domains**
2. Add `chrisudonsek.com`
3. Since your domain is already on Cloudflare, the DNS record is added automatically
4. Also add `www.chrisudonsek.com` → redirect to apex

### Subsequent Deploys

Push to your GitHub `main` branch. Cloudflare Pages deploys automatically.

---

## Future Upgrades

- **CMS:** Connect Sanity.io or Contentful — add posts without touching code
- **Comments:** Giscus (GitHub Discussions-based)
- **Newsletter:** Resend-powered subscription form
- **Analytics:** Cloudflare Web Analytics (privacy-first, free)
- **RSS feed:** `/feed.xml` for subscribers
