/* ========================================
   BIBLIOTECA CIVIL - CONTROLADOR PRINCIPAL
   ======================================== */

// Variables globales
let recursosActuales = [];
let vistaActual = 'grid';
let filtrosActivos = {};

/* ========================================
   INICIALIZACIÓN
   ======================================== */

document.addEventListener('DOMContentLoaded', function() {
    inicializarSistema();
    configurarEventListeners();
    cargarRecursos();
    actualizarEstadisticas();
});

function inicializarSistema() {
    console.log('🚀 Iniciando Sistema Biblioteca Civil...');
    
    // Verificar módulos requeridos
    if (!window.BibliotecaDB || !window.BibliotecaBusqueda || !window.BibliotecaUtils) {
        console.error('❌ Error: Faltan módulos requeridos');
        return;
    }
    
    // Configurar tema inicial
    const temaGuardado = localStorage.getItem('biblioteca-tema') || 'light';
    document.documentElement.setAttribute('data-theme', temaGuardado);
    actualizarIconoTema(temaGuardado);
    
    console.log('✅ Sistema inicializado correctamente');
}

function configurarEventListeners() {
    // Búsqueda en tiempo real (con debounce)
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', 
            window.BibliotecaUtils.debounce(buscarRecursos, 300)
        );
    }
    
    // Filtros
    const filtros = ['filter-tipo', 'filter-año', 'filter-materia', 'filter-estado'];
    filtros.forEach(filtroId => {
        const elemento = document.getElementById(filtroId);
        if (elemento) {
            elemento.addEventListener('change', buscarRecursos);
        }
    });
    
    // Ordenamiento
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', ordenarRecursos);
    }
    
    // Cerrar modales al hacer clic fuera
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            cerrarModales();
        }
    });
    
    // Navegación suave
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            window.BibliotecaUtils.scrollAElemento(targetId);
            
            // Actualizar navegación activa
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

/* ========================================
   GESTIÓN DE RECURSOS
   ======================================== */

function cargarRecursos() {
    try {
        recursosActuales = window.BibliotecaDB.obtenerTodosRecursos();
        mostrarRecursos(recursosActuales);
        actualizarContadorResultados(recursosActuales.length);
    } catch (error) {
        window.BibliotecaUtils.manejarError(error, 'cargar recursos');
    }
}

function mostrarRecursos(recursos) {
    const container = document.getElementById('recursos-container');
    const noResults = document.getElementById('no-results');
    
    if (!container) return;
    
    if (recursos.length === 0) {
        container.style.display = 'none';
        if (noResults) noResults.style.display = 'block';
        return;
    }
    
    container.style.display = vistaActual === 'grid' ? 'grid' : 'flex';
    if (noResults) noResults.style.display = 'none';
    
    container.innerHTML = recursos.map(recurso => crearTarjetaRecurso(recurso)).join('');
}

function crearTarjetaRecurso(recurso) {
    return `
        <div class="resource-card" data-id="${recurso.id}">
            <div class="card-header">
                ${window.BibliotecaUtils.formatearTipo(recurso.tipo)}
                ${window.BibliotecaUtils.formatearEstado(recurso.estado)}
            </div>
            
            <div class="card-content">
                <h3 class="resource-title">${window.BibliotecaUtils.formatearTexto(recurso.titulo)}</h3>
                
                <div class="resource-author">
                    <i class="fas fa-user"></i>
                    ${window.BibliotecaUtils.formatearAutor(recurso.autor)}
                </div>
                
                <div class="resource-meta">
                    <div class="meta-item">
                        <i class="fas fa-calendar"></i>
                        ${recurso.año}
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-tag"></i>
                        ${window.BibliotecaUtils.formatearTexto(recurso.materia)}
                    </div>
                    ${recurso.isbn ? `
                        <div class="meta-item">
                            <i class="fas fa-barcode"></i>
                            ${recurso.isbn}
                        </div>
                    ` : ''}
                </div>
                
                ${recurso.descripcion ? `
                    <div class="resource-description">
                        ${window.BibliotecaUtils.formatearTexto(recurso.descripcion, { maxLength: 150 })}
                    </div>
                ` : ''}
            </div>
            
            <div class="card-actions">
                <div class="action-buttons">
                    <button class="btn-action btn-view" onclick="verDetalleRecurso(${recurso.id})">
                        <i class="fas fa-eye"></i> Ver
                    </button>
                    
                    ${recurso.estado === 'disponible' ? `
                        <button class="btn-action btn-borrow" onclick="prestarRecurso(${recurso.id})">
                            <i class="fas fa-hand-holding"></i> Prestar
                        </button>
                    ` : recurso.estado === 'prestado' ? `
                        <button class="btn-action btn-borrow" onclick="devolverRecurso(${recurso.id})">
                            <i class="fas fa-undo"></i> Devolver
                        </button>
                    ` : `
                        <button class="btn-action btn-disabled" disabled>
                            <i class="fas fa-tools"></i> Mantenimiento
                        </button>
                    `}
                    
                    <button class="btn-action btn-edit" onclick="editarRecurso(${recurso.id})">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    
                    <button class="btn-action btn-delete" onclick="eliminarRecurso(${recurso.id})">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
            </div>
        </div>
    `;
}

