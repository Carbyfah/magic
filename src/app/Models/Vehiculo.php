<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\HasAudit;

class Vehiculo extends Model
{
    use SoftDeletes, HasAudit;

    protected $table = 'vehiculo';
    protected $primaryKey = 'vehiculo_id';

    protected $fillable = [
        'vehiculo_codigo',
        'vehiculo_placa',
        'vehiculo_marca',
        'vehiculo_modelo',
        'vehiculo_capacidad',
        'vehiculo_situacion',
        'estado_id'
    ];

    protected $casts = [
        'vehiculo_capacidad' => 'integer',
        'vehiculo_situacion' => 'boolean',
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
        'descripcion_completa',
        'tipo_vehiculo',
        'esta_disponible'
    ];

    /**
     * Relaciones
     */
    public function estado()
    {
        return $this->belongsTo(Estado::class, 'estado_id', 'estado_id');
    }

    public function rutasActivadas()
    {
        return $this->hasMany(RutaActivada::class, 'vehiculo_id', 'vehiculo_id');
    }

    public function rutaActual()
    {
        return $this->hasOne(RutaActivada::class, 'vehiculo_id', 'vehiculo_id')
            ->whereHas('estado', function ($q) {
                $q->whereIn('estado_codigo', ['RUT_PROG', 'RUT_INIC']);
            })
            ->latest();
    }

    /**
     * Atributos calculados
     */
    public function getEsActivoAttribute()
    {
        return $this->vehiculo_situacion === true;
    }

    public function getDescripcionCompletaAttribute()
    {
        return "{$this->vehiculo_marca} {$this->vehiculo_modelo} ({$this->vehiculo_placa})";
    }

    public function getTipoVehiculoAttribute()
    {
        if ($this->vehiculo_capacidad <= 12) {
            return 'Minivan';
        } elseif ($this->vehiculo_capacidad <= 20) {
            return 'Microbus';
        } elseif ($this->vehiculo_capacidad <= 30) {
            return 'Bus Pequeño';
        }

        return 'Bus Grande';
    }

    public function getEstaDisponibleAttribute()
    {
        return $this->estado && $this->estado->estado_codigo === 'VEH_DISP';
    }

    /**
     * Scopes
     */
    public function scopeActivo($query)
    {
        return $query->where('vehiculo_situacion', true);
    }

    public function scopePorCodigo($query, $codigo)
    {
        return $query->where('vehiculo_codigo', $codigo);
    }

    public function scopeDisponibles($query)
    {
        return $query->whereHas('estado', function ($q) {
            $q->where('estado_codigo', 'VEH_DISP');
        });
    }

    public function scopeOcupados($query)
    {
        return $query->whereHas('estado', function ($q) {
            $q->where('estado_codigo', 'VEH_OCUP');
        });
    }

    public function scopeEnMantenimiento($query)
    {
        return $query->whereHas('estado', function ($q) {
            $q->where('estado_codigo', 'VEH_MANT');
        });
    }

    public function scopePorCapacidad($query, $capacidadMinima)
    {
        return $query->where('vehiculo_capacidad', '>=', $capacidadMinima);
    }

    public function scopePorMarca($query, $marca)
    {
        return $query->where('vehiculo_marca', 'like', "%{$marca}%");
    }

    public function scopeConRutaActiva($query)
    {
        return $query->has('rutaActual');
    }

    /**
     * Métodos de negocio
     */
    public function estaDisponible()
    {
        return $this->esta_disponible;
    }

    public function estaOcupado()
    {
        return $this->estado && $this->estado->estado_codigo === 'VEH_OCUP';
    }

    public function estaEnMantenimiento()
    {
        return $this->estado && $this->estado->estado_codigo === 'VEH_MANT';
    }

    public function estaInactivo()
    {
        return $this->estado && $this->estado->estado_codigo === 'VEH_INAR';
    }

    public function getOcupacionActual()
    {
        if (!$this->rutaActual) {
            return 0;
        }

        return $this->rutaActual->reservas()
            ->where('reserva_situacion', true)
            ->sum(\DB::raw('reserva_cantidad_adultos + IFNULL(reserva_cantidad_ninos, 0)'));
    }

    public function puedeAcomodar($numeroPasajeros)
    {
        if (!$this->estaDisponible()) {
            return false;
        }

        $ocupacionActual = $this->getOcupacionActual();
        return ($ocupacionActual + $numeroPasajeros) <= $this->vehiculo_capacidad;
    }

    public function espaciosLibres()
    {
        return max(0, $this->vehiculo_capacidad - $this->getOcupacionActual());
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

    public function marcarDisponible()
    {
        return $this->cambiarEstado('VEH_DISP');
    }

    public function marcarOcupado()
    {
        return $this->cambiarEstado('VEH_OCUP');
    }

    public function marcarEnMantenimiento()
    {
        return $this->cambiarEstado('VEH_MANT');
    }

    public function esAptoPara($tipoServicio)
    {
        $requerimientos = [
            'Tour' => 15,
            'Transporte' => 12,
            'Shuttle' => 8
        ];

        return $this->vehiculo_capacidad >= ($requerimientos[$tipoServicio] ?? 10);
    }

    public function getPorcentajeUso()
    {
        $totalRutas = $this->rutasActivadas()
            ->where('created_at', '>=', now()->subMonth())
            ->count();

        $diasEnMes = now()->daysInMonth;

        return $totalRutas > 0 ? round(($totalRutas / $diasEnMes) * 100, 1) : 0;
    }
}
