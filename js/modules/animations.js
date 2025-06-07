/* ========================================
   BIBLIOTECA CIVIL - ANIMACIONES AVANZADAS
   ======================================== */

/* ========================================
   CONTADOR ANIMADO PARA ESTADÍSTICAS
   ======================================== */

function animateCounters() {
    const counters = document.querySelectorAll('.stat-number[data-target]');
    
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = 2000; // 2 segundos
        const increment = target / (duration / 16); // 60fps
        let current = 0;
        
        const updateCounter = () => {
            if (current < target) {
                current += increment;
                counter.textContent = Math.floor(current);
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target;
                // Agregar efecto de "pop" al finalizar
                counter.style.transform = 'scale(1.2)';
                setTimeout(() => {
                    counter.style.transform = 'scale(1)';
                }, 200);
            }
        };
        
        // Agregar un pequeño delay aleatorio para efecto escalonado
        setTimeout(updateCounter, Math.random() * 500);
    });
}

/* ========================================
   EFECTOS DE ENTRADA PARA ELEMENTOS
   ======================================== */

function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                
                // Animar contadores cuando entren en vista
                if (entry.target.classList.contains('stats-section')) {
                    animateCounters();
                }
                
                // Animar tarjetas de forma escalonada
                if (entry.target.classList.contains('recursos-grid')) {
                    animateCards();
                }
            }
        });
    }, observerOptions);
    
    // Observar elementos con animación de scroll
    document.querySelectorAll('.scroll-reveal').forEach(el => {
        observer.observe(el);
    });
}

/* ========================================
   ANIMACIONES PARA TARJETAS
   ======================================== */

function animateCards() {
    const cards = document.querySelectorAll('.resource-card');
    
    cards.forEach((card, index) => {
        // Reset animation
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100); // Delay escalonado
    });
}

/* ========================================
   EFECTOS DE PARTÍCULAS
   ======================================== */

function createParticleEffect(element, particleCount = 10) {
    const rect = element.getBoundingClientRect();
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.cssText = `
            position: fixed;
            left: ${rect.left + rect.width / 2}px;
            top: ${rect.top + rect.height / 2}px;
            width: 4px;
            height: 4px;
            background: linear-gradient(45deg, #dc2626, #f59e0b);
            border-radius: 50%;
            pointer-events: none;
            z-index: 10000;
        `;
        
        document.body.appendChild(particle);
        
        // Animar partícula
        const angle = (Math.PI * 2 * i) / particleCount;
        const velocity = 100 + Math.random() * 50;
        const life = 1000 + Math.random() * 500;
        
        particle.animate([
            {
                transform: 'translate(0, 0) scale(1)',
                opacity: 1
            },
            {
                transform: `translate(${Math.cos(angle) * velocity}px, ${Math.sin(angle) * velocity}px) scale(0)`,
                opacity: 0
            }
        ], {
            duration: life,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        }).onfinish = () => {
            particle.remove();
        };
    }
}

/* ========================================
   EFECTOS PARA BOTONES
   ======================================== */

function addButtonEffects() {
    // Efecto de ondas para botones
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-primary') || 
            e.target.classList.contains('btn-secondary') ||
            e.target.closest('.btn-primary') ||
            e.target.closest('.btn-secondary')) {
            
            const button = e.target.classList.contains('btn-primary') || 
                          e.target.classList.contains('btn-secondary') ? 
                          e.target : e.target.closest('button');
            
            createRippleEffect(button, e);
            createParticleEffect(button, 5);
        }
    });
}

function createRippleEffect(button, event) {
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    const ripple = document.createElement('span');
    ripple.style.cssText = `
        position: absolute;
        left: ${x}px;
        top: ${y}px;
        width: ${size}px;
        height: ${size}px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        transform: scale(0);
        pointer-events: none;
        z-index: 1;
    `;
    
    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    button.appendChild(ripple);
    
    ripple.animate([
        { transform: 'scale(0)', opacity: 1 },
        { transform: 'scale(2)', opacity: 0 }
    ], {
        duration: 600,
        easing: 'ease-out'
    }).onfinish = () => {
        ripple.remove();
    };
}

/* ========================================
   EFECTOS DE CARGA
   ======================================== */

function showLoadingEffect(element, duration = 1000) {
    element.classList.add('loading');
    
    setTimeout(() => {
        element.classList.remove('loading');
    }, duration);
}

/* ========================================
   ANIMACIONES DE TEXTO
   ======================================== */

function typeWriterEffect(element, text, speed = 50) {
    element.textContent = '';
    let i = 0;
    
    const timer = setInterval(() => {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
        } else {
            clearInterval(timer);
        }
    }, speed);
}

function glowTextEffect(element) {
    element.style.animation = 'textGlow 2s ease-in-out infinite alternate';
}

/* ========================================
   EFECTOS DE HOVER MEJORADOS
   ======================================== */

