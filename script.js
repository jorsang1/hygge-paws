const select = document.getElementById("language");
const supportedLanguages = new Set(["en", "da", "es"]);
const localizedRouteMap = {
  "/about.html": {
    en: "/about.html",
    da: "/da/om-mig.html",
    es: "/es/sobre-mi.html"
  },
  "/da/om-mig.html": {
    en: "/about.html",
    da: "/da/om-mig.html",
    es: "/es/sobre-mi.html"
  },
  "/es/sobre-mi.html": {
    en: "/about.html",
    da: "/da/om-mig.html",
    es: "/es/sobre-mi.html"
  },
  "/terms-and-conditions.html": {
    en: "/terms-and-conditions.html",
    da: "/da/vilkar-og-betingelser.html",
    es: "/es/terminos-y-condiciones.html"
  },
  "/da/vilkar-og-betingelser.html": {
    en: "/terms-and-conditions.html",
    da: "/da/vilkar-og-betingelser.html",
    es: "/es/terminos-y-condiciones.html"
  },
  "/es/terminos-y-condiciones.html": {
    en: "/terms-and-conditions.html",
    da: "/da/vilkar-og-betingelser.html",
    es: "/es/terminos-y-condiciones.html"
  },
  "/privacy-policy.html": {
    en: "/privacy-policy.html",
    da: "/da/privatlivspolitik.html",
    es: "/es/politica-de-privacidad.html"
  },
  "/da/privatlivspolitik.html": {
    en: "/privacy-policy.html",
    da: "/da/privatlivspolitik.html",
    es: "/es/politica-de-privacidad.html"
  },
  "/es/politica-de-privacidad.html": {
    en: "/privacy-policy.html",
    da: "/da/privatlivspolitik.html",
    es: "/es/politica-de-privacidad.html"
  }
};

const removeLocalePrefix = (path) => path.replace(/^\/(da|es)(?=\/|$)/, "") || "/";

const buildLocalizedPath = (lang) => {
  const normalizedLang = supportedLanguages.has(lang) ? lang : "en";
  const localizedRoute = localizedRouteMap[window.location.pathname.toLowerCase()];
  if (localizedRoute) {
    return localizedRoute[normalizedLang];
  }

  const pathWithoutLocale = removeLocalePrefix(window.location.pathname);
  const normalizedPath = pathWithoutLocale.startsWith("/") ? pathWithoutLocale : `/${pathWithoutLocale}`;

  if (normalizedLang === "en") {
    return normalizedPath;
  }

  if (normalizedPath === "/") {
    return `/${normalizedLang}/`;
  }

  return `/${normalizedLang}${normalizedPath}`;
};

const detectBrowserLanguage = () => {
  const candidates = [
    ...(Array.isArray(navigator.languages) ? navigator.languages : []),
    navigator.language || ""
  ];
  for (const locale of candidates) {
    const code = locale.toLowerCase().split(/[-_]/)[0];
    if (["da", "es"].includes(code)) return code;
  }
  return "en";
};

const detectLanguageFromPath = () => {
  const path = window.location.pathname.toLowerCase();
  if (path === "/da" || path.startsWith("/da/")) return "da";
  if (path === "/es" || path.startsWith("/es/")) return "es";
  return "en";
};

const redirectToLanguage = (lang) => {
  const selectedLang = supportedLanguages.has(lang) ? lang : "en";
  const target = buildLocalizedPath(selectedLang);
  const hash = window.location.hash || "";
  const search = window.location.search || "";
  window.location.assign(`${target}${search}${hash}`);
};

const initializeLanguage = () => {
  const currentLanguage = detectLanguageFromPath();
  const storedLang = localStorage.getItem("hygge-paws-language");
  const preferred = storedLang || detectBrowserLanguage();
  const shouldRedirectFromRoot =
    currentLanguage === "en" &&
    window.location.pathname === "/" &&
    preferred !== "en";

  if (shouldRedirectFromRoot) {
    redirectToLanguage(preferred);
    return;
  }

  if (select) {
    select.value = currentLanguage;
  }
  localStorage.setItem("hygge-paws-language", currentLanguage);
};

if (select) {
  select.addEventListener("change", (event) => {
    const selectedLanguage = event.target.value;
    localStorage.setItem("hygge-paws-language", selectedLanguage);
    redirectToLanguage(selectedLanguage);
  });
}

