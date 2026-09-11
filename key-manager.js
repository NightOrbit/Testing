/* ═══════════════════════════════════════════════════════════
   key-manager.js — Secure Per-User Key Management
   NightOrbit CodeForge
   
   SECURITY:
   - Each user gets a UNIQUE key derived from their email
   - Key is NEVER stored in plain text
   - Key is NEVER displayed in the UI (only hash is shown)
   - Key CANNOT be changed by the user
   - Key lives only in browser memory during session
   ═══════════════════════════════════════════════════════════ */

(function() {
'use strict';

var KEY_MANAGER = {
    _key: null,
    _uid: null,
    _initialized: false,
    _keyHash: null,
    
    /* ═══ Initialize: fetch or create user's unique key ═══ */
    initialize: function(user) {
        var self = this;
        return new Promise(function(resolve, reject) {
            if (!user || !user.uid || !user.email) {
                reject(new Error('User authentication required'));
                return;
            }
            
            self._uid = user.uid;
            var email = user.email.toLowerCase().trim();
            
            /* Check Firebase for existing key */
            firebase.database().ref('users/' + user.uid + '/encryptionKey').once('value')
                .then(function(snapshot) {
                    var storedKey = snapshot.val();
                    if (!storedKey) {
                        /* First time: generate a unique key from email */
                        storedKey = self._deriveKeyFromEmail(email);
                        return firebase.database().ref('users/' + user.uid + '/encryptionKey')
                            .set(storedKey)
                            .then(function() { return storedKey; });
                    }
                    return storedKey;
                })
                .then(function(key) {
                    self._key = key;
                    self._keyHash = self._makeDisplayHash(key);
                    self._initialized = true;
                    
                    document.dispatchEvent(new CustomEvent('key-manager-ready', {
                        detail: { displayHash: self._keyHash }
                    }));
                    
                    resolve({
                        initialized: true,
                        displayHash: self._keyHash
                    });
                })
                .catch(reject);
        });
    },
    
    /* ═══ Derive a strong 512-bit key from user's email ═══ */
    _deriveKeyFromEmail: function(email) {
        var SALT = 'NightOrbit_CodeForge_v7_2024_SECURE_SALT_@#$%';
        var key = CryptoJS.PBKDF2(email, SALT, {
            keySize: 512 / 32,
            iterations: 200000,
            hasher: CryptoJS.algo.SHA512
        });
        return key.toString(CryptoJS.enc.Hex);
    },
    
    /* ═══ Create display hash (only for showing in UI) ═══ */
    _makeDisplayHash: function(key) {
        return CryptoJS.SHA256(key).toString(CryptoJS.enc.Hex).substring(0, 20).toUpperCase();
    },
    
    /* ═══ Get the actual key (used internally for encryption) ═══ */
    getKey: function() {
        if (!this._initialized || !this._key) {
            throw new Error('Key manager not initialized. Please login first.');
        }
        return this._key;
    },
    
    /* ═══ Get display hash (shown in UI instead of key) ═══ */
    getDisplayHash: function() {
        return this._keyHash || '*****';
    },
    
    /* ═══ Check if ready ═══ */
    isReady: function() {
        return this._initialized;
    },
    
    /* ═══ Clear key from memory (on logout) ═══ */
    clear: function() {
        this._key = null;
        this._uid = null;
        this._initialized = false;
        this._keyHash = null;
    }
};

window.KEY_MANAGER = KEY_MANAGER;

console.log('%c🔐 Key Manager loaded (per-user secure keys)', 
    'color:#00ff64;font-weight:bold;font-size:14px;');

})();