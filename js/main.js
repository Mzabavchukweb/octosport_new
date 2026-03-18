/**
 * Octosport - Main JS v2
 */

document.addEventListener('DOMContentLoaded', () => {
  
  // Header scroll
  const header = document.getElementById('header');
  const handleScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 50);
  };
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // Mobile nav
  const toggle = document.getElementById('navToggle');
  const mobile = document.getElementById('navMobile');
  
  if (toggle && mobile) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      mobile.classList.toggle('active');
      document.body.style.overflow = mobile.classList.contains('active') ? 'hidden' : '';
    });
    
    mobile.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        toggle.classList.remove('active');
        mobile.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  // Back to top
  const backTop = document.getElementById('backTop');
  if (backTop) {
    const toggleBackTop = () => {
      backTop.classList.toggle('show', window.scrollY > 400);
    };
    window.addEventListener('scroll', toggleBackTop, { passive: true });
    backTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Scroll animations with better performance
  const fadeEls = document.querySelectorAll('.fade-up');
  if (fadeEls.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { 
      threshold: 0.1, 
      rootMargin: '0px 0px -50px 0px' 
    });
    
    fadeEls.forEach(el => observer.observe(el));
  } else {
    // Fallback for browsers without IntersectionObserver
    fadeEls.forEach(el => el.classList.add('visible'));
  }
  
  // Animate stats on scroll
  const statNums = document.querySelectorAll('.hero-stat-inline .num');
  if (statNums.length) {
    // Store original values first
    statNums.forEach(el => {
      const spanEl = el.querySelector('span');
      if (spanEl) {
        el.dataset.originalValue = el.textContent.trim().match(/^\d+/)?.[0] || '0';
        el.dataset.spanHTML = spanEl.outerHTML;
      }
    });
    
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const numEl = entry.target;
          
          // Check if already animated
          if (numEl.dataset.animated === 'true') return;
          numEl.dataset.animated = 'true';
          
          const target = parseInt(numEl.dataset.originalValue || '0');
          const spanHTML = numEl.dataset.spanHTML || '<span>+</span>';
          
          if (target > 0) {
            let current = 0;
            const duration = 1500;
            const startTime = Date.now();
            
            const animate = () => {
              const elapsed = Date.now() - startTime;
              const progress = Math.min(elapsed / duration, 1);
              
              // Easing function (ease-out cubic)
              const easeOut = 1 - Math.pow(1 - progress, 3);
              current = Math.floor(easeOut * target);
              
              numEl.innerHTML = current + spanHTML;
              
              if (progress < 1) {
                requestAnimationFrame(animate);
              } else {
                // Ensure final value
                numEl.innerHTML = target + spanHTML;
              }
            };
            
            // Start from 0
            numEl.innerHTML = '0' + spanHTML;
            
            // Start animation
            requestAnimationFrame(() => {
              setTimeout(() => requestAnimationFrame(animate), 100);
            });
            
            statsObserver.unobserve(numEl);
          }
        }
      });
    }, { threshold: 0.2, rootMargin: '50px' });
    
    // Check if stats are already visible (hero section)
    const heroStats = document.querySelector('.hero-stats-inline');
    if (heroStats) {
      const heroObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            statNums.forEach(el => {
              if (!el.dataset.animated) {
                statsObserver.observe(el);
              }
            });
            heroObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });
      heroObserver.observe(heroStats);
    } else {
      // Fallback: observe stats directly
      statNums.forEach(el => statsObserver.observe(el));
    }
  }

  // Steps line animation
  const stepsLine = document.querySelector('.steps-line-fill');
  if (stepsLine) {
    const stepsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          stepsLine.style.width = '100%';
        }
      });
    }, { threshold: 0.3 });
    
    stepsObserver.observe(stepsLine.parentElement);
  }

  // FAQ
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const q = item.querySelector('.faq-q');
    if (q) {
      q.addEventListener('click', () => {
        faqItems.forEach(other => {
          if (other !== item) other.classList.remove('open');
        });
        item.classList.toggle('open');
      });
    }
  });

  // Reviews drag scroll with momentum
  const track = document.querySelector('.reviews-track');
  if (track) {
    let isDown = false;
    let startX;
    let scrollLeft;
    let velocity = 0;
    let lastX = 0;
    let lastTime = 0;
    let rafId = null;
    
    const smoothScroll = () => {
      if (Math.abs(velocity) > 0.5) {
        track.scrollLeft -= velocity;
        velocity *= 0.95; // Friction
        rafId = requestAnimationFrame(smoothScroll);
      } else {
        velocity = 0;
      }
    };
    
    track.addEventListener('mousedown', e => {
      isDown = true;
      track.style.cursor = 'grabbing';
      startX = e.pageX - track.offsetLeft;
      scrollLeft = track.scrollLeft;
      lastX = e.pageX;
      lastTime = Date.now();
      velocity = 0;
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    });
    
    track.addEventListener('mouseleave', () => {
      if (isDown) {
        isDown = false;
        track.style.cursor = 'grab';
        smoothScroll();
      }
    });
    
    track.addEventListener('mouseup', () => {
      if (isDown) {
        isDown = false;
        track.style.cursor = 'grab';
        smoothScroll();
      }
    });
    
    track.addEventListener('mousemove', e => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - track.offsetLeft;
      const now = Date.now();
      const deltaTime = now - lastTime;
      
      if (deltaTime > 0) {
        velocity = (lastX - e.pageX) * 2;
      }
      
      track.scrollLeft = scrollLeft - (x - startX) * 2;
      lastX = e.pageX;
      lastTime = now;
    });
    
    // Touch support
    let touchStartX = 0;
    let touchScrollLeft = 0;
    
    track.addEventListener('touchstart', e => {
      touchStartX = e.touches[0].pageX;
      touchScrollLeft = track.scrollLeft;
    });
    
    track.addEventListener('touchmove', e => {
      const x = e.touches[0].pageX;
      track.scrollLeft = touchScrollLeft - (x - touchStartX);
    });
    
    track.style.cursor = 'grab';
  }

  // Form validation & submission
  document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const original = btn.innerHTML;
      const span = btn.querySelector('span') || btn;
      
      btn.disabled = true;
      if (span.tagName === 'SPAN') {
        span.textContent = 'Wysyłanie...';
      } else {
        btn.textContent = 'Wysyłanie...';
      }
      
      // Simulate API call
      setTimeout(() => {
        if (span.tagName === 'SPAN') {
          span.textContent = 'Wysłano! ✓';
        } else {
          btn.textContent = 'Wysłano! ✓';
        }
        btn.style.background = '#28a745';
        
        setTimeout(() => {
          btn.innerHTML = original;
          btn.style.background = '';
          btn.disabled = false;
          form.reset();
        }, 2000);
      }, 800);
    });
  });

  // Lightbox
  const galleryItems = document.querySelectorAll('.gallery-item');
  if (galleryItems.length) {
    const lightbox = document.createElement('div');
    lightbox.id = 'lightbox';
    lightbox.innerHTML = `
      <button class="lb-close" style="position:absolute;top:24px;right:24px;width:48px;height:48px;background:rgba(255,255,255,0.1);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#fff;">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
      <img src="" style="max-width:90vw;max-height:90vh;object-fit:contain;">
    `;
    lightbox.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.95);z-index:10000;display:none;align-items:center;justify-content:center;opacity:0;transition:opacity 0.3s ease;';
    document.body.appendChild(lightbox);
    
    const img = lightbox.querySelector('img');
    const closeBtn = lightbox.querySelector('.lb-close');
    
    const open = src => {
      img.src = src;
      lightbox.style.display = 'flex';
      setTimeout(() => lightbox.style.opacity = '1', 10);
      document.body.style.overflow = 'hidden';
    };
    
    const close = () => {
      lightbox.style.opacity = '0';
      setTimeout(() => {
        lightbox.style.display = 'none';
        document.body.style.overflow = '';
      }, 300);
    };
    
    galleryItems.forEach(item => {
      item.addEventListener('click', () => {
        const i = item.querySelector('img');
        if (i) open(i.src);
      });
    });
    
    closeBtn.addEventListener('click', close);
    lightbox.addEventListener('click', e => { if (e.target === lightbox) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  }

  // Leaflet map
  const mapEl = document.getElementById('map');
  if (mapEl && typeof L !== 'undefined') {
    const map = L.map('map', { scrollWheelZoom: false }).setView([53.4285, 14.5528], 5);
    
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 19
    }).addTo(map);
    
    const icon = L.divIcon({
      className: 'custom-marker',
      html: `<div style="width:24px;height:24px;background:#E31E24;border:3px solid #fff;"></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
    
    L.marker([53.4285, 14.5528], { icon }).addTo(map)
      .bindPopup('<strong>Octosport</strong><br>ul. Wierzbowa 42, Szczecin');
    
    const places = [
      [41.3851, 2.1734, 'Barcelona'],
      [50.0647, 19.9450, 'Kraków'],
      [41.9028, 12.4964, 'Rzym']
    ];
    
    places.forEach(([lat, lng, name]) => {
      L.marker([lat, lng], { icon }).addTo(map).bindPopup(`<strong>${name}</strong>`);
    });
  }

  // Gallery filters
  const filtersContainer = document.getElementById('galleryFilters');
  const galleryGrid = document.getElementById('galleryGrid');
  if (filtersContainer && galleryGrid) {
    const filterBtns = filtersContainer.querySelectorAll('.filter-btn');
    const items = galleryGrid.querySelectorAll('.gallery-item');
    
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const filter = btn.dataset.filter;
        
        items.forEach(item => {
          if (filter === 'all' || item.dataset.category === filter) {
            item.classList.remove('hidden');
          } else {
            item.classList.add('hidden');
          }
        });
      });
    });
  }

});
