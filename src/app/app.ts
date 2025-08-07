import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';

/**
 * Main AppComponent serves as the root component
 * Initializes authentication service and manages global app state
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <router-outlet />
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
    }
  `]
})
export class App implements OnInit {
  private readonly authService = inject(AuthService);

  ngOnInit(): void {
    // Initialize authentication service on app startup
    this.authService.initialize();
  }
}
