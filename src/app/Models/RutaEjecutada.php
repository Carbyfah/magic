<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\HasAudit;
use Carbon\Carbon;

class RutaEjecutada extends Model
{
    use SoftDeletes, HasAudit;

    protected $table = 'rutas_ejecutadas';

    protected $fillable = [
        'numero_ejecucion',
        'ruta_id',
        'vehiculo_id',
        'chofer_id',
        'chofer_apoyo_id',
        'fecha_operacion',
        'hora_salida_programada',
        'hora_salida_real',
        'hora_llegada_real',
        'capacidad_vehiculo',
        'asientos_reservados',
        'pasajeros_abordaron',
        'pasajeros_no_show',
        'combustible_inicial',
        'combustible_final',
        'kilometraje_inicial',
        'kilometraje_final',
        'costo_combustible',
        'costo_chofer',
        'costo_peajes',
        'estado',
        'observaciones',
        'situacion'
    ];

    protected $casts = [
        'situacion' => 'boolean',
        'fecha_operacion' => 'date',
        'hora_salida_programada' => 'datetime:H:i',
        'hora_salida_real' => 'datetime:H:i',
        'hora_llegada_real' => 'datetime:H:i',
        'capacidad_vehiculo' => 'integer',
        'asientos_reservados' => 'integer',
        'pasajeros_abordaron' => 'integer',
        'pasajeros_no_show' => 'integer',
        'combustible_inicial' => 'decimal:2',
        'combustible_final' => 'decimal:2',
        'kilometraje_inicial' => 'integer',
        'kilometraje_final' => 'integer',
        'costo_combustible' => 'decimal:2',
        'costo_chofer' => 'decimal:2',
        'costo_peajes' => 'decimal:2',
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

        static::creating(function ($rutaEjecutada) {
            if (empty($rutaEjecutada->numero_ejecucion)) {
                $rutaEjecutada->numero_ejecucion = self::generarNumeroEjecucion();
            }
        });
    }

    /**
     * Generar número de ejecución único
     */
    public static function generarNumeroEjecucion()
    {
        $fecha = date('Ymd');

        $ultima = self::whereDate('created_at', Carbon::today())
            ->orderBy('id', 'desc')
            ->first();

        if ($ultima) {
            $partes = explode('-', $ultima->numero_ejecucion);
            $secuencial = isset($partes[2]) ? intval($partes[2]) + 1 : 1;
        } else {
            $secuencial = 1;
        }

        return sprintf('EJE-%s-%03d', $fecha, $secuencial);
    }

    /**
     * Relaciones
     */
    public function ruta()
    {
        return $this->belongsTo(Ruta::class);
    }

    public function vehiculo()
    {
        return $this->belongsTo(Vehiculo::class);
    }

    public function chofer()
    {
        return $this->belongsTo(Empleado::class, 'chofer_id');
    }

    public function choferApoyo()
    {
        return $this->belongsTo(Empleado::class, 'chofer_apoyo_id');
    }

    public function reservas()
    {
        return $this->belongsToMany(Reserva::class, 'reservas_rutas_ejecutadas')
            ->withPivot('pasajero_abordo', 'hora_pickup_real', 'punto_pickup', 'numero_asiento', 'observaciones')
            ->withTimestamps();
    }

    /**
     * Atributos calculados
     */
    public function getCombustibleConsumidoAttribute()
    {
        return $this->combustible_inicial - $this->combustible_final;
    }

    public function getKilometrosRecorridosAttribute()
    {
        return $this->kilometraje_final - $this->kilometraje_inicial;
    }

    public function getAsientosLibresAttribute()
    {
        return $this->capacidad_vehiculo - $this->asientos_reservados;
    }

    public function getPorcentajeOcupacionAttribute()
    {
        if ($this->capacidad_vehiculo == 0) return 0;
        return round(($this->asientos_reservados / $this->capacidad_vehiculo) * 100, 2);
    }

    public function getCostoTotalAttribute()
    {
        return $this->costo_combustible + $this->costo_chofer + $this->costo_peajes;
    }

    public function getEstaEnCursoAttribute()
    {
        return $this->estado === 'en_ruta';
    }

    public function getEstaCompletadaAttribute()
    {
        return $this->estado === 'completada';
    }

    /**
     * Scopes
     */
    public function scopePorFecha($query, $fecha)
    {
        return $query->whereDate('fecha_operacion', $fecha);
    }

    public function scopePorEstado($query, $estado)
    {
        return $query->where('estado', $estado);
    }

    public function scopeCompletadas($query)
    {
        return $query->where('estado', 'completada');
    }

    public function scopeHoy($query)
    {
        return $query->whereDate('fecha_operacion', Carbon::today());
    }

    /**
     * Métodos de negocio
     */
    public function iniciar($kilometraje, $combustible)
    {
        $this->estado = 'en_ruta';
        $this->hora_salida_real = now()->format('H:i');
        $this->kilometraje_inicial = $kilometraje;
        $this->combustible_inicial = $combustible;
        $this->save();

        return $this;
    }

    public function finalizar($kilometraje, $combustible)
    {
        $this->estado = 'completada';
        $this->hora_llegada_real = now()->format('H:i');
        $this->kilometraje_final = $kilometraje;
        $this->combustible_final = $combustible;
        $this->save();

        // Actualizar kilometraje del vehículo
        $this->vehiculo->kilometraje_actual = $kilometraje;
        $this->vehiculo->save();

        return $this;
    }

    public function marcarPasajeroAbordo($reservaId, $numeroAsiento = null)
    {
        $this->reservas()->updateExistingPivot($reservaId, [
            'pasajero_abordo' => true,
            'hora_pickup_real' => now()->format('H:i'),
            'numero_asiento' => $numeroAsiento
        ]);

        $this->pasajeros_abordaron++;
        $this->save();

        return $this;
    }

    public function marcarNoShow($reservaId)
    {
        $this->reservas()->updateExistingPivot($reservaId, [
            'pasajero_abordo' => false,
            'observaciones' => 'No show'
        ]);

        $this->pasajeros_no_show++;
        $this->save();

        // Marcar la reserva como no show
        $reserva = Reserva::find($reservaId);
        if ($reserva) {
            $reserva->marcarNoShow();
        }

        return $this;
    }
}
