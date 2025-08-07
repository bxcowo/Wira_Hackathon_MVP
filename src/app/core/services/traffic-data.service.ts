import { Injectable, signal, computed, inject, Injector } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

// Enhanced interfaces for comprehensive traffic management
export interface TrafficIncident {
  id: string;
  fecha: Date;
  tipo: 'accidente' | 'violacion_carril' | 'vehiculo_emergencia' | 'bicivia' | 'corredor';
  ubicacion: string;
  descripcion: string;
  estado: 'activo' | 'proceso' | 'resuelto';
  coordenadas: { lat: number; lng: number };
  prioridad: 'alta' | 'media' | 'baja';
  distrito: string;
  reportadoPor?: string;
  tiempoRespuesta?: number; // minutes
  vehiculosInvolucrados?: number;
  personasAfectadas?: number;
  observaciones?: string;
  horaResolucion?: Date;
}

export interface DashboardStats {
  incidentesHoy: number;
  violacionesActivas: number;
  casosResueltos: number;
  tiempoRespuestaPromedio: number;
  incidentesPorTipo: Record<TrafficIncident['tipo'], number>;
  incidentesPorDistrito: Record<string, number>;
  incidentesPorPrioridad: Record<TrafficIncident['prioridad'], number>;
}

export interface FilterCriteria {
  searchTerm: string;
  statusFilter: string;
  tipoFilter: TrafficIncident['tipo'] | 'todos';
  distritoFilter: string;
  prioridadFilter: TrafficIncident['prioridad'] | 'todos';
  fechaDesde?: Date;
  fechaHasta?: Date;
}

export interface SortCriteria {
  column: string;
  direction: 'asc' | 'desc';
}

@Injectable({
  providedIn: 'root'
})
export class TrafficDataService {
  // Signal-based reactive state
  private readonly _incidents = signal<TrafficIncident[]>([]);
  private readonly _isLoading = signal(false);
  private readonly _lastUpdated = signal(new Date());
  private readonly _filter = signal<FilterCriteria>({
    searchTerm: '',
    statusFilter: 'todos',
    tipoFilter: 'todos',
    distritoFilter: 'todos',
    prioridadFilter: 'todos'
  });
  private readonly _sort = signal<SortCriteria>({
    column: 'fecha',
    direction: 'desc'
  });

  // Public readonly signals
  public readonly incidents = this._incidents.asReadonly();
  public readonly isLoading = this._isLoading.asReadonly();
  public readonly lastUpdated = this._lastUpdated.asReadonly();

  // Lima districts for filtering
  public readonly limaDistricts = [
    'Miraflores', 'San Isidro', 'La Molina', 'Surco', 'San Borja',
    'Barranco', 'Chorrillos', 'Lima Centro', 'Breña', 'Pueblo Libre',
    'Magdalena', 'Jesús María', 'Lince', 'San Miguel', 'Callao',
    'Ventanilla', 'Los Olivos', 'San Martín de Porres', 'Independencia',
    'Comas', 'Carabayllo', 'Puente Piedra', 'Ancón', 'Santa Anita',
    'Ate', 'El Agustino', 'San Juan de Lurigancho', 'Rímac', 'Cercado',
    'La Victoria', 'Villa El Salvador', 'Villa María del Triunfo', 'San Juan de Miraflores'
  ];

