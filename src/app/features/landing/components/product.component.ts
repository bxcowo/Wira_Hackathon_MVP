import { Component, inject, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationService } from '../../../core/services';
import { Feature, BenefitCard, TechItem, ProcessStep } from '../../../core/interfaces';

/**
 * ProductComponent displays product features, benefits, and technical information
 * Features: feature list, benefit cards, technology showcase, process flow
 */
@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section id="que-es" class="product" #productSection>
      <div class="container">
        <div class="product-layout">
          <div class="product-content">
            <h2 class="section-title">¿Qué es TransitAI?</h2>
            <p class="section-subtitle">
              Una plataforma inteligente de monitoreo de tránsito que utiliza visión computacional 
              avanzada para detectar y prevenir invasiones vehiculares en carriles exclusivos.
            </p>
            
            <div class="features-list">
              <div 
                class="feature-item" 
                *ngFor="let feature of features; trackBy: trackByFeature"
              >
                <div class="feature-icon" [innerHTML]="feature.icon"></div>
                <div class="feature-text">
                  <h4>{{ feature.title }}</h4>
                  <p>{{ feature.description }}</p>
                </div>
              </div>
            </div>
            
            <div class="benefit-cards">
              <div 
                class="benefit-card" 
                *ngFor="let benefit of benefits; trackBy: trackByBenefit"
              >
                <span class="benefit-icon">{{ benefit.icon }}</span>
                <h4>{{ benefit.title }}</h4>
                <p>{{ benefit.description }}</p>
              </div>
            </div>
          </div>
          
          <div class="product-visual">
            <div class="tech-showcase">
              <div class="showcase-header">
                <span>Tecnología Avanzada</span>
              </div>
              <div class="tech-stack">
                <div 
                  class="tech-item" 
                  *ngFor="let tech of techStack; trackBy: trackByTech"
                >
                  <div class="tech-icon">{{ tech.icon }}</div>
                  <div class="tech-label">{{ tech.label }}</div>
                </div>
              </div>
              <div class="process-flow">
                @for (step of processSteps; track step.number; let isLast = $last) {
                  <div class="flow-step">
                    <div class="step-number">{{ step.number }}</div>
                    <span>{{ step.label }}</span>
                  </div>
                  @if (!isLast) {
                    <div class="flow-arrow">→</div>
                  }
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .product {
      padding: var(--space-20) 0;
      background: linear-gradient(135deg, var(--surface-secondary) 0%, var(--surface-primary) 100%);
      position: relative;
      overflow: hidden;
    }

    .product::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -20%;
      width: 600px;
      height: 600px;
      background: radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%);
      pointer-events: none;
    }

    .product-layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-16);
      align-items: center;
      position: relative;
      z-index: 1;
    }

    .product-content {
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
    }

    .features-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-6);
    }

    .feature-item {
      display: flex;
      align-items: flex-start;
      gap: var(--space-4);
      padding: var(--space-4);
      background: var(--surface-primary);
      border-radius: var(--radius-xl);
      border: 1px solid var(--border-light);
      transition: all var(--transition-normal);
    }

    .feature-item:hover {
      background: var(--surface-accent);
      border-color: var(--primary-blue-200);
      transform: translateX(8px);
    }

    .feature-icon {
      flex-shrink: 0;
      width: 3rem;
      height: 3rem;
      background: var(--primary-blue-100);
      border-radius: var(--radius-xl);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--primary-blue);
      transition: all var(--transition-normal);
    }

    .feature-item:hover .feature-icon {
      background: var(--primary-blue);
      color: var(--text-inverse);
      transform: scale(1.05);
    }

    .feature-icon svg {
      width: 1.5rem;
      height: 1.5rem;
    }

    .feature-text h4 {
      font-family: var(--font-family-display);
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-semibold);
      color: var(--text-primary);
      margin: 0 0 var(--space-2) 0;
    }

    .feature-text p {
      color: var(--text-secondary);
      line-height: var(--line-height-normal);
      margin: 0;
    }

    .benefit-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--space-4);
      margin-top: var(--space-4);
    }

    .benefit-card {
      background: var(--surface-primary);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-xl);
      padding: var(--space-5);
      text-align: center;
      transition: all var(--transition-normal);
      position: relative;
      overflow: hidden;
    }

    .benefit-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: var(--gradient-primary);
      transform: scaleX(0);
      transform-origin: center;
      transition: transform var(--transition-normal);
    }

    .benefit-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg);
      border-color: var(--primary-blue-200);
    }

    .benefit-card:hover::before {
      transform: scaleX(1);
    }

    .benefit-icon {
      font-size: 2rem;
      display: block;
      margin: 0 0 var(--space-3) 0;
    }

    .benefit-card h4 {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-semibold);
      color: var(--text-primary);
      margin: 0 0 var(--space-2) 0;
    }

    .benefit-card p {
      font-size: var(--font-size-sm);
      color: var(--text-secondary);
      margin: 0;
      line-height: var(--line-height-normal);
    }

    .product-visual {
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .tech-showcase {
      background: var(--surface-primary);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-2xl);
      padding: var(--space-8);
      width: 100%;
      max-width: 500px;
      box-shadow: var(--shadow-xl);
      position: relative;
      overflow: hidden;
    }

    .tech-showcase::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: var(--gradient-primary);
    }

    .showcase-header {
      text-align: center;
      margin-bottom: var(--space-6);
    }

    .showcase-header span {
      font-family: var(--font-family-display);
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-bold);
      color: var(--text-primary);
      background: var(--surface-accent);
      padding: var(--space-2) var(--space-4);
      border-radius: var(--radius-full);
      border: 1px solid var(--border-light);
    }

    .tech-stack {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--space-4);
      margin-bottom: var(--space-8);
    }

    .tech-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-4);
      background: var(--surface-secondary);
      border-radius: var(--radius-lg);
      border: 1px solid var(--border-light);
      transition: all var(--transition-fast);
    }

    .tech-item:hover {
      background: var(--surface-accent);
      border-color: var(--primary-blue-200);
      transform: scale(1.02);
    }

    .tech-icon {
      font-size: 1.5rem;
    }

    .tech-label {
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-medium);
      color: var(--text-secondary);
      text-align: center;
    }

    .process-flow {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-3);
      padding: var(--space-4);
      background: var(--surface-secondary);
      border-radius: var(--radius-xl);
      border: 1px solid var(--border-light);
    }

    .flow-step {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-2);
      flex: 1;
      text-align: center;
    }

    .step-number {
      width: 2rem;
      height: 2rem;
      background: var(--primary-blue);
      color: var(--text-inverse);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-bold);
    }

    .flow-step span {
      font-size: var(--font-size-xs);
      color: var(--text-secondary);
      font-weight: var(--font-weight-medium);
    }

    .flow-arrow {
      color: var(--primary-blue);
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-bold);
    }

    /* Responsive Design */
    @media (max-width: 1024px) {
      .product-layout {
        grid-template-columns: 1fr;
        gap: var(--space-12);
      }

      .product-visual {
        order: -1;
      }

      .tech-showcase {
        max-width: 600px;
      }
    }

    @media (max-width: 768px) {
      .product {
        padding: var(--space-16) 0;
      }

      .section-title {
        font-size: var(--font-size-3xl);
        text-align: center;
      }

      .section-subtitle {
        font-size: var(--font-size-lg);
        text-align: center;
      }

      .benefit-cards {
        grid-template-columns: 1fr;
        gap: var(--space-3);
      }

      .tech-stack {
        grid-template-columns: 1fr 1fr;
        gap: var(--space-3);
      }

      .process-flow {
        flex-direction: column;
        gap: var(--space-4);
      }

      .flow-arrow {
        transform: rotate(90deg);
      }
    }

    @media (max-width: 480px) {
      .product {
        padding: var(--space-12) 0;
      }

      .section-title {
        font-size: var(--font-size-2xl);
      }

      .section-subtitle {
        font-size: var(--font-size-base);
      }

      .feature-item {
        flex-direction: column;
        text-align: center;
        gap: var(--space-3);
      }

      .tech-showcase {
        padding: var(--space-6);
      }

      .tech-stack {
        grid-template-columns: 1fr;
      }
    }

    /* Accessibility enhancements */
    @media (prefers-reduced-motion: reduce) {
      .feature-item,
      .benefit-card,
      .tech-item,
      .feature-icon,
      .benefit-card::before {
        transition: none;
      }
      
      .feature-item:hover,
      .benefit-card:hover,
      .tech-item:hover {
        transform: none;
      }
      
      .feature-item:hover .feature-icon {
        transform: none;
      }
    }

    /* High contrast mode */
    @media (prefers-contrast: high) {
      .feature-item,
      .benefit-card,
      .tech-item,
      .tech-showcase {
        border-width: 2px;
        border-color: var(--text-primary);
      }
      
      .feature-item:hover,
      .benefit-card:hover,
      .tech-item:hover {
        border-color: var(--primary-blue);
      }
    }

    /* Focus management */
    .feature-item:focus-within,
    .benefit-card:focus-within,
    .tech-item:focus-within {
      outline: 2px solid var(--border-focus);
      outline-offset: 2px;
    }
  `]
})
export class ProductComponent implements AfterViewInit {
  @ViewChild('productSection', { static: true }) productSection!: ElementRef<HTMLElement>;
  
  readonly navigationService = inject(NavigationService);

  // Features data
  readonly features: Feature[] = [
    {
      icon: `<span style="font-size: 1.5rem;">🎯</span>`,
      title: 'Detección Automática',
      description: 'Algoritmos de IA detectan invasiones vehiculares con 99% de precisión en tiempo real.'
    },
    {
      icon: `<span style="font-size: 1.5rem;">🔔</span>`,
      title: 'Alertas Inteligentes',
      description: 'Notificaciones automáticas a autoridades y conductores para prevenir accidentes.'
    },
    {
      icon: `<span style="font-size: 1.5rem;">📈</span>`,
      title: 'Análisis Predictivo',
      description: 'Dashboard con insights y estadísticas para optimizar el flujo de tránsito urbano.'
    }
  ];

  // Benefits data
  readonly benefits: BenefitCard[] = [
    {
      icon: '🛡️',
      title: 'Prevención de Accidentes',
      description: 'Reduce accidentes en carriles exclusivos hasta en un 85%'
    },
    {
      icon: '⚡',
      title: 'Eficiencia de Tránsito',
      description: 'Mejora la fluidez del transporte público y ciclistas'
    },
    {
      icon: '💰',
      title: 'Ahorro en Costos',
      description: 'Reduce costos operativos y gastos médicos por accidentes'
    }
  ];

  // Technology stack data
  readonly techStack: TechItem[] = [
    { icon: '🔍', label: 'Computer Vision' },
    { icon: '🧠', label: 'Machine Learning' },
    { icon: '📡', label: 'IoT Sensors' },
    { icon: '☁️', label: 'Cloud Processing' }
  ];

  // Process steps data
  readonly processSteps: ProcessStep[] = [
    { number: 1, label: 'Captura de Video' },
    { number: 2, label: 'Análisis IA' },
    { number: 3, label: 'Alerta Automática' }
  ];

  ngAfterViewInit(): void {
    // Register this section with the navigation service
    this.navigationService.registerSection(
      'que-es',
      '¿Qué es TransitAI?',
      this.productSection.nativeElement
    );
  }

  /**
   * TrackBy functions
   */
  trackByFeature(index: number, feature: Feature): string {
    return feature.title;
  }

  trackByBenefit(index: number, benefit: BenefitCard): string {
    return benefit.title;
  }

  trackByTech(index: number, tech: TechItem): string {
    return tech.label;
  }

  trackByStep(index: number, step: ProcessStep): number {
    return step.number;
  }
}