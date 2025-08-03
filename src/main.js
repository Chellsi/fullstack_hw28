// Карусельний слайдер з використанням чистого JavaScript

// Отримання DOM елементів
const container = document.querySelector('#carousel');
const slidesContainer = container.querySelector('#slides-container');
const slides = container.querySelectorAll('.slide');
const indicatorsContainer = container.querySelector('#indicators-container');
const indicators = container.querySelectorAll('.indicator');
const pauseBtn = container.querySelector('#pause-btn');
const prevBtn = container.querySelector('#prev-btn');
const nextBtn = container.querySelector('#next-btn');

// Константи (ОБОВ'ЯЗКОВІ)
const SLIDES_COUNT = slides.length;
const CODE_ARROW_LEFT = 'ArrowLeft';
const CODE_ARROW_RIGHT = 'ArrowRight';
const CODE_SPACE = ' ';
const FA_PAUSE = '<i class="fas fa-pause"></i>';
const FA_PLAY = '<i class="fas fa-play"></i>';
const TIMER_INTERVAL = 2000;

// Змінні (ОБОВ'ЯЗКОВІ)
let currentSlide = 0;
let isPlaying = true;
let timerId = null;
let swipeStartX = null;
let swipeEndX = null;

// Основні функції карусельного слайдера
function goToSlide(slideIndex) {
    // Видаляємо активний клас з поточного слайду та індикатора
    slides[currentSlide].classList.remove('active');
    indicators[currentSlide].classList.remove('active');
    
    // Розраховуємо новий індекс слайду (циклічно)
    currentSlide = (slideIndex + SLIDES_COUNT) % SLIDES_COUNT;
    
    // Додаємо активний клас до нового слайду та індикатора
    slides[currentSlide].classList.add('active');
    indicators[currentSlide].classList.add('active');
}

function nextSlide() {
    goToSlide(currentSlide + 1);
}

function prevSlide() {
    goToSlide(currentSlide - 1);
}

function startAutoPlay() {
    if (timerId) clearInterval(timerId);
    timerId = setInterval(nextSlide, TIMER_INTERVAL);
    pauseBtn.innerHTML = FA_PAUSE;
    isPlaying = true;
}

function stopAutoPlay() {
    if (timerId) {
        clearInterval(timerId);
        timerId = null;
    }
    pauseBtn.innerHTML = FA_PLAY;
    isPlaying = false;
}

// Обробники подій (ОБОВ'ЯЗКОВІ НАЗВИ)
function pausePlayHandler() {
    if (isPlaying) {
        stopAutoPlay();
    } else {
        startAutoPlay();
    }
}

function nextHandler() {
    stopAutoPlay();
    nextSlide();
}

function prevHandler() {
    stopAutoPlay();
    prevSlide();
}

function indicatorClickHandler(event) {
    const target = event.target;
    if (target && target.classList.contains('indicator')) {
        stopAutoPlay();
        const slideIndex = parseInt(target.getAttribute('data-slide-to'));
        goToSlide(slideIndex);
    }
}

function keydownHandler(event) {
    // Перевіряємо і event.key, і event.code для кращої сумісності
    const key = event.key || event.code;
    
    if (key === CODE_ARROW_LEFT || key === 'ArrowLeft') {
        prevHandler();
    } else if (key === CODE_ARROW_RIGHT || key === 'ArrowRight') {
        nextHandler();
    } else if (key === CODE_SPACE || key === ' ' || key === 'Space') {
        pausePlayHandler();
        event.preventDefault(); // Запобігаємо прокрутці сторінки
    }
}

// Обробники свайпів (ОБОВ'ЯЗКОВІ НАЗВИ)
function swipeStartHandler(event) {
    swipeStartX = null;
    swipeEndX = null;
    
    // Обробка для touch-подій
    if (event.type === 'touchstart') {
        // Перевіряємо наявність touches та його довжину
        if (event.touches && event.touches.length > 0) {
            swipeStartX = event.touches[0].clientX;
        }
        // Також перевіряємо changedTouches для кращої сумісності
        else if (event.changedTouches && event.changedTouches.length > 0) {
            swipeStartX = event.changedTouches[0].clientX;
        }
    }
    // Обробка для mouse-подій
    else if (event.type === 'mousedown') {
        swipeStartX = event.clientX;
        event.preventDefault();
    }
}

function swipeEndHandler(event) {
    if (swipeStartX === null) return;
    
    // Обробка для touch-подій
    if (event.type === 'touchend') {
        // Перевіряємо наявність changedTouches та його довжину
        if (event.changedTouches && event.changedTouches.length > 0) {
            swipeEndX = event.changedTouches[0].clientX;
        }
    }
    // Обробка для mouse-подій
    else if (event.type === 'mouseup') {
        swipeEndX = event.clientX;
    }
    
    if (swipeEndX !== null && swipeStartX !== null) {
        const swipeDistance = swipeEndX - swipeStartX;
        
        // Свайп вправо (>100px): перехід до попереднього слайду
        if (swipeDistance > 100) {
            prevHandler();
        }
        // Свайп вліво (<-100px): перехід до наступного слайду
        else if (swipeDistance < -100) {
            nextHandler();
        }
    }
    
    // Скидаємо значення
    swipeStartX = null;
    swipeEndX = null;
}

function swipeMoveHandler(event) {
    if (swipeStartX !== null) {
        // Запобігаємо скролу на touch-пристроях
        if (event.type === 'touchmove') {
            event.preventDefault();
        }
        // Обробка для mouse-подій
        else if (event.type === 'mousemove') {
            event.preventDefault();
        }
    }
}

// Ініціалізація карусельного слайдера
function init() {
    // Навішування обробників на кнопки керування
    pauseBtn.addEventListener('click', pausePlayHandler);
    nextBtn.addEventListener('click', nextHandler);
    prevBtn.addEventListener('click', prevHandler);
    
    // Навішування обробника на індикатори (з делегуванням)
    indicatorsContainer.addEventListener('click', indicatorClickHandler);
    
    // Навішування обробника клавіатури на документ
    document.addEventListener('keydown', keydownHandler);
    
    // Навішування обробників свайпів на контейнер слайдів
    // Touch-події для мобільних пристроїв
    slidesContainer.addEventListener('touchstart', swipeStartHandler);
    slidesContainer.addEventListener('touchmove', swipeMoveHandler);
    slidesContainer.addEventListener('touchend', swipeEndHandler);
    slidesContainer.addEventListener('touchcancel', () => {
        swipeStartX = null;
        swipeEndX = null;
    });
    
    // Mouse-події для десктопних пристроїв
    slidesContainer.addEventListener('mousedown', swipeStartHandler);
    slidesContainer.addEventListener('mousemove', swipeMoveHandler);
    slidesContainer.addEventListener('mouseup', swipeEndHandler);
    slidesContainer.addEventListener('mouseleave', () => {
        swipeStartX = null;
        swipeEndX = null;
    });
    
    // Запуск автоматичного перемикання
    startAutoPlay();
}

// Запуск ініціалізації після завантаження DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}