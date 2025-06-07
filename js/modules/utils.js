/* ========================================
   BIBLIOTECA CIVIL - FUNCIONES UTILITARIAS
   ======================================== */

/* ========================================
   FUNCIONES DE FORMATO Y PRESENTACIÓN
   ======================================== */

// Formatear fecha para mostrar
function formatearFecha(fecha, formato = 'completa') {
    if (!fecha) return 'No disponible';
    
    const fechaObj = new Date(fecha);
    if (isNaN(fechaObj.getTime())) return 'Fecha inválida';
    
    const opciones = {
        'completa': { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        },
        'corta': { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        },
        'numerica': { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit' 
        }
    };
    
    return fechaObj.toLocaleDateString('es-ES', opciones[formato] || opciones.completa);
}

// Formatear texto para mostrar (capitalizar, truncar, etc.)
function formatearTexto(texto, opciones = {}) {
    if (!texto) return '';
    
    let textoFormateado = texto.toString();
    
    // Capitalizar primera letra
    if (opciones.capitalizar !== false) {
        textoFormateado = textoFormateado.charAt(0).toUpperCase() + textoFormateado.slice(1);
    }
    
    // Truncar texto
    if (opciones.maxLength && textoFormateado.length > opciones.maxLength) {
        textoFormateado = textoFormateado.substring(0, opciones.maxLength) + '...';
    }
    
    // Limpiar espacios extra
    if (opciones.limpiarEspacios !== false) {
        textoFormateado = textoFormateado.replace(/\s+/g, ' ').trim();
    }
    
    return textoFormateado;
}

// Formatear nombre de autor
function formatearAutor(autor) {
    if (!autor) return 'Autor desconocido';
    
    // Si tiene comas, probablemente está en formato "Apellido, Nombre"
    if (autor.includes(',')) {
        const partes = autor.split(',').map(parte => parte.trim());
        if (partes.length >= 2) {
            return `${partes[1]} ${partes[0]}`;
        }
    }
    
    return formatearTexto(autor, { capitalizar: true });
}

// Generar texto de estado con icono
function formatearEstado(estado) {
    const estados = {
        'disponible': { texto: 'Disponible', icono: 'fas fa-check-circle', clase: 'status-disponible' },
        'prestado': { texto: 'Prestado', icono: 'fas fa-clock', clase: 'status-prestado' },
        'mantenimiento': { texto: 'En Mantenimiento', icono: 'fas fa-tools', clase: 'status-mantenimiento' }
    };
    
    const estadoInfo = estados[estado] || estados.disponible;
    return `<span class="resource-status ${estadoInfo.clase}">
        <i class="${estadoInfo.icono}"></i> ${estadoInfo.texto}
    </span>`;
}

// Generar tipo de recurso con icono
function formatearTipo(tipo) {
    const tipos = {
        'libro': { texto: 'Libro', icono: 'fas fa-book' },
        'tesis': { texto: 'Tesis', icono: 'fas fa-graduation-cap' },
        'proyecto': { texto: 'Proyecto', icono: 'fas fa-project-diagram' },
        'revista': { texto: 'Revista', icono: 'fas fa-newspaper' },
        'articulo': { texto: 'Artículo', icono: 'fas fa-file-alt' }
    };
    
    const tipoInfo = tipos[tipo] || tipos.libro;
    return `<span class="resource-type type-${tipo}">
        <i class="${tipoInfo.icono}"></i> ${tipoInfo.texto}
    </span>`;
}

/* ========================================
   FUNCIONES DE VALIDACIÓN
   ======================================== */

// Validar email
function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Validar ISBN
function validarISBN(isbn) {
    if (!isbn) return true; // ISBN es opcional
    
    // Limpiar ISBN (remover guiones y espacios)
    const isbnLimpio = isbn.replace(/[-\s]/g, '');
    
    // ISBN-10 o ISBN-13
    if (isbnLimpio.length === 10) {
        return validarISBN10(isbnLimpio);
    } else if (isbnLimpio.length === 13) {
        return validarISBN13(isbnLimpio);
    }
    
    return false;
}

