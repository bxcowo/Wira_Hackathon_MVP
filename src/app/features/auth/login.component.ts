import { Component, OnInit, OnDestroy, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LoginFormData } from '../../core/interfaces/auth.interface';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="login-container">
      <!-- Background Elements -->
      <div class="background-elements">
        <div class="circle circle-1"></div>
        <div class="circle circle-2"></div>
        <div class="gradient-overlay"></div>
      </div>

      <!-- Header with Logo -->
      <div class="login-header">
        <div class="logo-container">
          <svg class="logo-icon" viewBox="0 0 24 24" fill="none">
            <path d="M3 6h18v12H3V6z" stroke="currentColor" stroke-width="2" fill="none"/>
            <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="currentColor" stroke-width="2"/>
            <circle cx="12" cy="12" r="2" fill="currentColor"/>
          </svg>
          <h1 class="logo-text">TransitAI</h1>
        </div>
        <p class="login-subtitle">Monitoreo Inteligente de Tránsito Urbano</p>
      </div>

      <!-- Login Form Card -->
      <div class="login-card">
        <div class="card-header">
          <h2 class="form-title">Iniciar Sesión</h2>
          <p class="form-description">Accede a tu panel de control</p>
        </div>

        <!-- Error Message -->
        @if (authService.error()) {
          <div class="error-message" role="alert">
            <svg class="error-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            <span>{{ authService.error() }}</span>
          </div>
        }

        <!-- Login Form -->
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
          <!-- Email Field -->
          <div class="form-group">
            <label for="email" class="form-label">Correo Electrónico</label>
            <div class="input-container">
              <svg class="input-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
              </svg>
              <input
                type="email"
                id="email"
                formControlName="email"
                class="form-input"
                placeholder="tu@correo.com"
                autocomplete="email"
                [class.invalid]="isFieldInvalid('email')"
                [attr.aria-invalid]="isFieldInvalid('email')"
                [attr.aria-describedby]="isFieldInvalid('email') ? 'email-error' : null"
              />
            </div>
            @if (isFieldInvalid('email')) {
              <div class="field-error" id="email-error" role="alert">
                @if (loginForm.get('email')?.hasError('required')) {
                  El correo electrónico es requerido
                } @else if (loginForm.get('email')?.hasError('email')) {
                  Ingrese un correo electrónico válido
                }
              </div>
            }
          </div>

          <!-- Password Field -->
          <div class="form-group">
            <label for="password" class="form-label">Contraseña</label>
            <div class="input-container">
              <svg class="input-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
              </svg>
              <input
                [type]="showPassword() ? 'text' : 'password'"
                id="password"
                formControlName="password"
                class="form-input password-input"
                placeholder="Ingrese su contraseña"
                autocomplete="current-password"
                [class.invalid]="isFieldInvalid('password')"
                [attr.aria-invalid]="isFieldInvalid('password')"
                [attr.aria-describedby]="isFieldInvalid('password') ? 'password-error' : null"
              />
              <button
                type="button"
                class="password-toggle"
                (click)="togglePasswordVisibility()"
                [attr.aria-label]="showPassword() ? 'Ocultar contraseña' : 'Mostrar contraseña'"
              >
                @if (showPassword()) {
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clip-rule="evenodd" />
                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                  </svg>
                } @else {
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                  </svg>
                }
              </button>
            </div>
            @if (isFieldInvalid('password')) {
              <div class="field-error" id="password-error" role="alert">
                @if (loginForm.get('password')?.hasError('required')) {
                  La contraseña es requerida
                } @else if (loginForm.get('password')?.hasError('minlength')) {
                  La contraseña debe tener al menos 6 caracteres
                }
              </div>
            }
          </div>

          <!-- Remember Me -->
          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input
                type="checkbox"
                formControlName="rememberMe"
                class="checkbox-input"
              />
              <span class="checkbox-custom"></span>
              <span class="checkbox-text">Recordar mi sesión</span>
            </label>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            class="btn btn-primary btn-lg submit-button"
            [class.btn-loading]="authService.loading()"
            [disabled]="!loginForm.valid || authService.loading()"
            [attr.aria-label]="authService.loading() ? 'Iniciando sesión...' : 'Iniciar Sesión'"
          >
            @if (authService.loading()) {
              <span class="sr-only">Iniciando sesión...</span>
            } @else {
              <span>Iniciar Sesión</span>
              <svg class="btn-icon button-arrow" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            }
          </button>
        </form>

        <!-- Demo Users Info -->
        <div class="demo-info">
          <h3 class="demo-title">Usuarios de Demostración</h3>
          <div class="demo-users">
            <div class="demo-user">
              <strong>Administrador:</strong>
              <code>admin@transitai.pe</code> / <code>admin123</code>
            </div>
            <div class="demo-user">
              <strong>Gobierno:</strong>
              <code>gobierno@lima.gob.pe</code> / <code>gobierno123</code>
            </div>
            <div class="demo-user">
              <strong>Operador:</strong>
              <code>operador@transitai.pe</code> / <code>operador123</code>
            </div>
          </div>
        </div>

        <!-- Back to Home -->
        <div class="back-to-home">
          <button type="button" class="back-button" (click)="goToHome()">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
            </svg>
            Volver al inicio
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem 1rem;
      position: relative;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .background-elements {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      overflow: hidden;
      z-index: 0;
    }

    .circle {
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
    }

    .circle-1 {
      width: 300px;
      height: 300px;
      top: -150px;
      right: -150px;
    }

    .circle-2 {
      width: 200px;
      height: 200px;
      bottom: -100px;
      left: -100px;
    }

    .gradient-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(45deg, rgba(0, 102, 255, 0.1), rgba(16, 185, 129, 0.1));
    }

    .login-header {
      text-align: center;
      margin-bottom: 2rem;
      z-index: 1;
      position: relative;
    }

    .logo-container {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      margin-bottom: 0.5rem;
    }

    .logo-icon {
      width: 2.5rem;
      height: 2.5rem;
      color: #FFFFFF;
    }

    .logo-text {
      font-size: 2rem;
      font-weight: 700;
      color: #FFFFFF;
      letter-spacing: -0.025em;
    }

    .login-subtitle {
      color: rgba(255, 255, 255, 0.9);
      font-size: 1rem;
      font-weight: 400;
    }

    .login-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 1rem;
      padding: 2.5rem;
      width: 100%;
      max-width: 420px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 
                  0 10px 10px -5px rgba(0, 0, 0, 0.04);
      position: relative;
      z-index: 1;
    }

    .card-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .form-title {
      font-size: 1.75rem;
      font-weight: 700;
      color: #111827;
      margin-bottom: 0.5rem;
    }

    .form-description {
      color: #6B7280;
      font-size: 1rem;
    }

    .error-message {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
      background-color: #FEF2F2;
      border: 1px solid #FECACA;
      border-radius: 0.5rem;
      color: #DC2626;
      margin-bottom: 1.5rem;
      font-size: 0.9rem;
    }

    .error-icon {
      width: 1.25rem;
      height: 1.25rem;
      flex-shrink: 0;
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .form-label {
      font-weight: var(--font-weight-semibold);
      color: var(--text-primary);
      margin-bottom: var(--space-2);
      font-size: var(--font-size-sm);
    }

    .input-container {
      position: relative;
      display: flex;
      align-items: center;
    }

    .input-icon {
      position: absolute;
      left: 1rem;
      width: 1.25rem;
      height: 1.25rem;
      color: #9CA3AF;
      z-index: 1;
    }

    .form-input {
      width: 100%;
      height: var(--form-input-height);
      padding: 0 1rem 0 3rem;
      border: 2px solid var(--border-light);
      border-radius: var(--radius-lg);
      font-size: var(--font-size-base);
      background-color: var(--surface-primary);
      transition: all var(--transition-fast);
      display: flex;
      align-items: center;
    }

    .form-input:focus {
      outline: none;
      border-color: var(--border-focus);
      box-shadow: var(--shadow-focus);
    }

    .form-input.invalid {
      border-color: var(--border-error);
    }

    .form-input.invalid:focus {
      border-color: var(--border-error);
      box-shadow: var(--shadow-error-focus);
    }

    .password-input {
      padding-right: 3rem;
    }

    .password-toggle {
      position: absolute;
      right: 1rem;
      background: none;
      border: none;
      color: #9CA3AF;
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 0.25rem;
      transition: color 0.2s ease;
    }

    .password-toggle:hover {
      color: #6B7280;
    }

    .password-toggle svg {
      width: 1.25rem;
      height: 1.25rem;
    }

    .field-error {
      margin-top: var(--space-2);
      color: var(--status-danger);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-medium);
    }

    .checkbox-group {
      flex-direction: row !important;
      align-items: center;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;
      font-size: 0.9rem;
      color: #374151;
    }

    .checkbox-input {
      display: none;
    }

    .checkbox-custom {
      width: 1.25rem;
      height: 1.25rem;
      border: 2px solid var(--border-medium);
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all var(--transition-fast);
      position: relative;
    }

    .checkbox-input:checked + .checkbox-custom {
      background-color: var(--primary-blue);
      border-color: var(--primary-blue);
    }

    .checkbox-input:checked + .checkbox-custom::after {
      content: '✓';
      color: white;
      font-size: 0.75rem;
      font-weight: bold;
    }

    .submit-button {
      width: 100%;
      margin-top: var(--space-6);
    }

    .submit-button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: var(--shadow-xl);
    }

    /* Loading handled by unified button system */

    .submit-button:hover .button-arrow {
      transform: translateX(2px);
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    .demo-info {
      margin-top: 2rem;
      padding: 1.5rem;
      background: #F9FAFB;
      border-radius: 0.5rem;
      border: 1px solid #E5E7EB;
    }

    .demo-title {
      font-size: 0.9rem;
      font-weight: 600;
      color: #374151;
      margin-bottom: 1rem;
    }

    .demo-users {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .demo-user {
      font-size: 0.8rem;
      color: #6B7280;
    }

    .demo-user code {
      background: #E5E7EB;
      padding: 0.125rem 0.375rem;
      border-radius: 0.25rem;
      font-family: 'Monaco', 'Consolas', monospace;
      font-size: 0.75rem;
      color: #374151;
    }

    .back-to-home {
      margin-top: 1.5rem;
      text-align: center;
    }

    .back-button {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      color: #6B7280;
      font-size: 0.9rem;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 0.375rem;
      transition: all 0.2s ease;
    }

    .back-button:hover {
      color: #0066FF;
      background: rgba(0, 102, 255, 0.05);
    }

    .back-button svg {
      width: 1rem;
      height: 1rem;
    }

    @media (max-width: 480px) {
      .login-container {
        padding: 1rem;
      }
      
      .login-card {
        padding: 1.5rem;
      }
      
      .logo-text {
        font-size: 1.75rem;
      }
      
      .demo-info {
        padding: 1rem;
      }
    }
  `]
})
export class LoginComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  readonly authService = inject(AuthService);

  loginForm: FormGroup;
  showPassword = signal(false);
  returnUrl = '';

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });

    // Auto-redirect effect when user becomes authenticated
    effect(() => {
      if (this.authService.isAuthenticated()) {
        const redirectUrl = this.returnUrl || '/dashboard';
        this.router.navigate([redirectUrl]);
      }
    });
  }

  ngOnInit(): void {
    // Get return URL from query params
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  }

  ngOnDestroy(): void {
    // Auth errors are managed by the service itself
    // No need to manually clear them here
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.valid) {
      const formData: LoginFormData = this.loginForm.value;
      
      const credentials = {
        email: formData.email,
        password: formData.password
      };

      const result = await this.authService.login(credentials);
      
      if (result.success) {
        // Success handling is managed by the effect above
        console.log('Login successful:', result.user?.email);
      } else {
        // Error is already set in the auth service
        console.error('Login failed:', result.error);
      }
    } else {
      // Mark all fields as touched to show validation errors
      this.loginForm.markAllAsTouched();
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(show => !show);
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }
}