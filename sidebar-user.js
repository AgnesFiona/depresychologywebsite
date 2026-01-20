function loadUserSidebar() {
    const user = window.AuthSystem ? window.AuthSystem.getCurrentUser() : null;
    
    const sidebarHTML = `
        <!-- Sidebar -->
        <div class="sidebar">
            <div class="sidebar-content">
                <!-- Brand Section -->
                <div class="brand-section">
                    <div class="brand-icon">
                        <img src="Logo Depression Web.png" alt="Depresychology Logo" class="brand-logo-img">
                    </div>
                    <div class="brand-name">Depresychology</div>
                    <div class="brand-tagline">Mental Health Assistant</div>
                </div>
                
                <!-- User Section -->
                <div class="user-section">
                    <div class="user-card">
                        <div class="user-name">
                            <span id="sidebar-user-name">${user ? user.name : 'Pengguna'}</span>
                        </div>
                        <div class="user-status" id="sidebar-user-status">
                            ${user ? (user.role === 'admin' ? 'Administrator' : 'User Terdaftar') : 'Pengunjung'}
                        </div>
                        <div class="user-details">
                            <div class="detail-item">
                                <div class="detail-icon">📧</div>
                                <span id="sidebar-user-email">${user ? user.email : 'user@example.com'}</span>
                            </div>
                            <div class="detail-item">
                                <div class="detail-icon">❤️</div>
                                <span>Mental Health Score: <span id="sidebar-health-score">85</span></span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Menu Section -->
                <div class="menu-section">
                    <div class="menu-title">NAVIGASI UTAMA</div>
                    
                    <a href="dashboard.html" class="menu-item" onclick="setActiveMenu('dashboard')">
                        <div class="menu-icon">📊</div>
                        <div class="menu-text">Dashboard</div>
                    </a>
                    
                    <a href="dataset.html" class="menu-item" onclick="setActiveMenu('dataset')">
                        <div class="menu-icon">🗃️</div>
                        <div class="menu-text">Dataset</div>
                    </a>
                    
                    <a href="analisa.html" class="menu-item" onclick="setActiveMenu('analisa')">
                        <div class="menu-icon">🔬</div>
                        <div class="menu-text">Analisis</div>
                    </a>
                    
                    <a href="input.html" class="menu-item" onclick="setActiveMenu('input')">
                        <div class="menu-icon">📝</div>
                        <div class="menu-text">Test Depression</div>
                    </a>
                    
                    <a href="hasil.html" class="menu-item" onclick="setActiveMenu('hasil')">
                        <div class="menu-icon">📈</div>
                        <div class="menu-text">Hasil Test</div>
                    </a>
                    
                    <a href="riwayat.html" class="menu-item" onclick="setActiveMenu('riwayat')">
                        <div class="menu-icon">📋</div>
                        <div class="menu-text">Riwayat</div>
                    </a>
                    
                    <div class="menu-title">LAINNYA</div>
                    
                    <a href="tentang.html" class="menu-item" onclick="setActiveMenu('tentang')">
                        <div class="menu-icon">ℹ️</div>
                        <div class="menu-text">Tentang</div>
                    </a>
                    
                    <!-- Logout Button -->
                    <a href="index.html" class="logout-menu-item" onclick="return confirmLogout()">
                        <div class="menu-icon">🔑</div>
                        <div class="menu-text">Logout</div>
                    </a>
                </div>
            </div>
        </div>
    `;
    
    // Inject sidebar
    document.body.insertAdjacentHTML('afterbegin', sidebarHTML);
    
    // Update user info
    if (user) {
        updateSidebarUserInfo();
    }
    
    // Set active menu based on current page
    setCurrentActiveMenu();
    
    console.log('User sidebar loaded');
}

function updateSidebarUserInfo() {
    const user = window.AuthSystem ? window.AuthSystem.getCurrentUser() : null;
    if (!user) return;
    
    // Update user info in sidebar
    const nameElement = document.getElementById('sidebar-user-name');
    const emailElement = document.getElementById('sidebar-user-email');
    const statusElement = document.getElementById('sidebar-user-status');
    
    if (nameElement) nameElement.textContent = user.name || 'Pengguna';
    if (emailElement) emailElement.textContent = user.email || 'user@example.com';
    if (statusElement) {
        statusElement.textContent = user.role === 'admin' ? 'Administrator' : 'User Terdaftar';
    }
    
    // Update health score (dummy data for now)
    updateHealthScore();
}

function updateHealthScore() {
    try {
        const assessments = JSON.parse(localStorage.getItem('userAssessments') || '[]');
        const currentUser = window.AuthSystem ? window.AuthSystem.getCurrentUser() : null;
        
        if (!currentUser) return;
        
        // Filter assessments for current user
        const userAssessments = assessments.filter(a => a.userId === currentUser.id);
        if (userAssessments.length === 0) return;
        
        // Get latest assessment score
        const latestAssessment = userAssessments[userAssessments.length - 1];
        const score = latestAssessment.percentage || latestAssessment.score || 85;
        
        const scoreElement = document.getElementById('sidebar-health-score');
        if (scoreElement) {
            scoreElement.textContent = score;
            
            // Color code based on score
            if (score < 50) {
                scoreElement.style.color = '#f56565'; // red
            } else if (score < 70) {
                scoreElement.style.color = '#ed8936'; // orange
            } else {
                scoreElement.style.color = '#48bb78'; // green
            }
        }
    } catch (error) {
        console.error('Error updating health score:', error);
    }
}

function setCurrentActiveMenu() {
    const currentPage = window.location.pathname.split('/').pop();
    const menuMap = {
        'dashboard.html': 'dashboard',
        'dataset.html': 'dataset',
        'analisa.html': 'analisa',
        'input.html': 'input',
        'hasil.html': 'hasil',
        'riwayat.html': 'riwayat',
        'tentang.html': 'tentang',
        'admin.html': 'admin'
    };
    
    const currentMenu = menuMap[currentPage];
    if (currentMenu) {
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href') === currentPage || 
                item.onclick && item.onclick.toString().includes(currentMenu)) {
                item.classList.add('active');
            }
        });
    }
}

function setActiveMenu(menu) {
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    event.currentTarget.classList.add('active');
}

function confirmLogout() {
    if (window.AuthSystem) {
        window.AuthSystem.logout();
        return false;
    }
    return true;
}

// Load sidebar when document is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        // Only load sidebar for user pages, not login page
        const currentPage = window.location.pathname.split('/').pop();
        if (currentPage !== 'index.html' && currentPage !== '') {
            loadUserSidebar();
        }
    });
} else {
    // Document is already ready
    const currentPage = window.location.pathname.split('/').pop();
    if (currentPage !== 'index.html' && currentPage !== '') {
        loadUserSidebar();
    }
}

// Export functions
window.Sidebar = {
    loadUserSidebar,
    updateSidebarUserInfo,
    setActiveMenu
};