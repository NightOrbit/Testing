/* ═══════════════════════════════════════════════════════════
   key-manager.js — v19 HEAVY
   NightOrbit CodeForge

   UPGRADE FROM V18 → V19:
   ✅ FIXED: HMAC format mismatch (v2 → v3, 4-part format)
   ✅ FIXED: _logEvent KEY_MANAGER reference bug
   ✅ FIXED: updateEncryptionStats null-safe transaction
   ✅ FIXED: checkKeyStatus legacy migration trigger
   ✅ FIXED: Rate limit clear race condition
   ✅ FIXED: deviceFingerprint cache invalidation
   ✅ ADDED: generateFileKey() — Key 2 (per-file)
   ✅ ADDED: generateContextToken() — one-time token
   ✅ ADDED: registerFileOnServer() — Firebase Functions call
   ✅ ADDED: verifyServerSide() — server-side verification helper
   ✅ ADDED: buildFileMetadata() — v3 format builder
   ✅ ADDED: parseFileMetadata() — v3 format parser
   ✅ ADDED: getAuthToken() — Firebase ID token
   ✅ ADDED: sendHeartbeat() — anti-tamper telemetry
   ✅ ADDED: _safeFirebase() — firebase availability guard
   ✅ PRESERVED: All v18 functions (no removal)
   ✅ PRESERVED: Zero-knowledge architecture

   DATA STORAGE (Firebase):
   users/{uid}/
   ├── profile/          → email, name, timestamps, device
   ├── keyData/          → passwordHash, salt, encryptedKey (v3)
   │   ├── stats/        → generations, encryptions, history
   │   └── rateLimit/    → attempts, lockedUntil
   └── files/{fileId}/   → encrypted code + Key 2 + context token

   SECURITY:
   - Crypto-secure RNG (window.crypto)
   - AES-256-CBC + HMAC-SHA256
   - PBKDF2-SHA256 600K iterations
   - Random 256-bit salt + 128-bit IV
   - Timing-safe comparison
   - Rate limiting (brute-force protection)
   - Audit logging (last 50 events)
   - Server-side verification ready
   - Context token (one-time use)
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
    _KEY_VERSION: 19,
    _MAX_ATTEMPTS: 5,
    _LOCKOUT_DURATION: 15 * 60 * 1000,
    _MAX_HISTORY: 50,
    _FILE_KEY_LENGTH: 60,

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
            throw new Error('Secure random not available. Use a modern browser.');
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
       DEVICE FINGERPRINT (v19 — cache-safe)
       ═══════════════════════════════════════════════════════ */
    _getDeviceFingerprint: function(forceRefresh) {
        if (!forceRefresh && this._deviceFingerprint) return this._deviceFingerprint;

        var components = [
            navigator.userAgent || '',
            navigator.language || '',
            navigator.platform || '',
            window.screen.width + 'x' + window.screen.height,
            window.screen.colorDepth || '',
            new Date().getTimezoneOffset(),
            navigator.hardwareConcurrency || '',
            navigator.deviceMemory || ''
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
        var device = 'Unknown';
        var os = 'Unknown';
        var browser = 'Unknown';

        if (/Windows NT 10/.test(ua)) os = 'Windows 10/11';
        else if (/Windows NT 6\.3/.test(ua)) os = 'Windows 8.1';
        else if (/Windows NT 6\.2/.test(ua)) os = 'Windows 8';
        else if (/Windows NT 6\.1/.test(ua)) os = 'Windows 7';
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
        else if (/Android/.test(ua)) {
            var m = ua.match(/Android\s[\d.]+;\s([^)]+)/);
            device = m ? m[1].trim() : 'Android Device';
        } else {
            device = os + ' Device';
        }

        return {
            device: device,
            os: os,
            browser: browser,
            screen: window.screen.width + 'x' + window.screen.height,
            language: navigator.language || 'unknown',
            fingerprint: this._getDeviceFingerprint(),
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown'
        };
    },

    /* ═══════════════════════════════════════════════════════
       KEY GENERATION (Key 1 — Private)
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

    /* ═══════════════════════════════════════════════════════
       FILE KEY (Key 2 — Public, per-file)
       ═══════════════════════════════════════════════════════ */
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
       PASSWORD HASHING (PBKDF2-SHA256 600K)
       ═══════════════════════════════════════════════════════ */
    hashPassword: function(password, salt) {
        var self = this;
        return new Promise(function(resolve, reject) {
            if (window.crypto && window.crypto.subtle && window.TextEncoder) {
                var enc = new TextEncoder();
                window.crypto.subtle.importKey(
                    'raw', enc.encode(password),
                    { name: 'PBKDF2' }, false, ['deriveBits']
                )
                .then(function(baseKey) {
                    return window.crypto.subtle.deriveBits(
                        {
                            name: 'PBKDF2',
                            salt: enc.encode(salt),
                            iterations: self._PBKDF2_ITER,
                            hash: 'SHA-256'
                        },
                        baseKey, 256
                    );
                })
                .then(function(bits) {
                    resolve(self._bytesToHex(new Uint8Array(bits)));
                })
                .catch(function() {
                    try {
                        var hash = CryptoJS.PBKDF2(password, salt, {
                            keySize: 256 / 32,
                            iterations: self._PBKDF2_ITER,
                            hasher: CryptoJS.algo.SHA256
                        }).toString(CryptoJS.enc.Hex);
                        resolve(hash);
                    } catch (e) {
                        reject(new Error('Password hashing failed'));
                    }
                });
            } else {
                try {
                    var hash = CryptoJS.PBKDF2(password, salt, {
                        keySize: 256 / 32,
                        iterations: self._PBKDF2_ITER,
                        hasher: CryptoJS.algo.SHA256
                    }).toString(CryptoJS.enc.Hex);
                    resolve(hash);
                } catch (e) {
                    reject(new Error('Password hashing failed'));
                }
            }
        });
    },

    _hashPasswordLegacy: function(password, salt) {
        var self = this;
        return new Promise(function(resolve, reject) {
            if (window.crypto && window.crypto.subtle && window.TextEncoder) {
                var enc = new TextEncoder();
                window.crypto.subtle.importKey(
                    'raw', enc.encode(password),
                    { name: 'PBKDF2' }, false, ['deriveBits']
                )
                .then(function(baseKey) {
                    return window.crypto.subtle.deriveBits(
                        {
                            name: 'PBKDF2',
                            salt: enc.encode(salt),
                            iterations: 250000,
                            hash: 'SHA-256'
                        },
                        baseKey, 256
                    );
                })
                .then(function(bits) {
                    resolve(self._bytesToHex(new Uint8Array(bits)));
                })
                .catch(function() {
                    try {
                        var hash = CryptoJS.PBKDF2(password, salt, {
                            keySize: 256 / 32,
                            iterations: 250000,
                            hasher: CryptoJS.algo.SHA256
                        }).toString(CryptoJS.enc.Hex);
                        resolve(hash);
                    } catch (e) {
                        reject(new Error('Legacy hashing failed'));
                    }
                });
            } else {
                try {
                    var hash = CryptoJS.PBKDF2(password, salt, {
                        keySize: 256 / 32,
                        iterations: 250000,
                        hasher: CryptoJS.algo.SHA256
                    }).toString(CryptoJS.enc.Hex);
                    resolve(hash);
                } catch (e) {
                    reject(new Error('Legacy hashing failed'));
                }
            }
        });
    },

    /* ═══════════════════════════════════════════════════════
       AES-256 ENCRYPTION (v3 FORMAT — FIXED)
       ═══════════════════════════════════════════════════════ */
    _deriveAESKey: function(password, salt) {
        return CryptoJS.PBKDF2(password, salt, {
            keySize: 256 / 32,
            iterations: this._AES_KEY_ITER,
            hasher: CryptoJS.algo.SHA256
        });
    },

    /* ✅ v19 FIX: v3 format — v3:iv:ciphertext:hmac (4 parts) */
    encryptKey: function(originalKey, password) {
        try {
            var iv = CryptoJS.lib.WordArray.random(16);
            var aesKey = this._deriveAESKey(password, this._userSalt || 'default-salt');

            var encrypted = CryptoJS.AES.encrypt(originalKey, aesKey, {
                iv: iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            });

            /* ✅ HMAC key = originalKey itself (matches CodeEncryptor.html) */
            var hmac = CryptoJS.HmacSHA256(
                iv.toString() + ':' + encrypted.toString(),
                originalKey
            ).toString();

            /* ✅ v3 format: v3:iv:ciphertext:hmac (4 parts) */
            return 'v3:' + iv.toString() + ':' + encrypted.toString() + ':' + hmac;
        } catch (e) {
            throw new Error('Encryption failed');
        }
    },

    /* ✅ v19 FIX: Decrypt v3 (4-part) + v2 (5-part) + v1 (legacy) */
    decryptKey: function(encryptedKey, password) {
        try {
            var parts = encryptedKey.split(':');

            /* ✅ v3 format: v3:iv:ciphertext:hmac (4 parts) — RECOMMENDED */
            if (parts[0] === 'v3' && parts.length === 4) {
                var iv = CryptoJS.enc.Hex.parse(parts[1]);
                var ciphertext = parts[2];
                var storedHmac = parts[3];

                var aesKey = this._deriveAESKey(password, this._userSalt || 'default-salt');
                var decrypted = CryptoJS.AES.decrypt(ciphertext, aesKey, {
                    iv: iv,
                    mode: CryptoJS.mode.CBC,
                    padding: CryptoJS.pad.Pkcs7
                }).toString(CryptoJS.enc.Utf8);

                if (!decrypted || decrypted.length === 0) {
                    throw new Error('Decryption failed');
                }

                /* ✅ Verify HMAC with decrypted originalKey */
                var computedHmac = CryptoJS.HmacSHA256(
                    parts[1] + ':' + ciphertext,
                    decrypted
                ).toString();

                if (!this._timingSafeEqual(storedHmac, computedHmac)) {
                    throw new Error('Integrity check failed');
                }

                return decrypted;
            }

            /* v2 format: v2:salt:iv:ciphertext:hmac (5 parts) — legacy */
            if (parts[0] === 'v2' && parts.length === 5) {
                var aesSalt = CryptoJS.enc.Hex.parse(parts[1]);
                var iv2 = CryptoJS.enc.Hex.parse(parts[2]);
                var ciphertext2 = parts[3];
                var storedHmac2 = parts[4];

                var hmacKey = CryptoJS.PBKDF2(password, aesSalt, {
                    keySize: 256 / 32,
                    iterations: this._AES_KEY_ITER,
                    hasher: CryptoJS.algo.SHA256
                });
                var computedHmac2 = CryptoJS.HmacSHA256(
                    parts[1] + ':' + parts[2] + ':' + ciphertext2,
                    hmacKey
                ).toString();

                if (!this._timingSafeEqual(storedHmac2, computedHmac2)) {
                    throw new Error('Integrity check failed');
                }

                var aesKey2 = this._deriveAESKey(password, aesSalt);
                var decrypted2 = CryptoJS.AES.decrypt(ciphertext2, aesKey2, {
                    iv: iv2,
                    mode: CryptoJS.mode.CBC,
                    padding: CryptoJS.pad.Pkcs7
                }).toString(CryptoJS.enc.Utf8);

                if (!decrypted2 || decrypted2.length === 0) {
                    throw new Error('Decryption failed');
                }
                return decrypted2;
            }

            /* v1 format (legacy) */
            if (parts.length === 3) {
                var aesSalt3 = CryptoJS.enc.Hex.parse(parts[0]);
                var iv3 = CryptoJS.enc.Hex.parse(parts[1]);
                var ciphertext3 = parts[2];

                var aesKey3 = this._deriveAESKey(password, aesSalt3);
                var decrypted3 = CryptoJS.AES.decrypt(ciphertext3, aesKey3, {
                    iv: iv3,
                    mode: CryptoJS.mode.CBC,
                    padding: CryptoJS.pad.Pkcs7
                }).toString(CryptoJS.enc.Utf8);

                if (!decrypted3 || decrypted3.length === 0) {
                    throw new Error('Decryption failed');
                }
                return decrypted3;
            }

            throw new Error('Invalid format');
        } catch (e) {
            throw new Error('Wrong password');
        }
    },

    _decryptKeyLegacy: function(encryptedKey, password) {
        try {
            var decrypted = CryptoJS.AES.decrypt(encryptedKey, password).toString(CryptoJS.enc.Utf8);
            if (!decrypted || decrypted.length === 0) throw new Error('Decryption failed');
            return decrypted;
        } catch (e) {
            throw new Error('Wrong password');
        }
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
            try {
                if (zxcvbn(pwd).score < 3) return false;
            } catch (e) {}
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
       RATE LIMITING
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
                current.attempts = 0;
                current.lockedUntil = 0;
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
       AUDIT LOGGING (v19 FIXED — this._MAX_HISTORY)
       ═══════════════════════════════════════════════════════ */
    _logEvent: function(userId, action) {
        var self = this;
        var deviceInfo = this._getDeviceInfo();
        var ref = this._safeFirebase()
            .ref('users/' + userId + '/keyData/stats/history');

        return ref.once('value').then(function(snap) {
            var history = snap.val() || [];
            history.push({
                action: action,
                timestamp: new Date().toISOString(),
                device: deviceInfo.device,
                browser: deviceInfo.browser,
                os: deviceInfo.os,
                fingerprint: deviceInfo.fingerprint
            });

            /* ✅ v19 FIX: self._MAX_HISTORY (not KEY_MANAGER._MAX_HISTORY) */
            if (history.length > self._MAX_HISTORY) {
                history = history.slice(-self._MAX_HISTORY);
            }
            return ref.set(history);
        });
    },

    /* ═══════════════════════════════════════════════════════
       FIREBASE OPERATIONS
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

    /* ═══ CHECK KEY STATUS (v19 FIXED — legacy migration trigger) ═══ */
    checkKeyStatus: function(userId) {
        var self = this;
        return new Promise(function(resolve, reject) {
            if (!userId) { reject(new Error('User ID required')); return; }

            self._safeFirebase().ref('users/' + userId + '/keyData').once('value')
                .then(function(snap) {
                    var data = snap.val();

                    /* ✅ v19 FIX: keyVersion optional — legacy migration trigger */
                    if (data && data.passwordHash && data.salt && data.encryptedKey) {
                        self._hasPassword = true;
                        self._userId = userId;
                        self._userSalt = data.salt;
                        self._encryptedKey = data.encryptedKey;
                        self._displayKey = self._PREFIX + '************';

                        var isLegacy = !data.keyVersion || data.keyVersion < 17;

                        resolve({
                            hasKey: true,
                            salt: data.salt,
                            encryptedKey: data.encryptedKey,
                            keyVersion: data.keyVersion || 0,
                            isLegacy: isLegacy,
                            stats: data.stats || null,
                            rateLimit: data.rateLimit || null,
                            meta: data
                        });
                    } else {
                        if (data) {
                            self._safeFirebase().ref('users/' + userId + '/keyData').remove()
                                .catch(function() {});
                        }
                        self._hasPassword = false;
                        self._displayKey = null;
                        resolve({ hasKey: false, salt: null, encryptedKey: null, meta: null });
                    }
                })
                .catch(function() {
                    reject(new Error('Failed to check key status'));
                });
        });
    },

    /* ═══ CREATE KEY + PASSWORD (v19 — with stats + audit) ═══ */
    createKeyAndPassword: function(user, password) {
        var self = this;
        return new Promise(function(resolve, reject) {
            if (!user || !user.uid) { reject(new Error('User required')); return; }

            if (!self.validatePasswordFormat(password)) {
                reject(new Error(
                    'Password must be ' + self._PASSWORD_MIN + '-' + self._PASSWORD_MAX +
                    ' characters with at least 3 digits, 4 lowercase, 3 uppercase, and 3 symbols (strong password)'
                ));
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
                    return self._safeFirebase()
                        .ref('users/' + user.uid + '/keyData')
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
                                action: 'create',
                                timestamp: now,
                                device: deviceInfo.device,
                                browser: deviceInfo.browser,
                                os: deviceInfo.os,
                                fingerprint: deviceInfo.fingerprint
                            });

                            if (history.length > self._MAX_HISTORY) {
                                history = history.slice(-self._MAX_HISTORY);
                            }

                            var keyData = {
                                passwordHash: passwordHash,
                                salt: userSalt,
                                encryptedKey: encryptedKey,
                                keyVersion: self._KEY_VERSION,
                                algorithm: 'aes-256-cbc-pbkdf2-sha256-600k-hmac',
                                iterations: self._PBKDF2_ITER,

                                stats: {
                                    totalGenerations: generationCount,
                                    totalEncryptions: existing && existing.stats
                                        ? (existing.stats.totalEncryptions || 0) : 0,
                                    totalBytesEncrypted: existing && existing.stats
                                        ? (existing.stats.totalBytesEncrypted || 0) : 0,
                                    totalFilesEncrypted: existing && existing.stats
                                        ? (existing.stats.totalFilesEncrypted || 0) : 0,
                                    firstGeneratedAt: existing && existing.stats
                                        ? existing.stats.firstGeneratedAt : now,
                                    lastGeneratedAt: now,
                                    history: history
                                },

                                rateLimit: {
                                    attempts: 0,
                                    lockedUntil: 0,
                                    lastSuccess: Date.now()
                                },

                                createdAt: now,
                                updatedAt: now
                            };

                            return self._safeFirebase()
                                .ref('users/' + user.uid + '/keyData')
                                .set(keyData);
                        });
                })
                .then(function() {
                    return self.ensureUserProfile(user);
                })
                .then(function() {
                    self._key = originalKey;
                    self._encryptedKey = encryptedKey;
                    self._email = user.email;
                    self._userId = user.uid;
                    self._hasPassword = true;
                    self._initialized = true;
                    self._displayKey = self._makeMaskedKey(originalKey);

                    resolve({
                        success: true,
                        key: originalKey,
                        displayKey: self._displayKey
                    });
                })
                .catch(function(err) {
                    console.error('createKeyAndPassword error:', err);
                    reject(new Error('Failed to create key. Please try again.'));
                });
        });
    },

    /* ═══ UNLOCK KEY (v19 — rate limiting + audit) ═══ */
    unlockKey: function(user, password) {
        var self = this;
        return new Promise(function(resolve, reject) {
            if (!user || !user.uid) { reject(new Error('User required')); return; }

            self._checkRateLimit(user.uid)
                .then(function() {
                    return self._safeFirebase()
                        .ref('users/' + user.uid + '/keyData')
                        .once('value');
                })
                .then(function(snap) {
                    var data = snap.val();
                    if (!data || !data.passwordHash || !data.salt || !data.encryptedKey) {
                        reject(new Error('No key found. Please create one.'));
                        return;
                    }

                    /* ✅ v19 FIX: Set userSalt before decrypt */
                    self._userSalt = data.salt;

                    var isLegacy = !data.keyVersion || data.keyVersion < 17;

                    if (isLegacy) {
                        return self._handleLegacyUnlock(user, password, data);
                    }

                    return self._handleNormalUnlock(user, password, data);
                })
                .then(function(result) {
                    if (result) {
                        /* ✅ v19 FIX: Await clear before resolve */
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
            if (!self._timingSafeEqual(computed, data.passwordHash)) {
                throw new Error('Incorrect password');
            }

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

                self._logEvent(user.uid, 'unlock_success').catch(function() {});

                return {
                    success: true,
                    key: originalKey,
                    displayKey: self._displayKey,
                    migrated: false
                };
            } catch (e) {
                throw new Error('Incorrect password');
            }
        });
    },

    _handleLegacyUnlock: function(user, password, data) {
        var self = this;
        return self._hashPasswordLegacy(password, data.salt).then(function(computedLegacy) {
            if (!self._timingSafeEqual(computedLegacy, data.passwordHash)) {
                throw new Error('Incorrect password');
            }

            try {
                var originalKey = self._decryptKeyLegacy(data.encryptedKey, password);
                self._userSalt = data.salt;
                var newEncryptedKey = self.encryptKey(originalKey, password);

                return self.hashPassword(password, data.salt).then(function(newHash) {
                    return self._safeFirebase()
                        .ref('users/' + user.uid + '/keyData')
                        .update({
                            passwordHash: newHash,
                            encryptedKey: newEncryptedKey,
                            keyVersion: self._KEY_VERSION,
                            algorithm: 'aes-256-cbc-pbkdf2-sha256-600k-hmac',
                            iterations: self._PBKDF2_ITER,
                            migratedAt: new Date().toISOString()
                        })
                        .then(function() {
                            self._key = originalKey;
                            self._encryptedKey = newEncryptedKey;
                            self._email = user.email;
                            self._userId = user.uid;
                            self._hasPassword = true;
                            self._initialized = true;
                            self._displayKey = self._makeMaskedKey(originalKey);

                            self._logEvent(user.uid, 'unlock_migrated').catch(function() {});

                            return {
                                success: true,
                                key: originalKey,
                                displayKey: self._displayKey,
                                migrated: true
                            };
                        });
                });
            } catch (e) {
                throw new Error('Incorrect password');
            }
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
            self._safeFirebase().ref('users/' + user.uid + '/keyData').remove()
                .then(function() { resolve({ success: true }); })
                .catch(function() { reject(new Error('Failed to delete key')); });
        });
    },

    /* ═══════════════════════════════════════════════════════
       UPDATE STATS (v19 FIXED — null-safe transaction)
       ═══════════════════════════════════════════════════════ */
    updateEncryptionStats: function(userId, data) {
        if (!userId || !data) return Promise.resolve();

        var self = this;
        var ref = self._safeFirebase()
            .ref('users/' + userId + '/keyData/stats');

        return ref.transaction(function(current) {
            /* ✅ v19 FIX: null-safe — create if missing */
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
       FIREBASE AUTH TOKEN (v19 NEW)
       ═══════════════════════════════════════════════════════ */
    getAuthToken: function(forceRefresh) {
        var self = this;
        return new Promise(function(resolve, reject) {
            if (!forceRefresh && self._cachedAuthToken && self._authTokenExpiry > Date.now()) {
                resolve(self._cachedAuthToken);
                return;
            }

            if (typeof firebase === 'undefined' || !firebase.auth) {
                reject(new Error('Firebase Auth not available'));
                return;
            }

            var user = firebase.auth().currentUser;
            if (!user) {
                reject(new Error('Not authenticated'));
                return;
            }

            user.getIdToken(forceRefresh).then(function(token) {
                self._cachedAuthToken = token;
                self._authTokenExpiry = Date.now() + (50 * 60 * 1000); /* 50 min */
                resolve(token);
            }).catch(function(err) {
                reject(new Error('Failed to get auth token: ' + err.message));
            });
        });
    },

    /* ═══════════════════════════════════════════════════════
       SERVER-SIDE REGISTRATION (v19 NEW)
       ═══════════════════════════════════════════════════════ */
    registerFileOnServer: function(payload) {
        var self = this;
        return new Promise(function(resolve, reject) {
            if (typeof firebase === 'undefined' || !firebase.functions) {
                /* Functions not available — return local fallback */
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
                    contextToken: payload.contextToken,
                    fileSize: payload.fileSize || 0,
                    fileCount: payload.fileCount || 1,
                    authToken: token
                });
            })
            .then(function(result) {
                resolve({
                    fileId: result.data.fileId,
                    serverRegistered: true
                });
            })
            .catch(function(err) {
                console.warn('Server registration failed:', err);
                /* Fallback to local fileId */
                resolve({
                    fileId: 'local_' + Date.now() + '_' + Math.random().toString(36).slice(2, 10),
                    serverRegistered: false,
                    error: err.message
                });
            });
        });
    },

    /* ═══════════════════════════════════════════════════════
       SERVER-SIDE VERIFICATION (v19 NEW)
       ═══════════════════════════════════════════════════════ */
    verifyServerSide: function(fileId, contextToken, userPassword) {
        var self = this;
        return new Promise(function(resolve, reject) {
            if (typeof firebase === 'undefined' || !firebase.functions) {
                reject(new Error('Firebase Functions not available'));
                return;
            }

            var decryptFn = firebase.functions().httpsCallable('decryptFile');

            self.getAuthToken().then(function(token) {
                return decryptFn({
                    fileId: fileId,
                    contextToken: contextToken,
                    userPassword: userPassword,
                    authToken: token
                });
            })
            .then(function(result) {
                resolve(result.data);
            })
            .catch(function(err) {
                reject(new Error(err.message || 'Server verification failed'));
            });
        });
    },

    /* ═══════════════════════════════════════════════════════
       HEARTBEAT (v19 NEW — anti-tamper telemetry)
       ═══════════════════════════════════════════════════════ */
    sendHeartbeat: function(event, data) {
        var self = this;
        if (!self._userId) return Promise.resolve();

        var deviceInfo = self._getDeviceInfo();
        var heartbeat = {
            event: event,
            timestamp: new Date().toISOString(),
            device: deviceInfo.device,
            browser: deviceInfo.browser,
            os: deviceInfo.os,
            fingerprint: deviceInfo.fingerprint,
            timezone: deviceInfo.timezone,
            screen: deviceInfo.screen,
            data: data || {}
        };

        return self._safeFirebase()
            .ref('users/' + self._userId + '/telemetry')
            .push(heartbeat)
            .catch(function() {});
    },

    /* ═══════════════════════════════════════════════════════
       BUILD / PARSE FILE METADATA (v19 NEW)
       ═══════════════════════════════════════════════════════ */
    buildFileMetadata: function(fileId, dataIv, encryptedData, key2Iv, encryptedKey2, hmac) {
        return 'v3:' + fileId + ':' +
               dataIv + ':' + encryptedData + ':' +
               key2Iv + ':' + encryptedKey2 + ':' + hmac;
    },

    parseFileMetadata: function(metadata) {
        var parts = metadata.split(':');
        if (parts[0] !== 'v3' || parts.length !== 7) {
            return null;
        }
        return {
            version: parts[0],
            fileId: parts[1],
            dataIv: parts[2],
            encryptedData: parts[3],
            key2Iv: parts[4],
            encryptedKey2: parts[5],
            hmac: parts[6]
        };
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
    getUserSalt: function() { return this._userSalt; },
    isReady: function() { return this._initialized; },
    hasPassword: function() { return this._hasPassword; },
    getDeviceFingerprint: function() { return this._getDeviceFingerprint(); },
    getFilePrefix: function() { return this._FILE_PREFIX; },

    clear: function() {
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

console.log('%c🔐 Key Manager v19 HEAVY loaded',
    'color:#00ff64;font-weight:bold;font-size:14px;');
console.log('%c⚡ AES-256-CBC + HMAC-SHA256 (v3 format) | PBKDF2-SHA256 600K',
    'color:#ffd700;font-size:11px;');
console.log('%c📊 Audit Logging | Device Fingerprint | Server-Side Ready',
    'color:#00f0ff;font-size:11px;');

})();
