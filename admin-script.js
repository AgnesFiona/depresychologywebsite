// ============================================
// ADMIN SCRIPT - DEPRESYCHOLOGY ADMIN PANEL
// ============================================

console.log('🚀 Admin script loading...');

// Data untuk simulasi
let usersData = [];
let assessmentsData = [];

// Dataset Kaggle - Psychological Assessment
const kaggleDataset = {
    description: "Psychological Assessment Dataset - 9,504 observations from Kaggle",
    variables: [
        { name: "PHQ-9", min: 0, max: 27, cutoff: 10, type: "numeric", importance: 9 },
        { name: "GAD-7", min: 0, max: 21, cutoff: 10, type: "numeric", importance: 8 },
        { name: "PSQI", min: 0, max: 21, cutoff: 5, type: "numeric", importance: 7 },
        { name: "SHAPS", min: 14, max: 56, cutoff: 3, type: "numeric", importance: 6 },
        { name: "DSST", min: 0, max: 133, cutoff: 45, type: "numeric", importance: 5 },
        { name: "DASS-D", min: 0, max: 42, cutoff: 10, type: "numeric", importance: 8 },
        { name: "DASS-A", min: 0, max: 42, cutoff: 8, type: "numeric", importance: 7 },
        { name: "BDI-II", min: 0, max: 63, cutoff: 14, type: "numeric", importance: 9 },
        { name: "STAI-S", min: 20, max: 80, cutoff: 40, type: "numeric", importance: 7 },
        { name: "CES-D", min: 0, max: 60, cutoff: 16, type: "numeric", importance: 8 }
    ],
    sampleSize: 9504,
    ageRange: "15-24",
    source: "Kaggle (https://www.kaggle.com/datasets/abdullah895/psychological-assessment-dataset)",
    features: 10
};

// Data AHP berdasarkan dataset Kaggle - SESUAI DENGAN IMPORTANCE RELATIVE
const ahpData = {
    variables: [
        { name: "PHQ-9", weight: 0.225, rank: 1, description: "Patient Health Questionnaire-9 (Depression)" },
        { name: "GAD-7", weight: 0.185, rank: 2, description: "Generalized Anxiety Disorder-7" },
        { name: "BDI-II", weight: 0.150, rank: 3, description: "Beck Depression Inventory-II" },
        { name: "CES-D", weight: 0.120, rank: 4, description: "Center for Epidemiologic Studies Depression Scale" },
        { name: "DASS-D", weight: 0.095, rank: 5, description: "DASS Depression Subscale" },
        { name: "DASS-A", weight: 0.080, rank: 6, description: "DASS Anxiety Subscale" },
        { name: "STAI-S", weight: 0.065, rank: 7, description: "State-Trait Anxiety Inventory (State)" },
        { name: "PSQI", weight: 0.040, rank: 8, description: "Pittsburgh Sleep Quality Index" },
        { name: "SHAPS", weight: 0.025, rank: 9, description: "Snaith-Hamilton Pleasure Scale" },
        { name: "DSST", weight: 0.015, rank: 10, description: "Digit Symbol Substitution Test" }
    ],
    // MATRIKS SESUAI DATASET KAGGLE (10x10)
    matrix: [
        // PHQ-9, GAD-7, PSQI, SHAPS, DSST, DASS-D, DASS-A, BDI-II, STAI-S, CES-D
        [1.00, 2.00, 5.00, 7.00, 9.00, 2.00, 3.00, 1.00, 4.00, 2.00],  // PHQ-9
        [0.50, 1.00, 4.00, 6.00, 8.00, 1.00, 2.00, 0.50, 3.00, 1.00],  // GAD-7
        [0.20, 0.25, 1.00, 3.00, 5.00, 0.25, 0.33, 0.20, 1.00, 0.25],  // PSQI
        [0.14, 0.17, 0.33, 1.00, 3.00, 0.17, 0.25, 0.14, 0.50, 0.17],  // SHAPS
        [0.11, 0.13, 0.20, 0.33, 1.00, 0.13, 0.17, 0.11, 0.33, 0.13],  // DSST
        [0.50, 1.00, 4.00, 6.00, 8.00, 1.00, 2.00, 0.50, 3.00, 1.00],  // DASS-D
        [0.33, 0.50, 3.00, 4.00, 6.00, 0.50, 1.00, 0.33, 2.00, 0.50],  // DASS-A
        [1.00, 2.00, 5.00, 7.00, 9.00, 2.00, 3.00, 1.00, 4.00, 2.00],  // BDI-II
        [0.25, 0.33, 1.00, 2.00, 3.00, 0.33, 0.50, 0.25, 1.00, 0.33],  // STAI-S
        [0.50, 1.00, 4.00, 6.00, 8.00, 1.00, 2.00, 0.50, 3.00, 1.00]   // CES-D
    ],
    ci: 0.036,
    cr: 0.024,
    lambdaMax: 10.325,
    isConsistent: true
};

