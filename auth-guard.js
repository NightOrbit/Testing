/**
 * ⚡ NightOrbit CodeForge — Auth Guard V16 HEAVY
 * Include this in every protected page: <script src="auth-guard.js"></script>
 *
 * Changes from V15:
 *  - Updates lastLogin + sessionStart on every page load
 *  - Refreshes device info (in case user switched device)
 *  - Dispatches auth-ready event WITH full user data
 *  - Prevents redirect loops
 *  - Silent error handling (won't break page if DB write fails)
 */
(function() {
    'use strict';

    /* ═══════════════════════════════════════════════════════════
       FIREBASE CONFIG — databaseURL MUST for Realtime Database
       ═══════════════════════════════════════════════════════════ */
    var firebaseConfig = {
        apiKey: "AIzaSyCMYIa1YwahQRF_EGizjR1Xjj4aD9uBN_o",
        authDomain: "nightorbitbuilder.firebaseapp.com",
        databaseURL: "https://nightorbitbuilder-default-rtdb.firebaseio.com",
        projectId: "nightorbitbuilder",
        storageBucket: "nightorbitbuilder.firebasestorage.app",
        messagingSenderId: "537115613677",
        appId: "1:537115613677:web:6653804e11c47ed746efe4"
    };

    /* ═══ INJECT LOADER STYLES ═══ */
    var style = document.createElement('style');
    style.id = 'auth-guard-style';
    style.textContent =
        'html, body { visibility: hidden !important; opacity: 0 !important; }' +
        '#auth-guard-loader { position: fixed; inset: 0; z-index: 9999999;' +
        ' background: radial-gradient(circle at 50% 30%, #0b0b1a 0%, #000 100%);' +
        ' display: flex; flex-direction: column; align-items: center; justify-content: center;' +
        ' visibility: visible !important; opacity: 1 !important; font-family: "Segoe UI", sans-serif; }' +
        '#auth-guard-loader .ag-spinner { width: 60px; height: 60px;' +
        ' border: 5px solid rgba(0,240,255,0.15); border-top: 5px solid #00f0ff;' +
        ' border-radius: 50%; animation: ag-spin 1s linear infinite;' +
        ' box-shadow: 0 0 40px rgba(0,240,255,0.3); margin-bottom: 20px; }' +
        '#auth-guard-loader .ag-text { font-family: "Orbitron", "Segoe UI", sans-serif;' +
        ' font-size: 12px; color: #00f0ff; letter-spacing: 4px; text-transform: uppercase; }' +
        '@keyframes ag-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
    document.head.appendChild(style);

    /* ═══ INJECT LOADER ELEMENT ═══ */
    var loader = document.createElement('div');
    loader.id = 'auth-guard-loader';
    loader.innerHTML = '<div class="ag-spinner"></div><div class="ag-text">Verifying Access...</div>';

    if (document.body) document.body.appendChild(loader);
    else document.addEventListener('DOMContentLoaded', function() { document.body.appendChild(loader); });

    /* ═══ REDIRECT TO LOGIN (loop-safe) ═══ */
    function redirectToLogin() {
        try {
            var current = window.location.pathname.split('/').pop() || 'dashboard.html';
            // Don't redirect if already on index.html (prevents loop)
            if (current === 'index.html' || current === '' || current === '/') return;
            sessionStorage.setItem('redirectAfterLogin', current);
        } catch (e) {}
        window.location.replace('index.html');
    }

    /* ═══ SHOW PAGE (REMOVE LOADER) ═══ */
    function showPage() {
        var s = document.getElementById('auth-guard-style');
        if (s) s.remove();
        var l = document.getElementById('auth-guard-loader');
        if (l) l.remove();
        document.documentElement.style.visibility = 'visible';
        document.documentElement.style.opacity = '1';
        if (document.body) {
            document.body.style.visibility = 'visible';
            document.body.style.opacity = '1';
        }
    }

    /* ═══ DYNAMIC SCRIPT LOADER ═══ */
    function loadScript(src, cb) {
        var s = document.createElement('script');
        s.src = src;
        s.onload = cb;
        s.onerror = function() { redirectToLogin(); };
        document.head.appendChild(s);
    }

    /* ═══ TIME HELPER ═══ */
    function getFullTime() {
        var d = new Date();
        return d.toLocaleString('en-PK', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
    }

    /* ═══ DEVICE HELPERS (mini version) ═══ */
    function detectOS() {
        var ua = navigator.userAgent;
        var platform = navigator.platform || '';
        if (/Windows NT 10/.test(ua)) return { name: 'Windows', version: '10/11' };
        if (/Windows NT 6\.3/.test(ua)) return { name: 'Windows', version: '8.1' };
        if (/Windows NT 6\.2/.test(ua)) return { name: 'Windows', version: '8' };
        if (/Windows NT 6\.1/.test(ua)) return { name: 'Windows', version: '7' };
        if (/Mac OS X ([\d_]+)/.test(ua)) {
            var m = ua.match(/Mac OS X ([\d_]+)/);
            return { name: 'macOS', version: m ? m[1].replace(/_/g, '.') : 'Unknown' };
        }
        if (/iPhone OS ([\d_]+)/.test(ua)) {
            var m2 = ua.match(/iPhone OS ([\d_]+)/);
            return { name: 'iOS', version: m2 ? m2[1].replace(/_/g, '.') : 'Unknown' };
        }
        if (/Android ([\d.]+)/.test(ua)) {
            var m4 = ua.match(/Android ([\d.]+)/);
            return { name: 'Android', version: m4 ? m4[1] : 'Unknown' };
        }
        if (/Linux/.test(ua)) return { name: 'Linux', version: 'Unknown' };
        return { name: platform || 'Unknown', version: 'Unknown' };
    }

    function detectBrowser() {
        var ua = navigator.userAgent;
        if (/Edg\/([\d.]+)/.test(ua)) {
            var m = ua.match(/Edg\/([\d.]+)/);
            return { name: 'Edge', version: m[1] };
        }
        if (/OPR\/([\d.]+)/.test(ua)) {
            var m2 = ua.match(/OPR\/([\d.]+)/);
            return { name: 'Opera', version: m2[1] };
        }
        if (/Chrome\/([\d.]+)/.test(ua) && !/Edg|OPR/.test(ua)) {
            var m3 = ua.match(/Chrome\/([\d.]+)/);
            return { name: 'Chrome', version: m3[1] };
        }
        if (/Firefox\/([\d.]+)/.test(ua)) {
            var m4 = ua.match(/Firefox\/([\d.]+)/);
            return { name: 'Firefox', version: m4[1] };
        }
        if (/Safari\/([\d.]+)/.test(ua) && !/Chrome/.test(ua)) {
            var m5 = ua.match(/Version\/([\d.]+)/);
            return { name: 'Safari', version: m5 ? m5[1] : 'Unknown' };
        }
        return { name: 'Unknown', version: 'Unknown' };
    }

    function getDeviceName() {
        var os = detectOS();
        if (os.name === 'Android') {
            var m = navigator.userAgent.match(/Android\s[\d.]+;\s([^)]+)/);
            return m ? m[1].trim() : 'Android Device';
        }
        if (os.name === 'iOS') return 'iPhone';
        if (os.name === 'Windows') return 'Windows ' + os.version + ' PC';
        if (os.name === 'macOS') return 'Mac';
        if (os.name === 'Linux') return 'Linux PC';
        return navigator.platform || 'Unknown Device';
    }

    function getDeviceType() {
        var ua = navigator.userAgent;
        if (/iPad|Tablet/i.test(ua)) return 'Tablet';
        if (/Mobi|Android|iPhone/i.test(ua)) return 'Mobile';
        return 'Desktop';
    }

    /* ═══ UPDATE SESSION + LAST LOGIN ═══ */
    async function updateSessionData(db, user) {
        try {
            var now = Date.now();
            var nowStr = getFullTime();
            var os = detectOS();
            var browser = detectBrowser();

            await db.ref('users/' + user.uid).update({
                lastLogin: now,
                lastLoginTime: nowStr,
                sessionStart: now,
                sessionStartTime: nowStr,
                deviceName: getDeviceName(),
                deviceType: getDeviceType(),
                os: os.name,
                osVersion: os.version,
                browser: browser.name,
                browserVersion: browser.version,
                screenSize: window.screen.width + ' x ' + window.screen.height,
                viewport: window.innerWidth + ' x ' + window.innerHeight,
                language: navigator.language || 'Unknown',
                lastActivePage: window.location.pathname.split('/').pop() || 'dashboard.html'
            });
            console.log('%c📝 Session updated', 'color:#ffd700;');
        } catch (e) {
            // Silent fail — don't break page
            console.warn('⚠️ Session update failed (rules?):', e.message);
        }
    }

    /* ═══ AUTH GUARD INIT ═══ */
    function initGuard() {
        try {
            if (!firebase.apps.length) {
                firebase.initializeApp(firebaseConfig);
                console.log('%c🔥 Firebase initialized', 'color:#ffd700;font-weight:bold;');
            }
            var auth = firebase.auth();
            var db = firebase.database();
            var resolved = false;

            var timeout = setTimeout(function() {
                if (!resolved) {
                    console.warn('⚠️ Auth timeout — redirecting to login');
                    resolved = true;
                    redirectToLogin();
                }
            }, 8000);

            auth.onAuthStateChanged(function(user) {
                if (resolved) return;
                resolved = true;
                clearTimeout(timeout);

                if (user) {
                    window.__currentUser = user;

                    // Update session in background (non-blocking)
                    updateSessionData(db, user);

                    // Show page immediately
                    showPage();

                    console.log('%c👤 Auth success:', 'color:#00ff64;font-weight:bold;', user.email);

                    /* ═══ FIRE EVENTS WITH FULL CONTEXT ═══ */
                    var detail = {
                        user: user,
                        email: user.email,
                        uid: user.uid,
                        displayName: user.displayName,
                        photoURL: user.photoURL,
                        emailVerified: user.emailVerified,
                        deviceInfo: {
                            deviceName: getDeviceName(),
                            deviceType: getDeviceType(),
                            os: detectOS(),
                            browser: detectBrowser(),
                            screenSize: window.screen.width + ' x ' + window.screen.height,
                            language: navigator.language
                        },
                        sessionStartTime: getFullTime(),
                        timestamp: Date.now()
                    };

                    document.dispatchEvent(new CustomEvent('auth-ready', { detail: detail }));
                    document.dispatchEvent(new CustomEvent('auth-guard-ready', { detail: detail }));
                } else {
                    console.warn('⚠️ No user — redirecting to login');
                    redirectToLogin();
                }
            });
        } catch (e) {
            console.error('❌ Auth Guard error:', e);
            redirectToLogin();
        }
    }

    /* ═══ SCRIPT LOADING STRATEGY ═══ */
    if (typeof firebase === 'undefined') {
        loadScript('https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js', function() {
            loadScript('https://www.gstatic.com/firebasejs/9.6.1/firebase-auth-compat.js', function() {
                loadScript('https://www.gstatic.com/firebasejs/9.6.1/firebase-database-compat.js', function() {
                    initGuard();
                });
            });
        });
    } else {
        initGuard();
    }
})();
