/* ===== Sanjeevani Home Page Script ===== */

document.addEventListener('DOMContentLoaded', function() {
  console.log('✅ Script loaded');

  /* ===== Navigation Control ===== */
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');
  const navbarBrand = document.querySelector('.navbar-brand');
  
  // Mobile Menu Toggle
  if (navToggle) {
    navToggle.addEventListener('click', function() {
      this.classList.toggle('active');
      navMenu.classList.toggle('active');
    });
  }

  // Close mobile menu when a link is clicked
  navLinks.forEach(link => {
    link.addEventListener('click', function() {
      navToggle.classList.remove('active');
      navMenu.classList.remove('active');
      
      // Update active state
      navLinks.forEach(l => l.classList.remove('active'));
      this.classList.add('active');
    });
  });

  // Brand click to home
  if (navbarBrand) {
    navbarBrand.addEventListener('click', function() {
      window.location.href = 'home.html';
    });
  }

  /* ===== Modal and Button Handlers ===== */
  const redirectModal = document.getElementById('redirect-modal');
  const modalClose = document.getElementById('modal-close');
  const modalCancel = document.getElementById('modal-cancel');
  const modalConfirm = document.getElementById('modal-confirm');

  // All explore buttons
  const exploreBtns = [
    document.getElementById('explore-btn'),
    document.getElementById('cta-explore-btn'),
    document.getElementById('about-cta-btn')
  ];

  // All demo buttons
  const demoBtns = [
    document.getElementById('demo-btn'),
    document.getElementById('cta-demo-btn')
  ];

  // Show modal function
  function showModal() {
    if (redirectModal) {
      redirectModal.classList.remove('hidden');
      console.log('✅ Modal shown');
    }
  }

  // Close modal function
  function closeModal() {
    if (redirectModal) {
      redirectModal.classList.add('hidden');
      console.log('✅ Modal closed');
    }
  }

  // Explore buttons - show modal
  exploreBtns.forEach(btn => {
    if (btn) {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('🔘 Explore clicked');
        showModal();
      });
    }
  });

  // Demo buttons - open in new tab
  demoBtns.forEach(btn => {
    if (btn) {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('🔘 Demo clicked');
        window.open('index.html', '_blank');
      });
    }
  });

  // Modal close button
  if (modalClose) {
    modalClose.addEventListener('click', function(e) {
      e.preventDefault();
      closeModal();
    });
  }

  // Modal cancel button
  if (modalCancel) {
    modalCancel.addEventListener('click', function(e) {
      e.preventDefault();
      closeModal();
    });
  }

  // Modal confirm button
  if (modalConfirm) {
    modalConfirm.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('✅ Redirecting to app');
      window.location.href = 'index.html';
    });
  }

  // Close modal when clicking outside
  if (redirectModal) {
    redirectModal.addEventListener('click', function(e) {
      if (e.target === redirectModal) {
        closeModal();
      }
    });
  }

  // Smooth scroll for anchor links
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          window.scrollBy(0, -70);
        }
      }
    });
  });

  // Update active link on scroll
  window.addEventListener('scroll', function() {
    let current = '';
    const sections = document.querySelectorAll('section');
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 100;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id') || '';
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      if (href === '#' + current) {
        link.classList.add('active');
      }
    });
  });

  /* ===== Scroll Animations ===== */
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  };

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  // Observe animated elements
  document.querySelectorAll('.section-title, .section-subtitle, .feature-card, .about-feature, .stat').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'all 0.6s ease';
    observer.observe(el);
  });

  console.log('✅ All handlers attached');
});

/* ===== Canvas Globe Animation ===== */
function initGlobe() {
  const canvas = document.getElementById('globe-canvas');
  if (!canvas) {
    console.warn('⚠️ Globe canvas not found');
    return;
  }

  console.log('🌍 Initializing globe');
  const ctx = canvas.getContext('2d');
  
  // Set canvas size
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();

  window.addEventListener('resize', resizeCanvas);

  let animationId;
  let time = 0;

  function drawGlobe() {
    // Clear canvas
    ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const baseRadius = Math.min(canvas.width, canvas.height) * 0.25;

    time += 0.0005;

    // Draw rotating grid globe
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(time);

    // Draw latitude lines
    ctx.strokeStyle = 'rgba(10, 147, 150, 0.15)';
    ctx.lineWidth = 1;
    for (let lat = -80; lat <= 80; lat += 20) {
      const y = baseRadius * Math.sin((lat * Math.PI) / 180);
      const r = baseRadius * Math.cos((lat * Math.PI) / 180);
      
      ctx.beginPath();
      ctx.ellipse(0, y, r, r * 0.3, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Draw longitude lines
    ctx.strokeStyle = 'rgba(0, 212, 212, 0.15)';
    ctx.lineWidth = 1;
    for (let lon = 0; lon < 360; lon += 30) {
      const angle = (lon * Math.PI) / 180;
      ctx.beginPath();
      for (let lat = -90; lat <= 90; lat += 5) {
        const latRad = (lat * Math.PI) / 180;
        const x = baseRadius * Math.cos(latRad) * Math.cos(angle);
        const y = baseRadius * Math.sin(latRad);
        if (lat === -90) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    }

    // Draw glowing points
    const points = [
      { lat: 0, lon: 0, color: '#00f5ff' },
      { lat: 40, lon: -75, color: '#0a9396' },
      { lat: 51, lon: 0, color: '#0a9396' },
      { lat: 35, lon: 139, color: '#10a688' },
      { lat: -33, lon: 151, color: '#0a9396' },
      { lat: -23, lon: -45, color: '#10a688' },
    ];

    points.forEach(point => {
      const latRad = (point.lat * Math.PI) / 180;
      const lonRad = (point.lon * Math.PI) / 180;
      const x = baseRadius * Math.cos(latRad) * Math.cos(lonRad);
      const y = baseRadius * Math.sin(latRad);

      // Glow
      const glow = ctx.createRadialGradient(x, y, 0, x, y, 15);
      glow.addColorStop(0, point.color + '40');
      glow.addColorStop(1, point.color + '00');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, 15, 0, Math.PI * 2);
      ctx.fill();

      // Point
      ctx.fillStyle = point.color;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();

    // Draw outer ring
    ctx.strokeStyle = 'rgba(10, 147, 150, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, baseRadius, 0, Math.PI * 2);
    ctx.stroke();

    animationId = requestAnimationFrame(drawGlobe);
  }

  drawGlobe();
}

// Initialize globe when ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGlobe);
} else {
  initGlobe();
}

console.log('✅ Globe initialized');
