const MainApp = {
  // Initialize app
  init() {
    this.setupEventListeners();
    this.checkAuthentication();
    this.updateCurrentTime();
    this.loadUserData();
  },

  // Demo users
  demoUsers: {
    user: {
      id: 1,
      email: 'user@user.com',
      password: 'userpsycho',
      name: 'User',
      gender: 'N/A',
      role: 'user',
      age: N/A
    },
    admin: {
      id: 2,
      email: 'admin@depresycho.com',
      password: 'adminpsycho',
      name: 'Admin Depresycho',
      gender: 'N/A',
      role: 'admin',
      age: N/A
    }
  },

  // Current user
  currentUser: null,

  // Setup event listeners
  setupEventListeners() {
    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    }

    // Register form
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
      registerForm.addEventListener('submit', (e) => this.handleRegister(e));
    }

    // Logout buttons
    document.querySelectorAll('#logoutBtn, .logout-item').forEach(btn => {
      if (btn) {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          this.handleLogout();
        });
      }
    });

    // Password toggle
    document.querySelectorAll('.password-toggle').forEach(toggle => {
      toggle.addEventListener('click', function() {
        const passwordInput = this.closest('.password-input').querySelector('input');
        const icon = this.querySelector('i');
        
        if (passwordInput.type === 'password') {
          passwordInput.type = 'text';
          icon.classList.remove('fa-eye');
          icon.classList.add('fa-eye-slash');
        } else {
          passwordInput.type = 'password';
          icon.classList.remove('fa-eye-slash');
          icon.classList.add('fa-eye');
        }
      });
    });

    // Form switching (login/register/forgot password)
    document.querySelectorAll('#show-register, #show-login, #show-login-from-forgot').forEach(link => {
      if (link) {
        link.addEventListener('click', function(e) {
          e.preventDefault();
          const target = this.getAttribute('href').replace('#', '');
          
          document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.remove('active');
          });
          
          document.getElementById(`${target}-form`)?.classList.add('active');
        });
      }
    });
  },

  // Handle login
  handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('remember-me')?.checked;

    // Check demo accounts
    let user = null;
    if (email === this.demoUsers.user.email && password === this.demoUsers.user.password) {
      user = this.demoUsers.user;
    } else if (email === this.demoUsers.admin.email && password === this.demoUsers.admin.password) {
      user = this.demoUsers.admin;
    }

    if (user) {
      this.currentUser = user;
      
      // Save to storage
      if (rememberMe) {
        localStorage.setItem('currentUser', JSON.stringify(user));
      } else {
        sessionStorage.setItem('currentUser', JSON.stringify(user));
      }

      // Show success notification
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

  // Handle registration (simplified - for demo only)
  handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-confirm-password').value;
    const gender = document.getElementById('reg-gender').value;
    const age = document.getElementById('reg-age').value;
    const acceptTerms = document.getElementById('accept-terms').checked;

    // Validation
    if (password !== confirmPassword) {
      this.showNotification('Password dan konfirmasi password tidak cocok!', 'error');
      return;
    }

    if (!acceptTerms) {
      this.showNotification('Anda harus menyetujui syarat dan ketentuan!', 'error');
      return;
    }

    // Create new user
    const newUser = {
      id: Date.now(),
      email: email,
      password: password, // In real app, this should be hashed
      name: name,
      gender: gender,
      role: 'user',
      age: parseInt(age) || 25,
      registeredAt: new Date().toISOString()
    };

    // Save to localStorage (simplified)
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    users.push(newUser);
    localStorage.setItem('registeredUsers', JSON.stringify(users));
    
    // Auto login
    this.currentUser = newUser;
    sessionStorage.setItem('currentUser', JSON.stringify(newUser));

    this.showNotification('Registrasi berhasil! Anda akan dialihkan ke dashboard.', 'success');

    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 1500);
  },

  // Handle logout
  handleLogout() {
    if (confirm('Apakah Anda yakin ingin logout?')) {
      localStorage.removeItem('currentUser');
      sessionStorage.removeItem('currentUser');
      this.currentUser = null;
      window.location.href = 'index.html';
    }
  },

  // Check authentication
  checkAuthentication() {
    const publicPages = ['index.html', 'login.html', 'tentang.html', ''];
    const currentPage = window.location.pathname.split('/').pop();

    // Skip auth check for public pages
    if (publicPages.includes(currentPage)) return;

    // Check if user is logged in
    const savedUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    if (!savedUser) {
      window.location.href = 'index.html';
      return;
    }

    this.currentUser = JSON.parse(savedUser);

    // Check admin access
    if (currentPage === 'admin.html' && this.currentUser.role !== 'admin') {
      alert('Akses ditolak. Hanya admin yang dapat mengakses halaman ini.');
      window.location.href = 'dashboard.html';
      return;
    }
  },

  // Load user data
  loadUserData() {
    const savedUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        this.currentUser = user;

        // Update all user info elements
        document.querySelectorAll('#userName, .user-name, .profile-name').forEach(el => {
          if (el) el.textContent = user.name;
        });

        document.querySelectorAll('#userEmail, .user-email, .profile-email').forEach(el => {
          if (el) el.textContent = user.email;
        });

        document.querySelectorAll('#userGender, .user-gender, .profile-gender').forEach(el => {
          if (el && user.gender) {
            el.innerHTML = `<i class="fas fa-${user.gender === 'Female' ? 'venus' : 'mars'}"></i> ${user.gender}`;
          }
        });

        // Update avatar
        document.querySelectorAll('#userAvatar, .user-avatar, .profile-avatar').forEach(avatar => {
          if (avatar) {
            const initials = user.name.charAt(0).toUpperCase();
            avatar.innerHTML = initials;
            avatar.style.backgroundColor = '#1a2980';
            avatar.style.color = 'white';
            avatar.style.display = 'flex';
            avatar.style.alignItems = 'center';
            avatar.style.justifyContent = 'center';
            avatar.style.fontWeight = 'bold';
            avatar.style.fontSize = '18px';
            avatar.style.borderRadius = '50%';
          }
        });

      } catch (e) {
        console.error('Error loading user data:', e);
      }
    }
  },

  // Update current time
  updateCurrentTime() {
    const updateTime = () => {
      const now = new Date();
      const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      };
      
      const timeElements = document.querySelectorAll('#currentTime, .current-time');
      timeElements.forEach(el => {
        if (el) {
          el.textContent = now.toLocaleDateString('id-ID', options);
        }
      });
    };

    updateTime();
    setInterval(updateTime, 60000); // Update every minute
  },

  // Show notification
  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const icons = {
      success: 'check-circle',
      error: 'exclamation-circle',
      warning: 'exclamation-triangle',
      info: 'info-circle'
    };

    notification.innerHTML = `
      <i class="fas fa-${icons[type] || 'info-circle'}"></i>
      <span>${message}</span>
    `;

    // Add styles if not already present
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
          max-width: 400px;
        }
        .notification-success {
          background: linear-gradient(135deg, #43e97b, #38f9d7);
          border-left: 4px solid #2ed573;
        }
        .notification-error {
          background: linear-gradient(135deg, #f5576c, #f093fb);
          border-left: 4px solid #ff4757;
        }
        .notification-warning {
          background: linear-gradient(135deg, #ffd166, #ff9e00);
          border-left: 4px solid #ffa502;
        }
        .notification-info {
          background: linear-gradient(135deg, #4facfe, #00f2fe);
          border-left: 4px solid #1a2980;
        }
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }

    // Add to page
    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease forwards';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  },

  // Format date
  formatDate(date) {
    return new Date(date).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  },

  // Format number with commas
  formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  },

  // Get URL parameters
  getUrlParams() {
    const params = {};
    const queryString = window.location.search.substring(1);
    const pairs = queryString.split('&');
    
    for (const pair of pairs) {
      const [key, value] = pair.split('=');
      if (key) {
        params[decodeURIComponent(key)] = decodeURIComponent(value || '');
      }
    }
    
    return params;
  }
};

// Initialize app when page loads
document.addEventListener('DOMContentLoaded', () => {
  MainApp.init();
});

// Make app available globally
window.MainApp = MainApp;