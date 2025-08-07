import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * LoadingSpinnerComponent provides a consistent loading indicator
 * Supports multiple sizes and customizable colors
 */
@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="loading-spinner" 
      [class]="size"
      [attr.aria-label]="label || 'Cargando...'"
      role="status"
    >
      <svg 
        class="spinner-svg" 
        viewBox="0 0 24 24" 
        fill="none"
        [attr.aria-hidden]="true"
      >
        <circle
          class="spinner-track"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="2"
          fill="none"
          opacity="0.25"
        />
        <circle
          class="spinner-progress"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="2"
          fill="none"
          stroke-linecap="round"
          stroke-dasharray="62.83"
          stroke-dashoffset="62.83"
        />
      </svg>
      <span class="sr-only">{{ label || 'Cargando...' }}</span>
    </div>
  `,
  styles: [`
    .loading-spinner {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: var(--primary-blue);
    }

    .loading-spinner.sm {
      width: 1rem;
      height: 1rem;
    }

    .loading-spinner.md {
      width: 1.5rem;
      height: 1.5rem;
    }

    .loading-spinner.lg {
      width: 2rem;
      height: 2rem;
    }

    .loading-spinner.xl {
      width: 3rem;
      height: 3rem;
    }

    .spinner-svg {
      width: 100%;
      height: 100%;
      animation: spin 1s linear infinite;
    }

    .spinner-progress {
      animation: progress 1.5s ease-in-out infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @keyframes progress {
      0% {
        stroke-dashoffset: 62.83;
        opacity: 1;
      }
      50% {
        stroke-dashoffset: 31.42;
        opacity: 1;
      }
      100% {
        stroke-dashoffset: 0;
        opacity: 0.8;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .spinner-svg {
        animation: none;
      }
      
      .spinner-progress {
        animation: none;
        stroke-dashoffset: 31.42;
        opacity: 0.8;
      }
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() label?: string;
}