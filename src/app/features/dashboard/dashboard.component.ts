import { Component, inject, OnInit, signal, computed, AfterViewInit, OnDestroy, effect, runInInjectionContext } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { TrafficDataService, TrafficIncident, DashboardStats } from '../../core/services/traffic-data.service';
import { IncidentDetailModalComponent } from '../../shared/components/incident-detail-modal.component';
import { GoogleMapsLoaderService } from '../../core/services/google-maps-loader.service';

declare var google: any;

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, IncidentDetailModalComponent],
  styleUrls: ['./dashboard.component.css'],
  template: `
    <div class="dashboard-container">
      <!-- Header -->
      <header class="dashboard-header">
        <div class="header-content">
          <div class="logo-section">
            <svg class="logo-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" stroke-width="2" fill="none"/>
            </svg>
            <div class="logo-text-section">
              <h1 class="logo-text">TransitAI</h1>
              <span class="logo-subtitle">Centro de Monitoreo</span>
            </div>
          </div>

          <div class="header-status">
            <div class="status-indicator" [class.online]="isSystemOnline()">
              <div class="status-dot"></div>
              <span>{{ isSystemOnline() ? 'Sistema Activo' : 'Desconectado' }}</span>
            </div>
            <div class="last-update">
              Última actualización: {{ getLastUpdateTime() }}
            </div>
          </div>

          <div class="user-section">
            <div class="refresh-button" (click)="refreshData()" [class.loading]="isRefreshing()">
              <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
              </svg>
              Actualizar
            </div>
            
            <div class="user-info">
              <div class="user-avatar">
                {{ getUserInitials() }}
              </div>
              <div class="user-details">
                <div class="user-name">{{ authService.userDisplayName() }}</div>
                <div class="user-role">{{ getRoleDisplayName() }}</div>
              </div>
            </div>
            
            <button class="logout-button" (click)="logout()" type="button">
              <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clip-rule="evenodd" />
              </svg>
              Salir
            </button>
          </div>
        </div>
      </header>

      <!-- Main Dashboard Content -->
      <main class="dashboard-main">
        <!-- Statistics Cards -->
        <section class="stats-section">
          <div class="stats-grid">
            <div class="stat-card incidents">
              <div class="stat-header">
                <div class="stat-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <div class="stat-title">Incidentes Hoy</div>
              </div>
              <div class="stat-value">{{ dashboardStats().incidentesHoy }}</div>
              <div class="stat-change positive">+12% vs ayer</div>
            </div>

            <div class="stat-card violations">
              <div class="stat-header">
                <div class="stat-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                  </svg>
                </div>
                <div class="stat-title">Violaciones Activas</div>
              </div>
              <div class="stat-value">{{ dashboardStats().violacionesActivas }}</div>
              <div class="stat-change negative">+5 en última hora</div>
            </div>

            <div class="stat-card resolved">
              <div class="stat-header">
                <div class="stat-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                  </svg>
                </div>
                <div class="stat-title">Casos Resueltos</div>
              </div>
              <div class="stat-value">{{ dashboardStats().casosResueltos }}</div>
              <div class="stat-change positive">+8 resueltos hoy</div>
            </div>

            <div class="stat-card response-time">
              <div class="stat-header">
                <div class="stat-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M15,1H9V3H15M11,14H13V8H11M19,8H17V6H19M19,10V18H5V10H19M19,3H17V5H19A2,2 0 0,1 21,7V19A2,2 0 0,1 19,21H5A2,2 0 0,1 3,19V7A2,2 0 0,1 5,5H7V3H9V5H15V3H17V5H19V7H17V6H7V8H5V18H19V8Z"/>
                  </svg>
                </div>
                <div class="stat-title">Tiempo Respuesta</div>
              </div>
              <div class="stat-value">{{ dashboardStats().tiempoRespuestaPromedio }}min</div>
              <div class="stat-change positive">-2min vs promedio</div>
            </div>
          </div>
        </section>

        <!-- Map and Filters Section -->
        <section class="map-section">
          <div class="section-header">
            <h2 class="section-title">Mapa de Tráfico - Lima Metropolitana</h2>
            <div class="map-controls">
              <div class="filter-toggles">
                <button class="filter-toggle" 
                        [class.active]="activeFilters().accidente"
                        (click)="toggleFilter('accidente')">
                  <div class="filter-dot accidente"></div>
                  Accidentes ({{ getIncidentCountByType('accidente') }})
                </button>
                <button class="filter-toggle" 
                        [class.active]="activeFilters().violacion_carril"
                        (click)="toggleFilter('violacion_carril')">
                  <div class="filter-dot violacion-carril"></div>
                  Violación Carril ({{ getIncidentCountByType('violacion_carril') }})
                </button>
                <button class="filter-toggle" 
                        [class.active]="activeFilters().vehiculo_emergencia"
                        (click)="toggleFilter('vehiculo_emergencia')">
                  <div class="filter-dot emergencia"></div>
                  Veh. Emergencia ({{ getIncidentCountByType('vehiculo_emergencia') }})
                </button>
                <button class="filter-toggle" 
                        [class.active]="activeFilters().bicivia"
                        (click)="toggleFilter('bicivia')">
                  <div class="filter-dot bicivia"></div>
                  Bicivía ({{ getIncidentCountByType('bicivia') }})
                </button>
                <button class="filter-toggle" 
                        [class.active]="activeFilters().corredor"
                        (click)="toggleFilter('corredor')">
                  <div class="filter-dot corredor"></div>
                  Corredor Bus ({{ getIncidentCountByType('corredor') }})
                </button>
              </div>
              <button class="map-fullscreen" (click)="toggleFullscreenMap()">
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M7,14H5V19H10V17H7V14M12,14H14V17H17V19H12V14M17,10H19V5H14V7H17V10M10,10V7H5V12H7V10H10Z"/>
                </svg>
              </button>
            </div>
          </div>
          
          <div class="map-container" [class.fullscreen]="isMapFullscreen()">
            <div id="map"></div>
          </div>
        </section>

        <!-- Infractions Table Section -->
        <section class="table-section">
          <div class="section-header">
            <h2 class="section-title">Registro de Infracciones</h2>
            <div class="table-controls">
              <div class="search-container">
                <svg class="search-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd" />
                </svg>
                <input type="text" 
                       placeholder="Buscar por ubicación, descripción, distrito..." 
                       class="search-input"
                       #searchInput
                       (input)="onSearchChange(searchInput.value)">
              </div>
              <select class="status-filter" (change)="onStatusFilterChange($event)">
                <option value="todos">Todos los estados</option>
                <option value="activo">Activo</option>
                <option value="proceso">En Proceso</option>
                <option value="resuelto">Resuelto</option>
              </select>
              <select class="district-filter" (change)="onDistrictFilterChange($event)">
                <option value="todos">Todos los distritos</option>
                @for (district of getDistricts(); track district) {
                  <option [value]="district">{{ district }}</option>
                }
              </select>
              <button class="export-button" (click)="exportData()" [disabled]="isLoading()">
                @if (isExporting()) {
                  <svg class="animate-spin" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
                  </svg>
                } @else {
                  <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03L10.75 11.364V2.75z"/>
                    <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.25 2.25 0 004.25 17.5h11.5A2.25 2.25 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5a.75.75 0 01-.75.75H4.25a.75.75 0 01-.75-.75v-2.5z"/>
                  </svg>
                }
                {{ isExporting() ? 'Exportando...' : 'Exportar' }}
              </button>
            </div>
          </div>

          <div class="table-container">
            <table class="infractions-table">
              <thead>
                <tr>
                  <th (click)="sortBy('fecha')" class="sortable">
                    Fecha y Hora
                    <svg class="sort-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fill-rule="evenodd" d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.76 9.2a.75.75 0 011.06.04L10 15.148l2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 01.04-1.06z" clip-rule="evenodd" />
                    </svg>
                  </th>
                  <th (click)="sortBy('tipo')" class="sortable">
                    Tipo de Evento
                    <svg class="sort-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fill-rule="evenodd" d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.76 9.2a.75.75 0 011.06.04L10 15.148l2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 01.04-1.06z" clip-rule="evenodd" />
                    </svg>
                  </th>
                  <th (click)="sortBy('ubicacion')" class="sortable">
                    Ubicación
                    <svg class="sort-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fill-rule="evenodd" d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.76 9.2a.75.75 0 011.06.04L10 15.148l2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 01.04-1.06z" clip-rule="evenodd" />
                    </svg>
                  </th>
                  <th>Descripción</th>
                  <th (click)="sortBy('estado')" class="sortable">
                    Estado
                    <svg class="sort-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fill-rule="evenodd" d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.76 9.2a.75.75 0 011.06.04L10 15.148l2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 01.04-1.06z" clip-rule="evenodd" />
                    </svg>
                  </th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                @for (incident of getPaginatedData(); track incident.id) {
                  <tr [class.processing]="processingIncident() === incident.id">
                    <td class="date-cell">
                      <div class="date-time">
                        <div class="date">{{ trafficDataService.formatDate(incident.fecha) }}</div>
                        <div class="time">{{ trafficDataService.formatTime(incident.fecha) }}</div>
                      </div>
                    </td>
                    <td>
                      <div class="incident-type" [class]="getIncidentTypeClass(incident.tipo)">
                        <div class="priority-indicator" [class]="incident.prioridad">
                          <div class="priority-dot"></div>
                        </div>
                        <span class="type-icon">{{ getIncidentIcon(incident.tipo) }}</span>
                        <span class="type-text">{{ trafficDataService.getIncidentTypeDisplay(incident.tipo) }}</span>
                      </div>
                    </td>
                    <td class="location-cell">
                      <div class="location-info">
                        <div class="location-main">{{ incident.ubicacion }}</div>
                        <div class="location-district">{{ incident.distrito }}</div>
                      </div>
                    </td>
                    <td class="description-cell">
                      <div class="description-text">{{ incident.descripcion }}</div>
                    </td>
                    <td>
                      <div class="status-badge" [class]="incident.estado">
                        {{ trafficDataService.getStatusDisplay(incident.estado) }}
                      </div>
                    </td>
                    <td class="actions-cell">
                      <div class="action-buttons">
                        <button class="action-btn view" (click)="viewIncident(incident)" title="Ver detalles">
                          <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                            <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/>
                          </svg>
                        </button>
                        @if (incident.estado !== 'resuelto') {
                          <button class="action-btn process" 
                                  (click)="processIncident(incident)" 
                                  [disabled]="processingIncident() === incident.id"
                                  title="{{ incident.estado === 'activo' ? 'Procesar' : 'Resolver' }}">
                            @if (processingIncident() === incident.id) {
                              <svg class="animate-spin" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
                              </svg>
                            } @else {
                              <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd"/>
                              </svg>
                            }
                          </button>
                        }
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr class="no-data-row">
                    <td colspan="6" class="no-data-cell">
                      <div class="no-data-message">
                        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                        <h4>No hay datos disponibles</h4>
                        <p>No se encontraron infracciones que coincidan con los filtros aplicados.</p>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div class="pagination-container">
            <div class="pagination-info">
              Mostrando {{ getPaginationStart() }}-{{ getPaginationEnd() }} de {{ getTotalRecords() }} registros
              @if (isLoading()) {
                <div class="loading-indicator">
                  <svg class="animate-spin" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
                  </svg>
                  Cargando...
                </div>
              }
            </div>
            <div class="pagination-controls">
              <button class="page-btn" 
                      [disabled]="currentPage() === 1 || isLoading()" 
                      (click)="goToPage(currentPage() - 1)">
                Anterior
              </button>
              @for (page of getPageNumbers(); track page) {
                <button class="page-btn" 
                        [class.active]="page === currentPage()"
                        [disabled]="isLoading()"
                        (click)="goToPage(page)">
                  {{ page }}
                </button>
              }
              <button class="page-btn" 
                      [disabled]="currentPage() === getTotalPages() || isLoading()" 
                      (click)="goToPage(currentPage() + 1)">
                Siguiente
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
    
    <!-- Incident Detail Modal -->
    <app-incident-detail-modal 
      [incident]="selectedIncident"
      [isOpen]="isModalOpen"
      (closeModalEvent)="closeModal()"
      (processIncidentEvent)="processIncidentFromModal($event)">
    </app-incident-detail-modal>
  `
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  readonly authService = inject(AuthService);
  readonly trafficDataService = inject(TrafficDataService);
  private readonly router = inject(Router);
  private readonly googleMapsLoader = inject(GoogleMapsLoaderService);

  // System status
  systemOnline = signal(true);
  lastUpdate = signal(new Date());

  // Map functionality
  isMapFullscreen = signal(false);
  activeFilters = signal({
    accidente: true,
    violacion_carril: true,
    vehiculo_emergencia: true,
    bicivia: true,
    corredor: true
  });

  private map!: google.maps.Map;
  private markers: google.maps.Marker[] = [];

  // Table functionality and pagination
  currentPage = signal(1);
  itemsPerPage = 10;

  // Modal functionality
  selectedIncident = signal<TrafficIncident | null>(null);
  isModalOpen = signal(false);

  // Loading states
  processingIncident = signal<string | null>(null);
  isExporting = signal(false);

  // Computed signals for reactive data
  dashboardStats = computed(() => this.trafficDataService.dashboardStats());
  isLoading = computed(() => this.trafficDataService.isLoading());
  isRefreshing = computed(() => this.trafficDataService.isLoading());
  filteredIncidents = computed(() => this.trafficDataService.filteredIncidents());

  ngOnInit(): void {
    console.log('Dashboard initialized for user:', this.authService.user()?.email);
    this.startRealTimeUpdates();
  }

  ngAfterViewInit(): void {
    console.log('ngAfterViewInit called.');
    this.googleMapsLoader.load().then(() => {
      console.log('Google Maps API loaded successfully. google.maps object:', google.maps);
      this.initMap();
      this.updateMapMarkers();

      // Ensure effect runs within an injection context after map is initialized
      runInInjectionContext(this.trafficDataService.injector, () => {
        effect(() => {
          console.log('Effect triggered: updating map markers.');
          this.updateMapMarkers();
        });
      });

    }).catch(error => {
      console.error('Error loading Google Maps:', error);
    });
  }

  ngOnDestroy(): void {
    // No specific cleanup needed for Google Maps API as it manages its own lifecycle
  }

  private initMap(): void {
    console.log('initMap called.');
    const mapElement = document.getElementById('map');
    if (!mapElement) {
      console.error('Map element #map not found in the DOM. Cannot initialize map.');
      return;
    }

    console.log('Map element found:', mapElement);
    console.log('Attempting to create new google.maps.Map...');
    this.map = new google.maps.Map(mapElement, {
      center: { lat: -12.046374, lng: -77.042793 }, // Center of Lima, Peru
      zoom: 12,
    });

    console.log('Map object created:', this.map);
  }

  private updateMapMarkers(): void {
    console.log('updateMapMarkers called.');
    if (!this.map) {
      console.warn('Map not initialized, cannot update markers.');
      return;
    }
    // Clear existing markers
    this.markers.forEach(marker => marker.setMap(null));
    this.markers = [];

    const incidentsToMark = this.getFilteredIncidents();
    console.log(`Found ${incidentsToMark.length} incidents to mark.`);

    incidentsToMark.forEach(incident => {
      if (incident.coordenadas && incident.coordenadas.lat && incident.coordenadas.lng) {
        console.log(`Adding marker for incident ${incident.id} at lat: ${incident.coordenadas.lat}, lng: ${incident.coordenadas.lng}`);
        const marker = new google.maps.Marker({
          position: { lat: incident.coordenadas.lat, lng: incident.coordenadas.lng },
          map: this.map,
          title: `${this.trafficDataService.getIncidentTypeDisplay(incident.tipo)} - ${incident.ubicacion}`,
        });

        const infoWindow = new google.maps.InfoWindow({
          content: `<b>${this.trafficDataService.getIncidentTypeDisplay(incident.tipo)}</b><br>${incident.descripcion}<br>Estado: ${this.trafficDataService.getStatusDisplay(incident.estado)}`,
        });

        marker.addListener('click', () => {
          infoWindow.open(this.map, marker);
          this.viewIncident(incident);
        });
        this.markers.push(marker);
      } else {
        console.warn(`Incident ${incident.id} missing coordinates:`, incident.coordenadas);
      }
    });
    console.log(`Total markers added: ${this.markers.length}`);
  }

  // === SYSTEM STATUS METHODS ===
  isSystemOnline(): boolean {
    return this.systemOnline();
  }

  getLastUpdateTime(): string {
    return this.lastUpdate().toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  async refreshData(): Promise<void> {
    try {
      await this.trafficDataService.refreshData();
      this.lastUpdate.set(new Date());
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  }

  private startRealTimeUpdates(): void {
    // Update every 30 seconds
    setInterval(() => {
      this.lastUpdate.set(new Date());
    }, 30000);
  }

  // === USER INTERFACE METHODS ===
  logout(): void {
    this.authService.logout();
  }

  getUserInitials(): string {
    const user = this.authService.user();
    if (!user) return 'U';
    
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  }

  getRoleDisplayName(): string {
    const role = this.authService.userRole();
    const roleMap: Record<string, string> = {
      admin: 'Administrador del Sistema',
      government: 'Funcionario de Gobierno',
      operator: 'Operador de Tráfico',
      analyst: 'Analista de Datos',
      viewer: 'Usuario Visualizador'
    };
    
    return role ? roleMap[role] || role : '';
  }

  // === MAP FUNCTIONALITY ===
  toggleFilter(filterType: TrafficIncident['tipo']): void {
    this.activeFilters.update(filters => ({
      ...filters,
      [filterType]: !filters[filterType as keyof typeof filters]
    }));
  }

  toggleFullscreenMap(): void {
    this.isMapFullscreen.update(current => !current);
    // Invalidate map size after fullscreen toggle to re-render correctly
    
  }

  getFilteredIncidents(): TrafficIncident[] {
    const filters = this.activeFilters();
    return this.filteredIncidents().filter(incident => filters[incident.tipo]);
  }

  getIncidentCountByType(tipo: TrafficIncident['tipo']): number {
    return this.trafficDataService.incidents().filter(incident => incident.tipo === tipo).length;
  }

  getIncidentTypeClass(tipo: TrafficIncident['tipo']): string {
    return tipo;
  }

  getIncidentIcon(tipo: TrafficIncident['tipo']): string {
    const icons: Record<TrafficIncident['tipo'], string> = {
      accidente: '🚗',
      violacion_carril: '⚠️',
      vehiculo_emergencia: '🚨',
      bicivia: '🚲',
      corredor: '🚌'
    };
    return icons[tipo] || '📍';
  }

  // === TABLE FUNCTIONALITY ===
  getPaginatedData(): TrafficIncident[] {
    const filtered = this.filteredIncidents();
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage;
    return filtered.slice(startIndex, startIndex + this.itemsPerPage);
  }

  sortBy(column: string): void {
    const currentSort = this.trafficDataService['_sort']();
    
    const newDirection = currentSort.column === column && currentSort.direction === 'asc' ? 'desc' : 'asc';
    
    this.trafficDataService.updateSort({
      column,
      direction: newDirection
    });
  }

  onSearchChange(searchTerm: string): void {
    this.trafficDataService.updateFilter({ searchTerm });
    this.currentPage.set(1);
  }

  onStatusFilterChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.trafficDataService.updateFilter({ statusFilter: target.value });
    this.currentPage.set(1);
  }

  onDistrictFilterChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.trafficDataService.updateFilter({ distritoFilter: target.value });
    this.currentPage.set(1);
  }

  getDistricts(): string[] {
    return this.trafficDataService.limaDistricts;
  }

  // === ACTION METHODS ===
  viewIncident(incident: TrafficIncident): void {
    this.selectedIncident.set(incident);
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.selectedIncident.set(null);
  }

  processIncident(incident: TrafficIncident): void {
    this.processingIncident.set(incident.id);
    
    // Simulate processing delay
    setTimeout(() => {
      const newStatus = incident.estado === 'activo' ? 'proceso' : 'resuelto';
      this.trafficDataService.updateIncidentStatus(incident.id, newStatus);
      this.processingIncident.set(null);
    }, 2000);
  }

  processIncidentFromModal(incident: TrafficIncident): void {
    this.processIncident(incident);
  }

  async exportData(): Promise<void> {
    this.isExporting.set(true);
    
    try {
      const csvData = this.trafficDataService.exportToCSV();
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `incidentes-transito-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Error exporting data:', error);
    } finally {
      this.isExporting.set(false);
    }
  }

  // === PAGINATION METHODS ===
  getTotalRecords(): number {
    return this.filteredIncidents().length;
  }

  getTotalPages(): number {
    return Math.ceil(this.getTotalIncidents() / this.itemsPerPage);
  }

  getPaginationStart(): number {
    return Math.min((this.currentPage() - 1) * this.itemsPerPage + 1, this.getTotalIncidents());
  }

  getPaginationEnd(): number {
    return Math.min(this.currentPage() * this.itemsPerPage, this.getTotalIncidents());
  }

  getPageNumbers(): number[] {
    const totalPages = this.getTotalPages();
    const current = this.currentPage();
    const pages: number[] = [];

    // Always show first page
    if (totalPages > 0) pages.push(1);

    // Show pages around current page
    const start = Math.max(2, current - 2);
    const end = Math.min(totalPages - 1, current + 2);

    for (let i = start; i <= end; i++) {
      if (!pages.includes(i)) pages.push(i);
    }

    // Always show last page
    if (totalPages > 1 && !pages.includes(totalPages)) {
      pages.push(totalPages);
    }

    return pages.sort((a, b) => a - b);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.getTotalPages()) {
      this.currentPage.set(page);
    }
  }

  getTotalIncidents(): number {
    return this.trafficDataService.incidents().length;
  }
}