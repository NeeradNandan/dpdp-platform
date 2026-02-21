"use strict";(()=>{var e="dpdp-",z="dpdp_consent_",L=[{id:"essential",label:"Essential Services",description:"Required for core functionality",mandatory:!0},{id:"analytics",label:"Analytics & Improvement",description:"Help us improve our services"},{id:"marketing",label:"Marketing Communications",description:"Personalized offers and updates"},{id:"sharing",label:"Third-Party Sharing",description:"Share data with trusted partners"}],D={en:{title:"We Value Your Privacy",description:"Under the Digital Personal Data Protection (DPDP) Act, we need your consent to process your data. Choose your preferences below.",acceptAll:"Accept All",rejectNonEssential:"Reject Non-Essential",savePreferences:"Save Preferences",close:"Close"}};function S(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,t=>{let n=Math.random()*16|0;return(t==="x"?n:n&3|8).toString(16)})}function M(){try{let t=sessionStorage.getItem("dpdp_session_id");return t||(t=S(),sessionStorage.setItem("dpdp_session_id",t)),t}catch{return S()}}function A(t){return`${z}${t}`}function P(t){try{let n=localStorage.getItem(A(t));if(!n)return null;let o=JSON.parse(n);return Array.isArray(o.purposes)?o.purposes:null}catch{return null}}function N(t,n){try{localStorage.setItem(A(t),JSON.stringify({purposes:n,savedAt:new Date().toISOString()}))}catch{}}function F(t){let n=t.primaryColor||"#2563eb",r=(t.position||"bottom")==="top",p=`
.${e}banner {
  position: fixed;
  ${r?"top: 0":"bottom: 0"};
  left: 0;
  right: 0;
  z-index: 2147483647;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  box-sizing: border-box;
}
.${e}backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  z-index: 2147483646;
  animation: ${e}fadeIn 0.2s ease;
}
.${e}panel {
  max-width: 480px;
  margin: ${r?"16px auto 0":"0 auto 16px"};
  padding: 20px 24px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.15);
  animation: ${e}slideIn 0.3s ease;
}
@media (prefers-color-scheme: dark) {
  .${e}panel { background: #1e293b; color: #f1f5f9; }
  .${e}title { color: #f8fafc !important; }
  .${e}desc { color: #cbd5e1 !important; }
  .${e}toggle-label { color: #e2e8f0 !important; }
  .${e}toggle-desc { color: #94a3b8 !important; }
  .${e}btn-secondary { background: #334155; color: #e2e8f0; border-color: #475569; }
  .${e}btn-secondary:hover { background: #475569; }
}
@keyframes ${e}fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes ${e}slideIn {
  from { transform: translateY(${r?"-20px":"20px"}); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
.${e}title {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}
.${e}desc {
  margin: 0 0 16px;
  color: #64748b;
  font-size: 13px;
}
.${e}toggles {
  margin: 16px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.${e}toggle {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 10px 12px;
  background: #f8fafc;
  border-radius: 8px;
}
@media (prefers-color-scheme: dark) {
  .${e}toggle { background: #0f172a; }
}
.${e}toggle-mandatory .${e}switch { opacity: 0.6; cursor: not-allowed; }
.${e}toggle-label { font-weight: 500; color: #334155; flex: 1; }
.${e}toggle-desc { font-size: 12px; color: #64748b; margin-top: 2px; }
.${e}switch {
  flex-shrink: 0;
  width: 40px;
  height: 22px;
  background: #cbd5e1;
  border-radius: 11px;
  position: relative;
  cursor: pointer;
  transition: background 0.2s;
}
.${e}switch-on { background: ${n}; }
.${e}switch::after {
  content: '';
  position: absolute;
  width: 18px;
  height: 18px;
  background: #fff;
  border-radius: 50%;
  top: 2px;
  left: 2px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  transition: transform 0.2s;
}
.${e}switch-on::after { transform: translateX(18px); }
.${e}buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 20px;
}
.${e}btn {
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: background 0.2s, color 0.2s;
}
.${e}btn-primary {
  background: ${n};
  color: #fff;
}
.${e}btn-primary:hover { filter: brightness(1.1); }
.${e}btn-secondary {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
}
.${e}close {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: #64748b;
  font-size: 20px;
  cursor: pointer;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}
.${e}close:hover { background: #f1f5f9; color: #334155; }
@media (prefers-color-scheme: dark) {
  .${e}close { color: #94a3b8; }
  .${e}close:hover { background: #334155; color: #e2e8f0; }
}
.${e}header { position: relative; padding-right: 32px; }
`,c=document.createElement("style");c.id=`${e}styles`,c.textContent=p,document.head.appendChild(c)}function m(t,n){return D[t]?.[n]??D.en[n]??n}function R(t){let n=t.purposes?.length?t.purposes:L,o=t.language||"en",r={},p=null,c=null;function T(){let d=P(t.orgId);if(d){let l={};return n.forEach(g=>{let s=d.find(b=>b.id===g.id);l[g.id]=s?s.granted:g.mandatory??!1}),l}let i={};return n.forEach(l=>i[l.id]=l.mandatory??!1),i}function j(d){return{consent_id:S(),org_id:t.orgId,purposes:n.map(i=>({id:i.id,granted:d[i.id]??!1})),timestamp:new Date().toISOString(),session_id:M(),user_agent:typeof navigator<"u"?navigator.userAgent:""}}function h(d){let i=j(d);N(t.orgId,i.purposes),t.onConsent?.(i),t.apiEndpoint&&fetch(t.apiEndpoint,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(i)}).catch(()=>{})}function f(){c&&c.remove(),p&&p.remove(),c=null,p=null}function k(){if(p&&document.body.contains(p))return;r=T(),F(t),c=document.createElement("div"),c.className=`${e}backdrop`,p=document.createElement("div"),p.className=`${e}banner`;let d=document.createElement("div");d.className=`${e}panel`;let i=document.createElement("div");i.className=`${e}header`;let l=document.createElement("h2");l.className=`${e}title`,l.textContent=m(o,"title");let g=document.createElement("p");g.className=`${e}desc`,g.textContent=m(o,"description");let s=document.createElement("button");s.className=`${e}close`,s.type="button",s.innerHTML="&times;",s.setAttribute("aria-label",m(o,"close")),s.onclick=()=>f(),i.appendChild(l),i.appendChild(g),i.appendChild(s);let b=document.createElement("div");b.className=`${e}toggles`,n.forEach(a=>{let v=document.createElement("div");v.className=`${e}toggle${a.mandatory?` ${e}toggle-mandatory`:""}`;let w=document.createElement("div"),E=document.createElement("div");if(E.className=`${e}toggle-label`,E.textContent=a.label,a.description){let I=document.createElement("div");I.className=`${e}toggle-desc`,I.textContent=a.description,w.appendChild(E),w.appendChild(I)}else w.appendChild(E);let u=document.createElement("div");u.className=`${e}switch${r[a.id]?` ${e}switch-on`:""}`,u.setAttribute("role","switch"),u.setAttribute("aria-checked",String(r[a.id])),a.mandatory||(u.onclick=()=>{r[a.id]=!r[a.id],u.classList.toggle(`${e}switch-on`,r[a.id]),u.setAttribute("aria-checked",String(r[a.id]))}),v.appendChild(w),v.appendChild(u),b.appendChild(v)});let x=document.createElement("div");x.className=`${e}buttons`;let y=document.createElement("button");y.className=`${e}btn ${e}btn-primary`,y.textContent=m(o,"acceptAll"),y.onclick=()=>{n.forEach(a=>r[a.id]=!0),h(r),f()};let C=document.createElement("button");C.className=`${e}btn ${e}btn-secondary`,C.textContent=m(o,"rejectNonEssential"),C.onclick=()=>{n.forEach(a=>r[a.id]=a.mandatory??!1),h(r),f()};let $=document.createElement("button");$.className=`${e}btn ${e}btn-secondary`,$.textContent=m(o,"savePreferences"),$.onclick=()=>{h(r),f()},x.appendChild(y),x.appendChild(C),x.appendChild($),d.appendChild(i),d.appendChild(b),d.appendChild(x),p.appendChild(d),c.onclick=a=>{a.target===c&&f()},document.body.appendChild(c),document.body.appendChild(p)}let _=()=>P(t.orgId)!==null;return _()||(document.readyState==="loading"?document.addEventListener("DOMContentLoaded",k):k()),{show:k,hide:f,withdraw(d){let i=P(t.orgId);if(!i)return;let l=i.map(s=>s.id===d?{...s,granted:!1}:s);N(t.orgId,l);let g={};l.forEach(s=>g[s.id]=s.granted),h(g)},getConsent(){return P(t.orgId)},hasConsented:_}}function Y(){let t=document.getElementsByTagName("script");for(let n=0;n<t.length;n++){let o=t[n],r=o.getAttribute("src")||"";if(r.includes("widget.js")||r.includes("consent-widget"))return{orgId:o.getAttribute("data-org-id")||"",apiEndpoint:o.getAttribute("data-api-endpoint")||void 0,position:o.getAttribute("data-position")||void 0,primaryColor:o.getAttribute("data-primary-color")||void 0,language:o.getAttribute("data-language")||void 0}}return{}}function W(){let t=Y(),n=typeof window<"u"?window.__DPDP_CONFIG__:void 0,o=n?.orgId??t.orgId??"";return o?{orgId:o,apiEndpoint:n?.apiEndpoint??t.apiEndpoint,position:n?.position??t.position,primaryColor:n?.primaryColor??t.primaryColor,language:n?.language??t.language,purposes:n?.purposes,onConsent:n?.onConsent}:(console.warn("[Yojak] orgId is required. Set data-org-id on the script tag or window.__DPDP_CONFIG__.orgId"),null)}function O(){let t=W();if(!t)return;let n=R(t);typeof window<"u"&&(window.Yojak=n)}typeof window<"u"&&(document.readyState==="loading"?document.addEventListener("DOMContentLoaded",O):O());})();
