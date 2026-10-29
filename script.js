/**
 * PIGGY PLACE — ИНТЕРАКТИВНЫЙ СКРИПТ САЙТА АНТИКАФЕ С МИНИ-ПИГАМИ
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Инициализация статуса работы заведения (10:00 - 20:00 MSK)
  initWorkingHoursStatus();

  // 2. Мобильное меню
  initMobileMenu();

  // 3. Интерактивный калькулятор стоимости посещения
  initCalculator();

  // 4. Фильтр фотогалереи и Lightbox
  initGallery();

  // 5. Аккордеон FAQ
  initFAQ();

  // 6. Модальное окно онлайн-бронирования
  initBookingModal();

  // 7. Звуковые эффекты свинок (Web Audio API)
  initPiggyInteractions();

  // 8. Плавная прокрутка для якорных ссылок
  initSmoothScroll();
});

/* ==========================================================================
   1. СТАТУС РАБОТЫ (МСК ВРЕМЯ 10:00 - 20:00)
   ========================================================================== */
function initWorkingHoursStatus() {
  const statusDots = document.querySelectorAll('.status-dot');
  const statusTexts = document.querySelectorAll('.status-text-val');

  if (!statusDots.length) return;

  function updateStatus() {
    // Получаем текущее время в часовом поясе Москвы (UTC+3)
    const now = new Date();
    const utcHours = now.getUTCHours();
    const mskHours = (utcHours + 3) % 24;
    const mskMinutes = now.getUTCMinutes();

    const isOpen = mskHours >= 10 && mskHours < 20;

    statusDots.forEach(dot => {
      if (isOpen) {
        dot.classList.remove('closed');
      } else {
        dot.classList.add('closed');
      }
    });

    statusTexts.forEach(text => {
      if (isOpen) {
        text.textContent = 'Открыто сейчас • до 20:00';
        text.style.color = '#22C55E';
      } else {
        text.textContent = 'Закрыто • ждём завтра с 10:00';
        text.style.color = '#EF4444';
      }
    });
  }

  updateStatus();
  setInterval(updateStatus, 60000);
}

/* ==========================================================================
   2. МОБИЛЬНОЕ МЕНЮ
   ========================================================================== */
function initMobileMenu() {
  const toggleBtn = document.querySelector('.menu-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (!toggleBtn || !navMenu) return;

  toggleBtn.addEventListener('click', () => {
    toggleBtn.classList.toggle('active');
    navMenu.classList.toggle('open');
  });

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      toggleBtn.classList.remove('active');
      navMenu.classList.remove('open');
    });
  });

  // Изменение тени шапки при скролле
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
}

/* ==========================================================================
   3. ИНТЕРАКТИВНЫЙ КАЛЬКУЛЯТОР ВИЗИТА
   ========================================================================== */
