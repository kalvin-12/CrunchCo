document.addEventListener('DOMContentLoaded', () => {
  // --- Global State ---
  let cart = JSON.parse(localStorage.getItem('crunchco_cart')) || [];
  
  // --- DOM Elements ---
  const cartBtn = document.getElementById('cart-btn');
  const cartSidebar = document.getElementById('cart-sidebar');
  const closeCart = document.getElementById('close-cart');
  const overlay = document.getElementById('overlay');
  const cartItemsContainer = document.getElementById('cart-items-container');
  const cartTotalDisplay = document.getElementById('cart-total-price');
  const cartCountDisplay = document.getElementById('cart-count');
  
  const menuToggle = document.getElementById('menu-toggle');
  const navLinks = document.getElementById('nav-links');
  
  const checkoutBtn = document.querySelector('.btn-checkout');
  const checkoutModal = document.getElementById('checkout-modal');
  const closeCheckout = document.getElementById('close-checkout');
  const checkoutSummary = document.getElementById('checkout-summary');
  const checkoutForm = document.getElementById('checkout-form');
  
  const newsletterForm = document.getElementById('newsletter-form');
  const backToTop = document.getElementById('back-to-top');
  
  const productCards = document.querySelectorAll('.product-card');
  const categoryCards = document.querySelectorAll('.cat-card');
  const viewAllBtn = document.getElementById('view-all-products');

  // --- Filter Logic ---
  const filterProducts = (category) => {
    productCards.forEach(card => {
      if (category === 'all' || card.dataset.category === category) {
        card.style.display = 'block';
        gsap.fromTo(card, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 });
      } else {
        card.style.display = 'none';
      }
    });
    
    // Smooth scroll to products
    document.getElementById('produk').scrollIntoView({ behavior: 'smooth' });
  };

  categoryCards.forEach(card => {
    card.addEventListener('click', () => {
      const cat = card.dataset.category;
      filterProducts(cat);
      showToast(`📂 Menampilkan kategori: ${cat}`);
    });
  });

  viewAllBtn.addEventListener('click', (e) => {
    e.preventDefault();
    filterProducts('all');
    showToast('🍕 Menampilkan semua produk');
  });

  // --- Cart Logic ---
  const saveCart = () => {
    localStorage.setItem('crunchco_cart', JSON.stringify(cart));
  };

  const toggleCart = () => {
    cartSidebar.classList.toggle('open');
    overlay.classList.toggle('active');
    document.body.style.overflow = cartSidebar.classList.contains('open') ? 'hidden' : '';
  };

  const updateCartUI = () => {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountDisplay.textContent = totalItems;

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
    saveCart();
  };

  window.addToCart = function(name, price, emoji) {
    const existingItem = cart.find(item => item.name === name);
    if (existingItem) {
      existingItem.quantity++;
    } else {
      cart.push({ name, price, emoji, quantity: 1 });
    }
    updateCartUI();
    showToast(`✅ ${name} ditambahkan!`);
    
    gsap.fromTo('#cart-count', 
      { scale: 1.5 }, 
      { scale: 1, duration: 0.4, ease: "back.out(2)" }
    );
  };

  window.updateQty = (index, change) => {
    cart[index].quantity += change;
    if (cart[index].quantity <= 0) {
      cart.splice(index, 1);
    }
    updateCartUI();
  };

  cartBtn.addEventListener('click', toggleCart);
  closeCart.addEventListener('click', toggleCart);
  overlay.addEventListener('click', () => {
    if (cartSidebar.classList.contains('open')) toggleCart();
    if (navLinks.classList.contains('active')) toggleMenu();
    if (checkoutModal.classList.contains('active')) toggleCheckoutModal();
  });

  // --- Checkout Logic ---
  const toggleCheckoutModal = () => {
    if (cart.length === 0 && !checkoutModal.classList.contains('active')) {
      showToast('❌ Keranjang masih kosong!');
      return;
    }
    
    if (!checkoutModal.classList.contains('active')) {
      renderCheckoutSummary();
    }
    
    checkoutModal.classList.toggle('active');
    overlay.classList.toggle('active');
    
    // Close cart if it's open
    if (cartSidebar.classList.contains('open')) {
      cartSidebar.classList.remove('open');
      // Keep overlay active for modal
    }
  };

  const renderCheckoutSummary = () => {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let summaryHTML = cart.map(item => `
      <div class="summary-item">
        <span>${item.name} x${item.quantity}</span>
        <span>Rp ${(item.price * item.quantity).toLocaleString('id-ID')}</span>
      </div>
    `).join('');
    
    summaryHTML += `
      <div class="summary-item summary-total">
        <span>Total Akhir</span>
        <span>Rp ${total.toLocaleString('id-ID')}</span>
      </div>
    `;
    checkoutSummary.innerHTML = summaryHTML;
  };

  checkoutBtn.addEventListener('click', toggleCheckoutModal);
  closeCheckout.addEventListener('click', toggleCheckoutModal);

  checkoutForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('cust-name').value;
    const address = document.getElementById('cust-address').value;
    const phone = document.getElementById('cust-phone').value;
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let itemsText = cart.map(item => `- ${item.name} (${item.quantity}x)`).join('%0A');
    
    const message = `Halo CrunchCo, saya ingin memesan:%0A%0A${itemsText}%0A%0ATotal: Rp ${total.toLocaleString('id-ID')}%0A%0AData Pemesan:%0ANama: ${name}%0AAlamat: ${address}%0AWhatsApp: ${phone}`;
    
    const whatsappUrl = `https://wa.me/628123456789?text=${message}`;
    
    window.open(whatsappUrl, '_blank');
    
    // Success feedback
    showToast('🚀 Pesanan sedang dikirim ke WhatsApp...');
    cart = [];
    updateCartUI();
    toggleCheckoutModal();
    checkoutForm.reset();
  });

  // --- Mobile Menu Logic ---
  const toggleMenu = () => {
    menuToggle.classList.toggle('active');
    navLinks.classList.toggle('active');
    overlay.classList.toggle('active');
    document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
  };

  menuToggle.addEventListener('click', toggleMenu);
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      if (navLinks.classList.contains('active')) toggleMenu();
    });
  });

  // --- Newsletter Logic ---
  newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('newsletter-email').value;
    showToast(`🎉 Terima kasih! Voucher dikirim ke ${email}`);
    newsletterForm.reset();
  });

  // --- Back to Top Logic ---
  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
      backToTop.classList.add('show');
    } else {
      backToTop.classList.remove('show');
    }
  });

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  // --- Global Link Handler ---
  document.querySelectorAll('a[href="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      showToast('🚧 Fitur ini sedang dalam pengembangan!');
    });
  });

  // --- Initial UI Update ---
  updateCartUI();

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

  // Floating Snacks
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

  // Scroll Reveal
  const revealElements = [".product-card", ".cat-card", ".review-card", ".section-title", ".section-label", ".banner-right"];
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
