// Cek apakah user sudah login
function isLoggedIn() {
    try {
        // Cek dari localStorage dan sessionStorage
        const localUser = localStorage.getItem('currentUser');
        const sessionUser = sessionStorage.getItem('currentUser');
        
        return !!(localUser || sessionUser);
    } catch (error) {
        console.error('Error checking login status:', error);
        return false;
    }
}

// Dapatkan data user yang sedang login
function getCurrentUser() {
    try {
        // Prioritaskan sessionStorage
        const sessionUser = sessionStorage.getItem('currentUser');
        if (sessionUser) {
            return JSON.parse(sessionUser);
        }
        
        // Jika tidak ada di session, cek localStorage
        const localUser = localStorage.getItem('currentUser');
        if (localUser) {
            return JSON.parse(localUser);
        }
        
        return null;
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
}

// Fungsi logout
function logout() {
    if (confirm('Apakah Anda yakin ingin logout?')) {
        // Hapus semua data session
        sessionStorage.removeItem('currentUser');
        localStorage.removeItem('currentUser');
        
        // Redirect ke halaman login
        window.location.href = 'index.html';
    }
}

// Cek role user (admin/user)
function getUserRole() {
    const user = getCurrentUser();
    return user ? user.role : null;
}

// ============================================
// AUTH GUARD UNTUK SEMUA HALAMAN
// ============================================

// Daftar halaman yang dilindungi (memerlukan login)
const protectedPages = [
    'dashboard.html',
    'dataset.html', 
    'analisa.html',
    'input.html',
    'hasil.html',
    'riwayat.html',
    'tentang.html',
    'admin.html'
];

// Daftar halaman yang khusus untuk admin saja
const adminOnlyPages = [
    'admin.html'
];

// Fungsi utama untuk melindungi halaman
function protectPage() {
    // Dapatkan nama file saat ini
    const currentPage = window.location.pathname.split('/').pop();
    
    // Cek apakah halaman saat ini dilindungi
    const isProtectedPage = protectedPages.includes(currentPage);
    
    if (isProtectedPage) {
        // Cek apakah user sudah login
        if (!isLoggedIn()) {
            // Jika belum login, redirect ke halaman login
            alert('Anda harus login terlebih dahulu untuk mengakses halaman ini.');
            window.location.href = 'index.html';
            return false;
        }
        
        // Jika sudah login, cek apakah halaman khusus admin
        const isAdminPage = adminOnlyPages.includes(currentPage);
        const userRole = getUserRole();
        
        if (isAdminPage && userRole !== 'admin') {
            // Jika bukan admin mencoba akses halaman admin
            alert('Akses ditolak. Halaman ini hanya untuk administrator.');
            window.location.href = 'dashboard.html';
            return false;
        }
        
        // Update UI berdasarkan user yang login
        updateUIForLoggedInUser();
        
        return true;
    }
    
    // Untuk halaman login (index.html), jika sudah login redirect ke dashboard
    if (currentPage === 'index.html' || currentPage === '') {
        if (isLoggedIn()) {
            const user = getCurrentUser();
            if (user.role === 'admin') {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'dashboard.html';
            }
        }
    }
    
    return true;
}

// Update UI berdasarkan user yang login
function updateUIForLoggedInUser() {
    const user = getCurrentUser();
    if (!user) return;
    
    // Update nama user di sidebar (jika ada)
    const userElements = document.querySelectorAll('.user-name span, #user-name, .username');
    userElements.forEach(element => {
        if (element.classList.contains('user-name') || element.id === 'user-name') {
            element.textContent = user.name || 'User';
        }
    });
    
    // Update email user
    const emailElements = document.querySelectorAll('.user-email, #user-email, .user-details span:nth-child(2)');
    emailElements.forEach(element => {
        if (element.textContent.includes('@') || element.id === 'user-email') {
            element.textContent = user.email || 'user@example.com';
        }
    });
    
    // Update role/status
    const roleElements = document.querySelectorAll('.user-role, #user-role, .user-status');
    if (roleElements.length > 0) {
        roleElements[0].textContent = user.role === 'admin' ? 'Administrator' : 'User';
    }
}

// ============================================
// FUNGSI UNTUK MENANGANI SESSION EXPIRY
// ============================================

// Cek apakah session sudah expired
function checkSessionExpiry() {
    const user = getCurrentUser();
    if (!user) return true;
    
    // Jika tidak ada loginTime, anggap session valid
    if (!user.loginTime) return false;
    
    const loginTime = new Date(user.loginTime);
    const currentTime = new Date();
    const hoursDiff = Math.abs(currentTime - loginTime) / 36e5; // selisih dalam jam
    
    // Session expired setelah 24 jam
    if (hoursDiff > 24) {
        sessionStorage.removeItem('currentUser');
        localStorage.removeItem('currentUser');
        alert('Session Anda telah habis. Silakan login kembali.');
        window.location.href = 'index.html';
        return true;
    }
    
    return false;
}

// ============================================
// FUNGSI UNTUK VALIDASI INPUT
// ============================================

// Validasi email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Validasi password (minimal 6 karakter)
function validatePassword(password) {
    return password.length >= 6;
}

// ============================================
// INISIALISASI SISTEM
// ============================================

// Fungsi untuk menginisialisasi semua user data
function initializeAuthSystem() {
    console.log('Initializing Authentication System...');
    
    // Inisialisasi database user jika belum ada
    if (!localStorage.getItem('psycho_users')) {
        localStorage.setItem('psycho_users', JSON.stringify([]));
        console.log('Created empty psycho_users database');
    }
    
    // Inisialisasi database assessments jika belum ada
    if (!localStorage.getItem('userAssessments')) {
        localStorage.setItem('userAssessments', JSON.stringify([]));
        console.log('Created empty userAssessments database');
    }
    
    // Tambahkan user admin default jika belum ada
    const users = JSON.parse(localStorage.getItem('psycho_users'));
    const adminExists = users.find(u => u.email === 'adminpsyc@admin.com');
    
    if (!adminExists) {
        const adminUser = {
            id: 'admin_' + Date.now(),
            name: 'Admin Depresychology',
            email: 'adminpsyc@admin.com',
            password: 'depresychol',
            gender: 'other',
            role: 'admin',
            createdAt: new Date().toISOString()
        };
        
        users.push(adminUser);
        localStorage.setItem('psycho_users', JSON.stringify(users));
        console.log('Default admin user created');
    }
    
    // Tambahkan user demo untuk testing
    const demoExists = users.find(u => u.email === 'demo@user.com');
    if (!demoExists) {
        const demoUser = {
            id: 'demo_' + Date.now(),
            name: 'Demo User',
            email: 'demo@user.com',
            password: 'demo123',
            gender: 'male',
            role: 'user',
            createdAt: new Date().toISOString()
        };
        
        users.push(demoUser);
        localStorage.setItem('psycho_users', JSON.stringify(users));
        console.log('Demo user created');
    }
    
    console.log('Auth system initialized successfully');
}

// ============================================
// FUNGSI UNTUK LOGIN/REGISTER
// ============================================

// Fungsi untuk login user
function loginUser(email, password, rememberMe = false) {
    const users = JSON.parse(localStorage.getItem('psycho_users') || '[]');
    
    // Cari user berdasarkan email dan password
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    
    if (!user) {
        return { success: false, message: 'Email atau password salah' };
    }
    
    // Buat session data
    const userData = {
        id: user.id,
        name: user.name,
        email: user.email,
        gender: user.gender,
        role: user.role || 'user',
        loginTime: new Date().toISOString()
    };
    
    // Simpan ke sessionStorage dan localStorage
    sessionStorage.setItem('currentUser', JSON.stringify(userData));
    localStorage.setItem('currentUser', JSON.stringify(userData));
    
    // Simpan email jika remember me dicentang
    if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
    } else {
        localStorage.removeItem('rememberedEmail');
    }
    
    return { 
        success: true, 
        message: 'Login berhasil!',
        user: userData,
        redirect: userData.role === 'admin' ? 'admin.html' : 'dashboard.html'
    };
}

