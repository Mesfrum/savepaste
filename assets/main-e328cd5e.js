!function(){const e=document.createElement("link").relList;if(!(e&&e.supports&&e.supports("modulepreload"))){for(const e of document.querySelectorAll('link[rel="modulepreload"]'))t(e);new MutationObserver((e=>{for(const n of e)if("childList"===n.type)for(const e of n.addedNodes)"LINK"===e.tagName&&"modulepreload"===e.rel&&t(e)})).observe(document,{childList:!0,subtree:!0})}function t(e){if(e.ep)return;e.ep=!0;const t=function(e){const t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),"use-credentials"===e.crossOrigin?t.credentials="include":"anonymous"===e.crossOrigin?t.credentials="omit":t.credentials="same-origin",t}(e);fetch(e.href,t)}}();const e=document.getElementById("preview"),t=document.getElementById("message"),n=document.getElementById("clearBtn"),o=document.getElementById("toggleSidebar"),s=document.getElementById("sidebar"),i=document.getElementById("overlay"),d=document.getElementById("sidebar-toggle-icon");let r=parseInt(sessionStorage.getItem("downloadCount")??"0",10);function c(){e.src="",n.classList.add("hidden"),n.removeEventListener("click",c)}window.innerWidth<630?(s.classList.add("open"),i.classList.add("open"),d.classList.add("open")):(s.classList.remove("open"),i.classList.remove("open"),d.classList.remove("open")),document.addEventListener("paste",(function(o){var s;const i=(null==(s=o.clipboardData)?void 0:s.items)?[...o.clipboardData.items].filter((e=>/^image\/(png|jpeg|gif)/.test(e.type))):[];if(0===i.length)return t.textContent="Paste an image",void t.classList.remove("hidden");const d=i[0].getAsFile();if(d){e.src=URL.createObjectURL(d),r++,sessionStorage.setItem("downloadCount",r.toString());const o=URL.createObjectURL(d),s=document.createElement("a");s.href=o,s.download=`paste-${r}.png`,document.body.appendChild(s),s.click(),window.URL.revokeObjectURL(o),document.body.removeChild(s),n.classList.remove("hidden"),n.addEventListener("click",c,{once:!0}),t.textContent="",t.classList.add("hidden")}}));o.addEventListener("click",(()=>{s.classList.toggle("open"),i.classList.toggle("open"),d.classList.toggle("open")})),i.addEventListener("click",(()=>{s.classList.add("closing"),i.classList.remove("open")}));
