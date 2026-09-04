"use strict";

/*
====================================================
MRguldMC WEBSITE
====================================================

Minecraft:
play.mrguldmc.dk:25565

Website:
mrguld.mtcore.dk

Status API:
mcsrvstat.us
====================================================
*/


/* ==================================================
   CONFIG
================================================== */

const MR_CONFIG = {
    server: {
        host: "play.mrguldmc.dk",
        port: 25565,
        refreshRate: 15000
    },

    loading: {
        minimumTime: 650
    }
};


/* ==================================================
   STATE
================================================== */

const MR_STATE = {
    online: false,
    players: 0,
    maxPlayers: 0,
    version: "Unknown",
    loadingStatus: false
};


/* ==================================================
   HELPERS
================================================== */

function $(id) {
    return document.getElementById(id);
}

function $all(selector) {
    return document.querySelectorAll(selector);
}

function getServerAddress() {
    return `${MR_CONFIG.server.host}:${MR_CONFIG.server.port}`;
}


/* ==================================================
   LOADING SCREEN
================================================== */

function createLoadingScreen() {

    if ($("pageLoader")) {
        return $("pageLoader");
    }

    const loader = document.createElement("div");

    loader.id = "pageLoader";
    loader.className = "page-loader";

    loader.innerHTML = `
        <div class="page-loader-content">

            <img
                src="loading.png"
                alt="Loading"
                class="page-loader-icon"
            >

            <div class="page-loader-text">
                LOADING
            </div>

            <div class="page-loader-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>

        </div>
    `;

    document.body.appendChild(loader);

    return loader;
}


function showLoadingScreen() {

    const loader = createLoadingScreen();

    requestAnimationFrame(() => {
        loader.classList.remove("hidden");
        loader.classList.add("visible");
    });
}


function hideLoadingScreen() {

    const loader = $("pageLoader");

    if (!loader) {
        return;
    }

    loader.classList.remove("visible");
    loader.classList.add("hidden");

    setTimeout(() => {

        if (loader && loader.parentNode) {
            loader.parentNode.removeChild(loader);
        }

    }, 300);
}


/* ==================================================
   INITIAL PAGE LOADING
================================================== */

function initialPageLoader() {

    const loader = createLoadingScreen();

    loader.classList.add("visible");

    const startTime = Date.now();

    window.addEventListener(
        "load",
        () => {

            const elapsed =
                Date.now() - startTime;

            const remaining =
                Math.max(
                    0,
                    MR_CONFIG.loading.minimumTime - elapsed
                );

            setTimeout(
                hideLoadingScreen,
                remaining
            );

        },
        {
            once: true
        }
    );

}


/* ==================================================
   PAGE NAVIGATION LOADING
================================================== */

function setupPageNavigation() {

    const links = $all(
        'a[href$=".html"]'
    );

    links.forEach(link => {

        link.addEventListener(
            "click",
            function(event) {

                const href =
                    this.getAttribute("href");

                if (!href) {
                    return;
                }

                /*
                Don't show loader for:
                - Ctrl click
                - Shift click
                - Middle mouse
                - New tab
                - Same page
                */

                if (
                    event.ctrlKey ||
                    event.shiftKey ||
                    event.metaKey ||
                    event.button !== 0
                ) {
                    return;
                }

                const current =
                    window.location.pathname
                        .split("/")
                        .pop()
                        .toLowerCase();

                const target =
                    href
                        .split("?")[0]
                        .split("#")[0]
                        .toLowerCase();

                if (
                    target === current ||
                    (target === "index.html" &&
                     (current === "" || current === "/"))
                ) {
                    return;
                }

                /*
                External links are ignored.
                */

                if (
                    href.startsWith("http://") ||
                    href.startsWith("https://") ||
                    href.startsWith("//")
                ) {
                    return;
                }

                event.preventDefault();

                showLoadingScreen();

                setTimeout(
                    () => {
                        window.location.href = href;
                    },
                    MR_CONFIG.loading.minimumTime
                );

            }
        );

    });
}


/* ==================================================
   TOAST
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

    toastTimer = setTimeout(
        () => {
            toast.classList.remove("show");
        },
        duration
    );
}


/* ==================================================
   COPY
================================================== */

