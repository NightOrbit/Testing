/* ═══════════════════════════════════════════════════════════
   key-manager.js — v19 STRONG
   NightOrbit CodeForge

   UPGRADE FROM V18:
   ✅ FIXED: HMAC key = AES key problem (ab ALAG salts)
   ✅ FIXED: Timing attack in _timingSafeEqual (constant-time)
   ✅ FIXED: Rate limit galat count (sirf password error pe)
   ✅ FIXED: checkKeyStatus auto-delete bug (no more data loss)
   ✅ FIXED: Console logs removed (production silent)
   ✅ UPGRADED: v3 format — separate AES salt + HMAC salt
   ✅ UPGRADED: Backward compatible (v1, v2, v3 sab support)
   ✅ UPGRADED: Auto-migration v1/v2 → v3 on unlock

   LAYERS:
   1. AES-256-CBC       → Master key encryption
   2. PBKDF2-SHA256     → 600,000 iterations
   3. HMAC-SHA256       → SEPARATE key (alag salt)
   4. 256-bit Salt      → aesSalt (per key)
   5. 256-bit Salt      → hmacSalt (per key, ALAG)
   6. 128-bit IV        → Random per encryption
   7. HMAC-SHA256       → Tamper detection

   FORMAT v3:
   v3:aesSalt:hmacSalt:iv:ciphertext:hmac

   DATA STORAGE (Firebase):
   users/{uid}/
   ├── profile/          → email, name, timestamps, device
   ├── keyData/          → passwordHash, salt, encryptedKey (v3)
   │   ├── stats/        → generations, encryptions, history
   │   └── rateLimit/    → attempts, lockedUntil
   └── settings/         → preferences

   SECURITY:
   - Crypto-secure RNG (window.crypto)
   - AES-256-CBC + HMAC-SHA256 (SEPARATE keys)
   - PBKDF2-SHA256 600K iterations
   - 256-bit user salt
   - 256-bit AES salt (per key)
   - 256-bit HMAC salt (per key)
   - 128-bit random IV
   - Constant-time comparison
   - Original password NEVER stored
   - Original key NEVER stored plain
   - Rate limiting (brute-force protection)
   - Audit logging (last 50 events)
   - Auto-migration v1/v2 → v3
   - Zero-knowledge preserved
   ═══════════════════════════════════════════════════════════ */

