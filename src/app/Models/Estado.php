<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\HasAudit;

class Estado extends Model
{
    use SoftDeletes, HasAudit;

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

    protected $appends = [
        'es_activo',
        'categoria_estado'
    ];

    /**
     * Relaciones
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

    /**
     * Atributos calculados
     */
    public function getEsActivoAttribute()
    {
        return $this->estado_situacion === true;
    }

    public function getCategoriaEstadoAttribute()
    {
        $prefix = substr($this->estado_codigo, 0, 3);

        $categorias = [
            'RES' => 'Reserva',
            'RUT' => 'Ruta',
            'VEH' => 'Vehículo',
            'FAC' => 'Factura'
        ];

        return $categorias[$prefix] ?? 'General';
    }

    /**
     * Scopes
     */
    public function scopeActivo($query)
    {
        return $query->where('estado_situacion', true);
    }

    public function scopePorCodigo($query, $codigo)
    {
        return $query->where('estado_codigo', $codigo);
    }

    public function scopeDeReservas($query)
    {
        return $query->where('estado_codigo', 'like', 'RES_%');
    }

    public function scopeDeRutas($query)
    {
        return $query->where('estado_codigo', 'like', 'RUT_%');
    }

    public function scopeDeVehiculos($query)
    {
        return $query->where('estado_codigo', 'like', 'VEH_%');
    }

    public function scopeDeFacturas($query)
    {
        return $query->where('estado_codigo', 'like', 'FAC_%');
    }

    /**
     * Métodos estáticos para estados específicos
     */

    // Estados de Reservas
    public static function reservaPendiente()
    {
        return self::where('estado_codigo', 'RES_PEND')->first();
    }

    public static function reservaConfirmada()
    {
        return self::where('estado_codigo', 'RES_CONF')->first();
    }

    public static function reservaEjecucion()
    {
        return self::where('estado_codigo', 'RES_EJEC')->first();
    }

    public static function reservaFinalizada()
    {
        return self::where('estado_codigo', 'RES_FIN')->first();
    }

    public static function reservaCancelada()
    {
        return self::where('estado_codigo', 'RES_CANC')->first();
    }

    // Estados de Rutas
    public static function rutaProgramada()
    {
        return self::where('estado_codigo', 'RUT_PROG')->first();
    }

    public static function rutaIniciada()
    {
        return self::where('estado_codigo', 'RUT_INIC')->first();
    }

    public static function rutaFinalizada()
    {
        return self::where('estado_codigo', 'RUT_FIN')->first();
    }

    public static function rutaCancelada()
    {
        return self::where('estado_codigo', 'RUT_CANC')->first();
    }

    // Estados de Vehículos
    public static function vehiculoDisponible()
    {
        return self::where('estado_codigo', 'VEH_DISP')->first();
    }

    public static function vehiculoOcupado()
    {
        return self::where('estado_codigo', 'VEH_OCUP')->first();
    }

    public static function vehiculoMantenimiento()
    {
        return self::where('estado_codigo', 'VEH_MANT')->first();
    }

    public static function vehiculoInactivo()
    {
        return self::where('estado_codigo', 'VEH_INAR')->first();
    }

    /**
     * Métodos de negocio
     */
    public function esEstadoReserva()
    {
        return substr($this->estado_codigo, 0, 3) === 'RES';
    }

    public function esEstadoRuta()
    {
        return substr($this->estado_codigo, 0, 3) === 'RUT';
    }

    public function esEstadoVehiculo()
    {
        return substr($this->estado_codigo, 0, 3) === 'VEH';
    }

    public function esEstadoFactura()
    {
        return substr($this->estado_codigo, 0, 3) === 'FAC';
    }

    public function permiteTransicion($estadoDestino)
    {
        $transiciones = [
            'RES_PEND' => ['RES_CONF', 'RES_CANC'],
            'RES_CONF' => ['RES_EJEC', 'RES_CANC'],
            'RES_EJEC' => ['RES_FIN'],
            'RUT_PROG' => ['RUT_INIC', 'RUT_CANC'],
            'RUT_INIC' => ['RUT_FIN'],
            'VEH_DISP' => ['VEH_OCUP', 'VEH_MANT', 'VEH_INAR'],
            'VEH_OCUP' => ['VEH_DISP', 'VEH_MANT'],
            'VEH_MANT' => ['VEH_DISP', 'VEH_INAR']
        ];

        return in_array($estadoDestino, $transiciones[$this->estado_codigo] ?? []);
    }

    public function esEstadoFinal()
    {
        return in_array($this->estado_codigo, ['RES_FIN', 'RES_CANC', 'RUT_FIN', 'RUT_CANC']);
    }

    public function esEstadoInicial()
    {
        return in_array($this->estado_codigo, ['RES_PEND', 'RUT_PROG', 'VEH_DISP']);
    }
}