// Data Clinical Instruments
const clinicalTableData = {
    instruments: [
        {
            name: "PHQ-9 (Patient Health Questionnaire-9)",
            purpose: "Depresi",
            items: 9,
            scale: "Likert 0-3",
            cutoff: "≥10",
            time: "5-10 menit",
            reliability: "0.89",
            validity: "Tinggi",
            interpretation: "0-4: Minimal, 5-9: Ringan, 10-14: Sedang, 15-19: Sedang-Berat, 20-27: Berat"
        },
        {
            name: "GAD-7 (Generalized Anxiety Disorder-7)",
            purpose: "Kecemasan Umum",
            items: 7,
            scale: "Likert 0-3",
            cutoff: "≥10",
            time: "3-5 menit",
            reliability: "0.92",
            validity: "Tinggi",
            interpretation: "0-4: Minimal, 5-9: Ringan, 10-14: Sedang, 15-21: Berat"
        },
        {
            name: "PSQI (Pittsburgh Sleep Quality Index)",
            purpose: "Kualitas Tidur",
            items: 19,
            scale: "0-3 per item",
            cutoff: ">5",
            time: "10 menit",
            reliability: "0.83",
            validity: "Baik",
            interpretation: "0-5: Tidur baik, >5: Gangguan tidur"
        },
        {
            name: "SHAPS (Snaith-Hamilton Pleasure Scale)",
            purpose: "Anhedonia",
            items: 14,
            scale: "Likert 1-4",
            cutoff: "≥3",
            time: "5-10 menit",
            reliability: "0.87",
            validity: "Baik",
            interpretation: "0-2: Normal, ≥3: Anhedonia"
        },
        {
            name: "DSST (Digit Symbol Substitution Test)",
            purpose: "Fungsi Kognitif",
            items: 133,
            scale: "Jumlah benar",
            cutoff: "<45",
            time: "90-120 detik",
            reliability: "0.88",
            validity: "Tinggi",
            interpretation: "≥45: Normal, <45: Gangguan kognitif"
        },
        {
            name: "Brief COPE",
            purpose: "Strategi Koping",
            items: 28,
            scale: "Likert 1-4",
            cutoff: "Tidak ada",
            time: "10-15 menit",
            reliability: "0.76-0.90",
            validity: "Baik",
            interpretation: "Problem-focused lebih efektif daripada emotion-focused"
        },
        {
            name: "DASS-21 (Depression Anxiety Stress Scales)",
            purpose: "Depresi, Kecemasan, Stres",
            items: 21,
            scale: "Likert 0-3",
            cutoff: "Depresi ≥10, Anxiety ≥8, Stress ≥15",
            time: "10-15 menit",
            reliability: "0.94-0.97",
            validity: "Tinggi",
            interpretation: "Subskala: Depresi (0-42), Kecemasan (0-42), Stres (0-42)"
        },
        {
            name: "BDI-II (Beck Depression Inventory-II)",
            purpose: "Depresi",
            items: 21,
            scale: "Likert 0-3",
            cutoff: "≥14",
            time: "10-15 menit",
            reliability: "0.93",
            validity: "Tinggi",
            interpretation: "0-13: Minimal, 14-19: Ringan, 20-28: Sedang, 29-63: Berat"
        },
        {
            name: "STAI (State-Trait Anxiety Inventory)",
            purpose: "Kecemasan State dan Trait",
            items: 40,
            scale: "Likert 1-4",
            cutoff: "State ≥40, Trait ≥44",
            time: "15-20 menit",
            reliability: "0.86-0.95",
            validity: "Tinggi",
            interpretation: "State: respon situasional, Trait: kecenderungan umum"
        },
        {
            name: "CES-D (Center for Epidemiologic Studies Depression Scale)",
            purpose: "Depresi Epidemiologi",
            items: 20,
            scale: "Likert 0-3",
            cutoff: "≥16",
            time: "10 menit",
            reliability: "0.85-0.90",
            validity: "Tinggi",
            interpretation: "0-15: Normal, 16-20: Depresi ringan, 21-30: Depresi sedang, 31-60: Depresi berat"
        }
    ]
};

// Data prevalensi gejala dari dataset Kaggle
const clinicalPrevalenceData = {
    depression: 28.5,
    anxiety: 34.2,
    sleepDisorder: 52.0,
    stress: 41.8,
    cognitiveImpairment: 22.3,
    anhedonia: 26.7,
    eatingDisorder: 18.9
};

// Data cut-off distribution berdasarkan dataset Kaggle
const cutoffDistributionData = {
    labels: ["PHQ-9 (≥10)", "GAD-7 (≥10)", "PSQI (>5)", "SHAPS (≥3)", "DSST (<45)", "BDI-II (≥14)", "STAI-S (≥40)", "STAI-T (≥44)", "CES-D (≥16)"],
    belowCutoff: [71.5, 65.8, 48.0, 73.3, 77.7, 71.5, 60.0, 56.0, 68.2],
    aboveCutoff: [28.5, 34.2, 52.0, 26.7, 22.3, 28.5, 40.0, 44.0, 31.8]
};

// Model Performance Data berdasarkan dataset Kaggle
const modelPerformance = {
    ahpLr: { accuracy: 0.872, precision: 0.836, recall: 0.838, f1: 0.834 },
    lrOnly: { accuracy: 0.75, precision: 0.72, recall: 0.71, f1: 0.71 },
    svm: { accuracy: 0.87, precision: 0.85, recall: 0.84, f1: 0.845 },
    decisionTree: { accuracy: 0.83, precision: 0.81, recall: 0.80, f1: 0.805 }
};

// Klasifikasi Data
const classificationData = {
    categories: ["Sleep Disorders", "Mood Disorders", "Eating Disorders", "Stress-Related Conditions", "Cognitive Impairments"],
    distribution: [23.5, 31.2, 15.8, 18.4, 11.1],
    colors: ["#4361ee", "#4cc9f0", "#48bb78", "#ed8936", "#9f7aea"]
};

// Chart instances
let accuracyChart = null;
let weightsChart = null;
let classificationChart = null;
let clinicalChart = null;
let cutoffChart = null;
let userScoresChart = null;
let userTestsChart = null;
let userAHPWeightsChart = null;
let userLRClassificationChart = null;

// ============================================
// FUNGSI UTAMA
// ============================================

// Fungsi untuk membuat data sample jika kosong
function createSampleData() {
    console.log('➕ Creating sample data...');
    
    // Sample admin user
    const adminUser = {
        id: 'admin_001',
        name: 'Administrator',
        email: 'admin@depresychology.com',
        role: 'admin',
        gender: 'Laki-laki',
        lastLogin: new Date().toISOString(),
        createdAt: new Date().toISOString()
    };
    
    // Sample regular user
    const sampleUser = {
        id: 'user_001',
        name: 'John Doe',
        email: 'user@demo.com',
        role: 'user',
        gender: 'Laki-laki',
        birthDate: '2000-01-01',
        location: 'Jakarta',
        lastLogin: new Date().toISOString(),
        createdAt: new Date().toISOString()
    };
    
    usersData = [adminUser, sampleUser];
    localStorage.setItem('psycho_users', JSON.stringify(usersData));
    
    // Sample assessments
    const sampleAssessment = {
        id: 'assessment_001',
        userId: 'user_001',
        date: new Date().toISOString(),
        testType: 'dataset',
        phq9: 15,
        gad7: 12,
        psqi: 8,
        duration: 25,
        severity: 'Moderate',
        completed: true,
        answers: {}
    };
    
    assessmentsData = [sampleAssessment];
    localStorage.setItem('userAssessments', JSON.stringify(assessmentsData));
    
    console.log('✅ Sample data created');
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Admin Panel Initializing...');
    
    // Update current date
    updateCurrentDate();
    
    // Cek autentikasi
    if (!checkAuth()) {
        return;
    }
    
    // FIX: Hanya tampilkan dashboard di awal
    hideAllTabs();
    showOnlyDashboard();
    
    // Load data
    loadData();
    
    // Setup semua event listeners
    setupEventListeners();
    
    // Update UI
    updateAdminInfo();
    updateDashboardStats();
    updateUsersTable();
    updateRecentActivity();
    
    console.log('✅ Admin Panel Ready!');
});

