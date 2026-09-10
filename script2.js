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

const firebaseConfig = {
    apiKey: "AIzaSyCMYIa1YwahQRF_EGizjR1Xjj4aD9uBN_o",
    authDomain: "nightorbitbuilder.firebaseapp.com",
    projectId: "nightorbitbuilder",
    storageBucket: "nightorbitbuilder.firebasestorage.app",
    messagingSenderId: "537115613677",
    appId: "1:537115613677:web:6653804e11c47ed746efe4"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

const loadingScreen = document.getElementById('loadingScreen');
const appContainer = document.getElementById('appContainer');

function getDeviceName() {
    const ua = navigator.userAgent;
    if (ua.includes('Windows NT 10')) return 'Windows 10/11 PC';
    if (ua.includes('Windows NT 6.3')) return 'Windows 8.1 PC';
    if (ua.includes('Windows NT 6.2')) return 'Windows 8 PC';
    if (ua.includes('Windows NT 6.1')) return 'Windows 7 PC';
    if (ua.includes('Mac OS X')) return 'Mac';
    if (ua.includes('iPhone')) return 'iPhone';
    if (ua.includes('iPad')) return 'iPad';
    if (ua.includes('Android')) {
        const m = ua.match(/Android\s[\d.]+;\s([^)]+)/);
        return m ? m[1].trim() : 'Android Device';
    }
    if (ua.includes('Linux')) return 'Linux PC';
    return navigator.platform || 'Unknown Device';
}

function getFullTime() {
    const d = new Date();
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

function showLoginRequired() {
    loadingScreen.classList.add('hidden');
    appContainer.style.display = 'none';
    document.body.innerHTML = '<div style="position:fixed;inset:0;background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;font-family:Inter,sans-serif;padding:20px;text-align:center;"><div style="font-size:80px;color:#00f0ff;margin-bottom:20px;animation:pulse 2s infinite;">🔒</div><h2 style="font-family:Orbitron,sans-serif;color:#ff2d95;letter-spacing:3px;margin-bottom:15px;text-transform:uppercase;">Access Denied</h2><p style="color:#b0b0d0;font-size:14px;margin-bottom:30px;max-width:400px;line-height:1.6;">You must login to access this page. Please go back and sign in with Google.</p><a href="index.html" style="background:linear-gradient(135deg,#00f0ff,#b400ff);color:#000;padding:15px 40px;border-radius:16px;font-weight:700;text-decoration:none;letter-spacing:1.5px;text-transform:uppercase;font-size:14px;">Go to Login</a></div><style>@keyframes pulse{0%,100%{transform:scale(1);text-shadow:0 0 20px rgba(0,240,255,0.3);}50%{transform:scale(1.1);text-shadow:0 0 40px rgba(0,240,255,0.6);}}</style>';
}

function loadUserInfo(user) {
    const displayName = user.displayName || (user.email ? user.email.split('@')[0] : 'User');
    const initial = displayName.charAt(0).toUpperCase();

    document.getElementById('menuAvatar').textContent = initial;
    document.getElementById('menuUserName').textContent = displayName;
    document.getElementById('menuUserEmail').textContent = user.email || '--';

    db.ref('users/' + user.uid).once('value').then(function(snap) {
        const data = snap.val() || {};
        document.getElementById('menuDevice').textContent = data.deviceName || getDeviceName();
        document.getElementById('menuFirstLogin').textContent = data.firstLoginTime || '--';
        document.getElementById('menuLastLogin').textContent = data.lastLoginTime || '--';

        if (user.photoURL) {
            const avatar = document.getElementById('menuAvatar');
            avatar.innerHTML = '<img src="' + user.photoURL + '" alt="Profile">';
        }

        if (data.profilePic) {
            const avatar = document.getElementById('menuAvatar');
            avatar.innerHTML = '<img src="' + data.profilePic + '" alt="Profile">';
        }
    });
}

function updateLastLogin(uid) {
    const now = Date.now();
    const nowStr = getFullTime();
    db.ref('users/' + uid).once('value').then(function(snap) {
        const existing = snap.val();
        if (existing) {
            db.ref('users/' + uid).update({
                lastLogin: now,
                lastLoginTime: nowStr,
                deviceName: getDeviceName()
            });
        } else {
            db.ref('users/' + uid).set({
                uid: uid,
                email: auth.currentUser.email || '',
                username: auth.currentUser.displayName || (auth.currentUser.email ? auth.currentUser.email.split('@')[0] : 'User'),
                deviceName: getDeviceName(),
                firstLogin: now,
                firstLoginTime: nowStr,
                lastLogin: now,
                lastLoginTime: nowStr
            });
        }
    });
}

auth.onAuthStateChanged(function(user) {
    if (user) {
        updateLastLogin(user.uid);
        loadUserInfo(user);
        loadingScreen.classList.add('hidden');
        appContainer.style.display = 'flex';
    } else {
        showLoginRequired();
    }
});

document.getElementById('menuToggle').addEventListener('click', function() {
    document.getElementById('sideMenu').classList.add('open');
    document.getElementById('menuOverlay').classList.add('active');
});

document.getElementById('menuClose').addEventListener('click', function() {
    document.getElementById('sideMenu').classList.remove('open');
    document.getElementById('menuOverlay').classList.remove('active');
});

document.getElementById('menuOverlay').addEventListener('click', function() {
    document.getElementById('sideMenu').classList.remove('open');
    document.getElementById('menuOverlay').classList.remove('active');
});

document.getElementById('logoutBtn').addEventListener('click', function() {
    if (confirm('Are you sure you want to logout?')) {
        auth.signOut().then(function() {
            window.location.href = 'index.html';
        });
    }
});