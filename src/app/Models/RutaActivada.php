<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\HasAudit;
use Carbon\Carbon;

class RutaActivada extends Model
{
    use SoftDeletes, HasAudit;

    protected $table = 'ruta_activada';
    protected $primaryKey = 'ruta_activada_id';

    protected $fillable = [
        'ruta_activada_codigo',
        'ruta_activada_fecha',
        'ruta_activada_hora',
        'ruta_activada_situacion',
        'usuario_id',
        'estado_id',
        'servicio_id',
        'ruta_id',
        'vehiculo_id'
    ];

    protected $casts = [
        'ruta_activada_fecha' => 'datetime',
        'ruta_activada_hora' => 'datetime',
        'ruta_activada_situacion' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    protected $hidden = [
        'created_by',
        'updated_by',
        'deleted_at'
    ];

    protected $appends = [
        'es_activo',
        'fecha_completa',
        'ocupacion_actual',
        'porcentaje_ocupacion',
        'espacios_disponibles'
    ];

    /**
     * Relaciones
     */
    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'usuario_id', 'usuario_id');
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

    public function reservasActivas()
    {
        return $this->hasMany(Reserva::class, 'ruta_activada_id', 'ruta_activada_id')
            ->where('reserva_situacion', true);
    }

    /**
     * Atributos calculados
     */
    public function getEsActivoAttribute()
    {
        return $this->ruta_activada_situacion === true;
    }

    public function getFechaCompletaAttribute()
    {
        if (!$this->ruta_activada_fecha || !$this->ruta_activada_hora) {
            return null;
        }

        $fecha = Carbon::parse($this->ruta_activada_fecha);
        $hora = Carbon::parse($this->ruta_activada_hora);

        return $fecha->format('d/m/Y') . ' a las ' . $hora->format('H:i');
    }

    public function getOcupacionActualAttribute()
    {
        return $this->reservasActivas()
            ->sum(\DB::raw('reserva_cantidad_adultos + IFNULL(reserva_cantidad_ninos, 0)'));
    }

    public function getPorcentajeOcupacionAttribute()
    {
        if (!$this->vehiculo || $this->vehiculo->vehiculo_capacidad == 0) {
            return 0;
        }

        return round(($this->ocupacion_actual / $this->vehiculo->vehiculo_capacidad) * 100, 1);
    }

    public function getEspaciosDisponiblesAttribute()
    {
        if (!$this->vehiculo) {
            return 0;
        }

        return max(0, $this->vehiculo->vehiculo_capacidad - $this->ocupacion_actual);
    }

    /**
     * Scopes
     */
    public function scopeActivo($query)
    {
        return $query->where('ruta_activada_situacion', true);
    }

    public function scopePorCodigo($query, $codigo)
    {
        return $query->where('ruta_activada_codigo', $codigo);
    }

    public function scopeHoy($query)
    {
        return $query->whereDate('ruta_activada_fecha', now()->toDateString());
    }

    public function scopeManana($query)
    {
        return $query->whereDate('ruta_activada_fecha', now()->addDay());
    }

    public function scopeEntreFechas($query, $fechaInicio, $fechaFin)
    {
        return $query->whereBetween('ruta_activada_fecha', [$fechaInicio, $fechaFin]);
    }

    public function scopeProgramadas($query)
    {
        return $query->whereHas('estado', function ($q) {
            $q->where('estado_codigo', 'RUT_PROG');
        });
    }

    public function scopeIniciadas($query)
    {
        return $query->whereHas('estado', function ($q) {
            $q->where('estado_codigo', 'RUT_INIC');
        });
    }

    public function scopeFinalizadas($query)
    {
        return $query->whereHas('estado', function ($q) {
            $q->where('estado_codigo', 'RUT_FIN');
        });
    }

    public function scopeConReservas($query)
    {
        return $query->has('reservas');
    }

    public function scopeDisponibles($query)
    {
        return $query->whereRaw('(
            SELECT vehiculo.vehiculo_capacidad -
            IFNULL(SUM(reserva.reserva_cantidad_adultos + IFNULL(reserva.reserva_cantidad_ninos, 0)), 0)
            FROM vehiculo
            LEFT JOIN reserva ON reserva.ruta_activada_id = ruta_activada.ruta_activada_id
                AND reserva.reserva_situacion = 1
            WHERE vehiculo.vehiculo_id = ruta_activada.vehiculo_id
        ) > 0');
    }