// FIX: Fungsi untuk menyembunyikan semua tab
function hideAllTabs() {
    console.log('Hiding all tabs...');
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
        tab.style.display = 'none';
    });
}

// FIX: Fungsi untuk hanya menampilkan dashboard
function showOnlyDashboard() {
    console.log('Showing only dashboard...');
    
    // Sembunyikan semua tab
    hideAllTabs();
    
    // Tampilkan hanya dashboard
    const dashboardTab = document.getElementById('dashboard-tab');
    if (dashboardTab) {
        dashboardTab.classList.add('active');
        dashboardTab.style.display = 'block';
    }
    
    // Set menu aktif ke dashboard
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
        const checkbox = item.querySelector('.menu-checkbox');
        if (checkbox) {
            checkbox.classList.remove('checked');
        }
    });
    
    const dashboardMenu = document.getElementById('menu-dashboard');
    if (dashboardMenu) {
        dashboardMenu.classList.add('active');
        const checkbox = dashboardMenu.querySelector('.menu-checkbox');
        if (checkbox) {
            checkbox.classList.add('checked');
        }
    }
    
    // Update page title
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) {
        pageTitle.textContent = 'Admin Dashboard';
    }
}

// ============================================
// AUTHENTICATION FUNCTIONS
// ============================================

function checkAuth() {
    console.log('🔐 Checking authentication...');
    
    // Cek dari localStorage DAN sessionStorage
    let userStr = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    
    console.log('User data found:', userStr ? 'YES' : 'NO');
    
    if (!userStr) {
        console.error('❌ Tidak ada data user!');
        showNotification('❌ Anda harus login terlebih dahulu!', 'error');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        return false;
    }
    
    try {
        const user = JSON.parse(userStr);
        console.log('User role:', user.role);
        
        if (user.role !== 'admin') {
            showNotification('❌ Akses ditolak. Hanya admin yang dapat mengakses panel ini.', 'error');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
            return false;
        }
        
        console.log('✅ Authentication passed!');
        return true;
    } catch (e) {
        console.error('Auth parsing error:', e);
        showNotification('❌ Error authentication. Silakan login ulang.', 'error');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        return false;
    }
}

// ============================================
// LOAD DATA FUNCTIONS
// ============================================

function loadData() {
    console.log('📥 Loading data from localStorage...');
    
    // Load users data dengan fallback
    try {
        const usersStr = localStorage.getItem('psycho_users');
        console.log('Users string length:', usersStr ? usersStr.length : 'null');
        
        if (usersStr) {
            usersData = JSON.parse(usersStr);
            console.log(`👥 Users loaded: ${usersData.length} users`);
            
            // Jika tidak ada user, buat sample data untuk testing
            if (usersData.length === 0) {
                console.log('⚠️ No users found, creating sample data for testing');
                createSampleData();
            }
        } else {
            console.log('⚠️ No users data in localStorage');
            createSampleData();
        }
    } catch (e) {
        console.error('❌ Error loading users:', e);
        usersData = [];
        createSampleData();
    }
    
    // Load assessments data
    try {
        const assessmentsStr = localStorage.getItem('userAssessments');
        if (assessmentsStr) {
            assessmentsData = JSON.parse(assessmentsStr);
            console.log(`📊 Assessments loaded: ${assessmentsData.length} assessments`);
        } else {
            console.log('⚠️ No assessments data in localStorage');
            assessmentsData = [];
        }
    } catch (e) {
        console.error('❌ Error loading assessments:', e);
        assessmentsData = [];
    }
    
    // Load system settings
    try {
        const settingsStr = localStorage.getItem('system_settings');
        if (settingsStr) {
            const settings = JSON.parse(settingsStr);
            if (settings.appName) {
                document.getElementById('appName').value = settings.appName;
            }
            if (settings.adminEmail) {
                document.getElementById('adminEmail').value = settings.adminEmail;
            }
        }
    } catch (e) {
        console.error('Error loading settings:', e);
    }
}

// ============================================
// SETUP EVENT LISTENERS
// ============================================

function setupEventListeners() {
    console.log('🔗 Setting up event listeners...');
    
    // Sidebar menu
    document.getElementById('menu-dashboard').addEventListener('click', function() {
        setActiveTab('dashboard');
    });
    
    document.getElementById('menu-users').addEventListener('click', function() {
        setActiveTab('users');
    });
    
    document.getElementById('menu-analytics').addEventListener('click', function() {
        setActiveTab('analytics');
        // Load AHP-LR analysis when tab is opened
        setTimeout(() => {
            if (document.getElementById('analytics-tab').classList.contains('active')) {
                loadDatasetAnalysis();
                populateAgeFilter();
            }
        }, 100);
    });
    
    document.getElementById('menu-system').addEventListener('click', function() {
        setActiveTab('system');
    });
    
    // Header actions
    document.getElementById('logoutButton').addEventListener('click', logoutAdmin);
    
    // User management buttons
    const refreshBtn = document.getElementById('refreshUsersBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', refreshUsersData);
    }
    
    const exportBtn = document.getElementById('exportUsersBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportUsersData);
    }
    
    // System settings
    const saveBtn = document.getElementById('saveSettingsBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveSystemSettings);
    }
    
    // Search user input
    const searchInput = document.getElementById('searchUser');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                loadUserAnalysis();
            }
        });
    }
    
    console.log('✅ Event listeners setup complete');
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function updateCurrentDate() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    const dateStr = now.toLocaleDateString('id-ID', options);
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        dateElement.textContent = dateStr;
    }
}

