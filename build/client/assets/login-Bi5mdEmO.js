import{m as je,B as Te,i as O,U as L,h as ue,s as Oe,E as Me,C as Pe,G as Ae,r as F,u as Ne,j as d}from"./index-4MufcReh.js";import{j as C,h as x,k as Fe,l as Ue,r as ce,m as $,n as He,o as D,S as Ie,p as _,q as Le,t as X,v as $e,w as ze,x as Ve,y as Q,z as q,A as de,B as Xe,C as Be,D as Je,E as We,F as Ge,L as U}from"./components-ki2z-XRs.js";import{u as Ke}from"./profile-BYW5p1bK.js";import"./index-DgoachrA.js";/*!
 * cookie
 * Copyright(c) 2012-2014 Roman Shtylman
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */var Ye=qe,Ze=et,Qe=Object.prototype.toString,k=/^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;function qe(e,t){if(typeof e!="string")throw new TypeError("argument str must be a string");for(var r={},n=t||{},a=n.decode||tt,s=0;s<e.length;){var i=e.indexOf("=",s);if(i===-1)break;var o=e.indexOf(";",s);if(o===-1)o=e.length;else if(o<i){s=e.lastIndexOf(";",i-1)+1;continue}var l=e.slice(s,i).trim();if(r[l]===void 0){var c=e.slice(i+1,o).trim();c.charCodeAt(0)===34&&(c=c.slice(1,-1)),r[l]=at(c,a)}s=o+1}return r}function et(e,t,r){var n=r||{},a=n.encode||rt;if(typeof a!="function")throw new TypeError("option encode is invalid");if(!k.test(e))throw new TypeError("argument name is invalid");var s=a(t);if(s&&!k.test(s))throw new TypeError("argument val is invalid");var i=e+"="+s;if(n.maxAge!=null){var o=n.maxAge-0;if(isNaN(o)||!isFinite(o))throw new TypeError("option maxAge is invalid");i+="; Max-Age="+Math.floor(o)}if(n.domain){if(!k.test(n.domain))throw new TypeError("option domain is invalid");i+="; Domain="+n.domain}if(n.path){if(!k.test(n.path))throw new TypeError("option path is invalid");i+="; Path="+n.path}if(n.expires){var l=n.expires;if(!nt(l)||isNaN(l.valueOf()))throw new TypeError("option expires is invalid");i+="; Expires="+l.toUTCString()}if(n.httpOnly&&(i+="; HttpOnly"),n.secure&&(i+="; Secure"),n.partitioned&&(i+="; Partitioned"),n.priority){var c=typeof n.priority=="string"?n.priority.toLowerCase():n.priority;switch(c){case"low":i+="; Priority=Low";break;case"medium":i+="; Priority=Medium";break;case"high":i+="; Priority=High";break;default:throw new TypeError("option priority is invalid")}}if(n.sameSite){var u=typeof n.sameSite=="string"?n.sameSite.toLowerCase():n.sameSite;switch(u){case!0:i+="; SameSite=Strict";break;case"lax":i+="; SameSite=Lax";break;case"strict":i+="; SameSite=Strict";break;case"none":i+="; SameSite=None";break;default:throw new TypeError("option sameSite is invalid")}}return i}function tt(e){return e.indexOf("%")!==-1?decodeURIComponent(e):e}function rt(e){return encodeURIComponent(e)}function nt(e){return Qe.call(e)==="[object Date]"||e instanceof Date}function at(e,t){try{return t(e)}catch{return e}}/**
 * @remix-run/server-runtime v2.16.0
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */const ee={};function fe(e,t){!e&&!ee[t]&&(ee[t]=!0,console.warn(t))}/**
 * @remix-run/server-runtime v2.16.0
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */const st=({sign:e,unsign:t})=>(r,n={})=>{let{secrets:a=[],...s}={path:"/",sameSite:"lax",...n};return dt(r,s.expires),{get name(){return r},get isSigned(){return a.length>0},get expires(){return typeof s.maxAge<"u"?new Date(Date.now()+s.maxAge*1e3):s.expires},async parse(i,o){if(!i)return null;let l=Ye(i,{...s,...o});return r in l?l[r]===""?"":await ot(t,l[r],a):null},async serialize(i,o){return Ze(r,i===""?"":await it(e,i,a),{...s,...o})}}},B=e=>e!=null&&typeof e.name=="string"&&typeof e.isSigned=="boolean"&&typeof e.parse=="function"&&typeof e.serialize=="function";async function it(e,t,r){let n=lt(t);return r.length>0&&(n=await e(n,r[0])),n}async function ot(e,t,r){if(r.length>0){for(let n of r){let a=await e(t,n);if(a!==!1)return te(a)}return null}return te(t)}function lt(e){return btoa(ct(encodeURIComponent(JSON.stringify(e))))}function te(e){try{return JSON.parse(decodeURIComponent(ut(atob(e))))}catch{return{}}}function ut(e){let t=e.toString(),r="",n=0,a,s;for(;n<t.length;)a=t.charAt(n++),/[\w*+\-./@]/.exec(a)?r+=a:(s=a.charCodeAt(0),s<256?r+="%"+re(s,2):r+="%u"+re(s,4).toUpperCase());return r}function re(e,t){let r=e.toString(16);for(;r.length<t;)r="0"+r;return r}function ct(e){let t=e.toString(),r="",n=0,a,s;for(;n<t.length;){if(a=t.charAt(n++),a==="%"){if(t.charAt(n)==="u"){if(s=t.slice(n+1,n+5),/^[\da-f]{4}$/i.exec(s)){r+=String.fromCharCode(parseInt(s,16)),n+=5;continue}}else if(s=t.slice(n,n+2),/^[\da-f]{2}$/i.exec(s)){r+=String.fromCharCode(parseInt(s,16)),n+=2;continue}}r+=a}return r}function dt(e,t){fe(!t,`The "${e}" cookie has an "expires" property set. This will cause the expires value to not be updated when the session is committed. Instead, you should set the expires value when serializing the cookie. You can use \`commitSession(session, { expires })\` if using a session storage object, or \`cookie.serialize("value", { expires })\` if you're using the cookie directly.`)}function M(e){const t=unescape(encodeURIComponent(e));return Uint8Array.from(t,(r,n)=>t.charCodeAt(n))}function ft(e){const t=String.fromCharCode.apply(null,e);return decodeURIComponent(escape(t))}function j(...e){const t=new Uint8Array(e.reduce((n,a)=>n+a.length,0));let r=0;for(const n of e)t.set(n,r),r+=n.length;return t}function ht(e,t){if(e.length!==t.length)return!1;for(let r=0;r<e.length;r++)if(e[r]!==t[r])return!1;return!0}function ne(e){return e instanceof Uint8Array?t=>e[t]:e}function H(e,t,r,n,a){const s=ne(e),i=ne(r);for(let o=0;o<a;++o)if(s(t+o)!==i(n+o))return!1;return!0}function mt(e){const t=new Array(256).fill(e.length);if(e.length>1)for(let r=0;r<e.length-1;r++)t[e[r]]=e.length-1-r;return t}const w=Symbol("Match");class J{constructor(t){this._lookbehind=new Uint8Array,typeof t=="string"?this._needle=t=M(t):this._needle=t,this._lastChar=t[t.length-1],this._occ=mt(t)}feed(t){let r=0,n;const a=[];for(;r!==t.length;)[r,...n]=this._feed(t,r),a.push(...n);return a}end(){const t=this._lookbehind;return this._lookbehind=new Uint8Array,t}_feed(t,r){const n=[];let a=-this._lookbehind.length;if(a<0){for(;a<0&&a<=t.length-this._needle.length;){const s=this._charAt(t,a+this._needle.length-1);if(s===this._lastChar&&this._memcmp(t,a,this._needle.length-1))return a>-this._lookbehind.length&&n.push(this._lookbehind.slice(0,this._lookbehind.length+a)),n.push(w),this._lookbehind=new Uint8Array,[a+this._needle.length,...n];a+=this._occ[s]}if(a<0)for(;a<0&&!this._memcmp(t,a,t.length-a);)a++;if(a>=0)n.push(this._lookbehind),this._lookbehind=new Uint8Array;else{const s=this._lookbehind.length+a;return s>0&&(n.push(this._lookbehind.slice(0,s)),this._lookbehind=this._lookbehind.slice(s)),this._lookbehind=Uint8Array.from(new Array(this._lookbehind.length+t.length),(i,o)=>this._charAt(t,o-this._lookbehind.length)),[t.length,...n]}}for(a+=r;a<=t.length-this._needle.length;){const s=t[a+this._needle.length-1];if(s===this._lastChar&&t[a]===this._needle[0]&&H(this._needle,0,t,a,this._needle.length-1))return a>r&&n.push(t.slice(r,a)),n.push(w),[a+this._needle.length,...n];a+=this._occ[s]}if(a<t.length){for(;a<t.length&&(t[a]!==this._needle[0]||!H(t,a,this._needle,0,t.length-a));)++a;a<t.length&&(this._lookbehind=t.slice(a))}return a>0&&n.push(t.slice(r,a<t.length?a:t.length)),[t.length,...n]}_charAt(t,r){return r<0?this._lookbehind[this._lookbehind.length+r]:t[r]}_memcmp(t,r,n){return H(this._charAt.bind(this,t),r,this._needle,0,n)}}class pt{constructor(t,r){this._readableStream=r,this._search=new J(t)}async*[Symbol.asyncIterator](){const t=this._readableStream.getReader();try{for(;;){const n=await t.read();if(n.done)break;yield*this._search.feed(n.value)}const r=this._search.end();r.length&&(yield r)}finally{t.releaseLock()}}}const yt=Function.prototype.apply.bind(j,void 0),he=M("--"),R=M(`\r
`);function gt(e){const t=e.split(";").map(n=>n.trim());if(t.shift()!=="form-data")throw new Error('malformed content-disposition header: missing "form-data" in `'+JSON.stringify(t)+"`");const r={};for(const n of t){const a=n.split("=",2);if(a.length!==2)throw new Error("malformed content-disposition header: key-value pair not found - "+n+" in `"+e+"`");const[s,i]=a;if(i[0]==='"'&&i[i.length-1]==='"')r[s]=i.slice(1,-1).replace(/\\"/g,'"');else if(i[0]!=='"'&&i[i.length-1]!=='"')r[s]=i;else if(i[0]==='"'&&i[i.length-1]!=='"'||i[0]!=='"'&&i[i.length-1]==='"')throw new Error("malformed content-disposition header: mismatched quotations in `"+e+"`")}if(!r.name)throw new Error("malformed content-disposition header: missing field name in `"+e+"`");return r}function wt(e){const t=[];let r=!1,n;for(;typeof(n=e.shift())<"u";){const a=n.indexOf(":");if(a===-1)throw new Error("malformed multipart-form header: missing colon");const s=n.slice(0,a).trim().toLowerCase(),i=n.slice(a+1).trim();switch(s){case"content-disposition":r=!0,t.push(...Object.entries(gt(i)));break;case"content-type":t.push(["contentType",i])}}if(!r)throw new Error("malformed multipart-form header: missing content-disposition");return Object.fromEntries(t)}async function xt(e,t){let r=!0,n=!1;const a=[[]],s=new J(R);for(;;){const i=await e.next();if(i.done)throw new Error("malformed multipart-form data: unexpected end of stream");if(r&&i.value!==w&&ht(i.value.slice(0,2),he))return[void 0,new Uint8Array];let o;if(i.value!==w)o=i.value;else if(!n)o=t;else throw new Error("malformed multipart-form data: unexpected boundary");if(!o.length)continue;r&&(r=!1);const l=s.feed(o);for(const[c,u]of l.entries()){const m=u===w;if(!(!m&&!u.length)){if(n&&m)return l.push(s.end()),[a.filter(f=>f.length).map(yt).map(ft),j(...l.slice(c+1).map(f=>f===w?R:f))];(n=m)?a.push([]):a[a.length-1].push(u)}}}}async function*St(e,t){const r=j(he,M(t)),n=new pt(r,e)[Symbol.asyncIterator]();for(;;){const s=await n.next();if(s.done)return;if(s.value===w)break}const a=new J(R);for(;;){let c=function(g){const y=[];for(const h of a.feed(g))l&&y.push(R),(l=h===w)||y.push(h);return j(...y)};const[s,i]=await xt(n,r);if(!s)return;async function o(){const g=await n.next();if(g.done)throw new Error("malformed multipart-form data: unexpected end of stream");return g}let l=!1,u=!1;async function m(){const g=await o();let y;if(g.value!==w)y=g.value;else if(!l)y=R;else return u=!0,{value:a.end()};return{value:c(y)}}const f=[{value:c(i)}];for(yield{...wt(s),data:{[Symbol.asyncIterator](){return this},async next(){for(;;){const g=f.shift();if(!g)break;if(g.value.length>0)return g}for(;;){if(u)return{done:u,value:void 0};const g=await m();if(g.value.length>0)return g}}}};!u;)f.push(await m())}}/**
 * @remix-run/server-runtime v2.16.0
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */function bt(...e){return async t=>{for(let r of e){let n=await r(t);if(typeof n<"u"&&n!==null)return n}}}async function vt(e,t){let r=e.headers.get("Content-Type")||"",[n,a]=r.split(/\s*;\s*boundary=/);if(!e.body||!a||n!=="multipart/form-data")throw new TypeError("Could not parse content as FormData.");let s=new FormData,i=St(e.body,a);for await(let o of i){if(o.done)break;typeof o.filename=="string"&&(o.filename=o.filename.split(/[/\\]/).pop());let l=await t(o);typeof l<"u"&&l!==null&&s.append(o.name,l)}return s}/**
 * @remix-run/server-runtime v2.16.0
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */function Rt(e){return Object.keys(e).reduce((t,r)=>(t[r]=e[r].module,t),{})}/**
 * @remix-run/server-runtime v2.16.0
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */function ae(e,t){if(e===!1||e===null||typeof e>"u")throw console.error("The following error is a bug in Remix; please open an issue! https://github.com/remix-run/remix/issues/new"),new Error(t)}/**
 * @remix-run/server-runtime v2.16.0
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */function z(e,t,r){let n=je(e,t,r);return n?n.map(a=>({params:a.params,pathname:a.pathname,route:a.route})):null}/**
 * @remix-run/server-runtime v2.16.0
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */async function _t({loadContext:e,action:t,params:r,request:n,routeId:a,singleFetch:s}){let i=await t({request:s?pe(T(n)):me(T(n)),context:e,params:r});if(i===void 0)throw new Error(`You defined an action for route "${a}" but didn't return anything from your \`action\` function. Please return a value or \`null\`.`);return s||x(i)?i:C(i)}async function Ct({loadContext:e,loader:t,params:r,request:n,routeId:a,singleFetch:s}){let i=await t({request:s?pe(T(n)):me(T(n)),context:e,params:r});if(i===void 0)throw new Error(`You defined a loader for route "${a}" but didn't return anything from your \`loader\` function. Please return a value or \`null\`.`);return Fe(i)?i.init&&Ue(i.init.status||200)?ce(new Headers(i.init.headers).get("Location"),i.init):i:s||x(i)?i:C(i)}function T(e){let t=new URL(e.url),r=t.searchParams.getAll("index");t.searchParams.delete("index");let n=[];for(let s of r)s&&n.push(s);for(let s of n)t.searchParams.append("index",s);let a={method:e.method,body:e.body,headers:e.headers,signal:e.signal};return a.body&&(a.duplex="half"),new Request(t.href,a)}function me(e){let t=new URL(e.url);t.searchParams.delete("_data");let r={method:e.method,body:e.body,headers:e.headers,signal:e.signal};return r.body&&(r.duplex="half"),new Request(t.href,r)}function pe(e){let t=new URL(e.url);t.searchParams.delete("_routes");let r={method:e.method,body:e.body,headers:e.headers,signal:e.signal};return r.body&&(r.duplex="half"),new Request(t.href,r)}/**
 * @remix-run/server-runtime v2.16.0
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */function ye(e){let t={};return Object.values(e).forEach(r=>{let n=r.parentId||"";t[n]||(t[n]=[]),t[n].push(r)}),t}function ge(e,t="",r=ye(e)){return(r[t]||[]).map(n=>({...n,children:ge(e,n.id,r)}))}function we(e,t,r="",n=ye(e)){return(n[r]||[]).map(a=>{let s={hasErrorBoundary:a.id==="root"||a.module.ErrorBoundary!=null,id:a.id,path:a.path,loader:a.module.loader?(i,o)=>Ct({request:i.request,params:i.params,loadContext:i.context,loader:a.module.loader,routeId:a.id,singleFetch:t.v3_singleFetch===!0}):void 0,action:a.module.action?(i,o)=>_t({request:i.request,params:i.params,loadContext:i.context,action:a.module.action,routeId:a.id,singleFetch:t.v3_singleFetch===!0}):void 0,handle:a.module.handle};return a.index?{index:!0,...s}:{caseSensitive:a.caseSensitive,children:we(e,t,a.id,n),...s}})}/**
 * @remix-run/server-runtime v2.16.0
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */const Et={"&":"\\u0026",">":"\\u003e","<":"\\u003c","\u2028":"\\u2028","\u2029":"\\u2029"},kt=/[&><\u2028\u2029]/g;function Dt(e){return e.replace(kt,t=>Et[t])}/**
 * @remix-run/server-runtime v2.16.0
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */function se(e){return Dt(JSON.stringify(e))}var jt={};/**
 * @remix-run/server-runtime v2.16.0
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */async function Tt(e,t){if(t??=jt.REMIX_DEV_ORIGIN,!t)throw Error("Dev server origin not set");let r=new URL(t);r.pathname="ping";let n=await fetch(r.href,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({buildHash:e.assets.version})}).catch(a=>{throw console.error(`Could not reach Remix dev server at ${r}`),a});if(!n.ok)throw console.error(`Could not reach Remix dev server at ${r} (${n.status})`),Error(await n.text())}function Ot(e){console.log(`[REMIX DEV] ${e.assets.version} ready`)}const xe="__remix_devServerHooks";function Mt(e){globalThis[xe]=e}function ie(){return globalThis[xe]}/**
 * @remix-run/server-runtime v2.16.0
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */function Pt(e,t){return`⚠️ REMIX FUTURE CHANGE: Externally-accessed resource routes will no longer be able to return raw JavaScript objects or \`null\` in React Router v7 when Single Fetch becomes the default. You can prepare for this change at your convenience by wrapping the data returned from your \`${e}\` function in the \`${t}\` route with \`json()\`.  For instructions on making this change, see https://remix.run/docs/en/v2.13.1/guides/single-fetch#resource-routes`}/**
 * @remix-run/server-runtime v2.16.0
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */const Se=new Set([100,101,204,205,304]);function oe(e,t){var r,n;let a=ge(e.routes),s=we(e.routes,e.future),i=Xe(t)?t:_.Production,o=Te(s,{basename:e.basename,future:{v7_relativeSplatPath:((r=e.future)===null||r===void 0?void 0:r.v3_relativeSplatPath)===!0,v7_throwAbortReason:((n=e.future)===null||n===void 0?void 0:n.v3_throwAbortReason)===!0}}),l=e.entry.module.handleError||((c,{request:u})=>{i!==_.Test&&!u.signal.aborted&&console.error(O(c)&&c.error?c.error:c)});return{routes:a,dataRoutes:s,serverMode:i,staticHandler:o,errorHandler:l}}const At=(e,t)=>{let r,n,a,s,i;return async function(l,c={}){if(r=typeof e=="function"?await e():e,t??=r.mode,typeof e=="function"){let p=oe(r,t);n=p.routes,a=p.serverMode,s=p.staticHandler,i=p.errorHandler}else if(!n||!a||!s||!i){let p=oe(r,t);n=p.routes,a=p.serverMode,s=p.staticHandler,i=p.errorHandler}let u=new URL(l.url),m={},f=p=>{if(t===_.Development){var S,b;(S=ie())===null||S===void 0||(b=S.processRequestError)===null||b===void 0||b.call(S,p)}i(p,{context:c,params:m,request:l})},g=`${r.basename??"/"}/__manifest`.replace(/\/+/g,"/");if(u.pathname===g)try{return await Nt(r,n,u)}catch(p){return f(p),new Response("Unknown Server Error",{status:500})}let y=z(n,u.pathname,r.basename);y&&y.length>0&&Object.assign(m,y[0].params);let h;if(u.searchParams.has("_data")){r.future.v3_singleFetch&&f(new Error("Warning: Single fetch-enabled apps should not be making ?_data requests, this is likely to break in the future"));let p=u.searchParams.get("_data");h=await Ft(a,r,s,p,l,c,f),r.entry.module.handleDataRequest&&(h=await r.entry.module.handleDataRequest(h,{context:c,params:m,request:l}),$(h)&&(h=Re(h,r.basename)))}else if(r.future.v3_singleFetch&&u.pathname.endsWith(".data")){let p=new URL(l.url);p.pathname=p.pathname.replace(/\.data$/,"").replace(/^\/_root$/,"/");let S=z(n,p.pathname,r.basename);if(h=await Ut(a,r,s,l,p,c,f),r.entry.module.handleDataRequest&&(h=await r.entry.module.handleDataRequest(h,{context:c,params:S?S[0].params:{},request:l}),$(h))){let b=He(h.status,h.headers,r.basename);l.method==="GET"&&(b={[de]:b});let Z=new Headers(h.headers);return Z.set("Content-Type","text/x-script"),new Response(D(b,l.signal,r.entry.module.streamTimeout,a),{status:Ie,headers:Z})}}else if(y&&y[y.length-1].route.module.default==null&&y[y.length-1].route.module.ErrorBoundary==null)h=await It(a,r,s,y.slice(-1)[0].route.id,l,c,f);else{var E,N;let p=t===_.Development?await((E=ie())===null||E===void 0||(N=E.getCriticalCss)===null||N===void 0?void 0:N.call(E,r,u.pathname)):void 0;h=await Ht(a,r,s,l,c,f,p)}return l.method==="HEAD"?new Response(null,{headers:h.headers,status:h.status,statusText:h.statusText}):h}};async function Nt(e,t,r){if(e.assets.version!==r.searchParams.get("version"))return new Response(null,{status:204,headers:{"X-Remix-Reload-Document":"true"}});let n={};if(r.searchParams.has("p")){for(let a of r.searchParams.getAll("p")){let s=z(t,a,e.basename);if(s)for(let i of s){let o=i.route.id;n[o]=e.assets.routes[o]}}return C(n,{headers:{"Cache-Control":"public, max-age=31536000, immutable"}})}return new Response("Invalid Request",{status:400})}async function Ft(e,t,r,n,a,s,i){try{let o=await r.queryRoute(a,{routeId:n,requestContext:s});if($(o))return Re(o,t.basename);if(L in o){let l=o[L],c=Le(l,a.signal,e),u=l.init||{},m=new Headers(u.headers);return m.set("Content-Type","text/remix-deferred"),m.set("X-Remix-Response","yes"),u.headers=m,new Response(c,u)}return o=V(o,"X-Remix-Response","yes"),o}catch(o){if(x(o))return V(o,"X-Remix-Catch","yes");if(O(o))return i(o),be(o,e);let l=o instanceof Error||o instanceof DOMException?o:new Error("Unexpected Server Error");return i(l),ue(X(l,e),{status:500,headers:{"X-Remix-Error":"yes"}})}}async function Ut(e,t,r,n,a,s,i){let{result:o,headers:l,status:c}=n.method!=="GET"?await $e(t,e,r,n,a,s,i):await ze(t,e,r,n,a,s,i),u=new Headers(l);return u.set("X-Remix-Response","yes"),Se.has(c)?new Response(null,{status:c,headers:u}):(u.set("Content-Type","text/x-script"),new Response(D(o,n.signal,t.entry.module.streamTimeout,e),{status:c||200,headers:u}))}async function Ht(e,t,r,n,a,s,i){let o;try{o=await r.query(n,{requestContext:a})}catch(f){return s(f),new Response(null,{status:500})}if(x(o))return o;let l=Ve(t,o);if(Se.has(o.statusCode))return new Response(null,{status:o.statusCode,headers:l});o.errors&&(Object.values(o.errors).forEach(f=>{(!O(f)||f.error)&&s(f)}),o.errors=Q(o.errors,e));let c={loaderData:o.loaderData,actionData:o.actionData,errors:q(o.errors,e)},u={manifest:t.assets,routeModules:Rt(t.routes),staticHandlerContext:o,criticalCss:i,serverHandoffString:se({basename:t.basename,criticalCss:i,future:t.future,isSpaMode:t.isSpaMode,...t.future.v3_singleFetch?null:{state:c}}),...t.future.v3_singleFetch?{serverHandoffStream:D(c,n.signal,t.entry.module.streamTimeout,e),renderMeta:{}}:null,future:t.future,isSpaMode:t.isSpaMode,serializeError:f=>X(f,e)},m=t.entry.module.default;try{return await m(n,o.statusCode,l,u,a)}catch(f){s(f);let g=f;if(x(f))try{let h=await Lt(f);g=new Me(f.status,f.statusText,h)}catch{}o=Pe(r.dataRoutes,o,g),o.errors&&(o.errors=Q(o.errors,e));let y={loaderData:o.loaderData,actionData:o.actionData,errors:q(o.errors,e)};u={...u,staticHandlerContext:o,serverHandoffString:se({basename:t.basename,future:t.future,isSpaMode:t.isSpaMode,...t.future.v3_singleFetch?null:{state:y}}),...t.future.v3_singleFetch?{serverHandoffStream:D(y,n.signal,t.entry.module.streamTimeout,e),renderMeta:{}}:null};try{return await m(n,o.statusCode,l,u,a)}catch(h){return s(h),ve(h,e)}}}async function It(e,t,r,n,a,s,i){try{let o=await r.queryRoute(a,{routeId:n,requestContext:s});return typeof o=="object"&&o!==null&&ae(!(L in o),`You cannot return a \`defer()\` response from a Resource Route.  Did you forget to export a default UI component from the "${n}" route?`),t.future.v3_singleFetch&&!x(o)&&(console.warn(Pt(a.method==="GET"?"loader":"action",n)),o=C(o)),ae(x(o),"Expected a Response to be returned from queryRoute"),o}catch(o){return x(o)?V(o,"X-Remix-Catch","yes"):O(o)?(o&&i(o),be(o,e)):(i(o),ve(o,e))}}function be(e,t){return ue(X(e.error||new Error("Unexpected Server Error"),t),{status:e.status,statusText:e.statusText,headers:{"X-Remix-Error":"yes"}})}function ve(e,t){let r="Unexpected Server Error";return t!==_.Production&&(r+=`

${String(e)}`),new Response(r,{status:500,headers:{"Content-Type":"text/plain"}})}function Lt(e){let t=e.headers.get("Content-Type");return t&&/\bapplication\/json\b/.test(t)?e.body==null?null:e.json():e.text()}function Re(e,t){let r=new Headers(e.headers),n=r.get("Location");return r.set("X-Remix-Redirect",t&&Oe(n,t)||n),r.set("X-Remix-Status",String(e.status)),r.delete("Location"),e.headers.get("Set-Cookie")!==null&&r.set("X-Remix-Revalidate","yes"),new Response(null,{status:204,headers:r})}function V(e,t,r){let n=new Headers(e.headers);return n.set(t,r),new Response(e.body,{status:e.status,statusText:e.statusText,headers:n,duplex:e.body?"half":void 0})}/**
 * @remix-run/server-runtime v2.16.0
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */function I(e){return`__flash_${e}__`}const W=(e={},t="")=>{let r=new Map(Object.entries(e));return{get id(){return t},get data(){return Object.fromEntries(r)},has(n){return r.has(n)||r.has(I(n))},get(n){if(r.has(n))return r.get(n);let a=I(n);if(r.has(a)){let s=r.get(a);return r.delete(a),s}},set(n,a){r.set(n,a)},flash(n,a){r.set(I(n),a)},unset(n){r.delete(n)}}},$t=e=>e!=null&&typeof e.id=="string"&&typeof e.data<"u"&&typeof e.has=="function"&&typeof e.get=="function"&&typeof e.set=="function"&&typeof e.flash=="function"&&typeof e.unset=="function",zt=e=>({cookie:t,createData:r,readData:n,updateData:a,deleteData:s})=>{let i=B(t)?t:e(t?.name||"__session",t);return _e(i),{async getSession(o,l){let c=o&&await i.parse(o,l),u=c&&await n(c);return W(u||{},c||"")},async commitSession(o,l){let{id:c,data:u}=o,m=l?.maxAge!=null?new Date(Date.now()+l.maxAge*1e3):l?.expires!=null?l.expires:i.expires;return c?await a(c,u,m):c=await r(u,m),i.serialize(c,l)},async destroySession(o,l){return await s(o.id),i.serialize("",{...l,maxAge:void 0,expires:new Date(0)})}}};function _e(e){fe(e.isSigned,`The "${e.name}" cookie is not signed, but session cookies should be signed to prevent tampering on the client before they are sent back to the server. See https://remix.run/utils/cookies#signing-cookies for more information.`)}/**
 * @remix-run/server-runtime v2.16.0
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */const Vt=e=>({cookie:t}={})=>{let r=B(t)?t:e(t?.name||"__session",t);return _e(r),{async getSession(n,a){return W(n&&await r.parse(n,a)||{})},async commitSession(n,a){let s=await r.serialize(n.data,a);if(s.length>4096)throw new Error("Cookie length will exceed browser maximum. Length: "+s.length);return s},async destroySession(n,a){return r.serialize("",{...a,maxAge:void 0,expires:new Date(0)})}}};/**
 * @remix-run/server-runtime v2.16.0
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */const Xt=e=>({cookie:t}={})=>{let r=new Map;return e({cookie:t,async createData(n,a){let s=Math.random().toString(36).substring(2,10);return r.set(s,{data:n,expires:a}),s},async readData(n){if(r.has(n)){let{data:a,expires:s}=r.get(n);if(!s||s>new Date)return a;s&&r.delete(n)}return null},async updateData(n,a,s){r.set(n,{data:a,expires:s})},async deleteData(n){r.delete(n)}})};/**
 * @remix-run/server-runtime v2.16.0
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */class Ce extends Error{constructor(t,r){super(`Field "${t}" exceeded upload size of ${r} bytes.`),this.field=t,this.maxBytes=r}}/**
 * @remix-run/server-runtime v2.16.0
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */function Bt({filter:e,maxPartSize:t=3e6}={}){return async({filename:r,contentType:n,name:a,data:s})=>{if(e&&!await e({filename:r,contentType:n,name:a}))return;let i=0,o=[];for await(let l of s){if(i+=l.byteLength,i>t)throw new Ce(a,t);o.push(l)}return typeof r=="string"?new File(o,r,{type:n}):await new Blob(o,{type:n}).text()}}/**
 * @remix-run/server-runtime v2.16.0
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */const Jt=Object.freeze(Object.defineProperty({__proto__:null,MaxPartSizeExceededError:Ce,UNSAFE_SingleFetchRedirectSymbol:de,broadcastDevReady:Tt,createCookieFactory:st,createCookieSessionStorageFactory:Vt,createMemorySessionStorageFactory:Xt,createRequestHandler:At,createSession:W,createSessionStorageFactory:zt,data:Be,defer:Je,isCookie:B,isSession:$t,json:C,logDevReady:Ot,redirect:ce,redirectDocument:We,replace:Ge,unstable_composeUploadHandlers:bt,unstable_createMemoryUploadHandler:Bt,unstable_parseMultipartFormData:vt,unstable_setDevServerHooks:Mt},Symbol.toStringTag,{value:"Module"}));var Wt={},G={},v={};const Ee=Ae(Jt);var P={};/**
 * @remix-run/cloudflare v2.16.0
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */Object.defineProperty(P,"__esModule",{value:!0});const K=new TextEncoder,Gt=async(e,t)=>{let r=await ke(t,["sign"]),n=K.encode(e),a=await crypto.subtle.sign("HMAC",r,n),s=btoa(String.fromCharCode(...new Uint8Array(a))).replace(/=+$/,"");return e+"."+s},Kt=async(e,t)=>{let r=e.lastIndexOf("."),n=e.slice(0,r),a=e.slice(r+1),s=await ke(t,["verify"]),i=K.encode(n),o=Yt(atob(a));return await crypto.subtle.verify("HMAC",s,o,i)?n:!1};async function ke(e,t){return await crypto.subtle.importKey("raw",K.encode(e),{name:"HMAC",hash:"SHA-256"},!1,t)}function Yt(e){let t=new Uint8Array(e.length);for(let r=0;r<e.length;r++)t[r]=e.charCodeAt(r);return t}P.sign=Gt;P.unsign=Kt;/**
 * @remix-run/cloudflare v2.16.0
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */Object.defineProperty(v,"__esModule",{value:!0});var A=Ee,le=P;const Y=A.createCookieFactory({sign:le.sign,unsign:le.unsign}),Zt=A.createCookieSessionStorageFactory(Y),De=A.createSessionStorageFactory(Y),Qt=A.createMemorySessionStorageFactory(De);v.createCookie=Y;v.createCookieSessionStorage=Zt;v.createMemorySessionStorage=Qt;v.createSessionStorage=De;/**
 * @remix-run/cloudflare v2.16.0
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */Object.defineProperty(G,"__esModule",{value:!0});var qt=v;function er({cookie:e,kv:t}){return qt.createSessionStorage({cookie:e,async createData(r,n){for(;;){let a=new Uint8Array(8);crypto.getRandomValues(a);let s=[...a].map(i=>i.toString(16).padStart(2,"0")).join("");if(!await t.get(s,"json"))return await t.put(s,JSON.stringify(r),{expiration:n?Math.round(n.getTime()/1e3):void 0}),s}},async readData(r){let n=await t.get(r);return n?JSON.parse(n):null},async updateData(r,n,a){await t.put(r,JSON.stringify(n),{expiration:a?Math.round(a.getTime()/1e3):void 0})},async deleteData(r){await t.delete(r)}})}G.createWorkersKVSessionStorage=er;/**
 * @remix-run/cloudflare v2.16.0
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */(function(e){Object.defineProperty(e,"__esModule",{value:!0});var t=G,r=v,n=Ee;e.createWorkersKVSessionStorage=t.createWorkersKVSessionStorage,e.createCookie=r.createCookie,e.createCookieSessionStorage=r.createCookieSessionStorage,e.createMemorySessionStorage=r.createMemorySessionStorage,e.createSessionStorage=r.createSessionStorage,Object.defineProperty(e,"MaxPartSizeExceededError",{enumerable:!0,get:function(){return n.MaxPartSizeExceededError}}),Object.defineProperty(e,"broadcastDevReady",{enumerable:!0,get:function(){return n.broadcastDevReady}}),Object.defineProperty(e,"createRequestHandler",{enumerable:!0,get:function(){return n.createRequestHandler}}),Object.defineProperty(e,"createSession",{enumerable:!0,get:function(){return n.createSession}}),Object.defineProperty(e,"data",{enumerable:!0,get:function(){return n.data}}),Object.defineProperty(e,"defer",{enumerable:!0,get:function(){return n.defer}}),Object.defineProperty(e,"isCookie",{enumerable:!0,get:function(){return n.isCookie}}),Object.defineProperty(e,"isSession",{enumerable:!0,get:function(){return n.isSession}}),Object.defineProperty(e,"json",{enumerable:!0,get:function(){return n.json}}),Object.defineProperty(e,"logDevReady",{enumerable:!0,get:function(){return n.logDevReady}}),Object.defineProperty(e,"redirect",{enumerable:!0,get:function(){return n.redirect}}),Object.defineProperty(e,"redirectDocument",{enumerable:!0,get:function(){return n.redirectDocument}}),Object.defineProperty(e,"replace",{enumerable:!0,get:function(){return n.replace}}),Object.defineProperty(e,"unstable_composeUploadHandlers",{enumerable:!0,get:function(){return n.unstable_composeUploadHandlers}}),Object.defineProperty(e,"unstable_createMemoryUploadHandler",{enumerable:!0,get:function(){return n.unstable_createMemoryUploadHandler}}),Object.defineProperty(e,"unstable_parseMultipartFormData",{enumerable:!0,get:function(){return n.unstable_parseMultipartFormData}})})(Wt);function sr(){const[e,t]=F.useState(null),[r,n]=F.useState(!1),a=Ne();F.useEffect(()=>{localStorage.getItem("userData")&&a("/")},[a]);const s=async i=>{i.preventDefault(),n(!0),t(null);const o=i.currentTarget,l=new FormData(o);try{const c=await fetch("https://n8n-blue.up.railway.app/webhook/ada/api/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:l.get("email"),password:l.get("password")})});if(!c.ok){t("Invalid credentials"),n(!1);return}const u=await c.json();if(!u.session_token){t("Error to proceed to login"),n(!1);return}const m={id:u.id,name:u.name,email:u.email,created_at:u.created_at,session_token:u.session_token,role:u.role||"user",plan_status:u.plan_status||"active",plan:u.plan||"free"};localStorage.setItem("userData",JSON.stringify(m)),Ke({username:m.name||"",bio:m.email||"",avatar:""}),a("/")}catch(c){t("An unexpected error occurred. Please try again."),console.error(c)}finally{n(!1)}};return d.jsxs("div",{className:"min-h-screen flex flex-col bg-[#0a0a0c] bg-gradient-to-br from-[#0a0a0c] via-[#0d1117] to-[#131c2e] relative",children:[d.jsx("div",{className:"absolute inset-0 bg-[url('data:image/svg+xml;base64PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48ZyBmaWxsPSIjMDAwIiBmaWxsLW9wYWNpdHk9IjAuMDUiPjxwYXRoIGQ9Ik0yMCAyMGgyMHYyMEgyMHoiLz48cGF0aCBkPSJNMCAwaDIwdjIwSDB6Ii8+PC9nPjwvc3ZnPg==')] opacity-50"}),d.jsx("header",{className:"p-4 relative",children:d.jsx("div",{className:"container mx-auto",children:d.jsxs(U,{to:"/",className:"flex items-center gap-2",children:[d.jsxs("svg",{width:"32",height:"32",viewBox:"0 0 32 32",fill:"none",xmlns:"http://www.w3.org/2000/svg",children:[d.jsx("circle",{cx:"16",cy:"16",r:"12",stroke:"white",strokeWidth:"1.5"}),d.jsx("circle",{cx:"16",cy:"16",r:"3",fill:"white"}),d.jsx("circle",{cx:"16",cy:"9",r:"1.5",fill:"white"}),d.jsx("circle",{cx:"16",cy:"23",r:"1.5",fill:"white"}),d.jsx("circle",{cx:"9",cy:"16",r:"1.5",fill:"white"}),d.jsx("circle",{cx:"23",cy:"16",r:"1.5",fill:"white"})]}),d.jsx("span",{className:"text-white text-xl font-semibold",children:"Ada"})]})})}),d.jsx("main",{className:"flex-1 flex items-center justify-center p-6 relative",children:d.jsxs("div",{className:"w-full max-w-md space-y-8",children:[d.jsxs("div",{className:"text-center",children:[d.jsx("h1",{className:"text-4xl font-bold text-white",children:"Login"}),d.jsx("p",{className:"mt-2 text-gray-400",children:"Sign in to your account to access the platform"})]}),d.jsxs("div",{className:"bg-[#0d1117] bg-opacity-50 backdrop-blur-sm rounded-lg p-8 shadow-2xl border border-gray-800",children:[e&&d.jsx("div",{className:"bg-red-500 text-white p-3 rounded-md mb-4",children:e}),d.jsxs("form",{onSubmit:s,className:"space-y-6",children:[d.jsxs("div",{className:"space-y-2",children:[d.jsx("label",{htmlFor:"email",className:"text-gray-200 block",children:"Email"}),d.jsx("input",{id:"email",name:"email",type:"email",autoComplete:"email",placeholder:"your@email.com",className:"w-full px-3 py-2 bg-[#0a0a0c] border border-gray-800 text-white placeholder-gray-500 focus:border-gray-700 focus:ring-gray-700 rounded-md",required:!0})]}),d.jsxs("div",{className:"space-y-2",children:[d.jsx("label",{htmlFor:"password",className:"text-gray-200 block",children:"Password"}),d.jsx("div",{className:"relative",children:d.jsx("input",{id:"password",name:"password",type:"password",autoComplete:"current-password",placeholder:"••••••••",className:"w-full px-3 py-2 bg-[#0a0a0c] border border-gray-800 text-white placeholder-gray-500 focus:border-gray-700 focus:ring-gray-700 pr-10 rounded-md",required:!0})}),d.jsx("div",{className:"flex justify-end",children:d.jsx(U,{to:"/forgot-password",className:"text-sm text-gray-400 hover:text-white",children:"Forgot your password?"})})]}),d.jsxs("button",{type:"submit",className:"w-full bg-[#1a2b4c] hover:bg-[#1f3461] text-white flex items-center justify-center gap-2 py-2 rounded-md",disabled:r,children:[d.jsx("div",{className:"i-ph:sign-in text-lg"}),r?"Signing in...":"Sign in"]})]}),d.jsx("div",{className:"mt-6 text-center",children:d.jsxs("p",{className:"text-gray-400",children:["Don't have an account?"," ",d.jsx(U,{to:"/register",className:"text-gray-200 hover:text-white",children:"Register"})]})})]})]})}),d.jsx("footer",{className:"py-4 relative",children:d.jsxs("div",{className:"container mx-auto text-center text-gray-500 text-sm",children:["© ",new Date().getFullYear()," Ada. All rights reserved."]})})]})}export{sr as default};
