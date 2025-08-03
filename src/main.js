// Імпорт класів каруселі
import SwipeCarousel from './carousel/index.js';

// Ініціалізація каруселі
function init() {
    const carousel = new SwipeCarousel({
        containerId: '#carousel',
        slideId: '.slide',
        interval: 2000,
        isPlaying: true,
        pauseOnHover: false,
        swipeThreshold: 100
    });
    
    carousel.init();
}

// Запуск ініціалізації після завантаження DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}