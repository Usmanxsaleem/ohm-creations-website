(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  $("#year").textContent = new Date().getFullYear();

  /* ---------- Nav: scrolled state, mobile menu, active link ---------- */
  const nav = $("#nav");
  const toggle = $("#navToggle");
  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 30);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", open);
    document.body.style.overflow = open ? "hidden" : "";
  });
  $$("#navLinks a").forEach((a) =>
    a.addEventListener("click", () => {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    })
  );

  const navMap = new Map($$(".nav__links a:not(.btn)").map((a) => [a.getAttribute("href").slice(1), a]));
  const sectionObserver = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        navMap.forEach((a) => a.classList.remove("is-active"));
        navMap.get(e.target.id)?.classList.add("is-active");
      }),
    { rootMargin: "-45% 0px -50% 0px" }
  );
  navMap.forEach((_, id) => { const s = document.getElementById(id); if (s) sectionObserver.observe(s); });

  /* ---------- Reveal on scroll (with sibling stagger) ---------- */
  const revealObserver = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("is-visible"); revealObserver.unobserve(e.target); }
      }),
    { threshold: 0.12 }
  );
  $$(".reveal").forEach((el) => {
    const siblings = [...el.parentElement.children].filter((c) => c.classList.contains("reveal"));
    el.style.setProperty("--d", `${Math.min(siblings.indexOf(el), 6) * 0.08}s`);
    revealObserver.observe(el);
  });

  /* ---------- Typewriter word in hero ---------- */
  const words = ["websites", "brands", "characters", "3D worlds", "animations", "avatars", "campaigns"];
  const typeEl = $("#typeword");
  if (!reduceMotion) {
    let w = 0, i = words[0].length, deleting = true;
    const tick = () => {
      const word = words[w];
      i += deleting ? -1 : 1;
      typeEl.textContent = word.slice(0, i);
      let delay = deleting ? 45 : 90;
      if (deleting && i === 0) { deleting = false; w = (w + 1) % words.length; delay = 300; }
      else if (!deleting && i === words[w].length) { deleting = true; delay = 1800; }
      setTimeout(tick, delay);
    };
    setTimeout(tick, 2200);
  }

  /* ---------- Cursor glow + card spotlight + tilt ---------- */
  if (finePointer && !reduceMotion) {
    const glow = $(".cursor-glow");
    document.body.classList.add("has-pointer");
    window.addEventListener("pointermove", (e) => {
      glow.style.left = e.clientX + "px";
      glow.style.top = e.clientY + "px";
    }, { passive: true });

    $$(".card").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        const x = e.clientX - r.left, y = e.clientY - r.top;
        card.style.setProperty("--mx", x + "px");
        card.style.setProperty("--my", y + "px");
        if (card.classList.contains("tilt")) {
          const rx = ((y / r.height) - 0.5) * -8;
          const ry = ((x / r.width) - 0.5) * 8;
          card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
        }
      });
      card.addEventListener("pointerleave", () => { card.style.transform = ""; });
    });
  }

  /* ---------- Portfolio filter ---------- */
  const tiles = $$(".tile");
  $$(".filter").forEach((btn) =>
    btn.addEventListener("click", () => {
      $$(".filter").forEach((b) => { b.classList.remove("is-active"); b.setAttribute("aria-selected", "false"); });
      btn.classList.add("is-active");
      btn.setAttribute("aria-selected", "true");
      const f = btn.dataset.filter;
      tiles.forEach((t) => {
        const show = f === "all" || t.dataset.cat === f;
        t.classList.toggle("is-hidden", !show);
        t.classList.remove("is-entering");
        if (show) { void t.offsetWidth; t.classList.add("is-entering"); }
      });
    })
  );

  /* ---------- Lightbox ---------- */
  const lb = $("#lightbox");
  const lbImg = $("img", lb);
  const lbCap = $("figcaption", lb);
  let current = 0;
  const visible = () => tiles.filter((t) => !t.classList.contains("is-hidden"));
  const show = (idx) => {
    const list = visible();
    current = (idx + list.length) % list.length;
    const t = list[current];
    lbImg.src = $("img", t).src;
    lbImg.alt = $("img", t).alt;
    lbCap.textContent = $("figcaption", t).lastChild.textContent;
  };
  const open = (t) => { show(visible().indexOf(t)); lb.hidden = false; document.body.style.overflow = "hidden"; $(".lightbox__close", lb).focus(); };
  const close = () => { lb.hidden = true; document.body.style.overflow = ""; visible()[current]?.focus(); };
  tiles.forEach((t) => {
    t.tabIndex = 0;
    t.setAttribute("role", "button");
    t.addEventListener("click", () => open(t));
    t.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(t); } });
  });
  $(".lightbox__close", lb).addEventListener("click", close);
  $(".lightbox__prev", lb).addEventListener("click", () => show(current - 1));
  $(".lightbox__next", lb).addEventListener("click", () => show(current + 1));
  lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
  document.addEventListener("keydown", (e) => {
    if (lb.hidden) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") show(current - 1);
    if (e.key === "ArrowRight") show(current + 1);
  });

  /* ---------- Contact form (Formspree via fetch) ---------- */
  const form = $("#contactForm");
  const status = $("#formStatus");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (form.action.includes("YOUR_FORM_ID")) {
      status.className = "form__status err";
      status.textContent = "The form isn't connected yet. Please email us directly for now.";
      return;
    }
    const btn = $("button[type=submit]", form);
    btn.disabled = true;
    status.className = "form__status";
    status.textContent = "Sending…";
    try {
      const res = await fetch(form.action, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error();
      form.reset();
      status.className = "form__status ok";
      status.textContent = "Thanks! Your message is on its way. We'll reply within 24 hours.";
    } catch {
      status.className = "form__status err";
      status.textContent = "Something went wrong. Please try again or email us directly.";
    } finally {
      btn.disabled = false;
    }
  });

  /* ---------- Hero particle network ---------- */
  const canvas = $("#particles");
  const ctx = canvas.getContext("2d");
  let W, H, pts = [], mouse = { x: -999, y: -999 }, raf;
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  const resize = () => {
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = W * DPR; canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    const n = Math.round(Math.min(90, (W * H) / 16000));
    pts = Array.from({ length: n }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.6 + 0.6,
    }));
  };
  const draw = () => {
    ctx.clearRect(0, 0, W, H);
    for (const p of pts) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
      const dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.hypot(dx, dy);
      if (d < 120) { p.x += dx / d; p.y += dy / d; }
    }
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const a = pts[i], b = pts[j], d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 130) {
          ctx.strokeStyle = `rgba(6,191,248,${(1 - d / 130) * 0.22})`;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }
    for (const p of pts) {
      ctx.fillStyle = "rgba(94,225,255,.8)";
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    }
    raf = requestAnimationFrame(draw);
  };
  resize();
  window.addEventListener("resize", resize);
  canvas.parentElement.addEventListener("pointermove", (e) => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
  });
  canvas.parentElement.addEventListener("pointerleave", () => { mouse.x = mouse.y = -999; });
  if (reduceMotion) {
    draw(); cancelAnimationFrame(raf);
  } else {
    // Only animate while the hero is on screen
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { cancelAnimationFrame(raf); draw(); } else cancelAnimationFrame(raf);
    }).observe(canvas);
  }
})();
