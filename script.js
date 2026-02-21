(() => {
  "use strict";

  // =========================
  // ŁATWO EDYTOWALNA DATA WYDARZENIA
  // Ustaw lokalną datę i godzinę wydarzenia.
  // Przykład: new Date(2026, 5, 20, 14, 0, 0)  // 20 czerwca 2026, 14:00
  // =========================
  const EVENT_DATE = new Date(2026, 5, 20, 14, 0, 0);

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Smooth scroll for in-page links (with reduced-motion support)
  const inPageLinks = document.querySelectorAll('a[href^="#"]');
  inPageLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (!href || href === "#") return;

      const target = document.querySelector(href);
      if (!target) return; // do not block default if missing

      event.preventDefault();
      target.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start"
      });
    });
  });

  // Countdown
  const elDays = document.getElementById("cd-days");
  const elHours = document.getElementById("cd-hours");
  const elMinutes = document.getElementById("cd-minutes");
  const elSeconds = document.getElementById("cd-seconds");
  const elNote = document.getElementById("countdown-note");

  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  function setCountdownValues({ days, hours, minutes, seconds }) {
    if (elDays) elDays.textContent = String(days);
    if (elHours) elHours.textContent = pad2(hours);
    if (elMinutes) elMinutes.textContent = pad2(minutes);
    if (elSeconds) elSeconds.textContent = pad2(seconds);
  }

  function updateCountdown() {
    if (!elDays || !elHours || !elMinutes || !elSeconds) return;

    const now = new Date();
    let diffMs = EVENT_DATE.getTime() - now.getTime();

    if (!Number.isFinite(diffMs)) {
      setCountdownValues({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      if (elNote) elNote.textContent = "Nieprawidłowa data wydarzenia (sprawdź EVENT_DATE w script.js).";
      return;
    }

    if (diffMs <= 0) {
      setCountdownValues({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      if (elNote) elNote.textContent = "To już dziś — świętujemy!";
      return;
    }

    const totalSeconds = Math.floor(diffMs / 1000);
    const days = Math.floor(totalSeconds / (24 * 3600));
    const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    setCountdownValues({ days, hours, minutes, seconds });

    if (elNote) {
      const dateStr = EVENT_DATE.toLocaleString("pl-PL", {
        year: "numeric",
        month: "long",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      });
      elNote.innerHTML = `Data wydarzenia: <strong>${dateStr}</strong> (ustawiana w <code>script.js</code>).`;
    }
  }

  updateCountdown();
  window.setInterval(updateCountdown, 1000);

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
})();
