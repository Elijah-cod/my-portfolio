const searchNodes = [
  {
    title: "Hybrid RAG Engine",
    description:
      "Combines semantic retrieval and graph-aware context so responses can use relevance and relationships together.",
    tags: ["graph", "rag", "hybrid", "retrieval"],
  },
  {
    title: "Anime Tracker",
    description:
      "Tracks anime progress and list state while handling external data, discovery flows, and UI clarity.",
    tags: ["anime", "tracking", "state", "api"],
  },
  {
    title: "Reflection Hub",
    description:
      "Journaling and reflection product with persistent entries, structured data, and a calm responsive interface.",
    tags: ["reflection", "journal", "prisma", "entries"],
  },
  {
    title: "Anatomy UI",
    description:
      "Explores component structure, interface clarity, and the design-engineering side of product work.",
    tags: ["ui", "components", "design", "frontend"],
  },
  {
    title: "Bento Grid",
    description:
      "Layout-focused build exploring responsive grid composition, visual hierarchy, and presentation rhythm.",
    tags: ["layout", "grid", "frontend", "responsive"],
  },
  {
    title: "Ecommerce Website",
    description:
      "Commerce interface work centered on product browsing, user flow, and polished frontend implementation.",
    tags: ["ecommerce", "commerce", "ux", "frontend"],
  },
];

const commands = [
  { label: "Jump to Projects", meta: "Section", action: () => scrollToTarget("#projects") },
  { label: "Open Stack Matrix", meta: "Section", action: () => scrollToTarget("#stack") },
  { label: "Launch Technical Labs", meta: "Section", action: () => scrollToTarget("#labs") },
  { label: "Read the Technical Ledger", meta: "Section", action: () => scrollToTarget("#ledger") },
  { label: "Go to Contact", meta: "Section", action: () => scrollToTarget("#contact") },
  {
    label: "Open Hybrid RAG Engine Repo",
    meta: "Project",
    action: () =>
      window.open("https://github.com/Elijah-cod/hybrid-rag-engine", "_blank", "noreferrer"),
  },
  {
    label: "Open Anime Tracker Repo",
    meta: "Project",
    action: () =>
      window.open("https://github.com/Elijah-cod/anime-tracker", "_blank", "noreferrer"),
  },
  {
    label: "Open Reflection Hub Repo",
    meta: "Project",
    action: () =>
      window.open("https://github.com/Elijah-cod/reflection-hub", "_blank", "noreferrer"),
  },
  {
    label: "Visit LinkedIn",
    meta: "External",
    action: () =>
      window.open("https://www.linkedin.com/in/elijah-mathai-52b69725b/", "_blank", "noreferrer"),
  },
  {
    label: "Visit GitHub",
    meta: "External",
    action: () => window.open("https://github.com/Elijah-cod", "_blank", "noreferrer"),
  },
];

const palette = document.getElementById("command-palette");
const commandInput = document.getElementById("command-input");
const commandList = document.getElementById("command-list");
const queryInput = document.getElementById("query-input");
const labResults = document.getElementById("lab-results");
const runQueryButton = document.getElementById("run-query");

let activeIndex = 0;

function normalizeText(value) {
  return value.toLowerCase().trim();
}

