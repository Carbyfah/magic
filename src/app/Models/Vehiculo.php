<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\HasAudit;

class Vehiculo extends Model
{
    use SoftDeletes, HasAudit;

    protected $table = 'vehiculos';

    protected $fillable = [
        'codigo_vehiculo',
        'placa',
        'marca',
        'modelo',
        'ano',
        'color',
        'tipo_vehiculo_id',
        'tipo_combustible_id',
        'capacidad_pasajeros',
        'capacidad_equipaje',
        'numero_motor',
        'numero_chasis',
        'numero_tarjeta_circulacion',
        'vencimiento_tarjeta_circulacion',
        'poliza_seguro',
        'vencimiento_seguro',
        'kilometraje_actual',
        'fecha_ultimo_servicio',
        'estado_vehiculo_id',
        'situacion'
    ];

    protected $casts = [
        'situacion' => 'boolean',
        'ano' => 'integer',
        'capacidad_pasajeros' => 'integer',
        'capacidad_equipaje' => 'integer',
        'kilometraje_actual' => 'integer',
        'vencimiento_tarjeta_circulacion' => 'date',
        'vencimiento_seguro' => 'date',
        'fecha_ultimo_servicio' => 'date',
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

        static::creating(function ($vehiculo) {
            if (empty($vehiculo->codigo_vehiculo)) {
                $vehiculo->codigo_vehiculo = self::generarCodigoVehiculo();
            }
        });
    }

    /**
     * Generar código único de vehículo
     */
    public static function generarCodigoVehiculo()
    {
        $ultimo = self::orderBy('id', 'desc')->first();
        $numero = $ultimo ? intval(substr($ultimo->codigo_vehiculo, 4)) + 1 : 1;
        return sprintf('VEH-%04d', $numero);
    }

    /**
     * Relaciones
     */
    public function tipoVehiculo()
    {
        return $this->belongsTo(TipoVehiculo::class);
    }

    public function tipoCombustible()
    {
        return $this->belongsTo(TipoCombustible::class);
    }

    public function estadoVehiculo()
    {
        return $this->belongsTo(EstadoVehiculo::class);
    }

    public function rutasEjecutadas()
    {
        return $this->hasMany(RutaEjecutada::class);
    }

    /**
     * Atributos calculados
     */
    public function getEstaDisponibleAttribute()
    {
        return $this->estadoVehiculo && $this->estadoVehiculo->disponible_operacion;
    }

    public function getDocumentosVigentesAttribute()
    {
        $vigentes = true;

        if ($this->vencimiento_tarjeta_circulacion && $this->vencimiento_tarjeta_circulacion < now()) {
            $vigentes = false;
        }

        if ($this->vencimiento_seguro && $this->vencimiento_seguro < now()) {
            $vigentes = false;
        }

        return $vigentes;
    }

    public function getRequiereMantenimientoAttribute()
    {
        // Cada 5000 km o 3 meses
        if (!$this->fecha_ultimo_servicio) return true;

        $mesesDesdeServicio = $this->fecha_ultimo_servicio->diffInMonths(now());
        if ($mesesDesdeServicio >= 3) return true;

        // Aquí se podría agregar lógica para kilometraje

        return false;
    }

    /**
     * Scopes
     */
    public function scopeDisponibles($query)
    {
        return $query->whereHas('estadoVehiculo', function ($q) {
            $q->where('disponible_operacion', true);
        });
    }

    public function scopePorTipo($query, $tipoId)
    {
        return $query->where('tipo_vehiculo_id', $tipoId);
    }

    public function scopeConCapacidadMinima($query, $pasajeros)
    {
        return $query->where('capacidad_pasajeros', '>=', $pasajeros);
    }

    public function scopeDocumentosProximosVencer($query, $dias = 30)
    {
        return $query->where(function ($q) use ($dias) {
            $q->whereBetween('vencimiento_tarjeta_circulacion', [now(), now()->addDays($dias)])
                ->orWhereBetween('vencimiento_seguro', [now(), now()->addDays($dias)]);
        });
    }

    /**
     * Métodos de negocio
     */
    public function puedeAsignarse()
    {
        return $this->esta_disponible &&
            $this->documentos_vigentes &&
            $this->situacion;
    }

    public function actualizarKilometraje($nuevoKilometraje)
    {
        if ($nuevoKilometraje > $this->kilometraje_actual) {
            $this->kilometraje_actual = $nuevoKilometraje;
            $this->save();
        }
    }
}