/* ========================================
   BÚSQUEDA Y FILTRADO
   ======================================== */

function buscarRecursos() {
    try {
        const termino = document.getElementById('search-input')?.value || '';
        
        // Obtener filtros
        filtrosActivos = {
            tipo: document.getElementById('filter-tipo')?.value || '',
            año: document.getElementById('filter-año')?.value || '',
            materia: document.getElementById('filter-materia')?.value || '',
            estado: document.getElementById('filter-estado')?.value || ''
        };
        
        // Realizar búsqueda
        recursosActuales = window.BibliotecaBusqueda.buscarRecursos(termino, filtrosActivos);
        
        // Aplicar ordenamiento actual
        const criterioOrden = document.getElementById('sort-select')?.value || 'titulo';
        recursosActuales = window.BibliotecaBusqueda.ordenarRecursos(recursosActuales, criterioOrden);
        
        // Mostrar resultados
        mostrarRecursos(recursosActuales);
        actualizarContadorResultados(recursosActuales.length);
        
    } catch (error) {
        window.BibliotecaUtils.manejarError(error, 'búsqueda');
    }
}

function limpiarFiltros() {
    // Limpiar inputs
    document.getElementById('search-input').value = '';
    document.getElementById('filter-tipo').value = '';
    document.getElementById('filter-año').value = '';
    document.getElementById('filter-materia').value = '';
    document.getElementById('filter-estado').value = '';
    
    // Recargar todos los recursos
    filtrosActivos = {};
    cargarRecursos();
}

function ordenarRecursos() {
    const criterio = document.getElementById('sort-select')?.value || 'titulo';
    recursosActuales = window.BibliotecaBusqueda.ordenarRecursos(recursosActuales, criterio);
    mostrarRecursos(recursosActuales);
}

function cambiarVista(vista) {
    vistaActual = vista;
    
    // Actualizar botones de vista
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.view === vista) {
            btn.classList.add('active');
        }
    });
    
    // Actualizar container
    const container = document.getElementById('recursos-container');
    if (container) {
        container.className = vista === 'grid' ? 'recursos-grid' : 'recursos-list';
        mostrarRecursos(recursosActuales);
    }
}

function actualizarContadorResultados(cantidad) {
    const contador = document.getElementById('results-count');
    if (contador) {
        contador.textContent = cantidad === 1 
            ? 'Mostrando 1 resultado' 
            : `Mostrando ${cantidad} resultados`;
    }
}

/* ========================================
   GESTIÓN DE MODALES
   ======================================== */

function openAddModal() {
    const modal = document.getElementById('add-modal');
    if (modal) {
        modal.classList.add('show');
        modal.style.display = 'flex';
        
        // Limpiar formulario
        document.getElementById('add-form')?.reset();
    }
}

function closeAddModal() {
    const modal = document.getElementById('add-modal');
    if (modal) {
        modal.classList.remove('show');
        modal.style.display = 'none';
    }
}

function closeViewModal() {
    const modal = document.getElementById('view-modal');
    if (modal) {
        modal.classList.remove('show');
        modal.style.display = 'none';
    }
}

function cerrarModales() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('show');
        modal.style.display = 'none';
    });
}

/* ========================================
   ACCIONES DE RECURSOS
   ======================================== */

