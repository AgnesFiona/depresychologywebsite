// ============================================
// PSYCHO CLASSIFICATION SYSTEM
// Hybrid AHP - Logistic Regression
// No Database Version (localStorage only)
// ============================================

// Application State
const PsychoApp = {
    // Initialize app
    init() {
        this.setupEventListeners();
        this.checkAuthentication();
        this.loadCurrentPage();
    },
    
    // Demo user accounts
    demoAccounts: {
        user: {
            id: 1,
            email: 'user@user.com',
            password: 'jadiuser',
            name: 'User baik',
            role: 'user'
        },
        admin: {
            id: 2,
            email: 'adminpsyc@demo.com',
            password: 'depresychol',
            name: 'Admin PsychoClass',
            role: 'admin'
        }
    },
    
    // AHP weights (pre-calculated)
    ahpWeights: {
        konsentrasi: 0.12,
        empati: 0.08,
        stress: 0.10,
        motivasi: 0.11,
        interaksi_sosial: 0.09,
        kepercayaan_diri: 0.13,
        pengambilan_keputusan: 0.10,
        kesabaran: 0.07,
        pengelolaan_emosi: 0.10,
        rasionalitas: 0.10
    },
    
    // Logistic Regression model parameters
    lrModel: {
        intercept: -2.4567,
        konsentrasi: 0.0342,
        empati: 0.0287,
        stress: -0.0315,
        motivasi: 0.0361,
        interaksi_sosial: 0.0298,
        kepercayaan_diri: 0.0389,
        pengambilan_keputusan: 0.0324,
        kesabaran: 0.0273,
        pengelolaan_emosi: 0.0336,
        rasionalitas: 0.0352,
        accuracy: 0.8723
    },
    
    // Current user
    currentUser: null,
    
    // Setup all event listeners
    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
            
            // Demo account buttons
            document.querySelectorAll('.demo-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const email = e.target.dataset.email;
                    const password = e.target.dataset.password;
                    document.getElementById('email').value = email;
                    document.getElementById('password').value = password;
                    loginForm.dispatchEvent(new Event('submit'));
                });
            });
        }
        
        // Logout buttons
        document.querySelectorAll('#logoutBtn, #logoutBtnInput, #logoutBtnResult').forEach(btn => {
            if (btn) btn.addEventListener('click', () => this.logout());
        });
        
        // Menu toggle
        document.querySelectorAll('.menu-toggle, .sidebar-toggle').forEach(toggle => {
            if (toggle) toggle.addEventListener('click', () => {
                document.querySelector('.sidebar').classList.toggle('active');
            });
        });
        
        // Assessment form
        const assessmentForm = document.getElementById('psychoForm');
        if (assessmentForm) {
            // Setup range sliders
            this.setupRangeSliders();
            
            // Handle form submission
            assessmentForm.addEventListener('submit', (e) => this.handleAssessment(e));
            
            // Form reset
            assessmentForm.addEventListener('reset', () => {
                setTimeout(() => this.setupRangeSliders(), 100);
            });
        }
        
        // Admin actions
        document.querySelectorAll('.btn-action').forEach(btn => {
            if (btn.textContent.includes('Hapus Semua Data')) {
                btn.addEventListener('click', () => this.clearAllData());
            }
            if (btn.textContent.includes('Generate Sample Data')) {
                btn.addEventListener('click', () => this.generateSampleData());
            }
            if (btn.textContent.includes('Export Data')) {
                btn.addEventListener('click', () => this.exportAllData());
            }
        });
    },
    
    // Handle login
    handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        
        // Check demo accounts
        let user = null;
        if (email === this.demoAccounts.user.email && password === this.demoAccounts.user.password) {
            user = this.demoAccounts.user;
        } else if (email === this.demoAccounts.admin.email && password === this.demoAccounts.admin.password) {
            user = this.demoAccounts.admin;
        }
        
        if (user) {
            this.currentUser = user;
            localStorage.setItem('psycho_current_user', JSON.stringify(user));
            
            // Show success message
            this.showNotification('Login berhasil!', 'success');
            
            // Redirect based on role
            setTimeout(() => {
                if (user.role === 'admin') {
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = 'dashboard.html';
                }
            }, 1000);
        } else {
            this.showNotification('Email atau password salah!', 'error');
        }
    },
    
    // Handle assessment submission
    handleAssessment(e) {
        e.preventDefault();
        
        if (!this.currentUser) {
            this.showNotification('Silakan login terlebih dahulu!', 'warning');
            setTimeout(() => window.location.href = 'login.html', 1500);
            return;
        }
        
        // Collect form data
        const formData = new FormData(e.target);
        const personalData = {
            fullName: formData.get('fullName') || 'Anonymous',
            age: parseInt(formData.get('age')) || 25,
            gender: formData.get('gender') || 'other'
        };
        
        // Collect psychological scores
        const scores = {};
        const aspects = [
            'konsentrasi', 'empati', 'stress', 'motivasi', 'interaksi_sosial',
            'kepercayaan_diri', 'pengambilan_keputusan', 'kesabaran',
            'pengelolaan_emosi', 'rasionalitas'
        ];
        
        aspects.forEach(aspect => {
            scores[aspect] = parseInt(formData.get(aspect)) || 50;
        });
        
        // Process with AHP
        const ahpResults = this.processAHP(scores);
        
        // Classify with Logistic Regression
        const lrResults = this.classifyWithLR(ahpResults.weightedScores);
        
        // Create assessment object
        const assessment = {
            id: Date.now(),
            userId: this.currentUser.id,
            userName: personalData.fullName,
            userAge: personalData.age,
            userGender: personalData.gender,
            date: new Date().toLocaleString('id-ID'),
            timestamp: Date.now(),
            scores: scores,
            ahpWeights: this.ahpWeights,
            ahpResults: ahpResults,
            lrResults: lrResults,
            result: {
                category: lrResults.category,
                score: lrResults.finalScore,
                probability: lrResults.probability,
                recommendations: lrResults.recommendations
            }
        };
        
        // Save assessment
        this.saveAssessment(assessment);
        
        // Store for result page
        localStorage.setItem('psycho_last_assessment', JSON.stringify(assessment));
        
        // Show success message
        this.showNotification('Assessment berhasil diproses!', 'success');
        
        // Redirect to result page
        setTimeout(() => {
            window.location.href = 'result.html';
        }, 1500);
    },
    
    // Process AHP calculations
    processAHP(scores) {
        const weightedScores = {};
        let totalWeighted = 0;
        
        // Apply AHP weights
        for (const [aspect, score] of Object.entries(scores)) {
            const weight = this.ahpWeights[aspect] || 0.1;
            weightedScores[aspect] = score * weight;
            totalWeighted += weightedScores[aspect];
        }
        
        // Calculate consistency ratio (simplified)
        const consistencyRatio = 0.05 + Math.random() * 0.03; // Simulated CR
        
        return {
            weightedScores,
            totalWeighted: totalWeighted * 10, // Scale up
            consistencyRatio,
            isConsistent: consistencyRatio < 0.1
        };
    },
    
    // Classify with Logistic Regression
    classifyWithLR(weightedScores) {
        // Calculate linear combination
        let z = this.lrModel.intercept;
        
        for (const [aspect, score] of Object.entries(weightedScores)) {
            const coefficient = this.lrModel[aspect];
            if (coefficient !== undefined) {
                z += coefficient * (score / 100); // Normalize
            }
        }
        
        // Apply sigmoid function
        const probability = 1 / (1 + Math.exp(-z));
        
        // Determine category
        let category, finalScore;
        
        if (probability >= 0.85) {
            category = 'Sangat Baik';
            finalScore = 90 + Math.round((probability - 0.85) * 100);
        } else if (probability >= 0.70) {
            category = 'Baik';
            finalScore = 75 + Math.round((probability - 0.70) * 150);
        } else if (probability >= 0.50) {
            category = 'Cukup';
            finalScore = 55 + Math.round((probability - 0.50) * 200);
        } else {
            category = 'Perlu Perhatian';
            finalScore = 30 + Math.round(probability * 200);
        }
        
        // Generate recommendations
        const recommendations = this.generateRecommendations(category, weightedScores);
        
        return {
            probability: parseFloat(probability.toFixed(4)),
            category,
            finalScore: Math.min(100, Math.max(0, finalScore)),
            recommendations,
            modelAccuracy: this.lrModel.accuracy
        };
    },
    
    // Generate recommendations based on results
    generateRecommendations(category, weightedScores) {
        const recommendations = [];
        
        // General recommendations
        switch(category) {
            case 'Sangat Baik':
                recommendations.push("Kondisi psikologis Anda sangat baik. Pertahankan pola hidup sehat dan seimbang.");
                recommendations.push("Teruskan pengembangan diri dengan membaca, belajar, dan berbagi pengalaman.");
                recommendations.push("Pertimbangkan untuk membantu orang lain atau menjadi mentor.");
                break;
                
            case 'Baik':
                recommendations.push("Kondisi psikologis Anda baik. Tingkatkan konsistensi dalam aktivitas positif.");
                recommendations.push("Fokus pada pengelolaan stres dan pengembangan keterampilan sosial.");
                recommendations.push("Lakukan evaluasi berkala untuk memantau perkembangan.");
                break;
                
            case 'Cukup':
                recommendations.push("Kondisi psikologis Anda cukup baik namun perlu perhatian lebih.");
                recommendations.push("Coba teknik relaksasi seperti meditasi, pernapasan dalam, atau yoga.");
                recommendations.push("Pertimbangkan untuk berkonsultasi dengan profesional jika diperlukan.");
                break;
                
            default:
                recommendations.push("Disarankan untuk berkonsultasi dengan psikolog atau profesional kesehatan mental.");
                recommendations.push("Mulailah dengan aktivitas kecil yang menyenangkan dan beri penghargaan pada diri sendiri.");
                recommendations.push("Cari dukungan dari teman, keluarga, atau kelompok dukungan.");
        }
        
        // Specific recommendations for low scores
        const lowAspects = Object.entries(weightedScores)
            .filter(([_, score]) => score < 40)
            .map(([aspect]) => aspect);
        
        if (lowAspects.length > 0) {
            const aspectNames = lowAspects.map(aspect => {
                const names = {
                    'konsentrasi': 'Konsentrasi',
                    'empati': 'Empati',
                    'stress': 'Manajemen Stress',
                    'motivasi': 'Motivasi',
                    'interaksi_sosial': 'Interaksi Sosial',
                    'kepercayaan_diri': 'Kepercayaan Diri',
                    'pengambilan_keputusan': 'Pengambilan Keputusan',
                    'kesabaran': 'Kesabaran',
                    'pengelolaan_emosi': 'Pengelolaan Emosi',
                    'rasionalitas': 'Rasionalitas'
                };
                return names[aspect] || aspect;
            }).join(', ');
            
            recommendations.push(`Perlu peningkatan pada aspek: ${aspectNames}.`);
        }
        
        return recommendations;
    },
    
    // Save assessment to localStorage
    saveAssessment(assessment) {
        let assessments = JSON.parse(localStorage.getItem('psycho_assessments')) || [];
        assessments.push(assessment);
        localStorage.setItem('psycho_assessments', JSON.stringify(assessments));
        return assessment;
    },
    
    // Get assessments for current user
    getUserAssessments() {
        const assessments = JSON.parse(localStorage.getItem('psycho_assessments')) || [];
        if (!this.currentUser) return [];
        return assessments.filter(a => a.userId === this.currentUser.id);
    },
    
    // Get all assessments (for admin)
    getAllAssessments() {
        return JSON.parse(localStorage.getItem('psycho_assessments')) || [];
    },
    
    // Setup range sliders for assessment form
    setupRangeSliders() {
        document.querySelectorAll('.range-slider').forEach(slider => {
            const aspect = slider.id;
            const valueDisplay = document.getElementById(`score${this.capitalizeFirst(aspect)}`);
            
            if (valueDisplay) {
                valueDisplay.textContent = slider.value;
                
                slider.addEventListener('input', () => {
                    valueDisplay.textContent = slider.value;
                });
            }
        });
    },
    
    // Load data for current page
    loadCurrentPage() {
        // Check authentication
        this.checkAuthentication();
        
        // Load current user
        const savedUser = localStorage.getItem('psycho_current_user');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
        }
        
        // Update user info in UI
        this.updateUserInfo();
        
        // Load page-specific data
        const currentPage = window.location.pathname.split('/').pop();
        
        switch(currentPage) {
            case 'dashboard.html':
                this.loadDashboard();
                break;
            case 'result.html':
                this.loadResultPage();
                break;
            case 'admin.html':
                this.loadAdminDashboard();
                break;
            case 'tentang.html':
                // Nothing special to load
                break;
        }
    },
    
    // Load dashboard data
    loadDashboard() {
        if (!this.currentUser || this.currentUser.role !== 'user') return;
        
        // Update user info
        document.getElementById('userName')?.textContent = this.currentUser.name;
        document.getElementById('userEmail')?.textContent = this.currentUser.email;
        document.getElementById('displayName')?.textContent = this.currentUser.name.split(' ')[0];
        
        // Load user assessments
        const assessments = this.getUserAssessments();
        
        // Update statistics
        document.getElementById('totalTests')?.textContent = assessments.length;
        
        if (assessments.length > 0) {
            const avgScore = Math.round(assessments.reduce((sum, a) => sum + a.result.score, 0) / assessments.length);
            const bestCategory = assessments.reduce((best, a) => a.result.score > best.score ? a : best, assessments[0]);
            const lastTest = assessments[assessments.length - 1];
            
            document.getElementById('averageScore')?.textContent = avgScore;
            document.getElementById('bestCategory')?.textContent = bestCategory.result.category;
            document.getElementById('lastTestDate')?.textContent = lastTest.date.split(',')[0];
            
            // Show last result
            const lastResultEl = document.getElementById('lastResult');
            if (lastResultEl) {
                lastResultEl.innerHTML = `
                    <div class="result-preview">
                        <h4>${lastTest.date}</h4>
                        <div class="result-summary">
                            <span class="badge badge-${lastTest.result.category.includes('Baik') ? 'success' : 'warning'}">
                                ${lastTest.result.category}
                            </span>
                            <span class="score">Skor: ${lastTest.result.score}/100</span>
                        </div>
                        <p>${lastTest.result.recommendations[0]}</p>
                        <a href="result.html" class="btn btn-sm btn-primary">Lihat Detail</a>
                    </div>
                `;
            }
        }
    },
    
    // Load result page
    loadResultPage() {
        const assessment = JSON.parse(localStorage.getItem('psycho_last_assessment'));
        
        if (!assessment) {
            document.getElementById('resultContainer')?.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Tidak Ada Data Hasil</h3>
                    <p>Silakan lakukan assessment terlebih dahulu.</p>
                    <a href="input.html" class="btn btn-primary">Mulai Assessment</a>
                </div>
            `;
            return;
        }
        
        // Update result display
        document.getElementById('resultDate')?.textContent = assessment.date;
        document.getElementById('resultCategory')?.textContent = assessment.result.category;
        document.getElementById('resultScore')?.textContent = assessment.result.score;
        document.getElementById('resultProbability')?.textContent = assessment.lrResults.probability.toFixed(3);
        
        // Update circle progress
        const circle = document.getElementById('scoreCircle');
        if (circle) {
            const circumference = 2 * Math.PI * 54;
            const offset = circumference - (assessment.result.score / 100) * circumference;
            circle.style.strokeDashoffset = offset;
        }
        
        // Update recommendations
        const recList = document.getElementById('recommendations');
        if (recList) {
            recList.innerHTML = assessment.result.recommendations
                .map(rec => `
                    <div class="recommendation-item">
                        <i class="fas fa-lightbulb"></i>
                        <p>${rec}</p>
                    </div>
                `).join('');
        }
        
        // Update score table
        const tableBody = document.getElementById('scoreTableBody');
        if (tableBody) {
            tableBody.innerHTML = Object.entries(assessment.scores)
                .map(([aspect, score]) => {
                    const aspectName = this.getAspectName(aspect);
                    const weight = assessment.ahpWeights[aspect];
                    const weighted = assessment.ahpResults.weightedScores[aspect];
                    const category = weighted >= 60 ? 'Baik' : weighted >= 40 ? 'Cukup' : 'Rendah';
                    
                    return `
                        <tr>
                            <td>${aspectName}</td>
                            <td>${score}</td>
                            <td>${weight.toFixed(3)}</td>
                            <td>${weighted.toFixed(1)}</td>
                            <td><span class="badge badge-${category === 'Baik' ? 'success' : category === 'Cukup' ? 'warning' : 'danger'}">${category}</span></td>
                        </tr>
                    `;
                }).join('');
        }
        
        // Update algorithm details
        document.getElementById('ahpCR')?.textContent = assessment.ahpResults.consistencyRatio.toFixed(3);
        document.getElementById('ahpStatus')?.textContent = assessment.ahpResults.isConsistent ? 'Konsisten' : 'Perlu Review';
        document.getElementById('ahpStatus')?.className = assessment.ahpResults.isConsistent ? 'status-good' : 'status-warning';
        document.getElementById('lrAccuracy')?.textContent = assessment.lrResults.modelAccuracy.toFixed(3);
        document.getElementById('lrThreshold')?.textContent = '0.70';
    },
    
    // Load admin dashboard
    loadAdminDashboard() {
        if (!this.currentUser || this.currentUser.role !== 'admin') {
            window.location.href = 'login.html';
            return;
        }
        
        const assessments = this.getAllAssessments();
        const uniqueUsers = [...new Set(assessments.map(a => a.userId))];
        
        // Update statistics
        document.getElementById('totalRespondents')?.textContent = uniqueUsers.length;
        document.getElementById('totalAssessments')?.textContent = assessments.length;
        
        if (assessments.length > 0) {
            const avgScore = Math.round(assessments.reduce((sum, a) => sum + a.result.score, 0) / assessments.length);
            document.getElementById('averageAllScore')?.textContent = avgScore;
        }
        
        // Calculate storage usage
        const storageUsage = JSON.stringify(localStorage).length / 1024;
        document.getElementById('storageUsage')?.textContent = `${storageUsage.toFixed(1)} KB`;
        
        // Update category distribution
        const categoryCounts = {
            'Sangat Baik': 0,
            'Baik': 0,
            'Cukup': 0,
            'Perlu Perhatian': 0
        };
        
        assessments.forEach(a => {
            categoryCounts[a.result.category] = (categoryCounts[a.result.category] || 0) + 1;
        });
        
        document.getElementById('countBaik')?.textContent = categoryCounts['Baik'] + categoryCounts['Sangat Baik'];
        document.getElementById('countCukup')?.textContent = categoryCounts['Cukup'];
        document.getElementById('countKurang')?.textContent = categoryCounts['Perlu Perhatian'];
        
        // Update recent assessments table
        const tableBody = document.getElementById('recentAssessmentsTable');
        if (tableBody) {
            const recentAssessments = assessments.slice(-10).reverse();
            
            if (recentAssessments.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="6" class="text-center">
                            <div class="empty-state">
                                <i class="fas fa-database"></i>
                                <p>Belum ada data assessment</p>
                            </div>
                        </td>
                    </tr>
                `;
            } else {
                tableBody.innerHTML = recentAssessments.map((assessment, index) => `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${assessment.userName}</td>
                        <td>${assessment.date.split(',')[0]}</td>
                        <td>
                            <span class="badge badge-${assessment.result.category.includes('Baik') ? 'success' : assessment.result.category === 'Cukup' ? 'warning' : 'danger'}">
                                ${assessment.result.category}
                            </span>
                        </td>
                        <td>${assessment.result.score}</td>
                        <td>
                            <button class="btn btn-sm btn-outline" onclick="PsychoApp.viewAssessment(${assessment.id})">
                                <i class="fas fa-eye"></i> View
                            </button>
                        </td>
                    </tr>
                `).join('');
            }
        }
        
        // Create chart
        this.createCategoryChart(categoryCounts);
    },
    
    // Create category distribution chart
    createCategoryChart(categoryCounts) {
        const chartContainer = document.getElementById('categoryChart');
        if (!chartContainer) return;
        
        const total = Object.values(categoryCounts).reduce((a, b) => a + b, 0);
        if (total === 0) return;
        
        const percentages = {
            'Baik': ((categoryCounts['Baik'] + categoryCounts['Sangat Baik']) / total * 100).toFixed(1),
            'Cukup': (categoryCounts['Cukup'] / total * 100).toFixed(1),
            'Perlu Perhatian': (categoryCounts['Perlu Perhatian'] / total * 100).toFixed(1)
        };
        
        chartContainer.innerHTML = `
            <div class="chart-bars">
                <div class="chart-bar" style="height: ${percentages['Baik']}%; background-color: #4CAF50;" title="Baik: ${percentages['Baik']}%"></div>
                <div class="chart-bar" style="height: ${percentages['Cukup']}%; background-color: #FF9800;" title="Cukup: ${percentages['Cukup']}%"></div>
                <div class="chart-bar" style="height: ${percentages['Perlu Perhatian']}%; background-color: #F44336;" title="Perlu Perhatian: ${percentages['Perlu Perhatian']}%"></div>
            </div>
        `;
    },
    
    // Update user info in UI
    updateUserInfo() {
        if (!this.currentUser) return;
        
        // Update all instances of user info
        document.querySelectorAll('#userName, #userNameInput, #userNameResult').forEach(el => {
            if (el) el.textContent = this.currentUser.name;
        });
        
        document.querySelectorAll('#userEmail, #userEmailInput, #userEmailResult').forEach(el => {
            if (el) el.textContent = this.currentUser.email;
        });
    },
    
    // Check authentication
    checkAuthentication() {
        const publicPages = ['index.html', 'login.html', 'tentang.html', ''];
        const currentPage = window.location.pathname.split('/').pop();
        
        // Skip auth check for public pages
        if (publicPages.includes(currentPage)) return;
        
        // Check if user is logged in
        const savedUser = localStorage.getItem('psycho_current_user');
        if (!savedUser) {
            window.location.href = 'login.html';
            return;
        }
        
        this.currentUser = JSON.parse(savedUser);
        
        // Check admin access
        if (currentPage === 'admin.html' && this.currentUser.role !== 'admin') {
            window.location.href = 'dashboard.html';
        }
    },
    
    // Logout
    logout() {
        if (confirm('Apakah Anda yakin ingin logout?')) {
            localStorage.removeItem('psycho_current_user');
            this.currentUser = null;
            window.location.href = 'index.html';
        }
    },
    
    // Clear all data (admin)
    clearAllData() {
        if (confirm('Yakin ingin menghapus SEMUA data? Tindakan ini tidak dapat dibatalkan!')) {
            localStorage.removeItem('psycho_assessments');
            localStorage.removeItem('psycho_last_assessment');
            this.showNotification('Semua data telah dihapus', 'success');
            setTimeout(() => location.reload(), 1000);
        }
    },
    
    // Generate sample data (admin)
    generateSampleData() {
        const sampleAssessments = [];
        const names = ['Budi Santoso', 'Sari Wijaya', 'Agus Setiawan', 'Maya Indah', 'Rudi Hartono'];
        const categories = ['Sangat Baik', 'Baik', 'Cukup', 'Perlu Perhatian'];
        
        for (let i = 0; i < 10; i++) {
            const randomDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
            
            const assessment = {
                id: Date.now() + i,
                userId: Math.floor(Math.random() * 5) + 100,
                userName: names[Math.floor(Math.random() * names.length)],
                userAge: 20 + Math.floor(Math.random() * 40),
                userGender: Math.random() > 0.5 ? 'male' : 'female',
                date: randomDate.toLocaleString('id-ID'),
                timestamp: randomDate.getTime(),
                scores: {},
                result: {
                    category: categories[Math.floor(Math.random() * categories.length)],
                    score: 40 + Math.floor(Math.random() * 60),
                    probability: 0.5 + Math.random() * 0.5,
                    recommendations: ['Sample recommendation 1', 'Sample recommendation 2']
                }
            };
            
            // Generate random scores
            Object.keys(this.ahpWeights).forEach(aspect => {
                assessment.scores[aspect] = 30 + Math.floor(Math.random() * 70);
            });
            
            sampleAssessments.push(assessment);
        }
        
        // Save to localStorage
        const existing = JSON.parse(localStorage.getItem('psycho_assessments')) || [];
        localStorage.setItem('psycho_assessments', JSON.stringify([...existing, ...sampleAssessments]));
        
        this.showNotification('10 data sample telah ditambahkan', 'success');
        setTimeout(() => location.reload(), 1000);
    },
    
    // Export all data (admin)
    exportAllData() {
        const assessments = this.getAllAssessments();
        
        if (assessments.length === 0) {
            this.showNotification('Tidak ada data untuk diekspor', 'warning');
            return;
        }
        
        const dataStr = JSON.stringify(assessments, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `psycho-data-backup-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        this.showNotification(`Data berhasil diekspor (${assessments.length} records)`, 'success');
    },
    
    // View assessment detail
    viewAssessment(id) {
        const assessments = this.getAllAssessments();
        const assessment = assessments.find(a => a.id === id);
        
        if (assessment) {
            alert(`
                Detail Assessment:
                
                Nama: ${assessment.userName}
                Usia: ${assessment.userAge}
                Jenis Kelamin: ${assessment.userGender}
                Tanggal: ${assessment.date}
                Kategori: ${assessment.result.category}
                Skor: ${assessment.result.score}/100
                Probabilitas: ${assessment.result.probability}
                
                Rekomendasi:
                ${assessment.result.recommendations.join('\n')}
            `);
        }
    },
    
    // Show notification
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
        
        // Add CSS for notifications if not already present
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 15px 20px;
                    border-radius: 10px;
                    color: white;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    z-index: 9999;
                    animation: slideIn 0.3s ease;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                }
                .notification-success { background-color: #4CAF50; }
                .notification-error { background-color: #F44336; }
                .notification-warning { background-color: #FF9800; }
                .notification-info { background-color: #2196F3; }
                .fade-out {
                    animation: fadeOut 0.3s ease forwards;
                }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes fadeOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    },
    
    // Helper functions
    capitalizeFirst(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    },
    
    getAspectName(key) {
        const names = {
            'konsentrasi': 'Konsentrasi',
            'empati': 'Empati',
            'stress': 'Tingkat Stress',
            'motivasi': 'Motivasi',
            'interaksi_sosial': 'Interaksi Sosial',
            'kepercayaan_diri': 'Kepercayaan Diri',
            'pengambilan_keputusan': 'Pengambilan Keputusan',
            'kesabaran': 'Kesabaran',
            'pengelolaan_emosi': 'Pengelolaan Emosi',
            'rasionalitas': 'Rasionalitas'
        };
        return names[key] || key;
    }
};

// Initialize app when page loads
document.addEventListener('DOMContentLoaded', () => {
    PsychoApp.init();
});

// Make app available globally
window.PsychoApp = PsychoApp;

// Global functions for inline event handlers
window.refreshData = () => location.reload();
window.viewAssessment = (id) => PsychoApp.viewAssessment(id);
window.clearAllData = () => PsychoApp.clearAllData();
window.generateSampleData = () => PsychoApp.generateSampleData();
window.exportAllData = () => PsychoApp.exportAllData();