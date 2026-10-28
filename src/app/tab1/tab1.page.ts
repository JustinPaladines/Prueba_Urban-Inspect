import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
  IonButton,
  IonSpinner,
  IonText
} from '@ionic/angular';
import { timeout, finalize } from 'rxjs';

import {
  IncidenciasService,
  Incidencia,
  RespuestaPaginada
} from '../services/incidencias';

// preferencias para dar seguimiento a la incidencias
import { Preferences } from '@capacitor/preferences';

import { Router } from '@angular/router';

import { ViewWillEnter } from '@ionic/angular';

@Component({
  selector: 'app-tab1',
  templateUrl: './tab1.page.html',
  styleUrls: ['./tab1.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonBadge,
    IonButton,
    IonSpinner,
    IonText
  ]
})
export class Tab1Page implements OnInit, ViewWillEnter {
  private servicio = inject(IncidenciasService);
  private cdr = inject(ChangeDetectorRef); 
  private router = inject(Router);

  incidencias: Incidencia[] = [];
  pagina = 1;
  cargando = false;
  hayMas = true;
  error = '';

  totalIncidencias = 0;
  pendientes = 0;
  enProceso = 0;
  resueltas = 0;
  cargandoIndicadores = false;

  fotografiaSeleccionada: string | null = null;

  // Aquí están tus métodos actuales

  mostrarFotografia(fotografia: string): void {
    this.fotografiaSeleccionada = fotografia;
  }

  cerrarFotografia(): void {
    this.fotografiaSeleccionada = null;
  }

  
  // seguimiento
  codigosSeguimiento: string[] = [];
  private readonly claveSeguimiento = 'urbaninspect_seguimiento';

  ngOnInit(): void {
  this.cargarIncidencias();
  this.cargarSeguimiento();

}
  
async ionViewWillEnter(): Promise<void> {
  await this.cargarSeguimiento();
  this.cargarIndicadores();
  this.actualizarIncidencias();
}

  abrirDetalle(id: string): void {
  this.router.navigate(['/tabs/detalle', id]);
}
  actualizarIncidencias(): void {
  if (this.cargando) {
    return;
  }

  this.cargando = true;
  this.error = '';

  this.servicio.obtenerTodas().pipe(
    timeout(10000),
    finalize(() => {
      this.cargando = false;
      this.cdr.detectChanges();
    })
  ).subscribe({
    next: (datos) => {
      // Guardar las incidencias que ya estaban cargadas
      const existentes = new Map(
        this.incidencias.map(incidencia => [
          incidencia.id,
          incidencia
        ])
      );

      // Combinar los datos recibidos con los existentes
      const combinadas = datos.map(incidencia => ({
        ...existentes.get(incidencia.id),
        ...incidencia
      }));

      // Ordenar por ID: las más antiguas primero
      combinadas.sort((a, b) => {
        return (Number(a.id) || 0) - (Number(b.id) || 0);
      });

      // Mantener únicamente la cantidad de registros
      // correspondiente a las páginas que ya se cargaron
      const cantidadCargada = Math.max(
        this.incidencias.length,
        5
      );

      this.incidencias = combinadas.slice(0, cantidadCargada);

      // Actualizar el estado de la paginación
      this.hayMas = combinadas.length > this.incidencias.length;
      this.pagina = Math.floor(this.incidencias.length / 5) + 1;

      this.cdr.detectChanges();
    },
    error: (err) => {
      console.error('Error al actualizar incidencias:', err);
      this.error = 'No se pudieron actualizar las incidencias.';
      this.cdr.detectChanges();
    }
  });
}

cargarIndicadores(): void {
  this.cargandoIndicadores = true;

  this.servicio.obtenerTodas().pipe(
    timeout(10000),
    finalize(() => {
      this.cargandoIndicadores = false;
      this.cdr.detectChanges();
    })
  ).subscribe({
    next: (datos) => {
      this.totalIncidencias = datos.length;

      this.pendientes = datos.filter(
        incidencia => incidencia.estado.toLowerCase() === 'pendiente'
      ).length;

      this.enProceso = datos.filter(
        incidencia => incidencia.estado.toLowerCase() === 'en proceso'
      ).length;

      this.resueltas = datos.filter(
        incidencia => incidencia.estado.toLowerCase() === 'resuelta'
      ).length;
    },
    error: (err) => {
      console.error('Error al cargar indicadores:', err);
    }
  });
}


  cargarIncidencias(): void {
    if (this.cargando || !this.hayMas) {
      return;
    }

    this.cargando = true;
    this.error = '';

    this.servicio.obtenerPagina(this.pagina, 5).pipe(
      timeout(10000),
      finalize(() => {
        this.cargando = false;
        this.cdr.detectChanges(); 
      })
    ).subscribe({
      next: (respuesta) => {
        let datos: Incidencia[];
        let siguientePagina: number | null | undefined;

        if (Array.isArray(respuesta)) {
          datos = respuesta;
        } else {
          const paginada = respuesta as RespuestaPaginada;
          datos = paginada.data;
          siguientePagina = paginada.nextPage;
        }

        if (!Array.isArray(datos)) {
          this.error = 'La respuesta de la API tiene un formato inesperado.';
          this.cdr.detectChanges();
          return;
        }

        this.incidencias = [...this.incidencias, ...datos];

        if (siguientePagina !== undefined) {
          this.hayMas = siguientePagina !== null;
          if (typeof siguientePagina === 'number') {
            this.pagina = siguientePagina;
          }
        } else {
          this.hayMas = datos.length === 5;
          if (this.hayMas) {
            this.pagina++;
          }
        }
        
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error('Error al cargar incidencias:', err);

        this.error = err.name === 'TimeoutError'
          ? 'La consulta tardó demasiado. Intenta nuevamente.'
          : 'No se pudieron cargar las incidencias. Comprueba tu conexión e intenta nuevamente.';
          
        this.cdr.detectChanges(); 
      }
    });
  }

  async cargarSeguimiento(): Promise<void> {
  const resultado = await Preferences.get({
    key: this.claveSeguimiento
  });

  this.codigosSeguimiento = resultado.value
    ? JSON.parse(resultado.value)
    : [];

  this.cdr.detectChanges();
}

estaEnSeguimiento(id: string): boolean {
  return this.codigosSeguimiento.includes(id);
}

  async alternarSeguimiento(id: string): Promise<void> {
  if (this.estaEnSeguimiento(id)) {
    this.codigosSeguimiento = this.codigosSeguimiento.filter(
      item => item !== id
    );
  } else {
    this.codigosSeguimiento = [
      ...this.codigosSeguimiento,
      id
    ];
  }

  await Preferences.set({
    key: this.claveSeguimiento,
    value: JSON.stringify(this.codigosSeguimiento)
  });

  this.cdr.detectChanges();
}

  obtenerColor(estado: string): string {
    switch (estado.toLowerCase()) {
      case 'pendiente':
        return 'warning';
      case 'en proceso':
        return 'primary';
      case 'resuelta':
        return 'success';
      default:
        return 'medium';
    }
  }
}