function addAdvancedHoverEffects() {
    // Efecto de seguimiento del mouse para tarjetas
    document.querySelectorAll('.resource-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            card.style.transform = `
                translateY(-8px) 
                scale(1.02) 
                rotateX(${rotateX}deg) 
                rotateY(${rotateY}deg)
                perspective(1000px)
            `;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1) rotateX(0) rotateY(0)';
        });
    });
}

/* ========================================
   ANIMACIONES DE BÚSQUEDA
   ======================================== */

function animateSearchResults() {
    const container = document.getElementById('recursos-container');
    if (!container) return;
    
    // Efecto de fade out
    container.style.opacity = '0.5';
    container.style.transform = 'scale(0.95)';
    
    setTimeout(() => {
        // Fade in con nuevos resultados
        container.style.transition = 'all 0.5s ease';
        container.style.opacity = '1';
        container.style.transform = 'scale(1)';
        
        // Animar tarjetas individuales
        animateCards();
    }, 300);
}

/* ========================================
   EFECTOS DE SCROLL PARALELO
   ======================================== */

function initParallaxEffects() {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('[data-parallax]');
        
        parallaxElements.forEach(element => {
            const speed = element.dataset.parallax || 0.5;
            const yPos = -(scrolled * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });
        
        // Efecto parallax para el hero
        const hero = document.querySelector('.hero');
        if (hero) {
            const heroOffset = scrolled * 0.3;
            hero.style.transform = `translateY(${heroOffset}px)`;
        }
    });
}

/* ========================================
   EFECTOS DE ENTRADA PARA MODALES
   ======================================== */

function animateModalOpen(modal) {
    modal.style.display = 'flex';
    modal.style.opacity = '0';
    
    const content = modal.querySelector('.modal-content');
    content.style.transform = 'scale(0.7) translateY(-50px)';
    
    requestAnimationFrame(() => {
        modal.style.transition = 'opacity 0.3s ease';
        modal.style.opacity = '1';
        
        content.style.transition = 'transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        content.style.transform = 'scale(1) translateY(0)';
    });
}

function animateModalClose(modal) {
    const content = modal.querySelector('.modal-content');
    
    modal.style.transition = 'opacity 0.3s ease';
    modal.style.opacity = '0';
    
    content.style.transition = 'transform 0.3s ease';
    content.style.transform = 'scale(0.7) translateY(-50px)';
    
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

/* ========================================
   EFECTOS DE MOUSE SEGUIMIENTO
   ======================================== */

function initMouseFollowEffects() {
    let mouseX = 0;
    let mouseY = 0;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Efecto de seguimiento en elementos especiales
        const followers = document.querySelectorAll('.mouse-follower');
        followers.forEach(follower => {
            const rect = follower.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            const deltaX = (mouseX - centerX) * 0.1;
            const deltaY = (mouseY - centerY) * 0.1;
            
            follower.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        });
    });
}

/* ========================================
   EFECTOS DE TEMA DINÁMICO
   ======================================== */

function animateThemeTransition() {
    document.body.style.transition = 'all 0.5s ease';
    
    // Crear efecto de onda para cambio de tema
    const wave = document.createElement('div');
    wave.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        background: radial-gradient(circle, var(--primary-color) 0%, transparent 70%);
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        transform: translate(-50%, -50%);
    `;
    
    document.body.appendChild(wave);
    
    wave.animate([
        { width: '0px', height: '0px', opacity: 0.8 },
        { width: '3000px', height: '3000px', opacity: 0 }
    ], {
        duration: 800,
        easing: 'ease-out'
    }).onfinish = () => {
        wave.remove();
    };
}

/* ========================================
   EFECTOS DE NOTIFICACIONES MEJORADAS
   ======================================== */

function createFloatingNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `floating-notification ${type}`;
    notification.innerHTML = `
        <div class="notification-icon">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
        </div>
        <div class="notification-message">${message}</div>
        <div class="notification-progress"></div>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: -100px;
        right: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.75rem;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        gap: 0.75rem;
        z-index: 10000;
        max-width: 400px;
        overflow: hidden;
    `;
    
    document.body.appendChild(notification);
    
    // Animar entrada
    notification.animate([
        { transform: 'translateY(-100px)', opacity: 0 },
        { transform: 'translateY(0)', opacity: 1 }
    ], {
        duration: 500,
        easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
    });
    
    // Barra de progreso
    const progress = notification.querySelector('.notification-progress');
    progress.style.cssText = `
        position: absolute;
        bottom: 0;
        left: 0;
        height: 3px;
        background: rgba(255,255,255,0.3);
        animation: notificationProgress 3s linear forwards;
    `;
    
    // Auto remover
    setTimeout(() => {
        notification.animate([
            { transform: 'translateY(0)', opacity: 1 },
            { transform: 'translateY(-100px)', opacity: 0 }
        ], {
            duration: 300,
            easing: 'ease-in'
        }).onfinish = () => {
            notification.remove();
        };
    }, 3000);
}

