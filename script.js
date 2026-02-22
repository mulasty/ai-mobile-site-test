(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Smooth scroll for in-page links (with reduced-motion support)
  const inPageLinks = document.querySelectorAll('a[href^="#"]');
  inPageLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (!href || href === "#") return;

      const target = document.querySelector(href);
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start"
      });
    });
  });

  // Mobile nav
  const navToggle = document.getElementById("navToggle");
  const navMenu = document.getElementById("navMenu");

  function setNavOpen(open) {
    if (!navToggle || !navMenu) return;
    navMenu.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    navToggle.setAttribute("aria-label", open ? "Zamknij menu" : "Otwórz menu");
  }

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      const isOpen = navMenu.classList.contains("is-open");
      setNavOpen(!isOpen);
    });

    navMenu.addEventListener("click", (e) => {
      const a = e.target && e.target.closest ? e.target.closest("a") : null;
      if (a) setNavOpen(false);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setNavOpen(false);
    });

    document.addEventListener("click", (e) => {
      const t = e.target;
      if (!t) return;
      if (t === navToggle || navToggle.contains(t)) return;
      if (t === navMenu || navMenu.contains(t)) return;
      setNavOpen(false);
    });
  }

  // Active section highlight in nav
  const sectionIds = ["hero", "o-nas", "oferta", "godziny", "galeria", "wydarzenia", "kontakt"];
  const navAnchors = new Map();
  document.querySelectorAll('.nav-list a[href^="#"]').forEach((a) => {
    const href = a.getAttribute("href");
    if (href && href.startsWith("#")) navAnchors.set(href.slice(1), a);
  });

  const sections = sectionIds.map((id) => document.getElementById(id)).filter(Boolean);

  if (sections.length) {
    const ioNav = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0));

        if (!visible.length) return;
        const id = visible[0].target.id;

        for (const [sid, a] of navAnchors.entries()) {
          if (!a) continue;
          a.setAttribute("aria-current", sid === id ? "true" : "false");
        }
      },
      { threshold: [0.22, 0.35, 0.5], rootMargin: "-20% 0px -65% 0px" }
    );

    sections.forEach((s) => ioNav.observe(s));
  }

  // Back to top button
  const toTopBtn = document.getElementById("toTop");

  function updateToTopVisibility() {
    if (!toTopBtn) return;
    const showAfter = 500;
    const shouldShow = window.scrollY > showAfter;
    toTopBtn.classList.toggle("is-visible", shouldShow);
  }

  if (toTopBtn) {
    toTopBtn.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? "auto" : "smooth"
      });
    });
  }

  window.addEventListener("scroll", updateToTopVisibility, { passive: true });
  updateToTopVisibility();

  // Footer year
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Scroll reveal animations
  const animated = Array.from(document.querySelectorAll("[data-animate]"));
  if (!prefersReducedMotion && animated.length) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-inview");
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -10% 0px" }
    );

    animated.forEach((el) => io.observe(el));
  } else {
    animated.forEach((el) => el.classList.add("is-inview"));
  }
})();
