<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Estado extends Model
{
    use SoftDeletes;

    protected $table = 'estado';
    protected $primaryKey = 'estado_id';

    protected $fillable = [
        'estado_codigo',
        'estado_estado',
        'estado_descripcion',
        'estado_situacion'
    ];

    protected $casts = [
        'estado_situacion' => 'boolean',
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
    public function reservas()
    {
        return $this->hasMany(Reserva::class, 'estado_id', 'estado_id');
    }

    public function rutasActivadas()
    {
        return $this->hasMany(RutaActivada::class, 'estado_id', 'estado_id');
    }

    public function vehiculos()
    {
        return $this->hasMany(Vehiculo::class, 'estado_id', 'estado_id');
    }

    public function toursActivados()
    {
        return $this->hasMany(TourActivado::class, 'estado_id', 'estado_id');
    }

    /**
     * SCOPES SIMPLES
     */
    public function scopeActivo($query)
    {
        return $query->where('estado_situacion', 1);
    }

    public function scopeBuscar($query, $termino)
    {
        return $query->where('estado_estado', 'like', "%{$termino}%")
            ->orWhere('estado_codigo', 'like', "%{$termino}%")
            ->orWhere('estado_descripcion', 'like', "%{$termino}%");
    }

    /**
     * GENERADOR DE CÓDIGO AUTOMÁTICO
     */
    public static function generarCodigo()
    {
        $ultimo = self::where('estado_codigo', 'LIKE', 'EST-%')
            ->orderByDesc('estado_codigo')
            ->first();

        $numero = $ultimo ? ((int) substr($ultimo->estado_codigo, 4)) + 1 : 1;
        return 'EST-' . str_pad($numero, 3, '0', STR_PAD_LEFT);
    }

    /**
     * MÉTODOS DE INSTANCIA BÁSICOS
     */
    public function getNombreCompletoAttribute()
    {
        return "{$this->estado_codigo}: {$this->estado_estado}";
    }

    public function tieneRegistrosAsociados()
    {
        return $this->reservas()->exists() ||
            $this->rutasActivadas()->exists() ||
            $this->vehiculos()->exists() ||
            $this->toursActivados()->exists();
    }

    /**
     * MÉTODOS ESPECÍFICOS PARA CONTEXTOS
     */
    public static function paraVehiculo()
    {
        return self::activo()
            ->whereIn('estado_estado', ['Disponible', 'Asignado', 'En Mantenimiento', 'Fuera de Servicio'])
            ->orderBy('estado_estado')
            ->get();
    }

    public static function paraReserva()
    {
        return self::activo()
            ->whereIn('estado_estado', ['Pendiente', 'Confirmada', 'Cancelada', 'Ejecutada', 'Facturada'])
            ->orderBy('estado_estado')
            ->get();
    }

    public static function paraRutaActivada()
    {
        return self::activo()
            ->whereIn('estado_estado', ['Activada', 'Llena', 'Ejecución', 'Cerrada'])
            ->orderBy('estado_estado')
            ->get();
    }

    public static function paraTourActivado()
    {
        return self::activo()
            ->whereIn('estado_estado', ['Activado', 'En Ejecución', 'Cerrado'])
            ->orderBy('estado_estado')
            ->get();
    }

    public static function paraFactura()
    {
        return self::activo()
            ->whereIn('estado_estado', ['Pendiente', 'Pagada', 'Anulada'])
            ->orderBy('estado_estado')
            ->get();
    }

    /**
     * MÉTODOS DE VALIDACIÓN DE CONTEXTO
     */
    public function esParaVehiculo()
    {
        return in_array($this->estado_estado, ['Disponible', 'Asignado', 'En Mantenimiento', 'Fuera de Servicio']);
    }

    public function esParaReserva()
    {
        return in_array($this->estado_estado, ['Pendiente', 'Confirmada', 'Cancelada', 'Ejecutada', 'Facturada']);
    }

    public function esParaRutaActivada()
    {
        return in_array($this->estado_estado, ['Activada', 'Llena', 'Ejecución', 'Cerrada']);
    }

    public function esParaTourActivado()
    {
        return in_array($this->estado_estado, ['Activado', 'En Ejecución', 'Cerrado']);
    }

    public function esParaFactura()
    {
        return in_array($this->estado_estado, ['Pendiente', 'Pagada', 'Anulada']);
    }

    /**
     * MÉTODOS DE TRANSICIÓN DE ESTADOS
     */
    public function puedeTransicionarA($nuevoEstado)
    {
        $transicionesPermitidas = [
            // Vehículos
            'Disponible' => ['Asignado', 'En Mantenimiento'],
            'Asignado' => ['Disponible', 'En Mantenimiento'],
            'En Mantenimiento' => ['Disponible', 'Fuera de Servicio'],
            'Fuera de Servicio' => ['En Mantenimiento'],

            // Reservas
            'Pendiente' => ['Confirmada', 'Cancelada'],
            'Confirmada' => ['Ejecutada', 'Cancelada'],
            'Ejecutada' => ['Facturada'],
            'Cancelada' => [], // No puede cambiar
            'Facturada' => [], // No puede cambiar

            // Rutas Activadas
            'Activada' => ['Llena', 'Ejecución', 'Cerrada'],
            'Llena' => ['Ejecución', 'Cerrada'],
            'Ejecución' => ['Cerrada'],
            'Cerrada' => [], // No puede cambiar

            // Tours Activados
            'Activado' => ['En Ejecución', 'Cerrado'],
            'En Ejecución' => ['Cerrado'],
            'Cerrado' => [], // No puede cambiar

            // Facturas
            'Pendiente' => ['Pagada', 'Anulada'],
            'Pagada' => [], // No puede cambiar
            'Anulada' => [] // No puede cambiar
        ];

        $estadosPermitidos = $transicionesPermitidas[$this->estado_estado] ?? [];
        return in_array($nuevoEstado, $estadosPermitidos);
    }

    /**
     * MÉTODOS DE CONSULTA ESPECÍFICOS
     */
    public static function obtenerEstadosDisponiblesParaContexto($contexto)
    {
        switch ($contexto) {
            case 'vehiculo':
                return self::paraVehiculo();
            case 'reserva':
                return self::paraReserva();
            case 'ruta-activada':
                return self::paraRutaActivada();
            case 'tour-activado':
                return self::paraTourActivado();
            case 'factura':
                return self::paraFactura();
            default:
                return self::activo()->orderBy('estado_estado')->get();
        }
    }

    public function getContextosAttribute()
    {
        $contextos = [];

        if ($this->esParaVehiculo()) $contextos[] = 'vehiculo';
        if ($this->esParaReserva()) $contextos[] = 'reserva';
        if ($this->esParaRutaActivada()) $contextos[] = 'ruta-activada';
        if ($this->esParaTourActivado()) $contextos[] = 'tour-activado';
        if ($this->esParaFactura()) $contextos[] = 'factura';

        return $contextos;
    }

    /**
     * BOOT METHOD PARA EVENTOS
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($estado) {
            if (empty($estado->estado_codigo)) {
                $estado->estado_codigo = self::generarCodigo();
            }
        });

        static::deleting(function ($estado) {
            if ($estado->tieneRegistrosAsociados()) {
                throw new \Exception('No se puede eliminar un estado que tiene registros asociados.');
            }
        });
    }
}
