const viewer = {
  id: "mira",
  name: "Mira Chen",
  follows: ["noah", "lina", "sana", "omar"],
  preferences: {
    privacy: 0.96,
    design: 0.78,
    climate: 0.72,
    local: 0.58,
    music: 0.42,
    sports: 0.18,
  },
};

const users = {
  noah: { name: "Noah Patel", handle: "@noahbuilds", role: "Open-source maintainer" },
  lina: { name: "Lina Okafor", handle: "@linaframes", role: "Visual designer" },
  sana: { name: "Sana Ruiz", handle: "@sanaenergy", role: "Climate analyst" },
  omar: { name: "Omar Kline", handle: "@omarcity", role: "Civic technologist" },
  mae: { name: "Mae Tan", handle: "@maesounds", role: "Independent musician" },
  theo: { name: "Theo Brooks", handle: "@theoboxscore", role: "Sports writer" },
  anya: { name: "Anya Volkov", handle: "@anyaverifies", role: "Security researcher" },
};

const posts = [
  {
    id: "p1",
    authorId: "anya",
    hoursAgo: 2,
    text: "Published a tiny explainer on how reproducible builds make algorithm claims auditable instead of vibes-based.",
    tags: ["privacy", "design"],
    likes: 184,
    replies: 28,
    shares: 44,
  },
  {
    id: "p2",
    authorId: "noah",
    hoursAgo: 5,
    text: "Our moderation dashboard now exports the exact rule versions used for every action. Receipts beat screenshots.",
    tags: ["privacy", "local"],
    likes: 96,
    replies: 18,
    shares: 21,
  },
  {
    id: "p3",
    authorId: "lina",
    hoursAgo: 1,
    text: "Design note: transparency works best when explanations are attached to decisions, not hidden in a policy PDF.",
    tags: ["design", "privacy"],
    likes: 143,
    replies: 12,
    shares: 31,
  },
  {
    id: "p4",
    authorId: "sana",
    hoursAgo: 9,
    text: "Three neighborhood microgrid pilots published live carbon intensity and uptime data this week. Great public-interest telemetry.",
    tags: ["climate", "local"],
    likes: 118,
    replies: 22,
    shares: 39,
  },
  {
    id: "p5",
    authorId: "mae",
    hoursAgo: 3,
    text: "Dropped a sample pack recorded in the old train station. Use it freely, just send me weird remixes.",
    tags: ["music", "local"],
    likes: 214,
    replies: 34,
    shares: 53,
  },
  {
    id: "p6",
    authorId: "omar",
    hoursAgo: 13,
    text: "The city budget simulator is live with a public changelog. Try moving one dollar and watch the tradeoffs update.",
    tags: ["local", "design"],
    likes: 77,
    replies: 16,
    shares: 18,
  },
  {
    id: "p7",
    authorId: "theo",
    hoursAgo: 4,
    text: "Win probability charts are more honest when they show model uncertainty. One confident number can mislead a whole broadcast.",
    tags: ["sports", "design"],
    likes: 260,
    replies: 45,
    shares: 61,
  },
];

const maxEngagement = Math.max(...posts.map((post) => engagement(post)));
const maxHours = Math.max(...posts.map((post) => post.hoursAgo));

const algorithms = {
  balanced: {
    label: "Balanced / recommended",
    short: "Recommended",
    description:
      "A transparent recommendation blend: topic affinity, following graph, engagement, and freshness all contribute visible points.",
    weights: { topic: 0.38, following: 0.24, popularity: 0.22, recency: 0.16 },
  },
  chronological: {
    label: "Chronological",
    short: "Newest first",
    description:
      "Ranks only by recency. Other inputs are still shown for comparison, but their weights are zero.",
    weights: { topic: 0, following: 0, popularity: 0, recency: 1 },
  },
  popularity: {
    label: "Popularity",
    short: "Most discussed",
    description:
      "Ranks by normalized engagement: likes, replies, and shares. Recency and preferences do not affect this mode.",
    weights: { topic: 0, following: 0, popularity: 1, recency: 0 },
  },
  following: {
    label: "Friends / following",
    short: "Following first",
    description:
      "Prioritizes accounts the viewer follows, then uses recency as a tie-breaker.",
    weights: { topic: 0, following: 0.82, popularity: 0, recency: 0.18 },
  },
  topics: {
    label: "Topic affinity",
    short: "Preference match",
    description:
      "Ranks by the viewer's explicit topic preferences, with a small recency tie-breaker.",
    weights: { topic: 0.86, following: 0, popularity: 0, recency: 0.14 },
  },
};

