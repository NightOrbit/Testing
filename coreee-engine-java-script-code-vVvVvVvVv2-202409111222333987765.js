const firebaseConfig = {
                 apiKey: "AIzaSyC7kZON-2obr2-X_jC93a6oFg7FnxY6foc",
                 authDomain: "mymarketbaazar.firebaseapp.com",
                 databaseURL: "https://mymarketbaazar-default-rtdb.firebaseio.com",
                 projectId: "mymarketbaazar",
                 storageBucket: "mymarketbaazar.firebasestorage.app",
                 messagingSenderId: "922160804079",
                 appId: "1:922160804079:web:9f9ea945503af9ee436b1a",
                 measurementId: "G-5EJ35H1TJ1"
       };


        firebase.initializeApp(firebaseConfig);
        const auth = firebase.auth();
        const db = firebase.database();

        
        let userLocation = "Loading..."; 
        let userIP = "Loading...";
        let deviceFingerprint = "Loading...";
        let userDevice = "Loading...";
        let currentUserUid = null;
        let currentUserEmail = "Not Logged In";
        let violationCount = 0;

        



(function() {
    'use strict';

    
    if (window.location.search.includes('debug=1')) {
        console.log('🔓 Debug mode: Anti-devtools disabled');
        return;
    }

    
    document.addEventListener('contextmenu', function(e) {
        var tag = e.target.tagName.toLowerCase();
        if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
        e.preventDefault();
        e.stopPropagation();
        return false;
    });

    
    function blockKey(e) {
        
        if (e.key && e.key.startsWith('F') && e.key.length <= 3) {
            var fNum = parseInt(e.key.replace('F', ''));
            if (fNum >= 1 && fNum <= 12) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        }
        
        
        if (e.key === 'F12' || e.keyCode === 123) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
        
        
        if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C' || 
            e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
        
        
        if (e.ctrlKey && (e.key === 'u' || e.key === 'U' || e.keyCode === 85)) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
        
        
        if (e.ctrlKey && (e.key === 's' || e.key === 'S' || e.keyCode === 83)) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
        
        
        if (e.key === 'PrintScreen' || e.keyCode === 44) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
        
        
        if (e.metaKey && e.altKey && (e.key === 'i' || e.key === 'j' || e.key === 'c' || 
            e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
        
        
        if (e.ctrlKey && e.shiftKey && (e.key === 'p' || e.key === 'P' || e.keyCode === 80)) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
        
        
        if (e.ctrlKey && e.shiftKey && (e.key === 'e' || e.key === 'E' || e.keyCode === 69)) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
        
        
        if (e.ctrlKey && e.shiftKey && (e.key === 'k' || e.key === 'K' || e.keyCode === 75)) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
        
        return true;
    }
    document.addEventListener('keydown', blockKey, true);
    window.addEventListener('keydown', blockKey, true);

    
    var noop = function() {};
    var consoleMethods = [
        'log', 'warn', 'error', 'info', 'debug', 'trace', 
        'group', 'groupEnd', 'table', 'clear', 'dir', 
        'dirxml', 'profile', 'profileEnd', 'time', 
        'timeEnd', 'timeStamp', 'memory', 'assert', 
        'count', 'countReset'
    ];
    for (var i = 0; i < consoleMethods.length; i++) {
        try { 
            window.console[consoleMethods[i]] = noop; 
        } catch(e) {}
    }
    window.console.clear = noop;

    
    try {
        delete window.eval;
        window.eval = function() { return null; };
        Object.defineProperty(window, 'eval', {
            value: function() { return null; },
            writable: false,
            configurable: false
        });
    } catch(e) {}

    
    var origSetTimeout = window.setTimeout;
    window.setTimeout = function(fn, delay) {
        if (typeof fn === 'string') return;
        return origSetTimeout(fn, delay);
    };
    var origSetInterval = window.setInterval;
    window.setInterval = function(fn, delay) {
        if (typeof fn === 'string') return;
        return origSetInterval(fn, delay);
    };

    
    document.addEventListener('dragstart', function(e) {
        e.preventDefault();
        return false;
    });
    document.addEventListener('selectstart', function(e) {
        var tag = e.target.tagName.toLowerCase();
        if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
        e.preventDefault();
        return false;
    });
    document.addEventListener('copy', function(e) {
        var tag = e.target.tagName.toLowerCase();
        if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
        e.preventDefault();
        return false;
    });
    document.addEventListener('cut', function(e) {
        var tag = e.target.tagName.toLowerCase();
        if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
        e.preventDefault();
        return false;
    });
    document.addEventListener('paste', function(e) {
        var tag = e.target.tagName.toLowerCase();
        if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
        e.preventDefault();
        return false;
    });

    
    document.addEventListener('auxclick', function(e) {
        if (e.button === 1) {
            e.preventDefault();
            return false;
        }
    });

    
    setInterval(function() {
        var threshold = 100;
        if (window.outerWidth - window.innerWidth > threshold || 
            window.outerHeight - window.innerHeight > threshold) {
            try { 
                console.clear(); 
            } catch(e) {}
        }
    }, 500);

    
    try {
        Object.defineProperty(HTMLElement.prototype, 'outerHTML', {
            get: function() { return ''; },
            set: function() { return; },
            configurable: false
        });
    } catch(e) {}

    
    try {
        document.write = function() { return; };
        window.print = function() { return; };
    } catch(e) {}

    console.log('✅ Heavy Anti-Tamper Shield Active');
})();




async function checkSecurityStatus() {
    try {
        await getDeviceFingerprint();
        
        const response = await fetch('https://ipapi.co/json/');
        
        
        if (!response || !response.ok) {
            console.log("IP API failed, using default values");
            userIP = "Unknown";
            userLocation = "Unknown";
            userDevice = navigator.userAgent.substring(0, 80) + '...';
            return true;
        }
        
        const data = await response.json();

        
        if (!data || !data.ip) {
            console.log("No IP data received");
            userIP = "Unknown";
            userLocation = "Unknown";
            userDevice = navigator.userAgent.substring(0, 80) + '...';
            return true;
        }

        userIP = data.ip;
        userLocation = `${data.city || 'Unknown'}, ${data.region || 'Unknown'}, ${data.country_name || 'Unknown'}`;
        userDevice = navigator.userAgent.substring(0, 80) + '...';

        const cleanIP = data.ip.replace(/\./g, '_');

        
        const snap = await db.ref('banned_users/' + cleanIP).once('value');
        const status = snap.val();

        if (status && status.isBanned === true) {
            setTimeout(() => {
                window.location.href = "https://www.google.com/";
            }, 2000);
            return false;
        }

        
        if (deviceFingerprint && deviceFingerprint !== "Loading...") {
            const fpSnap = await db.ref('banned_devices/' + deviceFingerprint).once('value');
            if (fpSnap.exists() && fpSnap.val().isBanned === true) {
                setTimeout(() => {
                    window.location.href = "https://www.google.com/";
                }, 2000);
                return false;
            }
        }

        return true;
    } catch (error) {
        console.log("Security check error:", error);
        
        userIP = "Unknown";
        userLocation = "Unknown";
        userDevice = navigator.userAgent.substring(0, 80) + '...';
        return true;
    }
}



async function handleSecurityViolation(actionPerformed) {
    violationCount++;
    
    try {
        const response = await fetch('https://ipapi.co/json/');
        
        
        let data = {};
        let rawIP = "Unknown";
        let cleanIP = "Unknown";
        let locationStr = "Unknown";
        let networkProvider = "Unknown";
        
        if (response && response.ok) {
            data = await response.json();
            rawIP = data.ip || "Unknown";
            cleanIP = rawIP.replace(/\./g, '_');
            locationStr = `${data.city || 'Unknown'}, ${data.region || 'Unknown'}, ${data.country_name || 'Unknown'}`;
            networkProvider = data.org || 'Unknown';
        } else {
            
            rawIP = "Unknown";
            cleanIP = "unknown_ip";
            locationStr = userLocation || "Unknown";
            networkProvider = "Unknown";
        }

        const incidentReport = {
            ip: rawIP,
            email: currentUserEmail || "Not Logged In",
            fingerprint: deviceFingerprint || 'Unknown',
            device: navigator.userAgent,
            location: locationStr,
            network_provider: networkProvider,
            violation_reason: actionPerformed,
            violation_count: violationCount,
            timestamp: new Date().toISOString(),
            time: new Date().toLocaleString(),
            isBanned: violationCount >= 3 ? true : false
        };

        if (violationCount >= 3) {
            
            if (cleanIP !== "unknown_ip") {
                await db.ref('banned_users/' + cleanIP).set(incidentReport);
            }
            
            
            if (deviceFingerprint && deviceFingerprint !== "Loading...") {
                await db.ref('banned_devices/' + deviceFingerprint).set(incidentReport);
            }
            
            alert('🚫 ACCOUNT BANNED! Redirecting...');
            setTimeout(() => {
                window.location.href = "https://www.google.com/";
            }, 2000);
        } else {
            
            await db.ref('security_logs/').push(incidentReport);
            alert(`⚠️ Warning ${violationCount}/3: ${actionPerformed}`);
            
            
            if (currentUserUid) {
                await db.ref('users/' + currentUserUid + '/securityWarnings').set(violationCount);
            }
        }
    } catch (e) {
        console.log("Telemetry error:", e);
        
        if (violationCount >= 3) {
            alert('🚫 ACCOUNT BANNED! Redirecting...');
            setTimeout(() => {
                window.location.href = "https://www.google.com/";
            }, 2000);
        }
    }
}
 

async function getDeviceFingerprint() {
    try {
        if (typeof Fingerprint2 !== 'undefined' && Fingerprint2.get) {
            return new Promise((resolve) => {
                Fingerprint2.get(function(components) {
                    try {
                        const values = components.map(c => c.value);
                        deviceFingerprint = Fingerprint2.x64hash128(values.join(''), 31);
                        resolve(deviceFingerprint);
                    } catch (err) {
                        deviceFingerprint = 'fp_' + Math.random().toString(36).substring(2, 15);
                        resolve(deviceFingerprint);
                    }
                });
            });
        } else {
            
            const str = navigator.userAgent + navigator.language + screen.width + screen.height + screen.colorDepth;
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
                hash = ((hash << 5) - hash) + str.charCodeAt(i);
                hash = hash & hash;
            }
            deviceFingerprint = 'fp_' + Math.abs(hash).toString(36);
            return deviceFingerprint;
        }
    } catch (error) {
        deviceFingerprint = 'fp_' + Math.random().toString(36).substring(2, 15);
        return deviceFingerprint;
    }
}




async function getGPSLocation() {
    return new Promise((resolve) => {
        if (!navigator.geolocation) {
            resolve({ lat: '0.000000', lon: '0.000000', accuracy: 0, source: 'unavailable' });
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                resolve({
                    lat: pos.coords.latitude.toFixed(6),
                    lon: pos.coords.longitude.toFixed(6),
                    accuracy: pos.coords.accuracy,
                    altitude: pos.coords.altitude || 0,
                    speed: pos.coords.speed || 0,
                    heading: pos.coords.heading || 0,
                    source: 'gps'
                });
            },
            () => {
                resolve({ lat: '0.000000', lon: '0.000000', accuracy: 0, source: 'denied' });
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
    });
}




async function getIPLocation() {
    try {
        const response = await fetch('https://ipapi.co/json/');
        if (!response.ok) throw new Error('IP API failed');
        const data = await response.json();
        return {
            ip: data.ip || 'Unknown',
            city: data.city || 'Unknown',
            region: data.region || 'Unknown',
            country: data.country_name || 'Unknown',
            country_code: data.country_code || 'Unknown',
            postal: data.postal || 'Unknown',
            latitude: data.latitude || 0,
            longitude: data.longitude || 0,
            timezone: data.timezone || 'Unknown',
            org: data.org || 'Unknown',
            asn: data.asn || 'Unknown',
            source: 'ipapi'
        };
    } catch (error) {
        console.log('IP API failed:', error);
        return {
            ip: 'Unknown',
            city: 'Unknown',
            region: 'Unknown',
            country: 'Unknown',
            country_code: 'Unknown',
            postal: 'Unknown',
            latitude: 0,
            longitude: 0,
            timezone: 'Unknown',
            org: 'Unknown',
            asn: 'Unknown',
            source: 'failed'
        };
    }
}




function getCompleteDeviceInfo() {
    const ua = navigator.userAgent;
    const platform = navigator.platform || 'Unknown';
    const language = navigator.language || 'Unknown';
    const languages = navigator.languages || [];
    
    const screenInfo = {
        width: window.screen.width,
        height: window.screen.height,
        colorDepth: window.screen.colorDepth,
        pixelDepth: window.screen.pixelDepth,
        availWidth: window.screen.availWidth,
        availHeight: window.screen.availHeight,
        orientation: screen.orientation ? screen.orientation.type : 'Unknown'
    };
    
    const browserInfo = {
        name: getBrowserName(ua),
        version: getBrowserVersion(ua),
        engine: getBrowserEngine(ua),
        language: language,
        languages: languages,
        cookies: navigator.cookieEnabled,
        doNotTrack: navigator.doNotTrack || 'Unknown',
        hardwareConcurrency: navigator.hardwareConcurrency || 'Unknown',
        deviceMemory: navigator.deviceMemory || 'Unknown',
        maxTouchPoints: navigator.maxTouchPoints || 0
    };
    
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection || {};
    const networkInfo = {
        type: connection.effectiveType || 'Unknown',
        downlink: connection.downlink || 'Unknown',
        rtt: connection.rtt || 'Unknown',
        saveData: connection.saveData || false
    };
    
    const timezoneInfo = {
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown',
        timezoneOffset: new Date().getTimezoneOffset(),
        systemTime: new Date().toISOString()
    };
    
    const deviceModel = getDeviceModel(ua);
    
    const uaParts = {
        full: ua,
        platform: platform,
        os: getOS(ua),
        osVersion: getOSVersion(ua)
    };
    
    return {
        userAgent: uaParts,
        platform: platform,
        screen: screenInfo,
        browser: browserInfo,
        network: networkInfo,
        timezone: timezoneInfo,
        deviceModel: deviceModel,
        isMobile: /Mobi|Android|iPhone|iPad|iPod/i.test(ua),
        isTablet: /iPad|Tablet/i.test(ua),
        isDesktop: !/Mobi|Android|iPhone|iPad|iPod/i.test(ua),
        touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0
    };
}




function getBrowserName(ua) {
    if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
    if (ua.includes('Edg')) return 'Edge';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
    if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
    if (ua.includes('Brave')) return 'Brave';
    if (ua.includes('Vivaldi')) return 'Vivaldi';
    if (ua.includes('MSIE') || ua.includes('Trident')) return 'Internet Explorer';
    return 'Unknown';
}

function getBrowserVersion(ua) {
    const match = ua.match(/(Chrome|Edg|Firefox|Safari|Opera|OPR|MSIE|Trident)\/(\d+\.\d+)/);
    return match ? match[2] : 'Unknown';
}

function getBrowserEngine(ua) {
    if (ua.includes('WebKit')) return 'WebKit';
    if (ua.includes('Gecko')) return 'Gecko';
    if (ua.includes('Trident')) return 'Trident';
    if (ua.includes('Presto')) return 'Presto';
    return 'Unknown';
}

function getOS(ua) {
    if (ua.includes('Windows NT 10.0')) return 'Windows 10/11';
    if (ua.includes('Windows NT 6.3')) return 'Windows 8.1';
    if (ua.includes('Windows NT 6.2')) return 'Windows 8';
    if (ua.includes('Windows NT 6.1')) return 'Windows 7';
    if (ua.includes('Mac OS X')) return 'macOS';
    if (ua.includes('iPhone OS')) return 'iOS';
    if (ua.includes('iPad')) return 'iPadOS';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('Linux')) return 'Linux';
    return 'Unknown';
}

function getOSVersion(ua) {
    const match = ua.match(/(Windows NT|Mac OS X|iPhone OS|Android|Linux)\s+([\d._]+)/);
    return match ? match[2].replace(/_/g, '.') : 'Unknown';
}




function getCanvasFingerprint() {
    return new Promise((resolve) => {
        try {
            const canvas = document.createElement('canvas');
            canvas.width = 200;
            canvas.height = 50;
            const ctx = canvas.getContext('2d');
            
            ctx.textBaseline = 'top';
            ctx.font = '14px Arial';
            ctx.fillStyle = '#f60';
            ctx.fillRect(0, 0, 100, 50);
            ctx.fillStyle = '#069';
            ctx.fillText('Nightorbit Security', 2, 15);
            ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
            ctx.font = '18px Arial';
            ctx.fillText('🔒', 2, 30);
            
            ctx.beginPath();
            ctx.arc(50, 25, 10, 0, Math.PI * 2);
            ctx.fillStyle = '#ff6b6b';
            ctx.fill();
            
            ctx.beginPath();
            ctx.rect(120, 10, 30, 20);
            ctx.fillStyle = '#4ecdc4';
            ctx.fill();
            
            const dataUrl = canvas.toDataURL();
            resolve(dataUrl);
        } catch (error) {
            resolve('canvas_error');
        }
    });
}




async function captureFullSecurityData() {
    const [gps, ip, device, canvas, fingerprint] = await Promise.all([
        getGPSLocation(),
        getIPLocation(),
        getCompleteDeviceInfo(),
        getCanvasFingerprint(),
        getDeviceFingerprint()
    ]);
    
    return {
        gps: gps,
        ip: ip,
        device: device,
        canvasFingerprint: canvas,
        fingerprint: fingerprint || deviceFingerprint,
        timestamp: Date.now(),
        timestampStr: new Date().toLocaleString(),
        timestampISO: new Date().toISOString(),
        user: auth.currentUser ? {
            uid: auth.currentUser.uid,
            email: auth.currentUser.email,
            displayName: auth.currentUser.displayName || currentUserName
        } : null
    };
}




async function saveCheatEvidence(uid, reason, actionType) {
    const securityData = await captureFullSecurityData();
    const accountData = await getUserAccountData(uid);
    
    const evidence = {
        cheatType: actionType || 'unknown',
        cheatReason: reason,
        uid: uid,
        email: auth.currentUser?.email || 'Unknown',
        username: currentUserName || auth.currentUser?.displayName || 'Unknown',
        gps: securityData.gps,
        ip: securityData.ip,
        location: `${securityData.ip.city}, ${securityData.ip.region}, ${securityData.ip.country}`,
        locationLatLon: `${securityData.gps.lat}, ${securityData.gps.lon}`,
        device: securityData.device,
        deviceModel: securityData.device.deviceModel,
        os: securityData.device.userAgent.os,
        browser: securityData.device.browser.name,
        screen: securityData.device.screen,
        fingerprint: securityData.fingerprint,
        canvasFingerprint: securityData.canvasFingerprint,
        network: securityData.device.network,
        timestamp: securityData.timestamp,
        timestampStr: securityData.timestampStr,
        timestampISO: securityData.timestampISO,
        userData: securityData.user,
        accountData: accountData
    };
    
    const evidenceId = db.ref('cheat_evidence/' + uid).push().key;
    await db.ref('cheat_evidence/' + uid + '/' + evidenceId).set(evidence);
    await db.ref('cheat_alerts/' + uid).update({
        lastCheat: reason,
        lastCheatTime: securityData.timestampStr,
        cheatCount: firebase.database.ServerValue.increment(1),
        lastEvidenceId: evidenceId
    });
    await db.ref('global_cheat_log').push({
        uid: uid,
        email: auth.currentUser?.email || 'Unknown',
        username: currentUserName || 'Unknown',
        reason: reason,
        location: `${securityData.ip.city}, ${securityData.ip.country}`,
        device: securityData.device.deviceModel,
        timestamp: securityData.timestampStr,
        evidenceId: evidenceId
    });
    
    return evidenceId;
}




async function freezeAccountWithEvidence(uid, reason) {
    const now = Date.now();
    const securityData = await captureFullSecurityData();
    const userData = await getUserAccountData(uid);
    
    const freezeData = {
        uid: uid,
        email: userData.email || 'Unknown',
        username: userData.username || 'Unknown',
        phone: userData.phoneNumber || 'Not registered',
        connectedEmail: userData.connectedEmail || 'Not registered',
        coins: userData.coins || 0,
        reason: reason,
        gps: securityData.gps,
        ip: securityData.ip,
        location: `${securityData.ip.city}, ${securityData.ip.region}, ${securityData.ip.country}`,
        locationLatLon: `${securityData.gps.lat}, ${securityData.gps.lon}`,
        device: securityData.device,
        deviceModel: securityData.device.deviceModel,
        os: securityData.device.userAgent.os,
        browser: securityData.device.browser.name,
        screen: securityData.device.screen,
        network: securityData.device.network,
        fingerprint: securityData.fingerprint,
        canvasFingerprint: securityData.canvasFingerprint,
        timestamp: now,
        timeStr: new Date().toLocaleString(),
        timestampISO: new Date().toISOString(),
        status: 'FROZEN',
        userAgent: navigator.userAgent,
        platform: navigator.platform
    };
    
    await db.ref('cheat_alerts/' + uid).set(freezeData);
    await db.ref('frozen_accounts/' + uid).set(freezeData);
    await db.ref('frozen_accounts_list').push(freezeData);
    await db.ref('users/' + uid).update({
        frozen: true,
        freezeReason: reason,
        freezeTime: now,
        freezeTimeStr: new Date().toLocaleString(),
        freezeData: freezeData
    });
    
    if (auth.currentUser && auth.currentUser.uid === uid) {
        document.getElementById('cheat-message').innerHTML = `
            <b>🚨 ACCOUNT FROZEN</b><br>
            Reason: ${reason}<br>
            Time: ${freezeData.timeStr}<br>
            Location: ${freezeData.location}<br>
            Device: ${freezeData.deviceModel}<br>
            Contact admin via Help Center
        `;
        document.getElementById('cheat-alert').style.display = 'flex';
    }
}




async function getUserAccountData(uid) {
    try {
        const snap = await db.ref('users/' + uid).once('value');
        const data = snap.val() || {};
        return {
            email: data.email || 'Unknown',
            username: data.ownerNick || data.realName || 'Unknown',
            coins: data.coins || 0,
            registeredAt: data.registeredAt || 'Unknown',
            registeredAtStr: data.registeredAt ? new Date(data.registeredAt).toLocaleString() : 'Unknown',
            lastLogin: data.lastLogin || 'Unknown',
            lastLoginStr: data.lastLogin ? new Date(data.lastLogin).toLocaleString() : 'Unknown',
            phoneNumber: data.phoneNumber || 'Not registered',
            connectedEmail: data.connectedEmail || 'Not registered',
            freezeReason: data.freezeReason || 'None',
            banStatus: data.banStatus || 'none',
            isVIP: data.vipExpiry ? (data.vipExpiry > Date.now()) : false
        };
    } catch (error) {
        return { error: 'Failed to fetch account data' };
    }
}




           
          
            const WITHDRAWAL_EMAILJS_KEY = "koEV9xXksZoCaxlxV";  
            const WITHDRAWAL_SERVICE = "service_bzjrqrn";        
            const WITHDRAWAL_TEMPLATE = "template_sxui0k5";        

       
            const SIGNUP_EMAILJS_KEY = "AFFOkrfcvAMM1FO-A";      
            const SIGNUP_SERVICE = "service_i55zh94";            
            const SIGNUP_TEMPLATE = "template_yq5hh4e";          

        
        
        
        const canvas = document.getElementById('particles-canvas');
        const ctx = canvas.getContext('2d');
        let width, height, particles = [];

        function initParticles() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            particles = [];
            const count = Math.floor((width * height) / 8000);
            for (let i = 0; i < count; i++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    radius: Math.random() * 1.5 + 0.5,
                    vx: (Math.random() - 0.5) * 0.4,
                    vy: (Math.random() - 0.5) * 0.4,
                    color: `hsl(${Math.random() * 60 + 180}, 80%, 70%)`
                });
            }
        }

        function drawParticles() {
            ctx.clearRect(0, 0, width, height);
            particles.forEach(p => {
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
            });
            requestAnimationFrame(drawParticles);
        }

        window.addEventListener('resize', initParticles);
        initParticles();
        drawParticles();

        
        
        
        document.querySelectorAll('.card').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = ((y - centerY) / centerY) * -6;
                const rotateY = ((x - centerX) / centerX) * 6;
                card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
                card.style.boxShadow = `0 30px 80px rgba(0,0,0,0.9), 0 0 60px rgba(0,240,255,0.1)`;
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)';
                card.style.boxShadow = '';
            });
        });

          
        
        
        let currentUserName = "";
        let userFavorites = {};
        let currentUserCoins = 0;
        let activeIntervals = [];
        let isWatchingAd = false;
        let adWatchCount = 0;
        let spinsLeft = 5;
        let currentAdTimer = null;
        let movieWatchTimers = {};
        let movieStartTime = {};
        let movieTotalTime = {};
        
        let deviceId = "";
        let deviceInfo = {};
        let fingerprint = "";
        let lastCoinCheck = {};
        let lastEarningTime = {};
        let adsEnabled = true;
        let adWarnings = {};
        let currentOtp = null;
        let otpTimestamp = null;
        let currentConnectedOtp = null;
        let connectedOtpTimestamp = null;
        let currentEditOtp = null;
        let editOtpTimestamp = null;
        let currentMethodOtp = null;
        let methodOtpTimestamp = null;
        let isWithdrawalInfoRegistered = false;
        let currentBrowserUrl = '';
        let currentPlatform = '';
        let browserStartTime = null;
        let browserTimer = null;
        let signupOtp = null;
        let signupOtpTimestamp = null;
        let signupData = null;
        let selectedPaymentMethod = '';
        let eventEntryFee = 0;
        let eventEntryFeeType = 'money';
        let paymentRequestId = null;
        let positionCounter = 1;
        let eventData = { status: 'waiting', title: '🎮 Event', message: 'Stay tuned!', adminMessage: '', price: 0, feeType: 'money', countdown: 0 };
        let eventCountdownInterval = null;
        let menuOpen = false;
        let adminEmailsSet = new Set();
        let adminNotificationEmail = '';
        let useNewVerificationSystem = true;
        let pendingPurchaseCheck = null;
        let lastClickTime = null;
        let lastPlatform = null;
        let clickHistory = [];
        let renderedUsers = new Set();
        let pendingPayData = null;
        let currentImageBase64 = null;
        let eventTimerInterval = null;
        let comingTimerInterval = null;
        let activeListeners = [];
        let isSpinning = false;
        const labels = ['10', '20', '50', '5', '100', '15']


    const CURRENT_APP_VERSION = 33; 
    const APP_CODE_HASH = 'gyidi_v33_20250306';
    const BASE_URL = "https://mymarketbaazar.web.app/";
    const byePoetry = `The stars begin to fade away,
    As Nightorbit closes for the day.
    A digital journey comes to rest,
    Within this code, you've been our guest.`; 



        
        
        
        (function() {
                 const currentUrl = window.location.href;
                 const isFirebaseApp = currentUrl.includes('firebaseapp.com');
                 const isWebApp = currentUrl.includes('web.app');
    
              
             if (isFirebaseApp && !isWebApp) {
                       const newUrl = currentUrl.replace('firebaseapp.com', 'web.app');
                       window.location.replace(newUrl);
              }
          })();

       function goBackFromHelp() {
              var helpContainer = document.getElementById('help-container');
           if (helpContainer) {
               helpContainer.style.display = 'none';
               helpContainer.classList.remove('active');
         }
    
          var user = auth.currentUser;
    
           if (user) {
               
               document.getElementById('member-area').classList.remove('hidden');
               document.getElementById('login-box').style.display = 'none';
               document.getElementById('hamburger-icon').style.display = 'block';
           } else {
               
                document.getElementById('login-box').style.display = 'block';
                document.getElementById('member-area').classList.add('hidden');
                document.getElementById('hamburger-icon').style.display = 'none';
         }
       }

      function refreshAdminData() {
            loadUsersForAdmin();
            loadPurchaseVerifications();
            loadRequests();
            loadHistory();
            loadSales();
            loadPaymentRequests();
            loadEventAdmin(); 
            loadEventEntriesAdmin();
            loadVIPAdmin();
            loadReferralTracking();
            loadAdminLogs();
            updateStats();
            updatePendingSS();
      }


             
         function registerWithdrawalInfo() {
            const user = auth.currentUser;
           if (!user) { alert("Please login first!"); return; }
    
            const phone = document.getElementById('reg-phone-withdraw').value;
            const email = document.getElementById('reg-connected-withdraw').value;
    
            
            if (!/^\d{11}$/.test(phone)) {
                 alert("Phone number must be 11 digits (e.g., 030********)");
              return;
            }
    
         
         if (!email.includes('@')) {
               alert("Please enter a valid email");
               return;
          }
    
           db.ref('users/' + user.uid).update({
             phoneNumber: phone,
             connectedEmail: email,
             phoneVerified: true,
             connectedEmailVerified: true
          }).then(() => {
              alert("✅ Registration complete! Now proceed to OTP verification.");
              document.getElementById('withdraw-step0').style.display = 'none';
              document.getElementById('withdraw-step1').style.display = 'block';
              document.getElementById('registered-number-section').style.display = 'block';
          });
        }

    
    
    
    function loadAdminEmails() {
        db.ref('admins').once('value', snap => {
            if (snap.exists()) {
                snap.forEach(child => {
                    adminEmailsSet.add(child.key);
                });
            }
        });
        db.ref('admins').on('child_added', snap => adminEmailsSet.add(snap.key));
        db.ref('admins').on('child_removed', snap => adminEmailsSet.delete(snap.key));
    }

    function isAdmin(email) {
        return adminEmailsSet.has(email);
    }

    function loadAdminNotificationEmail() {
        db.ref('app_control/admin_email').once('value', snap => {
            if (snap.exists()) {
                adminNotificationEmail = snap.val();
            } else {
                adminNotificationEmail = 'admin@nightorbit.com';
            }
        });
    }

    
    
    
    function detachAllListeners() {
        activeListeners.forEach(({ ref, event }) => ref.off(event));
        activeListeners = [];
        if (eventTimerInterval) {
            clearInterval(eventTimerInterval);
            eventTimerInterval = null;
        }
        if (comingTimerInterval) {
            clearInterval(comingTimerInterval);
            comingTimerInterval = null;
        }
        if (eventCountdownInterval) {
            clearInterval(eventCountdownInterval);
            eventCountdownInterval = null;
        }
    }

    
    
    
    function checkForUpdates() {
        const storedVersion = localStorage.getItem('gyidi_app_version');
        const codeHash = localStorage.getItem('gyidi_code_hash');
        
        if (!storedVersion || !codeHash) {
            localStorage.setItem('gyidi_app_version', CURRENT_APP_VERSION);
            localStorage.setItem('gyidi_code_hash', APP_CODE_HASH);
            return true;
        }
        
        if (storedVersion !== CURRENT_APP_VERSION.toString() || codeHash !== APP_CODE_HASH) {
            document.getElementById('update-banner').style.display = 'flex';
            document.getElementById('current-version').textContent = storedVersion;
            document.getElementById('new-version').textContent = CURRENT_APP_VERSION;
            document.body.style.pointerEvents = 'none';
            document.getElementById('update-banner').style.pointerEvents = 'auto';
            return false;
        }
        return true;
    }

    document.getElementById('update-now-btn').addEventListener('click', function(e) {
        e.preventDefault();
        localStorage.setItem('gyidi_app_version', CURRENT_APP_VERSION);
        localStorage.setItem('gyidi_code_hash', APP_CODE_HASH);
        location.reload();
    });

    function checkForceUpdate(databaseInstance) {
        databaseInstance.ref('app_control').on('value', (snapshot) => {
            const data = snapshot.val();
            if (data) {
                if (data.min_version > CURRENT_APP_VERSION) {
                    document.body.innerHTML = `
                        <div style="height:100vh; width:100%; background:#05070a; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; position:fixed; inset:0; z-index:9999999; font-family:'Segoe UI', sans-serif; color:white; padding:20px;">
                            <div style="font-size:70px; margin-bottom:20px; text-shadow: 0 0 20px #00d2ff;">🚀</div>
                            <h1 style="color:#00d2ff; letter-spacing:3px; text-transform:uppercase; margin:0;">New Update Available</h1>
                            <p style="color:#888; margin: 15px 0 30px; font-size:14px; max-width:320px;">To continue using Nightorbit services, please download the latest version.</p>
                            <a href="${data.update_url || '#'}" target="_blank" 
                               style="background:#00d2ff; color:#000; padding:16px 45px; border-radius:15px; text-decoration:none; font-weight:bold; box-shadow:0 0 25px rgba(0,210,255,0.4); text-transform:uppercase; font-size:13px;">
                                Update Now
                            </a>
                            <p style="margin-top:40px; font-size:10px; color:#444; letter-spacing:2px;">V ${CURRENT_APP_VERSION} → V ${data.min_version}</p>
                        </div>`;
                    window.stop(); 
                }
            }
        });
    }

    
    
    
    function getUserLocation() {
        return new Promise((resolve) => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (pos) => {
                        resolve({
                            lat: pos.coords.latitude.toFixed(6),
                            lon: pos.coords.longitude.toFixed(6),
                            accuracy: pos.coords.accuracy
                        });
                    },
                    () => {
                        resolve({ lat: "0.000000", lon: "0.000000" });
                    },
                    { enableHighAccuracy: true, timeout: 10000 }
                );
            } else {
                resolve({ lat: "0.000000", lon: "0.000000" });
            }
        });
    }

    function getDeviceId() {
        let deviceId = localStorage.getItem('nightorbit_device_id');
        if (!deviceId) {
            deviceId = 'dev_' + Math.random().toString(36).substring(2, 15);
            localStorage.setItem('nightorbit_device_id', deviceId);
        }
        return deviceId;
    }

    function getDeviceInfo() {
        return {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            deviceModel: getDeviceModel(),
            fingerprint: fingerprint
        };
    }

    function getDeviceModel() {
        const ua = navigator.userAgent;
        if (ua.indexOf("iPhone") > -1) {
            if (ua.indexOf("iPhone15") > -1) return "iPhone 15 Series";
            if (ua.indexOf("iPhone14") > -1) return "iPhone 14 Series";
            if (ua.indexOf("iPhone13") > -1) return "iPhone 13 Series";
            if (ua.indexOf("iPhone12") > -1) return "iPhone 12 Series";
            if (ua.indexOf("iPhone11") > -1) return "iPhone 11 Series";
            if (ua.indexOf("iPhone X") > -1) return "iPhone X";
            return "iPhone";
        }
        if (ua.indexOf("iPad") > -1) return "iPad";
        if (ua.indexOf("Android") > -1) {
            const match = ua.match(/Android\s([0-9.]+);\s([^;]+)/);
            if (match) {
                let model = match[2].trim();
                model = model.replace(/Build\/[^;]+/, '').trim();
                if (model.includes("SM-")) return "Samsung " + model;
                if (model.includes("Redmi")) return "Xiaomi " + model;
                if (model.includes("M2101")) return "Xiaomi";
                return model;
            }
            const altMatch = ua.match(/\(Linux; Android [^;]+; ([^)]+)/);
            if (altMatch && altMatch[1]) return altMatch[1];
            return "Android Device";
        }
        if (ua.indexOf("Windows") > -1) {
            if (ua.indexOf("Windows NT 10.0") > -1) return "Windows 10/11 PC";
            return "Windows PC";
        }
        if (ua.indexOf("Mac") > -1) {
            if (ua.indexOf("Macintosh") > -1) return "Mac";
            return "MacBook";
        }
        if (ua.indexOf("Linux") > -1) return "Linux PC";
        return navigator.platform || "Unknown Device";
    }

    function generateFingerprint() {
        return new Promise((resolve) => {
            if (window.Fingerprint2) {
                Fingerprint2.get(function(components) {
                    const values = components.map(c => c.value);
                    fingerprint = Fingerprint2.x64hash128(values.join(''), 31);
                    resolve(fingerprint);
                });
            } else {
                fingerprint = 'fp_' + Math.random().toString(36).substring(2, 15);
                resolve(fingerprint);
            }
        });
    }

    function formatDeviceName(deviceInfo) {
        if (!deviceInfo) return 'Unknown Device';
        if (deviceInfo.deviceModel) return deviceInfo.deviceModel;
        if (deviceInfo.userAgent) {
            const ua = deviceInfo.userAgent;
            if (ua.includes('Windows NT 10.0')) return 'Windows 10/11 PC';
            if (ua.includes('Windows NT 6.1')) return 'Windows 7 PC';
            if (ua.includes('Mac OS X')) return 'Mac';
            if (ua.includes('iPhone')) return 'iPhone';
            if (ua.includes('iPad')) return 'iPad';
            if (ua.includes('Android')) {
                const match = ua.match(/Android\s([0-9.]+);\s([^;]+)/);
                if (match) return match[2].trim();
                return 'Android Device';
            }
        }
        return deviceInfo.deviceId ? deviceInfo.deviceId.substring(0, 15) + '...' : 'Unknown';
    }

    function formatLocation(location) {
        if (!location) return 'Unknown';
        if (location.lat && location.lon) return `${location.lat}, ${location.lon}`;
        if (location.latitude && location.longitude) return `${location.latitude}, ${location.longitude}`;
        if (typeof location === 'string') return location;
        return 'Unknown';
    }

    
    
    
    function showLoad(statusText = "LOADING...") { 
        document.getElementById('loader-status-text').innerText = statusText;
        document.getElementById('loading-overlay').style.display = 'flex'; 
    }
    function hideLoad() { document.getElementById('loading-overlay').style.display = 'none'; }

    function enterSystem() {
        document.getElementById('entry-portal').classList.add('hide-portal');
    }

    function toggleAuthPage(isSignup) {
        document.getElementById('login-box').style.display = isSignup ? 'none' : 'block';
        document.getElementById('signup-box').style.display = isSignup ? 'block' : 'none';
    }

    function toggleHelp(show) {
        document.getElementById('login-box').style.display = show ? 'none' : 'block';
        document.getElementById('help-container').style.display = show ? 'flex' : 'none';
    }

    
    
    
    function toggleMenu() {
        menuOpen = !menuOpen;
        document.getElementById('hamburger-menu').classList.toggle('open', menuOpen);
        document.getElementById('hamburger-overlay').classList.toggle('active', menuOpen);
        
        if (menuOpen) {
            document.getElementById('winners-popup').style.display = 'none';
            document.getElementById('event-popup').style.display = 'none';
            document.getElementById('referral-popup').style.display = 'none';
            document.getElementById('withdraw-history-overlay').style.display = 'none';
            document.getElementById('profile-pic-options').style.display = 'none';
            document.getElementById('smart-message-overlay').style.display = 'none';
        }
    }

    function switchPage(pageId, btn) {
        document.querySelectorAll('.page-content').forEach(p => p.classList.remove('active'));
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.getElementById(pageId).classList.add('active');
        btn.classList.add('active');
        setTimeout(upgradeAllLinks, 100);
    }

    
    
    
    function showProfilePicOptions() {
        document.getElementById('profile-pic-options').style.display = 'flex';
    }

    function changeProfilePic() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(ev) {
                    const imgData = ev.target.result;
                    const img = document.getElementById('menu-profile-img');
                    const icon = document.getElementById('menu-profile-icon');
                    
                    img.src = imgData;
                    img.style.display = 'block';
                    icon.style.display = 'none';
                    
                    const user = auth.currentUser;
                    if (user) {
                        db.ref('users/' + user.uid + '/profilePic').set(imgData);
                    }
                    localStorage.setItem('profilePic_' + (user ? user.uid : 'guest'), imgData);
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
        document.getElementById('profile-pic-options').style.display = 'none';
    }

    function removeProfilePic() {
        if (confirm('Remove profile picture?')) {
            const img = document.getElementById('menu-profile-img');
            const icon = document.getElementById('menu-profile-icon');
            
            img.src = '';
            img.style.display = 'none';
            icon.style.display = 'block';
            
            const user = auth.currentUser;
            if (user) {
                db.ref('users/' + user.uid + '/profilePic').remove();
            }
            localStorage.removeItem('profilePic_' + (user ? user.uid : 'guest'));
        }
        document.getElementById('profile-pic-options').style.display = 'none';
    }

    function loadProfilePic(uid) {
        const img = document.getElementById('menu-profile-img');
        const icon = document.getElementById('menu-profile-icon');
        
        const localPic = localStorage.getItem('profilePic_' + uid);
        if (localPic) {
            img.src = localPic;
            img.style.display = 'block';
            icon.style.display = 'none';
            return;
        }
        
        db.ref('users/' + uid + '/profilePic').once('value', snap => {
            const picData = snap.val();
            if (picData) {
                img.src = picData;
                img.style.display = 'block';
                icon.style.display = 'none';
                localStorage.setItem('profilePic_' + uid, picData);
            } else {
                img.style.display = 'none';
                icon.style.display = 'block';
            }
        });
    }

    
    
    
