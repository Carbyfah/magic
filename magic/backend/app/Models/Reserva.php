<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Reserva extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'reservas';
    protected $primaryKey = 'id_reservas';

    protected $fillable = [
        'reservas_cantidad_adultos',
        'reservas_cantidad_ninos',
        'reservas_nombres_cliente',
        'reservas_apellidos_cliente',
        'reservas_direccion_abordaje',
        'reservas_telefono_cliente',
        'reservas_cliente_nit',
        'reservas_habitacion_pax',
        'reservas_transferido_por',
        'reservas_notas',
        'reservas_cobrar_a_pax',
        'reservas_voucher',
        'id_agencia_transferida',
        'id_servicio',
        'estado_id',
        'id_ruta_activa',
        'id_tour_activo',
        'created_by'
    ];

    protected $casts = [
        'reservas_cantidad_adultos' => 'integer',
        'reservas_cantidad_ninos' => 'integer',
        'reservas_cobrar_a_pax' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime'
    ];

    // Relaciones
    public function servicio()
    {
        return $this->belongsTo(Servicio::class, 'id_servicio', 'id_servicio');
    }

    public function estado()
    {
        return $this->belongsTo(Estado::class, 'estado_id', 'estado_id');
    }

    public function rutaActiva()
    {
        return $this->belongsTo(RutaActiva::class, 'id_ruta_activa', 'id_ruta_activa');
    }

    public function tourActivo()
    {
        return $this->belongsTo(TourActivo::class, 'id_tour_activo', 'id_tour_activo');
    }

    public function agenciaTransferida()
    {
        return $this->belongsTo(Agencia::class, 'id_agencia_transferida', 'id_agencias');
    }

    public function datosClientes()
    {
        return $this->hasMany(DatosReservaCliente::class, 'id_reservas', 'id_reservas');
    }

    public function caja()
    {
        return $this->hasOne(Caja::class, 'id_reservas', 'id_reservas');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by', 'id_usuarios');
    }

    // Accessors
    public function getTotalPasajerosAttribute()
    {
        return $this->reservas_cantidad_adultos + ($this->reservas_cantidad_ninos ?? 0);
    }

    public function getNombreCompletoClienteAttribute()
    {
        return "{$this->reservas_nombres_cliente} {$this->reservas_apellidos_cliente}";
    }

    public function getTipoServicioAttribute()
    {
        if ($this->id_ruta_activa) {
            return 'RUTA';
        } elseif ($this->id_tour_activo) {
            return 'TOUR';
        }
        return 'INDEFINIDO';
    }

    public function getEsVentaDirectaAttribute()
    {
        return is_null($this->id_agencia_transferida);
    }

    public function getEsTransferenciaAttribute()
    {
        return !is_null($this->id_agencia_transferida);
    }

    // Scopes
    public function scopeVentasDirectas($query)
    {
        return $query->whereNull('id_agencia_transferida');
    }

    public function scopeTransferencias($query)
    {
        return $query->whereNotNull('id_agencia_transferida');
    }

    public function scopeDeRuta($query)
    {
        return $query->whereNotNull('id_ruta_activa');
    }

    public function scopeDeTour($query)
    {
        return $query->whereNotNull('id_tour_activo');
    }

    public function scopePorEstado($query, $estadoNombre)
    {
        return $query->whereHas('estado', function ($q) use ($estadoNombre) {
            $q->where('estado_nombre', 'like', "%{$estadoNombre}%");
        });
    }

    public function scopeConfirmadas($query)
    {
        return $query->porEstado('confirmada');
    }

    public function scopePendientes($query)
    {
        return $query->porEstado('pendiente');
    }

    public function scopePagadas($query)
    {
        return $query->porEstado('pagada');
    }

    public function scopePorFecha($query, $fecha)
    {
        return $query->whereHas('rutaActiva', function ($q) use ($fecha) {
            $q->whereDate('ruta_activa_fecha', $fecha);
        })->orWhereHas('tourActivo', function ($q) use ($fecha) {
            $q->whereDate('tour_activo_fecha', $fecha);
        });
    }
}