    /**
     * Métodos de negocio
     */
    public function estaProgramada()
    {
        return $this->estado && $this->estado->estado_codigo === 'RUT_PROG';
    }

    public function estaIniciada()
    {
        return $this->estado && $this->estado->estado_codigo === 'RUT_INIC';
    }

    public function estaFinalizada()
    {
        return $this->estado && $this->estado->estado_codigo === 'RUT_FIN';
    }

    public function estaCancelada()
    {
        return $this->estado && $this->estado->estado_codigo === 'RUT_CANC';
    }

    public function puedeAcomodar($numeroPasajeros)
    {
        return $this->espacios_disponibles >= $numeroPasajeros;
    }

    public function estaLlena()
    {
        return $this->espacios_disponibles === 0;
    }

    public function estaCasiLlena()
    {
        return $this->porcentaje_ocupacion >= 80;
    }

    public function cambiarEstado($nuevoEstadoCodigo)
    {
        $nuevoEstado = Estado::where('estado_codigo', $nuevoEstadoCodigo)->first();

        if (!$nuevoEstado) {
            throw new \Exception("Estado {$nuevoEstadoCodigo} no encontrado");
        }

        if ($this->estado && !$this->estado->permiteTransicion($nuevoEstadoCodigo)) {
            throw new \Exception("Transición no válida de {$this->estado->estado_codigo} a {$nuevoEstadoCodigo}");
        }

        $this->estado_id = $nuevoEstado->estado_id;
        $this->save();

        return $this;
    }

    public function iniciarRuta()
    {
        return $this->cambiarEstado('RUT_INIC');
    }

    public function finalizarRuta()
    {
        return $this->cambiarEstado('RUT_FIN');
    }

    public function cancelarRuta()
    {
        return $this->cambiarEstado('RUT_CANC');
    }

    public function generarCodigoUnico()
    {
        $fecha = Carbon::parse($this->ruta_activada_fecha);
        $servicio = $this->servicio ? substr($this->servicio->servicio_codigo, 0, 3) : 'SRV';
        $numero = str_pad($this->ruta_activada_id ?? 0, 3, '0', STR_PAD_LEFT);

        return strtoupper($servicio . '-' . $fecha->format('ymd') . '-' . $numero);
    }

    public function getIngresoTotal()
    {
        return $this->reservasActivas()->sum('reserva_monto') ?? 0;
    }

    public function getTotalPasajeros()
    {
        return $this->ocupacion_actual;
    }

    public function getChoferAsignado()
    {
        return $this->usuario && $this->usuario->esChofer() ? $this->usuario : null;
    }

    public function esDelDia()
    {
        return Carbon::parse($this->ruta_activada_fecha)->isToday();
    }

    public function yaComenzo()
    {
        $fechaHora = Carbon::parse($this->ruta_activada_fecha)
            ->setTimeFromTimeString(Carbon::parse($this->ruta_activada_hora)->format('H:i:s'));

        return now()->greaterThan($fechaHora);
    }

    public function faltanMinutos()
    {
        $fechaHora = Carbon::parse($this->ruta_activada_fecha)
            ->setTimeFromTimeString(Carbon::parse($this->ruta_activada_hora)->format('H:i:s'));

        return max(0, now()->diffInMinutes($fechaHora, false));
    }

    public function resumenOperativo()
    {
        return [
            'ruta_codigo' => $this->ruta_activada_codigo,
            'fecha_hora' => $this->fecha_completa,
            'ruta' => $this->ruta ? $this->ruta->ruta_completa : 'Sin ruta',
            'servicio' => $this->servicio ? $this->servicio->servicio_servicio : 'Sin servicio',
            'vehiculo' => $this->vehiculo ? $this->vehiculo->descripcion_completa : 'Sin vehículo',
            'chofer' => $this->getChoferAsignado() ? $this->getChoferAsignado()->nombre_completo : 'Sin chofer',
            'ocupacion' => [
                'actual' => $this->ocupacion_actual,
                'capacidad' => $this->vehiculo ? $this->vehiculo->vehiculo_capacidad : 0,
                'porcentaje' => $this->porcentaje_ocupacion,
                'disponibles' => $this->espacios_disponibles
            ],
            'estado' => $this->estado ? $this->estado->estado_estado : 'Sin estado',
            'ingreso_total' => $this->getIngresoTotal(),
            'total_reservas' => $this->reservasActivas()->count()
        ];
    }
}
