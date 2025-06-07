/* ========================================
   BIBLIOTECA CIVIL - MÓDULO DE BÚSQUEDA
   ======================================== */

/* ========================================
   FUNCIONES DE BÚSQUEDA Y FILTRADO
   ======================================== */

// Búsqueda principal de recursos
function buscarRecursos(termino = '', filtros = {}) {
    let recursos = window.BibliotecaDB.obtenerTodosRecursos();
    
    // Filtrar por término de búsqueda
    if (termino.trim()) {
        const terminoLower = termino.toLowerCase().trim();
        recursos = recursos.filter(recurso => {
            return (
                recurso.titulo.toLowerCase().includes(terminoLower) ||
                recurso.autor.toLowerCase().includes(terminoLower) ||
                recurso.descripcion.toLowerCase().includes(terminoLower) ||
                (recurso.isbn && recurso.isbn.toLowerCase().includes(terminoLower)) ||
                recurso.materia.toLowerCase().includes(terminoLower) ||
                recurso.tipo.toLowerCase().includes(terminoLower)
            );
        });
    }
    
    // Aplicar filtros
    if (filtros.tipo && filtros.tipo !== '') {
        recursos = recursos.filter(recurso => recurso.tipo === filtros.tipo);
    }
    
    if (filtros.año && filtros.año !== '') {
        recursos = recursos.filter(recurso => recurso.año.toString() === filtros.año);
    }
    
    if (filtros.materia && filtros.materia !== '') {
        recursos = recursos.filter(recurso => recurso.materia === filtros.materia);
    }
    
    if (filtros.estado && filtros.estado !== '') {
        recursos = recursos.filter(recurso => recurso.estado === filtros.estado);
    }
    
    return recursos;
}

// Búsqueda avanzada con múltiples criterios
function busquedaAvanzada(criterios) {
    let recursos = window.BibliotecaDB.obtenerTodosRecursos();
    
    // Filtrar por cada criterio
    Object.keys(criterios).forEach(campo => {
        const valor = criterios[campo];
        if (valor && valor.trim() !== '') {
            const valorLower = valor.toLowerCase().trim();
            recursos = recursos.filter(recurso => {
                if (recurso[campo]) {
                    return recurso[campo].toString().toLowerCase().includes(valorLower);
                }
                return false;
            });
        }
    });
    
    return recursos;
}

// Obtener sugerencias de búsqueda
function obtenerSugerencias(termino, limite = 5) {
    if (!termino || termino.length < 2) {
        return [];
    }
    
    const recursos = window.BibliotecaDB.obtenerTodosRecursos();
    const sugerencias = new Set();
    const terminoLower = termino.toLowerCase();
    
    recursos.forEach(recurso => {
        // Sugerencias de títulos
        if (recurso.titulo.toLowerCase().includes(terminoLower)) {
            sugerencias.add(recurso.titulo);
        }
        
        // Sugerencias de autores
        if (recurso.autor.toLowerCase().includes(terminoLower)) {
            sugerencias.add(recurso.autor);
        }
        
        // Sugerencias de materias
        if (recurso.materia.toLowerCase().includes(terminoLower)) {
            sugerencias.add(recurso.materia);
        }
    });
    
    return Array.from(sugerencias).slice(0, limite);
}

