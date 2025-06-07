/* ========================================
   BIBLIOTECA CIVIL - MÓDULO DE BASE DE DATOS
   ======================================== */

// Base de datos en memoria (simulada)
let biblioteca = [
    {
        id: 1,
        tipo: 'libro',
        titulo: 'Cálculo Diferencial e Integral',
        autor: 'Dr. María Elena González',
        año: 2023,
        isbn: '978-607-123-456-7',
        materia: 'matemáticas',
        descripcion: 'Libro completo sobre cálculo diferencial e integral con aplicaciones prácticas para estudiantes de ingeniería y ciencias exactas.',
        ubicacion: 'Estante A, Nivel 2, Sección 1',
        estado: 'disponible',
        fechaIngreso: '2024-01-15',
        prestadoA: null,
        fechaPrestamo: null
    },
    {
        id: 2,
        tipo: 'tesis',
        titulo: 'Impacto de la Tecnología Digital en la Educación Superior',
        autor: 'Ana Sofía Rodríguez Martínez',
        año: 2024,
        isbn: null,
        materia: 'tecnología',
        descripcion: 'Tesis de maestría que analiza el impacto de las herramientas digitales en el proceso de enseñanza-aprendizaje en universidades públicas.',
        ubicacion: 'Archivo Digital, Servidor Principal',
        estado: 'disponible',
        fechaIngreso: '2024-02-10',
        prestadoA: null,
        fechaPrestamo: null
    },
    {
        id: 3,
        tipo: 'proyecto',
        titulo: 'Sistema de Gestión de Residuos Urbanos Inteligente',
        autor: 'Equipo Innovación Verde',
        año: 2023,
        isbn: null,
        materia: 'ciencias',
        descripcion: 'Proyecto estudiantil para implementar un sistema IoT de gestión inteligente de residuos sólidos urbanos con sensores y análisis de datos.',
        ubicacion: 'Laboratorio de Proyectos, Mesa 5',
        estado: 'prestado',
        fechaIngreso: '2023-11-20',
        prestadoA: 'Carlos Méndez',
        fechaPrestamo: '2024-06-01'
    },
    {
        id: 4,
        tipo: 'libro',
        titulo: 'Literatura Latinoamericana del Siglo XX',
        autor: 'Prof. Roberto Carlos Fuentes',
        año: 2022,
        isbn: '978-968-123-789-0',
        materia: 'literatura',
        descripcion: 'Análisis comprensivo de las obras más representativas de la literatura latinoamericana, desde el realismo mágico hasta la narrativa contemporánea.',
        ubicacion: 'Estante C, Nivel 1, Sección 4',
        estado: 'disponible',
        fechaIngreso: '2022-08-15',
        prestadoA: null,
        fechaPrestamo: null
    },
    {
        id: 5,
        tipo: 'revista',
        titulo: 'Revista de Investigación Científica - Vol. 45',
        autor: 'Comité Editorial Científico',
        año: 2024,
        isbn: 'ISSN 1234-5678',
        materia: 'ciencias',
        descripcion: 'Publicación trimestral con artículos de investigación en física, química, biología y matemáticas aplicadas.',
        ubicacion: 'Hemeroteca, Estante R, Casillero 2024',
        estado: 'disponible',
        fechaIngreso: '2024-03-01',
        prestadoA: null,
        fechaPrestamo: null
    },
    {
        id: 6,
        tipo: 'articulo',
        titulo: 'Inteligencia Artificial en la Medicina Moderna',
        autor: 'Dr. Patricia Vega Sánchez',
        año: 2024,
        isbn: null,
        materia: 'tecnología',
        descripcion: 'Artículo de investigación sobre la aplicación de algoritmos de machine learning en diagnósticos médicos y tratamientos personalizados.',
        ubicacion: 'Base de Datos Digital, Colección Médica',
        estado: 'disponible',
        fechaIngreso: '2024-04-20',
        prestadoA: null,
        fechaPrestamo: null
    },
    {
        id: 7,
        tipo: 'libro',
        titulo: 'Historia Universal: De la Antigüedad al Siglo XXI',
        autor: 'Dr. Manuel Alejandro Torres',
        año: 2021,
        isbn: '978-84-123-456-8',
        materia: 'historia',
        descripcion: 'Recorrido completo por la historia de la humanidad, desde las primeras civilizaciones hasta los eventos más significativos del siglo XXI.',
        ubicacion: 'Estante B, Nivel 3, Sección 2',
        estado: 'mantenimiento',
        fechaIngreso: '2021-05-10',
        prestadoA: null,
        fechaPrestamo: null
    },
    {
        id: 8,
        tipo: 'tesis',
        titulo: 'Desarrollo Sostenible y Políticas Públicas Ambientales',
        autor: 'Ing. Laura Beatriz Morales',
        año: 2023,
        isbn: null,
        materia: 'ciencias',
        descripcion: 'Tesis doctoral que propone un marco de políticas públicas para el desarrollo sostenible basado en indicadores ambientales y sociales.',
        ubicacion: 'Archivo de Tesis, Gaveta T-2023-15',
        estado: 'disponible',
        fechaIngreso: '2023-09-12',
        prestadoA: null,
        fechaPrestamo: null
    }
];

