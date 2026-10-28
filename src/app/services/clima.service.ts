
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClimaService {
  private http = inject(HttpClient);

  consultarClima(latitud: number, longitud: number) {
    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${latitud}` +
      `&longitude=${longitud}` +
      `&current=temperature_2m,precipitation,weather_code` +
      `&hourly=precipitation` +
      `&past_hours=1` +
      `&forecast_hours=1` +
      `&timezone=auto`;

    return this.http.get<any>(url).pipe(
      map((datos) => {
        if (
          !datos.current ||
          datos.current.temperature_2m == null ||
          datos.current.weather_code == null ||
          !datos.hourly?.precipitation?.length
        ) {
          throw new Error('El servicio no proporcionó todos los datos del clima.');
        }

        const precipitaciones = datos.hourly.precipitation;
        const ultimaPrecipitacion = precipitaciones[precipitaciones.length - 1];

        if (ultimaPrecipitacion == null) {
          throw new Error('No hay datos de precipitación disponibles.');
        }

        return {
          temperatura: datos.current.temperature_2m,
          precipitacion: ultimaPrecipitacion,
          condicion: this.obtenerCondicion(datos.current.weather_code)
        };
      })
    );
  }

  private obtenerCondicion(codigo: number): string {
    if (codigo === 0) return 'Despejado';
    if ([1, 2, 3].includes(codigo)) return 'Parcialmente nublado o nublado';
    if ([45, 48].includes(codigo)) return 'Niebla';
    if ([51, 53, 55, 56, 57].includes(codigo)) return 'Llovizna';
    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(codigo)) return 'Lluvia';
    if ([71, 73, 75, 77, 85, 86].includes(codigo)) return 'Nieve';
    if ([95, 96, 99].includes(codigo)) return 'Tormenta';
    return 'Condición variable';
  }
}