  // Computed signals for filtered and sorted data
  public readonly filteredIncidents = computed(() => {
    let filtered = this._incidents();
    const filterCriteria = this._filter();
    const sortCriteria = this._sort();

    // Apply filters
    if (filterCriteria.statusFilter !== 'todos') {
      filtered = filtered.filter(incident => incident.estado === filterCriteria.statusFilter);
    }

    if (filterCriteria.tipoFilter !== 'todos') {
      filtered = filtered.filter(incident => incident.tipo === filterCriteria.tipoFilter);
    }

    if (filterCriteria.distritoFilter !== 'todos') {
      filtered = filtered.filter(incident => incident.distrito === filterCriteria.distritoFilter);
    }

    if (filterCriteria.prioridadFilter !== 'todos') {
      filtered = filtered.filter(incident => incident.prioridad === filterCriteria.prioridadFilter);
    }

    if (filterCriteria.searchTerm) {
      const term = filterCriteria.searchTerm.toLowerCase();
      filtered = filtered.filter(incident =>
        incident.ubicacion.toLowerCase().includes(term) ||
        incident.descripcion.toLowerCase().includes(term) ||
        incident.distrito.toLowerCase().includes(term) ||
        this.getIncidentTypeDisplay(incident.tipo).toLowerCase().includes(term)
      );
    }

    if (filterCriteria.fechaDesde) {
      filtered = filtered.filter(incident => incident.fecha >= filterCriteria.fechaDesde!);
    }

    if (filterCriteria.fechaHasta) {
      filtered = filtered.filter(incident => incident.fecha <= filterCriteria.fechaHasta!);
    }

    // Apply sorting
    return this.sortIncidents(filtered, sortCriteria);
  });

  public readonly dashboardStats = computed(() => {
    const incidents = this._incidents();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayIncidents = incidents.filter(i => {
      const incidentDate = new Date(i.fecha);
      incidentDate.setHours(0, 0, 0, 0);
      return incidentDate.getTime() === today.getTime();
    });

    const activeViolations = incidents.filter(i => i.estado === 'activo').length;
    const resolvedCases = incidents.filter(i => i.estado === 'resuelto').length;

    const resolvedWithResponseTime = incidents.filter(i => i.estado === 'resuelto' && i.tiempoRespuesta);
    const avgResponseTime = resolvedWithResponseTime.length > 0
      ? Math.round(resolvedWithResponseTime.reduce((sum, i) => sum + (i.tiempoRespuesta || 0), 0) / resolvedWithResponseTime.length)
      : 0;

    const incidentesPorTipo: Record<TrafficIncident['tipo'], number> = {
      accidente: incidents.filter(i => i.tipo === 'accidente').length,
      violacion_carril: incidents.filter(i => i.tipo === 'violacion_carril').length,
      vehiculo_emergencia: incidents.filter(i => i.tipo === 'vehiculo_emergencia').length,
      bicivia: incidents.filter(i => i.tipo === 'bicivia').length,
      corredor: incidents.filter(i => i.tipo === 'corredor').length
    };

    const incidentesPorDistrito: Record<string, number> = {};
    incidents.forEach(incident => {
      incidentesPorDistrito[incident.distrito] = (incidentesPorDistrito[incident.distrito] || 0) + 1;
    });

    const incidentesPorPrioridad: Record<TrafficIncident['prioridad'], number> = {
      alta: incidents.filter(i => i.prioridad === 'alta').length,
      media: incidents.filter(i => i.prioridad === 'media').length,
      baja: incidents.filter(i => i.prioridad === 'baja').length
    };

    return {
      incidentesHoy: todayIncidents.length,
      violacionesActivas: activeViolations,
      casosResueltos: resolvedCases,
      tiempoRespuestaPromedio: avgResponseTime,
      incidentesPorTipo,
      incidentesPorDistrito,
      incidentesPorPrioridad
    };
  });

  public readonly injector = inject(Injector);

  constructor() {
    this.initializeMockData();
    this.startRealTimeUpdates();
  }

  // Public methods for data manipulation
  public updateFilter(filter: Partial<FilterCriteria>): void {
    this._filter.update(current => ({ ...current, ...filter }));
  }

  public updateSort(sort: SortCriteria): void {
    this._sort.set(sort);
  }

  public refreshData(): Promise<void> {
    this._isLoading.set(true);
    
    return new Promise(resolve => {
      // Simulate API call delay
      setTimeout(() => {
        this._lastUpdated.set(new Date());
        this._isLoading.set(false);
        
        // Simulate new incident or status change
        this.simulateRealTimeUpdate();
        resolve();
      }, 1500);
    });
  }

