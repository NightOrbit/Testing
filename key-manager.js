/* ═══════════════════════════════════════════════════════════
   key-manager.js — v22 POLYMORPHIC HASH-ENCRYPTED HEAVY
   NightOrbit CodeForge

   UPGRADE FROM V21 → V22:
   ✅ ADDED: UID Hashing (SHA-256) — no plain UID
   ✅ ADDED: hashUID() / hashUIDWithSalt() / generateUIDHash()
   ✅ ADDED: File name buried in function chain
   ✅ ADDED: _generateFileFunctions() — 6-layer chain
   ✅ ADDED: Firebase path: uidHashes/{hash}
   ✅ ADDED: AES-256-CBC Key 1 (password-derived)
   ✅ ADDED: Multi-layer secret obfuscation (6 layers)
   ✅ ADDED: Multi-layer file name obfuscation (5 layers)
   ✅ PRESERVED: All v20 functions (NO REMOVAL)
   ✅ PRESERVED: Polymorphic engine
   ✅ PRESERVED: Rate limiting
   ✅ PRESERVED: Audit logging
   ✅ PRESERVED: Server-side ready

   DATA STORAGE (Firebase):
   uidHashes/{uidHash}/
   ├── passwordHash     → PBKDF2(password, salt) 600K
   ├── salt             → 256-bit random
   ├── keyVersion       → 22
   ├── rateLimit/       → attempts, lockedUntil
   └── telemetry/       → heartbeats

   SECURITY LAYERS:
   - Layer 1: UID Hash (SHA-256, no plain UID)
   - Layer 2: AES-256-CBC encrypted Key 1
   - Layer 3: Multi-layer secret obfuscation (6)
   - Layer 4: Multi-layer file name obfuscation (5)
   - Layer 5: File name in function chain
   - Layer 6: Polymorphic route engine
   - Layer 7: Auto-wipe (unload + hidden)
   ═══════════════════════════════════════════════════════════ */

