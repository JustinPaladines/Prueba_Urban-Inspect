
import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonText
} from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Preferences } from '@capacitor/preferences';

import {
  IncidenciasService,
  Incidencia
} from '../services/incidencias';


// imports para fotografias
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import type { Photo } from '@capacitor/camera';

// ubicación
import { Geolocation } from '@capacitor/geolocation';
import { AlertController } from '@ionic/angular';

// Clima
import { ClimaService } from '../services/clima.service';

interface Borrador {
  tipo: string;
  descripcion: string;
  direccion: string;
  sector: string;
  prioridad: string;
  fotografia: string;
  latitud: number | null;
  longitud: number | null;
}

@Component({
  selector: 'app-tab2',
  templateUrl: './tab2.page.html',
  styleUrls: ['./tab2.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonText
  ]
})
export class Tab2Page {
  private servicio = inject(IncidenciasService);

  // inyectar actualización de pantalla
  private cdr = inject(ChangeDetectorRef);

  //inyectar ubicación
  private alertController = inject(AlertController);

  private readonly claveBorrador = 'urbaninspect_borrador';

  // inyectar clima
  private climaService = inject(ClimaService);


  tipo = '';
  descripcion = '';
  direccion = '';
  sector = '';
  prioridad = '';
  fotografia = '';

  latitud: number | null = null;
  longitud: number | null = null;

  guardando = false;
  mensaje = '';
  error = false;

  esperandoConfirmacionClima = false;

  temperatura: number | null = null;
  precipitacion: number | null = null;
  condicionClima = '';
  consultandoClima = false;
  advertenciaClima = '';
  direccionClima = '';
  tipoClima = '';

  mostrarOpcionesBorrador = false;
  borradorPendiente: Borrador | null = null;

  async ionViewWillEnter(): Promise<void> {
    if (this.hayDatosFormulario()) {
      return;
    }

    try {
      const resultado = await Preferences.get({
        key: this.claveBorrador
      });

      if (resultado.value) {
        this.borradorPendiente = JSON.parse(resultado.value) as Borrador;
        this.mostrarOpcionesBorrador = true;
        this.cdr.detectChanges();
      }
    } catch (err) {
      console.error('Error al recuperar el borrador:', err);
      this.mensaje = 'No se pudo recuperar el borrador guardado.';
      this.error = true;
      this.cdr.detectChanges();
    }
  }

  async guardarBorrador(): Promise<void> {
    const borrador: Borrador = {
      tipo: this.tipo,
      descripcion: this.descripcion,
      direccion: this.direccion,
      sector: this.sector,
      prioridad: this.prioridad,
      fotografia: this.fotografia,
      latitud: this.latitud,
      longitud: this.longitud
    };

    if (!this.hayDatosFormulario()) {
      await Preferences.remove({ key: this.claveBorrador });
      return;
    }

    try {
      await Preferences.set({
        key: this.claveBorrador,
        value: JSON.stringify(borrador)
      });
    } catch (err) {
      console.error('Error al guardar el borrador:', err);
    }
  }

  async continuarBorrador(): Promise<void> {
    if (!this.borradorPendiente) {
      return;
    }

    this.tipo = this.borradorPendiente.tipo;
    this.descripcion = this.borradorPendiente.descripcion;
    this.direccion = this.borradorPendiente.direccion;
    this.sector = this.borradorPendiente.sector;
    this.prioridad = this.borradorPendiente.prioridad;
    this.fotografia = this.borradorPendiente.fotografia || '';
    this.latitud = this.borradorPendiente.latitud ?? null;
    this.longitud = this.borradorPendiente.longitud ?? null;

    this.mostrarOpcionesBorrador = false;
    this.borradorPendiente = null;
    this.mensaje = 'Borrador recuperado.';
    this.error = false;

    this.cdr.detectChanges();
  }

