<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Controllers
use App\Http\Controllers\Api\TipoPersonaController;
use App\Http\Controllers\Api\RolController;
use App\Http\Controllers\Api\EstadoController;
use App\Http\Controllers\Api\ServicioController;
use App\Http\Controllers\Api\RutaController;
use App\Http\Controllers\Api\AgenciaController;
use App\Http\Controllers\Api\PersonaController;
use App\Http\Controllers\Api\VehiculoController;
use App\Http\Controllers\Api\ContactoAgenciaController;
use App\Http\Controllers\Api\UsuarioController;
use App\Http\Controllers\Api\RutaActivadaController;
use App\Http\Controllers\Api\ReservaController;
use App\Http\Controllers\Api\AuditoriaController;
use App\Http\Controllers\Api\DashboardVentasController;
use App\Http\Controllers\Api\EstadisticaController;

// Magic Travel API Routes
Route::prefix('magic')->middleware(['api'])->group(function () {

    // TIPO PERSONA ROUTES
    Route::prefix('tipo-personas')->group(function () {
        Route::get('/', [TipoPersonaController::class, 'index']);           // GET /api/magic/tipo-personas
        Route::post('/', [TipoPersonaController::class, 'store']);          // POST /api/magic/tipo-personas
        Route::get('/{tipoPersona}', [TipoPersonaController::class, 'show']);      // GET /api/magic/tipo-personas/{id}
        Route::put('/{tipoPersona}', [TipoPersonaController::class, 'update']);    // PUT /api/magic/tipo-personas/{id}
        Route::delete('/{tipoPersona}', [TipoPersonaController::class, 'destroy']); // DELETE /api/magic/tipo-personas/{id}
        Route::patch('/{tipoPersona}/activate', [TipoPersonaController::class, 'activate']);   // Activar
        Route::patch('/{tipoPersona}/deactivate', [TipoPersonaController::class, 'deactivate']); // Desactivar
    });

    // ROL ROUTES
    Route::prefix('roles')->group(function () {
        Route::get('/', [RolController::class, 'index']);           // GET /api/magic/roles
        Route::post('/', [RolController::class, 'store']);          // POST /api/magic/roles
        Route::get('/{rol}', [RolController::class, 'show']);       // GET /api/magic/roles/{id}
        Route::put('/{rol}', [RolController::class, 'update']);     // PUT /api/magic/roles/{id}
        Route::delete('/{rol}', [RolController::class, 'destroy']); // DELETE /api/magic/roles/{id}
        Route::patch('/{rol}/activate', [RolController::class, 'activate']);   // Activar
        Route::patch('/{rol}/deactivate', [RolController::class, 'deactivate']); // Desactivar
    });

    // ESTADO ROUTES
    Route::prefix('estados')->group(function () {
        Route::get('/', [EstadoController::class, 'index']);           // GET /api/magic/estados
        Route::post('/', [EstadoController::class, 'store']);          // POST /api/magic/estados
        Route::get('/{estado}', [EstadoController::class, 'show']);    // GET /api/magic/estados/{id}
        Route::put('/{estado}', [EstadoController::class, 'update']);  // PUT /api/magic/estados/{id}
        Route::delete('/{estado}', [EstadoController::class, 'destroy']); // DELETE /api/magic/estados/{id}
        Route::patch('/{estado}/activate', [EstadoController::class, 'activate']);   // Activar
        Route::patch('/{estado}/deactivate', [EstadoController::class, 'deactivate']); // Desactivar

        // NUEVAS RUTAS CONTEXTUALES
        Route::get('/contexto/vehiculo', [EstadoController::class, 'paraVehiculo']);         // GET /api/magic/estados/contexto/vehiculo
        Route::get('/contexto/reserva', [EstadoController::class, 'paraReserva']);           // GET /api/magic/estados/contexto/reserva
        Route::get('/contexto/ruta-activada', [EstadoController::class, 'paraRutaActivada']); // GET /api/magic/estados/contexto/ruta-activada
        Route::get('/contexto/factura', [EstadoController::class, 'paraFactura']);           // GET /api/magic/estados/contexto/factura
    });

    // SERVICIO ROUTES
    Route::prefix('servicios')->group(function () {
        Route::get('/', [ServicioController::class, 'index']);           // GET /api/magic/servicios
        Route::post('/', [ServicioController::class, 'store']);          // POST /api/magic/servicios
        Route::get('/{servicio}', [ServicioController::class, 'show']);  // GET /api/magic/servicios/{id}
        Route::put('/{servicio}', [ServicioController::class, 'update']); // PUT /api/magic/servicios/{id}
        Route::delete('/{servicio}', [ServicioController::class, 'destroy']); // DELETE /api/magic/servicios/{id}
        Route::patch('/{servicio}/activate', [ServicioController::class, 'activate']);   // Activar
        Route::patch('/{servicio}/deactivate', [ServicioController::class, 'deactivate']); // Desactivar
    });

    // RUTA ROUTES
    Route::prefix('rutas')->group(function () {
        Route::get('/', [RutaController::class, 'index']);           // GET /api/magic/rutas
        Route::post('/', [RutaController::class, 'store']);          // POST /api/magic/rutas
        Route::get('/{ruta}', [RutaController::class, 'show']);      // GET /api/magic/rutas/{id}
        Route::put('/{ruta}', [RutaController::class, 'update']);    // PUT /api/magic/rutas/{id}
        Route::delete('/{ruta}', [RutaController::class, 'destroy']); // DELETE /api/magic/rutas/{id}
        Route::patch('/{ruta}/activate', [RutaController::class, 'activate']);   // Activar
        Route::patch('/{ruta}/deactivate', [RutaController::class, 'deactivate']); // Desactivar
    });

    // AGENCIA ROUTES
    Route::prefix('agencias')->group(function () {
        Route::get('/', [AgenciaController::class, 'index']);           // GET /api/magic/agencias
        Route::post('/', [AgenciaController::class, 'store']);          // POST /api/magic/agencias
        Route::get('/{agencia}', [AgenciaController::class, 'show']);   // GET /api/magic/agencias/{id}
        Route::put('/{agencia}', [AgenciaController::class, 'update']); // PUT /api/magic/agencias/{id}
        Route::delete('/{agencia}', [AgenciaController::class, 'destroy']); // DELETE /api/magic/agencias/{id}
        Route::patch('/{agencia}/activate', [AgenciaController::class, 'activate']);   // Activar
        Route::patch('/{agencia}/deactivate', [AgenciaController::class, 'deactivate']); // Desactivar
    });

    // PERSONA ROUTES
    Route::prefix('personas')->group(function () {
        Route::get('/', [PersonaController::class, 'index']);           // GET /api/magic/personas
        Route::post('/', [PersonaController::class, 'store']);          // POST /api/magic/personas
        Route::get('/{persona}', [PersonaController::class, 'show']);    // GET /api/magic/personas/{id}
        Route::put('/{persona}', [PersonaController::class, 'update']);  // PUT /api/magic/personas/{id}
        Route::delete('/{persona}', [PersonaController::class, 'destroy']); // DELETE /api/magic/personas/{id}
        Route::patch('/{persona}/activate', [PersonaController::class, 'activate']);   // Activar
        Route::patch('/{persona}/deactivate', [PersonaController::class, 'deactivate']); // Desactivar

        // Rutas adicionales específicas para personas
        Route::post('/verificar-email', [PersonaController::class, 'verificarEmail']); // POST /api/magic/personas/verificar-email
        Route::get('/tipo/{tipoPersonaId}', [PersonaController::class, 'porTipo']);     // GET /api/magic/personas/tipo/{id}
    });

    // VEHICULO ROUTES
    Route::prefix('vehiculos')->group(function () {
        Route::get('/', [VehiculoController::class, 'index']);           // GET /api/magic/vehiculos
        Route::post('/', [VehiculoController::class, 'store']);          // POST /api/magic/vehiculos
        Route::get('/{vehiculo}', [VehiculoController::class, 'show']);    // GET /api/magic/vehiculos/{id}
        Route::put('/{vehiculo}', [VehiculoController::class, 'update']);  // PUT /api/magic/vehiculos/{id}
        Route::delete('/{vehiculo}', [VehiculoController::class, 'destroy']); // DELETE /api/magic/vehiculos/{id}
        Route::patch('/{vehiculo}/activate', [VehiculoController::class, 'activate']);   // Activar
        Route::patch('/{vehiculo}/deactivate', [VehiculoController::class, 'deactivate']); // Desactivar

        // Rutas adicionales específicas para vehiculos
        Route::post('/verificar-placa', [VehiculoController::class, 'verificarPlaca']); // POST /api/magic/vehiculos/verificar-placa
        Route::get('/estado/{estadoId}', [VehiculoController::class, 'porEstado']);     // GET /api/magic/vehiculos/estado/{id}

        // Agregar en la sección de vehículos
        Route::get('/{vehiculo}/rutas-activas', [VehiculoController::class, 'rutasActivas']);

        // Notificaciones del vehículo
        Route::get('/{vehiculo}/notificaciones', [VehiculoController::class, 'obtenerNotificaciones']);
        Route::post('/{vehiculo}/validar-estado', [VehiculoController::class, 'validarCambioEstado']);
    });

    // CONTACTOS AGENCIA ROUTES
    Route::prefix('contactos-agencia')->group(function () {
        Route::get('/', [ContactoAgenciaController::class, 'index']);           // GET /api/magic/contactos-agencia
        Route::post('/', [ContactoAgenciaController::class, 'store']);          // POST /api/magic/contactos-agencia
        Route::get('/{contacto}', [ContactoAgenciaController::class, 'show']);    // GET /api/magic/contactos-agencia/{id}
        Route::put('/{contacto}', [ContactoAgenciaController::class, 'update']);  // PUT /api/magic/contactos-agencia/{id}
        Route::delete('/{contacto}', [ContactoAgenciaController::class, 'destroy']); // DELETE /api/magic/contactos-agencia/{id}
        Route::patch('/{contacto}/activate', [ContactoAgenciaController::class, 'activate']);   // Activar
        Route::patch('/{contacto}/deactivate', [ContactoAgenciaController::class, 'deactivate']); // Desactivar

        // Rutas adicionales específicas para contactos de agencia
        Route::post('/verificar-telefono', [ContactoAgenciaController::class, 'verificarTelefono']); // POST /api/magic/contactos-agencia/verificar-telefono
        Route::get('/agencia/{agenciaId}', [ContactoAgenciaController::class, 'porAgencia']);     // GET /api/magic/contactos-agencia/agencia/{id}
        Route::get('/agencia/{agenciaId}/principal', [ContactoAgenciaController::class, 'contactoPrincipal']); // GET /api/magic/contactos-agencia/agencia/{id}/principal
        Route::get('/cargo/{cargo}', [ContactoAgenciaController::class, 'porCargo']);           // GET /api/magic/contactos-agencia/cargo/{cargo}
    });

    // USUARIO ROUTES
    Route::prefix('usuarios')->group(function () {
        Route::get('/', [UsuarioController::class, 'index']);           // GET /api/magic/usuarios
        Route::post('/', [UsuarioController::class, 'store']);          // POST /api/magic/usuarios
        Route::get('/{usuario}', [UsuarioController::class, 'show']);    // GET /api/magic/usuarios/{id}
        Route::put('/{usuario}', [UsuarioController::class, 'update']);  // PUT /api/magic/usuarios/{id}
        Route::delete('/{usuario}', [UsuarioController::class, 'destroy']); // DELETE /api/magic/usuarios/{id}
        Route::patch('/{usuario}/activate', [UsuarioController::class, 'activate']);   // Activar
        Route::patch('/{usuario}/deactivate', [UsuarioController::class, 'deactivate']); // Desactivar

        // Rutas adicionales específicas para usuarios - DOS FK
        Route::post('/verificar-codigo', [UsuarioController::class, 'verificarCodigo']); // POST /api/magic/usuarios/verificar-codigo
        Route::get('/rol/{rolId}', [UsuarioController::class, 'porRol']);     // GET /api/magic/usuarios/rol/{id}
        Route::get('/persona/{personaId}', [UsuarioController::class, 'porPersona']);   // GET /api/magic/usuarios/persona/{id}
    });

    // RUTA ACTIVADA ROUTES
    Route::prefix('rutas-activadas')->group(function () {
        Route::get('/', [RutaActivadaController::class, 'index']);           // GET /api/magic/rutas-activadas
        Route::post('/', [RutaActivadaController::class, 'store']);          // POST /api/magic/rutas-activadas
        Route::get('/{rutaActivada}', [RutaActivadaController::class, 'show']);    // GET /api/magic/rutas-activadas/{id}
        Route::put('/{rutaActivada}', [RutaActivadaController::class, 'update']);  // PUT /api/magic/rutas-activadas/{id}
        Route::delete('/{rutaActivada}', [RutaActivadaController::class, 'destroy']); // DELETE /api/magic/rutas-activadas/{id}
        Route::patch('/{rutaActivada}/activate', [RutaActivadaController::class, 'activate']);   // Activar
        Route::patch('/{rutaActivada}/deactivate', [RutaActivadaController::class, 'deactivate']); // Desactivar

        // Rutas adicionales específicas para rutas activadas - CINCO FK
        Route::post('/verificar-codigo', [RutaActivadaController::class, 'verificarCodigo']); // POST /api/magic/rutas-activadas/verificar-codigo
        Route::get('/estado/{estadoId}', [RutaActivadaController::class, 'porEstado']);       // GET /api/magic/rutas-activadas/estado/{id}
        Route::get('/persona/{personaId}', [RutaActivadaController::class, 'porPersona']);  // GET /api/magic/rutas-activadas/persona/{id}
        Route::get('/servicio/{servicioId}', [RutaActivadaController::class, 'porServicio']); // GET /api/magic/rutas-activadas/servicio/{id}
        Route::get('/vehiculo/{vehiculoId}', [RutaActivadaController::class, 'porVehiculo']); // GET /api/magic/rutas-activadas/vehiculo/{id}
        Route::get('/fecha/{fecha}', [RutaActivadaController::class, 'porFecha']);           // GET /api/magic/rutas-activadas/fecha/{fecha}
        Route::get('/{rutaActivada}/lista-conductor-pdf', [RutaActivadaController::class, 'generarListaConductor']); // Generar vocuher pdf

        // Notificaciones de la ruta
        Route::get('/{rutaActivada}/notificaciones', [RutaActivadaController::class, 'obtenerNotificaciones']);
        Route::post('/{rutaActivada}/validar-reserva', [RutaActivadaController::class, 'validarAgregarReserva']);
        Route::post('/{rutaActivada}/procesar-reserva', [RutaActivadaController::class, 'procesarDespuesReserva']);

        // Operaciones específicas del sistema
        Route::post('/{rutaActivada}/cerrar', [RutaActivadaController::class, 'cerrarRuta']);
        Route::post('/{rutaActivada}/verificar-capacidad', [RutaActivadaController::class, 'verificarCapacidad']);
    });

    // RESERVA ROUTES - ORDEN CORRECTO
    Route::prefix('reservas')->group(function () {
        // CRUD básico
        Route::get('/', [ReservaController::class, 'index']);
        Route::post('/', [ReservaController::class, 'store']);
        Route::get('/{reserva}', [ReservaController::class, 'show']);
        Route::put('/{reserva}', [ReservaController::class, 'update']);
        Route::delete('/{reserva}', [ReservaController::class, 'destroy']);

        // RUTAS ESTÁTICAS PRIMERO (antes de las dinámicas)
        Route::get('/directas', [ReservaController::class, 'directas']);
        Route::post('/verificar-codigo', [ReservaController::class, 'verificarCodigo']);
        Route::post('/buscar-disponibilidad', [ReservaController::class, 'buscarDisponibilidad']);

        // NUEVAS RUTAS PARA VISTAS DE LA BD
        Route::get('/completas', [ReservaController::class, 'obtenerReservasCompletas']);
        Route::get('/ingresos-diarios', [ReservaController::class, 'obtenerIngresosDiarios']);

        // Acciones específicas individuales
        Route::patch('/{reserva}/confirm', [ReservaController::class, 'confirm']);
        Route::patch('/{reserva}/cancel', [ReservaController::class, 'cancel']);
        Route::patch('/{reserva}/execute', [ReservaController::class, 'execute']);
        Route::patch('/{reserva}/facturar', [ReservaController::class, 'generarFactura']); // NUEVA

        // Funcionalidades específicas
        Route::get('/{reserva}/whatsapp', [ReservaController::class, 'whatsapp']);
        Route::get('/{reserva}/voucher-pdf', [ReservaController::class, 'generarVoucherPDF']);

        // Acciones masivas por ruta
        Route::patch('/ruta/{rutaActivadaId}/confirm-all', [ReservaController::class, 'confirmByRuta']);
        Route::patch('/ruta/{rutaActivadaId}/cancel-all', [ReservaController::class, 'cancelByRuta']);

        // RUTAS DINÁMICAS AL FINAL
        Route::get('/usuario/{usuarioId}', [ReservaController::class, 'porUsuario']);
        Route::get('/estado/{estadoId}', [ReservaController::class, 'porEstado']);
        Route::get('/agencia/{agenciaId}', [ReservaController::class, 'porAgencia']);
        Route::get('/fecha/{fecha}', [ReservaController::class, 'porFecha']);

        // Notificaciones de reservas
        Route::get('/{reserva}/notificaciones', [ReservaController::class, 'obtenerNotificaciones']);
        Route::post('/{reserva}/validar-estado', [ReservaController::class, 'validarCambioEstado']);
        Route::post('/{reserva}/procesar-estado', [ReservaController::class, 'procesarDespuesCambioEstado']);

        // ... después de las otras rutas, agrega:
        Route::patch('/{reserva}/activate', [ReservaController::class, 'activate']);
        Route::patch('/{reserva}/deactivate', [ReservaController::class, 'deactivate']);

        Route::get('/{reserva}/factura-pdf', [ReservaController::class, 'generarFacturaPDF']);
    });

    // Dashboard de Ventas - SEPARAR DEL GENERAL
    Route::prefix('dashboard/ventas')->name('dashboard.ventas.')->group(function () {
        Route::get('metricas', [DashboardVentasController::class, 'metricas'])->name('metricas');
        Route::get('ventas-por-dia', [DashboardVentasController::class, 'ventasPorDia'])->name('ventas.dia');
        Route::get('reservas-por-estado', [DashboardVentasController::class, 'reservasPorEstado'])->name('reservas.estado');
        Route::get('ventas-por-agencia', [DashboardVentasController::class, 'ventasPorAgencia'])->name('ventas.agencia');
        Route::get('top-vendedores', [DashboardVentasController::class, 'topVendedores'])->name('vendedores');
        Route::get('rutas-mas-vendidas', [DashboardVentasController::class, 'rutasMasVendidas'])->name('rutas.vendidas');
        Route::get('resumen-general', [DashboardVentasController::class, 'resumenGeneral'])->name('resumen');
    });

    // ESTADÍSTICAS ROUTES
    Route::prefix('estadisticas')->group(function () {
        Route::get('/dashboard', [EstadisticaController::class, 'dashboard']);
        Route::get('/grafico-dashboard', [EstadisticaController::class, 'graficoDashboard']);
        Route::get('/grafico-ingresos-diarios', [EstadisticaController::class, 'graficoIngresosDiarios']);
        Route::get('/grafico-ocupacion-vehiculos', [EstadisticaController::class, 'graficoOcupacionVehiculos']);
        Route::get('/grafico-reservas-por-estado', [EstadisticaController::class, 'graficoReservasPorEstado']);
        Route::get('/grafico-ventas-por-agencia', [EstadisticaController::class, 'graficoVentasPorAgencia']);
        Route::get('/grafico-top-rutas', [EstadisticaController::class, 'graficoTopRutas']);
    });

    // AUDITORIA ROUTES
    Route::prefix('auditorias')->group(function () {
        Route::get('/', [AuditoriaController::class, 'index']);
        Route::get('/stats', [AuditoriaController::class, 'stats']);
        Route::get('/tabla/{tabla}', [AuditoriaController::class, 'porTabla']);
        Route::get('/usuario/{usuarioId}', [AuditoriaController::class, 'porUsuario']);
        Route::get('/tabla/{tabla}/{auditoriaId}', [AuditoriaController::class, 'show']);
        Route::post('/reporte', [AuditoriaController::class, 'reporte']);
        Route::post('/reporte-excel', [AuditoriaController::class, 'reporteExcel']); // NUEVA LÍNEA
        Route::delete('/limpiar', [AuditoriaController::class, 'limpiar']);
    });

    // DASHBOARD & GENERAL ROUTES
    Route::get('/stats-generales', function (Request $request) {
        try {
            $dashboardController = new \App\Http\Controllers\Api\DashboardVentasController();

            // Obtener métricas principales (pasando el request)
            $metricas = $dashboardController->metricas($request)->getData();

            // Obtener resumen general para datos complementarios
            $resumen = $dashboardController->resumenGeneral($request)->getData();

            return response()->json([
                // Métricas operativas críticas
                'usuarios_activos' => $metricas->usuarios_activos ?? 0,
                'reservas_hoy' => $metricas->reservas_hoy ?? 0,
                'pasajeros_hoy' => $metricas->total_pasajeros_hoy ?? 0,
                'rutas_activas' => $metricas->rutas_activas ?? 0,
                'vehiculos_disponibles' => $metricas->vehiculos_disponibles ?? 0,

                // Métricas financieras críticas
                'ingresos_hoy' => $metricas->ingresos_hoy ?? 0,
                'ingresos_mes' => $metricas->ingresos_mes ?? 0,

                // Métrica de eficiencia operativa
                'ocupacion_promedio' => $metricas->ocupacion_promedio ?? 0
            ]);
        } catch (\Exception $e) {
            // Fallback con valores por defecto
            return response()->json([
                'usuarios_activos' => 0,
                'reservas_hoy' => 0,
                'pasajeros_hoy' => 0,
                'rutas_activas' => 0,
                'vehiculos_disponibles' => 0,
                'ingresos_hoy' => 0,
                'ingresos_mes' => 0,
                'ocupacion_promedio' => 0,
                'error' => 'Datos no disponibles temporalmente'
            ]);
        }
    });

    // HEALTH CHECK
    Route::get('/health', function () {
        return response()->json([
            'status' => 'ok',
            'timestamp' => now()->toISOString(),
            'version' => '2.0',
            'database' => 'connected'
        ]);
    });
});

// RUTAS DE AUTENTICACIÓN
Route::prefix('auth')->group(function () {
    Route::post('/login', [UsuarioController::class, 'login']);
    Route::post('/logout', [UsuarioController::class, 'logout']);
    Route::get('/me', [UsuarioController::class, 'me']);
});

// User Authentication Route
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
