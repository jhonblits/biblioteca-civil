/* ========================================
   BIBLIOTECA CIVIL - MÓDULO DE AUTENTICACIÓN
   ======================================== */

// Base de datos de usuarios (en un sistema real, esto vendría del servidor)
const USERS_DATABASE = {
    // Estudiantes
    'estudiante1': { 
        password: '123456', 
        role: 'estudiante', 
        name: 'Juan Pérez', 
        id: 'EST001',
        email: 'juan.perez@estudiante.edu',
        permissions: ['view_catalog', 'borrow_books', 'view_own_history']
    },
    'estudiante2': { 
        password: '123456', 
        role: 'estudiante', 
        name: 'María García', 
        id: 'EST002',
        email: 'maria.garcia@estudiante.edu',
        permissions: ['view_catalog', 'borrow_books', 'view_own_history']
    },
    'ana.lopez': { 
        password: 'ana123', 
        role: 'estudiante', 
        name: 'Ana López', 
        id: 'EST003',
        email: 'ana.lopez@estudiante.edu',
        permissions: ['view_catalog', 'borrow_books', 'view_own_history']
    },
    
    // Bibliotecarios
    'bibliotecario1': { 
        password: 'admin123', 
        role: 'bibliotecario', 
        name: 'Carlos Mendoza', 
        id: 'BIB001',
        email: 'carlos.mendoza@biblioteca.edu',
        permissions: ['view_catalog', 'add_resources', 'edit_resources', 'manage_loans', 'view_reports']
    },
    'laura.santos': { 
        password: 'laura456', 
        role: 'bibliotecario', 
        name: 'Laura Santos', 
        id: 'BIB002',
        email: 'laura.santos@biblioteca.edu',
        permissions: ['view_catalog', 'add_resources', 'edit_resources', 'manage_loans', 'view_reports']
    },
    
    // Administradores
    'admin': { 
        password: 'admin123', 
        role: 'administrador', 
        name: 'Director Sistema', 
        id: 'ADM001',
        email: 'admin@biblioteca.edu',
        permissions: ['all']
    },
    'jhon.yauri': { 
        password: 'jhon2024', 
        role: 'administrador', 
        name: 'Jhon Yauri', 
        id: 'ADM002',
        email: 'jhon.yauri@biblioteca.edu',
        permissions: ['all']
    }
};

// Configuración de roles y permisos
const ROLE_PERMISSIONS = {
    'estudiante': {
        name: 'Estudiante',
        color: '#059669',
        icon: 'fas fa-user-graduate',
        permissions: ['view_catalog', 'borrow_books', 'view_own_history'],
        restrictions: {
            maxBorrowedBooks: 3,
            maxLoanDays: 14,
            canViewAllUsers: false
        }
    },
    'bibliotecario': {
        name: 'Bibliotecario',
        color: '#d97706',
        icon: 'fas fa-user-tie',
        permissions: ['view_catalog', 'add_resources', 'edit_resources', 'manage_loans', 'view_reports', 'manage_students'],
        restrictions: {
            maxBorrowedBooks: 10,
            maxLoanDays: 30,
            canViewAllUsers: true
        }
    },
    'administrador': {
        name: 'Administrador',
        color: '#dc2626',
        icon: 'fas fa-user-shield',
        permissions: ['all'],
        restrictions: {
            maxBorrowedBooks: 999,
            maxLoanDays: 999,
            canViewAllUsers: true
        }
    }
};

/* ========================================
   FUNCIONES DE AUTENTICACIÓN
   ======================================== */

// Verificar credenciales de usuario
function authenticateUser(username, password, role) {
    const user = USERS_DATABASE[username];
    
    if (!user) {
        return { success: false, error: 'Usuario no encontrado' };
    }
    
    if (user.password !== password) {
        return { success: false, error: 'Contraseña incorrecta' };
    }
    
    if (user.role !== role) {
        return { success: false, error: `Este usuario no tiene permisos de ${role}` };
    }
    
    return { success: true, user: user };
}

