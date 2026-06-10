const AuthManager = {
  // Initialize auth system
  init() {
    this.setupAuthForms();
    this.setupAuthSwitching();
    this.checkAuthState();
    this.setupPasswordToggles();
  },

  // Setup auth forms
  setupAuthForms() {
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

    // Forgot password form
    const forgotForm = document.getElementById('forgot-password-form');
    if (forgotForm) {
      forgotForm.addEventListener('submit', (e) => this.handleForgotPassword(e));
    }
  },

  // Setup form switching
  setupAuthSwitching() {
    // Login to register
    const showRegister = document.getElementById('show-register');
    if (showRegister) {
      showRegister.addEventListener('click', (e) => {
        e.preventDefault();
        this.switchToForm('register');
      });
    }

    // Register to login
    const showLogin = document.getElementById('show-login');
    if (showLogin) {
      showLogin.addEventListener('click', (e) => {
        e.preventDefault();
        this.switchToForm('login');
      });
    }

    // Forgot to login
    const showLoginFromForgot = document.getElementById('show-login-from-forgot');
    if (showLoginFromForgot) {
      showLoginFromForgot.addEventListener('click', (e) => {
        e.preventDefault();
        this.switchToForm('login');
      });
    }

    // Forgot password link
    const forgotPasswordLink = document.querySelector('.forgot-password');
    if (forgotPasswordLink) {
      forgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.switchToForm('forgot-password');
      });
    }
  },

  // Setup password toggles
  setupPasswordToggles() {
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
  },

  // Switch between auth forms
  switchToForm(formName) {
    // Hide all forms
    document.querySelectorAll('.auth-form').forEach(form => {
      form.classList.remove('active');
    });

    // Show selected form
    const targetForm = document.getElementById(`${formName}-form`);
    if (targetForm) {
      targetForm.classList.add('active');
      
      // Scroll to form
      targetForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  },

  // Handle login
  handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('remember-me')?.checked;

    // Validation
    if (!email || !password) {
      this.showAuthError('Email dan password harus diisi!');
      return;
    }

    // Get users from localStorage
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const demoUsers = [
      {
        id: 1,
        email: 'user@user.com',
        password: 'password123',
        name: 'Agnes Fiona',
        gender: 'Female',
        role: 'user',
        age: 24
      },
      {
        id: 2,
        email: 'admin@depresycho.com',
        password: 'admin123',
        name: 'Admin Depresycho',
        gender: 'Male',
        role: 'admin',
        age: 32
      }
    ];

    // Combine demo and registered users
    const allUsers = [...demoUsers, ...registeredUsers];

    // Find user
    const user = allUsers.find(u => u.email === email && u.password === password);

    if (user) {
      // Remove password before storing
      const { password: _, ...userWithoutPassword } = user;
      
      // Store user data
      if (rememberMe) {
        localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      } else {
        sessionStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      }

      // Show success
      this.showAuthSuccess('Login berhasil! Mengalihkan...');

      // Redirect
      setTimeout(() => {
        if (user.role === 'admin') {
          window.location.href = 'admin.html';
        } else {
          window.location.href = 'dashboard.html';
        }
      }, 1500);
    } else {
      this.showAuthError('Email atau password salah!');
    }
  },

  // Handle registration
  handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-confirm-password').value;
    const gender = document.getElementById('reg-gender').value;
    const age = parseInt(document.getElementById('reg-age').value) || 0;
    const acceptTerms = document.getElementById('accept-terms').checked;

    // Validation
    if (!name || !email || !password || !confirmPassword || !gender || !age) {
      this.showAuthError('Semua field harus diisi!');
      return;
    }

    if (password.length < 6) {
      this.showAuthError('Password minimal 6 karakter!');
      return;
    }

    if (password !== confirmPassword) {
      this.showAuthError('Password dan konfirmasi password tidak cocok!');
      return;
    }

    if (age < 12 || age > 100) {
      this.showAuthError('Usia harus antara 12 dan 100 tahun!');
      return;
    }

    if (!acceptTerms) {
      this.showAuthError('Anda harus menyetujui syarat dan ketentuan!');
      return;
    }

    // Check if email already exists
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const demoUsers = [
      { email: 'user@user.com' },
      { email: 'admin@depresycho.com' }
    ];

    const emailExists = [...demoUsers, ...registeredUsers].some(u => u.email === email);
    
    if (emailExists) {
      this.showAuthError('Email sudah terdaftar!');
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
      age: age,
      registeredAt: new Date().toISOString()
    };

    // Save to localStorage
    registeredUsers.push(newUser);
    localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));

    // Remove password before storing
    const { password: _, ...userWithoutPassword } = newUser;
    
    // Auto login
    sessionStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));

    this.showAuthSuccess('Registrasi berhasil! Anda akan dialihkan ke dashboard.');

    // Redirect to dashboard
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 1500);
  },

  // Handle forgot password (simplified for demo)
  handleForgotPassword(e) {
    e.preventDefault();
    
    const email = document.getElementById('reset-email').value.trim();

    if (!email) {
      this.showAuthError('Email harus diisi!');
      return;
    }

    // Simulate sending reset email
    this.showAuthSuccess(`Link reset password telah dikirim ke ${email} (simulasi)`);

    // Switch back to login after delay
    setTimeout(() => {
      this.switchToForm('login');
    }, 2000);
  },

  // Check auth state
  checkAuthState() {
    const currentPage = window.location.pathname.split('/').pop();
    const authPages = ['index.html', 'login.html', ''];
    
    // If not on auth page, check if user is logged in
    if (!authPages.includes(currentPage)) {
      const savedUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
      
      if (!savedUser) {
        window.location.href = 'index.html';
      }
    }
  },

  // Show auth error
  showAuthError(message) {
    this.showAuthMessage(message, 'error');
  },

  // Show auth success
  showAuthSuccess(message) {
    this.showAuthMessage(message, 'success');
  },

  // Show auth message
  showAuthMessage(message, type) {
    // Create message element
    const messageEl = document.createElement('div');
    messageEl.className = `auth-message auth-message-${type}`;
    messageEl.innerHTML = `
      <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
      <span>${message}</span>
    `;

    // Add styles if not already present
    if (!document.querySelector('#auth-message-styles')) {
      const style = document.createElement('style');
      style.id = 'auth-message-styles';
      style.textContent = `
        .auth-message {
          padding: 12px 15px;
          border-radius: 8px;
          margin: 15px 0;
          display: flex;
          align-items: center;
          gap: 10px;
          animation: fadeIn 0.3s ease;
        }
        .auth-message-success {
          background: rgba(67, 233, 123, 0.1);
          border-left: 4px solid #43e97b;
          color: #155724;
        }
        .auth-message-error {
          background: rgba(245, 87, 108, 0.1);
          border-left: 4px solid #f5576c;
          color: #721c24;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `;
      document.head.appendChild(style);
    }

    // Add to auth form
    const authForm = document.querySelector('.auth-form.active');
    if (authForm) {
      // Remove existing messages
      const existingMessages = authForm.querySelectorAll('.auth-message');
      existingMessages.forEach(msg => msg.remove());
      
      // Add new message
      authForm.insertBefore(messageEl, authForm.firstChild.nextSibling);
    }

    // Auto remove after 5 seconds
    setTimeout(() => {
      messageEl.style.opacity = '0';
      messageEl.style.transform = 'translateY(-10px)';
      setTimeout(() => messageEl.remove(), 300);
    }, 5000);
  }
};

// Initialize auth manager when page loads
document.addEventListener('DOMContentLoaded', () => {
  AuthManager.init();
});