function validarISBN10(isbn) {
    let suma = 0;
    for (let i = 0; i < 9; i++) {
        if (!/^\d$/.test(isbn[i])) return false;
        suma += parseInt(isbn[i]) * (10 - i);
    }
    
    const ultimoCaracter = isbn[9];
    if (ultimoCaracter === 'X') {
        suma += 10;
    } else if (/^\d$/.test(ultimoCaracter)) {
        suma += parseInt(ultimoCaracter);
    } else {
        return false;
    }
    
    return suma % 11 === 0;
}

function validarISBN13(isbn) {
    let suma = 0;
    for (let i = 0; i < 13; i++) {
        if (!/^\d$/.test(isbn[i])) return false;
        suma += parseInt(isbn[i]) * (i % 2 === 0 ? 1 : 3);
    }
    
    return suma % 10 === 0;
}

// Validar año
function validarAño(año) {
    const añoNum = parseInt(año);
    const añoActual = new Date().getFullYear();
    return !isNaN(añoNum) && añoNum >= 1000 && añoNum <= añoActual + 1;
}

// Validar formulario de recurso
function validarFormularioRecurso(datos) {
    const errores = [];
    
    if (!datos.titulo || datos.titulo.trim().length < 2) {
        errores.push('El título debe tener al menos 2 caracteres');
    }
    
    if (!datos.autor || datos.autor.trim().length < 2) {
        errores.push('El autor debe tener al menos 2 caracteres');
    }
    
    if (!validarAño(datos.año)) {
        errores.push('El año debe ser válido');
    }
    
    if (datos.isbn && !validarISBN(datos.isbn)) {
        errores.push('El ISBN no tiene un formato válido');
    }
    
    if (!datos.tipo || !window.BibliotecaDB.configuracion.tiposRecursos.includes(datos.tipo)) {
        errores.push('Debe seleccionar un tipo de recurso válido');
    }
    
    if (!datos.materia || !window.BibliotecaDB.configuracion.materias.includes(datos.materia)) {
        errores.push('Debe seleccionar una materia válida');
    }
    
    return {
        valido: errores.length === 0,
        errores
    };
}

/* ========================================
   FUNCIONES DE MANIPULACIÓN DEL DOM
   ======================================== */

