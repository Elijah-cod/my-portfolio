const header = document.querySelector("[data-header]");
const menuButton = document.querySelector("[data-menu-toggle]");
const menu = document.querySelector("[data-menu]");
const contactForm = document.getElementById("contact-form");
const formNote = document.getElementById("form-note");
const motionStage = document.querySelector("[data-motion-stage]");
const portraitMotion = document.querySelector("[data-portrait-motion]");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

document.querySelectorAll("[data-year]").forEach((node) => {
  node.textContent = new Date().getFullYear();
});

function closeMenu() {
  if (!menuButton || !menu) return;

  menuButton.setAttribute("aria-expanded", "false");
  menu.classList.remove("is-open");
  document.body.classList.remove("menu-open");
}

menuButton?.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!isOpen));
  menu?.classList.toggle("is-open", !isOpen);
  document.body.classList.toggle("menu-open", !isOpen);
});

menu?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

window.addEventListener(
  "scroll",
  () => header?.classList.toggle("is-scrolled", window.scrollY > 12),
  { passive: true }
);

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -6%" }
);

document.querySelectorAll("[data-reveal]").forEach((element) => {
  const startsInView = element.getBoundingClientRect().top < window.innerHeight * 0.92;

  if (startsInView) {
    element.classList.add("is-visible");
    return;
  }

  revealObserver.observe(element);
});

if (motionStage && !reducedMotion.matches) {
  const steps = [...motionStage.querySelectorAll(".flow-step")];

  motionStage.addEventListener("pointermove", (event) => {
    if (event.pointerType === "touch") return;

    const bounds = motionStage.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    const activeStep = Math.min(steps.length - 1, Math.max(0, Math.floor((y / bounds.height) * steps.length)));

    motionStage.classList.add("is-pointer-active");
    motionStage.style.setProperty("--pointer-x", `${x}px`);
    motionStage.style.setProperty("--pointer-y", `${y}px`);
    steps.forEach((step, index) => step.classList.toggle("is-current", index === activeStep));
  });

  motionStage.addEventListener("pointerleave", () => {
    motionStage.classList.remove("is-pointer-active");
    steps.forEach((step, index) => step.classList.toggle("is-current", index === 0));
  });
}

if (portraitMotion && !reducedMotion.matches) {
  const hero = portraitMotion.closest(".hero");

  hero?.addEventListener("pointermove", (event) => {
    const bounds = hero.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 10;
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 10;
    portraitMotion.style.setProperty("--portrait-x", `${x}px`);
    portraitMotion.style.setProperty("--portrait-y", `${y}px`);
  });

  hero?.addEventListener("pointerleave", () => {
    portraitMotion.style.removeProperty("--portrait-x");
    portraitMotion.style.removeProperty("--portrait-y");
  });
}

contactForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!contactForm.reportValidity()) return;

  const data = new FormData(contactForm);
  const name = String(data.get("name") || "").trim();
  const email = String(data.get("email") || "").trim();
  const message = String(data.get("message") || "").trim();
  const subject = encodeURIComponent(`Portfolio enquiry from ${name}`);
  const body = encodeURIComponent(`${message}\n\nFrom: ${name}\nEmail: ${email}`);

  if (formNote) formNote.textContent = "Opening your email app…";
  window.location.href = `mailto:iamngunjiri@gmail.com?subject=${subject}&body=${body}`;
});
