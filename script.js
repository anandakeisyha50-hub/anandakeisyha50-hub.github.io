/* Interactivity for ndsyha skincare */
const formatIDR = n => n.toLocaleString('id-ID');

// Slider
const slider = document.querySelector('.slides');
const dotsWrap = document.getElementById('sliderDots');
const totalSlides = slider.children.length;
let curr = 0, autoplay;

function go(i){
  curr = (i + totalSlides) % totalSlides;
  slider.style.transform = `translateX(-${curr*100}%)`;
  [...dotsWrap.children].forEach((d,idx)=> d.classList.toggle('active', idx===curr));
}
function buildDots(){
  for(let i=0;i<totalSlides;i++){ const b = document.createElement('button'); b.addEventListener('click',()=>go(i)); dotsWrap.appendChild(b); }
  go(0);
}
function startAutoplay(){
  clearInterval(autoplay);
  autoplay = setInterval(()=> go(curr+1), 3800);
}

// Swipe support
let startX=0, dx=0;
slider.addEventListener('touchstart', e=>{ startX = e.touches[0].clientX; clearInterval(autoplay); }, {passive:true});
slider.addEventListener('touchmove', e=>{ dx = e.touches[0].clientX-startX; }, {passive:true});
slider.addEventListener('touchend', ()=>{ if(Math.abs(dx)>40) go(curr + (dx<0?1:-1)); startAutoplay(); dx=0; });

document.getElementById('prevSlide').onclick = ()=> go(curr-1);
document.getElementById('nextSlide').onclick = ()=> go(curr+1);

// Theme toggle (soft vs default)
document.getElementById('themeBtn').addEventListener('click', ()=>{
  const root = document.documentElement;
  const now = getComputedStyle(root).getPropertyValue('--bg-2').trim();
  if(now === '#F9F4EF'){
    root.style.setProperty('--bg-2', '#FFF8F0');
  }else{
    root.style.setProperty('--bg-2', '#F9F4EF');
  }
});

// Parallax on hero media
const parallax = document.querySelector('.parallax');
window.addEventListener('scroll', ()=>{
  const rect = parallax.getBoundingClientRect();
  const y = Math.max(0, 1 - rect.top/600);
  parallax.style.transform = `translateY(${y* -12}px)`;
});

// Build chips & products
const categories = ["Cleanser","Toner","Serum","Moisturizer","Sunscreen","Mask"];
const skinTypes = ["Normal","Kering","Berminyak","Kombinasi","Sensitif"];

const products = [
  {id:1, name:"Foam Cleanser Fresh", category:"Cleanser", price:68000, rating:4.6, skin:["Normal","Kering","Kombinasi"], tag:"Baru", img:"assets/prod1.svg"},
  {id:2, name:"Hydra Toner Balance", category:"Toner", price:75000, rating:4.7, skin:["Normal","Kombinasi","Sensitif"], tag:"Fav", img:"assets/prod2.svg"},
  {id:3, name:"Vit C Bright Serum", category:"Serum", price:145000, rating:4.8, skin:["Normal","Kering","Kombinasi"], tag:"-10%", img:"assets/prod3.svg"},
  {id:4, name:"BHA Pore Serum", category:"Serum", price:138000, rating:4.5, skin:["Berminyak","Kombinasi"], tag:"Promo", img:"assets/prod4.svg"},
  {id:5, name:"Ceramide Moist Cream", category:"Moisturizer", price:120000, rating:4.7, skin:["Kering","Sensitif"], tag:"Lembut", img:"assets/prod5.svg"},
  {id:6, name:"Gel Moist Light", category:"Moisturizer", price:99000, rating:4.4, skin:["Berminyak","Kombinasi"], tag:"Ringan", img:"assets/prod6.svg"},
  {id:7, name:"Daily Shield SPF50+", category:"Sunscreen", price:135000, rating:4.9, skin:["Semua"], tag:"Wajib!", img:"assets/prod2.svg"},
  {id:8, name:"Mineral Sun Cream", category:"Sunscreen", price:155000, rating:4.6, skin:["Sensitif","Normal"], tag:"Mineral", img:"assets/prod4.svg"},
  {id:9, name:"Cica Soothing Toner", category:"Toner", price:88000, rating:4.5, skin:["Sensitif","Kering"], tag:"Baru", img:"assets/prod1.svg"},
  {id:10,name:"HA Hydrating Serum", category:"Serum", price:132000, rating:4.7, skin:["Kering","Sensitif"], tag:"Lembap", img:"assets/prod5.svg"},
  {id:11,name:"Overnight Repair Mask", category:"Mask", price:110000, rating:4.3, skin:["Normal","Kering"], tag:"Malam", img:"assets/prod3.svg"},
  {id:12,name:"Clay Detox Mask", category:"Mask", price:105000, rating:4.2, skin:["Berminyak","Kombinasi"], tag:"Detox", img:"assets/prod6.svg"}
];