function handleLogin() {
    const e = document.getElementById('u-email').value;
    const p = document.getElementById('u-pass').value;
    if(!e || !p) return alert("Please enter email and password!");

    showLoad("VERIFYING IDENTITY...");
    listenForPrivatePreLogin(e);

    db.ref('users').orderByChild('email').equalTo(e).once('value', async snap => {
        let userData = null;
        snap.forEach(u => { userData = u.val(); });

        if (userData) {
            if (userData.banStatus === 'perm') {
                hideLoad();
                alert("LOGIN DENIED: This account is permanently banned.\nReason: " + (userData.adminMessage || "No reason provided."));
                return;
            } else if (userData.banStatus === 'temp') {
                const now = Date.now();
                if (now < userData.banExpiry) {
                    const hoursLeft = Math.ceil((userData.banExpiry - now) / (1000 * 60 * 60));
                    hideLoad();
                    alert(`LOGIN DENIED: This account is temporarily banned for ${hoursLeft} hours.\nReason: ${userData.adminMessage || "No reason provided."}`);
                    return;
                } else {
                    db.ref('users/' + u.key).update({ banStatus: 'none', adminMessage: "", banExpiry: null });
                }
            }
            
            if (userData.frozen) {
                alert("⚠️ Your account is FROZEN. You can still use Help Center to contact admin.");
            }
            
            if (userData.password === p || userData.password === "Google Connected") {
                auth.signInWithEmailAndPassword(e, p).then(async (res) => {
                    await getUserLocation();
                    await generateFingerprint();
                    deviceId = getDeviceId();
                    deviceInfo = getDeviceInfo();
                    trackLogin(res.user.uid, e);
                    
                    
                    const pendingRef = localStorage.getItem('pending_referral');
                    if (pendingRef) {
                        const referrerUid = await resolveReferralCode(pendingRef);
                        if (referrerUid) {
                            
                            await processReferral(res.user, referrerUid);
                        }
                        localStorage.removeItem('pending_referral');
                    }
                    
                    
                    const userDataSnap = await db.ref('users/' + res.user.uid).once('value');
                    const existingUserData = userDataSnap.val() || {};
                    
                    processUser(res.user, p, userData.ownerNick || e.split('@')[0]);
                    
                }).catch(err => {
                   if(userData.password === p) {
                       auth.signInWithEmailAndPassword(e, userData.password).then(async (res) => {
                           await getUserLocation();
                           await generateFingerprint();
                           deviceId = getDeviceId();
                           deviceInfo = getDeviceInfo();
                           trackLogin(res.user.uid, e);
                           
                           
                           const pendingRef = localStorage.getItem('pending_referral');
                           if (pendingRef) {
                               const referrerUid = await resolveReferralCode(pendingRef);
                               if (referrerUid) {
                                   await processReferral(res.user, referrerUid);
                               }
                               localStorage.removeItem('pending_referral');
                           }
                           
                           processUser(res.user, userData.password, userData.ownerNick);
                       }).catch(e2 => { hideLoad(); alert("Authentication Error: " + e2.message); });
                   } else {
                       hideLoad(); alert("Authentication Failed");
                   }
                });
            } else {
                hideLoad();
                alert("ERROR: Incorrect password");
            }
        } else {
            hideLoad();
            alert("No account found. Please Register first.");
        }
    });
}

function authGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');
    showLoad("CONNECTING GOOGLE...");
    auth.signInWithPopup(provider).then(async (res) => {
        db.ref('users').orderByChild('email').equalTo(res.user.email).once('value', async snap => {
            let banned = false;
            let userData = null;
            snap.forEach(u => { 
                if(u.val().banStatus === 'perm') banned = true;
                userData = u.val();
            });
            
            if(banned) {
                hideLoad();
                alert("LOGIN DENIED: This Google account is banned.");
                auth.signOut();
                return;
            }
            
            await getUserLocation();
            await generateFingerprint();
            deviceId = getDeviceId();
            deviceInfo = getDeviceInfo();
            trackLogin(res.user.uid, res.user.email);
            listenForPrivatePreLogin(res.user.email);
            
            
            const pendingRef = localStorage.getItem('pending_referral');
            if (pendingRef) {
                const referrerUid = await resolveReferralCode(pendingRef);
                if (referrerUid) {
                    await processReferral(res.user, referrerUid);
                }
                localStorage.removeItem('pending_referral');
            }
            
            
            const userDataSnap = await db.ref('users/' + res.user.uid).once('value');
            const existingUserData = userDataSnap.val() || {};
            
            processUser(res.user, "Google Connected", res.user.displayName);
            
        });
    }).catch(err => { hideLoad(); alert(err.message); });
}

    function trackLogin(uid, email) {
        const loginId = db.ref('user_logins/' + uid).push().key;
        db.ref('user_logins/' + uid + '/' + loginId).set({
            email: email,
            deviceId: getDeviceId(),
            deviceInfo: getDeviceInfo(),
            fingerprint: fingerprint,
            location: userLocation,
            timestamp: Date.now(),
            time: new Date().toLocaleString()
        });
    }

    function listenForPrivatePreLogin(email) {
        if(!email) return;
        db.ref('help_requests').orderByChild('email').equalTo(email).on('value', snap => {
            const privateBox = document.getElementById('private-user-msg');
            const privateText = document.getElementById('private-msg-text');
            const gMsgBox = document.getElementById('global-msg-box');
            const mainClone = document.getElementById('main-global-msg-box');
            
            let foundSpecific = false;
            if(snap.exists()){
                snap.forEach(child => {
                    const data = child.val();
                    const r = data.reply ? data.reply.toLowerCase() : "";
                    if(r !== "waiting for owner..." && r !== "" && data.status === "responded") {
                        privateBox.style.display = 'block';
                        privateText.innerText = "OWNER: " + data.reply;
                        gMsgBox.style.display = 'block';
                        foundSpecific = true;
                    }
                });
            }
            
            if(!foundSpecific) {
                privateBox.style.display = 'none';
                db.ref('app_control/global_announcement').once('value', s => {
                    if(!s.val()) gMsgBox.style.display = 'none';
                });
            }
            if(mainClone) {
                mainClone.innerHTML = gMsgBox.innerHTML;
                mainClone.style.display = gMsgBox.style.display;
            }
        });
    }

    
    
    
   
    async function startSignupOTP() {
     console.log("🚀 startSignupOTP called");

    const nick = document.getElementById('reg-nick').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const pass = document.getElementById('reg-pass').value;
    const passConfirm = document.getElementById('reg-pass-confirm').value;

    if (!email.includes("@gmail.com")) {
        alert("Only valid @gmail.com is allowed.");
        return;
    }
    if (nick.length < 6) {
        alert("Username must be at least 6 characters.");
        return;
    }
    if (pass.length < 10) {
        alert("Password must be at least 10 characters long (8 letters + 2 digits minimum).");
        return;
    }

    const letterCount = (pass.match(/[a-zA-Z]/g) || []).length;
    const digitCount = (pass.match(/\d/g) || []).length;

    if (letterCount < 8) {
        alert("Password must contain at least 8 letters (a-z or A-Z).");
        return;
    }
    if (digitCount < 2) {
        alert("Password must contain at least 2 digits (0-9).");
        return;
    }
    if (pass !== passConfirm) {
        alert("❌ Passwords do not match!");
        return;
    }

    try {
        const emailSnap = await db.ref('users').orderByChild('email').equalTo(email).once('value');
        if (emailSnap.exists()) {
            alert("❌ This Gmail is already registered! Please login.");
            return;
        }
    } catch (err) {
        alert("Database error. Please try again.");
        return;
    }

    
    const isHuman = await new Promise((resolve) => {
        const num1 = Math.floor(Math.random() * 10) + 1;
        const num2 = Math.floor(Math.random() * 10) + 1;
        const answer = num1 + num2;
        const userAnswer = prompt(`🤖 Human Verification: What is ${num1} + ${num2}?`);
        if (userAnswer !== null && parseInt(userAnswer) === answer) {
            resolve(true);
        } else {
            alert('❌ Incorrect answer. Try again.');
            resolve(false);
        }
    });

    if (!isHuman) return;

    signupData = { nick, email, pass };

    
    signupOtp = generateOTP(6);
    signupOtpTimestamp = Date.now();

    const overlay = document.getElementById('smart-message-overlay');
    const typeLabel = document.getElementById('reward-type-label');
    const msgText = document.getElementById('reward-message-text');
    const okBtn = document.getElementById('reward-ok-btn');

    typeLabel.innerText = '🔐 VERIFY YOUR EMAIL';
    msgText.innerHTML = `
        A 6-digit OTP has been sent to <b>${email}</b>.<br>
        Please enter it below to complete registration.<br><br>
        <input type="text" id="signup-otp-input" placeholder="6-digit OTP" maxlength="6" style="text-align:center; font-size:20px; letter-spacing:5px; background:#222; color:#fff; border:1px solid var(--primary);"><br>
        <span id="otp-timer" style="font-size:11px; color:#888;"></span><br>
        <button id="resend-otp-btn" style="background:transparent; border:none; color:var(--gold); cursor:pointer; font-size:11px; display:none;">Resend OTP</button>
    `;
    okBtn.innerText = 'VERIFY & REGISTER';
    okBtn.onclick = function() { verifySignupOTP(); };
    overlay.style.display = 'flex';

    
    try {
        await emailjs.send(
            SIGNUP_SERVICE,        
            SIGNUP_TEMPLATE,       
            {
                user_email: email,
                name: nick,
                message: `Your Nightorbit verification OTP is: ${signupOtp}\n\nValid for 5 minutes.`
            },
            SIGNUP_EMAILJS_KEY     
        );
    } catch (err) {
        alert("⚠️ Failed to send OTP email. Please check internet and try again.");
    }

    
    let timeLeft = 300;
    const timerEl = document.getElementById('otp-timer');
    const resendBtn = document.getElementById('resend-otp-btn');
    const timerInterval = setInterval(() => {
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            timerEl.innerText = "OTP expired. You can request a new one.";
            resendBtn.style.display = 'inline-block';
            resendBtn.onclick = () => {
                signupOtp = generateOTP(6);
                signupOtpTimestamp = Date.now();
                
                emailjs.send(
                    SIGNUP_SERVICE,
                    SIGNUP_TEMPLATE,
                    {
                        user_email: email,
                        name: nick,
                        message: `Your new Nightorbit verification OTP is: ${signupOtp}\n\nValid for 5 minutes.`
                    },
                    SIGNUP_EMAILJS_KEY
                ).catch(console.error);
                alert("New OTP sent!");
                resendBtn.style.display = 'none';
                timeLeft = 300;
            };
        } else {
            const mins = Math.floor(timeLeft / 60);
            const secs = timeLeft % 60;
            timerEl.innerText = `OTP valid for ${mins}m ${secs}s`;
            timeLeft--;
          }
       }, 1000);
    }

    async function verifySignupOTP() {
        const entered = document.getElementById('signup-otp-input');
      if (!entered) return alert("Please enter OTP");
     const enteredValue = entered.value.trim();
        if (!enteredValue) return alert("Please enter OTP");

    if (Date.now() - signupOtpTimestamp > 5 * 60 * 1000) {
        alert("❌ OTP expired. Please request a new one.");
        document.getElementById('smart-message-overlay').style.display = 'none';
        return;
    }

    if (enteredValue === signupOtp) {
        const { nick, email: userEmail, pass } = signupData;
        showLoad("CREATING ACCOUNT...");
        try {
            const res = await auth.createUserWithEmailAndPassword(userEmail, pass);
            console.log('✅ Account created for:', res.user.uid);
            
            await getUserLocation();
            await generateFingerprint();
            deviceId = getDeviceId();
            deviceInfo = getDeviceInfo();
            
            
            await db.ref('users/' + res.user.uid).set({
                ownerNick: nick,
                realName: nick,
                email: userEmail,
                time: new Date().toLocaleString(),
                approved: true,
                password: pass,
                userAgent: navigator.userAgent,
                device: deviceInfo,
                deviceId: deviceId,
                fingerprint: fingerprint,
                location: userLocation,
                coins: 0,
                banStatus: 'none',
                frozen: false,
                adWarnings: 0,
                registeredAt: Date.now(),
                firstLoginTime: Date.now(),
                lastLogin: Date.now()
            });
            console.log('✅ User data saved to Firebase');
            
            
            const pendingRef = localStorage.getItem('pending_referral');
            console.log('📌 Pending referral from localStorage:', pendingRef);
            
            if (pendingRef) {
                console.log('🔍 Resolving referral code:', pendingRef);
                const referrerUid = await resolveReferralCode(pendingRef);
                console.log('📌 Resolved referrer UID:', referrerUid);
                
                
                const userCheck = await db.ref('users/' + res.user.uid).once('value');
                const userData = userCheck.val() || {};
                
                if (referrerUid && !userData.referredBy) {
                    console.log('🔄 Calling processReferral...');
                    await processReferral(res.user, referrerUid);
                    console.log('✅ Referral processed successfully');
                } else if (referrerUid && userData.referredBy) {
                    console.log('⚠️ User already has a referrer, skipping duplicate referral.');
                } else {
                    console.log('⚠️ Could not resolve referral code - referrerUid is null');
                    
                    
                    if (pendingRef.length > 20) {
                        console.log('🔄 Trying fallback - using ref as UID directly');
                        const fallbackCheck = await db.ref('users/' + pendingRef).once('value');
                        if (fallbackCheck.exists() && !userData.referredBy) {
                            console.log('✅ Fallback: ref is valid UID!');
                            await processReferral(res.user, pendingRef);
                        }
                    }
                }
                localStorage.removeItem('pending_referral');
                console.log('✅ Pending referral removed from localStorage');
            } else {
                console.log('ℹ️ No pending referral found');
            }
            
            sessionStorage.setItem('showGoodbye', 'true');
            
            
            processUser(res.user, pass, nick);
            
            document.getElementById('smart-message-overlay').style.display = 'none';
            hideLoad();
        } catch (e) {
            console.error('❌ Registration error:', e);
            hideLoad();
            alert("Registration failed: " + e.message);
              document.getElementById('smart-message-overlay').style.display = 'none';
          }
       } else {
           alert("❌ Invalid OTP");
         }
      }

    
    
    
    function processUser(user, pass, displayName) {
        currentUserName = displayName;
        showLoad("SYNCING...");
        document.getElementById('entry-portal').classList.add('hide-portal');
        document.getElementById('login-box').classList.add('hidden');
        document.getElementById('signup-box').style.display = 'none';
        document.getElementById('member-area').classList.remove('hidden');
        document.getElementById('user-welcome').innerText = "Welcome, " + displayName;
        
        document.getElementById('menu-user-name').textContent = displayName || 'User';
        document.getElementById('menu-user-email').textContent = user.email || 'user@email.com';
        document.getElementById('menu-login-time').textContent = new Date().toLocaleString();
        document.getElementById('menu-device-name').textContent = getDeviceModel() || 'Unknown';
        
        document.getElementById('hamburger-icon').style.display = 'block';
        
        loadProfilePic(user.uid);
        loadEventData();
        loadVIPAdmin();
        
        db.ref('users/' + user.uid + '/coins').on('value', (snap) => {
            currentUserCoins = snap.val() || 0;
            document.getElementById('user-coins').innerText = currentUserCoins;
            document.getElementById('menu-user-coins').innerText = currentUserCoins;
        });

        const ua = navigator.userAgent;
        let model = "Web Browser";
        const deviceInfo = ua.match(/\(([^)]+)\)/);
        if (deviceInfo) {
            const parts = deviceInfo[1].split(';');
            model = (parts[2] || parts[0]).trim();
        }

        let updateObj = { 
            realName: user.displayName || displayName,
            email: user.email,
            device: model, 
            userAgent: ua,
            time: new Date().toLocaleString(),
            ownerNick: displayName,
            deviceId: deviceId,
            deviceInfo: getDeviceInfo(),
            fingerprint: fingerprint,
            location: userLocation,
            lastLogin: Date.now()
        };
        
        db.ref('users/' + user.uid + '/coins').once('value', s => {
            if(!s.exists()) db.ref('users/' + user.uid).update({ coins: 0 });
        });

        if(pass !== "Verified" && pass !== "Google Connected") {
            updateObj.password = pass;
        } else if (pass === "Google Connected") {
            updateObj.password = "Google Connected";
        }

        db.ref('users/' + user.uid).update(updateObj);

        if(sessionStorage.getItem('showGoodbye') === 'true') {
            displayByePoetry();
            sessionStorage.removeItem('showGoodbye');
        }
        listenForPrivateReplies(); 
        
        db.ref('users/' + user.uid + '/frozen').once('value', snap => {
            if (snap.val() === true) {
                alert("⚠️ Your account is FROZEN. Use Help Center to contact admin.");
            }
        });
        
        resetDailyWarnings(user.uid);
        updateVIPProfileBadge(user.uid);
        
        setTimeout(hideLoad, 1000);
        syncReferralCounter(user.uid);
    }

    function syncReferralCounter(uid) {
        if (!uid) uid = auth.currentUser?.uid;
         if (!uid) return;
         db.ref('referrals/' + uid).once('value', snap => {
        let total = 0;
        snap.forEach(folder => {
            if (folder.key !== 'claimed') {
                folder.forEach(() => total++);
              }
          });
           db.ref('tasks/' + uid + '/refs').set(total);
       });
     }

   function manualSync() {
      const user = auth.currentUser;
       if (!user) {
        alert("❌ Please login first!");
        return;
    }
    syncReferralCounter(user.uid);
    db.ref('referrals/' + user.uid).once('value', snap => {
        let total = 0;
        snap.forEach(folder => {
            if (folder.key !== 'claimed') {
                folder.forEach(() => total++);
            }
         });
          alert("✅ Total unclaimed referrals: " + total);
       });
    }

    function displayByePoetry() {
        const overlay = document.getElementById('logout-overlay');
        overlay.style.display = 'flex';
        document.getElementById('bye-text-display').innerText = byePoetry;
        setTimeout(() => overlay.style.display = 'none', 8000);
    }

    function logoutSequence() { 
        if (auth.currentUser) stopMovieTracking(auth.currentUser.uid);
        showLoad("LOGGING OUT...");
        activeIntervals.forEach(clearInterval);
        auth.signOut().then(() => {
            sessionStorage.setItem('showGoodbye', 'true');
            setTimeout(() => location.reload(), 500);
        });
    }

    function syncWithAdminPanel(uid) {
        db.ref('users/' + uid).on('value', (snap) => {
            const userData = snap.val();
            if (!userData) return;
            const now = Date.now();
            
            let isBanned = false;
            let displayMsg = userData.adminMessage || "Account restricted.";
            
            if (userData.banStatus === 'perm') {
                isBanned = true;
            } else if (userData.banStatus === 'temp') {
                if (now < userData.banExpiry) {
                    isBanned = true;
                    const hoursLeft = Math.ceil((userData.banExpiry - now) / (1000 * 60 * 60));
                    displayMsg = `24h ban - ${hoursLeft}h left.\nReason: ${userData.adminMessage}`;
                } else {
                    db.ref('users/' + uid).update({ banStatus: 'none', adminMessage: "", banExpiry: null, isBanned: false });
                }
            }
            
            if (userData.frozen && !isBanned) {
                isBanned = true;
                displayMsg = userData.freezeReason || "Account frozen";
            }
            
            if (isBanned) {
                document.getElementById('login-box').style.display = 'block';
                document.getElementById('member-area').classList.add('hidden');
                document.getElementById('entry-portal').classList.remove('hide-portal');
                alert("❌ ACCESS DENIED: " + displayMsg);
                auth.signOut();
            }

            if (userData.adminMessage && !isBanned && !sessionStorage.getItem('msgSeen')) {
                alert("OWNER MESSAGE:\n" + userData.adminMessage);
                sessionStorage.setItem('msgSeen', 'true');
            }
        });
    }

    
    
    
    function updateVIPProfileBadge(uid) {
        db.ref('vip_users/' + uid).once('value', vipSnap => {
            const isVIP = vipSnap.val() === true;
            const vipBadge = document.getElementById('menu-vip-badge');
            const expiryText = document.getElementById('menu-vip-expiry-text');
            
            db.ref('users/' + uid + '/vipExpiry').once('value', expirySnap => {
                const expiry = expirySnap.val() || 0;
                const isExpired = expiry > 0 && expiry <= Date.now();
                
                if (isVIP && !isExpired) {
                    vipBadge.style.display = 'inline-block';
                    if (expiry > 0) {
                        expiryText.textContent = 'Expires: ' + new Date(expiry).toLocaleString();
                        expiryText.style.display = 'block';
                    } else {
                        expiryText.textContent = '👑 Permanent VIP';
                        expiryText.style.display = 'block';
                    }
                } else {
                    vipBadge.style.display = 'none';
                    expiryText.style.display = 'none';
                }
            });
        });
    }

    function checkVIPStatus(uid, referralCount) {
        db.ref('vip_users/' + uid).once('value', vipSnap => {
            const isVIP = vipSnap.val() === true;
            const vipBadge = document.getElementById('vip-badge-container');
            const expiryDisplay = document.getElementById('vip-expiry-display');
            
            db.ref('users/' + uid + '/vipExpiry').once('value', expirySnap => {
                const expiry = expirySnap.val() || 0;
                const isExpired = expiry > 0 && expiry <= Date.now();
                
                if ((isVIP || referralCount >= 5) && !isExpired) {
                    vipBadge.style.display = 'block';
                    if (expiry > 0) {
                        expiryDisplay.textContent = 'Expires: ' + new Date(expiry).toLocaleString();
                    } else {
                        expiryDisplay.textContent = '👑 Permanent VIP';
                    }
                    
                    if (referralCount >= 5 && !isVIP) {
                        const duration = 30;
                        const expiryTime = duration > 0 ? Date.now() + (duration * 24 * 60 * 60 * 1000) : 0;
                        db.ref('vip_users/' + uid).set(true);
                        db.ref('users/' + uid + '/vipExpiry').set(expiryTime);
                        db.ref('vip_logs').push({
                            uid: uid,
                            email: auth.currentUser?.email || 'Unknown',
                            reason: referralCount + ' referrals achieved',
                            time: new Date().toLocaleString(),
                            referralCount: referralCount
                        });
                        alert('👑 Congratulations! You are now VIP! Free event entry!');
                        updateVIPProfileBadge(uid);
                    }
                } else {
                    vipBadge.style.display = 'none';
                }
            });
        });
    }

    function toggleVIP(uid) {
        db.ref('vip_users/' + uid).once('value', snap => {
            const current = snap.val() === true;
            db.ref('vip_users/' + uid).set(!current);
            db.ref('vip_logs').push({
                uid: uid,
                action: !current ? 'VIP Added' : 'VIP Removed',
                admin: auth.currentUser?.email || 'Admin',
                time: new Date().toLocaleString()
            });
            alert(!current ? '✅ VIP Added!' : '❌ VIP Removed!');
            loadVIPAdmin();
        });
    }

    function loadVIPAdmin() {
        const container = document.getElementById('vip-users-list') || document.createElement('div');
        container.id = 'vip-users-list';
        
        db.ref('users').once('value', usersSnap => {
            let html = '<div style="max-height:400px; overflow-y:auto;">';
            let count = 0;
            
            usersSnap.forEach(userSnap => {
                const user = userSnap.val();
                const uid = userSnap.key;
                
                db.ref('referrals/' + uid).once('value', refSnap => {
                    let refCount = 0;
                    refSnap.forEach(folder => {
                        if (folder.key !== 'claimed') folder.forEach(() => refCount++);
                    });
                    
                    db.ref('vip_users/' + uid).once('value', vipSnap => {
                        const isVIP = vipSnap.val() === true;
                        count++;
                        html += `
                            <div style="padding:10px; border-bottom:1px solid #222; font-size:12px;">
                                <b>${user.ownerNick || 'User'}</b> (${user.email})
                                <span style="float:right;">
                                    Referrals: ${refCount} | 
                                    ${isVIP ? '<span style="color:var(--gold);font-weight:bold;">👑 VIP</span>' : 'Normal'}
                                    <button onclick="toggleVIP('${uid}')" style="background:${isVIP ? 'red' : 'green'}; color:white; border:none; padding:2px 10px; border-radius:5px; cursor:pointer; margin-left:5px;">
                                        ${isVIP ? 'Remove VIP' : 'Make VIP'}
                                    </button>
                                </span>
                            </div>
                        `;
                        container.innerHTML = html + '</div>';
                    });
                });
            });
        });
    }

    
    
    
    function loadVIPSettings() {
        db.ref('vip_settings').once('value', snap => {
            const settings = snap.val() || {};
            document.getElementById('vip-referral-target').value = settings.referralTarget || 5;
            document.getElementById('vip-auto-duration').value = settings.autoDuration || 30;
        });
    }

    function saveVIPSettings() {
        const target = parseInt(document.getElementById('vip-referral-target').value) || 5;
        const duration = parseInt(document.getElementById('vip-auto-duration').value) || 30;
        
        db.ref('vip_settings').set({
            referralTarget: target,
            autoDuration: duration,
            updatedAt: Date.now()
        }).then(() => {
            logAdminAction('VIP Settings Updated', `Target: ${target}, Duration: ${duration} days`);
            alert('✅ VIP settings saved! Auto-VIP check will run.');
            loadVIPSettings();
        });
    }

    function autoVIPCheck() {
        db.ref('vip_settings').once('value', settingsSnap => {
            const settings = settingsSnap.val() || {};
            const target = settings.referralTarget || 5;
            const duration = settings.autoDuration || 30;
            
            db.ref('users').once('value', usersSnap => {
                usersSnap.forEach(userSnap => {
                    const uid = userSnap.key;
                    const user = userSnap.val();
                    
                    db.ref('vip_users/' + uid).once('value', vipSnap => {
                        const isVIP = vipSnap.val() === true;
                        const vipExpiry = user.vipExpiry || 0;
                        const isExpired = vipExpiry > 0 && vipExpiry <= Date.now();
                        
                        db.ref('referrals/' + uid).once('value', refSnap => {
                            let refCount = 0;
                            refSnap.forEach(folder => {
                                if (folder.key !== 'claimed') {
                                    folder.forEach(() => refCount++);
                                }
                            });
                            
                            if (refCount >= target) {
                                if (!isVIP || isExpired) {
                                    const expiryTime = duration > 0 ? Date.now() + (duration * 24 * 60 * 60 * 1000) : 0;
                                    db.ref('vip_users/' + uid).set(true);
                                    db.ref('users/' + uid).update({
                                        vipExpiry: expiryTime,
                                        vipSince: Date.now(),
                                        vipReferrals: refCount
                                    });
                                    db.ref('vip_logs').push({
                                        uid: uid,
                                        email: user.email,
                                        action: 'AUTO-VIP GRANTED',
                                        referrals: refCount,
                                        duration: duration + ' days',
                                        expiry: expiryTime > 0 ? new Date(expiryTime).toLocaleString() : 'Permanent',
                                        time: new Date().toLocaleString(),
                                        timestamp: Date.now()
                                    });
                                    logAdminAction('Auto-VIP Granted', `User: ${user.email}, Referrals: ${refCount}`);
                                }
                            }
                        });
                    });
                });
            });
        });
    }

    
    
    
      async function processReferral(user, referrerId) {
          if (!user || !referrerId || user.uid === referrerId) {
            console.warn('❌ processReferral: Invalid params');
          return;
       }

    const userRef = db.ref('users/' + user.uid);
    let alreadyReferred = false;
    let referrerEmail = null;

    await userRef.transaction((currentData) => {
        if (!currentData) return currentData;
        if (currentData.referredBy) {
            alreadyReferred = true;
            return;
        }
        return currentData;
    });

    if (alreadyReferred) {
        console.log('⚠️ User already has a referrer, skipping.');
        return;
    }

    const referrerSnap = await db.ref('users/' + referrerId).once('value');
    if (!referrerSnap.exists()) {
        console.warn('❌ Referrer not found.');
        return;
    }
    const referrerData = referrerSnap.val();
    referrerEmail = referrerData.email;

    await db.ref('users/' + user.uid).update({
        referredBy: referrerEmail,
        referredByUid: referrerId
    });

    let isAffiliate = false;
    const affSnap = await db.ref('affiliate_links').orderByChild('uid').equalTo(referrerId).once('value');
    if (affSnap.exists()) isAffiliate = true;

    
    const tasksSnap = await db.ref('tasks/' + referrerId + '/refs').once('value');
    let currentCount = tasksSnap.val() || 0;
    const folderNum = Math.floor(currentCount / 5) + 1;

    const userData = (await db.ref('users/' + user.uid).once('value')).val() || {};
    const userNick = userData.ownerNick || userData.realName || user.email.split('@')[0] || 'User';
    let displayName = userData.ownerNick || user.displayName || user.email || userNick || 'User ' + (currentCount + 1);
    if (!displayName || displayName.trim() === '') {
        displayName = user.email || userNick || 'User ' + (currentCount + 1);
    }

    const refPath = `referrals/${referrerId}/folder_${folderNum}/${user.uid}`;
    const existingSnap = await db.ref(refPath).once('value');
    if (existingSnap.exists()) {
        console.log('⏭️ Duplicate referral entry already exists, skipping.');
        return;
    }

    const userDataToSave = {
        uid: user.uid,
        email: user.email,
        name: displayName,
        nick: userNick,
        deviceId: getDeviceId(),
        deviceInfo: getDeviceInfo(),
        fingerprint: fingerprint,
        location: userLocation,
        timestamp: Date.now(),
        time: new Date().toLocaleString()
    };

    await db.ref(refPath).set(userDataToSave);

    
    let incrementSuccess = false;
    for (let attempt = 0; attempt < 3; attempt++) {
        try {
            await db.ref('tasks/' + referrerId + '/refs').transaction((current) => {
                return (current || 0) + 1;
            });
            incrementSuccess = true;
            break;
        } catch (e) {
            console.warn('Increment attempt failed, retrying...', e);
            await new Promise(r => setTimeout(r, 500));
        }
    }
    if (!incrementSuccess) {
        console.error('Failed to increment tasks/refs after 3 attempts');
        
        const refsSnap = await db.ref('referrals/' + referrerId).once('value');
        let total = 0;
        refsSnap.forEach(folder => {
            if (folder.key !== 'claimed') folder.forEach(() => total++);
        });
        await db.ref('tasks/' + referrerId + '/refs').set(total);
    }

    await db.ref('referral_list/' + referrerId).push({
        email: user.email,
        name: displayName,
        nick: userNick,
        time: new Date().toLocaleString()
    });

    if (isAffiliate) {
        const affPath = `affiliate_referrals/${referrerId}/${user.uid}`;
        let affSaved = false;
        await db.ref(affPath).transaction((current) => {
            if (current !== null) {
                affSaved = false;
                return;
            }
            affSaved = true;
            return {
                uid: user.uid,
                email: user.email,
                name: displayName,
                nick: userNick,
                timestamp: Date.now(),
                time: new Date().toLocaleString()
            };
        });
        if (affSaved) {
            console.log('✅ Affiliate referral saved.');
            await db.ref('users/' + user.uid + '/affiliateReferredBy').set(referrerEmail);
        }
    }

    const badge = document.getElementById('ref-count-badge');
    if (badge) badge.textContent = parseInt(badge.textContent || 0) + 1;

    await earnCoinsForReferrer(referrerId, 10, user.email);

    console.log('✅ processReferral: COMPLETE!');
    }
  