// Búsqueda por similitud (recursos relacionados)
function buscarRecursosSimilares(recursoId, limite = 4) {
    const recursoBase = window.BibliotecaDB.obtenerRecursoPorId(recursoId);
    if (!recursoBase) return [];
    
    const todosRecursos = window.BibliotecaDB.obtenerTodosRecursos();
    const recursosSimilares = [];
    
    todosRecursos.forEach(recurso => {
        if (recurso.id === recursoBase.id) return; // Excluir el mismo recurso
        
        let puntuacion = 0;
        
        // Misma materia (+3 puntos)
        if (recurso.materia === recursoBase.materia) {
            puntuacion += 3;
        }
        
        // Mismo tipo (+2 puntos)
        if (recurso.tipo === recursoBase.tipo) {
            puntuacion += 2;
        }
        
        // Mismo autor (+4 puntos)
        if (recurso.autor === recursoBase.autor) {
            puntuacion += 4;
        }
        
        // Año similar (+1 punto si diferencia ≤ 2 años)
        if (Math.abs(recurso.año - recursoBase.año) <= 2) {
            puntuacion += 1;
        }
        
        // Palabras comunes en título
        const palabrasBase = recursoBase.titulo.toLowerCase().split(' ');
        const palabrasRecurso = recurso.titulo.toLowerCase().split(' ');
        const palabrasComunes = palabrasBase.filter(palabra => 
            palabra.length > 3 && palabrasRecurso.includes(palabra)
        );
        puntuacion += palabrasComunes.length * 0.5;
        
        if (puntuacion > 0) {
            recursosSimilares.push({ recurso, puntuacion });
        }
    });
    
    // Ordenar por puntuación y devolver los mejores
    return recursosSimilares
        .sort((a, b) => b.puntuacion - a.puntuacion)
        .slice(0, limite)
        .map(item => item.recurso);
}

/* ========================================
   FUNCIONES DE ORDENAMIENTO
   ======================================== */

// Ordenar recursos por diferentes criterios
function ordenarRecursos(recursos, criterio = 'titulo', direccion = 'asc') {
    const recursosCopia = [...recursos];
    
    recursosCopia.sort((a, b) => {
        let valorA, valorB;
        
        switch (criterio) {
            case 'titulo':
                valorA = a.titulo.toLowerCase();
                valorB = b.titulo.toLowerCase();
                break;
            case 'autor':
                valorA = a.autor.toLowerCase();
                valorB = b.autor.toLowerCase();
                break;
            case 'año':
                valorA = a.año;
                valorB = b.año;
                break;
            case 'tipo':
                valorA = a.tipo;
                valorB = b.tipo;
                break;
            case 'estado':
                valorA = a.estado;
                valorB = b.estado;
                break;
            case 'fechaIngreso':
                valorA = new Date(a.fechaIngreso);
                valorB = new Date(b.fechaIngreso);
                break;
            default:
                valorA = a.titulo.toLowerCase();
                valorB = b.titulo.toLowerCase();
        }
        
        let comparacion = 0;
        if (valorA > valorB) {
            comparacion = 1;
        } else if (valorA < valorB) {
            comparacion = -1;
        }
        
        return direccion === 'desc' ? comparacion * -1 : comparacion;
    });
    
    return recursosCopia;
}

/* ========================================
   FUNCIONES DE FILTRADO AVANZADO
   ======================================== */

// Filtrar por rango de años
function filtrarPorRangoAños(recursos, añoInicio, añoFin) {
    return recursos.filter(recurso => 
        recurso.año >= añoInicio && recurso.año <= añoFin
    );
}

// Filtrar por disponibilidad
function filtrarPorDisponibilidad(recursos, soloDisponibles = true) {
    return recursos.filter(recurso => 
        soloDisponibles ? recurso.estado === 'disponible' : true
    );
}

// Filtrar recursos recientes
function filtrarRecursosRecientes(recursos, diasAtras = 30) {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - diasAtras);
    
    return recursos.filter(recurso => {
        const fechaIngreso = new Date(recurso.fechaIngreso);
        return fechaIngreso >= fechaLimite;
    });
}

// Filtrar por múltiples criterios
function filtrarPorMultiplesCriterios(recursos, criterios) {
    let resultados = [...recursos];
    
    // Filtro por tipos (array)
    if (criterios.tipos && criterios.tipos.length > 0) {
        resultados = resultados.filter(recurso => 
            criterios.tipos.includes(recurso.tipo)
        );
    }
    
    // Filtro por materias (array)
    if (criterios.materias && criterios.materias.length > 0) {
        resultados = resultados.filter(recurso => 
            criterios.materias.includes(recurso.materia)
        );
    }
    
    // Filtro por estados (array)
    if (criterios.estados && criterios.estados.length > 0) {
        resultados = resultados.filter(recurso => 
            criterios.estados.includes(recurso.estado)
        );
    }
    
    // Filtro por rango de años
    if (criterios.añoMin) {
        resultados = resultados.filter(recurso => recurso.año >= criterios.añoMin);
    }
    
    if (criterios.añoMax) {
        resultados = resultados.filter(recurso => recurso.año <= criterios.añoMax);
    }
    
    // Filtro por autor específico
    if (criterios.autor) {
        const autorLower = criterios.autor.toLowerCase();
        resultados = resultados.filter(recurso => 
            recurso.autor.toLowerCase().includes(autorLower)
        );
    }
    
    return resultados;
}