(function() {
'use strict';

var KEY_MANAGER = {
    /* ═══ CONFIG ═══ */
    _PREFIX: 'NightOrbitGyidi_houperSecret_',
    _FILE_PREFIX: 'NightOrbitGyidi_public_key_',
    _UID_PREFIX: 'NIGHT_UID_HASH_',
    _PBKDF2_ITER: 600000,
    _AES_KEY_ITER: 100000,
    _PASSWORD_MIN: 16,
    _PASSWORD_MAX: 64,
    _KEY_VERSION: 22,
    _MAX_ATTEMPTS: 5,
    _LOCKOUT_DURATION: 15 * 60 * 1000,
    _MAX_HISTORY: 50,
    _FILE_KEY_LENGTH: 60,
    _ROUTE_TTL: 30000,
    _ROUTE_ROTATE_INTERVAL: 30000,

    /* ═══ STATE ═══ */
    _key: null,
    _encryptedKey: null,
    _displayKey: null,
    _email: null,
    _userId: null,
    _uidHash: null,
    _initialized: false,
    _hasPassword: false,
    _userSalt: null,
    _deviceFingerprint: null,
    _cachedAuthToken: null,
    _authTokenExpiry: 0,

    _ephemeralRoute: null,
    _routeRotationTimer: null,
    _wipeHandlersInstalled: false,
    _routeStats: {
        totalRoutes: 0,
        lastRouteAt: null,
        wipeCount: 0
    },

    /* ═══════════════════════════════════════════════════════
       SAFE FIREBASE GUARD
       ═══════════════════════════════════════════════════════ */
    _safeFirebase: function() {
        if (typeof firebase === 'undefined' || !firebase.database) {
            throw new Error('Firebase not available');
        }
        return firebase.database();
    },

    /* ═══════════════════════════════════════════════════════
       SECURE RANDOM
       ═══════════════════════════════════════════════════════ */
    _secureRandomBytes: function(length) {
        var arr = new Uint8Array(length);
        if (window.crypto && window.crypto.getRandomValues) {
            window.crypto.getRandomValues(arr);
        } else {
            throw new Error('Secure random not available');
        }
        return arr;
    },

    _secureRandomInt: function(max) {
        if (max <= 0) return 0;
        var bytes = this._secureRandomBytes(4);
        var num = ((bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3]) >>> 0;
        return num % max;
    },

    _secureShuffle: function(array) {
        for (var i = array.length - 1; i > 0; i--) {
            var j = this._secureRandomInt(i + 1);
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
    },

    _bytesToHex: function(bytes) {
        return Array.prototype.map.call(bytes, function(b) {
            return ('0' + b.toString(16)).slice(-2);
        }).join('');
    },

    /* ═══════════════════════════════════════════════════════
       ✅ v22 NEW: UID HASHING (SHA-256)
       Plain UID kabhi Firebase mein nahi jaata
       ═══════════════════════════════════════════════════════ */
    
    hashUID: function(uid) {
        if (!uid) return null;
        try {
            return CryptoJS.SHA256(uid + this._UID_PREFIX).toString();
        } catch (e) {
            return null;
        }
    },

    hashUIDWithSalt: function(uid, salt) {
        if (!uid || !salt) return null;
        try {
            return CryptoJS.SHA256(uid + this._UID_PREFIX + salt).toString();
        } catch (e) {
            return null;
        }
    },

    generateUIDHash: function(uid) {
        return this.hashUID(uid);
    },

    /* ═══════════════════════════════════════════════════════
       ✅ v22 NEW: FILE NAME IN FUNCTION CHAIN (6-layer)
       File name ko function chain mein bury karo
       ═══════════════════════════════════════════════════════ */
    
    _generateFileFunctions: function(fileName) {
        var chars = fileName.split('');
        var chain = [];
        var xorKey = this._secureRandomInt(251) + 1;
        
        /* Layer 1: XOR each character */
        for (var i = 0; i < chars.length; i++) {
            chain.push(chars[i].charCodeAt(0) ^ xorKey);
        }
        
        /* Layer 2: Convert to base64 */
        var bin = '';
        for (var j = 0; j < chain.length; j++) {
            bin += String.fromCharCode(chain[j]);
        }
        var b64 = btoa(bin);
        
        /* Layer 3: Reverse */
        var reversed = b64.split('').reverse().join('');
        
        /* Layer 4: Split into chunks */
        var chunks = [];
        var chunkSize = 4;
        for (var k = 0; k < reversed.length; k += chunkSize) {
            chunks.push(reversed.substring(k, k + chunkSize));
        }
        
        /* Layer 5: Generate function names */
        var funcNames = [];
        for (var m = 0; m < chunks.length; m++) {
            funcNames.push('_f' + m + '_' + this._secureRandomInt(9999));
        }
        
        /* Layer 6: Build function chain code */
        var code = '';
        code += 'var _fn = function() { return [';
        for (var n = 0; n < chunks.length; n++) {
            code += '"' + chunks[n] + '"';
            if (n < chunks.length - 1) code += ',';
        }
        code += '].join(""); };\n';
        code += 'var _fn2 = function(s) { return s.split("").reverse().join(""); };\n';
        code += 'var _fn3 = function(s) { return atob(s); };\n';
        code += 'var _fn4 = function(s) { var r = ""; for (var i = 0; i < s.length; i++) r += String.fromCharCode(s.charCodeAt(i) ^ ' + xorKey + '); return r; };\n';
        code += 'window._0xFNAME = _fn4(_fn3(_fn2(_fn())));\n';
        
        return {
            code: code,
            xorKey: xorKey,
            funcNames: funcNames,
            encoded: b64
        };
    },

    /* ═══════════════════════════════════════════════════════
       ✅ v22 NEW: FILE NAME OBFUSCATION (5-layer)
       ═══════════════════════════════════════════════════════ */
    
    generateKeyFileName: function() {
        var chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        var name = 'nx_';
        var i;
        for (i = 0; i < 8; i++) name += chars.charAt(this._secureRandomInt(chars.length));
        name += '_';
        for (i = 0; i < 12; i++) name += chars.charAt(this._secureRandomInt(chars.length));
        name += '_';
        for (i = 0; i < 8; i++) name += chars.charAt(this._secureRandomInt(chars.length));
        name += '.js';
        return name;
    },

    obfuscateFileName: function(fileName) {
        /* Layer 1: XOR with random salt */
        var salt1 = this._secureRandomInt(251) + 1;
        var layer1 = '';
        for (var i = 0; i < fileName.length; i++) {
            layer1 += String.fromCharCode(fileName.charCodeAt(i) ^ salt1);
        }
        
        /* Layer 2: Base64 */
        var layer2 = btoa(layer1);
        
        /* Layer 3: Reverse */
        var layer3 = layer2.split('').reverse().join('');
        
        /* Layer 4: XOR with another salt */
        var salt2 = this._secureRandomInt(251) + 1;
        var layer4 = '';
        for (var j = 0; j < layer3.length; j++) {
            layer4 += String.fromCharCode((layer3.charCodeAt(j) ^ salt2) ^ (j % 251));
        }
        
        /* Layer 5: Base64 */
        var layer5 = btoa(layer4);
        
        return {
            data: layer5,
            salt1: salt1,
            salt2: salt2
        };
    },

    deobfuscateFileName: function(obf, salt1, salt2) {
        try {
            var layer4 = atob(obf);
            var layer3 = '';
            for (var j = 0; j < layer4.length; j++) {
                layer3 += String.fromCharCode((layer4.charCodeAt(j) ^ salt2) ^ (j % 251));
            }
            var layer2 = layer3.split('').reverse().join('');
            var layer1 = atob(layer2);
            var fileName = '';
            for (var i = 0; i < layer1.length; i++) {
                fileName += String.fromCharCode(layer1.charCodeAt(i) ^ salt1);
            }
            return fileName;
        } catch (e) {
            return null;
        }
    },

    /* ═══════════════════════════════════════════════════════
       ✅ v22 NEW: SECRET OBFUSCATION (6-layer)
       ═══════════════════════════════════════════════════════ */
    
    obfuscateSecret: function(secret) {
        var salt1 = this._secureRandomInt(251) + 1;
        var layer1 = '';
        for (var i = 0; i < secret.length; i++) {
            layer1 += String.fromCharCode(secret.charCodeAt(i) ^ salt1);
        }
        
        var layer2 = layer1.split('').reverse().join('');
        
        var salt2 = this._secureRandomInt(251) + 1;
        var layer3 = '';
        for (var j = 0; j < layer2.length; j++) {
            layer3 += String.fromCharCode((layer2.charCodeAt(j) ^ salt2) ^ (j % 251));
        }
        
        var layer4 = btoa(layer3);
        
        var salt3 = this._secureRandomInt(251) + 1;
        var layer5 = '';
        for (var k = 0; k < layer4.length; k++) {
            layer5 += String.fromCharCode((layer4.charCodeAt(k) ^ salt3) ^ (k % 127));
        }
        
        var layer6 = btoa(layer5);
        
        return {
            data: layer6,
            salts: [salt1, salt2, salt3]
        };
    },

    deobfuscateSecret: function(obf, salts) {
        try {
            var salt1 = salts[0], salt2 = salts[1], salt3 = salts[2];
            var layer5 = atob(obf);
            var layer4 = '';
            for (var k = 0; k < layer5.length; k++) {
                layer4 += String.fromCharCode((layer5.charCodeAt(k) ^ salt3) ^ (k % 127));
            }
            var layer3 = atob(layer4);
            var layer2 = '';
            for (var j = 0; j < layer3.length; j++) {
                layer2 += String.fromCharCode((layer3.charCodeAt(j) ^ salt2) ^ (j % 251));
            }
            var layer1 = layer2.split('').reverse().join('');
            var secret = '';
            for (var i = 0; i < layer1.length; i++) {
                secret += String.fromCharCode(layer1.charCodeAt(i) ^ salt1);
            }
            return secret;
        } catch (e) {
            return null;
        }
    },

    /* ═══════════════════════════════════════════════════════
       ✅ v22 NEW: AES-256-CBC ENCRYPTED KEY 1
       ═══════════════════════════════════════════════════════ */
    
    _deriveSecretFromPassword: function(password, salt) {
        return CryptoJS.PBKDF2(password, salt, {
            keySize: 256 / 32,
            iterations: this._PBKDF2_ITER,
            hasher: CryptoJS.algo.SHA256
        }).toString();
    },

    encryptKey1WithPassword: function(key1, password, salt) {
        try {
            var secret = this._deriveSecretFromPassword(password, salt);
            var iv = CryptoJS.lib.WordArray.random(16);
            
            var encrypted = CryptoJS.AES.encrypt(key1, secret, {
                iv: iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            });
            
            var hmac = CryptoJS.HmacSHA256(
                iv.toString() + ':' + encrypted.toString(),
                secret
            ).toString();
            
            return 'v3:' + iv.toString() + ':' + encrypted.toString() + ':' + hmac;
        } catch (e) {
            throw new Error('Key 1 encryption failed');
        }
    },

    decryptKey1WithPassword: function(encryptedKey1, password, salt) {
        try {
            var parts = encryptedKey1.split(':');
            if (parts[0] !== 'v3' || parts.length !== 4) {
                throw new Error('Invalid format');
            }
            
            var secret = this._deriveSecretFromPassword(password, salt);
            var iv = CryptoJS.enc.Hex.parse(parts[1]);
            var ciphertext = parts[2];
            var storedHmac = parts[3];
            
            var computedHmac = CryptoJS.HmacSHA256(
                parts[1] + ':' + ciphertext,
                secret
            ).toString();
            
            if (!this._timingSafeEqual(storedHmac, computedHmac)) {
                throw new Error('Integrity check failed');
            }
            
            var decrypted = CryptoJS.AES.decrypt(ciphertext, secret, {
                iv: iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            }).toString(CryptoJS.enc.Utf8);
            
            if (!decrypted || decrypted.length === 0) {
                throw new Error('Decryption failed');
            }
            
            return decrypted;
        } catch (e) {
            throw new Error('Wrong password');
        }
    },

    /* ═══════════════════════════════════════════════════════
       POLYMORPHIC SINGLE-USE HANDSHAKE ENGINE
       ═══════════════════════════════════════════════════════ */
    
    _generateEphemeralSeed: function() {
        var components = [
            Date.now().toString(36),
            (typeof performance !== 'undefined' && performance.now)
                ? performance.now().toString(36) : '',
            window.screen.width + 'x' + window.screen.height + 'x' + (window.screen.colorDepth || 0),
            window.innerWidth + 'x' + window.innerHeight,
            navigator.hardwareConcurrency || '',
            navigator.deviceMemory || '',
            navigator.language || '',
            this._bytesToHex(this._secureRandomBytes(16)),
            Math.random().toString(36).substring(2, 15)
        ];
        return components.join('|');
    },

    _initiateNewRoute: function(masterKey) {
        if (!masterKey) throw new Error('Master key required');
        if (typeof CryptoJS === 'undefined' || !CryptoJS.SHA256) {
            throw new Error('CryptoJS required');
        }

        var seed = this._generateEphemeralSeed();
        var lock = CryptoJS.SHA256(masterKey + '::LOCK::' + seed).toString();
        var key2 = CryptoJS.SHA256(masterKey + '::KEY2::' + seed).toString();
        var routeId = CryptoJS.SHA256(masterKey + '::ROUTE::' + seed).toString().substring(0, 32);
        var seedHash = CryptoJS.SHA256(seed).toString().substring(0, 16);

        this._ephemeralRoute = {
            seed: seed, lock: lock, key2: key2,
            routeId: routeId, seedHash: seedHash,
            createdAt: Date.now(), ttl: this._ROUTE_TTL
        };

        this._routeStats.totalRoutes++;
        this._routeStats.lastRouteAt = new Date().toISOString();
        return this._ephemeralRoute;
    },

    _verifyRoute: function(route, masterKey) {
        if (!route || !route.seed || !route.lock) return false;
        if (Date.now() - route.createdAt > route.ttl) return false;
        var expectedLock = CryptoJS.SHA256(masterKey + '::LOCK::' + route.seed).toString();
        return this._timingSafeEqual(route.lock, expectedLock);
    },

    _wipeRoute: function() {
        if (this._ephemeralRoute) {
            if (this._ephemeralRoute.seed) this._ephemeralRoute.seed = '0'.repeat(this._ephemeralRoute.seed.length);
            if (this._ephemeralRoute.lock) this._ephemeralRoute.lock = '0'.repeat(64);
            if (this._ephemeralRoute.key2) this._ephemeralRoute.key2 = '0'.repeat(64);
            if (this._ephemeralRoute.routeId) this._ephemeralRoute.routeId = '0'.repeat(32);

            this._ephemeralRoute.seed = null;
            this._ephemeralRoute.lock = null;
            this._ephemeralRoute.key2 = null;
            this._ephemeralRoute.routeId = null;
            this._ephemeralRoute.seedHash = null;
            this._ephemeralRoute = null;
            this._routeStats.wipeCount++;
        }
    },

    _installWipeHandlers: function() {
        if (this._wipeHandlersInstalled) return;
        this._wipeHandlersInstalled = true;
        var self = this;

        window.addEventListener('beforeunload', function() {
            self._wipeRoute();
            self._key = null;
            self._encryptedKey = null;
            if (self._routeRotationTimer) {
                clearInterval(self._routeRotationTimer);
                self._routeRotationTimer = null;
            }
        });

        document.addEventListener('visibilitychange', function() {
            if (document.hidden) self._wipeRoute();
        });

        window.addEventListener('pagehide', function() {
            self._wipeRoute();
            self._key = null;
        });
    },

    _startRouteRotation: function() {
        var self = this;
        if (this._routeRotationTimer) clearInterval(this._routeRotationTimer);
        this._routeRotationTimer = setInterval(function() {
            if (document.hidden) return;
            if (!self._key) return;
            try {
                self._wipeRoute();
                self._initiateNewRoute(self._key);
            } catch (e) {}
        }, this._ROUTE_ROTATE_INTERVAL);
    },

    generateEphemeralKey2: function(masterKey) {
        if (!masterKey) masterKey = this._key;
        if (!masterKey) throw new Error('Master key not available');
        var route = this._initiateNewRoute(masterKey);
        this._installWipeHandlers();
        this._startRouteRotation();
        return {
            key2: route.key2,
            routeId: route.routeId,
            seedHash: route.seedHash,
            ttl: route.ttl
        };
    },

    getEphemeralRoute: function() { return this._ephemeralRoute; },

    getRouteStatus: function() {
        if (!this._ephemeralRoute) {
            return { active: false, totalRoutes: this._routeStats.totalRoutes, wipeCount: this._routeStats.wipeCount };
        }
        var age = Date.now() - this._ephemeralRoute.createdAt;
        return {
            active: true,
            routeId: this._ephemeralRoute.routeId.substring(0, 12) + '...',
            age: age + 'ms', ttl: this._ephemeralRoute.ttl + 'ms',
            expiresIn: Math.max(0, this._ephemeralRoute.ttl - age) + 'ms',
            totalRoutes: this._routeStats.totalRoutes,
            wipeCount: this._routeStats.wipeCount
        };
    },

    /* ═══════════════════════════════════════════════════════
       DEVICE FINGERPRINT
       ═══════════════════════════════════════════════════════ */
    
    _getDeviceFingerprint: function(forceRefresh) {
        if (!forceRefresh && this._deviceFingerprint) return this._deviceFingerprint;
        var components = [
            navigator.userAgent || '', navigator.language || '', navigator.platform || '',
            window.screen.width + 'x' + window.screen.height,
            window.screen.colorDepth || '', new Date().getTimezoneOffset(),
            navigator.hardwareConcurrency || '', navigator.deviceMemory || ''
        ];
        var raw = components.join('|||');
        var hash = 0;
        for (var i = 0; i < raw.length; i++) {
            var char = raw.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        this._deviceFingerprint = 'fp_' + Math.abs(hash).toString(36);
        return this._deviceFingerprint;
    },

    _getDeviceInfo: function() {
        var ua = navigator.userAgent;
        var device = 'Unknown', os = 'Unknown', browser = 'Unknown';
        if (/Windows NT 10/.test(ua)) os = 'Windows 10/11';
        else if (/Mac OS X/.test(ua)) os = 'macOS';
        else if (/iPhone/.test(ua)) os = 'iOS';
        else if (/iPad/.test(ua)) os = 'iPadOS';
        else if (/Android/.test(ua)) os = 'Android';
        else if (/Linux/.test(ua)) os = 'Linux';

        if (/Edg\//.test(ua)) browser = 'Edge';
        else if (/OPR\//.test(ua)) browser = 'Opera';
        else if (/Chrome\//.test(ua)) browser = 'Chrome';
        else if (/Firefox\//.test(ua)) browser = 'Firefox';
        else if (/Safari\//.test(ua)) browser = 'Safari';

        if (/iPhone/.test(ua)) device = 'iPhone';
        else if (/iPad/.test(ua)) device = 'iPad';
        else if (/Android/.test(ua)) device = 'Android';
        else device = os + ' Device';

        return {
            device: device, os: os, browser: browser,
            screen: window.screen.width + 'x' + window.screen.height,
            language: navigator.language || 'unknown',
            fingerprint: this._getDeviceFingerprint(),
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown'
        };
    },

    /* ═══════════════════════════════════════════════════════
       KEY GENERATION
       ═══════════════════════════════════════════════════════ */
    
    generateRandomKey: function() {
        var digits = '0123456789';
        var letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        var symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
        var result = [];
        var i;
        for (i = 0; i < 15; i++) result.push(digits.charAt(this._secureRandomInt(digits.length)));
        for (i = 0; i < 15; i++) result.push(letters.charAt(this._secureRandomInt(letters.length)));
        for (i = 0; i < 30; i++) result.push(symbols.charAt(this._secureRandomInt(symbols.length)));
        this._secureShuffle(result);
        return this._PREFIX + result.join('');
    },

    generateUserSalt: function() {
        return this._bytesToHex(this._secureRandomBytes(32));
    },

    generateFileKey: function() {
        var digits = '0123456789';
        var letters = 'abcdefghijklmnopqrstuvwxyz';
        var result = [];
        var i;
        for (i = 0; i < 20; i++) result.push(digits.charAt(this._secureRandomInt(digits.length)));
        for (i = 0; i < 40; i++) result.push(letters.charAt(this._secureRandomInt(letters.length)));
        this._secureShuffle(result);
        return this._FILE_PREFIX + result.join('');
    },

    generateContextToken: function() {
        return this._bytesToHex(this._secureRandomBytes(32));
    },

    /* ═══════════════════════════════════════════════════════
       PASSWORD HASHING
       ═══════════════════════════════════════════════════════ */
    
    hashPassword: function(password, salt) {
        var self = this;
        return new Promise(function(resolve, reject) {
            if (window.crypto && window.crypto.subtle && window.TextEncoder) {
                var enc = new TextEncoder();
                window.crypto.subtle.importKey('raw', enc.encode(password), { name: 'PBKDF2' }, false, ['deriveBits'])
                .then(function(baseKey) {
                    return window.crypto.subtle.deriveBits({
                        name: 'PBKDF2', salt: enc.encode(salt),
                        iterations: self._PBKDF2_ITER, hash: 'SHA-256'
                    }, baseKey, 256);
                })
                .then(function(bits) {
                    resolve(self._bytesToHex(new Uint8Array(bits)));
                })
                .catch(function() {
                    try {
                        var hash = CryptoJS.PBKDF2(password, salt, {
                            keySize: 256 / 32, iterations: self._PBKDF2_ITER,
                            hasher: CryptoJS.algo.SHA256
                        }).toString(CryptoJS.enc.Hex);
                        resolve(hash);
                    } catch (e) { reject(new Error('Password hashing failed')); }
                });
            } else {
                try {
                    var hash = CryptoJS.PBKDF2(password, salt, {
                        keySize: 256 / 32, iterations: self._PBKDF2_ITER,
                        hasher: CryptoJS.algo.SHA256
                    }).toString(CryptoJS.enc.Hex);
                    resolve(hash);
                } catch (e) { reject(new Error('Password hashing failed')); }
            }
        });
    },

    _hashPasswordLegacy: function(password, salt) {
        var self = this;
        return new Promise(function(resolve, reject) {
            if (window.crypto && window.crypto.subtle && window.TextEncoder) {
                var enc = new TextEncoder();
                window.crypto.subtle.importKey('raw', enc.encode(password), { name: 'PBKDF2' }, false, ['deriveBits'])
                .then(function(baseKey) {
                    return window.crypto.subtle.deriveBits({
                        name: 'PBKDF2', salt: enc.encode(salt),
                        iterations: 250000, hash: 'SHA-256'
                    }, baseKey, 256);
                })
                .then(function(bits) {
                    resolve(self._bytesToHex(new Uint8Array(bits)));
                })
                .catch(function() {
                    try {
                        var hash = CryptoJS.PBKDF2(password, salt, {
                            keySize: 256 / 32, iterations: 250000,
                            hasher: CryptoJS.algo.SHA256
                        }).toString(CryptoJS.enc.Hex);
                        resolve(hash);
                    } catch (e) { reject(new Error('Legacy hashing failed')); }
                });
            } else {
                try {
                    var hash = CryptoJS.PBKDF2(password, salt, {
                        keySize: 256 / 32, iterations: 250000,
                        hasher: CryptoJS.algo.SHA256
                    }).toString(CryptoJS.enc.Hex);
                    resolve(hash);
                } catch (e) { reject(new Error('Legacy hashing failed')); }
            }
        });
    },

    /* ═══════════════════════════════════════════════════════
       AES-256 ENCRYPTION (v3 FORMAT)
       ═══════════════════════════════════════════════════════ */
    
    _deriveAESKey: function(password, salt) {
        return CryptoJS.PBKDF2(password, salt, {
            keySize: 256 / 32,
            iterations: this._AES_KEY_ITER,
            hasher: CryptoJS.algo.SHA256
        });
    },

    encryptKey: function(originalKey, password) {
        try {
            var iv = CryptoJS.lib.WordArray.random(16);
            var aesKey = this._deriveAESKey(password, this._userSalt || 'default-salt');
            var encrypted = CryptoJS.AES.encrypt(originalKey, aesKey, {
                iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7
            });
            var hmac = CryptoJS.HmacSHA256(
                iv.toString() + ':' + encrypted.toString(),
                originalKey
            ).toString();
            return 'v3:' + iv.toString() + ':' + encrypted.toString() + ':' + hmac;
        } catch (e) { throw new Error('Encryption failed'); }
    },

    decryptKey: function(encryptedKey, password) {
        try {
            var parts = encryptedKey.split(':');

            if (parts[0] === 'v3' && parts.length === 4) {
                var iv = CryptoJS.enc.Hex.parse(parts[1]);
                var ciphertext = parts[2];
                var storedHmac = parts[3];
                var aesKey = this._deriveAESKey(password, this._userSalt || 'default-salt');
                var decrypted = CryptoJS.AES.decrypt(ciphertext, aesKey, {
                    iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7
                }).toString(CryptoJS.enc.Utf8);
                if (!decrypted || decrypted.length === 0) throw new Error('Decryption failed');
                var computedHmac = CryptoJS.HmacSHA256(parts[1] + ':' + ciphertext, decrypted).toString();
                if (!this._timingSafeEqual(storedHmac, computedHmac)) throw new Error('Integrity check failed');
                return decrypted;
            }

            if (parts[0] === 'v2' && parts.length === 5) {
                var aesSalt = CryptoJS.enc.Hex.parse(parts[1]);
                var iv2 = CryptoJS.enc.Hex.parse(parts[2]);
                var ciphertext2 = parts[3];
                var storedHmac2 = parts[4];
                var hmacKey = CryptoJS.PBKDF2(password, aesSalt, {
                    keySize: 256 / 32, iterations: this._AES_KEY_ITER,
                    hasher: CryptoJS.algo.SHA256
                });
                var computedHmac2 = CryptoJS.HmacSHA256(parts[1] + ':' + parts[2] + ':' + ciphertext2, hmacKey).toString();
                if (!this._timingSafeEqual(storedHmac2, computedHmac2)) throw new Error('Integrity check failed');
                var aesKey2 = this._deriveAESKey(password, aesSalt);
                var decrypted2 = CryptoJS.AES.decrypt(ciphertext2, aesKey2, {
                    iv: iv2, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7
                }).toString(CryptoJS.enc.Utf8);
                if (!decrypted2 || decrypted2.length === 0) throw new Error('Decryption failed');
                return decrypted2;
            }

            if (parts.length === 3) {
                var aesSalt3 = CryptoJS.enc.Hex.parse(parts[0]);
                var iv3 = CryptoJS.enc.Hex.parse(parts[1]);
                var ciphertext3 = parts[2];
                var aesKey3 = this._deriveAESKey(password, aesSalt3);
                var decrypted3 = CryptoJS.AES.decrypt(ciphertext3, aesKey3, {
                    iv: iv3, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7
                }).toString(CryptoJS.enc.Utf8);
                if (!decrypted3 || decrypted3.length === 0) throw new Error('Decryption failed');
                return decrypted3;
            }

            throw new Error('Invalid format');
        } catch (e) { throw new Error('Wrong password'); }
    },

    _decryptKeyLegacy: function(encryptedKey, password) {
        try {
            var decrypted = CryptoJS.AES.decrypt(encryptedKey, password).toString(CryptoJS.enc.Utf8);
            if (!decrypted || decrypted.length === 0) throw new Error('Decryption failed');
            return decrypted;
        } catch (e) { throw new Error('Wrong password'); }
    },

    /* ═══════════════════════════════════════════════════════
       PASSWORD VALIDATION
       ═══════════════════════════════════════════════════════ */
    
    validatePasswordFormat: function(pwd) {
        if (!pwd) return false;
        if (pwd.length < this._PASSWORD_MIN) return false;
        if (pwd.length > this._PASSWORD_MAX) return false;
        var digits = (pwd.match(/\d/g) || []).length;
        var lower = (pwd.match(/[a-z]/g) || []).length;
        var upper = (pwd.match(/[A-Z]/g) || []).length;
        var symbols = (pwd.match(/[^a-zA-Z0-9]/g) || []).length;
        if (digits < 3 || lower < 4 || upper < 3 || symbols < 3) return false;
        if (typeof zxcvbn !== 'undefined') {
            try { if (zxcvbn(pwd).score < 3) return false; } catch (e) {}
        }
        return true;
    },

    /* ═══════════════════════════════════════════════════════
       TIMING-SAFE COMPARE
       ═══════════════════════════════════════════════════════ */
    
    _timingSafeEqual: function(a, b) {
        if (typeof a !== 'string' || typeof b !== 'string') return false;
        if (a.length !== b.length) return false;
        var result = 0;
        for (var i = 0; i < a.length; i++) {
            result |= a.charCodeAt(i) ^ b.charCodeAt(i);
        }
        return result === 0;
    },

    /* ═══════════════════════════════════════════════════════
       RATE LIMITING (UID Hash Based)
       ═══════════════════════════════════════════════════════ */
    
    _checkRateLimit: function(uidHash) {
        return this._safeFirebase()
            .ref('uidHashes/' + uidHash + '/rateLimit')
            .once('value')
            .then(function(snap) {
                var data = snap.val() || { attempts: 0, lockedUntil: 0 };
                if (data.lockedUntil > Date.now()) {
                    var remaining = Math.ceil((data.lockedUntil - Date.now()) / 60000);
                    throw new Error('Too many attempts. Try again in ' + remaining + ' minute(s).');
                }
                return data;
            });
    },

    _recordFailedAttempt: function(uidHash) {
        var self = this;
        var ref = this._safeFirebase().ref('uidHashes/' + uidHash + '/rateLimit');
        return ref.transaction(function(current) {
            current = current || { attempts: 0, lockedUntil: 0 };
            if (current.lockedUntil && current.lockedUntil < Date.now()) {
                current.attempts = 0; current.lockedUntil = 0;
            }
            current.attempts = (current.attempts || 0) + 1;
            current.lastAttempt = Date.now();
            if (current.attempts >= self._MAX_ATTEMPTS) {
                current.lockedUntil = Date.now() + self._LOCKOUT_DURATION;
                current.attempts = 0;
            }
            return current;
        });
    },

    _clearRateLimit: function(uidHash) {
        return this._safeFirebase()
            .ref('uidHashes/' + uidHash + '/rateLimit')
            .update({ attempts: 0, lockedUntil: 0, lastSuccess: Date.now() });
    },

    /* ═══════════════════════════════════════════════════════
       AUDIT LOGGING (UID Hash Based)
       ═══════════════════════════════════════════════════════ */
    
    _logEvent: function(uidHash, action) {
        var self = this;
        var deviceInfo = this._getDeviceInfo();
        var ref = this._safeFirebase().ref('uidHashes/' + uidHash + '/audit');
        return ref.once('value').then(function(snap) {
            var history = snap.val() || [];
            history.push({
                action: action, timestamp: new Date().toISOString(),
                device: deviceInfo.device, browser: deviceInfo.browser,
                os: deviceInfo.os, fingerprint: deviceInfo.fingerprint
            });
            if (history.length > self._MAX_HISTORY) history = history.slice(-self._MAX_HISTORY);
            return ref.set(history);
        });
    },

    /* ═══════════════════════════════════════════════════════
       FIREBASE OPERATIONS (UID Hash Based)
       ═══════════════════════════════════════════════════════ */
    
    checkKeyStatus: function(userId) {
        var self = this;
        return new Promise(function(resolve, reject) {
            if (!userId) { reject(new Error('User ID required')); return; }

            var uidHash = self.hashUID(userId);
            if (!uidHash) { reject(new Error('UID hash failed')); return; }

            self._uidHash = uidHash;

            self._safeFirebase().ref('uidHashes/' + uidHash).once('value')
                .then(function(snap) {
                    var data = snap.val();
                    if (data && data.passwordHash && data.salt) {
                        self._hasPassword = true;
                        self._userId = userId;
                        self._userSalt = data.salt;
                        self._displayKey = self._PREFIX + '************';
                        resolve({
                            hasKey: true,
                            uidHash: uidHash,
                            salt: data.salt,
                            keyVersion: data.keyVersion || 0,
                            meta: data
                        });
                    } else {
                        self._hasPassword = false;
                        self._displayKey = null;
                        resolve({ hasKey: false, uidHash: uidHash });
                    }
                })
                .catch(function() { reject(new Error('Failed to check key status')); });
        });
    },

    createKeyAndPassword: function(user, password) {
        var self = this;
        return new Promise(function(resolve, reject) {
            if (!user || !user.uid) { reject(new Error('User required')); return; }
            if (!self.validatePasswordFormat(password)) {
                reject(new Error('Password must be 16-64 chars with digits, upper, lower, symbols'));
                return;
            }

            var userSalt = self.generateUserSalt();
            self._userSalt = userSalt;

            var originalKey = self.generateRandomKey();
            var uidHash = self.hashUID(user.uid);
            if (!uidHash) { reject(new Error('UID hash failed')); return; }

            self._uidHash = uidHash;
            var now = new Date().toISOString();

            self.hashPassword(password, userSalt)
                .then(function(passwordHash) {
                    return self._safeFirebase().ref('uidHashes/' + uidHash).set({
                        passwordHash: passwordHash,
                        salt: userSalt,
                        keyVersion: self._KEY_VERSION,
                        algorithm: 'aes-256-cbc-pbkdf2-sha256-600k',
                        iterations: self._PBKDF2_ITER,
                        rateLimit: { attempts: 0, lockedUntil: 0, lastSuccess: Date.now() },
                        audit: [{
                            action: 'create', timestamp: now,
                            device: self._getDeviceInfo().device
                        }],
                        createdAt: now,
                        updatedAt: now
                    });
                })
                .then(function() {
                    self._key = originalKey;
                    self._email = user.email;
                    self._userId = user.uid;
                    self._hasPassword = true;
                    self._initialized = true;
                    self._displayKey = self._makeMaskedKey(originalKey);
                    self._installWipeHandlers();
                    self._initiateNewRoute(originalKey);
                    self._startRouteRotation();

                    resolve({
                        success: true,
                        key: originalKey,
                        displayKey: self._displayKey,
                        uidHash: uidHash,
                        salt: userSalt
                    });
                })
                .catch(function(err) {
                    reject(new Error('Failed to create key: ' + err.message));
                });
        });
    },

    unlockKey: function(user, password) {
        var self = this;
        return new Promise(function(resolve, reject) {
            if (!user || !user.uid) { reject(new Error('User required')); return; }

            var uidHash = self.hashUID(user.uid);
            if (!uidHash) { reject(new Error('UID hash failed')); return; }

            self._checkRateLimit(uidHash)
                .then(function() {
                    return self._safeFirebase().ref('uidHashes/' + uidHash).once('value');
                })
                .then(function(snap) {
                    var data = snap.val();
                    if (!data || !data.passwordHash || !data.salt) {
                        reject(new Error('No key found. Please create one.')); return;
                    }

                    self._userSalt = data.salt;
                    self._uidHash = uidHash;

                    return self.hashPassword(password, data.salt).then(function(computed) {
                        if (!self._timingSafeEqual(computed, data.passwordHash)) {
                            throw new Error('Incorrect password');
                        }
                        return data;
                    });
                })
                .then(function(data) {
                    if (!data) return;

                    var originalKey = null;
                    if (window._0xKEY1_ENC && window._0xKEY1_IV) {
                        try {
                            originalKey = self.decryptKey1WithPassword(
                                'v3:' + window._0xKEY1_IV + ':' + window._0xKEY1_ENC + ':' + window._0xKEY1_HMAC,
                                password,
                                data.salt
                            );
                        } catch (e) {}
                    }

                    self._key = originalKey;
                    self._email = user.email;
                    self._userId = user.uid;
                    self._hasPassword = true;
                    self._initialized = true;
                    self._displayKey = self._makeMaskedKey(originalKey);
                    self._installWipeHandlers();
                    self._initiateNewRoute(originalKey);
                    self._startRouteRotation();

                    self._clearRateLimit(uidHash).catch(function() {});
                    self._logEvent(uidHash, 'unlock_success').catch(function() {});

                    resolve({
                        success: true,
                        key: originalKey,
                        displayKey: self._displayKey,
                        uidHash: uidHash
                    });
                })
                .catch(function(err) {
                    self._recordFailedAttempt(uidHash).catch(function() {});
                    reject(err);
                });
        });
    },

    _makeMaskedKey: function(key) {
        if (!key || key.length < 40) return this._PREFIX + '************';
        return key.substring(0, 40) + '************';
    },

    deleteKey: function(user) {
        var self = this;
        return new Promise(function(resolve, reject) {
            if (!user || !user.uid) { reject(new Error('User required')); return; }
            var uidHash = self.hashUID(user.uid);
            if (!uidHash) { reject(new Error('UID hash failed')); return; }

            self._wipeRoute();
            if (self._routeRotationTimer) {
                clearInterval(self._routeRotationTimer);
                self._routeRotationTimer = null;
            }
            self._safeFirebase().ref('uidHashes/' + uidHash).remove()
                .then(function() { resolve({ success: true }); })
                .catch(function() { reject(new Error('Failed to delete key')); });
        });
    },

    /* ═══════════════════════════════════════════════════════
       UPDATE STATS (UID Hash Based)
       ═══════════════════════════════════════════════════════ */
    
    updateEncryptionStats: function(userId, data) {
        if (!userId || !data) return Promise.resolve();
        var self = this;
        var uidHash = self.hashUID(userId);
        if (!uidHash) return Promise.resolve();
        var ref = self._safeFirebase().ref('uidHashes/' + uidHash + '/stats');
        return ref.transaction(function(current) {
            current = current || {};
            current.totalEncryptions = (current.totalEncryptions || 0) + 1;
            current.totalBytesEncrypted = (current.totalBytesEncrypted || 0) + (data.size || 0);
            current.totalFilesEncrypted = (current.totalFilesEncrypted || 0) + (data.fileCount || 1);
            current.lastEncryptedAt = new Date().toISOString();
            current.lastEncryptionSize = data.size || 0;
            return current;
        });
    },

    /* ═══════════════════════════════════════════════════════
       FIREBASE AUTH TOKEN
       ═══════════════════════════════════════════════════════ */
    
    getAuthToken: function(forceRefresh) {
        var self = this;
        return new Promise(function(resolve, reject) {
            if (!forceRefresh && self._cachedAuthToken && self._authTokenExpiry > Date.now()) {
                resolve(self._cachedAuthToken); return;
            }
            if (typeof firebase === 'undefined' || !firebase.auth) {
                reject(new Error('Firebase Auth not available')); return;
            }
            var user = firebase.auth().currentUser;
            if (!user) { reject(new Error('Not authenticated')); return; }
            user.getIdToken(forceRefresh).then(function(token) {
                self._cachedAuthToken = token;
                self._authTokenExpiry = Date.now() + (50 * 60 * 1000);
                resolve(token);
            }).catch(function(err) {
                reject(new Error('Failed to get auth token: ' + err.message));
            });
        });
    },

    /* ═══════════════════════════════════════════════════════
       HEARTBEAT (UID Hash Based)
       ═══════════════════════════════════════════════════════ */
    
    sendHeartbeat: function(event, data) {
        var self = this;
        if (!self._uidHash) return Promise.resolve();
        var deviceInfo = self._getDeviceInfo();
        return self._safeFirebase()
            .ref('uidHashes/' + self._uidHash + '/telemetry')
            .push({
                event: event,
                timestamp: new Date().toISOString(),
                device: deviceInfo.device,
                browser: deviceInfo.browser,
                os: deviceInfo.os,
                fingerprint: deviceInfo.fingerprint,
                timezone: deviceInfo.timezone,
                screen: deviceInfo.screen,
                routeActive: !!self._ephemeralRoute,
                data: data || {}
            })
            .catch(function() {});
    },

    /* ═══════════════════════════════════════════════════════
       BUILD / PARSE FILE METADATA
       ═══════════════════════════════════════════════════════ */
    
    buildFileMetadata: function(fileId, dataIv, encryptedData, key2Iv, encryptedKey2, hmac) {
        return 'v3:' + fileId + ':' + dataIv + ':' + encryptedData + ':' + key2Iv + ':' + encryptedKey2 + ':' + hmac;
    },

    parseFileMetadata: function(metadata) {
        var parts = metadata.split(':');
        if (parts[0] !== 'v3' || parts.length !== 7) return null;
        return {
            version: parts[0], fileId: parts[1],
            dataIv: parts[2], encryptedData: parts[3],
            key2Iv: parts[4], encryptedKey2: parts[5],
            hmac: parts[6]
        };
    },

    buildFileMetadataV4: function(fileId, dataIv, encryptedData, key2Iv, encryptedKey2, hmac, routeId, seedHash) {
        return 'v4:' + fileId + ':' + dataIv + ':' + encryptedData + ':' + key2Iv + ':' + encryptedKey2 + ':' + hmac + ':' + routeId + ':' + seedHash;
    },

    parseFileMetadataV4: function(metadata) {
        var parts = metadata.split(':');
        if (parts[0] !== 'v4' || parts.length < 9) return null;
        return {
            version: parts[0], fileId: parts[1],
            dataIv: parts[2], encryptedData: parts[3],
            key2Iv: parts[4], encryptedKey2: parts[5],
            hmac: parts[6], routeId: parts[7], seedHash: parts[8]
        };
    },

    parseAnyMetadata: function(metadata) {
        if (!metadata) return null;
        var parts = metadata.split(':');
        if (parts[0] === 'v4') return this.parseFileMetadataV4(metadata);
        if (parts[0] === 'v3') return this.parseFileMetadata(metadata);
        if (parts[0] === 'v2') {
            return { version: 'v2', salt: parts[1], iv: parts[2], ciphertext: parts[3], hmac: parts[4] };
        }
        if (parts.length === 3) {
            return { version: 'v1', salt: parts[0], iv: parts[1], ciphertext: parts[2] };
        }
        return null;
    },

    /* ═══════════════════════════════════════════════════════
       GETTERS
       ═══════════════════════════════════════════════════════ */
    
    getKey: function() {
        if (!this._initialized || !this._key) throw new Error('Key not initialized');
        return this._key;
    },
    getDisplayKey: function() {
        return this._displayKey || (this._PREFIX + '************');
    },
    getEmail: function() { return this._email; },
    getUserId: function() { return this._userId; },
    getUIDHash: function() { return this._uidHash; },
    getUserSalt: function() { return this._userSalt; },
    isReady: function() { return this._initialized; },
    hasPassword: function() { return this._hasPassword; },
    getDeviceFingerprint: function() { return this._getDeviceFingerprint(); },
    getFilePrefix: function() { return this._FILE_PREFIX; },
    getKeyVersion: function() { return this._KEY_VERSION; },
    getEphemeralRoute: function() { return this._ephemeralRoute; },

    hasActiveRoute: function() {
        if (!this._ephemeralRoute) return false;
        return (Date.now() - this._ephemeralRoute.createdAt) <= this._ephemeralRoute.ttl;
    },

    /* ═══════════════════════════════════════════════════════
       CLEAR (FULL WIPE)
       ═══════════════════════════════════════════════════════ */
    
    clear: function() {
        this._wipeRoute();
        if (this._routeRotationTimer) {
            clearInterval(this._routeRotationTimer);
            this._routeRotationTimer = null;
        }
        this._key = null;
        this._encryptedKey = null;
        this._displayKey = null;
        this._email = null;
        this._userId = null;
        this._uidHash = null;
        this._userSalt = null;
        this._initialized = false;
        this._hasPassword = false;
        this._cachedAuthToken = null;
        this._authTokenExpiry = 0;
    }
};

window.KEY_MANAGER = KEY_MANAGER;

console.log('%c🔐 Key Manager v22 HASH-ENCRYPTED HEAVY loaded',
    'color:#00ff64;font-weight:bold;font-size:14px;');
console.log('%c⚡ UID Hash + AES-256-CBC Key 1 + Multi-layer Obfuscation',
    'color:#ffd700;font-size:11px;');
console.log('%c🎲 Polymorphic Engine | 7 Layers of Security',
    'color:#00f0ff;font-size:11px;');
console.log('%c🗑️ Auto-wipe: unload + hidden + pagehide | Route rotation',
    'color:#ff0064;font-size:11px;');

})();
