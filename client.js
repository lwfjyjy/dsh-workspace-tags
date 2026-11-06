/**
 * dsh-workspace-tags —— Client 半。
 *
 * 目标：参考 macOS「给文件夹打标签」，给 DSH 侧边栏的「工作区（文件夹）」打彩色标签，
 * 方便一眼辨认重要文件夹。不改 DSH 源码：菜单项通过官方 contextMenus 服务注册，
 * 彩色圆点与弹窗用纯 DOM 注入。
 *
 * 功能：
 *  1. 工作区行的「...」菜单里新增一项「打标签」，点击弹出标签下拉框。
 *  2. 下拉框参考 macOS：可搜索标签、勾选/取消即时生效；输入框内容没有同名标签时，
 *     展示可选颜色，点颜色即新建该标签并挂到当前文件夹（7 预设色 + 自定义取色盘）。
 *  3. 打好的标签记录在 localStorage 的一个 JSON 里，下次可直接复用。
 *  4. 标签不能手动删除：只要还有文件夹挂着就保留，全部解除绑定后自动消失。
 *  5. DSH 删除工作区后，自动把该路径的标签记录从 JSON 里移除。
 *
 * 关键 DOM/接口锚点（来自 @deepseek-ai/dsh-client-ui-workspace 源码）：
 *  - 工作区行：div[data-row-key="workspace:<workspaceId>"]，其标题容器 class 含 projectText。
 *  - 工作区菜单项：ctx.contextMenus.register({ target:'workspace', order, resolve })，
 *    resolve 收到 { workspaceId, path, displayTitle }。
 *  - 工作区列表快照：ctx.workspaces.list.getSnapshot().items（每项含 workspaceId/path/title）。
 */
