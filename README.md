# UrbanInspect - Prueba I 
# Justin Paladines

Aplicación móvil desarrollada con **Ionic, Angular y TypeScript** para el registro, consulta y seguimiento de incidencias urbanas. Permite registrar problemas como baches, consultar información de las incidencias, revisar condiciones climáticas y realizar seguimiento de reportes seleccionados.

## Características principales

- **Consulta de incidencias:** obtiene los reportes desde una API remota y muestra la información en una lista paginada.
- **Registro de incidencias:** permite ingresar el tipo de problema, descripción, dirección, sector y prioridad.
- **Fotografías:** permite capturar fotografías mediante la cámara del dispositivo y visualizar la imagen seleccionada.
- **Ubicación:** permite obtener coordenadas mediante GPS o ingresarlas manualmente cuando corresponda.
- **Información climática:** consulta las condiciones del clima según las coordenadas disponibles y advierte cuando la precipitación supera los 5 mm.
- **Seguimiento local:** permite guardar incidencias seleccionadas para consultarlas posteriormente.
- **Borradores:** conserva temporalmente los datos del formulario para continuar el registro después.
- **Gestión de estados:** permite actualizar el estado de las incidencias respetando las transiciones establecidas.
- **Indicadores:** presenta información resumida de las incidencias registradas.

## Tecnologías utilizadas

| Tecnología | Uso |
|---|---|
| Ionic | Componentes e interfaz de la aplicación móvil. |
| Angular | Estructura de la aplicación y organización de sus páginas y servicios. |
| TypeScript | Desarrollo de la lógica y definición de tipos de datos. |
| Capacitor | Integración de funcionalidades nativas del dispositivo. |
| MockAPI | Servicio remoto para consultar, registrar y actualizar incidencias. |
| Preferences | Almacenamiento local de información de seguimiento y borradores. |
| Geolocation | Obtención de las coordenadas geográficas del dispositivo. |
| Camera | Captura de fotografías mediante la cámara del dispositivo. |
| HttpClient | Comunicación HTTP con los servicios remotos. |
| RxJS | Manejo de operaciones asíncronas utilizadas por los servicios HTTP. |

## Requisitos previos

Antes de ejecutar el proyecto, se necesita tener instalado:

- Node.js y npm.
- Ionic CLI.
- Android Studio, para ejecutar la aplicación en Android.
- Un emulador Android configurado o un dispositivo físico compatible.

## API utilizada

La aplicación utiliza MockAPI como servicio remoto para gestionar las incidencias.

**Endpoint principal:**

```text
https://6ae15373be3bc8fead986565.mockapi.io/incidencias
```

A través de este servicio se realizan operaciones para:

- Consultar incidencias.
- Obtener registros por identificador.
- Registrar nuevas incidencias.
- Actualizar información y estados de los reportes.
- Consultar los datos en páginas, cuando corresponde.

## API meteorológica: Open-Meteo

UrbanInspect utiliza **Open-Meteo** para consultar las condiciones meteorológicas de la ubicación de una incidencia. Es un servicio que proporciona información climática mediante solicitudes HTTP, sin necesidad de utilizar una clave API para este tipo de consulta.

**Endpoint utilizado:**

```text
https://api.open-meteo.com/v1/forecast
```

### ¿Cómo funciona?

1. **Obtención de coordenadas:** la aplicación utiliza la latitud y longitud de la incidencia, obtenidas mediante GPS o ingresadas manualmente.
2. **Consulta meteorológica:** el servicio `ClimaService` realiza una solicitud HTTP a Open-Meteo enviando las coordenadas y los parámetros meteorológicos requeridos.
3. **Procesamiento de la respuesta:** la aplicación obtiene la temperatura actual, la precipitación registrada por hora y el código meteorológico.

### Parámetros consultados

| Parámetro | Descripción |
|---|---|
| `latitude` | Latitud de la ubicación consultada. |
| `longitude` | Longitud de la ubicación consultada. |
| `current=temperature_2m,precipitation,weather_code` | Solicita la temperatura actual, la precipitación actual y el código del estado meteorológico. |
| `hourly=precipitation` | Solicita los datos de precipitación por hora. |
| `past_hours=1` | Incluye información de la hora anterior. |
| `forecast_hours=1` | Incluye información de la hora de pronóstico. |
| `timezone=auto` | Ajusta las referencias horarias a la zona horaria de las coordenadas consultadas. |