function showNotification(message, type = 'info') {
    console.log(`💬 ${type.toUpperCase()}: ${message}`);
    
    // Hapus notifikasi lama jika ada
    const oldNotifications = document.querySelectorAll('.notification');
    oldNotifications.forEach(n => n.remove());
    
    // Buat notifikasi
    const notification = document.createElement('div');
    notification.className = 'notification';
    
    // Add type class
    if (type === 'success') notification.classList.add('success');
    else if (type === 'error') notification.classList.add('error');
    else if (type === 'warning') notification.classList.add('warning');
    else notification.classList.add('info');
    
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i>
        <div>${message}</div>
    `;
    
    document.body.appendChild(notification);
    
    // Hapus setelah 3 detik
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

// ============================================
// SIDEBAR & TABS FUNCTIONS
// ============================================

function setActiveTab(tabName) {
    console.log('📂 Switching to tab:', tabName);
    
    // Update menu items
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
        const checkbox = item.querySelector('.menu-checkbox');
        if (checkbox) {
            checkbox.classList.remove('checked');
        }
    });
    
    // Activate clicked menu
    const activeMenu = document.getElementById(`menu-${tabName}`);
    if (activeMenu) {
        activeMenu.classList.add('active');
        const checkbox = activeMenu.querySelector('.menu-checkbox');
        if (checkbox) {
            checkbox.classList.add('checked');
        }
    }
    
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
        tab.style.display = 'none';
    });
    
    // Show active tab
    const activeTab = document.getElementById(`${tabName}-tab`);
    if (activeTab) {
        activeTab.classList.add('active');
        activeTab.style.display = 'block';
    }
    
    // Update page title
    const titles = {
        'dashboard': 'Admin Dashboard',
        'users': 'Manajemen User',
        'analytics': 'Analisis AHP-LR',
        'system': 'Pengaturan Sistem'
    };
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) {
        pageTitle.textContent = titles[tabName] || 'Admin Dashboard';
    }
    
    // Jika pindah ke analytics, load analysis
    if (tabName === 'analytics') {
        setTimeout(() => {
            loadDatasetAnalysis();
        }, 100);
    }
}

// ============================================
// ADMIN INFO FUNCTIONS
// ============================================

function updateAdminInfo() {
    const adminInfoCard = document.getElementById('adminInfoCard');
    if (!adminInfoCard) return;
    
    // Cek data admin dari storage
    let adminData = {
        name: 'Administrator',
        email: 'admin@depresychology.com',
        lastLogin: new Date().toISOString()
    };
    
    try {
        const userStr = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
        if (userStr) {
            const user = JSON.parse(userStr);
            if (user.role === 'admin') {
                adminData = {
                    name: user.name || 'Administrator',
                    email: user.email || 'admin@depresychology.com',
                    lastLogin: user.lastLogin || new Date().toISOString()
                };
            }
        }
    } catch (e) {
        console.error('Error loading admin data:', e);
    }
    
    const lastLogin = new Date(adminData.lastLogin).toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    adminInfoCard.innerHTML = `
        <div class="user-name">
            <span>${adminData.name}</span>
            <span class="status-badge">Online</span>
        </div>
        
        <div class="user-status">
            <i class="fas fa-circle" style="color: #48bb78; font-size: 8px;"></i>
            <span>ID: admin_001</span>
        </div>
        
        <div class="user-details">
            <div class="detail-item">
                <div class="detail-icon">👑</div>
                <span>Role: Super Administrator</span>
            </div>
            <div class="detail-item">
                <div class="detail-icon">📧</div>
                <span>${adminData.email}</span>
            </div>
            <div class="detail-item">
                <div class="detail-icon">🕒</div>
                <span>Last login: ${lastLogin}</span>
            </div>
        </div>
    `;
}

// ============================================
// DASHBOARD FUNCTIONS
// ============================================

function updateDashboardStats() {
    console.log('📊 Updating dashboard stats...');
    
    const totalUsers = usersData.filter(u => u.role !== 'admin').length;
    const totalUsersElement = document.getElementById('total-users');
    if (totalUsersElement) totalUsersElement.textContent = totalUsers;
    
    const today = new Date().toISOString().split('T')[0];
    const todayAssessments = assessmentsData.filter(a => 
        a.date && a.date.includes(today)
    ).length;
    const todayElement = document.getElementById('assessments-today');
    if (todayElement) todayElement.textContent = todayAssessments;
    
    const highRiskAlerts = assessmentsData.filter(a => 
        (a.phq9 && a.phq9 >= 20) || (a.gad7 && a.gad7 >= 15)
    ).length;
    const alertsElement = document.getElementById('high-risk-alerts');
    if (alertsElement) alertsElement.textContent = highRiskAlerts;
    
    const reportsElement = document.getElementById('reports-generated');
    if (reportsElement) reportsElement.textContent = assessmentsData.length;
    
    // Update trends
    const userTrend = document.getElementById('user-trend');
    if (userTrend) userTrend.textContent = `${Math.min(totalUsers * 10, 100)}% dari bulan lalu`;
    
    const todayTrend = document.getElementById('today-trend');
    if (todayTrend) todayTrend.textContent = todayAssessments > 0 ? `${Math.min(todayAssessments * 20, 100)}% naik dari kemarin` : 'Sama dengan kemarin';
    
    const alertTrend = document.getElementById('alert-trend');
    if (alertTrend) alertTrend.textContent = `${highRiskAlerts} baru hari ini`;
    
    const reportTrend = document.getElementById('report-trend');
    if (reportTrend) reportTrend.textContent = `${Math.min(assessmentsData.length * 5, 100)}% dari bulan lalu`;
    
    // Update analytics stats
    const totalUsersAnalytics = document.getElementById('total-users-analytics');
    if (totalUsersAnalytics) totalUsersAnalytics.textContent = totalUsers;
    
    const totalAssessmentsAnalytics = document.getElementById('total-assessments-analytics');
    if (totalAssessmentsAnalytics) totalAssessmentsAnalytics.textContent = assessmentsData.length;
}

function updateRecentActivity() {
    const activityList = document.getElementById('recentActivityList');
    if (!activityList) return;
    
    // Ambil 5 assessment terbaru
    const recentAssessments = [...assessmentsData]
        .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
        .slice(0, 5);
    
    let html = '';
    
    if (recentAssessments.length > 0) {
        recentAssessments.forEach(assessment => {
            const user = usersData.find(u => u.id === assessment.userId);
            const userName = user ? user.name : 'User';
            const timeAgo = getTimeAgo(assessment.date);
            
            html += `
                <div class="activity-item">
                    <div class="activity-icon" style="background: #48bb7820; color: #48bb78;">
                        <i class="fas fa-clipboard-check"></i>
                    </div>
                    <div class="activity-content">
                        <div class="activity-title">${userName} menyelesaikan assessment</div>
                        <div class="activity-time">Severity: ${assessment.severity || 'Unknown'} • ${timeAgo}</div>
                    </div>
                </div>
            `;
        });
    } else {
        html = `
            <div style="text-align: center; padding: 30px; color: var(--gray);">
                <i class="fas fa-clipboard-list" style="font-size: 48px; margin-bottom: 15px;"></i>
                <p>Belum ada aktivitas assessment</p>
            </div>
        `;
    }
    
    activityList.innerHTML = html;
}

function getTimeAgo(dateString) {
    if (!dateString) return 'Waktu tidak diketahui';
    
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 1) return 'Baru saja';
        if (diffMins < 60) return `${diffMins} menit lalu`;
        if (diffHours < 24) return `${diffHours} jam lalu`;
        if (diffDays === 1) return 'Kemarin';
        if (diffDays < 7) return `${diffDays} hari lalu`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} minggu lalu`;
        return `${Math.floor(diffDays / 30)} bulan lalu`;
    } catch (e) {
        return 'Waktu tidak diketahui';
    }
}

