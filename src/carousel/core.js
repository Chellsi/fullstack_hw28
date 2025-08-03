// Константи за замовчуванням
const DEFAULT_SETTINGS = {
  containerId: '#carousel',
  slideId: '.slide',
  interval: 2000,
  isPlaying: true,
  pauseOnHover: false,
  swipeThreshold: 100
};

// Константи для клавіатури
const CODE_ARROW_LEFT = 'ArrowLeft';
const CODE_ARROW_RIGHT = 'ArrowRight';
const CODE_SPACE = ' ';

// Базовий клас Carousel
export class Carousel {
  #currentSlide = 0;
  #SLIDES_COUNT = 0;
  timerId = null;
  indicators = [];
  pauseBtn = null;
  prevBtn = null;
  nextBtn = null;

  constructor(options) {
    const settings = {
      ...DEFAULT_SETTINGS,
      ...options
    };
    
    this.container = document.querySelector(settings.containerId);
    this.slides = this.container.querySelectorAll(settings.slideId);
    this.TIMER_INTERVAL = settings.interval;
    this.isPlaying = settings.isPlaying;
    this.pauseOnHover = settings.pauseOnHover;
    
    // Ініціалізуємо приватні властивості
    this.#SLIDES_COUNT = this.slides.length;
  }

  init() {
    this.#createControls();
    this.#createIndicators();
    this.#bindEvents();
    
    // Встановлюємо перший слайд як активний
    this.#gotoNth(0);
    
    // Запускаємо автовідтворення, якщо потрібно
    if (this.isPlaying) {
      this.timerId = setInterval(() => {
        this.#gotoNth(this.#currentSlide + 1);
      }, this.TIMER_INTERVAL);
    }
  }

  next() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.isPlaying = false;
    this.#updatePauseButton();
    this.#gotoNth(this.#currentSlide + 1);
  }

  prev() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.isPlaying = false;
    this.#updatePauseButton();
    this.#gotoNth(this.#currentSlide - 1);
  }

  pause() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.isPlaying = false;
    this.#updatePauseButton();
  }

  play() {
    if (!this.isPlaying) {
      this.timerId = setInterval(() => {
        this.#gotoNth(this.#currentSlide + 1);
      }, this.TIMER_INTERVAL);
      this.isPlaying = true;
      this.#updatePauseButton();
    }
  }

  pausePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  // Приватні методи
  #gotoNth(n) {
    // Видаляємо активний клас з поточного слайду та індикатора
    this.slides[this.#currentSlide].classList.remove('active');
    if (this.indicators[this.#currentSlide]) {
      this.indicators[this.#currentSlide].classList.remove('active');
    }
    
    // Перевіряємо, чи n є числом
    if (typeof n !== 'number' || isNaN(n)) {
      throw new TypeError('Argument to #gotoNth must be a valid number');
    }
    
    // Розраховуємо новий індекс слайду (циклічно)
    this.#currentSlide = (n + this.#SLIDES_COUNT) % this.#SLIDES_COUNT;
    
    // Додаємо активний клас до нового слайду та індикатора
    this.slides[this.#currentSlide].classList.add('active');
    if (this.indicators[this.#currentSlide]) {
      this.indicators[this.#currentSlide].classList.add('active');
    }
  }

  #indicatorClick(e) {
    const target = e.target;
    if (target && target.classList.contains('indicator')) {
      if (this.timerId) {
        clearInterval(this.timerId);
        this.timerId = null;
      }
      this.isPlaying = false;
      this.#updatePauseButton();
      this.#gotoNth(+target.dataset.slideTo); // Конвертуємо в число
    }
  }

  #createControls() {
    // Створюємо контейнер кнопок керування
    const controlsContainer = document.createElement('div');
    controlsContainer.id = 'controls-container';
    controlsContainer.className = 'controls-container';
    
    // Створюємо кнопки
    this.pauseBtn = document.createElement('button');
    this.pauseBtn.id = 'pause-btn';
    
    // Створюємо іконки для паузи/відтворення
    const pauseIcon = document.createElement('i');
    pauseIcon.id = 'fa-pause-icon';
    pauseIcon.className = 'control fas fa-lg fa-pause';
    pauseIcon.style.opacity = '1';
    
    const playIcon = document.createElement('i');
    playIcon.id = 'fa-play-icon';
    playIcon.className = 'control fas fa-lg fa-play';
    playIcon.style.opacity = '0';
    
    this.pauseBtn.appendChild(pauseIcon);
    this.pauseBtn.appendChild(playIcon);
    
    this.prevBtn = document.createElement('button');
    this.prevBtn.id = 'prev-btn';
    this.prevBtn.innerHTML = '<i class="control fas fa-lg fa-backward"></i>';
    
    this.nextBtn = document.createElement('button');
    this.nextBtn.id = 'next-btn';
    this.nextBtn.innerHTML = '<i class="control fas fa-lg fa-forward"></i>';
    
    // Додаємо кнопки до контейнера
    controlsContainer.appendChild(this.pauseBtn);
    controlsContainer.appendChild(this.prevBtn);
    controlsContainer.appendChild(this.nextBtn);
    
    // Додаємо контейнер до каруселі
    this.container.appendChild(controlsContainer);
    
    // Оновлюємо іконку паузи
    this.#updatePauseButton();
  }

  #createIndicators() {
    // Перевіряємо, чи вже є контейнер індикаторів
    let indicatorsContainer = this.container.querySelector('#indicators-container');
    
    if (!indicatorsContainer) {
      // Створюємо контейнер індикаторів
      indicatorsContainer = document.createElement('ol');
      indicatorsContainer.id = 'indicators-container';
      indicatorsContainer.className = 'indicators-container';
      
      // Створюємо індикатори
      for (let i = 0; i < this.#SLIDES_COUNT; i++) {
        const indicator = document.createElement('li');
        indicator.className = 'indicator';
        indicator.setAttribute('data-slide-to', i.toString());
        indicatorsContainer.appendChild(indicator);
        this.indicators.push(indicator);
      }
      
      // Додаємо контейнер до каруселі
      this.container.appendChild(indicatorsContainer);
    } else {
      // Використовуємо існуючі індикатори
      this.indicators = Array.from(indicatorsContainer.querySelectorAll('.indicator'));
    }
  }

  #updatePauseButton() {
    if (this.pauseBtn) {
      const pauseIcon = this.pauseBtn.querySelector('#fa-pause-icon');
      const playIcon = this.pauseBtn.querySelector('#fa-play-icon');
      
      if (pauseIcon && playIcon) {
        if (this.isPlaying) {
          pauseIcon.style.opacity = '1';
          playIcon.style.opacity = '0';
        } else {
          pauseIcon.style.opacity = '0';
          playIcon.style.opacity = '1';
        }
      }
    }
  }

  #bindEvents() {
    // Обробники кнопок
    this.pauseBtn.addEventListener('click', () => this.pausePlay());
    this.prevBtn.addEventListener('click', () => this.prev());
    this.nextBtn.addEventListener('click', () => this.next());
    
    // Обробник індикаторів
    const indicatorsContainer = this.container.querySelector('#indicators-container');
    indicatorsContainer.addEventListener('click', (e) => this.#indicatorClick(e));
    
    // Обробник клавіатури
    document.addEventListener('keydown', (e) => this.#keydownHandler(e));
    
    // Обробники паузи при наведенні
    if (this.pauseOnHover) {
      this.container.addEventListener('mouseenter', () => this.pause());
      this.container.addEventListener('mouseleave', () => this.play());
    }
  }

  #keydownHandler(e) {
    const key = e.key || e.code;
    
    if (key === CODE_ARROW_LEFT || key === 'ArrowLeft') {
      this.prev();
    } else if (key === CODE_ARROW_RIGHT || key === 'ArrowRight') {
      this.next();
    } else if (key === CODE_SPACE || key === ' ' || key === 'Space') {
      this.pausePlay();
      e.preventDefault();
    }
  }
}

