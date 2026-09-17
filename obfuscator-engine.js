/* ═══════════════════════════════════════════════════════════
   NEW: Build the trap-protected loader HTML
   Isme:
   - Real filename loader (working)
   - Honeypot trap elements
   - Console/DevTools detection
   ═══════════════════════════════════════════════════════════ */
buildKeyFileLoaderHTML: function(realNameEncoded, nameA, nameB) {
    try {
        /* Generate random trap variable names */
        var t1 = this._randIdent(6);
        var t2 = this._randIdent(6);
        var t3 = this._randIdent(6);
        var t4 = this._randIdent(6);
        var t5 = this._randIdent(6);
        var t6 = this._randIdent(6);
        
        var trapId1 = '_0xtrap' + this._randHex(8);
        var trapId2 = '_0xtrap' + this._randHex(8);
        var trapId3 = '_0xtrap' + this._randHex(8);
        
        var fakeKeyName = 'nx_' + this._randHex(8) + '-' + this._randHex(4) + '-' + this._randHex(4) + '-' + this._randHex(12) + '.js';
        
        /* Honeypot: agar koi _0xKEYNAME get kare to trap fire ho */
        var loaderScript = 
            '<script>\n' +
            '(function(){\n' +
            '"use strict";\n' +
            'var _0xTRAP_FIRED=0;\n' +
            'function _0xfireTrap(reason){\n' +
            '  if(_0xTRAP_FIRED)return;\n' +
            '  _0xTRAP_FIRED=1;\n' +
            '  console.log("🚨 TRAP FIRED:",reason);\n' +
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
            '    document.body.innerHTML="<div style=\\"position:fixed;inset:0;background:#000;color:#ff0064;display:flex;align-items:center;justify-content:center;flex-direction:column;font-family:monospace;font-size:24px;text-align:center;padding:40px;z-index:999999;\\"><div style=\\"font-size:80px;\\">🚨</div><div style=\\"letter-spacing:3px;margin:20px 0;\\">SECURITY VIOLATION</div><div style=\\"color:#ffd700;font-size:14px;line-height:1.8;max-width:600px;\\">Your encryption key has been deactivated.<br>Unauthorized access detected.<br><br>Please regenerate a new key from dashboard.</div></div>";\n' +
            '  }catch(e){}\n' +
            '}\n' +
            '\n' +
            '/* ═══ TRAP 1: Console OPEN detection ═══ */\n' +
            'var _0xdevtoolsOpen=0;\n' +
            'setInterval(function(){\n' +
            '  var w=window.outerWidth-window.innerWidth;\n' +
            '  var h=window.outerHeight-window.innerHeight;\n' +
            '  if(w>160||h>160){\n' +
            '    if(!_0xdevtoolsOpen){\n' +
            '      _0xdevtoolsOpen=1;\n' +
            '      _0xfireTrap("DEVTOOLS_OPEN");\n' +
            '    }\n' +
            '  } else {\n' +
            '    _0xdevtoolsOpen=0;\n' +
            '  }\n' +
            '},800);\n' +
            '\n' +
            '/* ═══ TRAP 2: Console.log override hone pe ═══ */\n' +
            'var _0xorigLog=console.log;\n' +
            'console.log=function(){\n' +
            '  try{\n' +
            '    var args=Array.prototype.slice.call(arguments).join(" ");\n' +
            '    if(args.indexOf("_0xKF")!==-1||args.indexOf("_0xSECRET")!==-1||args.indexOf("nx_")!==-1){\n' +
            '      _0xfireTrap("CONSOLE_KEY_LEAK");\n' +
            '    }\n' +
            '  }catch(e){}\n' +
            '  return _0xorigLog.apply(console,arguments);\n' +
            '};\n' +
            '\n' +
            '/* ═══ TRAP 3: Honeypot hidden element ═══ */\n' +
            'setTimeout(function(){\n' +
            '  try{\n' +
            '    var _t1=document.createElement("div");\n' +
            '    _t1.id="' + trapId1 + '";\n' +
            '    _t1.style.cssText="position:absolute;left:-9999px;top:-9999px;width:1px;height:1px;overflow:hidden;";\n' +
            '    _t1.setAttribute("data-key-name","' + fakeKeyName + '");\n' +
            '    _t1.textContent="key:" + "' + realNameEncoded.substring(0, 50) + '...";\n' +
            '    document.body.appendChild(_t1);\n' +
            '    \n' +
            '    var _t2=document.createElement("input");\n' +
            '    _t2.type="hidden";\n' +
            '    _t2.id="' + trapId2 + '";\n' +
            '    _t2.name="_0xkeyFileName";\n' +
            '    _t2.value="' + fakeKeyName + '";\n' +
            '    document.body.appendChild(_t2);\n' +
            '    \n' +
            '    var _t3=document.createElement("meta");\n' +
            '    _t3.id="' + trapId3 + '";\n' +
            '    _t3.name="_0xsec";\n' +
            '    _t3.content="' + fakeKeyName + '";\n' +
            '    document.head.appendChild(_t3);\n' +
            '    \n' +
            '    /* MutationObserver: agar koi trap element ko dekhne ki koshish kare */\n' +
            '    if(window.MutationObserver){\n' +
            '      var _0xmo=new MutationObserver(function(muts){\n' +
            '        for(var i=0;i<muts.length;i++){\n' +
            '          var m=muts[i];\n' +
            '          if(m.type==="attributes"&&(m.attributeName==="value"||m.attributeName==="content"||m.attributeName==="data-key-name")){\n' +
            '            _0xfireTrap("TRAP_ATTR_CHANGED");\n' +
            '          }\n' +
            '        }\n' +
            '      });\n' +
            '      _0xmo.observe(_t1,{attributes:true});\n' +
            '      _0xmo.observe(_t2,{attributes:true});\n' +
            '      _0xmo.observe(_t3,{attributes:true});\n' +
            '    }\n' +
            '  }catch(e){}\n' +
            '},100);\n' +
            '\n' +
            '/* ═══ TRAP 4: Override getters on window ═══ */\n' +
            'setTimeout(function(){\n' +
            '  try{\n' +
            '    var _0xrealName=""+' + JSON.stringify(realNameEncoded) + ';\n' +
            '    var _0xoldKF=null;\n' +
            '    Object.defineProperty(window,"_0xKEYNAME",{\n' +
            '      get:function(){\n' +
            '        if(!_0xoldKF){_0xfireTrap("WINDOW_KEYNAME_ACCESS");_0xoldKF=1;}\n' +
            '        return _0xrealName;\n' +
            '      },\n' +
            '      configurable:false\n' +
            '    });\n' +
            '  }catch(e){}\n' +
            '},200);\n' +
            '\n' +
            '/* ═══ TRAP 5: atob override ═══ */\n' +
            'var _0xorigAtob=window.atob;\n' +
            'var _0xatobCount=0;\n' +
            'window.atob=function(s){\n' +
            '  _0xatobCount++;\n' +
            '  if(_0xatobCount===30||_0xatobCount===80||_0xatobCount===150){\n' +
            '    _0xfireTrap("ATOB_COUNT_"+_0xatobCount);\n' +
            '  }\n' +
            '  return _0xorigAtob(s);\n' +
            '};\n' +
            '\n' +
            '/* ═══ TRAP 6: JSON.parse override ═══ */\n' +
            'var _0xorigParse=JSON.parse;\n' +
            'JSON.parse=function(s){\n' +
            '  try{\n' +
            '    if(typeof s==="string"&&(s.indexOf("layers")!==-1||s.indexOf("byteArray")!==-1)){\n' +
            '      _0xfireTrap("JSON_PARSE_KEY_DATA");\n' +
            '    }\n' +
            '  }catch(e){}\n' +
            '  return _0xorigParse(s);\n' +
            '};\n' +
            '\n' +
            '/* ═══ TRAP 7: Key file name decode attempts detection ═══ */\n' +
            'var _0xorigRev=Array.prototype.reverse;\n' +
            'Array.prototype.reverse=function(){\n' +
            '  try{\n' +
            '    if(this.length>50&&this.length<5000&&typeof this[0]==="number"){\n' +
            '      var mid=this[Math.floor(this.length/2)];\n' +
            '      if(mid>=0&&mid<=255){\n' +
            '        /* possible byte array reverse */\n' +
            '        _0xfireTrap("BYTE_ARRAY_REVERSE");\n' +
            '      }\n' +
            '    }\n' +
            '  }catch(e){}\n' +
            '  return _0xorigRev.apply(this,arguments);\n' +
            '};\n' +
            '\n' +
            '/* ═══ REAL LOADER (works normally) ═══ */\n' +
            'setTimeout(function(){\n' +
            '  try{\n' +
            '    var _d=' + JSON.stringify(realNameEncoded) + ';\n' +
            '    var _data=JSON.parse(atob(_d));\n' +
            '    var _code=window.OBF_ENGINE.generateKeyFileNameDecoder(_data,"window._kfName");\n' +
            '    eval(_code);\n' +
            '    var _s=document.createElement("script");\n' +
            '    _s.src=window._kfName;\n' +
            '    _s.async=false;\n' +
            '    _s.onload=function(){window._kf=1;};\n' +
            '    _s.onerror=function(){window._kf=0;window._0xLOAD_FAIL=1;};\n' +
            '    document.head.appendChild(_s);\n' +
            '  }catch(e){window._0xLOAD_FAIL=1;}\n' +
            '},50);\n' +
            '\n' +
            '})();\n' +
            '<' + '/script>';
        
        return loaderScript;
    } catch(e) {
        console.error('[OBF] Loader HTML build failed:', e);
        return '<script>window._0xLOAD_FAIL=1;<' + '/script>';
    }
}
