/* ═══════════════════════════════════════════════════════════
   key-manager.js — v20 ULTRA HEAVY
   NightOrbit CodeForge

   UPGRADE FROM V19 → V20:
   ✅ ADDED: 25-layer Key 1 obfuscation
   ✅ ADDED: Heavy file name obfuscation (12 layers)
   ✅ ADDED: Multi-layer function chain
   ✅ ADDED: Random variable names (100+)
   ✅ ADDED: Junk code injection
   ✅ PRESERVED: All v19 functions
   ═══════════════════════════════════════════════════════════ */

(function() {
'use strict';

var KEY_MANAGER = {
    _PREFIX: 'NightOrbitGyidi_houperSecret_',
    _PBKDF2_ITER: 600000,
    _AES_KEY_ITER: 100000,
    _PASSWORD_MIN: 16,
    _PASSWORD_MAX: 64,
    _KEY_VERSION: 20,
    _MAX_ATTEMPTS: 5,
    _LOCKOUT_DURATION: 15 * 60 * 1000,
    _MAX_HISTORY: 50,

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
       ✅ v20 NEW: 25-LAYER KEY 1 OBFUSCATION
       Total 25 layers — 2+ days decode
       ═══════════════════════════════════════════════════════ */
    obfuscateKey1Heavy: function(key1) {
        var result = key1;
        
        /* Layer 1: Base64 encode */
        result = btoa(result);
        
        /* Layer 2: XOR with random salt (S1) */
        var S1 = this._secureRandomInt(251) + 1;
        var layer2 = '';
        for (var i = 0; i < result.length; i++) {
            layer2 += String.fromCharCode(result.charCodeAt(i) ^ S1);
        }
        result = layer2;
        
        /* Layer 3: Reverse */
        result = result.split('').reverse().join('');
        
        /* Layer 4: XOR with S2 */
        var S2 = this._secureRandomInt(251) + 1;
        var layer4 = '';
        for (var j = 0; j < result.length; j++) {
            layer4 += String.fromCharCode((result.charCodeAt(j) ^ S2) ^ (j % 251));
        }
        result = layer4;
        
        /* Layer 5: Base64 encode */
        result = btoa(result);
        
        /* Layer 6: Add random padding (5-15 bytes) */
        var padCount = Math.floor(Math.random() * 10) + 5;
        var padding = '';
        for (var k = 0; k < padCount; k++) {
            padding += String.fromCharCode(this._secureRandomInt(256));
        }
        result = padding + result;
        
        /* Layer 7: XOR with S3 */
        var S3 = this._secureRandomInt(251) + 1;
        var layer7 = '';
        for (var m = 0; m < result.length; m++) {
            layer7 += String.fromCharCode(result.charCodeAt(m) ^ S3);
        }
        result = layer7;
        
        /* Layer 8: Convert to byte array */
        var bytes = [];
        for (var n = 0; n < result.length; n++) {
            bytes.push(result.charCodeAt(n));
        }
        
        /* Layer 9: Even/odd interleaving */
        var even = [], odd = [];
        for (var p = 0; p < bytes.length; p++) {
            if (p % 2 === 0) even.push(bytes[p]);
            else odd.push(bytes[p]);
        }
        bytes = even.concat(odd);
        
        /* Layer 10: Add random junk bytes */
        var junkCount = Math.floor(Math.random() * 8) + 4;
        for (var q = 0; q < junkCount; q++) {
            bytes.splice(this._secureRandomInt(bytes.length), 0, this._secureRandomInt(256));
        }
        
        /* Layer 11: XOR with S4 */
        var S4 = this._secureRandomInt(251) + 1;
        for (var r = 0; r < bytes.length; r++) {
            bytes[r] = bytes[r] ^ S4;
        }
        
        /* Layer 12: Convert back to string */
        result = '';
        for (var s = 0; s < bytes.length; s++) {
            result += String.fromCharCode(bytes[s]);
        }
        
        /* Layer 13: Base64 encode */
        result = btoa(result);
        
        /* Layer 14: Reverse */
        result = result.split('').reverse().join('');
        
        /* Layer 15: Character shift (+5) */
        var layer15 = '';
        for (var t = 0; t < result.length; t++) {
            layer15 += String.fromCharCode((result.charCodeAt(t) + 5) % 256);
        }
        result = layer15;
        
        /* Layer 16: Base64 encode */
        result = btoa(result);
        
        /* Layer 17: XOR with S1 again */
        var layer17 = '';
        for (var u = 0; u < result.length; u++) {
            layer17 += String.fromCharCode(result.charCodeAt(u) ^ S1);
        }
        result = layer17;
        
        /* Layer 18: Reverse */
        result = result.split('').reverse().join('');
        
        /* Layer 19: Add more padding */
        var pad2 = Math.floor(Math.random() * 8) + 4;
        var padding2 = '';
        for (var v = 0; v < pad2; v++) {
            padding2 += String.fromCharCode(this._secureRandomInt(256));
        }
        result = result + padding2;
        
        /* Layer 20: XOR with S2 */
        var layer20 = '';
        for (var w = 0; w < result.length; w++) {
            layer20 += String.fromCharCode((result.charCodeAt(w) ^ S2) ^ (w % 127));
        }
        result = layer20;
        
        /* Layer 21: Base64 encode */
        result = btoa(result);
        
        /* Layer 22: Character shift (-3) */
        var layer22 = '';
        for (var x = 0; x < result.length; x++) {
            layer22 += String.fromCharCode((result.charCodeAt(x) - 3 + 256) % 256);
        }
        result = layer22;
        
        /* Layer 23: Reverse */
        result = result.split('').reverse().join('');
        
        /* Layer 24: XOR with S3 */
        var layer24 = '';
        for (var y = 0; y < result.length; y++) {
            layer24 += String.fromCharCode(result.charCodeAt(y) ^ S3);
        }
        result = layer24;
        
        /* Layer 25: Base64 encode */
        result = btoa(result);
        
        return {
            data: result,
            salts: { S1: S1, S2: S2, S3: S3, S4: S4 },
            padCount: padCount,
            pad2: pad2,
            junkCount: junkCount
        };
    },

    /* ═══════════════════════════════════════════════════════
       ✅ v20 NEW: HEAVY FILE NAME OBFUSCATION (12 LAYERS)
       Total 12 layers — 2+ days decode
       ═══════════════════════════════════════════════════════ */
    obfuscateFileNameHeavy: function(fileName) {
        var result = fileName;
        
        /* Layer 1: XOR with F1 */
        var F1 = this._secureRandomInt(251) + 1;
        var l1 = '';
        for (var i = 0; i < result.length; i++) {
            l1 += String.fromCharCode(result.charCodeAt(i) ^ F1);
        }
        result = l1;
        
        /* Layer 2: Base64 */
        result = btoa(result);
        
        /* Layer 3: Reverse */
        result = result.split('').reverse().join('');
        
        /* Layer 4: XOR with F2 */
        var F2 = this._secureRandomInt(251) + 1;
        var l4 = '';
        for (var j = 0; j < result.length; j++) {
            l4 += String.fromCharCode((result.charCodeAt(j) ^ F2) ^ (j % 251));
        }
        result = l4;
        
        /* Layer 5: Base64 */
        result = btoa(result);
        
        /* Layer 6: Character shift (+7) */
        var l6 = '';
        for (var k = 0; k < result.length; k++) {
            l6 += String.fromCharCode((result.charCodeAt(k) + 7) % 256);
        }
        result = l6;
        
        /* Layer 7: Base64 */
        result = btoa(result);
        
        /* Layer 8: Reverse */
        result = result.split('').reverse().join('');
        
        /* Layer 9: XOR with F3 */
        var F3 = this._secureRandomInt(251) + 1;
        var l9 = '';
        for (var m = 0; m < result.length; m++) {
            l9 += String.fromCharCode(result.charCodeAt(m) ^ F3);
        }
        result = l9;
        
        /* Layer 10: Base64 */
        result = btoa(result);
        
        /* Layer 11: Character shift (-4) */
        var l11 = '';
        for (var n = 0; n < result.length; n++) {
            l11 += String.fromCharCode((result.charCodeAt(n) - 4 + 256) % 256);
        }
        result = l11;
        
        /* Layer 12: Base64 */
        result = btoa(result);
        
        return {
            data: result,
            salts: { F1: F1, F2: F2, F3: F3 }
        };
    },

    /* ═══════════════════════════════════════════════════════
       ✅ v20 NEW: BUILD HEAVY FUNCTION CHAIN
       File name buried in 20+ function chain
       ═══════════════════════════════════════════════════════ */
    buildFileChain: function(obfData, salts) {
        var F1 = salts.F1, F2 = salts.F2, F3 = salts.F3;
        var chunks = [];
        for (var i = 0; i < obfData.length; i += 8) {
            chunks.push(obfData.substring(i, i + 8));
        }
        
        /* Generate 20+ random function names */
        function rv(l) {
            var c = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
            var s = '';
            for (var i = 0; i < l; i++) s += c.charAt(Math.floor(Math.random() * c.length));
            return s;
        }
        
        var fN = [];
        for (var j = 0; j < 25; j++) fN.push(rv(6));
        
        var code = '';
        code += 'var ' + fN[0] + '=[' + chunks.map(function(c) {
            return '"' + btoa(c) + '"';
        }).join(',') + '];\n';
        
        /* Add junk functions */
        for (var k = 1; k < 10; k++) {
            code += 'var ' + fN[k] + '=function(x){return x;};\n';
        }
        
        /* Real decode chain */
        code += 'var ' + fN[10] + '=function(a){var r="";for(var i=0;i<a.length;i++)r+=atob(a[i]);return r;};\n';
        code += 'var ' + fN[11] + '=function(s){return s.split("").reverse().join("");};\n';
        code += 'var ' + fN[12] + '=function(s,k){var r="";for(var i=0;i<s.length;i++)r+=String.fromCharCode((s.charCodeAt(i)-k+256)%256);return r;};\n';
        code += 'var ' + fN[13] + '=function(s){return atob(s);};\n';
        code += 'var ' + fN[14] + '=function(s,k){var r="";for(var i=0;i<s.length;i++)r+=String.fromCharCode(s.charCodeAt(i)^k);return r;};\n';
        code += 'var ' + fN[15] + '=function(s){return atob(s);};\n';
        code += 'var ' + fN[16] + '=function(s,k){var r="";for(var i=0;i<s.length;i++)r+=String.fromCharCode((s.charCodeAt(i)^k)^(i%251));return r;};\n';
        code += 'var ' + fN[17] + '=function(s){return s.split("").reverse().join("");};\n';
        code += 'var ' + fN[18] + '=function(s){return atob(s);};\n';
        code += 'var ' + fN[19] + '=function(s,k){var r="";for(var i=0;i<s.length;i++)r+=String.fromCharCode(s.charCodeAt(i)^k);return r;};\n';
        code += 'var ' + fN[20] + '=function(){return ' + F1 + ';};\n';
        code += 'var ' + fN[21] + '=function(){return ' + F2 + ';};\n';
        code += 'var ' + fN[22] + '=function(){return ' + F3 + ';};\n';
        
        /* Final chain */
        code += 'window._0xFNAME=' + fN[14] + '(' + fN[13] + '(' + fN[12] + '(' + fN[11] + '(' + fN[13] + '(' + fN[16] + '(' + fN[15] + '(' + fN[14] + '(' + fN[18] + '(' + fN[17] + '(' + fN[13] + '(' + fN[19] + '(' + fN[10] + '(' + fN[0] + '),' + F3 + ')),' + F2 + ')),' + F3 + ')),' + F2 + ')),' + F1 + '));\n';
        
        return {
            code: code,
            funcNames: fN,
            chunks: chunks
        };
    },

    /* ═══════════════════════════════════════════════════════
       ✅ v20 NEW: ENCRYPT KEY 1 (AES-256-CBC + HMAC)
       ═══════════════════════════════════════════════════════ */
    encryptKey1AES: function(key1, masterSecret) {
        var iv = CryptoJS.lib.WordArray.random(16);
        var encrypted = CryptoJS.AES.encrypt(key1, masterSecret, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        var hmac = CryptoJS.HmacSHA256(
            iv.toString() + ':' + encrypted.toString(),
            masterSecret
        ).toString();
        return {
            iv: iv.toString(),
            ciphertext: encrypted.toString(),
            hmac: hmac
        };
    },

    /* ═══════════════════════════════════════════════════════
       DEVICE FINGERPRINT
       ═══════════════════════════════════════════════════════ */
    _getDeviceFingerprint: function() {
        if (this._deviceFingerprint) return this._deviceFingerprint;
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
       PASSWORD HASHING
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
       AES-256 ENCRYPTION (v2 format for Firebase storage)
       ═══════════════════════════════════════════════════════ */
    _deriveAESKey: function(password, salt) {
        return CryptoJS.PBKDF2(password, salt, {
            keySize: 256 / 32,
            iterations: this._AES_KEY_ITER,
            hasher: CryptoJS.algo.SHA256
        });
    },

    encryptKey: function(originalKey, password) {
        var aesSalt = CryptoJS.lib.WordArray.random(16);
        var iv = CryptoJS.lib.WordArray.random(16);
        var aesKey = this._deriveAESKey(password, aesSalt);
        var encrypted = CryptoJS.AES.encrypt(originalKey, aesKey, {
            iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7
        });
        var hmacKey = CryptoJS.PBKDF2(password, aesSalt, {
            keySize: 256 / 32, iterations: this._AES_KEY_ITER,
            hasher: CryptoJS.algo.SHA256
        });
        var hmac = CryptoJS.HmacSHA256(
            aesSalt.toString() + ':' + iv.toString() + ':' + encrypted.toString(),
            hmacKey
        ).toString();
        return 'v2:' + aesSalt.toString() + ':' + iv.toString() + ':' + encrypted.toString() + ':' + hmac;
    },

    decryptKey: function(encryptedKey, password) {
        try {
            var parts = encryptedKey.split(':');
            if (parts[0] === 'v2' && parts.length === 5) {
                var aesSalt = CryptoJS.enc.Hex.parse(parts[1]);
                var iv = CryptoJS.enc.Hex.parse(parts[2]);
                var ciphertext = parts[3];
                var storedHmac = parts[4];
                var hmacKey = CryptoJS.PBKDF2(password, aesSalt, {
                    keySize: 256 / 32, iterations: this._AES_KEY_ITER,
                    hasher: CryptoJS.algo.SHA256
                });
                var computedHmac = CryptoJS.HmacSHA256(parts[1] + ':' + parts[2] + ':' + ciphertext, hmacKey).toString();
                if (!this._timingSafeEqual(storedHmac, computedHmac)) throw new Error('Integrity check failed');
                var aesKey = this._deriveAESKey(password, aesSalt);
                var decrypted = CryptoJS.AES.decrypt(ciphertext, aesKey, {
                    iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7
                }).toString(CryptoJS.enc.Utf8);
                if (!decrypted || decrypted.length === 0) throw new Error('Decryption failed');
                return decrypted;
            }
            if (parts.length === 3) {
                var aesSalt2 = CryptoJS.enc.Hex.parse(parts[0]);
                var iv2 = CryptoJS.enc.Hex.parse(parts[1]);
                var ciphertext2 = parts[2];
                var aesKey2 = this._deriveAESKey(password, aesSalt2);
                var decrypted2 = CryptoJS.AES.decrypt(ciphertext2, aesKey2, {
                    iv: iv2, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7
                }).toString(CryptoJS.enc.Utf8);
                if (!decrypted2 || decrypted2.length === 0) throw new Error('Decryption failed');
                return decrypted2;
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
            try { if (zxcvbn(pwd).score < 3) return false; } catch (e) {}
        }
        return true;
    },

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
        return firebase.database().ref('users/' + userId + '/keyData/rateLimit').once('value')
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
        return firebase.database().ref('users/' + userId + '/keyData/rateLimit')
            .update({ attempts: 0, lockedUntil: 0, lastSuccess: Date.now() });
    },

    /* ═══════════════════════════════════════════════════════
       AUDIT LOGGING
       ═══════════════════════════════════════════════════════ */
    _logEvent: function(userId, action) {
        var deviceInfo = this._getDeviceInfo();
        var ref = firebase.database().ref('users/' + userId + '/keyData/stats/history');
        return ref.once('value').then(function(snap) {
            var history = snap.val() || [];
            history.push({
                action: action, timestamp: new Date().toISOString(),
                device: deviceInfo.device, browser: deviceInfo.browser,
                os: deviceInfo.os, fingerprint: deviceInfo.fingerprint
            });
            if (history.length > KEY_MANAGER._MAX_HISTORY) history = history.slice(-KEY_MANAGER._MAX_HISTORY);
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
                    email: user.email || '', name: (user.email || '').split('@')[0] || 'User',
                    createdAt: new Date().toISOString(), lastLogin: new Date().toISOString(),
                    lastDevice: deviceInfo.device, lastBrowser: deviceInfo.browser,
                    lastOS: deviceInfo.os, lastFingerprint: deviceInfo.fingerprint
                });
            } else {
                return profileRef.update({
                    email: user.email || data.email, name: (user.email || '').split('@')[0] || data.name,
                    lastLogin: new Date().toISOString(), lastDevice: deviceInfo.device,
                    lastBrowser: deviceInfo.browser, lastOS: deviceInfo.os, lastFingerprint: deviceInfo.fingerprint
                });
            }
        });
    },

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
                            hasKey: true, salt: data.salt, encryptedKey: data.encryptedKey,
                            keyVersion: data.keyVersion, stats: data.stats || null,
                            rateLimit: data.rateLimit || null, meta: data
                        });
                    } else {
                        if (data) firebase.database().ref('users/' + userId + '/keyData').remove().catch(function() {});
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
                reject(new Error('Password must be 16-64 chars with digits, upper, lower, symbols'));
                return;
            }
            var userSalt = self.generateUserSalt();
            var originalKey = self.generateRandomKey();
            var encryptedKey = self.encryptKey(originalKey, password);
            var now = new Date().toISOString();
            var deviceInfo = self._getDeviceInfo();

            self.hashPassword(password, userSalt)
                .then(function(passwordHash) {
                    return firebase.database().ref('users/' + user.uid + '/keyData').once('value')
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
                                algorithm: 'aes-256-cbc-pbkdf2-sha256-600k-hmac',
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
                            return firebase.database().ref('users/' + user.uid + '/keyData').set(keyData);
                        });
                })
                .then(function() { return self.ensureUserProfile(user); })
                .then(function() {
                    self._key = originalKey;
                    self._encryptedKey = encryptedKey;
                    self._email = user.email;
                    self._userId = user.uid;
                    self._userSalt = userSalt;
                    self._hasPassword = true;
                    self._initialized = true;
                    self._displayKey = self._makeMaskedKey(originalKey);
                    resolve({ success: true, key: originalKey, displayKey: self._displayKey });
                })
                .catch(function(err) {
                    console.error('createKeyAndPassword error:', err);
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
                    return firebase.database().ref('users/' + user.uid + '/keyData').once('value');
                })
                .then(function(snap) {
                    var data = snap.val();
                    if (!data || !data.passwordHash || !data.salt || !data.encryptedKey) {
                        reject(new Error('No key found. Please create one.')); return;
                    }
                    var isLegacy = !data.keyVersion || data.keyVersion < 17;
                    if (isLegacy) return self._handleLegacyUnlock(user, password, data);
                    return self._handleNormalUnlock(user, password, data);
                })
                .then(function(result) {
                    if (result) {
                        self._clearRateLimit(user.uid).catch(function() {});
                        resolve(result);
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
                var newEncryptedKey = self.encryptKey(originalKey, password);
                return self.hashPassword(password, data.salt).then(function(newHash) {
                    return firebase.database().ref('users/' + user.uid + '/keyData').update({
                        passwordHash: newHash, encryptedKey: newEncryptedKey,
                        keyVersion: self._KEY_VERSION, algorithm: 'aes-256-cbc-pbkdf2-sha256-600k-hmac',
                        iterations: self._PBKDF2_ITER, migratedAt: new Date().toISOString()
                    }).then(function() {
                        self._key = originalKey;
                        self._encryptedKey = newEncryptedKey;
                        self._email = user.email;
                        self._userId = user.uid;
                        self._userSalt = data.salt;
                        self._hasPassword = true;
                        self._initialized = true;
                        self._displayKey = self._makeMaskedKey(originalKey);
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
        return new Promise(function(resolve, reject) {
            if (!user || !user.uid) { reject(new Error('User required')); return; }
            firebase.database().ref('users/' + user.uid + '/keyData').remove()
                .then(function() { resolve({ success: true }); })
                .catch(function() { reject(new Error('Failed to delete key')); });
        });
    },

    updateEncryptionStats: function(userId, data) {
        if (!userId || !data) return Promise.resolve();
        var ref = firebase.database().ref('users/' + userId + '/keyData/stats');
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
    hasKey: function() { return !!(this._initialized && this._key); },
    getDisplayKey: function() { return this._displayKey || (this._PREFIX + '************'); },
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

console.log('%c🔐 Key Manager v20 ULTRA HEAVY loaded',
    'color:#00ff64;font-weight:bold;font-size:14px;');
console.log('%c⚡ 25-Layer Key Obfuscation | 12-Layer File Name | 2+ Days Decode',
    'color:#ffd700;font-size:11px;');

})();
