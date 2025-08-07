import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent, FooterComponent } from '../../shared/components';
import { 
  HeroComponent, 
  AboutComponent, 
  ProductComponent, 
  ServicesComponent, 
  ContactComponent 
} from './components';

/**
 * LandingComponent serves as the main container for the landing page
 * Composes all landing page sections and manages the overall layout
 */
@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    FooterComponent,
    HeroComponent,
    AboutComponent,
    ProductComponent,
    ServicesComponent,
    ContactComponent
  ],
  template: `
    <app-header />
    
    <main class="main-content">
      <app-hero />
      <app-about />
      <app-product />
      <app-services />
      <app-contact />
    </main>
    
    <app-footer />
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
    }
    
    .main-content {
      position: relative;
      z-index: 1;
    }
  `]
})
export class LandingComponent {
  // This component serves as a container and doesn't need additional logic
  // All functionality is handled by child components and services
}