document.addEventListener('DOMContentLoaded', () => {
  // --- Cart Logic ---
  let cart = [];
  const cartBtn = document.getElementById('cart-btn');
  const cartSidebar = document.getElementById('cart-sidebar');
  const closeCart = document.getElementById('close-cart');
  const overlay = document.getElementById('overlay');
  const cartItemsContainer = document.getElementById('cart-items-container');
  const cartTotalDisplay = document.getElementById('cart-total-price');
  const cartCountDisplay = document.getElementById('cart-count');

  // Open/Close Cart
  const toggleCart = () => {
    cartSidebar.classList.toggle('open');
    overlay.classList.toggle('active');
    document.body.style.overflow = cartSidebar.classList.contains('open') ? 'hidden' : '';
  };

  cartBtn.addEventListener('click', toggleCart);
  closeCart.addEventListener('click', toggleCart);
  overlay.addEventListener('click', () => {
    if (cartSidebar.classList.contains('open')) toggleCart();
    if (navLinks.classList.contains('active')) toggleMenu();
  });

  // Add to Cart
  window.addToCart = function(name, price, emoji) {
    const existingItem = cart.find(item => item.name === name);
    
    if (existingItem) {
      existingItem.quantity++;
    } else {
      cart.push({ name, price, emoji, quantity: 1 });
    }
    
    updateCartUI();
    showToast(`✅ ${name} ditambahkan!`);
    
    // Bounce animation for cart count
    gsap.fromTo('#cart-count', 
      { scale: 1.5 }, 
      { scale: 1, duration: 0.4, ease: "back.out(2)" }
    );

    // Open cart automatically on first add or just provide feedback
    if (cart.length === 1 && !cartSidebar.classList.contains('open')) {
      setTimeout(toggleCart, 500);
    }
  };

  const updateCartUI = () => {
    // Update count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountDisplay.textContent = totalItems;

    // Render items
    if (cart.length === 0) {
      cartItemsContainer.innerHTML = '<div class="empty-cart-msg">Keranjang kamu masih kosong 🥨</div>';
      cartTotalDisplay.textContent = 'Rp 0';
    } else {
      cartItemsContainer.innerHTML = cart.map((item, index) => `
        <div class="cart-item">
          <div class="item-thumb">${item.emoji}</div>
          <div class="item-details">
            <div class="item-name">${item.name}</div>
            <div class="item-price">Rp ${(item.price * item.quantity).toLocaleString('id-ID')}</div>
            <div class="item-qty-controls">
              <button class="btn-qty" onclick="updateQty(${index}, -1)">-</button>
              <span>${item.quantity}</span>
              <button class="btn-qty" onclick="updateQty(${index}, 1)">+</button>
            </div>
          </div>
        </div>
      `).join('');

      const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      cartTotalDisplay.textContent = `Rp ${total.toLocaleString('id-ID')}`;
    }
  };

  window.updateQty = (index, change) => {
    cart[index].quantity += change;
    if (cart[index].quantity <= 0) {
      cart.splice(index, 1);
    }
    updateCartUI();
  };

  // --- Mobile Menu Logic ---
  const menuToggle = document.getElementById('menu-toggle');
  const navLinks = document.getElementById('nav-links');

  const toggleMenu = () => {
    menuToggle.classList.toggle('active');
    navLinks.classList.toggle('active');
    overlay.classList.toggle('active');
    document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
  };

  menuToggle.addEventListener('click', toggleMenu);

  // Close menu when clicking links
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      if (navLinks.classList.contains('active')) toggleMenu();
    });
  });

  // --- Toast Logic ---
  window.showToast = function(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    
    gsap.to(t, {
      opacity: 1,
      y: 0,
      duration: 0.4,
      ease: "power2.out",
      onStart: () => t.classList.add('show')
    });

    setTimeout(() => {
      gsap.to(t, {
        opacity: 0,
        y: 12,
        duration: 0.4,
        ease: "power2.in",
        onComplete: () => t.classList.remove('show')
      });
    }, 2800);
  };

  // --- GSAP Animations ---
  gsap.registerPlugin(ScrollTrigger);

  // Hero Animations
  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

  tl.from(".nav-logo", { y: -20, opacity: 0, duration: 0.8 })
    .from(".nav-links li", { y: -20, opacity: 0, stagger: 0.1, duration: 0.6 }, "-=0.4")
    .from(".nav-right > *", { x: 20, opacity: 0, stagger: 0.1, duration: 0.6 }, "-=0.4")
    .from(".hero-tag", { y: 20, opacity: 0, duration: 0.6 }, "-=0.4")
    .from(".hero h1", { y: 30, opacity: 0, duration: 0.8 }, "-=0.4")
    .from(".hero-desc", { y: 20, opacity: 0, duration: 0.6 }, "-=0.4")
    .from(".hero-btns .btn-primary, .hero-btns .btn-outline", { scale: 0.8, opacity: 0, stagger: 0.15, duration: 0.6 }, "-=0.4")
    .from(".hero-stats > div", { y: 20, opacity: 0, stagger: 0.15, duration: 0.6 }, "-=0.4");

  // Floating Snacks Animation
  const snacks = [".sf1", ".sf2", ".sf3", ".sf4", ".sf5"];
  snacks.forEach((snack, i) => {
    gsap.from(snack, {
      scale: 0,
      opacity: 0,
      duration: 1,
      delay: 0.5 + (i * 0.1),
      ease: "back.out(1.7)"
    });

    gsap.to(snack, {
      y: -20,
      rotation: i % 2 === 0 ? 5 : -5,
      duration: 2 + Math.random() * 2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      delay: Math.random()
    });
  });

  // Scroll Reveal Animations
  const revealElements = [
    ".product-card", 
    ".cat-card", 
    ".review-card", 
    ".section-title", 
    ".section-label",
    ".banner-right"
  ];

  revealElements.forEach(selector => {
    gsap.utils.toArray(selector).forEach(el => {
      gsap.from(el, {
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          toggleActions: "play none none none"
        },
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: "power2.out"
      });
    });
  });

  gsap.to(".banner-emoji-big", {
    y: -30,
    duration: 2,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
  });
});