  public updateIncidentStatus(incidentId: string, newStatus: TrafficIncident['estado']): void {
    this._incidents.update(incidents => 
      incidents.map(incident => {
        if (incident.id === incidentId) {
          const updatedIncident = { ...incident, estado: newStatus };
          if (newStatus === 'resuelto' && !incident.horaResolucion) {
            updatedIncident.horaResolucion = new Date();
            updatedIncident.tiempoRespuesta = Math.round(
              (new Date().getTime() - incident.fecha.getTime()) / (1000 * 60)
            );
          }
          return updatedIncident;
        }
        return incident;
      })
    );
  }

  public addIncident(incident: Omit<TrafficIncident, 'id'>): void {
    const newIncident: TrafficIncident = {
      ...incident,
      id: this.generateId()
    };
    
    this._incidents.update(incidents => [...incidents, newIncident]);
  }

  public exportToCSV(): string {
    const incidents = this.filteredIncidents();
    const headers = [
      'ID', 'Fecha', 'Hora', 'Tipo', 'Ubicación', 'Distrito', 'Descripción', 
      'Estado', 'Prioridad', 'Vehículos Involucrados', 'Personas Afectadas', 
      'Tiempo Respuesta (min)', 'Reportado Por'
    ];

    const rows = incidents.map(incident => [
      incident.id,
      this.formatDate(incident.fecha),
      this.formatTime(incident.fecha),
      this.getIncidentTypeDisplay(incident.tipo),
      incident.ubicacion,
      incident.distrito,
      incident.descripcion,
      this.getStatusDisplay(incident.estado),
      this.getPriorityDisplay(incident.prioridad),
      incident.vehiculosInvolucrados?.toString() || 'N/A',
      incident.personasAfectadas?.toString() || 'N/A',
      incident.tiempoRespuesta?.toString() || 'N/A',
      incident.reportadoPor || 'Sistema'
    ]);

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }

  // Utility methods
  public getIncidentTypeDisplay(tipo: TrafficIncident['tipo']): string {
    const typeMap: Record<TrafficIncident['tipo'], string> = {
      accidente: 'Accidente de Tránsito',
      violacion_carril: 'Violación de Carril',
      vehiculo_emergencia: 'Vehículo de Emergencia',
      bicivia: 'Infracción en Bicivía',
      corredor: 'Corredor de Bus'
    };
    return typeMap[tipo] || tipo;
  }

  public getStatusDisplay(estado: TrafficIncident['estado']): string {
    const statusMap: Record<TrafficIncident['estado'], string> = {
      activo: 'Activo',
      proceso: 'En Proceso',
      resuelto: 'Resuelto'
    };
    return statusMap[estado] || estado;
  }

  public getPriorityDisplay(prioridad: TrafficIncident['prioridad']): string {
    const priorityMap: Record<TrafficIncident['prioridad'], string> = {
      alta: 'Alta',
      media: 'Media',
      baja: 'Baja'
    };
    return priorityMap[prioridad] || prioridad;
  }