### Integración en la aplicación

La consulta se encuentra centralizada en `ClimaService`, que utiliza `HttpClient` de Angular para comunicarse con el servicio externo. La respuesta se transforma en un objeto con los siguientes campos:

- `temperatura`: temperatura actual en grados Celsius.
- `precipitacion`: precipitación expresada en milímetros.
- `condicion`: descripción del estado meteorológico en español.

## Instalación y ejecución

### 1. Clonar el repositorio

```bash
git clone https://github.com/JustinPaladines/Prueba_Urban-Inspect.git
```


### 2. Ingresar a la carpeta del proyecto

```bash
cd urban-inspect
```

Si la carpeta tiene otro nombre, utiliza el nombre correspondiente.

### 3. Instalar las dependencias

```bash
npm install
```

### 4. Ejecutar en el navegador

```bash
ionic serve
```

Este comando inicia el servidor de desarrollo y permite probar la interfaz desde el navegador. Algunas funciones nativas, como la cámara y el GPS, deben probarse en un dispositivo o emulador Android.

### 5. Compilar el proyecto

```bash
ionic build
```

### 6. Sincronizar con Android

```bash
ionic capacitor sync android
```

### 7. Abrir el proyecto en Android Studio

```bash
ionic capacitor open android
```

Una vez abierto el proyecto, espera a que Android Studio termine la sincronización y ejecuta la aplicación en un emulador o dispositivo conectado.

## Generación del APK

Para generar el APK desde Android Studio:

1. Abre el proyecto Android de UrbanInspect.
2. Espera a que finalice la sincronización de Gradle.
3. Selecciona **Build → Build Bundle(s) / APK(s) → Build APK(s)**.
4. Espera a que termine la compilación.
5. Localiza el APK generado mediante la opción que muestra Android Studio.


## Dependencias principales

Las dependencias utilizadas incluyen:

- `@ionic/angular`: componentes de Ionic para Angular.
- `@angular/core`: funcionalidades principales de Angular.
- `@angular/common/http`: comunicación con servicios HTTP.
- `rxjs`: manejo de operaciones asíncronas.
- `@capacitor/core`: integración con Capacitor.
- `@capacitor/android`: plataforma Android de Capacitor.
- `@capacitor/preferences`: almacenamiento local.
- `@capacitor/geolocation`: acceso a la ubicación.
- `@capacitor/camera`: acceso a la cámara.

Las versiones exactas de las dependencias se encuentran definidas en `package.json` y `package-lock.json`. Para instalar las dependencias del proyecto, se recomienda utilizar `npm install`.

## Justificación de las decisiones técnicas

**Ionic y Angular:** se eligieron para construir una interfaz móvil organizada en páginas y componentes reutilizables. Angular permite separar la presentación de la lógica y los servicios que gestionan los datos.

**TypeScript:** permite definir interfaces para las incidencias y utilizar tipos de datos, facilitando la organización del código y la detección de errores durante el desarrollo.

**Capacitor:** permite integrar funcionalidades del dispositivo, como la cámara y la geolocalización, manteniendo el desarrollo dentro del ecosistema de Ionic.

**MockAPI:** se utiliza como backend remoto para almacenar y consultar incidencias sin necesidad de implementar un servidor propio para esta práctica.

**Preferences:** se utiliza para conservar información local, como las incidencias seleccionadas para seguimiento y los borradores del formulario. Esto permite mantener esos datos entre aperturas de la aplicación sin depender de la API remota.

**Servicios de Angular:** centralizan las operaciones de comunicación con la API y las funcionalidades específicas, evitando concentrar toda la lógica en las páginas.

**Paginación:** permite consultar los reportes en grupos pequeños y facilita la navegación por la lista de incidencias.

**Validaciones y manejo de errores:** permiten verificar los campos obligatorios, exigir una fotografía para las incidencias de prioridad alta y gestionar situaciones como la falta de permisos, errores de conexión o indisponibilidad del servicio climático.

**Integración con Android:** Capacitor y Android Studio permiten compilar y probar la aplicación en un entorno móvil, verificando funcionalidades que no pueden evaluarse completamente desde el navegador.

## Consideraciones

- Se requiere conexión a internet para consultar y registrar información en la API remota y para obtener información climática.
- La cámara y la geolocalización requieren los permisos correspondientes en el dispositivo.
- El seguimiento local se almacena en el dispositivo y es independiente de los registros remotos.


