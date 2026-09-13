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
        databaseURL: "https://nightorbitbuilder-default-rtdb.firebaseio.com",
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
    var sessionStartTime = Date.now();

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

    function setVal(id, val) {
        var el = document.getElementById(id);
        if (el) el.textContent = (val === undefined || val === null || val === '') ? '--' : val;
    }

    // ============================================================
    //  TIME HELPERS
    // ============================================================
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
    //  DEVICE DETECTION — Detailed
    // ============================================================
    function detectOS() {
        var ua = navigator.userAgent;
        var platform = navigator.platform || '';
        if (/Windows NT 10/.test(ua)) return { name: 'Windows', version: '10/11' };
        if (/Windows NT 6\.3/.test(ua)) return { name: 'Windows', version: '8.1' };
        if (/Windows NT 6\.2/.test(ua)) return { name: 'Windows', version: '8' };
        if (/Windows NT 6\.1/.test(ua)) return { name: 'Windows', version: '7' };
        if (/Windows/.test(ua)) return { name: 'Windows', version: 'Unknown' };
        if (/Mac OS X ([\d_]+)/.test(ua)) {
            var m = ua.match(/Mac OS X ([\d_]+)/);
            return { name: 'macOS', version: m ? m[1].replace(/_/g, '.') : 'Unknown' };
        }
        if (/iPhone OS ([\d_]+)/.test(ua)) {
            var m2 = ua.match(/iPhone OS ([\d_]+)/);
            return { name: 'iOS', version: m2 ? m2[1].replace(/_/g, '.') : 'Unknown' };
        }
        if (/iPad.*OS ([\d_]+)/.test(ua)) {
            var m3 = ua.match(/OS ([\d_]+)/);
            return { name: 'iPadOS', version: m3 ? m3[1].replace(/_/g, '.') : 'Unknown' };
        }
        if (/Android ([\d.]+)/.test(ua)) {
            var m4 = ua.match(/Android ([\d.]+)/);
            return { name: 'Android', version: m4 ? m4[1] : 'Unknown' };
        }
        if (/CrOS/.test(ua)) return { name: 'ChromeOS', version: 'Unknown' };
        if (/Linux/.test(ua)) return { name: 'Linux', version: 'Unknown' };
        return { name: platform || 'Unknown', version: 'Unknown' };
    }

    function detectBrowser() {
        var ua = navigator.userAgent;
        if (/Edg\/([\d.]+)/.test(ua)) {
            var m = ua.match(/Edg\/([\d.]+)/);
            return { name: 'Microsoft Edge', version: m[1] };
        }
        if (/OPR\/([\d.]+)/.test(ua) || /Opera/.test(ua)) {
            var m2 = ua.match(/OPR\/([\d.]+)/);
            return { name: 'Opera', version: m2 ? m2[1] : 'Unknown' };
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
        if (/MSIE|Trident/.test(ua)) return { name: 'Internet Explorer', version: 'Unknown' };
        return { name: 'Unknown', version: 'Unknown' };
    }

    function getDeviceName() {
        var ua = navigator.userAgent;
        var os = detectOS();
        if (os.name === 'Android') {
            var m = ua.match(/Android\s[\d.]+;\s([^)]+)/);
            return m ? m[1].trim() : 'Android Device';
        }
        if (os.name === 'iOS') return 'iPhone';
        if (os.name === 'iPadOS') return 'iPad';
        if (os.name === 'Windows') return 'Windows ' + os.version + ' PC';
        if (os.name === 'macOS') return 'Mac';
        if (os.name === 'Linux') return 'Linux PC';
        if (os.name === 'ChromeOS') return 'Chromebook';
        return navigator.platform || 'Unknown Device';
    }

    function getDeviceType() {
        var ua = navigator.userAgent;
        if (/iPad|Tablet/i.test(ua)) return 'Tablet';
        if (/Mobi|Android|iPhone/i.test(ua)) return 'Mobile';
        return 'Desktop';
    }

    function getGPUInfo() {
        try {
            var canvas = document.createElement('canvas');
            var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (!gl) return 'Not available';
            var debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            if (debugInfo) {
                return gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'Unknown';
            }
            return 'Unknown';
        } catch (e) {
            return 'Not available';
        }
    }

    async function getBatteryInfo() {
        if (!navigator.getBattery) return 'Not supported';
        try {
            var b = await navigator.getBattery();
            var level = Math.round(b.level * 100);
            var charging = b.charging ? 'Charging' : 'Not Charging';
            return level + '% (' + charging + ')';
        } catch (e) {
            return 'Unavailable';
        }
    }

    function getNetworkInfo() {
        var conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (!conn) return { type: 'Unknown', speed: 'Unknown' };
        return {
            type: conn.effectiveType || conn.type || 'Unknown',
            speed: conn.downlink ? conn.downlink + ' Mbps' : 'Unknown'
        };
    }

    // ============================================================
    //  LOCATION — IP-based (with fallback APIs)
    // ============================================================
    async function getLocationData() {
        // Primary API: ipapi.co
        try {
            var res = await fetch('https://ipapi.co/json/');
            if (res.ok) {
                var data = await res.json();
                return {
                    ip: data.ip || 'Unknown',
                    city: data.city || 'Unknown',
                    region: data.region || 'Unknown',
                    country: data.country_name || 'Unknown',
                    countryCode: data.country_code || 'Unknown',
                    postal: data.postal || 'Unknown',
                    lat: data.latitude || 'Unknown',
                    lng: data.longitude || 'Unknown',
                    isp: data.org || 'Unknown',
                    timezone: data.timezone || 'Unknown',
                    utcOffset: data.utc_offset || 'Unknown'
                };
            }
        } catch (e) {
            console.warn('ipapi.co failed, trying fallback...');
        }

        // Fallback API: ipwho.is
        try {
            var res2 = await fetch('https://ipwho.is/');
            if (res2.ok) {
                var d2 = await res2.json();
                return {
                    ip: d2.ip || 'Unknown',
                    city: d2.city || 'Unknown',
                    region: d2.region || 'Unknown',
                    country: d2.country || 'Unknown',
                    countryCode: d2.country_code || 'Unknown',
                    postal: d2.postal || 'Unknown',
                    lat: d2.latitude || 'Unknown',
                    lng: d2.longitude || 'Unknown',
                    isp: (d2.connection && d2.connection.isp) || 'Unknown',
                    timezone: (d2.timezone && d2.timezone.id) || 'Unknown',
                    utcOffset: (d2.timezone && d2.timezone.utc) || 'Unknown'
                };
            }
        } catch (e) {
            console.warn('ipwho.is failed too.');
        }

        // Second fallback: ip-api.com
        try {
            var res3 = await fetch('http://ip-api.com/json/');
            if (res3.ok) {
                var d3 = await res3.json();
                if (d3.status === 'success') {
                    return {
                        ip: d3.query || 'Unknown',
                        city: d3.city || 'Unknown',
                        region: d3.regionName || 'Unknown',
                        country: d3.country || 'Unknown',
                        countryCode: d3.countryCode || 'Unknown',
                        postal: d3.zip || 'Unknown',
                        lat: d3.lat || 'Unknown',
                        lng: d3.lon || 'Unknown',
                        isp: d3.isp || 'Unknown',
                        timezone: d3.timezone || 'Unknown',
                        utcOffset: 'Unknown'
                    };
                }
            }
        } catch (e) {
            console.warn('ip-api.com failed too.');
        }

        // All failed
        return {
            ip: 'Unknown', city: 'Unknown', region: 'Unknown',
            country: 'Unknown', countryCode: 'Unknown', postal: 'Unknown',
            lat: 'Unknown', lng: 'Unknown', isp: 'Unknown',
            timezone: 'Unknown', utcOffset: 'Unknown'
        };
    }

    // ============================================================
    //  COLLECT ALL DEVICE INFO
    // ============================================================
    async function collectAllInfo() {
        var os = detectOS();
        var browser = detectBrowser();
        var net = getNetworkInfo();
        var battery = await getBatteryInfo();
        var location = await getLocationData();

        return {
            // Account
            email: '',
            username: '',
            uid: '',
            provider: '',
            emailVerified: '',
            photoURL: '',

            // Location
            location: location,
            ip: location.ip,
            city: location.city,
            region: location.region,
            country: location.country,
            countryCode: location.countryCode,
            postal: location.postal,
            latitude: location.lat,
            longitude: location.lng,
            isp: location.isp,
            timezone: location.timezone,
            utcOffset: location.utcOffset,

            // Network
            networkType: net.type,
            connectionSpeed: net.speed,

            // Device
            deviceName: getDeviceName(),
            deviceType: getDeviceType(),
            os: os.name,
            osVersion: os.version,
            browser: browser.name,
            browserVersion: browser.version,
            screenSize: window.screen.width + ' x ' + window.screen.height,
            viewport: window.innerWidth + ' x ' + window.innerHeight,
            pixelRatio: window.devicePixelRatio || 1,
            colorDepth: window.screen.colorDepth + '-bit',
            touchSupport: ('ontouchstart' in window) ? 'Yes (' + (navigator.maxTouchPoints || 0) + ' points)' : 'No',
            cpuCores: navigator.hardwareConcurrency || 'Unknown',
            deviceMemory: navigator.deviceMemory ? navigator.deviceMemory + ' GB' : 'Unknown',
            battery: battery,
            gpu: getGPUInfo(),

            // Language
            language: navigator.language || 'Unknown',
            languages: (navigator.languages || []).join(', ') || 'Unknown',
            platform: navigator.platform || 'Unknown',
            cookiesEnabled: navigator.cookieEnabled ? 'Yes' : 'No',
            doNotTrack: navigator.doNotTrack || 'Not set',

            // User Agent
            userAgent: navigator.userAgent
        };
    }

    // ============================================================
    //  SHOW USER INFO IN UI
    // ============================================================
    function displayAllInfo(full) {
        // Account
        setVal('infoEmail', full.email);
        setVal('infoUsername', full.username);
        setVal('infoUid', full.uid);
        setVal('infoProvider', full.provider);
        setVal('infoEmailVerified', full.emailVerified);
        setVal('infoPhoto', full.photoURL);

        // Location
        setVal('infoIP', full.ip);
        setVal('infoCity', full.city);
        setVal('infoRegion', full.region);
        setVal('infoCountry', full.country + (full.countryCode && full.countryCode !== 'Unknown' ? ' (' + full.countryCode + ')' : ''));
        setVal('infoPostal', full.postal);
        setVal('infoLat', full.latitude);
        setVal('infoLng', full.longitude);
        setVal('infoISP', full.isp);
        setVal('infoTimezone', full.timezone + (full.utcOffset && full.utcOffset !== 'Unknown' ? ' (UTC' + full.utcOffset + ')' : ''));
        setVal('infoNetwork', full.networkType);
        setVal('infoSpeed', full.connectionSpeed);

        // Device
        setVal('infoDevice', full.deviceName);
        setVal('infoDeviceType', full.deviceType);
        setVal('infoOS', full.os);
        setVal('infoOSVersion', full.osVersion);
        setVal('infoBrowser', full.browser);
        setVal('infoBrowserVersion', full.browserVersion);
        setVal('infoScreen', full.screenSize);
        setVal('infoViewport', full.viewport);
        setVal('infoPixelRatio', full.pixelRatio);
        setVal('infoColorDepth', full.colorDepth);
        setVal('infoTouch', full.touchSupport);
        setVal('infoCores', full.cpuCores);
        setVal('infoMemory', full.deviceMemory);
        setVal('infoBattery', full.battery);
        setVal('infoGPU', full.gpu);

        // Language
        setVal('infoLanguage', full.language);
        setVal('infoLanguages', full.languages);
        setVal('infoPlatform', full.platform);
        setVal('infoCookies', full.cookiesEnabled);
        setVal('infoDNT', full.doNotTrack);

        // Times
        setVal('infoFirstLogin', full.firstLoginTime || '--');
        setVal('infoLastLogin', full.lastLoginTime || '--');
        setVal('infoTotalLogins', full.totalLogins || '1');
        setVal('infoSessionStart', getFullTime());

        document.getElementById('userInfo').classList.add('show');
    }

    // ============================================================
    //  SAVE USER TO DATABASE
    // ============================================================
    async function saveUserToDb(user) {
        var now = Date.now();
        var nowStr = getFullTime();

        showStatus('loading', 'Collecting device info...');
        var full = await collectAllInfo();

        // Add Firebase user data
        full.email = user.email || 'Unknown';
        full.username = user.displayName || (user.email ? user.email.split('@')[0] : 'User');
        full.uid = user.uid;
        full.provider = (user.providerData && user.providerData[0] && user.providerData[0].providerId) || 'google.com';
        full.emailVerified = user.emailVerified ? 'Yes' : 'No';
        full.photoURL = user.photoURL || 'Not set';

        showStatus('loading', 'Saving to database...');

        var snap = await db.ref('users/' + user.uid).once('value');
        var existing = snap.val();

        if (existing) {
            // Update — keep firstLogin, increment totalLogins
            var totalLogins = (existing.totalLogins || 1) + 1;
            full.totalLogins = totalLogins;
            full.firstLogin = existing.firstLogin;
            full.firstLoginTime = existing.firstLoginTime;

            await db.ref('users/' + user.uid).update({
                email: full.email,
                username: full.username,
                provider: full.provider,
                emailVerified: full.emailVerified,
                photoURL: full.photoURL,

                // Location
                location: full.location,
                ip: full.ip,
                city: full.city,
                region: full.region,
                country: full.country,
                countryCode: full.countryCode,
                postal: full.postal,
                latitude: full.latitude,
                longitude: full.longitude,
                isp: full.isp,
                timezone: full.timezone,
                utcOffset: full.utcOffset,

                // Network
                networkType: full.networkType,
                connectionSpeed: full.connectionSpeed,

                // Device
                deviceName: full.deviceName,
                deviceType: full.deviceType,
                os: full.os,
                osVersion: full.osVersion,
                browser: full.browser,
                browserVersion: full.browserVersion,
                screenSize: full.screenSize,
                viewport: full.viewport,
                pixelRatio: full.pixelRatio,
                colorDepth: full.colorDepth,
                touchSupport: full.touchSupport,
                cpuCores: full.cpuCores,
                deviceMemory: full.deviceMemory,
                battery: full.battery,
                gpu: full.gpu,

                // Language
                language: full.language,
                languages: full.languages,
                platform: full.platform,
                cookiesEnabled: full.cookiesEnabled,
                doNotTrack: full.doNotTrack,

                userAgent: full.userAgent,

                // Times
                lastLogin: now,
                lastLoginTime: nowStr,
                totalLogins: totalLogins,
                sessionStart: now,
                sessionStartTime: getFullTime()
            });
        } else {
            // First time
            full.totalLogins = 1;
            full.firstLogin = now;
            full.firstLoginTime = nowStr;
            full.lastLogin = now;
            full.lastLoginTime = nowStr;
            full.sessionStart = now;
            full.sessionStartTime = nowStr;

            await db.ref('users/' + user.uid).set({
                uid: full.uid,
                email: full.email,
                username: full.username,
                provider: full.provider,
                emailVerified: full.emailVerified,
                photoURL: full.photoURL,

                location: full.location,
                ip: full.ip,
                city: full.city,
                region: full.region,
                country: full.country,
                countryCode: full.countryCode,
                postal: full.postal,
                latitude: full.latitude,
                longitude: full.longitude,
                isp: full.isp,
                timezone: full.timezone,
                utcOffset: full.utcOffset,

                networkType: full.networkType,
                connectionSpeed: full.connectionSpeed,

                deviceName: full.deviceName,
                deviceType: full.deviceType,
                os: full.os,
                osVersion: full.osVersion,
                browser: full.browser,
                browserVersion: full.browserVersion,
                screenSize: full.screenSize,
                viewport: full.viewport,
                pixelRatio: full.pixelRatio,
                colorDepth: full.colorDepth,
                touchSupport: full.touchSupport,
                cpuCores: full.cpuCores,
                deviceMemory: full.deviceMemory,
                battery: full.battery,
                gpu: full.gpu,

                language: full.language,
                languages: full.languages,
                platform: full.platform,
                cookiesEnabled: full.cookiesEnabled,
                doNotTrack: full.doNotTrack,

                userAgent: full.userAgent,

                firstLogin: full.firstLogin,
                firstLoginTime: full.firstLoginTime,
                lastLogin: full.lastLogin,
                lastLoginTime: full.lastLoginTime,
                totalLogins: full.totalLogins,
                sessionStart: full.sessionStart,
                sessionStartTime: full.sessionStartTime
            });
        }

        return full;
    }

    // ============================================================
    //  SHOW USER INFO FROM DB
    // ============================================================
    async function showUserInfoFromDb(uid, liveData) {
        var snap = await db.ref('users/' + uid).once('value');
        var data = snap.val() || {};

        var full = liveData || {};

        full.email = data.email || full.email || '--';
        full.username = data.username || full.username || '--';
        full.uid = uid;
        full.provider = data.provider || full.provider || '--';
        full.emailVerified = data.emailVerified || full.emailVerified || '--';
        full.photoURL = data.photoURL || full.photoURL || '--';

        full.ip = data.ip || full.ip || '--';
        full.city = data.city || full.city || '--';
        full.region = data.region || full.region || '--';
        full.country = data.country || full.country || '--';
        full.countryCode = data.countryCode || full.countryCode || '--';
        full.postal = data.postal || full.postal || '--';
        full.latitude = data.latitude || full.latitude || '--';
        full.longitude = data.longitude || full.longitude || '--';
        full.isp = data.isp || full.isp || '--';
        full.timezone = data.timezone || full.timezone || '--';
        full.utcOffset = data.utcOffset || full.utcOffset || '--';
        full.networkType = data.networkType || full.networkType || '--';
        full.connectionSpeed = data.connectionSpeed || full.connectionSpeed || '--';

        full.deviceName = data.deviceName || full.deviceName || '--';
        full.deviceType = data.deviceType || full.deviceType || '--';
        full.os = data.os || full.os || '--';
        full.osVersion = data.osVersion || full.osVersion || '--';
        full.browser = data.browser || full.browser || '--';
        full.browserVersion = data.browserVersion || full.browserVersion || '--';
        full.screenSize = data.screenSize || full.screenSize || '--';
        full.viewport = data.viewport || full.viewport || '--';
        full.pixelRatio = data.pixelRatio || full.pixelRatio || '--';
        full.colorDepth = data.colorDepth || full.colorDepth || '--';
        full.touchSupport = data.touchSupport || full.touchSupport || '--';
        full.cpuCores = data.cpuCores || full.cpuCores || '--';
        full.deviceMemory = data.deviceMemory || full.deviceMemory || '--';
        full.battery = data.battery || full.battery || '--';
        full.gpu = data.gpu || full.gpu || '--';

        full.language = data.language || full.language || '--';
        full.languages = data.languages || full.languages || '--';
        full.platform = data.platform || full.platform || '--';
        full.cookiesEnabled = data.cookiesEnabled || full.cookiesEnabled || '--';
        full.doNotTrack = data.doNotTrack || full.doNotTrack || '--';

        full.firstLoginTime = data.firstLoginTime || '--';
        full.lastLoginTime = data.lastLoginTime || '--';
        full.totalLogins = data.totalLogins || '1';
        full.sessionStartTime = getFullTime();

        displayAllInfo(full);
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

                    showStatus('loading', 'Collecting your info...');

                    try {
                        var full = await saveUserToDb(user);
                        await showUserInfoFromDb(user.uid, full);
                        showLoader(false);
                        showStatus('success', '✅ Login successful! Redirecting...');
                        safeRedirect('dashboard.html', 2500);
                    } catch (err) {
                        console.error('Save error:', err);
                        showLoader(false);
                        showStatus('error', 'Info save failed: ' + err.message);
                    }
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
                var full = await saveUserToDb(user);
                await showUserInfoFromDb(user.uid, full);
                showStatus('success', '✅ Already logged in. Redirecting...');
                safeRedirect('dashboard.html', 2000);
            } catch (e) {
                console.error('Auto-login error:', e);
                showStatus('error', 'Error: ' + e.message);
            }
        }
    });

})();
