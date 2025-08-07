import { Component, inject, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationService, AuthService } from '../../../core/services';
import { HeroStat } from '../../../core/interfaces';

/**
 * HeroComponent displays the main landing page hero section
 * Features: statistics display, call-to-action buttons, animated dashboard preview
 */
@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section id="inicio" class="hero" #heroSection>
      <div class="container">
        <div class="hero-content">
          <div class="hero-text">
            <h1 class="hero-title">
              Monitoreo Inteligente de
              <span class="gradient-text">Tránsito Urbano</span>
            </h1>
            <p class="hero-subtitle">
              Plataforma de visión computacional que detecta automáticamente invasiones no autorizadas 
              en carriles exclusivos, generando alertas en tiempo real para prevenir accidentes y 
              mejorar la eficiencia del tránsito en Lima.
            </p>
            <div class="hero-actions">
              <button 
                class="btn btn-primary btn-lg hero-cta-primary" 
                [class.btn-loading]="authService.loading()"
                (click)="authService.handleLoginClick()"
                [disabled]="authService.loading()"
                [attr.aria-label]="authService.loading() ? 'Cargando...' : 'Acceder al Dashboard'"
              >
                @if (authService.loading()) {
                  <span class="sr-only">Cargando...</span>
                } @else {
                  <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                    <polyline points="10,17 15,12 10,7"/>
                    <line x1="15" y1="12" x2="3" y2="12"/>
                  </svg>
                  Acceder al Dashboard
                }
              </button>
              <button class="btn btn-outline btn-lg hero-cta-secondary" (click)="handleDemoClick()">
                <svg class="btn-icon play-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <polygon points="5,3 19,12 5,21"/>
                </svg>
                Ver Demo en Vivo
              </button>
            </div>
            <div class="hero-stats">
              <div class="stat" *ngFor="let stat of heroStats; trackBy: trackByStat">
                <span class="stat-number">{{ stat.number }}</span>
                <span class="stat-label">{{ stat.label }}</span>
              </div>
            </div>
          </div>
          <div class="hero-visual">
            <div class="dashboard-preview">
              <div class="dashboard-header">
                <div class="dashboard-dots">
                  <span></span><span></span><span></span>
                </div>
                <span class="dashboard-title">TransitAI Dashboard</span>
              </div>
              <div class="dashboard-content">
                <div class="traffic-monitor">
                  <div class="camera-feed">
                    <img 
                      src="/detection_model.png" 
                      alt="Sistema de detección TransitAI en acción - Monitoreo de carriles exclusivos"
                      class="detection-image"
                      loading="lazy"
                    >
                    <div class="feed-overlay">
                      <div class="detection-zone bus-lane">Carril Bus</div>
                      <div class="detection-zone bike-lane">Metropolitano</div>
                      <div class="alert-indicator">
                        <div class="alert-pulse"></div>
                        <span>Invasión Detectada</span>
                      </div>
                    </div>
                  </div>
                  <div class="monitoring-stats">
                    <div class="mini-stat">
                      <span class="mini-number">12</span>
                      <span class="mini-label">Cámaras Activas</span>
                    </div>
                    <div class="mini-stat">
                      <span class="mini-number">3</span>
                      <span class="mini-label">Alertas Hoy</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="hero-background">
        <div class="grid-pattern"></div>
      </div>
    </section>
  `,
  styles: [`
    .hero {
      position: relative;
      min-height: var(--hero-min-height);
      background: linear-gradient(135deg, var(--gray-50) 0%, var(--surface-accent) 100%);
      display: flex;
      align-items: center;
      overflow: hidden;
      padding: var(--space-20) 0;
    }

    .hero-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-16);
      align-items: center;
      position: relative;
      z-index: 2;
    }

    .hero-text {
      display: flex;
      flex-direction: column;
      gap: var(--space-8);
    }

    .hero-title {
      font-family: var(--font-family-display);
      font-size: var(--font-size-5xl);
      font-weight: var(--font-weight-extrabold);
      line-height: var(--line-height-tight);
      color: var(--text-primary);
      margin: 0;
    }

    .gradient-text {
      background: var(--gradient-hero);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      display: inline-block;
    }

    .hero-subtitle {
      font-size: var(--font-size-xl);
      line-height: var(--line-height-relaxed);
      color: var(--text-secondary);
      max-width: 600px;
      margin: 0;
    }

    .hero-actions {
      display: flex;
      gap: var(--space-4);
      flex-wrap: wrap;
    }

    .hero-cta-primary,
    .hero-cta-secondary {
      padding: var(--space-4) var(--space-8);
      border-radius: var(--radius-xl);
      font-weight: var(--font-weight-semibold);
      font-size: var(--font-size-lg);
      transition: all var(--transition-normal);
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      min-height: var(--button-height-lg);
    }

    .hero-cta-primary {
      background: var(--gradient-primary);
      color: var(--text-inverse);
      border: none;
      box-shadow: var(--shadow-lg);
    }

    .hero-cta-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: var(--shadow-2xl);
    }

    .hero-cta-secondary {
      background: rgba(255, 255, 255, 0.9);
      color: var(--primary-blue);
      border: 2px solid var(--border-light);
      backdrop-filter: blur(10px);
    }

    .hero-cta-secondary:hover {
      background: var(--surface-primary);
      border-color: var(--primary-blue);
      transform: translateY(-1px);
    }

    .btn-icon {
      width: 1.25rem;
      height: 1.25rem;
      transition: transform var(--transition-fast);
    }

    .play-icon {
      margin-left: -2px;
    }

    .hero-cta-primary:hover .btn-icon {
      transform: translateX(2px);
    }

    .hero-stats {
      display: flex;
      gap: var(--space-8);
      margin-top: var(--space-6);
    }

    .stat {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .stat-number {
      font-family: var(--font-family-display);
      font-size: var(--font-size-3xl);
      font-weight: var(--font-weight-extrabold);
      color: var(--primary-blue);
      line-height: 1;
    }

    .stat-label {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-top: var(--space-1);
    }

    .hero-visual {
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .dashboard-preview {
      background: var(--surface-primary);
      border-radius: var(--radius-2xl);
      box-shadow: var(--shadow-2xl);
      overflow: hidden;
      width: 100%;
      max-width: 500px;
      border: 1px solid var(--border-light);
    }

    .dashboard-header {
      background: var(--gray-800);
      color: var(--text-inverse);
      padding: var(--space-3) var(--space-4);
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    .dashboard-dots {
      display: flex;
      gap: var(--space-1);
    }

    .dashboard-dots span {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--gray-600);
    }

    .dashboard-dots span:first-child { background: #FF5F56; }
    .dashboard-dots span:nth-child(2) { background: #FFBD2E; }
    .dashboard-dots span:last-child { background: #27CA3F; }

    .dashboard-title {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
    }

    .dashboard-content {
      padding: var(--space-6);
      background: var(--surface-secondary);
    }

    .traffic-monitor {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .camera-feed {
      background: var(--gray-900);
      border-radius: var(--radius-lg);
      height: 200px;
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .detection-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
      border-radius: var(--radius-lg);
    }

    .feed-overlay {
      position: absolute;
      inset: 0;
      padding: var(--space-3);
      color: var(--text-inverse);
    }

    .detection-zone {
      position: absolute;
      padding: var(--space-1) var(--space-2);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-semibold);
      border-radius: var(--radius-sm);
      border: 2px solid;
    }

    .detection-zone.bus-lane {
      top: var(--space-3);
      left: var(--space-3);
      background: rgba(59, 130, 246, 0.2);
      border-color: var(--primary-blue);
    }

    .detection-zone.bike-lane {
      top: var(--space-3);
      right: var(--space-3);
      background: rgba(34, 197, 94, 0.2);
      border-color: var(--accent-green);
    }

    .alert-indicator {
      position: absolute;
      bottom: var(--space-3);
      left: var(--space-3);
      display: flex;
      align-items: center;
      gap: var(--space-2);
      background: rgba(239, 68, 68, 0.9);
      padding: var(--space-2) var(--space-3);
      border-radius: var(--radius-md);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-semibold);
    }

    .alert-pulse {
      width: 8px;
      height: 8px;
      background: var(--text-inverse);
      border-radius: 50%;
      animation: pulse 2s infinite;
    }

    .monitoring-stats {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-3);
    }

    .mini-stat {
      background: var(--surface-primary);
      padding: var(--space-3);
      border-radius: var(--radius-lg);
      text-align: center;
      border: 1px solid var(--border-light);
    }

    .mini-number {
      display: block;
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-bold);
      color: var(--primary-blue);
    }

    .mini-label {
      font-size: var(--font-size-xs);
      color: var(--text-muted);
      margin-top: var(--space-1);
    }

    .hero-background {
      position: absolute;
      inset: 0;
      z-index: 1;
      opacity: 0.4;
    }

    .grid-pattern {
      position: absolute;
      inset: 0;
      background-image: 
        linear-gradient(var(--border-light) 1px, transparent 1px),
        linear-gradient(90deg, var(--border-light) 1px, transparent 1px);
      background-size: 50px 50px;
      animation: gridMove 20s linear infinite;
    }

    @keyframes gridMove {
      0% { transform: translate(0, 0); }
      100% { transform: translate(50px, 50px); }
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    /* Responsive Design */
    @media (max-width: 1024px) {
      .hero-content {
        grid-template-columns: 1fr;
        gap: var(--space-12);
        text-align: center;
      }

      .hero-title {
        font-size: var(--font-size-4xl);
      }

      .hero-subtitle {
        font-size: var(--font-size-lg);
      }
    }

    @media (max-width: 768px) {
      .hero {
        padding: var(--space-16) 0;
        min-height: auto;
      }

      .hero-title {
        font-size: var(--font-size-3xl);
      }

      .hero-actions {
        justify-content: center;
      }

      .hero-cta-primary,
      .hero-cta-secondary {
        font-size: var(--font-size-base);
        padding: var(--space-3) var(--space-6);
      }

      .hero-stats {
        gap: var(--space-6);
        justify-content: center;
        flex-wrap: wrap;
      }

      .dashboard-preview {
        max-width: 400px;
      }

      .camera-feed {
        height: 160px;
      }
    }

    @media (max-width: 480px) {
      .hero-actions {
        flex-direction: column;
        width: 100%;
      }

      .hero-cta-primary,
      .hero-cta-secondary {
        width: 100%;
        justify-content: center;
      }

      .hero-stats {
        gap: var(--space-4);
      }

      .stat-number {
        font-size: var(--font-size-2xl);
      }
    }

    /* Loading state for auth button */
    .btn-loading {
      pointer-events: none;
      opacity: 0.7;
    }

    .btn-loading::after {
      content: '';
      position: absolute;
      width: 1rem;
      height: 1rem;
      border: 2px solid transparent;
      border-top-color: currentColor;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Accessibility enhancements */
    @media (prefers-reduced-motion: reduce) {
      .grid-pattern,
      .alert-pulse,
      .btn-icon,
      .hero-cta-primary,
      .hero-cta-secondary {
        animation: none;
        transition: none;
      }
      
      .hero-cta-primary:hover,
      .hero-cta-secondary:hover {
        transform: none;
      }
    }

    /* High contrast mode */
    @media (prefers-contrast: high) {
      .hero {
        background: var(--surface-primary);
      }
      
      .gradient-text {
        background: none;
        color: var(--primary-blue);
        -webkit-text-fill-color: var(--primary-blue);
      }
      
      .dashboard-preview {
        border-width: 2px;
        border-color: var(--text-primary);
      }
    }
  `]
})
export class HeroComponent implements OnInit, AfterViewInit {
  @ViewChild('heroSection', { static: true }) heroSection!: ElementRef<HTMLElement>;
  
  readonly navigationService = inject(NavigationService);
  readonly authService = inject(AuthService);

  // Hero statistics data
  readonly heroStats: HeroStat[] = [
    { number: '24/7', label: 'Monitoreo' },
    { number: '99%', label: 'Precisión' },
    { number: '5s', label: 'Tiempo Respuesta' }
  ];

  ngOnInit(): void {
    // Component initialization - AuthService is initialized at app level
  }

  ngAfterViewInit(): void {
    // Register this section with the navigation service
    this.navigationService.registerSection(
      'inicio',
      'Inicio',
      this.heroSection.nativeElement
    );
  }

  /**
   * Handle demo button click
   */
  handleDemoClick(): void {
    // TODO: Implement demo functionality
    // Could open a modal, navigate to demo page, or play video
    console.log('Demo clicked - functionality to be implemented');
  }

  /**
   * TrackBy function for hero stats
   */
  trackByStat(index: number, stat: HeroStat): string {
    return stat.label;
  }
}