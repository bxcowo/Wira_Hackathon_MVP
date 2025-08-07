import { Component, inject, OnInit, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent, debounceTime } from 'rxjs';
import { NavigationService, AuthService } from '../../core/services';

/**
 * HeaderComponent provides the main navigation bar with smooth scrolling functionality
 * Features: sticky header, active section highlighting, scroll-based styling
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav class="navbar" [class.scrolled]="isScrolled()">
      <div class="container">
        <div class="nav-brand">
          <svg class="brand-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          <span class="brand-text">TransitAI</span>
        </div>
        
        <!-- Desktop Navigation -->
        <ul class="nav-menu desktop-nav">
          <li *ngFor="let item of navigationService.navigationItems; trackBy: trackByItemId">
            <a 
              href="#{{ item.fragment }}" 
              class="nav-link"
              [class.active]="navigationService.isNavigationActive(item.id)"
              (click)="navigationService.handleNavigationClick($event, item.id)"
            >
              {{ item.label }}
            </a>
          </li>
        </ul>
        
        <!-- Desktop CTA Button -->
        <button 
          class="cta-button desktop-cta" 
          [class.btn-loading]="authService.loading()"
          (click)="authService.handleLoginClick()"
          [disabled]="authService.loading()"
          [attr.aria-label]="authService.loading() ? 'Cargando...' : 'Iniciar Sesión'"
        >
          @if (authService.loading()) {
            <span class="sr-only">Cargando...</span>
          } @else {
            Iniciar Sesión
          }
        </button>
        
        <!-- Mobile Menu Button -->
        <button 
          class="mobile-menu-btn"
          (click)="toggleMobileMenu()"
          [attr.aria-expanded]="mobileMenuOpen()"
          [attr.aria-label]="mobileMenuOpen() ? 'Cerrar menú' : 'Abrir menú'"
        >
          <svg class="hamburger-icon" [class.open]="mobileMenuOpen()" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path class="line line1" d="M3 12h18"/>
            <path class="line line2" d="M3 6h18"/>
            <path class="line line3" d="M3 18h18"/>
          </svg>
        </button>
      </div>
      
      <!-- Mobile Navigation Overlay -->
      <div class="mobile-nav-overlay" [class.open]="mobileMenuOpen()" (click)="closeMobileMenu()">
        <div class="mobile-nav-content" (click)="$event.stopPropagation()">
          <div class="mobile-nav-header">
            <div class="nav-brand">
              <svg class="brand-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              <span class="brand-text">TransitAI</span>
            </div>
            <button class="mobile-close-btn" (click)="closeMobileMenu()" aria-label="Cerrar menú">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M18 6L6 18"/>
                <path d="M6 6l12 12"/>
              </svg>
            </button>
          </div>
          
          <ul class="mobile-nav-menu">
            <li *ngFor="let item of navigationService.navigationItems; trackBy: trackByItemId">
              <a 
                href="#{{ item.fragment }}" 
                class="mobile-nav-link"
                [class.active]="navigationService.isNavigationActive(item.id)"
                (click)="handleMobileNavClick($event, item.id)"
              >
                {{ item.label }}
              </a>
            </li>
          </ul>
          
          <div class="mobile-nav-actions">
            <button 
              class="btn btn-primary btn-lg mobile-cta" 
              [class.btn-loading]="authService.loading()"
              (click)="handleMobileLoginClick()"
              [disabled]="authService.loading()"
              [attr.aria-label]="authService.loading() ? 'Cargando...' : 'Iniciar Sesión'"
            >
              @if (authService.loading()) {
                <span class="sr-only">Cargando...</span>
              } @else {
                Iniciar Sesión
              }
            </button>
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    :host {
      display: block;
    }

    .navbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: var(--navbar-height);
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      border-bottom: 1px solid var(--gray-200);
      z-index: var(--z-fixed);
      transition: all var(--transition-normal);
    }

    .navbar.scrolled {
      background: rgba(255, 255, 255, 0.98);
      backdrop-filter: blur(25px);
      box-shadow: var(--shadow-lg);
      border-bottom-color: var(--gray-300);
    }

    .navbar .container {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .nav-brand {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    .brand-icon {
      width: 32px;
      height: 32px;
      color: var(--primary-blue);
    }

    .brand-text {
      font-family: var(--font-family-display);
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-bold);
      color: var(--text-primary);
    }

    .nav-menu {
      display: flex;
      align-items: center;
      gap: var(--space-8);
    }

    .nav-link {
      font-weight: var(--font-weight-medium);
      color: var(--text-secondary);
      transition: color var(--transition-fast);
      position: relative;
    }

    .nav-link:hover {
      color: var(--primary-blue);
    }

    .nav-link::after {
      content: '';
      position: absolute;
      bottom: -4px;
      left: 0;
      width: 0;
      height: 2px;
      background: var(--primary-blue);
      transition: width var(--transition-fast);
    }

    .nav-link:hover::after {
      width: 100%;
    }

    .nav-link.active {
      color: var(--primary-blue);
    }
    
    .nav-link.active::after {
      width: 100%;
    }
    
    .cta-button {
      background: var(--primary-blue);
      color: var(--text-inverse);
      font-weight: var(--font-weight-medium);
      font-size: var(--font-size-sm);
      padding: var(--space-2) var(--space-4);
      border-radius: var(--radius-full);
      border: none;
      box-shadow: var(--shadow-sm);
      transition: all var(--transition-normal);
    }

    .cta-button:hover:not(:disabled) {
      background: var(--primary-blue-dark);
      transform: translateY(-1px);
      box-shadow: var(--shadow-md);
    }

    .cta-button:disabled {
      opacity: var(--disabled-opacity);
      cursor: not-allowed;
      transform: none;
    }
    
    /* Mobile Navigation Styles */
    .mobile-menu-btn {
      display: none;
      width: 2.5rem;
      height: 2.5rem;
      border: none;
      background: none;
      color: var(--text-primary);
      cursor: pointer;
      padding: 0.5rem;
      border-radius: var(--radius-md);
      transition: all var(--transition-fast);
    }
    
    .mobile-menu-btn:hover {
      background: var(--surface-secondary);
    }
    
    .hamburger-icon {
      width: 1.5rem;
      height: 1.5rem;
      stroke-width: 2px;
      transition: all var(--transition-normal);
    }
    
    .hamburger-icon .line {
      transition: all var(--transition-normal);
      transform-origin: center;
    }
    
    .hamburger-icon.open .line1 {
      transform: rotate(45deg) translate(0, 0);
    }
    
    .hamburger-icon.open .line2 {
      opacity: 0;
    }
    
    .hamburger-icon.open .line3 {
      transform: rotate(-45deg) translate(0, 0);
    }
    
    /* Mobile Navigation Overlay */
    .mobile-nav-overlay {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      z-index: var(--z-modal);
      opacity: 0;
      visibility: hidden;
      transition: all var(--transition-normal);
    }
    
    .mobile-nav-overlay.open {
      opacity: 1;
      visibility: visible;
    }
    
    .mobile-nav-content {
      position: absolute;
      top: 0;
      right: 0;
      width: min(320px, 85vw);
      height: 100vh;
      background: var(--surface-primary);
      box-shadow: var(--shadow-2xl);
      transform: translateX(100%);
      transition: transform var(--transition-normal);
      overflow-y: auto;
      display: flex;
      flex-direction: column;
    }
    
    .mobile-nav-overlay.open .mobile-nav-content {
      transform: translateX(0);
    }
    
    .mobile-nav-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-4);
      border-bottom: 1px solid var(--border-light);
      background: var(--surface-secondary);
    }
    
    .mobile-close-btn {
      width: 2.5rem;
      height: 2.5rem;
      border: none;
      background: none;
      color: var(--text-secondary);
      cursor: pointer;
      padding: 0.5rem;
      border-radius: var(--radius-md);
      transition: all var(--transition-fast);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .mobile-close-btn:hover {
      background: var(--surface-muted);
      color: var(--text-primary);
    }
    
    .mobile-close-btn svg {
      width: 1.5rem;
      height: 1.5rem;
    }
    
    .mobile-nav-menu {
      flex: 1;
      padding: var(--space-6) 0;
    }
    
    .mobile-nav-link {
      display: block;
      padding: var(--space-4) var(--space-6);
      color: var(--text-primary);
      font-weight: var(--font-weight-medium);
      font-size: var(--font-size-lg);
      text-decoration: none;
      transition: all var(--transition-fast);
      border-left: 3px solid transparent;
    }
    
    .mobile-nav-link:hover {
      background: var(--surface-secondary);
      color: var(--primary-blue);
      border-left-color: var(--primary-blue);
    }
    
    .mobile-nav-link.active {
      background: var(--surface-accent);
      color: var(--primary-blue);
      border-left-color: var(--primary-blue);
      font-weight: var(--font-weight-semibold);
    }
    
    .mobile-nav-actions {
      padding: var(--space-6);
      border-top: 1px solid var(--border-light);
      background: var(--surface-secondary);
    }
    
    .mobile-cta {
      width: 100%;
      justify-content: center;
    }
    
    /* Responsive Behavior */
    @media (max-width: 768px) {
      .desktop-nav,
      .desktop-cta {
        display: none;
      }
      
      .mobile-menu-btn,
      .mobile-nav-overlay {
        display: block;
      }
    }
    
    /* High contrast support */
    @media (prefers-contrast: high) {
      .mobile-nav-content {
        border: 2px solid var(--text-primary);
      }
      
      .mobile-nav-link {
        border-left-width: 4px;
      }
    }
    
    /* Reduced motion support */
    @media (prefers-reduced-motion: reduce) {
      .hamburger-icon,
      .hamburger-icon .line,
      .mobile-nav-overlay,
      .mobile-nav-content {
        transition: none;
      }
    }
  `]
})
export class HeaderComponent implements OnInit {
  readonly navigationService = inject(NavigationService);
  readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  
  // Signal to track scroll state
  readonly isScrolled = signal(false);
  // Signal to track mobile menu state
  readonly mobileMenuOpen = signal(false);

  ngOnInit(): void {
    this.initializeScrollListener();
    this.initializeBodyScrollLock();
  }

  /**
   * Initialize scroll listener for header styling
   */
  private initializeScrollListener(): void {
    fromEvent(window, 'scroll')
      .pipe(
        debounceTime(10),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        const scrolled = window.scrollY > 20;
        this.isScrolled.set(scrolled);
      });
  }

  /**
   * Initialize body scroll lock when mobile menu is open
   */
  private initializeBodyScrollLock(): void {
    // Watch mobile menu state and lock body scroll
    if (typeof document !== 'undefined') {
      // Use effect to watch signal changes
      const watchMobileMenu = () => {
        if (this.mobileMenuOpen()) {
          document.body.style.overflow = 'hidden';
        } else {
          document.body.style.overflow = '';
        }
      };
      
      // Run immediately and on changes
      watchMobileMenu();
      
      // Clean up on destroy
      this.destroyRef.onDestroy(() => {
        document.body.style.overflow = '';
      });
    }
  }

  /**
   * Toggle mobile menu
   */
  toggleMobileMenu(): void {
    this.mobileMenuOpen.update(open => !open);
  }

  /**
   * Close mobile menu
   */
  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  /**
   * Handle mobile navigation click
   */
  handleMobileNavClick(event: Event, itemId: string): void {
    this.navigationService.handleNavigationClick(event, itemId);
    this.closeMobileMenu();
  }

  /**
   * Handle mobile login click
   */
  handleMobileLoginClick(): void {
    this.authService.handleLoginClick();
    this.closeMobileMenu();
  }

  /**
   * TrackBy function for navigation items
   */
  trackByItemId(index: number, item: any): string {
    return item.id;
  }
}