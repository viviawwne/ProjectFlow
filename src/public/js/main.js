// Dark/light theme
const themeCookieName = "theme";
const themeDark = "dark";
const themeLight = "light";

const body = document.body;

function setCookie(cname, cvalue, exdays = 365) {
  const d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  const expires = "expires=" + d.toUTCString();
  document.cookie = `${cname}=${cvalue};${expires};path=/`;
}

function getCookie(cname) {
  const name = cname + "=";
  const ca = document.cookie.split(";");
  for (let c of ca) {
    while (c.charAt(0) === " ") c = c.substring(1);
    if (c.indexOf(name) === 0) return c.substring(name.length, c.length);
  }
  return "";
}

function loadTheme() {
  const theme = getCookie(themeCookieName);
  body.classList.add(theme === "" ? themeLight : theme);
}

function switchTheme() {
  if (body.classList.contains(themeLight)) {
    body.classList.remove(themeLight);
    body.classList.add(themeDark);
    setCookie(themeCookieName, themeDark);
  } else {
    body.classList.remove(themeDark);
    body.classList.add(themeLight);
    setCookie(themeCookieName, themeLight);
  }
}

loadTheme();

// Sidebar menu (dropdown)
document.querySelectorAll(".sidebar-submenu").forEach((e) => {
  e.querySelector(".sidebar-menu-dropdown").onclick = (event) => {
    event.preventDefault();
    const dropdownIcon = e.querySelector(".dropdown-icon");
    dropdownIcon.classList.toggle("active");

    const dropdownContent = e.querySelector(".sidebar-menu-dropdown-content");
    const dropdownLis = dropdownContent.querySelectorAll("li");
    const activeHeight = dropdownLis.length * dropdownLis[0].clientHeight;

    dropdownContent.classList.toggle("active");
    dropdownContent.style.height = dropdownContent.classList.contains("active")
      ? `${activeHeight}px`
      : "0";
  };
});

// Sidebar toggle e persistência

// ============== INÍCIO DA LÓGICA CORRIGIDA DA SIDEBAR ==============

// Seleciona os elementos do DOM
const overlay = document.querySelector(".overlay");
const mobileToggleBtn = document.getElementById("mobile-toggle"); // Botão de Abrir (Hambúrguer)
const sidebarCloseBtn = document.getElementById("sidebar-close"); // Botão de Fechar (X)
const bodyElement = document.body;
const sidebar = document.querySelector(".sidebar");

// Adiciona overlay se não existir
if (!document.querySelector(".overlay")) {
  const overlayDiv = document.createElement("div");
  overlayDiv.className = "overlay";
  document.body.appendChild(overlayDiv);
}
// Atualiza referência do overlay após possível criação
const overlayAtual = document.querySelector(".overlay");

// Função para salvar o estado da sidebar (colapsado ou expandido)
function updateSidebarState(isCollapsed) {
  if (isCollapsed) {
    bodyElement.classList.add("sidebar-collapse");
    bodyElement.classList.remove("sidebar-open");
    localStorage.setItem("sidebar", "collapsed");
    if (overlay) overlay.classList.remove("active");
    if (sidebar) sidebar.classList.remove("active");
  } else {
    bodyElement.classList.remove("sidebar-collapse");
    bodyElement.classList.add("sidebar-open");
    localStorage.setItem("sidebar", "expanded");
    if (overlay) overlay.classList.add("active");
    if (sidebar) sidebar.classList.add("active");
  }
}

// Função para garantir que o sidebar e overlay estejam sincronizados com o estado salvo
function syncSidebarWithState() {
  const isCollapsed = localStorage.getItem("sidebar") === "collapsed";
  if (isCollapsed) {
    bodyElement.classList.add("sidebar-collapse");
    bodyElement.classList.remove("sidebar-open");
    if (overlayAtual) overlayAtual.classList.remove("active");
    if (sidebar) sidebar.classList.remove("active");
  } else {
    bodyElement.classList.remove("sidebar-collapse");
    bodyElement.classList.add("sidebar-open");
    if (overlayAtual) overlayAtual.classList.add("active");
    if (sidebar) sidebar.classList.add("active");
  }
}

// Corrige possíveis estados inconsistentes ao redimensionar
window.addEventListener("resize", syncSidebarWithState);

// Garante sincronização ao carregar
syncSidebarWithState();

// Evento para ABRIR/FECHAR a sidebar com o botão principal (hambúrguer)
if (mobileToggleBtn) {
  mobileToggleBtn.addEventListener("click", () => {
    const isCollapsed = bodyElement.classList.toggle("sidebar-collapse");
    if (!isCollapsed) {
      bodyElement.classList.add("sidebar-open");
      if (overlayAtual) overlayAtual.classList.add("active");
      if (sidebar) sidebar.classList.add("active");
    } else {
      bodyElement.classList.remove("sidebar-open");
      if (overlayAtual) overlayAtual.classList.remove("active");
      if (sidebar) sidebar.classList.remove("active");
    }
    updateSidebarState(isCollapsed);
    console.log("Botão Toggle clicado. Estado colapsado:", isCollapsed);
  });
}

// Evento para FECHAR a sidebar com o botão 'X' de dentro do menu
if (sidebarCloseBtn) {
  sidebarCloseBtn.addEventListener("click", () => {
    updateSidebarState(true);
    if (overlayAtual) overlayAtual.classList.remove("active");
    if (sidebar) sidebar.classList.remove("active");
    console.log("Botão Fechar (X) clicado.");
  });
}

// Evento para FECHAR a sidebar ao clicar no overlay (fundo escuro)
if (overlayAtual) {
  overlayAtual.addEventListener("click", () => {
    updateSidebarState(true);
    overlayAtual.classList.remove("active");
    if (sidebar) sidebar.classList.remove("active");
    console.log("Overlay clicado.");
  });
}

// Ao carregar a página, verifica se a sidebar deveria começar fechada
// Isso respeita a escolha do usuário da última visita
document.addEventListener("DOMContentLoaded", () => {
  bodyElement.classList.add("sidebar-expand");
  if (localStorage.getItem("sidebar") === "collapsed") {
    bodyElement.classList.add("sidebar-collapse");
    bodyElement.classList.remove("sidebar-open");
    if (overlay) overlay.classList.remove("active");
    if (sidebar) sidebar.classList.remove("active");
  } else {
    bodyElement.classList.remove("sidebar-collapse");
    bodyElement.classList.add("sidebar-open");
    if (overlay) overlay.classList.add("active");
    if (sidebar) sidebar.classList.add("active");
  }
});

// ============== FIM DA LÓGICA CORRIGIDA DA SIDEBAR ==============
