/**
 * ═══════════════════════════════════════════════════════════════
 *  🔐 NightOrbit CodeForge — Auth Guard v15 HEAVY (FULL FIX)
 * ═══════════════════════════════════════════════════════════════
 *  Include in every protected page:
 *      <script src="auth-guard.js"></script>
 * ═══════════════════════════════════════════════════════════════
 */
(function() {
    'use strict';

    /* ═══ CONFIG ═══ */
    var firebaseConfig = {
        apiKey: "AIzaSyCMYIa1YwahQRF_EGizjR1Xjj4aD9uBN_o",
        authDomain: "nightorbitbuilder.firebaseapp.com",
        projectId: "nightorbitbuilder",
        storageBucket: "nightorbitbuilder.firebasestorage.app",
        messagingSenderId: "537115613677",
        appId: "1:537115613677:web:6653804e11c47ed746efe4"
    };

    var LOGIN_PAGE = 'index.html';
    var AUTH_TIMEOUT_MS = 8000;
    var SESSION_TIMEOUT_MS = 30 * 60 * 1000;

    /* ═══ STATE ═══ */
    var state = {
        initialized: false,
        user: null,
        authChecked: false,
        timeoutHandle: null,
        sessionTimer: null
    };

    /* ═══ UTILITIES ═══ */
    function log(msg) {
        try {
            if (window.console && window.console.log) {
                window.console.log('[AUTH-GUARD]', msg);
            }
        } catch(e) {}
    }

    function redirectToLogin(reason) {
        log('Redirecting to login: ' + (reason || 'not authenticated'));
        try {
            var p = window.location.pathname.split('/').pop() || 'dashboard.html';
            if (p && p !== LOGIN_PAGE) {
                sessionStorage.setItem('redirectAfterLogin', p);
                sessionStorage.setItem('auth_redirect_reason', reason || 'login_required');
            }
        } catch(e) {}
        try {
            document.documentElement.style.visibility = 'hidden';
            document.documentElement.style.opacity = '0';
        } catch(e) {}
        window.location.replace(LOGIN_PAGE);
    }

    function showAccessDenied(reason) {
        var html = ''
            + '<div style="position:fixed;inset:0;'
            + 'background:radial-gradient(circle at 50% 30%, #0b0b1a 0%, #000 100%);'
            + 'display:flex;align-items:center;justify-content:center;'
            + 'flex-direction:column;gap:20px;'
            + 'font-family:\'Segoe UI\',sans-serif;color:#fff;'
            + 'padding:30px;text-align:center;z-index:9999999;">'
            + '<div style="font-size:72px;">🚫</div>'
            + '<h1 style="color:#ff0064;font-size:24px;letter-spacing:3px;margin:0;">'
            + 'ACCESS DENIED</h1>'
            + '<p style="color:#b0b0d0;font-size:14px;max-width:400px;line-height:1.6;margin:0;">'
            + (reason || 'You must be logged in to view this page.')
            + '</p>'
            + '<a href="' + LOGIN_PAGE + '" style="'
            + 'background:linear-gradient(135deg,#00f0ff,#b400ff);'
            + 'color:#000;padding:14px 32px;border-radius:12px;'
            + 'text-decoration:none;font-weight:bold;letter-spacing:2px;'
            + 'font-size:13px;margin-top:10px;text-transform:uppercase;">'
            + '🔐 GO TO LOGIN</a>'
            + '</div>';
        try {
            document.open();
            document.write('<!DOCTYPE html><html><head><title>Access Denied</title></head><body>' + html + '</body></html>');
            document.close();
        } catch(e) {
            document.body.innerHTML = html;
        }
        setTimeout(function() { window.location.replace(LOGIN_PAGE); }, 3000);
    }

    /* ═══ HIDE / SHOW PAGE ═══ */
    function hidePage() {
        var style = document.createElement('style');
        style.id = 'auth-guard-style';
        style.textContent = ''
            + 'html, body { visibility: hidden !important; opacity: 0 !important; }'
            + '#auth-guard-loader { position: fixed; inset: 0; z-index: 9999999;'
            + ' background: radial-gradient(circle at 50% 30%, #0b0b1a 0%, #000 100%);'
            + ' display: flex; flex-direction: column; align-items: center; justify-content: center;'
            + ' visibility: visible !important; opacity: 1 !important;'
            + ' font-family: "Segoe UI", sans-serif; }'
            + '#auth-guard-loader .ag-spinner { width: 60px; height: 60px;'
            + ' border: 5px solid rgba(0,240,255,0.15); border-top: 5px solid #00f0ff;'
            + ' border-radius: 50%; animation: ag-spin 1s linear infinite;'
            + ' box-shadow: 0 0 40px rgba(0,240,255,0.3); margin-bottom: 20px; }'
            + '#auth-guard-loader .ag-text { font-family: "Orbitron", "Segoe UI", sans-serif;'
            + ' font-size: 12px; color: #00f0ff; letter-spacing: 4px; text-transform: uppercase; }'
            + '#auth-guard-loader .ag-sub { font-size: 10px; color: #6a6a8a;'
            + ' letter-spacing: 2px; margin-top: 10px; text-transform: uppercase; }'
            + '@keyframes ag-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
        document.head.appendChild(style);

        var loader = document.createElement('div');
        loader.id = 'auth-guard-loader';
        loader.innerHTML = ''
            + '<div class="ag-spinner"></div>'
            + '<div class="ag-text">Verifying Access...</div>'
            + '<div class="ag-sub">NightOrbit CoreForge</div>';

        if (document.body) document.body.appendChild(loader);
        else document.addEventListener('DOMContentLoaded', function() {
            document.body.appendChild(loader);
        });
    }

    function showPage() {
        var s = document.getElementById('auth-guard-style');
        if (s && s.parentNode) s.parentNode.removeChild(s);
        var l = document.getElementById('auth-guard-loader');
        if (l && l.parentNode) l.parentNode.removeChild(l);
        document.documentElement.style.visibility = 'visible';
        document.documentElement.style.opacity = '1';
        document.body.style.visibility = 'visible';
        document.body.style.opacity = '1';
    }

    /* ═══ SESSION TIMEOUT ═══ */
    function resetSessionTimer() {
        if (state.sessionTimer) clearTimeout(state.sessionTimer);
        if (!state.user) return;
        state.sessionTimer = setTimeout(function() {
            log('Session timeout — logging out');
            try {
                if (firebase.auth) {
                    firebase.auth().signOut().then(function() {
                        redirectToLogin('session_expired');
                    }).catch(function() {
                        redirectToLogin('session_expired');
                    });
                } else {
                    redirectToLogin('session_expired');
                }
            } catch(e) {
                redirectToLogin('session_expired');
            }
        }, SESSION_TIMEOUT_MS);
    }

    ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'].forEach(function(evt) {
        document.addEventListener(evt, function() { resetSessionTimer(); }, { passive: true });
    });

    /* ═══ SCRIPT LOADER ═══ */
    function loadScript(src, cb) {
        var s = document.createElement('script');
        s.src = src;
        s.onload = cb;
        s.onerror = function() { redirectToLogin('script_load_failed'); };
        document.head.appendChild(s);
    }

    /* ═══ AUTH CHECK ═══ */
    function initGuard() {
        try {
            if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);

            if (!firebase.auth) {
                log('Firebase Auth not available');
                showAccessDenied('Authentication service unavailable.');
                return;
            }

            var auth = firebase.auth();
            var resolved = false;

            state.timeoutHandle = setTimeout(function() {
                if (!resolved) {
                    resolved = true;
                    log('Auth check timed out');
                    redirectToLogin('auth_timeout');
                }
            }, AUTH_TIMEOUT_MS);

            auth.onAuthStateChanged(function(user) {
                if (resolved) return;
                resolved = true;
                clearTimeout(state.timeoutHandle);
                state.authChecked = true;
                state.user = user;

                if (user) {
                    log('User authenticated: ' + (user.email || user.uid));
                    try {
                        sessionStorage.setItem('no_auth_uid', user.uid);
                        sessionStorage.setItem('no_auth_email', user.email || '');
                        sessionStorage.setItem('no_auth_name', user.displayName || '');
                        sessionStorage.setItem('no_auth_photo', user.photoURL || '');
                    } catch(e) {}

                    showPage();
                    resetSessionTimer();
                    window.__currentUser = user;

                    try {
                        document.dispatchEvent(new CustomEvent('auth-ready', {
                            detail: { user: user }
                        }));
                        document.dispatchEvent(new CustomEvent('auth-guard-ready', {
                            detail: {
                                uid: user.uid,
                                email: user.email,
                                name: user.displayName,
                                photo: user.photoURL
                            }
                        }));
                    } catch(e) {}
                } else {
                    log('No user — redirecting');
                    redirectToLogin('not_authenticated');
                }
            });
        } catch(e) {
            log('Auth init error: ' + e.message);
            showAccessDenied('Authentication error.');
        }
    }

    /* ═══ PUBLIC API ═══ */
    window.AuthGuard = {
        getUser: function() { return state.user; },
        getUserId: function() { return state.user ? state.user.uid : null; },
        getUserEmail: function() { return state.user ? state.user.email : null; },
        getUserName: function() { return state.user ? state.user.displayName : null; },
        isAuthenticated: function() { return !!state.user; },
        logout: function() {
            if (!firebase.auth) return Promise.reject(new Error('Firebase not ready'));
            return firebase.auth().signOut().then(function() {
                redirectToLogin('logged_out');
            });
        },
        redirectToLogin: redirectToLogin,
        showAccessDenied: showAccessDenied
    };

    /* ═══ BOOT ═══ */
    function init() {
        if (state.initialized) return;
        state.initialized = true;
        log('Auth Guard v15 HEAVY starting...');
        hidePage();

        function boot() {
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
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', boot);
        } else {
            boot();
        }
    }

    init();
})();