async function earnCoinsForReferrer(referrerId, amount, referredEmail) {
    try {
        const userSnap = await db.ref('users/' + referrerId).once('value');
        if (!userSnap.exists()) {
            console.warn('⚠️ Referrer not found for bonus:', referrerId);
            return;
        }
        const currentCoins = userSnap.val().coins || 0;
        await db.ref('users/' + referrerId + '/coins').set(currentCoins + amount);
        await db.ref('coin_earnings/' + referrerId).push({
            amount: amount,
            reason: 'Referral bonus for ' + referredEmail,
            timestamp: Date.now(),
            time: new Date().toLocaleString()
        });
        console.log('✅ Bonus coins awarded:', amount, 'to', referrerId);
    } catch (err) {
        console.error('❌ Error awarding bonus:', err);
    }
}





async function resolveReferralCode(ref) {
    if (!ref) {
        console.log('❌ resolveReferralCode: No ref provided');
        return null;
    }
    
    ref = ref.trim();
    console.log('🔍 resolveReferralCode: Checking ref:', ref);
    
    
    try {
        const userSnap = await db.ref('users/' + ref).once('value');
        if (userSnap.exists()) {
            console.log('✅ resolveReferralCode: Found as UID:', ref);
            return ref;
        }
        console.log('ℹ️ Not a UID, checking affiliate_links...');
    } catch (err) {
        console.error('❌ Error checking UID:', err);
    }
    
    
    try {
        console.log('🔎 Looking up code in affiliate_links:', ref);
        const snap = await db.ref('affiliate_links').orderByChild('code').equalTo(ref).once('value');
        
        console.log('📊 affiliate_links snap exists?', snap.exists());
        console.log('📊 snap.numChildren():', snap.numChildren());
        
        let referrerEmail = null;
        let referrerUid = null;
        snap.forEach(child => {
            const data = child.val();
            console.log('📧 Found affiliate data:', data);
            referrerEmail = data.email;
            referrerUid = data.uid;  
        });
        
        if (!referrerEmail && !referrerUid) {
            console.log('❌ No affiliate found for code:', ref);
            
            
            const linkSnap = await db.ref('affiliate_links').orderByChild('link').equalTo(`https://mymarketbaazar.web.app/?ref=${ref}`).once('value');
            if (linkSnap.exists()) {
                console.log('✅ Found via link field!');
                linkSnap.forEach(child => {
                    referrerEmail = child.val().email;
                    referrerUid = child.val().uid;
                });
            }
            
            if (!referrerEmail && !referrerUid) {
                console.log('❌ Still no affiliate found');
                return null;
            }
        }
        
        
        if (referrerUid) {
            console.log('✅ resolveReferralCode: SUCCESS! UID:', referrerUid);
            return referrerUid;
        }
        
        
        console.log('📧 Affiliate email found:', referrerEmail);
        const userSnap2 = await db.ref('users').orderByChild('email').equalTo(referrerEmail).once('value');
        console.log('📊 User search by email exists?', userSnap2.exists());
        
        let uid = null;
        userSnap2.forEach(child => {
            uid = child.key;
            console.log('✅ Found user UID:', uid);
        });
        
        if (uid) {
            console.log('✅ resolveReferralCode: SUCCESS! UID:', uid);
            return uid;
        } else {
            console.log('❌ No user found with email:', referrerEmail);
            return null;
        }
        
    } catch (err) {
        console.error('❌ Error in CODE lookup:', err);
        return null;
    }
}

function showReferralPopup() {
    const user = auth.currentUser;
    if (!user) {
        alert('Please login first!');
        return;
    }

    document.getElementById('referral-popup').style.display = 'flex';
    document.getElementById('ref-link-popup').value = BASE_URL + '?ref=' + user.uid;

    
    db.ref('referrals/' + user.uid).on('value', snap => {
        const container = document.getElementById('referral-list-container');
        container.innerHTML = '';
        let count = 0;

        snap.forEach(folder => {
            if (folder.key !== 'claimed') {
                folder.forEach(refSnap => {
                    const ref = refSnap.val();
                    count++;
                    const displayName = 'User ' + count;
                    container.innerHTML += `
                        <div style="padding:8px; border-bottom:1px solid #222; font-size:12px;">
                            <span style="color:var(--neon);">${count}.</span>
                            <span style="color:var(--gold);">${displayName}</span>
                            <span style="color:#888; font-size:10px; float:right;">${ref.time || ''}</span>
                        </div>
                    `;
                });
            }
        });

        if (count === 0) {
            container.innerHTML = '<p style="color:#444; text-align:center;">No referrals yet. Share your link!</p>';
        }

        
        document.getElementById('ref-count-badge').textContent = count;

        
        db.ref('vip_users/' + user.uid).once('value', vipSnap => {
            const isVIP = vipSnap.val() === true;
            const vipBadge = document.getElementById('vip-badge-container');
            const expiryDisplay = document.getElementById('vip-expiry-display');

            db.ref('users/' + user.uid + '/vipExpiry').once('value', expirySnap => {
                const expiry = expirySnap.val() || 0;
                const isExpired = expiry > 0 && expiry <= Date.now();

                if ((isVIP || count >= 5) && !isExpired) {
                    vipBadge.style.display = 'block';
                    if (expiry > 0) {
                        expiryDisplay.textContent = 'Expires: ' + new Date(expiry).toLocaleString();
                    } else {
                        expiryDisplay.textContent = '👑 Permanent VIP';
                    }
                } else {
                    vipBadge.style.display = 'none';
                }
            });
        });
    });
}

    function copyRefPopup() {
        const copyText = document.getElementById('ref-link-popup');
        copyText.select();
        document.execCommand("copy");
        alert("✅ Referral Link Copied!");
    }

    function copyRef() {
        const copyText = document.getElementById("my-ref-link");
        copyText.select();
        document.execCommand("copy");
        alert("✅ Referral Link Copied!");
    }





function claimRefBonus() {
    const user = auth.currentUser;
    if (!user) {
        alert('Please login first!');
        return;
    }

    db.ref('users/' + user.uid + '/frozen').once('value', snap => {
        if (snap.val() === true) {
            alert("❌ Account frozen. Use Help Center.");
            return;
        }

        db.ref('referrals/' + user.uid).once('value', snap => {
            let total = 0;
            let claimedCount = 0;

            snap.forEach(folder => {
                if (folder.key === 'claimed') {
                    folder.forEach(() => claimedCount++);
                } else {
                    folder.forEach(() => total++);
                }
            });

            const batches = Math.floor(total / 5);
            const alreadyClaimed = claimedCount;

            if (batches > alreadyClaimed) {
                const toClaim = batches - alreadyClaimed;
                let promises = [];
                for (let i = alreadyClaimed + 1; i <= batches; i++) {
                    const batchKey = 'batch_' + i;
                    promises.push(
                        db.ref('referrals/' + user.uid + '/claimed/' + batchKey).set({
                            claimedAt: Date.now(),
                            coinsAwarded: 200,
                            batchNumber: i,
                            totalReferrals: total
                        })
                    );
                }
                Promise.all(promises).then(() => {
                    const coins = toClaim * 200;
                    earnCoins(coins, 'Referral bonus for ' + toClaim + ' batch(es)');

                    
                    const remaining = total - (toClaim * 5);
                    db.ref('tasks/' + user.uid + '/refs').set(remaining);

                    if (document.getElementById('referral-popup').style.display === 'flex') {
                        showReferralPopup();
                    }

                    const badge = document.getElementById('ref-count-badge');
                    if (badge) badge.textContent = '0';

                    alert('🎉 ' + coins + ' Coins Added! (' + toClaim + ' batch' + (toClaim > 1 ? 'es' : '') + ' claimed)');

                    const claimBtn = document.getElementById('claim-ref-bonus-btn');
                    if (claimBtn) {
                        claimBtn.innerHTML = `🎁 CLAIM 100 COINS (${remaining}/5)`;
                    }
                });
            } else if (batches === 0) {
                const remaining = 5 - (total % 5);
                alert('👥 Need ' + remaining + ' more friends! (' + total + '/5)');

                
                db.ref('tasks/' + user.uid + '/refs').set(total);

                const claimBtn = document.getElementById('claim-ref-bonus-btn');
                if (claimBtn) {
                    claimBtn.innerHTML = `🎁 CLAIM 100 COINS (${total}/5)`;
                }
            } else {
                alert('✅ All ' + batches + ' batch(es) already claimed! Invite 5 more friends to earn another 200 coins!');
                db.ref('tasks/' + user.uid + '/refs').set(0);
                const badge = document.getElementById('ref-count-badge');
                if (badge) badge.textContent = '0';
                const claimBtn = document.getElementById('claim-ref-bonus-btn');
                if (claimBtn) {
                    claimBtn.innerHTML = '🎁 CLAIM 100 COINS (0/5)';
                }
            }
        });
    });
}

    
    
    
    function earnCoins(amount, reason = "") {
        const user = auth.currentUser;
        if (user && !document.hidden) { 
            lastEarningTime[user.uid] = Date.now();
            
            db.ref('users/' + user.uid + '/coins').transaction((currentCoins) => {
                return (currentCoins || 0) + parseInt(amount);
            }).then(() => {
                db.ref('coin_earnings/' + user.uid).push({
                    amount: amount,
                    reason: reason,
                    deviceId: deviceId,
                    fingerprint: fingerprint,
                    location: userLocation,
                    timestamp: Date.now(),
                    time: new Date().toLocaleString()
                });
                
                db.ref('admin_logs/coin_earnings').push({
                    uid: user.uid,
                    email: user.email,
                    amount: amount,
                    reason: reason,
                    deviceId: deviceId,
                    location: userLocation,
                    time: new Date().toLocaleString()
                });
            });
        }
    }

    function addCoins(uid, current) { 
        let amt = prompt("Add coins:"); 
        if(amt) {
            db.ref('users/'+uid).update({ coins: parseInt(current) + parseInt(amt) });
            logAdminAction('Add Coins', `User: ${uid}, Amount: ${amt}`);
            alert(`✅ ${amt} coins added!`);
        }
    }
    
    function removeCoins(uid, current) { 
        let amt = prompt("Remove coins:"); 
        if(amt) { 
            let t = parseInt(current) - parseInt(amt); 
            if(t<0) t=0; 
            db.ref('users/'+uid).update({ coins: t });
            logAdminAction('Remove Coins', `User: ${uid}, Amount: ${amt}`);
            alert(`✅ ${amt} coins removed!`);
        } 
    }

    
    
    
    let bonusCoins = 0;

    function openWithdrawModal() {
        const user = auth.currentUser;
        if (!user) return alert("Please login first!");
        
        db.ref('users/' + user.uid + '/frozen').once('value', snap => {
            if (snap.val() === true) {
                alert("❌ Account frozen. Use Help Center.");
                return;
            }
            
            const pkBalance = (currentUserCoins / 10).toFixed(2);
            document.getElementById('pk-balance-display').innerText = "Rs. " + pkBalance;
            document.getElementById('withdraw-overlay').style.display = 'flex';
            
            setTimeout(() => {
                if (document.getElementById('jazz-email')) {
                    document.getElementById('jazz-email').value = user.email;
                }
                if (document.getElementById('bank-email')) {
                    document.getElementById('bank-email').value = user.email;
                }
            }, 100);
            
            db.ref('users/' + user.uid).once('value', snap => {
                const data = snap.val();
                if (data && data.phoneNumber && data.connectedEmail) {
                    isWithdrawalInfoRegistered = true;
                    document.getElementById('withdraw-step0').style.display = 'none';
                    document.getElementById('withdraw-step1').style.display = 'block';
                    document.getElementById('registered-number-section').style.display = 'block';
                } else {
                    isWithdrawalInfoRegistered = false;
                    document.getElementById('withdraw-step0').style.display = 'block';
                    document.getElementById('withdraw-step1').style.display = 'none';
                    document.getElementById('registered-number-section').style.display = 'none';
                }
            });
            
            document.getElementById('withdraw-step2').style.display = 'none';
            document.getElementById('withdraw-step3').style.display = 'none';
            document.getElementById('withdraw-step4').style.display = 'none';
            document.getElementById('edit-number-section').style.display = 'none';
            resetStep1();
            resetStep3();
            resetEdit();
            document.getElementById('withdraw-method').value = '';
            updateWithdrawFields();
            window.isPayPalMode = false;
            bonusCoins = 0;
  
             
             document.getElementById('withdraw-currency').addEventListener('change', function() {
                 const hint = document.getElementById('withdraw-rate-hint');
                 const preset1Label = document.getElementById('preset-1-label');
                 const preset2Label = document.getElementById('preset-2-label');
                 
                 if (this.value === 'USD') {
                     db.ref('app_control/usd_to_pkr_rate').once('value', snap => {
                         const rate = snap.val() || 280;
                         hint.textContent = `💵 1 USD = ${rate} PKR (Admin Rate) - Withdrawal will be in USD`;
                         hint.style.color = 'var(--neon-gold)';
                         
                         
                         const pkr1 = 50000 / 10; 
                         const usd1 = (pkr1 / rate).toFixed(2);
                         preset1Label.textContent = `$ ${usd1}`;
                         
                         const pkr2 = (100000 + 200) / 10; 
                         const usd2 = (pkr2 / rate).toFixed(2);
                         preset2Label.textContent = `$ ${usd2}`;
                     });
                 } else {
                     hint.textContent = '💵 Withdrawal in PKR (Pakistani Rupee)';
                     hint.style.color = '#888';
                     preset1Label.textContent = 'Rs. 5000';
                     preset2Label.textContent = 'Rs. 1,0020';
                 }
             });
             
             setTimeout(() => {
                 document.getElementById('withdraw-currency').dispatchEvent(new Event('change'));
             }, 200);

            
            document.getElementById('withdraw-currency').addEventListener('change', function() {
                const hint = document.getElementById('withdraw-rate-hint');
                if (this.value === 'USD') {
                    db.ref('app_control/usd_to_pkr_rate').once('value', snap => {
                        const rate = snap.val() || 280;
                        hint.textContent = `💵 1 USD = ${rate} PKR (Admin Rate) - Withdrawal will be in USD`;
                        hint.style.color = 'var(--neon-gold)';
                    });
                } else {
                    hint.textContent = '💵 Withdrawal in PKR (Pakistani Rupee)';
                    hint.style.color = '#888';
                }
            });
            
            setTimeout(() => {
                document.getElementById('withdraw-currency').dispatchEvent(new Event('change'));
            }, 200);
        });
    }

    function closeWithdrawModal() {
        document.getElementById('withdraw-overlay').style.display = 'none';
        document.getElementById('withdraw-step0').style.display = 'block';
        document.getElementById('withdraw-step1').style.display = 'none';
        document.getElementById('withdraw-step2').style.display = 'none';
        document.getElementById('withdraw-step3').style.display = 'none';
        document.getElementById('withdraw-step4').style.display = 'none';
        document.getElementById('registered-number-section').style.display = 'none';
        document.getElementById('edit-number-section').style.display = 'none';
        resetStep1();
        resetStep3();
        resetEdit();
        window.tempWithdrawDetails = null;
        window.isPayPalMode = false;
        document.getElementById('withdraw-method').value = '';
        updateWithdrawFields();
        bonusCoins = 0;
    }

     function setWithdrawAmount(amount, hasBonus = false) {
             const input = document.getElementById('withdraw-amount-coins');
             if (hasBonus) {
                 input.value = amount;
                 bonusCoins = 200; 
                 
                 updateWithdrawDisplay();
                 alert(`✅ 10,0000 coins + 200 BONUS coins = 100,200 coins (${getCurrencyDisplay(100200)})`);
             } else {
                 input.value = amount;
                 bonusCoins = 0;
                 updateWithdrawDisplay();
             }
         }

     function updateWithdrawDisplay() {
             const coins = parseInt(document.getElementById('withdraw-amount-coins').value) || 0;
             const totalCoins = coins + bonusCoins;
             const currency = document.getElementById('withdraw-currency').value;
             const pkrAmount = totalCoins / 10;
             
             if (currency === 'USD') {
                 db.ref('app_control/usd_to_pkr_rate').once('value', snap => {
                     const rate = snap.val() || 280;
                     const usdAmount = (pkrAmount / rate).toFixed(2);
                     document.getElementById('pk-balance-display').innerText = `$ ${usdAmount}`;
                 });
             } else {
                 document.getElementById('pk-balance-display').innerText = `Rs. ${pkrAmount.toFixed(2)}`;
             }
         }
         
         
         function getCurrencyDisplay(coins) {
             const currency = document.getElementById('withdraw-currency').value;
             const pkr = coins / 10;
             if (currency === 'USD') {
                 
                 return 'USD';
             }
             return `Rs. ${pkr.toFixed(2)}`;
         }

    function updateWithdrawFields() {
        const method = document.getElementById('withdraw-method').value;
        const fields = ['field-jazzcash', 'field-bank'];
        fields.forEach(f => document.getElementById(f).style.display = 'none');
        
        if(method === 'JazzCash') document.getElementById('field-jazzcash').style.display = 'block';
        if(method === 'Bank Account') document.getElementById('field-bank').style.display = 'block';
        
        const user = auth.currentUser;
        if (user) {
            if (document.getElementById('jazz-email')) {
                document.getElementById('jazz-email').value = user.email;
            }
            if (document.getElementById('bank-email')) {
                document.getElementById('bank-email').value = user.email;
            }
        }
    }

    function generateOTP(length = 5) {
        if (length === 4) {
            return Math.floor(1000 + Math.random() * 9000).toString();
        } else if (length === 5) {
            return Math.floor(10000 + Math.random() * 90000).toString();
        } else if (length === 6) {
            return Math.floor(100000 + Math.random() * 900000).toString();
        } else {
            return Math.floor(10000 + Math.random() * 90000).toString();
        }
    }

    