// Configuración del sistema
const configuracion = {
    diasPrestamo: 14, // Días máximo de préstamo
    maxRenovaciones: 2, // Máximo de renovaciones permitidas
    multaPorDia: 5, // Multa por día de retraso
    tiposRecursos: ['libro', 'tesis', 'proyecto', 'revista', 'articulo'],
    estados: ['disponible', 'prestado', 'mantenimiento'],
    materias: ['matemáticas', 'literatura', 'ciencias', 'historia', 'tecnología', 'filosofía', 'arte']
};

/* ========================================
   FUNCIONES DE GESTIÓN DE DATOS
   ======================================== */

// Obtener todos los recursos
function obtenerTodosRecursos() {
    return [...biblioteca];
}

// Obtener recurso por ID
function obtenerRecursoPorId(id) {
    return biblioteca.find(recurso => recurso.id === parseInt(id));
}

// Agregar nuevo recurso
function agregarRecurso(nuevoRecurso) {
    try {
        // Generar nuevo ID
        const nuevoId = Math.max(...biblioteca.map(r => r.id), 0) + 1;
        
        // Crear objeto completo del recurso
        const recursoCompleto = {
            id: nuevoId,
            tipo: nuevoRecurso.tipo,
            titulo: nuevoRecurso.titulo.trim(),
            autor: nuevoRecurso.autor.trim(),
            año: parseInt(nuevoRecurso.año),
            isbn: nuevoRecurso.isbn ? nuevoRecurso.isbn.trim() : null,
            materia: nuevoRecurso.materia,
            descripcion: nuevoRecurso.descripcion ? nuevoRecurso.descripcion.trim() : '',
            ubicacion: nuevoRecurso.ubicacion ? nuevoRecurso.ubicacion.trim() : 'Sin ubicación asignada',
            estado: nuevoRecurso.estado || 'disponible',
            fechaIngreso: new Date().toISOString().split('T')[0],
            prestadoA: null,
            fechaPrestamo: null
        };
        
        // Validar datos obligatorios
        if (!recursoCompleto.titulo || !recursoCompleto.autor || !recursoCompleto.año) {
            throw new Error('Faltan datos obligatorios: título, autor y año son requeridos');
        }
        
        // Agregar a la biblioteca
        biblioteca.push(recursoCompleto);
        
        // Guardar en localStorage para persistencia
        guardarEnLocalStorage();
        
        return recursoCompleto;
    } catch (error) {
        console.error('Error al agregar recurso:', error);
        throw error;
    }
}

// Actualizar recurso existente
function actualizarRecurso(id, datosActualizados) {
    try {
        const indice = biblioteca.findIndex(recurso => recurso.id === parseInt(id));
        
        if (indice === -1) {
            throw new Error('Recurso no encontrado');
        }
        
        // Actualizar solo los campos proporcionados
        biblioteca[indice] = {
            ...biblioteca[indice],
            ...datosActualizados,
            id: parseInt(id) // Mantener el ID original
        };
        
        guardarEnLocalStorage();
        return biblioteca[indice];
    } catch (error) {
        console.error('Error al actualizar recurso:', error);
        throw error;
    }
}

// Eliminar recurso
function eliminarRecurso(id) {
    try {
        const indice = biblioteca.findIndex(recurso => recurso.id === parseInt(id));
        
        if (indice === -1) {
            throw new Error('Recurso no encontrado');
        }
        
        // No permitir eliminar recursos prestados
        if (biblioteca[indice].estado === 'prestado') {
            throw new Error('No se puede eliminar un recurso que está prestado');
        }
        
        const recursoEliminado = biblioteca.splice(indice, 1)[0];
        guardarEnLocalStorage();
        return recursoEliminado;
    } catch (error) {
        console.error('Error al eliminar recurso:', error);
        throw error;
    }
}

// Prestar recurso
function prestarRecurso(id, nombreUsuario) {
    try {
        const recurso = obtenerRecursoPorId(id);
        
        if (!recurso) {
            throw new Error('Recurso no encontrado');
        }
        
        if (recurso.estado !== 'disponible') {
            throw new Error('El recurso no está disponible para préstamo');
        }
        
        recurso.estado = 'prestado';
        recurso.prestadoA = nombreUsuario.trim();
        recurso.fechaPrestamo = new Date().toISOString().split('T')[0];
        
        guardarEnLocalStorage();
        return recurso;
    } catch (error) {
        console.error('Error al prestar recurso:', error);
        throw error;
    }
}

// Devolver recurso
function devolverRecurso(id) {
    try {
        const recurso = obtenerRecursoPorId(id);
        
        if (!recurso) {
            throw new Error('Recurso no encontrado');
        }
        
        if (recurso.estado !== 'prestado') {
            throw new Error('El recurso no está prestado');
        }
        
        recurso.estado = 'disponible';
        recurso.prestadoA = null;
        recurso.fechaPrestamo = null;
        
        guardarEnLocalStorage();
        return recurso;
    } catch (error) {
        console.error('Error al devolver recurso:', error);
        throw error;
    }
}