// Mostrar notificación
function mostrarNotificacion(mensaje, tipo = 'info', duracion = 3000) {
    // Crear elemento de notificación
    const notificacion = document.createElement('div');
    notificacion.className = `notificacion notificacion-${tipo}`;
    notificacion.innerHTML = `
        <div class="notificacion-content">
            <i class="fas fa-${obtenerIconoNotificacion(tipo)}"></i>
            <span>${mensaje}</span>
            <button class="notificacion-close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Agregar estilos si no existen
    if (!document.querySelector('#notificaciones-styles')) {
        const estilos = document.createElement('style');
        estilos.id = 'notificaciones-styles';
        estilos.textContent = `
            .notificacion {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                padding: 1rem;
                border-radius: 0.5rem;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                animation: slideInRight 0.3s ease;
                max-width: 400px;
                margin-bottom: 10px;
            }
            .notificacion-info { background: #3b82f6; color: white; }
            .notificacion-success { background: #059669; color: white; }
            .notificacion-warning { background: #d97706; color: white; }
            .notificacion-error { background: #dc2626; color: white; }
            .notificacion-content {
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            .notificacion-close {
                background: none;
                border: none;
                color: inherit;
                cursor: pointer;
                margin-left: auto;
            }
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(estilos);
    }
    
    // Agregar al DOM
    document.body.appendChild(notificacion);
    
    // Auto-remover después de la duración especificada
    if (duracion > 0) {
        setTimeout(() => {
            if (notificacion.parentElement) {
                notificacion.remove();
            }
        }, duracion);
    }
}

function obtenerIconoNotificacion(tipo) {
    const iconos = {
        'info': 'info-circle',
        'success': 'check-circle',
        'warning': 'exclamation-triangle',
        'error': 'times-circle'
    };
    return iconos[tipo] || 'info-circle';
}

// Mostrar modal de confirmación
function mostrarConfirmacion(mensaje, onConfirmar, onCancelar = null) {
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 400px;">
            <div class="modal-header">
                <h3><i class="fas fa-question-circle"></i> Confirmación</h3>
            </div>
            <div style="padding: 1.5rem;">
                <p style="margin-bottom: 1.5rem;">${mensaje}</p>
                <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                    <button class="btn-secondary" onclick="cerrarConfirmacion(false)">
                        Cancelar
                    </button>
                    <button class="btn-primary" onclick="cerrarConfirmacion(true)">
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Función para cerrar confirmación
    window.cerrarConfirmacion = function(confirmado) {
        modal.remove();
        if (confirmado && onConfirmar) {
            onConfirmar();
        } else if (!confirmado && onCancelar) {
            onCancelar();
        }
        delete window.cerrarConfirmacion;
    };
    
    document.body.appendChild(modal);
}

// Mostrar/ocultar indicador de carga
function mostrarCarga(mostrar = true, elemento = null) {
    if (mostrar) {
        const carga = document.createElement('div');
        carga.id = 'indicador-carga';
        carga.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
            ">
                <div style="
                    background: white;
                    padding: 2rem;
                    border-radius: 0.5rem;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                ">
                    <div style="
                        width: 20px;
                        height: 20px;
                        border: 2px solid #3b82f6;
                        border-radius: 50%;
                        border-top-color: transparent;
                        animation: spin 1s linear infinite;
                    "></div>
                    <span>Cargando...</span>
                </div>
            </div>
            <style>
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            </style>
        `;
        document.body.appendChild(carga);
    } else {
        const carga = document.getElementById('indicador-carga');
        if (carga) {
            carga.remove();
        }
    }
}

/* ========================================
   FUNCIONES DE MANEJO DE ERRORES
   ======================================== */

// Manejar errores globalmente
function manejarError(error, contexto = '') {
    console.error(`Error en ${contexto}:`, error);
    
    let mensaje = 'Ha ocurrido un error inesperado';
    
    if (error.message) {
        mensaje = error.message;
    } else if (typeof error === 'string') {
        mensaje = error;
    }
    
    mostrarNotificacion(mensaje, 'error');
}

// Ejecutar función con manejo de errores
function ejecutarConManejoErrores(funcion, contexto = '') {
    try {
        return funcion();
    } catch (error) {
        manejarError(error, contexto);
        return null;
    }
}

/* ========================================
   FUNCIONES DE UTILIDAD GENERAL
   ======================================== */

// Debounce para búsquedas
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle para scroll
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Generar ID único
function generarId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Copiar texto al portapapeles
function copiarAlPortapapeles(texto) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(texto).then(() => {
            mostrarNotificacion('Texto copiado al portapapeles', 'success');
        }).catch(() => {
            mostrarNotificacion('No se pudo copiar el texto', 'error');
        });
    } else {
        // Fallback para navegadores antiguos
        const textArea = document.createElement('textarea');
        textArea.value = texto;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            mostrarNotificacion('Texto copiado al portapapeles', 'success');
        } catch (err) {
            mostrarNotificacion('No se pudo copiar el texto', 'error');
        }
        document.body.removeChild(textArea);
    }
}

// Detectar dispositivo móvil
function esMobile() {
    return window.innerWidth <= 768;
}

// Smooth scroll a elemento
function scrollAElemento(elementoId) {
    const elemento = document.getElementById(elementoId);
    if (elemento) {
        elemento.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
}

/* ========================================
   EXPORTAR FUNCIONES
   ======================================== */

window.BibliotecaUtils = {
    // Formato y presentación
    formatearFecha,
    formatearTexto,
    formatearAutor,
    formatearEstado,
    formatearTipo,
    
    // Validación
    validarEmail,
    validarISBN,
    validarAño,
    validarFormularioRecurso,
    
    // DOM y UI
    mostrarNotificacion,
    mostrarConfirmacion,
    mostrarCarga,
    
    // Manejo de errores
    manejarError,
    ejecutarConManejoErrores,
    
    // Utilidades generales
    debounce,
    throttle,
    generarId,
    copiarAlPortapapeles,
    esMobile,
    scrollAElemento
};