// Iniciar sesión
function login(username, password, role) {
    const authResult = authenticateUser(username, password, role);
    
    if (!authResult.success) {
        return authResult;
    }
    
    // Crear datos de sesión
    const sessionData = {
        username: username,
        name: authResult.user.name,
        role: authResult.user.role,
        id: authResult.user.id,
        email: authResult.user.email,
        permissions: authResult.user.permissions,
        loginTime: new Date().toISOString(),
        lastActivity: new Date().toISOString()
    };
    
    // Guardar sesión
    localStorage.setItem('bibliotecaSession', JSON.stringify(sessionData));
    localStorage.setItem('isLoggedIn', 'true');
    
    // Log de actividad
    logActivity('login', `Usuario ${username} inició sesión como ${role}`);
    
    return { success: true, user: sessionData };
}

// Cerrar sesión
function logout() {
    const session = getCurrentSession();
    if (session) {
        logActivity('logout', `Usuario ${session.username} cerró sesión`);
    }
    
    localStorage.removeItem('bibliotecaSession');
    localStorage.removeItem('isLoggedIn');
    
    // Redireccionar al login
    window.location.href = 'login.html';
}

// Obtener sesión actual
function getCurrentSession() {
    try {
        const sessionData = localStorage.getItem('bibliotecaSession');
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        
        if (!sessionData || isLoggedIn !== 'true') {
            return null;
        }
        
        const session = JSON.parse(sessionData);
        
        // Verificar si la sesión no ha expirado (24 horas)
        const loginTime = new Date(session.loginTime);
        const now = new Date();
        const hoursDiff = (now - loginTime) / (1000 * 60 * 60);
        
        if (hoursDiff > 24) {
            logout();
            return null;
        }
        
        // Actualizar última actividad
        session.lastActivity = new Date().toISOString();
        localStorage.setItem('bibliotecaSession', JSON.stringify(session));
        
        return session;
    } catch (error) {
        console.error('Error al obtener sesión:', error);
        return null;
    }
}

// Verificar si el usuario está autenticado
function isAuthenticated() {
    return getCurrentSession() !== null;
}

// Verificar permisos
function hasPermission(permission) {
    const session = getCurrentSession();
    if (!session) return false;
    
    // Los administradores tienen todos los permisos
    if (session.permissions.includes('all')) return true;
    
    return session.permissions.includes(permission);
}

// Verificar si el usuario tiene un rol específico
function hasRole(role) {
    const session = getCurrentSession();
    return session && session.role === role;
}

// Verificar múltiples roles
function hasAnyRole(roles) {
    const session = getCurrentSession();
    return session && roles.includes(session.role);
}

/* ========================================
   MIDDLEWARE DE PROTECCIÓN
   ======================================== */