function initCalculator() {
  const calcBox = document.querySelector('.calculator-box');
  if (!calcBox) return;

  // Элементы управления
  const dayPills = document.querySelectorAll('.calc-pill-btn');
  const adultVal = document.getElementById('calc-adults');
  const childVal = document.getElementById('calc-children');
  const babyVal = document.getElementById('calc-babies');
  
  const vegCheck = document.getElementById('calc-veg');
  const bottleCheck = document.getElementById('calc-bottle');
  const photoCheck = document.getElementById('calc-photo');
  
  const priceDisplay = document.getElementById('calc-total-price');
  const bookWithCalcBtn = document.getElementById('calc-book-btn');

  let state = {
    isWeekend: false,
    adults: 2,
    children: 0,
    babies: 0,
    vegCount: 1,
    bottle: false,
    photo: false
  };

  // Переключение дня недели
  dayPills.forEach(pill => {
    pill.addEventListener('click', () => {
      dayPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      state.isWeekend = pill.dataset.day === 'weekend';
      calculateTotal();
    });
  });

  // Кнопки счётчиков
  document.querySelectorAll('.counter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.target;
      const action = btn.dataset.action;
      
      if (target === 'adults') {
        if (action === 'plus' && state.adults < 10) state.adults++;
        if (action === 'minus' && state.adults > 1) state.adults--;
        adultVal.textContent = state.adults;
      } else if (target === 'children') {
        if (action === 'plus' && state.children < 10) state.children++;
        if (action === 'minus' && state.children > 0) state.children--;
        childVal.textContent = state.children;
      } else if (target === 'babies') {
        if (action === 'plus' && state.babies < 5) state.babies++;
        if (action === 'minus' && state.babies > 0) state.babies--;
        babyVal.textContent = state.babies;
      }
      
      calculateTotal();
    });
  });

  // Чекбоксы допов
  if (vegCheck) vegCheck.addEventListener('change', (e) => { state.veg = e.target.checked; calculateTotal(); });
  if (bottleCheck) bottleCheck.addEventListener('change', (e) => { state.bottle = e.target.checked; calculateTotal(); });
  if (photoCheck) photoCheck.addEventListener('change', (e) => { state.photo = e.target.checked; calculateTotal(); });

  function calculateTotal() {
    // Базовые тарифы: 1200 будни, 1500 выходные за человека (взрослый или ребенок от 3 лет)
    const baseRate = state.isWeekend ? 1500 : 1200;
    
    const payingGuests = state.adults + state.children;
    let total = payingGuests * baseRate;

    // Скидка для семейного визита от 3 человек
    if (payingGuests >= 3) {
      total = Math.round(total * 0.95); // 5% скидка комбо
    }

    if (state.veg) total += 250;
    if (state.bottle) total += 300;
    if (state.photo) total += 350;

    // Анимация изменения цены
    if (priceDisplay) {
      priceDisplay.textContent = total.toLocaleString('ru-RU') + ' ₽';
    }
    
    return total;
  }

  calculateTotal();

  // При нажатии кнопки "Забронировать по расчету" открываем модалку с предзаполненными параметрами
  if (bookWithCalcBtn) {
    bookWithCalcBtn.addEventListener('click', () => {
      const summaryText = `${state.isWeekend ? 'Выходной' : 'Будний'} день, ${state.adults} взр, ${state.children} дет. (до 3 лет: ${state.babies})`;
      openBookingModal({
        comment: `Расчет из калькулятора: ${summaryText}. Итого ориентировочно: ${calculateTotal()} ₽`
      });
    });
  }
}

/* ==========================================================================
   4. ФОТОГАЛЕРЕЯ & LIGHTBOX
   ========================================================================== */
function initGallery() {
  const filterBtns = document.querySelectorAll('.gallery-filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('gallery-lightbox');
  const lightboxImg = document.getElementById('lightbox-image');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxClose = document.getElementById('lightbox-close');

  if (!galleryItems.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const cat = btn.dataset.filter;

      galleryItems.forEach(item => {
        if (cat === 'all' || item.dataset.category === cat) {
          item.style.display = 'block';
          item.style.animation = 'fadeIn 0.4s ease';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });

  // Открытие Lightbox
  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      const caption = item.querySelector('.gallery-caption');
      if (lightbox && img && lightboxImg) {
        lightboxImg.src = img.src;
        if (lightboxCaption && caption) {
          lightboxCaption.textContent = caption.textContent;
        }
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
  }

  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }

  function closeLightbox() {
    if (lightbox) {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    }
  }
}

/* ==========================================================================
   5. АККОРДЕОН FAQ
   ========================================================================== */
function initFAQ() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    const content = item.querySelector('.faq-content');

    if (!trigger || !content) return;

    trigger.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Закрываем остальные
      faqItems.forEach(other => {
        if (other !== item) {
          other.classList.remove('active');
          const otherContent = other.querySelector('.faq-content');
          if (otherContent) otherContent.style.maxHeight = null;
        }
      });

      // Переключаем текущий
      if (isActive) {
        item.classList.remove('active');
        content.style.maxHeight = null;
      } else {
        item.classList.add('active');
        content.style.maxHeight = content.scrollHeight + 'px';
      }
    });
  });
}

/* ==========================================================================
   6. МОДАЛЬНОЕ ОКНО ОНЛАЙН-БРОНИРОВАНИЯ
   ========================================================================== */
