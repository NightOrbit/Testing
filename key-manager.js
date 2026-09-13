/* ═══════════════════════════════════════════════════════════
   key-manager.js — v16 ULTRA SECURE
   NightOrbit CodeForge
   
   SECURITY FEATURES:
   - Crypto-secure key generation (getRandomValues)
   - AES-256-CBC with random IV per encryption
   - PBKDF2-SHA256 with 600,000 iterations (OWASP 2023)
   - Separate salts for password hash & AES key
   - Timing-safe password comparison
   - Generic error messages (no info leakage)
   - Flexible password format (16-64 chars, mixed)
   ═══════════════════════════════════════════════════════════ */

(function() {
'use strict';

var KEY_MANAGER = {
    /* ═══ CONFIG ═══ */
    _PREFIX: 'NightOrbitGyidi_houperSecret_',
    _PBKDF2_ITER: 600000,           // OWASP 2023 recommendation
    _AES_KEY_ITER: 100000,          // For AES key derivation
    _PASSWORD_MIN: 16,
    _PASSWORD_MAX: 64,
    _KEY_SUFFIX_LEN: 60,
    _KEY_VERSION: 16,

    /* ═══ STATE ═══ */
    _key: null,
    _encryptedKey: null,
    _displayKey: null,
    _email: null,
    _userId: null,
    _initialized: false,
    _hasPassword: false,
    _userSalt: null,
    _aesSalt: null,

    /* ═══════════════════════════════════════════════════════
       SECURE RANDOM HELPERS
       ═══════════════════════════════════════════════════════ */

    /* Get cryptographically secure random bytes */
    _secureRandomBytes: function(length) {
        var arr = new Uint8Array(length);
        if (window.crypto && window.crypto.getRandomValues) {
            window.crypto.getRandomValues(arr);
        } else {
            throw new Error('Secure random not available. Please use a modern browser.');
        }
        return arr;
    },

    /* Secure random int between 0 and max-1 */
    _secureRandomInt: function(max) {
        if (max <= 0) return 0;
        var bytes = this._secureRandomBytes(4);
        var num = ((bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3]) >>> 0;
        return num % max;
    },

    /* Secure Fisher-Yates shuffle */
    _secureShuffle: function(array) {
        for (var i = array.length - 1; i > 0; i--) {
            var j = this._secureRandomInt(i + 1);
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
    },

    /* Convert bytes to hex string */
    _bytesToHex: function(bytes) {
        return Array.prototype.map.call(bytes, function(b) {
            return ('0' + b.toString(16)).slice(-2);
        }).join('');
    },

    /* ═══════════════════════════════════════════════════════
       KEY GENERATION (CRYPTO-SECURE)
       ═══════════════════════════════════════════════════════ */

    generateRandomKey: function() {
        var digits = '0123456789';
        var letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        var symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

        var result = [];
        var i;

        /* 15 digits — crypto-secure */
        for (i = 0; i < 15; i++) {
            result.push(digits.charAt(this._secureRandomInt(digits.length)));
        }
        /* 15 letters — crypto-secure */
        for (i = 0; i < 15; i++) {
            result.push(letters.charAt(this._secureRandomInt(letters.length)));
        }
        /* 30 symbols — crypto-secure */
        for (i = 0; i < 30; i++) {
            result.push(symbols.charAt(this._secureRandomInt(symbols.length)));
        }

        /* Secure shuffle */
        this._secureShuffle(result);

        return this._PREFIX + result.join('');
    },

    /* ═══ GENERATE SALT (32 bytes = 256 bits) ═══ */
    generateUserSalt: function() {
        return this._bytesToHex(this._secureRandomBytes(32));
    },

    /* ═══════════════════════════════════════════════════════
       PASSWORD HASHING (PBKDF2-SHA256, 600K iterations)
       ═══════════════════════════════════════════════════════ */

    hashPassword: function(password, salt) {
        var self = this;
        return new Promise(function(resolve, reject) {
            /* Preferred: Web Crypto API */
            if (window.crypto && window.crypto.subtle && window.TextEncoder) {
                var enc = new TextEncoder();
                window.crypto.subtle.importKey(
                    'raw',
                    enc.encode(password),
                    { name: 'PBKDF2' },
                    false,
                    ['deriveBits']
                )
                .then(function(baseKey) {
                    return window.crypto.subtle.deriveBits(
                        {
                            name: 'PBKDF2',
                            salt: enc.encode(salt),
                            iterations: self._PBKDF2_ITER,
                            hash: 'SHA-256'
                        },
                        baseKey,
                        256
                    );
                })
                .then(function(bits) {
                    var bytes = new Uint8Array(bits);
                    resolve(self._bytesToHex(bytes));
                })
                .catch(function(err) {
                    /* Fallback to CryptoJS */
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
                /* Fallback: CryptoJS */
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

    /* ═══════════════════════════════════════════════════════
       AES-256 ENCRYPTION (with random IV)
       ═══════════════════════════════════════════════════════ */

    /* Derive AES-256 key from password + salt */
    _deriveAESKey: function(password, salt) {
        return CryptoJS.PBKDF2(password, salt, {
            keySize: 256 / 32,          // 256 bits
            iterations: this._AES_KEY_ITER,
            hasher: CryptoJS.algo.SHA256
        });
    },

    /* Encrypt key with AES-256-CBC
       Format: aesSalt:iv:ciphertext */
    encryptKey: function(originalKey, password) {
        try {
            /* Random salt for AES key derivation */
            var aesSalt = CryptoJS.lib.WordArray.random(16);
            /* Random IV */
            var iv = CryptoJS.lib.WordArray.random(16);

            /* Derive AES-256 key */
            var aesKey = this._deriveAESKey(password, aesSalt);

            /* Encrypt */
            var encrypted = CryptoJS.AES.encrypt(originalKey, aesKey, {
                iv: iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            });

            /* Format: aesSalt:iv:ciphertext */
            return aesSalt.toString() + ':' + iv.toString() + ':' + encrypted.toString();
        } catch (e) {
            throw new Error('Encryption failed');
        }
    },

    /* Decrypt key with AES-256-CBC */
    decryptKey: function(encryptedKey, password) {
        try {
            var parts = encryptedKey.split(':');
            if (parts.length !== 3) {
                throw new Error('Invalid encrypted format');
            }

            var aesSalt = CryptoJS.enc.Hex.parse(parts[0]);
            var iv = CryptoJS.enc.Hex.parse(parts[1]);
            var ciphertext = parts[2];

            /* Derive AES-256 key */
            var aesKey = this._deriveAESKey(password, aesSalt);

            /* Decrypt */
            var decrypted = CryptoJS.AES.decrypt(ciphertext, aesKey, {
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
       PASSWORD VALIDATION (Flexible, 16-64 chars)
       ═══════════════════════════════════════════════════════ */

    validatePasswordFormat: function(pwd) {
        if (!pwd) return false;
        if (pwd.length < this._PASSWORD_MIN) return false;
        if (pwd.length > this._PASSWORD_MAX) return false;

        var hasDigit = /\d/.test(pwd);
        var hasLower = /[a-z]/.test(pwd);
        var hasUpper = /[A-Z]/.test(pwd);
        var hasSymbol = /[^a-zA-Z0-9]/.test(pwd);

        return hasDigit && hasLower && hasUpper && hasSymbol;
    },

    /* ═══════════════════════════════════════════════════════
       TIMING-SAFE COMPARISON (prevent timing attacks)
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
       FIREBASE OPERATIONS
       ═══════════════════════════════════════════════════════ */

    checkKeyStatus: function(userId) {
        var self = this;
        return new Promise(function(resolve, reject) {
            if (!userId) {
                reject(new Error('User ID required'));
                return;
            }

            firebase.database().ref('users/' + userId + '/keyData').once('value')
                .then(function(snap) {
                    var data = snap.val();

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
                            meta: data
                        });
                    } else {
                        /* Corrupted data → cleanup */
                        if (data) {
                            firebase.database().ref('users/' + userId + '/keyData').remove()
                                .catch(function() { /* silent */ });
                        }
                        self._hasPassword = false;
                        self._displayKey = null;

                        resolve({ hasKey: false, salt: null, encryptedKey: null, meta: null });
                    }
                })
                .catch(function(err) {
                    reject(new Error('Failed to check key status'));
                });
        });
    },

    /* ═══ CREATE KEY + PASSWORD ═══ */
    createKeyAndPassword: function(user, password) {
        var self = this;
        return new Promise(function(resolve, reject) {
            if (!user || !user.uid) {
                reject(new Error('User required'));
                return;
            }

            if (!self.validatePasswordFormat(password)) {
                reject(new Error(
                    'Password must be ' + self._PASSWORD_MIN + '-' + self._PASSWORD_MAX +
                    ' characters with at least 1 digit, 1 uppercase, 1 lowercase, and 1 symbol'
                ));
                return;
            }

            var userSalt = self.generateUserSalt();
            var originalKey = self.generateRandomKey();
            var encryptedKey = self.encryptKey(originalKey, password);

            self.hashPassword(password, userSalt)
                .then(function(passwordHash) {
                    return firebase.database().ref('users/' + user.uid + '/keyData').set({
                        passwordHash: passwordHash,
                        salt: userSalt,
                        encryptedKey: encryptedKey,
                        keyVersion: self._KEY_VERSION,
                        algorithm: 'aes-256-cbc-pbkdf2-sha256-600k',
                        iterations: self._PBKDF2_ITER,
                        createdAt: new Date().toISOString()
                    });
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
                .catch(function(err) {
                    reject(new Error('Failed to create key. Please try again.'));
                });
        });
    },

    /* ═══ UNLOCK KEY ═══ */
    unlockKey: function(user, password) {
        var self = this;
        return new Promise(function(resolve, reject) {
            if (!user || !user.uid) {
                reject(new Error('User required'));
                return;
            }

            firebase.database().ref('users/' + user.uid + '/keyData').once('value')
                .then(function(snap) {
                    var data = snap.val();
                    if (!data || !data.passwordHash || !data.salt || !data.encryptedKey) {
                        reject(new Error('No key found. Please create one.'));
                        return;
                    }

                    return self.hashPassword(password, data.salt).then(function(computed) {
                        /* Timing-safe comparison */
                        if (!self._timingSafeEqual(computed, data.passwordHash)) {
                            reject(new Error('Incorrect password'));
                            return;
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

                            resolve({
                                success: true,
                                key: originalKey,
                                displayKey: self._displayKey
                            });
                        } catch (e) {
                            reject(new Error('Incorrect password'));
                        }
                    });
                })
                .catch(function(err) {
                    reject(new Error('Failed to unlock key'));
                });
        });
    },

    /* ═══ MASKED KEY (for UI) ═══ */
    _makeMaskedKey: function(key) {
        if (!key || key.length < 40) return this._PREFIX + '************';
        /* Show prefix + first 5 chars, mask rest */
        return key.substring(0, 40) + '************';
    },

    /* ═══ DELETE KEY ═══ */
    deleteKey: function(user) {
        return new Promise(function(resolve, reject) {
            if (!user || !user.uid) {
                reject(new Error('User required'));
                return;
            }

            firebase.database().ref('users/' + user.uid + '/keyData').remove()
                .then(function() {
                    resolve({ success: true });
                })
                .catch(function(err) {
                    reject(new Error('Failed to delete key'));
                });
        });
    },

    /* ═══════════════════════════════════════════════════════
       GETTERS
       ═══════════════════════════════════════════════════════ */

    getKey: function() {
        if (!this._initialized || !this._key) {
            throw new Error('Key not initialized');
        }
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

    /* ═══ CLEAR (Logout) ═══ */
    clear: function() {
        this._key = null;
        this._encryptedKey = null;
        this._displayKey = null;
        this._email = null;
        this._userId = null;
        this._userSalt = null;
        this._aesSalt = null;
        this._initialized = false;
        this._hasPassword = false;
    }
};

window.KEY_MANAGER = KEY_MANAGER;

console.log('%c🔐 Key Manager v16 ULTRA SECURE loaded',
    'color:#00ff64;font-weight:bold;font-size:14px;');
console.log('%c⚡ AES-256-CBC | PBKDF2-SHA256 600K | Crypto-Secure RNG',
    'color:#ffd700;font-size:11px;');

})();
