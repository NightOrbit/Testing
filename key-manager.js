/* ═══════════════════════════════════════════════════════════
   key-manager.js — v17 FINAL
   NightOrbit CodeForge

   DATA STORAGE (Firebase):
   - users/{uid}/profile/    → email, name, createdAt, lastLogin
   - users/{uid}/keyData/    → passwordHash, salt, encryptedKey (NO original password)
   - users/{uid}/settings/   → language, theme

   SECURITY:
   - Crypto-secure RNG
   - AES-256-CBC with random IV
   - PBKDF2-SHA256 600K iterations
   - Timing-safe comparison
   - Original password NEVER stored
   - Original key NEVER stored in plain
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
    _KEY_VERSION: 17,

    /* ═══ STATE ═══ */
    _key: null,
    _encryptedKey: null,
    _displayKey: null,
    _email: null,
    _userId: null,
    _initialized: false,
    _hasPassword: false,
    _userSalt: null,

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

    /* Legacy hash (250K) — for migration */
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
       AES-256 ENCRYPTION
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
            var aesSalt = CryptoJS.lib.WordArray.random(16);
            var iv = CryptoJS.lib.WordArray.random(16);
            var aesKey = this._deriveAESKey(password, aesSalt);

            var encrypted = CryptoJS.AES.encrypt(originalKey, aesKey, {
                iv: iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            });

            return aesSalt.toString() + ':' + iv.toString() + ':' + encrypted.toString();
        } catch (e) {
            throw new Error('Encryption failed');
        }
    },

    decryptKey: function(encryptedKey, password) {
        try {
            var parts = encryptedKey.split(':');
            if (parts.length !== 3) throw new Error('Invalid format');

            var aesSalt = CryptoJS.enc.Hex.parse(parts[0]);
            var iv = CryptoJS.enc.Hex.parse(parts[1]);
            var ciphertext = parts[2];

            var aesKey = this._deriveAESKey(password, aesSalt);
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

    /* Legacy decrypt (AES-128, no salt/IV) */
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
       FIREBASE OPERATIONS
       ═══════════════════════════════════════════════════════ */

    /* ═══ ENSURE USER PROFILE EXISTS ═══ */
    ensureUserProfile: function(user) {
        if (!user || !user.uid) return Promise.resolve();
        var profileRef = firebase.database().ref('users/' + user.uid + '/profile');

        return profileRef.once('value').then(function(snap) {
            var data = snap.val();
            if (!data || !data.email) {
                return profileRef.set({
                    email: user.email || '',
                    name: (user.email || '').split('@')[0] || 'User',
                    createdAt: new Date().toISOString(),
                    lastLogin: new Date().toISOString()
                });
            } else {
                /* Update last login */
                return profileRef.update({
                    lastLogin: new Date().toISOString()
                });
            }
        });
    },

    /* ═══ CHECK KEY STATUS ═══ */
    checkKeyStatus: function(userId) {
        var self = this;
        return new Promise(function(resolve, reject) {
            if (!userId) { reject(new Error('User ID required')); return; }

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
                            keyVersion: data.keyVersion,
                            meta: data
                        });
                    } else {
                        if (data) {
                            firebase.database().ref('users/' + userId + '/keyData').remove()
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

    /* ═══ CREATE KEY + PASSWORD ═══ */
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

            self.hashPassword(password, userSalt)
                .then(function(passwordHash) {
                    /* ═══ KEY DATA SECTION ═══ */
                    return firebase.database().ref('users/' + user.uid + '/keyData').set({
                        passwordHash: passwordHash,   /* ← Hash only, NOT original password */
                        salt: userSalt,
                        encryptedKey: encryptedKey,   /* ← Encrypted key, NOT plain */
                        keyVersion: self._KEY_VERSION,
                        algorithm: 'aes-256-cbc-pbkdf2-sha256-600k',
                        iterations: self._PBKDF2_ITER,
                        createdAt: new Date().toISOString()
                    });
                })
                .then(function() {
                    /* ═══ ENSURE PROFILE SECTION ═══ */
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

    /* ═══ UNLOCK KEY (with legacy migration) ═══ */
    unlockKey: function(user, password) {
        var self = this;
        return new Promise(function(resolve, reject) {
            if (!user || !user.uid) { reject(new Error('User required')); return; }

            firebase.database().ref('users/' + user.uid + '/keyData').once('value')
                .then(function(snap) {
                    var data = snap.val();
                    if (!data || !data.passwordHash || !data.salt || !data.encryptedKey) {
                        reject(new Error('No key found. Please create one.'));
                        return;
                    }

                    var isLegacy = !data.keyVersion || data.keyVersion < 17;

                    if (isLegacy) {
                        /* ═══ MIGRATE LEGACY KEY ═══ */
                        return self._hashPasswordLegacy(password, data.salt).then(function(computedLegacy) {
                            if (!self._timingSafeEqual(computedLegacy, data.passwordHash)) {
                                reject(new Error('Incorrect password'));
                                return;
                            }

                            try {
                                var originalKey = self._decryptKeyLegacy(data.encryptedKey, password);
                                var newEncryptedKey = self.encryptKey(originalKey, password);

                                return self.hashPassword(password, data.salt).then(function(newHash) {
                                    return firebase.database().ref('users/' + user.uid + '/keyData').update({
                                        passwordHash: newHash,
                                        encryptedKey: newEncryptedKey,
                                        keyVersion: self._KEY_VERSION,
                                        algorithm: 'aes-256-cbc-pbkdf2-sha256-600k',
                                        iterations: self._PBKDF2_ITER,
                                        migratedAt: new Date().toISOString()
                                    }).then(function() {
                                        self._key = originalKey;
                                        self._encryptedKey = newEncryptedKey;
                                        self._email = user.email;
                                        self._userId = user.uid;
                                        self._userSalt = data.salt;
                                        self._hasPassword = true;
                                        self._initialized = true;
                                        self._displayKey = self._makeMaskedKey(originalKey);

                                        resolve({
                                            success: true,
                                            key: originalKey,
                                            displayKey: self._displayKey,
                                            migrated: true
                                        });
                                    });
                                });
                            } catch (e) {
                                reject(new Error('Incorrect password'));
                            }
                        });
                    }

                    /* ═══ NORMAL UNLOCK ═══ */
                    return self.hashPassword(password, data.salt).then(function(computed) {
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
                                displayKey: self._displayKey,
                                migrated: false
                            });
                        } catch (e) {
                            reject(new Error('Incorrect password'));
                        }
                    });
                })
                .catch(function() {
                    reject(new Error('Failed to unlock key'));
                });
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

console.log('%c🔐 Key Manager v17 FINAL loaded',
    'color:#00ff64;font-weight:bold;font-size:14px;');
console.log('%c⚡ AES-256-CBC | PBKDF2-SHA256 600K | Crypto-Secure RNG',
    'color:#ffd700;font-size:11px;');

})();
