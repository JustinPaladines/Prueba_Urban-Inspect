
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonItem,
  IonLabel,
  IonTextarea,
  IonBadge,
  IonSpinner,
  IonText
} from '@ionic/angular';
import { IncidenciasService, Incidencia } from '../services/incidencias';

@Component({
  selector: 'app-detalle',
  templateUrl: './detalle.page.html',
  styleUrls: ['./detalle.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButton,
    IonItem,
    IonLabel,
    IonTextarea,
    IonBadge,
    IonSpinner,
    IonText
  ],
})
export class DetallePage implements OnInit {
  private ruta = inject(ActivatedRoute);
  private router = inject(Router);
  private servicio = inject(IncidenciasService);
  private cdr = inject(ChangeDetectorRef);

  incidencia: Incidencia | null = null;
  cargando = true;
  error = '';
  observacion = '';
  guardando = false;
  mensaje = '';

  ngOnInit(): void {
    const id = this.ruta.snapshot.paramMap.get('id');

    if (!id) {
      this.error = 'No se recibió el identificador de la incidencia.';
      this.cargando = false;
      return;
    }

    this.servicio.obtenerPorId(id).subscribe({
      next: (datos) => {
        this.incidencia = datos;
        this.observacion = datos.observacionResolucion || '';
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al consultar la incidencia:', err);
        this.error = 'No se pudo cargar la incidencia.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
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

  cambiarEstado(nuevoEstado: string): void {
    if (!this.incidencia?.id || this.guardando) {
      return;
    }

    const estadoActual = this.incidencia.estado;

    // Validar las transiciones permitidas.
    const transicionValida =
      (estadoActual === 'Pendiente' &&
        (nuevoEstado === 'En proceso' || nuevoEstado === 'Resuelta')) ||
      (estadoActual === 'En proceso' && nuevoEstado === 'Resuelta');

    if (!transicionValida) {
      this.mensaje = 'El cambio de estado no está permitido.';
      return;
    }

    if (nuevoEstado === 'Resuelta' && !this.observacion.trim()) {
      this.mensaje = 'Escribe una observación para resolver la incidencia.';
      return;
    }

    this.guardando = true;
    this.mensaje = '';

    const cambios: Partial<Incidencia> = {
      estado: nuevoEstado
    };

    if (nuevoEstado === 'Resuelta') {
      cambios.observacionResolucion = this.observacion.trim();
    }

    this.servicio.actualizarIncidencia(
      this.incidencia.id,
      cambios
    ).subscribe({
      next: (actualizada) => {
        this.incidencia = actualizada;
        this.observacion = actualizada.observacionResolucion || '';
        this.mensaje = 'Estado actualizado correctamente.';
        this.guardando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al actualizar la incidencia:', err);
        this.mensaje = 'No se pudo actualizar el estado. Intenta nuevamente.';
        this.guardando = false;
        this.cdr.detectChanges();
      }
    });
  }

  volver(): void {
    this.router.navigate(['/tabs/tab1']);
  }
}