  async descartarBorrador(): Promise<void> {
    try {
      await Preferences.remove({ key: this.claveBorrador });

      this.tipo = '';
      this.descripcion = '';
      this.direccion = '';
      this.sector = '';
      this.prioridad = '';
      this.fotografia = '';
      this.latitud = null;
      this.longitud = null;

      this.mostrarOpcionesBorrador = false;
      this.borradorPendiente = null;
      this.mensaje = 'Borrador descartado.';
      this.error = false;

      this.cdr.detectChanges();
    } catch (err) {
      console.error('Error al descartar el borrador:', err);
      this.mensaje = 'No se pudo descartar el borrador.';
      this.error = true;
      this.cdr.detectChanges();
    }
  }


async tomarFotografia(): Promise<void> {
  try {
    const foto: Photo = await Camera.getPhoto({
      quality: 30,
      width: 600,
      height: 600,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera
    });

    if (foto.dataUrl) {
      this.fotografia = foto.dataUrl;
      await this.guardarBorrador();

      this.mensaje = 'Fotografía guardada correctamente.';
      this.error = false;
    }
  } catch (err: any) {
    console.error('No se pudo tomar la fotografía:', err);

    const detalle = String(
      err?.message ?? err
    ).toLowerCase();

    if (
      detalle.includes('permission') ||
      detalle.includes('denied') ||
      detalle.includes('permiso')
    ) {
      this.mensaje =
        'No se concedió el permiso de cámara. Autorízalo en los ajustes de la aplicación para tomar una fotografía.';
    } else {
      this.mensaje =
        'No se tomó la fotografía. Puedes intentarlo nuevamente; los datos del formulario se conservaron.';
    }

    this.error = true;
  }

  this.cdr.detectChanges();
}


  async obtenerUbicacion(): Promise<void> {
  try {
    const posicion = await Geolocation.getCurrentPosition();

    this.latitud = posicion.coords.latitude;
    this.longitud = posicion.coords.longitude;

    await this.guardarBorrador();
    this.mensaje = 'Ubicación obtenida correctamente.';
    this.error = false;
  } catch (err) {
    console.error('No se pudo obtener la ubicación:', err);
    this.mensaje = 'No se pudo acceder al GPS. Puedes ingresar las coordenadas manualmente.';
    this.error = true;
  }

  this.cdr.detectChanges();
}

  async ingresarUbicacionManual(): Promise<void> {
    const alerta = await this.alertController.create({
      header: 'Coordenadas manuales',
      inputs: [
        {
          name: 'latitud',
          type: 'number',
          placeholder: 'Latitud'
        },
        {
          name: 'longitud',
          type: 'number',
          placeholder: 'Longitud'
        }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          role: 'confirm',
          handler: (datos) => {
            const lat = Number(datos.latitud);
            const lon = Number(datos.longitud);

            if (
              datos.latitud === '' ||
              datos.longitud === '' ||
              !Number.isFinite(lat) ||
              !Number.isFinite(lon) ||
              lat < -90 || lat > 90 ||
              lon < -180 || lon > 180
            ) {
              this.mensaje = 'Ingresa coordenadas válidas.';
              this.error = true;
              return false;
            }

            this.latitud = lat;
            this.longitud = lon;
            void this.guardarBorrador();
            this.mensaje = 'Coordenadas guardadas.';
            this.error = false;
            return true;
          }
        }
      ]
    });

    await alerta.present();
  }

  registrarIncidencia(): void {
  this.mensaje = '';
  this.advertenciaClima = '';
  this.error = false;

  // Validar campos obligatorios
  if (
    !this.tipo ||
    !this.descripcion.trim() ||
    !this.direccion.trim() ||
    !this.sector.trim() ||
    !this.prioridad
  ) {
    this.mensaje = 'Completa todos los campos obligatorios.';
    this.error = true;
    return;
  }

  // La prioridad alta requiere fotografía
  if (this.prioridad === 'Alta' && !this.fotografia) {
    this.mensaje = 'La prioridad alta requiere una fotografía.';
    this.error = true;
    return;
  }

  // Los baches requieren ubicación
  if (
    this.tipo.toLowerCase() === 'bache' &&
    (this.latitud === null || this.longitud === null)
  ) {
    this.mensaje =
      'Para registrar un bache, debes obtener la ubicación GPS o ingresar coordenadas manualmente.';
    this.error = true;
    return;
  }
  
  this.direccionClima = this.direccion.trim();
  this.tipoClima = this.tipo;

  this.guardando = true;

  // Sin coordenadas, se permite guardar, pero no consultar el clima.
  if (this.latitud === null || this.longitud === null) {
    this.advertenciaClima =
      'No se pudo consultar el clima porque la incidencia no tiene coordenadas.';
    this.guardarIncidenciaRemota();
    return;
  }

  // Consultar el clima antes de registrar
  this.consultandoClima = true;

  this.climaService
    .consultarClima(this.latitud, this.longitud)
    .subscribe({
      next: (clima) => {
        this.temperatura = clima.temperatura;
        this.precipitacion = clima.precipitacion;
        this.condicionClima = clima.condicion;
        this.consultandoClima = false;

        if (clima.precipitacion > 5) {
          this.advertenciaClima =
            'Advertencia: la precipitación supera los 5 mm. Las condiciones podrían dificultar el mantenimiento.';
        }

        this.esperandoConfirmacionClima = true;
        this.guardando = false;
        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error('Error al consultar el clima:', err);

        this.consultandoClima = false;
        this.advertenciaClima =
          'No se pudo consultar el clima. Puedes continuar con el registro.';

        this.esperandoConfirmacionClima = true;
        this.guardando = false;
        this.cdr.detectChanges();
      }
    });
}

