<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\HasAudit;

class Ruta extends Model
{
    use SoftDeletes, HasAudit;

    protected $table = 'rutas';

    protected $fillable = [
        'codigo_ruta',
        'nombre_ruta',
        'tipo_servicio',
        'ciudad_origen',
        'ciudad_destino',
        'punto_salida',
        'punto_llegada',
        'distancia_km',
        'hora_salida',
        'hora_llegada_estimada',
        'duracion_minutos',
        'capacidad_maxima',
        'capacidad_recomendada',
        'tipo_vehiculo_id',
        'dias_operacion',
        'precio_adulto',
        'precio_nino',
        'incluye',
        'estado_ruta_id',
        'situacion'
    ];

    protected $casts = [
        'situacion' => 'boolean',
        'distancia_km' => 'decimal:2',
        'duracion_minutos' => 'integer',
        'capacidad_maxima' => 'integer',
        'capacidad_recomendada' => 'integer',
        'precio_adulto' => 'decimal:2',
        'precio_nino' => 'decimal:2',
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

        static::creating(function ($ruta) {
            if (empty($ruta->codigo_ruta)) {
                $ruta->codigo_ruta = self::generarCodigoRuta();
            }
        });
    }

    /**
     * Generar código único de ruta
     */
    public static function generarCodigoRuta()
    {
        $ultimo = self::orderBy('id', 'desc')->first();
        $numero = $ultimo ? intval(substr($ultimo->codigo_ruta, 3)) + 1 : 1;
        return sprintf('RUT%04d', $numero);
    }

    /**
     * Relaciones
     */
    public function tipoVehiculo()
    {
        return $this->belongsTo(TipoVehiculo::class);
    }

    public function estadoRuta()
    {
        return $this->belongsTo(EstadoRuta::class);
    }

    public function reservas()
    {
        return $this->hasMany(Reserva::class);
    }

    public function rutasEjecutadas()
    {
        return $this->hasMany(RutaEjecutada::class);
    }

    /**
     * Atributos calculados
     */
    public function getAceptaReservasAttribute()
    {
        return $this->estadoRuta && $this->estadoRuta->acepta_reservas;
    }

    public function getOperaHoyAttribute()
    {
        $diaSemana = now()->dayOfWeek; // 0 = domingo, 6 = sábado
        return substr($this->dias_operacion, $diaSemana, 1) === '1';
    }

    public function getDiasOperacionArrayAttribute()
    {
        $dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        $operacion = [];

        for ($i = 0; $i < 7; $i++) {
            if (substr($this->dias_operacion, $i, 1) === '1') {
                $operacion[] = $dias[$i];
            }
        }

        return $operacion;
    }

    /**
     * Scopes
     */
    public function scopeActivas($query)
    {
        return $query->whereHas('estadoRuta', function ($q) {
            $q->where('acepta_reservas', true);
        });
    }

    public function scopePorTipoServicio($query, $tipo)
    {
        return $query->where('tipo_servicio', $tipo);
    }

    public function scopeOperanDia($query, $diaSemana)
    {
        return $query->where('dias_operacion', 'like', str_repeat('_', $diaSemana) . '1%');
    }

    public function scopePorOrigenDestino($query, $origen, $destino)
    {
        return $query->where('ciudad_origen', $origen)
            ->where('ciudad_destino', $destino);
    }

    /**
     * Métodos de negocio
     */
    public function verificarDisponibilidad($fecha, $pasajeros = 1)
    {
        // Verificar si opera ese día
        $diaSemana = \Carbon\Carbon::parse($fecha)->dayOfWeek;
        if (substr($this->dias_operacion, $diaSemana, 1) !== '1') {
            return ['disponible' => false, 'mensaje' => 'La ruta no opera este día'];
        }

        // Verificar capacidad
        $reservasConfirmadas = $this->reservas()
            ->whereDate('fecha_viaje', $fecha)
            ->whereHas('estadoReserva', function ($q) {
                $q->where('cuenta_ocupacion', true);
            })
            ->sum('pax_total');

        $espaciosDisponibles = $this->capacidad_maxima - $reservasConfirmadas;

        if ($espaciosDisponibles < $pasajeros) {
            return [
                'disponible' => false,
                'mensaje' => "Solo quedan {$espaciosDisponibles} espacios disponibles",
                'espacios_disponibles' => $espaciosDisponibles
            ];
        }

        return [
            'disponible' => true,
            'espacios_disponibles' => $espaciosDisponibles,
            'mensaje' => 'Ruta disponible'
        ];
    }

    public function crearEjecucion($fecha, $vehiculoId, $choferId, $choferApoyoId = null)
    {
        return RutaEjecutada::create([
            'numero_ejecucion' => RutaEjecutada::generarNumeroEjecucion(),
            'ruta_id' => $this->id,
            'vehiculo_id' => $vehiculoId,
            'chofer_id' => $choferId,
            'chofer_apoyo_id' => $choferApoyoId,
            'fecha_operacion' => $fecha,
            'hora_salida_programada' => $this->hora_salida,
            'capacidad_vehiculo' => Vehiculo::find($vehiculoId)->capacidad_pasajeros,
            'estado' => 'programada'
        ]);
    }
}
