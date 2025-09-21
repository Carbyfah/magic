<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class DatosReservaCliente extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'datos_reservas_clientes';
    protected $primaryKey = 'id_datos_reservas_clientes';

    protected $fillable = [
        'datos_reservas_clientes_nombres',
        'datos_reservas_clientes_apellidos',
        'id_reservas',
        'created_by'
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime'
    ];

    // Relaciones
    public function reserva()
    {
        return $this->belongsTo(Reserva::class, 'id_reservas', 'id_reservas');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by', 'id_usuarios');
    }

    // Accessors
    public function getNombreCompletoAttribute()
    {
        return "{$this->datos_reservas_clientes_nombres} {$this->datos_reservas_clientes_apellidos}";
    }
}
