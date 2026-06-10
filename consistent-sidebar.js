class ConsistentSidebar {
    constructor() {
        this.currentPage = this.getCurrentPage();
        this.userData = this.getUserData();
    }
    
    init() {
        this.updateUserInfo();
        this.setActiveMenu();
        this.setupLogout();
        this.setupMenuHighlight();
    }
    
    getCurrentPage() {
        const path = window.location.pathname;
        const page = path.split('/').pop();
        
        const pageMap = {
            'dashboard.html': 'dashboard',
            'input.html': 'input',
            'assessment.html': 'input',
            'hasil.html': 'hasil',
            'riwayat.html': 'riwayat',
            'process-data.html': 'dataset',
            'dataset.html': 'dataset',
            'tentang.html': 'tentang'
        };
        
        return pageMap[page] || 'dashboard';
    }
    
    getUserData() {
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
    
    updateUserInfo() {
        if (!this.userData) return;
        
        // Update avatar
        const avatar = document.getElementById('userAvatar');
        if (avatar) {
            const initials = (this.userData.name || this.userData.email).charAt(0).toUpperCase();
            avatar.textContent = initials;
            
            // Set random color
            const colors = ['#1a2980', '#26d0ce', '#667eea', '#f5576c', '#43e97b'];
            const colorIndex = (this.userData.email.length + (this.userData.name?.length || 0)) % colors.length;
            avatar.style.backgroundColor = colors[colorIndex];
            avatar.style.color = 'white';
        }
        
        // Update user info text
        const userInfo = document.getElementById('userInfo');
        if (userInfo) {
            userInfo.innerHTML = `
                <h4>${this.userData.name || this.userData.email.split('@')[0]}</h4>
                <p>${this.userData.email}</p>
            `;
        }
    }
    
    setActiveMenu() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.classList.remove('active');
            
            if (item.dataset.page === this.currentPage) {
                item.classList.add('active');
            }
        });
    }
    
    setupLogout() {
        const logoutBtns = document.querySelectorAll('#logoutBtn, .logout-btn');
        logoutBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                if (confirm('Apakah Anda yakin ingin logout?')) {
                    sessionStorage.removeItem('currentUser');
                    localStorage.removeItem('currentUser');
                    window.location.href = 'index.html';
                }
            });
        });
    }
    
    setupMenuHighlight() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('mouseenter', () => {
                navItems.forEach(nav => nav.classList.remove('hover'));
                item.classList.add('hover');
            });
            
            item.addEventListener('mouseleave', () => {
                item.classList.remove('hover');
            });
        });
    }
    
    showNotification(message, type = 'info') {
        // Remove existing notifications
        document.querySelectorAll('.global-notification').forEach(n => n.remove());
        
        const notification = document.createElement('div');
        notification.className = `global-notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 
                               type === 'error' ? 'exclamation-circle' : 
                               type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const sidebar = new ConsistentSidebar();
    sidebar.init();
});