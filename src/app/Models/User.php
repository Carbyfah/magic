<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasFactory, Notifiable, SoftDeletes, HasApiTokens;

    protected $table = 'usuarios';
    protected $primaryKey = 'id_usuarios';

    protected $fillable = [
        'usuarios_nombre',
        'usuarios_correo',
        'usuario_password',
        'id_empleados',
        'created_by'
    ];

    protected $hidden = [
        'usuario_password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'usuario_password' => 'hashed',
    ];

    public function getAuthPassword()
    {
        return $this->usuario_password;
    }

    public function getEmailAttribute()
    {
        return $this->usuarios_correo;
    }

    // Relación con empleado
    public function empleado()
    {
        return $this->belongsTo(Empleado::class, 'id_empleados', 'id_empleados');
    }

    // Nombre completo del usuario
    public function getNameAttribute()
    {
        return $this->empleado ?
            $this->empleado->nombre_completo
            : $this->usuarios_nombre;
    }
}
