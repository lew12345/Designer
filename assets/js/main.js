/* Lewis Mills portfolio: interactions.
   Everything degrades to a readable static page if GSAP fails to load or the
   visitor prefers reduced motion. */
(function () {
  "use strict";
  var doc = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGsap = !!(window.gsap && window.ScrollTrigger);
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);
  window.__revealReady = true;

  /* ---------- Navigation ---------- */
  var nav = document.querySelector(".nav");
  if (nav) {
    var toggle = nav.querySelector(".nav__toggle");
    if (toggle) {
      toggle.addEventListener("click", function () {
        var open = nav.classList.toggle("menu-open");
        toggle.setAttribute("aria-expanded", open);
        toggle.querySelector("span").textContent = open ? "Close" : "Menu";
      });
    }
    nav.querySelectorAll(".has-dropdown").forEach(function (item) {
      var btn = item.querySelector(".nav__trigger");
      btn.addEventListener("click", function () {
        var open = item.classList.toggle("is-open");
        btn.setAttribute("aria-expanded", open);
      });
      item.addEventListener("keydown", function (e) {
        if (e.key === "Escape") { item.classList.remove("is-open"); btn.setAttribute("aria-expanded", "false"); btn.focus(); }
      });
    });
    document.addEventListener("click", function (e) {
      nav.querySelectorAll(".has-dropdown.is-open").forEach(function (item) {
        if (!item.contains(e.target)) { item.classList.remove("is-open"); item.querySelector(".nav__trigger").setAttribute("aria-expanded", "false"); }
      });
    });

    // Border once scrolled; hide on scroll down, show on scroll up.
    if (hasGsap) {
      ScrollTrigger.create({
        start: 1,
        end: "max",
        onUpdate: function (self) {
          nav.classList.toggle("is-scrolled", self.scroll() > 8);
          if (nav.classList.contains("menu-open")) return;
          nav.classList.toggle("is-hidden", self.direction === 1 && self.scroll() > 400);
        }
      });
    } else {
      nav.classList.add("is-scrolled");
    }
  }

  /* ---------- Reveal on enter ---------- */
  var revealEls = document.querySelectorAll("[data-reveal]");
  if (doc.classList.contains("motion") && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add("is-in"); io.unobserve(entry.target); }
      });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- Home hero ---------- */
  if (hasGsap && !reduce) {
    var heroImg = document.querySelector(".hero__visual .media img");
    if (heroImg) {
      gsap.fromTo(heroImg, { scale: 1.18 }, { scale: 1.02, duration: 1.8, ease: "expo.out" });
      gsap.to(heroImg, { yPercent: 8, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
    }
    var heroText = document.querySelectorAll(".hero__copy > *");
    if (heroText.length) gsap.from(heroText, { y: 30, opacity: 0, duration: 1.1, ease: "expo.out", stagger: 0.08, delay: 0.1 });

    // Project hero images drift slightly slower than the page.
    document.querySelectorAll(".p-hero__img img").forEach(function (img) {
      gsap.fromTo(img, { scale: 1.12 }, { scale: 1, duration: 1.6, ease: "expo.out" });
      gsap.to(img, { yPercent: 10, ease: "none", scrollTrigger: { trigger: img.closest(".p-hero"), start: "top top", end: "bottom top", scrub: true } });
    });
  }

  /* ---------- Project stack (home): each card pins, the next slides over it ---------- */
  var stack = document.querySelector(".stack");
  if (stack && hasGsap && !reduce) {
    var mm = gsap.matchMedia();
    mm.add("all", function () {
      var cards = gsap.utils.toArray(".stack .card");
      cards.forEach(function (card, i) {
        card.style.position = "sticky";
        card.style.top = "calc(var(--nav-h) + " + (12 + i * 14) + "px)";
        if (i === cards.length - 1) return;
        gsap.fromTo(card, { scale: 1, filter: "brightness(1)" }, {
          scale: 0.94, filter: "brightness(0.55)", ease: "none", immediateRender: false,
          scrollTrigger: { trigger: cards[i + 1], start: "top bottom", end: "top 20%", scrub: true }
        });
      });
      return function () { cards.forEach(function (c) { c.style.position = ""; c.style.top = ""; }); };
    });
  }

  /* ---------- Double diamond: hovering a segment lights its legend column, and vice versa ---------- */
  var phaseIds = ["discover", "define", "develop", "deliver"];
  document.querySelectorAll(".dd").forEach(function (dd) {
    var fills = dd.querySelectorAll(".dd-fill");
    var cols = dd.querySelectorAll(".dd-legend > div");
    var set = function (idx) {
      fills.forEach(function (f, i) { f.classList.toggle("is-hover", i === idx); });
      cols.forEach(function (c, i) { c.classList.toggle("is-hover", i === idx); });
    };
    [fills, cols].forEach(function (list) {
      list.forEach(function (el, i) {
        el.addEventListener("mouseenter", function () { set(i); });
        el.addEventListener("mouseleave", function () { set(-1); });
        el.addEventListener("focusin", function () { set(i); });
        el.addEventListener("focusout", function () { set(-1); });
      });
    });
    // On project pages, clicking a segment jumps to that phase.
    fills.forEach(function (f, i) {
      var target = document.getElementById(phaseIds[i]);
      if (!target) { f.style.cursor = "default"; return; }
      f.addEventListener("click", function () { target.scrollIntoView({ behavior: reduce ? "auto" : "smooth" }); });
    });
  });

  /* ---------- Double diamond: draw on enter ---------- */
  document.querySelectorAll(".dd").forEach(function (dd) {
    var edge = dd.querySelector(".dd-edge");
    if (!edge) return;
    var len = edge.getTotalLength();
    if (hasGsap && !reduce) {
      gsap.set(edge, { strokeDasharray: len, strokeDashoffset: len });
      var fills = dd.querySelectorAll(".dd-fill");
      var tl = gsap.timeline({ scrollTrigger: { trigger: dd, start: "top 75%" } });
      tl.to(edge, { strokeDashoffset: 0, duration: 2.2, ease: "power2.inOut" });
      if (!dd.hasAttribute("data-track")) {
        // Home: pulse through the four phases once the outline is drawn.
        fills.forEach(function (f, i) {
          tl.add(function () { fills.forEach(function (o) { o.classList.remove("is-active"); }); f.classList.add("is-active"); legendActive(dd, i); }, 1.1 + i * 0.55);
        });
      }
    }
  });

  function legendActive(dd, index) {
    var legend = dd.parentElement.querySelector(".dd-legend");
    if (!legend) return;
    legend.querySelectorAll(":scope > div").forEach(function (d, i) { d.classList.toggle("is-active", i === index); });
  }

  /* ---------- Project pages: track which phase is on screen ---------- */
  var phaseOrder = ["discover", "define", "develop", "deliver"];
  var bar = document.querySelector(".phasebar");
  var chapters = document.querySelectorAll("[data-phase]");
  var tracked = document.querySelector(".dd[data-track]");
  if (chapters.length && "IntersectionObserver" in window) {
    var current = -1;
    var setPhase = function (idx) {
      if (idx === current) return;
      current = idx;
      if (bar) {
        bar.querySelectorAll("a").forEach(function (a, i) {
          a.classList.toggle("is-active", i === idx);
          a.classList.toggle("is-done", i < idx);
        });
      }
      if (tracked) {
        tracked.querySelectorAll(".dd-fill").forEach(function (f, i) { f.classList.toggle("is-active", i === idx); });
        legendActive(tracked, idx);
      }
    };
    var pio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setPhase(phaseOrder.indexOf(entry.target.getAttribute("data-phase")));
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    chapters.forEach(function (c) { pio.observe(c); });

    if (bar) {
      var story = document.querySelector(".story");
      var showBar = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { bar.classList.toggle("is-visible", e.isIntersecting); });
      }, { rootMargin: "-20% 0px -60% 0px" });
      if (story) showBar.observe(story);

      // Progress fill inside the active phase segment.
      if (hasGsap) {
        phaseOrder.forEach(function (p, i) {
          var group = document.querySelectorAll('[data-phase="' + p + '"]');
          var fill = bar.querySelectorAll("a")[i] && bar.querySelectorAll("a")[i].querySelector(".fill");
          if (!group.length || !fill) return;
          ScrollTrigger.create({
            trigger: group[0], endTrigger: group[group.length - 1],
            start: "top 50%", end: "bottom 50%",
            onUpdate: function (self) { fill.style.width = (self.progress * 100).toFixed(1) + "%"; }
          });
        });
      }
    }
  }

  /* ---------- Lightbox ---------- */
  var zoomables = Array.prototype.slice.call(document.querySelectorAll(".media[data-zoom] img"));
  if (zoomables.length) {
    var lb = document.createElement("div");
    lb.className = "lightbox";
    lb.setAttribute("role", "dialog");
    lb.setAttribute("aria-modal", "true");
    lb.setAttribute("aria-label", "Image viewer");
    lb.innerHTML =
      '<div class="lightbox__bar"><span class="lightbox__count"></span><button type="button" class="lightbox__close" aria-label="Close"><i class="ph ph-x"></i></button></div>' +
      '<img alt="">' +
      '<div class="lightbox__nav"><button type="button" class="lightbox__prev" aria-label="Previous image"><i class="ph ph-arrow-left"></i></button><button type="button" class="lightbox__next" aria-label="Next image"><i class="ph ph-arrow-right"></i></button></div>';
    document.body.appendChild(lb);
    var lbImg = lb.querySelector("img");
    var lbCount = lb.querySelector(".lightbox__count");
    var idx = 0, lastFocus = null;
    var show = function (i) {
      idx = (i + zoomables.length) % zoomables.length;
      var src = zoomables[idx];
      lbImg.src = src.dataset.full || src.currentSrc || src.src;
      lbImg.alt = src.alt;
      lbCount.textContent = (idx + 1) + " / " + zoomables.length;
    };
    var open = function (i) { lastFocus = document.activeElement; show(i); lb.classList.add("is-open"); document.body.style.overflow = "hidden"; lb.querySelector(".lightbox__close").focus(); };
    var close = function () { lb.classList.remove("is-open"); document.body.style.overflow = ""; if (lastFocus) lastFocus.focus(); };
    zoomables.forEach(function (img, i) {
      var fig = img.closest(".media");
      fig.setAttribute("tabindex", "0");
      fig.setAttribute("role", "button");
      fig.setAttribute("aria-label", "Enlarge image" + (img.alt ? ": " + img.alt : ""));
      fig.addEventListener("click", function () { open(i); });
      fig.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(i); } });
    });
    lb.querySelector(".lightbox__close").addEventListener("click", close);
    lb.querySelector(".lightbox__prev").addEventListener("click", function () { show(idx - 1); });
    lb.querySelector(".lightbox__next").addEventListener("click", function () { show(idx + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(idx - 1);
      if (e.key === "ArrowRight") show(idx + 1);
    });
  }

  // Images that fail to load (e.g. not yet downloaded) keep their plate colour instead of a broken icon.
  document.querySelectorAll("img").forEach(function (img) {
    img.addEventListener("error", function () { img.style.visibility = "hidden"; }, { once: true });
  });

  // Decode the hover wireframes up front so the render-to-wireframe wipe is instant.
  var wires = document.querySelectorAll(".card__wire img");
  if (wires.length) {
    var warm = function () { wires.forEach(function (img) { if (img.decode) img.decode().catch(function () {}); }); };
    if ("requestIdleCallback" in window) requestIdleCallback(warm, { timeout: 2000 }); else setTimeout(warm, 800);
  }

  if (hasGsap) window.addEventListener("load", function () { ScrollTrigger.refresh(); });
})();
