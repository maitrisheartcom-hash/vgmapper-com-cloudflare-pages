(function () {
  "use strict";

  function decodeExternal(value) {
    try {
      var binary = window.atob(value || "");
      var bytes = new Uint8Array(binary.length);
      for (var i = 0; i < binary.length; i += 1) {
        bytes[i] = binary.charCodeAt(i);
      }
      return new TextDecoder("utf-8").decode(bytes);
    } catch (error) {
      return "";
    }
  }

  function openExternal(link) {
    var url = decodeExternal(link.getAttribute("data-vg-external"));
    if (!/^https?:\/\//i.test(url)) return;

    var opened = window.open(url, "_blank", "noopener,noreferrer");
    if (opened) opened.opener = null;
  }

  function isHome() {
    return /^(\/|\/index\.html|\/Index\.php)?$/i.test(window.location.pathname);
  }

  function sectionName() {
    var path = window.location.pathname;
    if (/Links\.php$/i.test(path)) return "External resources";
    if (/Mappers\.php$/i.test(path)) return "Contributors";
    if (/SystemList\.php$/i.test(path)) return "Map database";
    if (/archive\//i.test(path)) return "Restore archive";
    if (/^\/Sys/i.test(path) || /^\/sys/i.test(path)) return "Game maps";
    return "VGMapper archive";
  }

  function classifyPage() {
    var isGamePage = /^\/Sys/i.test(window.location.pathname);

    document.documentElement.classList.add("vgmapper-modern");
    document.body.classList.toggle("vgmapper-home", isHome());
    document.body.classList.toggle("vg-page-links", /Links\.php$/i.test(window.location.pathname));
    document.body.classList.toggle("vg-page-mappers", /Mappers\.php$/i.test(window.location.pathname));
    document.body.classList.toggle("vg-page-game", isGamePage);
    document.body.classList.toggle("vg-page-archive", !isHome());
  }

  function insertHeader() {
    if (document.querySelector(".vg-site-header")) return;

    var header = document.createElement("header");
    header.className = "vg-site-header";
    header.innerHTML = [
      '<div class="vg-site-header__inner">',
      '  <a class="vg-brand" href="/">',
      '    <span class="vg-brand__mark">VG</span>',
      '    <span><span class="vg-brand__name">VGMapper</span><span class="vg-brand__meta">Restored video game map archive</span></span>',
      '  </a>',
      '  <nav class="vg-nav" aria-label="Primary">',
      '    <a href="/SystemList.php">Maps</a>',
      '    <a href="/Mappers.php">Mappers</a>',
      '    <a href="/Links.php">Links</a>',
      '    <a href="/archive/">Archive</a>',
      '  </nav>',
      '</div>',
    ].join("");
    document.body.insertBefore(header, document.body.firstChild);
  }

  function insertPageIntro() {
    if (isHome() || document.querySelector(".vg-page-intro")) return;

    var intro = document.createElement("section");
    intro.className = "vg-page-intro";
    intro.innerHTML = [
      '<p class="vg-page-kicker">' + sectionName() + '</p>',
      "<h1>" + escapeHtml(document.title || "VGMapper") + "</h1>",
      "<p>Restored static content from the original VGMapper archive.</p>",
    ].join("");

    var header = document.querySelector(".vg-site-header");
    if (header && header.nextSibling) {
      document.body.insertBefore(intro, header.nextSibling);
    } else {
      document.body.appendChild(intro);
    }
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function hideLegacyChrome() {
    var selectors = [
      'img[src*="MainTitle"]',
      'img[src*="ButtonMapDatabase"]',
      'img[src*="ButtonMappers"]',
      'img[src*="ButtonLinks"]',
    ];

    document.querySelectorAll(selectors.join(",")).forEach(function (image) {
      var wrapper = image.closest("table, p");
      if (wrapper) wrapper.classList.add("vg-legacy-hidden");
    });
  }

  function prepareExternalLinks() {
    document.querySelectorAll("a[data-vg-external]").forEach(function (link) {
      var remoteImages = link.querySelectorAll('img[src^="http://"], img[src^="https://"]');

      remoteImages.forEach(function (image) {
        image.classList.add("vg-missing-image");
        image.setAttribute("alt", "");
      });

      link.setAttribute("role", "link");
      link.setAttribute("tabindex", "0");
      link.setAttribute("rel", "nofollow noopener noreferrer");
      link.setAttribute("target", "_blank");
      if (!link.getAttribute("title")) {
        link.setAttribute("title", "Open external archive link");
      }
    });
  }

  function hideMissingExternalImage(image) {
    var source = image.getAttribute("src") || "";
    if (!/^https?:\/\//i.test(source)) return;
    image.classList.add("vg-missing-image");
  }

  function normalizedText(value) {
    return String(value || "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
  }

  function isDecorativeImage(image) {
    var source = image.getAttribute("src") || "";
    return image.classList.contains("vg-missing-image")
      || image.classList.contains("vg-blank-image")
      || /\/LinkBlank\.png$/i.test(source);
  }

  function prepareImages() {
    document.querySelectorAll("img").forEach(function (image) {
      var source = image.getAttribute("src") || "";

      if (/\/LinkBlank\.png$/i.test(source)) {
        image.classList.add("vg-blank-image");
      }

      if (/^https?:\/\//i.test(source)) {
        hideMissingExternalImage(image);
      } else if (image.complete && image.naturalWidth === 0) {
        image.classList.add("vg-missing-image");
      }
    });
  }

  function modernizeGameTables() {
    if (!document.body.classList.contains("vg-page-game")) return;

    document.querySelectorAll("table").forEach(function (table) {
      var rows = Array.from(table.rows || []);
      var pairedRows = false;

      for (var rowIndex = 0; rowIndex < rows.length - 1; rowIndex += 2) {
        var titleRow = rows[rowIndex];
        var linkRow = rows[rowIndex + 1];

        if (!linkRow.querySelector("a")) continue;

        var titleCells = Array.from(titleRow.cells || []);
        var linkCells = Array.from(linkRow.cells || []);

        titleRow.classList.add("vg-map-label-row");
        linkRow.classList.add("vg-map-card-row");
        pairedRows = true;

        linkCells.forEach(function (cell, index) {
          var title = normalizedText(titleCells[index] && titleCells[index].textContent);
          var link = cell.querySelector("a[data-vg-external], a[href]");

          cell.classList.add("vg-map-tile");

          if (!link) {
            if (title && !normalizedText(cell.textContent)) {
              cell.textContent = title;
            }
            return;
          }

          link.classList.add("vg-map-tile-link");

          if (title && !normalizedText(link.textContent)) {
            var label = document.createElement("span");
            label.className = "vg-map-tile-title";
            label.textContent = title;
            link.appendChild(label);
          }
        });
      }

      if (pairedRows) {
        table.classList.add("vg-map-table");
      }
    });
  }

  function cleanupLegacyCells() {
    document.querySelectorAll("td").forEach(function (cell) {
      if (normalizedText(cell.textContent)) return;

      var meaningfulImage = Array.from(cell.querySelectorAll("img")).some(function (image) {
        return !isDecorativeImage(image);
      });

      if (!meaningfulImage) {
        cell.classList.add("vg-empty-tile");
      }
    });

    document.querySelectorAll("p").forEach(function (paragraph) {
      if (normalizedText(paragraph.textContent)) return;
      if (!paragraph.querySelector("img")) return;

      var meaningfulImage = Array.from(paragraph.querySelectorAll("img")).some(function (image) {
        return !isDecorativeImage(image);
      });

      if (!meaningfulImage) {
        paragraph.classList.add("vg-legacy-hidden");
      }
    });
  }

  function boot() {
    classifyPage();
    insertHeader();
    insertPageIntro();
    hideLegacyChrome();
    prepareExternalLinks();
    prepareImages();
    modernizeGameTables();
    cleanupLegacyCells();
  }

  document.addEventListener("click", function (event) {
    var link = event.target.closest && event.target.closest("a[data-vg-external]");
    if (!link) return;

    event.preventDefault();
    openExternal(link);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Enter" && event.key !== " ") return;
    if (!event.target.matches || !event.target.matches("a[data-vg-external]")) return;

    event.preventDefault();
    openExternal(event.target);
  });

  document.addEventListener("error", function (event) {
    if (event.target && event.target.tagName === "IMG") {
      hideMissingExternalImage(event.target);
      cleanupLegacyCells();
    }
  }, true);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