// Fungsi untuk register user baru
function registerUser(name, email, gender, password) {
    const users = JSON.parse(localStorage.getItem('psycho_users') || '[]');
    
    // Validasi input
    if (!name || !email || !gender || !password) {
        return { success: false, message: 'Semua field harus diisi' };
    }
    
    if (!validateEmail(email)) {
        return { success: false, message: 'Format email tidak valid' };
    }
    
    if (!validatePassword(password)) {
        return { success: false, message: 'Password minimal 6 karakter' };
    }
    
    // Cek apakah email sudah terdaftar
    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
        return { success: false, message: 'Email sudah terdaftar' };
    }
    
    // Buat user baru
    const newUser = {
        id: 'user_' + Date.now(),
        name: name.trim(),
        email: email.toLowerCase().trim(),
        gender: gender,
        password: password,
        role: 'user',
        createdAt: new Date().toISOString()
    };
    
    // Tambahkan ke database
    users.push(newUser);
    localStorage.setItem('psycho_users', JSON.stringify(users));
    
    // Auto login setelah register
    const userData = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        gender: newUser.gender,
        role: newUser.role,
        loginTime: new Date().toISOString()
    };
    
    sessionStorage.setItem('currentUser', JSON.stringify(userData));
    localStorage.setItem('currentUser', JSON.stringify(userData));
    
    return { 
        success: true, 
        message: 'Registrasi berhasil!',
        user: userData,
        redirect: 'dashboard.html'
    };
}

// ============================================
// EKSPOR FUNGSI KE WINDOW OBJECT
// ============================================

window.AuthSystem = {
    // Fungsi utama
    isLoggedIn,
    getCurrentUser,
    logout,
    protectPage,
    
    // Fungsi validasi
    validateEmail,
    validatePassword,
    
    // Fungsi auth
    loginUser,
    registerUser,
    getUserRole,
    checkSessionExpiry,
    
    // Inisialisasi
    initializeAuthSystem
};

// ============================================
// EKSEKUSI SAAT HALAMAN DIMUAT
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('Auth guard loaded');
    
    // Inisialisasi sistem
    initializeAuthSystem();
    
    // Jalankan protection
    protectPage();
    
    // Cek session expiry setiap 5 menit
    setInterval(checkSessionExpiry, 5 * 60 * 1000);
    
    // Tambahkan event listener untuk logout buttons
    document.addEventListener('click', function(e) {
        if (e.target.closest('.logout-btn') || 
            e.target.closest('.logout-menu-item') || 
            (e.target.id && e.target.id.includes('logout'))) {
            e.preventDefault();
            logout();
        }
    });
    
    console.log('Auth system ready');
});

// Handle beforeunload event
window.addEventListener('beforeunload', function() {
    // Simpan session data sebelum unload
    const user = getCurrentUser();
    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
    }
});