function sendOTPEmail(email, otp, type = 'withdrawal') {
    
    let message = '';
    if (type === 'withdrawal') {
        message = `Your Nightorbit withdrawal OTP is: ${otp}\n\nValid for 5 minutes.`;
    } else if (type === 'connected') {
        message = `Your Nightorbit connected email OTP is: ${otp}\n\nValid for 5 minutes.`;
    } else {
        message = `Your Nightorbit verification OTP is: ${otp}\n\nValid for 5 minutes.`;
    }
    
    
    return emailjs.send(
        WITHDRAWAL_SERVICE,        
        WITHDRAWAL_TEMPLATE,       
        {
            user_email: email,
            name: email.split('@')[0],
            message: message
        },
        WITHDRAWAL_EMAILJS_KEY     
    );
}

    
    function checkOTPRateLimit(identifier, action, maxRequests = 5, timeWindow = 3600000, cooldown = 60000) {
        return new Promise((resolve) => {
            const ref = db.ref('otp_rate/' + identifier + '/' + action);
            ref.once('value', snap => {
                const data = snap.val() || { timestamps: [], lastRequest: 0 };
                const now = Date.now();
                let timestamps = data.timestamps.filter(ts => now - ts < timeWindow);
                if (data.lastRequest && (now - data.lastRequest) < cooldown) {
                    resolve({ allowed: false, reason: 'Cooldown', wait: Math.ceil((cooldown - (now - data.lastRequest)) / 1000) });
                    return;
                }
                if (timestamps.length >= maxRequests) {
                    resolve({ allowed: false, reason: 'Limit exceeded', reset: Math.ceil((timeWindow - (now - timestamps[0])) / 1000) });
                    return;
                }
                timestamps.push(now);
                ref.set({ timestamps, lastRequest: now });
                resolve({ allowed: true });
            });
        });
    }

    
    function showHumanVerification(callback) {
        const num1 = Math.floor(Math.random() * 10) + 1;
        const num2 = Math.floor(Math.random() * 10) + 1;
        const answer = num1 + num2;
        const userAnswer = prompt(`🤖 Human Verification: What is ${num1} + ${num2}?`);
        if (userAnswer !== null && parseInt(userAnswer) === answer) {
            callback(true);
        } else {
            alert('❌ Incorrect answer. Try again.');
            callback(false);
        }
    }

    
    async function requestWithdrawOTP() {
        const user = auth.currentUser;
        if (!user) return alert("Please login first!");
        
        db.ref('users/' + user.uid + '/frozen').once('value', snap => {
            if (snap.val() === true) {
                alert("❌ Your account is FROZEN. Use Help Center to contact admin.");
                return;
            }
            
            
            checkOTPRateLimit(user.uid, 'withdraw').then(async (rateResult) => {
                if (!rateResult.allowed) {
                    if (rateResult.reason === 'Cooldown') {
                        alert(`⏳ Please wait ${rateResult.wait} seconds before requesting again.`);
                    } else {
                        alert(`❌ Too many OTP requests. Try again after ${Math.ceil(rateResult.reset/60)} minutes.`);
                    }
                    return;
                }

                showHumanVerification(async (isHuman) => {
                    if (!isHuman) return;

                    currentOtp = generateOTP(5);
                    otpTimestamp = Date.now();
                    const expiryTime = Date.now() + 5 * 60 * 1000;
                    
                    await db.ref('otp_codes/' + user.uid + '/withdraw').set({
                        otp: currentOtp,
                        expiry: expiryTime,
                        timestamp: Date.now()
                    });

                    sendOTPEmail(user.email, currentOtp, 'withdrawal')
                        .then(() => alert(`✅ 5-digit OTP sent to ${user.email}`))
                        .catch((err) => alert(`❌ ${err.message}`));
                    
                    document.getElementById('otp-input').style.display = 'block';
                    document.getElementById('request-otp-btn').style.display = 'none';
                    document.getElementById('verify-otp-btn').style.display = 'block';
                });
            });
        });
    }

    
    async function verifyWithdrawOTP() {
        const user = auth.currentUser;
        const enteredOtp = document.getElementById('otp-code').value;
        if (!enteredOtp) return alert("Please enter OTP");

        const snap = await db.ref('otp_codes/' + user.uid + '/withdraw').once('value');
        const data = snap.val();
        if (!data) {
            alert("❌ OTP not found. Please request new OTP.");
            return;
        }
        if (Date.now() > data.expiry) {
            alert("❌ OTP expired. Please request new OTP.");
            await db.ref('otp_codes/' + user.uid + '/withdraw').remove();
            resetStep1();
            return;
        }
        if (enteredOtp === data.otp) {
            alert("✅ OTP verified!");
            await db.ref('otp_codes/' + user.uid + '/withdraw').remove();
            document.getElementById('withdraw-step1').style.display = 'none';
            document.getElementById('registered-number-section').style.display = 'block';
            document.getElementById('withdraw-step2').style.display = 'block';
        } else {
            alert("❌ Invalid OTP");
        }
    }

    function resetStep1() {
        currentOtp = null;
        otpTimestamp = null;
        document.getElementById('otp-code').value = '';
        document.getElementById('otp-input').style.display = 'none';
        document.getElementById('request-otp-btn').style.display = 'block';
        document.getElementById('verify-otp-btn').style.display = 'none';
    }

    function showEditNumber() {
        document.getElementById('edit-number-section').style.display = 'block';
    }

    
    async function requestEditOTP() {
        const user = auth.currentUser;
        
        const rateResult = await checkOTPRateLimit(user.uid, 'edit');
        if (!rateResult.allowed) {
            if (rateResult.reason === 'Cooldown') {
                alert(`⏳ Please wait ${rateResult.wait} seconds before requesting again.`);
            } else {
                alert(`❌ Too many OTP requests. Try again after ${Math.ceil(rateResult.reset/60)} minutes.`);
            }
            return;
        }

        showHumanVerification(async (isHuman) => {
            if (!isHuman) return;

            currentEditOtp = generateOTP(4);
            editOtpTimestamp = Date.now();
            const expiryTime = Date.now() + 5 * 60 * 1000;
            await db.ref('otp_codes/' + user.uid + '/edit').set({
                otp: currentEditOtp,
                expiry: expiryTime,
                timestamp: Date.now()
            });

            sendOTPEmail(user.email, currentEditOtp, 'withdrawal')
                .then(() => alert(`✅ 4-digit OTP sent to ${user.email}`))
                .catch(err => alert(err.message));
            
            document.getElementById('edit-otp-input').style.display = 'block';
            document.getElementById('request-edit-otp-btn').style.display = 'none';
            document.getElementById('verify-edit-otp-btn').style.display = 'block';
        });
    }

    
   async function verifyEditOTP() {
    const user = auth.currentUser;
    const enteredOtp = document.getElementById('edit-otp-code').value;
    if (!enteredOtp) return alert("Please enter OTP");

    const snap = await db.ref('otp_codes/' + user.uid + '/edit').once('value');
    const data = snap.val();
    if (!data) {
        alert("❌ OTP not found. Please request new OTP.");
        return;
    }
    if (Date.now() > data.expiry) {
        alert("❌ OTP expired. Please request new OTP.");
        await db.ref('otp_codes/' + user.uid + '/edit').remove();
        resetEdit();
        return;
    }
    if (enteredOtp === data.otp) {
        alert("✅ OTP verified! You can now edit your information.");
        
        await db.ref('otp_codes/' + user.uid + '/edit').remove();

        
        document.getElementById('edit-otp-input').style.display = 'none';
        document.getElementById('verify-edit-otp-btn').style.display = 'none';

        
        document.getElementById('edit-fields').style.display = 'block';

        
        db.ref('users/' + user.uid).once('value', snap => {
            const data = snap.val();
            document.getElementById('edit-phone').value = data.phoneNumber || '';
            document.getElementById('edit-email').value = data.connectedEmail || '';
        });

        
        document.getElementById('edit-fields').scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
        alert("❌ Invalid OTP");
    }
}
    function resetEdit() {
        currentEditOtp = null;
        editOtpTimestamp = null;
        document.getElementById('edit-otp-code').value = '';
        document.getElementById('edit-otp-input').style.display = 'none';
        document.getElementById('request-edit-otp-btn').style.display = 'block';
        document.getElementById('verify-edit-otp-btn').style.display = 'none';
    }

    function saveEditedInfo() {
        const user = auth.currentUser;
        const newPhone = document.getElementById('edit-phone').value;
        const newEmail = document.getElementById('edit-email').value;
        
        const phoneRegex = /^\d{11}$/;
        if (!phoneRegex.test(newPhone)) {
            return alert("❌ Phone number must be exactly 11 digits (e.g., 030*******)");
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newEmail)) {
            return alert("❌ Please enter a valid email address");
        }
        
        if (!newPhone || !newEmail) return alert("Please fill both fields");
        
        db.ref('users/' + user.uid).update({
            phoneNumber: newPhone,
            connectedEmail: newEmail,
            phoneVerified: true,
            connectedEmailVerified: true,
            lastUpdated: Date.now()
        }).then(() => {
            alert("✅ Information updated successfully! Old data has been replaced.");
            document.getElementById('edit-number-section').style.display = 'none';
            resetEdit();
        });
    }

    function verifyDetailsAndProceed() {
        const user = auth.currentUser;
        if (!user) return alert("Please login first!");

        const method = document.getElementById('withdraw-method').value;
        let isValid = true;
        let errorMsg = "";

        if (!method) {
            isValid = false;
            errorMsg = "Select method!";
        } else if (method === 'JazzCash') {
            const num = document.getElementById('jazz-num').value;
            const name = document.getElementById('jazz-name').value;
            const email = document.getElementById('jazz-email').value;
            
            const phoneRegex = /^\d{11}$/;
            if (!phoneRegex.test(num)) {
                isValid = false;
                errorMsg = "Valid 11-digit JazzCash Number required!";
            }
            if (!name || name.length < 3) {
                isValid = false;
                errorMsg = "Account Holder Name required!";
            }
            if (!email || !email.includes('@')) {
                isValid = false;
                errorMsg = "Valid email required!";
            }
        } else if (method === 'Bank Account') {
            const bank = document.getElementById('bank-name').value;
            const iban = document.getElementById('bank-iban').value;
            const title = document.getElementById('bank-title').value;
            const email = document.getElementById('bank-email').value;
            
            const ibanRegex = /^\d{10,20}$/;
            if (!bank || bank.length < 3) isValid = false;
            if (!iban || !ibanRegex.test(iban)) {
                isValid = false;
                errorMsg = "IBAN must be 10-20 digits only (no letters)";
            }
            if (!title || title.length < 3) isValid = false;
            if (!email || !email.includes('@')) isValid = false;
            if (errorMsg === "") errorMsg = "Please fill all bank details!";
        }

        if (!isValid) {
            alert(errorMsg);
            return;
        }

        window.tempWithdrawDetails = {
            method: method,
            jazzNum: document.getElementById('jazz-num')?.value,
            jazzName: document.getElementById('jazz-name')?.value,
            jazzEmail: document.getElementById('jazz-email')?.value,
            bankName: document.getElementById('bank-name')?.value,
            bankIban: document.getElementById('bank-iban')?.value,
            bankTitle: document.getElementById('bank-title')?.value,
            bankEmail: document.getElementById('bank-email')?.value
        };

        const step3Title = document.getElementById('step3-title');
        const step3Desc = document.getElementById('step3-desc');
        const connectedEmailField = document.getElementById('connected-email');
        
        step3Title.innerText = 'STEP 3: VERIFY CONNECTED EMAIL';
        step3Desc.innerText = 'Enter the email connected to your phone number.';
        connectedEmailField.style.display = 'block';
        connectedEmailField.value = '';
        window.isPayPalMode = false;

        document.getElementById('withdraw-step2').style.display = 'none';
        document.getElementById('withdraw-step3').style.display = 'block';
    }

    
    async function requestConnectedOTP() {
        const user = auth.currentUser;
        if (!user) return alert("Please login first!");

        const enteredConnectedEmail = document.getElementById('connected-email').value;
        if (!enteredConnectedEmail) {
            alert("Please enter your connected email");
            return;
        }
        
        const savedConnectedEmail = await db.ref('users/' + user.uid + '/connectedEmail').once('value');
        if (!savedConnectedEmail.val()) {
            alert("No connected email registered. Please register first.");
            return;
        }
        if (savedConnectedEmail.val() !== enteredConnectedEmail) {
            alert("❌ This email is not connected to your registered phone number.");
            return;
        }

        
        const rateResult = await checkOTPRateLimit(user.uid, 'connected');
        if (!rateResult.allowed) {
            if (rateResult.reason === 'Cooldown') {
                alert(`⏳ Please wait ${rateResult.wait} seconds before requesting again.`);
            } else {
                alert(`❌ Too many OTP requests. Try again after ${Math.ceil(rateResult.reset/60)} minutes.`);
            }
            return;
        }

        showHumanVerification(async (isHuman) => {
            if (!isHuman) return;

            currentConnectedOtp = generateOTP(4);
            connectedOtpTimestamp = Date.now();
            const expiryTime = Date.now() + 5 * 60 * 1000;
            await db.ref('otp_codes/' + user.uid + '/connected').set({
                otp: currentConnectedOtp,
                expiry: expiryTime,
                timestamp: Date.now()
            });

            sendOTPEmail(enteredConnectedEmail, currentConnectedOtp, 'connected')
                .then(() => alert(`✅ 4-digit OTP sent to ${enteredConnectedEmail}`))
                .catch(err => alert(err.message));

            document.getElementById('connected-otp-input').style.display = 'block';
            document.getElementById('request-connected-otp-btn').style.display = 'none';
            document.getElementById('verify-connected-otp-btn').style.display = 'block';
        });
    }

    
    async function verifyConnectedOTP() {
        const user = auth.currentUser;
        const enteredOtp = document.getElementById('connected-otp-code').value;
        if (!enteredOtp) return alert("Please enter OTP");

        const snap = await db.ref('otp_codes/' + user.uid + '/connected').once('value');
        const data = snap.val();
        if (!data) {
            alert("❌ OTP not found. Please request new OTP.");
            return;
        }
        if (Date.now() > data.expiry) {
            alert("❌ OTP expired. Please request new OTP.");
            await db.ref('otp_codes/' + user.uid + '/connected').remove();
            resetStep3();
            return;
        }
        if (enteredOtp === data.otp) {
            alert("✅ Email verified!");
            await db.ref('otp_codes/' + user.uid + '/connected').remove();
            document.getElementById('withdraw-step3').style.display = 'none';
            document.getElementById('withdraw-step4').style.display = 'block';
        } else {
            alert("❌ Invalid OTP");
        }
    }

    function resetStep3() {
        currentConnectedOtp = null;
        connectedOtpTimestamp = null;
        document.getElementById('connected-otp-code').value = '';
        document.getElementById('connected-otp-input').style.display = 'none';
        document.getElementById('request-connected-otp-btn').style.display = 'block';
        document.getElementById('verify-connected-otp-btn').style.display = 'none';
    }

    
            function handleWithdrawRequest() {
             const user = auth.currentUser;
             if (!user) return alert("Please login first!");
             
             let amountCoins = parseInt(document.getElementById('withdraw-amount-coins').value);
             if (bonusCoins > 0) amountCoins = amountCoins + bonusCoins;
             
             const method = window.tempWithdrawDetails?.method;
             const details = window.tempWithdrawDetails;
             const currency = document.getElementById('withdraw-currency').value;
             
             if (!method) return alert("Please complete previous steps first!");
             if (!amountCoins || amountCoins < 50000) return alert("Minimum withdrawal is 50000 coins!");
             if (currentUserCoins < 50000) return alert("You need at least 50000 coins to withdraw!");
             if (amountCoins > currentUserCoins) return alert("Insufficient coins!");
             
             const pkrAmount = amountCoins / 10;
             let requestedAmount = pkrAmount;
             let usdRate = 0;
             
             if (currency === 'USD') {
                 db.ref('app_control/usd_to_pkr_rate').once('value', snap => {
                     usdRate = snap.val() || 280;
                     requestedAmount = pkrAmount / usdRate;
                     saveWithdrawalRequest(amountCoins, currency, requestedAmount, usdRate, pkrAmount, method, details);
                 });
             } else {
                 saveWithdrawalRequest(amountCoins, currency, requestedAmount, 0, pkrAmount, method, details);
             }
             
             function saveWithdrawalRequest(coins, curr, reqAmt, rate, pkr, method, details) {
                 let accountInfo = {};
                 if (method === 'JazzCash') accountInfo = { number: details.jazzNum, name: details.jazzName, email: details.jazzEmail };
                 else if (method === 'Bank Account') accountInfo = { bank: details.bankName, iban: details.bankIban, title: details.bankTitle, email: details.bankEmail };
                 
                 showLoad("PROCESSING...");
                 db.ref('users/' + user.uid + '/coins').transaction((current) => {
                     if ((current || 0) >= coins) return current - coins;
                 }).then((result) => {
                     if (result.committed) {
                         db.ref('withdrawals').push({
                             uid: user.uid,
                             email: user.email,
                             coins: coins,
                             pkr: pkr,
                             currency: curr,
                             requestedAmount: reqAmt,
                             usdRate: rate,
                             method: method,
                             accountInfo: accountInfo,
                             bonusCoins: bonusCoins,
                             deviceId: deviceId,
                             fingerprint: fingerprint,
                             location: userLocation,
                             otpVerified: true,
                             connectedEmailVerified: true,
                             status: "pending",
                             time: new Date().toLocaleString()
                         }).then(() => {
                             hideLoad();
                             alert(`✅ Withdrawal request sent!\n\n🪙 ${coins} coins\n💱 ${curr} ${reqAmt.toFixed(2)}\n📅 ${new Date().toLocaleString()}`);
                             closeWithdrawModal();
                         });
                     } else {
                         hideLoad();
                         alert("❌ Transaction Failed");
                     }
                 });
             }
         }

    function openWithdrawHistory() {
        document.getElementById('withdraw-history-overlay').style.display = 'flex';
        loadWithdrawHistoryInPopup();
    }

    function loadWithdrawHistoryInPopup() {
        const user = auth.currentUser;
        if (!user) {
            document.getElementById('withdraw-history-list').innerHTML = '<div style="color:#888; font-size:12px; text-align:center;">Please login first.</div>';
            return;
        }
        
        db.ref('withdrawals').orderByChild('uid').equalTo(user.uid).on('value', snap => {
            const container = document.getElementById('withdraw-history-list');
            container.innerHTML = '';
            let hasData = false;
            
            snap.forEach(child => {
                const w = child.val();
                hasData = true;
                const statusClass = w.status === 'pending' ? 'status-pending' : 
                                   w.status === 'approved' || w.status === 'PAID' ? 'status-approved' : 'status-rejected';
                const statusIcon = w.status === 'pending' ? '⏳' : 
                                  (w.status === 'approved' || w.status === 'PAID') ? '✅' : '❌';
                container.innerHTML += `
    <div class="withdraw-history-item">
        <div style="display:flex; justify-content:space-between;">
            <span><b>${w.coins || 0} coins</b></span>
            <span class="${statusClass}">${statusIcon} ${w.status || 'pending'}</span>
        </div>
        <div style="font-size:10px; color:#888; margin-top:3px;">
            ${w.time || ''} | ${w.method || 'N/A'}
            ${w.adminNote ? `<br>📝 Reason: ${w.adminNote}` : ''}
        </div>
    </div>
`;
            });
            
            if (!hasData) {
                container.innerHTML = '<div style="color:#444; font-size:12px; text-align:center; padding:20px;">No withdrawal history</div>';
            }
        });
    }

    
    
    
    function openTaskPanel() {
        const user = auth.currentUser;
        if (!user) {
            alert("🔐 Please login first to access Daily Rewards!");
            return;
        }
        document.getElementById('daily-task-panel').style.display = 'flex';
        checkDailyReset();
        initTasks(); 
    }

    function claimDailyReward() {
        if (!checkInternet()) return alert("❌ INTERNET ERROR");
        
        const user = auth.currentUser;
        
        db.ref('users/' + user.uid + '/frozen').once('value', snap => {
            if (snap.val() === true) {
                alert("❌ Account frozen. Use Help Center.");
                return;
            }
            
            db.ref('tasks/' + user.uid).once('value', snap => {
                const data = snap.val() || {};
                const now = Date.now();
                const lastClaim = data.lastClaimTimestamp || 0;
                const gap = 24 * 60 * 60 * 1000;

                if (now - lastClaim < gap) {
                    const diff = gap - (now - lastClaim);
                    const h = Math.floor(diff / 3600000);
                    const m = Math.floor((diff % 3600000) / 60000);
                    const s = Math.floor((diff % 60000) / 1000);
                    alert(`⏰ Wait ${h}h ${m}m ${s}s before next claim!`);
                    return;
                }
                
                let currentProgress = data.dailyProgress || 0;
                let newProgress = (currentProgress >= 7) ? 1 : currentProgress + 1;

                db.ref('users/' + user.uid + '/coins').transaction((current) => {
                    return (current || 0) + 20;
                });

                db.ref('tasks/' + user.uid).update({
                    dailyProgress: newProgress,
                    lastClaimTimestamp: now
                }).then(() => {
                    db.ref('users/' + user.uid + '/coins').once('value', s => {
                        document.getElementById('menu-user-coins').textContent = s.val() || 0;
                        document.getElementById('user-coins').textContent = s.val() || 0;
                    });
                    
                    const timerDisplay = document.getElementById('daily-timer-display');
                    if (timerDisplay) {
                        timerDisplay.innerHTML = '⏳ Next claim in: <span id="daily-countdown">24:00:00</span>';
                        startDailyTimer(now + 24 * 60 * 60 * 1000);
                    }
                    
                    renderWeeklyChart(newProgress);
                    
                    if (newProgress === 1 && currentProgress === 7) {
                        alert("🎉 WEEKLY STREAK COMPLETE! 140 coins total!");
                    } else {
                        alert(`✅ Day ${newProgress}: 10 Coins! Next claim in 24 hours.`);
                    }
                });
            });
        });
    }

    function startDailyTimer(endTime) {
        const timerEl = document.getElementById('daily-countdown');
        if (!timerEl) return;
        
        const interval = setInterval(() => {
            const now = Date.now();
            const diff = endTime - now;
            
            if (diff <= 0) {
                clearInterval(interval);
                timerEl.innerHTML = '✅ Ready to claim!';
                document.getElementById('daily-timer-display').innerHTML = '';
                document.getElementById('daily-claim-btn').disabled = false;
                document.getElementById('daily-claim-btn').innerText = 'COLLECT 10 COINS';
                return;
            }
            
            const hours = Math.floor(diff / 3600000);
            const mins = Math.floor((diff % 3600000) / 60000);
            const secs = Math.floor((diff % 60000) / 1000);
            timerEl.innerHTML = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }, 1000);
    }

    function renderWeeklyChart(progress) {
        const grid = document.getElementById('weekly-grid');
        if(!grid) return;
        grid.innerHTML = "";
        for (let i = 1; i <= 7; i++) {
            const isDone = i <= progress;
            const isToday = i === (progress + 1);
            grid.innerHTML += `
                <div class="day-box ${isDone ? 'done' : ''} ${isToday ? 'today' : ''}">
                    <b>Day ${i}</b>
                    <span>10 Coins</span>
                </div>
            `;
        }
    }

    function checkDailyTimer(lastTime) {
        const btn = document.getElementById('daily-claim-btn');
        if(!btn) return;
        const now = Date.now();
        const gap = 24 * 60 * 60 * 1000;

        if (now - lastTime < gap) {
            btn.disabled = true;
            const timer = setInterval(() => {
                const current = Date.now();
                const diff = gap - (current - lastTime);
                if (diff <= 0) {
                    clearInterval(timer);
                    btn.disabled = false;
                    btn.innerText = "COLLECT 10 COINS";
                    document.getElementById('daily-timer-display').innerHTML = '';
                } else {
                    const h = Math.floor(diff / 3600000);
                    const m = Math.floor((diff % 3600000) / 60000);
                    const s = Math.floor((diff % 60000) / 1000);
                    document.getElementById('daily-timer-display').innerHTML = `⏳ Next claim in: ${h}h ${m}m ${s}s`;
                }
            }, 1000);
        } else {
            btn.disabled = false;
            btn.innerText = "COLLECT 10 COINS";
        }
    }

    function checkDailyReset() {
        const user = auth.currentUser;
        if (!user) return;
        
        const today = new Date().toDateString();
        
        db.ref('tasks/' + user.uid).once('value', snap => {
            const data = snap.val() || {};
            const lastReset = data.lastResetDate || '';
            
            if (lastReset !== today) {
                let dailyProgress = data.dailyProgress || 0;
                if (dailyProgress >= 7) dailyProgress = 1;
                
                db.ref('tasks/' + user.uid).update({
                    ads: 0,
                    spins: 5,
                    lastResetDate: today,
                    dailyProgress: dailyProgress,
                    lastAdWatchTime: 0
                });
                
                adWatchCount = 0;
                spinsLeft = 5;
                updateAdSlots();
            } else {
                adWatchCount = data.ads || 0;
                spinsLeft = (data.spins !== undefined) ? data.spins : 5;
                updateAdSlots();
            }
            
            document.getElementById('spins-count').innerText = spinsLeft;
        });
    }

    function updateAdSlots() {
        for(let i=1; i<=5; i++) {
            const slot = document.getElementById('slot-'+i);
            if(slot) slot.classList.toggle('done', i <= adWatchCount);
        }
        
        const startBtn = document.getElementById('start-ads-btn');
        const claimBtn = document.getElementById('claim-ads-btn');
        
        if(adWatchCount >= 5) {
            if(startBtn) startBtn.style.display = 'none';
            if(claimBtn) claimBtn.style.display = 'block';
        } else {
            if(startBtn) {
                startBtn.style.display = 'block';
                startBtn.innerText = `WATCH NEXT AD (${adWatchCount}/5)`;
            }
            if(claimBtn) claimBtn.style.display = 'none';
        }
    }

   function initTasks() {
      const user = auth.currentUser;
        if (!user) return;

       checkDailyReset();

        
        const claimBtn = document.getElementById('claim-ref-bonus-btn');
        if (claimBtn) {
            db.ref('referrals/' + user.uid).on('value', snap => {
                let total = 0;
                 snap.forEach(folder => {
                     if (folder.key !== 'claimed') {
                       folder.forEach(() => total++);
                     }
                });
                 claimBtn.innerHTML = `🎁 CLAIM 100 COINS (${total}/5)`;
           });
       }
  
        
        db.ref('tasks/' + user.uid).on('value', snap => {
            const data = snap.val() || { ads: 0, spins: 5, refs: 0, dailyProgress: 0, lastClaimTimestamp: 0 };
        
           adWatchCount = data.ads || 0;
            spinsLeft = (data.spins !== undefined) ? data.spins : 5;
        
           document.getElementById('spins-count').innerText = spinsLeft;
          document.getElementById('my-ref-link').value = BASE_URL + "?ref=" + user.uid;
        
            updateAdSlots();
            renderWeeklyChart(data.dailyProgress || 0);
            checkDailyTimer(data.lastClaimTimestamp || 0);
         });

      
  }

    function checkInternet() {
        return navigator.onLine;
    }

    function checkAdBlocker() {
        return new Promise((resolve) => {
            const testAd = document.createElement('div');
            testAd.innerHTML = '&nbsp;';
            testAd.className = 'adsbox';
            testAd.style.position = 'absolute';
            testAd.style.left = '-1000px';
            testAd.style.top = '-1000px';
            testAd.style.height = '1px';
            testAd.style.width = '1px';
            document.body.appendChild(testAd);
            
            setTimeout(() => {
                const isBlocked = testAd.offsetHeight === 0 || 
                                 testAd.offsetWidth === 0 || 
                                 getComputedStyle(testAd).display === 'none';
                document.body.removeChild(testAd);
                resolve(isBlocked);
            }, 200);
        });
    }

    function watchAdTimer() {
        if (!checkInternet()) return alert("❌ INTERNET ERROR");
        
        const user = auth.currentUser;
        if (!user) return;
        
        db.ref('users/' + user.uid + '/frozen').once('value', snap => {
            if (snap.val() === true) {
                alert("❌ Account frozen. Use Help Center.");
                return;
            }
            
            checkAdBlocker().then(isBlocked => {
                if (isBlocked) {
                    alert("🚫 Ad Blocker detected!");
                    incrementAdWarning(user.uid, 'Ad blocker detected');
                    return;
                }
                
                if (adWatchCount >= 5) return alert("⚠️ 5 ads done today!");
                
                if (currentAdTimer) clearInterval(currentAdTimer);
                
                isWatchingAd = true;
                let time = 10;
                const btn = document.getElementById('start-ads-btn');
                btn.disabled = true;
                
                currentAdTimer = setInterval(() => {
                    time--;
                    btn.innerText = `📺 WATCHING (${time}s)`;
                    
                    if (!isWatchingAd) {
                        clearInterval(currentAdTimer);
                        incrementAdWarning(user.uid, 'Ad skipped (tab switch)');
                        return;
                    }
                    
                    if(time <= 0) {
                        clearInterval(currentAdTimer);
                        currentAdTimer = null;
                        
                        isWatchingAd = false;
                        adWatchCount++;
                        
                        db.ref('tasks/' + auth.currentUser.uid).update({ ads: adWatchCount });
                        document.getElementById('slot-' + adWatchCount).classList.add('done');
                        
                        db.ref('ad_watches/' + auth.currentUser.uid).push({
                            adNumber: adWatchCount,
                            deviceId: deviceId,
                            fingerprint: fingerprint,
                            location: userLocation,
                            timestamp: Date.now(),
                            time: new Date().toLocaleString()
                        });
                        
                        if (adWatchCount >= 5) {
                            btn.style.display = 'none';
                            document.getElementById('claim-ads-btn').style.display = 'block';
                        } else {
                            btn.disabled = false;
                            btn.innerText = `WATCH NEXT AD (${adWatchCount}/5)`;
                        }
                        
                        alert(`✅ Ad ${adWatchCount}/5 complete!`);
                    }
                }, 1000);
            });
        });
    }

    function claimAdReward() {
        if (!checkInternet()) return alert("❌ INTERNET ERROR");
        
        const user = auth.currentUser;
        
        db.ref('users/' + user.uid + '/frozen').once('value', snap => {
            if (snap.val() === true) {
                alert("❌ Account frozen. Use Help Center.");
                return;
            }
            
            db.ref('tasks/' + user.uid + '/ads').once('value', snap => {
                const firebaseAdCount = snap.val() || 0;
                
                if (firebaseAdCount < 5) return alert(`❌ Watch ${firebaseAdCount}/5 ads`);
                
                let allSlotsDone = true;
                for(let i=1; i<=5; i++) {
                    const slot = document.getElementById('slot-'+i);
                    if(!slot || !slot.classList.contains('done')) allSlotsDone = false;
                }
                
                if (!allSlotsDone) return alert("❌ All boxes must be green");
                
                if (firebaseAdCount >= 5 && allSlotsDone) {
                    earnCoins(50, "Completed 5 ads");
                    db.ref('tasks/' + user.uid).update({ ads: 0 });
                    
                    document.getElementById('claim-ads-btn').style.display = 'none';
                    document.getElementById('start-ads-btn').style.display = 'block';
                    document.getElementById('start-ads-btn').innerText = 'WATCH NEXT AD (0/5)';
                    
                    for(let i=1; i<=5; i++) document.getElementById('slot-'+i).classList.remove('done');
                    adWatchCount = 0;
                    alert("🎉 50 Coins added!");
                }
            });
        });
    }

   window.onblur = () => { 
    if(isWatchingAd) {
        const user = auth.currentUser;
        if (user) {
            saveCheatEvidence(user.uid, 'Tab switched during ad', 'tab_switch');
            incrementAdWarning(user.uid, 'Ad skipped (tab switch)');
        }
        isWatchingAd = false;
        if (currentAdTimer) {
            clearInterval(currentAdTimer);
            currentAdTimer = null;
        }
    }
}

