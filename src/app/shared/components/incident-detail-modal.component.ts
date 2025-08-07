import { Component, Input, Output, EventEmitter, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrafficIncident, TrafficDataService } from '../../core/services/traffic-data.service';

@Component({
  selector: 'app-incident-detail-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="modal-overlay" 
      (click)="closeModal()" 
      *ngIf="isOpen()"
      role="dialog"
      aria-modal="true"
      [attr.aria-labelledby]="'modal-title-' + incident()?.id"
      [attr.aria-describedby]="'modal-description-' + incident()?.id"
    >
      <div 
        class="modal-content" 
        (click)="$event.stopPropagation()"
        role="document"
      >
        <div class="modal-header">
          <div class="header-content">
            <div 
              class="incident-type-badge" 
              [class]="incident()?.tipo"
              [attr.id]="'modal-title-' + incident()?.id"
            >
              <span 
                class="type-icon"
                [attr.aria-label]="'Icono de ' + getIncidentTypeDisplay()"
              >{{ getIncidentIcon() }}</span>
              <span class="type-text">{{ getIncidentTypeDisplay() }}</span>
            </div>
            <div class="status-priority">
              <div 
                class="status-badge" 
                [class]="incident()?.estado"
                [attr.aria-label]="'Estado: ' + getStatusDisplay()"
              >
                {{ getStatusDisplay() }}
              </div>
              <div 
                class="priority-indicator" 
                [class]="incident()?.prioridad"
                [attr.aria-label]="'Prioridad: ' + getPriorityDisplay()"
              >
                <div class="priority-dot" aria-hidden="true"></div>
                <span>{{ getPriorityDisplay() }}</span>
              </div>
            </div>
          </div>
          <button 
            class="btn btn-ghost close-button" 
            (click)="closeModal()" 
            aria-label="Cerrar modal de detalles del incidente"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
            </svg>
          </button>
        </div>

        <div 
          class="modal-body"
          [attr.id]="'modal-description-' + incident()?.id"
        >
          <div class="detail-grid">
            <!-- Basic Information -->
            <section 
              class="detail-section"
              aria-labelledby="general-info-title"
            >
              <h3 id="general-info-title" class="section-title">Información General</h3>
              <div class="detail-grid-2" role="group" aria-label="Información básica del incidente">
                <div class="detail-item">
                  <label for="incident-id">ID del Incidente</label>
                  <span id="incident-id" class="value">{{ incident()?.id }}</span>
                </div>
                <div class="detail-item">
                  <label for="incident-datetime">Fecha y Hora</label>
                  <span id="incident-datetime" class="value">{{ formatDateTime() }}</span>
                </div>
                <div class="detail-item">
                  <label for="incident-location">Ubicación</label>
                  <span id="incident-location" class="value location">{{ incident()?.ubicacion }}</span>
                </div>
                <div class="detail-item">
                  <label for="incident-district">Distrito</label>
                  <span id="incident-district" class="value">{{ incident()?.distrito }}</span>
                </div>
              </div>
            </section>

            <!-- Description -->
            <section 
              class="detail-section"
              aria-labelledby="description-title"
            >
              <h3 id="description-title" class="section-title">Descripción del Incidente</h3>
              <div class="description-content">
                <p>{{ incident()?.descripcion }}</p>
                <div 
                  class="observations" 
                  *ngIf="incident()?.observaciones"
                  role="complementary"
                  aria-labelledby="observations-title"
                >
                  <h4 id="observations-title">Observaciones Adicionales</h4>
                  <p>{{ incident()?.observaciones }}</p>
                </div>
              </div>
            </section>

            <!-- Impact Information -->
            <section class="detail-section">
              <h3 class="section-title">Impacto del Incidente</h3>
              <div class="impact-metrics">
                <div class="metric-card">
                  <div class="metric-icon vehicles">
                    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
                    </svg>
                  </div>
                  <div class="metric-content">
                    <span class="metric-value">{{ incident()?.vehiculosInvolucrados || 0 }}</span>
                    <span class="metric-label">Vehículos Involucrados</span>
                  </div>
                </div>
                <div class="metric-card">
                  <div class="metric-icon people">
                    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.5 8H17c-.8 0-1.5.7-1.5 1.5v.5h2v7h-2v5h4zm-12.5 0v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 6.5 8H5c-.8 0-1.5.7-1.5 1.5v.5h2v7h-2v5h4z"/>
                    </svg>
                  </div>
                  <div class="metric-content">
                    <span class="metric-value">{{ incident()?.personasAfectadas || 0 }}</span>
                    <span class="metric-label">Personas Afectadas</span>
                  </div>
                </div>
              </div>
            </section>

            <!-- Timeline -->
            <section class="detail-section">
              <h3 class="section-title">Cronología del Incidente</h3>
              <div class="timeline">
                <div class="timeline-item active">
                  <div class="timeline-marker"></div>
                  <div class="timeline-content">
                    <div class="timeline-time">{{ formatTime(incident()?.fecha) }}</div>
                    <div class="timeline-title">Incidente Reportado</div>
                    <div class="timeline-description">
                      Reportado por: {{ incident()?.reportadoPor || 'No especificado' }}
                    </div>
                  </div>
                </div>
                
                <div class="timeline-item" [class.active]="incident()?.estado === 'proceso' || incident()?.estado === 'resuelto'">
                  <div class="timeline-marker"></div>
                  <div class="timeline-content">
                    <div class="timeline-time" *ngIf="incident()?.estado === 'proceso' || incident()?.estado === 'resuelto'">
                      {{ getProcessStartTime() }}
                    </div>
                    <div class="timeline-title">En Proceso</div>
                    <div class="timeline-description" *ngIf="incident()?.estado === 'proceso' || incident()?.estado === 'resuelto'">
                      Atención iniciada por las autoridades
                    </div>
                  </div>
                </div>

                <div class="timeline-item" [class.active]="incident()?.estado === 'resuelto'">
                  <div class="timeline-marker"></div>
                  <div class="timeline-content">
                    <div class="timeline-time" *ngIf="incident()?.horaResolucion">
                      {{ formatTime(incident()?.horaResolucion) }}
                    </div>
                    <div class="timeline-title">Resuelto</div>
                    <div class="timeline-description" *ngIf="incident()?.estado === 'resuelto'">
                      Tiempo de respuesta: {{ incident()?.tiempoRespuesta }}min
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <!-- Location Map Placeholder -->
            <section class="detail-section">
              <h3 class="section-title">Ubicación en Mapa</h3>
              <div class="map-placeholder">
                <div class="map-marker" [class]="incident()?.tipo">
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                </div>
                <div class="coordinates">
                  <span>Lat: {{ incident()?.coordenadas?.lat?.toFixed(6) || 'N/A' }}</span>
                  <span>Lng: {{ incident()?.coordenadas?.lng?.toFixed(6) || 'N/A' }}</span>
                </div>
              </div>
            </section>
          </div>
        </div>

        <div class="modal-footer">
          <div class="action-buttons">
            <button 
              class="btn btn-secondary" 
              (click)="closeModal()">
              Cerrar
            </button>
            <button 
              class="btn btn-primary" 
              *ngIf="incident()?.estado !== 'resuelto'"
              (click)="processIncident()">
              {{ incident()?.estado === 'activo' ? 'Procesar' : 'Resolver' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(4px);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      animation: modalFadeIn 0.3s ease;
    }

    @keyframes modalFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .modal-content {
      background: white;
      border-radius: 1rem;
      max-width: 900px;
      width: 100%;
      max-height: 90vh;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      animation: modalSlideIn 0.3s ease;
    }

    @keyframes modalSlideIn {
      from { 
        opacity: 0;
        transform: translateY(-20px) scale(0.95);
      }
      to { 
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .modal-header {
      padding: 2rem 2rem 1rem;
      border-bottom: 1px solid #E5E7EB;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      background: #F8FAFC;
    }

    .header-content {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .incident-type-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1.5rem;
      border-radius: 0.75rem;
      font-weight: 600;
      font-size: 1.1rem;
    }

    .incident-type-badge.accidente { 
      background: #FEF2F2; 
      color: #DC2626; 
      border: 2px solid #FECACA;
    }
    .incident-type-badge.violacion_carril { 
      background: #FFFBEB; 
      color: #D97706; 
      border: 2px solid #FED7AA;
    }
    .incident-type-badge.vehiculo_emergencia { 
      background: #FEF2F2; 
      color: #B91C1C; 
      border: 2px solid #FCA5A5;
    }
    .incident-type-badge.bicivia { 
      background: #FFFBEB; 
      color: #CA8A04; 
      border: 2px solid #FDE68A;
    }
    .incident-type-badge.corredor { 
      background: #EFF6FF; 
      color: #2563EB; 
      border: 2px solid #BFDBFE;
    }

    .type-icon {
      font-size: 1.5rem;
    }

    .status-priority {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .status-badge {
      padding: 0.5rem 1rem;
      border-radius: 9999px;
      font-size: 0.875rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .status-badge.activo { 
      background: linear-gradient(135deg, #FEF2F2, #FEE2E2);
      color: #DC2626;
      border: 1px solid rgba(220, 38, 38, 0.2);
    }
    .status-badge.proceso { 
      background: linear-gradient(135deg, #FFFBEB, #FEF3C7);
      color: #D97706;
      border: 1px solid rgba(217, 119, 6, 0.2);
    }
    .status-badge.resuelto { 
      background: linear-gradient(135deg, #F0FDF4, #DCFCE7);
      color: #16A34A;
      border: 1px solid rgba(22, 163, 74, 0.2);
    }

    .priority-indicator {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .priority-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }

    .priority-indicator.alta .priority-dot {
      background: #EF4444;
      box-shadow: 0 0 8px rgba(239, 68, 68, 0.4);
      animation: priorityPulse 2s infinite;
    }
    .priority-indicator.media .priority-dot { background: #F59E0B; }
    .priority-indicator.baja .priority-dot { background: #6B7280; }

    @keyframes priorityPulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.2); opacity: 0.8; }
    }

    .close-button {
      padding: 0.5rem;
      background: none;
      border: none;
      color: #6B7280;
      cursor: pointer;
      border-radius: 0.375rem;
      transition: all 0.2s ease;
    }

    .close-button:hover {
      background: #F3F4F6;
      color: #374151;
    }

    .close-button svg {
      width: 1.25rem;
      height: 1.25rem;
    }

    .modal-body {
      padding: 0;
      max-height: 60vh;
      overflow-y: auto;
    }

    .detail-grid {
      display: flex;
      flex-direction: column;
      gap: 2rem;
      padding: 2rem;
    }

    .detail-section {
      background: white;
      border-radius: 0.75rem;
      border: 1px solid #E5E7EB;
      padding: 1.5rem;
    }

    .section-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #111827;
      margin: 0 0 1.5rem 0;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid #E5E7EB;
    }

    .detail-grid-2 {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
    }

    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .detail-item label {
      font-size: 0.875rem;
      font-weight: 500;
      color: #6B7280;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .detail-item .value {
      font-size: 1rem;
      font-weight: 600;
      color: #111827;
    }

    .detail-item .value.location {
      color: #3B82F6;
    }

    .description-content {
      line-height: 1.6;
    }

    .description-content p {
      color: #374151;
      margin: 0 0 1rem 0;
    }

    .observations {
      background: #F8FAFC;
      padding: 1rem;
      border-radius: 0.5rem;
      border-left: 4px solid #3B82F6;
    }

    .observations h4 {
      font-size: 0.875rem;
      font-weight: 600;
      color: #374151;
      margin: 0 0 0.5rem 0;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .observations p {
      margin: 0;
      color: #6B7280;
    }

    .impact-metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .metric-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: #F8FAFC;
      border-radius: 0.75rem;
      border: 1px solid #E5E7EB;
    }

    .metric-icon {
      width: 3rem;
      height: 3rem;
      border-radius: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .metric-icon.vehicles {
      background: #DBEAFE;
      color: #3B82F6;
    }

    .metric-icon.people {
      background: #D1FAE5;
      color: #10B981;
    }

    .metric-icon svg {
      width: 1.5rem;
      height: 1.5rem;
    }

    .metric-content {
      display: flex;
      flex-direction: column;
    }

    .metric-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: #111827;
      line-height: 1;
    }

    .metric-label {
      font-size: 0.875rem;
      color: #6B7280;
      font-weight: 500;
    }

    .timeline {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      position: relative;
    }

    .timeline::before {
      content: '';
      position: absolute;
      left: 1rem;
      top: 0.5rem;
      bottom: 0.5rem;
      width: 2px;
      background: #E5E7EB;
    }

    .timeline-item {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      position: relative;
    }

    .timeline-marker {
      width: 0.75rem;
      height: 0.75rem;
      border-radius: 50%;
      background: #D1D5DB;
      border: 3px solid white;
      box-shadow: 0 0 0 1px #E5E7EB;
      margin-top: 0.375rem;
      position: relative;
      z-index: 1;
      transition: all 0.3s ease;
    }

    .timeline-item.active .timeline-marker {
      background: #3B82F6;
      box-shadow: 0 0 0 1px #3B82F6, 0 0 0 4px rgba(59, 130, 246, 0.1);
    }

    .timeline-content {
      flex: 1;
      padding-bottom: 1rem;
    }

    .timeline-time {
      font-size: 0.875rem;
      font-weight: 600;
      color: #3B82F6;
      margin-bottom: 0.25rem;
    }

    .timeline-title {
      font-size: 1rem;
      font-weight: 600;
      color: #111827;
      margin-bottom: 0.25rem;
    }

    .timeline-description {
      font-size: 0.875rem;
      color: #6B7280;
      line-height: 1.4;
    }

    .map-placeholder {
      height: 200px;
      background: linear-gradient(45deg, #EBF4FF 0%, #E0F2FE 50%, #F0FDF4 100%);
      border-radius: 0.75rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      border: 1px solid #E5E7EB;
      position: relative;
      overflow: hidden;
    }

    .map-marker {
      width: 4rem;
      height: 4rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      border: 3px solid white;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .map-marker.accidente { background: #EF4444; }
    .map-marker.violacion_carril { background: #F59E0B; }
    .map-marker.vehiculo_emergencia { 
      background: #DC2626; 
      animation: markerPulse 1s infinite;
    }
    .map-marker.bicivia { background: #FBBF24; }
    .map-marker.corredor { background: #3B82F6; }

    @keyframes markerPulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }

    .map-marker svg {
      width: 2rem;
      height: 2rem;
    }

    .coordinates {
      display: flex;
      gap: 1rem;
      font-size: 0.875rem;
      color: #6B7280;
      font-weight: 500;
    }

    .modal-footer {
      padding: 1.5rem 2rem;
      border-top: 1px solid #E5E7EB;
      background: #F8FAFC;
      display: flex;
      justify-content: flex-end;
    }

    .action-buttons {
      display: flex;
      gap: 1rem;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      border: none;
      font-size: 0.875rem;
    }

    .btn-secondary {
      background: #F3F4F6;
      color: #374151;
      border: 1px solid #D1D5DB;
    }

    .btn-secondary:hover {
      background: #E5E7EB;
    }

    .btn-primary {
      background: #3B82F6;
      color: white;
    }

    .btn-primary:hover {
      background: #2563EB;
      transform: translateY(-1px);
    }

    /* Responsive */
    @media (max-width: 768px) {
      .modal-content {
        margin: 1rem;
        max-height: 95vh;
      }

      .modal-header {
        padding: 1.5rem 1.5rem 1rem;
      }

      .header-content {
        gap: 0.75rem;
      }

      .detail-grid {
        padding: 1.5rem;
        gap: 1.5rem;
      }

      .detail-section {
        padding: 1rem;
      }

      .detail-grid-2 {
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .impact-metrics {
        grid-template-columns: 1fr;
      }

      .modal-footer {
        padding: 1rem 1.5rem;
      }

      .action-buttons {
        flex-direction: column-reverse;
        gap: 0.5rem;
      }

      .btn {
        width: 100%;
        text-align: center;
      }
    }
  `]
})
export class IncidentDetailModalComponent implements OnInit {
  @Input() incident = signal<TrafficIncident | null>(null);
  @Input() isOpen = signal(false);
  @Output() closeModalEvent = new EventEmitter<void>();
  @Output() processIncidentEvent = new EventEmitter<TrafficIncident>();

  private readonly trafficDataService = inject(TrafficDataService);

  ngOnInit() {
    // Close modal on escape key
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.isOpen()) {
        this.closeModal();
      }
    });
  }

  closeModal(): void {
    this.closeModalEvent.emit();
  }

  processIncident(): void {
    const incident = this.incident();
    if (incident) {
      this.processIncidentEvent.emit(incident);
      this.closeModal();
    }
  }

  getIncidentIcon(): string {
    const incident = this.incident();
    if (!incident) return '📍';

    const icons: Record<TrafficIncident['tipo'], string> = {
      accidente: '🚗',
      violacion_carril: '⚠️',
      vehiculo_emergencia: '🚨',
      bicivia: '🚲',
      corredor: '🚌'
    };
    return icons[incident.tipo] || '📍';
  }

  getIncidentTypeDisplay(): string {
    const incident = this.incident();
    if (!incident) return '';
    return this.trafficDataService.getIncidentTypeDisplay(incident.tipo);
  }

  getStatusDisplay(): string {
    const incident = this.incident();
    if (!incident) return '';
    return this.trafficDataService.getStatusDisplay(incident.estado);
  }

  getPriorityDisplay(): string {
    const incident = this.incident();
    if (!incident) return '';
    return this.trafficDataService.getPriorityDisplay(incident.prioridad);
  }

  formatDateTime(): string {
    const incident = this.incident();
    if (!incident) return '';
    return this.trafficDataService.formatDateTime(incident.fecha);
  }

  formatTime(date?: Date): string {
    if (!date) return '';
    return this.trafficDataService.formatTime(date);
  }

  getProcessStartTime(): string {
    const incident = this.incident();
    if (!incident) return '';
    
    // Estimate process start time (5-15 minutes after initial report)
    const processStart = new Date(incident.fecha);
    processStart.setMinutes(processStart.getMinutes() + Math.floor(Math.random() * 10) + 5);
    
    return this.formatTime(processStart);
  }
}