function initBookingModal() {
  const modal = document.getElementById('booking-modal');
  const closeBtn = document.getElementById('modal-close');
  const bookTriggers = document.querySelectorAll('.open-booking-modal');
  const form = document.getElementById('modal-booking-form');
  const inlineForm = document.getElementById('inline-booking-form');

  if (!modal) return;

  bookTriggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const plan = btn.dataset.plan || '';
      openBookingModal({ plan });
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Отправка модальной формы
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      handleBookingSubmit(form);
    });
  }

  // Отправка встроенной формы на странице
  if (inlineForm) {
    inlineForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleBookingSubmit(inlineForm);
    });
  }

  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function openBookingModal(data = {}) {
  const modal = document.getElementById('booking-modal');
  if (!modal) return;

  if (data.plan) {
    const tariffSelect = modal.querySelector('#modal-tariff');
    if (tariffSelect) tariffSelect.value = data.plan;
  }

  if (data.comment) {
    const commentField = modal.querySelector('#modal-comment');
    if (commentField) commentField.value = data.comment;
  }

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function handleBookingSubmit(formElement) {
  const nameInput = formElement.querySelector('[name="guest_name"]');
  const phoneInput = formElement.querySelector('[name="guest_phone"]');
  const dateInput = formElement.querySelector('[name="visit_date"]');
  const timeInput = formElement.querySelector('[name="visit_time"]');

  const guestName = nameInput ? nameInput.value.trim() : 'Гость';
  const guestPhone = phoneInput ? phoneInput.value.trim() : '';

  if (!guestPhone) {
    showToast('Пожалуйста, укажите контактный телефон для связи 📞');
    return;
  }

  // Закрываем модалку если она открыта
  const modal = document.getElementById('booking-modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Показываем красивое сообщение с подтверждением
  showToast(`🐷 Спасибо, ${guestName}! Ваша бронь принята. Администратор свяжется с вами в течение 10 минут.`);

  // Очищаем форму
  formElement.reset();

  // Звук хрюканья от радости
  playPiggyChime();
}

/* ==========================================================================
   7. ВЕСЕЛЫЕ ИНТЕРАКЦИИ СО СВИНКАМИ (Web Audio API)
   ========================================================================== */
function initPiggyInteractions() {
  const piggyActionBtns = document.querySelectorAll('.piggy-action-btn');

  piggyActionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const pigName = btn.dataset.pig || 'малыш';
      playPiggyChime();

      // Нежная анимация сердечка над кнопкой
      showFloatingHeart(btn);

      const phrase = getRandomPiggyPhrase(pigName);
      showToast(phrase);
    });
  });
}

// Генератор милого мягкого звука хрюканья/радости через Web Audio API
function playPiggyChime() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const now = ctx.currentTime;

    // Генерация двух нежных тонов, напоминающих довольное хрюканье
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'triangle';
    osc2.type = 'sine';

    osc1.frequency.setValueAtTime(280, now);
    osc1.frequency.exponentialRampToValueAtTime(190, now + 0.18);

    osc2.frequency.setValueAtTime(320, now);
    osc2.frequency.exponentialRampToValueAtTime(220, now + 0.18);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.22);
    osc2.stop(now + 0.22);
  } catch (e) {
    // Web Audio blocked or not supported
  }
}

function getRandomPiggyPhrase(pigName) {
  const phrases = [
    `🐷 *Хрююю*! ${pigName} довольно завилял(а) хвостиком от почесушек!`,
    `💕 ${pigName} подставил(а) розовое пузико и довольно посапывает!`,
    `✨ ${pigName} ждёт вас в гости за хрустящей морковкой!`,
    `🥰 ${pigName} уже приготовил(а) для вас теплый плед и обнимашки!`
  ];
  return phrases[Math.floor(Math.random() * phrases.length)];
}

function showFloatingHeart(element) {
  const heart = document.createElement('span');
  heart.textContent = '💖';
  heart.style.position = 'absolute';
  heart.style.left = '50%';
  heart.style.top = '0';
  heart.style.transform = 'translate(-50%, 0)';
  heart.style.fontSize = '24px';
  heart.style.pointerEvents = 'none';
  heart.style.transition = 'all 0.9s cubic-bezier(0.16, 1, 0.3, 1)';
  heart.style.zIndex = '100';

  element.style.position = 'relative';
  element.appendChild(heart);

  requestAnimationFrame(() => {
    heart.style.transform = 'translate(-50%, -45px) scale(1.4)';
    heart.style.opacity = '0';
  });

  setTimeout(() => {
    heart.remove();
  }, 1000);
}

/* ==========================================================================
   ТОСТ УВЕДОМЛЕНИЯ
   ========================================================================== */
function showToast(message) {
  let toast = document.querySelector('.toast-msg');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast-msg';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `<span>${message}</span>`;
  toast.classList.add('show');

  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 4500);
}

/* ==========================================================================
   8. ПЛАВНАЯ ПРОКРУТКА
   ========================================================================== */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const navOffset = 80;
        const targetPos = targetEl.getBoundingClientRect().top + window.pageYOffset - navOffset;
        window.scrollTo({
          top: targetPos,
          behavior: 'smooth'
        });
      }
    });
  });
}