function spinWheel() {
    if (!checkInternet()) return alert("❌ INTERNET ERROR");
    
    
    if (isSpinning) {
        alert("⏳ Spin already in progress! Please wait.");
        return;
    }
    
    const user = auth.currentUser;
    if (!user) return;
    
    db.ref('users/' + user.uid + '/frozen').once('value', snap => {
        if (snap.val() === true) {
            alert("❌ Account frozen. Use Help Center.");
            return;
        }
        
        if(spinsLeft <= 0) return alert("⚠️ No spins left!");
        
        
        showSpinCountdown(() => {
            
            isSpinning = true;
            
            const btn = document.getElementById('spin-btn');
            const wheel = document.getElementById('taskWheel');
            
            btn.disabled = true;
            btn.innerText = "🎡 SPINNING...";
            
            let randomIndex;
            const prob = Math.random() * 100;
            
            if (prob < 80) {
                const common = [0, 1, 3, 5];
                randomIndex = common[Math.floor(Math.random() * common.length)];
            } else {
                const rare = [2, 4];
                randomIndex = rare[Math.floor(Math.random() * rare.length)];
            }
            
            
            const winAmount = parseInt(labels[randomIndex]);
            
            
            
            const segmentDeg = 60;
            
            
            
            const segmentAngle = randomIndex * segmentDeg; 
            const targetAngle = 360 - segmentAngle - (segmentDeg / 2); 
            
            const fullRotations = 5; 
            const rotation = fullRotations * 360 + targetAngle;
            
            wheel.style.transition = "transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)";
            wheel.style.transform = `rotate(${rotation}deg)`;
            
            setTimeout(() => {
                earnCoins(winAmount, "Wheel spin");
                spinsLeft--;
                
                db.ref('tasks/' + auth.currentUser.uid).update({ spins: spinsLeft });
                
                db.ref('wheel_spins/' + auth.currentUser.uid).push({
                    winAmount: winAmount,
                    spinsLeft: spinsLeft,
                    deviceId: deviceId,
                    fingerprint: fingerprint,
                    location: userLocation,
                    timestamp: Date.now(),
                    time: new Date().toLocaleString()
                });
                
                btn.disabled = false;
                btn.innerText = `SPIN (Left: ${spinsLeft})`;
                
                isSpinning = false;
                
                alert(`🎡 +${winAmount} Coins!`);
            }, 4000);
        }, user.uid);
    });
}

       
function showSpinCountdown(onComplete, uid) {
    
    let modal = document.getElementById('spin-countdown-modal');
    if (modal) {
        modal.remove();
    }
    
    modal = document.createElement('div');
    modal.id = 'spin-countdown-modal';
    modal.style.cssText = `
        position: fixed; top:0; left:0; width:100%; height:100%;
        background: rgba(0,0,0,0.95); z-index: 99999;
        display: flex; align-items: center; justify-content: center;
        backdrop-filter: blur(10px);
    `;
    modal.innerHTML = `
        <div style="background: linear-gradient(145deg, #111, #1a1a1a); 
                    border: 2px solid var(--gold); border-radius: 25px; 
                    padding: 40px 30px; max-width: 350px; width: 90%;
                    text-align: center; box-shadow: 0 0 50px rgba(255,215,0,0.2);">
            <h3 style="color: var(--gold); margin: 0 0 5px 0; font-size: 20px;">
                🎰 LUCK WHEEL
            </h3>
            <p style="color: #888; font-size: 12px; margin-bottom: 20px;">
                Watch this 10-second ad to spin the wheel!
            </p>
            <div style="font-size: 60px; font-weight: 900; color: var(--primary); 
                        text-shadow: 0 0 30px var(--primary);
                        padding: 15px 0;" id="spin-countdown-number">
                10
            </div>
            <div style="width: 100%; height: 4px; background: #222; border-radius: 10px; 
                        overflow: hidden; margin: 10px 0;">
                <div id="spin-countdown-bar" style="width: 100%; height: 100%; 
                    background: linear-gradient(90deg, var(--gold), var(--primary));
                    border-radius: 10px; transition: width 0.1s linear;"></div>
            </div>
            <p style="color: #555; font-size: 9px; margin-top: 15px;">
                ⚡ Do not switch tabs or minimize
            </p>
        </div>
    `;
    document.body.appendChild(modal);
    
    let countdown = 10;
    const numberEl = document.getElementById('spin-countdown-number');
    const barEl = document.getElementById('spin-countdown-bar');
    
    
    const blurHandler = () => {
        if (modal.style.display !== 'none') {
            clearInterval(timer);
            modal.remove();
            alert("⏳ Countdown cancelled! Don't switch tabs.");
        }
    };
    window.addEventListener('blur', blurHandler, { once: true });
    
    const timer = setInterval(() => {
        countdown--;
        if (numberEl) numberEl.textContent = countdown;
        if (barEl) barEl.style.width = (countdown / 10 * 100) + '%';
        
        if (countdown <= 0) {
            clearInterval(timer);
            window.removeEventListener('blur', blurHandler);
            modal.remove();
            onComplete();
        }
    }, 1000);
}
    
    
    
    function requireAdBeforeAction(callback, actionType) {
        const user = auth.currentUser;
        if (!user) {
            callback();
            return;
        }
        db.ref('users/' + user.uid + '/frozen').once('value', snap => {
            if (snap.val() === true) {
                alert("Your account is frozen. You cannot perform this action.");
                return;
            }
            if (!adsEnabled) {
                callback();
                return;
            }
            showAdModal(() => {
                callback();
            }, actionType, user.uid);
        });
    }

   function incrementAdWarning(uid, reason) {
    if (!uid) return;
    const userRef = db.ref('users/' + uid);
    userRef.child('adWarnings').transaction(current => {
        let newWarnings = (current || 0) + 1;
        return newWarnings;
    }).then(async result => {
        if (result.committed) {
            const newWarnings = result.snapshot.val();
            await saveCheatEvidence(uid, reason, 'ad_skip');
            if (newWarnings >= 3) {
                await freezeAccountWithEvidence(uid, 'Ad violation: ' + reason);
            } else {
                alert(`⚠️ Warning ${newWarnings}/3: ${reason}. Next violation will freeze your account.`);
            }
        }
    });
}

    function resetDailyWarnings(uid) {
        const today = new Date().toDateString();
        
        db.ref('users/' + uid).once('value', snap => {
            const user = snap.val();
            if (!user) return;
            
            const lastReset = user.lastWarningReset || '';
            
            if (lastReset !== today) {
                const hadWarningsYesterday = (user.adWarnings || 0) > 0;
                
                db.ref('users/' + uid).update({
                    adWarnings: 0,
                    lastWarningReset: today,
                    warningResetTime: Date.now(),
                    consecutiveWarningDays: hadWarningsYesterday ? (user.consecutiveWarningDays || 0) + 1 : 0
                });
                
                if ((user.consecutiveWarningDays || 0) >= 3) {
                    freezeAccount(uid, user.email, '3 consecutive days with warnings');
                }
            }
        });
    }

    function freezeAccount(uid, email, reason) {
        const now = Date.now();
        
        db.ref('users/' + uid).once('value', snap => {
            const userData = snap.val() || {};
            
            const freezeData = {
                uid: uid,
                email: email,
                phone: userData.phoneNumber || 'Not registered',
                connectedEmail: userData.connectedEmail || 'Not registered',
                reason: reason,
                warnings: userData.adWarnings || 0,
                consecutiveDays: userData.consecutiveWarningDays || 0,
                coins: userData.coins || 0,
                registeredAt: userData.registeredAt || 'Unknown',
                registeredAtStr: userData.registeredAt ? new Date(userData.registeredAt).toLocaleString() : 'Unknown',
                lastLogin: userData.lastLogin || 'Unknown',
                lastLoginStr: userData.lastLogin ? new Date(userData.lastLogin).toLocaleString() : 'Unknown',
                fingerprint: fingerprint,
                deviceId: deviceId,
                deviceInfo: getDeviceInfo(),
                location: userLocation,
                locationStr: `Lat: ${userLocation.lat}, Lon: ${userLocation.lon}`,
                timestamp: now,
                timeStr: new Date().toLocaleString(),
                status: 'FROZEN',
                userAgent: navigator.userAgent
            };
            
            db.ref('cheat_alerts/' + uid).set(freezeData);
            db.ref('frozen_accounts/' + uid).set(freezeData);
            db.ref('frozen_accounts_list').push(freezeData);
            db.ref('users/' + uid).update({
                frozen: true,
                freezeReason: reason,
                freezeTime: now,
                freezeTimeStr: new Date().toLocaleString(),
                freezeData: freezeData
            });
            sendDetailedFreezeEmail(freezeData);
            
            if (auth.currentUser && auth.currentUser.uid === uid) {
                document.getElementById('cheat-message').innerHTML = `
                    <b>ACCOUNT FROZEN</b><br>
                    Reason: ${reason}<br>
                    Time: ${freezeData.timeStr}<br>
                    Contact admin via Help Center
                `;
                document.getElementById('cheat-alert').style.display = 'flex';
            }
        });
    }

    function sendDetailedFreezeEmail(freezeData) {
        const message = `
🚨 ACCOUNT FROZEN - COMPLETE DETAILS 🚨

━━━━━━━━━━━━━━━━━━━
👤 USER INFORMATION
━━━━━━━━━━━━━━━━━━━
Email: ${freezeData.email}
Phone: ${freezeData.phone}
Connected Email: ${freezeData.connectedEmail}
Coins: ${freezeData.coins}
Registered: ${freezeData.registeredAtStr}
Last Login: ${freezeData.lastLoginStr}

━━━━━━━━━━━━━━━━━━━
⚠️ VIOLATION DETAILS
━━━━━━━━━━━━━━━━━━━
Reason: ${freezeData.reason}
Warnings Today: ${freezeData.warnings}
Consecutive Days: ${freezeData.consecutiveDays}
Time: ${freezeData.timeStr}

━━━━━━━━━━━━━━━━━━━
📱 DEVICE INFORMATION
━━━━━━━━━━━━━━━━━━━
Device ID: ${freezeData.deviceId}
Fingerprint: ${freezeData.fingerprint}
User Agent: ${freezeData.deviceInfo?.userAgent || 'Unknown'}
Platform: ${freezeData.deviceInfo?.platform || 'Unknown'}
Language: ${freezeData.deviceInfo?.language || 'Unknown'}
Screen: ${freezeData.deviceInfo?.screenWidth || 'Unknown'}x${freezeData.deviceInfo?.screenHeight || 'Unknown'}
Timezone: ${freezeData.deviceInfo?.timezone || 'Unknown'}

━━━━━━━━━━━━━━━━━━━
📍 LOCATION
━━━━━━━━━━━━━━━━━━━
Latitude: ${freezeData.location.lat}
Longitude: ${freezeData.location.lon}
Accuracy: ${freezeData.location.accuracy || 'Unknown'}

━━━━━━━━━━━━━━━━━━━
🔍 ADDITIONAL DATA
━━━━━━━━━━━━━━━━━━━
UID: ${freezeData.uid}
Timestamp: ${freezeData.timestamp}
Status: ${freezeData.status}
        `;
        
        emailjs.send('service_41m7jpc', 'template_tibf658', {
            user_email: adminNotificationEmail || 'admin@nightorbit.com',
            name: '🚨 FREEZE ALERT',
            message: message
        }).catch(e => console.log(e));
    }

    function handleMovieClick(url, platform) {
        requireAdBeforeAction(() => {
            const user = auth.currentUser;
            if (!user) {
                window.open(url, '_blank');
                return;
            }
            
            db.ref('users/' + user.uid + '/frozen').once('value', snap => {
                if (snap.val() === true) {
                    alert("❌ Your account is FROZEN. Use Help Center.");
                    return;
                }
                
                db.ref('movie_clicks/' + user.uid).push({
                    platform: platform,
                    url: url,
                    deviceId: deviceId,
                    fingerprint: fingerprint,
                    location: userLocation,
                    timestamp: Date.now(),
                    time: new Date().toLocaleString()
                });
                
                earnCoins(1, "Movie click - " + platform);
                
                lastClickTime = Date.now();
                lastPlatform = platform;
                
                window.open(url, '_blank');
                
                
                startMovieTracking(platform, url, user.uid);
            });
        }, 'movie_click');
    }

    function handleShoppingClick(url, platform) {
        requireAdBeforeAction(() => {
            const user = auth.currentUser;
            if (!user) {
                window.open(url, '_blank');
                return;
            }
            
            db.ref('users/' + user.uid + '/frozen').once('value', snap => {
                if (snap.val() === true) {
                    alert("❌ Account frozen. Use Help Center.");
                    return;
                }
                
                db.ref('shopping_clicks/' + user.uid).push({
                    platform: platform,
                    url: url,
                    deviceId: deviceId,
                    fingerprint: fingerprint,
                    location: userLocation,
                    timestamp: Date.now(),
                    time: new Date().toLocaleString()
                });
                
                showPlatformInfoPopup(platform, () => {
                    earnCoins(1, "Shopping click - " + platform);
                    
                    lastClickTime = Date.now();
                    lastPlatform = platform;
                    
                    window.open(url, '_blank');
                    setupPurchaseDetection(platform, user.uid);
                });
            });
        }, 'shopping_click');
    }

    function handleFoodClick(url, platform) {
        handleShoppingClick(url, platform);
    }

    function startMovieTracking(platform, url, uid) {
        if (movieWatchTimers[uid]) clearInterval(movieWatchTimers[uid]);
        
        if (!movieStartTime[uid]) {
            movieStartTime[uid] = Date.now();
            movieTotalTime[uid] = 0;
            
            db.ref('movie_sessions/' + uid).push({
                platform: platform,
                url: url,
                deviceId: deviceId,
                fingerprint: fingerprint,
                location: userLocation,
                startTime: Date.now(),
                startTimeStr: new Date().toLocaleString(),
                status: 'started'
            });
        }
        
        movieWatchTimers[uid] = setInterval(() => {
            if (!document.hidden && auth.currentUser && auth.currentUser.uid === uid) {
                movieTotalTime[uid] += 60;
                
                if (movieTotalTime[uid] >= 3600) {
                    earnCoins(30, "Watched 60 minutes on " + platform);
                    movieTotalTime[uid] -= 3600;
                    
                    db.ref('movie_watch_events/' + uid).push({
                        platform: platform,
                        minutesWatched: 60,
                        coinsEarned: 30,
                        deviceId: deviceId,
                        fingerprint: fingerprint,
                        location: userLocation,
                        timestamp: Date.now(),
                        time: new Date().toLocaleString()
                    });
                    
                    alert(`🎬 60 minutes! 30 coins awarded.`);
                }
            }
        }, 60000);
    }

    function stopMovieTracking(uid) {
        if (movieWatchTimers[uid]) {
            clearInterval(movieWatchTimers[uid]);
            delete movieWatchTimers[uid];
            
            if (movieStartTime[uid]) {
                const duration = Math.floor((Date.now() - movieStartTime[uid]) / 1000 / 60);
                db.ref('movie_sessions/' + uid).limitToLast(1).once('value', snap => {
                    snap.forEach(session => {
                        db.ref('movie_sessions/' + uid + '/' + session.key).update({
                            endTime: Date.now(),
                            endTimeStr: new Date().toLocaleString(),
                            durationMinutes: duration,
                            status: 'ended',
                            totalCoinsEarned: Math.floor(duration / 60) * 30
                        });
                    });
                });
                
                delete movieStartTime[uid];
                delete movieTotalTime[uid];
            }
        }
    }

    
    function getPlatformFeedback(platform) {
        return new Promise((resolve) => {
            db.ref('app_control/platform_feedback_defaults/' + platform).once('value', snap => {
                const rate = snap.val();
                resolve(rate !== null && !isNaN(rate) ? parseFloat(rate) : 0);
            });
        });
    }

    function showPlatformInfoPopup(platform, callback) {
        getPlatformFeedback(platform).then(rate => {
            if (document.getElementById('platform-info-modal')) {
                document.getElementById('platform-info-modal').remove();
            }
            const modal = document.createElement('div');
            modal.id = 'platform-info-modal';
            modal.style.cssText = `
                position: fixed; top:0; left:0; width:100%; height:100%;
                background:rgba(0,0,0,0.98); z-index:30001; display:flex;
                align-items:center; justify-content:center; backdrop-filter:blur(10px);
            `;
            modal.innerHTML = `
            <div style="background: var(--card-bg); backdrop-filter: blur(40px) saturate(1.6); -webkit-backdrop-filter: blur(40px) saturate(1.6); padding: 35px 30px; border-radius: var(--radius-xl); max-width: 420px; width: 92%; border: 1px solid rgba(255, 215, 0, 0.2); box-shadow: 0 30px 80px rgba(0,0,0,0.9), 0 0 60px rgba(255, 215, 0, 0.06); position: relative; overflow: hidden; text-align: center;">
                <div style="position: absolute; inset: -2px; border-radius: var(--radius-xl); padding: 2px; background: conic-gradient(from 0deg, var(--neon-cyan), var(--neon-gold), var(--neon-pink), var(--neon-cyan)); -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor; mask-composite: exclude; pointer-events: none; animation: borderSpin 6s linear infinite;"></div>
                <div style="font-size: 48px; display: block; margin-bottom: 5px; filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.3));">🌟</div>
                <h2 style="font-family: 'Orbitron', sans-serif; background: linear-gradient(135deg, var(--neon-gold), #f59e0b); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 22px; font-weight: 900; letter-spacing: 3px; margin: 0 0 15px 0; text-shadow: 0 0 30px rgba(255, 215, 0, 0.15);">FROM NIGHTORBIT</h2>
                <div style="width: 60px; height: 3px; background: linear-gradient(90deg, transparent, var(--neon-gold), transparent); margin: 0 auto 15px auto; border-radius: 10px;"></div>
                <p style="color: var(--text-secondary); font-size: 14px; line-height: 1.8; margin: 10px 0;">Dear user, if you purchase anything on <b style="background: linear-gradient(135deg, var(--neon-cyan), var(--neon-purple)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">${platform}</b>, you will earn <b style="background: linear-gradient(135deg, var(--neon-gold), #f59e0b); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">${rate}%</b> of your purchase amount as coins upon successful verification.</p>
                <p style="color: var(--text-secondary); font-size: 14px; line-height: 1.8; margin: 10px 0;">To get coins, you need to provide a screenshot of your order showing the amount and time. After your purchase, come back and you will get a popup to upload the screenshot.</p>
                <div style="background: rgba(255, 215, 0, 0.06); border: 1px solid rgba(255, 215, 0, 0.15); border-radius: var(--radius-sm); padding: 12px 16px; margin: 15px 0; box-shadow: 0 0 20px rgba(255, 215, 0, 0.03);"><p style="background: linear-gradient(135deg, var(--neon-gold), #f59e0b); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 16px; font-weight: 700; margin: 0;">✨ You have already received <b>1 coin</b> for clicking this link!</p></div>
                <button onclick="proceedToPlatform()" style="background: linear-gradient(135deg, var(--neon-gold), #f59e0b); color: #000; border: none; padding: 16px 28px; border-radius: var(--radius-md); width: 100%; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 1.5px; cursor: pointer; transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94); box-shadow: 0 0 30px rgba(255, 215, 0, 0.2); margin-top: 5px;" onmouseover="this.style.transform='translateY(-3px) scale(1.02)'; this.style.boxShadow='0 8px 40px rgba(255, 215, 0, 0.4)';" onmouseout="this.style.transform='translateY(0) scale(1)'; this.style.boxShadow='0 0 30px rgba(255, 215, 0, 0.2)';">PROCEED TO PLATFORM</button>
            </div>`;
            document.body.appendChild(modal);
            window.proceedToPlatform = () => {
                if (document.getElementById('platform-info-modal')) {
                    document.body.removeChild(modal);
                }
                callback();
            };
        }).catch(() => {
            alert("Rate load nahi ho raha, lakin platform open ho jayega.");
            callback();
        });
    }

           
    function showPurchaseVerificationModal(platform, uid) {
        console.log('📸 showPurchaseVerificationModal called for', platform);
        
        
        if (document.getElementById('purchase-verify-modal')) {
            document.getElementById('purchase-verify-modal').remove();
        }

        const modal = document.createElement('div');
        modal.id = 'purchase-verify-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.95);
            z-index: 300000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 15px;
            box-sizing: border-box;
        `;

        modal.innerHTML = `
        <div style="
            background: var(--card-bg);
            backdrop-filter: blur(40px) saturate(1.6);
            -webkit-backdrop-filter: blur(40px) saturate(1.6);
            padding: 25px 25px 20px;
            border-radius: var(--radius-xl);
            max-width: 420px;
            width: 100%;
            max-height: 80vh;
            border: 1px solid rgba(255, 215, 0, 0.2);
            box-shadow: 0 30px 80px rgba(0,0,0,0.9), 0 0 60px rgba(255, 215, 0, 0.06);
            position: relative;
            overflow: hidden;
            text-align: left;
            display: flex;
            flex-direction: column;
        ">
            <!-- Neon Border Animation -->
            <div style="
                position: absolute;
                inset: -2px;
                border-radius: var(--radius-xl);
                padding: 2px;
                background: conic-gradient(from 0deg, var(--neon-cyan), var(--neon-gold), var(--neon-pink), var(--neon-cyan));
                -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
                -webkit-mask-composite: xor;
                mask-composite: exclude;
                pointer-events: none;
                animation: borderSpin 6s linear infinite;
            "></div>
            
            <!-- Scrollable Content -->
            <div style="
                flex: 1;
                overflow-y: auto;
                padding-right: 5px;
                position: relative;
                z-index: 1;
            ">
                <h3 style="
                    font-family: 'Orbitron', sans-serif;
                    background: linear-gradient(135deg, var(--neon-gold), #f59e0b);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    font-size: 20px;
                    font-weight: 900;
                    letter-spacing: 2px;
                    margin: 0 0 15px 0;
                    text-align: center;
                    text-shadow: 0 0 30px rgba(255, 215, 0, 0.2);
                ">🔍 VERIFY PURCHASE</h3>
                
                <!-- Platform -->
                <div style="margin-bottom: 12px;">
                    <label style="
                        color: var(--neon-cyan);
                        font-size: 11px;
                        font-weight: 700;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                        display: block;
                        margin-bottom: 4px;
                    ">📱 Platform</label>
                    <input type="text" id="verify-platform" value="${platform}" readonly style="
                        width:100%;
                        padding: 12px 14px;
                        border-radius: var(--radius-sm);
                        border: 1.5px solid rgba(0, 240, 255, 0.12);
                        background: rgba(0, 240, 255, 0.04);
                        color: var(--text-primary);
                        font-size: 14px;
                        font-weight: 500;
                        backdrop-filter: blur(10px);
                        box-sizing: border-box;
                    ">
                </div>
                
                <!-- Currency Dropdown - FIXED -->
                <div style="margin-bottom: 10px;">
                    <label style="
                        color: var(--neon-cyan);
                        font-size: 11px;
                        font-weight: 700;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                        display: block;
                        margin-bottom: 4px;
                    ">💱 Currency</label>
                    <select id="verify-currency" style="
                        width:100%;
                        padding: 12px 14px;
                        border-radius: var(--radius-sm);
                        border: 1.5px solid rgba(0, 240, 255, 0.12);
                        background: #1a1a2e !important;
                        color: #ffffff !important;
                        font-size: 14px;
                        backdrop-filter: blur(10px);
                        box-sizing: border-box;
                        appearance: none;
                        -webkit-appearance: none;
                        cursor: pointer;
                    ">
                        <option value="PKR" style="background: #1a1a2e; color: #ffffff; padding: 8px;">🇵🇰 PKR (Pakistani Rupee)</option>
                        <option value="USD" style="background: #1a1a2e; color: #ffffff; padding: 8px;">🇺🇸 USD (US Dollar)</option>
                    </select>
                </div>
                
                <!-- Amount with Currency Symbol -->
                <div style="margin-bottom: 12px;">
                    <label style="
                        color: var(--neon-cyan);
                        font-size: 11px;
                        font-weight: 700;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                        display: block;
                        margin-bottom: 4px;
                    " id="amount-label">💰 Amount (PKR)</label>
                    <div style="position: relative; display: flex; align-items: center;">
                        <span id="currency-symbol" style="
                            position: absolute;
                            left: 14px;
                            color: var(--neon-gold);
                            font-weight: 700;
                            font-size: 16px;
                            pointer-events: none;
                            z-index: 2;
                        ">Rs.</span>
                        <input type="number" id="verify-amount" placeholder="e.g., 500" min="1" step="0.01" style="
                            width:100%;
                            padding: 12px 14px 12px 50px;
                            border-radius: var(--radius-sm);
                            border: 1.5px solid rgba(0, 240, 255, 0.12);
                            background: rgba(0, 240, 255, 0.04);
                            color: var(--text-primary);
                            font-size: 14px;
                            backdrop-filter: blur(10px);
                            box-sizing: border-box;
                        ">
                    </div>
                    <span id="usd-rate-hint" style="font-size:10px; color:#888; display:block; margin-top:4px;">💵 Amount will be saved in PKR (Pakistani Rupee)</span>
                </div>
                
                <!-- Screenshot -->
                <div style="margin-bottom: 12px;">
                    <label style="
                        color: var(--neon-cyan);
                        font-size: 11px;
                        font-weight: 700;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                        display: block;
                        margin-bottom: 4px;
                    ">📸 Screenshot of Order/Receipt</label>
                    <input type="file" id="verify-screenshot" accept="image/*" style="
                        width:100%;
                        padding: 10px;
                        border-radius: var(--radius-sm);
                        border: 1.5px solid rgba(0, 240, 255, 0.12);
                        background: rgba(0, 240, 255, 0.04);
                        color: var(--text-primary);
                        font-size: 13px;
                        backdrop-filter: blur(10px);
                        box-sizing: border-box;
                    ">
                    <p style="
                        font-size: 10px;
                        color: var(--text-muted);
                        margin-top: 4px;
                        letter-spacing: 0.5px;
                    ">Screenshot must be taken within last 20 minutes and show order details & time.</p>
                    <p style="
                        font-size: 10px;
                        color: var(--neon-gold);
                        margin-top: 3px;
                        font-weight: 600;
                    " id="screenshot-timer"></p>
                </div>
                
                <!-- Order Time -->
                <div style="margin-bottom: 15px;">
                    <label style="
                        color: var(--neon-cyan);
                        font-size: 11px;
                        font-weight: 700;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                        display: block;
                        margin-bottom: 4px;
                    ">🕒 Order Time (as shown in screenshot)</label>
                    <input type="datetime-local" id="verify-order-time" style="
                        width:100%;
                        padding: 12px 14px;
                        border-radius: var(--radius-sm);
                        border: 1.5px solid rgba(0, 240, 255, 0.12);
                        background: rgba(0, 240, 255, 0.04);
                        color: var(--text-primary);
                        font-size: 14px;
                        backdrop-filter: blur(10px);
                        box-sizing: border-box;
                    ">
                </div>
                
                <!-- Submit Button -->
                <button onclick="submitPurchaseVerification('${uid}')" style="
                    background: linear-gradient(135deg, var(--neon-gold), #f59e0b);
                    color: #000;
                    border: none;
                    padding: 14px 20px;
                    border-radius: var(--radius-md);
                    width: 100%;
                    font-weight: 800;
                    font-size: 14px;
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                    cursor: pointer;
                    transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                    box-shadow: 0 0 30px rgba(255, 215, 0, 0.2);
                    margin: 5px 0;
                "
                onmouseover="this.style.transform='translateY(-2px) scale(1.01)'; this.style.boxShadow='0 8px 40px rgba(255, 215, 0, 0.4)';"
                onmouseout="this.style.transform='translateY(0) scale(1)'; this.style.boxShadow='0 0 30px rgba(255, 215, 0, 0.2)';">SUBMIT FOR VERIFICATION</button>
                
                <!-- Cancel Button -->
                <button onclick="document.getElementById('purchase-verify-modal').remove()" style="
                    background: transparent;
                    color: var(--text-muted);
                    border: 1.5px solid rgba(255, 255, 255, 0.06);
                    padding: 12px 16px;
                    border-radius: var(--radius-md);
                    width: 100%;
                    font-weight: 600;
                    font-size: 13px;
                    cursor: pointer;
                    transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                    backdrop-filter: blur(10px);
                    margin-top: 3px;
                "
                onmouseover="this.style.borderColor='var(--neon-pink)'; this.style.color='var(--neon-pink)'; this.style.background='rgba(255,45,149,0.05)';"
                onmouseout="this.style.borderColor='rgba(255,255,255,0.06)'; this.style.color='var(--text-muted)'; this.style.background='transparent';">CANCEL</button>
            </div>
        </div>`;

        document.body.appendChild(modal);

        
        document.getElementById('verify-currency').addEventListener('change', function() {
            const hint = document.getElementById('usd-rate-hint');
            const symbol = document.getElementById('currency-symbol');
            const label = document.getElementById('amount-label');
            const amountInput = document.getElementById('verify-amount');
            
            if (this.value === 'USD') {
                db.ref('app_control/usd_to_pkr_rate').once('value', snap => {
                    const rate = snap.val() || 280;
                    hint.textContent = `💵 1 USD = ${rate} PKR (Admin Rate) - Amount will be saved in USD`;
                    hint.style.color = 'var(--neon-gold)';
                    symbol.textContent = '$';
                    label.textContent = '💰 Amount (USD)';
                    amountInput.placeholder = 'e.g., 50';
                });
            } else {
                hint.textContent = '💵 Amount will be saved in PKR (Pakistani Rupee)';
                hint.style.color = '#888';
                symbol.textContent = 'Rs.';
                label.textContent = '💰 Amount (PKR)';
                amountInput.placeholder = 'e.g., 500';
            }
        });
        
        
        setTimeout(() => {
            const el = document.getElementById('verify-currency');
            if (el) el.dispatchEvent(new Event('change'));
        }, 300);

        
        const timerDiv = document.getElementById('screenshot-timer');
        const startTime = Date.now();
        const timer = setInterval(() => {
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            const remaining = 1200 - elapsed;
            if (remaining <= 0) {
                clearInterval(timer);
                timerDiv.innerHTML = '⏰ Time expired! Please take new screenshot.';
                timerDiv.style.color = 'var(--neon-red)';
            } else {
                const mins = Math.floor(remaining / 60);
                const secs = remaining % 60;
                timerDiv.innerHTML = `⏳ Valid for: ${mins}:${secs.toString().padStart(2, '0')}`;
            }
        }, 1000);
        modal.timer = timer;
    }

      
   async function submitPurchaseVerification(uid) {
    const platform = document.getElementById('verify-platform').value;
    const currency = document.getElementById('verify-currency').value;
    const amount = parseFloat(document.getElementById('verify-amount').value);
    const fileInput = document.getElementById('verify-screenshot');
    const orderTimeStr = document.getElementById('verify-order-time').value;

    
    if (!amount || amount <= 0) {
        alert("❌ Please enter a valid amount!");
        return;
    }
    if (!fileInput.files[0]) {
        alert("❌ Please upload a screenshot");
        return;
    }
    if (!orderTimeStr) {
        alert("❌ Please enter the order time shown in screenshot");
        return;
    }

    const orderTime = new Date(orderTimeStr).getTime();
    const now = Date.now();
    if (now - orderTime > 20 * 60 * 1000) {
        alert("❌ Screenshot is too old! It must be within last 20 minutes.");
        return;
    }
    if (orderTime > now) {
        alert("❌ Order time cannot be in the future!");
        return;
    }

    
    let usdRate = 0;
    let amountPKR = amount;
    let displayCurrency = currency;
    let displayAmount = amount;

    if (currency === 'USD') {
        const rateSnap = await db.ref('app_control/usd_to_pkr_rate').once('value');
        usdRate = rateSnap.val() || 280;
        amountPKR = amount * usdRate;
        displayCurrency = 'USD';
        displayAmount = amount;
    } else {
        amountPKR = amount;
        displayCurrency = 'PKR';
        displayAmount = amount;
    }

    
    const rateSnap = await db.ref('app_control/platform_feedback_defaults/' + platform).once('value');
    const feedbackRate = rateSnap.val() || 0;
    const coinsToGive = Math.floor(amountPKR * (feedbackRate / 100) * 10);

    const reader = new FileReader();
    reader.onload = async function(e) {
        const screenshotBase64 = e.target.result;
        const hash = await sha256(screenshotBase64);
        const hashCheck = await db.ref('used_screenshot_hashes/' + hash).once('value');

        
        if (hashCheck.exists()) {
            
            const warningCount = await addWarningAndGetCount(uid, 'Duplicate screenshot used');
            const freezeStatus = await checkIfFrozen(uid);
            
            if (freezeStatus) {
                alert("❌ Your account has been FROZEN due to repeated violations.\n\nReason: Duplicate screenshot attempts.\nPlease contact support via Help Center.");
            } else {
                alert(`❌ Submission failed: Duplicate screenshot detected.\n\nWarning #${warningCount}/3. 3 warnings will freeze your account.\nPlease upload a genuine screenshot.`);
            }
            document.getElementById('purchase-verify-modal').remove();
            return;
        }
        await db.ref('used_screenshot_hashes/' + hash).set({
            uid: uid,
            timestamp: now,
            platform: platform
        });

        
        try {
            const exifTime = await getExifTime(fileInput.files[0]);
            if (exifTime && Math.abs(exifTime - orderTime) > 5 * 60 * 1000) {
                const warningCount = await addWarningAndGetCount(uid, 'EXIF time mismatch');
                const freezeStatus = await checkIfFrozen(uid);
                
                if (freezeStatus) {
                    alert("❌ Your account has been FROZEN due to repeated violations.\n\nReason: Screenshot timestamp mismatch.\nPlease contact support via Help Center.");
                } else {
                    alert(`❌ Submission failed: Screenshot timestamp does not match order time.\n\nWarning #${warningCount}/3. 3 warnings will freeze your account.\nPlease upload the correct screenshot.`);
                }
                document.getElementById('purchase-verify-modal').remove();
                return;
            }
        } catch (e) {
            
        }

        
        try {
            await db.ref('purchase_verifications/' + uid).push({
                platform: platform,
                currency: displayCurrency,
                amount: displayAmount,
                amountPKR: amountPKR,
                exchangeRate: usdRate,
                platformRate: feedbackRate,
                coinsEstimated: coinsToGive,
                screenshot: screenshotBase64,
                orderTime: orderTime,
                orderTimeStr: new Date(orderTime).toLocaleString(),
                submitTime: now,
                submitTimeStr: new Date(now).toLocaleString(),
                status: 'pending',
                userEmail: auth.currentUser.email,
                userNickname: currentUserName || auth.currentUser.displayName || 'User',
                deviceId: deviceId,
                fingerprint: fingerprint,
                location: userLocation,
                hash: hash
            });
            alert(`✅ Purchase verification submitted!\n\n🪙 Estimated Coins: ${coinsToGive}\n💱 Currency: ${displayCurrency}\n💰 Amount: ${displayCurrency === 'USD' ? '$' : 'Rs.'} ${displayAmount}${displayCurrency === 'USD' ? ` (≈ Rs. ${amountPKR})` : ''}\n\nAdmin will review and add coins within 24 hours.`);
            document.getElementById('purchase-verify-modal').remove();
            earnCoins(2, `Purchase submitted - ${platform}`);
        } catch (err) {
            alert("❌ Something went wrong while submitting your request. Please try again later.\nError: " + err.message);
            document.getElementById('purchase-verify-modal').remove();
        }
    };

    reader.onerror = function() {
        alert("❌ Failed to read the screenshot file. Please try again.");
        document.getElementById('purchase-verify-modal').remove();
    };

    reader.readAsDataURL(fileInput.files[0]);
}


async function addWarningAndGetCount(uid, reason) {
    const today = new Date().toISOString().split('T')[0];
    const warningRef = db.ref('warnings/' + uid + '/' + today);
    const snapshot = await warningRef.transaction(current => (current || 0) + 1);
    const newCount = snapshot.snapshot.val();
    
    await db.ref('warning_logs').push({
        uid: uid,
        email: auth.currentUser ? auth.currentUser.email : 'unknown',
        reason: reason,
        date: today,
        timestamp: Date.now(),
        warningCount: newCount
    });
    
    await updateConsecutiveWarningDays(uid);
    
    
    if (newCount >= 3) {
        await freezeAccount(uid, auth.currentUser.email, '3 warnings in one day');
    }
    return newCount;
}


