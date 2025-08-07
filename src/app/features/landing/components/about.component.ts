import { Component, inject, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationService } from '../../../core/services';
import { TeamCard } from '../../../core/interfaces';

/**
 * AboutComponent displays company mission, vision, and values
 * Features: animated cards, company information presentation
 */
@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section id="quienes-somos" class="about" #aboutSection>
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">¿Quiénes somos?</h2>
          <p class="section-subtitle">
            Somos un equipo multidisciplinario comprometido con la transformación digital 
            del sistema de transporte urbano en Lima.
          </p>
        </div>
        <div class="team-grid">
          <div 
            class="team-card" 
            *ngFor="let card of teamCards; trackBy: trackByCard"
          >
            <div class="card-icon" [innerHTML]="card.icon"></div>
            <h3 class="card-title">{{ card.title }}</h3>
            <p class="card-description">{{ card.description }}</p>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .about {
      padding: var(--space-20) 0;
      background: var(--surface-primary);
      position: relative;
    }

    .about::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.02) 0%, rgba(16, 185, 129, 0.02) 100%);
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

    .team-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: var(--space-8);
      position: relative;
      z-index: 1;
    }

    .team-card {
      background: var(--surface-primary);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-2xl);
      padding: var(--space-8);
      text-align: center;
      transition: all var(--transition-normal);
      box-shadow: var(--shadow-sm);
      position: relative;
      overflow: hidden;
    }

    .team-card::before {
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

    .team-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-xl);
      border-color: var(--border-focus);
    }

    .team-card:hover::before {
      transform: scaleX(1);
    }

    .card-icon {
      width: 4rem;
      height: 4rem;
      margin: 0 auto var(--space-6);
      background: var(--surface-accent);
      border-radius: var(--radius-2xl);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--primary-blue);
      transition: all var(--transition-normal);
    }

    .team-card:hover .card-icon {
      background: var(--primary-blue);
      color: var(--text-inverse);
      transform: scale(1.05);
    }

    .card-icon svg {
      width: 2rem;
      height: 2rem;
    }

    .card-title {
      font-family: var(--font-family-display);
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-bold);
      color: var(--text-primary);
      margin: 0 0 var(--space-4) 0;
    }

    .card-description {
      color: var(--text-secondary);
      line-height: var(--line-height-relaxed);
      font-size: var(--font-size-lg);
      margin: 0;
    }

    /* Responsive Design */
    @media (max-width: 1024px) {
      .team-grid {
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: var(--space-6);
      }
    }

    @media (max-width: 768px) {
      .about {
        padding: var(--space-16) 0;
      }

      .section-header {
        margin-bottom: var(--space-12);
      }

      .section-title {
        font-size: var(--font-size-3xl);
      }

      .section-subtitle {
        font-size: var(--font-size-lg);
      }

      .team-grid {
        grid-template-columns: 1fr;
        gap: var(--space-6);
      }

      .team-card {
        padding: var(--space-6);
      }

      .card-icon {
        width: 3rem;
        height: 3rem;
        margin-bottom: var(--space-4);
      }

      .card-icon svg {
        width: 1.5rem;
        height: 1.5rem;
      }

      .card-title {
        font-size: var(--font-size-xl);
      }

      .card-description {
        font-size: var(--font-size-base);
      }
    }

    @media (max-width: 480px) {
      .about {
        padding: var(--space-12) 0;
      }

      .section-title {
        font-size: var(--font-size-2xl);
      }

      .section-subtitle {
        font-size: var(--font-size-base);
      }

      .team-card {
        padding: var(--space-5);
      }
    }

    /* Accessibility enhancements */
    @media (prefers-reduced-motion: reduce) {
      .team-card,
      .card-icon,
      .team-card::before {
        transition: none;
      }
      
      .team-card:hover {
        transform: none;
      }
      
      .team-card:hover .card-icon {
        transform: none;
      }
    }

    /* High contrast mode */
    @media (prefers-contrast: high) {
      .team-card {
        border-width: 2px;
        border-color: var(--text-primary);
      }
      
      .team-card:hover {
        border-color: var(--primary-blue);
      }
      
      .card-icon {
        border: 2px solid var(--primary-blue);
      }
    }

    /* Focus management for keyboard navigation */
    .team-card:focus-within {
      outline: 2px solid var(--border-focus);
      outline-offset: 2px;
    }
  `]
})
export class AboutComponent implements AfterViewInit {
  @ViewChild('aboutSection', { static: true }) aboutSection!: ElementRef<HTMLElement>;
  
  readonly navigationService = inject(NavigationService);

  // Team cards data
  readonly teamCards: TeamCard[] = [
    {
      icon: `<span style="font-size: 2rem;">🎯</span>`,
      title: 'Misión',
      description: 'Revolucionar la seguridad vial en Lima mediante tecnología de visión computacional avanzada, reduciendo accidentes y mejorando la calidad de vida urbana.'
    },
    {
      icon: `<span style="font-size: 2rem;">🔮</span>`,
      title: 'Visión',
      description: 'Ser la plataforma líder en monitoreo inteligente de tránsito en América Latina, estableciendo el estándar para ciudades inteligentes y sostenibles.'
    },
    {
      icon: `<span style="font-size: 2rem;">💎</span>`,
      title: 'Valores',
      description: 'Innovación, seguridad, transparencia y compromiso social. Creemos en la tecnología como herramienta para construir una Lima más segura y eficiente.'
    }
  ];

  ngAfterViewInit(): void {
    // Register this section with the navigation service
    this.navigationService.registerSection(
      'quienes-somos',
      '¿Quiénes somos?',
      this.aboutSection.nativeElement
    );
  }

  /**
   * TrackBy function for team cards
   */
  trackByCard(index: number, card: TeamCard): string {
    return card.title;
  }
}