let activeAlgorithm = "balanced";
let selectedPostId = posts[0].id;

function engagement(post) {
  return post.likes + post.replies * 3 + post.shares * 5;
}

function round(value, digits = 3) {
  return Number(value.toFixed(digits));
}

function postInputs(post) {
  const topic = post.tags.reduce((sum, tag) => sum + (viewer.preferences[tag] || 0), 0) / post.tags.length;
  const following = viewer.follows.includes(post.authorId) ? 1 : 0;
  const popularity = engagement(post) / maxEngagement;
  const recency = 1 - (post.hoursAgo - 1) / maxHours;
  return {
    topic: round(topic),
    following,
    popularity: round(popularity),
    recency: round(recency),
  };
}

function scorePost(post, algorithmKey = activeAlgorithm) {
  const algorithm = algorithms[algorithmKey];
  const inputs = postInputs(post);
  const contributions = Object.fromEntries(
    Object.entries(algorithm.weights).map(([key, weight]) => [key, round(inputs[key] * weight)])
  );
  const score = round(Object.values(contributions).reduce((sum, value) => sum + value, 0));
  return { post, inputs, contributions, score };
}

function rankedPosts() {
  return posts
    .map((post) => scorePost(post))
    .sort((a, b) => b.score - a.score || a.post.hoursAgo - b.post.hoursAgo || b.post.likes - a.post.likes);
}

function formatAge(hoursAgo) {
  return hoursAgo === 1 ? "1 hour ago" : `${hoursAgo} hours ago`;
}

function renderAlgorithmButtons() {
  const container = document.querySelector("#algorithmButtons");
  container.innerHTML = "";
  for (const [key, algorithm] of Object.entries(algorithms)) {
    const button = document.createElement("button");
    button.className = "algo-button";
    button.type = "button";
    button.textContent = algorithm.label;
    button.setAttribute("aria-pressed", String(key === activeAlgorithm));
    button.addEventListener("click", () => {
      activeAlgorithm = key;
      selectedPostId = rankedPosts()[0].post.id;
      render();
    });
    container.appendChild(button);
  }
}

function renderViewer() {
  const stats = document.querySelector("#viewerStats");
  stats.innerHTML = `
    <div class="metric"><span>Synthetic follows</span><strong>${viewer.follows.length}</strong></div>
    <div class="metric"><span>Example posts ranked</span><strong>${posts.length}</strong></div>
    <div class="metric"><span>Algorithms available</span><strong>${Object.keys(algorithms).length}</strong></div>
  `;

  const preferences = document.querySelector("#preferenceList");
  preferences.innerHTML = Object.entries(viewer.preferences)
    .sort((a, b) => b[1] - a[1])
    .map(([topic, value]) => `
      <div class="preference">
        <span>#${topic}</span>
        <span class="preference-bar" aria-label="${topic} preference ${Math.round(value * 100)} percent"><span style="width: ${value * 100}%"></span></span>
      </div>
    `)
    .join("");

  const following = document.querySelector("#followingList");
  following.innerHTML = viewer.follows
    .map((id) => `<div class="follow-chip"><span>${users[id].name}</span><strong>${users[id].handle}</strong></div>`)
    .join("");
}