function getNotificationIcon(type) {
    const icons = {
        'success': 'check-circle',
        'error': 'exclamation-triangle',
        'warning': 'exclamation-circle',
        'info': 'info-circle'
    };
    return icons[type] || 'info-circle';
}

function getNotificationColor(type) {
    const colors = {
        'success': 'linear-gradient(135deg, #059669, #10b981)',
        'error': 'linear-gradient(135deg, #dc2626, #ef4444)',
        'warning': 'linear-gradient(135deg, #d97706, #f59e0b)',
        'info': 'linear-gradient(135deg, #0284c7, #0ea5e9)'
    };
    return colors[type] || colors.info;
}

/* ========================================
   EFECTOS DE CARGA GLOBALES
   ======================================== */

function showGlobalLoader() {
    const loader = document.createElement('div');
    loader.id = 'global-loader';
    loader.innerHTML = `
        <div class="global-loader-content">
            <div class="spinner"></div>
            <p>Procesando...</p>
        </div>
    `;
    
    loader.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        backdrop-filter: blur(5px);
    `;
    
    document.body.appendChild(loader);
    
    // Agregar estilos del spinner
    const style = document.createElement('style');
    style.textContent = `
        .global-loader-content {
            text-align: center;
            color: white;
        }
        .spinner {
            width: 50px;
            height: 50px;
            border: 3px solid rgba(255,255,255,0.3);
            border-top: 3px solid white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 1rem;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        @keyframes notificationProgress {
            0% { width: 100%; }
            100% { width: 0%; }
        }
    `;
    document.head.appendChild(style);
}

function hideGlobalLoader() {
    const loader = document.getElementById('global-loader');
    if (loader) {
        loader.animate([
            { opacity: 1 },
            { opacity: 0 }
        ], {
            duration: 300,
            easing: 'ease-out'
        }).onfinish = () => {
            loader.remove();
        };
    }
}

/* ========================================
   INICIALIZACIÓN DE ANIMACIONES
   ======================================== */

function initAnimations() {
    try {
        initScrollAnimations();
        addButtonEffects();
        addAdvancedHoverEffects();
        initParallaxEffects();
        initMouseFollowEffects();
        
        console.log('✨ Animaciones avanzadas inicializadas correctamente');
    } catch (error) {
        console.error('❌ Error al inicializar animaciones:', error);
    }
}

/* ========================================
   UTILIDADES DE ANIMACIÓN
   ======================================== */

function fadeIn(element, duration = 300) {
    element.style.opacity = '0';
    element.style.display = 'block';
    
    element.animate([
        { opacity: 0 },
        { opacity: 1 }
    ], {
        duration,
        easing: 'ease-out',
        fill: 'forwards'
    });
}

function fadeOut(element, duration = 300) {
    element.animate([
        { opacity: 1 },
        { opacity: 0 }
    ], {
        duration,
        easing: 'ease-in',
        fill: 'forwards'
    }).onfinish = () => {
        element.style.display = 'none';
    };
}

function slideUp(element, duration = 300) {
    const height = element.offsetHeight;
    
    element.animate([
        { height: `${height}px`, opacity: 1 },
        { height: '0px', opacity: 0 }
    ], {
        duration,
        easing: 'ease-in',
        fill: 'forwards'
    }).onfinish = () => {
        element.style.display = 'none';
    };
}

function slideDown(element, duration = 300) {
    element.style.display = 'block';
    const height = element.scrollHeight;
    element.style.height = '0px';
    
    element.animate([
        { height: '0px', opacity: 0 },
        { height: `${height}px`, opacity: 1 }
    ], {
        duration,
        easing: 'ease-out',
        fill: 'forwards'
    });
}

/* ========================================
   EXPORTAR FUNCIONES
   ======================================== */

window.BibliotecaAnimations = {
    // Animaciones principales
    animateCounters,
    animateCards,
    animateSearchResults,
    
    // Efectos de partículas y ondas
    createParticleEffect,
    createRippleEffect,
    
    // Efectos de carga
    showLoadingEffect,
    showGlobalLoader,
    hideGlobalLoader,
    
    // Animaciones de texto
    typeWriterEffect,
    glowTextEffect,
    
    // Efectos de modal
    animateModalOpen,
    animateModalClose,
    
    // Efectos de tema
    animateThemeTransition,
    
    // Notificaciones
    createFloatingNotification,
    
    // Utilidades
    fadeIn,
    fadeOut,
    slideUp,
    slideDown,
    
    // Inicialización
    initAnimations
};

// Auto-inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initAnimations);

// Inicializar cuando la página esté completamente cargada
window.addEventListener('load', () => {
    // Ocultar loader de página después de un pequeño delay
    setTimeout(() => {
        const pageLoader = document.getElementById('page-loader');
        if (pageLoader) {
            fadeOut(pageLoader, 500);
        }
    }, 1000);
});

console.log('🚀 Módulo de animaciones cargado correctamente');