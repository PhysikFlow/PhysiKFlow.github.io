const pages = [...document.querySelectorAll("[data-page]")];
const stack = ["home"];
const FIN_KEY = "pf-financial-visible";

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

const maskFinancial = (value) => {
  const amount = Number.parseFloat(value);
  if (!Number.isFinite(amount)) return "R$ ••••";
  if (amount >= 10000) return "R$ ••••••";
  if (amount >= 1000) return "R$ ••••";
  return "R$ •••";
};

let financialVisible = sessionStorage.getItem(FIN_KEY) === "1";

const applyFinancialToElement = (node) => {
  const raw = node.dataset.fin;
  if (raw === undefined) return;
  node.textContent = financialVisible ? money.format(Number.parseFloat(raw)) : maskFinancial(raw);
};

const renderFinancialValues = (visible) => {
  financialVisible = visible;
  document.body.classList.toggle("financial-visible", visible);
  document.body.classList.toggle("financial-hidden", !visible);
  document.querySelectorAll("[data-fin]").forEach(applyFinancialToElement);
  sessionStorage.setItem(FIN_KEY, visible ? "1" : "0");
  window.PFGestao?.onFinancialToggle?.(visible);
};

renderFinancialValues(financialVisible);

window.PFGestao = {
  ...window.PFGestao,
  applyFinancialToElement,
  refreshFinancialDisplay: () => renderFinancialValues(financialVisible),
  onUnitSelected() {
    if (stack[stack.length - 1] === "unidades") goBack(false);
  }
};

const toggleFinancial = () => renderFinancialValues(!financialVisible);

document.querySelectorAll("[data-toggle-financial]").forEach((button) => {
  button.addEventListener("click", toggleFinancial);
});

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

  window.setTimeout(() => current?.classList.remove("is-leaving"), 320);

  if (pushHistory) {
    history.pushState({ page: name, stackDepth: stack.length }, "", `#${name}`);
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

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => undefined);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  window.PFGestao?.initAuth?.();

  const hashPage = location.hash.replace("#", "");
  if (hashPage && hashPage !== "home" && getPage(hashPage)) {
    openPage(hashPage, false);
    history.replaceState({ page: hashPage, stackDepth: stack.length }, "", `#${hashPage}`);
  }
});
