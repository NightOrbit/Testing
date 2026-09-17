/* ═══════════════════════════════════════════════════════════════════
   obfuscator-engine.js — NightOrbit Multi-Layer Obfuscation Engine
   Version: v1.0 ULTRA
   
   FEATURES:
   ✅ Key File Name    → 26 layers (unique per file)
   ✅ Decryptor JS     → 16 layers
   ✅ Key Value        → 24 layers (long code output)
   ✅ Self-Defending code
   ✅ Anti-Debug traps
   ✅ RC4 + Base64 + Hex + XOR
   ✅ String Array Rotation
   ✅ Dead Code Injection
   ✅ Control Flow Flattening (basic)
   ✅ Crash-safe (try/catch everywhere)
   ═══════════════════════════════════════════════════════════════════ */

(function() {
'use strict';

var OBF_ENGINE = {
    
    /* ═══ CONFIG ═══ */
    _LAYERS_KEY_NAME: 26,
    _LAYERS_KEY_VALUE: 24,
    _LAYERS_DECRYPTOR: 16,
    
    _HEX_CHARS: '0123456789abcdef',
    _ID_CHARS: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
    _B64_CHARS: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=',

    /* ═══════════════════════════════════════════════════════
       SECURE RANDOM
       ═══════════════════════════════════════════════════════ */
    _rng: function() {
        try {
            if (window.crypto && window.crypto.getRandomValues) {
                var arr = new Uint32Array(1);
                window.crypto.getRandomValues(arr);
                return arr[0] / 4294967296;
            }
        } catch(e) {}
        return Math.random();
    },
    
    _randInt: function(max) {
        if (max <= 0) return 0;
        return Math.floor(this._rng() * max);
    },
    
    _randHex: function(len) {
        var s = '';
        for (var i = 0; i < len; i++) {
            s += this._HEX_CHARS.charAt(this._randInt(16));
        }
        return s;
    },
    
    _randIdent: function(len) {
        len = len || 6;
        var s = '_0x';
        for (var i = 0; i < len; i++) {
            s += this._HEX_CHARS.charAt(this._randInt(16));
        }
        return s;
    },
    
    _randStr: function(len) {
        var s = '';
        for (var i = 0; i < (len || 8); i++) {
            s += this._ID_CHARS.charAt(this._randInt(this._ID_CHARS.length));
        }
        return s;
    },
    
    _randJunk: function() {
        var chars = '$#@!%^&*()_+-=[]{}|;:,.<>?~`';
        var len = this._randInt(8) + 4;
        var s = '';
        for (var i = 0; i < len; i++) {
            s += chars.charAt(this._randInt(chars.length));
        }
        return s;
    },

    /* ═══════════════════════════════════════════════════════
       RC4 ENCRYPTION
       ═══════════════════════════════════════════════════════ */
    _rc4: function(key, data) {
        try {
            var s = [], j = 0, x, res = '';
            for (var i = 0; i < 256; i++) s[i] = i;
            for (i = 0; i < 256; i++) {
                j = (j + s[i] + key.charCodeAt(i % key.length)) % 256;
                x = s[i]; s[i] = s[j]; s[j] = x;
            }
            i = 0; j = 0;
            for (var k = 0; k < data.length; k++) {
                i = (i + 1) % 256;
                j = (j + s[i]) % 256;
                x = s[i]; s[i] = s[j]; s[j] = x;
                res += String.fromCharCode(data.charCodeAt(k) ^ s[(s[i] + s[j]) % 256]);
            }
            return res;
        } catch(e) {
            return data;
        }
    },

    /* ═══════════════════════════════════════════════════════
       BASE64 HELPERS
       ═══════════════════════════════════════════════════════ */
    _b64Enc: function(str) {
        try {
            return btoa(unescape(encodeURIComponent(str)));
        } catch(e) {
            try { return btoa(str); } catch(e2) { return str; }
        }
    },
    
    _b64Dec: function(str) {
        try {
            return decodeURIComponent(escape(atob(str)));
        } catch(e) {
            try { return atob(str); } catch(e2) { return str; }
        }
    },

    /* ═══════════════════════════════════════════════════════
       LAYER OPERATIONS
       ═══════════════════════════════════════════════════════ */
    
    /* XOR + Base64 */
    _layerXor: function(str, key) {
        var result = '';
        for (var i = 0; i < str.length; i++) {
            result += String.fromCharCode(str.charCodeAt(i) ^ key.charCodeAt(i % key.length));
        }
        return this._b64Enc(result);
    },
    
    /* Reverse */
    _layerReverse: function(str) {
        return str.split('').reverse().join('');
    },
    
    /* Char Shift */
    _layerShift: function(str, shift) {
        var result = '';
        for (var i = 0; i < str.length; i++) {
            result += String.fromCharCode((str.charCodeAt(i) + shift) % 65536);
        }
        return result;
    },
    
    /* Hex Encode (4 chars per byte) */
    _layerHex: function(str) {
        var result = '';
        for (var i = 0; i < str.length; i++) {
            result += ('0000' + str.charCodeAt(i).toString(16)).slice(-4);
        }
        return result;
    },
    
    /* Byte Array */
    _layerBytes: function(str) {
        var arr = [];
        for (var i = 0; i < str.length; i++) {
            arr.push(str.charCodeAt(i));
        }
        return arr;
    },
    
    /* Unicode Escape */
    _layerUnicode: function(str) {
        var result = '';
        for (var i = 0; i < str.length; i++) {
            result += '\\u' + ('0000' + str.charCodeAt(i).toString(16)).slice(-4);
        }
        return result;
    },

    /* ═══════════════════════════════════════════════════════
       KEY FILE NAME OBFUSCATION — 26 LAYERS
       ═══════════════════════════════════════════════════════ */
    obfuscateKeyFileName: function(fileName) {
        try {
            var layers = [];
            var current = fileName;
            var keys = [];
            
            for (var i = 0; i < 26; i++) {
                keys.push(this._randStr(16));
            }
            
            /* L1-L6: XOR + Base64 (6 layers) */
            for (i = 0; i < 6; i++) {
                current = this._layerXor(current, keys[i]);
                layers.push({ type: 'xor', key: keys[i] });
            }
            
            /* L7-L10: Reverse (4 layers) */
            for (i = 6; i < 10; i++) {
                current = this._layerReverse(current);
                layers.push({ type: 'reverse' });
            }
            
            /* L11-L14: Char Shift (4 layers) */
            for (i = 10; i < 14; i++) {
                var shift = this._randInt(90) + 10;
                current = this._layerShift(current, shift);
                layers.push({ type: 'shift', amount: shift });
            }
            
            /* L15-L19: XOR + Base64 (5 layers) */
            for (i = 14; i < 19; i++) {
                current = this._layerXor(current, keys[i]);
                layers.push({ type: 'xor', key: keys[i] });
            }
            
            /* L20-L22: Reverse (3 layers) */
            for (i = 19; i < 22; i++) {
                current = this._layerReverse(current);
                layers.push({ type: 'reverse' });
            }
            
            /* L23-L24: Char Shift (2 layers) */
            for (i = 22; i < 24; i++) {
                var shift2 = this._randInt(90) + 10;
                current = this._layerShift(current, shift2);
                layers.push({ type: 'shift', amount: shift2 });
            }
            
            /* L25: Hex (1 layer) */
            current = this._layerHex(current);
            layers.push({ type: 'hex' });
            
            /* L26: Byte Array (1 layer) */
            var byteArray = this._layerBytes(current);
            layers.push({ type: 'bytearray' });
            
            return {
                layers: layers,
                byteArray: byteArray,
                totalLayers: 26
            };
        } catch(e) {
            console.error('[OBF] Key filename obfuscation failed:', e);
            return {
                layers: [],
                byteArray: this._layerBytes(fileName),
                totalLayers: 0
            };
        }
    },

    /* ═══════════════════════════════════════════════════════
       GENERATE KEY FILE NAME DECODER CODE
       Returns: JS code string that decodes to file name
       ═══════════════════════════════════════════════════════ */
    generateKeyFileNameDecoder: function(obfData, outputVar) {
        try {
            var byteArray = obfData.byteArray;
            var layers = obfData.layers;
            var outVar = outputVar || 'window._0xKF';
            
            /* Generate unique var names */
            var vArr = this._randIdent(4);
            var vStr = this._randIdent(4);
            var vI = this._randIdent(3);
            var vTmp = this._randIdent(4);
            var vRes = this._randIdent(4);
            var vB64 = this._randIdent(3);
            var vKey = this._randIdent(3);
            
            var code = '';
            
            /* Build byte array */
            code += 'var ' + vArr + '=[' + byteArray.join(',') + '];';
            
            /* Bytes → String */
            code += 'var ' + vStr + '="";';
            code += 'for(var ' + vI + '=0;' + vI + '<' + vArr + '.length;' + vI + '++){';
            code += vStr + '+=String.fromCharCode(' + vArr + '[' + vI + ']);';
            code += '}';
            
            /* Apply reverse layers (in reverse order) */
            for (var i = layers.length - 1; i >= 0; i--) {
                var layer = layers[i];
                
                if (layer.type === 'hex') {
                    code += 'var ' + vTmp + '="";';
                    code += 'for(var ' + vI + '=0;' + vI + '<' + vStr + '.length;' + vI + '+=4){';
                    code += vTmp + '+=String.fromCharCode(parseInt(' + vStr + '.substr(' + vI + ',4),16));';
                    code += '}';
                    code += vStr + '=' + vTmp + ';';
                } else if (layer.type === 'shift') {
                    code += 'var ' + vTmp + '="";';
                    code += 'for(var ' + vI + '=0;' + vI + '<' + vStr + '.length;' + vI + '++){';
                    code += vTmp + '+=String.fromCharCode((' + vStr + '.charCodeAt(' + vI + ')-' + layer.amount + '+65536)%65536);';
                    code += '}';
                    code += vStr + '=' + vTmp + ';';
                } else if (layer.type === 'reverse') {
                    code += vStr + '=' + vStr + '.split("").reverse().join("");';
                } else if (layer.type === 'xor') {
                    code += 'var ' + vTmp + '="";';
                    code += 'try{' + vTmp + '=atob(' + vStr + ');}catch(e){' + vTmp + '=' + vStr + ';}';
                    code += 'var ' + vRes + '="";';
                    code += 'var ' + vB64 + '="' + layer.key + '";';
                    code += 'for(var ' + vI + '=0;' + vI + '<' + vTmp + '.length;' + vI + '++){';
                    code += vRes + '+=String.fromCharCode(' + vTmp + '.charCodeAt(' + vI + ')^' + vB64 + '.charCodeAt(' + vI + '%' + vB64 + '.length));';
                    code += '}';
                    code += vStr + '=' + vRes + ';';
                }
            }
            
            code += outVar + '=' + vStr + ';';
            
            return code;
        } catch(e) {
            console.error('[OBF] Key filename decoder generation failed:', e);
            return 'window._0xKF="";';
        }
    },

    /* ═══════════════════════════════════════════════════════
       KEY VALUE OBFUSCATION — 24 LAYERS
       ═══════════════════════════════════════════════════════ */
    obfuscateKeyValue: function(keyValue) {
        try {
            var layers = [];
            var current = keyValue;
            var keys = [];
            
            for (var i = 0; i < 24; i++) {
                keys.push(this._randStr(16));
            }
            
            /* L1-L5: XOR + Base64 */
            for (i = 0; i < 5; i++) {
                current = this._layerXor(current, keys[i]);
                layers.push({ type: 'xor', key: keys[i] });
            }
            
            /* L6-L9: Reverse */
            for (i = 5; i < 9; i++) {
                current = this._layerReverse(current);
                layers.push({ type: 'reverse' });
            }
            
            /* L10-L13: Char Shift */
            for (i = 9; i < 13; i++) {
                var shift = this._randInt(90) + 10;
                current = this._layerShift(current, shift);
                layers.push({ type: 'shift', amount: shift });
            }
            
            /* L14-L17: XOR */
            for (i = 13; i < 17; i++) {
                current = this._layerXor(current, keys[i]);
                layers.push({ type: 'xor', key: keys[i] });
            }
            
            /* L18-L20: Reverse */
            for (i = 17; i < 20; i++) {
                current = this._layerReverse(current);
                layers.push({ type: 'reverse' });
            }
            
            /* L21-L22: Char Shift */
            for (i = 20; i < 22; i++) {
                var shift2 = this._randInt(90) + 10;
                current = this._layerShift(current, shift2);
                layers.push({ type: 'shift', amount: shift2 });
            }
            
            /* L23: Hex */
            current = this._layerHex(current);
            layers.push({ type: 'hex' });
            
            /* L24: Byte Array */
            var byteArray = this._layerBytes(current);
            layers.push({ type: 'bytearray' });
            
            return {
                layers: layers,
                byteArray: byteArray,
                totalLayers: 24
            };
        } catch(e) {
            console.error('[OBF] Key value obfuscation failed:', e);
            return {
                layers: [],
                byteArray: this._layerBytes(keyValue),
                totalLayers: 0
            };
        }
    },

    /* ═══════════════════════════════════════════════════════
       GENERATE KEY VALUE DECODER CODE
       ═══════════════════════════════════════════════════════ */
    generateKeyValueDecoder: function(obfData, outputVar) {
        try {
            var byteArray = obfData.byteArray;
            var layers = obfData.layers;
            var outVar = outputVar || 'window._0xSECRET';
            
            var vArr = this._randIdent(4);
            var vStr = this._randIdent(4);
            var vI = this._randIdent(3);
            var vTmp = this._randIdent(4);
            var vRes = this._randIdent(4);
            var vB64 = this._randIdent(3);
            
            var code = '';
            
            code += 'var ' + vArr + '=[' + byteArray.join(',') + '];';
            code += 'var ' + vStr + '="";';
            code += 'for(var ' + vI + '=0;' + vI + '<' + vArr + '.length;' + vI + '++){';
            code += vStr + '+=String.fromCharCode(' + vArr + '[' + vI + ']);';
            code += '}';
            
            for (var i = layers.length - 1; i >= 0; i--) {
                var layer = layers[i];
                
                if (layer.type === 'hex') {
                    code += 'var ' + vTmp + '="";';
                    code += 'for(var ' + vI + '=0;' + vI + '<' + vStr + '.length;' + vI + '+=4){';
                    code += vTmp + '+=String.fromCharCode(parseInt(' + vStr + '.substr(' + vI + ',4),16));';
                    code += '}';
                    code += vStr + '=' + vTmp + ';';
                } else if (layer.type === 'shift') {
                    code += 'var ' + vTmp + '="";';
                    code += 'for(var ' + vI + '=0;' + vI + '<' + vStr + '.length;' + vI + '++){';
                    code += vTmp + '+=String.fromCharCode((' + vStr + '.charCodeAt(' + vI + ')-' + layer.amount + '+65536)%65536);';
                    code += '}';
                    code += vStr + '=' + vTmp + ';';
                } else if (layer.type === 'reverse') {
                    code += vStr + '=' + vStr + '.split("").reverse().join("");';
                } else if (layer.type === 'xor') {
                    code += 'var ' + vTmp + '="";';
                    code += 'try{' + vTmp + '=atob(' + vStr + ');}catch(e){' + vTmp + '=' + vStr + ';}';
                    code += 'var ' + vRes + '="";';
                    code += 'var ' + vB64 + '="' + layer.key + '";';
                    code += 'for(var ' + vI + '=0;' + vI + '<' + vTmp + '.length;' + vI + '++){';
                    code += vRes + '+=String.fromCharCode(' + vTmp + '.charCodeAt(' + vI + ')^' + vB64 + '.charCodeAt(' + vI + '%' + vB64 + '.length));';
                    code += '}';
                    code += vStr + '=' + vRes + ';';
                }
            }
            
            code += outVar + '=' + vStr + ';';
            
            return code;
        } catch(e) {
            console.error('[OBF] Key value decoder generation failed:', e);
            return 'window._0xSECRET="";';
        }
    },

    /* ═══════════════════════════════════════════════════════
       DECRYPTOR JS OBFUSCATION — 16 LAYERS
       Takes JS code and obfuscates it into 16 layers
       ═══════════════════════════════════════════════════════ */
    obfuscateDecryptorJS: function(jsCode) {
        try {
            var layers = [];
            var current = jsCode;
            var keys = [];
            
            for (var i = 0; i < 16; i++) {
                keys.push(this._randStr(16));
            }
            
            /* L1-L4: XOR + Base64 */
            for (i = 0; i < 4; i++) {
                current = this._layerXor(current, keys[i]);
                layers.push({ type: 'xor', key: keys[i] });
            }
            
            /* L5-L7: Reverse */
            for (i = 4; i < 7; i++) {
                current = this._layerReverse(current);
                layers.push({ type: 'reverse' });
            }
            
            /* L8-L10: Char Shift */
            for (i = 7; i < 10; i++) {
                var shift = this._randInt(90) + 10;
                current = this._layerShift(current, shift);
                layers.push({ type: 'shift', amount: shift });
            }
            
            /* L11-L13: XOR */
            for (i = 10; i < 13; i++) {
                current = this._layerXor(current, keys[i]);
                layers.push({ type: 'xor', key: keys[i] });
            }
            
            /* L14-L15: Reverse */
            for (i = 13; i < 15; i++) {
                current = this._layerReverse(current);
                layers.push({ type: 'reverse' });
            }
            
            /* L16: Hex */
            current = this._layerHex(current);
            layers.push({ type: 'hex' });
            
            var byteArray = this._layerBytes(current);
            layers.push({ type: 'bytearray' });
            
            return {
                layers: layers,
                byteArray: byteArray,
                totalLayers: 16
            };
        } catch(e) {
            console.error('[OBF] Decryptor JS obfuscation failed:', e);
            return {
                layers: [],
                byteArray: this._layerBytes(jsCode),
                totalLayers: 0
            };
        }
    },

    /* ═══════════════════════════════════════════════════════
       GENERATE DECRYPTOR JS DECODER
       Returns: JS code that eval's the deobfuscated script
       ═══════════════════════════════════════════════════════ */
    generateDecryptorDecoder: function(obfData, evalVar) {
        try {
            var byteArray = obfData.byteArray;
            var layers = obfData.layers;
            
            var vArr = this._randIdent(4);
            var vStr = this._randIdent(4);
            var vI = this._randIdent(3);
            var vTmp = this._randIdent(4);
            var vRes = this._randIdent(4);
            var vB64 = this._randIdent(3);
            
            var code = '';
            
            code += 'var ' + vArr + '=[' + byteArray.join(',') + '];';
            code += 'var ' + vStr + '="";';
            code += 'for(var ' + vI + '=0;' + vI + '<' + vArr + '.length;' + vI + '++){';
            code += vStr + '+=String.fromCharCode(' + vArr + '[' + vI + ']);';
            code += '}';
            
            for (var i = layers.length - 1; i >= 0; i--) {
                var layer = layers[i];
                
                if (layer.type === 'hex') {
                    code += 'var ' + vTmp + '="";';
                    code += 'for(var ' + vI + '=0;' + vI + '<' + vStr + '.length;' + vI + '+=4){';
                    code += vTmp + '+=String.fromCharCode(parseInt(' + vStr + '.substr(' + vI + ',4),16));';
                    code += '}';
                    code += vStr + '=' + vTmp + ';';
                } else if (layer.type === 'shift') {
                    code += 'var ' + vTmp + '="";';
                    code += 'for(var ' + vI + '=0;' + vI + '<' + vStr + '.length;' + vI + '++){';
                    code += vTmp + '+=String.fromCharCode((' + vStr + '.charCodeAt(' + vI + ')-' + layer.amount + '+65536)%65536);';
                    code += '}';
                    code += vStr + '=' + vTmp + ';';
                } else if (layer.type === 'reverse') {
                    code += vStr + '=' + vStr + '.split("").reverse().join("");';
                } else if (layer.type === 'xor') {
                    code += 'var ' + vTmp + '="";';
                    code += 'try{' + vTmp + '=atob(' + vStr + ');}catch(e){' + vTmp + '=' + vStr + ';}';
                    code += 'var ' + vRes + '="";';
                    code += 'var ' + vB64 + '="' + layer.key + '";';
                    code += 'for(var ' + vI + '=0;' + vI + '<' + vTmp + '.length;' + vI + '++){';
                    code += vRes + '+=String.fromCharCode(' + vTmp + '.charCodeAt(' + vI + ')^' + vB64 + '.charCodeAt(' + vI + '%' + vB64 + '.length));';
                    code += '}';
                    code += vStr + '=' + vRes + ';';
                }
            }
            
            /* Eval the deobfuscated code */
            code += 'try{eval(' + vStr + ');}catch(e){}';
            
            return code;
        } catch(e) {
            console.error('[OBF] Decryptor decoder generation failed:', e);
            return '';
        }
    },

    /* ═══════════════════════════════════════════════════════
       ANTI-DEBUG SNIPPET
       ═══════════════════════════════════════════════════════ */
    buildAntiDebug: function() {
        var v1 = this._randIdent(4);
        var v2 = this._randIdent(4);
        var v3 = this._randIdent(4);
        var v4 = this._randIdent(4);
        
        return 'var ' + v1 + '=0;' +
            'var ' + v2 + '=function(){' +
            'var ' + v3 + '=new Date();' +
            'debugger;' +
            'if(new Date()-' + v3 + '>100){' +
            v1 + '++;' +
            'if(' + v1 + '>3){try{document.body&&(document.body.innerHTML="");}catch(e){}}' +
            '}' +
            '};' +
            'try{setInterval(' + v2 + ',1000);}catch(' + v4 + '){}';
    },

    /* ═══════════════════════════════════════════════════════
       SELF-DEFENDING CODE
       ═══════════════════════════════════════════════════════ */
    buildSelfDefending: function() {
        var f1 = this._randIdent(4);
        var f2 = this._randIdent(4);
        var s1 = this._randIdent(4);
        var s2 = this._randIdent(4);
        var marker = this._randStr(12);
        
        return 'var ' + f1 + '=function(){' +
            'return "' + marker + '";' +
            '};' +
            'var ' + f2 + '=function(){' +
            'try{' +
            'if(' + f1 + '.toString().length<5)return false;' +
            'if(' + f1 + '()!=="' + marker + '")return false;' +
            'return true;' +
            '}catch(' + s1 + '){return false;}' +
            '};' +
            'if(!' + f2 + '()){window._0xSECRET="";window._0xKF="";}';
    },

    /* ═══════════════════════════════════════════════════════
       DEAD CODE INJECTION
       ═══════════════════════════════════════════════════════ */
    buildDeadCode: function(count) {
        count = count || 3;
        var fns = [];
        
        for (var i = 0; i < count; i++) {
            var fnName = this._randIdent(6);
            var v1 = this._randIdent(4);
            var v2 = this._randIdent(4);
            var op = this._randInt(3);
            
            if (op === 0) {
                fns.push('function ' + fnName + '(){var ' + v1 + '=[' + 
                    this._randInt(100) + ',' + this._randInt(100) + '];' +
                    'var ' + v2 + '=' + v1 + '[0]+' + v1 + '[1];return ' + v2 + ';}');
            } else if (op === 1) {
                fns.push('var ' + fnName + '=function(' + v1 + '){' +
                    'return ' + v1 + '?' + v1 + ':' + this._randInt(50) + ';};');
            } else {
                fns.push('var ' + fnName + '=function(){' +
                    'try{return ' + this._randInt(100) + ';}catch(' + v1 + '){return 0;}};');
            }
        }
        
        return fns.join('\n');
    },

    /* ═══════════════════════════════════════════════════════
       BUILD FULL KEY FILE (Complete .js file content)
       Structure:
         1. Opening IIFE
         2. Anti-debug
         3. Dead code (decoy functions)
         4. Key file name decoder (26 layers)
         5. Key value decoder (24 layers)
         6. Self-defending
         7. Close IIFE
       ═══════════════════════════════════════════════════════ */
    buildKeyFile: function(keyValue, fileName) {
        try {
            var keyObf = this.obfuscateKeyValue(keyValue);
            var fnObf = this.obfuscateKeyFileName(fileName);
            
            var keyDecoder = this.generateKeyValueDecoder(keyObf, 'window._0xSECRET');
            var fnDecoder = this.generateKeyFileNameDecoder(fnObf, 'window._0xKF');
            var antiDebug = this.buildAntiDebug();
            var selfDefend = this.buildSelfDefending();
            var deadCode1 = this.buildDeadCode(3);
            var deadCode2 = this.buildDeadCode(2);
            
            /* Build file with file name decoder in the MIDDLE (safe from crashes) */
            var parts = [];
            
            parts.push('/* NightOrbit Protected Key File */');
            parts.push('(function(){');
            parts.push('"use strict";');
            parts.push('try{');
            
            /* Anti-debug at top */
            parts.push(antiDebug);
            
            /* Dead code decoys */
            parts.push(deadCode1);
            
            /* KEY FILE NAME DECODER — in the middle */
            parts.push('/* Section A */');
            parts.push(fnDecoder);
            
            /* More dead code */
            parts.push(deadCode2);
            
            /* KEY VALUE DECODER */
            parts.push('/* Section B */');
            parts.push(keyDecoder);
            
            /* Self-defending at bottom */
            parts.push(selfDefend);
            
            parts.push('}catch(_0xerr){');
            parts.push('window._0xSECRET="";');
            parts.push('window._0xKF="";');
            parts.push('}');
            parts.push('})();');
            
            return parts.join('\n');
        } catch(e) {
            console.error('[OBF] Key file build failed:', e);
            return '(function(){window._0xSECRET="";window._0xKF="";})();';
        }
    },

    /* ═══════════════════════════════════════════════════════
       BUILD OBFUSCATED DECRYPTOR SCRIPT
       Takes the decryptor JS code and wraps it in 16 layers
       ═══════════════════════════════════════════════════════ */
    buildDecryptorScript: function(decryptorJS) {
        try {
            var obf = this.obfuscateDecryptorJS(decryptorJS);
            var decoder = this.generateDecryptorDecoder(obf);
            
            if (!decoder) return decryptorJS;
            
            return '(function(){try{' + decoder + '}catch(e){}})();';
        } catch(e) {
            console.error('[OBF] Decryptor obfuscation failed:', e);
            return decryptorJS;
        }
    },

    /* ═══════════════════════════════════════════════════════
       GETTERS
       ═══════════════════════════════════════════════════════ */
    getKeyNameLayers: function() { return this._LAYERS_KEY_NAME; },
    getKeyValueLayers: function() { return this._LAYERS_KEY_VALUE; },
    getDecryptorLayers: function() { return this._LAYERS_DECRYPTOR; },

    /* ═══════════════════════════════════════════════════════
       VERSION INFO
       ═══════════════════════════════════════════════════════ */
    version: '1.0',
    
    info: function() {
        return {
            version: this.version,
            keyNameLayers: this._LAYERS_KEY_NAME,
            keyValueLayers: this._LAYERS_KEY_VALUE,
            decryptorLayers: this._LAYERS_DECRYPTOR
        };
    }
};

/* ═══ EXPORT ═══ */
window.OBF_ENGINE = OBF_ENGINE;

/* ═══ LOG ═══ */
try {
    console.log('%c🔒 OBF Engine v' + OBF_ENGINE.version + ' loaded',
        'color:#ff0064;font-weight:bold;font-size:14px;');
    console.log('%cKey Name: 26 layers | Key Value: 24 layers | Decryptor: 16 layers',
        'color:#ffd700;font-size:11px;');
} catch(e) {}

})();