function agregarRecurso(event) {
    event.preventDefault();
    
    try {
        // Obtener datos del formulario
        const formData = new FormData(event.target);
        const nuevoRecurso = {
            tipo: document.getElementById('nuevo-tipo').value,
            titulo: document.getElementById('nuevo-titulo').value,
            autor: document.getElementById('nuevo-autor').value,
            año: document.getElementById('nuevo-año').value,
            isbn: document.getElementById('nuevo-isbn').value,
            materia: document.getElementById('nueva-materia').value,
            descripcion: document.getElementById('nueva-descripcion').value,
            ubicacion: document.getElementById('nueva-ubicacion').value,
            estado: document.getElementById('nuevo-estado').value
        };
        
        // Validar datos
        const validacion = window.BibliotecaUtils.validarFormularioRecurso(nuevoRecurso);
        if (!validacion.valido) {
            window.BibliotecaUtils.mostrarNotificacion(
                'Error en el formulario: ' + validacion.errores.join(', '), 
                'error'
            );
            return;
        }
        
        // Agregar recurso
        const recursoCreado = window.BibliotecaDB.agregarRecurso(nuevoRecurso);
        
        // Actualizar interfaz
        cargarRecursos();
        actualizarEstadisticas();
        closeAddModal();
        
        window.BibliotecaUtils.mostrarNotificacion(
            `Recurso "${recursoCreado.titulo}" agregado exitosamente`,
            'success'
        );
        
    } catch (error) {
        window.BibliotecaUtils.manejarError(error, 'agregar recurso');
    }
}

function verDetalleRecurso(id) {
    try {
        const recurso = window.BibliotecaDB.obtenerRecursoPorId(id);
        if (!recurso) {
            window.BibliotecaUtils.mostrarNotificacion('Recurso no encontrado', 'error');
            return;
        }
        
        const modal = document.getElementById('view-modal');
        const content = document.getElementById('view-content');
        
        if (!modal || !content) return;
        
        content.innerHTML = `
            <div style="padding: 1.5rem;">
                <div style="margin-bottom: 1.5rem;">
                    ${window.BibliotecaUtils.formatearTipo(recurso.tipo)}
                    ${window.BibliotecaUtils.formatearEstado(recurso.estado)}
                </div>
                
                <h2 style="margin-bottom: 1rem; color: var(--text-primary);">
                    ${window.BibliotecaUtils.formatearTexto(recurso.titulo)}
                </h2>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
                    <div>
                        <strong>Autor:</strong><br>
                        ${window.BibliotecaUtils.formatearAutor(recurso.autor)}
                    </div>
                    <div>
                        <strong>Año:</strong><br>
                        ${recurso.año}
                    </div>
                    <div>
                        <strong>Materia:</strong><br>
                        ${window.BibliotecaUtils.formatearTexto(recurso.materia)}
                    </div>
                    ${recurso.isbn ? `
                        <div>
                            <strong>ISBN:</strong><br>
                            ${recurso.isbn}
                        </div>
                    ` : ''}
                </div>
                
                ${recurso.descripcion ? `
                    <div style="margin-bottom: 1.5rem;">
                        <strong>Descripción:</strong><br>
                        ${recurso.descripcion}
                    </div>
                ` : ''}
                
                <div style="margin-bottom: 1.5rem;">
                    <strong>Ubicación:</strong><br>
                    ${recurso.ubicacion || 'No especificada'}
                </div>
                
                ${recurso.estado === 'prestado' && recurso.prestadoA ? `
                    <div style="margin-bottom: 1.5rem; padding: 1rem; background: rgba(217, 119, 6, 0.1); border-radius: 0.5rem;">
                        <strong>Información de Préstamo:</strong><br>
                        Prestado a: ${recurso.prestadoA}<br>
                        Fecha de préstamo: ${window.BibliotecaUtils.formatearFecha(recurso.fechaPrestamo)}
                    </div>
                ` : ''}
                
                <div style="margin-bottom: 1.5rem;">
                    <strong>Fecha de ingreso:</strong><br>
                    ${window.BibliotecaUtils.formatearFecha(recurso.fechaIngreso)}
                </div>
                
                <div style="display: flex; gap: 1rem; justify-content: flex-end; padding-top: 1rem; border-top: 1px solid var(--bg-tertiary);">
                    ${recurso.estado === 'disponible' ? `
                        <button class="btn-primary" onclick="prestarRecurso(${recurso.id}); closeViewModal();">
                            <i class="fas fa-hand-holding"></i> Prestar
                        </button>
                    ` : recurso.estado === 'prestado' ? `
                        <button class="btn-primary" onclick="devolverRecurso(${recurso.id}); closeViewModal();">
                            <i class="fas fa-undo"></i> Devolver
                        </button>
                    ` : ''}
                    
                    <button class="btn-secondary" onclick="editarRecurso(${recurso.id}); closeViewModal();">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    
                    <button class="btn-secondary" onclick="window.BibliotecaUtils.copiarAlPortapapeles('${recurso.titulo} - ${recurso.autor}')">
                        <i class="fas fa-copy"></i> Copiar
                    </button>
                </div>
            </div>
        `;
        
        modal.classList.add('show');
        modal.style.display = 'flex';
        
    } catch (error) {
        window.BibliotecaUtils.manejarError(error, 'ver detalle del recurso');
    }
}

