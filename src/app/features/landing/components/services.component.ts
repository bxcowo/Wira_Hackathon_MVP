import { Component, inject, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationService } from '../../../core/services';
import { Service } from '../../../core/interfaces';

/**
 * ServicesComponent displays available services and call-to-action
 * Features: service cards with features, primary service highlighting, CTA section
 */
@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section id="servicios" class="services" #servicesSection>
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Servicios</h2>
          <p class="section-subtitle">
            Soluciones integrales para autoridades de tránsito y gobiernos locales
          </p>
        </div>
        
        <div class="services-grid">
          <div 
            class="service-card" 
            [class.primary]="service.isPrimary"
            *ngFor="let service of services; trackBy: trackByService"
          >
            <div class="service-header">
              <div class="service-icon" [innerHTML]="service.icon"></div>
              <h3>{{ service.title }}</h3>
            </div>
            <p class="service-description">{{ service.description }}</p>
            <ul class="service-features">
              <li *ngFor="let feature of service.features; trackBy: trackByFeature">
                {{ feature }}
              </li>
            </ul>
          </div>
        </div>
        
        <div class="services-cta">
          <h3>¿Listo para transformar el tránsito en tu ciudad?</h3>
          <p>Contáctanos para una demo personalizada y descubre cómo TransitAI puede mejorar la seguridad vial.</p>
          <button class="btn-primary" (click)="handleDemoRequest()">
            Solicitar Demo
          </button>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .services {
      padding: var(--space-20) 0;
      background: var(--surface-primary);
      position: relative;
      overflow: hidden;
    }

    .services::before {
      content: '';
      position: absolute;
      top: -30%;
      left: -20%;
      width: 800px;
      height: 800px;
      background: radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%);
      pointer-events: none;
    }

    .services::after {
      content: '';
      position: absolute;
      bottom: -30%;
      right: -20%;
      width: 600px;
      height: 600px;
      background: radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%);
      pointer-events: none;
    }

    .section-header {
      text-align: center;
      margin-bottom: var(--space-16);
      position: relative;
      z-index: 1;
    }

    .section-title {
      font-family: var(--font-family-display);
      font-size: var(--font-size-4xl);
      font-weight: var(--font-weight-extrabold);
      color: var(--text-primary);
      margin: 0 0 var(--space-6) 0;
      line-height: var(--line-height-tight);
    }

    .section-subtitle {
      font-size: var(--font-size-xl);
      color: var(--text-secondary);
      line-height: var(--line-height-relaxed);
      max-width: 700px;
      margin: 0 auto;
    }

    .services-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: var(--space-8);
      margin-bottom: var(--space-20);
      position: relative;
      z-index: 1;
    }

    .service-card {
      background: var(--surface-primary);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-2xl);
      padding: var(--space-8);
      transition: all var(--transition-normal);
      box-shadow: var(--shadow-sm);
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .service-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: var(--gradient-primary);
      transform: scaleX(0);
      transform-origin: left;
      transition: transform var(--transition-normal);
    }

    .service-card:hover {
      transform: translateY(-8px);
      box-shadow: var(--shadow-2xl);
      border-color: var(--primary-blue-200);
    }

    .service-card:hover::before {
      transform: scaleX(1);
    }

    .service-card.primary {
      background: linear-gradient(135deg, var(--surface-primary) 0%, var(--surface-accent) 100%);
      border-color: var(--primary-blue-200);
      position: relative;
      overflow: hidden;
    }

    .service-card.primary::after {
      content: 'Popular';
      position: absolute;
      top: var(--space-4);
      right: var(--space-4);
      background: var(--primary-blue);
      color: var(--text-inverse);
      padding: var(--space-1) var(--space-3);
      border-radius: var(--radius-full);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-semibold);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .service-card.primary::before {
      transform: scaleX(1);
    }

    .service-card.primary:hover {
      transform: translateY(-12px);
      box-shadow: 0 25px 50px -12px rgba(59, 130, 246, 0.25);
    }

    .service-header {
      display: flex;
      align-items: center;
      gap: var(--space-4);
      margin-bottom: var(--space-6);
    }

    .service-icon {
      width: 4rem;
      height: 4rem;
      background: var(--primary-blue-100);
      border-radius: var(--radius-2xl);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--primary-blue);
      transition: all var(--transition-normal);
      flex-shrink: 0;
    }

    .service-card:hover .service-icon {
      background: var(--primary-blue);
      color: var(--text-inverse);
      transform: scale(1.05);
    }

    .service-icon svg {
      width: 2rem;
      height: 2rem;
    }

    .service-header h3 {
      font-family: var(--font-family-display);
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-bold);
      color: var(--text-primary);
      margin: 0;
      line-height: var(--line-height-snug);
    }

    .service-description {
      color: var(--text-secondary);
      line-height: var(--line-height-relaxed);
      font-size: var(--font-size-lg);
      margin: 0 0 var(--space-8) 0;
      flex-grow: 1;
    }

    .service-features {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }

    .service-features li {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      color: var(--text-secondary);
      font-size: var(--font-size-sm);
      position: relative;
      padding-left: var(--space-6);
    }

    .service-features li::before {
      content: '✓';
      position: absolute;
      left: 0;
      width: 1.25rem;
      height: 1.25rem;
      background: var(--accent-green);
      color: var(--text-inverse);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-bold);
    }

    .services-cta {
      background: linear-gradient(135deg, var(--primary-blue) 0%, var(--accent-green) 100%);
      color: var(--text-inverse);
      border-radius: var(--radius-3xl);
      padding: var(--space-16) var(--space-8);
      text-align: center;
      position: relative;
      z-index: 1;
      overflow: hidden;
    }

    .services-cta::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: 
        radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
      pointer-events: none;
    }

    .services-cta h3 {
      font-family: var(--font-family-display);
      font-size: var(--font-size-3xl);
      font-weight: var(--font-weight-bold);
      margin: 0 0 var(--space-4) 0;
      line-height: var(--line-height-snug);
    }

    .services-cta p {
      font-size: var(--font-size-xl);
      line-height: var(--line-height-relaxed);
      margin: 0 0 var(--space-8) 0;
      opacity: 0.95;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
    }

    .btn-primary {
      background: var(--surface-primary);
      color: var(--primary-blue);
      border: none;
      padding: var(--space-4) var(--space-10);
      border-radius: var(--radius-full);
      font-weight: var(--font-weight-bold);
      font-size: var(--font-size-lg);
      cursor: pointer;
      transition: all var(--transition-normal);
      min-height: var(--button-height-lg);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      box-shadow: var(--shadow-xl);
      position: relative;
      z-index: 1;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
      background: var(--gray-50);
    }

    /* Responsive Design */
    @media (max-width: 1024px) {
      .services-grid {
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: var(--space-6);
      }
    }

    @media (max-width: 768px) {
      .services {
        padding: var(--space-16) 0;
      }

      .section-title {
        font-size: var(--font-size-3xl);
      }

      .section-subtitle {
        font-size: var(--font-size-lg);
      }

      .services-grid {
        grid-template-columns: 1fr;
        gap: var(--space-6);
        margin-bottom: var(--space-16);
      }

      .service-card {
        padding: var(--space-6);
      }

      .service-icon {
        width: 3rem;
        height: 3rem;
      }

      .service-icon svg {
        width: 1.5rem;
        height: 1.5rem;
      }

      .service-header h3 {
        font-size: var(--font-size-xl);
      }

      .service-description {
        font-size: var(--font-size-base);
      }

      .services-cta {
        padding: var(--space-12) var(--space-6);
      }

      .services-cta h3 {
        font-size: var(--font-size-2xl);
      }

      .services-cta p {
        font-size: var(--font-size-lg);
      }
    }

    @media (max-width: 480px) {
      .services {
        padding: var(--space-12) 0;
      }

      .section-title {
        font-size: var(--font-size-2xl);
      }

      .section-subtitle {
        font-size: var(--font-size-base);
      }

      .service-card {
        padding: var(--space-5);
      }

      .service-header {
        flex-direction: column;
        text-align: center;
        gap: var(--space-3);
      }

      .services-cta {
        padding: var(--space-10) var(--space-4);
      }

      .services-cta h3 {
        font-size: var(--font-size-xl);
      }

      .services-cta p {
        font-size: var(--font-size-base);
      }

      .btn-primary {
        padding: var(--space-3) var(--space-8);
        font-size: var(--font-size-base);
      }
    }

    /* Accessibility enhancements */
    @media (prefers-reduced-motion: reduce) {
      .service-card,
      .service-icon,
      .service-card::before,
      .btn-primary {
        transition: none;
      }
      
      .service-card:hover,
      .btn-primary:hover {
        transform: none;
      }
      
      .service-card:hover .service-icon {
        transform: none;
      }
    }

    /* High contrast mode */
    @media (prefers-contrast: high) {
      .service-card {
        border-width: 2px;
        border-color: var(--text-primary);
      }
      
      .service-card:hover {
        border-color: var(--primary-blue);
      }
      
      .service-card.primary {
        border-width: 3px;
        border-color: var(--primary-blue);
      }
      
      .services-cta {
        border: 2px solid var(--text-inverse);
      }
      
      .btn-primary {
        border: 2px solid var(--primary-blue);
      }
    }

    /* Focus management */
    .service-card:focus-within,
    .btn-primary:focus-visible {
      outline: 2px solid var(--border-focus);
      outline-offset: 2px;
    }

    /* Touch-friendly targets */
    @media (hover: none) and (pointer: coarse) {
      .btn-primary {
        min-height: 44px;
        touch-action: manipulation;
      }
      
      .service-card {
        min-height: 44px;
      }
    }

    /* Animation for service cards */
    .service-card {
      opacity: 0;
      animation: slideInUp 0.6s ease forwards;
    }

    .service-card:nth-child(1) { animation-delay: 0.1s; }
    .service-card:nth-child(2) { animation-delay: 0.2s; }
    .service-card:nth-child(3) { animation-delay: 0.3s; }

    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Disable animations for reduced motion */
    @media (prefers-reduced-motion: reduce) {
      .service-card {
        opacity: 1;
        animation: none;
      }
    }
  `]
})
export class ServicesComponent implements AfterViewInit {
  @ViewChild('servicesSection', { static: true }) servicesSection!: ElementRef<HTMLElement>;
  
  readonly navigationService = inject(NavigationService);

  // Services data
  readonly services: Service[] = [
    {
      icon: `<span style="font-size: 2rem;">📡</span>`,
      title: 'Monitoreo en Tiempo Real',
      description: 'Vigilancia 24/7 de carriles exclusivos con detección automática de invasiones y respuesta inmediata.',
      features: [
        'Cámaras inteligentes con IA',
        'Cobertura completa de carriles',
        'Dashboard en tiempo real',
        'Integración con sistemas existentes'
      ],
      isPrimary: true
    },
    {
      icon: `<span style="font-size: 2rem;">🚨</span>`,
      title: 'Sistema de Alertas',
      description: 'Notificaciones automáticas para autoridades y conductores mediante múltiples canales.',
      features: [
        'Alertas SMS y email',
        'Notificaciones push',
        'Integración con radios de emergencia',
        'Escalamiento automático'
      ]
    },
    {
      icon: `<span style="font-size: 2rem;">📊</span>`,
      title: 'Análisis y Reportes',
      description: 'Insights detallados sobre patrones de tráfico y eficacia de las medidas implementadas.',
      features: [
        'Reportes automatizados',
        'Análisis de tendencias',
        'Métricas de performance',
        'Recomendaciones de mejora'
      ]
    }
  ];

  ngAfterViewInit(): void {
    // Register this section with the navigation service
    this.navigationService.registerSection(
      'servicios',
      'Servicios',
      this.servicesSection.nativeElement
    );
  }

  /**
   * Handle demo request click
   */
  handleDemoRequest(): void {
    // Scroll to contact section
    this.navigationService.scrollToSection({ sectionId: 'contacto' });
  }

  /**
   * TrackBy functions
   */
  trackByService(index: number, service: Service): string {
    return service.title;
  }

  trackByFeature(index: number, feature: string): string {
    return feature;
  }
}