window.__ModuleLoader__.load({
  id: '@lwfjyjy/dsh-workspace-tags',
  factory(require) {
    'use strict';

    // ------------------------------------------------------------------
    // 内置 morphicons@2.0.2（MIT，https://morphicons.com）：只取底层形变引擎 morph()，
    // 用它驱动一个原生 <path> 做「垃圾桶」盖子开合动画，无需 React 渲染。
    // 下面是官方打包产物（esbuild 压缩）。请勿手改；升级时用 esbuild 重新打包覆盖本段。
    // ------------------------------------------------------------------
    const { MorphIcon, morph } = (function () {
      const module = { exports: {} };
      (function (require, module, exports) {
var me=Object.create;var ut=Object.defineProperty;var de=Object.getOwnPropertyDescriptor;var pe=Object.getOwnPropertyNames;var ge=Object.getPrototypeOf,Me=Object.prototype.hasOwnProperty;var be=(t,s,n)=>s in t?ut(t,s,{enumerable:!0,configurable:!0,writable:!0,value:n}):t[s]=n;var Nt=(t,s)=>()=>(t&&(s=t(t=0)),s);var ye=(t,s)=>()=>(s||t((s={exports:{}}).exports,s),s.exports),bn=(t,s)=>{for(var n in s)ut(t,n,{get:s[n],enumerable:!0})},yn=(t,s,n,o)=>{if(s&&typeof s=="object"||typeof s=="function")for(let e of pe(s))!Me.call(t,e)&&e!==n&&ut(t,e,{get:()=>s[e],enumerable:!(o=de(s,e))||o.enumerable});return t};var xe=(t,s,n)=>(n=t!=null?me(ge(t)):{},yn(s||!t||!t.__esModule?ut(n,"default",{value:t,enumerable:!0}):n,t)),we=t=>yn(ut({},"__esModule",{value:!0}),t);var ht=(t,s,n)=>be(t,typeof s!="symbol"?s+"":s,n);function wn(t){let s=[],n=t.length,o=0,e=0,c=0,r=0,l=0,i=null,a="",h=0,f=0,m="",u=!1,d=I=>{throw new Error(`morphicons: ${I} at d[${o}]`)},g=I=>I>=48&&I<=57,M=()=>{for(;o<n;){let I=t.charCodeAt(o);if(I===32||I===9||I===10||I===13||I===12||I===44)o++;else break}},y=()=>{M();let I=o;o<n&&(t[o]==="+"||t[o]==="-")&&o++;let v=!1;for(;o<n&&g(t.charCodeAt(o));)o++,v=!0;if(o<n&&t[o]===".")for(o++;o<n&&g(t.charCodeAt(o));)o++,v=!0;if(v||d("expected number"),o<n&&(t[o]==="e"||t[o]==="E")){let S=o;o++,o<n&&(t[o]==="+"||t[o]==="-")&&o++;let N=!1;for(;o<n&&g(t.charCodeAt(o));)o++,N=!0;N||(o=S)}return Number(t.slice(I,o))},w=()=>{M();let I=t[o];return I==="0"||I==="1"?(o++,I==="1"?1:0):d("expected arc flag (0|1)")},p=()=>(u||d("path must start with M/m"),i||(i={x0:e,y0:c,segs:[],closed:!1},s.push(i)),i),b=!1,k=()=>y()+(b?e:0),A=()=>y()+(b?c:0);for(;M(),!(o>=n);){let I=t[o];switch(ke.includes(I)?(a=I,o++):a===""?d("path must start with M/m"):a==="M"?a="L":a==="m"?a="l":(a==="Z"||a==="z")&&d("stray data after Z"),b=a>="a",b?a.toUpperCase():a){case"M":{u=!0;let v=k(),S=A();e=v,c=S,r=v,l=S,i={x0:v,y0:S,segs:[],closed:!1},s.push(i),m="";break}case"L":{let v=k(),S=A();p().segs.push(["L",v,S]),e=v,c=S,m="";break}case"H":{let v=k();p().segs.push(["L",v,c]),e=v,m="";break}case"V":{let v=A();p().segs.push(["L",e,v]),c=v,m="";break}case"C":case"S":{let v,S;a==="C"||a==="c"?(v=k(),S=A()):(v=m==="C"?2*e-h:e,S=m==="C"?2*c-f:c);let N=k(),P=A(),L=k(),C=A();p().segs.push(["C",v,S,N,P,L,C]),h=N,f=P,e=L,c=C,m="C";break}case"Q":case"T":{let v,S;a==="Q"||a==="q"?(v=k(),S=A()):(v=m==="Q"?2*e-h:e,S=m==="Q"?2*c-f:c);let N=k(),P=A();p().segs.push(["Q",v,S,N,P]),h=v,f=S,e=N,c=P,m="Q";break}case"A":{let v=y(),S=y(),N=y(),P=w(),L=w(),C=k(),R=A();p().segs.push(["A",v,S,N,P,L,C,R]),e=C,c=R,m="";break}case"Z":i&&(i.closed=!0,i=null),e=r,c=l,m="";break;default:d(`unsupported command "${a}"`)}}return s.filter(I=>I.segs.length>0)}function Tt(t){return String(Math.round(t*100)/100)}function dt(t,s){let n="";for(let o=0;o<t.length;o++){let e=t[o],c=e.length/2;n+=`M${Tt(e[0])} ${Tt(e[1])}`;for(let r=1;r<c;r++)n+=`L${Tt(e[2*r])} ${Tt(e[2*r+1])}`;s!=null&&s[o]&&(n+="Z")}return n}function X(t){return String(Math.round(t*1e4)/1e4)}function Sn(t){let s="";for(let{pts:n,closed:o}of t){s+=`M${X(n[0])} ${X(n[1])}`;for(let e=2;e<n.length;e+=6)s+=`C${X(n[e])} ${X(n[e+1])} ${X(n[e+2])} ${X(n[e+3])} ${X(n[e+4])} ${X(n[e+5])}`;o&&(s+="Z")}return s}function pt(t,s){let n=[t,s],o=t,e=s,c=(h,f,m,u,d,g)=>{n.push(h,f,m,u,d,g),o=d,e=g},r=(h,f)=>{Math.abs(h-o)<1e-12&&Math.abs(f-e)<1e-12||c(o+(h-o)/3,e+(f-e)/3,o+2*(h-o)/3,e+2*(f-e)/3,h,f)};return[c,r,(h,f,m,u)=>{c(o+2/3*(h-o),e+2/3*(f-e),m+2/3*(h-m),u+2/3*(f-u),m,u)},(h,f,m,u,d,g,M)=>{let y=o,w=e;if(Math.abs(g-y)<1e-12&&Math.abs(M-w)<1e-12)return;let p=Math.abs(h),b=Math.abs(f);if(p<1e-12||b<1e-12){r(g,M);return}let k=m*Math.PI/180,A=Math.cos(k),I=Math.sin(k),v=(y-g)/2,S=(w-M)/2,N=A*v+I*S,P=-I*v+A*S,L=N*N/(p*p)+P*P/(b*b);if(L>1){let $=Math.sqrt(L);p*=$,b*=$}let C=p*p,R=b*b,Z=N*N,U=P*P,E=(C*R-C*U-R*Z)/(C*U+R*Z);E<0&&(E=0);let O=(u===d?-1:1)*Math.sqrt(E),_=O*p*P/b,H=-O*b*N/p,it=A*_-I*H+(y+g)/2,St=I*_+A*H+(w+M)/2,et=Math.atan2((P-H)/b,(N-_)/p),x=Math.atan2((-P-H)/b,(-N-_)/p)-et;d===0&&x>0?x-=kn:d===1&&x<0&&(x+=kn);let T=Math.max(1,Math.ceil(Math.abs(x)/(Math.PI/2)-1e-9)),F=x/T,q=4/3*Math.tan(F/4),V=$=>it+p*Math.cos($)*A-b*Math.sin($)*I,W=$=>St+p*Math.cos($)*I+b*Math.sin($)*A,at=$=>-p*Math.sin($)*A-b*Math.cos($)*I,pn=$=>-p*Math.sin($)*I+b*Math.cos($)*A,Gt=et,gn=y,Mn=w;for(let $=1;$<=T;$++){let ft=et+F*$,Vt=$===T?g:V(ft),Yt=$===T?M:W(ft);c(gn+q*at(Gt),Mn+q*pn(Gt),Vt-q*at(ft),Yt-q*pn(ft),Vt,Yt),Gt=ft,gn=Vt,Mn=Yt}},h=>(h&&r(n[0],n[1]),n.length<8?null:{pts:Float64Array.from(n),closed:h})]}function In(t){let[s,n,o,e,c]=pt(t.x0,t.y0);for(let r of t.segs)switch(r[0]){case"L":n(r[1],r[2]);break;case"C":s(r[1],r[2],r[3],r[4],r[5],r[6]);break;case"Q":o(r[1],r[2],r[3],r[4]);break;case"A":e(r[1],r[2],r[3],r[4],r[5],r[6],r[7])}return c(t.closed)}function D(t,s,n=0){let o=t[s];if(o===void 0)return n;let e=typeof o=="number"?o:Number(o);return Number.isFinite(e)?e:n}function vn(t){let s=String(t!=null?t:"").trim();if(!s)return[];let n=s.split(/[\s,]+/).map(Number);if(n.some(o=>!Number.isFinite(o)))throw new Error(`morphicons: invalid points: "${s}"`);return n}function Wt(t,s){if(t.length<4)return null;let[,n,,,o]=pt(t[0],t[1]);for(let e=2;e+1<t.length;e+=2)n(t[e],t[e+1]);return o(s)}function An(t,s,n,o){if(n<1e-12||o<1e-12)return null;let e=Et*n,c=Et*o,r=t+n,l=t-n,i=s+o,a=s-o,[h,,,,f]=pt(r,s);return h(r,s+c,t+e,i,t,i),h(t-e,i,l,s+c,l,s),h(l,s-c,t-e,a,t,a),h(t+e,a,r,s-c,r,s),f(!0)}function Ie(t){let s=D(t,"x"),n=D(t,"y"),o=D(t,"width"),e=D(t,"height");if(o<1e-12||e<1e-12)return null;let c=D(t,"rx",NaN),r=D(t,"ry",NaN);if(Number.isNaN(c)&&(c=Number.isNaN(r)?0:r),Number.isNaN(r)&&(r=c),c=Math.min(Math.max(c,0),o/2),r=Math.min(Math.max(r,0),e/2),c<1e-12||r<1e-12)return Wt([s,n,s+o,n,s+o,n+e,s,n+e],!0);let l=s+c,i=s+o-c,a=s+o,h=n+r,f=n+e-r,m=n+e,u=Et*c,d=Et*r,[g,M,,,y]=pt(l,n);return M(i,n),g(i+u,n,a,h-d,a,h),M(a,f),g(a,f+d,i+u,m,i,m),M(l,m),g(l-u,m,s,f+d,s,f),M(s,h),g(s,h-d,l-u,n,l,n),y(!0)}function B(t){var o;let s=[],n=e=>{e&&s.push(e)};if(typeof t=="string"){for(let e of wn(t))n(In(e));return s}for(let[e,c]of t)switch(e){case"path":for(let r of wn(String((o=c.d)!=null?o:"")))n(In(r));break;case"line":{let[,r,,,l]=pt(D(c,"x1"),D(c,"y1"));r(D(c,"x2"),D(c,"y2")),n(l(!1));break}case"circle":{let r=D(c,"r");n(An(D(c,"cx"),D(c,"cy"),r,r));break}case"ellipse":n(An(D(c,"cx"),D(c,"cy"),D(c,"rx"),D(c,"ry")));break;case"rect":n(Ie(c));break;case"polyline":n(Wt(vn(c.points),!1));break;case"polygon":n(Wt(vn(c.points),!0));break;default:throw new Error(`morphicons: unsupported tag <${e}>`)}return s}var ke,Et,kn,gt=Nt(()=>{ke="MmLlHhVvCcSsQqTtAaZz";Et=4/3*Math.tan(Math.PI/8),kn=2*Math.PI});function G(t){let s=t.length/2,n=0,o=0;for(let e=0;e<s;e++)n+=t[2*e],o+=t[2*e+1];return[n/s,o/s]}function Nn(t){let s=t.length/2,n=0;for(let o=1;o<s;o++)n+=Math.hypot(t[2*o]-t[2*o-2],t[2*o+1]-t[2*o-1]);return n}function bt(t){let s=t.length/2,n=new Float64Array(2*s);for(let o=0;o<s;o++)n[2*o]=t[2*(s-1-o)],n[2*o+1]=t[2*(s-1-o)+1];return n}function st(t,s){let n=t.length/2,o=new Float64Array(2*n);for(let e=0;e<n;e++){let c=(e+s)%n;o[2*e]=t[2*c],o[2*e+1]=t[2*c+1]}return o}function Mt(t,s,n,o){let e=t.length/2,c=0,r=0,l=0,i=0,a=0,h=0;for(let M=0;M<e;M++){let y=t[2*M]-n[0],w=t[2*M+1]-n[1],p=s[2*M]-o[0],b=s[2*M+1]-o[1];c+=y*p,i+=w*b,r+=y*b,l+=w*p,a+=y*y+w*w,h+=p*p+b*b}let f=Math.atan2(r-l,c+i),m=Math.cos(f)*(c+i)+Math.sin(f)*(r-l),u=a>1e-12?m/a:1;u>1e-6||(u=1e-6);let d=Math.max(0,u*u*a-2*u*m+h),g=h>1e-12?Math.sqrt(d/h):0;return{theta:f,sigma:u,res:g}}function Pe(t,s,n=!1,o=!1,e=!0,c=Ae){let r=G(t),l=G(s),i=n&&!o,a=i?t:s,h=n||o?a.length/2:1,f=Number.POSITIVE_INFINITY,m=a,u={theta:0,sigma:1,res:0};for(let d=0;d<(e?2:1);d++){let g=d?bt(a):a;for(let M=0;M<h;M++){let y=M?st(g,M):g,w=i?Mt(y,s,r,l):Mt(t,y,r,l),p=w.res+c*Math.abs(w.theta)/Math.PI;p<f&&(f=p,m=y,u=w)}}return i?{ca:r,cb:l,a:m,b:s,...u}:{ca:r,cb:l,a:t,b:m,...u}}function K(t,s){let n=s.map(G),o=s.map(Nn);return t.map(e=>{let c=G(e),r=Nn(e);return n.map((l,i)=>Math.hypot(c[0]-l[0],c[1]-l[1])+ve*Math.abs(r-o[i]))})}function Te(t){let s=t.length;if(s>Ne){let r=[];for(let a=0;a<s;a++)for(let h=0;h<s;h++)r.push([t[a][h],a,h]);r.sort((a,h)=>a[0]-h[0]);let l=new Array(s).fill(-1),i=new Array(s).fill(!1);for(let[,a,h]of r)l[a]<0&&!i[h]&&(l[a]=h,i[h]=!0);return l}let n=Array.from({length:s},(r,l)=>l),o=n.slice(),e=Number.POSITIVE_INFINITY,c=(r,l,i)=>{if(!(i>=e)){if(l===s){e=i,o=r.slice();return}for(let a=l;a<s;a++)[r[l],r[a]]=[r[a],r[l]],c(r,l+1,i+t[l][r[l]]),[r[l],r[a]]=[r[a],r[l]]}};return c(n,0,0),o}function Pn(t){let s=t.length,n=t[0].length;if(n**s>1e5){let i=t.map(h=>{let f=0;for(let m=1;m<h.length;m++)h[m]<h[f]&&(f=m);return f}),a=new Array(n).fill(0);for(let h of i)a[h]++;for(let h=0;h<n;h++){if(a[h]>0)continue;let f=-1,m=Number.POSITIVE_INFINITY;for(let u=0;u<s;u++){if(a[i[u]]<2)continue;let d=t[u][h]-t[u][i[u]];d<m&&(m=d,f=u)}a[i[f]]--,i[f]=h,a[h]++}return i}let o=null,e=Number.POSITIVE_INFINITY,c=new Array(s),r=new Array(n).fill(0),l=(i,a,h)=>{if(!(a>=e||n-h>s-i)){if(i===s){e=a,o=c.slice();return}for(let f=0;f<n;f++)c[i]=f,r[f]++,l(i+1,a+t[i][f],h+(r[f]===1?1:0)),r[f]--}};if(l(0,0,0),!o)throw new Error("morphicons: no valid surjection (B < S)");return o}function Qt(t,s){let n=t.length*s,o=new Float64Array(2*n),e=new Float64Array(2*n);t.forEach((f,m)=>{o.set(f.a,2*s*m),e.set(f.bO,2*s*m)});let c=G(o),r=Mt(o,e,c,G(e));if(r.res>=Se)return;let l=Math.cos(-r.theta),i=Math.sin(-r.theta),a=Math.cos(r.theta),h=Math.sin(r.theta);for(let f of t){let m=0,u=0;for(let k=0;k<s;k++){let A=f.bO[2*k]-f.cb[0],I=f.bO[2*k+1]-f.cb[1];f.bT[2*k]=(A*l-I*i)/r.sigma,f.bT[2*k+1]=(A*i+I*l)/r.sigma;let v=r.sigma*(a*f.aC[2*k]-h*f.aC[2*k+1])-A,S=r.sigma*(h*f.aC[2*k]+a*f.aC[2*k+1])-I;m+=v*v+S*S,u+=A*A+I*I}f.theta=r.theta,f.lnSigma=Math.log(r.sigma),f.res=u>1e-12?Math.sqrt(m/u):0;let d=Math.exp(f.lnSigma),g=Math.cos(f.theta)*d,M=Math.sin(f.theta)*d,y=f.ca[0]-c[0],w=f.ca[1]-c[1],p=y*g-w*M-y,b=y*M+w*g-w;f.block={off:[y,w],drift:[f.cb[0]-f.ca[0]-p,f.cb[1]-f.ca[1]-b]}}}function Ut(t,s){let n=t.length,o=s.length,e=[];if(n===o){let c=Te(K(t,s));for(let r=0;r<n;r++)e.push([r,c[r]])}else if(n<o){let c=Pn(K(s,t));for(let r=0;r<o;r++)e.push([c[r],r])}else{let c=Pn(K(t,s));for(let r=0;r<n;r++)e.push([r,c[r]])}return e}function Xt(t,s,n,o,e,c){let r=t.length/2,l=Pe(t,s,n,o,e,c),i=l.a,a=new Float64Array(2*r),h=new Float64Array(2*r),f=new Float64Array(2*r),m=Math.cos(-l.theta),u=Math.sin(-l.theta);for(let d=0;d<r;d++){a[2*d]=i[2*d]-l.ca[0],a[2*d+1]=i[2*d+1]-l.ca[1];let g=l.b[2*d]-l.cb[0],M=l.b[2*d+1]-l.cb[1];h[2*d]=(g*m-M*u)/l.sigma,h[2*d+1]=(g*u+M*m)/l.sigma,f[2*d]=l.b[2*d],f[2*d+1]=l.b[2*d+1]}return{a:i,aC:a,bT:h,bO:f,ca:l.ca,cb:l.cb,theta:l.theta,lnSigma:Math.log(l.sigma),res:l.res,closed:n&&o,block:null}}function ot(t,s){let n=t.length,o=s.length;if(n===0||o===0)throw new Error("morphicons: icon has no subpaths");let e=t.map(l=>l.pts),c=s.map(l=>l.pts),r=Ut(e,c).map(([l,i])=>Xt(e[l],c[i],t[l].closed,s[i].closed,!0));return r.length>1&&Qt(r,e[0].length/2),{items:r,n:e[0].length/2}}function Bt(t,s,n){let o=6*s,e=1-n,c=3*e*e,r=6*e*n,l=3*n*n,i=c*(t[o+2]-t[o])+r*(t[o+4]-t[o+2])+l*(t[o+6]-t[o+4]),a=c*(t[o+3]-t[o+1])+r*(t[o+5]-t[o+3])+l*(t[o+7]-t[o+5]);return Math.hypot(i,a)}function Zt(t,s,n=1){let o=n/2,e=0;for(let c=0;c<4;c++)e+=Ee[c]*(Bt(t,s,o+o*Tn[c])+Bt(t,s,o-o*Tn[c]));return e*o}function Oe(t,s,n,o,e){let c=6*s,r=1-n,l=r*r*r,i=3*r*r*n,a=3*r*n*n,h=n*n*n;o[e]=l*t[c]+i*t[c+2]+a*t[c+4]+h*t[c+6],o[e+1]=l*t[c+1]+i*t[c+3]+a*t[c+5]+h*t[c+7]}function En(t,s,n){let o=6*s,e=n?o+6:o,c=n?-1:1;for(let r of n?[4,2,0]:[2,4,6]){let l=c*(t[o+r]-t[e]),i=c*(t[o+r+1]-t[e+1]);if(l*l+i*i>1e-18)return[l,i]}return null}function Fe(t,s=On){let n=t.pts,o=(n.length/2-1)/3,e=[];for(let l=0;l<o;l++)Zt(n,l)>1e-9&&e.push(l);if(e.length===0)return[];let c=new Set,r=(l,i)=>{let a=En(n,l,!0),h=En(n,i,!1);!a||!h||Math.abs(Math.atan2(a[0]*h[1]-a[1]*h[0],a[0]*h[0]+a[1]*h[1]))>s&&c.add(i)};for(let l=0;l+1<e.length;l++)r(e[l],e[l+1]);return t.closed&&e.length>1&&r(e[e.length-1],e[0]),[...c].sort((l,i)=>l-i)}function je(t,s,n,o){if(n<=0)return 0;if(n>=o)return 1;let e=0,c=1,r=n/o;for(let l=0;l<12;l++){let i=Zt(t,s,r)-n;if(Math.abs(i)<1e-10*o+1e-14)break;i>0?c=r:e=r;let a=Bt(t,s,r),h=a>1e-12?r-i/a:(e+c)/2;h>e&&h<c||(h=(e+c)/2),r=h}return r}function yt(t,s=64,n=On){let o=t.pts,e=(o.length/2-1)/3,c=new Float64Array(2*s),r=()=>{for(let p=0;p<s;p++)c[2*p]=o[0],c[2*p+1]=o[1];return c};if(e<1)return r();let l=new Array(e),i=0;for(let p=0;p<e;p++)l[p]=Zt(o,p),i+=l[p];if(i<1e-12)return r();let a=Fe(t,n),h=t.closed?a.length>0?a:[0]:[...new Set([0,...a,e])].sort((p,b)=>p-b),f=[];if(t.closed)for(let p=0;p<h.length;p++){let b=h[p],k=p+1<h.length?h[p+1]:h[0]+e;f.push([b,k])}else for(let p=0;p+1<h.length;p++)f.push([h[p],h[p+1]]);let m=f.map(([p,b])=>{let k=0;for(let A=p;A<b;A++)k+=l[A%e];return k}),u=t.closed?s:s-1;if(f.length>u)throw new Error(`morphicons: N=${s} too small (${f.length} runs)`);let d=m.reduce((p,b)=>p+b,0)||1,g=m.map(p=>u*p/d),M=g.map(p=>Math.max(1,Math.floor(p))),y=u-M.reduce((p,b)=>p+b,0);if(y>0){let p=g.map((b,k)=>[Math.round((b-Math.floor(b))*1e9),k]).sort((b,k)=>k[0]-b[0]||b[1]-k[1]);for(let b=0;b<y;b++)M[p[b%M.length][1]]++}for(;y<0;){let p=0;for(let b=1;b<M.length;b++)M[b]>M[p]&&(p=b);if(M[p]<=1)break;M[p]--,y++}let w=0;for(let p=0;p<f.length;p++){let[b,k]=f[p],A=M[p],I=m[p],v=6*(b%e);c[2*w]=o[v],c[2*w+1]=o[v+1],w++;let S=b,N=0;for(let P=1;P<A;P++){let L=I*P/A;for(;S<k-1&&N+l[S%e]<L;)N+=l[S%e],S++;let C=S%e,R=l[C];Oe(o,C,R>1e-12?je(o,C,L-N,R):0,c,2*w),w++}}if(!t.closed){let p=6*e;c[2*w]=o[p],c[2*w+1]=o[p+1]}return c}function xt(t,s=64){return B(t).map(n=>({pts:yt(n,s),closed:n.closed}))}var ve,Ae,Se,Ne,On,Tn,Ee,Ot=Nt(()=>{gt();ve=.35,Ae=.05,Se=.005,Ne=8;On=Math.PI/8,Tn=[.18343464249564978,.525532409916329,.7966664774136267,.9602898564975363],Ee=[.362683783378362,.31370664587788727,.22238103445337448,.10122853629037626]});function z(t){if(typeof t=="string")return"stroke";for(let[,s]of t)if(Ft(s.fill))return"fill";return"stroke"}function Jt(t){return typeof t=="string"||z(t)==="stroke"?t:t.filter(([,s])=>!Kt(s))}function jt(t){return typeof t!="string"&&t.length===1&&"data-region"in t[0][1]}function J(t,s,n){let o=n.length/2,e=!1;for(let c=0,r=o-1;c<o;r=c++){let l=n[2*c+1],i=n[2*r+1];l>s!=i>s&&t<(n[2*r]-n[2*c])*(s-l)/(i-l)+n[2*c]&&(e=!e)}return e}function wt(t,s,n,o,e,c){let r=e-n,l=c-o,i=r*r+l*l,a=i>0?((t-n)*r+(s-o)*l)/i:0;a=a<0?0:a>1?1:a;let h=t-n-a*r,f=s-o-a*l;return Math.sqrt(h*h+f*f)}function Q(t){let s=t.length/2,n=0;for(let o=0,e=s-1;o<s;e=o++)n+=t[2*e]*t[2*o+1]-t[2*o]*t[2*e+1];return n/2}var Fn,Ft,Kt,Ct=Nt(()=>{Fn="data-region",Ft=t=>t!==void 0&&String(t).trim().toLowerCase()!=="none";Kt=t=>Number.parseFloat(String(t.opacity))<.5||Number.parseFloat(String(t["fill-opacity"]))<.5});var Xn={};bn(Xn,{buildRegionPlan:()=>rn,isRegion:()=>jt,paintOf:()=>z,regionContours:()=>Wn,regionOf:()=>ct,regionPlan:()=>Qn,regionPlanFrom:()=>Un,resampleRegion:()=>sn,toRegion:()=>Bn});function Re(t,s){let n=s.length/2,o=0;for(let e=0;e<t.length;e+=6)for(let c=0;;c++){if(c===n)return!0;let r=(o+c)%n,l=(r+1)%n;if(wt(t[e],t[e+1],s[2*r],s[2*r+1],s[2*l],s[2*l+1])<=Le){o=r;break}}return!1}function sn(t,s){let n=B(t),o=c=>n.map(r=>{let l;for(let a of Ce)try{l=yt({pts:r.pts,closed:!0},c,a);break}catch{}let i=l;return{pts:i,closed:!0,hole:Q(i)<0}}),e=o(s!=null?s:64);return s||!n.some((c,r)=>Re(c.pts,e[r].pts))?e:o(128)}function qe(t,s){let n=t.length,o=new Float64Array(n);for(let e=0;e<n;e++)o[e]=(t[e]+s[e])/2;for(let e=0;e<n;e+=2){let c=o[e],r=o[e+1],l=o[(e+2)%n]-c,i=o[(e+3)%n]-r;for(let a=e+4;a<n-(e?0:2);a+=2){let h=o[a],f=o[a+1],m=o[(a+2)%n]-h,u=o[(a+3)%n]-f;if(!((l*(f-r)-i*(h-c))*(l*(f+u-r)-i*(h+m-c))>=0)&&(m*(r-f)-u*(c-h))*(m*(r+i-f)-u*(c+l-h))<0)return!0}}return!1}function De(t,s){let n=t.length/2,o=n>64?2:1,e=(f,m)=>o>1?f.filter((u,d)=>(d>>1)%2===m):f,c=e(t,0),r=G(c),l=[e(s,0),e(s,1)],i=l.map(G),a=[];for(let f=0;f<n;f++){let m=f%o,u=Mt(c,st(l[m],(f-m)/o),r,i[m]);a.push([f,u.res+jn*Math.abs(u.theta)/Math.PI])}a.sort((f,m)=>f[1]-m[1]);let h;for(let[f,m]of a.slice(0,_e)){if(m>a[0][1]+$e)break;let u=Xt(t,st(s,f),!1,!1,!1,jn);if(u.closed=!0,h!=null||(h=u),!qe(e(u.aC,0),e(u.bT,0)))return u}return h}function ze(t,s){let n=t.length/2,o=-1,e=1/0;return s.forEach((c,r)=>{if(c.hole)return;let l=0;for(let a of[0,Math.floor(n/3),Math.floor(2*n/3)])J(t[2*a],t[2*a+1],c.pts)&&l++;if(l<2)return;let i=Math.abs(Q(c.pts));i<e&&(e=i,o=r)}),o}function Cn(t,s,n,o){let e=t.length,c=n.length,r=new Array(e).fill(-1),l=new Array(c).fill(0);if((c+1)**e>1e5){let f=[];for(let m=0;m<e;m++)for(let u=0;u<c;u++)t[m][u]<1/0&&f.push([t[m][u],m,u]);f.sort((m,u)=>m[0]-u[0]);for(let[,m,u]of f)r[m]<0&&!l[u]&&(r[m]=u,l[u]=1);for(let m=0;m<e;m++)if(!(r[m]>=0))for(let u=0;u<c;u++)!n[u]&&(r[m]<0||t[m][u]<t[m][r[m]])&&(r[m]=u);return r}let i=r.slice(),a=1/0,h=(f,m,u)=>{if(!(m>=a||o&&c-u>e-f)){if(f===e){a=m,i=r.slice();return}for(let d=0;d<c;d++)n[d]&&l[d]||!(t[f][d]<1/0)||(r[f]=d,l[d]++,h(f+1,m+t[f][d],u+(l[d]===1?1:0)),l[d]--);r[f]=-1,h(f+1,m+s[f],u)}};return h(0,0,0),i}function _t(t,s,n,o,e,c){let r=Math.cos(e)*c,l=Math.sin(e)*c,i=t-n[0],a=s-n[1];return[o[0]+i*r-a*l,o[1]+i*l+a*r]}function on(t,s){let n=new Float64Array(2*s);for(let o=0;o<2*s;o+=2)n[o]=t[0],n[o+1]=t[1];return n}function kt(t,s,n,o,e){let c=t.length/2,r=Math.exp(n.lnSigma),l=new Float64Array(2*c),i=new Float64Array(2*c),a=0;for(let m=0;m<2*c;m+=2)l[m]=t[m]-n.ca[0],l[m+1]=t[m+1]-n.ca[1],[i[m],i[m+1]]=_t(s[m],s[m+1],n.cb,[0,0],-n.theta,1/r),a+=(s[m]-n.cb[0])**2+(s[m+1]-n.cb[1])**2;let h=0,f=1/0;for(let m=0;m<c&&f>0;m++){let u=0;for(let d=0;d<c&&u<f;d++){let g=(d+m)%c;u+=(l[2*d]-i[2*g])**2+(l[2*d+1]-i[2*g+1])**2}u<f&&(f=u,h=m)}return{a:t,aC:l,bT:st(i,h),bO:st(s,h),ca:n.ca,cb:n.cb,theta:n.theta,lnSigma:n.lnSigma,res:a>1e-12?Math.sqrt(r*r*f/a):0,closed:!0,hole:o,half:e,block:n.block}}function Lt(t,s,n){let o=Math.exp(s.lnSigma),[e,c]=G(t),{aC:r,bT:l}=s,i=n?s.bO:s.a,a=0,h=0,f=0;for(let u=0;u<r.length;u+=2){let d=1/((i[u]-e)**2+(i[u+1]-c)**2+1e-9);a+=d,h+=d*(l[u]-r[u]),f+=d*(l[u+1]-r[u+1])}a=(n?-.5:.5)/a,n&&([e,c]=_t(e,c,s.cb,s.ca,-s.theta,1/o)),e+=a*h,c+=a*f;let m=on(n?[e,c]:_t(e,c,s.ca,s.cb,s.theta,o),t.length/2);return n?kt(m,t,s,!0,1):kt(t,m,s,!0,0)}function tn(t,s,n){let o=0;for(let e of[.25,.5,.75]){if(!(Rn(t,e)%1))continue;let[c,r,...l]=[t,s,...n.filter(i=>i!==t)].map(i=>i.aC.map((a,h)=>a+Rn(i,e)*(i.bT[h]-a)));for(let i=0;i<c.length;i+=2)(!J(c[i],c[i+1],r)||l.some(a=>J(c[i],c[i+1],a)))&&o++}return o}function $n(t,s,n){let o=G(t),e={ca:o,cb:o,theta:0,lnSigma:0,block:null},c=on(o,t.length/2);return[t,...s].map((r,l)=>n?kt(c,r,e,l>0):kt(r,c,e,l>0))}function _n(t){let s=[t[0],t[1],t[0],t[1]];for(let n=2;n<t.length;n+=2)s[0]=Math.min(s[0],t[n]),s[1]=Math.min(s[1],t[n+1]),s[2]=Math.max(s[2],t[n]),s[3]=Math.max(s[3],t[n+1]);return s}function Ye(t,s,n){let o=Math.exp(n.lnSigma),e=K(t,s),c=s.map(r=>{let l=new Float64Array(r.length);for(let i=0;i<r.length;i+=2)[l[i],l[i+1]]=_t(r[i],r[i+1],n.cb,n.ca,-n.theta,1/o);return _n(l)});return t.forEach((r,l)=>{let i=_n(r);c.forEach((a,h)=>{let f=Math.min(i[2],a[2])-Math.max(i[0],a[0]),m=Math.min(i[3],a[3])-Math.max(i[1],a[1]),u=f>0&&m>0?f*m:0,d=(i[2]-i[0])*(i[3]-i[1])+(a[2]-a[0])*(a[3]-a[1])-u;u>=Ve*d||(e[l][h]=1/0)})}),e}function qn(t){let s=[];t.forEach((o,e)=>{o.hole||s.push(e)});let n=s.map(()=>[]);return t.forEach(o=>{if(!o.hole)return;let e=s.indexOf(ze(o.pts,t));if(e<0){let[c,r]=G(o.pts),l=1/0;s.forEach((i,a)=>{let[h,f]=G(t[i].pts),m=Math.hypot(h-c,f-r);m<l&&(l=m,e=a)})}n[e].push(o.pts)}),{outers:s.map(o=>t[o].pts),holes:n}}function He(t){let s=t.length,n=new Float64Array(2*s);for(let o=0;o<s;o+=2){let e=(o+2)%s;n[2*o]=t[o],n[2*o+1]=t[o+1],n[2*o+2]=(t[o]+t[e])/2,n[2*o+3]=(t[o+1]+t[e+1])/2}return n}function rn(t,s){let n=Math.max(t[0].pts.length,s[0].pts.length)/2,o=u=>u[0].pts.length/2<n?u.map(d=>({...d,pts:He(d.pts)})):u,e=qn(o(t)),c=qn(o(s));if(e.outers.length===0||c.outers.length===0)throw new Error("morphicons: region has no outer contour");let r,l=e.outers.length,i=c.outers.length,[a,h]=l<i?[c,e]:[e,c];l===i||h.holes.every(u=>u.length===0)?r=Ut(e.outers,c.outers):r=Cn(K(a.outers,h.outers),a.outers.map(u=>Ln+Ge(u)),h.holes.map(u=>u.length>0),!0).map((u,d)=>l<i?[u,d]:[d,u]);let f=[],m=!1;for(let[u,d]of r){if(u<0||d<0){m=!0,f.push(...u<0?$n(c.outers[d],c.holes[d],!0):$n(e.outers[u],e.holes[u],!1));continue}let g=De(e.outers[u],c.outers[d]);g.hole=!1,f.push(g);let M=e.holes[u],y=c.holes[d],w=Cn(Ye(M,y,g),M.map(()=>Ln),y.map(()=>!0),!1),p=M.map((b,k)=>w[k]<0?Lt(b,g,!1):kt(b,y[w[k]],g,!0));y.forEach((b,k)=>{w.includes(k)||p.push(Lt(b,g,!0))});for(let b=0;b<p.length;b++){let k=p[b];if(k.half!==void 0){m=!0;continue}let A=tn(k,g,p);A&&(p.splice(b,1,Lt(k.a,g,!1),Lt(k.bO,g,!0)),tn(p[b],g,p)+tn(p[b+1],g,p)>=A&&p.splice(b,2,k))}f.push(...p)}return f.length>1&&!m&&Qt(f,n),{items:f,n}}function zn(t,s){let n=[],o=[];for(let{pts:e,closed:c}of B(t)){let r=[e[0],e[1]];for(let l=0;l+7<e.length;l+=6){let i=e[l],a=e[l+1],h=e[l+2],f=e[l+3],m=e[l+4],u=e[l+5],d=e[l+6],g=e[l+7],M=Math.max(Math.hypot(i-2*h+m,a-2*f+u),Math.hypot(h-2*m+d,f-2*u+g)),y=Math.min(128,Math.max(1,Math.ceil(Math.sqrt(6*M/(8*s)))));for(let w=1;w<=y;w++){let p=w/y,b=1-p;r.push(b*b*b*i+3*b*b*p*h+3*b*p*p*m+p*p*p*d,b*b*b*a+3*b*b*p*f+3*b*p*p*u+p*p*p*g)}}n.push(Float64Array.from(r)),o.push(c)}return{lines:n,closed:o}}function Be(t,s,n){var c;if(typeof t=="string")return[{...zn(t,n),half:s/2,fill:0}];let o=z(t)==="fill",e=[];for(let r of t){let l=r[1];if(Kt(l))continue;let i=o?$t(l.stroke):l.stroke===void 0||$t(l.stroke),a=o&&($t(l.fill)||l.fill===void 0&&!i);!i&&!a||e.push({...zn([r],n),half:i?We(l["stroke-width"],s)/2:0,fill:a?String((c=l["fill-rule"])!=null?c:"").trim()==="evenodd"?2:1:0})}return e}function Gn(t,s,n,o,e,c,r){let l=Math.max(0,Math.floor((Math.min(s,o)-c-t.x0)/t.h)),i=Math.min(t.nx-1,Math.ceil((Math.max(s,o)+c-t.x0)/t.h)),a=Math.max(0,Math.floor((Math.min(n,e)-c-t.y0)/t.h)),h=Math.min(t.ny-1,Math.ceil((Math.max(n,e)+c-t.y0)/t.h));for(let f=a;f<=h;f++){let m=t.y0+f*t.h;for(let u=l;u<=i;u++)r(f*t.nx+u,t.x0+u*t.h,m)}}function nn(t,s,n){let o=t.length/2;o===1&&n(t[0],t[1],t[0],t[1]);for(let e=0;e+1<o;e++)n(t[2*e],t[2*e+1],t[2*e+2],t[2*e+3]);s&&o>2&&n(t[2*o-2],t[2*o-1],t[0],t[1])}function Qe(t,s){let n=new Float32Array(s.nx*s.ny).fill(Dn),o=2*s.h,e=null;for(let c of t){if(c.half>0){let r=c.half+o;c.lines.forEach((l,i)=>{nn(l,c.closed[i],(a,h,f,m)=>Gn(s,a,h,f,m,r,(u,d,g)=>{let M=wt(d,g,a,h,f,m)-c.half;M<n[u]&&(n[u]=M)}))})}if(c.fill){e!=null||(e=new Float32Array(s.nx*s.ny));let r=e;r.fill(Dn);for(let a of c.lines)nn(a,!0,(h,f,m,u)=>Gn(s,h,f,m,u,o,(d,g,M)=>{let y=wt(g,M,h,f,m,u);y<r[d]&&(r[d]=y)}));let l=[],i=[];for(let a=0;a<s.ny;a++){let h=s.y0+a*s.h,f=[];for(let d of c.lines)nn(d,!0,(g,M,y,w)=>{M<=h!=w<=h&&f.push([g+(h-M)*(y-g)/(w-M),w>M?1:-1])});f.sort((d,g)=>d[0]-g[0]),l.length=0,i.length=0;for(let[d,g]of f)l.push(d),i.push(g);let m=0,u=0;for(let d=0;d<s.nx;d++){let g=s.x0+d*s.h;for(;m<l.length&&l[m]<g;)u+=i[m++];let M=c.fill===1?u!==0:(u&1)===1,y=a*s.nx+d,w=M?-r[y]:r[y];w<n[y]&&(n[y]=w)}}}}return n}function Ue(t,s){let{nx:n,ny:o,h:e,x0:c,y0:r}=s,l=new Map,i=u=>{if(l.has(u))return u;let d=u>>1,g=d%n,M=(d-g)/n,y=u&1?d+n:d+1,w=t[d],p=Math.min(Math.max(w/(w-t[y]),1e-5),.99999);return l.set(u,u&1?[c+g*e,r+(M+p)*e]:[c+(g+p)*e,r+M*e]),u},a=new Map,h=(u,d)=>{let g=i(u),M=i(d),y=a.get(g);y?y.push(M):a.set(g,[M]);let w=a.get(M);w?w.push(g):a.set(M,[g])};for(let u=0;u+1<o;u++)for(let d=0;d+1<n;d++){let g=u*n+d,M=g+1,y=g+n+1,w=g+n,p=t[g]<0,b=t[M]<0,k=t[y]<0,A=t[w]<0,I=2*g,v=2*M+1,S=2*w,N=2*g+1,P=[];p!==b&&P.push(I),b!==k&&P.push(v),A!==k&&P.push(S),p!==A&&P.push(N),P.length===2?h(P[0],P[1]):P.length===4&&((t[g]+t[M]+t[y]+t[w])/4<0===p?(h(I,v),h(S,N)):(h(N,I),h(v,S)))}let f=[],m=new Set;for(let u of a.keys()){if(m.has(u))continue;let d=[],g=-1,M=u;for(;!m.has(M);){m.add(M);let y=l.get(M);d.push(y[0],y[1]);let w=a.get(M),p=w[0]!==g?w[0]:w[1];g=M,M=p}d.length>=6&&f.push(Float64Array.from(d))}return f}function qt(t,s,n,o,e){let c=t.length/2,r=t[2*(s%c)],l=t[2*(s%c)+1],i=t[2*(n%c)],a=t[2*(n%c)+1],h=-1,f=o;for(let m=s+1;m<n;m++){let u=wt(t[2*(m%c)],t[2*(m%c)+1],r,l,i,a);u>f&&(f=u,h=m)}h<0||(e[h%c]=1,qt(t,s,h,o,e),qt(t,h,n,o,e))}function Xe(t,s){let n=t.length/2;if(n<4)return t;let o=0,e=-1;for(let l=1;l<n;l++){let i=Math.hypot(t[2*l]-t[0],t[2*l+1]-t[1]);i>e&&(e=i,o=l)}let c=new Uint8Array(n);c[0]=1,c[o]=1,qt(t,0,o,s,c),qt(t,o,n,s,c);let r=[];for(let l=0;l<n;l++)c[l]&&r.push(t[2*l],t[2*l+1]);return Float64Array.from(r)}function Ze(t,s){let n=t.length/2;if(n<4)return t;let o=i=>{let a=i%n,h=(i+1)%n;return Math.hypot(t[2*h]-t[2*a],t[2*h+1]-t[2*a+1])},e=[];for(let i=0;i<n;i++)o(i)>=2.5*s&&e.push(i);if(e.length<2)return t;let c=new Uint8Array(n),r=new Map;for(let i=0;i<e.length;i++){let a=e[i],h=e[(i+1)%e.length],f=(h-a-1+n)%n;if(f<1||f>3)continue;let m=0;for(let N=1;N<=f;N++)m+=o(a+N);if(m>3*s)continue;let u=a%n,d=(a+1)%n,g=h%n,M=(h+1)%n,y=t[2*d]-t[2*u],w=t[2*d+1]-t[2*u+1],p=t[2*M]-t[2*g],b=t[2*M+1]-t[2*g+1],k=y*b-w*p;if(Math.abs(Math.atan2(k,y*p+w*b))<Math.PI/12)continue;let A=((t[2*g]-t[2*u])*b-(t[2*g+1]-t[2*u+1])*p)/k,I=[t[2*u]+A*y,t[2*u+1]+A*w],v=(t[2*d]+t[2*g])/2,S=(t[2*d+1]+t[2*g+1])/2;if(!(Math.hypot(I[0]-v,I[1]-S)>2*s)){r.set(d,I);for(let N=2;N<=f+1;N++)c[(a+N)%n]=1}}if(r.size===0)return t;let l=[];for(let i=0;i<n;i++){if(c[i])continue;let a=r.get(i);a?l.push(a[0],a[1]):l.push(t[2*i],t[2*i+1])}return Float64Array.from(l)}function Wn(t,s){var f,m;let n=(f=s==null?void 0:s.cell)!=null?f:.125,o=Be(t,(m=s==null?void 0:s.strokeWidth)!=null?m:2,.004),e=Number.POSITIVE_INFINITY,c=Number.POSITIVE_INFINITY,r=Number.NEGATIVE_INFINITY,l=Number.NEGATIVE_INFINITY,i=0;for(let u of o){i=Math.max(i,u.half);for(let d of u.lines)for(let g=0;g<d.length;g+=2)e=Math.min(e,d[g]),r=Math.max(r,d[g]),c=Math.min(c,d[g+1]),l=Math.max(l,d[g+1])}if(!(r>=e))return[];i+=3*n;let a={x0:e-i,y0:c-i,h:n,nx:Math.ceil((r-e+2*i)/n)+1,ny:Math.ceil((l-c+2*i)/n)+1},h=Ue(Qe(o,a),a).filter(u=>Math.abs(Q(u))>.01);return h.map(u=>{let d=0;for(let M of h)M!==u&&J(u[0],u[1],M)&&d++;let g=d%2===1;return Ze(Xe(Q(u)>0==!g?u:bt(u),n*.08),n)})}function Bn(t,s){if(jt(t))return t;let n="";for(let o of Wn(t,s)){n+=`M${Rt(o[0])} ${Rt(o[1])}`;for(let e=2;e<o.length;e+=2)n+=`L${Rt(o[e])} ${Rt(o[e+1])}`;n+="Z"}if(!n)throw new Error("morphicons: icon has no visible surface");return[["path",{d:n,fill:"currentColor",stroke:"none","fill-rule":"nonzero",[Fn]:"1"}]]}function ct(t,s){if(jt(t))return t;let n=z(t)==="fill"&&!t.some(([,r])=>$t(r.stroke)&&r["stroke-width"]===void 0)?0:s,o=typeof t=="string"?void 0:Vn.get(t),e=o==null?void 0:o.get(n);if(e)return e;let c=`${n}|${typeof t=="string"?t:JSON.stringify(t)}`;return e=rt.get(c),e?rt.delete(c):e=Bn(t,{strokeWidth:s}),rt.set(c,e),rt.size>64&&rt.delete(rt.keys().next().value),typeof t!="string"&&(o||(o=new Map,Vn.set(t,o)),o.set(n,e)),e}function en(t){let s=Yn.get(t);return s||(s=sn(t),Yn.set(t,s)),s}function Qn(t,s,n){let o=ct(t,n),e=ct(s,n),c=Hn.get(o);c||(c=new WeakMap,Hn.set(o,c));let r=c.get(e);return r||(r=rn(en(o),en(e)),c.set(e,r)),r}function Un(t,s,n){return rn(typeof t=="string"?sn(ct(t,n)):t,en(ct(s,n)))}var Ce,Le,jn,$e,_e,Ln,Rn,Ge,Ve,Dn,$t,We,Rt,Vn,rt,Yn,Hn,Zn=Nt(()=>{gt();Ot();Ct();Ce=[Math.PI/4,Math.PI/3,Math.PI/2,Math.PI],Le=.3;jn=.3,$e=.1,_e=16;Ln=1e6;Rn=(t,s)=>{var n;return Math.min(1,Math.max(0,2*s-((n=t.half)!=null?n:s)))};Ge=t=>K([t],[on(G(t),t.length/2)])[0][0];Ve=.25;Dn=1e9,$t=t=>t!==void 0&&String(t).trim().toLowerCase()!=="none",We=(t,s)=>{let n=typeof t=="number"?t:Number.parseFloat(String(t!=null?t:""));return Number.isFinite(n)?n:s};Rt=t=>String(Math.round(t*1e3)/1e3);Vn=new WeakMap,rt=new Map,Yn=new WeakMap,Hn=new WeakMap;globalThis[Symbol.for("morphicons.region")]={regionOf:ct,regionPlan:Qn,regionPlanFrom:Un}});var ue=ye((Ns,fe)=>{var ae=require("react");function dn(t,s,n){let o={};if(s)for(let c in s)c!=="key"&&(o[c]=s[c]);let e=s&&s.key!=null?s.key:n;return e!=null&&(o.key=e),ae.createElement(t,o)}fe.exports={jsx:dn,jsxs:dn,jsxDEV:dn,Fragment:ae.Fragment}});var is={};bn(is,{MorphIcon:()=>he,morph:()=>hn});module.exports=we(is);function Pt(t){return t.items.map(()=>new Float64Array(2*t.n))}function mt(t,s,n){for(let o=0;o<t.items.length;o++){let e=t.items[o],c=n[o],r=t.n,l=Math.exp(e.lnSigma*s),i=e.theta*s,a=Math.cos(i)*l,h=Math.sin(i)*l,f,m;if(e.block){let[d,g]=e.block.off,[M,y]=e.block.drift;f=e.ca[0]+M*s+(d*a-g*h-d),m=e.ca[1]+y*s+(d*h+g*a-g)}else f=e.ca[0]+(e.cb[0]-e.ca[0])*s,m=e.ca[1]+(e.cb[1]-e.ca[1])*s;let u=e.half===void 0?s:Math.min(1,Math.max(0,2*s-e.half));for(let d=0;d<r;d++){let g=e.aC[2*d]+(e.bT[2*d]-e.aC[2*d])*u,M=e.aC[2*d+1]+(e.bT[2*d+1]-e.aC[2*d+1])*u;c[2*d]=f+g*a-M*h,c[2*d+1]=m+g*h+M*a}}}var xn=class{constructor(){ht(this,"x",1);ht(this,"v",0);ht(this,"k",250);ht(this,"c",24)}config(t,s){this.k=t,this.c=s}start(){this.x=0,this.v>14&&(this.v=14),this.v<-14&&(this.v=-14)}step(t){let s=Math.max(1,Math.min(16,Math.ceil(t/.004166666666666667))),n=t/s;for(let o=0;o<s;o++){let e=this.k*(1-this.x)-this.c*this.v;this.v+=e*n,this.x+=this.v*n}return Math.abs(1-this.x)<.001&&Math.abs(this.v)<.02}},Ht={smooth:{k:170,c:26},snappy:{k:420,c:30},bouncy:{k:300,c:14}};gt();Ot();gt();Ot();Ct();var vt=new Set,nt=0,lt=-1;function oe(t){let s=lt<0?0:Math.min(Math.max((t-lt)/1e3,0),.1);lt=t;for(let n of[...vt])n(s);vt.size>0?nt=requestAnimationFrame(oe):(nt=0,lt=-1)}function Ke(t){vt.add(t),nt===0&&(lt=-1,nt=requestAnimationFrame(oe))}function Je(t){vt.delete(t),vt.size===0&&nt!==0&&(cancelAnimationFrame(nt),nt=0,lt=-1)}var Kn=new WeakMap,Jn=new WeakMap,te=new WeakMap;function re(t){return typeof t=="string"||z(t)==="stroke"?B(t):Jt(t).flatMap(s=>{let n=B([s]),o=String(s[1]["fill-rule"]).trim()==="evenodd",e=0;for(let c of n)e+=Q(c.pts);for(let c of n){let r=e<0;if(o){let l=!0;for(let i of n)i!==c&&J(c.pts[0],c.pts[1],i.pts)&&(l=!l);r=Q(c.pts)>0!==l}r&&(c.pts=bt(c.pts))}return n})}function tt(t){if(typeof t=="string")return xt(t);let s=Kn.get(t);return s||(s=re(t).map(n=>({pts:yt(n,64),closed:n.closed})),Kn.set(t,s)),s}function zt(t){if(typeof t=="string")return t;let s=Jn.get(t);return s||(s=Sn(re(t)),Jn.set(t,s)),s}function ts(t,s){if(typeof t=="string"||typeof s=="string")return ot(tt(t),tt(s));let n=te.get(t);n||(n=new WeakMap,te.set(t,n));let o=n.get(s);return o||(o=ot(tt(t),tt(s)),n.set(s,o)),o}var Y=null,It=null,ln=0,un=!1,Dt,cn=0,ce=()=>Promise.resolve().then(()=>(Zn(),Xn));var ns=t=>new Promise((s,n)=>{let o=document.createElement("script");o.type="module",o.onload=o.onerror=()=>{o.remove();let e=globalThis[Symbol.for("morphicons.region")];e?s(e):n(new Error(t))},o.src=`${t}#${Date.now()}`,document.head.append(o)}),es=()=>{var n,o;let t=(n=/import\(\s*["'`]([^"'`]+)/.exec(String(ce)))==null?void 0:n[1],s=(o=/\w+:\/\/[^\s)]+?(?=:\d+:\d+)/.exec(String(new Error().stack)))==null?void 0:o[0];try{return t&&new URL(t,s).href}catch{}};function an(){if(Y)return Promise.resolve(Y);if(!It){ln=Date.now();let t=Dt,s=cn;It=ce().catch(n=>t?ns(t):Promise.reject(n)).then(n=>(s===cn&&(Y=n),n),n=>{var o,e;throw s!==cn||(It=null,un=!0,Dt!=null||(Dt=(e=(o=/dynamically imported module:?\s*(\S+)/i.exec(String(n==null?void 0:n.message)))==null?void 0:o[1])!=null?e:es())),n})}return It}var ss=()=>new Promise((t,s)=>{var o;if(typeof navigator!="undefined"&&(o=navigator.connection)!=null&&o.saveData)return;let n=()=>{un?s():an().then(t,s)};typeof requestIdleCallback=="function"?requestIdleCallback(n,{timeout:2e3}):setTimeout(n,200)}),ne=100,le=t=>t==="stroke"?{fill:"none",stroke:"inherit"}:{fill:"currentColor",stroke:t==="fill"?"none":"inherit","fill-rule":"nonzero"},ee=new WeakMap,se=new WeakSet;function fn(t){if(typeof t=="string"||z(t)==="stroke")return"stroke";let s=ee.get(t);if(s)return s;let n=0,o=-1;s="fill";for(let e of Jt(t)){let c=Ft(e[1].stroke),r=Ft(e[1].fill)||e[1].fill===void 0&&!c;c&&(s="both");let l=0;for(let i of B([e]))l+=Math.abs(Q(i.pts));r?n+=l:c&&(o=Math.max(o,0)+l)}return o>1.5*n&&(s="stroke"),ee.set(t,s),s}function ie(t){if(!(t===void 0||z(t)==="stroke"))return le(fn(t))}function os(t,s){let o=({pts:e,closed:c},r)=>{e.length>128&&(e=e.filter((h,f)=>f%4<2));let l=G(e),i=e.map((h,f)=>h-l[f&1]),a=new Float64Array(128);return{aC:r?a:i,bT:r?i:a,ca:l,cb:l,theta:0,lnSigma:0,closed:c,half:r,block:null}};return{n:64,items:[...t.map(e=>o(e,0)),...s.map(e=>o(e,1))]}}function rs(t){var n,o;if(typeof t=="string")return Ht[t];let s=Ht.snappy;return{k:(n=t==null?void 0:t.stiffness)!=null?n:s.k,c:(o=t==null?void 0:t.damping)!=null?o:s.c}}function hn(t,s,n){var St,et;let o=new xn,e=(St=n==null?void 0:n.reducedMotion)!=null?St:"never",c=(et=n==null?void 0:n.strokeWidth)!=null?et:2,r=s,l=!0,i=null,a=null,h=null,f=1,m=!1,u=!1,d=!1,g=!1,M=null,y="stroke",w=!se.has(t),p=0,b="stroke",k=null,A=x=>{if(!(x===y&&w)){for(let[T,F]of Object.entries(le(x)))t.setAttribute(T,F);y=x,w=!0,se.add(t)}},I=x=>{let T=Y&&z(x)==="fill"?Y.regionOf(x,c):x;t.setAttribute("d",zt(T)),A(fn(T))},v=x=>{let T=r;x.then(()=>{!u&&l&&r===T&&M===null&&I(T)},()=>{})};I(s),z(s)==="fill"&&!Y&&v(ss());let S=x=>{var T,F;return p?x<.5?[0,p]:[p,(F=i==null?void 0:i.items.length)!=null?F:0]:[0,(T=i==null?void 0:i.items.length)!=null?T:0]},N=x=>{let T=i,F=a,q=h;if(!T||!F||!q)return;f=x,mt(T,x,F),g=!0;let[V,W]=S(x);p&&A(x<.5?b:fn(r)),t.setAttribute("d",dt(F.slice(V,W),q.slice(V,W)))},P=()=>{m&&(m=!1,Je(L))},L=x=>{let T=o.step(x);N(o.x),T&&(P(),C())},C=()=>{l=!0,i=null,a=null,h=null,f=1,o.x=1,o.v=0,d=!1,p=0,I(r),z(r)==="fill"&&!Y&&(It||!un)&&v(an())},R=()=>{let x=i,T=a;if(l||!x||!T)return tt(r);let[F,q]=S(f);return T.slice(F,q).map((V,W)=>({pts:Float64Array.from(V),closed:x.items[F+W].closed,hole:x.items[F+W].hole}))},Z=x=>!l&&d||z(x)==="fill"||z(r)==="fill",U=(x,T)=>{if(!l&&i&&a&&!g&&(f=0,mt(i,0,a)),T||!l&&p){let F=R();k=l?r:null,b=y,i=os(F,tt(x)),p=F.length,d=!1}else if(Z(x)){let F=Y;i=l||!a?F.regionPlan(r,x,c):F.regionPlanFrom(d?R():dt(a,h!=null?h:void 0),x,c),d=!0,p=0,A("fill")}else i=l?ts(r,x):ot(R(),tt(x)),d=!1;a=Pt(i),g=!1,h=i.items.map(F=>F.closed),r=x,l=!1},E=(x,T,F)=>{if(Y||!l&&p||!Z(x))return!1;let q={};M=q;let V=()=>{u||M!==q||(M=null,F())},W=an();if(Date.now()-ln>ne)return V(),!0;let at=setTimeout(V,ne-(Date.now()-ln));return W.then(()=>{clearTimeout(at),!(u||M!==q)&&(M=null,T())},()=>{clearTimeout(at),V()}),!0},O=x=>{P(),M=null,r=x,C()},_=()=>{var x;return e==="always"?!0:e!=="user"||typeof matchMedia=="undefined"?!1:(x=matchMedia==null?void 0:matchMedia("(prefers-reduced-motion: reduce)").matches)!=null?x:!1},H=(x,T,F=!1)=>{if(u||!F&&E(x,()=>H(x,T),()=>H(x,T,!0)))return;M=null;let q=!l&&i!==null&&x===r;q&&p&&Y&&k!==null&&(r=k,l=!0,q=!1),P(),o.v=0,q||U(x,F),N(T)},it=(x,T,F)=>{if(u)return;if(x===r&&(l||m)){M=null;return}if(_()){O(x);return}if(!F&&E(x,()=>it(x,T,!1),()=>it(x,T,!0)))return;M=null;let{k:q,c:V}=rs(T);o.config(q,V),U(x,F),o.start(),m||(m=!0,Ke(L))};return{morphTo:(x,T)=>it(x,T,!1),set(x){u||O(x)},seek:H,get progress(){return l?1:f},set progress(x){u||H(r,x)},get reducedMotion(){return e},set reducedMotion(x){e=x},get strokeWidth(){return c},set strokeWidth(x){c=x},destroy(){P(),u=!0,M=null,i=null,a=null,h=null}}}Ct();function mn(t,s,n){return n>=1?s:n<=0||z(t)==="fill"||z(s)==="fill"?t:null}var j=require("react"),At=xe(ue(),1),cs=typeof document=="undefined"?j.useEffect:j.useLayoutEffect;function ls(t,s,n){let o=mn(t,s,n);if(o!==null)return zt(o);let e=ot(xt(t),xt(s)),c=Pt(e);return mt(e,n,c),dt(c,e.items.map(r=>r.closed))}var he=(0,j.forwardRef)(function(s,n){var U;let{icon:o,from:e,to:c,progress:r,spring:l,reducedMotion:i,size:a=24,color:h="currentColor",strokeWidth:f=2,absoluteStrokeWidth:m,label:u,...d}=s,g=e!==void 0&&c!==void 0,M=(U=o!=null?o:e)!=null?U:c,[y]=(0,j.useState)(()=>g?ls(e,c,r!=null?r:0):M!==void 0?zt(M):""),[w]=(0,j.useState)(()=>{var O;let E=ie(g?(O=mn(e,c,r!=null?r:0))!=null?O:(r!=null?r:0)<.5?e:c:M);return E&&{fill:E.fill,stroke:E.stroke,fillRule:E["fill-rule"]}}),p=(0,j.useRef)(null),b=(0,j.useRef)(null),k=(0,j.useRef)(l);k.current=l;let A=(0,j.useRef)(i);A.current=i;let I=Number(m?Number(f)*24/Number(a):f),v=(0,j.useRef)(I);v.current=I;let S=(0,j.useRef)(o),N=(0,j.useRef)(g),P=(0,j.useRef)(!1),L=(0,j.useRef)(!1),C=(0,j.useRef)(null),R=(0,j.useCallback)(E=>{if(b.current)return b.current;let O=p.current;return P.current||!O?null:(b.current=hn(O,E,{reducedMotion:A.current,strokeWidth:v.current}),b.current)},[]);cs(()=>{P.current=!1;let E=p.current;if(E&&M!==void 0){let O=hn(E,g?e:M,{reducedMotion:A.current,strokeWidth:v.current});if(b.current=O,g){C.current=[e,c];let _=r!=null?r:0;_<=0?O.set(e):_>=1?O.set(c):(O.seek(c,_),L.current=!0)}}return()=>{var O;P.current=!0,(O=b.current)==null||O.destroy(),b.current=null,L.current=!1,C.current=null}},[]),(0,j.useEffect)(()=>{let E=b.current;E&&(E.reducedMotion=i!=null?i:"never")},[i]),(0,j.useEffect)(()=>{let E=b.current;E&&(E.strokeWidth=I)},[I]),(0,j.useEffect)(()=>{let E=N.current&&!g;N.current=g;let O=o!==S.current;if(S.current=o,g||o===void 0||!O&&!E)return;C.current=null,L.current=!1;let _=b.current;_?_.morphTo(o,k.current):R(o)},[o,g,R]),(0,j.useEffect)(()=>{var _;if(!g)return;let E=(_=b.current)!=null?_:R(e);if(!E)return;let O=r!=null?r:0;(!C.current||C.current[0]!==e||C.current[1]!==c)&&(C.current=[e,c],L.current=!1),O<=0?(E.set(e),L.current=!1):O>=1?(E.set(c),L.current=!1):(L.current||(E.set(e),L.current=!0),E.seek(c,O))},[g,e,c,r,R]),(0,j.useImperativeHandle)(n,()=>({morphTo:(E,O)=>{C.current=null,L.current=!1;let _=b.current;_?_.morphTo(E,O!=null?O:k.current):R(E)},set:E=>{C.current=null,L.current=!1;let O=b.current;O?O.set(E):R(E)}}),[R]);let Z=m?Number(f)*24/Number(a):f;return(0,At.jsxs)("svg",{xmlns:"http://www.w3.org/2000/svg",width:a,height:a,viewBox:"0 0 24 24",fill:"none",stroke:h,color:h,strokeWidth:Z,strokeLinecap:"round",strokeLinejoin:"round",role:u?"img":void 0,"aria-hidden":u?void 0:!0,...d,children:[u?(0,At.jsx)("title",{children:u}):null,(0,At.jsx)("path",{ref:p,d:y,...w})]})});
      })(require, module, module.exports);
      return module.exports;
    })();

    // ------------------------------------------------------------------
    // 内置 SortableJS 1.15.6（MIT，https://sortablejs.com）：只用于「已选标签」的拖拽排序。
    // 下面是官方 UMD 打包产物，用 CommonJS 包裹内联，避免额外依赖。请勿手改。
    // ------------------------------------------------------------------
    const Sortable = (function () {
      const module = { exports: {} };
      (function (module, exports) {
/*! Sortable 1.15.6 - MIT | git://github.com/SortableJS/Sortable.git */
!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e():"function"==typeof define&&define.amd?define(e):(t=t||self).Sortable=e()}(this,function(){"use strict";function e(e,t){var n,o=Object.keys(e);return Object.getOwnPropertySymbols&&(n=Object.getOwnPropertySymbols(e),t&&(n=n.filter(function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable})),o.push.apply(o,n)),o}function I(o){for(var t=1;t<arguments.length;t++){var i=null!=arguments[t]?arguments[t]:{};t%2?e(Object(i),!0).forEach(function(t){var e,n;e=o,t=i[n=t],n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t}):Object.getOwnPropertyDescriptors?Object.defineProperties(o,Object.getOwnPropertyDescriptors(i)):e(Object(i)).forEach(function(t){Object.defineProperty(o,t,Object.getOwnPropertyDescriptor(i,t))})}return o}function o(t){return(o="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}function a(){return(a=Object.assign||function(t){for(var e=1;e<arguments.length;e++){var n,o=arguments[e];for(n in o)Object.prototype.hasOwnProperty.call(o,n)&&(t[n]=o[n])}return t}).apply(this,arguments)}function i(t,e){if(null==t)return{};var n,o=function(t,e){if(null==t)return{};for(var n,o={},i=Object.keys(t),r=0;r<i.length;r++)n=i[r],0<=e.indexOf(n)||(o[n]=t[n]);return o}(t,e);if(Object.getOwnPropertySymbols)for(var i=Object.getOwnPropertySymbols(t),r=0;r<i.length;r++)n=i[r],0<=e.indexOf(n)||Object.prototype.propertyIsEnumerable.call(t,n)&&(o[n]=t[n]);return o}function r(t){return function(t){if(Array.isArray(t))return l(t)}(t)||function(t){if("undefined"!=typeof Symbol&&null!=t[Symbol.iterator]||null!=t["@@iterator"])return Array.from(t)}(t)||function(t,e){if(t){if("string"==typeof t)return l(t,e);var n=Object.prototype.toString.call(t).slice(8,-1);return"Map"===(n="Object"===n&&t.constructor?t.constructor.name:n)||"Set"===n?Array.from(t):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?l(t,e):void 0}}(t)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function l(t,e){(null==e||e>t.length)&&(e=t.length);for(var n=0,o=new Array(e);n<e;n++)o[n]=t[n];return o}function t(t){if("undefined"!=typeof window&&window.navigator)return!!navigator.userAgent.match(t)}var y=t(/(?:Trident.*rv[ :]?11\.|msie|iemobile|Windows Phone)/i),w=t(/Edge/i),s=t(/firefox/i),u=t(/safari/i)&&!t(/chrome/i)&&!t(/android/i),c=t(/iP(ad|od|hone)/i),n=t(/chrome/i)&&t(/android/i),d={capture:!1,passive:!1};function h(t,e,n){t.addEventListener(e,n,!y&&d)}function p(t,e,n){t.removeEventListener(e,n,!y&&d)}function f(t,e){if(e&&(">"===e[0]&&(e=e.substring(1)),t))try{if(t.matches)return t.matches(e);if(t.msMatchesSelector)return t.msMatchesSelector(e);if(t.webkitMatchesSelector)return t.webkitMatchesSelector(e)}catch(t){return}}function g(t){return t.host&&t!==document&&t.host.nodeType?t.host:t.parentNode}function P(t,e,n,o){if(t){n=n||document;do{if(null!=e&&(">"!==e[0]||t.parentNode===n)&&f(t,e)||o&&t===n)return t}while(t!==n&&(t=g(t)))}return null}var m,v=/\s+/g;function k(t,e,n){var o;t&&e&&(t.classList?t.classList[n?"add":"remove"](e):(o=(" "+t.className+" ").replace(v," ").replace(" "+e+" "," "),t.className=(o+(n?" "+e:"")).replace(v," ")))}function R(t,e,n){var o=t&&t.style;if(o){if(void 0===n)return document.defaultView&&document.defaultView.getComputedStyle?n=document.defaultView.getComputedStyle(t,""):t.currentStyle&&(n=t.currentStyle),void 0===e?n:n[e];o[e=!(e in o||-1!==e.indexOf("webkit"))?"-webkit-"+e:e]=n+("string"==typeof n?"":"px")}}function b(t,e){var n="";if("string"==typeof t)n=t;else do{var o=R(t,"transform")}while(o&&"none"!==o&&(n=o+" "+n),!e&&(t=t.parentNode));var i=window.DOMMatrix||window.WebKitCSSMatrix||window.CSSMatrix||window.MSCSSMatrix;return i&&new i(n)}function D(t,e,n){if(t){var o=t.getElementsByTagName(e),i=0,r=o.length;if(n)for(;i<r;i++)n(o[i],i);return o}return[]}function O(){var t=document.scrollingElement;return t||document.documentElement}function X(t,e,n,o,i){if(t.getBoundingClientRect||t===window){var r,a,l,s,c,u,d=t!==window&&t.parentNode&&t!==O()?(a=(r=t.getBoundingClientRect()).top,l=r.left,s=r.bottom,c=r.right,u=r.height,r.width):(l=a=0,s=window.innerHeight,c=window.innerWidth,u=window.innerHeight,window.innerWidth);if((e||n)&&t!==window&&(i=i||t.parentNode,!y))do{if(i&&i.getBoundingClientRect&&("none"!==R(i,"transform")||n&&"static"!==R(i,"position"))){var h=i.getBoundingClientRect();a-=h.top+parseInt(R(i,"border-top-width")),l-=h.left+parseInt(R(i,"border-left-width")),s=a+r.height,c=l+r.width;break}}while(i=i.parentNode);return o&&t!==window&&(o=(e=b(i||t))&&e.a,t=e&&e.d,e&&(s=(a/=t)+(u/=t),c=(l/=o)+(d/=o))),{top:a,left:l,bottom:s,right:c,width:d,height:u}}}function Y(t,e,n){for(var o=M(t,!0),i=X(t)[e];o;){var r=X(o)[n];if(!("top"===n||"left"===n?r<=i:i<=r))return o;if(o===O())break;o=M(o,!1)}return!1}function B(t,e,n,o){for(var i=0,r=0,a=t.children;r<a.length;){if("none"!==a[r].style.display&&a[r]!==jt.ghost&&(o||a[r]!==jt.dragged)&&P(a[r],n.draggable,t,!1)){if(i===e)return a[r];i++}r++}return null}function F(t,e){for(var n=t.lastElementChild;n&&(n===jt.ghost||"none"===R(n,"display")||e&&!f(n,e));)n=n.previousElementSibling;return n||null}function j(t,e){var n=0;if(!t||!t.parentNode)return-1;for(;t=t.previousElementSibling;)"TEMPLATE"===t.nodeName.toUpperCase()||t===jt.clone||e&&!f(t,e)||n++;return n}function E(t){var e=0,n=0,o=O();if(t)do{var i=b(t),r=i.a,i=i.d}while(e+=t.scrollLeft*r,n+=t.scrollTop*i,t!==o&&(t=t.parentNode));return[e,n]}function M(t,e){if(!t||!t.getBoundingClientRect)return O();var n=t,o=!1;do{if(n.clientWidth<n.scrollWidth||n.clientHeight<n.scrollHeight){var i=R(n);if(n.clientWidth<n.scrollWidth&&("auto"==i.overflowX||"scroll"==i.overflowX)||n.clientHeight<n.scrollHeight&&("auto"==i.overflowY||"scroll"==i.overflowY)){if(!n.getBoundingClientRect||n===document.body)return O();if(o||e)return n;o=!0}}}while(n=n.parentNode);return O()}function S(t,e){return Math.round(t.top)===Math.round(e.top)&&Math.round(t.left)===Math.round(e.left)&&Math.round(t.height)===Math.round(e.height)&&Math.round(t.width)===Math.round(e.width)}function _(e,n){return function(){var t;m||(1===(t=arguments).length?e.call(this,t[0]):e.apply(this,t),m=setTimeout(function(){m=void 0},n))}}function H(t,e,n){t.scrollLeft+=e,t.scrollTop+=n}function C(t){var e=window.Polymer,n=window.jQuery||window.Zepto;return e&&e.dom?e.dom(t).cloneNode(!0):n?n(t).clone(!0)[0]:t.cloneNode(!0)}function T(t,e){R(t,"position","absolute"),R(t,"top",e.top),R(t,"left",e.left),R(t,"width",e.width),R(t,"height",e.height)}function x(t){R(t,"position",""),R(t,"top",""),R(t,"left",""),R(t,"width",""),R(t,"height","")}function L(n,o,i){var r={};return Array.from(n.children).forEach(function(t){var e;P(t,o.draggable,n,!1)&&!t.animated&&t!==i&&(e=X(t),r.left=Math.min(null!==(t=r.left)&&void 0!==t?t:1/0,e.left),r.top=Math.min(null!==(t=r.top)&&void 0!==t?t:1/0,e.top),r.right=Math.max(null!==(t=r.right)&&void 0!==t?t:-1/0,e.right),r.bottom=Math.max(null!==(t=r.bottom)&&void 0!==t?t:-1/0,e.bottom))}),r.width=r.right-r.left,r.height=r.bottom-r.top,r.x=r.left,r.y=r.top,r}var K="Sortable"+(new Date).getTime();function A(){var e,o=[];return{captureAnimationState:function(){o=[],this.options.animation&&[].slice.call(this.el.children).forEach(function(t){var e,n;"none"!==R(t,"display")&&t!==jt.ghost&&(o.push({target:t,rect:X(t)}),e=I({},o[o.length-1].rect),!t.thisAnimationDuration||(n=b(t,!0))&&(e.top-=n.f,e.left-=n.e),t.fromRect=e)})},addAnimationState:function(t){o.push(t)},removeAnimationState:function(t){o.splice(function(t,e){for(var n in t)if(t.hasOwnProperty(n))for(var o in e)if(e.hasOwnProperty(o)&&e[o]===t[n][o])return Number(n);return-1}(o,{target:t}),1)},animateAll:function(t){var c=this;if(!this.options.animation)return clearTimeout(e),void("function"==typeof t&&t());var u=!1,d=0;o.forEach(function(t){var e=0,n=t.target,o=n.fromRect,i=X(n),r=n.prevFromRect,a=n.prevToRect,l=t.rect,s=b(n,!0);s&&(i.top-=s.f,i.left-=s.e),n.toRect=i,n.thisAnimationDuration&&S(r,i)&&!S(o,i)&&(l.top-i.top)/(l.left-i.left)==(o.top-i.top)/(o.left-i.left)&&(t=l,s=r,r=a,a=c.options,e=Math.sqrt(Math.pow(s.top-t.top,2)+Math.pow(s.left-t.left,2))/Math.sqrt(Math.pow(s.top-r.top,2)+Math.pow(s.left-r.left,2))*a.animation),S(i,o)||(n.prevFromRect=o,n.prevToRect=i,e=e||c.options.animation,c.animate(n,l,i,e)),e&&(u=!0,d=Math.max(d,e),clearTimeout(n.animationResetTimer),n.animationResetTimer=setTimeout(function(){n.animationTime=0,n.prevFromRect=null,n.fromRect=null,n.prevToRect=null,n.thisAnimationDuration=null},e),n.thisAnimationDuration=e)}),clearTimeout(e),u?e=setTimeout(function(){"function"==typeof t&&t()},d):"function"==typeof t&&t(),o=[]},animate:function(t,e,n,o){var i,r;o&&(R(t,"transition",""),R(t,"transform",""),i=(r=b(this.el))&&r.a,r=r&&r.d,i=(e.left-n.left)/(i||1),r=(e.top-n.top)/(r||1),t.animatingX=!!i,t.animatingY=!!r,R(t,"transform","translate3d("+i+"px,"+r+"px,0)"),this.forRepaintDummy=t.offsetWidth,R(t,"transition","transform "+o+"ms"+(this.options.easing?" "+this.options.easing:"")),R(t,"transform","translate3d(0,0,0)"),"number"==typeof t.animated&&clearTimeout(t.animated),t.animated=setTimeout(function(){R(t,"transition",""),R(t,"transform",""),t.animated=!1,t.animatingX=!1,t.animatingY=!1},o))}}}var N=[],W={initializeByDefault:!0},z={mount:function(e){for(var t in W)!W.hasOwnProperty(t)||t in e||(e[t]=W[t]);N.forEach(function(t){if(t.pluginName===e.pluginName)throw"Sortable: Cannot mount plugin ".concat(e.pluginName," more than once")}),N.push(e)},pluginEvent:function(e,n,o){var t=this;this.eventCanceled=!1,o.cancel=function(){t.eventCanceled=!0};var i=e+"Global";N.forEach(function(t){n[t.pluginName]&&(n[t.pluginName][i]&&n[t.pluginName][i](I({sortable:n},o)),n.options[t.pluginName]&&n[t.pluginName][e]&&n[t.pluginName][e](I({sortable:n},o)))})},initializePlugins:function(n,o,i,t){for(var e in N.forEach(function(t){var e=t.pluginName;(n.options[e]||t.initializeByDefault)&&((t=new t(n,o,n.options)).sortable=n,t.options=n.options,n[e]=t,a(i,t.defaults))}),n.options){var r;n.options.hasOwnProperty(e)&&(void 0!==(r=this.modifyOption(n,e,n.options[e]))&&(n.options[e]=r))}},getEventProperties:function(e,n){var o={};return N.forEach(function(t){"function"==typeof t.eventProperties&&a(o,t.eventProperties.call(n[t.pluginName],e))}),o},modifyOption:function(e,n,o){var i;return N.forEach(function(t){e[t.pluginName]&&t.optionListeners&&"function"==typeof t.optionListeners[n]&&(i=t.optionListeners[n].call(e[t.pluginName],o))}),i}};function G(t){var e=t.sortable,n=t.rootEl,o=t.name,i=t.targetEl,r=t.cloneEl,a=t.toEl,l=t.fromEl,s=t.oldIndex,c=t.newIndex,u=t.oldDraggableIndex,d=t.newDraggableIndex,h=t.originalEvent,p=t.putSortable,f=t.extraEventProperties;if(e=e||n&&n[K]){var g,m=e.options,t="on"+o.charAt(0).toUpperCase()+o.substr(1);!window.CustomEvent||y||w?(g=document.createEvent("Event")).initEvent(o,!0,!0):g=new CustomEvent(o,{bubbles:!0,cancelable:!0}),g.to=a||n,g.from=l||n,g.item=i||n,g.clone=r,g.oldIndex=s,g.newIndex=c,g.oldDraggableIndex=u,g.newDraggableIndex=d,g.originalEvent=h,g.pullMode=p?p.lastPutMode:void 0;var v,b=I(I({},f),z.getEventProperties(o,e));for(v in b)g[v]=b[v];n&&n.dispatchEvent(g),m[t]&&m[t].call(e,g)}}function U(t,e){var n=(o=2<arguments.length&&void 0!==arguments[2]?arguments[2]:{}).evt,o=i(o,q);z.pluginEvent.bind(jt)(t,e,I({dragEl:Z,parentEl:$,ghostEl:Q,rootEl:J,nextEl:tt,lastDownEl:et,cloneEl:nt,cloneHidden:ot,dragStarted:mt,putSortable:ct,activeSortable:jt.active,originalEvent:n,oldIndex:it,oldDraggableIndex:at,newIndex:rt,newDraggableIndex:lt,hideGhostForTarget:Xt,unhideGhostForTarget:Yt,cloneNowHidden:function(){ot=!0},cloneNowShown:function(){ot=!1},dispatchSortableEvent:function(t){V({sortable:e,name:t,originalEvent:n})}},o))}var q=["evt"];function V(t){G(I({putSortable:ct,cloneEl:nt,targetEl:Z,rootEl:J,oldIndex:it,oldDraggableIndex:at,newIndex:rt,newDraggableIndex:lt},t))}var Z,$,Q,J,tt,et,nt,ot,it,rt,at,lt,st,ct,ut,dt,ht,pt,ft,gt,mt,vt,bt,yt,wt,Dt=!1,Et=!1,St=[],_t=!1,Ct=!1,Tt=[],xt=!1,Ot=[],Mt="undefined"!=typeof document,At=c,Nt=w||y?"cssFloat":"float",It=Mt&&!n&&!c&&"draggable"in document.createElement("div"),Pt=function(){if(Mt){if(y)return!1;var t=document.createElement("x");return t.style.cssText="pointer-events:auto","auto"===t.style.pointerEvents}}(),kt=function(t,e){var n=R(t),o=parseInt(n.width)-parseInt(n.paddingLeft)-parseInt(n.paddingRight)-parseInt(n.borderLeftWidth)-parseInt(n.borderRightWidth),i=B(t,0,e),r=B(t,1,e),a=i&&R(i),l=r&&R(r),s=a&&parseInt(a.marginLeft)+parseInt(a.marginRight)+X(i).width,t=l&&parseInt(l.marginLeft)+parseInt(l.marginRight)+X(r).width;if("flex"===n.display)return"column"===n.flexDirection||"column-reverse"===n.flexDirection?"vertical":"horizontal";if("grid"===n.display)return n.gridTemplateColumns.split(" ").length<=1?"vertical":"horizontal";if(i&&a.float&&"none"!==a.float){e="left"===a.float?"left":"right";return!r||"both"!==l.clear&&l.clear!==e?"horizontal":"vertical"}return i&&("block"===a.display||"flex"===a.display||"table"===a.display||"grid"===a.display||o<=s&&"none"===n[Nt]||r&&"none"===n[Nt]&&o<s+t)?"vertical":"horizontal"},Rt=function(t){function l(r,a){return function(t,e,n,o){var i=t.options.group.name&&e.options.group.name&&t.options.group.name===e.options.group.name;if(null==r&&(a||i))return!0;if(null==r||!1===r)return!1;if(a&&"clone"===r)return r;if("function"==typeof r)return l(r(t,e,n,o),a)(t,e,n,o);e=(a?t:e).options.group.name;return!0===r||"string"==typeof r&&r===e||r.join&&-1<r.indexOf(e)}}var e={},n=t.group;n&&"object"==o(n)||(n={name:n}),e.name=n.name,e.checkPull=l(n.pull,!0),e.checkPut=l(n.put),e.revertClone=n.revertClone,t.group=e},Xt=function(){!Pt&&Q&&R(Q,"display","none")},Yt=function(){!Pt&&Q&&R(Q,"display","")};Mt&&!n&&document.addEventListener("click",function(t){if(Et)return t.preventDefault(),t.stopPropagation&&t.stopPropagation(),t.stopImmediatePropagation&&t.stopImmediatePropagation(),Et=!1},!0);function Bt(t){if(Z){t=t.touches?t.touches[0]:t;var e=(i=t.clientX,r=t.clientY,St.some(function(t){var e=t[K].options.emptyInsertThreshold;if(e&&!F(t)){var n=X(t),o=i>=n.left-e&&i<=n.right+e,e=r>=n.top-e&&r<=n.bottom+e;return o&&e?a=t:void 0}}),a);if(e){var n,o={};for(n in t)t.hasOwnProperty(n)&&(o[n]=t[n]);o.target=o.rootEl=e,o.preventDefault=void 0,o.stopPropagation=void 0,e[K]._onDragOver(o)}}var i,r,a}function Ft(t){Z&&Z.parentNode[K]._isOutsideThisEl(t.target)}function jt(t,e){if(!t||!t.nodeType||1!==t.nodeType)throw"Sortable: `el` must be an HTMLElement, not ".concat({}.toString.call(t));this.el=t,this.options=e=a({},e),t[K]=this;var n,o,i={group:null,sort:!0,disabled:!1,store:null,handle:null,draggable:/^[uo]l$/i.test(t.nodeName)?">li":">*",swapThreshold:1,invertSwap:!1,invertedSwapThreshold:null,removeCloneOnHide:!0,direction:function(){return kt(t,this.options)},ghostClass:"sortable-ghost",chosenClass:"sortable-chosen",dragClass:"sortable-drag",ignore:"a, img",filter:null,preventOnFilter:!0,animation:0,easing:null,setData:function(t,e){t.setData("Text",e.textContent)},dropBubble:!1,dragoverBubble:!1,dataIdAttr:"data-id",delay:0,delayOnTouchOnly:!1,touchStartThreshold:(Number.parseInt?Number:window).parseInt(window.devicePixelRatio,10)||1,forceFallback:!1,fallbackClass:"sortable-fallback",fallbackOnBody:!1,fallbackTolerance:0,fallbackOffset:{x:0,y:0},supportPointer:!1!==jt.supportPointer&&"PointerEvent"in window&&(!u||c),emptyInsertThreshold:5};for(n in z.initializePlugins(this,t,i),i)n in e||(e[n]=i[n]);for(o in Rt(e),this)"_"===o.charAt(0)&&"function"==typeof this[o]&&(this[o]=this[o].bind(this));this.nativeDraggable=!e.forceFallback&&It,this.nativeDraggable&&(this.options.touchStartThreshold=1),e.supportPointer?h(t,"pointerdown",this._onTapStart):(h(t,"mousedown",this._onTapStart),h(t,"touchstart",this._onTapStart)),this.nativeDraggable&&(h(t,"dragover",this),h(t,"dragenter",this)),St.push(this.el),e.store&&e.store.get&&this.sort(e.store.get(this)||[]),a(this,A())}function Ht(t,e,n,o,i,r,a,l){var s,c,u=t[K],d=u.options.onMove;return!window.CustomEvent||y||w?(s=document.createEvent("Event")).initEvent("move",!0,!0):s=new CustomEvent("move",{bubbles:!0,cancelable:!0}),s.to=e,s.from=t,s.dragged=n,s.draggedRect=o,s.related=i||e,s.relatedRect=r||X(e),s.willInsertAfter=l,s.originalEvent=a,t.dispatchEvent(s),c=d?d.call(u,s,a):c}function Lt(t){t.draggable=!1}function Kt(){xt=!1}function Wt(t){return setTimeout(t,0)}function zt(t){return clearTimeout(t)}jt.prototype={constructor:jt,_isOutsideThisEl:function(t){this.el.contains(t)||t===this.el||(vt=null)},_getDirection:function(t,e){return"function"==typeof this.options.direction?this.options.direction.call(this,t,e,Z):this.options.direction},_onTapStart:function(e){if(e.cancelable){var n=this,o=this.el,t=this.options,i=t.preventOnFilter,r=e.type,a=e.touches&&e.touches[0]||e.pointerType&&"touch"===e.pointerType&&e,l=(a||e).target,s=e.target.shadowRoot&&(e.path&&e.path[0]||e.composedPath&&e.composedPath()[0])||l,c=t.filter;if(!function(t){Ot.length=0;var e=t.getElementsByTagName("input"),n=e.length;for(;n--;){var o=e[n];o.checked&&Ot.push(o)}}(o),!Z&&!(/mousedown|pointerdown/.test(r)&&0!==e.button||t.disabled)&&!s.isContentEditable&&(this.nativeDraggable||!u||!l||"SELECT"!==l.tagName.toUpperCase())&&!((l=P(l,t.draggable,o,!1))&&l.animated||et===l)){if(it=j(l),at=j(l,t.draggable),"function"==typeof c){if(c.call(this,e,l,this))return V({sortable:n,rootEl:s,name:"filter",targetEl:l,toEl:o,fromEl:o}),U("filter",n,{evt:e}),void(i&&e.preventDefault())}else if(c=c&&c.split(",").some(function(t){if(t=P(s,t.trim(),o,!1))return V({sortable:n,rootEl:t,name:"filter",targetEl:l,fromEl:o,toEl:o}),U("filter",n,{evt:e}),!0}))return void(i&&e.preventDefault());t.handle&&!P(s,t.handle,o,!1)||this._prepareDragStart(e,a,l)}}},_prepareDragStart:function(t,e,n){var o,i=this,r=i.el,a=i.options,l=r.ownerDocument;n&&!Z&&n.parentNode===r&&(o=X(n),J=r,$=(Z=n).parentNode,tt=Z.nextSibling,et=n,st=a.group,ut={target:jt.dragged=Z,clientX:(e||t).clientX,clientY:(e||t).clientY},ft=ut.clientX-o.left,gt=ut.clientY-o.top,this._lastX=(e||t).clientX,this._lastY=(e||t).clientY,Z.style["will-change"]="all",o=function(){U("delayEnded",i,{evt:t}),jt.eventCanceled?i._onDrop():(i._disableDelayedDragEvents(),!s&&i.nativeDraggable&&(Z.draggable=!0),i._triggerDragStart(t,e),V({sortable:i,name:"choose",originalEvent:t}),k(Z,a.chosenClass,!0))},a.ignore.split(",").forEach(function(t){D(Z,t.trim(),Lt)}),h(l,"dragover",Bt),h(l,"mousemove",Bt),h(l,"touchmove",Bt),a.supportPointer?(h(l,"pointerup",i._onDrop),this.nativeDraggable||h(l,"pointercancel",i._onDrop)):(h(l,"mouseup",i._onDrop),h(l,"touchend",i._onDrop),h(l,"touchcancel",i._onDrop)),s&&this.nativeDraggable&&(this.options.touchStartThreshold=4,Z.draggable=!0),U("delayStart",this,{evt:t}),!a.delay||a.delayOnTouchOnly&&!e||this.nativeDraggable&&(w||y)?o():jt.eventCanceled?this._onDrop():(a.supportPointer?(h(l,"pointerup",i._disableDelayedDrag),h(l,"pointercancel",i._disableDelayedDrag)):(h(l,"mouseup",i._disableDelayedDrag),h(l,"touchend",i._disableDelayedDrag),h(l,"touchcancel",i._disableDelayedDrag)),h(l,"mousemove",i._delayedDragTouchMoveHandler),h(l,"touchmove",i._delayedDragTouchMoveHandler),a.supportPointer&&h(l,"pointermove",i._delayedDragTouchMoveHandler),i._dragStartTimer=setTimeout(o,a.delay)))},_delayedDragTouchMoveHandler:function(t){t=t.touches?t.touches[0]:t;Math.max(Math.abs(t.clientX-this._lastX),Math.abs(t.clientY-this._lastY))>=Math.floor(this.options.touchStartThreshold/(this.nativeDraggable&&window.devicePixelRatio||1))&&this._disableDelayedDrag()},_disableDelayedDrag:function(){Z&&Lt(Z),clearTimeout(this._dragStartTimer),this._disableDelayedDragEvents()},_disableDelayedDragEvents:function(){var t=this.el.ownerDocument;p(t,"mouseup",this._disableDelayedDrag),p(t,"touchend",this._disableDelayedDrag),p(t,"touchcancel",this._disableDelayedDrag),p(t,"pointerup",this._disableDelayedDrag),p(t,"pointercancel",this._disableDelayedDrag),p(t,"mousemove",this._delayedDragTouchMoveHandler),p(t,"touchmove",this._delayedDragTouchMoveHandler),p(t,"pointermove",this._delayedDragTouchMoveHandler)},_triggerDragStart:function(t,e){e=e||"touch"==t.pointerType&&t,!this.nativeDraggable||e?this.options.supportPointer?h(document,"pointermove",this._onTouchMove):h(document,e?"touchmove":"mousemove",this._onTouchMove):(h(Z,"dragend",this),h(J,"dragstart",this._onDragStart));try{document.selection?Wt(function(){document.selection.empty()}):window.getSelection().removeAllRanges()}catch(t){}},_dragStarted:function(t,e){var n;Dt=!1,J&&Z?(U("dragStarted",this,{evt:e}),this.nativeDraggable&&h(document,"dragover",Ft),n=this.options,t||k(Z,n.dragClass,!1),k(Z,n.ghostClass,!0),jt.active=this,t&&this._appendGhost(),V({sortable:this,name:"start",originalEvent:e})):this._nulling()},_emulateDragOver:function(){if(dt){this._lastX=dt.clientX,this._lastY=dt.clientY,Xt();for(var t=document.elementFromPoint(dt.clientX,dt.clientY),e=t;t&&t.shadowRoot&&(t=t.shadowRoot.elementFromPoint(dt.clientX,dt.clientY))!==e;)e=t;if(Z.parentNode[K]._isOutsideThisEl(t),e)do{if(e[K])if(e[K]._onDragOver({clientX:dt.clientX,clientY:dt.clientY,target:t,rootEl:e})&&!this.options.dragoverBubble)break}while(e=g(t=e));Yt()}},_onTouchMove:function(t){if(ut){var e=this.options,n=e.fallbackTolerance,o=e.fallbackOffset,i=t.touches?t.touches[0]:t,r=Q&&b(Q,!0),a=Q&&r&&r.a,l=Q&&r&&r.d,e=At&&wt&&E(wt),a=(i.clientX-ut.clientX+o.x)/(a||1)+(e?e[0]-Tt[0]:0)/(a||1),l=(i.clientY-ut.clientY+o.y)/(l||1)+(e?e[1]-Tt[1]:0)/(l||1);if(!jt.active&&!Dt){if(n&&Math.max(Math.abs(i.clientX-this._lastX),Math.abs(i.clientY-this._lastY))<n)return;this._onDragStart(t,!0)}Q&&(r?(r.e+=a-(ht||0),r.f+=l-(pt||0)):r={a:1,b:0,c:0,d:1,e:a,f:l},r="matrix(".concat(r.a,",").concat(r.b,",").concat(r.c,",").concat(r.d,",").concat(r.e,",").concat(r.f,")"),R(Q,"webkitTransform",r),R(Q,"mozTransform",r),R(Q,"msTransform",r),R(Q,"transform",r),ht=a,pt=l,dt=i),t.cancelable&&t.preventDefault()}},_appendGhost:function(){if(!Q){var t=this.options.fallbackOnBody?document.body:J,e=X(Z,!0,At,!0,t),n=this.options;if(At){for(wt=t;"static"===R(wt,"position")&&"none"===R(wt,"transform")&&wt!==document;)wt=wt.parentNode;wt!==document.body&&wt!==document.documentElement?(wt===document&&(wt=O()),e.top+=wt.scrollTop,e.left+=wt.scrollLeft):wt=O(),Tt=E(wt)}k(Q=Z.cloneNode(!0),n.ghostClass,!1),k(Q,n.fallbackClass,!0),k(Q,n.dragClass,!0),R(Q,"transition",""),R(Q,"transform",""),R(Q,"box-sizing","border-box"),R(Q,"margin",0),R(Q,"top",e.top),R(Q,"left",e.left),R(Q,"width",e.width),R(Q,"height",e.height),R(Q,"opacity","0.8"),R(Q,"position",At?"absolute":"fixed"),R(Q,"zIndex","100000"),R(Q,"pointerEvents","none"),jt.ghost=Q,t.appendChild(Q),R(Q,"transform-origin",ft/parseInt(Q.style.width)*100+"% "+gt/parseInt(Q.style.height)*100+"%")}},_onDragStart:function(t,e){var n=this,o=t.dataTransfer,i=n.options;U("dragStart",this,{evt:t}),jt.eventCanceled?this._onDrop():(U("setupClone",this),jt.eventCanceled||((nt=C(Z)).removeAttribute("id"),nt.draggable=!1,nt.style["will-change"]="",this._hideClone(),k(nt,this.options.chosenClass,!1),jt.clone=nt),n.cloneId=Wt(function(){U("clone",n),jt.eventCanceled||(n.options.removeCloneOnHide||J.insertBefore(nt,Z),n._hideClone(),V({sortable:n,name:"clone"}))}),e||k(Z,i.dragClass,!0),e?(Et=!0,n._loopId=setInterval(n._emulateDragOver,50)):(p(document,"mouseup",n._onDrop),p(document,"touchend",n._onDrop),p(document,"touchcancel",n._onDrop),o&&(o.effectAllowed="move",i.setData&&i.setData.call(n,o,Z)),h(document,"drop",n),R(Z,"transform","translateZ(0)")),Dt=!0,n._dragStartId=Wt(n._dragStarted.bind(n,e,t)),h(document,"selectstart",n),mt=!0,window.getSelection().removeAllRanges(),u&&R(document.body,"user-select","none"))},_onDragOver:function(n){var o,i,r,t,e,a=this.el,l=n.target,s=this.options,c=s.group,u=jt.active,d=st===c,h=s.sort,p=ct||u,f=this,g=!1;if(!xt){if(void 0!==n.preventDefault&&n.cancelable&&n.preventDefault(),l=P(l,s.draggable,a,!0),O("dragOver"),jt.eventCanceled)return g;if(Z.contains(n.target)||l.animated&&l.animatingX&&l.animatingY||f._ignoreWhileAnimating===l)return A(!1);if(Et=!1,u&&!s.disabled&&(d?h||(i=$!==J):ct===this||(this.lastPutMode=st.checkPull(this,u,Z,n))&&c.checkPut(this,u,Z,n))){if(r="vertical"===this._getDirection(n,l),o=X(Z),O("dragOverValid"),jt.eventCanceled)return g;if(i)return $=J,M(),this._hideClone(),O("revert"),jt.eventCanceled||(tt?J.insertBefore(Z,tt):J.appendChild(Z)),A(!0);var m=F(a,s.draggable);if(m&&(S=n,c=r,x=X(F((E=this).el,E.options.draggable)),E=L(E.el,E.options,Q),!(c?S.clientX>E.right+10||S.clientY>x.bottom&&S.clientX>x.left:S.clientY>E.bottom+10||S.clientX>x.right&&S.clientY>x.top)||m.animated)){if(m&&(t=n,e=r,C=X(B((_=this).el,0,_.options,!0)),_=L(_.el,_.options,Q),e?t.clientX<_.left-10||t.clientY<C.top&&t.clientX<C.right:t.clientY<_.top-10||t.clientY<C.bottom&&t.clientX<C.left)){var v=B(a,0,s,!0);if(v===Z)return A(!1);if(D=X(l=v),!1!==Ht(J,a,Z,o,l,D,n,!1))return M(),a.insertBefore(Z,v),$=a,N(),A(!0)}else if(l.parentNode===a){var b,y,w,D=X(l),E=Z.parentNode!==a,S=(S=Z.animated&&Z.toRect||o,x=l.animated&&l.toRect||D,_=(e=r)?S.left:S.top,t=e?S.right:S.bottom,C=e?S.width:S.height,v=e?x.left:x.top,S=e?x.right:x.bottom,x=e?x.width:x.height,!(_===v||t===S||_+C/2===v+x/2)),_=r?"top":"left",C=Y(l,"top","top")||Y(Z,"top","top"),v=C?C.scrollTop:void 0;if(vt!==l&&(y=D[_],_t=!1,Ct=!S&&s.invertSwap||E),0!==(b=function(t,e,n,o,i,r,a,l){var s=o?t.clientY:t.clientX,c=o?n.height:n.width,t=o?n.top:n.left,o=o?n.bottom:n.right,n=!1;if(!a)if(l&&yt<c*i){if(_t=!_t&&(1===bt?t+c*r/2<s:s<o-c*r/2)?!0:_t)n=!0;else if(1===bt?s<t+yt:o-yt<s)return-bt}else if(t+c*(1-i)/2<s&&s<o-c*(1-i)/2)return function(t){return j(Z)<j(t)?1:-1}(e);if((n=n||a)&&(s<t+c*r/2||o-c*r/2<s))return t+c/2<s?1:-1;return 0}(n,l,D,r,S?1:s.swapThreshold,null==s.invertedSwapThreshold?s.swapThreshold:s.invertedSwapThreshold,Ct,vt===l)))for(var T=j(Z);(w=$.children[T-=b])&&("none"===R(w,"display")||w===Q););if(0===b||w===l)return A(!1);bt=b;var x=(vt=l).nextElementSibling,E=!1,S=Ht(J,a,Z,o,l,D,n,E=1===b);if(!1!==S)return 1!==S&&-1!==S||(E=1===S),xt=!0,setTimeout(Kt,30),M(),E&&!x?a.appendChild(Z):l.parentNode.insertBefore(Z,E?x:l),C&&H(C,0,v-C.scrollTop),$=Z.parentNode,void 0===y||Ct||(yt=Math.abs(y-X(l)[_])),N(),A(!0)}}else{if(m===Z)return A(!1);if((l=m&&a===n.target?m:l)&&(D=X(l)),!1!==Ht(J,a,Z,o,l,D,n,!!l))return M(),m&&m.nextSibling?a.insertBefore(Z,m.nextSibling):a.appendChild(Z),$=a,N(),A(!0)}if(a.contains(Z))return A(!1)}return!1}function O(t,e){U(t,f,I({evt:n,isOwner:d,axis:r?"vertical":"horizontal",revert:i,dragRect:o,targetRect:D,canSort:h,fromSortable:p,target:l,completed:A,onMove:function(t,e){return Ht(J,a,Z,o,t,X(t),n,e)},changed:N},e))}function M(){O("dragOverAnimationCapture"),f.captureAnimationState(),f!==p&&p.captureAnimationState()}function A(t){return O("dragOverCompleted",{insertion:t}),t&&(d?u._hideClone():u._showClone(f),f!==p&&(k(Z,(ct||u).options.ghostClass,!1),k(Z,s.ghostClass,!0)),ct!==f&&f!==jt.active?ct=f:f===jt.active&&ct&&(ct=null),p===f&&(f._ignoreWhileAnimating=l),f.animateAll(function(){O("dragOverAnimationComplete"),f._ignoreWhileAnimating=null}),f!==p&&(p.animateAll(),p._ignoreWhileAnimating=null)),(l===Z&&!Z.animated||l===a&&!l.animated)&&(vt=null),s.dragoverBubble||n.rootEl||l===document||(Z.parentNode[K]._isOutsideThisEl(n.target),t||Bt(n)),!s.dragoverBubble&&n.stopPropagation&&n.stopPropagation(),g=!0}function N(){rt=j(Z),lt=j(Z,s.draggable),V({sortable:f,name:"change",toEl:a,newIndex:rt,newDraggableIndex:lt,originalEvent:n})}},_ignoreWhileAnimating:null,_offMoveEvents:function(){p(document,"mousemove",this._onTouchMove),p(document,"touchmove",this._onTouchMove),p(document,"pointermove",this._onTouchMove),p(document,"dragover",Bt),p(document,"mousemove",Bt),p(document,"touchmove",Bt)},_offUpEvents:function(){var t=this.el.ownerDocument;p(t,"mouseup",this._onDrop),p(t,"touchend",this._onDrop),p(t,"pointerup",this._onDrop),p(t,"pointercancel",this._onDrop),p(t,"touchcancel",this._onDrop),p(document,"selectstart",this)},_onDrop:function(t){var e=this.el,n=this.options;rt=j(Z),lt=j(Z,n.draggable),U("drop",this,{evt:t}),$=Z&&Z.parentNode,rt=j(Z),lt=j(Z,n.draggable),jt.eventCanceled||(_t=Ct=Dt=!1,clearInterval(this._loopId),clearTimeout(this._dragStartTimer),zt(this.cloneId),zt(this._dragStartId),this.nativeDraggable&&(p(document,"drop",this),p(e,"dragstart",this._onDragStart)),this._offMoveEvents(),this._offUpEvents(),u&&R(document.body,"user-select",""),R(Z,"transform",""),t&&(mt&&(t.cancelable&&t.preventDefault(),n.dropBubble||t.stopPropagation()),Q&&Q.parentNode&&Q.parentNode.removeChild(Q),(J===$||ct&&"clone"!==ct.lastPutMode)&&nt&&nt.parentNode&&nt.parentNode.removeChild(nt),Z&&(this.nativeDraggable&&p(Z,"dragend",this),Lt(Z),Z.style["will-change"]="",mt&&!Dt&&k(Z,(ct||this).options.ghostClass,!1),k(Z,this.options.chosenClass,!1),V({sortable:this,name:"unchoose",toEl:$,newIndex:null,newDraggableIndex:null,originalEvent:t}),J!==$?(0<=rt&&(V({rootEl:$,name:"add",toEl:$,fromEl:J,originalEvent:t}),V({sortable:this,name:"remove",toEl:$,originalEvent:t}),V({rootEl:$,name:"sort",toEl:$,fromEl:J,originalEvent:t}),V({sortable:this,name:"sort",toEl:$,originalEvent:t})),ct&&ct.save()):rt!==it&&0<=rt&&(V({sortable:this,name:"update",toEl:$,originalEvent:t}),V({sortable:this,name:"sort",toEl:$,originalEvent:t})),jt.active&&(null!=rt&&-1!==rt||(rt=it,lt=at),V({sortable:this,name:"end",toEl:$,originalEvent:t}),this.save())))),this._nulling()},_nulling:function(){U("nulling",this),J=Z=$=Q=tt=nt=et=ot=ut=dt=mt=rt=lt=it=at=vt=bt=ct=st=jt.dragged=jt.ghost=jt.clone=jt.active=null,Ot.forEach(function(t){t.checked=!0}),Ot.length=ht=pt=0},handleEvent:function(t){switch(t.type){case"drop":case"dragend":this._onDrop(t);break;case"dragenter":case"dragover":Z&&(this._onDragOver(t),function(t){t.dataTransfer&&(t.dataTransfer.dropEffect="move");t.cancelable&&t.preventDefault()}(t));break;case"selectstart":t.preventDefault()}},toArray:function(){for(var t,e=[],n=this.el.children,o=0,i=n.length,r=this.options;o<i;o++)P(t=n[o],r.draggable,this.el,!1)&&e.push(t.getAttribute(r.dataIdAttr)||function(t){var e=t.tagName+t.className+t.src+t.href+t.textContent,n=e.length,o=0;for(;n--;)o+=e.charCodeAt(n);return o.toString(36)}(t));return e},sort:function(t,e){var n={},o=this.el;this.toArray().forEach(function(t,e){e=o.children[e];P(e,this.options.draggable,o,!1)&&(n[t]=e)},this),e&&this.captureAnimationState(),t.forEach(function(t){n[t]&&(o.removeChild(n[t]),o.appendChild(n[t]))}),e&&this.animateAll()},save:function(){var t=this.options.store;t&&t.set&&t.set(this)},closest:function(t,e){return P(t,e||this.options.draggable,this.el,!1)},option:function(t,e){var n=this.options;if(void 0===e)return n[t];var o=z.modifyOption(this,t,e);n[t]=void 0!==o?o:e,"group"===t&&Rt(n)},destroy:function(){U("destroy",this);var t=this.el;t[K]=null,p(t,"mousedown",this._onTapStart),p(t,"touchstart",this._onTapStart),p(t,"pointerdown",this._onTapStart),this.nativeDraggable&&(p(t,"dragover",this),p(t,"dragenter",this)),Array.prototype.forEach.call(t.querySelectorAll("[draggable]"),function(t){t.removeAttribute("draggable")}),this._onDrop(),this._disableDelayedDragEvents(),St.splice(St.indexOf(this.el),1),this.el=t=null},_hideClone:function(){ot||(U("hideClone",this),jt.eventCanceled||(R(nt,"display","none"),this.options.removeCloneOnHide&&nt.parentNode&&nt.parentNode.removeChild(nt),ot=!0))},_showClone:function(t){"clone"===t.lastPutMode?ot&&(U("showClone",this),jt.eventCanceled||(Z.parentNode!=J||this.options.group.revertClone?tt?J.insertBefore(nt,tt):J.appendChild(nt):J.insertBefore(nt,Z),this.options.group.revertClone&&this.animate(Z,nt),R(nt,"display",""),ot=!1)):this._hideClone()}},Mt&&h(document,"touchmove",function(t){(jt.active||Dt)&&t.cancelable&&t.preventDefault()}),jt.utils={on:h,off:p,css:R,find:D,is:function(t,e){return!!P(t,e,t,!1)},extend:function(t,e){if(t&&e)for(var n in e)e.hasOwnProperty(n)&&(t[n]=e[n]);return t},throttle:_,closest:P,toggleClass:k,clone:C,index:j,nextTick:Wt,cancelNextTick:zt,detectDirection:kt,getChild:B,expando:K},jt.get=function(t){return t[K]},jt.mount=function(){for(var t=arguments.length,e=new Array(t),n=0;n<t;n++)e[n]=arguments[n];(e=e[0].constructor===Array?e[0]:e).forEach(function(t){if(!t.prototype||!t.prototype.constructor)throw"Sortable: Mounted plugin must be a constructor function, not ".concat({}.toString.call(t));t.utils&&(jt.utils=I(I({},jt.utils),t.utils)),z.mount(t)})},jt.create=function(t,e){return new jt(t,e)};var Gt,Ut,qt,Vt,Zt,$t,Qt=[],Jt=!(jt.version="1.15.6");function te(){Qt.forEach(function(t){clearInterval(t.pid)}),Qt=[]}function ee(){clearInterval($t)}var ne,oe=_(function(n,t,e,o){if(t.scroll){var i,r=(n.touches?n.touches[0]:n).clientX,a=(n.touches?n.touches[0]:n).clientY,l=t.scrollSensitivity,s=t.scrollSpeed,c=O(),u=!1;Ut!==e&&(Ut=e,te(),Gt=t.scroll,i=t.scrollFn,!0===Gt&&(Gt=M(e,!0)));var d=0,h=Gt;do{var p=h,f=X(p),g=f.top,m=f.bottom,v=f.left,b=f.right,y=f.width,w=f.height,D=void 0,E=void 0,S=p.scrollWidth,_=p.scrollHeight,C=R(p),T=p.scrollLeft,f=p.scrollTop,E=p===c?(D=y<S&&("auto"===C.overflowX||"scroll"===C.overflowX||"visible"===C.overflowX),w<_&&("auto"===C.overflowY||"scroll"===C.overflowY||"visible"===C.overflowY)):(D=y<S&&("auto"===C.overflowX||"scroll"===C.overflowX),w<_&&("auto"===C.overflowY||"scroll"===C.overflowY)),T=D&&(Math.abs(b-r)<=l&&T+y<S)-(Math.abs(v-r)<=l&&!!T),f=E&&(Math.abs(m-a)<=l&&f+w<_)-(Math.abs(g-a)<=l&&!!f);if(!Qt[d])for(var x=0;x<=d;x++)Qt[x]||(Qt[x]={});Qt[d].vx==T&&Qt[d].vy==f&&Qt[d].el===p||(Qt[d].el=p,Qt[d].vx=T,Qt[d].vy=f,clearInterval(Qt[d].pid),0==T&&0==f||(u=!0,Qt[d].pid=setInterval(function(){o&&0===this.layer&&jt.active._onTouchMove(Zt);var t=Qt[this.layer].vy?Qt[this.layer].vy*s:0,e=Qt[this.layer].vx?Qt[this.layer].vx*s:0;"function"==typeof i&&"continue"!==i.call(jt.dragged.parentNode[K],e,t,n,Zt,Qt[this.layer].el)||H(Qt[this.layer].el,e,t)}.bind({layer:d}),24))),d++}while(t.bubbleScroll&&h!==c&&(h=M(h,!1)));Jt=u}},30),n=function(t){var e=t.originalEvent,n=t.putSortable,o=t.dragEl,i=t.activeSortable,r=t.dispatchSortableEvent,a=t.hideGhostForTarget,t=t.unhideGhostForTarget;e&&(i=n||i,a(),e=e.changedTouches&&e.changedTouches.length?e.changedTouches[0]:e,e=document.elementFromPoint(e.clientX,e.clientY),t(),i&&!i.el.contains(e)&&(r("spill"),this.onSpill({dragEl:o,putSortable:n})))};function ie(){}function re(){}ie.prototype={startIndex:null,dragStart:function(t){t=t.oldDraggableIndex;this.startIndex=t},onSpill:function(t){var e=t.dragEl,n=t.putSortable;this.sortable.captureAnimationState(),n&&n.captureAnimationState();t=B(this.sortable.el,this.startIndex,this.options);t?this.sortable.el.insertBefore(e,t):this.sortable.el.appendChild(e),this.sortable.animateAll(),n&&n.animateAll()},drop:n},a(ie,{pluginName:"revertOnSpill"}),re.prototype={onSpill:function(t){var e=t.dragEl,t=t.putSortable||this.sortable;t.captureAnimationState(),e.parentNode&&e.parentNode.removeChild(e),t.animateAll()},drop:n},a(re,{pluginName:"removeOnSpill"});var ae,le,se,ce,ue,de=[],he=[],pe=!1,fe=!1,ge=!1;function me(n,o){he.forEach(function(t,e){e=o.children[t.sortableIndex+(n?Number(e):0)];e?o.insertBefore(t,e):o.appendChild(t)})}function ve(){de.forEach(function(t){t!==se&&t.parentNode&&t.parentNode.removeChild(t)})}return jt.mount(new function(){function t(){for(var t in this.defaults={scroll:!0,forceAutoScrollFallback:!1,scrollSensitivity:30,scrollSpeed:10,bubbleScroll:!0},this)"_"===t.charAt(0)&&"function"==typeof this[t]&&(this[t]=this[t].bind(this))}return t.prototype={dragStarted:function(t){t=t.originalEvent;this.sortable.nativeDraggable?h(document,"dragover",this._handleAutoScroll):this.options.supportPointer?h(document,"pointermove",this._handleFallbackAutoScroll):t.touches?h(document,"touchmove",this._handleFallbackAutoScroll):h(document,"mousemove",this._handleFallbackAutoScroll)},dragOverCompleted:function(t){t=t.originalEvent;this.options.dragOverBubble||t.rootEl||this._handleAutoScroll(t)},drop:function(){this.sortable.nativeDraggable?p(document,"dragover",this._handleAutoScroll):(p(document,"pointermove",this._handleFallbackAutoScroll),p(document,"touchmove",this._handleFallbackAutoScroll),p(document,"mousemove",this._handleFallbackAutoScroll)),ee(),te(),clearTimeout(m),m=void 0},nulling:function(){Zt=Ut=Gt=Jt=$t=qt=Vt=null,Qt.length=0},_handleFallbackAutoScroll:function(t){this._handleAutoScroll(t,!0)},_handleAutoScroll:function(e,n){var o,i=this,r=(e.touches?e.touches[0]:e).clientX,a=(e.touches?e.touches[0]:e).clientY,t=document.elementFromPoint(r,a);Zt=e,n||this.options.forceAutoScrollFallback||w||y||u?(oe(e,this.options,t,n),o=M(t,!0),!Jt||$t&&r===qt&&a===Vt||($t&&ee(),$t=setInterval(function(){var t=M(document.elementFromPoint(r,a),!0);t!==o&&(o=t,te()),oe(e,i.options,t,n)},10),qt=r,Vt=a)):this.options.bubbleScroll&&M(t,!0)!==O()?oe(e,this.options,M(t,!1),!1):te()}},a(t,{pluginName:"scroll",initializeByDefault:!0})}),jt.mount(re,ie),jt.mount(new function(){function t(){this.defaults={swapClass:"sortable-swap-highlight"}}return t.prototype={dragStart:function(t){t=t.dragEl;ne=t},dragOverValid:function(t){var e=t.completed,n=t.target,o=t.onMove,i=t.activeSortable,r=t.changed,a=t.cancel;i.options.swap&&(t=this.sortable.el,i=this.options,n&&n!==t&&(t=ne,ne=!1!==o(n)?(k(n,i.swapClass,!0),n):null,t&&t!==ne&&k(t,i.swapClass,!1)),r(),e(!0),a())},drop:function(t){var e,n,o=t.activeSortable,i=t.putSortable,r=t.dragEl,a=i||this.sortable,l=this.options;ne&&k(ne,l.swapClass,!1),ne&&(l.swap||i&&i.options.swap)&&r!==ne&&(a.captureAnimationState(),a!==o&&o.captureAnimationState(),n=ne,t=(e=r).parentNode,l=n.parentNode,t&&l&&!t.isEqualNode(n)&&!l.isEqualNode(e)&&(i=j(e),r=j(n),t.isEqualNode(l)&&i<r&&r++,t.insertBefore(n,t.children[i]),l.insertBefore(e,l.children[r])),a.animateAll(),a!==o&&o.animateAll())},nulling:function(){ne=null}},a(t,{pluginName:"swap",eventProperties:function(){return{swapItem:ne}}})}),jt.mount(new function(){function t(o){for(var t in this)"_"===t.charAt(0)&&"function"==typeof this[t]&&(this[t]=this[t].bind(this));o.options.avoidImplicitDeselect||(o.options.supportPointer?h(document,"pointerup",this._deselectMultiDrag):(h(document,"mouseup",this._deselectMultiDrag),h(document,"touchend",this._deselectMultiDrag))),h(document,"keydown",this._checkKeyDown),h(document,"keyup",this._checkKeyUp),this.defaults={selectedClass:"sortable-selected",multiDragKey:null,avoidImplicitDeselect:!1,setData:function(t,e){var n="";de.length&&le===o?de.forEach(function(t,e){n+=(e?", ":"")+t.textContent}):n=e.textContent,t.setData("Text",n)}}}return t.prototype={multiDragKeyDown:!1,isMultiDrag:!1,delayStartGlobal:function(t){t=t.dragEl;se=t},delayEnded:function(){this.isMultiDrag=~de.indexOf(se)},setupClone:function(t){var e=t.sortable,t=t.cancel;if(this.isMultiDrag){for(var n=0;n<de.length;n++)he.push(C(de[n])),he[n].sortableIndex=de[n].sortableIndex,he[n].draggable=!1,he[n].style["will-change"]="",k(he[n],this.options.selectedClass,!1),de[n]===se&&k(he[n],this.options.chosenClass,!1);e._hideClone(),t()}},clone:function(t){var e=t.sortable,n=t.rootEl,o=t.dispatchSortableEvent,t=t.cancel;this.isMultiDrag&&(this.options.removeCloneOnHide||de.length&&le===e&&(me(!0,n),o("clone"),t()))},showClone:function(t){var e=t.cloneNowShown,n=t.rootEl,t=t.cancel;this.isMultiDrag&&(me(!1,n),he.forEach(function(t){R(t,"display","")}),e(),ue=!1,t())},hideClone:function(t){var e=this,n=(t.sortable,t.cloneNowHidden),t=t.cancel;this.isMultiDrag&&(he.forEach(function(t){R(t,"display","none"),e.options.removeCloneOnHide&&t.parentNode&&t.parentNode.removeChild(t)}),n(),ue=!0,t())},dragStartGlobal:function(t){t.sortable;!this.isMultiDrag&&le&&le.multiDrag._deselectMultiDrag(),de.forEach(function(t){t.sortableIndex=j(t)}),de=de.sort(function(t,e){return t.sortableIndex-e.sortableIndex}),ge=!0},dragStarted:function(t){var e,n=this,t=t.sortable;this.isMultiDrag&&(this.options.sort&&(t.captureAnimationState(),this.options.animation&&(de.forEach(function(t){t!==se&&R(t,"position","absolute")}),e=X(se,!1,!0,!0),de.forEach(function(t){t!==se&&T(t,e)}),pe=fe=!0)),t.animateAll(function(){pe=fe=!1,n.options.animation&&de.forEach(function(t){x(t)}),n.options.sort&&ve()}))},dragOver:function(t){var e=t.target,n=t.completed,t=t.cancel;fe&&~de.indexOf(e)&&(n(!1),t())},revert:function(t){var n,o,e=t.fromSortable,i=t.rootEl,r=t.sortable,a=t.dragRect;1<de.length&&(de.forEach(function(t){r.addAnimationState({target:t,rect:fe?X(t):a}),x(t),t.fromRect=a,e.removeAnimationState(t)}),fe=!1,n=!this.options.removeCloneOnHide,o=i,de.forEach(function(t,e){e=o.children[t.sortableIndex+(n?Number(e):0)];e?o.insertBefore(t,e):o.appendChild(t)}))},dragOverCompleted:function(t){var e,n=t.sortable,o=t.isOwner,i=t.insertion,r=t.activeSortable,a=t.parentEl,l=t.putSortable,t=this.options;i&&(o&&r._hideClone(),pe=!1,t.animation&&1<de.length&&(fe||!o&&!r.options.sort&&!l)&&(e=X(se,!1,!0,!0),de.forEach(function(t){t!==se&&(T(t,e),a.appendChild(t))}),fe=!0),o||(fe||ve(),1<de.length?(o=ue,r._showClone(n),r.options.animation&&!ue&&o&&he.forEach(function(t){r.addAnimationState({target:t,rect:ce}),t.fromRect=ce,t.thisAnimationDuration=null})):r._showClone(n)))},dragOverAnimationCapture:function(t){var e=t.dragRect,n=t.isOwner,t=t.activeSortable;de.forEach(function(t){t.thisAnimationDuration=null}),t.options.animation&&!n&&t.multiDrag.isMultiDrag&&(ce=a({},e),e=b(se,!0),ce.top-=e.f,ce.left-=e.e)},dragOverAnimationComplete:function(){fe&&(fe=!1,ve())},drop:function(t){var o,i,r,a,n,e,l,s=t.originalEvent,c=t.rootEl,u=t.parentEl,d=t.sortable,h=t.dispatchSortableEvent,p=t.oldIndex,t=t.putSortable,f=t||this.sortable;s&&(o=this.options,i=u.children,ge||(o.multiDragKey&&!this.multiDragKeyDown&&this._deselectMultiDrag(),k(se,o.selectedClass,!~de.indexOf(se)),~de.indexOf(se)?(de.splice(de.indexOf(se),1),ae=null,G({sortable:d,rootEl:c,name:"deselect",targetEl:se,originalEvent:s})):(de.push(se),G({sortable:d,rootEl:c,name:"select",targetEl:se,originalEvent:s}),s.shiftKey&&ae&&d.el.contains(ae)?(r=j(ae),a=j(se),~r&&~a&&r!==a&&function(){for(var e,t=r<a?(e=r,a):(e=a,r+1),n=o.filter;e<t;e++)~de.indexOf(i[e])||P(i[e],o.draggable,u,!1)&&(n&&("function"==typeof n?n.call(d,s,i[e],d):n.split(",").some(function(t){return P(i[e],t.trim(),u,!1)}))||(k(i[e],o.selectedClass,!0),de.push(i[e]),G({sortable:d,rootEl:c,name:"select",targetEl:i[e],originalEvent:s})))}()):ae=se,le=f)),ge&&this.isMultiDrag&&(fe=!1,(u[K].options.sort||u!==c)&&1<de.length&&(n=X(se),e=j(se,":not(."+this.options.selectedClass+")"),!pe&&o.animation&&(se.thisAnimationDuration=null),f.captureAnimationState(),pe||(o.animation&&(se.fromRect=n,de.forEach(function(t){var e;t.thisAnimationDuration=null,t!==se&&(e=fe?X(t):n,t.fromRect=e,f.addAnimationState({target:t,rect:e}))})),ve(),de.forEach(function(t){i[e]?u.insertBefore(t,i[e]):u.appendChild(t),e++}),p===j(se)&&(l=!1,de.forEach(function(t){t.sortableIndex!==j(t)&&(l=!0)}),l&&(h("update"),h("sort")))),de.forEach(function(t){x(t)}),f.animateAll()),le=f),(c===u||t&&"clone"!==t.lastPutMode)&&he.forEach(function(t){t.parentNode&&t.parentNode.removeChild(t)}))},nullingGlobal:function(){this.isMultiDrag=ge=!1,he.length=0},destroyGlobal:function(){this._deselectMultiDrag(),p(document,"pointerup",this._deselectMultiDrag),p(document,"mouseup",this._deselectMultiDrag),p(document,"touchend",this._deselectMultiDrag),p(document,"keydown",this._checkKeyDown),p(document,"keyup",this._checkKeyUp)},_deselectMultiDrag:function(t){if(!(void 0!==ge&&ge||le!==this.sortable||t&&P(t.target,this.options.draggable,this.sortable.el,!1)||t&&0!==t.button))for(;de.length;){var e=de[0];k(e,this.options.selectedClass,!1),de.shift(),G({sortable:this.sortable,rootEl:this.sortable.el,name:"deselect",targetEl:e,originalEvent:t})}},_checkKeyDown:function(t){t.key===this.options.multiDragKey&&(this.multiDragKeyDown=!0)},_checkKeyUp:function(t){t.key===this.options.multiDragKey&&(this.multiDragKeyDown=!1)}},a(t,{pluginName:"multiDrag",utils:{select:function(t){var e=t.parentNode[K];e&&e.options.multiDrag&&!~de.indexOf(t)&&(le&&le!==e&&(le.multiDrag._deselectMultiDrag(),le=e),k(t,e.options.selectedClass,!0),de.push(t))},deselect:function(t){var e=t.parentNode[K],n=de.indexOf(t);e&&e.options.multiDrag&&~n&&(k(t,e.options.selectedClass,!1),de.splice(n,1))}},eventProperties:function(){var n=this,o=[],i=[];return de.forEach(function(t){var e;o.push({multiDragElement:t,index:t.sortableIndex}),e=fe&&t!==se?-1:fe?j(t,":not(."+n.options.selectedClass+")"):j(t),i.push({multiDragElement:t,index:e})}),{items:r(de),clones:[].concat(he),oldIndicies:o,newIndicies:i}},optionListeners:{multiDragKey:function(t){return"ctrl"===(t=t.toLowerCase())?t="Control":1<t.length&&(t=t.charAt(0).toUpperCase()+t.substr(1)),t}}})}),jt});
      })(module, module.exports);
      return module.exports;
    })();

    // ------------------------------------------------------------------
    // 菜单图标：用 React 渲染一个手绘「标签」SVG，注册到官方 contextMenu.icon 槽，
    // 菜单项通过 icon:{ key } 引用它（与 DSH 自带菜单图标同一套渲染机制）。
    // ------------------------------------------------------------------
    const React = require('react');
    const TAG_ICON_KEY = 'workspace.tags';
    const TagIcon = () => React.createElement(
      'svg',
      {
        xmlns: 'http://www.w3.org/2000/svg', width: '1em', height: '1em', viewBox: '0 0 24 24',
        fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round',
      },
      React.createElement('path', { d: 'M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z' }),
      React.createElement('circle', { cx: 7.5, cy: 7.5, r: 1.1, fill: 'currentColor', stroke: 'none' }),
    );

    // ===== 常量 =====
    const NS = 'workspaceTags';
    const STORAGE_KEY = 'dsh.workspaceTags.v1';
    const STYLE_ID = 'dsh-ws-tags-style';
    const OVERLAY_ATTR = 'data-dsh-ws-tags-overlay';
    const DOTS_ATTR = 'data-dsh-ws-tags-dots';
    const LOG = '[workspace-tags]';
    const ROW_PREFIX = 'workspace:'; // 工作区行的 data-row-key 前缀

    // 7 种预设色（红/橙/黄/绿/蓝/紫/灰），另加自定义取色盘。
    const PRESET_COLORS = ['#FF3B30', '#FF9500', '#FFCC00', '#34C759', '#0A84FF', '#AF52DE', '#8E8E93'];
    // 内置颜色标签：开箱即有、固定颜色，用户无需手动新建；不会被自动清理。
    // 名称与预设色一一对应，颜色直接复用 PRESET_COLORS，避免两处维护。
    const BUILTIN_TAGS = [
      ['red', '红色'], ['orange', '橙色'], ['yellow', '黄色'], ['green', '绿色'],
      ['blue', '蓝色'], ['purple', '紫色'], ['gray', '灰色'],
    ].map(([key, name], index) => ({ id: `builtin-${key}`, name, color: PRESET_COLORS[index] }));
    const BUILTIN_IDS = new Set(BUILTIN_TAGS.map((tag) => tag.id));

    // 「清空当前文件夹全部标签」用的垃圾桶图标（描边 IconNode，交给 morphicons 形变）。
    // 开/合两态仅盖子与提手上下位移，子路径数与命令一致，形变平滑。
    const TRASH_CLOSED = [
      ['path', { d: 'M3 6h18' }],
      ['path', { d: 'M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' }],
      ['path', { d: 'M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6' }],
      ['path', { d: 'M10 11v6' }],
      ['path', { d: 'M14 11v6' }],
    ];
    const TRASH_OPEN = [
      ['path', { d: 'M3 3h18' }],
      ['path', { d: 'M8 3V1a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' }],
      ['path', { d: 'M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6' }],
      ['path', { d: 'M10 11v6' }],
      ['path', { d: 'M14 11v6' }],
    ];

    // DOM 选择器集中在此，DSH 版本升级只需改这里。
    const SEL = Object.freeze({
      workspaceRow: 'div[data-row-key^="workspace:"]',
      projectText: '[class*="projectText"]',
    });

    // 文案：优先 locale 服务，缺失时回退中文。
    const MESSAGES = Object.freeze({
      zh: {
        menu: '打标签',
        assignTitle: '将标签分配给',
        search: '搜索标签',
        availableLabel: '可选标签',
        chosenEmpty: '还没有选中标签',
        availableEmpty: '没有其他标签，输入名字即可新建',
        createPrefix: '创建新标签',
        cancelNew: '取消新建',
        customColor: '自定义颜色',
        clearAll: '清空该文件夹的标签',
        confirmText: '确定清空该文件夹的所有标签吗？',
        confirmOk: '清空',
        confirmCancel: '取消',
        modeBtnLabel: '首',
        modeTip: '切换标签显示：首字 / 全称',
        stackBtnLabel: '堆',
        stackTip: '切换标签排列：平铺 / 堆叠',
      },
      en: {
        menu: 'Tags',
        assignTitle: 'Assign tags to',
        search: 'Search tags',
        availableLabel: 'Available',
        chosenEmpty: 'No tags selected yet',
        availableEmpty: 'No other tags — type a name to create one',
        createPrefix: 'Create tag',
        cancelNew: 'Cancel',
        customColor: 'Custom color',
        clearAll: 'Clear all tags from this folder',
        confirmText: 'Clear all tags from this folder?',
        confirmOk: 'Clear',
        confirmCancel: 'Cancel',
        modeBtnLabel: 'Init',
        modeTip: 'Toggle label: first character / full name',
        stackBtnLabel: 'Stack',
        stackTip: 'Toggle layout: flat / stacked',
      },
    });

    // ===== 小工具 =====
    const queryAll = (sel, root) => Array.from((root || document).querySelectorAll(sel));
    const warn = (error) => console.warn(LOG, error);

    /** 创建元素：props 支持 class/文本/属性/事件（onXxx）。 */
    function el(tag, props, children) {
      const node = document.createElement(tag);
      if (props) {
        for (const [key, value] of Object.entries(props)) {
          if (value === undefined || value === null) continue;
          if (key === 'class') node.className = value;
          else if (key === 'text') node.textContent = value;
          else if (typeof value === 'function' && key.slice(0, 2) === 'on') node.addEventListener(key.slice(2).toLowerCase(), value);
          else node.setAttribute(key, value);
        }
      }
      (children || []).forEach((child) => child && node.appendChild(child));
      return node;
    }

    /** 创建 SVG 元素（SVG 必须用 createElementNS，否则不渲染）。 */
    function svgEl(tag, attrs) {
      const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
      if (attrs) for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
      return node;
    }

    /** 取工作区列表快照的 items（无服务/无快照时返回空数组）。 */
    function workspaceItems(workspaces) {
      const list = workspaces && workspaces.list;
      const snapshot = list && typeof list.getSnapshot === 'function' ? list.getSnapshot() : null;
      return (snapshot && snapshot.items) || [];
    }

    /** 按文件夹路径找到对应的工作区行元素（用于弹窗/圆点定位）。 */
    function workspaceRowFor(workspaces, path) {
      const item = workspaceItems(workspaces).find((entry) => entry.path === path);
      return item ? document.querySelector(`div[data-row-key="${ROW_PREFIX}${item.workspaceId}"]`) : null;
    }

    const genId = () => 't' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const workspaceIdOf = (row) => (row.getAttribute('data-row-key') || '').slice(ROW_PREFIX.length);

    // ===== 数据：一个 JSON 存在 localStorage =====
    // 结构：{ version:1, tags:{ [id]:{name,color} }, paths:{ [绝对路径]:[tagId,...] },
    //         modes:{ [路径]:'first'|'full' }, stacks:{ [路径]:boolean } }
    /** 只接受普通对象，其余（null/数组/原始值）一律按空对象处理，用于容错解析。 */
    const asObject = (value) => (value && typeof value === 'object' && !Array.isArray(value) ? value : {});

    function emptyStore() {
      return { version: 1, tags: withBuiltins({}), paths: {}, modes: {}, stacks: {} };
    }

    /** 把内置颜色标签并进现有标签表；同名已存在则跳过，避免重复。 */
    function withBuiltins(tags) {
      const merged = { ...tags };
      const names = new Set(Object.values(merged).map((tag) => ((tag && tag.name) || '').trim()));
      BUILTIN_TAGS.forEach((tag) => {
        if (!merged[tag.id] && !names.has(tag.name)) merged[tag.id] = { name: tag.name, color: tag.color };
      });
      return merged;
    }

    function loadStore() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return emptyStore();
        const data = JSON.parse(raw);
        return {
          version: 1,
          tags: withBuiltins(asObject(data && data.tags)),
          paths: asObject(data && data.paths),
          modes: asObject(data && data.modes),
          stacks: asObject(data && data.stacks),
        };
      } catch (error) {
        warn(error);
        return emptyStore();
      }
    }

    function saveStore() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
      } catch (error) {
        warn(error);
      }
    }

    let store = loadStore();

    /** 删掉没有任何文件夹引用的标签（满足「解除全部绑定才消失」）。 */
    function pruneOrphanTags() {
      const used = new Set();
      Object.values(store.paths).forEach((ids) => Array.isArray(ids) && ids.forEach((id) => used.add(id)));
      Object.keys(store.tags).forEach((id) => {
        if (!used.has(id) && !BUILTIN_IDS.has(id)) delete store.tags[id];
      });
    }

    /** 按当前工作区列表清理失效路径记录；返回是否有变化。需在列表就绪后调用。 */
    function pruneForWorkspaces(items) {
      const alive = new Set(items.map((item) => item.path));
      let changed = false;
      Object.keys(store.paths).forEach((path) => {
        if (!alive.has(path)) {
          delete store.paths[path];
          delete store.modes[path];
          delete store.stacks[path];
          changed = true;
        }
      });
      if (changed) {
        pruneOrphanTags();
        saveStore();
      }
      return changed;
    }

    // ===== 样式（全部使用 DSH 主题令牌）=====
    function injectStyles() {
      if (document.getElementById(STYLE_ID)) return;
      const style = el('style', { id: STYLE_ID });
      style.textContent = `
        [${OVERLAY_ATTR}]{position:fixed;inset:0;z-index:9999;}
        .dwst-pop{position:fixed;width:268px;max-height:calc(100vh - 40px);box-sizing:border-box;display:flex;flex-direction:column;
          background:var(--dsw-alias-bg-overlay,var(--dsw-alias-bg-layer-1));color:var(--dsw-alias-label-primary);
          border:1px solid var(--dsw-alias-border-l1);border-radius:var(--dsw-radius-md,12px);
          box-shadow:var(--dsw-shadow-2,0 12px 40px rgba(0,0,0,.28));padding:8px;font-family:inherit;font-size:13px;line-height:1.4;
          overflow:hidden;transform-origin:top left;animation:dwstIn .18s cubic-bezier(.2,.8,.3,1);
          transition:height .28s cubic-bezier(.2,.8,.3,1),top .28s cubic-bezier(.2,.8,.3,1),left .28s cubic-bezier(.2,.8,.3,1);}
        .dwst-body{display:flex;flex-direction:column;flex:1 1 auto;min-height:0;}
        @keyframes dwstIn{from{opacity:0;transform:translateY(4px) scale(.94);}to{opacity:1;transform:none;}}
        @media (prefers-reduced-motion:reduce){.dwst-pop{animation:none;transition:none;}}
        .dwst-caption{font-size:12px;color:var(--dsw-alias-label-secondary);padding:2px 6px 8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .dwst-head{display:flex;align-items:center;gap:8px;padding:2px 4px 8px 6px;}
        .dwst-head .dwst-caption{flex:1 1 auto;min-width:0;padding:0;}
        .dwst-mode-btn{flex:0 0 auto;min-width:30px;height:22px;padding:0 8px;border:1px solid var(--dsw-alias-border-l1);background:transparent;color:var(--dsw-alias-label-secondary);border-radius:var(--dsw-radius-sm,6px);font-size:12px;line-height:1;font-family:inherit;cursor:pointer;}
        .dwst-mode-btn:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(128,128,128,.12));}
        .dwst-mode-btn.is-on{background:var(--dsw-alias-state-business-primary);border-color:transparent;color:#fff;}
        .dwst-trash{flex:0 0 auto;display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;padding:0;border:none;background:transparent;color:var(--dsw-alias-label-secondary);border-radius:var(--dsw-radius-sm,6px);cursor:pointer;}
        .dwst-trash:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(128,128,128,.14));color:var(--dsw-alias-state-error-primary,var(--dsw-alias-state-error));}
        .dwst-chosen{display:flex;flex-wrap:wrap;gap:6px;padding:0 2px 8px;max-height:none;overflow:visible;}
        .dwst-chosen .dwst-none{padding:2px;color:var(--dsw-alias-label-secondary);font-size:12px;}
        .dwst-chip{display:inline-flex;align-items:center;gap:5px;height:24px;padding:0 8px;border:none;border-radius:999px;
          background:var(--dsw-alias-interactive-bg-hover,rgba(128,128,128,.14));color:var(--dsw-alias-label-primary);
          font-size:12px;line-height:1;font-family:inherit;cursor:grab;max-width:100%;}
        .dwst-chip:hover{filter:brightness(0.96);}
        .dwst-chip-ghost{opacity:.4;}
        .dwst-chip-chosen{cursor:grabbing;box-shadow:var(--dsw-shadow-2,0 4px 12px rgba(0,0,0,.18));}
        .dwst-chip-drag{opacity:.95;}
        @keyframes dwstChipIn{from{opacity:0;transform:scale(.85);}to{opacity:1;transform:none;}}
        @media (prefers-reduced-motion:reduce){.dwst-chip{animation:none!important;transition:none!important;}}
        .dwst-chip .dwst-circle{width:9px;height:9px;border:none;flex:0 0 auto;}
        .dwst-chipname{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;line-height:1;}
        .dwst-chipx{display:inline-flex;align-items:center;justify-content:center;color:var(--dsw-alias-label-secondary);font-size:13px;line-height:1;cursor:pointer;}
        .dwst-search{width:100%;height:30px;box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-sm,8px);
          background:var(--dsw-alias-bg-layer-2,transparent);color:var(--dsw-alias-label-primary);padding:0 9px;font-size:13px;outline:none;font-family:inherit;margin-bottom:6px;}
        .dwst-search:focus{border-color:var(--dsw-alias-state-business-primary);}
        .dwst-list{overflow:auto;flex:1;min-height:0;max-height:300px;display:flex;flex-direction:column;gap:1px;}
        .dwst-rowbtn{display:flex;align-items:center;gap:9px;width:100%;text-align:left;border:none;background:transparent;
          color:var(--dsw-alias-label-primary);cursor:pointer;padding:6px 8px;border-radius:var(--dsw-radius-sm,8px);font-size:13px;font-family:inherit;}
        .dwst-rowbtn:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(128,128,128,.12));}
        .dwst-rowbtn.is-active{background:var(--dsw-alias-interactive-bg-hover,rgba(128,128,128,.12));}
        .dwst-rowname{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        .dwst-circle{width:13px;height:13px;border-radius:50%;flex:none;box-sizing:border-box;border:2px solid var(--dsw-alias-border-l2);background:transparent;}
        .dwst-none{padding:10px 8px;color:var(--dsw-alias-label-secondary);font-size:12px;}
        .dwst-group{font-size:11px;color:var(--dsw-alias-label-secondary);padding:8px 8px 2px;letter-spacing:.02em;}
        .dwst-group.dwst-sep{border-top:1px solid var(--dsw-alias-border-l1);margin-top:4px;}
        .dwst-create{display:flex;align-items:center;gap:9px;width:100%;text-align:left;border:none;background:transparent;
          color:var(--dsw-alias-label-primary);cursor:pointer;padding:6px 8px;border-radius:var(--dsw-radius-sm,8px);font-size:13px;font-family:inherit;margin-top:2px;}
        .dwst-create:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(128,128,128,.12));}
        .dwst-create.is-active{background:var(--dsw-alias-state-business-primary);color:#fff;}
        .dwst-create .dwst-circle{border-color:currentColor;}
        .dwst-create span:last-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        .dwst-colors{display:flex;align-items:center;gap:8px;padding:8px;flex-wrap:wrap;}
        .dwst-mini{width:16px;height:16px;border-radius:50%;border:none;padding:0;cursor:pointer;flex:none;box-sizing:border-box;}
        .dwst-mini.is-on{box-shadow:0 0 0 2px var(--dsw-alias-bg-overlay,var(--dsw-alias-bg-layer-1)),0 0 0 4px var(--dsw-alias-label-primary);}
        .dwst-mini-custom{width:18px;height:18px;background:transparent;border-radius:50%;overflow:hidden;}
        .dwst-cx{width:18px;height:18px;border-radius:50%;border:1px solid var(--dsw-alias-border-l2);background:transparent;
          color:var(--dsw-alias-label-secondary);cursor:pointer;font-size:12px;line-height:1;display:flex;align-items:center;justify-content:center;padding:0;}
        .dwst-confirm{position:fixed;z-index:10001;min-width:180px;max-width:240px;display:none;
          background:var(--dsw-alias-bg-overlay,var(--dsw-alias-bg-layer-2,#2b2b2b));color:var(--dsw-alias-label-primary);
          border:1px solid var(--dsw-alias-border-l1);border-radius:var(--dsw-radius-md,10px);
          box-shadow:var(--dsw-shadow-2,0 8px 24px rgba(0,0,0,.28));padding:12px;font-size:13px;line-height:1.5;font-family:inherit;}
        .dwst-confirm.is-open{display:block;}
        .dwst-confirm-text{margin-bottom:10px;}
        .dwst-confirm-actions{display:flex;justify-content:flex-end;gap:8px;}
        .dwst-confirm-btn{border:1px solid var(--dsw-alias-border-l1);background:transparent;color:var(--dsw-alias-label-primary);
          border-radius:var(--dsw-radius-sm,8px);padding:4px 12px;font-size:12px;cursor:pointer;font-family:inherit;}
        .dwst-confirm-btn:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(128,128,128,.12));}
        .dwst-confirm-btn.dwst-danger{background:var(--dsw-alias-state-error-primary,#e5484d);border-color:transparent;color:#fff;}
        .dwst-dots{display:inline-flex;align-items:center;flex:none;height:20px;padding-left:2px;}
        /* 工作区行前的标签：放大成小圆牌；间距统一用 margin-left 控制，保证切换/悬浮动画一致。 */
        .dwst-dot{position:relative;width:18px;height:18px;border-radius:50%;flex:none;display:inline-flex;align-items:center;justify-content:center;
          font-size:11px;line-height:1;font-weight:600;color:#fff;box-sizing:border-box;transition:margin-left .18s cubic-bezier(.2,.8,.3,1);}
        .dwst-dots .dwst-dot:not(:first-child){margin-left:3px;} /* 默认平铺：留 3px 间距 */
        .dwst-dots.is-stacked .dwst-dot:not(:first-child){margin-left:-11px;} /* 堆叠：叠起来 */
        .dwst-dots.is-stacked:hover .dwst-dot:not(:first-child){margin-left:3px;} /* 悬浮展开，间距与平铺一致 */
        .dwst-dot.is-full{width:auto;min-width:18px;padding:0 6px;border-radius:999px;white-space:nowrap;} /* 全称模式：拉长成胶囊 */
        /* 与 DSH 官方 Tooltip 保持一致（对齐 @deepseek-ai 的 _bubble 气泡样式与令牌）。 */
        .dwst-dot-tip{position:fixed;z-index:10060;transform:translate(-50%,-100%);width:max-content;
          max-width:min(50vw,calc(100vw - 24px));box-sizing:border-box;padding:3px 7px;border-radius:var(--dsw-radius-sm);
          background:var(--dsw-alias-tooltip-bg);color:var(--dsw-static-neutral-bluish-00);
          font-size:13px;line-height:20px;white-space:pre-line;overflow-wrap:break-word;pointer-events:none;
          animation:dwstTipIn .15s var(--ds-ease-in-out);}
        @keyframes dwstTipIn{0%{opacity:0}}
        @media (prefers-reduced-motion:reduce){.dwst-dot-tip{animation:none}}
      `;
      document.head.appendChild(style);
    }

    // ===== 工作区行标签的小提示（hover 显示单个标签全称）=====
    let tipEl = null;
    function showTip(dot, text) {
      hideTip();
      tipEl = el('div', { class: 'dwst-dot-tip', text });
      document.body.appendChild(tipEl);
      const rect = dot.getBoundingClientRect();
      tipEl.style.left = Math.round(rect.left + rect.width / 2) + 'px';
      tipEl.style.top = Math.round(rect.top - 6) + 'px';
    }
    function hideTip() {
      if (tipEl) { tipEl.remove(); tipEl = null; }
    }
    // 给任意元素绑定与工作区标签一致的悬浮提示（DSH 设计规范气泡样式）。
    function bindTip(node, text) {
      node.addEventListener('mouseenter', () => showTip(node, typeof text === 'function' ? text() : text));
      node.addEventListener('mouseleave', hideTip);
    }

    // ===== 工作区行前的彩色圆点 =====
    /** 按显示模式取标签文字：full=全称，first=首字。 */
    const labelFor = (tag, mode) => (mode === 'full' ? (tag.name || '') : (Array.from(tag.name || '')[0] || ''));

    /** 改变圆牌内容/形状时对宽度做过渡，让「圆牌↔胶囊」平滑伸缩。 */
    function animateDotWidth(dot, mutate) {
      const oldWidth = dot.getBoundingClientRect().width;
      mutate();
      const newWidth = dot.getBoundingClientRect().width;
      if (!oldWidth || !newWidth || Math.abs(oldWidth - newWidth) < 0.5) return;
      dot.style.width = oldWidth + 'px';
      dot.style.transition = 'margin-left .18s cubic-bezier(.2,.8,.3,1), width .18s cubic-bezier(.2,.8,.3,1)';
      void dot.offsetWidth; // 先落定旧宽度
      dot.style.width = newWidth + 'px';
      setTimeout(() => { dot.style.width = ''; dot.style.transition = ''; }, 200);
    }

    function paintDots(workspaces) {
      const pathById = new Map(workspaceItems(workspaces).map((item) => [item.workspaceId, item.path]));
      queryAll(SEL.workspaceRow).forEach((row) => {
        const path = pathById.get(workspaceIdOf(row));
        const ids = (path && Array.isArray(store.paths[path]) ? store.paths[path] : []);
        let box = row.querySelector('[' + DOTS_ATTR + ']');
        if (!ids.length) {
          if (box) box.remove();
          return;
        }
        const idsSig = ids.join(',');
        const mode = store.modes[path] === 'first' ? 'first' : 'full'; // 默认「全」：展示完整标签名
        const stacked = store.stacks[path] === true; // 默认「不堆叠」
        if (!box) box = el('span', { class: 'dwst-dots', [DOTS_ATTR]: '' });
        // 只在「标签集合」变化时重建节点；仅切换首/全、堆叠时改类名，让间距过渡与悬浮展开动画一致。
        if (box.dataset.ids !== idsSig) {
          hideTip();
          box.textContent = '';
          box.dataset.ids = idsSig;
          ids.forEach((id, index) => {
            const tag = store.tags[id];
            if (!tag) return;
            const dot = el('span', { class: mode === 'full' ? 'dwst-dot is-full' : 'dwst-dot', text: labelFor(tag, mode) });
            dot.style.background = tag.color;
            dot.style.zIndex = String(ids.length - index); // 左边的叠在最上层
            bindTip(dot, tag.name);
            box.appendChild(dot);
          });
        } else if (box.dataset.mode !== mode) {
          // 首/全 切换：原地更新文案与形状，并对宽度做过渡（与堆叠动画一致）。
          Array.from(box.children).forEach((dot, index) => {
            const tag = store.tags[ids[index]];
            if (!tag) return;
            animateDotWidth(dot, () => {
              dot.textContent = labelFor(tag, mode);
              dot.classList.toggle('is-full', mode === 'full');
            });
          });
        }
        box.dataset.mode = mode;
        box.classList.toggle('is-full', mode === 'full');
        box.classList.toggle('is-stacked', stacked);
        const anchor = row.querySelector(SEL.projectText);
        if (anchor) {
          if (box.parentNode !== row || box.nextSibling !== anchor) row.insertBefore(box, anchor);
        } else if (box.parentNode !== row) {
          row.insertBefore(box, row.firstChild);
        }
      });
    }

    // ===== 打标签下拉框（参考 macOS 的标签选择器）=====
    let closeActiveDialog = null;

    function openDialog(ctx, target, repaint) {
      if (!target || !target.path) return;
      if (closeActiveDialog) closeActiveDialog();
      const t = translator(ctx);
      const path = target.path;

      // 已选集合：直接操作真实 store，点一下即生效（mac 的交互，无「保存」按钮）。
      const selected = new Set(store.paths[path] || []);
      let pickedColor = PRESET_COLORS[0]; // 新建标签时预选的颜色（选色≠新建，确认才建）
      let suppressChipClick = false; // 拖拽结束后短暂屏蔽 chip 的 click（避免误删）

      const search = el('input', { class: 'dwst-search', type: 'text', placeholder: t('search'), 'aria-label': t('search') });
      const chosenBar = el('div', { class: 'dwst-chosen' });
      const list = el('div', { class: 'dwst-list' });

      // 已选标签的拖拽排序交给 SortableJS：实时挤开、松手定序（顺序即工作区圆牌顺序）。
      let sortable = null;
      try {
        if (typeof Sortable === 'function' && typeof Sortable.create === 'function') {
          sortable = Sortable.create(chosenBar, {
            animation: 180,
            easing: 'cubic-bezier(.2,.8,.3,1)',
            draggable: '.dwst-chip',
            ghostClass: 'dwst-chip-ghost',
            chosenClass: 'dwst-chip-chosen',
            dragClass: 'dwst-chip-drag',
            onStart: () => { suppressChipClick = true; },
            onEnd: () => {
              setTimeout(() => { suppressChipClick = false; }, 0);
              applyDomOrder();
            },
          });
        }
      } catch (error) { /* 极端环境不支持拖拽时静默降级，其余功能不受影响 */ }

      /** 圆点：已选=实心色，未选=空心色环。 */
      function circle(color, on) {
        const c = el('span', { class: 'dwst-circle' });
        if (color) c.style.borderColor = color;
        if (on && color) c.style.background = color;
        return c;
      }

      /** 一次点击立即落盘 + 重画工作区圆点。 */
      function commit() {
        const ids = Array.from(selected).filter((id) => store.tags[id]);
        if (ids.length) store.paths[path] = ids;
        else delete store.paths[path];
        pruneOrphanTags();
        saveStore();
        repaint();
      }

      /** 落盘并重画弹窗内容；默认把焦点交回搜索框，方便继续输入。 */
      function refresh(focus = true) {
        commit();
        render();
        if (focus) search.focus();
      }

      /** 松手定序：按拖拽后的真实 DOM 顺序落盘（selected 顺序即工作区圆牌顺序）。 */
      function applyDomOrder() {
        const order = Array.from(chosenBar.querySelectorAll('.dwst-chip'))
          .map((node) => node.getAttribute('data-id'))
          .filter((id) => id && store.tags[id]);
        if (!order.length) return;
        selected.clear();
        order.forEach((id) => selected.add(id));
        refresh();
      }

      /** 用输入框文字 + 选定颜色新建标签，并立即挂到当前文件夹。 */
      function createFromInput(name, color) {
        const text = name.trim();
        if (!text) return;
        const id = genId();
        store.tags[id] = { name: text, color };
        selected.add(id);
        search.value = '';
        refresh();
      }

      function tagRow(id, tag) {
        // 可选标签也显示实心彩色圆点，颜色一眼可辨。
        const row = el('button', { type: 'button', class: 'dwst-rowbtn' }, [
          circle(tag.color, true),
          el('span', { class: 'dwst-rowname', text: tag.name }),
        ]);
        row.addEventListener('click', () => {
          if (selected.has(id)) selected.delete(id);
          else selected.add(id);
          refresh(false);
        });
        return row;
      }

      /** 已选标签的小胶囊（搜索框上方横向排列，点一下取消，拖动可排序）。 */
      function chip(id, tag) {
        const node = el('button', { type: 'button', class: 'dwst-chip' }, [
          circle(tag.color, true),
          el('span', { class: 'dwst-chipname', text: tag.name }),
          el('span', { class: 'dwst-chipx', text: '×' }),
        ]);
        node.setAttribute('data-id', id); // 供 FLIP 动画与 SortableJS 按 id 识别
        // 点击删除该标签；拖拽排序由容器上的 SortableJS 统一接管（见上方 Sortable.create）。
        node.addEventListener('click', () => {
          if (suppressChipClick) return; // 刚拖拽完不触发删除
          selected.delete(id); refresh();
        });
        return node;
      }

      let activeRows = []; // 当前可操作的行（可选标签 + 创建行），用于上下键/回车
      let activeIndex = 0;
      let enterCreate = false; // 刚选了颜色时，回车＝用该颜色创建新标签
      function paintActive() {
        activeRows.forEach((row, index) => row.node.classList.toggle('is-active', index === activeIndex));
        const current = activeRows[activeIndex];
        if (current && current.node.scrollIntoView) current.node.scrollIntoView({ block: 'nearest' });
      }
      function moveActive(delta) {
        if (!activeRows.length) return;
        activeIndex = (activeIndex + delta + activeRows.length) % activeRows.length;
        paintActive();
      }
      function render() {
        list.textContent = '';
        enterCreate = false; // 重新渲染（改搜索词等）后清除「选色待创建」状态
        const q = search.value.trim();
        const ql = q.toLowerCase();
        // 已选标签按「当前保存的顺序」展示（拖动即可调整，顺序会同步到工作区行圆牌），不受搜索影响。
        const chosenIds = Array.from(selected).filter((id) => store.tags[id]);
        const rest = Object.entries(store.tags)
          .filter(([id, tag]) => !selected.has(id) && (!ql || tag.name.toLowerCase().includes(ql)))
          .sort((a, b) => a[1].name.localeCompare(b[1].name, 'zh'));

        // 上：已选标签横向排列在搜索框上方（可拖拽排序），空则给灰字提示。
        // 先记下改动前每个胶囊的位置，稍后用 FLIP 做「新增 / 删除 / 拖拽排序」的平滑动画。
        const firstRects = new Map();
        chosenBar.querySelectorAll('.dwst-chip').forEach((node) => {
          const id = node.getAttribute('data-id');
          if (id) firstRects.set(id, node.getBoundingClientRect());
        });
        hideTip();
        chosenBar.textContent = '';
        if (chosenIds.length) chosenIds.forEach((id) => chosenBar.appendChild(chip(id, store.tags[id])));
        else chosenBar.appendChild(el('div', { class: 'dwst-none', text: t('chosenEmpty') }));
        // FLIP：老胶囊从旧位置滑到新位置；新出现的胶囊淡入放大。
        chosenBar.querySelectorAll('.dwst-chip').forEach((node) => {
          const id = node.getAttribute('data-id');
          const first = id ? firstRects.get(id) : null;
          if (!first) { node.style.animation = 'dwstChipIn .18s cubic-bezier(.2,.8,.3,1)'; return; }
          const last = node.getBoundingClientRect();
          const dx = first.left - last.left;
          const dy = first.top - last.top;
          if (!dx && !dy) return;
          node.style.transition = 'none';
          node.style.transform = `translate(${dx}px, ${dy}px)`;
          void node.offsetWidth; // 强制回流，让起始位置先生效
          node.style.transition = 'transform .2s cubic-bezier(.2,.8,.3,1)';
          node.style.transform = '';
        });

        // 下：可选标签列表，空则给灰字提示。
        list.appendChild(el('div', { class: 'dwst-group', text: t('availableLabel') }));
        activeRows = [];
        if (rest.length) rest.forEach(([id, tag]) => {
          const row = tagRow(id, tag);
          list.appendChild(row);
          activeRows.push({ node: row, run: () => row.click() });
        });
        else list.appendChild(el('div', { class: 'dwst-none', text: t('availableEmpty') }));

        // 输入的文字没有完全同名的标签时：展示「创建新标签」行 + 可选颜色。
        // 选颜色只是「预选」（高亮），真正新建要：点蓝色这一行，或按回车确认。
        const exact = q && Object.values(store.tags).some((tag) => tag.name.toLowerCase() === ql);
        if (q && !exact) {
          const createBtn = el('button', { type: 'button', class: 'dwst-create', title: t('createPrefix') }, [
            circle('', false),
            el('span', { text: `${t('createPrefix')} “${q}”` }),
          ]);
          createBtn.addEventListener('click', () => createFromInput(q, pickedColor));
          list.appendChild(createBtn);
          activeRows.push({ node: createBtn, run: () => createBtn.click() });

          const colors = el('div', { class: 'dwst-colors' });
          // ✕：取消这次新建（清空输入）。
          const cx = el('button', { type: 'button', class: 'dwst-cx', text: '×', title: t('cancelNew') });
          cx.addEventListener('click', (event) => { event.stopPropagation(); search.value = ''; render(); search.focus(); });
          colors.appendChild(cx);
          // 7 个预设色：点一下只是选中颜色，不直接新建。
          const presetEls = PRESET_COLORS.map((color) => {
            const sw = el('button', { type: 'button', class: 'dwst-mini', title: color });
            sw.style.background = color;
            sw.addEventListener('mousedown', (event) => event.preventDefault()); // 不抢焦点，保持搜索框可回车
            sw.addEventListener('click', (event) => { event.stopPropagation(); pickedColor = color; enterCreate = true; paintColor(); search.focus(); });
            colors.appendChild(sw);
            return sw;
          });
          // 自定义颜色：同样只选中。
          const custom = el('input', { type: 'color', class: 'dwst-mini dwst-mini-custom', title: t('customColor') });
          custom.addEventListener('input', () => { pickedColor = custom.value; enterCreate = true; paintColor(); });
          custom.addEventListener('change', () => search.focus()); // 选完自定义色回到搜索框，可回车创建
          colors.appendChild(custom);
          function paintColor() {
            presetEls.forEach((sw, index) => sw.classList.toggle('is-on', PRESET_COLORS[index].toLowerCase() === pickedColor.toLowerCase()));
            custom.classList.toggle('is-on', !PRESET_COLORS.some((color) => color.toLowerCase() === pickedColor.toLowerCase()));
            custom.value = pickedColor;
          }
          paintColor();
          list.appendChild(colors);
        }
        // 搜索时默认高亮第一项；未搜索时不预高亮。
        activeRows.forEach((row, index) => row.node.addEventListener('mouseenter', () => { activeIndex = index; paintActive(); }));
        activeIndex = q ? 0 : -1;
        paintActive();
        place(); // 内容变化后重新定位，避免底部被裁掉
      }
      search.addEventListener('input', render);
      // 回车 = 确认新建（有待建文字且没有同名标签时才生效）。
      // 键盘：↑↓ 切换高亮项，回车执行当前高亮项（第一项默认高亮）。
      search.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowDown') { event.preventDefault(); moveActive(1); return; }
        if (event.key === 'ArrowUp') { event.preventDefault(); moveActive(-1); return; }
        if (event.key !== 'Enter') return;
        if (!search.value.trim()) return;
        // 刚选过颜色：回车直接用该颜色创建新标签（与「默认选中第一项」不冲突）。
        if (enterCreate) { event.preventDefault(); createFromInput(search.value.trim(), pickedColor); return; }
        const row = activeRows[activeIndex];
        if (!row) return;
        event.preventDefault();
        row.run();
      });

      // 「清空当前文件夹全部标签」按钮：点击时用 morphicons 让垃圾桶盖子打开→合上。
      const trashSvg = svgEl('svg', {
        xmlns: 'http://www.w3.org/2000/svg', width: '16', height: '16', viewBox: '0 0 24 24',
        fill: 'none', stroke: 'currentColor', 'stroke-width': '1.8', 'stroke-linecap': 'round', 'stroke-linejoin': 'round',
      });
      const trashPath = svgEl('path', { d: '' });
      trashSvg.appendChild(trashPath);
      const trashBtn = el('button', { type: 'button', class: 'dwst-trash', 'aria-label': t('clearAll') }, [trashSvg]);
      let trashCtrl = null;
      try { trashCtrl = morph(trashPath, TRASH_CLOSED, { strokeWidth: 1.8, reducedMotion: 'user' }); }
      catch (error) { warn(error); }
      let clearing = false;
      // 真正执行清空：垃圾桶盖子打开 → 清空当前文件夹标签 → 合上。
      function doClear() {
        if (clearing) return;
        clearing = true;
        if (trashCtrl) trashCtrl.morphTo(TRASH_OPEN, 'snappy'); // 盖子打开
        selected.clear(); // 只清空当前文件夹：清空已选集合并立即落盘
        refresh(false);
        setTimeout(() => {
          if (trashCtrl) trashCtrl.morphTo(TRASH_CLOSED, 'snappy'); // 盖子合上
          clearing = false;
        }, 240);
      }

      // 二次确认气泡（Popconfirm）：点垃圾桶先弹出，确认后才清空。
      const confirmCancelBtn = el('button', { type: 'button', class: 'dwst-confirm-btn', text: t('confirmCancel') });
      const confirmOkBtn = el('button', { type: 'button', class: 'dwst-confirm-btn dwst-danger', text: t('confirmOk') });
      const confirmEl = el('div', { class: 'dwst-confirm', role: 'dialog' }, [
        el('div', { class: 'dwst-confirm-text', text: t('confirmText') }),
        el('div', { class: 'dwst-confirm-actions' }, [confirmCancelBtn, confirmOkBtn]),
      ]);
      const onDocDown = (event) => {
        if (!confirmEl.contains(event.target) && !trashBtn.contains(event.target)) hideConfirm();
      };
      function hideConfirm() {
        confirmEl.classList.remove('is-open');
        document.removeEventListener('pointerdown', onDocDown, true);
      }
      function showConfirm() {
        confirmEl.classList.add('is-open'); // 先显示，才能量尺寸定位
        const rect = trashBtn.getBoundingClientRect();
        const width = confirmEl.offsetWidth;
        const height = confirmEl.offsetHeight;
        const left = Math.min(Math.max(8, rect.right - width), window.innerWidth - width - 8);
        let top = rect.bottom + 6;
        if (top + height > window.innerHeight - 8) top = rect.top - height - 6; // 下方放不下就放上方
        confirmEl.style.left = left + 'px';
        confirmEl.style.top = Math.max(8, top) + 'px';
        document.addEventListener('pointerdown', onDocDown, true);
      }
      confirmCancelBtn.addEventListener('click', hideConfirm);
      confirmOkBtn.addEventListener('click', () => { hideConfirm(); doClear(); });
      trashBtn.addEventListener('click', () => {
        hideTip();
        if (confirmEl.classList.contains('is-open')) hideConfirm();
        else showConfirm();
      });
      bindTip(trashBtn, () => t('clearAll'));

      // 「首 / 全」单按钮切换：决定这个文件夹在工作区行上的标签显示「首字」还是「全称」，按文件夹记住。
      const modeBtn = el('button', { type: 'button', class: 'dwst-mode-btn' });
      const paintMode = () => {
        const first = store.modes[path] === 'first'; // 默认「全」，只有选了「首」才高亮
        modeBtn.textContent = t('modeBtnLabel'); // 文字固定「首」，不随状态变化
        modeBtn.classList.toggle('is-on', first);
        modeBtn.setAttribute('aria-pressed', first ? 'true' : 'false');
      };
      modeBtn.addEventListener('click', () => {
        store.modes[path] = store.modes[path] === 'first' ? 'full' : 'first';
        saveStore();
        repaint(); // 立即重画工作区行上的标签
        paintMode();
      });
      paintMode();
      bindTip(modeBtn, () => t('modeTip'));

      // 「是否堆叠」单按钮切换：多个标签是否叠在一起（默认不堆叠）。
      const stackBtn = el('button', { type: 'button', class: 'dwst-mode-btn' });
      const paintStack = () => {
        const stacked = store.stacks[path] === true;
        stackBtn.textContent = t('stackBtnLabel'); // 文字固定「堆」，不随状态变化
        stackBtn.classList.toggle('is-on', stacked);
        stackBtn.setAttribute('aria-pressed', stacked ? 'true' : 'false');
      };
      stackBtn.addEventListener('click', () => {
        store.stacks[path] = store.stacks[path] !== true;
        saveStore();
        repaint();
        paintStack();
      });
      paintStack();
      bindTip(stackBtn, () => t('stackTip'));

      const pop = el('div', { class: 'dwst-pop', role: 'dialog' }, [
        el('div', { class: 'dwst-head' }, [
          el('div', { class: 'dwst-caption', text: `${t('assignTitle')} “${target.title || path}”` }),
          modeBtn,
          stackBtn,
          trashBtn,
        ]),
        el('div', { class: 'dwst-body' }, [chosenBar, search, list]),
      ]);

      const overlay = el('div', { [OVERLAY_ATTR]: '' }, [pop]);
      overlay.addEventListener('pointerdown', (event) => {
        if (event.target === overlay) close();
      });

      // 定位 + 高度动画：所有内容都收在 .dwst-pop 里，内容增减时容器平滑过渡。
      function place() {
        if (!pop || !pop.isConnected) return; // 尚未挂载时跳过
        const margin = 8;
        const popWidth = pop.offsetWidth || 268;
        // 先按内容「自然高度」量一次，再过渡到该高度（容器变化带动画）。
        const startHeight = pop.offsetHeight;
        pop.style.height = 'auto';
        const endHeight = pop.offsetHeight;

        // 用最终高度算定位，保证贴底时整体上移、不被裁切。
        const row = workspaceRowFor(ctx.get('workspaces'), path);
        let left;
        let top;
        if (row) {
          const rect = row.getBoundingClientRect();
          left = rect.right + margin;
          top = rect.top;
        } else {
          left = (window.innerWidth - popWidth) / 2;
          top = Math.max(margin, window.innerHeight / 3);
        }
        left = Math.max(margin, Math.min(left, window.innerWidth - popWidth - margin));
        top = Math.min(top, window.innerHeight - endHeight - margin);
        top = Math.max(margin, top);
        pop.style.left = left + 'px';
        pop.style.top = top + 'px';

        // 高度从旧值过渡到新值，触发平移动画。
        pop.style.height = startHeight + 'px';
        void pop.offsetHeight;
        pop.style.height = endHeight + 'px';
      }

      const onKey = (event) => {
        if (event.key !== 'Escape') return;
        event.stopPropagation();
        if (confirmEl.classList.contains('is-open')) hideConfirm(); // 先关确认气泡
        else close();
      };
      document.addEventListener('keydown', onKey, true);

      function close() {
        document.removeEventListener('keydown', onKey, true);
        hideTip();
        try { if (sortable) sortable.destroy(); } catch (error) { /* 已销毁则忽略 */ }
        hideConfirm();
        confirmEl.remove();
        overlay.remove();
        if (closeActiveDialog === close) closeActiveDialog = null;
      }

      render();
      document.body.appendChild(overlay);
      document.body.appendChild(confirmEl);
      place();
      closeActiveDialog = close;
      search.focus();
    }

    // ===== locale =====
    function registerLocale(ctx) {
      const disposers = [];
      const attempt = (fn) => {
        try {
          const result = fn();
          if (typeof result === 'function') disposers.push(result);
        } catch (error) {
          warn(error);
        }
      };
      attempt(() => ctx.locale.register(NS, 'zh', MESSAGES.zh));
      attempt(() => ctx.locale.register(NS, 'en', MESSAGES.en));
      return () => disposers.forEach((dispose) => attempt(dispose));
    }

    /** 取翻译函数；locale 不可用时回退中文。 */
    function translator(ctx) {
      try {
        const bound = ctx.locale.bind(NS);
        return (key) => bound(key) ?? MESSAGES.zh[key] ?? key;
      } catch (error) {
        return (key) => MESSAGES.zh[key] ?? key;
      }
    }

    // ===== 挂载 =====
    function apply(ctx) {
      try {
        injectStyles();
        const workspaces = ctx.get('workspaces');

        let frame = 0;
        let ready = false;
        const paint = () => {
          try { paintDots(workspaces); } catch (error) { warn(error); }
        };
        const schedule = () => {
          if (frame) return;
          frame = requestAnimationFrame(() => { frame = 0; paint(); });
        };
        // 工作区列表变化：就绪后清理失效路径，再重画圆点。
        const onChange = () => {
          try {
            const items = workspaceItems(workspaces);
            if (items.length > 0) ready = true;
            if (ready) pruneForWorkspaces(items);
            schedule();
          } catch (error) {
            warn(error);
          }
        };

        // 把标签图标注册进官方 contextMenu.icon 槽（keyed），供菜单项的 icon.key 引用。
        // 与官方写法一致：直接在 apply 里注入，生命周期随插件卸载自动回收。
        try {
          ctx.slots.inject('contextMenu.icon', function* () {
            yield ctx.slots.register({ name: 'contextMenu.icon', key: TAG_ICON_KEY }, TagIcon);
          });
        } catch (error) {
          warn(error);
        }

        ctx.effect(() => {
          const disposeLocale = registerLocale(ctx);

          // 注册「打标签」菜单项：target=workspace，排在「重命名」(100) 与「删除」(300) 之间。
          let disposeMenu = () => {};
          try {
            disposeMenu = ctx.contextMenus.register({
              id: 'workspace.tags',
              target: 'workspace',
              order: 150,
              resolve: (value) => (value && value.path ? [{
                id: 'tags',
                label: translator(ctx)('menu'),
                icon: { key: TAG_ICON_KEY },
                run: () => openDialog(ctx, { path: value.path, title: value.displayTitle }, schedule),
              }] : []),
            });
          } catch (error) {
            warn(error);
          }

          // 跟随 React 重渲染与折叠/选中状态，重画圆点。
          const observer = new MutationObserver(schedule);
          observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['aria-expanded', 'aria-selected'],
          });
          const controller = new AbortController();
          window.addEventListener('resize', schedule, { signal: controller.signal });

          let unsubscribe = null;
          try {
            unsubscribe = workspaces && workspaces.list && workspaces.list.subscribe && workspaces.list.subscribe(onChange);
          } catch (error) {
            warn(error);
          }
          onChange();

          return () => {
            observer.disconnect();
            controller.abort();
            try { if (typeof unsubscribe === 'function') unsubscribe(); } catch (error) { warn(error); }
            disposeMenu();
            disposeLocale();
            if (frame) { cancelAnimationFrame(frame); frame = 0; }
            document.getElementById(STYLE_ID)?.remove();
            queryAll('[' + DOTS_ATTR + ']').forEach((node) => node.remove());
            hideTip();
            if (closeActiveDialog) closeActiveDialog();
          };
        }, 'workspace-tags: mount');
      } catch (error) {
        console.error(LOG, error);
      }
    }

    return { inject: ['locale', 'workspaces', 'contextMenus', 'slots'], apply };
  },
});
