import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationService } from '../../core/services';

/**
 * FooterComponent displays the website footer with links and company information
 * Features: footer links, brand information, copyright notice
 */
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-brand">
            <div class="brand">
              <svg class="brand-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              <span class="brand-text">TransitAI</span>
            </div>
            <p class="footer-description">
              Transformando el futuro del transporte urbano con inteligencia artificial 
              y visión computacional avanzada.
            </p>
          </div>
          
          <div class="footer-links">
            <div class="link-group">
              <h4>Producto</h4>
              <a 
                href="#que-es"
                (click)="navigationService.handleNavigationClick($event, 'que-es')"
              >¿Qué es TransitAI?</a>
              <a 
                href="#servicios"
                (click)="navigationService.handleNavigationClick($event, 'servicios')"
              >Servicios</a>
              <a href="#" (click)="handleLinkClick($event)">Precios</a>
              <a href="#" (click)="handleLinkClick($event)">Demo</a>
            </div>
            
            <div class="link-group">
              <h4>Empresa</h4>
              <a 
                href="#quienes-somos"
                (click)="navigationService.handleNavigationClick($event, 'quienes-somos')"
              >Acerca de</a>
              <a href="#" (click)="handleLinkClick($event)">Blog</a>
              <a href="#" (click)="handleLinkClick($event)">Carreras</a>
              <a 
                href="#contacto"
                (click)="navigationService.handleNavigationClick($event, 'contacto')"
              >Contacto</a>
            </div>
            
            <div class="link-group">
              <h4>Soporte</h4>
              <a href="#" (click)="handleLinkClick($event)">Documentación</a>
              <a href="#" (click)="handleLinkClick($event)">Ayuda</a>
              <a href="#" (click)="handleLinkClick($event)">Status</a>
              <a href="#" (click)="handleLinkClick($event)">Política de Privacidad</a>
            </div>
          </div>
        </div>
        
        <div class="footer-bottom">
          <p>&copy; 2024 TransitAI. Todos los derechos reservados.</p>
          <p>Hecho con ❤️ en Lima, Perú</p>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background: var(--gray-900);
      color: var(--white);
      padding: var(--space-20) 0 var(--space-8);
    }

    .footer-content {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: var(--space-16);
      margin-bottom: var(--space-12);
    }

    .footer-brand .brand {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      margin-bottom: var(--space-6);
    }

    .footer-brand .brand-icon {
      width: 32px;
      height: 32px;
      color: var(--primary-blue);
    }

    .footer-brand .brand-text {
      font-family: var(--font-family-display);
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-bold);
      color: var(--white);
    }

    .footer-description {
      color: var(--gray-400);
      line-height: 1.6;
      max-width: 400px;
    }

    .footer-links {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--space-8);
    }

    .link-group h4 {
      color: var(--white);
      margin-bottom: var(--space-4);
      font-size: var(--font-size-base);
    }

    .link-group a {
      display: block;
      color: var(--gray-400);
      margin-bottom: var(--space-3);
      font-size: var(--font-size-sm);
      transition: color var(--transition-fast);
    }

    .link-group a:hover {
      color: var(--white);
    }

    .footer-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: var(--space-8);
      border-top: 1px solid var(--gray-800);
      color: var(--gray-400);
      font-size: var(--font-size-sm);
    }
  `]
})
export class FooterComponent {
  readonly navigationService = inject(NavigationService);

  /**
   * Handle placeholder link clicks (for future pages)
   */
  handleLinkClick(event: Event): void {
    event.preventDefault();
    console.log('Link clicked - page not implemented yet');
  }
}