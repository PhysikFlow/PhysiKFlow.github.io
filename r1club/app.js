let deferredInstallPrompt = null;

const loginView = document.querySelector('[data-view="login"]');
const homeView = document.querySelector('[data-view="home"]');
const homeNav = document.querySelector('[data-view="home-nav"]');
const enterButton = document.querySelector("[data-enter-app]");
const installButton = document.querySelector("[data-install-app]");

const isStandalone = () => {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
};

const showHome = () => {
  loginView?.classList.add("is-hidden");
  homeView?.classList.remove("is-hidden");
  homeNav?.classList.remove("is-hidden");
  window.scrollTo({ top: 0, behavior: "instant" });
};

const updateInstallButton = () => {
  if (!installButton) {
    return;
  }

  installButton.hidden = isStandalone() || !deferredInstallPrompt;
};

enterButton?.addEventListener("click", showHome);

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
