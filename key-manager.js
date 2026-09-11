/* ═══════════════════════════════════════════════════════════
   key-manager.js — v15 HEAVY
   NightOrbit CodeForge
   
   SYSTEM:
   - Per-user unique key (random generated)
   - Key encrypted with user password (AES-256)
   - Password NEVER stored (only PBKDF2 hash in Firebase)
   - Key stored in Firebase (encrypted form)
   - Key revealed only with correct password
   - Delete Key → New password + New key
   - Firebase Realtime Database (with databaseURL)
   ═══════════════════════════════════════════════════════════ */

(function() {
'use strict';

var KEY_MANAGER = {
    /* ═══ CONFIG ═══ */
    _PREFIX: 'NightOrbitGyidi_houperSecret_',
    _PBKDF2_ITER: 250000,
    _PASSWORD_LEN: 20,
    
    /* ═══ STATE ═══ */
    _key: null,
    _encryptedKey: null,
    _displayKey: null,
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
        for (i = 0; i < 6; i++) result.push(digits.charAt(Math.floor(Math.random() * digits.length)));
        for (i = 0; i < 10; i++) result.push(letters.charAt(Math.floor(Math.random() * letters.length)));
        for (i = 0; i < 4; i++) result.push(symbols.charAt(Math.floor(Math.random() * symbols.length)));
        /* Fisher-Yates shuffle */
        for (i = result.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = result[i]; result[i] = result[j]; result[j] = temp;
        }
        return this._PREFIX + result.join('');
    },

    /* ═══ GENERATE USER SALT (32 bytes) ═══ */
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
        return new Promise(function(resolve) {
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
            window.crypto.subtle.importKey('raw', enc.encode(password), { name: 'PBKDF2' }, false, ['deriveBits'])
                .then(function(baseKey) {
                    return window.crypto.subtle.deriveBits({
                        name: 'PBKDF2',
                        salt: enc.encode(salt),
                        iterations: self._PBKDF2_ITER,
                        hash: 'SHA-256'
                    }, baseKey, 256);
                })
                .then(function(bits) {
                    var bytes = new Uint8Array(bits);
                    var hex = Array.prototype.map.call(bytes, function(b) {
                        return ('0' + b.toString(16)).slice(-2);
                    }).join('');
                    resolve(hex);
                })
                .catch(function() {
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
            return CryptoJS.AES.encrypt(originalKey, password).toString();
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
            throw new Error('Wrong password');
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

    /* ═══ CHECK KEY STATUS (Firebase) + AUTO-CLEANUP ═══ */
    checkKeyStatus: function(userId) {
        var self = this;
        return new Promise(function(resolve, reject) {
            firebase.database().ref('users/' + userId + '/keyData').once('value')
                .then(function(snap) {
                    var data = snap.val();
                    console.log('🔍 checkKeyStatus:', { userId: userId, hasData: !!data });
                    
                    if (data && data.passwordHash && data.salt && data.encryptedKey && data.keyVersion) {
                        /* ═══ SYNC STATE WITH FIREBASE ═══ */
                        self._hasPassword = true;
                        self._userId = userId;
                        self._userSalt = data.salt;
                        self._encryptedKey = data.encryptedKey;
                        self._displayKey = self._PREFIX + '************';
                        console.log('✅ Key found — state synced');
                        
                        resolve({
                            hasKey: true,
                            salt: data.salt,
                            encryptedKey: data.encryptedKey,
                            meta: data
                        });
                    } else {
                        /* Corrupted → auto-cleanup */
                        if (data) {
                            console.warn('⚠️ Corrupted keyData — auto-cleanup');
                            firebase.database().ref('users/' + userId + '/keyData').remove();
                        }
                        self._hasPassword = false;
                        self._displayKey = null;
                        console.log('❌ No key found');
                        
                        resolve({ hasKey: false, salt: null, encryptedKey: null, meta: null });
                    }
                })
                .catch(function(err) {
                    console.error('❌ checkKeyStatus error:', err);
                    reject(err);
                });
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
                        keyVersion: 15,
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
                    
                    console.log('✅ Key created and saved to Firebase');
                    resolve({
                        success: true,
                        key: originalKey,
                        displayKey: self._displayKey
                    });
                })
                .catch(function(err) {
                    console.error('❌ createKeyAndPassword error:', err);
                    reject(err);
                });
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
                            
                            console.log('✅ Key unlocked successfully');
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
                .catch(function(err) {
                    console.error('❌ unlockKey error:', err);
                    reject(err);
                });
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
                    console.log('🗑️ Key deleted from Firebase');
                    resolve({ success: true });
                })
                .catch(function(err) {
                    console.error('❌ deleteKey error:', err);
                    reject(err);
                });
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
        this._initialized = false;
        this._hasPassword = false;
        console.log('🧹 Key Manager state cleared');
    }
};

window.KEY_MANAGER = KEY_MANAGER;

console.log('%c🔐 Key Manager v15 HEAVY loaded', 'color:#00ff64;font-weight:bold;font-size:14px;');
console.log('%c⚡ PBKDF2 250K + AES-256 + Per-user random key', 'color:#ffd700;font-size:11px;');

})();
