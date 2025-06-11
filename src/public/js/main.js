// Dark/light theme
const themeCookieName = 'theme';
const themeDark = 'dark';
const themeLight = 'light';

const body = document.body;

function setCookie(cname, cvalue, exdays = 365) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    const expires = "expires=" + d.toUTCString();
    document.cookie = `${cname}=${cvalue};${expires};path=/`;
}

function getCookie(cname) {
    const name = cname + "=";
    const ca = document.cookie.split(';');
    for (let c of ca) {
        while (c.charAt(0) === ' ') c = c.substring(1);
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
document.querySelectorAll('.sidebar-submenu').forEach(e => {
    e.querySelector('.sidebar-menu-dropdown').onclick = (event) => {
        event.preventDefault();
        const dropdownIcon = e.querySelector('.dropdown-icon');
        dropdownIcon.classList.toggle('active');

        const dropdownContent = e.querySelector('.sidebar-menu-dropdown-content');
        const dropdownLis = dropdownContent.querySelectorAll('li');
        const activeHeight = dropdownLis.length * dropdownLis[0].clientHeight;

        dropdownContent.classList.toggle('active');
        dropdownContent.style.height = dropdownContent.classList.contains('active') ? `${activeHeight}px` : '0';
    };
});

// Sidebar toggle e persistência
const overlay = document.querySelector('.overlay');
const mobileToggle = document.getElementById('mobile-toggle');
const sidebarClose = document.getElementById('sidebar-close');
const sidebar = document.querySelector('.sidebar');

function updateSidebarState(collapsed) {
    if (collapsed) {
        body.classList.add('sidebar-collapse');
        localStorage.setItem('sidebar', 'collapsed');
    } else {
        body.classList.remove('sidebar-collapse');
        localStorage.setItem('sidebar', 'expanded');
    }
}

if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
        const isCollapsed = body.classList.toggle('sidebar-collapse');
        updateSidebarState(body.classList.contains('sidebar-collapse'));
    });
}

if (sidebarClose) {
    sidebarClose.addEventListener('click', () => {
        body.classList.add('sidebar-collapse');
        updateSidebarState(true);
    });
}

// Ao carregar a página, aplica o estado salvo
if (localStorage.getItem('sidebar') === 'collapsed') {
    body.classList.add('sidebar-collapse');
}

// Ativa o item de menu atual
$(function () {
    const path = window.location.href;
    $(".sidebar-menu a").each(function () {
        if (this.href === path) {
            $(this).addClass("active");
        } else {
            $(this).removeClass("active");
        }
    });
});