function prestarRecurso(id) {
    const nombreUsuario = prompt('Ingrese el nombre de la persona que solicita el préstamo:');
    
    if (!nombreUsuario || nombreUsuario.trim() === '') {
        window.BibliotecaUtils.mostrarNotificacion('Debe ingresar un nombre válido', 'warning');
        return;
    }
    
    try {
        const recurso = window.BibliotecaDB.prestarRecurso(id, nombreUsuario.trim());
        cargarRecursos();
        actualizarEstadisticas();
        
        window.BibliotecaUtils.mostrarNotificacion(
            `Recurso "${recurso.titulo}" prestado a ${nombreUsuario}`,
            'success'
        );
    } catch (error) {
        window.BibliotecaUtils.manejarError(error, 'prestar recurso');
    }
}

function devolverRecurso(id) {
    window.BibliotecaUtils.mostrarConfirmacion(
        '¿Confirma la devolución de este recurso?',
        () => {
            try {
                const recurso = window.BibliotecaDB.devolverRecurso(id);
                cargarRecursos();
                actualizarEstadisticas();
                
                window.BibliotecaUtils.mostrarNotificacion(
                    `Recurso "${recurso.titulo}" devuelto exitosamente`,
                    'success'
                );
            } catch (error) {
                window.BibliotecaUtils.manejarError(error, 'devolver recurso');
            }
        }
    );
}

function editarRecurso(id) {
    try {
        const recurso = window.BibliotecaDB.obtenerRecursoPorId(id);
        if (!recurso) {
            window.BibliotecaUtils.mostrarNotificacion('Recurso no encontrado', 'error');
            return;
        }
        
        // Llenar formulario con datos existentes
        document.getElementById('nuevo-tipo').value = recurso.tipo;
        document.getElementById('nuevo-titulo').value = recurso.titulo;
        document.getElementById('nuevo-autor').value = recurso.autor;
        document.getElementById('nuevo-año').value = recurso.año;
        document.getElementById('nuevo-isbn').value = recurso.isbn || '';
        document.getElementById('nueva-materia').value = recurso.materia;
        document.getElementById('nueva-descripcion').value = recurso.descripcion || '';
        document.getElementById('nueva-ubicacion').value = recurso.ubicacion || '';
        document.getElementById('nuevo-estado').value = recurso.estado;
        
        // Cambiar comportamiento del formulario para edición
        const form = document.getElementById('add-form');
        form.setAttribute('data-editing', id);
        
        // Cambiar título del modal
        const modalTitle = document.querySelector('#add-modal .modal-header h3');
        if (modalTitle) {
            modalTitle.innerHTML = '<i class="fas fa-edit"></i> Editar Recurso';
        }
        
        // Cambiar texto del botón
        const submitBtn = document.querySelector('#add-form button[type="submit"]');
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="fas fa-save"></i> Actualizar Recurso';
        }
        
        openAddModal();
        
    } catch (error) {
        window.BibliotecaUtils.manejarError(error, 'editar recurso');
    }
}

function eliminarRecurso(id) {
    const recurso = window.BibliotecaDB.obtenerRecursoPorId(id);
    if (!recurso) return;
    
    window.BibliotecaUtils.mostrarConfirmacion(
        `¿Está seguro de que desea eliminar "${recurso.titulo}"? Esta acción no se puede deshacer.`,
        () => {
            try {
                window.BibliotecaDB.eliminarRecurso(id);
                cargarRecursos();
                actualizarEstadisticas();
                
                window.BibliotecaUtils.mostrarNotificacion(
                    `Recurso "${recurso.titulo}" eliminado exitosamente`,
                    'success'
                );
            } catch (error) {
                window.BibliotecaUtils.manejarError(error, 'eliminar recurso');
            }
        }
    );
}

/* ========================================
   ESTADÍSTICAS
   ======================================== */

function actualizarEstadisticas() {
    try {
        const stats = window.BibliotecaDB.obtenerEstadisticas();
        
        // Estadísticas del hero
        const totalRecursos = document.getElementById('total-recursos');
        const disponibles = document.getElementById('recursos-disponibles');
        const prestados = document.getElementById('recursos-prestados');
        
        if (totalRecursos) totalRecursos.textContent = stats.total;
        if (disponibles) disponibles.textContent = stats.porEstado.disponible || 0;
        if (prestados) prestados.textContent = stats.porEstado.prestado || 0;
        
        // Estadísticas por tipo
        const statLibros = document.getElementById('stat-libros');
        const statTesis = document.getElementById('stat-tesis');
        const statProyectos = document.getElementById('stat-proyectos');
        const statRevistas = document.getElementById('stat-revistas');
        
        if (statLibros) statLibros.textContent = stats.porTipo.libro || 0;
        if (statTesis) statTesis.textContent = stats.porTipo.tesis || 0;
        if (statProyectos) statProyectos.textContent = stats.porTipo.proyecto || 0;
        if (statRevistas) statRevistas.textContent = stats.porTipo.revista || 0;
        
    } catch (error) {
        window.BibliotecaUtils.manejarError(error, 'actualizar estadísticas');
    }
}