async function checkIfFrozen(uid) {
    const snap = await db.ref('users/' + uid + '/frozen').once('value');
    return snap.val() === true;
}

    async function sha256(message) {
        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    }

    function getExifTime(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                const data = e.target.result;
                const exif = EXIF.readFromBinaryFile(data);
                if (exif && exif.DateTimeOriginal) {
                    const parts = exif.DateTimeOriginal.split(/[ :]/);
                    const timestamp = new Date(parts[0], parts[1]-1, parts[2], parts[3], parts[4], parts[5]).getTime();
                    resolve(timestamp);
                } else {
                    reject('No EXIF time');
                }
            };
            reader.readAsArrayBuffer(file);
        });
    }

    async function addWarning(uid, reason) {
        const today = new Date().toISOString().split('T')[0];
        const warningRef = db.ref('warnings/' + uid + '/' + today);
        const snapshot = await warningRef.transaction(current => (current || 0) + 1);
        const newCount = snapshot.snapshot.val();
        
        db.ref('warning_logs').push({
            uid: uid,
            email: auth.currentUser ? auth.currentUser.email : 'unknown',
            reason: reason,
            date: today,
            timestamp: Date.now(),
            warningCount: newCount
        });
        
        if (newCount >= 3) {
            freezeAccount(uid, auth.currentUser.email, '3 warnings in one day');
            return;
        }
        
        await updateConsecutiveWarningDays(uid);
    }

    async function updateConsecutiveWarningDays(uid) {
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        
        const yesterdayWarn = await db.ref('warnings/' + uid + '/' + yesterday).once('value');
        const yesterdayCount = yesterdayWarn.val() || 0;
        
        let consecutive = 1;
        if (yesterdayCount > 0) {
            const consRef = db.ref('consecutive_warning_days/' + uid);
            const consSnap = await consRef.once('value');
            consecutive = (consSnap.val() || 0) + 1;
        }
        
        await db.ref('consecutive_warning_days/' + uid).set(consecutive);
        
        if (consecutive >= 3) {
            freezeAccount(uid, auth.currentUser.email, '3 consecutive days with warnings');
        }
    }


            function upgradeAllLinks() {
                   const allLinkCards = document.querySelectorAll(
                          '#main-ent-list .link-card, ' +
                          '#all-shop-list .link-card, ' +
                          '#all-fashion-list .link-card, ' +
                          '#all-edu-list .link-card, ' +
                          '#all-tools-list .link-card, ' +
                          '#all-social-list .link-card, ' +
                          '#all-telecom-list .link-card, ' +
                          '#all-food-list .link-card, ' +
                          '#pk-shop-list .link-card, ' +
                          '#pk-food-list .link-card, ' +
                          '#pk-tools-list .link-card, ' +
                          '#my-shop-list .link-card, ' +
                          '#my-food-list .link-card, ' +
                          '#my-tools-list .link-card'
                     );

                   allLinkCards.forEach(card => {
                         if (card._upgraded) return;
                         card._upgraded = true;
                         
                         const url = card.href;
                         const affiliateUrl = card.getAttribute('data-affiliate') || url;
                         let platform = card.getAttribute('data-platform') || card.innerText.trim().replace(/[\n\r]+/g, ' ').trim();
                         
                         if (url === '#' || !url || url === '') {
                               card.innerHTML = `
                                   <div class="view-pic-container" style="display:flex; align-items:center; justify-content:center; background:#111; height:75px; color:#444; font-size:9px;">
                                       ⏳ PENDING
                                   </div>
                                   <div class="link-meta-row">
                                       <span class="link-name-txt">${platform}</span>
                                       <span class="coin-indicator">+1 🪙</span>
                                   </div>
                               `;
                               return;
                         }

                         let domain = '';
                         try {
                               domain = new URL(url).hostname;
                         } catch (e) { 
                               domain = 'default.com'; 
                         }

                         const screenshot = `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&embed=screenshot.url`;
                         const fallbackFavicon = `https://www.google.com/s2/favicons?sz=128&domain=${domain}`;
                         
                         let clickHandler = 'handleShoppingClick';
                         
                         if (card.closest('#main-ent-list')) {
                                 clickHandler = 'handleMovieClick';
                         } else if (card.closest('#all-food-list') || card.closest('#pk-food-list') || card.closest('#my-food-list')) {
                               clickHandler = 'handleFoodClick';
                         }

                         card.innerHTML = `
                             <div class="view-pic-container">
                                 <img src="${screenshot}" class="view-pic" loading="lazy" 
                                      onerror="this.style.display='none'; this.parentElement.innerHTML='<img src=\\'${fallbackFavicon}\\' style=\\'width:100%;height:100%;object-fit:contain;padding:15px;background:#0a0a0a;\\'>';">
                             </div>
                             <div class="link-meta-row">
                                 <img src="https://www.google.com/s2/favicons?sz=64&domain=${domain}" class="dynamic-logo" onerror="this.style.display='none'">
                                 <span class="link-name-txt">${platform}</span>
                                 <span class="coin-indicator">+1 🪙</span>
                             </div>
                         `;
                         
                         card.onclick = function(e) {
                               e.preventDefault();
                               const clickUrl = affiliateUrl;
                               
                               if (clickHandler === 'handleMovieClick') {
                                     handleMovieClick(clickUrl, platform);
                               } else if (clickHandler === 'handleFoodClick') {
                                     handleFoodClick(clickUrl, platform);
                               } else {
                                     handleShoppingClick(clickUrl, platform);
                               }
                         };
                   });
         }

              document.addEventListener('DOMContentLoaded', function() {
                  console.log("🔥 DOM Ready - Upgrading all links...");
                  upgradeAllLinks();
              });

    
    
    

    
    function togglePositionsSection() {
        const status = document.getElementById('event-status-select').value;
        const section = document.getElementById('positions-section');
        if (section) {
            if (status === 'ended') {
                section.style.display = 'block';
                const container = document.getElementById('positions-container');
                if (container && container.children.length === 0) {
                    positionCounter = 1;
                    const defaultPos = [
                        { num: 1, name: '🏆 Winner', reward: '1000 coins' },
                        { num: 2, name: '🥈 Runner-up', reward: '500 coins' },
                        { num: 3, name: '🥉 Second Runner-up', reward: '250 coins' }
                    ];
                    loadPositionsFromData(defaultPos);
                }
            } else {
                section.style.display = 'none';
            }
        }
    }

    function addPosition() {
        const container = document.getElementById('positions-container');
        if (!container) return;
        const posNum = positionCounter++;
        const div = document.createElement('div');
        div.id = 'pos-' + posNum;
        div.style.display = 'flex';
        div.style.gap = '8px';
        div.style.margin = '5px 0';
        div.innerHTML = `
            <span style="color:var(--gold); font-weight:bold; min-width:40px;">#${posNum}</span>
            <input type="text" id="pos-name-${posNum}" placeholder="Position Name (e.g., Winner)" style="flex:1; margin:0; background:#222; color:#fff; border:1px solid #444; border-radius:8px; padding:8px;">
            <input type="text" id="pos-reward-${posNum}" placeholder="Reward (e.g., 500 coins)" style="flex:1; margin:0; background:#222; color:#fff; border:1px solid #444; border-radius:8px; padding:8px;">
            <button onclick="removePosition(${posNum})" style="background:var(--neon-red); color:white; border:none; border-radius:8px; padding:0 12px; cursor:pointer; font-weight:bold;">✕</button>
        `;
        container.appendChild(div);
    }

    function removePosition(num) {
        const el = document.getElementById('pos-' + num);
        if (el) el.remove();
    }

    function getPositionsData() {
        const positions = [];
        document.querySelectorAll('#positions-container > div').forEach(div => {
            const num = div.id.replace('pos-', '');
            const name = document.getElementById('pos-name-' + num);
            const reward = document.getElementById('pos-reward-' + num);
            if (name && reward) {
                positions.push({
                    num: parseInt(num),
                    name: name.value || 'Position ' + num,
                    reward: reward.value || 'No reward'
                });
            }
        });
        return positions;
    }

    function loadPositionsFromData(positions) {
        const container = document.getElementById('positions-container');
        if (!container) return;
        container.innerHTML = '';
        positionCounter = 1;
        if (positions && positions.length > 0) {
            positions.forEach(pos => {
                const div = document.createElement('div');
                div.id = 'pos-' + pos.num;
                div.style.display = 'flex';
                div.style.gap = '8px';
                div.style.margin = '5px 0';
                div.innerHTML = `
                    <span style="color:var(--gold); font-weight:bold; min-width:40px;">#${pos.num}</span>
                    <input type="text" id="pos-name-${pos.num}" placeholder="Position Name" value="${pos.name}" style="flex:1; margin:0; background:#222; color:#fff; border:1px solid #444; border-radius:8px; padding:8px;">
                    <input type="text" id="pos-reward-${pos.num}" placeholder="Reward" value="${pos.reward}" style="flex:1; margin:0; background:#222; color:#fff; border:1px solid #444; border-radius:8px; padding:8px;">
                    <button onclick="removePosition(${pos.num})" style="background:var(--neon-red); color:white; border:none; border-radius:8px; padding:0 12px; cursor:pointer; font-weight:bold;">✕</button>
                `;
                container.appendChild(div);
                if (pos.num >= positionCounter) positionCounter = pos.num + 1;
            });
        }
    }

    
    function parseTimerString(input) {
        if (!input) return null;
        input = input.trim().toLowerCase();
        
        const match = input.match(/^(\d+)\s*(s|sec|second|m|min|minute|h|hour|d|day)$/);
        if (match) {
            const num = parseInt(match[1]);
            const unit = match[2];
            if (unit === 's' || unit === 'sec' || unit === 'second') return num;
            if (unit === 'm' || unit === 'min' || unit === 'minute') return num * 60;
            if (unit === 'h' || unit === 'hour') return num * 3600;
            if (unit === 'd' || unit === 'day') return num * 86400;
        }
        
        const numOnly = parseInt(input);
        if (!isNaN(numOnly) && numOnly > 0) return numOnly;
        return null;
    }

    function formatTime(seconds) {
        if (seconds < 0) return '00:00:00';
        const d = Math.floor(seconds / 86400);
        const h = Math.floor((seconds % 86400) / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        if (d > 0) {
            return `${d}d ${h}h ${m}m ${s}s`;
        }
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    
    function checkEventTimer() {
        db.ref('app_control/event').once('value', snap => {
            const data = snap.val() || {};
            const status = data.status || 'waiting';
            const timerSeconds = data.timerSeconds || 0;
            const timerEndTime = data.timerEndTime || 0;
            
            const countdownEl = document.getElementById('event-popup-countdown');
            
            if (status === 'live' && timerEndTime > 0) {
                const now = Date.now();
                const remaining = Math.max(0, (timerEndTime - now) / 1000);
                
                if (remaining <= 0) {
                    if (countdownEl) countdownEl.textContent = '⏰ TIME UP!';
                    db.ref('app_control/event').update({
                        status: 'ended',
                        endedAt: Date.now(),
                        endTime: new Date().toLocaleString()
                    });
                    logAdminAction('Event Auto Ended', 'Timer expired');
                    loadEventAdmin();
                    return;
                }
                
                if (countdownEl) countdownEl.textContent = formatTime(remaining);
            } else {
                if (countdownEl) countdownEl.textContent = '--:--:--';
            }
        });
    }

    
    function checkComingSoonTimer() {
        db.ref('app_control/event').once('value', snap => {
            const data = snap.val() || {};
            const status = data.status || 'waiting';
            const comingTimerEndTime = data.comingTimerEndTime || 0;
            
            const timerDisplay = document.getElementById('coming-timer-display');
            const countdownEl = document.getElementById('coming-timer-countdown');
            
            if (status === 'coming' && comingTimerEndTime > 0) {
                const now = Date.now();
                const remaining = Math.max(0, (comingTimerEndTime - now) / 1000);
                
                if (remaining <= 0) {
                    if (timerDisplay) {
                        timerDisplay.style.display = 'block';
                        timerDisplay.className = 'timer-display ended';
                        countdownEl.textContent = '🚀 EVENT STARTING NOW!';
                    }
                    db.ref('app_control/event').update({
                        status: 'live',
                        startedAt: Date.now(),
                        startTime: new Date().toLocaleString()
                    });
                    logAdminAction('Event Auto Started', 'Coming soon timer expired');
                    loadEventAdmin();
                    return;
                }
                
                if (timerDisplay) {
                    timerDisplay.style.display = 'block';
                    timerDisplay.className = 'timer-display coming';
                    countdownEl.textContent = formatTime(remaining);
                }
            } else {
                if (timerDisplay) timerDisplay.style.display = 'none';
            }
        });
    }

    
    function loadEventAdmin() {
        db.ref('app_control/event').on('value', snap => {
            const data = snap.val() || {};
            document.getElementById('admin-event-status').textContent = data.status || 'waiting';
            document.getElementById('admin-event-title').textContent = data.title || '🎮 Event';
            document.getElementById('admin-event-msg').textContent = data.message || 'Stay tuned!';
            document.getElementById('admin-event-admin-msg').textContent = data.adminMessage || '';
            document.getElementById('admin-event-fee-type').textContent = data.feeType || 'coins';
            document.getElementById('admin-event-fee').textContent = data.price + (data.feeType === 'money' ? ' Rs' : ' coins') || 0;
            document.getElementById('admin-event-end-msg').textContent = data.endMessage || 'No end message set.';
            document.getElementById('admin-event-timer').textContent = data.timerDisplay || 'Not set';
            document.getElementById('admin-event-coming-timer').textContent = data.comingTimerDisplay || 'Not set';
            
            let posDisplay = '';
            if (data.positions && data.positions.length > 0) {
                posDisplay = data.positions.map(p => `#${p.num} ${p.name} (${p.reward})`).join(' | ');
            } else {
                posDisplay = 'No positions set';
            }
            document.getElementById('admin-event-positions').textContent = posDisplay;
            
            document.getElementById('event-status-select').value = data.status || 'waiting';
            document.getElementById('event-title-input').value = data.title || '🎮 Event';
            document.getElementById('event-msg-input').value = data.message || '';
            document.getElementById('event-admin-msg-input').value = data.adminMessage || '';
            document.getElementById('event-fee-type').value = data.feeType || 'coins';
            document.getElementById('event-price-input').value = data.price || 0;
            document.getElementById('event-end-msg-input').value = data.endMessage || '';
            document.getElementById('event-timer-input').value = data.timerDisplay || '';
            document.getElementById('event-coming-timer-input').value = data.comingTimerDisplay || '';
            
            togglePositionsSection();
            updateEventUI();
            
            if (data.positions && data.positions.length > 0) {
                loadPositionsFromData(data.positions);
            } else {
                const container = document.getElementById('positions-container');
                container.innerHTML = '';
                positionCounter = 1;
                const defaultPos = [
                    { num: 1, name: '🏆 Winner', reward: '1000 coins' },
                    { num: 2, name: '🥈 Runner-up', reward: '500 coins' },
                    { num: 3, name: '🥉 Second Runner-up', reward: '250 coins' }
                ];
                loadPositionsFromData(defaultPos);
            }
        });
    }

    
    function saveEventSettings() {
        const status = document.getElementById('event-status-select').value;
        const title = document.getElementById('event-title-input').value;
        const message = document.getElementById('event-msg-input').value;
        const adminMessage = document.getElementById('event-admin-msg-input').value;
        const feeType = document.getElementById('event-fee-type').value;
        const price = parseInt(document.getElementById('event-price-input').value) || 0;
        const endMessage = document.getElementById('event-end-msg-input').value;
        const timerInput = document.getElementById('event-timer-input').value;
        const comingTimerInput = document.getElementById('event-coming-timer-input').value;
        const positions = getPositionsData();
        
        const timerSeconds = parseTimerString(timerInput);
        const comingTimerSeconds = parseTimerString(comingTimerInput);
        
        let timerEndTime = null;
        let comingTimerEndTime = null;
        let timerDisplay = timerInput || 'Not set';
        let comingTimerDisplay = comingTimerInput || 'Not set';
        
        if (timerSeconds && timerSeconds > 0) {
            timerEndTime = Date.now() + (timerSeconds * 1000);
            timerDisplay = timerInput;
        }
        
        if (comingTimerSeconds && comingTimerSeconds > 0) {
            comingTimerEndTime = Date.now() + (comingTimerSeconds * 1000);
            comingTimerDisplay = comingTimerInput;
        }
        
        const updateData = {
            status: status,
            title: title,
            message: message,
            adminMessage: adminMessage,
            feeType: feeType,
            price: price,
            endMessage: endMessage,
            positions: positions,
            timerSeconds: timerSeconds || 0,
            timerEndTime: timerEndTime || 0,
            timerDisplay: timerDisplay,
            comingTimerSeconds: comingTimerSeconds || 0,
            comingTimerEndTime: comingTimerEndTime || 0,
            comingTimerDisplay: comingTimerDisplay,
            updatedAt: Date.now()
        };
        
        if (status === 'ended') {
            updateData.endedAt = Date.now();
            updateData.endTime = new Date().toLocaleString();
        }
        
        db.ref('app_control/event').update(updateData).then(() => {
            logAdminAction('Event Updated', `Status: ${status}, FeeType: ${feeType}, Price: ${price}, Timer: ${timerDisplay}, Coming: ${comingTimerDisplay}`);
            alert('✅ Event settings saved!');
            loadEventAdmin();
        });
    }

    
    function resetEvent() {
        if (confirm('Reset all event settings?')) {
            db.ref('app_control/event').set({
                status: 'waiting',
                title: '🎮 Event',
                message: 'Stay tuned for updates!',
                adminMessage: '',
                feeType: 'money',
                price: 0,
                endMessage: 'No end message set.',
                timerSeconds: 0,
                timerEndTime: 0,
                timerDisplay: 'Not set',
                comingTimerSeconds: 0,
                comingTimerEndTime: 0,
                comingTimerDisplay: 'Not set',
                positions: [
                    { num: 1, name: '🏆 Winner', reward: '1000 coins' },
                    { num: 2, name: '🥈 Runner-up', reward: '500 coins' },
                    { num: 3, name: '🥉 Second Runner-up', reward: '250 coins' }
                ],
                updatedAt: Date.now()
            }).then(() => {
                logAdminAction('Event Reset', 'All event settings reset');
                alert('✅ Event reset!');
                loadEventAdmin();
            });
        }
    }

    
    function loadEventData() {
        db.ref('app_control/event').on('value', snap => {
            const data = snap.val() || {};
            eventData = {
                status: data.status || 'waiting',
                title: data.title || '🎮 Event',
                message: data.message || 'Stay tuned for updates!',
                adminMessage: data.adminMessage || '',
                price: data.price || 0,
                feeType: data.feeType || 'money',
                countdown: data.countdown || 0
            };
            updateEventUI();
        });
    }

    
    function updateEventUI() {
        const btn = document.getElementById('event-btn');
        const badge = document.getElementById('event-status-badge');
        const text = document.getElementById('event-btn-text');
        const playBtn = document.getElementById('play-game-btn');
        
        let statusText = '';
        let statusClass = '';
        let btnText = '';
        
        switch(eventData.status) {
            case 'waiting':
                statusText = '⏳ WAIT';
                statusClass = 'event-status-waiting';
                btnText = 'Event Coming Soon...';
                btn.disabled = true;
                playBtn.style.display = 'none';
                break;
            case 'coming':
                statusText = '20/July SOON';
                statusClass = 'event-status-coming';
                btnText = '⏳ Event Coming Soon!';
                btn.disabled = true;
                playBtn.style.display = 'none';
                break;
            case 'live':
                statusText = '🔴 LIVE';
                statusClass = 'event-status-live';
                btnText = '🎮 Join Event Now!';
                btn.disabled = false;
                btn.style.pointerEvents = 'auto !important';
                btn.style.cursor = 'pointer !important';
                const user = auth.currentUser;
                if (user) {
                    db.ref('event_entries/' + eventData.title + '/' + user.uid).once('value', snap => {
                        if (snap.exists()) {
                            playBtn.style.display = 'block';
                            playBtn.querySelector('#play-game-text').textContent = '▶️ Start Event';
                            btnText = '✅ Joined';
                            document.getElementById('event-btn-text').textContent = '✅ Joined';
                        } else {
                            playBtn.style.display = 'none';
                        }
                    });
                } else {
                    playBtn.style.display = 'none';
                }
                break;
            case 'ended':
                statusText = '🏁 ENDED';
                statusClass = 'event-status-ended';
                btnText = 'Event Ended';
                btn.disabled = true;
                playBtn.style.display = 'none';
                break;
            default:
                statusText = '⏳ WAIT';
                statusClass = 'event-status-waiting';
                btnText = 'Loading...';
                btn.disabled = true;
                playBtn.style.display = 'none';
        }
        
        badge.textContent = statusText;
        badge.className = 'event-status-badge ' + statusClass;
        text.textContent = btnText;
        
        const popup = document.getElementById('event-popup');
        if (popup.style.display === 'flex') {
            document.getElementById('event-popup-title').textContent = eventData.title;
            document.getElementById('event-popup-status').textContent = statusText;
            document.getElementById('event-popup-status').className = 'event-status-badge ' + statusClass;
            let fullMsg = eventData.message;
            if (eventData.adminMessage) {
                fullMsg += '\n\n📌 Admin: ' + eventData.adminMessage;
            }
            document.getElementById('event-popup-msg').textContent = fullMsg;
            const feeDisplay = eventData.feeType === 'money' ? eventData.price + ' Rs' : eventData.price + ' coins';
            document.getElementById('event-popup-fee').textContent = feeDisplay;
            eventEntryFee = eventData.price;
            eventEntryFeeType = eventData.feeType;
            
            const btnJoin = document.getElementById('event-popup-btn');
            if (eventData.status === 'live') {
                const user = auth.currentUser;
                if (user) {
                    db.ref('event_entries/' + eventData.title + '/' + user.uid).once('value', snap => {
                        if (snap.exists()) {
                            btnJoin.style.display = 'block';
                            btnJoin.textContent = '✅ JOINED';
                            btnJoin.disabled = true;
                            btnJoin.style.background = '#555 !important';
                            document.getElementById('payment-method-section').style.display = 'none';
                            document.getElementById('payment-amount-section').style.display = 'none';
                        } else {
                            if (eventData.feeType === 'money' && eventData.price > 0) {
                                document.getElementById('payment-method-section').style.display = 'block';
                                document.getElementById('payment-amount-section').style.display = 'none';
                                btnJoin.style.display = 'none';
                            } else {
                                document.getElementById('payment-method-section').style.display = 'none';
                                document.getElementById('payment-amount-section').style.display = 'none';
                                btnJoin.style.display = 'block';
                                btnJoin.textContent = '🎮 JOIN EVENT (' + feeDisplay + ')';
                                btnJoin.disabled = false;
                                btnJoin.style.background = 'var(--gold) !important';
                                btnJoin.style.pointerEvents = 'auto !important';
                                btnJoin.style.cursor = 'pointer !important';
                            }
                        }
                    });
                } else {
                    btnJoin.style.display = 'block';
                    btnJoin.textContent = '🔐 Login to Join';
                    btnJoin.disabled = true;
                }
            } else {
                document.getElementById('payment-method-section').style.display = 'none';
                document.getElementById('payment-amount-section').style.display = 'none';
                btnJoin.style.display = 'none';
            }
        }
        
        if (eventData.status === 'live' && eventData.countdown > 0) {
            if (eventCountdownInterval) clearInterval(eventCountdownInterval);
            let remaining = eventData.countdown;
            eventCountdownInterval = setInterval(() => {
                remaining--;
                if (remaining <= 0) {
                    clearInterval(eventCountdownInterval);
                    document.getElementById('event-popup-countdown').textContent = '⏰ TIME UP!';
                } else {
                    const hrs = Math.floor(remaining / 3600);
                    const mins = Math.floor((remaining % 3600) / 60);
                    const secs = remaining % 60;
                    document.getElementById('event-popup-countdown').textContent = 
                        `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
                }
            }, 1000);
        } else {
            if (eventCountdownInterval) clearInterval(eventCountdownInterval);
            document.getElementById('event-popup-countdown').textContent = '--:--:--';
        }
    }

    
    function openEventPopup() {
        if (eventData.status !== 'live') {
            alert('Event is not live yet! Status: ' + eventData.status);
            return;
        }
        const popup = document.getElementById('event-popup');
        popup.style.display = 'flex';
        popup.style.pointerEvents = 'auto !important';
        updateEventUI();
    }

    
    function selectPaymentMethod(method) {
        selectedPaymentMethod = method;
        document.getElementById('payment-method-section').style.display = 'none';
        document.getElementById('payment-amount-section').style.display = 'block';
        
        const methodName = method === 'jazzcash' ? 'JazzCash' : 'Bank Account';
        const numberDisplay = document.getElementById('admin-number-display');
        numberDisplay.textContent = '03089649612';
        numberDisplay.style.color = 'var(--gold)';
        
        document.getElementById('payment-amount-input').value = eventEntryFee;
        document.getElementById('payment-amount-input').readOnly = true;
    }

    
    function confirmPayment() {
        const amount = document.getElementById('payment-amount-input').value;
        if (!amount || amount < eventEntryFee) {
            alert('Please enter the correct amount (Rs. ' + eventEntryFee + ')');
            return;
        }
        
        const method = selectedPaymentMethod === 'jazzcash' ? 'JazzCash' : 'Bank Account';
        const user = auth.currentUser;
        
        if (!user) {
            alert('Please login first!');
            return;
        }
        
        if (confirm('✅ Confirm that you have sent Rs. ' + amount + ' via ' + method + ' to 03089649612?')) {
            const requestKey = db.ref('event_payments').push().key;
            paymentRequestId = requestKey;
            
            const paymentData = {
                uid: user.uid,
                email: user.email,
                userName: currentUserName || user.email,
                amount: amount,
                method: method,
                eventTitle: eventData.title,
                eventFee: eventEntryFee,
                status: 'pending',
                time: new Date().toLocaleString(),
                timestamp: Date.now(),
                adminNumber: '03089649612'
            };
            
            db.ref('event_payments/' + requestKey).set(paymentData);
            db.ref('user_payments/' + user.uid + '/' + requestKey).set(paymentData);
            
            alert('✅ Payment request submitted!\n\nYour request has been sent to admin.\nYou will receive approval within 24 hours.\nOnce approved, you will be added to the event.\n\n📱 Send payment to: 03014618631\n💳 Method: ' + method);
            
            document.getElementById('event-popup').style.display = 'none';
            
            sendPaymentNotification(user.email, amount, method, requestKey);
        }
    }

    
    function sendPaymentNotification(userEmail, amount, method, requestId) {
        const message = `💳 NEW EVENT PAYMENT REQUEST\n\nUser: ${userEmail}\nAmount: Rs. ${amount}\nMethod: ${method}\nEvent: ${eventData.title}\nTime: ${new Date().toLocaleString()}\n\nPlease verify and approve in Admin Panel -> Payments tab.\nRequest ID: ${requestId}`;
        
        emailjs.send('service_41m7jpc', 'template_tibf658', {
            user_email: 'anasf7012@gmail.com',
            name: 'Event Payment Alert',
            message: message
        }).catch(e => console.log('Payment notification error:', e));
    }

    
    function loadPaymentRequests() {
        const list = document.getElementById('payment-requests-list');
        list.innerHTML = "Loading payment requests...";
        
        db.ref('event_payments').orderByChild('timestamp').once('value').then(snap => {
            list.innerHTML = "";
            let hasData = false;
            
            snap.forEach(child => {
                const p = child.val();
                const key = child.key;
                hasData = true;
                
                const statusColor = p.status === 'approved' ? '#39ff14' : p.status === 'rejected' ? '#ff0055' : '#ff8800';
                const statusText = p.status === 'approved' ? '✅ APPROVED' : p.status === 'rejected' ? '❌ REJECTED' : '⏳ PENDING';
                
                list.innerHTML += `
                    <div class="support-card" style="border-left-color: ${statusColor};">
                        <p><b>👤 ${p.userName || p.email}</b> (${p.email})</p>
                        <p>💰 Amount: <b style="color:var(--gold);">Rs. ${p.amount}</b></p>
                        <p>💳 Method: ${p.method}</p>
                        <p>🎮 Event: ${p.eventTitle || 'N/A'}</p>
                        <p>🕐 Time: ${p.time}</p>
                        <p>Status: <b style="color:${statusColor};">${statusText}</b></p>
                        ${p.status === 'pending' ? `
                            <div class="action-btns">
                                <button onclick="approvePayment('${key}')" style="background:green; color:white; border:none; padding:8px 15px; border-radius:8px; cursor:pointer; font-weight:bold;">✅ Approve</button>
                                <button onclick="rejectPayment('${key}')" style="background:red; color:white; border:none; padding:8px 15px; border-radius:8px; cursor:pointer; font-weight:bold;">❌ Reject</button>
                            </div>
                        ` : ''}
                    </div>
                `;
            });
            
            if (!hasData) {
                list.innerHTML = "<p style='color:#444;'>No payment requests yet.</p>";
            }
        });
    }

    
    function approvePayment(paymentKey) {
        if (!confirm('Approve this payment and add user to event?')) return;
        
        db.ref('event_payments/' + paymentKey).once('value', snap => {
            const p = snap.val();
            if (!p) return;
            
            db.ref('event_payments/' + paymentKey).update({
                status: 'approved',
                approvedAt: Date.now(),
                approvedTime: new Date().toLocaleString()
            });
            
            const entryData = {
                uid: p.uid,
                email: p.email,
                userName: p.userName || p.email,
                eventName: p.eventTitle,
                feeType: 'money',
                feeAmount: p.amount,
                isVIP: false,
                status: 'approved',
                approvedAt: Date.now(),
                approvedTime: new Date().toLocaleString(),
                paymentId: paymentKey,
                time: new Date().toLocaleString(),
                timestamp: Date.now()
            };
            
            db.ref('event_entries/' + p.eventTitle + '/' + p.uid).set(entryData);
            db.ref('event_entries_all').push(entryData);
            
            const msg = `✅ EVENT PAYMENT APPROVED ✅\n\nDear ${p.userName || 'User'},\n\nYour payment of Rs. ${p.amount} via ${p.method} has been APPROVED!\n\nYou have been added to the event: ${p.eventTitle}\n\nThank you for participating!\n\n— Nightorbit Team`;
            
            emailjs.send('service_41m7jpc', 'template_tibf658', {
                user_email: p.email,
                name: p.userName || p.email,
                message: msg
            }).catch(e => console.log('Email error:', e));
            
            alert('✅ Payment approved! User added to event.');
            loadPaymentRequests();
            loadEventAdmin();
            loadEventEntriesAdmin();
        });
    }

    
    function rejectPayment(paymentKey) {
        const reason = prompt('Reason for rejection:');
        if (reason === null) return;
        
        db.ref('event_payments/' + paymentKey).once('value', snap => {
            const p = snap.val();
            if (!p) return;
            
            db.ref('event_payments/' + paymentKey).update({
                status: 'rejected',
                rejectedAt: Date.now(),
                rejectedTime: new Date().toLocaleString(),
                rejectionReason: reason
            });
            
            const msg = `❌ EVENT PAYMENT REJECTED ❌\n\nDear ${p.userName || 'User'},\n\nYour payment of Rs. ${p.amount} via ${p.method} has been REJECTED.\n\nReason: ${reason}\n\nPlease contact support for further assistance.\n\n— Nightorbit Team`;
            
            emailjs.send('service_41m7jpc', 'template_tibf658', {
                user_email: p.email,
                name: p.userName || p.email,
                message: msg
            }).catch(e => console.log('Email error:', e));
            
            alert('❌ Payment rejected!');
            loadPaymentRequests();
        });
    }

    
    function joinEvent() {
        const user = auth.currentUser;
        if (!user) { alert('Please login first!'); return; }
        
        if (eventData.status !== 'live') {
            alert('Event is not live!');
            return;
        }
        
        db.ref('vip_users/' + user.uid).once('value', vipSnap => {
            const isVIP = vipSnap.val() === true;
            
            db.ref('users/' + user.uid + '/vipExpiry').once('value', expirySnap => {
                const expiry = expirySnap.val() || 0;
                const isExpired = expiry > 0 && expiry <= Date.now();
                const isVIPValid = isVIP && !isExpired;
                
                
                db.ref('event_entries/' + eventData.title + '/' + user.uid).once('value', snap => {
                    if (snap.exists()) {
                        alert('✅ You have already joined this event!');
                        document.getElementById('event-popup').style.display = 'none';
                        document.getElementById('play-game-btn').style.display = 'block';
                        return;
                    }
                    
                    const fee = isVIPValid ? 0 : (eventData.price || 0);
                    const feeType = eventData.feeType || 'coins';
                    
                    if (feeType === 'money' && !isVIPValid && fee > 0) {
                        alert('💳 Payment required. Please select payment method.');
                        document.getElementById('payment-method-section').style.display = 'block';
                        document.getElementById('payment-amount-section').style.display = 'none';
                        return;
                    }
                    
                    if (!isVIPValid && feeType === 'coins' && currentUserCoins < fee) {
                        alert('❌ Insufficient coins! You need ' + fee + ' coins to join.');
                        return;
                    }
                    
                    const msg = isVIPValid ? '👑 VIP: Free entry!' : 'Join for ' + fee + (feeType === 'money' ? ' Rs' : ' coins');
                    if (confirm('Join event "' + eventData.title + '"?\n' + msg)) {
                        
                        let status = 'approved';
                        
                        if (!isVIPValid && feeType === 'coins') {
                            db.ref('users/' + user.uid + '/coins').transaction(c => (c || 0) - fee);
                        }
                        
                        const entryData = {
                            uid: user.uid,
                            email: user.email,
                            userName: currentUserName || user.email,
                            eventName: eventData.title,
                            feeType: feeType,
                            feeAmount: fee,
                            isVIP: isVIPValid,
                            status: status,
                            time: new Date().toLocaleString(),
                            timestamp: Date.now()
                        };
                        
                        db.ref('event_entries/' + eventData.title + '/' + user.uid).set(entryData);
                        db.ref('event_entries_all').push(entryData);
                        
                        alert('🎉 You have joined the event!' + (isVIPValid ? ' (VIP Free Entry)' : '') + (feeType === 'coins' ? ' (' + fee + ' coins deducted)' : ''));
                        document.getElementById('event-popup').style.display = 'none';
                        
                        document.getElementById('play-game-btn').style.display = 'block';
                        document.getElementById('play-game-btn').querySelector('#play-game-text').textContent = '▶️ Start Event';
                        
                        updateEventUI();
                    }
                });
            });
        });
    }

    
    function openGame() {
        if (!auth.currentUser) {
            alert('Please login first to play the game!');
            return;
        }
        
        const user = auth.currentUser;
        const eventName = eventData.title || 'Event';
        
        db.ref('event_entries/' + eventName + '/' + user.uid).once('value', snap => {
            if (!snap.exists()) {
                alert('❌ You must join the event first before playing!');
                return;
            }
            
            db.ref('users/' + user.uid + '/frozen').once('value', frozenSnap => {
                if (frozenSnap.val() === true) {
                    alert('❌ Your account is FROZEN. Use Help Center to contact admin.');
                    return;
                }
                
                window.open('My-Marker-Event.html', '_blank');
            });
        });
    }

    
    function loadEventEntriesAdmin() {
        const list = document.getElementById('event-entries-list');
        if (!list) return;
        list.innerHTML = "<p style='color:#888;'>Loading event entries...</p>";
        
        db.ref('event_entries').once('value', snap => {
            let html = '';
            let hasData = false;
            
            const events = [];
            snap.forEach(child => {
                events.push({ name: child.key, data: child.val() });
            });
            
            db.ref('app_control/event/title').once('value', liveTitleSnap => {
                const liveEventName = liveTitleSnap.val() || '';
                
                events.sort((a, b) => {
                    if (a.name === liveEventName) return -1;
                    if (b.name === liveEventName) return 1;
                    let aTime = 0, bTime = 0;
                    const aVals = Object.values(a.data);
                    const bVals = Object.values(b.data);
                    if (aVals.length > 0) aTime = aVals[0].timestamp || 0;
                    if (bVals.length > 0) bTime = bVals[0].timestamp || 0;
                    return bTime - aTime;
                });
                
                events.forEach(event => {
                    const eventName = event.name;
                    const entries = event.data;
                    const entryList = Object.values(entries);
                    
                    if (entryList.length === 0) return;
                    hasData = true;
                    
                    const isLive = eventName === liveEventName;
                    const borderColor = isLive ? 'var(--neon-green)' : 'var(--gold)';
                    
                    html += `
                        <div style="background:#1a1a1a; border:2px solid ${borderColor}; border-radius:15px; padding:15px; margin-bottom:15px;">
                            <h4 style="color:${borderColor}; margin:0 0 10px 0;">
                                ${isLive ? '🔴 LIVE - ' : '🎯 '} ${eventName}
                                <span style="font-size:11px; color:#888; margin-left:10px;">Total Entries: ${entryList.length}</span>
                            </h4>
                    `;
                    
                    entryList.forEach(entry => {
                        const statusColor = entry.status === 'approved' ? 'var(--neon-green)' : 
                                           entry.status === 'rejected' ? 'var(--neon-red)' : 'orange';
                        const statusText = entry.status === 'approved' ? '✅ Approved' : 
                                          entry.status === 'rejected' ? '❌ Rejected' : '⏳ Pending';
                        
                        html += `
                            <div class="support-card" style="border-left-color: ${statusColor}; margin-bottom:8px;">
                                <p><b>👤 ${entry.userName || entry.email}</b> (${entry.email})</p>
                                <p>💳 Fee: ${entry.feeAmount} ${entry.feeType} ${entry.isVIP ? '👑 VIP' : ''}</p>
                                <p>🕐 Time: ${entry.time}</p>
                                <p>Status: <b style="color:${statusColor};">${statusText}</b></p>
                                ${entry.status === 'pending' ? `
                                    <div class="action-btns">
                                        <button onclick="approveEventEntryAdmin('${eventName}', '${entry.uid}')" style="background:green; color:white; border:none; padding:5px 12px; border-radius:5px; cursor:pointer;">✅ Approve</button>
                                        <button onclick="rejectEventEntryAdmin('${eventName}', '${entry.uid}')" style="background:red; color:white; border:none; padding:5px 12px; border-radius:5px; cursor:pointer;">❌ Reject</button>
                                    </div>
                                ` : ''}
                            </div>
                        `;
                    });
                    
                    html += `</div>`;
                });
                
                list.innerHTML = hasData ? html : "<p style='color:#444;'>No event entries yet.</p>";
            });
        });
    }

    function approveEventEntryAdmin(eventName, uid) {
        if (confirm('Approve this entry for ' + eventName + '?')) {
            db.ref('event_entries/' + eventName + '/' + uid).update({
                status: 'approved',
                approvedAt: Date.now(),
                approvedTime: new Date().toLocaleString()
            });
            alert('✅ Entry approved!');
            loadEventEntriesAdmin();
        }
    }

    function rejectEventEntryAdmin(eventName, uid) {
        const reason = prompt('Reason for rejection:');
        if (reason === null) return;
        db.ref('event_entries/' + eventName + '/' + uid).update({
            status: 'rejected',
            rejectedAt: Date.now(),
            rejectedTime: new Date().toLocaleString(),
            rejectionReason: reason
        });
        alert('❌ Entry rejected!');
        loadEventEntriesAdmin();
    }

    
    function showEventWinners() {
        const popup = document.getElementById('winners-popup');
        const list = document.getElementById('winners-list');
        const endMsgContainer = document.getElementById('winners-end-message');
        const endMsgText = document.getElementById('winners-end-msg-text');
        
        popup.style.display = 'flex';
        popup.style.alignItems = 'center';
        popup.style.justifyContent = 'center';
        list.innerHTML = '<p style="color:#888; text-align:center; padding:20px;">Loading winners...</p>';
        endMsgContainer.style.display = 'none';
        
        db.ref('app_control/event').once('value', snap => {
            const data = snap.val() || {};
            const positions = data.positions || [];
            const winners = data.winners || [];
            const endMessage = data.endMessage || '';
            
            if (endMessage && endMessage.trim() !== '') {
                endMsgText.textContent = endMessage;
                endMsgContainer.style.display = 'block';
            }
            
            if (positions.length === 0 && winners.length === 0) {
                list.innerHTML = `
                    <div style="color:#444; text-align:center; padding:30px 20px; font-size:14px;">
                        <i class="fa-solid fa-trophy" style="font-size:40px; display:block; margin-bottom:10px; color:#333;"></i>
                        No event winners yet.<br>
                        <span style="font-size:12px; color:#555;">Check back after the event ends!</span>
                    </div>
                `;
                return;
            }
            
            let html = '';
            const rankEmojis = ['🥇', '🥈', '🥉'];
            const rankClasses = ['gold', 'silver', 'bronze'];
            
            positions.forEach((pos, index) => {
                const winner = winners[index] || { name: 'Not assigned', email: '' };
                const rankEmoji = rankEmojis[index] || '🏅';
                const rankClass = rankClasses[index] || '';
                const isAssigned = winner.name && winner.name !== 'Not assigned';
                
                html += `
                    <div style="display:flex; align-items:center; gap:12px; padding:12px 15px; margin-bottom:8px; background:rgba(255,255,255,0.03); border-radius:12px; border-left:4px solid var(--gold); transition:0.3s; ${index === 0 ? 'background:rgba(255,215,0,0.08);' : ''}">
                        <div style="font-size:22px; min-width:40px; text-align:center; ${rankClass === 'gold' ? 'color:var(--gold);' : rankClass === 'silver' ? 'color:#c0c0c0;' : rankClass === 'bronze' ? 'color:#cd7f32;' : ''}">${rankEmoji}</div>
                        <div style="flex:1;">
                            <div style="color:#fff; font-weight:bold; font-size:14px;">${pos.name || 'Position ' + (index+1)}</div>
                            <div style="font-size:11px; color:${isAssigned ? 'var(--gold)' : '#555'};">${isAssigned ? '🏆 ' + winner.name : '⏳ Not assigned yet'}</div>
                            ${winner.email ? `<div style="font-size:10px; color:#555;">${winner.email}</div>` : ''}
                        </div>
                        <div style="color:var(--primary); font-weight:bold; font-size:13px; background:rgba(0,210,255,0.1); padding:4px 12px; border-radius:20px; border:1px solid rgba(0,210,255,0.2);">${pos.reward || ''}</div>
                    </div>
                `;
            });
            
            list.innerHTML = html;
        });
    }

    function closeWinnersPopup() {
        document.getElementById('winners-popup').style.display = 'none';
    }

    
    
    
    function switchAdminTab(tab) {
        document.getElementById('admin-tab-replies').style.display = tab === 'replies' ? 'block' : 'none';
        document.getElementById('admin-tab-users').style.display = tab === 'users-list' ? 'block' : 'none';
        document.getElementById('admin-tab-verifications').style.display = tab === 'verifications' ? 'block' : 'none';
        document.getElementById('admin-tab-event').style.display = tab === 'event' ? 'block' : 'none';
        document.getElementById('admin-tab-payments').style.display = tab === 'payments' ? 'block' : 'none';
        document.getElementById('admin-tab-event-entries').style.display = tab === 'event-entries' ? 'block' : 'none';
        document.querySelectorAll('#owner-support-panel .tab-btn').forEach(b => b.classList.remove('active'));
        if(event) event.target.classList.add('active');
        if(tab === 'event-entries') loadEventEntriesAdmin();
         if (tab === 'users-list') {
        
        loadUsersForAdmin();
    }
  }

function loadUsersForAdmin() {
    const list = document.getElementById('user-management-list');
    list.innerHTML = "Loading...";
    db.ref('users').once('value').then(snap => {
        list.innerHTML = "";
        snap.forEach(child => {
            const u = child.val();
            const uid = child.key;
            const isBanned = u.banStatus === 'perm' || u.banStatus === 'temp';
            const isFrozen = u.frozen === true;
            const warnings = u.adWarnings || 0;
            
            db.ref('referrals/' + uid).once('value', refSnap => {
                let refCount = 0;
                let referrer = 'Direct Signup';
                refSnap.forEach(folder => {
                    if (folder.key !== 'claimed') {
                        folder.forEach(refChild => {
                            refCount++;
                            if (!referrer || referrer === 'Direct Signup') {
                                referrer = refChild.val().email || 'Unknown';
                            }
                        });
                    }
                });
                
                db.ref('consecutive_warning_days/' + uid).once('value', consSnap => {
                    const consDays = consSnap.val() || 0;
                    
                    const deviceName = u.deviceInfo?.deviceModel || u.device || 'Unknown';
                    const locationStr = u.location ? `Lat: ${u.location.lat || 'N/A'}, Lon: ${u.location.lon || 'N/A'}` : 'Unknown';
                    
                    list.innerHTML += `
                    <div class="support-card" style="border-left-color: ${isFrozen ? 'orange' : (isBanned ? 'red' : 'green')}">
                        <p><b>${u.ownerNick || 'User'}</b> (${u.email})</p>
                        <p>📱 Phone: ${u.phoneNumber || 'Not registered'}</p>
                        <p>📧 Connected Email: ${u.connectedEmail || 'Not registered'}</p>
                        <p>🔗 Referred By: <b style="color:var(--gold);">${referrer}</b></p>
                        <p>👥 Total Referrals: <b style="color:var(--neon-cyan); font-size:16px;">${refCount}</b></p>
                        <p>📱 Device: ${deviceName}</p>
                        <p>📍 Location: ${locationStr}</p>
                        <p>🕐 Login Time: ${u.lastLogin ? new Date(u.lastLogin).toLocaleString() : 'N/A'}</p>
                        <p>🕐 Registered: ${u.registeredAt ? new Date(u.registeredAt).toLocaleString() : 'N/A'}</p>
                        <p>Status: ${isFrozen ? 'FROZEN' : (isBanned ? 'BANNED' : 'ACTIVE')} | Warnings: ${warnings} | Consecutive Days: ${consDays}</p>
                        <p>Freeze Reason: ${u.freezeReason || 'None'}</p>
                        <div class="action-btns">
                            ${isFrozen ? `<button class="btn-main" onclick="unfreezeUser('${uid}')">UNFREEZE</button>` : ''}
                            ${isBanned ? 
                                `<button class="btn-main" onclick="unbanUser('${uid}')">UNBAN</button>` :
                                `<button class="btn-main" onclick="banUser('${uid}')">BAN</button>`
                            }
                            <button class="btn-main" onclick="tempBanUser('${uid}')">24H BAN</button>
                            <button class="btn-main" onclick="sendAdminNotice('${uid}')">NOTICE</button>
                            <button class="btn-main" onclick="resetWarnings('${uid}')">RESET WARNINGS</button>
                        </div>
                    </div>`;
                });
            });
        });
    });
}

             function loadPurchaseVerifications() {
        const list = document.getElementById('purchase-verifications-list');
        list.innerHTML = "Loading...";
        db.ref('purchase_verifications').once('value').then(snap => {
            list.innerHTML = "";
            snap.forEach(userVerifications => {
                userVerifications.forEach(verif => {
                    const v = verif.val();
                    if (v.status === 'pending') {
                        let amountDisplay = v.currency === 'USD'
                            ? `$${v.amount} (≈ Rs. ${v.amountPKR})`
                            : `Rs. ${v.amount}`;
                        list.innerHTML += `
                        <div class="admin-card">
                            <p><b>${v.userEmail}</b> - ${v.platform}</p>
                            <p>Amount: ${amountDisplay} (Exchange Rate: 1 USD = ${v.exchangeRate || 280} PKR)</p>
                            <p>Coins Estimated: ${v.coinsEstimated}</p>
                            <div style="max-width:200px; max-height:200px; margin:10px 0;">
                                <img src="${v.screenshot}" style="max-width:100%; border-radius:10px;">
                            </div>
                            <p>Order Time: ${v.orderTimeStr}</p>
                            <p>Submitted: ${v.submitTimeStr}</p>
                            <div class="action-btns">
                                <button onclick="approvePurchase('${verif.key}', '${userVerifications.key}', ${v.amountPKR})" style="background:green;">APPROVE</button>
                                <button onclick="rejectPurchase('${verif.key}', '${userVerifications.key}')" style="background:red;">REJECT</button>
                            </div>
                        </div>`;
                    }
                });
            });
            if (list.innerHTML === "") {
                list.innerHTML = "<p>No pending verifications</p>";
            }
        });
    }

    function approvePurchase(verifKey, userUid, amount) {
        const coinsToGive = Math.floor(amount / 100) * 10;
        
        db.ref('purchase_verifications/' + userUid + '/' + verifKey).update({
            status: 'approved',
            approvedAt: Date.now(),
            approvedBy: 'Admin'
        });
        
        db.ref('users/' + userUid + '/coins').transaction(current => (current || 0) + coinsToGive);
        
        db.ref('purchases/' + userUid).push({
            platform: 'Verified Purchase',
            amount: amount,
            coinsEarned: coinsToGive,
            verified: true,
            timestamp: Date.now()
        });
        
        alert(`✅ Approved! ${coinsToGive} coins added.`);
        loadPurchaseVerifications();
    }

    function rejectPurchase(verifKey, userUid) {
        db.ref('purchase_verifications/' + userUid + '/' + verifKey).update({
            status: 'rejected',
            rejectedAt: Date.now()
        });
        alert("❌ Verification rejected");
        loadPurchaseVerifications();
    }

    function resetWarnings(uid) {
        if(confirm("Reset ad warnings for this user?")) {
            db.ref('users/' + uid).update({ adWarnings: 0 }).then(() => alert("Warnings reset!"));
        }
    }

    function unfreezeUser(uid) {
        if(confirm("Unfreeze this account?")) {
            db.ref('users/' + uid).update({
                frozen: false,
                freezeReason: null,
                freezeTime: null,
                adWarnings: 0
            }).then(() => alert("Unfrozen!"));
        }
    }

    function tempBanUser(uid) {
        const reason = prompt("Reason for 24-hour ban:");
        if(!reason) return;
        const expiryTime = Date.now() + (24 * 60 * 60 * 1000);
        db.ref('users/' + uid).update({
            banStatus: 'temp',
            banExpiry: expiryTime,
            adminMessage: reason,
            isBanned: true
        }).then(() => alert("User banned for 24 hours"));
    }

    function banUser(uid) {
        const reason = prompt("Reason for permanent ban:");
        if(!reason) return;
        db.ref('users/' + uid).update({
            banStatus: 'perm',
            adminMessage: reason,
            isBanned: true
        }).then(() => alert("User banned permanently"));
    }

    function unbanUser(uid) {
        if(confirm("Unban this user?")) {
            db.ref('users/' + uid).update({
                banStatus: 'none',
                adminMessage: "",
                banExpiry: null,
                isBanned: false
            }).then(() => alert("User unbanned!"));
        }
    }

    function sendAdminNotice(uid) {
        const msg = prompt("Notice message:");
        if(msg) db.ref('users/' + uid).update({ admin_notice: msg });
    }

    function setAlias(uid) { 
        let n = prompt("Nickname:"); 
        if(n) {
            db.ref('users/'+uid).update({ adminGivenNick: n });
            logAdminAction('Set Nickname', `User: ${uid}, Nickname: ${n}`);
        }
    }
    
    function changeUserPass(uid, email) { 
        let np = prompt("New password:"); 
        if(np && np.length>=6) {
            db.ref('users/'+uid).update({ password: np, adminNotice: "Password changed to: "+np });
            logAdminAction('Password Changed', `User: ${email}`);
            alert("✅ Password changed!");
        }
    }
    
    function resetUserPass(uid) { 
        if(confirm("Reset to 123456?")) {
            db.ref('users/'+uid).update({ password: "123456", adminNotice: "Password reset to 123456" });
            logAdminAction('Password Reset', `User: ${uid}`);
            alert("✅ Password reset to 123456!");
        }
    }
    
    function deleteFullAccount(uid, email) { 
        if(confirm(`Delete ${email}?`)) {
            db.ref('users/'+uid).remove();
            logAdminAction('Delete Account', `User: ${email}`);
            alert("✅ User deleted!");
        }
    }

    function logAdminAction(action, details) {
        const user = auth.currentUser;
        db.ref('admin_logs').push({
            admin: user ? user.email : 'unknown',
            action: action,
            details: details || '',
            timestamp: Date.now(),
            time: new Date().toLocaleString()
        });
        loadAdminLogs();
    }

    function loadAdminLogs() {
        const container = document.getElementById('admin-logs-list');
        container.innerHTML = "<p style='color:#888;'>Loading admin logs...</p>";
        
        db.ref('admin_logs').orderByChild('timestamp').limitToLast(100).once('value', snap => {
            let html = '';
            snap.forEach(child => {
                const log = child.val();
                html += `
                    <div class="admin-log-item">
                        <span style="color:var(--neon-blue);">${log.admin || 'Unknown'}</span>
                        <span class="log-action">${log.action || 'Action'}</span>
                        ${log.details ? `<span style="color:#888;font-size:10px;">- ${log.details}</span>` : ''}
                        <span class="log-time">${log.time || ''}</span>
                    </div>
                `;
            });
            container.innerHTML = html || "<p style='color:#444;'>No admin logs yet.</p>";
        });
    }

    
    
    
    function submitHelpRequest() { 
        const e = document.getElementById('h-email').value;
        const m = document.getElementById('h-msg').value;
        if(!e || !m) return alert("Please fill Gmail and Message!");
        
        showLoad("SENDING REQUEST...");
        const requestId = e.replace(/[.#$[\]]/g, "_") + "_" + Date.now();
        db.ref('help_requests/' + requestId).set({
            email: e, 
            message: m, 
            status: "pending", 
            reply: "Waiting for owner reply...", 
            time: new Date().toLocaleString()
        }).then(() => {
            hideLoad();
            alert(
                    "✅ Your request has been sent to Nightorbit!\n\n" +
                    "📌 Admin will reply within 24 hours.\n" +
                    "⏳ Please wait for 24 hours and then check your request status using the 'YOUR REQUEST' button.\n\n" +
                    "Thank you for your patience!"
                );
            document.getElementById('h-msg').value = "";
        });
    }

    
    function checkRequestStatus() { 
        document.getElementById('status-checker-overlay').style.display = 'flex';
    }

    function fetchStatusFromDB() {
        const email = document.getElementById('check-email-field').value;
        if(!email) return alert("Please enter Gmail!");
        
        showLoad("FETCHING STATUS...");
        db.ref('help_requests').orderByChild('email').equalTo(email).on('value', snap => {
            hideLoad();
            const resDiv = document.getElementById('status-result');
            if(snap.exists()){
                let html = "";
                snap.forEach(child => {
                    const data = child.val();
                    const id = child.key;
                    const r = data.reply ? data.reply : "Waiting...";
                    
                    html += `
                    <div class="private-reply-box">
                        <div style="font-size:9px; color:var(--gold);">${data.time}</div>
                        <div style="color:#eee; font-size:11px;"><b>You:</b> ${data.message}</div>
                        <div style="background:rgba(0,210,255,0.1); padding:8px; border-radius:8px; color:var(--primary);">
                            <b>${data.status === 'pending' ? 'STATUS: PENDING' : 'OWNER REPLY:'}</b><br>${r}
                        </div>
                    </div>`;
                });
                resDiv.innerHTML = html;
            } else {
                resDiv.innerHTML = "<p style='color:#555'>No requests found.</p>";
            }
        });
    }

    function listenForPrivateReplies() {
        const user = auth.currentUser;
        if(!user) return;
        db.ref('help_requests').orderByChild('email').equalTo(user.email).on('child_changed', snap => {
            const data = snap.val();
            if(data.status === "responded") {
                alert("NIGHTORBIT: New reply received!");
            }
        });
    }

    function sendGlobalReply() {
        const msg = document.getElementById('global-reply-input').value;
        if(!msg) return alert("Enter message!");
        db.ref('app_control/global_announcement').set(msg).then(() => {
            alert("Broadcast sent!");
            document.getElementById('global-reply-input').value = "";
        });
    }

    function deleteGlobalReply() {
        db.ref('app_control/global_announcement').set("").then(() => alert("Broadcast cleared!"));
    }

    function sendPrivateReply(requestId, email) {
        const reply = prompt("Reply for " + email);
        if(!reply) return;
        db.ref('help_requests/' + requestId).update({
            reply: reply,
            status: "responded",
            last_reply_time: Date.now()
        }).then(() => alert("Reply Sent!"));
    }

    function deleteSpecificReply(requestId) {
        if(confirm("Delete permanently?")) {
            db.ref('help_requests/' + requestId).remove().then(() => alert("Deleted!"));
        }
    }

    
    
    
    async function sendMessageToAnyGmail() {
        const email = document.getElementById('any-gmail-input').value;
        const message = document.getElementById('any-msg-text').value;
        if (!email || !message) return alert("Enter Gmail and message!");
        const time = new Date().toLocaleString();
        let fullMsg = `📧 MESSAGE FROM NIGHTORBIT ADMIN:\n\n${message}\n\nTime: ${time}\n\n— Nightorbit Team`;
        try {
            await emailjs.send('service_41m7jpc', 'template_tibf658', { user_email: email, name: email.split('@')[0], message: fullMsg });
            await db.ref('msg_history/any_gmail').push({ email, message: fullMsg, time, timestamp: Date.now() });
            logAdminAction('Message Sent to Any Gmail', `To: ${email}`);
            alert("✅ Message sent successfully to " + email);
            document.getElementById('any-gmail-input').value = '';
            document.getElementById('any-msg-text').value = '';
        } catch(err) { alert("Failed: " + err.message); }
    }

    async function sendSimpleDirectMsg() {
        const uid = document.getElementById('direct-msg-gmail').value;
        const msg = document.getElementById('direct-msg-text').value;
        if(!uid || !msg) return alert("Select user and write message!");
        const time = new Date().toLocaleString();
        db.ref('users/'+uid).once('value', async snap => {
            const email = snap.val().email;
            const fullMsg = `📧 DIRECT MESSAGE FROM ADMIN 📧\n\n${msg}\n\nDate: ${time}\n\n— Nightorbit Team`;
            await emailjs.send('service_41m7jpc', 'template_tibf658', { user_email: email, name: email.split('@')[0], message: fullMsg });
            db.ref('users/'+uid).update({ adminNotice: fullMsg, noticeTime: time });
            logAdminAction('Direct Message Sent', `To: ${email}`);
            alert("Sent to " + email);
            document.getElementById('direct-msg-text').value = "";
        });
    }

    async function sendGlobalBroadcast() {
        const msg = document.getElementById('global-broadcast-text').value;
        if(!msg) return alert("Empty!");
        if(confirm("Send to ALL registered users?")) {
            const time = new Date().toLocaleString();
            const fullMsg = `📢 GLOBAL BROADCAST 📢\n\n${msg}\n\nDate: ${time}\n\n— Nightorbit Team`;
            db.ref('users').once('value', async snap => {
                let promises = [];
                snap.forEach(user => {
                    promises.push(emailjs.send('service_41m7jpc', 'template_tibf658', { user_email: user.val().email, name: user.val().ownerNick || user.val().realName || user.val().email.split('@')[0], message: fullMsg }).catch(e=>{}));
                    promises.push(db.ref('users/'+user.key).update({ adminNotice: fullMsg, noticeTime: time, broadcastMsg: msg, broadcastTime: time }));
                });
                await Promise.all(promises);
                await db.ref('msg_history/broadcast').push({ message: fullMsg, time, email: "ALL REGISTERED USERS" });
                logAdminAction('Global Broadcast Sent', `Message: ${msg.substring(0, 50)}...`);
                alert("Broadcast sent to all registered users!");
                document.getElementById('global-broadcast-text').value = "";
            });
        }
    }


    
    
    
  function openInNightorbitBrowser(url, platform) {
        window.open(url, '_blank');
    }
    function startBrowserPurchaseDetection() {}
    function browserGoBack() {}
    function browserRefresh() {}
    function closeBrowser() {}
    function checkForPurchase(silent = false) {}
    function reportFakeSite() {}
    function setupPurchaseDetection(platform, uid) {
        pendingPurchaseCheck = {
            platform: platform,
            uid: uid,
            time: Date.now()
        };
    }

    window.addEventListener('focus', function() {
        if (pendingPurchaseCheck && auth.currentUser && auth.currentUser.uid === pendingPurchaseCheck.uid) {
            const timeSpent = Math.floor((Date.now() - pendingPurchaseCheck.time) / 1000);
            if (timeSpent > 30) {
                setTimeout(function() {
                    if (confirm(`🛍️ Did you make a purchase on ${pendingPurchaseCheck.platform}?`)) {
                        showPurchaseVerificationModal(pendingPurchaseCheck.platform, pendingPurchaseCheck.uid);
                    }
                    pendingPurchaseCheck = null;
                }, 500);
            }
        }
    });

    document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'visible' && pendingPurchaseCheck) {
            const timeSpent = Math.floor((Date.now() - pendingPurchaseCheck.time) / 1000);
            if (timeSpent > 30) {
                setTimeout(function() {
                    if (confirm(`🛍️ Did you make a purchase on ${pendingPurchaseCheck.platform}?`)) {
                        showPurchaseVerificationModal(pendingPurchaseCheck.platform, pendingPurchaseCheck.uid);
                    }
                    pendingPurchaseCheck = null;
                }, 500);
            }
        }
    });

  


(function drawWheel() {
    const canvas = document.getElementById('taskWheel');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const colors = ['#00d2ff', '#ff0055', '#ffd700', '#3a7bd5', '#8a2be2', '#111'];
    const labelsLocal = ['10', '20', '50', '5', '100', '15'];
    const centerX = 100;
    const centerY = 100;
    const radius = 100;
    const segmentAngle = (2 * Math.PI) / 6;

    
    ctx.clearRect(0, 0, 200, 200);

    
    
    const startOffset = -Math.PI / 2;
    
    for (let i = 0; i < 6; i++) {
        const startAngle = startOffset + (i * segmentAngle);
        const endAngle = startAngle + segmentAngle;
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = colors[i];
        ctx.fill();
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 2;
        ctx.stroke();

        
        ctx.save();
        ctx.translate(centerX, centerY);
        const midAngle = startAngle + segmentAngle / 2;
        ctx.rotate(midAngle);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px Arial';
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 4;
        ctx.fillText(labelsLocal[i], radius * 0.65, 0);
        ctx.restore();
    }

    
    ctx.beginPath();
    ctx.arc(centerX, centerY, 14, 0, Math.PI * 2);
    ctx.fillStyle = '#FFD700';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.stroke();

    
    ctx.beginPath();
    ctx.moveTo(centerX, 8);
    ctx.lineTo(centerX - 12, -8);
    ctx.lineTo(centerX + 12, -8);
    ctx.closePath();
    ctx.fillStyle = '#FFD700';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
})();
    
    
    
    function showWelcomePopup(userName, isNewUser) {
        const overlay = document.getElementById('smart-message-overlay');
        const typeLabel = document.getElementById('reward-type-label');
        const msgText = document.getElementById('reward-message-text');
        const okBtn = document.getElementById('reward-ok-btn');

        if (isNewUser) {
            typeLabel.innerText = '🎉 FIRST TIME WELCOME';
            msgText.innerText = `Assalamu Alaikum ${userName}!\n\nWelcome to Nightorbit Bazar! We are happy to have you here. Stay with us and enjoy the best digital experience.\n\nThank you for choosing Nightorbit!\n\n- Team Nightorbit`;
        } else {
            typeLabel.innerText = '👋 WELCOME BACK';
            msgText.innerText = `Assalamu Alaikum ${userName}!\n\nWelcome back to Nightorbit Bazar! We hope you are having a great day. Enjoy your time with us.\n\n- Team Nightorbit`;
        }

        overlay.style.display = 'flex';
    }

    function showGoodbyePopup(userName) {
        const overlay = document.getElementById('smart-message-overlay');
        const typeLabel = document.getElementById('reward-type-label');
        const msgText = document.getElementById('reward-message-text');
        const okBtn = document.getElementById('reward-ok-btn');

        typeLabel.innerText = '🌙 GOODBYE FOR NOW';
        msgText.innerText = `Assalamu Alaikum ${userName}!\n\nThank you for visiting Nightorbit Bazar. We hope you enjoyed your time with us.\n\nMay you have a wonderful day ahead. Come back soon!\n\n- Team Nightorbit`;
        overlay.style.display = 'flex';
        okBtn.onclick = () => { overlay.style.display = 'none'; };
    }

    
    
    
    window.onload = async () => {
        showLoad("CONNECTING...");

       await getDeviceFingerprint();
       await checkSecurityStatus();
        
        if (!checkForUpdates()) {
            hideLoad();
            return;
        }
        
        await getUserLocation();
        await generateFingerprint();
        deviceId = getDeviceId();
        deviceInfo = getDeviceInfo();
        
        document.getElementById('browser-close')?.addEventListener('click', closeBrowser);
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && document.getElementById('nightorbit-browser').style.display === 'flex') {
                closeBrowser();
            }
        });
        
        auth.onAuthStateChanged(user => {
            if (user) {
                showLoad("AUTHENTICATING...");
                listenForPrivatePreLogin(user.email);
                db.ref('users/' + user.uid).once('value', snap => {
                    const data = snap.val();
                    if(data && (data.banStatus === 'perm' || (data.banStatus === 'temp' && Date.now() < data.banExpiry))) {
                        hideLoad();
                        auth.signOut();
                        location.reload();
                        return;
                    }
                    processUser(user, "Verified", data ? data.ownerNick : user.email.split('@')[0]);
                    syncWithAdminPanel(user.uid);
                    renderSupportRequests();
                    upgradeAllLinks();
                 });
            } else {
                setTimeout(hideLoad, 1000);
            }
        });
        
        const urlParams = new URLSearchParams(window.location.search);
        const ref = urlParams.get('ref');
        if (ref) localStorage.setItem('pending_referral', ref);
    };

    
    
    
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        document.getElementById('pwa-install-banner').style.display = 'flex';
    });

    document.getElementById('portal-download-btn').onclick = async function(e) {
        e.preventDefault();
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                alert('✅ App installed successfully!');
            }
            deferredPrompt = null;
        } else {
            alert('📱 To install app:\n\nChrome: Menu → "Add to Home screen"\nSafari: Share → "Add to Home screen"');
        }
    };

    document.getElementById('pwa-install-btn').innerHTML = 'INSTALL APP';
    document.getElementById('pwa-install-btn').addEventListener('click', async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                alert('🎉 App Installed!');
            }
            deferredPrompt = null;
        } else {
            alert('📱 To install:\n\nChrome: Menu → "Add to Home screen"\nSafari: Share → "Add to Home screen"');
        }
    });

    window.addEventListener('appinstalled', () => { 
        alert('🎉 App Installed!');
        deferredPrompt = null;
        if (window.matchMedia('(display-mode: standalone)').matches) {
            document.getElementById('pwa-install-banner').style.display = 'none';
            const portalDownloadBtn = document.getElementById('portal-download-btn');
            if (portalDownloadBtn) portalDownloadBtn.style.display = 'none';
        }
    });

    if (window.matchMedia('(display-mode: standalone)').matches) {
        document.getElementById('pwa-install-banner').style.display = 'none';
        const portalDownloadBtn = document.getElementById('portal-download-btn');
        if (portalDownloadBtn) portalDownloadBtn.style.display = 'none';
    }

    
    
    
    document.addEventListener('DOMContentLoaded', function() {
        const togglePassword = document.getElementById('togglePassword');
        const passwordInput = document.getElementById('u-pass');
        
        if (togglePassword && passwordInput) {
            togglePassword.addEventListener('click', function() {
                const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                passwordInput.setAttribute('type', type);
                this.classList.toggle('fa-eye-slash');
            });
        }
        
        const toggleRegPass = document.getElementById('toggleRegPass');
        const regPassInput = document.getElementById('reg-pass');
        
        if (toggleRegPass && regPassInput) {
            toggleRegPass.addEventListener('click', function() {
                const type = regPassInput.getAttribute('type') === 'password' ? 'text' : 'password';
                regPassInput.setAttribute('type', type);
                this.classList.toggle('fa-eye-slash');
            });
        }
        
        const toggleRegPassConfirm = document.getElementById('toggleRegPassConfirm');
        const regPassConfirmInput = document.getElementById('reg-pass-confirm');
        
        if (toggleRegPassConfirm && regPassConfirmInput) {
            toggleRegPassConfirm.addEventListener('click', function() {
                const type = regPassConfirmInput.getAttribute('type') === 'password' ? 'text' : 'password';
                regPassConfirmInput.setAttribute('type', type);
                this.classList.toggle('fa-eye-slash');
            });
        }
    });

    

    
    
    
    function loadRequests() {
        db.ref('help_requests').once('value').then(snap => {
            const list = document.getElementById('req-list');
            list.innerHTML = "";
            snap.forEach(child => {
                const r = child.val();
                const card = document.createElement('div');
                card.className = 'card';
                card.innerHTML = `<div style="color:var(--neon-blue)">${r.email}</div><div>"${r.message}"</div>
                    <div class="btn-grid"><button class="btn btn-tick" onclick="processReq('${child.key}', 'RESOLVED', '✅')">APPROVE ✅</button>
                    <button class="btn btn-cross" onclick="processReq('${child.key}', 'REJECTED', '❌')">REJECT ❌</button>
                    <button class="btn btn-del" onclick="hideFromSearch('${child.key}')">HIDE</button></div>`;
                list.appendChild(card);
            });
        });
    }

    function processReq(rid, status, icon) {
        db.ref('help_requests/'+rid).once('value', snap => {
            const d = snap.val();
            const reply = prompt("Enter your reply for " + d.email + ":");
            if(reply) {
                const time = new Date().toLocaleString();
                const formattedMsg = `${icon} OFFICIAL REPLY FROM ADMIN ${icon}\n\nYour request has been ${status}.\n\nReply: ${reply}\n\nDate: ${time}\n\n— Nightorbit Team`;
                db.ref('help_requests/'+rid).update({ status, reply: icon + " " + reply });
                emailjs.send('service_41m7jpc', 'template_tibf658', { user_email: d.email, name: d.email.split('@')[0], message: formattedMsg }).catch(e => {});
                db.ref('users').orderByChild('email').equalTo(d.email).once('value', uSnap => {
                    uSnap.forEach(u => db.ref('users/'+u.key).update({ adminNotice: formattedMsg, noticeTime: time }));
                });
                logAdminAction('Help Request Processed', `User: ${d.email}, Status: ${status}`);
                alert("Reply sent to " + d.email);
            }
        });
    }

    function hideFromSearch(rid) { if(confirm("Hide this request?")) db.ref('help_requests/'+rid).remove(); }

    
    
    
    function loadHistory() {
    db.ref('request_history').once('value').then(snap => {
            const list = document.getElementById('hist-list');
            list.innerHTML = "";
            snap.forEach(child => {
                const h = child.val();
                const card = document.createElement('div');
                card.className = 'card';
                card.innerHTML = `<div style="color:#666">${h.date}</div><div style="color:var(--neon-blue)">${h.userEmail}</div>
                    <div><b>Q:</b> ${h.userMsg}</div><div class="thread-box">${h.full_thread || 'No replies'}</div>
                    <button class="btn btn-master-del" onclick="masterDelete('${child.key}')">MASTER DELETE</button>`;
                list.prepend(card);
            });
        });
    }

    function masterDelete(rid) { if(prompt("Master Password:") === "r123456789r") db.ref('request_history/'+rid).remove(); }

    
    
    
    function loadSales() {
        const salesList = document.getElementById('sales-list');
        const nodes = ['sales_records', 'withdrawals', 'transactions'];
        salesList.innerHTML = "";
        nodes.forEach(node => {
            db.ref(node).once('value').then(snap => {
                let oldNode = document.getElementById('container-'+node);
                if(oldNode) oldNode.remove();
                const container = document.createElement('div'); container.id = 'container-'+node;
                salesList.appendChild(container);
                snap.forEach(child => {
                    const s = child.val();
                    const coinVal = s.amountRequested || s.coinsGiven || s.coins || s.amount || 0;
                    const pkrVal = (coinVal / 10).toFixed(2);
                    let detailsHtml = '';
                    if (s.accountInfo) {
                        detailsHtml = `<div class="withdrawal-details">
                            <div class="detail-row"><span class="label">👤 Account Holder</span><span class="value">${s.accountInfo.name || s.accountInfo.title || 'Not provided'}</span></div>
                            <div class="detail-row"><span class="label">📱 Phone Number</span><span class="value">${s.accountInfo.number || 'Not provided'}</span></div>
                            ${s.accountInfo.bank ? `<div class="detail-row"><span class="label">🏦 Bank Name</span><span class="value">${s.accountInfo.bank}</span></div>` : ''}
                            ${s.accountInfo.iban ? `<div class="detail-row"><span class="label">🔢 IBAN/Account</span><span class="value">${s.accountInfo.iban}</span></div>` : ''}
                            ${s.accountInfo.email ? `<div class="detail-row"><span class="label">📧 Connected Email</span><span class="value">${s.accountInfo.email}</span></div>` : ''}
                            ${s.connectedEmail ? `<div class="detail-row"><span class="label">📧 Connected Email</span><span class="value">${s.connectedEmail}</span></div>` : ''}
                            ${s.bonusCoins ? `<div class="detail-row"><span class="label">🎁 Bonus Coins</span><span class="value"><span class="bonus-tag">+${s.bonusCoins} BONUS</span></span></div>` : ''}
                        </div>`;
                    }
                    let locationDeviceHtml = '';
                    if (s.location || s.deviceInfo) {
                        const loc = s.location || s.locationData || {};
                        const dev = s.deviceInfo || s.deviceData || {};
                        locationDeviceHtml = `<div class="withdrawal-details" style="border-color: var(--neon-blue);">
                            <div class="detail-row"><span class="label">📍 Location</span><span class="value">${formatLocation(loc)}</span></div>
                            <div class="detail-row"><span class="label">📱 Device</span><span class="value">${formatDeviceName(dev)}</span></div>
                            ${s.fingerprint ? `<div class="detail-row"><span class="label">🔑 Fingerprint</span><span class="value" style="font-size:10px;">${s.fingerprint.substring(0, 20)}...</span></div>` : ''}
                        </div>`;
                    }
                    let otpStatus = '';
                    if (s.otpVerified) otpStatus += '✅ OTP Verified ';
                    if (s.connectedEmailVerified) otpStatus += '✅ Email Verified';
                    if (!s.otpVerified && !s.connectedEmailVerified) otpStatus = '⚠️ Not Verified';
                    const card = document.createElement('div');
                    card.className = 'card sale-card';
                    card.innerHTML = `
                        <div><span style="color:var(--neon-blue)">${s.email || 'No Email'}</span> <span class="badge-coin">⭐${coinVal}=${pkrVal}PKR</span></div>
                        <div class="info-row">
                            <div><b>Type</b>${node}</div>
                            <div><b>Method</b>${s.payMethod || s.method || 'N/A'}</div>
                            <div><b>Status</b><b style="color:${s.status==='PAID'?'#39ff14':'orange'}">${s.status || 'PENDING'}</b></div>
                            <div><b>Time</b>${s.time}</div>
                            <div><b>ID</b><span class="track-id">${child.key}</span></div>
                            <div><b>Verification</b>${otpStatus}</div>
                        </div>
                        ${detailsHtml}
                        ${locationDeviceHtml}
                        <div class="btn-grid">
                            <button class="btn btn-tick" onclick="openJazzModal('${node}', '${child.key}', 'PAID', '${s.email}', '${coinVal}')">✅ Pay</button>
                            <button class="btn btn-cross" onclick="openJazzModal('${node}', '${child.key}', 'REJECTED', '${s.email}', '${coinVal}')">❌ Reject</button>
                            <button class="btn btn-del" onclick="deleteSaleRecord('${node}', '${child.key}')">Remove</button>
                        </div>`;
                    container.prepend(card);
                });
            });
        });
    }

    function deleteSaleRecord(node, sid) { if(confirm("Delete?")) db.ref(node+'/'+sid).remove(); }

    
    
    
    function openJazzModal(node, sid, status, email, amount) {
        pendingPayData = { node, sid, status, email, amount };
        const modal = document.getElementById('jazz-modal');
        document.getElementById('payment-fields').style.display = status === 'PAID' ? 'block' : 'none';
        document.getElementById('modal-title').innerText = status === 'PAID' ? "Payment Verification" : "Rejection Notice";
        modal.style.display = 'flex';
    }

    function closeJazzModal() { document.getElementById('jazz-modal').style.display = 'none'; pendingPayData = null; }

    async function confirmJazzPay() {
        if(!pendingPayData) return;
        const { node, sid, status, email, amount } = pendingPayData;
        const userMsg = document.getElementById('jazz-msg-input').value;
        const time = new Date().toLocaleString();
        const pkrVal = (amount / 10).toFixed(2);
        let msg = status === 'PAID' ? `✅ WITHDRAWAL APPROVED ✅\n\nYour withdrawal for ⭐${amount} coins (${pkrVal} PKR) has been PROCESSED.\n\nAdmin Note: ${userMsg}\n\nDate: ${time}` : `❌ WITHDRAWAL REJECTED ❌\n\nYour withdrawal for ⭐${amount} coins has been REJECTED.\n\nReason: ${userMsg}\n\nDate: ${time}`;
        try {
            await emailjs.send('service_41m7jpc', 'template_tibf658', { user_email: email, name: email.split('@')[0], message: msg });
            await db.ref('msg_history/withdraw').push({ email, message: msg, time });
            db.ref('users').orderByChild('email').equalTo(email).once('value', snap => { snap.forEach(u => db.ref('users/'+u.key).update({ adminNotice: msg, noticeTime: time })); });
            
            db.ref(node+'/'+sid).update({
              status: status,   
              processedAt: Date.now(),
              processedTime: new Date().toLocaleString(),
              adminNote: userMsg   
           });
            logAdminAction('Withdrawal Processed', `User: ${email}, Status: ${status}, Amount: ${amount}`);
            alert("Processed! User notified via email.");
            closeJazzModal();
        } catch(err) { alert("Error: " + err.message); }
    }

    
    
    
    function toggleReplyView(type) {
        document.querySelectorAll('.reply-btn').forEach(b => b.classList.remove('active'));
        const btn = document.getElementById('btn-hist-'+type);
        if (btn) btn.classList.add('active');
        loadReplyHistory(type);
    }

        function loadReplyHistory(folder) {
             db.ref('msg_history/' + folder).once('value').then(snap => {
            const list = document.getElementById('reply-content-list');
            list.innerHTML = "";
            snap.forEach(child => {
                const h = child.val();
                list.innerHTML += `<div class="history-card"><div class="history-email">To: ${h.email || 'Unknown'}</div><div class="history-msg">${h.message}</div><span class="history-time">${h.time}</span></div>`;
            });
            if(list.innerHTML === "") list.innerHTML = "<p style='text-align:center;color:#444;'>No records</p>";
        });
    }

    
    
    
    function showFullScreenshot(src) {
        const modal = document.getElementById('screenshot-full');
        document.getElementById('full-screenshot-img').src = src;
        modal.style.display = 'flex';
    }

    function closeFullScreenshot() {
        document.getElementById('screenshot-full').style.display = 'none';
    }

    
    
    
    function checkTempBans() {
        const now = Date.now();
        db.ref('users').orderByChild('banStatus').equalTo('temp').once('value', snap => {
            snap.forEach(user => {
                if(user.val().banExpiry && user.val().banExpiry <= now) {
                    db.ref('users/'+user.key).update({ banStatus: 'none', banExpiry: null, isBanned: false });
                    db.ref('ban_history').push({
                        uid: user.key,
                        email: user.val().email || 'Unknown',
                        action: 'AUTO UNBAN',
                        reason: '24 hour ban expired',
                        time: new Date().toLocaleString(),
                        timestamp: Date.now()
                    });
                    logAdminAction('Auto Unban', `User: ${user.val().email || 'Unknown'}`);
                    loadBanUsersAndHistory();
                }
            });
        });
    }

    
    
    
    function loadBanUsersAndHistory() {
        loadBanUsersList();
        loadBanHistoryList();
    }

    function loadBanUsersList() {
        const list = document.getElementById('ban-users-list');
        list.innerHTML = "<p style='color:#888;'>Loading banned users...</p>";
        db.ref('users').orderByChild('banStatus').once('value', snap => {
            list.innerHTML = "";
            let found = false;
            snap.forEach(child => {
                const u = child.val();
                const uid = child.key;
                if (u.banStatus && u.banStatus !== 'none') {
                    found = true;
                    const isTemp = u.banStatus === 'temp';
                    const isPerm = u.banStatus === 'perm';
                    let label = isPerm ? '⛔ PERMANENT' : '⏳ TEMPORARY';
                    if (isTemp && u.banExpiry) {
                        const hoursLeft = Math.ceil((u.banExpiry - Date.now()) / (1000 * 60 * 60));
                        if (hoursLeft > 0) label += ` (${hoursLeft}h left)`;
                        else label += ' (Expired)';
                    }
                    const deviceName = formatDeviceName(u.deviceInfo);
                    const locationStr = formatLocation(u.location);
                    const banTime = u.banTime || u.time || 'N/A';
                    const card = document.createElement('div');
                    card.className = 'card banned-ui';
                    card.innerHTML = `
                        <div class="user-header">
                            <div class="name-box">
                                <b>${u.ownerNick || 'Unnamed User'}</b>
                                <span class="admin-nick">Alias: ${u.adminGivenNick || 'No Nickname'}</span>
                            </div>
                            <span class="status-tag" style="background:#500;">${label}</span>
                        </div>
                        <div class="info-row">
                            <div><b>Gmail</b>${u.email}</div>
                            <div><b>Reason</b>${u.adminMessage || 'No reason'}</div>
                            <div><b>Location</b>${locationStr}</div>
                            <div><b>Device</b>${deviceName}</div>
                            <div><b>Ban Time</b>${banTime}</div>
                            <div><b>Coins</b>⭐ ${u.coins || 0}</div>
                        </div>
                        <div class="btn-grid">
                            <button class="btn btn-unban" onclick="unbanUser('${uid}')"><i class="fa-solid fa-lock-open"></i> Unban</button>
                            <button class="btn btn-del" onclick="deleteFullAccount('${uid}', '${u.email}')"><i class="fa-solid fa-user-slash"></i> DELETE</button>
                        </div>`;
                    list.appendChild(card);
                }
            });
            if (!found) list.innerHTML = "<p style='color:#444;'>No banned users.</p>";
        });
    }

    function loadBanHistoryList() {
        const list = document.getElementById('ban-history-list');
        list.innerHTML = "<p style='color:#888;'>Loading ban history...</p>";
        db.ref('ban_history').orderByChild('timestamp').once('value', snap => {
            list.innerHTML = "";
            let found = false;
            snap.forEach(child => {
                found = true;
                const b = child.val();
                const isBan = b.action === 'PERMANENT BAN' || b.action === 'TEMPORARY BAN (24H)';
                const div = document.createElement('div');
                div.className = isBan ? 'ban-history-item' : 'unfreeze-history-item';
                div.innerHTML = `
                    <span style="color:${isBan ? 'var(--neon-red)' : 'var(--neon-green)'};">${b.action}</span> - ${b.email}<br>
                    Reason: ${b.reason || 'N/A'}<br><small>${b.time || ''}</small>
                `;
                list.appendChild(div);
            });
            if (!found) list.innerHTML = "<p style='color:#444;'>No ban history yet.</p>";
        });
    }

    
    
    
    function loadFreezeUsersAndHistory() {
        loadFreezeUsersList();
        loadFreezeHistoryList();
    }

    function loadFreezeUsersList() {
        const list = document.getElementById('freeze-users-list');
        list.innerHTML = "<p style='color:#888;'>Loading frozen users...</p>";
        db.ref('users').orderByChild('frozen').equalTo(true).once('value', snap => {
            list.innerHTML = "";
            let found = false;
            snap.forEach(child => {
                const u = child.val();
                const uid = child.key;
                if (u.frozen === true && (!u.banStatus || u.banStatus === 'none')) {
                    found = true;
                    const deviceName = formatDeviceName(u.deviceInfo);
                    const locationStr = formatLocation(u.location);
                    const freezeTime = u.freezeTime || u.time || 'N/A';
                    const card = document.createElement('div');
                    card.className = 'card frozen-ui';
                    card.innerHTML = `
                        <div class="user-header">
                            <div class="name-box">
                                <b>${u.ownerNick || 'Unnamed User'}</b>
                                <span class="admin-nick">Alias: ${u.adminGivenNick || 'No Nickname'}</span>
                            </div>
                            <span class="status-tag" style="background:#a50;">❄️ FROZEN</span>
                        </div>
                        <div class="info-row">
                            <div><b>Gmail</b>${u.email}</div>
                            <div><b>Reason</b>${u.freezeReason || 'No reason'}</div>
                            <div><b>Location</b>${locationStr}</div>
                            <div><b>Device</b>${deviceName}</div>
                            <div><b>Freeze Time</b>${freezeTime}</div>
                            <div><b>Coins</b>⭐ ${u.coins || 0}</div>
                        </div>
                        <div class="btn-grid">
                            <button class="btn btn-unfreeze" onclick="unfreezeUser('${uid}')"><i class="fa-solid fa-sun"></i> Unfreeze</button>
                            <button class="btn btn-del" onclick="deleteFullAccount('${uid}', '${u.email}')"><i class="fa-solid fa-user-slash"></i> DELETE</button>
                        </div>`;
                    list.appendChild(card);
                }
            });
            if (!found) list.innerHTML = "<p style='color:#444;'>No frozen users.</p>";
        });
    }

    function loadFreezeHistoryList() {
        const list = document.getElementById('freeze-history-list');
        list.innerHTML = "<p style='color:#888;'>Loading freeze history...</p>";
        db.ref('freeze_history').orderByChild('timestamp').once('value', snap => {
            list.innerHTML = "";
            let found = false;
            snap.forEach(child => {
                found = true;
                const f = child.val();
                const isFreeze = f.action === 'FROZEN';
                const div = document.createElement('div');
                div.className = isFreeze ? 'freeze-history-item' : 'unfreeze-history-item';
                div.innerHTML = `
                    <span style="color:${isFreeze ? 'var(--cheat)' : 'var(--neon-green)'};">${f.action}</span> - ${f.email}<br>
                    Reason: ${f.reason || 'N/A'}<br><small>${f.time || ''}</small>
                `;
                list.appendChild(div);
            });
            if (!found) list.innerHTML = "<p style='color:#444;'>No freeze history yet.</p>";
        });
    }

    
    
    
    function showEventEndPopup(data) {
        const popup = document.getElementById('event-end-popup');
        const messageEl = document.getElementById('event-end-message');
        const positionsList = document.getElementById('positions-list');
        
        if (!popup || !messageEl || !positionsList) return;
        
        messageEl.textContent = data.endMessage || '🏁 Event has ended! Thank you for participating.';
        
        let posHtml = '';
        if (data.positions && data.positions.length > 0) {
            data.positions.forEach(pos => {
                posHtml += `
                    <div class="position-list-item">
                        <span class="pos-num">#${pos.num}</span>
                        <span class="pos-user">${pos.name}</span>
                        <span style="color:var(--gold);font-size:11px;">${pos.reward}</span>
                    </div>
                `;
            });
        } else {
            posHtml = '<div class="position-list-item"><span class="pos-empty">No positions set</span></div>';
        }
        positionsList.innerHTML = posHtml;
        
        popup.style.display = 'flex';
    }

    
    
    
    function loadReferralTracking() {
        const container = document.getElementById('referral-tracking-list');
        container.innerHTML = "<p style='color:#888;'>Loading referral data...</p>";
        
        db.ref('users').once('value', usersSnap => {
            let html = '';
            let processed = 0;
            const users = [];
            
            usersSnap.forEach(userSnap => {
                users.push({ uid: userSnap.key, val: userSnap.val() });
            });
            
            if (users.length === 0) {
                container.innerHTML = "<p style='color:#444;'>No users found.</p>";
                return;
            }
            
            users.forEach(({ uid, val: user }) => {
                db.ref('referrals/' + uid).once('value', refSnap => {
                    let refCount = 0;
                    let refList = [];
                    let refEmails = [];
                    
                    refSnap.forEach(folder => {
                        if (folder.key !== 'claimed') {
                            folder.forEach(refChild => {
                                const ref = refChild.val();
                                refCount++;
                                refList.push(ref.email || 'Unknown');
                                if (ref.email) refEmails.push(ref.email);
                            });
                        }
                    });
                    
                    db.ref('vip_users/' + uid).once('value', vipSnap => {
                        const isVIP = vipSnap.val() === true;
                        const userVIP = user.vipExpiry || 0;
                        const isExpired = userVIP > 0 && userVIP <= Date.now();
                        const vipDisplay = isVIP && !isExpired ? '👑 VIP' : '';
                        const target = 5;
                        
                        if (refCount > 0) {
                            html += `
                                <div class="ref-track-card">
                                    <div>
                                        <span class="ref-user">${user.ownerNick || 'User'}</span>
                                        <span class="vip-email">${user.email}</span>
                                        <span class="ref-count">📊 ${refCount} referrals ${vipDisplay}</span>
                                        ${refCount >= target ? '<span style="color:var(--gold);font-size:10px;">✅ VIP Eligible</span>' : ''}
                                    </div>
                                    <div class="ref-list">
                                        ${refList.map((email, i) => `${i+1}. ${email}`).join(' | ')}
                                    </div>
                                    ${refEmails.length > 0 ? `
                                        <div style="margin-top:8px; font-size:10px; color:#555;">
                                            <b>Referred Users:</b> ${refEmails.join(', ')}
                                        </div>
                                    ` : ''}
                                </div>
                            `;
                        }
                        
                        processed++;
                        if (processed === users.length) {
                            container.innerHTML = html || "<p style='color:#444;'>No referrals found.</p>";
                        }
                    });
                });
            });
        });
    }

    
    
    
    function filterData() {
        let val = document.getElementById('global-search').value.toLowerCase();
        document.querySelectorAll('.card, .history-card, .reward-event, .cheat-alert, .unfreeze-history-item, .ss-request-item, .ss-history-item, .purchase-item, .ban-history-item, .freeze-history-item, .entry-request-card, .vip-card, .ref-track-card, .admin-log-item').forEach(c => {
            c.style.display = c.innerText.toLowerCase().includes(val) ? "block" : "none";
        });
    }

    
    
    
    function checkClickLimit() {
        const now = Date.now();
        clickHistory = clickHistory.filter(t => now - t < 3600000); 
        if (clickHistory.length >= 25) return false; 
        clickHistory.push(now);
        return true;
    }

    
    
    
    function logPlatformView(platform, url) {
        const user = auth.currentUser;
        if (!user) return;
        db.ref('platform_views/' + user.uid).push({
            platform: platform,
            url: url,
            viewTime: Date.now(),
            timeStr: new Date().toLocaleString(),
            deviceId: deviceId,
            fingerprint: fingerprint,
            location: userLocation
        });
    }

    
    
    
    document.getElementById('browser-frame')?.addEventListener('load', function() {
        try {
            const frame = this;
            const currentUrl = frame.contentWindow.location.href;
            document.getElementById('browser-url').textContent = currentUrl;
            
            const purchasePatterns = /order|checkout|payment|confirm|success|thankyou|receipt|invoice|bill|purchase|complete|done|paid/i;
            if (purchasePatterns.test(currentUrl)) {
                document.getElementById('purchase-detected-banner').style.display = 'block';
                
                setTimeout(() => {
                    if (confirm(`🎉 Purchase detected on ${currentPlatform}! Would you like to verify and claim coins?`)) {
                        showPurchaseVerificationModal(currentPlatform, auth.currentUser?.uid);
                    }
                }, 5000);
            }
        } catch(e) {}
    });

    
    
    
    function showSmartMessage(type, message, onOk) {
        const overlay = document.getElementById('smart-message-overlay');
        const typeLabel = document.getElementById('reward-type-label');
        const msgText = document.getElementById('reward-message-text');
        const okBtn = document.getElementById('reward-ok-btn');
        if(!overlay) return;
        typeLabel.innerText = type;
        msgText.innerText = message;
        overlay.style.display = 'flex';
        okBtn.onclick = () => { overlay.style.display = 'none'; if(onOk) onOk(); };
    }

    
    
    
    function updateStats() {
        db.ref('users').once('value', snap => document.getElementById('stat-total-users').innerText = snap.numChildren());
        db.ref('withdrawals').once('value', snap => document.getElementById('stat-pending-sales').innerText = snap.numChildren());
        db.ref('users').orderByChild('banStatus').equalTo('perm').once('value', snap => document.getElementById('stat-banned-users').innerText = snap.numChildren());
        db.ref('users').orderByChild('frozen').equalTo(true).once('value', snap => document.getElementById('stat-frozen-users').innerText = snap.numChildren());
    }

    function updatePendingSS() {
        db.ref('purchase_verifications').once('value', snap => {
            let pendingCount = 0;
            snap.forEach(userSnap => {
                userSnap.forEach(verifSnap => {
                    if (verifSnap.val().status === 'pending') pendingCount++;
                });
            });
            document.getElementById('stat-pending-ss').innerText = pendingCount;
        });
    }

    function loadData() {
        loadUsers();
        loadRequests();
        loadHistory();
        loadSales();
        loadBanUsersAndHistory();
        loadFreezeUsersAndHistory();
        toggleReplyView('withdraw');
    }

    

    
    
    
    function loadAdvancedRewards() {
        loadFolder1CoinsAndSources();
        loadFolder2Referrals();
        loadFolder3PurchasesAndSS();
        loadFolder4FreezeHistory();
        loadFolder5Cheats();
        loadFolder6SSHistory();
        loadFolder7EventEntries();
        loadFolder8Referrals();
    }

    function loadFolder1CoinsAndSources() {
        const container = document.getElementById('folder1-coins');
        container.innerHTML = "<p style='color:#888;'>Loading...</p>";
        db.ref('users').once('value', snap => {
            let html = "";
            let totalCoins = 0, userCount = 0;
            const userPromises = [];
            
            snap.forEach(child => {
                const user = child.val();
                const uid = child.key;
                const coins = user.coins || 0;
                totalCoins += coins;
                userCount++;
                
                const card = document.createElement('div');
                card.className = 'reward-event';
                const deviceName = formatDeviceName(user.deviceInfo);
                const locationStr = formatLocation(user.location);
                const isVIP = user.vipExpiry && user.vipExpiry > Date.now();
                card.innerHTML = `<div><span style="color:var(--neon-blue); font-weight:bold;">${user.email}</span> - Coins: <b>${coins}</b> ${user.frozen ? '<span class="freeze-badge">FROZEN</span>' : ''} ${isVIP ? '<span class="vip-badge">👑 VIP</span>' : ''}</div>
                    <div style="font-size:10px; color:#888; margin-top:5px;">📱 ${deviceName} | 📍 ${locationStr}</div>`;
                container.appendChild(card);
                
                const promise = db.ref('coin_earnings/' + uid).limitToLast(5).once('value').then(earnSnap => {
                    if (earnSnap.exists()) {
                        let earnHtml = '<div style="margin-left:15px; font-size:10px; color:#aaa;">';
                        earnSnap.forEach(e => { 
                            earnHtml += `• ${e.val().time || ''}: +${e.val().amount} (${e.val().reason || 'Unknown'})<br>`; 
                        });
                        earnHtml += '</div>';
                        card.innerHTML += earnHtml;
                    }
                });
                userPromises.push(promise);
            });
            
            Promise.all(userPromises).then(() => {
                const summary = document.createElement('div');
                summary.style.cssText = 'margin-bottom:15px; padding:10px; background:#1a1a1a; border-radius:10px;';
                summary.innerHTML = `📊 TOTAL: ${userCount} Users | ${totalCoins} Coins`;
                container.prepend(summary);
            });
        });
    }

    function loadFolder2Referrals() {
        const container = document.getElementById('folder2-referrals');
        container.innerHTML = "<p style='color:#888;'>Loading...</p>";
        db.ref('users').once('value', usersSnap => {
            const usersMap = {};
            usersSnap.forEach(u => usersMap[u.key] = u.val().email);
            
            db.ref('referrals').once('value', snap => {
                container.innerHTML = "";
                if (!snap.exists()) { 
                    container.innerHTML = "<p style='color:#444;'>No referrals yet.</p>"; 
                    return; 
                }
                
                let hasReferrals = false;
                snap.forEach(referrerSnap => {
                    const referrerEmail = usersMap[referrerSnap.key] || 'Unknown';
                    let displayReferrer = referrerEmail;
                    if (displayReferrer === 'Unknown') {
                        db.ref('users/' + referrerSnap.key).once('value', uSnap => {
                            if (uSnap.exists()) displayReferrer = uSnap.val().email || 'Unknown';
                        });
                    }
                    let referralsHtml = "", count = 0;
                    referrerSnap.forEach(folderSnap => {
                        if (folderSnap.key !== 'claimed') {
                            folderSnap.forEach(refSnap => {
                                const ref = refSnap.val();
                                count++;
                                hasReferrals = true;
                                const loc = formatLocation(ref.location);
                                const dev = formatDeviceName(ref.deviceInfo);
                                referralsHtml += `<div style="font-size:11px; margin-left:15px; border-left:2px solid var(--neon-blue); padding-left:8px; margin-bottom:8px;">
                                    <span style="color:var(--neon-green);">${ref.email || 'Unknown'}</span><br>
                                    📍 ${loc} | 📱 ${dev}<br>
                                    <small>${ref.time || ''}</small>
                                </div>`;
                            });
                        }
                    });
                    if (count > 0) {
                        const card = document.createElement('div');
                        card.className = 'reward-event';
                        card.innerHTML = `<div><span style="color:var(--neon-blue);">🔗 Referrer: <b>${displayReferrer}</b></span> - ${count} referrals</div>${referralsHtml}`;
                        container.appendChild(card);
                    }
                });
                if (!hasReferrals) container.innerHTML = "<p style='color:#444;'>No referrals yet.</p>";
            });
        });
    }

    function loadFolder3PurchasesAndSS() {
        const container = document.getElementById('folder3-purchases');
        container.innerHTML = "<p style='color:#888;'>Loading purchases and screenshot requests...</p>";
        let activityHtml = "";
        
        db.ref('purchases').once('value', snap => {
            if (snap.exists()) {
                activityHtml += '<h4 style="color:var(--purple);">💰 Purchase History</h4>';
                snap.forEach(userSnap => {
                    userSnap.forEach(p => {
                        const pur = p.val();
                        if (pur.platform && pur.amount) {
                            const deviceName = formatDeviceName(pur.deviceInfo);
                            const locationStr = formatLocation(pur.location);
                            activityHtml += `<div class="purchase-item">
                                <div><span style="color:var(--neon-blue);">${pur.userEmail || 'Unknown'}</span></div>
                                <div>🎬 ${pur.platform} | Rs. ${pur.amount} (+${pur.coinsEarned || 0} coins)</div>
                                <div>📱 ${deviceName}</div>
                                <div>📍 ${locationStr}</div>
                                <div>🕐 ${pur.time || ''}</div>
                            </div>`;
                        }
                    });
                });
            }
            
            db.ref('purchase_verifications').once('value', ssSnap => {
                if (ssSnap.exists()) {
                    activityHtml += '<h4 style="color:var(--folder3); margin-top:15px;">📸 Pending Screenshot Requests</h4>';
                    ssSnap.forEach(userSnap => {
                        userSnap.forEach(verifSnap => {
                            const v = verifSnap.val();
                            if (v.status === 'pending') {
                                const deviceName = formatDeviceName(v.deviceInfo);
                                const locationStr = formatLocation(v.location);
                                const screenshotHtml = v.screenshot ? `<img src="${v.screenshot}" class="ss-thumbnail" onclick="showFullScreenshot('${v.screenshot}')" title="Click to view full screenshot">` : '<span style="color:red;">No screenshot uploaded</span>';
                                let verdictHtml = '<span class="verdict-badge verdict-unknown">⚠️ Pending Review</span>';
                                if (v.exifVerified === true) verdictHtml = '<span class="verdict-badge verdict-real">✅ EXIF Verified</span>';
                                if (v.hashCheck === false) verdictHtml = '<span class="verdict-badge verdict-fake">❌ Duplicate Detected</span>';
                                activityHtml += `<div class="ss-request-item pending">
                                    <div><span style="color:var(--neon-blue);">${v.userEmail}</span> ${verdictHtml}</div>
                                    <div>🎬 ${v.platform} | Rs. ${v.amount} (${Math.floor(v.amount/100)*10} coins)</div>
                                    <div>📱 ${deviceName}</div>
                                    <div>📍 ${locationStr}</div>
                                    <div>🕒 Order: ${v.orderTimeStr} | Submitted: ${v.submitTimeStr}</div>
                                    ${screenshotHtml}
                                    <div style="margin-top:10px;">
                                        <button class="btn btn-tick" style="width:auto; padding:5px 10px; display:inline-block; margin-right:5px;" onclick="approveSS('${verifSnap.key}', '${userSnap.key}', ${v.amount}, '${v.userEmail}')">✅ APPROVE</button>
                                        <button class="btn btn-cross" style="width:auto; padding:5px 10px; display:inline-block;" onclick="rejectSS('${verifSnap.key}', '${userSnap.key}', '${v.userEmail}')">❌ REJECT</button>
                                    </div>
                                </div>`;
                            }
                        });
                    });
                }
                container.innerHTML = activityHtml || "<p style='color:#444;'>No purchases or pending screenshot requests.</p>";
            });
        });
    }

    function loadFolder4FreezeHistory() {
        const container = document.getElementById('folder4-freeze-history');
        container.innerHTML = "<p style='color:#888;'>Loading freeze/unfreeze history...</p>";
        db.ref('freeze_history').orderByChild('timestamp').once('value', snap => {
            let html = "";
            snap.forEach(child => {
                const f = child.val();
                const isFreeze = f.action === 'FROZEN';
                html += `<div class="${isFreeze ? 'freeze-history-item' : 'unfreeze-history-item'}">
                    <span style="color:${isFreeze ? 'var(--cheat)' : 'var(--neon-green)'};">${f.action}</span> - ${f.email}<br>
                    Reason: ${f.reason || 'N/A'}<br><small>${f.time || ''}</small>
                </div>`;
            });
            container.innerHTML = html || "<p style='color:#444;'>No freeze/unfreeze history yet.</p>";
        });
    }

    function loadFolder5Cheats() {
        const container = document.getElementById('folder5-cheats');
        container.innerHTML = "<p style='color:#888;'>Checking frozen accounts...</p>";
        db.ref('users').orderByChild('frozen').equalTo(true).once('value', snap => {
            container.innerHTML = "";
            if (!snap.exists()) { 
                container.innerHTML = "<p style='color:#444;'>No frozen accounts.</p>"; 
                return; 
            }
            snap.forEach(child => {
                const user = child.val();
                const deviceName = formatDeviceName(user.deviceInfo);
                const locationStr = formatLocation(user.location);
                container.innerHTML += `<div class="reward-event cheat-alert">
                    <span style="color:var(--neon-red);">❄️ FROZEN</span> - ${user.email}<br>
                    Reason: ${user.freezeReason || 'Unknown'}<br>
                    📱 ${deviceName} | 📍 ${locationStr}<br>
                    <small>${user.freezeTimeStr || ''}</small>
                    <div style="margin-top:8px;">
                        <button class="btn btn-unban" style="width:auto; padding:5px 10px;" onclick="unfreezeUser('${child.key}')">UNFREEZE</button>
                    </div>
                </div>`;
            });
        });
    }

   function loadFolder6SSHistory() {
    const container = document.getElementById('folder6-ss-history');
    if (!container) {
        console.error('❌ folder6-ss-history element not found!');
        return;
    }
    container.innerHTML = "<p style='color:#888;'>Loading SS history...</p>";

    
    db.ref('ss_history').orderByChild('timestamp').once('value').then(snap => {
        let html = '';
        let found = false;
        console.log('📊 ss_history snap exists?', snap.exists());
        console.log('📊 Total entries:', snap.numChildren());

        snap.forEach(child => {
            const h = child.val();
            found = true;
            console.log('📄 Entry:', h);

            const statusColor = h.status === 'approved' ? 'var(--neon-green)' : 'var(--neon-red)';
            const statusText = h.status === 'approved' ? '✅ Approved' : '❌ Rejected';
            
            
            let screenshotHtml = '';
            if (h.screenshot && h.screenshot.startsWith('data:image')) {
                screenshotHtml = `<img src="${h.screenshot}" class="ss-thumbnail" style="max-width:80px; max-height:80px; border-radius:8px; cursor:pointer; margin-top:5px;" onclick="showFullScreenshot('${h.screenshot}')">`;
            } else {
                screenshotHtml = '<span style="color:#555;font-size:10px;">No screenshot</span>';
            }

            html += `
                <div class="ss-history-item" style="border-left:4px solid ${statusColor}; background:#11151f; padding:12px; margin:8px 0; border-radius:10px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:5px;">
                        <span style="color:var(--neon-blue); font-weight:bold;">${h.userEmail || 'Unknown'}</span>
                        <span style="color:${statusColor}; font-weight:bold;">${statusText}</span>
                    </div>
                    <div style="font-size:12px; color:#aaa; margin:5px 0;">
                        🎬 ${h.platform || 'Unknown'} | 💰 Rs. ${h.amount || 0}
                        ${h.coinsGiven ? `| 🪙 +${h.coinsGiven} coins` : ''}
                        ${h.rejectionReason ? `| 📝 ${h.rejectionReason}` : ''}
                    </div>
                    <div style="font-size:10px; color:#555;">
                        👤 ${h.userNickname || 'User'} | 🕐 ${h.approvedTime || h.rejectedTime || h.time || 'Unknown'}
                    </div>
                    ${screenshotHtml}
                </div>
            `;
        });

        container.innerHTML = found ? html : "<p style='color:#444;'>No SS history found yet.</p>";
    }).catch(err => {
        console.error('❌ SS History load error:', err);
        container.innerHTML = "<p style='color:#555;'>Error loading history. Check console for details.</p>";
    });
}
    function loadFolder7EventEntries() {
        const container = document.getElementById('folder7-event-entries');
        if (!container) return;
        container.innerHTML = "<p style='color:#888;'>Loading event entries...</p>";
        
        db.ref('app_control/event/title').once('value', titleSnap => {
            const currentEventName = titleSnap.val() || 'Event';
            
            db.ref('event_entries').once('value', snap => {
                let html = '';
                let found = false;
                let allEntries = [];
                
                snap.forEach(child => {
                    const eventName = child.key;
                    const entries = child.val();
                    Object.keys(entries).forEach(uid => {
                        allEntries.push({
                            eventName: eventName,
                            uid: uid,
                            data: entries[uid]
                        });
                    });
                });
                
                allEntries.sort((a, b) => (b.data.timestamp || 0) - (a.data.timestamp || 0));
                
                const grouped = {};
                allEntries.forEach(entry => {
                    if (!grouped[entry.eventName]) grouped[entry.eventName] = [];
                    grouped[entry.eventName].push(entry);
                });
                
                const eventNames = Object.keys(grouped);
                eventNames.sort((a, b) => {
                    if (a === currentEventName) return -1;
                    if (b === currentEventName) return 1;
                    return 0;
                });
                
                eventNames.forEach(eventName => {
                    const entries = grouped[eventName];
                    const isLive = eventName === currentEventName;
                    
                    html += `
                        <div style="background:#1a1a1a; border:2px solid ${isLive ? 'var(--neon-green)' : 'var(--gold)'}; border-radius:15px; padding:15px; margin-bottom:15px;">
                            <h4 style="color:${isLive ? 'var(--neon-green)' : 'var(--gold)'}; margin:0 0 10px 0;">
                                ${isLive ? '🔴 LIVE - ' : '🎯 '} ${eventName}
                                <span style="font-size:11px; color:#888; margin-left:10px;">Total Entries: ${entries.length}</span>
                            </h4>
                    `;
                    
                    entries.forEach(entry => {
                        const req = entry.data;
                        const uid = entry.uid;
                        const statusClass = req.status || 'approved';
                        const statusText = statusClass === 'approved' ? '✅ Approved' : statusClass === 'rejected' ? '❌ Rejected' : '⏳ Pending';
                        const statusColor = statusClass === 'approved' ? 'var(--neon-green)' : statusClass === 'rejected' ? 'var(--neon-red)' : 'orange';
                        
                        const userName = req.userName || req.email || 'Unknown';
                        const userEmail = req.email || 'Unknown';
                        
                        html += `
                            <div class="entry-request-card" style="border-left-color: ${statusColor};">
                                <div style="display:flex; justify-content:space-between; align-items:center;">
                                    <div>
                                        <span class="req-user">${userName}</span>
                                        <span class="req-email">${userEmail}</span>
                                    </div>
                                    <span class="req-status" style="background:${statusColor === 'var(--neon-green)' ? '#050' : statusColor === 'var(--neon-red)' ? '#500' : '#553'}; color:${statusColor === 'var(--neon-green)' ? 'var(--neon-green)' : statusColor === 'var(--neon-red)' ? 'var(--neon-red)' : '#ffaa00'}; padding:2px 10px; border-radius:12px; font-size:10px; font-weight:bold;">${statusText}</span>
                                </div>
                                <div style="margin-top:8px; font-size:12px; color:#aaa;">
                                    ${req.feeType ? `<span style="color:var(--neon-blue);">💳 ${req.feeType}</span>` : ''}
                                    ${req.feeAmount ? `<span style="color:var(--neon-green);margin-left:10px;">💰 ${req.feeAmount}</span>` : ''}
                                    ${req.isVIP ? `<span style="color:var(--gold);margin-left:10px;">👑 VIP</span>` : ''}
                                </div>
                                <div style="font-size:10px; color:#555; margin-top:5px;">${req.time || ''}</div>
                                ${statusClass === 'pending' ? `
                                    <div style="margin-top:10px; display:flex; gap:8px;">
                                        <button class="btn btn-tick" style="padding:5px 15px; font-size:10px; pointer-events:auto !important; cursor:pointer !important;" onclick="approveEventEntry('${eventName}', '${uid}')">✅ Approve</button>
                                        <button class="btn btn-cross" style="padding:5px 15px; font-size:10px; pointer-events:auto !important; cursor:pointer !important;" onclick="rejectEventEntry('${eventName}', '${uid}')">❌ Reject</button>
                                    </div>
                                ` : ''}
                            </div>
                        `;
                    });
                    
                    html += `</div>`;
                    found = true;
                });
                
                container.innerHTML = found ? html : "<p style='color:#444;'>No event entries found.</p>";
            });
        });
    }

    function loadFolder8Referrals() {
        const container = document.getElementById('folder8-referrals');
        if (!container) return;
        container.innerHTML = "<p style='color:#888;'>Loading referral details...</p>";
        
        db.ref('users').once('value', usersSnap => {
            const usersMap = {};
            usersSnap.forEach(u => usersMap[u.key] = u.val().email);
            
            db.ref('referrals').once('value', snap => {
                container.innerHTML = "";
                if (!snap.exists()) { 
                    container.innerHTML = "<p style='color:#444;'>No referrals yet.</p>"; 
                    return; 
                }
                
                let hasReferrals = false;
                snap.forEach(referrerSnap => {
                    let referrerEmail = usersMap[referrerSnap.key] || 'Unknown';
                    if (referrerEmail === 'Unknown') {
                        db.ref('users/' + referrerSnap.key).once('value', uSnap => {
                            if (uSnap.exists()) referrerEmail = uSnap.val().email || 'Unknown';
                        });
                    }
                    
                    let referralsHtml = "", count = 0;
                    
                    referrerSnap.forEach(folderSnap => {
                        if (folderSnap.key !== 'claimed') {
                            folderSnap.forEach(refSnap => {
                                const ref = refSnap.val();
                                count++;
                                hasReferrals = true;
                                const loc = formatLocation(ref.location);
                                const dev = formatDeviceName(ref.deviceInfo);
                                const refEmail = ref.email || 'Unknown';
                                
                                referralsHtml += `<div class="ref-sub-list">
                                    <span style="color:var(--neon-green);">${refEmail}</span>
                                    <span style="color:#555; font-size:10px;"> | 📍 ${loc} | 📱 ${dev}</span>
                                    <span style="color:#666; font-size:9px; display:block;">${ref.time || ''}</span>
                                </div>`;
                            });
                        }
                    });
                    
                    if (count > 0) {
                        const card = document.createElement('div');
                        card.className = 'ref-track-card';
                        card.innerHTML = `
                            <div>
                                <span class="ref-user">🔗 ${referrerEmail}</span>
                                <span class="ref-count">📊 ${count} direct referrals</span>
                            </div>
                            <div class="ref-list">
                                ${referralsHtml}
                            </div>
                        `;
                        container.appendChild(card);
                    }
                });
                if (!hasReferrals) container.innerHTML = "<p style='color:#444;'>No referrals yet.</p>";
            });
        });
    }

     
          
    
      function openHelp() {
          
         if (document.getElementById('hamburger-menu').classList.contains('open')) {
            document.getElementById('hamburger-menu').classList.remove('open');
            document.getElementById('hamburger-overlay').classList.remove('active');
              menuOpen = false;
          }
    
    
    var helpContainer = document.getElementById('help-container');
    if (helpContainer) {
        helpContainer.style.display = 'flex';
        helpContainer.style.position = 'fixed';
        helpContainer.style.inset = '0';
        helpContainer.style.width = '100%';
        helpContainer.style.height = '100vh';
        helpContainer.style.background = 'rgba(8, 8, 20, 0.96)';
        helpContainer.style.backdropFilter = 'blur(30px)';
        helpContainer.style.WebkitBackdropFilter = 'blur(30px)';
        helpContainer.style.zIndex = '9999';
        helpContainer.style.alignItems = 'center';
        helpContainer.style.justifyContent = 'center';
        helpContainer.style.flexDirection = 'column';
        helpContainer.style.padding = '20px';
        helpContainer.style.boxSizing = 'border-box';
        helpContainer.style.overflow = 'hidden';
        helpContainer.classList.add('active');
     }
    
    
    var loginBox = document.getElementById('login-box');
    if (loginBox) {
        loginBox.style.display = 'none';
     }
    
        
         var user = auth.currentUser;
          var backBtn = document.getElementById('back-btn-text');
         if (backBtn) {
                 backBtn.textContent = user ? 'BACK TO MEMBER AREA' : 'BACK TO LOGIN';
         }
      }







 function showAdModal(onSuccess, actionType, uid) {
    let modal = document.getElementById('ad-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'ad-modal';
        modal.style.cssText = `
            position: fixed; top:0; left:0; width:100%; height:100%;
            background: radial-gradient(circle at center, rgba(0,0,0,0.92), rgba(0,0,0,0.98));
            z-index: 999999; display: flex; align-items: center; justify-content: center;
            backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
        `;
        modal.innerHTML = `
            <div style="background: linear-gradient(145deg, rgba(20,20,40,0.95), rgba(10,10,20,0.98)); border: 2px solid rgba(0,240,255,0.08); border-radius: 28px; padding: 40px 35px; max-width: 380px; width: 90%; text-align: center; box-shadow: 0 0 80px rgba(0,240,255,0.02); position: relative; overflow: hidden;">
                <div style="position: absolute; inset: -2px; border-radius: 28px; padding: 2px; background: conic-gradient(from 0deg, #00f0ff, #ff2d95, #b400ff, #00f0ff); -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor; mask-composite: exclude; animation: borderSpin 6s linear infinite; pointer-events: none;"></div>
                <div style="font-size: 48px; margin-bottom: 10px;">📺</div>
                <h3 style="color: #ffd700; font-family: 'Orbitron', sans-serif; font-size: 18px; letter-spacing: 3px; margin: 0 0 5px 0;">ADVERTISEMENT</h3>
                <p style="color: #888; font-size: 12px; margin: 5px 0 20px 0;">Please watch this 10-second ad to continue</p>
                <div style="font-size: 72px; font-weight: 900; font-family: 'Orbitron', monospace; background: linear-gradient(135deg, #00f0ff, #b400ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; line-height: 1.2; padding: 10px 0;" id="ad-countdown-number">10</div>
                <div style="width: 100%; height: 4px; background: rgba(255,255,255,0.04); border-radius: 10px; overflow: hidden; margin: 15px 0 20px 0;">
                    <div id="ad-progress-bar" style="width: 100%; height: 100%; background: linear-gradient(90deg, #00f0ff, #b400ff); border-radius: 10px; transition: width 0.1s linear;"></div>
                </div>
                <p style="color: #444; font-size: 10px; margin: 0;">⚡ Do not switch tabs or minimize</p>
            </div>
        `;
        document.body.appendChild(modal);
    } else {
        modal.style.display = 'flex';
    }

    let countdown = 10;
    const numberEl = document.getElementById('ad-countdown-number') || modal.querySelector('#ad-countdown-number');
    const progressBar = document.getElementById('ad-progress-bar') || modal.querySelector('#ad-progress-bar');

    
    const blurHandler = () => {
        if (modal.style.display !== 'none') {
            clearInterval(intervalId);
            modal.style.display = 'none';
            incrementAdWarning(uid, 'Ad skipped by switching tabs/app');
            alert('⏳ Ad skipped! Please do not switch tabs during ad.');
        }
    };
    window.addEventListener('blur', blurHandler, { once: true });

   const intervalId = setInterval(() => {
        countdown--;
        if (numberEl) numberEl.innerText = countdown; 
        if (progressBar) progressBar.style.width = (countdown / 10 * 100) + '%';
        if (countdown <= 0) {
            clearInterval(intervalId);
            window.removeEventListener('blur', blurHandler);
            modal.style.display = 'none';
            onSuccess();
        }
    }, 1000);
}


   function renderSupportRequests() {
    
    console.log("Support requests placeholder");
  }

    
    
    
    setInterval(checkEventTimer, 1000);
    setInterval(checkComingSoonTimer, 1000);
    
    
    
    
    
    setInterval(autoVIPCheck, 60000);

(function() {
            const googleB64 = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48' width='20px' height='20px'%3E%3Cpath fill='%23FFC107' d='M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z'/%3E%3Cpath fill='%23e53935' d='M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z'/%3E%3Cpath fill='%234caf50' d='M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z'/%3E%3Cpath fill='%231565c0' d='M43.611,20.083L43.595,20L24,20v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C40.483,35.58,44,30.2,44,24C44,22.659,43.862,21.35,43.611,20.083z'/%3E%3C/svg%3E";
            function injectGSticker() {
                const gBtn = document.querySelector('.btn-google');
                if (gBtn && !gBtn.querySelector('.g-sticker')) {
                    const img = document.createElement('img');
                    img.src = googleB64; img.className = "g-sticker"; gBtn.prepend(img);
                }
            }
            const observer = new MutationObserver(() => injectGSticker());
            observer.observe(document.body, { childList: true, subtree: true });
            window.addEventListener('load', injectGSticker);
        })();

        let deferredPrompt2;
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt2 = e;
            document.getElementById('pwa-install-banner').style.display = 'flex';
        });

        document.getElementById('pwa-install-btn').addEventListener('click', async () => {
            if (deferredPrompt2) {
                deferredPrompt2.prompt();
                const { outcome } = await deferredPrompt2.userChoice;
                if (outcome === 'accepted') {
                    alert('🎉 App installed successfully!');
                }
                deferredPrompt2 = null;
            } else {
                alert('📱 To install:\n\nChrome: Menu → "Add to Home screen"\nSafari: Share → "Add to Home screen"');
            }
        });

        window.addEventListener('appinstalled', () => { 
            alert('🎉 App Installed!');
            deferredPrompt2 = null;
        });

        if (window.matchMedia('(display-mode: standalone)').matches) {
            document.getElementById('pwa-install-banner').style.display = 'none';
            const portalDownloadBtn = document.getElementById('portal-download-btn');
            if (portalDownloadBtn) portalDownloadBtn.style.display = 'none';
        }