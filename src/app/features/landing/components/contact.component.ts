import { Component, inject, AfterViewInit, ElementRef, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationService } from '../../../core/services';
import { ContactMethod, SocialLink, ContactFormData } from '../../../core/interfaces';

/**
 * ContactComponent displays contact information and contact form
 * Features: contact methods, social links, reactive contact form
 */
@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section id="contacto" class="contact" #contactSection>
      <div class="container">
        <div class="contact-layout">
          <div class="contact-info">
            <h2 class="section-title">Contáctanos</h2>
            <p class="section-subtitle">
              ¿Interesado en implementar TransitAI en tu ciudad? Nuestro equipo está listo para ayudarte.
            </p>
            
            <div class="contact-methods">
              <div 
                class="contact-method" 
                *ngFor="let method of contactMethods; trackBy: trackByMethod"
              >
                <div class="method-icon" [innerHTML]="method.icon"></div>
                <div class="method-info">
                  <h4>{{ method.title }}</h4>
                  <p>{{ method.value }}</p>
                </div>
              </div>
            </div>
            
            <div class="social-links">
              <a 
                *ngFor="let link of socialLinks; trackBy: trackByLink"
                [href]="link.url" 
                class="social-link" 
                [attr.aria-label]="link.ariaLabel"
                target="_blank"
                rel="noopener noreferrer"
                [innerHTML]="link.icon"
              >
              </a>
            </div>
          </div>
          
          <div class="contact-form">
            <form class="form" [formGroup]="contactForm" (ngSubmit)="onSubmit()">
              <div class="form-group">
                <label for="name">Nombre Completo</label>
                <input 
                  type="text" 
                  id="name" 
                  formControlName="name"
                  [class.invalid]="isFieldInvalid('name')"
                  required
                  [attr.aria-invalid]="isFieldInvalid('name')"
                  [attr.aria-describedby]="isFieldInvalid('name') ? 'name-error' : null"
                >
                @if (isFieldInvalid('name')) {
                  <span class="error-message" id="name-error" role="alert">El nombre es requerido</span>
                }
              </div>
              
              <div class="form-group">
                <label for="email">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  formControlName="email"
                  [class.invalid]="isFieldInvalid('email')"
                  required
                  [attr.aria-invalid]="isFieldInvalid('email')"
                  [attr.aria-describedby]="isFieldInvalid('email') ? 'email-error' : null"
                >
                @if (isFieldInvalid('email')) {
                  <span class="error-message" id="email-error" role="alert">
                    @if (contactForm.get('email')?.errors?.['required']) {
                      El email es requerido
                    } @else if (contactForm.get('email')?.errors?.['email']) {
                      Ingrese un email válido
                    }
                  </span>
                }
              </div>
              
              <div class="form-group">
                <label for="organization">Organización</label>
                <input 
                  type="text" 
                  id="organization" 
                  formControlName="organization"
                >
              </div>
              
              <div class="form-group">
                <label for="message">Mensaje</label>
                <textarea 
                  id="message" 
                  formControlName="message"
                  rows="5" 
                  placeholder="Cuéntanos sobre tu proyecto o consulta..."
                  [class.invalid]="isFieldInvalid('message')"
                  required
                  [attr.aria-invalid]="isFieldInvalid('message')"
                  [attr.aria-describedby]="isFieldInvalid('message') ? 'message-error' : null"
                ></textarea>
                @if (isFieldInvalid('message')) {
                  <span class="error-message" id="message-error" role="alert">El mensaje es requerido</span>
                }
              </div>
              
              <button 
                type="submit" 
                class="btn-primary full-width"
                [disabled]="contactForm.invalid || isSubmitting()"
              >
                @if (isSubmitting()) {
                  Enviando...
                } @else {
                  Enviar Mensaje
                }
              </button>
              
              @if (submitMessage()) {
                <div class="submit-message" [class.success]="submitSuccess()">
                  {{ submitMessage() }}
                </div>
              }
            </form>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .contact {
      padding: var(--space-20) 0;
      background: linear-gradient(135deg, var(--gray-50) 0%, var(--surface-primary) 100%);
      position: relative;
    }

    .contact::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: 
        radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.1) 0%, transparent 50%);
      pointer-events: none;
    }

    .contact-layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-16);
      align-items: start;
      position: relative;
      z-index: 1;
    }

    .contact-info {
      display: flex;
      flex-direction: column;
      gap: var(--space-8);
    }

    .section-title {
      font-family: var(--font-family-display);
      font-size: var(--font-size-4xl);
      font-weight: var(--font-weight-extrabold);
      color: var(--text-primary);
      margin: 0;
      line-height: var(--line-height-tight);
    }

    .section-subtitle {
      font-size: var(--font-size-xl);
      color: var(--text-secondary);
      line-height: var(--line-height-relaxed);
      margin: 0;
      max-width: 500px;
    }

    .contact-methods {
      display: flex;
      flex-direction: column;
      gap: var(--space-6);
    }

    .contact-method {
      display: flex;
      align-items: center;
      gap: var(--space-4);
      padding: var(--space-5);
      background: var(--surface-primary);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-xl);
      transition: all var(--transition-normal);
    }

    .contact-method:hover {
      background: var(--surface-accent);
      border-color: var(--primary-blue-200);
      transform: translateX(8px);
      box-shadow: var(--shadow-md);
    }

    .method-icon {
      width: 3rem;
      height: 3rem;
      background: var(--primary-blue-100);
      border-radius: var(--radius-xl);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--primary-blue);
      transition: all var(--transition-normal);
      flex-shrink: 0;
    }

    .contact-method:hover .method-icon {
      background: var(--primary-blue);
      color: var(--text-inverse);
      transform: scale(1.05);
    }

    .method-icon svg {
      width: 1.5rem;
      height: 1.5rem;
    }

    .method-info h4 {
      font-family: var(--font-family-display);
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-semibold);
      color: var(--text-primary);
      margin: 0 0 var(--space-1) 0;
    }

    .method-info p {
      color: var(--text-secondary);
      margin: 0;
      font-weight: var(--font-weight-medium);
    }

    .social-links {
      display: flex;
      gap: var(--space-4);
      margin-top: var(--space-4);
    }

    .social-link {
      width: 3rem;
      height: 3rem;
      background: var(--surface-secondary);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-xl);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-secondary);
      transition: all var(--transition-normal);
    }

    .social-link:hover {
      background: var(--primary-blue);
      color: var(--text-inverse);
      border-color: var(--primary-blue);
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

    .social-link svg {
      width: 1.25rem;
      height: 1.25rem;
    }

    .contact-form {
      background: var(--surface-primary);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-2xl);
      padding: var(--space-8);
      box-shadow: var(--shadow-xl);
      position: relative;
    }

    .contact-form::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: var(--gradient-primary);
      border-radius: var(--radius-2xl) var(--radius-2xl) 0 0;
    }

    .form {
      display: flex;
      flex-direction: column;
      gap: var(--space-6);
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .form-group label {
      font-weight: var(--font-weight-semibold);
      color: var(--text-primary);
      font-size: var(--font-size-sm);
    }

    .form-group input,
    .form-group textarea {
      padding: var(--space-3) var(--space-4);
      border: 2px solid var(--border-light);
      border-radius: var(--radius-lg);
      font-size: var(--font-size-base);
      background-color: var(--surface-primary);
      transition: all var(--transition-fast);
      font-family: var(--font-family-primary);
    }

    .form-group input:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: var(--border-focus);
      box-shadow: var(--shadow-focus);
      background-color: var(--surface-accent);
    }

    .form-group input.invalid,
    .form-group textarea.invalid {
      border-color: var(--border-error);
    }

    .form-group input.invalid:focus,
    .form-group textarea.invalid:focus {
      border-color: var(--border-error);
      box-shadow: var(--shadow-error-focus);
    }

    .form-group textarea {
      resize: vertical;
      min-height: 120px;
    }

    .error-message {
      color: var(--status-danger);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-medium);
      margin-top: var(--space-1);
    }

    .btn-primary {
      background: var(--gradient-primary);
      color: var(--text-inverse);
      border: none;
      padding: var(--space-4) var(--space-8);
      border-radius: var(--radius-xl);
      font-weight: var(--font-weight-semibold);
      font-size: var(--font-size-lg);
      cursor: pointer;
      transition: all var(--transition-normal);
      min-height: var(--button-height-lg);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: var(--shadow-md);
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: var(--shadow-xl);
    }

    .btn-primary:disabled {
      opacity: var(--disabled-opacity);
      cursor: not-allowed;
      transform: none;
    }

    .full-width {
      width: 100%;
    }

    .submit-message {
      padding: var(--space-3) var(--space-4);
      border-radius: var(--radius-lg);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      text-align: center;
      border: 1px solid;
    }

    .submit-message.success {
      background: var(--surface-accent);
      color: var(--status-success);
      border-color: var(--status-success);
      background: #F0FDF4;
    }

    .submit-message:not(.success) {
      background: var(--alert-red-light);
      color: var(--status-danger);
      border-color: var(--status-danger);
    }

    /* Responsive Design */
    @media (max-width: 1024px) {
      .contact-layout {
        grid-template-columns: 1fr;
        gap: var(--space-12);
      }

      .contact-info {
        text-align: center;
      }

      .section-title,
      .section-subtitle {
        text-align: center;
      }

      .section-subtitle {
        max-width: none;
      }
    }

    @media (max-width: 768px) {
      .contact {
        padding: var(--space-16) 0;
      }

      .section-title {
        font-size: var(--font-size-3xl);
      }

      .section-subtitle {
        font-size: var(--font-size-lg);
      }

      .contact-form {
        padding: var(--space-6);
      }

      .contact-method {
        padding: var(--space-4);
      }

      .method-icon {
        width: 2.5rem;
        height: 2.5rem;
      }

      .method-icon svg {
        width: 1.25rem;
        height: 1.25rem;
      }

      .social-links {
        justify-content: center;
      }
    }

    @media (max-width: 480px) {
      .contact {
        padding: var(--space-12) 0;
      }

      .section-title {
        font-size: var(--font-size-2xl);
      }

      .section-subtitle {
        font-size: var(--font-size-base);
      }

      .contact-form {
        padding: var(--space-5);
      }

      .contact-method {
        flex-direction: column;
        text-align: center;
        gap: var(--space-3);
      }

      .social-link {
        width: 2.5rem;
        height: 2.5rem;
      }

      .social-link svg {
        width: 1rem;
        height: 1rem;
      }
    }

    /* Loading state */
    .btn-primary[disabled] {
      position: relative;
    }

    .btn-primary[disabled]::after {
      content: '';
      position: absolute;
      width: 1rem;
      height: 1rem;
      border: 2px solid transparent;
      border-top-color: currentColor;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-left: var(--space-2);
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Accessibility enhancements */
    @media (prefers-reduced-motion: reduce) {
      .contact-method,
      .method-icon,
      .social-link,
      .btn-primary {
        transition: none;
      }
      
      .contact-method:hover,
      .social-link:hover,
      .btn-primary:hover {
        transform: none;
      }
      
      .contact-method:hover .method-icon {
        transform: none;
      }
      
      .btn-primary[disabled]::after {
        animation: none;
      }
    }

    /* High contrast mode */
    @media (prefers-contrast: high) {
      .contact-method,
      .social-link,
      .contact-form,
      .form-group input,
      .form-group textarea {
        border-width: 2px;
        border-color: var(--text-primary);
      }
      
      .contact-method:hover,
      .social-link:hover {
        border-color: var(--primary-blue);
      }
      
      .form-group input:focus,
      .form-group textarea:focus {
        border-color: var(--primary-blue);
      }
    }

    /* Focus management */
    .contact-method:focus-within,
    .social-link:focus-visible,
    .form-group:focus-within {
      outline: 2px solid var(--border-focus);
      outline-offset: 2px;
    }

    /* Touch-friendly targets */
    @media (hover: none) and (pointer: coarse) {
      .contact-method,
      .social-link,
      .btn-primary,
      .form-group input,
      .form-group textarea {
        min-height: 44px;
        touch-action: manipulation;
      }
    }
  `]
})
export class ContactComponent implements AfterViewInit {
  @ViewChild('contactSection', { static: true }) contactSection!: ElementRef<HTMLElement>;
  
  readonly navigationService = inject(NavigationService);
  private readonly formBuilder = inject(FormBuilder);

  // Form state signals
  readonly isSubmitting = signal(false);
  readonly submitMessage = signal('');
  readonly submitSuccess = signal(false);

  // Contact form
  readonly contactForm: FormGroup = this.formBuilder.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    organization: [''],
    message: ['', [Validators.required]]
  });

  // Contact methods data
  readonly contactMethods: ContactMethod[] = [
    {
      icon: `<span style="font-size: 1.5rem;">📧</span>`,
      title: 'Email',
      value: 'contacto@transitai.com'
    },
    {
      icon: `<span style="font-size: 1.5rem;">📞</span>`,
      title: 'Teléfono',
      value: '+51 1 234-5678'
    },
    {
      icon: `<span style="font-size: 1.5rem;">🏢</span>`,
      title: 'Oficina',
      value: 'Lima, Perú'
    }
  ];

  // Social links data
  readonly socialLinks: SocialLink[] = [
    {
      platform: 'linkedin',
      url: '#',
      ariaLabel: 'LinkedIn',
      icon: `<span style="font-size: 1.25rem;">💼</span>`
    },
    {
      platform: 'twitter',
      url: '#',
      ariaLabel: 'Twitter',
      icon: `<span style="font-size: 1.25rem;">🐦</span>`
    },
    {
      platform: 'github',
      url: '#',
      ariaLabel: 'GitHub',
      icon: `<span style="font-size: 1.25rem;">💻</span>`
    }
  ];

  ngAfterViewInit(): void {
    // Register this section with the navigation service
    this.navigationService.registerSection(
      'contacto',
      'Contacto',
      this.contactSection.nativeElement
    );
  }

  /**
   * Check if form field is invalid and touched
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.contactForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Handle form submission
   */
  async onSubmit(): Promise<void> {
    if (this.contactForm.invalid) {
      // Mark all fields as touched to show validation errors
      this.contactForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.submitMessage.set('');
    
    try {
      const formData: ContactFormData = this.contactForm.value;
      
      // TODO: Implement actual form submission
      // TODO: Send data to backend API
      // TODO: Handle response and errors
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Success simulation
      this.submitSuccess.set(true);
      this.submitMessage.set('¡Mensaje enviado exitosamente! Te contactaremos pronto.');
      this.contactForm.reset();
      
    } catch (error) {
      this.submitSuccess.set(false);
      this.submitMessage.set('Error al enviar el mensaje. Por favor intenta nuevamente.');
      console.error('Contact form error:', error);
    } finally {
      this.isSubmitting.set(false);
      
      // Clear message after 5 seconds
      setTimeout(() => {
        this.submitMessage.set('');
      }, 5000);
    }
  }

  /**
   * TrackBy functions
   */
  trackByMethod(index: number, method: ContactMethod): string {
    return method.title;
  }

  trackByLink(index: number, link: SocialLink): string {
    return link.platform;
  }
}