/* ========================================
   TEMA Y CONFIGURACIÓN
   ======================================== */

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('biblioteca-tema', newTheme);
    actualizarIconoTema(newTheme);
    
    window.BibliotecaUtils.mostrarNotificacion(
        `Tema cambiado a ${newTheme === 'dark' ? 'oscuro' : 'claro'}`,
        'info'
    );
}

function actualizarIconoTema(tema) {
    const icon = document.getElementById('theme-icon');
    if (icon) {
        icon.className = tema === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
}

/* ========================================
   MANEJO DEL FORMULARIO
   ======================================== */

// Manejar envío del formulario (agregar/editar)
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('add-form');
    if (form) {
        form.addEventListener('submit', function(event) {
            event.preventDefault();
            
            const editingId = form.getAttribute('data-editing');
            
            if (editingId) {
                // Modo edición
                actualizarRecurso(editingId, event);
            } else {
                // Modo agregar
                agregarRecurso(event);
            }
        });
    }
});

function actualizarRecurso(id, event) {
    try {
        const datosActualizados = {
            tipo: document.getElementById('nuevo-tipo').value,
            titulo: document.getElementById('nuevo-titulo').value,
            autor: document.getElementById('nuevo-autor').value,
            año: parseInt(document.getElementById('nuevo-año').value),
            isbn: document.getElementById('nuevo-isbn').value || null,
            materia: document.getElementById('nueva-materia').value,
            descripcion: document.getElementById('nueva-descripcion').value,
            ubicacion: document.getElementById('nueva-ubicacion').value,
            estado: document.getElementById('nuevo-estado').value
        };
        
        // Validar datos
        const validacion = window.BibliotecaUtils.validarFormularioRecurso(datosActualizados);
        if (!validacion.valido) {
            window.BibliotecaUtils.mostrarNotificacion(
                'Error en el formulario: ' + validacion.errores.join(', '), 
                'error'
            );
            return;
        }
        
        const recursoActualizado = window.BibliotecaDB.actualizarRecurso(id, datosActualizados);
        
        // Actualizar interfaz
        cargarRecursos();
        actualizarEstadisticas();
        resetearFormulario();
        closeAddModal();
        
        window.BibliotecaUtils.mostrarNotificacion(
            `Recurso "${recursoActualizado.titulo}" actualizado exitosamente`,
            'success'
        );
        
    } catch (error) {
        window.BibliotecaUtils.manejarError(error, 'actualizar recurso');
    }
}

function resetearFormulario() {
    const form = document.getElementById('add-form');
    const modalTitle = document.querySelector('#add-modal .modal-header h3');
    const submitBtn = document.querySelector('#add-form button[type="submit"]');
    
    // Resetear formulario
    if (form) {
        form.reset();
        form.removeAttribute('data-editing');
    }
    
    // Restaurar título
    if (modalTitle) {
        modalTitle.innerHTML = '<i class="fas fa-plus-circle"></i> Agregar Nuevo Recurso';
    }
    
    // Restaurar texto del botón
    if (submitBtn) {
        submitBtn.innerHTML = '<i class="fas fa-save"></i> Guardar Recurso';
    }
}

/* ========================================
   FUNCIONES GLOBALES PARA HTML
   ======================================== */

// Estas funciones deben estar disponibles globalmente para los onclick en HTML
window.openAddModal = openAddModal;
window.closeAddModal = closeAddModal;
window.closeViewModal = closeViewModal;
window.agregarRecurso = agregarRecurso;
window.verDetalleRecurso = verDetalleRecurso;
window.prestarRecurso = prestarRecurso;
window.devolverRecurso = devolverRecurso;
window.editarRecurso = editarRecurso;
window.eliminarRecurso = eliminarRecurso;
window.buscarRecursos = buscarRecursos;
window.limpiarFiltros = limpiarFiltros;
window.ordenarRecursos = ordenarRecursos;
window.cambiarVista = cambiarVista;
window.toggleTheme = toggleTheme;

console.log('✅ Sistema Biblioteca Civil cargado completamente');