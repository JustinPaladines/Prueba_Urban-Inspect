
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Incidencia {
  id?: string;
  codigo: string;
  tipo: string;
  descripcion: string;
  direccion: string;
  sector: string;
  fecha: string;
  estado: string;
  prioridad: string;
  fotografia: string;
  latitud: number;
  longitud: number;
  observacionResolucion: string;
}

export interface RespuestaPaginada {
  data: Incidencia[];
  page?: number;
  pageSize?: number;
  totalPages?: number;
  totalRecords?: number;
  nextPage?: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class IncidenciasService {
  private http = inject(HttpClient);

  private apiUrl ='https://6ae15373be3bc8fead986565.mockapi.io/incidencias';

  obtenerPagina(pagina: number, limite: number = 5) {
  return this.http.get<Incidencia[] | RespuestaPaginada>(
    `${this.apiUrl}?page=${pagina}&limit=${limite}`
  );
}

    obtenerTodas() {
    return this.http.get<Incidencia[]>(this.apiUrl);
    }

  obtenerPorId(id: string) {
    return this.http.get<Incidencia>(`${this.apiUrl}/${id}`);
  }

  
  crearIncidencia(incidencia: Incidencia) {
  return this.http.post<Incidencia>(
    this.apiUrl,
    incidencia
  );
}


    actualizarIncidencia(id: string, cambios: Partial<Incidencia>): Observable<Incidencia> {
    return this.http.put<Incidencia>(
        `${this.apiUrl}/${id}`,
        cambios
    );
}


}