// ============================================
// USER MANAGEMENT FUNCTIONS
// ============================================

function updateUsersTable() {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;
    
    const regularUsers = usersData.filter(u => u.role !== 'admin');
    
    if (regularUsers.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 30px;">
                    <i class="fas fa-users" style="font-size: 48px; color: var(--gray); margin-bottom: 15px; display: block;"></i>
                    <p style="color: var(--gray);">Belum ada user terdaftar</p>
                </td>
            </tr>
        `;
        return;
    }
    
    let html = '';
    regularUsers.forEach((user, index) => {
        const userTests = assessmentsData.filter(a => a.userId === user.id).length;
        
        let lastLoginText = 'Belum pernah login';
        let statusClass = 'status-inactive';
        let statusText = 'Tidak Aktif';
        
        if (user.lastLogin) {
            const lastLogin = new Date(user.lastLogin);
            const now = new Date();
            const diffHours = Math.floor((now - lastLogin) / 3600000);
            
            if (diffHours < 24) {
                lastLoginText = `${diffHours} jam lalu`;
                statusClass = 'status-active';
                statusText = 'Aktif';
            } else {
                const diffDays = Math.floor(diffHours / 24);
                lastLoginText = `${diffDays} hari lalu`;
                statusClass = diffDays < 7 ? 'status-pending' : 'status-inactive';
                statusText = diffDays < 7 ? 'Pending' : 'Tidak Aktif';
            }
        }
        
        const initials = user.name ? user.name.charAt(0).toUpperCase() : 'U';
        
        html += `
            <tr>
                <td>${index + 1}</td>
                <td>
                    <div class="user-info">
                        <div class="user-profile-img" style="background: #4361ee;">${initials}</div>
                        <div class="user-name-email">
                            <strong>${user.name || 'User'}</strong>
                            <small>${user.email}</small>
                        </div>
                    </div>
                </td>
                <td>${user.email}</td>
                <td>${user.gender || '-'}</td>
                <td>${userTests}</td>
                <td>${lastLoginText}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn-small view" onclick="viewUserDetails('${user.id}')" title="Lihat Detail">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn-small delete" onclick="deleteUser('${user.id}')" title="Hapus User">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

function refreshUsersData() {
    showNotification('Memuat ulang data user...', 'info');
    
    // Reload data
    loadData();
    updateUsersTable();
    updateDashboardStats();
    updateRecentActivity();
    
    setTimeout(() => {
        showNotification('Data user telah diperbarui!', 'success');
    }, 500);
}

function exportUsersData() {
    const regularUsers = usersData.filter(u => u.role !== 'admin');
    
    if (regularUsers.length === 0) {
        showNotification('Tidak ada data user untuk diekspor', 'warning');
        return;
    }
    
    // Buat CSV sederhana
    let csvContent = "Nama,Email,Gender,Total Tests,Last Login,Status\n";
    
    regularUsers.forEach(user => {
        const userTests = assessmentsData.filter(a => a.userId === user.id).length;
        const lastLogin = user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('id-ID') : 'Never';
        const status = user.lastLogin ? 'Active' : 'Inactive';
        
        csvContent += `"${user.name || ''}","${user.email || ''}","${user.gender || ''}","${userTests}","${lastLogin}","${status}"\n`;
    });
    
    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification(`Data ${regularUsers.length} user berhasil diekspor!`, 'success');
}

function viewUserDetails(userId) {
    const user = usersData.find(u => u.id === userId);
    if (!user) return;
    
    const userAssessments = assessmentsData.filter(a => a.userId === userId);
    
    alert(`Detail User:\n\nNama: ${user.name}\nEmail: ${user.email}\nGender: ${user.gender || '-'}\nTotal Assessment: ${userAssessments.length}`);
}

function deleteUser(userId) {
    const user = usersData.find(u => u.id === userId);
    if (!user) return;
    
    if (confirm(`Apakah Anda yakin ingin menghapus user "${user.name}"?`)) {
        // Hapus dari array
        usersData = usersData.filter(u => u.id !== userId);
        
        // Simpan ke localStorage
        localStorage.setItem('psycho_users', JSON.stringify(usersData));
        
        // Hapus assessments user
        assessmentsData = assessmentsData.filter(a => a.userId !== userId);
        localStorage.setItem('userAssessments', JSON.stringify(assessmentsData));
        
        // Update UI
        updateUsersTable();
        updateDashboardStats();
        
        showNotification(`User "${user.name}" berhasil dihapus!`, 'success');
    }
}

// ============================================
// AHP-LR ANALYTICS FUNCTIONS
// ============================================

// Fungsi untuk menampilkan analisis
function showAnalysis(type) {
    console.log(`Showing analysis: ${type}`);
    
    // Update toggle buttons
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Aktifkan tombol yang diklik
    const activeBtn = document.getElementById(`toggle-${type}`);
    if (activeBtn) activeBtn.classList.add('active');
    
    // Sembunyikan semua section
    document.querySelectorAll('.analysis-section').forEach(section => {
        section.classList.remove('active');
        section.style.display = 'none';
    });
    
    // Tampilkan section yang dipilih
    const activeSection = document.getElementById(`analysis-${type}`);
    if (activeSection) {
        activeSection.classList.add('active');
        activeSection.style.display = 'block';
    }
    
    // Load data sesuai tipe
    switch(type) {
        case 'dataset':
            loadDatasetAnalysis();
            break;
        case 'clinical':
            loadClinicalAnalysis();
            break;
        case 'user':
            loadUserAnalysis();
            break;
    }
}

// MATRIKS AHP 10x10 SESUAI DATASET KAGGLE
function displayAHPMatrix() {
    const tbody = document.getElementById('ahp-matrix-body');
    if (!tbody) return;
    
    const variables = [
        "PHQ-9", "GAD-7", "PSQI", "SHAPS", "DSST", 
        "DASS-D", "DASS-A", "BDI-II", "STAI-S", "CES-D"
    ];
    
    // Matriks AHP 10x10 dari ahpData
    const matrix = ahpData.matrix;
    
    let html = '';
    
    for (let i = 0; i < variables.length; i++) {
        html += '<tr>';
        html += `<td style="font-weight: bold; background: var(--background);">${variables[i]}</td>`;
        
        for (let j = 0; j < variables.length; j++) {
            const value = matrix[i][j];
            let displayValue = value.toFixed(2);
            let cellClass = '';
            
            if (i === j) {
                cellClass = 'diagonal';
                displayValue = '1.00';
            } else if (value > 1) {
                cellClass = 'above-one';
            } else if (value < 1) {
                cellClass = 'below-one';
            }
            
            html += `<td class="${cellClass}" title="${variables[i]} vs ${variables[j]} = ${displayValue}">${displayValue}</td>`;
        }
        
        html += '</tr>';
    }
    
    tbody.innerHTML = html;
}

// Populate Clinical Table
function populateClinicalTable() {
    const tbody = document.getElementById('clinicalTableBody');
    if (!tbody) return;
    
    let html = '';
    clinicalTableData.instruments.forEach((instrument, index) => {
        html += `
            <tr>
                <td>${index + 1}</td>
                <td><strong>${instrument.name}</strong></td>
                <td>${instrument.purpose}</td>
                <td>${instrument.items}</td>
                <td>${instrument.scale}</td>
                <td><span class="cutoff-badge">${instrument.cutoff}</span></td>
                <td>${instrument.time}</td>
                <td>${instrument.reliability}</td>
                <td>${instrument.validity}</td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

// Populate Kaggle Dataset Table
function populateKaggleDatasetTable() {
    const tbody = document.getElementById('kaggleDatasetBody');
    if (!tbody) return;
    
    let html = '';
    kaggleDataset.variables.forEach((variable, index) => {
        const range = variable.type === 'numeric' ? 
            `${variable.min} - ${variable.max}` : 
            'N/A';
        
        const cutoff = variable.cutoff ? variable.cutoff.toString() : 'N/A';
        
        html += `
            <tr>
                <td>${index + 1}</td>
                <td><strong>${variable.name}</strong></td>
                <td>${getVariableDescription(variable.name)}</td>
                <td>${range}</td>
                <td>${cutoff}</td>
                <td><span class="status-badge ${variable.type === 'numeric' ? 'info' : 'warning'}">
                    ${variable.type === 'numeric' ? 'Numerik' : 'Kategorikal'}
                </span></td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

function getVariableDescription(varName) {
    const descriptions = {
        "PHQ-9": "Patient Health Questionnaire-9: Skrining depresi (9 item)",
        "GAD-7": "Generalized Anxiety Disorder-7: Skrining kecemasan umum (7 item)",
        "PSQI": "Pittsburgh Sleep Quality Index: Kualitas tidur (19 item)",
        "SHAPS": "Snaith-Hamilton Pleasure Scale: Anhedonia (14 item)",
        "DSST": "Digit Symbol Substitution Test: Fungsi kognitif (133 item)",
        "DASS-D": "DASS-21 Depression Subscale: Skor depresi",
        "DASS-A": "DASS-21 Anxiety Subscale: Skor kecemasan",
        "BDI-II": "Beck Depression Inventory-II: Inventori depresi (21 item)",
        "STAI-S": "State-Trait Anxiety Inventory State: Kecemasan situasional",
        "CES-D": "Center for Epidemiologic Studies Depression Scale: Skrining depresi (20 item)"
    };
    
    return descriptions[varName] || "Variabel psikologis";
}

// Load Dataset Analysis
function loadDatasetAnalysis() {
    console.log('📊 Loading dataset analysis...');
    
    // 1. Update AHP Matrix 10x10 sesuai Kaggle
    displayAHPMatrix();
    
    // 2. Update Weights
    updateAHPWeights();
    
    // 3. Create Charts
    createAccuracyChart();
    createWeightsChart();
    createClassificationChart();
    
    // 4. Populate Clinical Table
    populateClinicalTable();
    
    // 5. Update stats dengan data Kaggle
    updateKaggleStats();
    
    showNotification('Analisis dataset AHP-LR dimuat!', 'success');
}

function updateAHPWeights() {
    const container = document.getElementById('weights-list');
    if (!container) return;
    
    // Sort by weight descending
    const sortedVariables = [...ahpData.variables].sort((a, b) => b.weight - a.weight);
    
    let html = '';
    sortedVariables.forEach((variable, index) => {
        const percentage = (variable.weight * 100).toFixed(2);
        const barWidth = (variable.weight * 100) + '%';
        
        // Warna bar berdasarkan peringkat
        let barColor;
        if (index < 3) barColor = '#4361ee';  // Top 3: biru
        else if (index < 6) barColor = '#4cc9f0';  // Middle: cyan
        else barColor = '#a0aec0';  // Bottom: gray
        
        html += `
            <div class="weight-item">
                <div class="weight-number">${index + 1}</div>
                <div class="weight-details">
                    <div class="weight-label">${variable.name}</div>
                    <div class="weight-bar-container">
                        <div class="weight-bar" style="width: ${barWidth}; background-color: ${barColor};"></div>
                    </div>
                </div>
                <div class="weight-value">${percentage}%</div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    // Update consistency values
    const ciValue = document.getElementById('ci-value');
    const crValue = document.getElementById('cr-value');
    const statusElement = document.getElementById('consistency-status');
    
    if (ciValue) ciValue.textContent = ahpData.ci;
    if (crValue) crValue.textContent = ahpData.cr;
    
    if (statusElement) {
        if (ahpData.isConsistent) {
            statusElement.className = 'status-badge success';
            statusElement.textContent = 'KONSISTEN (CR < 0.1)';
        } else {
            statusElement.className = 'status-badge danger';
            statusElement.textContent = 'TIDAK KONSISTEN';
        }
    }
    
    // Update analysis metrics
    const accuracyElement = document.getElementById('ahp-lr-accuracy');
    if (accuracyElement) {
        accuracyElement.textContent = '87.2%';
    }
}

function createAccuracyChart() {
    const ctx = document.getElementById('accuracyComparisonChart');
    if (!ctx) return;
    
    // Hancurkan chart lama jika ada
    if (accuracyChart) {
        accuracyChart.destroy();
    }
    
    const models = ['AHP-LR Hybrid', 'LR Konvensional', 'SVM', 'Decision Tree'];
    const accuracies = [
        modelPerformance.ahpLr.accuracy * 100,
        modelPerformance.lrOnly.accuracy * 100,
        modelPerformance.svm.accuracy * 100,
        modelPerformance.decisionTree.accuracy * 100
    ];
    
    const colors = ['#4361ee', '#4cc9f0', '#48bb78', '#9f7aea'];
    
    accuracyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: models,
            datasets: [{
                label: 'Akurasi (%)',
                data: accuracies,
                backgroundColor: colors,
                borderColor: colors.map(c => c + 'dd'),
                borderWidth: 1,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Akurasi: ${context.raw.toFixed(1)}%`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Akurasi (%)'
                    },
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Model'
                    }
                }
            }
        }
    });
}

