<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Caja extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'caja';
    protected $primaryKey = 'id_caja';

    protected $fillable = [
        'numero_voucher',
        'origen',
        'destino',
        'fecha_servicio',
        'pax_adultos',
        'pax_ninos',
        'total_pax',
        'precio_unitario',
        'precio_total',
        'direccion',
        'servicio_cobrar_pax',
        'servicio_precio_descuento',
        'voucher_caja',
        'enlace_sat',
        'id_reservas',
        'estado_id',
        'created_by'
    ];

    protected $casts = [
        'fecha_servicio' => 'datetime',
        'pax_adultos' => 'integer',
        'pax_ninos' => 'integer',
        'total_pax' => 'integer',
        'precio_unitario' => 'decimal:2',
        'precio_total' => 'decimal:2',
        'servicio_cobrar_pax' => 'decimal:2',
        'servicio_precio_descuento' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime'
    ];

    // Relaciones
    public function reserva()
    {
        return $this->belongsTo(Reserva::class, 'id_reservas', 'id_reservas');
    }

    public function estado()
    {
        return $this->belongsTo(Estado::class, 'estado_id', 'estado_id');
    }

    public function facturasSat()
    {
        return $this->hasMany(FacturaSat::class, 'id_caja', 'id_caja');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by', 'id_usuarios');
    }

    // Accessors
    public function getGananciaBrutaAttribute()
    {
        return $this->servicio_cobrar_pax - $this->servicio_precio_descuento;
    }

    public function getRutaCompletaAttribute()
    {
        return "{$this->origen} -> {$this->destino}";
    }

    // Scopes
    public function scopePorFecha($query, $fecha)
    {
        return $query->whereDate('fecha_servicio', $fecha);
    }

    public function scopeDelDia($query)
    {
        return $query->whereDate('fecha_servicio', today());
    }

    public function scopeConFactura($query)
    {
        return $query->whereHas('facturasSat');
    }

    public function scopeSinFactura($query)
    {
        return $query->whereDoesntHave('facturasSat');
    }
}
