/**
 * Memorare Counseling — Site Script
 * Loads config.json and populates the page dynamically.
 */

(function () {
  "use strict";

  // --- SVG icons for service cards ---
  const ICONS = {
    person: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>',
    people: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>',
    heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>',
    cross: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2v20M7 7h10"/></svg>'
  };

  // --- Resolve nested keys like "about.heading" ---
  function resolve(obj, path) {
    return path.split(".").reduce(function (o, k) {
      return o && o[k];
    }, obj);
  }

  // --- Populate simple text bindings ---
  function bindText(config) {
    var els = document.querySelectorAll("[data-config]");
    els.forEach(function (el) {
      var key = el.getAttribute("data-config");
      var val = resolve(config, key);
      if (val) el.textContent = val;
    });
  }

  // --- Set all Calendly links ---
  function bindCalendly(url) {
    var els = document.querySelectorAll("[data-calendly]");
    els.forEach(function (el) {
      el.href = url;
      el.target = "_blank";
      el.rel = "noopener noreferrer";
    });
  }

  // --- Build service cards ---
  function buildServices(services) {
    var grid = document.getElementById("services-grid");
    if (!grid || !services) return;

    grid.innerHTML = services
      .map(function (s) {
        var icon = ICONS[s.icon] || ICONS.person;
        return (
          '<div class="card">' +
          '<div class="card-icon">' + icon + "</div>" +
          "<h3>" + escapeHtml(s.name) + "</h3>" +
          "<p>" + escapeHtml(s.description) + "</p>" +
          "</div>"
        );
      })
      .join("");
  }

  // --- Build pricing cards ---
  function buildPricing(pricing, calendlyUrl) {
    var grid = document.getElementById("pricing-grid");
    if (!grid || !pricing) return;

    grid.innerHTML = pricing
      .map(function (p) {
        return (
          '<div class="card">' +
          "<h3>" + escapeHtml(p.name) + "</h3>" +
          '<div class="card-price">' + escapeHtml(p.price) + "</div>" +
          '<div class="card-duration">' + escapeHtml(p.duration) + "</div>" +
          "<p>" + escapeHtml(p.description) + "</p>" +
          "</div>"
        );
      })
      .join("");
  }

  // --- Prevent XSS from config values ---
  function escapeHtml(str) {
    if (!str) return "";
    var div = document.createElement("div");
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  // --- Mobile nav toggle ---
  function setupNav() {
    var toggle = document.getElementById("nav-toggle");
    var links = document.getElementById("nav-links");
    if (!toggle || !links) return;

    toggle.addEventListener("click", function () {
      toggle.classList.toggle("open");
      links.classList.toggle("open");
    });

    // Close nav when a link is clicked
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        toggle.classList.remove("open");
        links.classList.remove("open");
      });
    });
  }

  // --- Nav shadow on scroll ---
  function setupScrollEffects() {
    var nav = document.getElementById("nav");
    if (!nav) return;

    window.addEventListener("scroll", function () {
      if (window.scrollY > 10) {
        nav.classList.add("scrolled");
      } else {
        nav.classList.remove("scrolled");
      }
    });
  }

  // --- Set current year in footer ---
  function setYear() {
    var el = document.getElementById("current-year");
    if (el) el.textContent = new Date().getFullYear();
  }

  // --- Init ---
  function init() {
    setupNav();
    setupScrollEffects();
    setYear();

    fetch("config.json")
      .then(function (res) {
        if (!res.ok) throw new Error("Failed to load config.json");
        return res.json();
      })
      .then(function (config) {
        bindText(config);
        bindCalendly(config.calendlyUrl || "#");
        buildServices(config.services);
        buildPricing(config.pricing, config.calendlyUrl);
        document.body.classList.add("config-loaded");
      })
      .catch(function (err) {
        console.error("Could not load site configuration:", err);
        document.body.classList.add("config-loaded");
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