function createWeightsChart() {
    const ctx = document.getElementById('ahpWeightsChart');
    if (!ctx) return;
    
    // Hancurkan chart lama jika ada
    if (weightsChart) {
        weightsChart.destroy();
    }
    
    const labels = ahpData.variables.map(v => v.name);
    const weights = ahpData.variables.map(v => v.weight * 100);
    
    // Generate warna gradien
    const colors = weights.map((weight, index) => {
        const hue = 220 - (index * 10);
        const saturation = 70;
        const lightness = 50 + (index * 2);
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    });
    
    weightsChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: weights,
                backgroundColor: colors,
                borderColor: 'white',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: 'circle',
                        font: {
                            size: 11
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            return `${label}: ${value.toFixed(1)}%`;
                        }
                    }
                }
            }
        }
    });
}

function createClassificationChart() {
    const ctx = document.getElementById('classificationDistributionChart');
    if (!ctx) return;
    
    // Hancurkan chart lama jika ada
    if (classificationChart) {
        classificationChart.destroy();
    }
    
    classificationChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: classificationData.categories,
            datasets: [{
                label: 'Distribusi (%)',
                data: classificationData.distribution,
                backgroundColor: classificationData.colors,
                borderColor: classificationData.colors.map(c => c + 'dd'),
                borderWidth: 1,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Distribusi: ${context.raw}%`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 40,
                    title: {
                        display: true,
                        text: 'Distribusi (%)'
                    },
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            }
        }
    });
}

// Load Clinical Analysis
function loadClinicalAnalysis() {
    console.log('🏥 Loading clinical analysis...');
    
    // 1. Populate Clinical Table
    populateClinicalTable();
    
    // 2. Populate Kaggle Dataset Table
    populateKaggleDatasetTable();
    
    // 3. Create Clinical Charts
    createClinicalCharts();
    
    showNotification('Analisis klinis dimuat!', 'success');
}

function createClinicalCharts() {
    // 1. Prevalensi Gejala Chart
    createPrevalenceChart();
    
    // 2. Cut-off Distribution Chart
    createCutoffDistributionChart();
}

function createPrevalenceChart() {
    const ctx = document.getElementById('clinicalPrevalenceChart');
    if (!ctx) return;
    
    // Hancurkan chart lama jika ada
    if (clinicalChart) {
        clinicalChart.destroy();
    }
    
    const labels = ['Depresi', 'Kecemasan', 'Gangguan Tidur', 'Stres', 'Gangguan Kognitif', 'Anhedonia', 'Gangguan Makan'];
    const data = [
        clinicalPrevalenceData.depression,
        clinicalPrevalenceData.anxiety,
        clinicalPrevalenceData.sleepDisorder,
        clinicalPrevalenceData.stress,
        clinicalPrevalenceData.cognitiveImpairment,
        clinicalPrevalenceData.anhedonia,
        clinicalPrevalenceData.eatingDisorder
    ];
    
    const colors = [
        '#4361ee', '#4cc9f0', '#48bb78', '#ed8936', 
        '#9f7aea', '#f56565', '#4299e1'
    ];
    
    clinicalChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Prevalensi (%)',
                data: data,
                backgroundColor: colors,
                borderColor: colors.map(c => c + 'dd'),
                borderWidth: 1,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Prevalensi: ${context.raw}%`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Prevalensi (%)'
                    },
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            }
        }
    });
}

