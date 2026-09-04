"use strict";

/*
====================================================
MRguldMC WEBSITE
====================================================

Website:
https://mrguld.mtcore.dk

Minecraft Server:
play.mrguldmc.dk:25565

API:
mcsrvstat.us

Pages:
index.html
rules.html
survival.html
store.html
staff.html
status.html
join.html
====================================================
*/


/* ==================================================
   CONFIG
================================================== */

const MR_CONFIG = {
    server: {
        host: "cookiesmp.mtcore.dk",
        port: 25565,
        refreshRate: 15000
    },

    website: {
        name: "MRguldMC",
        year: 2026
    },

    api: {
        base: "https://api.mcsrvstat.us/3"
    }
};


/* ==================================================
   GLOBAL STATE
================================================== */

const MR_STATE = {
    online: false,
    players: 0,
    maxPlayers: 0,
    version: "Unknown",
    lastUpdate: null,
    loading: false
};


/* ==================================================
   DOM HELPERS
================================================== */

function $(id) {
    return document.getElementById(id);
}

function $all(selector) {
    return document.querySelectorAll(selector);
}


/* ==================================================
   TOAST SYSTEM
================================================== */

let toastTimer = null;

function showToast(message, duration = 2500) {

    let toast = $("toast");

    if (!toast) {

        toast = document.createElement("div");

        toast.id = "toast";
        toast.className = "toast";

        document.body.appendChild(toast);
    }

    toast.textContent = message;

    toast.classList.add("show");

    if (toastTimer) {
        clearTimeout(toastTimer);
    }

    toastTimer = setTimeout(() => {

        toast.classList.remove("show");

    }, duration);
}


/* ==================================================
   COPY TO CLIPBOARD
================================================== */

async function copyText(text) {

    try {

        if (navigator.clipboard) {

            await navigator.clipboard.writeText(text);

        } else {

            const textarea = document.createElement("textarea");

            textarea.value = text;

            textarea.style.position = "fixed";
            textarea.style.opacity = "0";

            document.body.appendChild(textarea);

            textarea.focus();
            textarea.select();

            document.execCommand("copy");

            textarea.remove();
        }

        return true;

    } catch (error) {

        console.error(
            "[MRguldMC] Clipboard error:",
            error
        );

        return false;
    }
}


/* ==================================================
   SERVER IP
================================================== */

function getServerAddress() {

    return `${MR_CONFIG.server.host}:${MR_CONFIG.server.port}`;

}


/* ==================================================
   SERVER API URL
================================================== */

function getServerApiUrl() {

    const host = MR_CONFIG.server.host;
    const port = MR_CONFIG.server.port;

    return `${MR_CONFIG.api.base}/${host}:${port}`;

}


/* ==================================================
   SERVER STATUS
================================================== */

async function updateServerStatus() {

    if (MR_STATE.loading) {
        return;
    }

    MR_STATE.loading = true;

    try {

        const response = await fetch(
            getServerApiUrl(),
            {
                method: "GET",
                cache: "no-store"
            }
        );

        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }

        const data = await response.json();

        console.log(
            "[MRguldMC] Server data:",
            data
        );

        if (data && data.online === true) {

            handleServerOnline(data);

        } else {

            handleServerOffline();

        }

    } catch (error) {

        console.error(
            "[MRguldMC] Server status error:",
            error
        );

        handleServerOffline();

    } finally {

        MR_STATE.loading = false;

    }
}


/* ==================================================
   SERVER ONLINE
================================================== */

function handleServerOnline(data) {

    const players =
        Number(
            data.players?.online ?? 0
        );

    const maxPlayers =
        Number(
            data.players?.max ?? 0
        );

    const version =
        data.version ||
        data.protocol?.name ||
        "Java Edition";


    MR_STATE.online = true;

    MR_STATE.players = players;

    MR_STATE.maxPlayers = maxPlayers;

    MR_STATE.version = version;

    MR_STATE.lastUpdate = new Date();


    updatePlayerCount(players);

    updateMaxPlayers(maxPlayers);

    updateServerVersion(version);

    updateStatusText(true);

    updateHeroStatus(true);

    updateServerState(true);

    updateStatusDot(true);

    updatePlayerProgress(
        players,
        maxPlayers
    );

    updateOnlineElements(true);
}


/* ==================================================
   SERVER OFFLINE
================================================== */

function handleServerOffline() {

    MR_STATE.online = false;

    MR_STATE.players = 0;

    MR_STATE.maxPlayers = 0;

    MR_STATE.version = "Offline";

    MR_STATE.lastUpdate = new Date();


    updatePlayerCount(0);

    updateMaxPlayers(0);

    updateServerVersion("Offline");

    updateStatusText(false);

    updateHeroStatus(false);

    updateServerState(false);

    updateStatusDot(false);

    updatePlayerProgress(0, 0);

    updateOnlineElements(false);
}


/* ==================================================
   PLAYER COUNT
================================================== */

