const LS_PRODUCTS='starpos_products_v2_web';
const LS_SALES='starpos_sales_v2_web';
let cart=[];
const money=n=>'₺'+Number(n||0).toLocaleString('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2});
const products=()=>JSON.parse(localStorage.getItem(LS_PRODUCTS)||'[]');
const saveProducts=a=>localStorage.setItem(LS_PRODUCTS,JSON.stringify(a));
const sales=()=>JSON.parse(localStorage.getItem(LS_SALES)||'[]');
const saveSales=a=>localStorage.setItem(LS_SALES,JSON.stringify(a));

function seed(){
  if(!products().length){
    saveProducts([
      {id:crypto.randomUUID(),name:'Coca Cola 330 ml',barcode:'8690637891234',buy:15,sell:25,stock:48,min:10},
      {id:crypto.randomUUID(),name:'Saka Su 1.5 L',barcode:'8690749100012',buy:5,sell:10,stock:72,min:15},
      {id:crypto.randomUUID(),name:'Ülker Çikolata 80 gr',barcode:'8690504021336',buy:18,sell:28,stock:36,min:8},
      {id:crypto.randomUUID(),name:'Türk Kahvesi 100 gr',barcode:'8691111000123',buy:52,sell:75,stock:8,min:10}
    ]);
  }
}

function render(){
  const ps=products(), ss=sales();
  const totalSales=ss.reduce((t,s)=>t+Number(s.total||0),0);
  document.getElementById('productCount').textContent=ps.length;
  document.getElementById('lowStock').textContent=ps.filter(p=>Number(p.stock)<=Number(p.min)).length;
  document.getElementById('saleCount').textContent=ss.length;
  document.getElementById('dailyTotal').textContent=money(totalSales);

  document.getElementById('productList').innerHTML = tableHtml(ps);
  document.getElementById('stockTable').innerHTML = stockHtml(ps);
  document.getElementById('quickProducts').innerHTML = ps.map(p=>`<div class="quick-card" onclick="addByBarcode('${p.barcode}')"><b>${p.name}</b><small>${p.barcode}</small><b>${money(p.sell)}</b></div>`).join('');

  const sel=document.getElementById('labelProduct');
  const selected=sel.value;
  sel.innerHTML='<option value="">Ürün seçiniz</option>'+ps.map(p=>`<option value="${p.id}">${p.name} - ${money(p.sell)}</option>`).join('');
  sel.value=selected;

  document.getElementById('lastOps').innerHTML=ss.length?ss.slice(-8).reverse().map(s=>`<div class="cartitem"><div><b>${s.date}</b><br><small>${s.items?.length||0} ürün</small></div><b>${money(s.total)}</b></div>`).join(''):'Henüz işlem yok';
  const critical=ps.filter(p=>Number(p.stock)<=Number(p.min));
  document.getElementById('criticalList').innerHTML=critical.length?critical.map(p=>`<div class="cartitem"><div><b>${p.name}</b><br><small>Min: ${p.min}</small></div><b class="stock-low">${p.stock}</b></div>`).join(''):'Kritik ürün yok';
  document.getElementById('reportBox').innerHTML=`<div class="cartitem"><span>Toplam Ciro</span><b>${money(totalSales)}</b></div><div class="cartitem"><span>Kayıtlı Ürün</span><b>${ps.length}</b></div><div class="cartitem"><span>Toplam Stok Adedi</span><b>${ps.reduce((t,p)=>t+Number(p.stock||0),0)}</b></div>`;
  renderCart();
}
function tableHtml(ps){
  if(!ps.length) return '<div class="empty">Ürün yok</div>';
  return `<table class="table"><thead><tr><th>Ürün</th><th>Barkod</th><th>Alış</th><th>Satış</th><th>Stok</th><th>Kritik</th></tr></thead><tbody>${ps.map(p=>`<tr><td><b>${p.name}</b></td><td>${p.barcode}</td><td>${money(p.buy)}</td><td><b>${money(p.sell)}</b></td><td class="${Number(p.stock)<=Number(p.min)?'stock-low':''}">${p.stock}</td><td>${p.min}</td></tr>`).join('')}</tbody></table>`;
}
function stockHtml(ps){
  if(!ps.length) return '<div class="empty">Stok kaydı yok</div>';
  return `<table class="table"><thead><tr><th>Ürün</th><th>Barkod</th><th>Mevcut Stok</th><th>Kritik Stok</th><th>Durum</th></tr></thead><tbody>${ps.map(p=>`<tr><td>${p.name}</td><td>${p.barcode}</td><td>${p.stock}</td><td>${p.min}</td><td>${Number(p.stock)<=Number(p.min)?'<span class="stock-low">Düşük Stok</span>':'Yeterli'}</td></tr>`).join('')}</tbody></table>`;
}
function renderCart(){
  document.getElementById('cartList').innerHTML=cart.length?cart.map((i,idx)=>`<div class="cartitem"><div><b>${i.name}</b><br><small>${i.barcode} x ${i.qty}</small></div><div><b>${money(i.sell*i.qty)}</b><br><button class="mini" onclick="removeCart(${idx})">Sil</button></div></div>`).join(''):'Sepet boş';
  document.getElementById('cartTotal').textContent=money(cart.reduce((t,i)=>t+i.sell*i.qty,0));
}
function addByBarcode(code){
  const p=products().find(x=>String(x.barcode)==String(code).trim());
  if(!p){alert('Ürün bulunamadı. Ürünler ekranından ekleyebilirsiniz.');return}
  if(Number(p.stock)<=0){alert('Bu ürün stokta yok.');return}
  const c=cart.find(x=>x.id===p.id);
  c?c.qty++:cart.push({...p,qty:1});
  renderCart();
}
window.removeCart=i=>{cart.splice(i,1);renderCart()};
function openScreen(target){
  document.querySelectorAll('nav button').forEach(x=>x.classList.toggle('active',x.dataset.target===target));
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById('screen-'+target).classList.add('active');
  const active=document.querySelector(`nav button[data-target="${target}"] span`)?.textContent||'Dashboard';
  document.getElementById('pageTitle').textContent=active;
  if(target==='sales') setTimeout(()=>document.getElementById('barcodeInput')?.focus(),100);
}
document.querySelectorAll('nav button,.nav-jump').forEach(b=>b.onclick=()=>openScreen(b.dataset.target));
document.getElementById('barcodeInput').addEventListener('keydown',e=>{if(e.key==='Enter'){addByBarcode(e.target.value);e.target.value=''}});
document.getElementById('globalSearch').addEventListener('input',e=>{
  const q=e.target.value.toLowerCase().trim();
  const ps=products().filter(p=>!q||p.name.toLowerCase().includes(q)||String(p.barcode).includes(q));
  document.getElementById('productList').innerHTML=tableHtml(ps);
  document.getElementById('stockTable').innerHTML=stockHtml(ps);
});
document.getElementById('saveProduct').onclick=()=>{
  const p={id:crypto.randomUUID(),name:pName.value.trim(),barcode:pBarcode.value.trim(),buy:+pBuy.value,sell:+pSell.value,stock:+pStock.value,min:+pMin.value};
  if(!p.name||!p.barcode||!p.sell)return alert('Ürün adı, barkod ve satış fiyatı zorunlu');
  if(products().some(x=>String(x.barcode)===String(p.barcode)))return alert('Bu barkod zaten kayıtlı');
  saveProducts([p,...products()]);
  pName.value=pBarcode.value=pBuy.value=pSell.value=pStock.value=pMin.value='';
  render();
};
document.getElementById('payBtn').onclick=()=>{
  if(!cart.length)return alert('Sepet boş');
  const ps=products();
  for(const c of cart){const p=ps.find(x=>x.id===c.id); if(p && Number(p.stock)<c.qty) return alert(`${p.name} için stok yetersiz`)}
  cart.forEach(c=>{const p=ps.find(x=>x.id===c.id);if(p)p.stock=Number(p.stock)-c.qty});
  saveProducts(ps);
  saveSales([...sales(),{date:new Date().toLocaleString('tr-TR'),total:cart.reduce((t,i)=>t+i.sell*i.qty,0),items:cart}]);
  cart=[];
  alert('Satış tamamlandı, stoktan düşüldü.');
  render();
};
document.getElementById('clearCart').onclick=()=>{cart=[];renderCart()};
document.getElementById('labelProduct').onchange=e=>{
  const p=products().find(x=>x.id===e.target.value);
  document.getElementById('labelPreview').innerHTML=p?`<b>${p.name}</b><span>${p.barcode}</span><div class="barcode">||||||||||||||||</div><strong>${money(p.sell)}</strong>`:'<b>StarPOS</b><span>Ürün seçiniz</span><div class="barcode">||||||||||||||||</div><strong>₺0,00</strong>';
};
document.getElementById('printLabel').onclick=()=>window.print();
document.getElementById('clearData').onclick=()=>{if(confirm('Demo verileri silinsin mi?')){localStorage.removeItem(LS_PRODUCTS);localStorage.removeItem(LS_SALES);cart=[];seed();render()}};
document.getElementById('cameraBtn').onclick=async()=>{cameraBox.classList.remove('hidden');try{video.srcObject=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}})}catch(e){alert('Kamera açılamadı: '+e.message)}};
document.getElementById('stopCamera').onclick=()=>{cameraBox.classList.add('hidden');if(video.srcObject)video.srcObject.getTracks().forEach(t=>t.stop())};
let deferredPrompt;window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;installBtn.hidden=false});installBtn.onclick=()=>deferredPrompt?.prompt();
if('serviceWorker'in navigator)navigator.serviceWorker.register('service-worker.js');
seed();render();