/* ========================================
   FUNCIONES DE ESTADÍSTICAS
   ======================================== */

// Obtener estadísticas generales
function obtenerEstadisticas() {
    const total = biblioteca.length;
    const porTipo = {};
    const porEstado = {};
    const porMateria = {};
    
    // Inicializar contadores
    configuracion.tiposRecursos.forEach(tipo => porTipo[tipo] = 0);
    configuracion.estados.forEach(estado => porEstado[estado] = 0);
    configuracion.materias.forEach(materia => porMateria[materia] = 0);
    
    // Contar recursos
    biblioteca.forEach(recurso => {
        porTipo[recurso.tipo]++;
        porEstado[recurso.estado]++;
        porMateria[recurso.materia]++;
    });
    
    return {
        total,
        porTipo,
        porEstado,
        porMateria,
        recursosRecientes: biblioteca
            .filter(r => {
                const fechaIngreso = new Date(r.fechaIngreso);
                const hace30Dias = new Date();
                hace30Dias.setDate(hace30Dias.getDate() - 30);
                return fechaIngreso >= hace30Dias;
            })
            .length
    };
}

// Obtener recursos próximos a vencer
function obtenerRecursosProximosVencer() {
    const hoy = new Date();
    const recursos = biblioteca.filter(recurso => {
        if (recurso.estado !== 'prestado' || !recurso.fechaPrestamo) {
            return false;
        }
        
        const fechaPrestamo = new Date(recurso.fechaPrestamo);
        const fechaVencimiento = new Date(fechaPrestamo);
        fechaVencimiento.setDate(fechaVencimiento.getDate() + configuracion.diasPrestamo);
        
        const diasRestantes = Math.ceil((fechaVencimiento - hoy) / (1000 * 60 * 60 * 24));
        return diasRestantes <= 3 && diasRestantes >= 0;
    });
    
    return recursos;
}

// Obtener recursos vencidos
function obtenerRecursosVencidos() {
    const hoy = new Date();
    const recursos = biblioteca.filter(recurso => {
        if (recurso.estado !== 'prestado' || !recurso.fechaPrestamo) {
            return false;
        }
        
        const fechaPrestamo = new Date(recurso.fechaPrestamo);
        const fechaVencimiento = new Date(fechaPrestamo);
        fechaVencimiento.setDate(fechaVencimiento.getDate() + configuracion.diasPrestamo);
        
        return hoy > fechaVencimiento;
    });
    
    return recursos;
}

/* ========================================
   PERSISTENCIA DE DATOS
   ======================================== */

// Guardar en localStorage
function guardarEnLocalStorage() {
    try {
        localStorage.setItem('bibliotecaCivil', JSON.stringify(biblioteca));
        localStorage.setItem('bibliotecaCivilConfig', JSON.stringify(configuracion));
    } catch (error) {
        console.warn('No se pudo guardar en localStorage:', error);
    }
}

// Cargar desde localStorage
function cargarDesdeLocalStorage() {
    try {
        const datosGuardados = localStorage.getItem('bibliotecaCivil');
        const configGuardada = localStorage.getItem('bibliotecaCivilConfig');
        
        if (datosGuardados) {
            biblioteca = JSON.parse(datosGuardados);
        }
        
        if (configGuardada) {
            Object.assign(configuracion, JSON.parse(configGuardada));
        }
    } catch (error) {
        console.warn('No se pudo cargar desde localStorage:', error);
    }
}

// Exportar datos (para backup)
function exportarDatos() {
    const datos = {
        biblioteca,
        configuracion,
        fechaExportacion: new Date().toISOString(),
        version: '1.0'
    };
    
    return JSON.stringify(datos, null, 2);
}

// Importar datos (para restaurar backup)
function importarDatos(datosJSON) {
    try {
        const datos = JSON.parse(datosJSON);
        
        if (datos.biblioteca && Array.isArray(datos.biblioteca)) {
            biblioteca = datos.biblioteca;
        }
        
        if (datos.configuracion) {
            Object.assign(configuracion, datos.configuracion);
        }
        
        guardarEnLocalStorage();
        return true;
    } catch (error) {
        console.error('Error al importar datos:', error);
        return false;
    }
}

/* ========================================
   INICIALIZACIÓN
   ======================================== */

// Cargar datos al iniciar
document.addEventListener('DOMContentLoaded', function() {
    cargarDesdeLocalStorage();
});

// Exportar funciones para uso global
window.BibliotecaDB = {
    // Gestión de recursos
    obtenerTodosRecursos,
    obtenerRecursoPorId,
    agregarRecurso,
    actualizarRecurso,
    eliminarRecurso,
    
    // Gestión de préstamos
    prestarRecurso,
    devolverRecurso,
    
    // Estadísticas
    obtenerEstadisticas,
    obtenerRecursosProximosVencer,
    obtenerRecursosVencidos,
    
    // Persistencia
    guardarEnLocalStorage,
    cargarDesdeLocalStorage,
    exportarDatos,
    importarDatos,
    
    // Configuración
    configuracion
}; 