// Proteger página (requiere autenticación)
function requireAuth() {
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Proteger funcionalidad por permisos
function requirePermission(permission, errorMessage = 'No tienes permisos para realizar esta acción') {
    if (!hasPermission(permission)) {
        if (window.BibliotecaUtils) {
            window.BibliotecaUtils.mostrarNotificacion(errorMessage, 'error');
        } else {
            alert(errorMessage);
        }
        return false;
    }
    return true;
}

// Proteger funcionalidad por rol
function requireRole(role, errorMessage = 'No tienes el rol necesario para esta acción') {
    if (!hasRole(role)) {
        if (window.BibliotecaUtils) {
            window.BibliotecaUtils.mostrarNotificacion(errorMessage, 'error');
        } else {
            alert(errorMessage);
        }
        return false;
    }
    return true;
}

/* ========================================
   GESTIÓN DE USUARIOS
   ======================================== */

// Obtener información de usuario
function getUserInfo(username) {
    return USERS_DATABASE[username] || null;
}

// Listar usuarios (solo para administradores y bibliotecarios)
function listUsers() {
    if (!hasAnyRole(['administrador', 'bibliotecario'])) {
        return [];
    }
    
    return Object.keys(USERS_DATABASE).map(username => {
        const user = USERS_DATABASE[username];
        return {
            username,
            name: user.name,
            role: user.role,
            id: user.id,
            email: user.email
        };
    });
}

// Agregar nuevo usuario (solo administradores)
function addUser(userData) {
    if (!hasRole('administrador')) {
        return { success: false, error: 'Solo los administradores pueden agregar usuarios' };
    }
    
    if (USERS_DATABASE[userData.username]) {
        return { success: false, error: 'El usuario ya existe' };
    }
    
    USERS_DATABASE[userData.username] = userData;
    logActivity('add_user', `Usuario ${userData.username} agregado por ${getCurrentSession().username}`);
    
    return { success: true };
}

// Cambiar contraseña
function changePassword(oldPassword, newPassword) {
    const session = getCurrentSession();
    if (!session) {
        return { success: false, error: 'No hay sesión activa' };
    }
    
    const user = USERS_DATABASE[session.username];
    if (user.password !== oldPassword) {
        return { success: false, error: 'Contraseña actual incorrecta' };
    }
    
    user.password = newPassword;
    logActivity('change_password', `Usuario ${session.username} cambió su contraseña`);
    
    return { success: true };
}

/* ========================================
   LOGS Y AUDITORÍA
   ======================================== */

// Registrar actividad
function logActivity(action, description) {
    try {
        const logs = JSON.parse(localStorage.getItem('bibliotecaLogs') || '[]');
        const session = getCurrentSession();
        
        const logEntry = {
            timestamp: new Date().toISOString(),
            action: action,
            description: description,
            user: session ? session.username : 'anonymous',
            userRole: session ? session.role : 'unknown',
            ip: 'localhost', // En un sistema real, esto vendría del servidor
            userAgent: navigator.userAgent
        };
        
        logs.push(logEntry);
        
        // Mantener solo los últimos 1000 logs
        if (logs.length > 1000) {
            logs.splice(0, logs.length - 1000);
        }
        
        localStorage.setItem('bibliotecaLogs', JSON.stringify(logs));
    } catch (error) {
        console.error('Error al registrar log:', error);
    }
}

// Obtener logs de actividad
function getActivityLogs(limit = 100) {
    if (!hasAnyRole(['administrador', 'bibliotecario'])) {
        return [];
    }
    
    try {
        const logs = JSON.parse(localStorage.getItem('bibliotecaLogs') || '[]');
        return logs.slice(-limit).reverse(); // Últimos logs, más recientes primero
    } catch (error) {
        console.error('Error al obtener logs:', error);
        return [];
    }
}

/* ========================================
   INTERFAZ DE USUARIO
   ======================================== */

// Actualizar interfaz según el rol del usuario
function updateUIForRole() {
    const session = getCurrentSession();
    if (!session) return;
    
    const roleInfo = ROLE_PERMISSIONS[session.role];
    
    // Actualizar información del usuario en la interfaz
    updateUserInfo(session, roleInfo);
    
    // Ocultar/mostrar elementos según permisos
    hideElementsByPermission();
    
    // Personalizar menú según rol
    customizeMenuForRole(session.role);
}

// Actualizar información del usuario
function updateUserInfo(session, roleInfo) {
    // Agregar badge de usuario
    const navbar = document.querySelector('.navbar');
    if (navbar && !document.querySelector('.user-info')) {
        const userInfo = document.createElement('div');
        userInfo.className = 'user-info';
        userInfo.innerHTML = `
            <div class="user-badge" style="
                display: flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.5rem 1rem;
                background: ${roleInfo.color};
                color: white;
                border-radius: 0.5rem;
                font-size: 0.875rem;
                font-weight: 600;
            ">
                <i class="${roleInfo.icon}"></i>
                <span>${session.name}</span>
                <div class="user-dropdown" style="position: relative;">
                    <button onclick="toggleUserMenu()" style="
                        background: none;
                        border: none;
                        color: white;
                        cursor: pointer;
                        padding: 0.25rem;
                    ">
                        <i class="fas fa-chevron-down"></i>
                    </button>
                    <div class="user-menu" id="user-menu" style="
                        display: none;
                        position: absolute;
                        top: 100%;
                        right: 0;
                        background: white;
                        border-radius: 0.5rem;
                        box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                        padding: 0.5rem 0;
                        min-width: 200px;
                        z-index: 1000;
                        color: var(--text-primary);
                    ">
                        <div class="menu-item" onclick="showProfile()" style="padding: 0.5rem 1rem; cursor: pointer; transition: background 0.2s;">
                            <i class="fas fa-user"></i> Mi Perfil
                        </div>
                        <div class="menu-item" onclick="showSettings()" style="padding: 0.5rem 1rem; cursor: pointer; transition: background 0.2s;">
                            <i class="fas fa-cog"></i> Configuración
                        </div>
                        <div class="menu-item" onclick="logout()" style="padding: 0.5rem 1rem; cursor: pointer; transition: background 0.2s; color: #dc2626;">
                            <i class="fas fa-sign-out-alt"></i> Cerrar Sesión
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        const navActions = document.querySelector('.nav-actions');
        if (navActions) {
            navActions.appendChild(userInfo);
        }
    }
}

// Ocultar elementos según permisos
function hideElementsByPermission() {
    const elementsToHide = [
        { selector: '[data-permission]', attribute: 'data-permission' },
        { selector: '[data-role]', attribute: 'data-role' }
    ];
    
    elementsToHide.forEach(({ selector, attribute }) => {
        document.querySelectorAll(selector).forEach(element => {
            const requiredPermission = element.getAttribute(attribute);
            
            if (attribute === 'data-permission' && !hasPermission(requiredPermission)) {
                element.style.display = 'none';
            } else if (attribute === 'data-role' && !hasRole(requiredPermission)) {
                element.style.display = 'none';
            }
        });
    });
}

// Personalizar menú según rol
function customizeMenuForRole(role) {
    const session = getCurrentSession();
    
    // Agregar elementos específicos según el rol
    if (role === 'administrador') {
        addAdminMenuItems();
    } else if (role === 'bibliotecario') {
        addLibrarianMenuItems();
    }
    
    // Personalizar botón "Agregar Recurso" según permisos
    const addButton = document.querySelector('[onclick="openAddModal()"]');
    if (addButton && !hasPermission('add_resources')) {
        addButton.style.display = 'none';
    }
}

// Agregar elementos de menú para administradores
function addAdminMenuItems() {
    const navMenu = document.querySelector('.nav-menu');
    if (navMenu && !document.querySelector('.admin-menu')) {
        const adminMenu = document.createElement('a');
        adminMenu.href = '#admin';
        adminMenu.className = 'nav-link admin-menu';
        adminMenu.innerHTML = '🛡️ Admin Panel';
        adminMenu.onclick = (e) => {
            e.preventDefault();
            showAdminPanel();
        };
        navMenu.appendChild(adminMenu);
    }
}

// Agregar elementos de menú para bibliotecarios
function addLibrarianMenuItems() {
    const navMenu = document.querySelector('.nav-menu');
    if (navMenu && !document.querySelector('.librarian-menu')) {
        const librarianMenu = document.createElement('a');
        librarianMenu.href = '#reports';
        librarianMenu.className = 'nav-link librarian-menu';
        librarianMenu.innerHTML = '📊 Reportes';
        librarianMenu.onclick = (e) => {
            e.preventDefault();
            showReports();
        };
        navMenu.appendChild(librarianMenu);
    }
}

/* ========================================
   FUNCIONES DE INTERFAZ
   ======================================== */

// Toggle menú de usuario
function toggleUserMenu() {
    const menu = document.getElementById('user-menu');
    if (menu) {
        menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    }
}

// Mostrar perfil de usuario
function showProfile() {
    const session = getCurrentSession();
    if (!session) return;
    
    const profileInfo = `
        <h3>👤 Perfil de Usuario</h3>
        <p><strong>Nombre:</strong> ${session.name}</p>
        <p><strong>Usuario:</strong> ${session.username}</p>
        <p><strong>Rol:</strong> ${ROLE_PERMISSIONS[session.role].name}</p>
        <p><strong>ID:</strong> ${session.id}</p>
        <p><strong>Email:</strong> ${session.email}</p>
        <p><strong>Último acceso:</strong> ${new Date(session.loginTime).toLocaleString()}</p>
    `;
    
    if (window.BibliotecaUtils) {
        window.BibliotecaUtils.mostrarNotificacion('Perfil cargado', 'info');
    }
    
    // En un sistema real, esto abriría un modal con el perfil completo
    alert(profileInfo);
}

// Mostrar configuración
function showSettings() {
    // En un sistema real, esto abriría un modal de configuración
    const newPassword = prompt('Ingrese nueva contraseña (o cancele para no cambiar):');
    if (newPassword) {
        const oldPassword = prompt('Confirme su contraseña actual:');
        if (oldPassword) {
            const result = changePassword(oldPassword, newPassword);
            if (result.success) {
                if (window.BibliotecaUtils) {
                    window.BibliotecaUtils.mostrarNotificacion('Contraseña actualizada', 'success');
                } else {
                    alert('Contraseña actualizada exitosamente');
                }
            } else {
                if (window.BibliotecaUtils) {
                    window.BibliotecaUtils.mostrarNotificacion(result.error, 'error');
                } else {
                    alert(result.error);
                }
            }
        }
    }
}

// Mostrar panel de administración
function showAdminPanel() {
    if (!hasRole('administrador')) return;
    
    const users = listUsers();
    const logs = getActivityLogs(20);
    
    console.log('👑 Panel de Administración');
    console.log('Usuarios registrados:', users);
    console.log('Últimos logs:', logs);
    
    if (window.BibliotecaUtils) {
        window.BibliotecaUtils.mostrarNotificacion('Panel de admin disponible en consola (F12)', 'info');
    }
}

// Mostrar reportes
function showReports() {
    if (!hasAnyRole(['administrador', 'bibliotecario'])) return;
    
    const logs = getActivityLogs(50);
    const stats = {
        totalUsers: listUsers().length,
        totalLogins: logs.filter(log => log.action === 'login').length,
        totalActivity: logs.length
    };
    
    console.log('📊 Reportes de Biblioteca');
    console.log('Estadísticas:', stats);
    console.log('Actividad reciente:', logs);
    
    if (window.BibliotecaUtils) {
        window.BibliotecaUtils.mostrarNotificacion('Reportes disponibles en consola (F12)', 'info');
    }
}

/* ========================================
   INICIALIZACIÓN
   ======================================== */

// Inicializar sistema de autenticación
function initAuth() {
    // Verificar autenticación en páginas protegidas
    if (window.location.pathname.includes('index.html') || 
        window.location.pathname === '/' || 
        window.location.pathname.endsWith('/')) {
        
        if (!requireAuth()) {
            return;
        }
        
        // Actualizar interfaz para el rol del usuario
        updateUIForRole();
        
        // Registrar actividad de navegación
        logActivity('page_view', `Usuario visitó ${window.location.pathname}`);
    }
    
    // Cerrar menús al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.user-dropdown')) {
            const menu = document.getElementById('user-menu');
            if (menu) {
                menu.style.display = 'none';
            }
        }
    });
    
    console.log('🔐 Sistema de autenticación inicializado');
}

/* ========================================
   EXPORTAR FUNCIONES
   ======================================== */

window.BibliotecaAuth = {
    // Autenticación básica
    login,
    logout,
    isAuthenticated,
    getCurrentSession,
    
    // Permisos y roles
    hasPermission,
    hasRole,
    hasAnyRole,
    requireAuth,
    requirePermission,
    requireRole,
    
    // Gestión de usuarios
    getUserInfo,
    listUsers,
    addUser,
    changePassword,
    
    // Logs y auditoría
    logActivity,
    getActivityLogs,
    
    // Interfaz
    updateUIForRole,
    toggleUserMenu,
    showProfile,
    showSettings,
    showAdminPanel,
    showReports,
    
    // Inicialización
    initAuth,
    
    // Datos de configuración
    ROLE_PERMISSIONS,
    USERS_DATABASE
};

// Auto-inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initAuth);

console.log('🚀 Módulo de autenticación cargado correctamente');