/* ═══════════════════════════════════════════════════════════
   key-manager.js — v14 HEAVY
   NightOrbit CodeForge
   
   SYSTEM:
   - Per-user unique key (random generated, prefix + 20 chars)
   - Key encrypted with user password (AES-256)
   - Password NEVER stored (only PBKDF2 hash in Firebase)
   - Key stored in Firebase (encrypted form)
   - Key revealed only with correct password
   - Delete Key → New password + New key
   ═══════════════════════════════════════════════════════════ */

(function() {
'use strict';

var KEY_MANAGER = {
    /* ═══ CONFIG ═══ */
    _PREFIX: 'NightOrbitGyidi_houperSecret_',
    _PBKDF2_ITER: 250000,
    _KEY_RANDOM_LEN: 20,
    _PASSWORD_LEN: 20,
    
    /* ═══ STATE ═══ */
    _key: null,           /* Full key (RAM only, after unlock) */
    _encryptedKey: null,  /* Encrypted key (from Firebase) */
    _displayKey: null,    /* Masked display */
    _email: null,
    _userId: null,
    _initialized: false,
    _hasPassword: false,
    _userSalt: null,

    /* ═══ GENERATE RANDOM KEY ═══
       Format: NightOrbitGyidi_houperSecret_ + 20 random chars
       (6 digits + 10 letters + 4 symbols)
    */
    generateRandomKey: function() {
        var digits = '0123456789';
        var letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        var symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
        
        var result = [];
        var i;
        
        /* 6 digits */
        for (i = 0; i < 6; i++) {
            result.push(digits.charAt(Math.floor(Math.random() * digits.length)));
        }
        /* 10 letters */
        for (i = 0; i < 10; i++) {
            result.push(letters.charAt(Math.floor(Math.random() * letters.length)));
        }
        /* 4 symbols */
        for (i = 0; i < 4; i++) {
            result.push(symbols.charAt(Math.floor(Math.random() * symbols.length)));
        }
        
        /* Shuffle */
        for (i = result.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = result[i];
            result[i] = result[j];
            result[j] = temp;
        }
        
        return this._PREFIX + result.join('');
    },

    /* ═══ GENERATE USER SALT ═══ */
    generateUserSalt: function() {
        var arr = new Uint8Array(32);
        if (window.crypto && window.crypto.getRandomValues) {
            window.crypto.getRandomValues(arr);
        } else {
            for (var i = 0; i < 32; i++) arr[i] = Math.floor(Math.random() * 256);
        }
        return Array.prototype.map.call(arr, function(b) {
            return ('0' + b.toString(16)).slice(-2);
        }).join('');
    },

    /* ═══ HASH PASSWORD (PBKDF2 via Web Crypto) ═══ */
    hashPassword: function(password, salt) {
        var self = this;
        return new Promise(function(resolve, reject) {
            if (!window.crypto || !window.crypto.subtle) {
                /* Fallback: CryptoJS PBKDF2 */
                var hash = CryptoJS.PBKDF2(password, salt, {
                    keySize: 256 / 32,
                    iterations: self._PBKDF2_ITER,
                    hasher: CryptoJS.algo.SHA256
                }).toString(CryptoJS.enc.Hex);
                resolve(hash);
                return;
            }
            
            var enc = new TextEncoder();
            var saltBytes = enc.encode(salt);
            
            window.crypto.subtle.importKey(
                'raw',
                enc.encode(password),
                { name: 'PBKDF2' },
                false,
                ['deriveBits']
            ).then(function(baseKey) {
                return window.crypto.subtle.deriveBits(
                    {
                        name: 'PBKDF2',
                        salt: saltBytes,
                        iterations: self._PBKDF2_ITER,
                        hash: 'SHA-256'
                    },
                    baseKey,
                    256
                );
            }).then(function(bits) {
                var bytes = new Uint8Array(bits);
                var hex = Array.prototype.map.call(bytes, function(b) {
                    return ('0' + b.toString(16)).slice(-2);
                }).join('');
                resolve(hex);
            }).catch(function() {
                /* Fallback */
                var hash = CryptoJS.PBKDF2(password, salt, {
                    keySize: 256 / 32,
                    iterations: self._PBKDF2_ITER,
                    hasher: CryptoJS.algo.SHA256
                }).toString(CryptoJS.enc.Hex);
                resolve(hash);
            });
        });
    },

    /* ═══ ENCRYPT KEY (password se) ═══ */
    encryptKey: function(originalKey, password) {
        try {
            var encrypted = CryptoJS.AES.encrypt(originalKey, password).toString();
            return encrypted;
        } catch (e) {
            throw new Error('Key encryption failed: ' + e.message);
        }
    },

    /* ═══ DECRYPT KEY (password se) ═══ */
    decryptKey: function(encryptedKey, password) {
        try {
            var decrypted = CryptoJS.AES.decrypt(encryptedKey, password).toString(CryptoJS.enc.Utf8);
            if (!decrypted || decrypted.length === 0) {
                throw new Error('Wrong password');
            }
            return decrypted;
        } catch (e) {
            throw new Error('Key decryption failed: Wrong password');
        }
    },

    /* ═══ VALIDATE PASSWORD FORMAT ═══
       20 chars: 6 digits + 10 letters + 4 symbols
    */
    validatePasswordFormat: function(pwd) {
        if (!pwd || pwd.length !== this._PASSWORD_LEN) return false;
        var digits = (pwd.match(/\d/g) || []).length;
        var letters = (pwd.match(/[a-zA-Z]/g) || []).length;
        var symbols = (pwd.match(/[^a-zA-Z0-9]/g) || []).length;
        return digits === 6 && letters === 10 && symbols === 4;
    },

    /* ═══ CHECK KEY STATUS (Firebase) ═══ */
    checkKeyStatus: function(userId) {
        return new Promise(function(resolve, reject) {
            firebase.database().ref('users/' + userId + '/keyData').once('value')
                .then(function(snap) {
                    var data = snap.val();
                    if (data && data.passwordHash && data.salt && data.encryptedKey && data.keyVersion) {
                        resolve({
                            hasKey: true,
                            salt: data.salt,
                            encryptedKey: data.encryptedKey,
                            meta: data
                        });
                    } else {
                        /* Corrupted → auto-cleanup */
                        if (data) {
                            firebase.database().ref('users/' + userId + '/keyData').remove();
                        }
                        resolve({ hasKey: false, salt: null, encryptedKey: null, meta: null });
                    }
                })
                .catch(reject);
        });
    },

    /* ═══ CREATE KEY + PASSWORD (First Time) ═══ */
    createKeyAndPassword: function(user, password) {
        var self = this;
        return new Promise(function(resolve, reject) {
            if (!self.validatePasswordFormat(password)) {
                reject(new Error('Password must be 20 chars: 6 digits + 10 letters + 4 symbols'));
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
                        keyVersion: 14,
                        algorithm: 'aes-256-cbc-pbkdf2-sha256',
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
                .catch(reject);
        });
    },

    /* ═══ UNLOCK KEY (Password Se) ═══ */
    unlockKey: function(user, password) {
        var self = this;
        return new Promise(function(resolve, reject) {
            firebase.database().ref('users/' + user.uid + '/keyData').once('value')
                .then(function(snap) {
                    var data = snap.val();
                    if (!data || !data.passwordHash || !data.salt || !data.encryptedKey) {
                        reject(new Error('No key found. Please create one.'));
                        return;
                    }
                    
                    return self.hashPassword(password, data.salt).then(function(computed) {
                        if (computed !== data.passwordHash) {
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
                            reject(new Error('Wrong password'));
                        }
                    });
                })
                .catch(reject);
        });
    },

    /* ═══ MASKED KEY ═══ */
    _makeMaskedKey: function(key) {
        return key.substring(0, 35) + '************';
    },

    /* ═══ DELETE KEY (Purani key delete) ═══ */
    deleteKey: function(user) {
        return new Promise(function(resolve, reject) {
            firebase.database().ref('users/' + user.uid + '/keyData').remove()
                .then(function() {
                    resolve({ success: true });
                })
                .catch(reject);
        });
    },

    /* ═══ GETTERS ═══ */
    getKey: function() {
        if (!this._initialized || !this._key) {
            throw new Error('Key not initialized');
        }
        return this._key;
    },
    getDisplayKey: function() {
        return this._displayKey || 'NightOrbitGyidi_houperSecret_************';
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
        this._initialized = false;
        this._hasPassword = false;
    }
};

window.KEY_MANAGER = KEY_MANAGER;

console.log('%c🔐 Key Manager v14 HEAVY loaded', 'color:#00ff64;font-weight:bold;font-size:14px;');
console.log('%c⚡ Per-user random key + PBKDF2 250K + AES-256', 'color:#ffd700;font-size:11px;');

})();