function updatePlayerCount(count) {

    const element = $("playerCount");

    if (!element) {
        return;
    }

    element.textContent = formatNumber(count);

}


/* ==================================================
   MAX PLAYERS
================================================== */

function updateMaxPlayers(max) {

    const element = $("maxPlayers");

    if (!element) {
        return;
    }

    element.textContent = formatNumber(max);

}


/* ==================================================
   SERVER VERSION
================================================== */

function updateServerVersion(version) {

    const element = $("serverVersion");

    if (!element) {
        return;
    }

    element.textContent = version;

}


/* ==================================================
   STATUS TEXT
================================================== */

function updateStatusText(online) {

    const element = $("statusText");

    if (!element) {
        return;
    }

    if (online) {

        element.textContent = "ONLINE";

        element.style.color =
            "#35ff72";

    } else {

        element.textContent = "OFFLINE";

        element.style.color =
            "#ff5264";
    }
}


/* ==================================================
   SERVER STATE
================================================== */

function updateServerState(online) {

    const element = $("serverState");

    if (!element) {
        return;
    }

    element.textContent =
        online
            ? "Online"
            : "Offline";

}


/* ==================================================
   HERO STATUS
================================================== */

function updateHeroStatus(online) {

    const element = $("heroStatus");

    if (!element) {
        return;
    }

    if (online) {

        element.innerHTML =
            `
            <span class="status-dot"></span>
            SERVER ONLINE
            `;

        element.style.color =
            "#35ff72";

    } else {

        element.innerHTML =
            `
            <span class="status-dot"></span>
            SERVER OFFLINE
            `;

        element.style.color =
            "#ff5264";
    }
}


/* ==================================================
   STATUS DOT
================================================== */

function updateStatusDot(online) {

    const dot = $("statusDot");

    if (!dot) {
        return;
    }

    if (online) {

        dot.style.background =
            "#35ff72";

        dot.style.boxShadow =
            "0 0 10px #35ff72";

    } else {

        dot.style.background =
            "#ff5264";

        dot.style.boxShadow =
            "0 0 10px #ff5264";
    }
}


/* ==================================================
   ONLINE ELEMENTS
================================================== */

function updateOnlineElements(online) {

    const elements =
        $all("[data-server-status]");

    elements.forEach(element => {

        element.textContent =
            online
                ? "ONLINE"
                : "OFFLINE";

        element.classList.toggle(
            "online",
            online
        );

        element.classList.toggle(
            "offline",
            !online
        );

    });
}


/* ==================================================
   PLAYER PROGRESS
================================================== */

function updatePlayerProgress(
    players,
    maxPlayers
) {

    const progress =
        $("playerProgress");

    if (!progress) {
        return;
    }

    let percentage = 0;

    if (maxPlayers > 0) {

        percentage =
            (players / maxPlayers) * 100;
    }

    percentage =
        Math.max(
            0,
            Math.min(
                100,
                percentage
            )
        );

    progress.style.width =
        `${percentage}%`;

}


/* ==================================================
   COPY SERVER IP
================================================== */

function setupCopyButtons() {

    const buttons =
        $all(
            "#copyIp, [data-copy-server]"
        );

    buttons.forEach(button => {

        button.addEventListener(
            "click",
            async event => {

                event.preventDefault();

                const address =
                    getServerAddress();

                const success =
                    await copyText(address);

                if (success) {

                    showToast(
                        "Server IP copied!"
                    );

                    button.classList.add(
                        "copied"
                    );

                    const originalText =
                        button.textContent;

                    button.textContent =
                        "COPIED!";

                    setTimeout(() => {

                        button.textContent =
                            originalText;

                        button.classList.remove(
                            "copied"
                        );

                    }, 1600);

                } else {

                    showToast(
                        `Server IP: ${address}`
                    );
                }

            }
        );

    });
}


/* ==================================================
   MOBILE MENU
================================================== */

function setupMobileMenu() {

    const button =
        $("menuButton");

    const menu =
        $("mobileMenu");

    if (!button || !menu) {
        return;
    }


    button.setAttribute(
        "aria-expanded",
        "false"
    );


    button.addEventListener(
        "click",
        event => {

            event.preventDefault();

            const isOpen =
                menu.classList.toggle(
                    "open"
                );

            button.setAttribute(
                "aria-expanded",
                String(isOpen)
            );

        }
    );


    const links =
        menu.querySelectorAll("a");


    links.forEach(link => {

        link.addEventListener(
            "click",
            () => {

                menu.classList.remove(
                    "open"
                );

                button.setAttribute(
                    "aria-expanded",
                    "false"
                );

            }
        );

    });


    document.addEventListener(
        "click",
        event => {

            if (
                !menu.contains(event.target) &&
                !button.contains(event.target)
            ) {

                menu.classList.remove(
                    "open"
                );

                button.setAttribute(
                    "aria-expanded",
                    "false"
                );
            }

        }
    );


    window.addEventListener(
        "resize",
        () => {

            if (window.innerWidth > 1000) {

                menu.classList.remove(
                    "open"
                );

                button.setAttribute(
                    "aria-expanded",
                    "false"
                );
            }

        }
    );
}


