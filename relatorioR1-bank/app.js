const pages = [...document.querySelectorAll("[data-page]")];
const stack = ["home"];

const getPage = (name) => pages.find((page) => page.dataset.page === name);

const openPage = (name, pushHistory = true) => {
  const next = getPage(name);
  const current = getPage(stack[stack.length - 1]);
  if (!next || next === current) return;

  current?.classList.add("is-leaving");
  current?.classList.remove("active");

  next.classList.add("active");
  stack.push(name);
  next.scrollTop = 0;

  window.setTimeout(() => current?.classList.remove("is-leaving"), 280);

  if (pushHistory) {
    history.pushState({ page: name }, "", `#${name}`);
  }
};

const goBack = (fromHistory = false) => {
  if (stack.length <= 1) return;

  const leaving = getPage(stack.pop());
  const current = getPage(stack[stack.length - 1]);

  leaving?.classList.remove("active", "is-leaving");
  current?.classList.add("active");
  current.scrollTop = 0;

  if (!fromHistory) {
    history.back();
  }
};

document.querySelectorAll("[data-open]").forEach((trigger) => {
  trigger.addEventListener("click", () => openPage(trigger.dataset.open));
});

document.querySelectorAll("[data-back]").forEach((button) => {
  button.addEventListener("click", () => goBack(false));
});

window.addEventListener("popstate", () => {
  if (stack.length > 1) goBack(true);
});

document.querySelector("[data-toggle-balance]")?.addEventListener("click", () => {
  document.querySelector("[data-balance]")?.classList.toggle("is-hidden");
  document.querySelector("[data-balance-hidden]")?.classList.toggle("is-hidden");
});

document.querySelectorAll(".chip-row").forEach((row) => {
  row.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      row.querySelectorAll(".chip").forEach((item) => item.classList.remove("active"));
      chip.classList.add("active");
    });
  });
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => undefined);
  });
}

const hashPage = location.hash.replace("#", "");
if (hashPage && hashPage !== "home" && getPage(hashPage)) {
  openPage(hashPage, false);
  history.replaceState({ page: hashPage }, "", `#${hashPage}`);
}
