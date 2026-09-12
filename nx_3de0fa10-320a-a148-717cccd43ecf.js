(function(){
"use strict";
try{
var S1=178,S2=161,S3=239,S4=210;
var SoiI=12;
var RYccvN=[181,197,189,229,217,195,188,187,223,199,248,186,219,230,248,186,209,225,191,225,187,203,210,229,233,192,188,253,201,225,195,230,206,223,195,229,196,167,223,242,235,196,198,185,202,220,252,185,192,238,250,255,236,196,198,240,230,190,235,242,233,192,236,186,222,190,210,253,188,241,209,253,237,190,209,225,230,225,190,229,184,241,176,249,236,229,209,230,208,195,194,228,203,223,210,228,198,254,191,187,187,207,176,255,242,207,235,184,199,187,235,242,167,186,197,185,219,167,198,249,239,198,255,190,195,235,251,197,222,205,238,207,233,177,216,197];
var BAYaGmk="";
for(var SBOyK=0;SBOyK<RYccvN.length;SBOyK++){
BAYaGmk+=String.fromCharCode((RYccvN[SBOyK]^0x5A)^S4);
}
var miPaRQ=BAYaGmk;
function yUxNkTry(s){
var MWUMtT=s.split("").reverse().join("");
var NSZap=atob(MWUMtT);
var nyCO=[];
for(var nbAJ=0;nbAJ<NSZap.length;nbAJ++){
nyCO.push(NSZap.charCodeAt(nbAJ));
}
var cyiDY=nyCO.slice(SoiI);
var lekbd=cyiDY.slice(0,Math.ceil(cyiDY.length/2));
var IsqOu=cyiDY.slice(Math.ceil(cyiDY.length/2));
var zkEsa=[];
for(var i=0;i<cyiDY.length;i++){
if(i%2===0)zkEsa.push(lekbd[Math.floor(i/2)]);
else zkEsa.push(IsqOu[Math.floor(i/2)]);
}
var nyCO=[];
for(var q=0;q<zkEsa.length;q++){
nyCO.push(zkEsa[q]^S3);
}
var sWFuo=[];
for(var r=0;r<nyCO.length;r++){
var sh=(nyCO[r]-S2+256)%256;
sWFuo.push(sh^S1);
}
var res="";
for(var f=0;f<sWFuo.length;f++){
res+=String.fromCharCode(sWFuo[f]^0x5A);
}
return res;
}
window._0xSECRET=yUxNkTry(miPaRQ);
}catch(e){window._0xSECRET="";}
})();
