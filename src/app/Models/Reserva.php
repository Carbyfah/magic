<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;

class Reserva extends Model
{
    use SoftDeletes;

    protected $table = 'reserva';
    protected $primaryKey = 'reserva_id';

    protected $fillable = [
        'reserva_codigo',
        'reserva_nombres_cliente',
        'reserva_apellidos_cliente',
        'reserva_cliente_nit',
        'reserva_telefono_cliente',
        'reserva_email_cliente',
        'reserva_cantidad_adultos',
        'reserva_cantidad_ninos',
        'reserva_direccion_abordaje',
        'reserva_notas',
        'reserva_monto',
        'reserva_situacion',
        'usuario_id',
        'estado_id',
        'agencia_id',
        'ruta_activada_id',
        'tour_activado_id'  // NUEVO: Soporte para tours
    ];

    protected $casts = [
        'reserva_situacion' => 'boolean',
        'reserva_cliente_nit' => 'string',
        'reserva_telefono_cliente' => 'integer',
        'reserva_cantidad_adultos' => 'integer',
        'reserva_cantidad_ninos' => 'integer',
        'reserva_monto' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    protected $hidden = [
        'created_by',
        'updated_by',
        'deleted_at'
    ];

    /**
     * RELACIONES BÁSICAS - Sincronizadas con nueva DB
     */
    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'usuario_id', 'usuario_id');
    }

    public function estado()
    {
        return $this->belongsTo(Estado::class, 'estado_id', 'estado_id');
    }

    public function agencia()
    {
        return $this->belongsTo(Agencia::class, 'agencia_id', 'agencia_id');
    }

    public function rutaActivada()
    {
        return $this->belongsTo(RutaActivada::class, 'ruta_activada_id', 'ruta_activada_id');
    }

    // NUEVA: Relación con tours
    public function tourActivado()
    {
        return $this->belongsTo(TourActivado::class, 'tour_activado_id', 'tour_activado_id');
    }

    /**
     * SCOPES SIMPLES - Actualizados para nueva DB
     */
    public function scopeActiva($query)
    {
        return $query->where('reserva_situacion', 1);
    }

    public function scopeBuscar($query, $termino)
    {
        return $query->where('reserva_codigo', 'like', "%{$termino}%")
            ->orWhere('reserva_nombres_cliente', 'like', "%{$termino}%")
            ->orWhere('reserva_apellidos_cliente', 'like', "%{$termino}%")
            ->orWhere('reserva_telefono_cliente', 'like', "%{$termino}%")
            ->orWhere('reserva_email_cliente', 'like', "%{$termino}%")
            ->orWhereHas('agencia', function ($q) use ($termino) {
                $q->where('agencia_razon_social', 'like', "%{$termino}%");
            })
            ->orWhereHas('rutaActivada.ruta', function ($q) use ($termino) {
                $q->where('ruta_origen', 'like', "%{$termino}%")
                    ->orWhere('ruta_destino', 'like', "%{$termino}%");
            })
            // NUEVO: Búsqueda en tours
            ->orWhereHas('tourActivado', function ($q) use ($termino) {
                $q->where('tour_activado_descripcion', 'like', "%{$termino}%")
                    ->orWhere('tour_activado_punto_encuentro', 'like', "%{$termino}%");
            });
    }

    public function scopePorUsuario($query, $usuarioId)
    {
        return $query->where('usuario_id', $usuarioId);
    }

    public function scopePorEstado($query, $estadoId)
    {
        return $query->where('estado_id', $estadoId);
    }

    public function scopePorAgencia($query, $agenciaId)
    {
        return $query->where('agencia_id', $agenciaId);
    }

    public function scopePorRutaActivada($query, $rutaActivadaId)
    {
        return $query->where('ruta_activada_id', $rutaActivadaId);
    }

    // NUEVO: Scope para tours
    public function scopePorTourActivado($query, $tourActivadoId)
    {
        return $query->where('tour_activado_id', $tourActivadoId);
    }

    public function scopePorFecha($query, $fecha)
    {
        return $query->where(function ($q) use ($fecha) {
            $q->whereHas('rutaActivada', function ($subQ) use ($fecha) {
                $subQ->whereDate('ruta_activada_fecha_hora', $fecha);
            })
                // NUEVO: También buscar en tours
                ->orWhereHas('tourActivado', function ($subQ) use ($fecha) {
                    $subQ->whereDate('tour_activado_fecha_hora', $fecha);
                });
        });
    }

    public function scopeEntreFechas($query, $fechaInicio, $fechaFin)
    {
        return $query->where(function ($q) use ($fechaInicio, $fechaFin) {
            $q->whereHas('rutaActivada', function ($subQ) use ($fechaInicio, $fechaFin) {
                $subQ->whereBetween(DB::raw('DATE(ruta_activada_fecha_hora)'), [$fechaInicio, $fechaFin]);
            })
                // NUEVO: También buscar en tours
                ->orWhereHas('tourActivado', function ($subQ) use ($fechaInicio, $fechaFin) {
                    $subQ->whereBetween(DB::raw('DATE(tour_activado_fecha_hora)'), [$fechaInicio, $fechaFin]);
                });
        });
    }

    public function scopeDirectas($query)
    {
        return $query->whereNull('agencia_id');
    }

    public function scopePorAgencias($query)
    {
        return $query->whereNotNull('agencia_id');
    }

    // NUEVOS: Scopes para tipo de servicio
    public function scopeSoloRutas($query)
    {
        return $query->whereNotNull('ruta_activada_id')->whereNull('tour_activado_id');
    }

    public function scopeSoloTours($query)
    {
        return $query->whereNotNull('tour_activado_id')->whereNull('ruta_activada_id');
    }

    /**
     * GENERADOR DE CÓDIGO AUTOMÁTICO
     */
    public static function generarCodigo()
    {
        $ultimo = self::orderByDesc('reserva_id')->first();
        $numero = $ultimo ? ((int) substr($ultimo->reserva_codigo, -4)) + 1 : 1;
        return 'RES-' . str_pad($numero, 4, '0', STR_PAD_LEFT);
    }

    /**
     * ATRIBUTOS CALCULADOS - Sincronizados con RutaActivada y Tours
     */
    public function getNombreCompletoClienteAttribute()
    {
        return trim($this->reserva_nombres_cliente . ' ' . $this->reserva_apellidos_cliente);
    }

    public function getVendedorNombreAttribute()
    {
        return $this->usuario && $this->usuario->persona
            ? trim($this->usuario->persona->persona_nombres . ' ' . $this->usuario->persona->persona_apellidos)
            : 'Sin vendedor';
    }

    public function getEstadoNombreAttribute()
    {
        return $this->estado ? $this->estado->estado_estado : 'Sin estado';
    }

    public function getAgenciaNombreAttribute()
    {
        return $this->agencia ? $this->agencia->agencia_razon_social : 'Venta directa';
    }

    // ACTUALIZADO: Funciona para rutas y tours
    public function getRutaCompletaAttribute()
    {
        if ($this->rutaActivada) {
            return $this->rutaActivada->ruta_completa;
        }

        if ($this->tourActivado) {
            return $this->tourActivado->tour_activado_descripcion ?: 'Tour';
        }

        return 'Servicio no definido';
    }

    // ACTUALIZADO: Funciona para rutas y tours
    public function getFechaViajeAttribute()
    {
        if ($this->rutaActivada && $this->rutaActivada->ruta_activada_fecha_hora) {
            return $this->rutaActivada->ruta_activada_fecha_hora->format('d/m/Y');
        }

        if ($this->tourActivado && $this->tourActivado->tour_activado_fecha_hora) {
            return $this->tourActivado->tour_activado_fecha_hora->format('d/m/Y');
        }

        return 'Sin fecha';
    }

    // ACTUALIZADO: Funciona para rutas y tours
    public function getHoraViajeAttribute()
    {
        if ($this->rutaActivada && $this->rutaActivada->ruta_activada_fecha_hora) {
            return $this->rutaActivada->ruta_activada_fecha_hora->format('H:i');
        }

        if ($this->tourActivado && $this->tourActivado->tour_activado_fecha_hora) {
            return $this->tourActivado->tour_activado_fecha_hora->format('H:i');
        }

        return 'Sin hora';
    }

    // ACTUALIZADO: Funciona para rutas y tours
    public function getFechaHoraViajeAttribute()
    {
        if ($this->rutaActivada) {
            return $this->rutaActivada->fecha_formateada;
        }

        if ($this->tourActivado) {
            return $this->tourActivado->tour_activado_fecha_hora
                ? $this->tourActivado->tour_activado_fecha_hora->format('d/m/Y H:i')
                : 'Sin fecha/hora';
        }

        return 'Sin fecha/hora';
    }

    // NUEVO: Identificar tipo de servicio
    public function getTipoServicioAttribute()
    {
        if ($this->rutaActivada) return 'RUTA';
        if ($this->tourActivado) return 'TOUR';
        return 'INDEFINIDO';
    }

    /**
     * TIPOS DE VENTA - Lógica de negocio
     */
    public function getEsVentaDirectaAttribute()
    {
        return is_null($this->agencia_id);
    }

    public function getEsVentaAgenciaAttribute()
    {
        return !is_null($this->agencia_id);
    }

    public function getTipoVentaAttribute()
    {
        return $this->es_venta_directa ? 'DIRECTA' : 'AGENCIA';
    }

    /**
     * TOTAL PASAJEROS - Calculado dinámicamente (sin campo en BD)
     */
    public function getTotalPasajerosAttribute()
    {
        return ($this->reserva_cantidad_adultos ?? 0) + ($this->reserva_cantidad_ninos ?? 0);
    }

    /**
     * VALIDACIONES DE NEGOCIO - Actualizadas según nueva DB
     */
    public function puedeSerModificada()
    {
        if (!$this->estado) return true;

        $estados_bloqueados = ['ejecutada', 'facturada', 'cancelada'];
        return !in_array(strtolower($this->estado->estado_estado), $estados_bloqueados);
    }

    public function puedeSerCancelada()
    {
        if (!$this->estado) return false;

        $estados_cancelables = ['pendiente', 'confirmada'];
        return in_array(strtolower($this->estado->estado_estado), $estados_cancelables);
    }

    public function puedeSerConfirmada()
    {
        if (!$this->estado) return false;
        return strtolower($this->estado->estado_estado) === 'pendiente';
    }

    /**
     * CAMBIO IMPORTANTE: Estado para facturación es 'confirmada' (no 'ejecutada')
     */
    public function puedeGenerarFactura()
    {
        if (!$this->estado) return false;

        // Abstracto: buscar estados "Confirmada" independientemente del ID
        return strtolower($this->estado->estado_estado) === 'confirmada';
    }

    /**
     * Obtener estados válidos para facturación - Método estático abstracto
     */
    public static function obtenerEstadosFacturables()
    {
        return Estado::where('estado_codigo', 'LIKE', 'RES-%')
            ->where('estado_situacion', 1)
            ->where('estado_estado', 'Confirmada')
            ->get();
    }

    /**
     * Validar si el estado permite facturación
     */
    public function estadoPermiteFacturacion()
    {
        if (!$this->estado) return false;

        // Abstracto: cualquier estado de reserva "Confirmada" puede facturar
        return $this->estado->estado_codigo &&
            str_starts_with($this->estado->estado_codigo, 'RES-') &&
            strtolower($this->estado->estado_estado) === 'confirmada';
    }

    /**
     * DISPONIBILIDAD - Usando métodos sincronizados con RutaActivada y Tours
     */
    public function consultarDisponibilidadRuta()
    {
        if ($this->rutaActivada) {
            return $this->rutaActivada->verificarDisponibilidad($this->total_pasajeros);
        }

        if ($this->tourActivado) {
            // Tours no tienen límite de capacidad
            return [
                'disponible' => true,
                'mensaje' => 'Tour sin límite de capacidad'
            ];
        }

        return [
            'disponible' => false,
            'mensaje' => 'Servicio no asignado'
        ];
    }

    public function cabeEnLaRuta()
    {
        if ($this->rutaActivada) {
            return $this->rutaActivada->puedeRecibirPasajeros($this->total_pasajeros);
        }

        if ($this->tourActivado) {
            // Tours siempre pueden recibir pasajeros
            return true;
        }

        return false;
    }

    /**
     * ESTADO DE FACTURACIÓN - Sin tabla facturas
     */
    public function tieneFactura()
    {
        if (!$this->estado) return false;
        return strtolower($this->estado->estado_estado) === 'facturada';
    }

    public function tieneFacturaActiva()
    {
        return $this->tieneFactura();
    }

    /**
     * Generar datos estructurados para factura
     */
    public function generarDatosFactura()
    {
        if (!$this->puedeGenerarFactura()) {
            throw new \Exception('Esta reserva no puede generar factura. Estado: ' . $this->estado_nombre);
        }

        return [
            'reserva' => [
                'id' => $this->reserva_id,
                'codigo' => $this->reserva_codigo,
                'fecha_reserva' => $this->created_at->format('d/m/Y H:i')
            ],
            'cliente' => [
                'nombre_completo' => $this->nombre_completo_cliente,
                'nit' => $this->reserva_cliente_nit,
                'telefono' => $this->reserva_telefono_cliente,
                'email' => $this->reserva_email_cliente,
                'direccion_abordaje' => $this->reserva_direccion_abordaje
            ],
            'servicio' => [
                'tipo' => $this->tipo_servicio,
                'nombre' => $this->formatearServicio(),
                'detalle' => $this->ruta_completa,
                'fecha_viaje' => $this->fecha_viaje,
                'hora_viaje' => $this->hora_viaje
            ],
            'pasajeros' => [
                'adultos' => $this->reserva_cantidad_adultos,
                'ninos' => $this->reserva_cantidad_ninos ?? 0,
                'total' => $this->total_pasajeros
            ],
            'montos' => [
                'subtotal' => $this->reserva_monto,
                'total' => $this->reserva_monto
            ],
            'venta' => [
                'tipo' => $this->tipo_venta,
                'agencia' => $this->es_venta_agencia ? $this->agencia_nombre : null,
                'vendedor' => $this->vendedor_nombre
            ]
        ];
    }

    /**
     * BÚSQUEDA DE DISPONIBILIDAD - Usando RutaActivada y Tours
     */
    public static function buscarDisponibilidad($servicio_id, $fecha, $pasajeros)
    {
        // Primero intentar rutas
        $ruta_disponible = RutaActivada::asignarAutomaticamente($servicio_id, $fecha, $pasajeros);
        if ($ruta_disponible) {
            return $ruta_disponible;
        }

        // Si no hay rutas, buscar tours (que no tienen límite)
        return TourActivado::buscarDisponible($servicio_id, $fecha);
    }

    /**
     * MONTO CALCULADO - Los triggers de BD se encargan automáticamente
     */
    public function getMontoAutomatico()
    {
        return $this->reserva_monto;
    }

    /**
     * CÁLCULO DE PRECIO - Usando método de RutaActivada o Tours
     */
    public function calcularPrecioCompleto()
    {
        if ($this->rutaActivada) {
            return $this->rutaActivada->calcularPrecioReserva(
                $this->reserva_cantidad_adultos,
                $this->reserva_cantidad_ninos ?? 0,
                $this->es_venta_agencia
            );
        }

        if ($this->tourActivado) {
            return $this->tourActivado->calcularPrecioReserva(
                $this->reserva_cantidad_adultos,
                $this->reserva_cantidad_ninos ?? 0,
                $this->es_venta_agencia
            );
        }

        return 0;
    }

    /**
     * FUNCIONALIDAD WHATSAPP - Mantenida completa y actualizada para tours
     */
    public function generarMensajeWhatsAppConfirmacion()
    {
        $mensaje = "🚌 *MAGIC TRAVEL* 🚌\n\n";
        $mensaje .= "✅ *RESERVA CONFIRMADA*\n\n";
        $mensaje .= "👤 *Cliente:* {$this->nombre_completo_cliente}\n";
        $mensaje .= "🎫 *Código:* {$this->reserva_codigo}\n\n";

        if ($this->tipo_servicio === 'RUTA') {
            $mensaje .= "🛣 *Ruta:* {$this->ruta_completa}\n";
        } else {
            $mensaje .= "🎯 *Tour:* {$this->ruta_completa}\n";
            if ($this->tourActivado && $this->tourActivado->tour_activado_punto_encuentro) {
                $mensaje .= "📍 *Punto encuentro:* {$this->tourActivado->tour_activado_punto_encuentro}\n";
            }
        }

        $mensaje .= "📅 *Fecha:* {$this->fecha_viaje}\n";
        $mensaje .= "🕒 *Hora:* {$this->hora_viaje}\n\n";

        $mensaje .= "👥 *Pasajeros:*\n";
        $mensaje .= "   • Adultos: {$this->reserva_cantidad_adultos}\n";
        if ($this->reserva_cantidad_ninos > 0) {
            $mensaje .= "   • Niños: {$this->reserva_cantidad_ninos}\n";
        }
        $mensaje .= "   • Total: {$this->total_pasajeros} personas\n\n";

        if ($this->reserva_direccion_abordaje) {
            $mensaje .= "🏨 *Punto de abordaje:* {$this->reserva_direccion_abordaje}\n\n";
        }

        $mensaje .= "💰 *Monto total:* Q. " . number_format($this->reserva_monto, 2) . "\n";
        if ($this->es_venta_agencia) {
            $mensaje .= "🏢 *Agencia:* {$this->agencia_nombre}\n";
        }
        $mensaje .= "\n📞 *Contacto:* {$this->formatearTelefono()}\n\n";

        $mensaje .= "⚠️ *IMPORTANTE:*\n";
        $mensaje .= "• Llegar 10 minutos antes\n";
        $mensaje .= "• Portar documento de identidad\n";
        $mensaje .= "• Guardar este mensaje como comprobante\n\n";

        $mensaje .= "¡Gracias por viajar con Magic Travel! 🌟";

        return $mensaje;
    }

    public function generarMensajeWhatsAppRecordatorio()
    {
        $mensaje = "🚌 *MAGIC TRAVEL* - RECORDATORIO 🚌\n\n";
        $mensaje .= "⏰ *SU VIAJE ES HOY*\n\n";
        $mensaje .= "👤 {$this->nombre_completo_cliente}\n";
        $mensaje .= "🎫 Reserva: {$this->reserva_codigo}\n\n";

        if ($this->tipo_servicio === 'RUTA') {
            $mensaje .= "🛣 *Salida:* {$this->ruta_completa}\n";
        } else {
            $mensaje .= "🎯 *Tour:* {$this->ruta_completa}\n";
        }

        $mensaje .= "🕒 *Hora:* {$this->hora_viaje}\n";

        if ($this->reserva_direccion_abordaje) {
            $mensaje .= "🏨 *Punto de abordaje:* {$this->reserva_direccion_abordaje}\n";
        }

        if ($this->tourActivado && $this->tourActivado->tour_activado_punto_encuentro) {
            $mensaje .= "📍 *Punto encuentro:* {$this->tourActivado->tour_activado_punto_encuentro}\n";
        }

        $mensaje .= "\n👥 Pasajeros: {$this->total_pasajeros}\n";
        $mensaje .= "💰 Monto: Q. " . number_format($this->reserva_monto, 2) . "\n\n";

        $mensaje .= "⚠️ Recuerde llegar 10 minutos antes\n\n";
        $mensaje .= "¡Buen viaje! 🌟";

        return $mensaje;
    }

    public function generarMensajeWhatsAppCancelacion()
    {
        $mensaje = "🚌 *MAGIC TRAVEL* 🚌\n\n";
        $mensaje .= "❌ *RESERVA CANCELADA*\n\n";
        $mensaje .= "👤 {$this->nombre_completo_cliente}\n";
        $mensaje .= "🎫 Código: {$this->reserva_codigo}\n\n";

        $mensaje .= "🛣 Servicio: {$this->ruta_completa}\n";
        $mensaje .= "📅 Fecha: {$this->fecha_viaje}\n";
        $mensaje .= "🕒 Hora: {$this->hora_viaje}\n\n";

        if ($this->reserva_notas) {
            $mensaje .= "📝 *Motivo:* {$this->reserva_notas}\n\n";
        }

        $mensaje .= "💰 Monto: Q. " . number_format($this->reserva_monto, 2) . "\n\n";
        $mensaje .= "ℹ️ Para nuevas reservas, contáctenos\n";
        $mensaje .= "Lamentamos los inconvenientes 🙏";

        return $mensaje;
    }

    public function generarMensajeWhatsAppPersonalizado($tipo = 'confirmacion')
    {
        switch (strtolower($tipo)) {
            case 'recordatorio':
                return $this->generarMensajeWhatsAppRecordatorio();
            case 'cancelacion':
                return $this->generarMensajeWhatsAppCancelacion();
            case 'confirmacion':
            default:
                return $this->generarMensajeWhatsAppConfirmacion();
        }
    }

    /**
     * MÉTODOS DE FORMATO - Usando RutaActivada sincronizada y Tours
     */
    public function formatearServicio()
    {
        if ($this->rutaActivada) {
            return $this->rutaActivada->formatearServicio();
        }

        if ($this->tourActivado) {
            return $this->tourActivado->formatearServicio();
        }

        return 'Sin servicio';
    }

    public function formatearVehiculo()
    {
        if ($this->rutaActivada) {
            return $this->rutaActivada->vehiculo_info;
        }

        if ($this->tourActivado) {
            return 'N/A (Tour)';
        }

        return 'Sin vehículo';
    }

    public function getCodigoPublico()
    {
        if (!$this->reserva_codigo) return 'Sin código';

        $codigo = $this->reserva_codigo;
        if (strlen($codigo) > 4) {
            $codigo = substr($codigo, 0, 3) . '***' . substr($codigo, -1);
        }

        return $codigo;
    }

    public function formatearTelefono()
    {
        $telefono = (string) $this->reserva_telefono_cliente;
        if (strlen($telefono) === 8) {
            return substr($telefono, 0, 4) . '-' . substr($telefono, 4);
        }
        return $telefono;
    }

    /**
     * VALIDACIÓN DE CÓDIGO ÚNICO
     */
    public function esCodigoUnico($codigo, $excepto_id = null)
    {
        $query = self::where('reserva_codigo', $codigo);

        if ($excepto_id) {
            $query->where('reserva_id', '!=', $excepto_id);
        }

        return !$query->exists();
    }

    /**
     * VALIDACIONES DE DISPONIBILIDAD - Usando RutaActivada y Tours
     */
    public static function validarCapacidadEnRuta($ruta_activada_id, $pasajeros, $excepto_reserva_id = null)
    {
        $ruta = RutaActivada::find($ruta_activada_id);
        if (!$ruta) {
            return ['valido' => false, 'mensaje' => 'Ruta no encontrada'];
        }

        $ocupacion_actual = self::where('ruta_activada_id', $ruta_activada_id)
            ->where('reserva_situacion', 1);

        if ($excepto_reserva_id) {
            $ocupacion_actual->where('reserva_id', '!=', $excepto_reserva_id);
        }

        $total_ocupado = $ocupacion_actual->sum(DB::raw('reserva_cantidad_adultos + IFNULL(reserva_cantidad_ninos, 0)'));
        $capacidad = $ruta->vehiculo ? $ruta->vehiculo->vehiculo_capacidad : 0;

        if ($capacidad <= 0) {
            return ['valido' => true, 'mensaje' => 'Sin límite de capacidad'];
        }

        if (($total_ocupado + $pasajeros) > $capacidad) {
            return [
                'valido' => false,
                'mensaje' => "Capacidad insuficiente. Disponible: " . ($capacidad - $total_ocupado)
            ];
        }

        return ['valido' => true, 'mensaje' => 'Capacidad disponible'];
    }

    // NUEVO: Validación para tours (siempre válida)
    public static function validarCapacidadEnTour($tour_activado_id, $pasajeros, $excepto_reserva_id = null)
    {
        $tour = TourActivado::find($tour_activado_id);
        if (!$tour) {
            return ['valido' => false, 'mensaje' => 'Tour no encontrado'];
        }

        return ['valido' => true, 'mensaje' => 'Tours sin límite de capacidad'];
    }

    public function validarCapacidadPropia()
    {
        if ($this->ruta_activada_id) {
            return self::validarCapacidadEnRuta(
                $this->ruta_activada_id,
                $this->total_pasajeros,
                $this->reserva_id
            );
        }

        if ($this->tour_activado_id) {
            return self::validarCapacidadEnTour(
                $this->tour_activado_id,
                $this->total_pasajeros,
                $this->reserva_id
            );
        }

        return ['valido' => false, 'mensaje' => 'Servicio no definido'];
    }

    /**
     * USAR VISTAS DE LA NUEVA DB - Métodos estáticos para reportes
     */
    public static function obtenerReservasCompletas()
    {
        return DB::table('v_reservas_completas')->get();
    }

    public static function obtenerIngresosDiarios()
    {
        return DB::table('v_ingresos_diarios')->get();
    }

    public static function obtenerOcupacionRutas()
    {
        return DB::table('v_ocupacion_rutas')->get();
    }

    // NUEVO: Obtener información de tours
    public static function obtenerInfoTours()
    {
        return DB::table('v_info_tours')->get();
    }

    // NUEVO: Dashboard unificado
    public static function obtenerDashboardUnificado()
    {
        return DB::table('v_dashboard_unificado')->get();
    }

    /**
     * INTEGRACIÓN COMPLETA - Aprovechar capacidades de RutaActivada y Tours
     */
    public function necesitaAlertaCapacidad()
    {
        if ($this->rutaActivada) {
            return $this->rutaActivada->necesitaAlertaCapacidad();
        }

        // Tours no necesitan alerta de capacidad
        return false;
    }

    public function obtenerStatusDisponibilidad()
    {
        if ($this->rutaActivada) {
            return $this->rutaActivada->status_disponibilidad;
        }

        if ($this->tourActivado) {
            return 'SIEMPRE_DISPONIBLE';
        }

        return 'DESCONOCIDO';
    }

    public function obtenerPorcentajeOcupacion()
    {
        if ($this->rutaActivada) {
            return $this->rutaActivada->porcentaje_ocupacion;
        }

        // Tours no tienen porcentaje de ocupación
        return 0;
    }

    /**
     * Obtener notificaciones inteligentes para la reserva
     */
    public function obtenerNotificacionesInteligentes()
    {
        $notificaciones = [];

        // Verificar si puede cambiar de estado
        if ($this->estado && stripos($this->estado->estado_estado, 'cancelada') !== false) {
            $notificaciones[] = [
                'tipo' => 'info',
                'mensaje' => 'Esta reserva está cancelada y no puede modificarse'
            ];
        }

        // Verificar si puede ser confirmada
        if ($this->estado && stripos($this->estado->estado_estado, 'pendiente') !== false) {
            $notificaciones[] = [
                'tipo' => 'warning',
                'mensaje' => 'Reserva pendiente - puede ser confirmada o cancelada'
            ];
        }

        // Notificación específica para tours
        if ($this->tourActivado) {
            $notificaciones[] = [
                'tipo' => 'info',
                'mensaje' => 'Tour sin límite de capacidad - siempre disponible'
            ];
        }

        return $notificaciones;
    }

    /**
     * Validar cambio de estado
     */
    public function validarCambioDeEstado($nuevoEstado)
    {
        // Si está cancelada, no puede cambiar
        if ($this->estado && stripos($this->estado->estado_estado, 'cancelada') !== false) {
            return [
                'puede_cambiar' => false,
                'mensaje' => 'Las reservas canceladas no pueden cambiar de estado'
            ];
        }

        return ['puede_cambiar' => true];
    }

    /**
     * Procesar después de cambio de estado
     */
    public function procesarDespuesDeCambioEstado()
    {
        return $this->obtenerNotificacionesInteligentes();
    }

    /**
     * NUEVOS MÉTODOS ESPECÍFICOS PARA TOURS
     */

    /**
     * Verificar si es una reserva de tour
     */
    public function esTour()
    {
        return !is_null($this->tour_activado_id) && is_null($this->ruta_activada_id);
    }

    /**
     * Verificar si es una reserva de ruta
     */
    public function esRuta()
    {
        return !is_null($this->ruta_activada_id) && is_null($this->tour_activado_id);
    }

    /**
     * Obtener detalles específicos del tour
     */
    public function obtenerDetallesTour()
    {
        if (!$this->tourActivado) {
            return null;
        }

        return [
            'descripcion' => $this->tourActivado->tour_activado_descripcion,
            'punto_encuentro' => $this->tourActivado->tour_activado_punto_encuentro,
            'duracion_horas' => $this->tourActivado->tour_activado_duracion_horas,
            'guia' => $this->tourActivado->persona
                ? $this->tourActivado->persona->persona_nombres . ' ' . $this->tourActivado->persona->persona_apellidos
                : 'Guía externo'
        ];
    }

    /**
     * Obtener información del servicio (unificado para rutas y tours)
     */
    public function obtenerInfoServicio()
    {
        if ($this->rutaActivada) {
            return [
                'tipo' => 'RUTA',
                'servicio' => $this->rutaActivada->servicio,
                'ruta' => $this->rutaActivada->ruta,
                'vehiculo' => $this->rutaActivada->vehiculo,
                'conductor' => $this->rutaActivada->persona,
                'capacidad_total' => $this->rutaActivada->vehiculo->vehiculo_capacidad ?? 0,
                'fecha_hora' => $this->rutaActivada->ruta_activada_fecha_hora
            ];
        }

        if ($this->tourActivado) {
            return [
                'tipo' => 'TOUR',
                'servicio' => $this->tourActivado->servicio,
                'descripcion' => $this->tourActivado->tour_activado_descripcion,
                'punto_encuentro' => $this->tourActivado->tour_activado_punto_encuentro,
                'duracion_horas' => $this->tourActivado->tour_activado_duracion_horas,
                'guia' => $this->tourActivado->persona,
                'sin_limite_capacidad' => true,
                'fecha_hora' => $this->tourActivado->tour_activado_fecha_hora
            ];
        }

        return null;
    }

    /**
     * Validar constraint de base de datos (solo un tipo de servicio)
     */
    public function validarConstraintServicio()
    {
        $tiene_ruta = !is_null($this->ruta_activada_id);
        $tiene_tour = !is_null($this->tour_activado_id);

        // Debe tener exactamente uno
        if ($tiene_ruta && $tiene_tour) {
            return [
                'valido' => false,
                'mensaje' => 'No puede tener ruta y tour asignados simultáneamente'
            ];
        }

        if (!$tiene_ruta && !$tiene_tour) {
            return [
                'valido' => false,
                'mensaje' => 'Debe tener asignada una ruta o un tour'
            ];
        }

        return ['valido' => true];
    }
}
