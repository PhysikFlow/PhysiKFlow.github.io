let deferredInstallPrompt = null;

const loginView = document.querySelector('[data-view="login"]');
const homeView = document.querySelector('[data-view="home"]');
const homeNav = document.querySelector('[data-view="home-nav"]');
const enterButton = document.querySelector("[data-enter-app]");
const installButton = document.querySelector("[data-install-app]");
const appPages = [...document.querySelectorAll("[data-page]")];
const tabTriggers = [...document.querySelectorAll("[data-tab]")];
const bottomTabs = [...document.querySelectorAll(".bottom-nav [data-tab]")];

const isStandalone = () => {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
};

const setActiveTab = (tabName, shouldUpdateHash = true) => {
  const targetTab = appPages.some((page) => page.dataset.page === tabName) ? tabName : "home";

  appPages.forEach((page) => {
    page.classList.toggle("active", page.dataset.page === targetTab);
  });

  bottomTabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.tab === targetTab);
  });

  if (shouldUpdateHash) {
    history.replaceState(null, "", `#${targetTab}`);
  }

  window.scrollTo({ top: 0, behavior: "instant" });
};

const showHome = () => {
  loginView?.classList.add("is-hidden");
  homeView?.classList.remove("is-hidden");
  homeNav?.classList.remove("is-hidden");
  setActiveTab(location.hash.replace("#", "") || "home", false);
};

const updateInstallButton = () => {
  if (!installButton) {
    return;
  }

  installButton.hidden = isStandalone() || !deferredInstallPrompt;
};

enterButton?.addEventListener("click", showHome);

tabTriggers.forEach((trigger) => {
  trigger.addEventListener("click", (event) => {
    event.preventDefault();
    showHome();
    setActiveTab(trigger.dataset.tab);
  });
});

window.addEventListener("hashchange", () => {
  if (!homeView?.classList.contains("is-hidden")) {
    setActiveTab(location.hash.replace("#", "") || "home", false);
  }
});

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  updateInstallButton();
});

installButton?.addEventListener("click", async () => {
  if (!deferredInstallPrompt) {
    updateInstallButton();
    return;
  }

  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  updateInstallButton();
});

window.addEventListener("appinstalled", () => {
  deferredInstallPrompt = null;
  updateInstallButton();
});

window.matchMedia("(display-mode: standalone)").addEventListener("change", updateInstallButton);
updateInstallButton();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {
      // The app can still run as a static page when no service worker exists.
    });
  });
}