  public formatDate(date: Date): string {
    return date.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  public formatTime(date: Date): string {
    return date.toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  public formatDateTime(date: Date): string {
    return date.toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Private methods
  private sortIncidents(incidents: TrafficIncident[], sort: SortCriteria): TrafficIncident[] {
    return [...incidents].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sort.column) {
        case 'fecha':
          aValue = a.fecha;
          bValue = b.fecha;
          break;
        case 'tipo':
          aValue = this.getIncidentTypeDisplay(a.tipo);
          bValue = this.getIncidentTypeDisplay(b.tipo);
          break;
        case 'ubicacion':
          aValue = a.ubicacion;
          bValue = b.ubicacion;
          break;
        case 'estado':
          aValue = a.estado;
          bValue = b.estado;
          break;
        case 'prioridad':
          const priorityOrder = { alta: 3, media: 2, baja: 1 };
          aValue = priorityOrder[a.prioridad];
          bValue = priorityOrder[b.prioridad];
          break;
        case 'distrito':
          aValue = a.distrito;
          bValue = b.distrito;
          break;
        default:
          return 0;
      }

      if (sort.direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private simulateRealTimeUpdate(): void {
    const incidents = this._incidents();
    if (incidents.length === 0) return;

    // Randomly change status of an active incident
    const activeIncidents = incidents.filter(i => i.estado === 'activo');
    if (activeIncidents.length > 0 && Math.random() > 0.7) {
      const randomIncident = activeIncidents[Math.floor(Math.random() * activeIncidents.length)];
      this.updateIncidentStatus(randomIncident.id, Math.random() > 0.5 ? 'proceso' : 'resuelto');
    }

    // Occasionally add a new incident
    if (Math.random() > 0.8) {
      this.addRandomIncident();
    }
  }

  private addRandomIncident(): void {
    const tipos: TrafficIncident['tipo'][] = ['accidente', 'violacion_carril', 'vehiculo_emergencia', 'bicivia', 'corredor'];
    const prioridades: TrafficIncident['prioridad'][] = ['alta', 'media', 'baja'];
    const estados: TrafficIncident['estado'][] = ['activo', 'proceso'];

    const randomTipo = tipos[Math.floor(Math.random() * tipos.length)];
    const randomDistrito = this.limaDistricts[Math.floor(Math.random() * this.limaDistricts.length)];
    
    const newIncident: Omit<TrafficIncident, 'id'> = {
      fecha: new Date(),
      tipo: randomTipo,
      ubicacion: this.getRandomLocationByDistrict(randomDistrito),
      descripcion: this.getRandomDescriptionByType(randomTipo),
      estado: estados[Math.floor(Math.random() * estados.length)],
      coordenadas: this.getRandomCoordinatesForLima(),
      prioridad: prioridades[Math.floor(Math.random() * prioridades.length)],
      distrito: randomDistrito,
      reportadoPor: 'Sistema Automático',
      vehiculosInvolucrados: randomTipo === 'accidente' ? Math.floor(Math.random() * 3) + 1 : 1,
      personasAfectadas: Math.floor(Math.random() * 5)
    };

    this.addIncident(newIncident);
  }

  private startRealTimeUpdates(): void {
    // Update every 30 seconds
    setInterval(() => {
      this._lastUpdated.set(new Date());
    }, 30000);

    // Simulate real-time changes every 2 minutes
    setInterval(() => {
      if (Math.random() > 0.6) {
        this.simulateRealTimeUpdate();
      }
    }, 120000);
  }

  private getRandomLocationByDistrict(distrito: string): string {
    const locations: Record<string, string[]> = {
      'Miraflores': [
        'Av. Arequipa - Óvalo Gutiérrez',
        'Av. Pardo - Parque Kennedy',
        'Av. Benavides - Óvalo Ricardo Palma',
        'Malecón de la Reserva',
        'Av. José Larco - Parque del Amor'
      ],
      'San Isidro': [
        'Av. Javier Prado - Centro Empresarial',
        'Av. República de Panamá - Golf',
        'Av. Salaverry - Museo de la Nación',
        'Av. Prescott - Country Club',
        'Av. El Rosario - Clínica Anglo Americana'
      ],
      'Lima Centro': [
        'Plaza de Armas - Palacio de Gobierno',
        'Jr. de la Unión - Plaza San Martín',
        'Av. Tacna - Estación Central',
        'Jr. Azángaro - Congreso',
        'Av. Abancay - Mercado Central'
      ],
      'La Molina': [
        'Av. Javier Prado Este - ESAN',
        'Av. La Molina - Universidad Agraria',
        'Av. Raúl Ferrero - Camacho',
        'Av. Flora Tristán - Mall del Sur',
        'Av. Las Flores del Golf'
      ],
      'Surco': [
        'Av. Benavides - Óvalo Higuereta',
        'Av. Tomás Marsano - C.C. El Polo',
        'Av. Santiago de Surco - Municipalidad',
        'Av. Primavera - C.C. Jockey Plaza',
        'Av. El Derby - Hipódromo de Monterrico'
      ]
    };

    const districtLocations = locations[distrito] || [
      `Av. Principal - ${distrito}`,
      `Jr. Central - ${distrito}`,
      `Cruce Principal - ${distrito}`
    ];

    return districtLocations[Math.floor(Math.random() * districtLocations.length)];
  }

  private getRandomDescriptionByType(tipo: TrafficIncident['tipo']): string {
    const descriptions: Record<TrafficIncident['tipo'], string[]> = {
      accidente: [
        'Colisión frontal entre dos vehículos particulares en intersección',
        'Choque por alcance en semáforo, sin heridos',
        'Accidente de tránsito con vehículo volcado, requiere grúa',
        'Colisión lateral en cambio de carril indebido',
        'Accidente múltiple con 3 vehículos involucrados'
      ],
      violacion_carril: [
        'Vehículo particular invadiendo carril exclusivo de transporte público',
        'Cambio de carril indebido en zona prohibida',
        'Conducción por berma central en hora punta',
        'Invasión de carril contrario para adelantamiento',
        'Circulación en sentido contrario en vía exclusiva'
      ],
      vehiculo_emergencia: [
        'Ambulancia bloqueada por tráfico en carril de emergencia',
        'Bomberos obstaculizados por vehículos mal estacionados',
        'Patrullero PNP impedido de pasar por congestión vehicular',
        'SAMU bloqueado en intersección por semáforo malogrado',
        'Vehículo de emergencia obstruido en túnel'
      ],
      bicivia: [
        'Motocicleta circulando por ciclovía principal',
        'Vehículo estacionado obstruyendo paso de ciclistas',
        'Peatones caminando en ciclovía exclusiva',
        'Vendedor ambulante ocupando espacio de bicivía',
        'Auto particular utilizando ciclovía como atajo'
      ],
      corredor: [
        'Taxi invadiendo carril exclusivo del Metropolitano',
        'Vehículo particular en estación de alimentador',
        'Camión circulando por corredor complementario',
        'Auto bloqueando paradero de sistema BRT',
        'Motocicleta en carril segregado del Corredor Azul'
      ]
    };

    const typeDescriptions = descriptions[tipo];
    return typeDescriptions[Math.floor(Math.random() * typeDescriptions.length)];
  }

  private getRandomCoordinatesForLima(): { lat: number; lng: number } {
    // Further refined Lima coordinates range to ensure all random markers are on land
    const minLat = -12.15; // Adjusted slightly north to avoid extreme south coastal areas
    const maxLat = -11.98; // Adjusted slightly south
    const minLng = -77.03;  // Moved significantly further east from -77.05
    const maxLng = -76.98; // Adjusted slightly east

    return {
      lat: Math.random() * (maxLat - minLat) + minLat,
      lng: Math.random() * (maxLng - minLng) + minLng
    };
  }

  private initializeMockData(): void {
    const mockIncidents: TrafficIncident[] = [
      {
        id: '001',
        fecha: new Date('2025-08-07T14:30:00'),
        tipo: 'accidente',
        ubicacion: 'Av. Javier Prado - Cruce con Aviación',
        descripcion: 'Colisión frontal entre dos vehículos particulares. Tráfico lento en ambos sentidos.',
        estado: 'proceso',
        coordenadas: { lat: -12.0864, lng: -77.0428 },
        prioridad: 'alta',
        distrito: 'San Isidro',
        reportadoPor: 'Central 105',
        vehiculosInvolucrados: 2,
        personasAfectadas: 3,
        tiempoRespuesta: 12
      },
      {
        id: '002',
        fecha: new Date('2025-08-07T14:15:00'),
        tipo: 'vehiculo_emergencia',
        ubicacion: 'Vía Expresa - Hospital Nacional Dos de Mayo',
        descripcion: 'Ambulancia del SAMU bloqueada por congestión vehicular en carril de emergencia',
        estado: 'activo',
        coordenadas: { lat: -12.0565, lng: -77.0389 },
        prioridad: 'alta',
        distrito: 'Lima Centro',
        reportadoPor: 'SAMU',
        vehiculosInvolucrados: 1,
        personasAfectadas: 2
      },
      {
        id: '003',
        fecha: new Date('2025-08-07T14:00:00'),
        tipo: 'corredor',
        ubicacion: 'Corredor Azul - Estación Naranjal',
        descripcion: 'Vehículo particular circulando en carril exclusivo del Metropolitano',
        estado: 'resuelto',
        coordenadas: { lat: -12.0097, lng: -76.9951 },
        prioridad: 'media',
        distrito: 'Independencia',
        reportadoPor: 'Inspector Metropolitano',
        vehiculosInvolucrados: 1,
        personasAfectadas: 0,
        tiempoRespuesta: 8,
        horaResolucion: new Date('2025-08-07T14:08:00')
      },
      {
        id: '004',
        fecha: new Date('2025-08-07T13:45:00'),
        tipo: 'bicivia',
        ubicacion: 'Av. Arequipa - Altura del Óvalo Gutiérrez',
        descripcion: 'Motocicleta circulando por ciclovía, obstruyendo el paso de ciclistas',
        estado: 'proceso',
        coordenadas: { lat: -12.1192, lng: -77.0325 },
        prioridad: 'baja',
        distrito: 'Miraflores',
        reportadoPor: 'Serenazgo Miraflores',
        vehiculosInvolucrados: 1,
        personasAfectadas: 0
      },
      {
        id: '005',
        fecha: new Date('2025-08-07T13:30:00'),
        tipo: 'violacion_carril',
        ubicacion: 'Av. Brasil - Cruce con Universitaria',
        descripcion: 'Vehículo realizando cambio de carril indebido en zona prohibida',
        estado: 'activo',
        coordenadas: { lat: -12.0480, lng: -77.0350 }, // Adjusted to a land-based location in Lima Centro
        prioridad: 'media',
        distrito: 'Pueblo Libre',
        reportadoPor: 'Cámara de seguridad',
        vehiculosInvolucrados: 1,
        personasAfectadas: 0
      },
      {
        id: '006',
        fecha: new Date('2025-08-07T13:15:00'),
        tipo: 'accidente',
        ubicacion: 'Panamericana Norte - Altura del Aeropuerto Jorge Chávez',
        descripcion: 'Accidente de tránsito con un herido leve. Pista parcialmente cerrada.',
        estado: 'resuelto',
        coordenadas: { lat: -11.9995, lng: -77.1141 },
        prioridad: 'alta',
        distrito: 'Callao',
        reportadoPor: 'Bomberos Callao',
        vehiculosInvolucrados: 2,
        personasAfectadas: 1,
        tiempoRespuesta: 15,
        horaResolucion: new Date('2025-08-07T13:30:00')
      },
      {
        id: '007',
        fecha: new Date('2025-08-07T13:00:00'),
        tipo: 'corredor',
        ubicacion: 'Corredor Rojo - Estación Central',
        descripcion: 'Taxi bloqueando estación de buses del Sistema Integrado de Transporte',
        estado: 'activo',
        coordenadas: { lat: -12.0464, lng: -77.0428 },
        prioridad: 'alta',
        distrito: 'Lima Centro',
        reportadoPor: 'ATU',
        vehiculosInvolucrados: 1,
        personasAfectadas: 20
      },
      {
        id: '008',
        fecha: new Date('2025-08-07T12:45:00'),
        tipo: 'bicivia',
        ubicacion: 'Malecón de la Costa Verde - Miraflores',
        descripcion: 'Peatones caminando por ciclovía, generando congestión para ciclistas',
        estado: 'resuelto',
        coordenadas: { lat: -12.1267, lng: -77.0297 },
        prioridad: 'baja',
        distrito: 'Miraflores',
        reportadoPor: 'Serenazgo Miraflores',
        vehiculosInvolucrados: 0,
        personasAfectadas: 5,
        tiempoRespuesta: 20,
        horaResolucion: new Date('2025-08-07T13:05:00')
      },
      {
        id: '009',
        fecha: new Date('2025-08-07T12:30:00'),
        tipo: 'accidente',
        ubicacion: 'Av. Benavides - Óvalo Ricardo Palma',
        descripcion: 'Choque múltiple entre 3 vehículos en intersección semafórica',
        estado: 'proceso',
        coordenadas: { lat: -12.1289, lng: -77.0234 },
        prioridad: 'alta',
        distrito: 'Miraflores',
        reportadoPor: 'Testigo civil',
        vehiculosInvolucrados: 3,
        personasAfectadas: 4
      },
      {
        id: '010',
        fecha: new Date('2025-08-07T12:15:00'),
        tipo: 'vehiculo_emergencia',
        ubicacion: 'Av. Salaverry - Hospital Militar',
        descripcion: 'Camión de bomberos obstruido por vehículos mal estacionados',
        estado: 'resuelto',
        coordenadas: { lat: -12.0692, lng: -77.0556 },
        prioridad: 'alta',
        distrito: 'Jesús María',
        reportadoPor: 'Bomberos CBP 14',
        vehiculosInvolucrados: 1,
        personasAfectadas: 0,
        tiempoRespuesta: 5,
        horaResolucion: new Date('2025-08-07T12:20:00')
      }
    ];

    // Add more incidents to reach 50+ total
    const additionalIncidents = this.generateAdditionalMockData(45);
    this._incidents.set([...mockIncidents, ...additionalIncidents]);
  }

  private generateAdditionalMockData(count: number): TrafficIncident[] {
    const incidents: TrafficIncident[] = [];
    const tipos: TrafficIncident['tipo'][] = ['accidente', 'violacion_carril', 'vehiculo_emergencia', 'bicivia', 'corredor'];
    const estados: TrafficIncident['estado'][] = ['activo', 'proceso', 'resuelto'];
    const prioridades: TrafficIncident['prioridad'][] = ['alta', 'media', 'baja'];

    for (let i = 0; i < count; i++) {
      const randomTipo = tipos[Math.floor(Math.random() * tipos.length)];
      const randomEstado = estados[Math.floor(Math.random() * estados.length)];
      const randomPrioridad = prioridades[Math.floor(Math.random() * prioridades.length)];
      const randomDistrito = this.limaDistricts[Math.floor(Math.random() * this.limaDistricts.length)];
      
      // Generate random date within last 7 days
      const randomDate = new Date();
      randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 7));
      randomDate.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));

      const incident: TrafficIncident = {
        id: `${String(i + 11).padStart(3, '0')}`,
        fecha: randomDate,
        tipo: randomTipo,
        ubicacion: this.getRandomLocationByDistrict(randomDistrito),
        descripcion: this.getRandomDescriptionByType(randomTipo),
        estado: randomEstado,
        coordenadas: this.getRandomCoordinatesForLima(),
        prioridad: randomPrioridad,
        distrito: randomDistrito,
        reportadoPor: Math.random() > 0.5 ? 'Sistema Automático' : 'Central 105',
        vehiculosInvolucrados: randomTipo === 'accidente' ? Math.floor(Math.random() * 4) + 1 : Math.floor(Math.random() * 2) + 1,
        personasAfectadas: Math.floor(Math.random() * 6),
        tiempoRespuesta: randomEstado === 'resuelto' ? Math.floor(Math.random() * 45) + 5 : undefined,
        horaResolucion: randomEstado === 'resuelto' ? new Date(randomDate.getTime() + (Math.floor(Math.random() * 3600000))) : undefined
      };

      incidents.push(incident);
    }

    return incidents;
  }
}