/* ==================================================
   ACTIVE PAGE
================================================== */

function setupActivePage() {

    let currentPage =
        window.location.pathname
            .split("/")
            .pop()
            .toLowerCase();


    if (
        !currentPage ||
        currentPage === "/"
    ) {

        currentPage =
            "index.html";
    }


    const links =
        $all(
            ".nav-links a, .mobile-menu a, .footer-links a"
        );


    links.forEach(link => {

        const href =
            link.getAttribute("href");

        if (!href) {
            return;
        }


        if (
            href.startsWith("#") ||
            href.startsWith("http") ||
            href.startsWith("mailto:")
        ) {

            return;
        }


        const cleanHref =
            href
                .split("?")[0]
                .split("#")[0]
                .toLowerCase();


        if (
            cleanHref === currentPage
        ) {

            link.classList.add(
                "active"
            );

        } else {

            link.classList.remove(
                "active"
            );
        }

    });
}


/* ==================================================
   PREVENT DEAD # LINKS
================================================== */

function setupSafeLinks() {

    const links =
        $all('a[href="#"]');

    links.forEach(link => {

        link.addEventListener(
            "click",
            event => {

                event.preventDefault();

                showToast(
                    "This feature is coming soon."
                );

            }
        );

    });
}


/* ==================================================
   KEYBOARD SHORTCUT
================================================== */

function setupKeyboardShortcuts() {

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape"
            ) {

                const menu =
                    $("mobileMenu");

                const button =
                    $("menuButton");

                if (menu) {

                    menu.classList.remove(
                        "open"
                    );
                }

                if (button) {

                    button.setAttribute(
                        "aria-expanded",
                        "false"
                    );
                }
            }

        }
    );
}


/* ==================================================
   PAGE FADE
================================================== */

function setupPageTransitions() {

    const links =
        $all(
            'a[href$=".html"]'
        );


    links.forEach(link => {

        link.addEventListener(
            "click",
            event => {

                const href =
                    link.getAttribute("href");

                if (!href) {
                    return;
                }

                if (
                    event.ctrlKey ||
                    event.shiftKey ||
                    event.metaKey ||
                    event.button !== 0
                ) {
                    return;
                }

                if (
                    href.startsWith("http")
                ) {
                    return;
                }

                document.body.classList.add(
                    "page-leaving"
                );

            }
        );

    });
}


/* ==================================================
   SERVER ADDRESS ELEMENTS
================================================== */

function setupServerAddressElements() {

    const elements =
        $all(
            "[data-server-ip]"
        );


    elements.forEach(element => {

        element.textContent =
            MR_CONFIG.server.host;

    });


    const portElements =
        $all(
            "[data-server-port]"
        );


    portElements.forEach(element => {

        element.textContent =
            MR_CONFIG.server.port;

    });


    const fullAddressElements =
        $all(
            "[data-server-address]"
        );


    fullAddressElements.forEach(element => {

        element.textContent =
            getServerAddress();

    });
}


/* ==================================================
   CURRENT YEAR
================================================== */

function setupCurrentYear() {

    const elements =
        $all(
            "[data-current-year]"
        );


    elements.forEach(element => {

        element.textContent =
            MR_CONFIG.website.year;

    });
}


/* ==================================================
   SERVER API DEBUG
================================================== */

function setupDebugInformation() {

    window.MRguldMC = {

        config: MR_CONFIG,

        state: MR_STATE,

        refresh: updateServerStatus,

        server:
            getServerAddress()

    };

}


/* ==================================================
   INITIALIZE
================================================== */

function initializeWebsite() {

    console.log(
        `%cMRguldMC%c website loaded`,
        "color:#35ff72;font-weight:bold;",
        "color:#ffffff;"
    );


    setupMobileMenu();

    setupCopyButtons();

    setupActivePage();

    setupSafeLinks();

    setupKeyboardShortcuts();

    setupPageTransitions();

    setupServerAddressElements();

    setupCurrentYear();

    setupDebugInformation();


    updateServerStatus();

}


/* ==================================================
   START WEBSITE
================================================== */

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeWebsite
    );

} else {

    initializeWebsite();

}


/* ==================================================
   AUTO SERVER REFRESH
================================================== */

setInterval(
    updateServerStatus,
    MR_CONFIG.server.refreshRate
);


/* ==================================================
   TAB VISIBILITY
================================================== */

document.addEventListener(
    "visibilitychange",
    () => {

        if (
            document.visibilityState === "visible"
        ) {

            updateServerStatus();

        }

    }
);


/* ==================================================
   ONLINE / OFFLINE BROWSER STATUS
================================================== */

window.addEventListener(
    "online",
    () => {

        showToast(
            "Connection restored."
        );

        updateServerStatus();

    }
);


window.addEventListener(
    "offline",
    () => {

        showToast(
            "You are currently offline."
        );

    }
);