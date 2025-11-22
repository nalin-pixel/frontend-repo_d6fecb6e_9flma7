// Masala E‑Commerce – Interactions, Animations, Cart, and Slider
(function(){
  const $ = (s, el=document) => el.querySelector(s);
  const $$ = (s, el=document) => Array.from(el.querySelectorAll(s));

  // Sticky header + shadow
  const header = $('.header');
  const onScroll = () => {
    if(!header) return;
    if(window.scrollY > 10) header.classList.add('sticky-show');
    else header.classList.remove('sticky-show');
  };
  window.addEventListener('scroll', onScroll);
  onScroll();

  // Mobile menu toggle
  const burger = $('.hamburger');
  const mobileMenu = $('.mobile-menu');
  if(burger && mobileMenu){
    burger.addEventListener('click', () => {
      const show = mobileMenu.style.display !== 'block';
      mobileMenu.style.display = show ? 'block' : 'none';
      burger.setAttribute('aria-expanded', show);
    });
  }

  // Reveal on scroll
  const observer = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        e.target.classList.add('visible','in');
      }
    })
  },{threshold:.15});
  $$('.fade-up, .reveal').forEach(el=>observer.observe(el));

  // Testimonials slider (basic)
  const track = $('.slider-track');
  const dots = $$('.dot');
  if(track && dots.length){
    let index = 0;
    const update = () => {
      track.style.transform = `translateX(${-index*100}%)`;
      dots.forEach((d,i)=>d.classList.toggle('active', i===index));
    }
    dots.forEach((d,i)=> d.addEventListener('click', ()=>{ index = i; update(); }));
    // auto-play
    setInterval(()=>{ index = (index+1)%dots.length; update(); }, 5000);
    update();
  }

  // Simple store using localStorage
  const STORAGE_KEY = 'masala_cart_v1';
  const getCart = () => JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]');
  const setCart = (c) => localStorage.setItem(STORAGE_KEY, JSON.stringify(c));

  // Add to cart buttons
  $$('.add-to-cart').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const prod = btn.closest('[data-product]');
      if(!prod) return;
      const id = prod.dataset.id || Math.random().toString(36).slice(2);
      const name = prod.dataset.name || 'Masala Blend';
      const price = parseFloat(prod.dataset.price||'0');
      const image = prod.dataset.image || '';
      const weight = prod.dataset.weight || '';
      const cart = getCart();
      const found = cart.find(p=>p.id===id && (!weight || p.weight===weight));
      if(found) found.qty += 1; else cart.push({id, name, price, image, qty:1, weight});
      setCart(cart);
      animateAdd(btn);
      updateCartBadge();
    });
  });

  function animateAdd(el){
    el.style.transform = 'translateY(-2px) scale(0.98)';
    el.style.boxShadow = '0 8px 24px rgba(183,58,58,.35)';
    setTimeout(()=>{
      el.style.transform = '';
      el.style.boxShadow = '';
    }, 300);
  }

  function updateCartBadge(){
    const count = getCart().reduce((a,b)=>a+b.qty,0);
    const bag = $('.cart-count');
    if(bag){ bag.textContent = count > 0 ? count : ''; }
  }
  updateCartBadge();

  // Cart page logic
  const cartList = $('#cart-list');
  const cartTotal = $('#cart-total');
  if(cartList && cartTotal){
    const render = ()=>{
      const cart = getCart();
      cartList.innerHTML = cart.map((p,i)=>`
        <div class="card" style="display:flex; gap:12px; align-items:center; padding:12px">
          <img src="${p.image}" alt="${p.name}" style="width:76px; height:76px; object-fit:cover; border-radius:12px">
          <div style="flex:1">
            <div class="card-title">${p.name} ${p.weight?`• ${p.weight}`:''}</div>
            <div class="muted small">₹${p.price.toFixed(2)}</div>
          </div>
          <div style="display:flex; gap:8px; align-items:center">
            <button class="btn btn-ghost qty-dec" data-i="${i}">-</button>
            <div><strong>${p.qty}</strong></div>
            <button class="btn btn-ghost qty-inc" data-i="${i}">+</button>
            <button class="btn" style="background:#f6e2d9" data-i="${i}" data-remove>Remove</button>
          </div>
        </div>
      `).join('');
      const total = cart.reduce((sum,p)=>sum + p.price*p.qty, 0);
      cartTotal.textContent = `₹${total.toFixed(2)}`;
    }
    render();

    cartList.addEventListener('click', (e)=>{
      const cart = getCart();
      const t = e.target;
      const idx = parseInt(t.getAttribute('data-i'));
      if(Number.isNaN(idx)) return;
      if(t.classList.contains('qty-inc')) cart[idx].qty += 1;
      if(t.classList.contains('qty-dec')) cart[idx].qty = Math.max(1, cart[idx].qty-1);
      if(t.hasAttribute('data-remove')) cart.splice(idx,1);
      setCart(cart); updateCartBadge();
      const renderSoon = () => { /* maintain scroll position */ render(); };
      renderSoon();
    })
  }

  // Product detail weight selector
  const chips = $$('.option-chip');
  chips.forEach(ch=>{
    ch.addEventListener('click', ()=>{
      chips.forEach(c=>c.classList.remove('active'));
      ch.classList.add('active');
      const holder = ch.closest('[data-product]');
      if(holder){ holder.dataset.weight = ch.textContent.trim(); }
    })
  })
})();
