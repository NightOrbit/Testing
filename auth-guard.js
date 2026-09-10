/**
 * ⚡ NightOrbit CodeForge — Auth Guard
 * Har protected page mein <head> ke end mein include karo:
 * <script src="auth-guard.js"></script>
 * 
 * Ye automatically:
 * 1. Firebase initialize karega
 * 2. Auth check karega
 * 3. Login nahi hai toh index.html pe bhejega
 * 4. Login hai toh page load hone dega
 */

(function() {
    'use strict';

    // ============================================================
    //  FIREBASE CONFIG
    // ============================================================
    var firebaseConfig = {
        apiKey: "AIzaSyCMYIa1YwahQRF_EGizjR1Xjj4aD9uBN_o",
        authDomain: "nightorbitbuilder.firebaseapp.com",
        projectId: "nightorbitbuilder",
        storageBucket: "nightorbitbuilder.firebasestorage.app",
        messagingSenderId: "537115613677",
        appId: "1:537115613677:web:6653804e11c47ed746efe4"
    };

    // ============================================================
    //  PAGE KO HIDE KARO — Jab Tak Auth Check Na Ho
    // ============================================================
    var style = document.createElement('style');
    style.id = 'auth-guard-style';
    style.textContent = 
        'html, body { visibility: hidden !important; opacity: 0 !important; }' +
        '#auth-guard-loader {' +
        '  position: fixed; inset: 0; z-index: 9999999;' +
        '  background: radial-gradient(circle at 50% 30%, #0b0b1a 0%, #000 100%);' +
        '  display: flex; flex-direction: column;' +
        '  align-items: center; justify-content: center;' +
        '  visibility: visible !important; opacity: 1 !important;' +
        '  font-family: "Segoe UI", sans-serif;' +
        '}' +
        '#auth-guard-loader .ag-spinner {' +
        '  width: 60px; height: 60px;' +
        '  border: 5px solid rgba(0,240,255,0.15);' +
        '  border-top: 5px solid #00f0ff;' +
        '  border-radius: 50%;' +
        '  animation: ag-spin 1s linear infinite;' +
        '  box-shadow: 0 0 40px rgba(0,240,255,0.3);' +
        '  margin-bottom: 20px;' +
        '}' +
        '#auth-guard-loader .ag-text {' +
        '  font-family: "Orbitron", "Segoe UI", sans-serif;' +
        '  font-size: 12px; color: #00f0ff;' +
        '  letter-spacing: 4px; text-transform: uppercase;' +
        '}' +
        '@keyframes ag-spin {' +
        '  0% { transform: rotate(0deg); }' +
        '  100% { transform: rotate(360deg); }' +
        '}';
    document.head.appendChild(style);

    // Loader inject karo
    var loader = document.createElement('div');
    loader.id = 'auth-guard-loader';
    loader.innerHTML = 
        '<div class="ag-spinner"></div>' +
        '<div class="ag-text">Verifying Access...</div>';
    
    if (document.body) {
        document.body.appendChild(loader);
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            document.body.appendChild(loader);
        });
    }

    // ============================================================
    //  FIREBASE LOAD KARO (agar already load nahi hai)
    // ============================================================
    function loadScript(src, callback) {
        var s = document.createElement('script');
        s.src = src;
        s.onload = callback;
        s.onerror = function() {
            console.error('Failed to load:', src);
            redirectToLogin();
        };
        document.head.appendChild(s);
    }

    function initGuard() {
        try {
            // Firebase already initialized check
            if (!firebase.apps.length) {
                firebase.initializeApp(firebaseConfig);
            }
            var auth = firebase.auth();

            // ============================================================
            //  AUTH STATE CHECK
            // ============================================================
            var resolved = false;
            var timeout = setTimeout(function() {
                if (!resolved) {
                    resolved = true;
                    redirectToLogin();
                }
            }, 8000); // 8 second timeout

            auth.onAuthStateChanged(function(user) {
                if (resolved) return;
                resolved = true;
                clearTimeout(timeout);

                if (user) {
                    // ✅ Login hai — page dikhao
                    showPage();
                    
                    // Global user object save karo (pages use kar sakte hain)
                    window.__currentUser = user;
                    
                    // Custom event fire karo
                    document.dispatchEvent(new CustomEvent('auth-ready', { 
                        detail: { user: user } 
                    }));
                } else {
                    // ❌ Login nahi hai — redirect
                    redirectToLogin();
                }
            });
        } catch (e) {
            console.error('Auth guard error:', e);
            redirectToLogin();
        }
    }

    function showPage() {
        var styleEl = document.getElementById('auth-guard-style');
        if (styleEl) styleEl.remove();
        
        var loaderEl = document.getElementById('auth-guard-loader');
        if (loaderEl) loaderEl.remove();
        
        // Body visible karo
        document.documentElement.style.visibility = 'visible';
        document.documentElement.style.opacity = '1';
    }

    function redirectToLogin() {
        // Current page save karo — login ke baad wapas aane ke liye
        try {
            var currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';
            if (currentPage && currentPage !== 'index.html') {
                sessionStorage.setItem('redirectAfterLogin', currentPage);
            }
        } catch (e) {}
        
        // Login page pe bhejo
        window.location.replace('index.html');
    }

    // ============================================================
    //  FIREBASE SCRIPTS LOAD KARO
    // ============================================================
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