function tokenize(value) {
  return normalizeText(value)
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

function scoreNode(query, node) {
  const queryTokens = tokenize(query);
  const searchable = tokenize(`${node.title} ${node.description} ${node.tags.join(" ")}`);
  const uniqueTokens = new Set(searchable);

  if (!queryTokens.length) {
    return 0;
  }

  return queryTokens.reduce((score, token) => {
    if (node.tags.includes(token)) {
      return score + 26;
    }

    if (uniqueTokens.has(token)) {
      return score + 14;
    }

    const partial = [...uniqueTokens].some((entry) => entry.includes(token) || token.includes(entry));
    return partial ? score + 6 : score;
  }, 0);
}

function renderResults(query) {
  const ranked = searchNodes
    .map((node) => ({ ...node, score: scoreNode(query, node) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  labResults.innerHTML = "";

  ranked.forEach((result, index) => {
    const card = document.createElement("article");
    card.className = "result-card";

    const confidence = Math.max(42, Math.min(98, 42 + result.score));
    card.innerHTML = `
      <div class="result-head">
        <strong>${index + 1}. ${result.title}</strong>
        <span class="result-score">${confidence}% semantic fit</span>
      </div>
      <p>${result.description}</p>
      <div class="result-tags">
        ${result.tags.map((tag) => `<span>${tag}</span>`).join("")}
      </div>
    `;

    labResults.appendChild(card);
  });
}

function scrollToTarget(selector) {
  const target = document.querySelector(selector);
  if (!target) {
    return;
  }

  target.scrollIntoView({ behavior: "smooth", block: "start" });
}

function openPalette() {
  palette.hidden = false;
  document.body.style.overflow = "hidden";
  renderCommands(commandInput.value);
  requestAnimationFrame(() => commandInput.focus());
}

function closePalette() {
  palette.hidden = true;
  document.body.style.overflow = "";
}

function renderCommands(filter = "") {
  const text = normalizeText(filter);
  const filtered = commands.filter((command) =>
    normalizeText(`${command.label} ${command.meta}`).includes(text)
  );

  activeIndex = 0;
  commandList.innerHTML = "";

  filtered.forEach((command, index) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "command-item";
    item.innerHTML = `<span>${command.label}</span><small>${command.meta}</small>`;
    item.addEventListener("click", () => {
      command.action();
      closePalette();
    });

    if (index === 0) {
      item.classList.add("active");
    }

    commandList.appendChild(item);
  });

  if (!filtered.length) {
    const empty = document.createElement("div");
    empty.className = "command-item";
    empty.innerHTML = "<span>No matching command</span><small>Try another search term</small>";
    commandList.appendChild(empty);
  }
}

function updateActiveCommand(nextIndex) {
  const items = [...commandList.querySelectorAll(".command-item")];
  if (!items.length) {
    return;
  }

  items.forEach((item) => item.classList.remove("active"));
  activeIndex = (nextIndex + items.length) % items.length;
  items[activeIndex].classList.add("active");
}

function runActiveCommand() {
  const filtered = commands.filter((command) =>
    normalizeText(`${command.label} ${command.meta}`).includes(normalizeText(commandInput.value))
  );

  if (!filtered.length) {
    return;
  }

  filtered[activeIndex].action();
  closePalette();
}

document.querySelectorAll("[data-command-open]").forEach((trigger) => {
  trigger.addEventListener("click", openPalette);
});

document.querySelectorAll("[data-command-close]").forEach((trigger) => {
  trigger.addEventListener("click", closePalette);
});

document.querySelectorAll("[data-scroll]").forEach((button) => {
  button.addEventListener("click", () => scrollToTarget(button.dataset.scroll));
});

document.addEventListener("keydown", (event) => {
  const isMacLike = navigator.platform.toUpperCase().includes("MAC");
  const shortcutPressed = isMacLike ? event.metaKey && event.key === "k" : event.ctrlKey && event.key === "k";

  if (shortcutPressed) {
    event.preventDefault();
    if (palette.hidden) {
      openPalette();
    } else {
      closePalette();
    }
  }

  if (palette.hidden) {
    return;
  }

  if (event.key === "Escape") {
    closePalette();
  }

  if (event.key === "ArrowDown") {
    event.preventDefault();
    updateActiveCommand(activeIndex + 1);
  }

  if (event.key === "ArrowUp") {
    event.preventDefault();
    updateActiveCommand(activeIndex - 1);
  }

  if (event.key === "Enter") {
    event.preventDefault();
    runActiveCommand();
  }
});

commandInput.addEventListener("input", () => renderCommands(commandInput.value));

runQueryButton.addEventListener("click", () => renderResults(queryInput.value));

queryInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    renderResults(queryInput.value);
  }
});

const revealTargets = document.querySelectorAll(".section, .hero-copy, .hero-panel");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        }
      });
    },
    { threshold: 0.14 }
  );

  revealTargets.forEach((element) => {
    element.classList.add("reveal");
    revealObserver.observe(element);
  });
} else {
  revealTargets.forEach((element) => element.classList.add("is-visible"));
}

renderResults(queryInput.value);
renderCommands();
