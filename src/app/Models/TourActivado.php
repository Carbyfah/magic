<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TourActivado extends Model
{
    use SoftDeletes;

    protected $table = 'tour_activado';
    protected $primaryKey = 'tour_activado_id';

    protected $fillable = [
        'tour_activado_codigo',
        'tour_activado_fecha_hora',
        'tour_activado_descripcion',
        'tour_activado_punto_encuentro',
        'tour_activado_duracion_horas',
        'tour_activado_situacion',
        'persona_id',
        'servicio_id'
    ];

    protected $casts = [
        'tour_activado_situacion' => 'boolean',
        'tour_activado_fecha_hora' => 'datetime',
        'tour_activado_duracion_horas' => 'decimal:2',
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

    public function servicio()
    {
        return $this->belongsTo(Servicio::class, 'servicio_id', 'servicio_id');
    }

    public function reservas()
    {
        return $this->hasMany(Reserva::class, 'tour_activado_id', 'tour_activado_id');
    }

    /**
     * SCOPES SIMPLES
     */
    public function scopeActiva($query)
    {
        return $query->where('tour_activado_situacion', 1);
    }

    public function scopeBuscar($query, $termino)
    {
        return $query->where('tour_activado_codigo', 'like', "%{$termino}%")
            ->orWhere('tour_activado_descripcion', 'like', "%{$termino}%")
            ->orWhere('tour_activado_punto_encuentro', 'like', "%{$termino}%")
            ->orWhereHas('servicio', function ($q) use ($termino) {
                $q->where('servicio_servicio', 'like', "%{$termino}%");
            })
            ->orWhereHas('persona', function ($q) use ($termino) {
                $q->where('persona_nombres', 'like', "%{$termino}%")
                    ->orWhere('persona_apellidos', 'like', "%{$termino}%");
            });
    }

    public function scopePorPersona($query, $personaId)
    {
        return $query->where('persona_id', $personaId);
    }

    public function scopePorServicio($query, $servicioId)
    {
        return $query->where('servicio_id', $servicioId);
    }

    public function scopePorFecha($query, $fecha)
    {
        return $query->whereDate('tour_activado_fecha_hora', $fecha);
    }

    public function scopeEntreFechas($query, $fechaInicio, $fechaFin)
    {
        return $query->whereBetween('tour_activado_fecha_hora', [$fechaInicio, $fechaFin]);
    }

    public function scopeConGuia($query)
    {
        return $query->whereNotNull('persona_id');
    }

    public function scopeSinGuia($query)
    {
        return $query->whereNull('persona_id');
    }

    /**
     * GENERADOR DE CÓDIGO AUTOMÁTICO
     */
    public static function generarCodigo()
    {
        $ultimo = self::orderByDesc('tour_activado_id')->first();
        $numero = $ultimo ? ((int) substr($ultimo->tour_activado_codigo, -3)) + 1 : 1;
        return 'TA-' . str_pad($numero, 3, '0', STR_PAD_LEFT);
    }

    /**
     * MÉTODOS DE INSTANCIA BÁSICOS
     */
    public function getTourCompletaAttribute()
    {
        return $this->tour_activado_descripcion ?: 'Tour sin descripción';
    }

    public function getGuiaNombreAttribute()
    {
        return $this->persona
            ? ($this->persona->persona_nombres . ' ' . $this->persona->persona_apellidos)
            : 'Guía externo';
    }

    public function getPuntoEncuentroInfoAttribute()
    {
        return $this->tour_activado_punto_encuentro ?: 'Punto de encuentro por definir';
    }

    public function getFechaFormateadaAttribute()
    {
        return $this->tour_activado_fecha_hora ? $this->tour_activado_fecha_hora->format('d/m/Y H:i') : 'Sin fecha';
    }

    public function getDuracionFormateadaAttribute()
    {
        if (!$this->tour_activado_duracion_horas) return 'Duración no especificada';

        $horas = floor($this->tour_activado_duracion_horas);
        $minutos = ($this->tour_activado_duracion_horas - $horas) * 60;

        if ($minutos > 0) {
            return $horas . 'h ' . round($minutos) . 'min';
        }

        return $horas . 'h';
    }

    /**
     * AUTOMATIZACIÓN: Tours no tienen límite de capacidad
     */
    public function getTotalPasajerosAttribute()
    {
        return $this->reservas()
            ->where('reserva_situacion', 1)
            ->sum(\DB::raw('COALESCE(reserva_cantidad_adultos, 0) + COALESCE(reserva_cantidad_ninos, 0)'));
    }

    public function getTotalReservasActivasAttribute()
    {
        return $this->reservas()
            ->where('reserva_situacion', 1)
            ->count();
    }

    // Tours no tienen límite de capacidad
    public function getCapacidadDisponibleAttribute()
    {
        return 'Sin límite';
    }

    public function getPorcentajeOcupacionAttribute()
    {
        return 0; // Tours no tienen porcentaje porque no hay límite
    }

    public function getStatusDisponibilidadAttribute()
    {
        return 'SIEMPRE_DISPONIBLE';
    }

    /**
     * VALIDACIONES DE NEGOCIO - Tours siempre pueden recibir pasajeros
     */
    public function puedeRecibirPasajeros($nuevos_pasajeros)
    {
        // Tours no tienen límite de capacidad
        return true;
    }

    public function necesitaAlertaCapacidad()
    {
        // Tours no necesitan alerta de capacidad
        return false;
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
     * FUNCIONES DE AUTOMATIZACIÓN
     */
    public static function buscarDisponible($servicio_id, $fecha)
    {
        // Tours siempre están disponibles si están activos
        return self::where('servicio_id', $servicio_id)
            ->whereDate('tour_activado_fecha_hora', $fecha)
            ->where('tour_activado_situacion', 1)
            ->orderBy('tour_activado_fecha_hora')
            ->first();
    }

    public function calcularPrecioReserva($adultos, $ninos = 0, $es_agencia = false)
    {
        if (!$this->servicio) return 0;

        $precio_adulto = $es_agencia && $this->servicio->servicio_precio_descuento > 0
            ? $this->servicio->servicio_precio_descuento
            : $this->servicio->servicio_precio_normal;

        if ($precio_adulto <= 0) return 0;

        $total_adultos = $adultos * $precio_adulto;
        $total_ninos = $ninos * ($precio_adulto * 0.5);

        return $total_adultos + $total_ninos;
    }

    public function verificarDisponibilidad($pasajeros = null)
    {
        // Tours siempre están disponibles
        return [
            'tipo' => 'tour',
            'total_reservas' => $this->total_reservas_activas,
            'sin_limite_capacidad' => true,
            'siempre_disponible' => true,
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
        if (!$this->tour_activado_codigo) return 'Sin código';

        $codigo = $this->tour_activado_codigo;
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
        $query = self::where('tour_activado_codigo', $codigo);

        if ($excepto_id) {
            $query->where('tour_activado_id', '!=', $excepto_id);
        }

        return !$query->exists();
    }

    /**
     * VALIDACIONES DE DISPONIBILIDAD - Guías y fechas
     */
    public static function esGuiaDisponible($persona_id, $fecha, $hora, $excepto_id = null)
    {
        if (!$persona_id) return true; // Guía externo

        $query = self::where('persona_id', $persona_id)
            ->whereDate('tour_activado_fecha_hora', $fecha)
            ->whereTime('tour_activado_fecha_hora', $hora)
            ->where('tour_activado_situacion', 1);

        if ($excepto_id) {
            $query->where('tour_activado_id', '!=', $excepto_id);
        }

        return !$query->exists();
    }


    /**
     * VALIDACIONES DE TRANSICIÓN DE ESTADOS
     */
    public function puedeRecibirReservas($nuevos_pasajeros = 1)
    {
        // Tours siempre pueden recibir pasajeros si están activos
        $validacion = [
            'puede_recibir' => $this->tour_activado_situacion ? true : false,
            'mensaje' => $this->tour_activado_situacion
                ? "Tour puede recibir {$nuevos_pasajeros} pasajeros más. Sin límite de capacidad."
                : "Tour inactivo. No se pueden agregar reservas.",
            'tipo_notificacion' => $this->tour_activado_situacion ? 'success' : 'error'
        ];

        return $validacion;
    }

    public function puedeCerrarse()
    {
        $validacion = [
            'puede_cerrar' => $this->tour_activado_situacion ? true : false,
            'mensaje' => $this->tour_activado_situacion ? "El tour puede cerrarse." : "Tour inactivo.",
            'tipo_notificacion' => $this->tour_activado_situacion ? 'success' : 'error'
        ];

        return $validacion;
    }

    /**
     * SISTEMA DE NOTIFICACIONES INTELIGENTES
     */
    public function obtenerNotificacionesInteligentes()
    {
        $notificaciones = [];

        // Notificaciones sobre guía
        if (!$this->persona_id) {
            $notificaciones[] = [
                'tipo' => 'warning',
                'mensaje' => "Tour sin guía asignado. Se recomienda asignar un guía interno o confirmar guía externo.",
                'accion_requerida' => false
            ];
        }

        // Notificaciones sobre descripción
        if (!$this->tour_activado_descripcion) {
            $notificaciones[] = [
                'tipo' => 'info',
                'mensaje' => "Tour sin descripción. Se recomienda agregar detalles para mejor experiencia del cliente.",
                'accion_requerida' => false
            ];
        }

        // Notificaciones sobre punto de encuentro
        if (!$this->tour_activado_punto_encuentro) {
            $notificaciones[] = [
                'tipo' => 'warning',
                'mensaje' => "Punto de encuentro no definido. Importante para coordinación con clientes.",
                'accion_requerida' => true,
                'accion_sugerida' => 'definir_punto_encuentro'
            ];
        }

        // Notificaciones sobre duración
        if (!$this->tour_activado_duracion_horas) {
            $notificaciones[] = [
                'tipo' => 'info',
                'mensaje' => "Duración del tour no especificada. Recomendable para planificación del cliente.",
                'accion_requerida' => false
            ];
        }

        // Notificaciones sobre reservas
        if ($this->total_reservas_activas > 0) {
            $total_pasajeros = $this->total_pasajeros;
            $notificaciones[] = [
                'tipo' => 'success',
                'mensaje' => "Tour con {$this->total_reservas_activas} reservas activas ({$total_pasajeros} pasajeros).",
                'accion_requerida' => false
            ];
        }

        return $notificaciones;
    }

    /**
     * MÉTODOS DE FLUJO DE TRABAJO AUTOMATIZADO
     */
    public function validarAntesDeAgregarReserva($adultos, $ninos = 0)
    {
        $total_pasajeros = $adultos + ($ninos ?? 0);

        $validacion = $this->puedeRecibirReservas($total_pasajeros);

        if ($validacion['puede_recibir']) {
            $validacion['info_adicional'] = "Los tours no tienen límite de capacidad. Esta reserva será aceptada automáticamente.";
        }

        return $validacion;
    }

    public function procesarDespuesDeAgregarReserva()
    {
        $notificaciones = [];

        // Agregar notificación de nueva reserva
        $notificaciones[] = [
            'tipo' => 'success',
            'mensaje' => "Nueva reserva agregada al tour. Total actual: {$this->total_reservas_activas} reservas ({$this->total_pasajeros} pasajeros).",
            'tipo_notificacion' => 'success'
        ];

        // Obtener notificaciones adicionales
        $notificacionesAdicionales = $this->obtenerNotificacionesInteligentes();
        $notificaciones = array_merge($notificaciones, $notificacionesAdicionales);

        return $notificaciones;
    }

    /**
     * MÉTODOS ESPECÍFICOS PARA TOURS
     */
    public function tieneGuiaAsignado()
    {
        return !is_null($this->persona_id);
    }

    public function esGuiaExterno()
    {
        return is_null($this->persona_id);
    }

    public function tieneDescripcionCompleta()
    {
        return !empty($this->tour_activado_descripcion) &&
            !empty($this->tour_activado_punto_encuentro) &&
            !empty($this->tour_activado_duracion_horas);
    }

    public function obtenerResumenTour()
    {
        return [
            'codigo' => $this->tour_activado_codigo,
            'descripcion' => $this->tour_completa,
            'fecha_hora' => $this->fecha_formateada,
            'punto_encuentro' => $this->punto_encuentro_info,
            'duracion' => $this->duracion_formateada,
            'guia' => $this->guia_nombre,
            'tipo_guia' => $this->tieneGuiaAsignado() ? 'interno' : 'externo',
            'total_reservas' => $this->total_reservas_activas,
            'total_pasajeros' => $this->total_pasajeros,
            'estado' => $this->tour_activado_situacion ? 'Activo' : 'Inactivo',
            'servicio' => $this->formatearServicio()
        ];
    }

    /**
     * INTEGRACIÓN CON FUNCIONES DE BASE DE DATOS
     */
    public static function buscarTourDisponible($servicio_id, $fecha)
    {
        // Replica fn_buscar_tour_disponible de la BD
        return self::where('servicio_id', $servicio_id)
            ->whereDate('tour_activado_fecha_hora', $fecha)
            ->where('tour_activado_situacion', 1)
            ->orderBy('tour_activado_fecha_hora')
            ->first();
    }

    public function verificarDisponibilidadTour()
    {
        // Replica fn_verificar_disponibilidad_tour de la BD
        return [
            'tipo' => 'tour',
            'total_reservas' => $this->total_reservas_activas,
            'sin_limite_capacidad' => true,
            'siempre_disponible' => true
        ];
    }
}
