<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\HasAudit;
use Carbon\Carbon;

class Reserva extends Model
{
    use SoftDeletes, HasAudit;

    protected $table = 'reservas';

    protected $fillable = [
        'numero_reserva',
        'empleado_id',
        'ruta_id',
        'pax_adultos',
        'pax_ninos',
        'nombre_pasajero_principal',
        'cliente_id',
        'agencia_id',
        'hotel_pickup',
        'telefono_contacto',
        'notas_pickup',
        'fecha_reservacion',
        'fecha_viaje',
        'hora_pickup',
        'voucher',
        'precio_total',
        'responsable_pago',
        'estado_reserva_id',
        'situacion'
    ];

    protected $casts = [
        'situacion' => 'boolean',
        'pax_adultos' => 'integer',
        'pax_ninos' => 'integer',
        'pax_total' => 'integer',
        'precio_total' => 'decimal:2',
        'fecha_reservacion' => 'date',
        'fecha_viaje' => 'date',
        'hora_pickup' => 'datetime:H:i',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    protected $hidden = [
        'created_by',
        'updated_by',
        'deleted_at'
    ];

    /**
     * Boot del modelo
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($reserva) {
            if (empty($reserva->numero_reserva)) {
                $reserva->numero_reserva = self::generarNumeroReserva();
            }

            if (empty($reserva->fecha_reservacion)) {
                $reserva->fecha_reservacion = Carbon::now();
            }
        });
    }

    /**
     * Generar número de reserva único
     */
    public static function generarNumeroReserva()
    {
        $año = date('Y');
        $mes = date('m');

        $ultima = self::whereYear('created_at', $año)
            ->whereMonth('created_at', $mes)
            ->orderBy('id', 'desc')
            ->first();

        if ($ultima) {
            $partes = explode('-', $ultima->numero_reserva);
            $secuencial = isset($partes[2]) ? intval($partes[2]) + 1 : 1;
        } else {
            $secuencial = 1;
        }

        return sprintf('RES-%s%s-%05d', $año, $mes, $secuencial);
    }

    /**
     * Relaciones
     */
    public function empleado()
    {
        return $this->belongsTo(Empleado::class);
    }

    public function ruta()
    {
        return $this->belongsTo(Ruta::class);
    }

    public function cliente()
    {
        return $this->belongsTo(Cliente::class);
    }

    public function agencia()
    {
        return $this->belongsTo(Agencia::class);
    }

    public function estadoReserva()
    {
        return $this->belongsTo(EstadoReserva::class);
    }

    public function venta()
    {
        return $this->hasOne(Venta::class);
    }

    public function rutasEjecutadas()
    {
        return $this->belongsToMany(RutaEjecutada::class, 'reservas_rutas_ejecutadas')
            ->withPivot('pasajero_abordo', 'hora_pickup_real', 'punto_pickup', 'numero_asiento', 'observaciones')
            ->withTimestamps();
    }

    /**
     * Atributos calculados
     */
    public function getEsModificableAttribute()
    {
        return $this->estadoReserva && $this->estadoReserva->editable;
    }

    public function getRequiereCobroAttribute()
    {
        return !$this->venta || $this->venta->estadoVenta->codigo !== 'PAG';
    }

    public function getDiasParaViajeAttribute()
    {
        return Carbon::now()->diffInDays($this->fecha_viaje, false);
    }

    public function getEsHoyAttribute()
    {
        return $this->fecha_viaje->isToday();
    }

    public function getEsPasadaAttribute()
    {
        return $this->fecha_viaje->isPast();
    }

    /**
     * Scopes
     */
    public function scopePorFechaViaje($query, $fecha)
    {
        return $query->whereDate('fecha_viaje', $fecha);
    }

    public function scopePorEstado($query, $estadoId)
    {
        return $query->where('estado_reserva_id', $estadoId);
    }

    public function scopePendientes($query)
    {
        return $query->whereHas('estadoReserva', function ($q) {
            $q->where('codigo', 'PEND');
        });
    }

    public function scopeConfirmadas($query)
    {
        return $query->whereHas('estadoReserva', function ($q) {
            $q->where('codigo', 'CONF');
        });
    }

    public function scopeProximas($query, $dias = 7)
    {
        return $query->where('fecha_viaje', '>=', Carbon::today())
            ->where('fecha_viaje', '<=', Carbon::today()->addDays($dias));
    }

    /**
     * Métodos de negocio
     */
    public function confirmar()
    {
        $estadoConfirmado = EstadoReserva::where('codigo', 'CONF')->first();
        if (!$estadoConfirmado) {
            throw new \Exception('Estado CONF no encontrado');
        }

        $this->estado_reserva_id = $estadoConfirmado->id;
        $this->save();

        return $this;
    }

    public function cancelar($motivo = null)
    {
        $estadoCancelado = EstadoReserva::where('codigo', 'CANC')->first();
        if (!$estadoCancelado) {
            throw new \Exception('Estado CANC no encontrado');
        }

        $this->estado_reserva_id = $estadoCancelado->id;
        if ($motivo) {
            $this->notas_pickup = $this->notas_pickup . "\nCANCELADO: " . $motivo;
        }
        $this->save();

        return $this;
    }

    /**
     * Formato WhatsApp
     */
    public function generarMensajeWhatsApp()
    {
        $mensaje = "🎫 *CONFIRMACIÓN DE RESERVA*\n";
        $mensaje .= "━━━━━━━━━━━━━━━━━━\n\n";

        $mensaje .= "📋 *Reserva:* {$this->numero_reserva}\n";
        $mensaje .= "👤 *Pasajero:* {$this->nombre_pasajero_principal}\n";
        $mensaje .= "👥 *Pax:* {$this->pax_adultos} adulto" . ($this->pax_adultos > 1 ? 's' : '');

        if ($this->pax_ninos > 0) {
            $mensaje .= ", {$this->pax_ninos} niño" . ($this->pax_ninos > 1 ? 's' : '');
        }
        $mensaje .= "\n\n";

        $mensaje .= "🚌 *Servicio:* {$this->ruta->nombre_ruta}\n";
        $mensaje .= "📅 *Fecha:* " . $this->fecha_viaje->format('d/m/Y') . "\n";
        $mensaje .= "🕐 *Hora Pickup:* " . Carbon::parse($this->hora_pickup)->format('H:i') . "\n";
        $mensaje .= "🏨 *Hotel:* {$this->hotel_pickup}\n";

        if ($this->voucher) {
            $mensaje .= "🎟️ *Voucher:* {$this->voucher}\n";
        }

        $mensaje .= "\n💰 *Total:* Q" . number_format($this->precio_total, 2);

        if ($this->responsable_pago) {
            $mensaje .= "\n💳 *Pago:* {$this->responsable_pago}";
        }

        if ($this->notas_pickup) {
            $mensaje .= "\n\n📝 *Notas:* {$this->notas_pickup}";
        }

        $mensaje .= "\n\n━━━━━━━━━━━━━━━━━━";
        $mensaje .= "\n☎️ Info: {$this->telefono_contacto}";
        $mensaje .= "\n✅ *Magic Travel Tours*";

        return $mensaje;
    }
}