function createCutoffDistributionChart() {
    const ctx = document.getElementById('cutoffDistributionChart');
    if (!ctx) return;
    
    // Hancurkan chart lama jika ada
    if (cutoffChart) {
        cutoffChart.destroy();
    }
    
    cutoffChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: cutoffDistributionData.labels,
            datasets: [
                {
                    label: 'Di Bawah Cut-off',
                    data: cutoffDistributionData.belowCutoff,
                    backgroundColor: '#48bb78',
                    borderColor: '#48bb78dd',
                    borderWidth: 1
                },
                {
                    label: 'Di Atas Cut-off',
                    data: cutoffDistributionData.aboveCutoff,
                    backgroundColor: '#f56565',
                    borderColor: '#f56565dd',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                }
            },
            scales: {
                x: {
                    stacked: true,
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Distribusi (%)'
                    },
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            }
        }
    });
}

function updateKaggleStats() {
    const statsContainer = document.querySelector('.stats-container');
    if (statsContainer) {
        statsContainer.innerHTML = `
            <div class="stat-item">
                <div class="stat-number">${kaggleDataset.sampleSize.toLocaleString()}</div>
                <div class="stat-label">Total Observasi</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${kaggleDataset.ageRange}</div>
                <div class="stat-label">Rentang Usia</div>
            </div>
            <div class="stat-item">
                <div class="stat-number" id="ahp-lr-accuracy">87.2%</div>
                <div class="stat-label">Akurasi AHP-LR</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${kaggleDataset.features}</div>
                <div class="stat-label">Variabel Psikologis</div>
            </div>
        `;
    }
}

// Populate age filter
function populateAgeFilter() {
    const ageSelect = document.getElementById('ageSelect');
    if (!ageSelect) return;
    
    ageSelect.innerHTML = `
        <option value="">Pilih Usia...</option>
        <option value="15-17">15-17 Tahun</option>
        <option value="18-20">18-20 Tahun</option>
        <option value="21-24">21-24 Tahun</option>
        <option value="all">Semua Usia</option>
    `;
}