function renderFeed() {
  const ranked = rankedPosts();
  const feed = document.querySelector("#feedList");
  const template = document.querySelector("#postTemplate");
  document.querySelector("#feedTitle").textContent = `${algorithms[activeAlgorithm].short} feed`;
  feed.innerHTML = "";

  ranked.forEach((result, index) => {
    const { post, score, contributions } = result;
    const author = users[post.authorId];
    const node = template.content.firstElementChild.cloneNode(true);
    node.classList.toggle("selected", post.id === selectedPostId);
    node.querySelector(".avatar").textContent = author.name.split(" ").map((part) => part[0]).join("");
    node.querySelector(".post-author").textContent = author.name;
    node.querySelector(".post-meta").textContent = `${author.handle} · ${author.role} · ${formatAge(post.hoursAgo)}`;
    node.querySelector(".rank-badge").textContent = `#${index + 1} · score ${score.toFixed(3)}`;
    node.querySelector(".post-text").textContent = post.text;
    node.querySelector(".tag-row").innerHTML = post.tags.map((tag) => `<span class="tag">#${tag}</span>`).join("");
    node.querySelector(".social-row").innerHTML = `
      <span class="social">${post.likes} likes</span>
      <span class="social">${post.replies} replies</span>
      <span class="social">${post.shares} shares</span>
      <span class="social">engagement ${engagement(post)}</span>
    `;
    node.querySelector(".score-strip").innerHTML = Object.entries(contributions)
      .filter(([, value]) => value > 0)
      .map(([key, value]) => `<span class="score-pill">${key} +${value.toFixed(3)}</span>`)
      .join("") || `<span class="score-pill">score derived from active formula</span>`;
    node.querySelector(".inspect-button").addEventListener("click", () => {
      selectedPostId = post.id;
      render();
      document.querySelector("#debug").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    feed.appendChild(node);
  });
}

function renderFormula() {
  const algorithm = algorithms[activeAlgorithm];
  const formula = Object.entries(algorithm.weights)
    .map(([key, weight]) => `${weight.toFixed(2)}×${key}`)
    .join(" + ");
  document.querySelector("#formulaBox").innerHTML = `
    <p>${algorithm.description}</p>
    <div class="formula">score = ${formula}</div>
    <div class="weight-grid">
      ${Object.entries(algorithm.weights)
        .map(([key, value]) => `<div class="weight"><strong>${key}</strong><br>${value.toFixed(2)} weight</div>`)
        .join("")}
    </div>
    <div class="disclosure">Inputs are normalized from 0 to 1. Following is binary, recency is newest-relative, popularity is weighted engagement divided by the most engaged synthetic post, and topic affinity is the average explicit preference for the post tags.</div>
  `;
}

function renderBreakdown() {
  const selected = scorePost(posts.find((post) => post.id === selectedPostId));
  const { post, inputs, contributions, score } = selected;
  const author = users[post.authorId];
  const rows = Object.keys(algorithms[activeAlgorithm].weights)
    .map((key) => `
      <div class="breakdown-row">
        <span>${key}: input ${inputs[key].toFixed(3)} × weight ${algorithms[activeAlgorithm].weights[key].toFixed(2)}</span>
        <span class="breakdown-value">+${contributions[key].toFixed(3)}</span>
      </div>
    `)
    .join("");

  document.querySelector("#selectedBreakdown").innerHTML = `
    <h3>${author.name}: ${post.tags.map((tag) => `#${tag}`).join(" ")}</h3>
    <p class="muted">Why it appeared: ${plainEnglishReason(selected)}</p>
    ${rows}
    <div class="breakdown-row"><strong>Total score</strong><span class="breakdown-value">${score.toFixed(3)}</span></div>
  `;
}

function plainEnglishReason(result) {
  const { post, inputs, contributions } = result;
  const topSignal = Object.entries(contributions).sort((a, b) => b[1] - a[1])[0][0];
  const follows = inputs.following === 1 ? "you follow this author" : "you do not follow this author";
  const topics = post.tags.map((tag) => `#${tag}`).join(" and ");
  const reasonBySignal = {
    topic: `it matches your explicit preferences for ${topics}`,
    following: follows,
    popularity: `it has high synthetic engagement (${engagement(post)} weighted points)`,
    recency: `it is recent (${formatAge(post.hoursAgo)})`,
  };
  return `${algorithms[activeAlgorithm].label} ranked this post because ${reasonBySignal[topSignal]}. The calculation above shows every contributing point.`;
}

function renderOrder() {
  document.querySelector("#rankedOrder").innerHTML = rankedPosts()
    .map((result, index) => `<li><strong>#${index + 1}</strong> ${users[result.post.authorId].name} — ${result.score.toFixed(3)}</li>`)
    .join("");
}

function render() {
  renderAlgorithmButtons();
  renderViewer();
  renderFeed();
  renderFormula();
  renderBreakdown();
  renderOrder();
}

document.querySelector("#explainTop").addEventListener("click", () => {
  selectedPostId = rankedPosts()[0].post.id;
  render();
  document.querySelector("#debug").scrollIntoView({ behavior: "smooth", block: "start" });
});

render();
