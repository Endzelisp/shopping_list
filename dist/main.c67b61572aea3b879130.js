"use strict";(self.webpackChunkshopping_list=self.webpackChunkshopping_list||[]).push([[179],{176:()=>{const e=document,t=e.querySelector("rate-button"),a=e.querySelector('[data-element="exchange-rate"]'),i=e.querySelector('[data-element="total-bs"]'),r=e.querySelector('[data-element="total-usd"]'),n=e.querySelector('[data-button="unitary-item"]'),s=e.querySelector('[data-button="weighted-item"]'),c=e.querySelector('[data-container="main"]'),o=e.querySelector('[data-container="list"]'),l=e.querySelector('[data-dialog="exchange-rate"]'),u=e.querySelector('[data-dialog="unitary-item"]'),d=e.querySelector('[data-dialog="weighted-item"]'),h={exchangeRate:{dialog:l,input:l.querySelector('[data-input="exchange-rate"]')},unitaryItem:{dialog:u,inputQty:u.querySelector('[data-input="quantity"]'),inputProduct:u.querySelector('[data-input="name"]'),inputPrice:u.querySelector('[data-input="price"]')},weightedItem:{dialog:d,inputWeight:d.querySelector('[data-input="weight"]'),inputProduct:d.querySelector('[data-input="name"]'),inputPrice:d.querySelector('[data-input="price"]')}},g=e.querySelector('[data-template="new-item"]'),p={exchangeRate:0,savedItems:[],deleteItem(e){this.savedItems=this.savedItems.filter((t=>t.id!==e))}};function m(){localStorage.setItem("savedItems",JSON.stringify(p.savedItems))}function y(e){const t=Math.random().toString().slice(-3),a=Math.random().toString().slice(-3);return t+e.split(" ")[0]+a}const b=e=>""!==e&&"string"==typeof e,w=e=>!isNaN(e)&&e>0,v=e=>Math.round(100*e)/100,S=new CustomEvent("updateList",{detail:{},bubbles:!0,cancelable:!1,composed:!1}),I=new CustomEvent("renderTotalUSD",{detail:{},bubbles:!0,cancelable:!1,composed:!1}),x=new CustomEvent("renderTotalBs",{detail:{},bubbles:!0,cancelable:!1,composed:!1});class q extends HTMLElement{constructor(e,t){super(),this.quantity=e.quantity,this.weight=e.weight,this.product=e.product,this.rawPrice=e.rawPrice,this.currency=e.currency,this.type=e.type,this.id=e.id,this.totalPriceBs=this.#e(p.exchangeRate),this.totalPriceUSD=this.#t(p.exchangeRate);const a=document.importNode(g.content,!0),i=this.attachShadow({mode:"open"});i.appendChild(a),this.itemName=i.querySelector('[data-item="name"]'),this.itemPrice=i.querySelector('[data-item="price"]'),this.deleteItemBtn=i.querySelector('[data-item="delete"]'),this.obs=t,this.obs.subscribe(this)}#e(e){const t=Number.parseFloat(this.rawPrice)*(this.quantity||this.weight);return"usd"===this.currency?t*e:t}#t(e){const t=Number.parseFloat(this.rawPrice)*(this.quantity||this.weight);return"bs"===this.currency?t/e:t}notify({exRate:e}){this.totalPriceBs=this.#e(e),this.totalPriceUSD=this.#t(e),this.itemPrice.innerText=`${v(this.totalPriceBs)} Bs.`}connectedCallback(){this.setAttribute("id",this.id),this.itemName.innerText=`${this.quantity||this.weight.toString().concat(" Kg")} ${this.product}`,this.itemPrice.innerText=`${v(this.totalPriceBs)} Bs.`,this.deleteItemBtn.addEventListener("pointerdown",(()=>{const e=this.getAttribute("id");p.deleteItem(e),m(),this.remove(),c.dispatchEvent(I)}))}disconnectedCallback(){this.obs.unSubscribe(this)}}customElements.define("new-item",q);class f extends HTMLElement{constructor(){super(),this.subcribers=[]}subscribe(e){this.subcribers.push(e)}unSubscribe(e){this.subcribers=this.subcribers.filter((t=>t!==e))}notify(e){this.subcribers.forEach((t=>{t.notify(e)}))}}customElements.define("rate-button",class extends f{constructor(){super(),this.exchangeRate=0}set exchangeRate(e){this._exchangeRate=e,this.notify({exRate:this.exchangeRate})}get exchangeRate(){return this._exchangeRate}attributeChangedCallback(e,t,a){"data-rate"===e&&(this.exchangeRate=Number.parseFloat(a))}static get observedAttributes(){return["data-rate"]}}),"serviceWorker"in navigator&&window.addEventListener("load",(()=>{navigator.serviceWorker.register("./service-worker.js").then((e=>{console.log("SW registered: ",e)})).catch((e=>{console.log("SW registration failed: ",e)}))}));const P="Tasa de cambio no actualizada",R="Datos invalidos o incompletos";class E{constructor(e){this.quantity=e.quantity,this.weight=e.weight,this.product=e.product,this.rawPrice=e.price,this.currency=e.currency,this.type=e.type,this.id=e.id}}t.onpointerdown=()=>{h.exchangeRate.dialog.showModal()},h.exchangeRate.dialog.onclose=()=>{if("close"===h.exchangeRate.dialog.returnValue)return;const e=h.exchangeRate.input,i=Number.parseFloat(e.value);Number.isNaN(i)?alert(P):0!==i?(p.exchangeRate=i,t.dataset.rate=i,a.innerText=v(i),localStorage.setItem("exchangeRate",p.exchangeRate),h.exchangeRate.dialog.dispatchEvent(I)):alert("La tasa de cambio no puede ser cero")},n.onpointerdown=()=>{if(!("exchangeRate"in localStorage))return void alert(P);const e=h.unitaryItem.inputProduct,t=h.unitaryItem.inputQty,a=h.unitaryItem.inputPrice;e.value=e.defaultValue,t.value=t.defaultValue,a.value=a.defaultValue,h.unitaryItem.dialog.showModal()},h.unitaryItem.dialog.onclose=()=>{const e=h.unitaryItem.inputProduct,t=h.unitaryItem.inputQty,a=h.unitaryItem.inputPrice,i=h.unitaryItem.dialog.querySelector("fieldset input:checked");if("close"===h.unitaryItem.dialog.returnValue)return;const r=e.value.trim(),n=Number.parseInt(t.value),s=v(Number.parseFloat(a.value)),c=i.value;b(r)&&w(s)?(S.detail.product=r,S.detail.quantity=n,S.detail.weight=null,S.detail.price=s,S.detail.currency=c,S.detail.type="unitary",S.detail.id=y(r),h.unitaryItem.dialog.dispatchEvent(S)):alert(R)},s.onpointerdown=()=>{if(!("exchangeRate"in localStorage))return void alert(P);const e=h.weightedItem.inputProduct,t=h.weightedItem.inputWeight,a=h.weightedItem.inputPrice;e.value=e.defaultValue,t.value=t.defaultValue,a.value=a.defaultValue,h.weightedItem.dialog.showModal()},h.weightedItem.dialog.onclose=()=>{const e=h.weightedItem.inputProduct,t=h.weightedItem.inputWeight,a=h.weightedItem.inputPrice,i=h.weightedItem.dialog.querySelector("fieldset input:checked");if("close"===h.weightedItem.dialog.returnValue)return;let r=t.value;"."!==r[0]&&","!==r[0]||(r=`0${r}`),r=Number.parseFloat(r);const n=i.value,s=e.value.trim(),c=Number.parseFloat(a.value);b(s)&&w(c)&&w(r)?(S.detail.product=s,S.detail.weight=r,S.detail.quantity=null,S.detail.price=c,S.detail.currency=n,S.detail.type="weighted",S.detail.id=y(s),h.unitaryItem.dialog.dispatchEvent(S)):alert(R)},c.addEventListener("updateList",(e=>{const a=e.detail.quantity,i=e.detail.weight,r=e.detail.product,n=e.detail.currency,s=e.detail.type,l=e.detail.price,u=e.detail.id,d=new E({quantity:a,weight:i,product:r,price:l,currency:n,type:s,id:u}),h=new q(d,t);o.appendChild(h),p.savedItems.push(d),m(),c.dispatchEvent(I)})),c.addEventListener("renderTotalUSD",(()=>{const e=[...document.querySelectorAll("new-item")].reduce(((e,t)=>e+t.totalPriceUSD),0);r.innerText=v(e),x.detail.totalInUSD=e,c.dispatchEvent(x)})),c.addEventListener("renderTotalBs",(e=>{const t=e.detail.totalInUSD*p.exchangeRate;i.innerText=v(t)})),(()=>{if("exchangeRate"in localStorage){const e=Number.parseFloat(localStorage.getItem("exchangeRate"));p.exchangeRate=e,a.innerText=v(e),p.savedItems=function(){const e=JSON.parse(localStorage?.savedItems);return Array.isArray(e)?e:(delete localStorage.savedItems,[])}(),p.savedItems.forEach((e=>{const a=new q(e,t);o.appendChild(a)})),c.dispatchEvent(I)}else a.innerText=0,alert(P)})()}},e=>{e(e.s=176)}]);