const grid = document.getElementById('productGrid');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');
const priceRange = document.getElementById('priceRange');
const priceLabel = document.getElementById('priceLabel');
const toast = document.getElementById('toast');

const catWrap = document.getElementById('catChips');
const skinWrap = document.getElementById('skinChips');
let activeCats = new Set();
let activeSkins = new Set();

function chip(text, group){
  const el = document.createElement('button');
  el.className = 'chip';
  el.textContent = text;
  el.setAttribute('aria-pressed','false');
  el.addEventListener('click', ()=>{
    const set = group==='cat'?activeCats:activeSkins;
    if(set.has(text)){ set.delete(text); el.classList.remove('active'); el.setAttribute('aria-pressed','false'); }
    else { set.add(text); el.classList.add('active'); el.setAttribute('aria-pressed','true'); }
    render();
  });
  return el;
}
categories.forEach(c=> catWrap.appendChild(chip(c,'cat')));
skinTypes.forEach(s=> skinWrap.appendChild(chip(s,'skin')));

priceRange.value = 300000;
priceLabel.textContent = (+priceRange.value).toLocaleString('id-ID');
priceRange.addEventListener('input', ()=>{ priceLabel.textContent = (+priceRange.value).toLocaleString('id-ID'); render(); });

searchInput.addEventListener('input', render);
sortSelect.addEventListener('change', render);

function makeCard(p){
  const el = document.createElement('article');
  el.className = 'card';
  el.innerHTML = `
    <div class="card__img">
      <img src="${p.img}" alt="${p.name}">
      <span class="badge">${p.tag}</span>
    </div>
    <div class="card__body">
      <div class="card__title">${p.name}</div>
      <div class="card__meta">
        <span>${p.category}</span><span>•</span><span>${p.skin.join(', ')}</span>
      </div>
      <div class="card__meta"><span class="stars">★</span>&nbsp;${p.rating.toFixed(1)}</div>
      <div class="card__actions">
        <span class="price">Rp${formatIDR(p.price)}</span>
        <div class="qty" aria-label="Jumlah">
          <button data-q="-1" aria-label="Kurangi">–</button>
          <span>1</span>
          <button data-q="1" aria-label="Tambah">+</button>
        </div>
        <button class="btn add">Tambah</button>
      </div>
    </div>`;

  // qty
  const qtyWrap = el.querySelector('.qty');
  let qty = 1;
  qtyWrap.addEventListener('click', (e)=>{
    const q = +e.target.getAttribute('data-q'); if(!q) return;
    qty = Math.max(1, qty + q); qtyWrap.querySelector('span').textContent = qty;
  });

  el.querySelector('.add').addEventListener('click', ()=> addToCart(p, qty));
  inView.observe(el);
  return el;
}

