/* ═══════════════════════════════════════════════════════════
   key-manager.js — v21 AES-ENCRYPTED HEAVY (FULL)
   NightOrbit CodeForge
   
   UPGRADE FROM V20 → V21:
   ✅ ADDED: Multi-layer file name obfuscation
   ✅ ADDED: Multi-layer secret obfuscation
   ✅ ADDED: AES-256-CBC encrypted Key 1 (password-derived)
   ✅ ADDED: _deriveSecretFromPassword()
   ✅ ADDED: encryptKey1WithPassword()
   ✅ ADDED: decryptKey1WithPassword()
   ✅ PRESERVED: All v20 functions (NO REMOVAL)
   ✅ PRESERVED: Polymorphic engine
   ✅ PRESERVED: Rate limiting
   ✅ PRESERVED: Audit logging
   ✅ PRESERVED: Server-side ready
   ═══════════════════════════════════════════════════════════ */

(function() {
'use strict';

var KEY_MANAGER = {
    /* ═══ CONFIG ═══ */
    _PREFIX: 'NightOrbitGyidi_houperSecret_',
    _FILE_PREFIX: 'NightOrbitGyidi_public_key_',
    _PBKDF2_ITER: 600000,
    _AES_KEY_ITER: 100000,
    _PASSWORD_MIN: 16,
    _PASSWORD_MAX: 64,
    _KEY_VERSION: 21,
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
       ✅ v21 NEW: MULTI-LAYER FILE NAME OBFUSCATION
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
       ✅ v21 NEW: MULTI-LAYER SECRET OBFUSCATION
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
       ✅ v21 NEW: AES-256-CBC ENCRYPTED KEY 1
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
       POLYMORPHIC SINGLE-USE HANDSHAKE ENGINE (PRESERVED)
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
       DEVICE FINGERPRINT (PRESERVED)
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
       KEY GENERATION (PRESERVED)
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
       PASSWORD HASHING (PRESERVED)
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
       AES-256 ENCRYPTION (v3 FORMAT) (PRESERVED)
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
       PASSWORD VALIDATION (PRESERVED)
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
       TIMING-SAFE COMPARE (PRESERVED)
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
       RATE LIMITING (PRESERVED)
       ═══════════════════════════════════════════════════════ */
    _checkRateLimit: function(userId) {
        return this._safeFirebase()
            .ref('users/' + userId + '/keyData/rateLimit')
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

    _recordFailedAttempt: function(userId) {
        var self = this;
        var ref = this._safeFirebase().ref('users/' + userId + '/keyData/rateLimit');
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

    _clearRateLimit: function(userId) {
        return this._safeFirebase()
            .ref('users/' + userId + '/keyData/rateLimit')
            .update({ attempts: 0, lockedUntil: 0, lastSuccess: Date.now() });
    },

    /* ═══════════════════════════════════════════════════════
       AUDIT LOGGING (PRESERVED)
       ═══════════════════════════════════════════════════════ */
    _logEvent: function(userId, action) {
        var self = this;
        var deviceInfo = this._getDeviceInfo();
        var ref = this._safeFirebase().ref('users/' + userId + '/keyData/stats/history');
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
       FIREBASE OPERATIONS (PRESERVED)
       ═══════════════════════════════════════════════════════ */
    ensureUserProfile: function(user) {
        if (!user || !user.uid) return Promise.resolve();
        var profileRef = this._safeFirebase().ref('users/' + user.uid + '/profile');
        var deviceInfo = this._getDeviceInfo();
        return profileRef.once('value').then(function(snap) {
            var data = snap.val();
            if (!data || !data.email) {
                return profileRef.set({
                    email: user.email || '',
                    name: (user.email || '').split('@')[0] || 'User',
                    createdAt: new Date().toISOString(),
                    lastLogin: new Date().toISOString(),
                    lastDevice: deviceInfo.device,
                    lastBrowser: deviceInfo.browser,
                    lastOS: deviceInfo.os,
                    lastFingerprint: deviceInfo.fingerprint
                });
            } else {
                return profileRef.update({
                    email: user.email || data.email,
                    name: (user.email || '').split('@')[0] || data.name,
                    lastLogin: new Date().toISOString(),
                    lastDevice: deviceInfo.device,
                    lastBrowser: deviceInfo.browser,
                    lastOS: deviceInfo.os,
                    lastFingerprint: deviceInfo.fingerprint
                });
            }
        });
    },

    checkKeyStatus: function(userId) {
        var self = this;
        return new Promise(function(resolve, reject) {
            if (!userId) { reject(new Error('User ID required')); return; }
            self._safeFirebase().ref('users/' + userId + '/keyData').once('value')
                .then(function(snap) {
                    var data = snap.val();
                    if (data && data.passwordHash && data.salt && data.encryptedKey) {
                        self._hasPassword = true;
                        self._userId = userId;
                        self._userSalt = data.salt;
                        self._encryptedKey = data.encryptedKey;
                        self._displayKey = self._PREFIX + '************';
                        var isLegacy = !data.keyVersion || data.keyVersion < 17;
                        resolve({
                            hasKey: true, salt: data.salt,
                            encryptedKey: data.encryptedKey,
                            keyVersion: data.keyVersion || 0,
                            isLegacy: isLegacy,
                            stats: data.stats || null,
                            rateLimit: data.rateLimit || null,
                            meta: data
                        });
                    } else {
                        if (data) {
                            self._safeFirebase().ref('users/' + userId + '/keyData').remove().catch(function() {});
                        }
                        self._hasPassword = false;
                        self._displayKey = null;
                        resolve({ hasKey: false, salt: null, encryptedKey: null, meta: null });
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
                reject(new Error('Password must be 16-64 chars with at least 3 digits, 4 lowercase, 3 uppercase, and 3 symbols'));
                return;
            }
            var userSalt = self.generateUserSalt();
            self._userSalt = userSalt;
            var originalKey = self.generateRandomKey();
            var encryptedKey = self.encryptKey(originalKey, password);
            var now = new Date().toISOString();
            var deviceInfo = self._getDeviceInfo();

            self.hashPassword(password, userSalt)
                .then(function(passwordHash) {
                    return self._safeFirebase().ref('users/' + user.uid + '/keyData')
                        .once('value')
                        .then(function(snap) {
                            var existing = snap.val();
                            var generationCount = 1;
                            var history = [];
                            if (existing && existing.stats) {
                                generationCount = (existing.stats.totalGenerations || 0) + 1;
                                history = existing.stats.history || [];
                            }
                            history.push({
                                action: 'create', timestamp: now,
                                device: deviceInfo.device, browser: deviceInfo.browser,
                                os: deviceInfo.os, fingerprint: deviceInfo.fingerprint
                            });
                            if (history.length > self._MAX_HISTORY) history = history.slice(-self._MAX_HISTORY);

                            var keyData = {
                                passwordHash: passwordHash,
                                salt: userSalt,
                                encryptedKey: encryptedKey,
                                keyVersion: self._KEY_VERSION,
                                algorithm: 'aes-256-cbc-pbkdf2-sha256-600k-hmac-polymorphic',
                                iterations: self._PBKDF2_ITER,
                                stats: {
                                    totalGenerations: generationCount,
                                    totalEncryptions: existing && existing.stats ? (existing.stats.totalEncryptions || 0) : 0,
                                    totalBytesEncrypted: existing && existing.stats ? (existing.stats.totalBytesEncrypted || 0) : 0,
                                    totalFilesEncrypted: existing && existing.stats ? (existing.stats.totalFilesEncrypted || 0) : 0,
                                    firstGeneratedAt: existing && existing.stats ? existing.stats.firstGeneratedAt : now,
                                    lastGeneratedAt: now,
                                    history: history
                                },
                                rateLimit: { attempts: 0, lockedUntil: 0, lastSuccess: Date.now() },
                                createdAt: now,
                                updatedAt: now
                            };
                            return self._safeFirebase().ref('users/' + user.uid + '/keyData').set(keyData);
                        });
                })
                .then(function() { return self.ensureUserProfile(user); })
                .then(function() {
                    self._key = originalKey;
                    self._encryptedKey = encryptedKey;
                    self._email = user.email;
                    self._userId = user.uid;
                    self._hasPassword = true;
                    self._initialized = true;
                    self._displayKey = self._makeMaskedKey(originalKey);
                    self._installWipeHandlers();
                    self._initiateNewRoute(originalKey);
                    self._startRouteRotation();
                    resolve({ success: true, key: originalKey, displayKey: self._displayKey });
                })
                .catch(function(err) {
                    reject(new Error('Failed to create key. Please try again.'));
                });
        });
    },

    unlockKey: function(user, password) {
        var self = this;
        return new Promise(function(resolve, reject) {
            if (!user || !user.uid) { reject(new Error('User required')); return; }
            self._checkRateLimit(user.uid)
                .then(function() {
                    return self._safeFirebase().ref('users/' + user.uid + '/keyData').once('value');
                })
                .then(function(snap) {
                    var data = snap.val();
                    if (!data || !data.passwordHash || !data.salt || !data.encryptedKey) {
                        reject(new Error('No key found. Please create one.')); return;
                    }
                    self._userSalt = data.salt;
                    var isLegacy = !data.keyVersion || data.keyVersion < 17;
                    if (isLegacy) return self._handleLegacyUnlock(user, password, data);
                    return self._handleNormalUnlock(user, password, data);
                })
                .then(function(result) {
                    if (result) {
                        self._clearRateLimit(user.uid)
                            .then(function() { resolve(result); })
                            .catch(function() { resolve(result); });
                    }
                })
                .catch(function(err) {
                    self._recordFailedAttempt(user.uid).catch(function() {});
                    reject(err);
                });
        });
    },

    _handleNormalUnlock: function(user, password, data) {
        var self = this;
        return self.hashPassword(password, data.salt).then(function(computed) {
            if (!self._timingSafeEqual(computed, data.passwordHash)) throw new Error('Incorrect password');
            try {
                var originalKey = self.decryptKey(data.encryptedKey, password);
                self._key = originalKey;
                self._encryptedKey = data.encryptedKey;
                self._email = user.email;
                self._userId = user.uid;
                self._userSalt = data.salt;
                self._hasPassword = true;
                self._initialized = true;
                self._displayKey = self._makeMaskedKey(originalKey);
                self._installWipeHandlers();
                self._initiateNewRoute(originalKey);
                self._startRouteRotation();
                self._logEvent(user.uid, 'unlock_success').catch(function() {});
                return { success: true, key: originalKey, displayKey: self._displayKey, migrated: false };
            } catch (e) { throw new Error('Incorrect password'); }
        });
    },

    _handleLegacyUnlock: function(user, password, data) {
        var self = this;
        return self._hashPasswordLegacy(password, data.salt).then(function(computedLegacy) {
            if (!self._timingSafeEqual(computedLegacy, data.passwordHash)) throw new Error('Incorrect password');
            try {
                var originalKey = self._decryptKeyLegacy(data.encryptedKey, password);
                self._userSalt = data.salt;
                var newEncryptedKey = self.encryptKey(originalKey, password);
                return self.hashPassword(password, data.salt).then(function(newHash) {
                    return self._safeFirebase().ref('users/' + user.uid + '/keyData').update({
                        passwordHash: newHash,
                        encryptedKey: newEncryptedKey,
                        keyVersion: self._KEY_VERSION,
                        algorithm: 'aes-256-cbc-pbkdf2-sha256-600k-hmac-polymorphic',
                        iterations: self._PBKDF2_ITER,
                        migratedAt: new Date().toISOString()
                    }).then(function() {
                        self._key = originalKey;
                        self._encryptedKey = newEncryptedKey;
                        self._email = user.email;
                        self._userId = user.uid;
                        self._hasPassword = true;
                        self._initialized = true;
                        self._displayKey = self._makeMaskedKey(originalKey);
                        self._installWipeHandlers();
                        self._initiateNewRoute(originalKey);
                        self._startRouteRotation();
                        self._logEvent(user.uid, 'unlock_migrated').catch(function() {});
                        return { success: true, key: originalKey, displayKey: self._displayKey, migrated: true };
                    });
                });
            } catch (e) { throw new Error('Incorrect password'); }
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
            self._wipeRoute();
            if (self._routeRotationTimer) {
                clearInterval(self._routeRotationTimer);
                self._routeRotationTimer = null;
            }
            self._safeFirebase().ref('users/' + user.uid + '/keyData').remove()
                .then(function() { resolve({ success: true }); })
                .catch(function() { reject(new Error('Failed to delete key')); });
        });
    },

    /* ═══════════════════════════════════════════════════════
       UPDATE STATS (PRESERVED)
       ═══════════════════════════════════════════════════════ */
    updateEncryptionStats: function(userId, data) {
        if (!userId || !data) return Promise.resolve();
        var self = this;
        var ref = self._safeFirebase().ref('users/' + userId + '/keyData/stats');
        return ref.transaction(function(current) {
            current = current || {};
            current.totalEncryptions = (current.totalEncryptions || 0) + 1;
            current.totalBytesEncrypted = (current.totalBytesEncrypted || 0) + (data.size || 0);
            current.totalFilesEncrypted = (current.totalFilesEncrypted || 0) + (data.fileCount || 1);
            current.lastEncryptedAt = new Date().toISOString();
            current.lastEncryptionSize = data.size || 0;
            current.lastEncryptionSizeFormatted = data.sizeFormatted || '0 B';
            current.lastEncryptionDuration = data.duration || 0;
            return current;
        });
    },

    /* ═══════════════════════════════════════════════════════
       FIREBASE AUTH TOKEN (PRESERVED)
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
       SERVER-SIDE REGISTRATION (PRESERVED)
       ═══════════════════════════════════════════════════════ */
    registerFileOnServer: function(payload) {
        var self = this;
        return new Promise(function(resolve, reject) {
            if (typeof firebase === 'undefined' || !firebase.functions) {
                resolve({
                    fileId: 'local_' + Date.now() + '_' + Math.random().toString(36).slice(2, 10),
                    serverRegistered: false
                });
                return;
            }
            var registerFn = firebase.functions().httpsCallable('registerFile');
            self.getAuthToken().then(function(token) {
                return registerFn({
                    encryptedData: payload.encryptedData,
                    encryptedKey2: payload.encryptedKey2,
                    dataIv: payload.dataIv,
                    key2Iv: payload.key2Iv,
                    hmac: payload.hmac,
                    routeId: payload.routeId || '',
                    seedHash: payload.seedHash || '',
                    fileSize: payload.fileSize || 0,
                    fileCount: payload.fileCount || 1,
                    authToken: token
                });
            })
            .then(function(result) {
                resolve({ fileId: result.data.fileId, serverRegistered: true });
            })
            .catch(function(err) {
                resolve({
                    fileId: 'local_' + Date.now() + '_' + Math.random().toString(36).slice(2, 10),
                    serverRegistered: false, error: err.message
                });
            });
        });
    },

    verifyServerSide: function(fileId, routeId, userPassword) {
        var self = this;
        return new Promise(function(resolve, reject) {
            if (typeof firebase === 'undefined' || !firebase.functions) {
                reject(new Error('Firebase Functions not available')); return;
            }
            var decryptFn = firebase.functions().httpsCallable('decryptFile');
            self.getAuthToken().then(function(token) {
                return decryptFn({ fileId: fileId, routeId: routeId, userPassword: userPassword, authToken: token });
            })
            .then(function(result) { resolve(result.data); })
            .catch(function(err) { reject(new Error(err.message || 'Server verification failed')); });
        });
    },

    /* ═══════════════════════════════════════════════════════
       HEARTBEAT (PRESERVED)
       ═══════════════════════════════════════════════════════ */
    sendHeartbeat: function(event, data) {
        var self = this;
        if (!self._userId) return Promise.resolve();
        var deviceInfo = self._getDeviceInfo();
        return self._safeFirebase()
            .ref('users/' + self._userId + '/telemetry')
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
                routeAge: self._ephemeralRoute ? (Date.now() - self._ephemeralRoute.createdAt) : null,
                data: data || {}
            })
            .catch(function() {});
    },

    /* ═══════════════════════════════════════════════════════
       BUILD / PARSE FILE METADATA (PRESERVED)
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
       GETTERS (PRESERVED)
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
    getUserSalt: function() { return this._userSalt; },
    isReady: function() { return this._initialized; },
    hasPassword: function() { return this._hasPassword; },
    getDeviceFingerprint: function() { return this._getDeviceFingerprint(); },
    getFilePrefix: function() { return this._FILE_PREFIX; },
    getKeyVersion: function() { return this._KEY_VERSION; },

    hasActiveRoute: function() {
        if (!this._ephemeralRoute) return false;
        return (Date.now() - this._ephemeralRoute.createdAt) <= this._ephemeralRoute.ttl;
    },

    /* ═══════════════════════════════════════════════════════
       CLEAR (FULL WIPE) (PRESERVED)
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
        this._userSalt = null;
        this._initialized = false;
        this._hasPassword = false;
        this._cachedAuthToken = null;
        this._authTokenExpiry = 0;
    }
};

window.KEY_MANAGER = KEY_MANAGER;

console.log('%c🔐 Key Manager v21 AES-ENCRYPTED HEAVY loaded',
    'color:#00ff64;font-weight:bold;font-size:14px;');
console.log('%c⚡ AES-256-CBC + PBKDF2-SHA256 600K + Multi-layer Obfuscation',
    'color:#ffd700;font-size:11px;');
console.log('%c🎲 Polymorphic Engine | 7 Layers of Security',
    'color:#00f0ff;font-size:11px;');
console.log('%c🗑️ Auto-wipe: unload + hidden + pagehide | Route rotation',
    'color:#ff0064;font-size:11px;');

})();
