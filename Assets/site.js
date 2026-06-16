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

  function prepareExternalLinks() {
    var links = document.querySelectorAll("a[data-vg-external]");
    links.forEach(function (link) {
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

  function prepareImages() {
    document.querySelectorAll("img").forEach(function (image) {
      if (image.complete && image.naturalWidth === 0) {
        hideMissingExternalImage(image);
      }
    });
  }

  document.documentElement.classList.add("vgmapper-modern");

  if (/^(\/|\/index\.html|\/Index\.php)?$/i.test(window.location.pathname)) {
    document.body.classList.add("vgmapper-home");
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
    }
  }, true);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      prepareExternalLinks();
      prepareImages();
    });
  } else {
    prepareExternalLinks();
    prepareImages();
  }
})();