function filterAndSort(){
  const term = searchInput.value.trim().toLowerCase();
  const maxP = +priceRange.value;
  let arr = products.filter(p =>
    (!term || p.name.toLowerCase().includes(term)) &&
    p.price <= maxP &&
    (activeCats.size===0 || activeCats.has(p.category)) &&
    (activeSkins.size===0 || p.skin.some(s => activeSkins.has(s) || s==='Semua'))
  );
  switch (sortSelect.value){
    case 'price-asc': arr.sort((a,b)=>a.price-b.price); break;
    case 'price-desc': arr.sort((a,b)=>b.price-a.price); break;
    case 'rating': arr.sort((a,b)=>b.rating-a.rating); break;
    default: arr.sort((a,b)=> b.rating*5 + (200000-b.price) - (a.rating*5 + (200000-a.price)) );
  }
  return arr;
}

function render(){
  grid.innerHTML = '';
  const arr = filterAndSort();
  if(arr.length===0){
    const empty = document.createElement('div');
    empty.style.cssText = 'grid-column:1/-1; text-align:center; padding:40px; background:#fff; border-radius:18px; box-shadow:var(--shadow)';
    empty.textContent = 'Tidak ada produk yang cocok. Coba ubah filter.';
    grid.appendChild(empty); return;
  }
  arr.forEach(p => grid.appendChild(makeCard(p)));
}

// IntersectionObserver animation
const inView = new IntersectionObserver((entries)=>{
  entries.forEach(en=>{
    if(en.isIntersecting){
      en.target.animate([
        { transform:'translateY(18px)', opacity:.0 },
        { transform:'translateY(0)', opacity:1 }
      ], { duration:420, easing:'cubic-bezier(.2,.7,.2,1)', fill:'forwards' });
      inView.unobserve(en.target);
    }
  });
}, {threshold:.12});

// Cart
const CART_KEY = 'ndsyha_cart_v1';
const loadCart = () => JSON.parse(localStorage.getItem(CART_KEY) || '{}');
const saveCart = (c) => localStorage.setItem(CART_KEY, JSON.stringify(c));
let cart = loadCart();

const cartBtn = document.getElementById('cartBtn');
const drawer = document.getElementById('cartDrawer');
const closeCart = document.getElementById('closeCart');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const cartCount = document.getElementById('cartCount');

function updateCartUI(){
  cartItems.innerHTML = '';
  let total = 0, count=0;
  Object.values(cart).forEach(item=>{
    total += item.price * item.qty; count += item.qty;
    const row = document.createElement('div');
    row.className = 'mc-item';
    row.innerHTML = `
      <div class="mc-thumb"><img src="${item.img}" alt="${item.name}" width="32" height="32"></div>
      <div><div style="font-weight:600">${item.name}</div><div style="font-size:.9rem; color:var(--muted)">Rp${formatIDR(item.price)} × ${item.qty}</div></div>
      <div style="display:flex; gap:6px; align-items:center">
        <button class="icon-btn" data-act="dec" data-id="${item.id}">–</button>
        <button class="icon-btn" data-act="inc" data-id="${item.id}">+</button>
        <button class="icon-btn" data-act="del" data-id="${item.id}">🗑️</button>
      </div>`;
    cartItems.appendChild(row);
  });
  cartTotal.textContent = 'Rp' + formatIDR(total);
  cartCount.textContent = count;
}

cartItems.addEventListener('click', (e)=>{
  const btn = e.target.closest('button'); if(!btn) return;
  const id = btn.getAttribute('data-id'); const act = btn.getAttribute('data-act');
  const item = cart[id]; if(!item) return;
  if(act==='inc') item.qty++;
  if(act==='dec') item.qty = Math.max(1, item.qty-1);
  if(act==='del') delete cart[id];
  saveCart(cart); updateCartUI();
});

function addToCart(p, qty=1){
  if(!cart[p.id]) cart[p.id] = { ...p, qty };
  else cart[p.id].qty += qty;
  saveCart(cart); updateCartUI(); showToast('Ditambahkan ke keranjang');
}