async function copyText(text) {

    try {

        if (navigator.clipboard) {

            await navigator.clipboard.writeText(text);

        } else {

            const textarea =
                document.createElement("textarea");

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
   COPY SERVER BUTTONS
================================================== */

function setupCopyButtons() {

    const buttons = $all(
        "#copyIp, [data-copy-server]"
    );

    buttons.forEach(button => {

        button.addEventListener(
            "click",
            async function(event) {

                event.preventDefault();

                const address =
                    getServerAddress();

                const success =
                    await copyText(address);

                if (success) {

                    showToast(
                        "Server IP copied!"
                    );

                    const original =
                        button.textContent;

                    button.textContent =
                        "COPIED!";

                    setTimeout(
                        () => {
                            button.textContent =
                                original;
                        },
                        1600
                    );

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
   SERVER API
================================================== */

function getServerApiUrl() {

    return (
        `https://api.mcsrvstat.us/3/` +
        `${MR_CONFIG.server.host}:` +
        `${MR_CONFIG.server.port}`
    );

}


async function updateServerStatus() {

    if (MR_STATE.loadingStatus) {
        return;
    }

    MR_STATE.loadingStatus = true;

    try {

        const response =
            await fetch(
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

        const data =
            await response.json();

        if (
            data &&
            data.online === true
        ) {

            setServerOnline(data);

        } else {

            setServerOffline();
        }

    } catch (error) {

        console.error(
            "[MRguldMC] Server API error:",
            error
        );

        setServerOffline();

    } finally {

        MR_STATE.loadingStatus = false;

    }
}


/* ==================================================
   ONLINE
================================================== */

function setServerOnline(data) {

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
        "Java Edition";


    MR_STATE.online = true;
    MR_STATE.players = players;
    MR_STATE.maxPlayers = maxPlayers;
    MR_STATE.version = version;


    updatePlayerCount(players);
    updateMaxPlayers(maxPlayers);
    updateServerVersion(version);
    updateStatusText(true);
    updateServerState(true);
    updateHeroStatus(true);
    updateStatusDot(true);
    updatePlayerProgress(
        players,
        maxPlayers
    );

}


/* ==================================================
   OFFLINE
================================================== */

function setServerOffline() {

    MR_STATE.online = false;
    MR_STATE.players = 0;
    MR_STATE.maxPlayers = 0;
    MR_STATE.version = "Offline";


    updatePlayerCount(0);
    updateMaxPlayers(0);
    updateServerVersion("Offline");
    updateStatusText(false);
    updateServerState(false);
    updateHeroStatus(false);
    updateStatusDot(false);
    updatePlayerProgress(0, 0);

}


/* ==================================================
   PLAYER COUNT
================================================== */

function updatePlayerCount(count) {

    const element =
        $("playerCount");

    if (!element) {
        return;
    }

    element.textContent =
        Number(count).toLocaleString();

}


/* ==================================================
   MAX PLAYERS
================================================== */

function updateMaxPlayers(max) {

    const element =
        $("maxPlayers");

    if (!element) {
        return;
    }

    element.textContent =
        Number(max).toLocaleString();

}


/* ==================================================
   VERSION
================================================== */

function updateServerVersion(version) {

    const element =
        $("serverVersion");

    if (!element) {
        return;
    }

    element.textContent =
        version;

}


/* ==================================================
   STATUS TEXT
================================================== */

function updateStatusText(online) {

    const element =
        $("statusText");

    if (!element) {
        return;
    }

    element.textContent =
        online
            ? "ONLINE"
            : "OFFLINE";

    element.style.color =
        online
            ? "#35ff72"
            : "#ff5264";
}


/* ==================================================
   SERVER STATE
================================================== */

function updateServerState(online) {

    const element =
        $("serverState");

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

    const element =
        $("heroStatus");

    if (!element) {
        return;
    }

    element.innerHTML =
        `
        <span class="status-dot"></span>
        ${online ? "SERVER ONLINE" : "SERVER OFFLINE"}
        `;

    element.style.color =
        online
            ? "#35ff72"
            : "#ff5264";
}


/* ==================================================
   STATUS DOT
================================================== */

function updateStatusDot(online) {

    const dot =
        $("statusDot");

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
        function(event) {

            event.preventDefault();

            const open =
                menu.classList.toggle(
                    "open"
                );

            button.setAttribute(
                "aria-expanded",
                String(open)
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


    if (!currentPage) {
        currentPage = "index.html";
    }


    const links =
        $all(
            ".nav-links a, .mobile-menu a"
        );


    links.forEach(link => {

        const href =
            link.getAttribute("href");

        if (!href) {
            return;
        }

        const clean =
            href
                .split("?")[0]
                .split("#")[0]
                .toLowerCase();


        if (clean === currentPage) {

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
   SERVER ADDRESS DATA
================================================== */

function setupServerAddress() {

    $all("[data-server-ip]")
        .forEach(element => {

            element.textContent =
                MR_CONFIG.server.host;

        });


    $all("[data-server-port]")
        .forEach(element => {

            element.textContent =
                MR_CONFIG.server.port;

        });


    $all("[data-server-address]")
        .forEach(element => {

            element.textContent =
                getServerAddress();

        });

}


/* ==================================================
   DEAD LINKS
================================================== */

function setupDeadLinks() {

    $all('a[href="#"]')
        .forEach(link => {

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
   ESCAPE KEY
================================================== */

function setupEscapeKey() {

    document.addEventListener(
        "keydown",
        event => {

            if (event.key !== "Escape") {
                return;
            }

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
    );

}


/* ==================================================
   BROWSER CONNECTION
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


/* ==================================================
   INITIALIZE
================================================== */

function initializeWebsite() {

    console.log(
        "[MRguldMC] Website initialized."
    );


    setupMobileMenu();

    setupCopyButtons();

    setupActivePage();

    setupPageNavigation();

    setupServerAddress();

    setupDeadLinks();

    setupEscapeKey();

    updateServerStatus();

}


/* ==================================================
   START
================================================== */

initialPageLoader();


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
   SERVER REFRESH
================================================== */

setInterval(
    updateServerStatus,
    MR_CONFIG.server.refreshRate
);


/* ==================================================
   REFRESH WHEN TAB BECOMES VISIBLE
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
