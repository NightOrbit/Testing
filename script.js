(function() {
    'use strict';

    // ============================================================
    //  PARTICLES ANIMATION
    // ============================================================
    (function() {
        var canvas = document.getElementById('particles-canvas');
        if (!canvas) return;
        var ctx = canvas.getContext('2d');
        var width, height, particles = [];

        function initParticles() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            particles = [];
            var count = Math.floor((width * height) / 12000);
            for (var i = 0; i < count; i++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    radius: Math.random() * 1.5 + 0.5,
                    vx: (Math.random() - 0.5) * 0.4,
                    vy: (Math.random() - 0.5) * 0.4,
                    color: 'hsl(' + (Math.random() * 60 + 180) + ', 80%, 70%)'
                });
            }
        }

        function drawParticles() {
            ctx.clearRect(0, 0, width, height);
            for (var i = 0; i < particles.length; i++) {
                var p = particles[i];
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.shadowColor = 'rgba(0,240,255,0.2)';
                ctx.shadowBlur = 8;
                ctx.fill();
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0 || p.x > width) p.vx *= -1;
                if (p.y < 0 || p.y > height) p.vy *= -1;
            }
            requestAnimationFrame(drawParticles);
        }

        window.addEventListener('resize', initParticles);
        initParticles();
        drawParticles();
    })();

    // ============================================================
    //  FIREBASE INIT
    // ============================================================
    var firebaseConfig = {
        apiKey: "AIzaSyCMYIa1YwahQRF_EGizjR1Xjj4aD9uBN_o",
        authDomain: "nightorbitbuilder.firebaseapp.com",
        projectId: "nightorbitbuilder",
        storageBucket: "nightorbitbuilder.firebasestorage.app",
        messagingSenderId: "537115613677",
        appId: "1:537115613677:web:6653804e11c47ed746efe4"
    };

    firebase.initializeApp(firebaseConfig);
    var auth = firebase.auth();
    var db = firebase.database();

    var currentUser = null;
    var isRedirecting = false;

    // ============================================================
    //  UI HELPERS
    // ============================================================
    function showStatus(type, msg) {
        var el = document.getElementById('statusBox');
        if (!el) return;
        el.className = 'status-box show ' + type;
        el.textContent = msg;
    }

    function hideStatus() {
        var el = document.getElementById('statusBox');
        if (!el) return;
        el.className = 'status-box';
    }

    function showLoader(show) {
        var el = document.getElementById('loader');
        if (!el) return;
        if (show) el.classList.add('show');
        else el.classList.remove('show');
    }

    function safeRedirect(url, delay) {
        if (isRedirecting) return;
        isRedirecting = true;
        setTimeout(function() {
            window.location.href = url;
        }, delay);
    }

    // ============================================================
    //  DEVICE / TIME HELPERS
    // ============================================================
    function getDeviceName() {
        var ua = navigator.userAgent;
        if (ua.includes('Windows NT 10')) return 'Windows 10/11 PC';
        if (ua.includes('Windows NT 6.3')) return 'Windows 8.1 PC';
        if (ua.includes('Windows NT 6.2')) return 'Windows 8 PC';
        if (ua.includes('Windows NT 6.1')) return 'Windows 7 PC';
        if (ua.includes('Mac OS X')) return 'Mac';
        if (ua.includes('iPhone')) return 'iPhone';
        if (ua.includes('iPad')) return 'iPad';
        if (ua.includes('Android')) {
            var m = ua.match(/Android\s[\d.]+;\s([^)]+)/);
            return m ? m[1].trim() : 'Android Device';
        }
        if (ua.includes('Linux')) return 'Linux PC';
        return navigator.platform || 'Unknown Device';
    }

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

    // ============================================================
    //  USER INFO DISPLAY
    // ============================================================
    async function showUserInfo(uid) {
        var snap = await db.ref('users/' + uid).once('value');
        var data = snap.val() || {};

        document.getElementById('infoEmail').textContent = data.email || '--';
        document.getElementById('infoUsername').textContent = data.username || '--';
        document.getElementById('infoDevice').textContent = data.deviceName || '--';
        document.getElementById('infoFirstLogin').textContent = data.firstLoginTime || '--';
        document.getElementById('infoLastLogin').textContent = data.lastLoginTime || '--';

        document.getElementById('userInfo').classList.add('show');
    }

    // ============================================================
    //  SAVE USER TO DATABASE
    // ============================================================
    async function saveUserToDb(user) {
        var now = Date.now();
        var nowStr = getFullTime();
        var deviceName = getDeviceName();

        var snap = await db.ref('users/' + user.uid).once('value');
        var existing = snap.val();

        if (existing) {
            await db.ref('users/' + user.uid).update({
                email: user.email || '',
                username: user.displayName || (user.email ? user.email.split('@')[0] : 'User'),
                deviceName: deviceName,
                lastLogin: now,
                lastLoginTime: nowStr
            });
        } else {
            await db.ref('users/' + user.uid).set({
                uid: user.uid,
                email: user.email || '',
                username: user.displayName || (user.email ? user.email.split('@')[0] : 'User'),
                deviceName: deviceName,
                firstLogin: now,
                firstLoginTime: nowStr,
                lastLogin: now,
                lastLoginTime: nowStr
            });
        }
    }

    // ============================================================
    //  GOOGLE LOGIN
    // ============================================================
    var googleBtn = document.getElementById('googleLoginBtn');
    if (googleBtn) {
        googleBtn.addEventListener('click', function() {
            var provider = new firebase.auth.GoogleAuthProvider();
            provider.addScope('email');
            provider.addScope('profile');

            showLoader(true);
            hideStatus();
            showStatus('loading', 'Connecting to Google...');

            auth.signInWithPopup(provider)
                .then(async function(result) {
                    var user = result.user;
                    currentUser = user;

                    showStatus('loading', 'Saving your info...');

                    await saveUserToDb(user);
                    await showUserInfo(user.uid);

                    showLoader(false);
                    showStatus('success', 'Login successful! Redirecting...');

                    safeRedirect('dashboard.html', 2000);
                })
                .catch(function(error) {
                    showLoader(false);
                    var msg = 'Login failed.';
                    if (error.code === 'auth/popup-closed-by-user') msg = 'Popup closed. Try again.';
                    else if (error.code === 'auth/popup-blocked') msg = 'Popup blocked. Allow popups.';
                    else if (error.code === 'auth/network-request-failed') msg = 'Network error. Check internet.';
                    else if (error.code === 'auth/cancelled-popup-request') msg = 'Cancelled. Try again.';
                    else msg = error.message;
                    showStatus('error', msg);
                });
        });
    }

    // ============================================================
    //  AUTH STATE LISTENER
    // ============================================================
    auth.onAuthStateChanged(async function(user) {
        if (user) {
            currentUser = user;

            try {
                await saveUserToDb(user);
                await showUserInfo(user.uid);
                showStatus('success', 'Already logged in. Redirecting...');
                safeRedirect('dashboard.html', 1500);
            } catch (e) {
                // Silent fail — user can still login manually
                console.error('Auto-login error:', e);
            }
        }
    });

})();