cartBtn.addEventListener('click', ()=> drawer.classList.add('show'));
closeCart.addEventListener('click', ()=> drawer.classList.remove('show'));
drawer.addEventListener('click', (e)=>{ if(e.target===drawer) drawer.classList.remove('show'); });

// Checkout modal
const checkoutBtn = document.getElementById('checkoutBtn');
const checkoutModal = document.getElementById('checkoutModal');
const closeCheckout = document.getElementById('closeCheckout');
const checkoutForm = document.getElementById('checkoutForm');
const orderResult = document.getElementById('orderResult');

checkoutBtn.addEventListener('click', ()=>{ checkoutModal.classList.add('show'); orderResult.hidden = true; });
closeCheckout.addEventListener('click', ()=> checkoutModal.classList.remove('show'));
checkoutModal.addEventListener('click', (e)=>{ if(e.target===checkoutModal) checkoutModal.classList.remove('show'); });

checkoutForm.addEventListener('submit', (e)=>{
  e.preventDefault();
  const data = Object.fromEntries(new FormData(checkoutForm).entries());
  // generate fake order id
  const orderId = 'NDS-' + Math.random().toString(36).slice(2,8).toUpperCase();
  const amount = Object.values(cart).reduce((s, it)=> s + it.price*it.qty, 0);
  orderResult.innerHTML = `
    <h4>Pesanan dibuat 🎉</h4>
    <p>ID Pesanan: <strong>${orderId}</strong></p>
    <p>Nama: ${data.name}<br>Metode: ${data.payment}<br>Total: <strong>Rp${formatIDR(amount)}</strong></p>
    <p>Resi & update akan dikirim via WhatsApp/Email.</p>`;
  orderResult.hidden = false;
  checkoutForm.reset();
  cart = {}; saveCart(cart); updateCartUI();
  showToast('Pesanan dibuat');
  // simple confetti
  confettiBurst();
});

// Toast
let toastTimer;
function showToast(text){
  const t = document.getElementById('toast');
  t.textContent = text || 'Berhasil'; t.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(()=> t.classList.remove('show'), 1400);
}

// Buttons
document.getElementById('shopNow').addEventListener('click', ()=>{
  window.scrollTo({ top: document.querySelector('.filters').offsetTop - 12, behavior:'smooth' });
  showToast('Selamat berbelanja ✨');
});
document.getElementById('seeBestseller').addEventListener('click', ()=>{
  activeCats = new Set(['Serum','Sunscreen']);
  document.querySelectorAll('#catChips .chip').forEach(ch => ch.classList.toggle('active', activeCats.has(ch.textContent)));
  render();
  window.scrollTo({ top: document.querySelector('.grid').offsetTop - 12, behavior:'smooth' });
});

// Chat fab (simple helper)
document.getElementById('chatFab').addEventListener('click', ()=>{
  showToast('DM kami di Instagram @ndsyha.skincare 💌');
});

// Build
buildDots(); startAutoplay();
document.getElementById('year').textContent = new Date().getFullYear();
updateCartUI(); render();

// Tiny confetti effect
function confettiBurst(){
  for(let i=0;i<28;i++){
    const c = document.createElement('div');
    Object.assign(c.style, {
      position:'fixed', left: (Math.random()*100)+'vw', top:'-10px', width:'8px', height:'8px',
      background: i%2? '#7A4B33':'#9C6B4E', borderRadius:'2px', zIndex:90, pointerEvents:'none',
      transform:`rotate(${Math.random()*360}deg)`
    });
    document.body.appendChild(c);
    const dur = 800 + Math.random()*600;
    c.animate([ { transform:`translateY(0) rotate(0deg)` }, { transform:`translateY(${100+Math.random()*20}vh) rotate(720deg)` } ], { duration: dur, easing:'cubic-bezier(.2,.7,.2,1)' })
      .onfinish = ()=> c.remove();
  }
}