confirmarRegistro(): void {
  if (!this.esperandoConfirmacionClima || this.guardando) {
    return;
  }

  this.esperandoConfirmacionClima = false;
  this.guardando = true;
  this.guardarIncidenciaRemota();
}

cancelarConfirmacionClima(): void {
  this.esperandoConfirmacionClima = false;
  this.guardando = false;
  this.mensaje = 'Registro cancelado. Los datos del formulario se conservaron.';
  this.error = false;
}


private guardarIncidenciaRemota(): void {
  this.servicio.obtenerTodas().subscribe({
    next: (incidencias) => {
      const nuevaIncidencia: Incidencia = {
        codigo: this.obtenerSiguienteCodigo(incidencias),
        tipo: this.tipo,
        descripcion: this.descripcion.trim(),
        direccion: this.direccion.trim(),
        sector: this.sector.trim(),
        fecha: new Date().toISOString().slice(0, 10),
        estado: 'Pendiente',
        prioridad: this.prioridad,
        fotografia: this.fotografia,
        latitud: this.latitud ?? 0,
        longitud: this.longitud ?? 0,
        observacionResolucion: ''
      };

      this.enviarIncidencia(nuevaIncidencia);
    },
    error: (err) => {
      console.error('Error al consultar incidencias:', err);
      this.mensaje = 'No se pudieron consultar los códigos existentes. Intenta nuevamente.';
      this.error = true;
      this.guardando = false;
      this.cdr.detectChanges();
    }
  });
}

private enviarIncidencia(nuevaIncidencia: Incidencia): void {
  this.servicio.crearIncidencia(nuevaIncidencia).subscribe({
    next: async () => {
      this.limpiarFormulario();
      this.guardando = false;
      this.fotografia = '';
      this.latitud = null;
      this.longitud = null;

      try {
        await Preferences.remove({ key: this.claveBorrador });

        this.mensaje = this.advertenciaClima
          ? 'Incidencia registrada correctamente. Revisa la información del clima.'
          : 'Incidencia registrada correctamente.';

        this.error = false;
      } catch {
        this.mensaje = 'Incidencia registrada, pero no se pudo borrar el borrador local.';
        this.error = true;
      }

      this.cdr.detectChanges();
    },
    error: (err) => {
      console.error('Error al registrar:', err);
      console.error('Estado HTTP:', err.status);
      console.error('Respuesta del servidor:', err.error);

      this.mensaje = `No se pudo registrar. Error HTTP: ${err.status}.`;
      this.error = true;
      this.guardando = false;
      this.cdr.detectChanges();
    }
  });
}


  private obtenerSiguienteCodigo(incidencias: Incidencia[]): string {
  const mayorCodigo = incidencias.reduce((mayor, incidencia) => {
    const coincidencia = incidencia.codigo?.match(/^INC-(\d+)$/);
    const numero = coincidencia ? Number(coincidencia[1]) : 0;

    return Math.max(mayor, numero);
  }, 0);

  return `INC-${String(mayorCodigo + 1).padStart(3, '0')}`;
}

  private hayDatosFormulario(): boolean {
    return !!(
      this.tipo ||
      this.descripcion.trim() ||
      this.direccion.trim() ||
      this.sector.trim() ||
      this.prioridad
    );
  }

  private limpiarFormulario(): void {
    this.tipo = '';
    this.descripcion = '';
    this.direccion = '';
    this.sector = '';
    this.prioridad = '';
  }
}
