
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
  IonButton,
  IonBadge,
  IonText,
  IonSpinner
} from '@ionic/angular';
import { Preferences } from '@capacitor/preferences';
import { IncidenciasService, Incidencia } from '../services/incidencias';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
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
    IonButton,
    IonBadge,
    IonText,
    IonSpinner
  ],
})
export class Tab3Page implements OnInit {
  private servicio = inject(IncidenciasService);
  private cdr = inject(ChangeDetectorRef);

  private readonly claveSeguimiento = 'urbaninspect_seguimiento';

  incidencias: Incidencia[] = [];
  cargando = false;
  error = '';

  ngOnInit(): void {
    this.cargarSeguimientos();
  }

  async cargarSeguimientos(): Promise<void> {
    this.cargando = true;
    this.error = '';

    try {
      const resultado = await Preferences.get({
        key: this.claveSeguimiento
      });

      const ids: string[] = resultado.value
        ? JSON.parse(resultado.value)
        : [];

      if (ids.length === 0) {
        this.incidencias = [];
        this.cargando = false;
        this.cdr.detectChanges();
        return;
      }

      this.servicio.obtenerTodas().subscribe({
        next: (datos) => {
          this.incidencias = datos.filter(
            incidencia => incidencia.id && ids.includes(incidencia.id)
          );
          this.cargando = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error al cargar seguimientos:', err);
          this.error = 'No se pudieron cargar los seguimientos.';
          this.cargando = false;
          this.cdr.detectChanges();
        }
      });
    } catch (err) {
      console.error('Error al leer seguimientos:', err);
      this.error = 'No se pudieron leer los seguimientos guardados.';
      this.cargando = false;
      this.cdr.detectChanges();
    }
  }

  async quitarSeguimiento(id: string): Promise<void> {
    const resultado = await Preferences.get({
      key: this.claveSeguimiento
    });

    const ids: string[] = resultado.value
      ? JSON.parse(resultado.value)
      : [];

    const nuevosIds = ids.filter(item => item !== id);

    await Preferences.set({
      key: this.claveSeguimiento,
      value: JSON.stringify(nuevosIds)
    });

    this.incidencias = this.incidencias.filter(
      incidencia => incidencia.id !== id
    );

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
