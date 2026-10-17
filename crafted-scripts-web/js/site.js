/* Crafted Scripts — capa de movimiento y la pieza viva.
   Todo lo que hay aqui es mejora: la pagina se lee entera sin JS. */
(function () {
  "use strict";

  document.documentElement.classList.add("js");

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* --- 1. Entrada por partes en cada seccion ------------------ */
  function rises() {
    var items = document.querySelectorAll("[data-rise]");
    if (!items.length) return;

    if (reduced.matches || !("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("is-in");
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.08 });

    items.forEach(function (el, i) {
      var group = el.closest("[data-stagger]") || el.parentElement;
      var sibs = group ? group.querySelectorAll("[data-rise]") : [el];
      var idx = Array.prototype.indexOf.call(sibs, el);
      el.style.setProperty("--delay", (idx < 0 ? 0 : idx) * 75 + "ms");
      io.observe(el);
    });
  }

  /* --- 2. La barra toma la tinta del capitulo que tiene debajo - */
  function navByChapter() {
    var nav = document.querySelector(".nav");
    var fields = document.querySelectorAll("[data-chapter]");
    if (!nav || !fields.length || !("IntersectionObserver" in window)) return;

    var tone = {
      paper: ["#FDF7F0", "#17130F"],
      step:  ["#F2E9DB", "#17130F"],
      ink:   ["#17130F", "#EFE6D8"],
      amber: ["#DEA423", "#0A0A0C"],
      teal:  ["#266A6B", "#FDF7F0"],
      navy:  ["#19425E", "#FDF7F0"]
    };

    function apply(name) {
      var t = tone[name] || tone.paper;
      nav.style.setProperty("--nav-bg", t[0]);
      nav.style.setProperty("--nav-fg", t[1]);
    }

    /* el capitulo de partida, antes de que el lector mueva nada */
    apply(fields[0].getAttribute("data-chapter"));

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) apply(e.target.getAttribute("data-chapter"));
      });
    }, { rootMargin: "-1px 0px -99% 0px", threshold: 0 });

    fields.forEach(function (f) { io.observe(f); });
  }

  /* --- 3. La pieza viva: su script, a la medida ---------------- */
  /* Los textos que arma la cadena, en los dos idiomas de la pagina.
     Se elige por el atributo lang del documento. */
  var TEXTOS = {
    es: {
      fuentes: {
        crm:   { nombre: "Su CRM",               campos: "los contactos, etapas y notas de venta que necesita leer" },
        bd:    { nombre: "Su base de datos",     campos: "las tablas de clientes, pedidos y estados que necesita leer" },
        api:   { nombre: "Su API interna",       campos: "los endpoints que ya usa su equipo" },
        hojas: { nombre: "Sus hojas de cálculo", campos: "las columnas que su equipo mantiene a mano" }
      },
      acciones: {
        clasifique: { accion: "Clasifica cada registro", n8n: "cuándo clasifica, cuándo pregunta a una persona y qué hace si falla" },
        responda:   { accion: "Responde en su nombre",   n8n: "qué responde solo, qué pasa a revisión y cómo se corrige si se equivoca" },
        genere:     { accion: "Genera el documento",     n8n: "cuándo genera, quién aprueba antes de enviar y cómo reintenta" },
        vigile:     { accion: "Vigila y avisa",          n8n: "cada cuánto revisa, qué umbral dispara el aviso y a quién avisa" }
      },
      pasos: [
        "Definimos un esquema MCP que expone al agente sólo {campos}.",
        "El servidor MCP entrega ese contexto al modelo en tiempo real, sin copiar sus datos a ningún sitio.",
        "En n8n programamos {n8n}."
      ]
    },
    en: {
      fuentes: {
        crm:   { nombre: "Your CRM",         campos: "the contacts, stages and sales notes it needs to read" },
        bd:    { nombre: "Your database",    campos: "the customer, order and status tables it needs to read" },
        api:   { nombre: "Your internal API", campos: "the endpoints your team already uses" },
        hojas: { nombre: "Your spreadsheets", campos: "the columns your team keeps by hand" }
      },
      acciones: {
        clasifique: { accion: "Classifies every record", n8n: "when it classifies, when it asks a human and what it does on failure" },
        responda:   { accion: "Replies on your behalf",  n8n: "what it answers alone, what goes to review and how it corrects itself" },
        genere:     { accion: "Drafts the document",     n8n: "when it drafts, who approves before sending and how it retries" },
        vigile:     { accion: "Watches and alerts",      n8n: "how often it checks, what threshold fires the alert and who gets it" }
      },
      pasos: [
        "We define an MCP schema that exposes to the agent only {campos}.",
        "The MCP server hands that context to the model in real time, without copying your data anywhere.",
        "In n8n we program {n8n}."
      ]
    }
  };

  function craft() {
    var root = document.querySelector("[data-craft]");
    if (!root) return;

    var srcEl   = root.querySelector("[data-craft-source]");
    var titleEl = root.querySelector("[data-craft-title]");
    var listEl  = root.querySelector("[data-craft-steps]");
    if (!srcEl || !titleEl || !listEl) return;

    function read(name) {
      var el = root.querySelector('input[name="' + name + '"]:checked');
      return el ? el.value : null;
    }

    var T = TEXTOS[(document.documentElement.lang || "en").slice(0, 2)] || TEXTOS.en;

    function write() {
      var f = T.fuentes[read("sector")] || T.fuentes.crm;
      var a = T.acciones[read("meta")] || T.acciones.clasifique;

      var steps = T.pasos.map(function (t) {
        return t.replace("{campos}", f.campos).replace("{n8n}", a.n8n);
      });

      var sheet = root.querySelector(".flip");
      if (sheet) sheet.classList.add("is-turning");

      window.setTimeout(function () {
        srcEl.textContent = f.nombre;
        titleEl.textContent = a.accion;
        listEl.innerHTML = "";
        steps.forEach(function (t) {
          var li = document.createElement("li");
          li.textContent = t;
          listEl.appendChild(li);
        });
        if (sheet) sheet.classList.remove("is-turning");
      }, reduced.matches ? 0 : 240);
    }

    root.addEventListener("change", function (e) {
      if (e.target && e.target.matches('input[type="radio"]')) write();
    });

    write();
  }

  /* --- 4. Con movimiento reducido, el clip se queda en su portada */
  function stillClips() {
    if (!reduced.matches) return;
    document.querySelectorAll("video[autoplay]").forEach(function (v) {
      v.removeAttribute("autoplay");
      v.removeAttribute("loop");
      try { v.pause(); v.currentTime = 0; } catch (e) {}
    });
  }

  /* --- 5. Inclinacion 3D con el puntero ----------------------- */
  function tilt() {
    var zones = document.querySelectorAll(".tilt");
    if (!zones.length || reduced.matches) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    var MAX = 9;   /* grados: suficiente para leerse como objeto, no como truco */

    zones.forEach(function (zone) {
      var frame = 0;

      function move(e) {
        if (frame) return;
        frame = window.requestAnimationFrame(function () {
          frame = 0;
          var r = zone.getBoundingClientRect();
          var px = (e.clientX - r.left) / r.width - 0.5;
          var py = (e.clientY - r.top) / r.height - 0.5;
          zone.style.setProperty("--ty", (px * MAX * 2).toFixed(2) + "deg");
          zone.style.setProperty("--tx", (-py * MAX).toFixed(2) + "deg");
        });
      }

      function rest() {
        zone.classList.remove("is-tilting");
        zone.style.setProperty("--ty", "0deg");
        zone.style.setProperty("--tx", "0deg");
      }

      zone.addEventListener("pointerenter", function () { zone.classList.add("is-tilting"); });
      zone.addEventListener("pointermove", move);
      zone.addEventListener("pointerleave", rest);
      zone.addEventListener("blur", rest, true);
    });
  }

  /* --- 6. Las palabras del titular entran una a una ---------- */
  function splitWords() {
    var hosts = document.querySelectorAll("[data-split]");
    if (!hosts.length) return;

    var n = 0;
    hosts.forEach(function (host) {
      host.querySelectorAll("span").forEach(function (line) {
        var words = line.textContent.trim().split(/\s+/);
        line.textContent = "";
        words.forEach(function (w, i) {
          var el = document.createElement("span");
          el.className = "word";
          el.textContent = w;
          el.style.setProperty("--wd", (n++) * 85 + "ms");
          line.appendChild(el);
          if (i < words.length - 1) line.appendChild(document.createTextNode(" "));
        });
      });
    });

    if (reduced.matches) {
      document.querySelectorAll(".word").forEach(function (w) { w.classList.add("is-in"); });
      return;
    }
    window.requestAnimationFrame(function () {
      document.querySelectorAll(".word").forEach(function (w) { w.classList.add("is-in"); });
    });
  }

  /* --- 7. Carrusel del grafo --------------------------------- */
  function rails() {
    document.querySelectorAll(".rail").forEach(function (rail) {
      var track = rail.querySelector(".canvas");
      var btns = rail.querySelectorAll("[data-rail]");
      if (!track || !btns.length) return;

      function paso() {
        var n = track.querySelector(".node");
        return n ? n.getBoundingClientRect().width + 28 : track.clientWidth * 0.8;
      }

      function estado() {
        var max = track.scrollWidth - track.clientWidth - 2;
        btns.forEach(function (b) {
          var dir = Number(b.getAttribute("data-rail"));
          b.disabled = dir < 0 ? track.scrollLeft <= 2 : track.scrollLeft >= max;
        });
      }

      btns.forEach(function (b) {
        b.addEventListener("click", function () {
          track.scrollBy({ left: Number(b.getAttribute("data-rail")) * paso() * 2,
                           behavior: reduced.matches ? "auto" : "smooth" });
        });
      });

      track.addEventListener("scroll", estado, { passive: true });
      window.addEventListener("resize", estado);
      estado();
    });
  }

  /* --- 8. Menu de movil y tablet ----------------------------- */
  function burger() {
    var btn = document.querySelector(".burger");
    var panel = document.getElementById("navlinks");
    if (!btn || !panel) return;

    function set(abierto) {
      btn.setAttribute("aria-expanded", abierto ? "true" : "false");
      if (abierto) panel.setAttribute("data-open", "");
      else panel.removeAttribute("data-open");
    }

    btn.addEventListener("click", function () {
      set(btn.getAttribute("aria-expanded") !== "true");
    });

    /* al elegir un destino el menu se cierra solo */
    panel.addEventListener("click", function (e) {
      if (e.target.closest("a")) set(false);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && btn.getAttribute("aria-expanded") === "true") {
        set(false); btn.focus();
      }
    });

    document.addEventListener("click", function (e) {
      if (!e.target.closest(".nav")) set(false);
    });

    /* al volver a escritorio el panel no debe quedarse abierto */
    window.matchMedia("(min-width: 1025px)").addEventListener("change", function (m) {
      if (m.matches) set(false);
    });
  }

  function start() {
    burger();
    splitWords();
    rails(); stillClips(); rises(); navByChapter(); craft(); tilt(); }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
