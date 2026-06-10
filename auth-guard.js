class AuthGuard {
    constructor() {
        this.publicPages = ['index.html', 'login.html', 'tentang.html', ''];
        this.userPages = ['dashboard.html', 'input.html', 'hasil.html', 'riwayat.html', 'data-view.html'];
        this.adminPages = ['admin.html'];
        this.sharedPages = ['dataset.html', 'process-data.html', 'a.html'];
    }
    
    init() {
        const currentPage = window.location.pathname.split('/').pop();
        const user = this.getCurrentUser();
        
        // Public pages - allow everyone
        if (this.publicPages.includes(currentPage)) {
            if (user && currentPage === 'index.html') {
                this.redirectBasedOnRole(user);
            }
            return;
        }
        
        // Check if user exists
        if (!user) {
            window.location.href = 'index.html';
            return;
        }
        
        // Admin pages
        if (this.adminPages.includes(currentPage)) {
            if (user.role !== 'admin' || user.email !== 'adminpsyc@admin.com') {
                alert('Akses ditolak. Hanya untuk admin.');
                window.location.href = user.role === 'user' ? 'dashboard.html' : 'index.html';
                return;
            }
        }
        
        // User pages
        if (this.userPages.includes(currentPage)) {
            if (user.role === 'admin') {
                window.location.href = 'admin.html';
                return;
            }
        }
        
        // Shared pages - both admin and user can access
        if (this.sharedPages.includes(currentPage)) {
            // Both can access, no restrictions
        }
    }
    
    getCurrentUser() {
        try {
            const sessionUser = sessionStorage.getItem('currentUser');
            const localUser = localStorage.getItem('currentUser');
            
            if (sessionUser) return JSON.parse(sessionUser);
            if (localUser) return JSON.parse(localUser);
            return null;
        } catch (e) {
            return null;
        }
    }
    
    redirectBasedOnRole(user) {
        if (user.role === 'admin') {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'dashboard.html';
        }
    }
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
    const authGuard = new AuthGuard();
    authGuard.init();
});