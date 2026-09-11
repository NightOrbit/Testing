/**
 * Auth Guard v15 — Full Protection
 */
(function() {
    'use strict';

    var firebaseConfig = {
        apiKey: "AIzaSyCMYIa1YwahQRF_EGizjR1Xjj4aD9uBN_o",
        authDomain: "nightorbitbuilder.firebaseapp.com",
        databaseURL: "https://nightorbitbuilder-default-rtdb.firebaseio.com",
        projectId: "nightorbitbuilder",
        storageBucket: "nightorbitbuilder.firebasestorage.app",
        messagingSenderId: "537115613677",
        appId: "1:537115613677:web:6653804e11c47ed746efe4"
    };

    var LOGIN_PAGE = 'index.html';
    var AUTH_TIMEOUT_MS = 8000;

    var style = document.createElement('style');
    style.id = 'auth-guard-style';
    style.textContent =
        'html, body { visibility: hidden !important; opacity: 0 !important; }' +
        '#auth-guard-loader { position: fixed; inset: 0; z-index: 9999999;' +
        ' background: radial-gradient(circle at 50% 30%, #0b0b1a 0%, #000 100%);' +
        ' display: flex; flex-direction: column; align-items: center; justify-content: center;' +
        ' visibility: visible !important; opacity: 1 !important; }' +
        '#auth-guard-loader .spinner { width: 60px; height: 60px;' +
        ' border: 5px solid rgba(0,240,255,0.15); border-top: 5px solid #00f0ff;' +
        ' border-radius: 50%; animation: ags 1s linear infinite; margin-bottom: 20px; }' +
        '#auth-guard-loader .text { color: #00f0ff; font-size: 12px;' +
        ' letter-spacing: 4px; font-family: monospace; text-transform: uppercase; }' +
        '@keyframes ags { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
    document.head.appendChild(style);

    var loader = document.createElement('div');
    loader.id = 'auth-guard-loader';
    loader.innerHTML = '<div class="spinner"></div><div class="text">Verifying Access...</div>';

    if (document.body) document.body.appendChild(loader);
    else document.addEventListener('DOMContentLoaded', function() { document.body.appendChild(loader); });

    function redirect() { window.location.replace(LOGIN_PAGE); }

    function showPage() {
        var s = document.getElementById('auth-guard-style');
        if (s) s.remove();
        var l = document.getElementById('auth-guard-loader');
        if (l) l.remove();
        document.documentElement.style.visibility = 'visible';
        document.documentElement.style.opacity = '1';
        document.body.style.visibility = 'visible';
        document.body.style.opacity = '1';
    }

    function loadScript(src, cb) {
        var s = document.createElement('script');
        s.src = src;
        s.onload = cb;
        s.onerror = redirect;
        document.head.appendChild(s);
    }

    function init() {
        try {
            if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
            var auth = firebase.auth();
            var resolved = false;
            var timeout = setTimeout(function() {
                if (!resolved) { resolved = true; redirect(); }
            }, AUTH_TIMEOUT_MS);

            auth.onAuthStateChanged(function(user) {
                if (resolved) return;
                resolved = true;
                clearTimeout(timeout);
                if (user) {
                    showPage();
                    window.__currentUser = user;
                    document.dispatchEvent(new CustomEvent('auth-ready', { detail: { user: user } }));
                } else {
                    redirect();
                }
            });
        } catch (e) { redirect(); }
    }

    if (typeof firebase === 'undefined') {
        loadScript('https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js', function() {
            loadScript('https://www.gstatic.com/firebasejs/9.6.1/firebase-auth-compat.js', function() {
                loadScript('https://www.gstatic.com/firebasejs/9.6.1/firebase-database-compat.js', function() {
                    loadScript('https://www.gstatic.com/firebasejs/9.6.1/firebase-functions-compat.js', function() {
                        init();
                    });
                });
            });
        });
    } else {
        init();
    }
})();