// Клас SwipeCarousel з підтримкою свайпів
export class SwipeCarousel extends Carousel {
  constructor(options) {
    super(options);
    this.swipeStartX = null;
    this.swipeEndX = null;
    this.swipeThreshold = options.swipeThreshold || DEFAULT_SETTINGS.swipeThreshold;
  }

  init() {
    super.init();
    this.#bindSwipeEvents();
  }

  #bindSwipeEvents() {
    // Touch-події для мобільних пристроїв
    this.container.addEventListener('touchstart', (e) => this.#swipeStartHandler(e));
    this.container.addEventListener('touchmove', (e) => this.#swipeMoveHandler(e));
    this.container.addEventListener('touchend', (e) => this.#swipeEndHandler(e));
    this.container.addEventListener('touchcancel', () => {
      this.swipeStartX = null;
      this.swipeEndX = null;
    });
    
    // Mouse-події для десктопних пристроїв
    this.container.addEventListener('mousedown', (e) => this.#swipeStartHandler(e));
    this.container.addEventListener('mousemove', (e) => this.#swipeMoveHandler(e));
    this.container.addEventListener('mouseup', (e) => this.#swipeEndHandler(e));
    this.container.addEventListener('mouseleave', () => {
      this.swipeStartX = null;
      this.swipeEndX = null;
    });
  }

  #swipeStartHandler(e) {
    this.swipeStartX = null;
    this.swipeEndX = null;
    
    if (e.type === 'touchstart') {
      if (e.touches && e.touches.length > 0) {
        this.swipeStartX = e.touches[0].pageX;
      } else if (e.changedTouches && e.changedTouches.length > 0) {
        this.swipeStartX = e.changedTouches[0].pageX;
      }
    } else if (e.type === 'mousedown') {
      this.swipeStartX = e.clientX;
      e.preventDefault();
    }
  }

  #swipeEndHandler(e) {
    if (this.swipeStartX === null) return;
    
    if (e.type === 'touchend') {
      if (e.changedTouches && e.changedTouches.length > 0) {
        this.swipeEndX = e.changedTouches[0].pageX;
      }
    } else if (e.type === 'mouseup') {
      this.swipeEndX = e.clientX;
    }
    
    if (this.swipeEndX !== null && this.swipeStartX !== null) {
      const swipeDistance = this.swipeEndX - this.swipeStartX;
      
      if (swipeDistance > this.swipeThreshold) {
        this.prev();
      } else if (swipeDistance < -this.swipeThreshold) {
        this.next();
      }
    }
    
    this.swipeStartX = null;
    this.swipeEndX = null;
  }

  #swipeMoveHandler(e) {
    if (this.swipeStartX !== null) {
      if (e.type === 'touchmove') {
        e.preventDefault();
      } else if (e.type === 'mousemove') {
        e.preventDefault();
      }
    }
  }
} 