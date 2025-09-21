<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class FacturaSat extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'facturas_sat';
    protected $primaryKey = 'id_facturas_sat';

    protected $fillable = [
        'numero_documento',
        'gran_total',
        'serie',
        'numero_uuid',
        'fecha_emision',
        'nit_receptor',
        'nombre_receptor',
        'enlace_consulta',
        'datos_completos',
        'id_caja',
        'created_by'
    ];

    protected $casts = [
        'gran_total' => 'decimal:2',
        'fecha_emision' => 'datetime',
        'datos_completos' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime'
    ];

    // Relaciones
    public function caja()
    {
        return $this->belongsTo(Caja::class, 'id_caja', 'id_caja');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by', 'id_usuarios');
    }

    // Accessors
    public function getNumeroCompletoAttribute()
    {
        return $this->serie ? "{$this->serie}-{$this->numero_documento}" : $this->numero_documento;
    }

    // Scopes
    public function scopePorFecha($query, $fecha)
    {
        return $query->whereDate('fecha_emision', $fecha);
    }

    public function scopePorNit($query, $nit)
    {
        return $query->where('nit_receptor', $nit);
    }
}
