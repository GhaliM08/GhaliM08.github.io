// 1) Dark mode: remember the choice in localStorage
const THEME_KEY = "theme";
const root = document.documentElement;
const themeBtn = document.getElementById("theme-toggle");

function applyTheme(theme) {
  root.setAttribute("data-theme", theme);
  if (themeBtn) {
    const dark = theme === "dark";
    themeBtn.setAttribute("aria-pressed", String(dark));
    themeBtn.querySelector(".theme-icon").textContent = dark ? "☀️" : "🌙";
    themeBtn.querySelector(".theme-label").textContent = dark ? "فاتح" : "داكن";
  }
}

applyTheme(root.getAttribute("data-theme") || "light");

themeBtn?.addEventListener("click", () => {
  const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
  applyTheme(next);
  try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* storage blocked */ }
});

// 2) Projects: load from data/projects.json and render cards
const grid = document.getElementById("projects-grid");
const filterBar = document.getElementById("filter-bar");
const CATEGORY_LABELS = { data: "بيانات", web: "ويب وبرمجة", design: "تصميم" };
let projects = [];

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function projectCard(p) {
  const card = el("article", "project-card reveal");
  card.dataset.category = p.category;

  const img = el("img", "project-img");
  img.src = p.image;
  img.alt = p.title;
  img.width = 800;
  img.height = 450;
  img.loading = "lazy";

  const body = el("div", "project-body");
  body.append(el("span", "project-cat", CATEGORY_LABELS[p.category] || p.category));
  body.append(el("h3", "project-title", p.title));
  body.append(el("p", "project-desc", p.description));

  const tags = el("div", "project-tags");
  p.tags.forEach((t) => tags.append(el("span", "tag", t)));
  body.append(tags);

  const links = el("div", "project-links");
  if (p.demo) links.append(linkTo(p.demo, "الموقع المباشر"));
  if (p.code) links.append(linkTo(p.code, "الكود على GitHub"));
  if (!p.demo && !p.code) links.append(el("span", "project-note", "مشروع ضمن معسكرات Ctrl + A"));
  body.append(links);

  card.append(img, body);
  return card;
}

function linkTo(href, label) {
  const a = el("a", "project-link", label);
  a.href = href;
  a.target = "_blank";
  a.rel = "noopener";
  return a;
}

function render(filter) {
  grid.replaceChildren();
  const list = filter === "all" ? projects : projects.filter((p) => p.category === filter);
  list.forEach((p) => grid.append(projectCard(p)));
  observeReveals();
}

// 3) Filter buttons
filterBar.addEventListener("click", (e) => {
  const btn = e.target.closest(".filter-btn");
  if (!btn) return;
  filterBar.querySelectorAll(".filter-btn").forEach((b) => b.setAttribute("aria-pressed", "false"));
  btn.setAttribute("aria-pressed", "true");
  render(btn.dataset.filter);
});

fetch("data/projects.json")
  .then((res) => {
    if (!res.ok) throw new Error(res.status);
    return res.json();
  })
  .then((data) => {
    projects = data;
    render("all");
  })
  .catch(() => {
    grid.append(el("p", "projects-error", "تعذّر تحميل المشاريع. حدّث الصفحة وحاول مرة ثانية."));
  });

// 4) Gentle reveal on scroll
const io = "IntersectionObserver" in window
  ? new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 })
  : null;

function observeReveals() {
  document.querySelectorAll(".reveal:not(.is-visible)").forEach((node) => {
    if (io) io.observe(node);
    else node.classList.add("is-visible");
  });
}

observeReveals();
document.getElementById("year").textContent = new Date().getFullYear();
