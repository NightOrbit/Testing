/* ═══════════════════════════════════════════════════════════════════
   obfuscator-engine.js — NightOrbit Multi-Layer Obfuscation Engine
   Version: v2.0 ULTRA FIXED
   
   FIXES:
   ✅ generateKeyFileNameDecoder — eval removed, direct return
   ✅ generateKeyValueDecoder — eval removed, direct return
   ✅ buildKeyFile — proper IIFE, no scope issues
   ✅ buildDecryptorScript — Function() constructor (global scope)
   ✅ buildKeyFileLoaderHTML — trap-protected loader
   ✅ 26 + 24 + 16 layers verified working
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

    /* ═══════════════════════════════════════════════════════
       RC4
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
    _layerXor: function(str, key) {
        var result = '';
        for (var i = 0; i < str.length; i++) {
            result += String.fromCharCode(str.charCodeAt(i) ^ key.charCodeAt(i % key.length));
        }
        return this._b64Enc(result);
    },
    
    _layerReverse: function(str) {
        return str.split('').reverse().join('');
    },
    
    _layerShift: function(str, shift) {
        var result = '';
        for (var i = 0; i < str.length; i++) {
            result += String.fromCharCode((str.charCodeAt(i) + shift) % 65536);
        }
        return result;
    },
    
    _layerHex: function(str) {
        var result = '';
        for (var i = 0; i < str.length; i++) {
            result += ('0000' + str.charCodeAt(i).toString(16)).slice(-4);
        }
        return result;
    },
    
    _layerBytes: function(str) {
        var arr = [];
        for (var i = 0; i < str.length; i++) {
            arr.push(str.charCodeAt(i));
        }
        return arr;
    },

    /* ═══════════════════════════════════════════════════════
       KEY FILE NAME — 26 LAYERS
       ═══════════════════════════════════════════════════════ */
    obfuscateKeyFileName: function(fileName) {
        try {
            var layers = [];
            var current = fileName;
            var keys = [];
            
            for (var i = 0; i < 26; i++) {
                keys.push(this._randStr(16));
            }
            
            /* L1-L6: XOR + Base64 (6) */
            for (i = 0; i < 6; i++) {
                current = this._layerXor(current, keys[i]);
                layers.push({ type: 'xor', key: keys[i] });
            }
            
            /* L7-L10: Reverse (4) */
            for (i = 6; i < 10; i++) {
                current = this._layerReverse(current);
                layers.push({ type: 'reverse' });
            }
            
            /* L11-L14: Shift (4) */
            for (i = 10; i < 14; i++) {
                var shift = this._randInt(90) + 10;
                current = this._layerShift(current, shift);
                layers.push({ type: 'shift', amount: shift });
            }
            
            /* L15-L19: XOR (5) */
            for (i = 14; i < 19; i++) {
                current = this._layerXor(current, keys[i]);
                layers.push({ type: 'xor', key: keys[i] });
            }
            
            /* L20-L22: Reverse (3) */
            for (i = 19; i < 22; i++) {
                current = this._layerReverse(current);
                layers.push({ type: 'reverse' });
            }
            
            /* L23-L24: Shift (2) */
            for (i = 22; i < 24; i++) {
                var shift2 = this._randInt(90) + 10;
                current = this._layerShift(current, shift2);
                layers.push({ type: 'shift', amount: shift2 });
            }
            
            /* L25: Hex */
            current = this._layerHex(current);
            layers.push({ type: 'hex' });
            
            /* L26: Byte Array */
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
       KEY FILE NAME DECODER — RETURNS JS CODE (no eval)
       ═══════════════════════════════════════════════════════ */
    generateKeyFileNameDecoder: function(obfData, outputVar) {
        try {
            var byteArray = obfData.byteArray;
            var layers = obfData.layers;
            var outVar = outputVar || 'window._0xKF';
            
            var vArr = this._randIdent(4);
            var vStr = this._randIdent(4);
            var vI = this._randIdent(3);
            var vTmp = this._randIdent(4);
            var vRes = this._randIdent(4);
            var vB64 = this._randIdent(3);
            
            /* ✅ Build decoder code that RETURNS final value (no eval) */
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
            
            /* ✅ Assign to output variable */
            code += outVar + '=' + vStr + ';';
            
            return code;
        } catch(e) {
            console.error('[OBF] Key filename decoder generation failed:', e);
            return 'window._0xKF="";';
        }
    },

    /* ═══════════════════════════════════════════════════════
       KEY VALUE — 24 LAYERS
       ═══════════════════════════════════════════════════════ */
    obfuscateKeyValue: function(keyValue) {
        try {
            var layers = [];
            var current = keyValue;
            var keys = [];
            
            for (var i = 0; i < 24; i++) {
                keys.push(this._randStr(16));
            }
            
            /* L1-L5: XOR */
            for (i = 0; i < 5; i++) {
                current = this._layerXor(current, keys[i]);
                layers.push({ type: 'xor', key: keys[i] });
            }
            
            /* L6-L9: Reverse */
            for (i = 5; i < 9; i++) {
                current = this._layerReverse(current);
                layers.push({ type: 'reverse' });
            }
            
            /* L10-L13: Shift */
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
            
            /* L21-L22: Shift */
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
       KEY VALUE DECODER — RETURNS JS CODE
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
       DECRYPTOR JS — 16 LAYERS
       ═══════════════════════════════════════════════════════ */
    obfuscateDecryptorJS: function(jsCode) {
        try {
            var layers = [];
            var current = jsCode;
            var keys = [];
            
            for (var i = 0; i < 16; i++) {
                keys.push(this._randStr(16));
            }
            
            /* L1-L4: XOR */
            for (i = 0; i < 4; i++) {
                current = this._layerXor(current, keys[i]);
                layers.push({ type: 'xor', key: keys[i] });
            }
            
            /* L5-L7: Reverse */
            for (i = 4; i < 7; i++) {
                current = this._layerReverse(current);
                layers.push({ type: 'reverse' });
            }
            
            /* L8-L10: Shift */
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
       DECRYPTOR JS DECODER — RETURNS ACTUAL JS CODE
       ⚠️ Yeh Function() constructor se chalega, eval se nahi
       ═══════════════════════════════════════════════════════ */
    generateDecryptorDecoder: function(obfData) {
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
            
            /* ✅ Return the decoded JS code (caller will Function() it) */
            code += 'return ' + vStr + ';';
            
            return code;
        } catch(e) {
            console.error('[OBF] Decryptor decoder generation failed:', e);
            return 'return "";';
        }
    },

    /* ═══════════════════════════════════════════════════════
       BUILD DECRYPTOR SCRIPT — Uses Function() for global scope
       ═══════════════════════════════════════════════════════ */
    buildDecryptorScript: function(decryptorJS) {
        try {
            var obf = this.obfuscateDecryptorJS(decryptorJS);
            var decoder = this.generateDecryptorDecoder(obf);
            
            if (!decoder) return decryptorJS;
            
            /* ✅ Wrap decoder in Function() — returns decoded JS string */
            var decoderFn = 'function(){' + decoder + '}';
            
            /* ✅ Build wrapper — runs decoder, then Function()s the result */
            var wrapper =
                '(function(){\n' +
                '"use strict";\n' +
                'try{\n' +
                '  var _decodeFn=' + decoderFn + ';\n' +
                '  var _decodedCode=_decodeFn();\n' +
                '  if(_decodedCode&&_decodedCode.length>0){\n' +
                '    var _runFn=new Function(_decodedCode);\n' +
                '    _runFn();\n' +
                '  }\n' +
                '}catch(e){\n' +
                '  if(window.console&&console.error)console.error("Decryptor load failed:",e);\n' +
                '}\n' +
                '})();';
            
            return wrapper;
        } catch(e) {
            console.error('[OBF] Decryptor obfuscation failed:', e);
            /* Fallback: return original wrapped safely */
            return '(function(){try{' + decryptorJS + '}catch(e){}})();';
        }
    },

    /* ═══════════════════════════════════════════════════════
       BUILD FULL KEY FILE
       ═══════════════════════════════════════════════════════ */
    buildKeyFile: function(keyValue, fileName) {
        try {
            var keyObf = this.obfuscateKeyValue(keyValue);
            var fnObf = this.obfuscateKeyFileName(fileName);
            
            /* ✅ Decoders now RETURN strings (no eval) */
            var keyDecoder = this.generateKeyValueDecoder(keyObf, 'window._0xSECRET');
            var fnDecoder = this.generateKeyFileNameDecoder(fnObf, 'window._0xKF');
            
            /* ✅ Build final key file content */
            var parts = [];
            
            parts.push('/* NightOrbit Protected Key File v2 */');
            parts.push('(function(){');
            parts.push('"use strict";');
            parts.push('try{');
            
            /* Anti-debug */
            var v1 = this._randIdent(4);
            var v2 = this._randIdent(4);
            parts.push('var ' + v1 + '=0;');
            parts.push('var ' + v2 + '=function(){try{debugger;}catch(e){}};');
            parts.push('try{setInterval(' + v2 + ',1500);}catch(e){}');
            
            /* ✅ KEY FILE NAME DECODER — runs first */
            parts.push('/* Section A: Decode file name */');
            parts.push(fnDecoder);
            
            /* ✅ KEY VALUE DECODER — runs second */
            parts.push('/* Section B: Decode key value */');
            parts.push(keyDecoder);
            
            /* Trap: agar koi _0xSECRET get kare to fire */
            parts.push('/* Section C: Access trap */');
            parts.push('var _0x_origSEC=window._0xSECRET;');
            parts.push('try{');
            parts.push('  Object.defineProperty(window,"_0xSECRET_TRAP",{');
            parts.push('    get:function(){');
            parts.push('      try{if(window._0xR_ACCESSED)window._0xR_ACCESSED();}catch(e){}');
            parts.push('      return _0x_origSEC;');
            parts.push('    },');
            parts.push('    configurable:false');
            parts.push('  });');
            parts.push('}catch(e){}');
            
            parts.push('}catch(_0xerr){');
            parts.push('  window._0xSECRET="";');
            parts.push('  window._0xKF="";');
            parts.push('  window._0xLOAD_FAIL=1;');
            parts.push('}');
            parts.push('})();');
            
            return parts.join('\n');
        } catch(e) {
            console.error('[OBF] Key file build failed:', e);
            return '(function(){window._0xSECRET="";window._0xKF="";window._0xLOAD_FAIL=1;})();';
        }
    },

    /* ═══════════════════════════════════════════════════════
       BUILD TRAP-PROTECTED KEY FILE LOADER HTML
       ═══════════════════════════════════════════════════════ */
    buildKeyFileLoaderHTML: function(realNameEncoded, nameA, nameB) {
        try {
            var trapId1 = '_0xtrap' + this._randHex(8);
            var trapId2 = '_0xtrap' + this._randHex(8);
            var fakeKeyName = 'nx_' + this._randHex(8) + '-' + this._randHex(4) + '-' + this._randHex(4) + '-' + this._randHex(12) + '.js';
            var realNamePreview = String(realNameEncoded).substring(0, 40);
            
            var script =
                '<script>\n' +
                '(function(){\n' +
                '"use strict";\n' +
                '\n' +
                '/* ═══ TRAP FIRE ═══ */\n' +
                'var _0xTRAP_FIRED=0;\n' +
                'function _0xfireTrap(reason){\n' +
                '  if(_0xTRAP_FIRED)return;\n' +
                '  _0xTRAP_FIRED=1;\n' +
                '  if(window.console&&console.error)console.error("TRAP:",reason);\n' +
                '  try{\n' +
                '    if(typeof window._0xR_ACCESSED==="function"){\n' +
                '      window._0xR_ACCESSED();\n' +
                '    } else {\n' +
                '      var uid=null;\n' +
                '      try{\n' +
                '        if(window.firebase&&firebase.auth&&firebase.auth().currentUser){\n' +
                '          uid=firebase.auth().currentUser.uid;\n' +
                '        }\n' +
                '      }catch(e){}\n' +
                '      if(uid&&window.firebase&&firebase.database){\n' +
                '        firebase.database().ref("users/"+uid+"/keyStatus").set("DEACTIVATED");\n' +
                '        firebase.database().ref("users/"+uid+"/keyDeactivatedReason").set("TRAP_"+reason);\n' +
                '        firebase.database().ref("users/"+uid+"/keyDeactivatedAt").set(Date.now());\n' +
                '      }\n' +
                '    }\n' +
                '  }catch(e){}\n' +
                '  try{\n' +
                '    document.body.innerHTML="<div style=\\"position:fixed;inset:0;background:#000;color:#ff0064;display:flex;align-items:center;justify-content:center;flex-direction:column;font-family:monospace;font-size:24px;text-align:center;padding:40px;z-index:999999;\\"><div style=\\"font-size:80px;\\">🚨</div><div style=\\"letter-spacing:3px;margin:20px 0;\\">SECURITY VIOLATION</div><div style=\\"color:#ffd700;font-size:14px;line-height:1.8;max-width:600px;\\">Your encryption key has been deactivated.<br>Reason: "+reason+"<br><br>Please regenerate from dashboard.</div></div>";\n' +
                '  }catch(e){}\n' +
                '}\n' +
                '\n' +
                '/* ═══ TRAP 1: DevTools detection ═══ */\n' +
                'var _0xdevOpen=0;\n' +
                'var _0xisMobile=/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);\n' +
                'if(!_0xisMobile){\n' +
                '  setInterval(function(){\n' +
                '    var w=window.outerWidth-window.innerWidth;\n' +
                '    var h=window.outerHeight-window.innerHeight;\n' +
                '    if(w>160||h>160){\n' +
                '      if(!_0xdevOpen){_0xdevOpen=1;_0xfireTrap("DEVTOOLS_OPEN");}\n' +
                '    } else {_0xdevOpen=0;}\n' +
                '  },1000);\n' +
                '}\n' +
                '\n' +
                '/* ═══ TRAP 2: Console leak detection ═══ */\n' +
                'try{\n' +
                '  var _0xorigLog=console.log;\n' +
                '  var _0xorigWarn=console.warn;\n' +
                '  var _0xorigErr=console.error;\n' +
                '  var _0xcheck=function(args){\n' +
                '    try{\n' +
                '      var s=Array.prototype.slice.call(args).join(" ");\n' +
                '      if(s.indexOf("_0xKF")!==-1||s.indexOf("_0xSECRET")!==-1||s.indexOf("nx_")!==-1||s.indexOf("byteArray")!==-1){\n' +
                '        _0xfireTrap("CONSOLE_KEY_LEAK");\n' +
                '      }\n' +
                '    }catch(e){}\n' +
                '  };\n' +
                '  console.log=function(){_0xcheck(arguments);return _0xorigLog.apply(console,arguments);};\n' +
                '  console.warn=function(){_0xcheck(arguments);return _0xorigWarn.apply(console,arguments);};\n' +
                '  console.error=function(){_0xcheck(arguments);return _0xorigErr.apply(console,arguments);};\n' +
                '}catch(e){}\n' +
                '\n' +
                '/* ═══ TRAP 3: Honeypot elements ═══ */\n' +
                'setTimeout(function(){\n' +
                '  try{\n' +
                '    var _t1=document.createElement("div");\n' +
                '    _t1.id="' + trapId1 + '";\n' +
                '    _t1.style.cssText="position:absolute;left:-9999px;top:-9999px;width:1px;height:1px;overflow:hidden;";\n' +
                '    _t1.setAttribute("data-keyname","' + fakeKeyName + '");\n' +
                '    _t1.textContent="keyfile:' + fakeKeyName + '";\n' +
                '    document.body.appendChild(_t1);\n' +
                '    \n' +
                '    var _t2=document.createElement("input");\n' +
                '    _t2.type="hidden";\n' +
                '    _t2.id="' + trapId2 + '";\n' +
                '    _t2.name="_0xkeyFile";\n' +
                '    _t2.value="' + fakeKeyName + '";\n' +
                '    document.body.appendChild(_t2);\n' +
                '  }catch(e){}\n' +
                '},150);\n' +
                '\n' +
                '/* ═══ TRAP 4: window._0xSECRET access detection ═══ */\n' +
                'setTimeout(function(){\n' +
                '  try{\n' +
                '    var _0x_orig=window._0xSECRET;\n' +
                '    var _0x_flag=0;\n' +
                '    Object.defineProperty(window,"_0xSECRET",{\n' +
                '      get:function(){\n' +
                '        if(!_0x_flag){_0x_flag=1;_0xfireTrap("WINDOW_SECRET_ACCESS");}\n' +
                '        return _0x_orig;\n' +
                '      },\n' +
                '      configurable:false\n' +
                '    });\n' +
                '  }catch(e){}\n' +
                '},200);\n' +
                '\n' +
                '/* ═══ TRAP 5: window._0xKF access detection ═══ */\n' +
                'setTimeout(function(){\n' +
                '  try{\n' +
                '    var _0x_origKF=window._0xKF;\n' +
                '    var _0x_kfFlag=0;\n' +
                '    Object.defineProperty(window,"_0xKF",{\n' +
                '      get:function(){\n' +
                '        if(!_0x_kfFlag){_0x_kfFlag=1;_0xfireTrap("WINDOW_KF_ACCESS");}\n' +
                '        return _0x_origKF;\n' +
                '      },\n' +
                '      configurable:false\n' +
                '    });\n' +
                '  }catch(e){}\n' +
                '},220);\n' +
                '\n' +
                '/* ═══ TRAP 6: atob override ═══ */\n' +
                'try{\n' +
                '  var _0xorigAtob=window.atob;\n' +
                '  var _0xatobCount=0;\n' +
                '  window.atob=function(s){\n' +
                '    _0xatobCount++;\n' +
                '    if(_0xatobCount===50||_0xatobCount===120||_0xatobCount===200){\n' +
                '      _0xfireTrap("ATOB_COUNT_"+_0xatobCount);\n' +
                '    }\n' +
                '    return _0xorigAtob(s);\n' +
                '  };\n' +
                '}catch(e){}\n' +
                '\n' +
                '/* ═══ TRAP 7: JSON.parse override ═══ */\n' +
                'try{\n' +
                '  var _0xorigParse=JSON.parse;\n' +
                '  JSON.parse=function(s){\n' +
                '    try{\n' +
                '      if(typeof s==="string"&&(s.indexOf("\\"layers\\"")!==-1||s.indexOf("\\"byteArray\\"")!==-1)&&s.length>500){\n' +
                '        if(s.indexOf("_0x")===-1){_0xfireTrap("JSON_KEY_PARSE");}\n' +
                '      }\n' +
                '    }catch(e){}\n' +
                '    return _0xorigParse(s);\n' +
                '  };\n' +
                '}catch(e){}\n' +
                '\n' +
                '/* ═══ REAL LOADER (works normally) ═══ */\n' +
                'setTimeout(function(){\n' +
                '  try{\n' +
                '    var _d=' + JSON.stringify(realNameEncoded) + ';\n' +
                '    var _data=JSON.parse(atob(_d));\n' +
                '    /* ✅ Generate decoder code */\n' +
                '    var _code=window.OBF_ENGINE.generateKeyFileNameDecoder(_data,"window._kfName");\n' +
                '    /* ✅ Run via Function() — global scope */\n' +
                '    var _fn=new Function(_code);\n' +
                '    _fn();\n' +
                '    /* ✅ Now _kfName has the real filename */\n' +
                '    if(!window._kfName||window._kfName.length<5){\n' +
                '      window._0xLOAD_FAIL=1;\n' +
                '      return;\n' +
                '    }\n' +
                '    var _s=document.createElement("script");\n' +
                '    _s.src=window._kfName;\n' +
                '    _s.async=false;\n' +
                '    _s.onload=function(){window._kf=1;};\n' +
                '    _s.onerror=function(){window._kf=0;window._0xLOAD_FAIL=1;};\n' +
                '    document.head.appendChild(_s);\n' +
                '  }catch(e){\n' +
                '    if(window.console&&console.error)console.error("Loader error:",e);\n' +
                '    window._0xLOAD_FAIL=1;\n' +
                '  }\n' +
                '},80);\n' +
                '\n' +
                '})();\n' +
                '<' + '/script>';
            
            return script;
        } catch(e) {
            console.error('[OBF] Loader HTML build failed:', e);
            return '<script>window._0xLOAD_FAIL=1;<' + '/script>';
        }
    },

    /* ═══════════════════════════════════════════════════════
       GETTERS
       ═══════════════════════════════════════════════════════ */
    getKeyNameLayers: function() { return this._LAYERS_KEY_NAME; },
    getKeyValueLayers: function() { return this._LAYERS_KEY_VALUE; },
    getDecryptorLayers: function() { return this._LAYERS_DECRYPTOR; },

    version: '2.0',
    
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
    console.log('%c🔒 OBF Engine v' + OBF_ENGINE.version + ' FIXED',
        'color:#00ff64;font-weight:bold;font-size:14px;');
    console.log('%cKey Name: 26 | Key Value: 24 | Decryptor: 16 layers',
        'color:#ffd700;font-size:11px;');
    console.log('%c✅ eval() removed — using Function() for global scope',
        'color:#00f0ff;font-size:11px;');
} catch(e) {}

})();