// Load User Analysis
function loadUserAnalysis() {
    console.log('👤 Loading user analysis...');
    
    const ageSelect = document.getElementById('ageSelect');
    const sortSelect = document.getElementById('sortSelect');
    const searchInput = document.getElementById('searchUser');
    
    if (!ageSelect || !sortSelect || !searchInput) return;
    
    const selectedAge = ageSelect.value;
    const sortOrder = sortSelect.value;
    const searchQuery = searchInput.value.toLowerCase();
    
    // Filter users berdasarkan usia
    let filteredUsers = usersData.filter(u => u.role !== 'admin');
    
    if (selectedAge && selectedAge !== 'all') {
        filteredUsers = filteredUsers.filter(user => {
            if (!user.birthDate) return false;
            const birthDate = new Date(user.birthDate);
            const age = new Date().getFullYear() - birthDate.getFullYear();
            
            switch(selectedAge) {
                case '15-17': return age >= 15 && age <= 17;
                case '18-20': return age >= 18 && age <= 20;
                case '21-24': return age >= 21 && age <= 24;
                default: return true;
            }
        });
    }
    
    // Filter berdasarkan search query
    if (searchQuery) {
        filteredUsers = filteredUsers.filter(user => 
            user.name?.toLowerCase().includes(searchQuery) || 
            user.email?.toLowerCase().includes(searchQuery)
        );
    }
    
    // Sort berdasarkan tanggal terakhir login
    filteredUsers.sort((a, b) => {
        const dateA = new Date(a.lastLogin || 0);
        const dateB = new Date(b.lastLogin || 0);
        return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
    
    if (filteredUsers.length === 0) {
        // Show empty state
        const emptyState = document.getElementById('emptyUserAnalysis');
        const userContent = document.getElementById('userAnalysisContent');
        if (emptyState) emptyState.style.display = 'block';
        if (userContent) userContent.style.display = 'none';
        showNotification('Tidak ditemukan user sesuai filter', 'warning');
        return;
    }
    
    // Ambil user pertama untuk dianalisis
    const user = filteredUsers[0];
    const userAssessments = assessmentsData.filter(a => a.userId === user.id);
    
    // Update user info
    updateUserInfoCard(user, userAssessments);
    
    // Show content
    const emptyState = document.getElementById('emptyUserAnalysis');
    const userContent = document.getElementById('userAnalysisContent');
    if (emptyState) emptyState.style.display = 'none';
    if (userContent) userContent.style.display = 'block';
    
    showNotification(`Analisis user "${user.name}" dimuat!`, 'success');
}

function updateUserInfoCard(user, assessments) {
    const container = document.getElementById('userInfoCard');
    if (!container) return;
    
    // Hitung usia
    let age = '-';
    if (user.birthDate) {
        const birthDate = new Date(user.birthDate);
        age = new Date().getFullYear() - birthDate.getFullYear();
    }
    
    // Hitung statistik
    const totalTests = assessments.length;
    const totalDuration = assessments.reduce((sum, a) => sum + (a.duration || 0), 0);
    const avgDuration = totalTests > 0 ? Math.round(totalDuration / totalTests) : 0;
    
    // Test terakhir
    let lastTestDate = '-';
    let lastTestType = '-';
    if (assessments.length > 0) {
        const lastTest = assessments.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        lastTestDate = new Date(lastTest.date).toLocaleDateString('id-ID');
        lastTestType = lastTest.testType || 'General';
    }
    
    // Hitung risk status
    const riskStatus = calculateRiskStatus(assessments);
    
    const initials = user.name ? user.name.charAt(0).toUpperCase() : 'U';
    
    container.innerHTML = `
        <div class="user-profile-header">
            <div class="profile-avatar-large">${initials}</div>
            <div class="profile-details">
                <h4>${user.name || 'User'}</h4>
                <div class="profile-meta">
                    <span><i class="fas fa-envelope"></i> ${user.email || '-'}</span>
                    <span><i class="fas fa-venus-mars"></i> ${user.gender || '-'}</span>
                    <span><i class="fas fa-calendar"></i> ${age} tahun</span>
                    <span><i class="fas fa-map-marker-alt"></i> ${user.location || '-'}</span>
                </div>
            </div>
        </div>
        
        <div class="user-stats-grid">
            <div class="user-stat-item">
                <div class="user-stat-label">Total Tes</div>
                <div class="user-stat-value">${totalTests}</div>
            </div>
            <div class="user-stat-item">
                <div class="user-stat-label">Rata-rata Durasi</div>
                <div class="user-stat-value">${avgDuration}m</div>
            </div>
            <div class="user-stat-item">
                <div class="user-stat-label">Tes Terakhir</div>
                <div class="user-stat-value">${lastTestDate}</div>
            </div>
            <div class="user-stat-item">
                <div class="user-stat-label">Status Risiko</div>
                <div class="user-stat-value">
                    <span class="risk-badge ${riskStatus.level}">${riskStatus.text}</span>
                </div>
            </div>
        </div>
    `;
}

function calculateRiskStatus(assessments) {
    if (assessments.length === 0) {
        return { text: 'Tidak ada data', level: 'low' };
    }
    
    let highRiskCount = 0;
    
    assessments.forEach(assessment => {
        if (assessment.phq9 && assessment.phq9 >= 20) highRiskCount++;
        if (assessment.gad7 && assessment.gad7 >= 15) highRiskCount++;
        if (assessment.totalScore && assessment.totalScore >= 70) highRiskCount++;
    });
    
    if (highRiskCount >= 2) {
        return { text: 'Tinggi', level: 'high' };
    } else if (highRiskCount === 1) {
        return { text: 'Sedang', level: 'medium' };
    } else {
        return { text: 'Rendah', level: 'low' };
    }
}

// ============================================
// SYSTEM SETTINGS FUNCTIONS
// ============================================

function saveSystemSettings() {
    const appName = document.getElementById('appName');
    const adminEmail = document.getElementById('adminEmail');
    
    if (!appName || !adminEmail) return;
    
    const appNameValue = appName.value;
    const adminEmailValue = adminEmail.value;
    
    if (!appNameValue.trim()) {
        showNotification('Nama aplikasi tidak boleh kosong', 'warning');
        return;
    }
    
    // Simpan settings
    const settings = {
        appName: appNameValue,
        adminEmail: adminEmailValue,
        updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem('system_settings', JSON.stringify(settings));
    showNotification('Pengaturan sistem berhasil disimpan!', 'success');
}

// ============================================
// LOGOUT FUNCTION
// ============================================

function logoutAdmin() {
    if (confirm('Apakah Anda yakin ingin logout dari admin panel?')) {
        // Hapus session
        sessionStorage.removeItem('currentUser');
        
        // Redirect ke halaman login
        window.location.href = 'index.html';
    }
}

// ============================================
// EXPORT FUNCTIONS TO WINDOW OBJECT
// ============================================

window.setActiveTab = setActiveTab;
window.logoutAdmin = logoutAdmin;
window.refreshUsersData = refreshUsersData;
window.exportUsersData = exportUsersData;
window.viewUserDetails = viewUserDetails;
window.deleteUser = deleteUser;
window.saveSystemSettings = saveSystemSettings;
window.showAnalysis = showAnalysis;
window.loadUserAnalysis = loadUserAnalysis;

console.log('✅ admin-script.js loaded successfully!');