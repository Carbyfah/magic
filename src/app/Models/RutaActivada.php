<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class RutaActivada extends Model
{
    use SoftDeletes;

    protected $table = 'ruta_activada';
    protected $primaryKey = 'ruta_activada_id';

    protected $fillable = [
        'ruta_activada_codigo',
        'ruta_activada_fecha_hora',
        'ruta_activada_situacion',
        'persona_id',
        'estado_id',
        'servicio_id',
        'ruta_id',
        'vehiculo_id'
    ];

    protected $casts = [
        'ruta_activada_situacion' => 'boolean',
        'ruta_activada_fecha_hora' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    protected $hidden = [
        'created_by',
        'updated_by',
        'deleted_at'
    ];

    /**
     * RELACIONES BÁSICAS
     */
    public function persona()
    {
        return $this->belongsTo(Persona::class, 'persona_id', 'persona_id');
    }

    public function estado()
    {
        return $this->belongsTo(Estado::class, 'estado_id', 'estado_id');
    }

    public function servicio()
    {
        return $this->belongsTo(Servicio::class, 'servicio_id', 'servicio_id');
    }

    public function ruta()
    {
        return $this->belongsTo(Ruta::class, 'ruta_id', 'ruta_id');
    }

    public function vehiculo()
    {
        return $this->belongsTo(Vehiculo::class, 'vehiculo_id', 'vehiculo_id');
    }

    public function reservas()
    {
        return $this->hasMany(Reserva::class, 'ruta_activada_id', 'ruta_activada_id');
    }

    /**
     * SCOPES SIMPLES
     */
    public function scopeActiva($query)
    {
        return $query->where('ruta_activada_situacion', 1);
    }

    public function scopeBuscar($query, $termino)
    {
        return $query->where('ruta_activada_codigo', 'like', "%{$termino}%")
            ->orWhereHas('servicio', function ($q) use ($termino) {
                $q->where('servicio_servicio', 'like', "%{$termino}%");
            })
            ->orWhereHas('ruta', function ($q) use ($termino) {
                $q->where('ruta_origen', 'like', "%{$termino}%")
                    ->orWhere('ruta_destino', 'like', "%{$termino}%");
            })
            ->orWhereHas('vehiculo', function ($q) use ($termino) {
                $q->where('vehiculo_placa', 'like', "%{$termino}%");
            });
    }

    public function scopePorPersona($query, $personaId)
    {
        return $query->where('persona_id', $personaId);
    }

    public function scopePorEstado($query, $estadoId)
    {
        return $query->where('estado_id', $estadoId);
    }

    public function scopePorServicio($query, $servicioId)
    {
        return $query->where('servicio_id', $servicioId);
    }

    public function scopePorVehiculo($query, $vehiculoId)
    {
        return $query->where('vehiculo_id', $vehiculoId);
    }

    public function scopePorFecha($query, $fecha)
    {
        return $query->whereDate('ruta_activada_fecha_hora', $fecha);
    }

    public function scopeEntreFechas($query, $fechaInicio, $fechaFin)
    {
        return $query->whereBetween('ruta_activada_fecha_hora', [$fechaInicio, $fechaFin]);
    }

    /**
     * GENERADOR DE CÓDIGO AUTOMÁTICO
     */
    public static function generarCodigo()
    {
        $ultimo = self::orderByDesc('ruta_activada_id')->first();
        $numero = $ultimo ? ((int) substr($ultimo->ruta_activada_codigo, -3)) + 1 : 1;
        return 'RA-' . str_pad($numero, 3, '0', STR_PAD_LEFT);
    }

    /**
     * MÉTODOS DE INSTANCIA BÁSICOS
     */
    public function getRutaCompletaAttribute()
    {
        if (!$this->ruta) return 'Ruta no definida';
        return $this->ruta->ruta_origen . ' → ' . $this->ruta->ruta_destino;
    }

    public function getConductorNombreAttribute()
    {
        return $this->persona ? ($this->persona->persona_nombres . ' ' . $this->persona->persona_apellidos) : 'Sin conductor';
    }

    public function getEstadoNombreAttribute()
    {
        return $this->estado ? $this->estado->estado_estado : 'Sin estado';
    }

    public function getVehiculoInfoAttribute()
    {
        if (!$this->vehiculo) return 'Sin vehículo';
        return $this->vehiculo->vehiculo_placa . ' (' . $this->vehiculo->vehiculo_marca . ')';
    }

    public function getFechaFormateadaAttribute()
    {
        return $this->ruta_activada_fecha_hora ? $this->ruta_activada_fecha_hora->format('d/m/Y H:i') : 'Sin fecha';
    }

    /**
     * AUTOMATIZACIÓN: Integración con TRIGGERS de la BD
     */
    public function getTotalPasajerosAttribute()
    {
        // Solo contar reservas que NO estén canceladas (abstracto)
        return $this->reservas()
            ->where('reserva_situacion', 1)
            ->whereHas('estado', function ($query) {
                // Excluir cualquier estado que contenga palabras de cancelación (abstracto)
                $query->where('estado_estado', 'NOT LIKE', '%cancelada%')
                    ->where('estado_estado', 'NOT LIKE', '%cancel%')
                    ->where('estado_estado', 'NOT LIKE', '%anulada%')
                    ->where('estado_estado', 'NOT LIKE', '%rechazada%')
                    ->where('estado_estado', 'NOT LIKE', '%eliminada%');
            })
            ->sum(\DB::raw('reserva_cantidad_adultos + IFNULL(reserva_cantidad_ninos, 0)'));
    }

    public function getCapacidadDisponibleAttribute()
    {
        $capacidadTotal = $this->vehiculo ? $this->vehiculo->vehiculo_capacidad : 0;
        return max(0, $capacidadTotal - $this->total_pasajeros);
    }

    public function getPorcentajeOcupacionAttribute()
    {
        $capacidadTotal = $this->vehiculo ? $this->vehiculo->vehiculo_capacidad : 1;
        if ($capacidadTotal == 0) return 0;
        return round(($this->total_pasajeros / $capacidadTotal) * 100, 2);
    }

    public function getStatusDisponibilidadAttribute()
    {
        // Replica la lógica de v_ocupacion_rutas (vista abstracta)
        if (!$this->vehiculo || $this->vehiculo->vehiculo_capacidad == 0) return 'SIN_VEHICULO';
        if ($this->total_pasajeros == 0) return 'DISPONIBLE';
        if ($this->total_pasajeros < ($this->vehiculo->vehiculo_capacidad * 0.8)) return 'DISPONIBLE';
        if ($this->total_pasajeros < $this->vehiculo->vehiculo_capacidad) return 'CASI_LLENO';
        return 'COMPLETO';
    }

    /**
     * VALIDACIONES DE NEGOCIO (Replica triggers abstractos)
     */
    public function puedeRecibirPasajeros($nuevos_pasajeros)
    {
        // Replica tr_reserva_control_capacidad
        if (!$this->vehiculo) return false;

        $capacidad = $this->vehiculo->vehiculo_capacidad;
        if ($capacidad <= 0) return true; // Sin límite si no hay capacidad definida

        return ($this->total_pasajeros + $nuevos_pasajeros) <= $capacidad;
    }

    public function necesitaAlertaCapacidad()
    {
        // Replica tr_reserva_alerta_capacidad
        return $this->porcentaje_ocupacion >= 80;
    }

    public function tieneReservas()
    {
        return $this->reservas && $this->reservas()->exists();
    }

    public function tieneReservasActivas()
    {
        return $this->reservas && $this->reservas()->where('reserva_situacion', 1)->exists();
    }

    public function puedeSerEliminada()
    {
        return !$this->tieneReservas();
    }

    /**
     * FUNCIONES DE AUTOMATIZACIÓN (Réplica de BD)
     */
    public static function asignarAutomaticamente($servicio_id, $fecha, $pasajeros)
    {
        // Replica fn_asignar_ruta_automatica
        return self::whereHas('vehiculo')
            ->where('servicio_id', $servicio_id)
            ->whereDate('ruta_activada_fecha_hora', $fecha)
            ->where('ruta_activada_situacion', 1)
            ->get()
            ->filter(function ($ruta) use ($pasajeros) {
                return $ruta->capacidad_disponible >= $pasajeros;
            })
            ->sortBy('capacidad_disponible')
            ->first();
    }

    public function calcularPrecioReserva($adultos, $ninos = 0, $es_agencia = false)
    {
        // Replica fn_calcular_precio_reserva
        if (!$this->servicio) return 0;

        $precio_adulto = $es_agencia && $this->servicio->servicio_precio_descuento > 0
            ? $this->servicio->servicio_precio_descuento
            : $this->servicio->servicio_precio_normal;

        if ($precio_adulto <= 0) return 0;

        $total_adultos = $adultos * $precio_adulto;
        $total_ninos = $ninos * ($precio_adulto * 0.5);

        return $total_adultos + $total_ninos;
    }

    public function verificarDisponibilidad($pasajeros)
    {
        // Replica fn_verificar_disponibilidad
        $capacidad = $this->vehiculo ? $this->vehiculo->vehiculo_capacidad : 0;
        $ocupado = $this->total_pasajeros;
        $disponible = max(0, $capacidad - $ocupado);

        return [
            'capacidad_total' => $capacidad,
            'ocupacion_actual' => $ocupado,
            'espacios_disponibles' => $disponible,
            'puede_acomodar' => $disponible >= $pasajeros,
            'porcentaje_ocupacion' => $this->porcentaje_ocupacion,
            'status' => $this->status_disponibilidad
        ];
    }

    /**
     * MÉTODOS DE FORMATO
     */
    public function formatearServicio()
    {
        if (!$this->servicio) return 'Sin servicio';
        return $this->servicio->servicio_servicio;
    }

    public function getCodigoPublico()
    {
        if (!$this->ruta_activada_codigo) return 'Sin código';

        $codigo = $this->ruta_activada_codigo;
        if (strlen($codigo) > 3) {
            $codigo = substr($codigo, 0, 2) . '***' . substr($codigo, -1);
        }

        return $codigo;
    }

    /**
     * VALIDACIÓN DE CÓDIGO ÚNICO
     */
    public function esCodigoUnico($codigo, $excepto_id = null)
    {
        $query = self::where('ruta_activada_codigo', $codigo);

        if ($excepto_id) {
            $query->where('ruta_activada_id', '!=', $excepto_id);
        }

        return !$query->exists();
    }

    /**
     * VALIDACIONES DE DISPONIBILIDAD
     */
    public static function esVehiculoDisponible($vehiculo_id, $fecha, $hora, $excepto_id = null)
    {
        $query = self::where('vehiculo_id', $vehiculo_id)
            ->whereDate('ruta_activada_fecha_hora', $fecha)
            ->whereTime('ruta_activada_fecha_hora', $hora)
            ->where('ruta_activada_situacion', 1);

        if ($excepto_id) {
            $query->where('ruta_activada_id', '!=', $excepto_id);
        }

        return !$query->exists();
    }

    /**
     * MÉTODOS DE GESTIÓN DE ESTADOS DE RUTA - Agregar al modelo RutaActivada
     */

    // Verificar estados de ruta
    public function estaActivada()
    {
        return $this->estado && strtolower($this->estado->estado_estado) === 'activada';
    }

    public function estaLlena()
    {
        return $this->estado && strtolower($this->estado->estado_estado) === 'llena';
    }

    public function estaEnEjecucion()
    {
        return $this->estado && strtolower($this->estado->estado_estado) === 'ejecucion';
    }

    public function estaCerrada()
    {
        return $this->estado && strtolower($this->estado->estado_estado) === 'cerrada';
    }

    /**
     * VALIDACIONES DE TRANSICIÓN DE ESTADOS
     */

    // Validar si puede recibir más reservas
    public function puedeRecibirReservas($nuevos_pasajeros = 1)
    {
        $validacion = [
            'puede_recibir' => false,
            'mensaje' => '',
            'tipo_notificacion' => 'error'
        ];

        if (!$this->estaActivada()) {
            $estadoActual = $this->estado_nombre;
            $validacion['mensaje'] = "No se pueden agregar reservas. Estado de ruta: {$estadoActual}. Solo se aceptan reservas en rutas activadas.";
            return $validacion;
        }

        if (!$this->vehiculo) {
            $validacion['mensaje'] = "Ruta sin vehículo asignado. No se pueden agregar reservas.";
            return $validacion;
        }

        $disponibilidad = $this->verificarDisponibilidad($nuevos_pasajeros);

        if (!$disponibilidad['puede_acomodar']) {
            $validacion['mensaje'] = "Capacidad excedida. Disponibles: {$disponibilidad['espacios_disponibles']} asientos. Solicitados: {$nuevos_pasajeros}.";
            $validacion['tipo_notificacion'] = 'warning';
            return $validacion;
        }

        $validacion['puede_recibir'] = true;
        $validacion['mensaje'] = "Ruta puede recibir {$nuevos_pasajeros} pasajeros más.";
        $validacion['tipo_notificacion'] = 'success';

        return $validacion;
    }

    // Validar si puede cerrarse la ruta
    public function puedecerrarse()
    {
        $validacion = [
            'puede_cerrar' => false,
            'mensaje' => '',
            'tipo_notificacion' => 'error'
        ];

        if ($this->estaCerrada()) {
            $validacion['mensaje'] = "La ruta ya está cerrada.";
            return $validacion;
        }

        if (!$this->vehiculo) {
            $validacion['mensaje'] = "Ruta sin vehículo asignado. No se puede cerrar.";
            return $validacion;
        }

        // Validar que el vehículo esté disponible (haya regresado)
        if ($this->vehiculo->estaAsignado()) {
            $validacion['mensaje'] = "No se puede cerrar la ruta. El vehículo {$this->vehiculo->vehiculo_placa} aún está asignado y no ha retornado a la empresa.";
            $validacion['tipo_notificacion'] = 'warning';
            return $validacion;
        }

        $validacion['puede_cerrar'] = true;
        $validacion['mensaje'] = "La ruta puede cerrarse. Vehículo ha retornado a la empresa.";
        $validacion['tipo_notificacion'] = 'success';

        return $validacion;
    }

    /**
     * CAMBIOS AUTOMÁTICOS DE ESTADO DE RUTA
     */

    // Verificar si debe cambiar a estado 'llena'
    public function verificarSiEstaLlena()
    {
        if (!$this->estaActivada() || !$this->vehiculo) {
            return false;
        }

        $ocupacion = $this->total_pasajeros;
        $capacidad = $this->vehiculo->vehiculo_capacidad;

        return $ocupacion >= $capacidad;
    }

    // Cambiar automáticamente a estado 'llena'
    public function cambiarALlena()
    {
        if (!$this->verificarSiEstaLlena()) {
            return [
                'success' => false,
                'mensaje' => 'La ruta no está llena aún.',
                'tipo_notificacion' => 'info'
            ];
        }

        $estadoLlena = \App\Models\Estado::where('estado_estado', 'llena')->first();

        if (!$estadoLlena) {
            return [
                'success' => false,
                'mensaje' => 'Error del sistema: Estado "llena" no encontrado.',
                'tipo_notificacion' => 'error'
            ];
        }

        $this->estado_id = $estadoLlena->estado_id;
        $this->save();

        return [
            'success' => true,
            'mensaje' => "Ruta {$this->ruta_activada_codigo} marcada como LLENA automáticamente.",
            'tipo_notificacion' => 'warning'
        ];
    }

    /**
     * SISTEMA DE NOTIFICACIONES INTELIGENTES
     */

    // Obtener todas las notificaciones relevantes para la ruta
    public function obtenerNotificacionesInteligentes()
    {
        $notificaciones = [];

        // Notificaciones de capacidad
        if ($this->estaActivada()) {
            $porcentaje = $this->porcentaje_ocupacion;

            if ($porcentaje >= 100) {
                $notificaciones[] = [
                    'tipo' => 'error',
                    'mensaje' => "RUTA LLENA: Capacidad al 100%. No se pueden agregar más reservas.",
                    'accion_requerida' => true,
                    'accion_sugerida' => 'cambiar_vehiculo_o_crear_nueva_ruta'
                ];
            } elseif ($porcentaje >= 90) {
                $espacios = $this->capacidad_disponible;
                $notificaciones[] = [
                    'tipo' => 'warning',
                    'mensaje' => "CASI LLENA: Solo {$espacios} asientos disponibles ({$porcentaje}% ocupación).",
                    'accion_requerida' => false
                ];
            } elseif ($porcentaje >= 80) {
                $espacios = $this->capacidad_disponible;
                $notificaciones[] = [
                    'tipo' => 'info',
                    'mensaje' => "Alta ocupación: {$espacios} asientos disponibles ({$porcentaje}% ocupación).",
                    'accion_requerida' => false
                ];
            }
        }

        // Notificaciones de estado de vehículo
        if ($this->vehiculo) {
            $notificacionesVehiculo = $this->vehiculo->obtenerNotificacionesEstado();
            $notificaciones = array_merge($notificaciones, $notificacionesVehiculo);
        }

        // Notificaciones de cierre de ruta
        if (!$this->estaCerrada()) {
            $validacionCierre = $this->puedecerrarse();
            if (!$validacionCierre['puede_cerrar'] && $validacionCierre['tipo_notificacion'] === 'warning') {
                $notificaciones[] = [
                    'tipo' => 'warning',
                    'mensaje' => $validacionCierre['mensaje'],
                    'accion_requerida' => true,
                    'accion_sugerida' => 'marcar_vehiculo_disponible'
                ];
            }
        }

        return $notificaciones;
    }

    /**
     * MÉTODOS DE FLUJO DE TRABAJO AUTOMATIZADO
     */

    // Proceso completo de validación antes de agregar reserva
    public function validarAntesDeAgregarReserva($adultos, $ninos = 0)
    {
        $total_pasajeros = $adultos + ($ninos ?? 0);

        // Verificar si puede recibir reservas
        $validacion = $this->puedeRecibirReservas($total_pasajeros);

        if (!$validacion['puede_recibir']) {
            return $validacion;
        }

        // Verificar si después de esta reserva quedará llena
        $nuevaOcupacion = $this->total_pasajeros + $total_pasajeros;
        $capacidad = $this->vehiculo->vehiculo_capacidad;

        if ($nuevaOcupacion >= $capacidad) {
            $validacion['advertencia'] = "Advertencia: Después de esta reserva, la ruta quedará LLENA.";
            $validacion['cambio_estado'] = 'llena';
        }

        return $validacion;
    }

    // Proceso completo después de agregar reserva
    public function procesarDespuesDeAgregarReserva()
    {
        $notificaciones = [];

        // Verificar si debe cambiar a estado 'llena'
        if ($this->verificarSiEstaLlena()) {
            $resultado = $this->cambiarALlena();
            $notificaciones[] = $resultado;
        }

        // Obtener notificaciones adicionales
        $notificacionesAdicionales = $this->obtenerNotificacionesInteligentes();
        $notificaciones = array_merge($notificaciones, $notificacionesAdicionales);

        return $notificaciones;
    }

    /**
     * OBTENER TOTAL DE RESERVAS ACTIVAS - MÉTODO ABSTRACTO
     */
    public function getTotalReservasActivasAttribute()
    {
        // Solo contar reservas que NO estén canceladas (abstracto)
        return $this->reservas()
            ->where('reserva_situacion', 1)
            ->whereHas('estado', function ($query) {
                $query->where('estado_estado', 'NOT LIKE', '%cancelada%')
                    ->where('estado_estado', 'NOT LIKE', '%cancel%')
                    ->where('estado_estado', 'NOT LIKE', '%anulada%')
                    ->where('estado_estado', 'NOT LIKE', '%rechazada%')
                    ->where('estado_estado', 'NOT LIKE', '%eliminada%');
            })
            ->count();
    }
}