/* ========================================
   FUNCIONES DE ANÁLISIS Y ESTADÍSTICAS
   ======================================== */

// Obtener términos de búsqueda más populares
function obtenerTerminosPopulares() {
    // En una implementación real, esto vendría de un log de búsquedas
    return [
        'matemáticas',
        'literatura',
        'historia',
        'tecnología',
        'ciencias',
        'cálculo',
        'programación',
        'física'
    ];
}

// Obtener autores más consultados
function obtenerAutoresPopulares(limite = 10) {
    const recursos = window.BibliotecaDB.obtenerTodosRecursos();
    const conteoAutores = {};
    
    recursos.forEach(recurso => {
        conteoAutores[recurso.autor] = (conteoAutores[recurso.autor] || 0) + 1;
    });
    
    return Object.entries(conteoAutores)
        .sort(([,a], [,b]) => b - a)
        .slice(0, limite)
        .map(([autor, cantidad]) => ({ autor, cantidad }));
}

// Obtener materias más representadas
function obtenerMateriasPopulares() {
    const recursos = window.BibliotecaDB.obtenerTodosRecursos();
    const conteoMaterias = {};
    
    recursos.forEach(recurso => {
        conteoMaterias[recurso.materia] = (conteoMaterias[recurso.materia] || 0) + 1;
    });
    
    return Object.entries(conteoMaterias)
        .sort(([,a], [,b]) => b - a)
        .map(([materia, cantidad]) => ({ materia, cantidad }));
}

/* ========================================
   FUNCIONES DE VALIDACIÓN
   ======================================== */

// Validar término de búsqueda
function validarTerminoBusqueda(termino) {
    if (!termino || typeof termino !== 'string') {
        return { valido: false, error: 'El término de búsqueda debe ser un texto válido' };
    }
    
    if (termino.trim().length === 0) {
        return { valido: false, error: 'El término de búsqueda no puede estar vacío' };
    }
    
    if (termino.length > 100) {
        return { valido: false, error: 'El término de búsqueda es demasiado largo' };
    }
    
    return { valido: true };
}

// Validar filtros de búsqueda
function validarFiltros(filtros) {
    const errores = [];
    const config = window.BibliotecaDB.configuracion;
    
    if (filtros.tipo && !config.tiposRecursos.includes(filtros.tipo)) {
        errores.push('Tipo de recurso no válido');
    }
    
    if (filtros.estado && !config.estados.includes(filtros.estado)) {
        errores.push('Estado no válido');
    }
    
    if (filtros.materia && !config.materias.includes(filtros.materia)) {
        errores.push('Materia no válida');
    }
    
    if (filtros.año) {
        const año = parseInt(filtros.año);
        if (isNaN(año) || año < 1900 || año > new Date().getFullYear() + 1) {
            errores.push('Año no válido');
        }
    }
    
    return {
        valido: errores.length === 0,
        errores
    };
}

/* ========================================
   FUNCIONES DE EXPORTACIÓN
   ======================================== */

// Exportar funciones para uso global
window.BibliotecaBusqueda = {
    // Búsqueda principal
    buscarRecursos,
    busquedaAvanzada,
    obtenerSugerencias,
    buscarRecursosSimilares,
    
    // Ordenamiento
    ordenarRecursos,
    
    // Filtrado avanzado
    filtrarPorRangoAños,
    filtrarPorDisponibilidad,
    filtrarRecursosRecientes,
    filtrarPorMultiplesCriterios,
    
    // Análisis y estadísticas
    obtenerTerminosPopulares,
    obtenerAutoresPopulares,
    obtenerMateriasPopulares,
    
    // Validación
    validarTerminoBusqueda,
    validarFiltros
};