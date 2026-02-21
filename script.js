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
  const sectionIds = ["hero", "o-nas", "jak-dzialamy", "cennik", "kontakt"];
  const navAnchors = new Map();
  document.querySelectorAll('.nav-list a[href^="#"]').forEach((a) => {
    const href = a.getAttribute("href");
    if (href && href.startsWith("#")) navAnchors.set(href.slice(1), a);
  });

  const sections = sectionIds
    .map((id) => document.getElementById(id))
    .filter(Boolean);

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

  // Process animation
  const processStepsWrap = document.getElementById("processSteps");
  const processTitle = document.getElementById("processTitle");
  const processDesc = document.getElementById("processDesc");
  const processBullets = document.getElementById("processBullets");
  const processPanel = document.getElementById("processPanel");
  const processToggle = document.getElementById("processToggle");
  const processNext = document.getElementById("processNext");
  const processHint = document.getElementById("processHint");

  const processData = [
    {
      title: "Audyt i cele",
      desc: "Ustalamy, co ma się zmienić: gdzie uciekają godziny, gdzie pojawiają się błędy i jakie dane muszą płynąć między narzędziami.",
      bullets: [
        "Krótka rozmowa + przykłady z Twojej firmy",
        "Priorytetyzacja: szybkie wygrane vs. duże projekty",
        "Wstępna wycena i plan"
      ]
    },
    {
      title: "Mapa procesu",
      desc: "Rozpisujemy krok po kroku: kto, kiedy i na jakich danych pracuje. Wychwytujemy wąskie gardła i miejsca na automatyzację.",
      bullets: [
        "Schemat przepływu (blokowo) + odpowiedzialności",
        "Lista integracji i źródeł danych",
        "Ryzyka i wymagania (np. RODO, uprawnienia)"
      ]
    },
    {
      title: "Prototyp",
      desc: "Budujemy pierwszą wersję automatyzacji, żeby szybko zweryfikować założenia i dopasować logikę do realnych danych.",
      bullets: [
        "Szybkie wdrożenie w środowisku testowym",
        "Obsługa wyjątków i podstawowe logi",
        "Iteracje na podstawie feedbacku"
      ]
    },
    {
      title: "Wdrożenie",
      desc: "Przenosimy rozwiązanie na produkcję, konfigurujemy integracje i dbamy o stabilność działania w codziennym użyciu.",
      bullets: [
        "Konfiguracja webhooków/API i uprawnień",
        "Wersjonowanie i backup konfiguracji",
        "Ustalenie KPI i metryk"
      ]
    },
    {
      title: "Testy i szkolenie",
      desc: "Testujemy scenariusze brzegowe, przygotowujemy instrukcję i przekazujemy proces zespołowi, żeby każdy wiedział co i jak działa.",
      bullets: [
        "Testy danych, błędów i obciążeń",
        "Dokumentacja + checklisty",
        "Szkolenie użytkowników"
      ]
    },
    {
      title: "Opieka i rozwój",
      desc: "Monitorujemy, poprawiamy i rozwijamy automatyzacje. Gdy firma rośnie, procesy też muszą nadążać.",
      bullets: [
        "Monitoring i alerty (np. błędy, limity)",
        "Optymalizacje kosztów i czasu wykonania",
        "Nowe automatyzacje w kolejce"
      ]
    }
  ];

  let activeStep = 0;
  let timer = null;
  let isPaused = prefersReducedMotion; // if reduced motion, start paused

  function renderProcess(stepIndex, { focusPanel = false } = {}) {
    const idx = Math.max(0, Math.min(processData.length - 1, stepIndex));
    activeStep = idx;

    const data = processData[idx];
    if (processTitle) processTitle.textContent = data.title;
    if (processDesc) processDesc.textContent = data.desc;

    if (processBullets) {
      processBullets.innerHTML = "";
      for (const b of data.bullets) {
        const li = document.createElement("li");
        li.textContent = b;
        processBullets.appendChild(li);
      }
    }

    const stepButtons = processStepsWrap ? Array.from(processStepsWrap.querySelectorAll(".process-step")) : [];
    stepButtons.forEach((btn) => {
      const s = Number(btn.dataset.step);
      const isActive = s === idx;
      btn.classList.toggle("is-active", isActive);
      btn.setAttribute("aria-selected", isActive ? "true" : "false");
    });

    if (processPanel) {
      processPanel.setAttribute("aria-labelledby", `step-${idx}`);
      if (focusPanel) processPanel.focus({ preventScroll: true });
    }
  }

  function stopProcessLoop() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  function startProcessLoop() {
    stopProcessLoop();
    if (prefersReducedMotion) return;
    if (isPaused) return;

    timer = window.setInterval(() => {
      renderProcess((activeStep + 1) % processData.length);
    }, 2500);
  }

  function setPaused(paused, { userInitiated = false } = {}) {
    isPaused = paused;
    if (processToggle) {
      processToggle.textContent = paused ? "Wznów" : "Pauza";
      processToggle.setAttribute("aria-pressed", paused ? "true" : "false");
    }

    if (processHint && userInitiated) {
      processHint.textContent = paused
        ? "Animacja zatrzymana. Kliknij „Wznów”, aby kontynuować, lub wybierz inny krok."
        : "Animacja podświetla kroki co kilka sekund. Kliknij krok, aby zatrzymać.";
    }

    if (paused) stopProcessLoop();
    else startProcessLoop();
  }

  if (processStepsWrap && processData.length) {
    renderProcess(0);
    setPaused(isPaused);
    startProcessLoop();

    processStepsWrap.addEventListener("click", (e) => {
      const btn = e.target && e.target.closest ? e.target.closest(".process-step") : null;
      if (!btn) return;
      const idx = Number(btn.dataset.step);
      renderProcess(idx, { focusPanel: true });
      setPaused(true, { userInitiated: true });
    });

    if (processToggle) {
      processToggle.addEventListener("click", () => {
        setPaused(!isPaused, { userInitiated: true });
      });
    }

    if (processNext) {
      processNext.addEventListener("click", () => {
        renderProcess((activeStep + 1) % processData.length, { focusPanel: true });
        setPaused(true, { userInitiated: true });
      });
    }
  }

  // Contact form validation (no backend)
  const form = document.getElementById("contactForm");
  const successEl = document.getElementById("formSuccess");

  const fields = {
    name: {
      el: document.getElementById("name"),
      err: document.getElementById("err-name"),
      validate: (v) => {
        const value = v.trim();
        if (!value) return "Podaj imię.";
        if (value.length < 2) return "Imię musi mieć co najmniej 2 znaki.";
        return "";
      }
    },
    email: {
      el: document.getElementById("email"),
      err: document.getElementById("err-email"),
      validate: (v) => {
        const value = v.trim();
        if (!value) return "Podaj adres e-mail.";
        const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(value);
        if (!ok) return "Podaj poprawny adres e-mail.";
        return "";
      }
    },
    company: {
      el: document.getElementById("company"),
      err: document.getElementById("err-company"),
      validate: (v) => {
        const value = v.trim();
        if (!value) return "";
        if (value.length < 2) return "Nazwa firmy jest zbyt krótka.";
        return "";
      }
    },
    message: {
      el: document.getElementById("message"),
      err: document.getElementById("err-message"),
      validate: (v) => {
        const value = v.trim();
        if (!value) return "Wpisz wiadomość.";
        if (value.length < 20) return "Wiadomość musi mieć co najmniej 20 znaków.";
        return "";
      }
    },
    consent: {
      el: document.getElementById("consent"),
      err: document.getElementById("err-consent"),
      validate: (_v, el) => {
        if (!el.checked) return "Wymagana jest zgoda na kontakt.";
        return "";
      }
    }
  };

  function setFieldState(key, message) {
    const f = fields[key];
    if (!f || !f.el || !f.err) return;

    f.err.textContent = message;
    f.el.classList.toggle("is-invalid", Boolean(message));
  }

  function validateField(key) {
    const f = fields[key];
    if (!f || !f.el) return true;

    const value = f.el.type === "checkbox" ? "" : String(f.el.value ?? "");
    const msg = f.validate(value, f.el);
    setFieldState(key, msg);
    return !msg;
  }

  function validateAll() {
    let ok = true;
    Object.keys(fields).forEach((k) => {
      const valid = validateField(k);
      ok = ok && valid;
    });
    return ok;
  }

  if (form) {
    // Live validation
    Object.keys(fields).forEach((k) => {
      const f = fields[k];
      if (!f.el) return;

      const evt = f.el.type === "checkbox" ? "change" : "input";
      f.el.addEventListener(evt, () => {
        // Hide success on edits
        if (successEl) successEl.hidden = true;
        validateField(k);
      });

      f.el.addEventListener("blur", () => validateField(k));
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (successEl) successEl.hidden = true;

      const ok = validateAll();
      if (!ok) {
        // Focus first invalid
        const firstInvalid = form.querySelector(".is-invalid");
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      // Simulate success (no backend)
      if (successEl) {
        successEl.hidden = false;
      }

      form.reset();
      // Clear errors and invalid states
      Object.keys(fields).forEach((k) => setFieldState(k, ""));
    });
  }
})();