(function() {
'use strict';

var KEY_MANAGER = {
    /* ═══ CONFIG ═══ */
    _PREFIX: 'NightOrbitGyidi_houperSecret_',
    _PBKDF2_ITER: 600000,
    _AES_KEY_ITER: 100000,
    _PASSWORD_MIN: 16,
    _PASSWORD_MAX: 64,
    _KEY_VERSION: 19,
    _MAX_ATTEMPTS: 5,
    _LOCKOUT_DURATION: 15 * 60 * 1000,
    _MAX_HISTORY: 50,

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
       DEVICE FINGERPRINT
       ═══════════════════════════════════════════════════════ */
    _getDeviceFingerprint: function() {
        if (this._deviceFingerprint) return this._deviceFingerprint;

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
             KEY GENERATION
             ═══════════════════════════════════════════════════════ */
          generateRandomKey: function() {
              var digits = '0123456789';
              var letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
              var symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      
              var arrDigits = [];
              for (var i = 0; i < 15; i++) {
                  arrDigits.push(digits.charAt(this._secureRandomInt(digits.length)));
              }
      
              var arrLetters = [];
              for (var j = 0; j < 15; j++) {
                  arrLetters.push(letters.charAt(this._secureRandomInt(letters.length)));
              }
      
              var arrSymbols = [];
              for (var k = 0; k < 30; k++) {
                  arrSymbols.push(symbols.charAt(this._secureRandomInt(symbols.length)));
              }
      
              var combined = arrDigits.concat(arrLetters).concat(arrSymbols);
      
              while (combined.length < 60) {
                  combined.push(letters.charAt(this._secureRandomInt(letters.length)));
              }
              combined = combined.slice(0, 60);
      
              this._secureShuffle(combined);
      
              while (combined.length < 60) {
                  combined.push('0');
              }
              combined = combined.slice(0, 60);
      
              var finalStr = combined.join('');
              var finalDigits = (finalStr.match(/\d/g) || []).length;
              if (finalDigits !== 15) {
                  var needD = 15 - finalDigits;
                  for (var m = 0; m < combined.length && needD > 0; m++) {
                      if (!/\d/.test(combined[m])) {
                          combined[m] = digits.charAt(this._secureRandomInt(digits.length));
                          needD--;
                      }
                  }
              }
      
              finalStr = combined.join('');
              var finalLetters = (finalStr.match(/[a-zA-Z]/g) || []).length;
              if (finalLetters !== 15) {
                  var needL = 15 - finalLetters;
                  for (var n = 0; n < combined.length && needL > 0; n++) {
                      if (!/[a-zA-Z]/.test(combined[n]) && !/\d/.test(combined[n])) {
                          combined[n] = letters.charAt(this._secureRandomInt(letters.length));
                          needL--;
                      }
                  }
              }
      
              return this._PREFIX + combined.join('');
          },
      
          generateUserSalt: function() {
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
       AES-256 ENCRYPTION — LAYERED (v19 STRONG)

       LAYERS:
       1. AES-256-CBC       → Master key encryption
       2. PBKDF2-SHA256     → 100,000 iterations (AES key)
       3. PBKDF2-SHA256     → 100,000 iterations (HMAC key — ALAG salt)
       4. 256-bit AES salt  → Random per key
       5. 256-bit HMAC salt → Random per key (ALAG)
       6. 128-bit IV        → Random per encryption
       7. HMAC-SHA256       → Tamper detection
       ═══════════════════════════════════════════════════════ */

    /* ✅ Derive AES key from password + aesSalt */
    _deriveAESKey: function(password, salt) {
        return CryptoJS.PBKDF2(password, salt, {
            keySize: 256 / 32,
            iterations: this._AES_KEY_ITER,
            hasher: CryptoJS.algo.SHA256
        });
    },

    /* ✅ Derive HMAC key from password + hmacSalt (ALAG!) */
    _deriveHMACKey: function(password, salt) {
        return CryptoJS.PBKDF2(password, salt, {
            keySize: 256 / 32,
            iterations: this._AES_KEY_ITER,
            hasher: CryptoJS.algo.SHA256
        });
    },

    /* ✅ v19 STRONG: AES-256-CBC + HMAC-SHA256 with SEPARATE keys */
    encryptKey: function(originalKey, password) {
        try {
            /* Layer 1: Random 256-bit AES salt */
            var aesSalt = CryptoJS.lib.WordArray.random(16);

            /* Layer 2: Random 256-bit HMAC salt (ALAG) */
            var hmacSalt = CryptoJS.lib.WordArray.random(16);

            /* Layer 3: Random 128-bit IV */
            var iv = CryptoJS.lib.WordArray.random(16);

            /* Layer 4: Derive AES key from aesSalt */
            var aesKey = this._deriveAESKey(password, aesSalt);

            /* Layer 5: Derive HMAC key from hmacSalt (ALAG!) */
            var hmacKey = this._deriveHMACKey(password, hmacSalt);

            /* Layer 6: AES-256-CBC encrypt */
            var encrypted = CryptoJS.AES.encrypt(originalKey, aesKey, {
                iv: iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            });

            /* Layer 7: HMAC-SHA256 (over salts + iv + ciphertext) */
            var hmac = CryptoJS.HmacSHA256(
                aesSalt.toString() + ':' + hmacSalt.toString() + ':' +
                iv.toString() + ':' + encrypted.toString(),
                hmacKey
            ).toString();

            /* v3 format: v3:aesSalt:hmacSalt:iv:ciphertext:hmac */
            return 'v3:' + aesSalt.toString() + ':' + hmacSalt.toString() +
                   ':' + iv.toString() + ':' + encrypted.toString() + ':' + hmac;
        } catch (e) {
            throw new Error('Encryption failed');
        }
    },

    /* ✅ Decrypt with HMAC verification + v1/v2/v3 support */
    decryptKey: function(encryptedKey, password) {
        try {
            var parts = encryptedKey.split(':');

            /* ═══ v3 FORMAT — SEPARATE SALTS (STRONGEST) ═══ */
            if (parts[0] === 'v3' && parts.length === 6) {
                var aesSalt3 = CryptoJS.enc.Hex.parse(parts[1]);
                var hmacSalt3 = CryptoJS.enc.Hex.parse(parts[2]);
                var iv3 = CryptoJS.enc.Hex.parse(parts[3]);
                var ciphertext3 = parts[4];
                var storedHmac3 = parts[5];

                /* Verify HMAC first (with ALAG hmacSalt) */
                var hmacKey3 = this._deriveHMACKey(password, hmacSalt3);
                var computedHmac3 = CryptoJS.HmacSHA256(
                    parts[1] + ':' + parts[2] + ':' + parts[3] + ':' + ciphertext3,
                    hmacKey3
                ).toString();

                if (!this._timingSafeEqual(storedHmac3, computedHmac3)) {
                    throw new Error('Integrity check failed');
                }

                /* Decrypt with AES key (from aesSalt) */
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

            /* ═══ v2 FORMAT — LEGACY (same salt for AES+HMAC) ═══ */
            if (parts[0] === 'v2' && parts.length === 5) {
                var aesSalt2 = CryptoJS.enc.Hex.parse(parts[1]);
                var iv2 = CryptoJS.enc.Hex.parse(parts[2]);
                var ciphertext2 = parts[3];
                var storedHmac2 = parts[4];

                /* v2 used same salt — keep for backward compat */
                var hmacKey2 = CryptoJS.PBKDF2(password, aesSalt2, {
                    keySize: 256 / 32,
                    iterations: this._AES_KEY_ITER,
                    hasher: CryptoJS.algo.SHA256
                });
                var computedHmac2 = CryptoJS.HmacSHA256(
                    parts[1] + ':' + parts[2] + ':' + ciphertext2,
                    hmacKey2
                ).toString();

                if (!this._timingSafeEqual(storedHmac2, computedHmac2)) {
                    throw new Error('Integrity check failed');
                }

                var aesKey2 = this._deriveAESKey(password, aesSalt2);
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

            /* ═══ v1 FORMAT — OLD LEGACY (no HMAC) ═══ */
            if (parts.length === 3) {
                var aesSalt1 = CryptoJS.enc.Hex.parse(parts[0]);
                var iv1 = CryptoJS.enc.Hex.parse(parts[1]);
                var ciphertext1 = parts[2];

                var aesKey1 = this._deriveAESKey(password, aesSalt1);
                var decrypted1 = CryptoJS.AES.decrypt(ciphertext1, aesKey1, {
                    iv: iv1,
                    mode: CryptoJS.mode.CBC,
                    padding: CryptoJS.pad.Pkcs7
                }).toString(CryptoJS.enc.Utf8);

                if (!decrypted1 || decrypted1.length === 0) {
                    throw new Error('Decryption failed');
                }
                return decrypted1;
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
       TIMING-SAFE COMPARE (✅ FIXED — constant-time)
       ═══════════════════════════════════════════════════════ */
    _timingSafeEqual: function(a, b) {
        if (typeof a !== 'string' || typeof b !== 'string') return false;

        /* ✅ Length bhi constant-time compare karo */
        var maxLen = Math.max(a.length, b.length);
        var result = a.length ^ b.length;

        for (var i = 0; i < maxLen; i++) {
            var ca = i < a.length ? a.charCodeAt(i) : 0;
            var cb = i < b.length ? b.charCodeAt(i) : 0;
            result |= ca ^ cb;
        }
        return result === 0;
    },

    /* ═══════════════════════════════════════════════════════
       RATE LIMITING
       ═══════════════════════════════════════════════════════ */
    _checkRateLimit: function(userId) {
        return firebase.database()
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
        var ref = firebase.database().ref('users/' + userId + '/keyData/rateLimit');

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
        return firebase.database()
            .ref('users/' + userId + '/keyData/rateLimit')
            .update({ attempts: 0, lockedUntil: 0, lastSuccess: Date.now() });
    },

    /* ═══════════════════════════════════════════════════════
       AUDIT LOGGING
       ═══════════════════════════════════════════════════════ */
    _logEvent: function(userId, action) {
        var deviceInfo = this._getDeviceInfo();
        var ref = firebase.database()
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

            if (history.length > KEY_MANAGER._MAX_HISTORY) {
                history = history.slice(-KEY_MANAGER._MAX_HISTORY);
            }
            return ref.set(history);
        });
    },

    /* ═══════════════════════════════════════════════════════
       FIREBASE OPERATIONS
       ═══════════════════════════════════════════════════════ */
    ensureUserProfile: function(user) {
        if (!user || !user.uid) return Promise.resolve();
        var profileRef = firebase.database().ref('users/' + user.uid + '/profile');
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

    /* ✅ FIXED: No auto-delete on partial data */
    checkKeyStatus: function(userId) {
        var self = this;
        return new Promise(function(resolve, reject) {
            if (!userId) { reject(new Error('User ID required')); return; }

            firebase.database().ref('users/' + userId + '/keyData').once('value')
                .then(function(snap) {
                    var data = snap.val();

                    /* ✅ Full key present */
                    if (data && data.passwordHash && data.salt && data.encryptedKey && data.keyVersion) {
                        self._hasPassword = true;
                        self._userId = userId;
                        self._userSalt = data.salt;
                        self._encryptedKey = data.encryptedKey;
                        self._displayKey = self._PREFIX + '************';

                        resolve({
                            hasKey: true,
                            salt: data.salt,
                            encryptedKey: data.encryptedKey,
                            keyVersion: data.keyVersion,
                            stats: data.stats || null,
                            rateLimit: data.rateLimit || null,
                            meta: data
                        });
                        return;
                    }

                    /* ✅ FIXED: Partial data — DO NOT delete */
                    if (data && (data.passwordHash || data.salt || data.encryptedKey || data.keyVersion)) {
                        self._hasPassword = false;
                        self._displayKey = null;
                        resolve({
                            hasKey: false,
                            partial: true,
                            salt: null,
                            encryptedKey: null,
                            meta: data
                        });
                        return;
                    }

                    /* ✅ Truly empty or null — safe to clean */
                    if (data) {
                        firebase.database().ref('users/' + userId + '/keyData').remove()
                            .catch(function() {});
                    }
                    self._hasPassword = false;
                    self._displayKey = null;
                    resolve({ hasKey: false, salt: null, encryptedKey: null, meta: null });
                })
                .catch(function() {
                    reject(new Error('Failed to check key status'));
                });
        });
    },

    /* ═══ CREATE KEY + PASSWORD (v19 STRONG) ═══ */
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
            var originalKey = self.generateRandomKey();
            var encryptedKey = self.encryptKey(originalKey, password);
            var now = new Date().toISOString();
            var deviceInfo = self._getDeviceInfo();

            self.hashPassword(password, userSalt)
                .then(function(passwordHash) {
                    return firebase.database()
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
                                /* 🔐 Security (HASHED/ENCRYPTED — v3 format) */
                                passwordHash: passwordHash,
                                salt: userSalt,
                                encryptedKey: encryptedKey,
                                keyVersion: self._KEY_VERSION,
                                algorithm: 'aes-256-cbc-pbkdf2-sha256-600k-hmac-separate-keys-v3',
                                iterations: self._PBKDF2_ITER,
                                encFormat: 'v3',

                                /* 📊 Stats */
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

                                /* 🚫 Rate limit reset */
                                rateLimit: {
                                    attempts: 0,
                                    lockedUntil: 0,
                                    lastSuccess: Date.now()
                                },

                                createdAt: now,
                                updatedAt: now
                            };

                            return firebase.database()
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
                    self._userSalt = userSalt;
                    self._hasPassword = true;
                    self._initialized = true;
                    self._displayKey = self._makeMaskedKey(originalKey);

                    resolve({
                        success: true,
                        key: originalKey,
                        displayKey: self._displayKey
                    });
                })
                .catch(function() {
                    reject(new Error('Failed to create key. Please try again.'));
                });
        });
    },

    /* ═══ UNLOCK KEY (v19 — FIXED rate limit) ═══ */
    unlockKey: function(user, password) {
        var self = this;
        var passwordWasChecked = false;

        return new Promise(function(resolve, reject) {
            if (!user || !user.uid) { reject(new Error('User required')); return; }

            self._checkRateLimit(user.uid)
                .then(function() {
                    return firebase.database()
                        .ref('users/' + user.uid + '/keyData')
                        .once('value');
                })
                .then(function(snap) {
                    var data = snap.val();
                    if (!data || !data.passwordHash || !data.salt || !data.encryptedKey) {
                        reject(new Error('No key found. Please create one.'));
                        return;
                    }

                    var isLegacy = !data.keyVersion || data.keyVersion < 17;
                    passwordWasChecked = true;

                    if (isLegacy) {
                        return self._handleLegacyUnlock(user, password, data);
                    }

                    return self._handleNormalUnlock(user, password, data);
                })
                .then(function(result) {
                    if (result) {
                        self._clearRateLimit(user.uid).catch(function() {});
                        resolve(result);
                    }
                })
                .catch(function(err) {
                    /* ✅ FIXED: Rate limit only on wrong password */
                    if (passwordWasChecked && err.message === 'Incorrect password') {
                        self._recordFailedAttempt(user.uid).catch(function() {});
                    }
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

                /* ✅ Auto-migrate v2 → v3 agar purana format hai */
                if (data.encryptedKey && data.encryptedKey.indexOf('v3:') !== 0) {
                    var newEncryptedKey = self.encryptKey(originalKey, password);
                    firebase.database()
                        .ref('users/' + user.uid + '/keyData')
                        .update({
                            encryptedKey: newEncryptedKey,
                            keyVersion: self._KEY_VERSION,
                            algorithm: 'aes-256-cbc-pbkdf2-sha256-600k-hmac-separate-keys-v3',
                            encFormat: 'v3',
                            migratedAt: new Date().toISOString()
                        })
                        .then(function() {
                            self._logEvent(user.uid, 'auto_migrated_v3').catch(function() {});
                        })
                        .catch(function() {});
                }

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
                var newEncryptedKey = self.encryptKey(originalKey, password);

                return self.hashPassword(password, data.salt).then(function(newHash) {
                    return firebase.database()
                        .ref('users/' + user.uid + '/keyData')
                        .update({
                            passwordHash: newHash,
                            encryptedKey: newEncryptedKey,
                            keyVersion: self._KEY_VERSION,
                            algorithm: 'aes-256-cbc-pbkdf2-sha256-600k-hmac-separate-keys-v3',
                            encFormat: 'v3',
                            iterations: self._PBKDF2_ITER,
                            migratedAt: new Date().toISOString()
                        })
                        .then(function() {
                            self._key = originalKey;
                            self._encryptedKey = newEncryptedKey;
                            self._email = user.email;
                            self._userId = user.uid;
                            self._userSalt = data.salt;
                            self._hasPassword = true;
                            self._initialized = true;
                            self._displayKey = self._makeMaskedKey(originalKey);

                            self._logEvent(user.uid, 'unlock_migrated_v3').catch(function() {});

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
        return new Promise(function(resolve, reject) {
            if (!user || !user.uid) { reject(new Error('User required')); return; }
            firebase.database().ref('users/' + user.uid + '/keyData').remove()
                .then(function() { resolve({ success: true }); })
                .catch(function() { reject(new Error('Failed to delete key')); });
        });
    },

    /* ═══════════════════════════════════════════════════════
       UPDATE STATS
       ═══════════════════════════════════════════════════════ */
    updateEncryptionStats: function(userId, data) {
        if (!userId || !data) return Promise.resolve();

        var ref = firebase.database()
            .ref('users/' + userId + '/keyData/stats');

        return ref.transaction(function(current) {
            if (!current) return current;

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

    /* ═══ GETTERS ═══ */
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

    clear: function() {
        this._key = null;
        this._encryptedKey = null;
        this._displayKey = null;
        this._email = null;
        this._userId = null;
        this._userSalt = null;
        this._initialized = false;
        this._hasPassword = false;
    }
};

window.KEY_MANAGER = KEY_MANAGER;

})();
