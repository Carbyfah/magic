<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Tour extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'tours';
    protected $primaryKey = 'id_tour';

    protected $fillable = [
        'tours_nombre',
        'id_agencias',
        'created_by'
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime'
    ];

    // Relaciones
    public function agencia()
    {
        return $this->belongsTo(Agencia::class, 'id_agencias', 'id_agencias');
    }

    public function toursActivos()
    {
        return $this->hasMany(TourActivo::class, 'id_tour', 'id_tour');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by', 'id_usuarios');
    }

    // Scopes
    public function scopePorAgencia($query, $agenciaId)
    {
        return $query->where('id_agencias', $agenciaId);
    }

    public function scopePorNombre($query, $nombre)
    {
        return $query->where('tours_nombre', 'like', "%{$nombre}%");
    }
}
