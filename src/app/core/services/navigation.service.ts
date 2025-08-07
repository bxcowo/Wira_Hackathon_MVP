import { Injectable, signal, computed, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent, debounceTime } from 'rxjs';
import { NavigationItem, Section, ScrollToOptions } from '../interfaces';

/**
 * NavigationService handles smooth scrolling, section navigation, and active section tracking
 * Uses Angular 20 signals for reactive state management
 */
@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private readonly destroyRef = inject(DestroyRef);
  
  // Signals for reactive state management
  private readonly activeSectionSignal = signal<string>('inicio');
  private readonly sectionsSignal = signal<Section[]>([]);
  private readonly isScrollingSignal = signal<boolean>(false);

  // Public computed signals
  readonly activeSection = this.activeSectionSignal.asReadonly();
  readonly sections = this.sectionsSignal.asReadonly();
  readonly isScrolling = this.isScrollingSignal.asReadonly();

  // Navigation items configuration
  readonly navigationItems: NavigationItem[] = [
    { id: 'inicio', label: 'Inicio', route: '', fragment: 'inicio' },
    { id: 'quienes-somos', label: '¿Quiénes somos?', route: '', fragment: 'quienes-somos' },
    { id: 'que-es', label: '¿Qué es TransitAI?', route: '', fragment: 'que-es' },
    { id: 'servicios', label: 'Servicios', route: '', fragment: 'servicios' },
    { id: 'contacto', label: 'Contacto', route: '', fragment: 'contacto' }
  ];

  // Computed properties
  readonly currentNavigationItem = computed(() => {
    const activeId = this.activeSectionSignal();
    return this.navigationItems.find(item => item.id === activeId);
  });

  constructor() {
    this.initializeScrollListener();
  }

  /**
   * Initialize scroll listener for section detection
   */
  private initializeScrollListener(): void {
    fromEvent(window, 'scroll')
      .pipe(
        debounceTime(50),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        if (!this.isScrollingSignal()) {
          this.updateActiveSection();
        }
      });
  }

  /**
   * Register a section for tracking
   */
  registerSection(id: string, name: string, element: HTMLElement): void {
    const sections = this.sectionsSignal();
    const existingIndex = sections.findIndex(section => section.id === id);
    
    const newSection: Section = { id, name, element, isVisible: false };
    
    if (existingIndex >= 0) {
      // Update existing section
      const updatedSections = [...sections];
      updatedSections[existingIndex] = newSection;
      this.sectionsSignal.set(updatedSections);
    } else {
      // Add new section
      this.sectionsSignal.set([...sections, newSection]);
    }
  }

  /**
   * Unregister a section
   */
  unregisterSection(id: string): void {
    const sections = this.sectionsSignal();
    this.sectionsSignal.set(sections.filter(section => section.id !== id));
  }

  /**
   * Smooth scroll to a specific section
   */
  scrollToSection(options: ScrollToOptions): void {
    const { sectionId, behavior = 'smooth', offset = 80 } = options;
    const sections = this.sectionsSignal();
    const section = sections.find(s => s.id === sectionId);
    
    if (!section?.element) {
      console.warn(`Section with id '${sectionId}' not found`);
      return;
    }

    this.isScrollingSignal.set(true);
    
    const elementTop = section.element.offsetTop;
    const scrollPosition = Math.max(0, elementTop - offset);
    
    window.scrollTo({
      top: scrollPosition,
      behavior
    });

    // Set active section immediately for better UX
    this.activeSectionSignal.set(sectionId);
    
    // Reset scrolling flag after animation completes
    setTimeout(() => {
      this.isScrollingSignal.set(false);
    }, 1000);
  }

  /**
   * Update active section based on scroll position
   */
  private updateActiveSection(): void {
    const sections = this.sectionsSignal();
    const scrollPosition = window.scrollY;
    const windowHeight = window.innerHeight;
    const offset = 100;

    // Find the section that is currently most visible
    let activeSection = sections[0]?.id || 'inicio';

    for (const section of sections) {
      if (!section.element) continue;

      const rect = section.element.getBoundingClientRect();
      const elementTop = scrollPosition + rect.top;
      const elementBottom = elementTop + rect.height;

      // Check if section is in viewport
      if (elementTop <= scrollPosition + offset && elementBottom > scrollPosition + offset) {
        activeSection = section.id;
        break;
      }
    }

    // Special handling for the last section when scrolled to bottom
    if (scrollPosition + windowHeight >= document.documentElement.scrollHeight - 10) {
      const lastSection = sections[sections.length - 1];
      if (lastSection) {
        activeSection = lastSection.id;
      }
    }

    // Update active section if it changed
    if (this.activeSectionSignal() !== activeSection) {
      this.activeSectionSignal.set(activeSection);
    }
  }

  /**
   * Handle navigation link click
   */
  handleNavigationClick(event: Event, sectionId: string): void {
    event.preventDefault();
    this.scrollToSection({ sectionId });
  }

  /**
   * Check if a navigation item is active
   */
  isNavigationActive(itemId: string): boolean {
    return this.activeSectionSignal() === itemId;
  }

  /**
   * Get scroll progress as percentage
   */
  getScrollProgress(): number {
    const scrollTop = window.scrollY;
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
    return Math.min(100, Math.max(0, (scrollTop / documentHeight) * 100));
  }
}