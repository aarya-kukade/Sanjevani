/* ===== Pages Navigation Handler ===== */

document.addEventListener('DOMContentLoaded', function() {
  // Mobile Menu Toggle
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (navToggle) {
    navToggle.addEventListener('click', function() {
      this.classList.toggle('active');
      navMenu.classList.toggle('active');
    });
  }

  // Close mobile menu when a link is clicked
  navLinks.forEach(link => {
    link.addEventListener('click', function() {
      if (navToggle) {
        navToggle.classList.remove('active');
      }
      if (navMenu) {
        navMenu.classList.remove('active');
      }
    });
  });

  // Handle Experience/Demo Buttons on pages
  const experienceBtn = document.getElementById('experience-btn');
  const demoBtn = document.getElementById('demo-btn');
  const redirectModal = document.getElementById('redirect-modal');
  const demoModal = document.getElementById('demo-modal');

  function showRedirectModal() {
    if (redirectModal) {
      redirectModal.classList.remove('hidden');
    }
  }

  if (experienceBtn) {
    experienceBtn.addEventListener('click', showRedirectModal);
  }

  if (demoBtn) {
    demoBtn.addEventListener('click', showRedirectModal);
  }

  // Modal Controls - Redirect Modal
  if (redirectModal) {
    const modalClose = redirectModal.querySelector('#modal-close');
    const modalCancel = redirectModal.querySelector('#modal-cancel');
    const modalConfirm = redirectModal.querySelector('#modal-confirm');

    function closeModal() {
      redirectModal.classList.add('hidden');
    }

    if (modalClose) {
      modalClose.addEventListener('click', closeModal);
    }

    if (modalCancel) {
      modalCancel.addEventListener('click', closeModal);
    }

    if (modalConfirm) {
      modalConfirm.addEventListener('click', function() {
        // Navigate to hospital booking app
        window.location.href = 'index.html';
      });
    }

    // Close modal on background click
    redirectModal.addEventListener('click', function(e) {
      if (e.target === redirectModal) {
        closeModal();
      }
    });
  }

  // Modal Controls - Demo Modal
  if (demoModal) {
    const modalCloseDEMO = document.getElementById('modal-close-demo');
    const modalCancelDEMO = document.getElementById('modal-cancel-demo');

    function closeModal() {
      demoModal.classList.add('hidden');
    }

    if (modalCloseDEMO) {
      modalCloseDEMO.addEventListener('click', closeModal);
    }

    if (modalCancelDEMO) {
      modalCancelDEMO.addEventListener('click', closeModal);
    }

    // Close modal on background click
    demoModal.addEventListener('click', function(e) {
      if (e.target === demoModal) {
        closeModal();
      }
    });
  }

  // Update active nav LINK
  updateActiveNavLink();
});

function updateActiveNavLink() {
  const currentPage = window.location.pathname.split('/').pop() || 'home.html';
  const navLinks = document.querySelectorAll('.nav-link');

  navLinks.forEach(link => {
    link.classList.remove('active');
    const href = link.getAttribute('href');
    
    // Match NAV LINK
    if (href && (
      (currentPage === '' && href.includes('home.html')) ||
      currentPage === href.split('/').pop()
    )) {
      link.classList.add('active');
    }
  });
}
