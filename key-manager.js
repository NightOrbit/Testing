/* ═══════════════════════════════════════════════════════════
   key-manager.js — Secure Password-Based Key Management
   NightOrbit CodeForge
   
   SECURITY FEATURES:
   - Per-user unique key (from email + password)
   - Password NEVER stored (only hash in Firebase)
   - Key NEVER displayed (only masked format)
   - Key NEVER saved to any file
   - Password recovery IMPOSSIBLE
   - Brute-force protection (500,000 iterations)
   ═══════════════════════════════════════════════════════════ */

(function() {
'use strict';

var KEY_MANAGER = {
    _key: null,           // Full derived key (memory only)
    _displayKey: null,    // Masked display key
    _email: null,
    _userId: null,
    _initialized: false,
    _hasPassword: false,

    /* ═══ SALT (fixed, part of algorithm) ═══ */
    _SALT: 'NightOrbit_CodeForge_v9_2024_MASTER_SALT_@#$%^&*',
    _ITERATIONS: 500000,

    /* ═══ STEP 1: Check if user already created password ═══ */
    checkPasswordStatus: function(userId) {
        var self = this;
        return new Promise(function(resolve, reject) {
            firebase.database().ref('users/' + userId + '/passwordHash').once('value')
                .then(function(snapshot) {
                    var hash = snapshot.val();
                    resolve({
                        hasPassword: !!hash,
                        hash: hash || null
                    });
                })
                .catch(reject);
        });
    },

    /* ═══ STEP 2: Create new password (first time) ═══ */
    createPassword: function(user, password) {
        var self = this;
        return new Promise(function(resolve, reject) {
            /* Validate password */
            var validation = self._validatePassword(password);
            if (!validation.valid) {
                reject(new Error(validation.message));
                return;
            }

            /* Hash password (SHA-256) */
            var passwordHash = CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);

            /* Save hash to Firebase */
            firebase.database().ref('users/' + user.uid + '/passwordHash').set(passwordHash)
                .then(function() {
                    /* Derive full key */
                    self._deriveKey(user.email, password);
                    self._email = user.email;
                    self._userId = user.uid;
                    self._hasPassword = true;
                    self._initialized = true;

                    resolve({
                        success: true,
                        displayKey: self._displayKey
                    });
                })
                .catch(reject);
        });
    },

    /* ═══ STEP 3: Verify password (on login) ═══ */
    verifyPassword: function(user, password) {
        var self = this;
        return new Promise(function(resolve, reject) {
            var passwordHash = CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);

            firebase.database().ref('users/' + user.uid + '/passwordHash').once('value')
                .then(function(snapshot) {
                    var storedHash = snapshot.val();
                    if (!storedHash) {
                        reject(new Error('No password found for this account.'));
                        return;
                    }
                    if (storedHash !== passwordHash) {
                        reject(new Error('Incorrect password. Access denied.'));
                        return;
                    }

                    /* Password correct — derive key */
                    self._deriveKey(user.email, password);
                    self._email = user.email;
                    self._userId = user.uid;
                    self._hasPassword = true;
                    self._initialized = true;

                    resolve({
                        success: true,
                        displayKey: self._displayKey
                    });
                })
                .catch(reject);
        });
    },

    /* ═══ Validate password format ═══ */
    _validatePassword: function(password) {
        if (!password || typeof password !== 'string') {
            return { valid: false, message: 'Password is required.' };
        }

        /* Must be exactly 14 characters */
        if (password.length !== 14) {
            return { valid: false, message: 'Password must be exactly 14 characters (10 digits + 4 symbols).' };
        }

        /* Count digits */
        var digits = (password.match(/\d/g) || []).length;
        /* Count symbols */
        var symbols = (password.match(/[^a-zA-Z0-9]/g) || []).length;
        /* Count letters (should be 0) */
        var letters = (password.match(/[a-zA-Z]/g) || []).length;

        if (digits !== 10) {
            return { valid: false, message: 'Password must contain exactly 10 digits (numbers).' };
        }
        if (symbols !== 4) {
            return { valid: false, message: 'Password must contain exactly 4 symbols (e.g., @#$%).' };
        }
        if (letters !== 0) {
            return { valid: false, message: 'Password must NOT contain any letters.' };
        }

        return { valid: true };
    },

    /* ═══ Derive full key from email + password ═══ */
    _deriveKey: function(email, password) {
        /* Combine email + password */
        var combined = email.toLowerCase().trim() + '::' + password;

        /* PBKDF2 with 500,000 iterations (very slow for brute-force) */
        var key = CryptoJS.PBKDF2(combined, this._SALT, {
            keySize: 512 / 32,       /* 512 bits = 128 hex chars */
            iterations: 500000,
            hasher: CryptoJS.algo.SHA512
        });

        this._key = key.toString(CryptoJS.enc.Hex);
        this._displayKey = this._makeDisplayKey(this._key);
    },

    /* ═══ Create masked display key ═══ */
    _makeDisplayKey: function(key) {
        /* Format: NightOrbit_*****_***********
           (NightOrbit_ + 5 stars + _ + 11 stars = fixed format) */
        return 'NightOrbit_*****_***********';
    },

    /* ═══ Get key for encryption (internal use) ═══ */
    getKey: function() {
        if (!this._initialized || !this._key) {
            throw new Error('Key not initialized. Please login first.');
        }
        return this._key;
    },

    /* ═══ Get display key (safe to show) ═══ */
    getDisplayKey: function() {
        return this._displayKey || 'NightOrbit_*****_***********';
    },

    /* ═══ Get user info ═══ */
    getEmail: function() { return this._email; },
    getUserId: function() { return this._userId; },
    isReady: function() { return this._initialized; },
    hasPassword: function() { return this._hasPassword; },

    /* ═══ Clear on logout ═══ */
    clear: function() {
        this._key = null;
        this._displayKey = null;
        this._email = null;
        this._userId = null;
        this._initialized = false;
        this._hasPassword = false;
    }
};

window.KEY_MANAGER = KEY_MANAGER;

console.log('%c🔐 Key Manager v9 loaded (password-based keys)', 
    'color:#00ff64;font-weight:bold;font-size:14px;');

})();
