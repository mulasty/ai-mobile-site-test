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
    subject: {
      el: document.getElementById("subject"),
      err: document.getElementById("err-subject"),
      validate: (v) => {
        const value = v.trim();
        if (!value) return "Podaj temat.";
        if (value.length < 3) return "Temat musi mieć co najmniej 3 znaki.";
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
    (Object.keys(fields)).forEach((k) => {
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