// ── Header scroll behaviour ─────────────────
const siteHeader = document.getElementById("site-header");
const forceSolidHeader = siteHeader?.dataset.forceSolid === "true";
if (siteHeader && !forceSolidHeader) {
  const updateHeader = () => {
    if (window.scrollY > 60) {
      siteHeader.classList.remove("transparent");
      siteHeader.classList.add("solid");
    } else {
      siteHeader.classList.remove("solid");
      siteHeader.classList.add("transparent");
    }
  };
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });
}

// ── Hero background subtle zoom ─────────────
const heroBg = document.getElementById("hero-bg");
if (heroBg) {
  window.addEventListener("load", () => {
    heroBg.classList.add("loaded");
  });
}

// ── Mobile navigation toggle ─────────────────
const navToggle = document.getElementById("nav-toggle");
const siteNav = document.getElementById("site-nav");
if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      siteNav.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

// ── Gallery tabs ─────────────────────────────
(function initGalleryTabs() {
  const tabs = Array.from(document.querySelectorAll("[data-gallery-reveal]"));
  const openButton = document.querySelector("[data-gallery-open]");
  const featureImage = document.querySelector(".gallery-feature-image");
  const tabList = document.querySelector(".gallery-reveal");
  if (!tabs.length || !openButton || !featureImage || !tabList) return;

  const selectTab = (selectedTab) => {
    tabs.forEach((tab) => {
      const selected = tab === selectedTab;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
      document.getElementById(tab.dataset.galleryReveal).hidden = !selected;
    });
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => selectTab(tab));
    tab.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      let nextIndex;
      if (event.key === "Home") nextIndex = 0;
      else if (event.key === "End") nextIndex = tabs.length - 1;
      else nextIndex = (index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
      selectTab(tabs[nextIndex]);
      tabs[nextIndex].focus();
    });
  });

  openButton.addEventListener("click", () => {
    openButton.parentElement.hidden = true;
    featureImage.hidden = false;
    tabList.hidden = false;
    selectTab(tabs[0]);
    tabs[0].focus();
  });
})();

// ── Gallery lightbox ─────────────────────────
(function initLightbox() {
  const galleryItems = document.querySelectorAll(".gallery-item");
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxClose = document.getElementById("lightbox-close");
  const lightboxPrev = document.getElementById("lightbox-prev");
  const lightboxNext = document.getElementById("lightbox-next");

  if (!lightbox || !galleryItems.length) return;

  let currentIndex = 0;
  let activeItems = [];

  const getVisibleItems = (item) => Array.from(item.closest(".gallery-grid").querySelectorAll(".gallery-item"))
    .filter((galleryItem) => !galleryItem.hidden);
  const getImageData = (item) => {
    const img = item.querySelector("img");
    return { src: img.src, alt: img.alt };
  };

  const updateLightboxImage = () => {
    const currentItem = activeItems[currentIndex];
    if (!currentItem) return;
    const { src, alt } = getImageData(currentItem);
    lightboxImg.src = src;
    lightboxImg.alt = alt;
  };

  const openLightbox = (item) => {
    activeItems = getVisibleItems(item);
    currentIndex = activeItems.indexOf(item);
    if (currentIndex === -1) return;

    updateLightboxImage();
    lightbox.classList.add("open");
    document.body.style.overflow = "hidden";
    const mainContent = document.getElementById("main");
    if (mainContent) mainContent.setAttribute("aria-hidden", "true");
    lightboxClose.focus();
  };

  const closeLightbox = () => {
    lightbox.classList.remove("open");
    document.body.style.overflow = "";
    const mainContent = document.getElementById("main");
    if (mainContent) mainContent.removeAttribute("aria-hidden");
  };

  const showPrev = () => {
    if (!activeItems.length) return;
    currentIndex = (currentIndex - 1 + activeItems.length) % activeItems.length;
    updateLightboxImage();
  };

  const showNext = () => {
    if (!activeItems.length) return;
    currentIndex = (currentIndex + 1) % activeItems.length;
    updateLightboxImage();
  };

  galleryItems.forEach((item) => {
    item.addEventListener("click", () => openLightbox(item));
    item.setAttribute("role", "button");
    item.setAttribute("tabindex", "0");
    item.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openLightbox(item);
      }
    });
  });

  lightboxClose.addEventListener("click", closeLightbox);
  lightboxPrev.addEventListener("click", showPrev);
  lightboxNext.addEventListener("click", showNext);

  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") showPrev();
    if (e.key === "ArrowRight") showNext();
  });
})();

initializeLanguage();
