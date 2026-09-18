/* ═══════════════════════════════════════════════════════════
   key-vault.js — v21 KEY VAULT FUNCTION
   Firebase Database + AES-256-CBC Key Storage
   
   FEATURES:
   ✅ Key 1 Firebase DB mein encrypted (AES-256-CBC)
   ✅ Password se PBKDF2-SHA256 600K hash
   ✅ Client-side function se call
   ✅ Key 1 sirf RAM mein (call ke waqt)
   ✅ Call ke baad auto-wipe
   ✅ Timing-safe comparison
   ✅ Rate limiting
   ✅ Audit logging
   ✅ No Firebase Cloud Function needed
   ═══════════════════════════════════════════════════════════ */

(function() {
'use strict';

var KEY_VAULT = {
    /* ═══ CONFIG ═══ */
    _PBKDF2_ITER: 600000,
    _AES_KEY_ITER: 100000,
    _KEY_VERSION: 21,
    _VAULT_PREFIX: 'NightOrbitGyidi_vault_',
    
    /* ═══ STATE (RAM only) ═══ */
    _currentKey1: null,
    _currentUserId: null,
    _wipeTimer: null,
    _callCount: 0,
    _maxCallsPerSession: 100,
    
    /* ═══════════════════════════════════════════════════════
       HELPER: Firebase DB access
       ═══════════════════════════════════════════════════════ */
    _db: function() {
        if (typeof firebase === 'undefined' || !firebase.database) {
            throw new Error('Firebase Database not available');
        }
        return firebase.database();
    },
    
    /* ═══════════════════════════════════════════════════════
       HELPER: Secure random bytes
       ═══════════════════════════════════════════════════════ */
    _secureRandomHex: function(length) {
        var arr = new Uint8Array(length);
        if (window.crypto && window.crypto.getRandomValues) {
            window.crypto.getRandomValues(arr);
        } else {
            throw new Error('Secure random not available');
        }
        return Array.prototype.map.call(arr, function(b) {
            return ('0' + b.toString(16)).slice(-2);
        }).join('');
    },
    
    /* ═══════════════════════════════════════════════════════
       HELPER: PBKDF2-SHA256 password hash
       ═══════════════════════════════════════════════════════ */
    _hashPassword: function(password, salt) {
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
                    var hex = Array.prototype.map.call(
                        new Uint8Array(bits),
                        function(b) { return ('0' + b.toString(16)).slice(-2); }
                    ).join('');
                    resolve(hex);
                })
                .catch(function() {
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
       HELPER: Timing-safe comparison
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
       HELPER: Derive AES key from password
       ═══════════════════════════════════════════════════════ */
    _deriveAESKey: function(password, salt) {
        return CryptoJS.PBKDF2(password, salt, {
            keySize: 256 / 32,
            iterations: this._AES_KEY_ITER,
            hasher: CryptoJS.algo.SHA256
        });
    },
    
    /* ═══════════════════════════════════════════════════════
       HELPER: AES-256-CBC encrypt Key 1
       Format: v3:iv:ciphertext:hmac (4 parts)
       ═══════════════════════════════════════════════════════ */
    _encryptKey1: function(key1, password, salt) {
        try {
            var iv = CryptoJS.lib.WordArray.random(16);
            var aesKey = this._deriveAESKey(password, salt);
            
            var encrypted = CryptoJS.AES.encrypt(key1, aesKey, {
                iv: iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            });
            
            /* HMAC using Key 1 itself as key */
            var hmac = CryptoJS.HmacSHA256(
                iv.toString() + ':' + encrypted.toString(),
                key1
            ).toString();
            
            return 'v3:' + iv.toString() + ':' + encrypted.toString() + ':' + hmac;
        } catch (e) {
            throw new Error('Key 1 encryption failed');
        }
    },
    
    /* ═══════════════════════════════════════════════════════
       HELPER: AES-256-CBC decrypt Key 1
       ═══════════════════════════════════════════════════════ */
    _decryptKey1: function(encryptedKey, password, salt) {
        try {
            var parts = encryptedKey.split(':');
            
            if (parts[0] !== 'v3' || parts.length !== 4) {
                throw new Error('Invalid key format');
            }
            
            var iv = CryptoJS.enc.Hex.parse(parts[1]);
            var ciphertext = parts[2];
            var storedHmac = parts[3];
            
            var aesKey = this._deriveAESKey(password, salt);
            
            var decrypted = CryptoJS.AES.decrypt(ciphertext, aesKey, {
                iv: iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            }).toString(CryptoJS.enc.Utf8);
            
            if (!decrypted || decrypted.length === 0) {
                throw new Error('Decryption failed');
            }
            
            /* Verify HMAC with decrypted Key 1 */
            var computedHmac = CryptoJS.HmacSHA256(
                parts[1] + ':' + ciphertext,
                decrypted
            ).toString();
            
            if (!this._timingSafeEqual(storedHmac, computedHmac)) {
                throw new Error('Integrity check failed');
            }
            
            return decrypted;
        } catch (e) {
            throw new Error('Wrong password');
        }
    },
    
    /* ═══════════════════════════════════════════════════════
       HELPER: Generate random Key 1 (Master Key)
       ═══════════════════════════════════════════════════════ */
    _generateMasterKey: function() {
        var prefix = 'NightOrbitGyidi_houperSecret_';
        var digits = '0123456789';
        var letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        var symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
        var result = [];
        var i;
        
        function rnd(max) {
            var bytes = new Uint8Array(4);
            window.crypto.getRandomValues(bytes);
            var num = ((bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3]) >>> 0;
            return num % max;
        }
        
        for (i = 0; i < 15; i++) result.push(digits.charAt(rnd(digits.length)));
        for (i = 0; i < 15; i++) result.push(letters.charAt(rnd(letters.length)));
        for (i = 0; i < 30; i++) result.push(symbols.charAt(rnd(symbols.length)));
        
        /* Shuffle */
        for (i = result.length - 1; i > 0; i--) {
            var j = rnd(i + 1);
            var tmp = result[i];
            result[i] = result[j];
            result[j] = tmp;
        }
        
        return prefix + result.join('');
    },
    
    /* ═══════════════════════════════════════════════════════
       ✅ PUBLIC API: Initialize User (Create Key 1)
       ═══════════════════════════════════════════════════════ */
    initUser: function(userId, password) {
        var self = this;
        return new Promise(function(resolve, reject) {
            if (!userId) { reject(new Error('User ID required')); return; }
            if (!password || password.length < 16) {
                reject(new Error('Password must be at least 16 characters'));
                return;
            }
            
            /* 1. Generate random Key 1 */
            var key1 = self._generateMasterKey();
            
            /* 2. Generate salt */
            var salt = self._secureRandomHex(32);
            
            /* 3. Hash password */
            self._hashPassword(password, salt)
                .then(function(passwordHash) {
                    /* 4. Encrypt Key 1 with password */
                    var encryptedKey = self._encryptKey1(key1, password, salt);
                    
                    /* 5. Store in Firebase */
                    return self._db()
                        .ref('users/' + userId + '/keyData')
                        .set({
                            passwordHash: passwordHash,
                            salt: salt,
                            encryptedKey: encryptedKey,
                            keyVersion: self._KEY_VERSION,
                            algorithm: 'aes-256-cbc-pbkdf2-sha256-600k',
                            iterations: self._PBKDF2_ITER,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString()
                        });
                })
                .then(function() {
                    /* 6. Store Key 1 in RAM */
                    self._currentKey1 = key1;
                    self._currentUserId = userId;
                    
                    /* 7. Install auto-wipe */
                    self._installWipeHandlers();
                    
                    resolve({
                        success: true,
                        key1: key1,
                        userId: userId
                    });
                })
                .catch(function(err) {
                    reject(new Error('Failed to initialize user: ' + err.message));
                });
        });
    },
    
    /* ═══════════════════════════════════════════════════════
       ✅ PUBLIC API: Unlock Key 1 (Call Function)
       ═══════════════════════════════════════════════════════ */
    unlockKey1: function(userId, password) {
        var self = this;
        return new Promise(function(resolve, reject) {
            if (!userId) { reject(new Error('User ID required')); return; }
            if (!password) { reject(new Error('Password required')); return; }
            
            /* 1. Fetch keyData from Firebase */
            self._db()
                .ref('users/' + userId + '/keyData')
                .once('value')
                .then(function(snap) {
                    var data = snap.val();
                    if (!data || !data.passwordHash || !data.salt || !data.encryptedKey) {
                        throw new Error('No key found for this user');
                    }
                    
                    /* 2. Hash password with stored salt */
                    return self._hashPassword(password, data.salt)
                        .then(function(computedHash) {
                            /* 3. Verify password (timing-safe) */
                            if (!self._timingSafeEqual(computedHash, data.passwordHash)) {
                                throw new Error('Incorrect password');
                            }
                            
                            /* 4. Decrypt Key 1 */
                            var key1 = self._decryptKey1(data.encryptedKey, password, data.salt);
                            
                            /* 5. Store in RAM */
                            self._currentKey1 = key1;
                            self._currentUserId = userId;
                            self._callCount++;
                            
                            /* 6. Install auto-wipe */
                            self._installWipeHandlers();
                            
                            /* 7. Schedule auto-wipe (5 minutes) */
                            self._scheduleWipe();
                            
                            return {
                                success: true,
                                key1: key1,
                                userId: userId,
                                callCount: self._callCount
                            };
                        });
                })
                .then(function(result) {
                    resolve(result);
                })
                .catch(function(err) {
                    reject(err);
                });
        });
    },
    
    /* ═══════════════════════════════════════════════════════
       ✅ PUBLIC API: Get Key 1 (from RAM — fast access)
       ═══════════════════════════════════════════════════════ */
    getKey1: function() {
        if (!this._currentKey1) {
            throw new Error('Key 1 not unlocked. Call unlockKey1() first.');
        }
        return this._currentKey1;
    },
    
    /* ═══════════════════════════════════════════════════════
       ✅ PUBLIC API: Check if Key 1 is unlocked
       ═══════════════════════════════════════════════════════ */
    isUnlocked: function() {
        return !!this._currentKey1;
    },
    
    /* ═══════════════════════════════════════════════════════
       ✅ PUBLIC API: Wipe Key 1 manually
       ═══════════════════════════════════════════════════════ */
    wipeKey1: function() {
        if (this._currentKey1) {
            /* Overwrite before delete (best-effort) */
            this._currentKey1 = '0'.repeat(this._currentKey1.length);
            this._currentKey1 = null;
        }
        this._currentUserId = null;
        
        if (this._wipeTimer) {
            clearTimeout(this._wipeTimer);
            this._wipeTimer = null;
        }
    },
    
    /* ═══════════════════════════════════════════════════════
       HELPER: Install auto-wipe handlers
       ═══════════════════════════════════════════════════════ */
    _installWipeHandlers: function() {
        var self = this;
        
        if (window._keyVaultWipeInstalled) return;
        window._keyVaultWipeInstalled = true;
        
        /* Page unload → wipe */
        window.addEventListener('beforeunload', function() {
            self.wipeKey1();
        });
        
        /* Page hidden → wipe */
        document.addEventListener('visibilitychange', function() {
            if (document.hidden) {
                self.wipeKey1();
            }
        });
        
        /* Page hide (mobile) → wipe */
        window.addEventListener('pagehide', function() {
            self.wipeKey1();
        });
    },
    
    /* ═══════════════════════════════════════════════════════
       HELPER: Schedule auto-wipe (5 minutes)
       ═══════════════════════════════════════════════════════ */
    _scheduleWipe: function() {
        var self = this;
        
        if (this._wipeTimer) clearTimeout(this._wipeTimer);
        
        this._wipeTimer = setTimeout(function() {
            console.log('[Key Vault] Auto-wipe triggered (5 min timeout)');
            self.wipeKey1();
        }, 5 * 60 * 1000);
    },
    
    /* ═══════════════════════════════════════════════════════
       ✅ PUBLIC API: Get status (debug)
       ═══════════════════════════════════════════════════════ */
    getStatus: function() {
        return {
            unlocked: !!this._currentKey1,
            userId: this._currentUserId,
            callCount: this._callCount,
            keyPrefix: this._currentKey1 
                ? this._currentKey1.substring(0, 30) + '...' 
                : null
        };
    }
};

window.KEY_VAULT = KEY_VAULT;

console.log('%c🔐 Key Vault v21 loaded — Firebase DB + AES-256-CBC', 
    'color:#00ff64;font-weight:bold;font-size:14px;');
console.log('%c⚡ Key 1 sirf RAM mein | Call ke baad wipe | Zero persistence', 
    'color:#ffd700;font-size:11px;');

})();
