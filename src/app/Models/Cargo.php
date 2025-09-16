<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Cargo extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'cargo';
    protected $primaryKey = 'id_cargo';

    protected $fillable = [
        'cargo_nombre',
        'created_by'
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime'
    ];

    // Relaciones
    public function empleados()
    {
        return $this->hasMany(Empleado::class, 'id_cargo', 'id_cargo');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by', 'id_usuarios');
    }

    // Scopes
    public function scopePorNombre($query, $nombre)
    {
        return $query->where('cargo_nombre', 'like', "%{$nombre}%");
    }
}
