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
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime'
    ];

    public function getAuthPassword()
    {
        return $this->usuario_password;
    }

    public function getEmailAttribute()
    {
        return $this->usuarios_correo;
    }

    // Relaciones
    public function empleado()
    {
        return $this->belongsTo(Empleado::class, 'id_empleados', 'id_empleados');
    }

    public function permisos()
    {
        return $this->hasMany(UsuarioPermiso::class, 'id_usuarios', 'id_usuarios');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by', 'id_usuarios');
    }

    // Accessors
    public function getNameAttribute()
    {
        return $this->empleado ?
            $this->empleado->nombre_completo
            : $this->usuarios_nombre;
    }

    // Métodos de permisos
    public function tienePermiso($modulo, $accion)
    {
        return $this->permisos()
            ->where('modulo', $modulo)
            ->where("puede_{$accion}", true)
            ->exists();
    }

    public function obtenerPermisos()
    {
        return $this->permisos()
            ->get()
            ->keyBy('modulo')
            ->map(function ($permiso) {
                return [
                    'ver' => $permiso->puede_ver,
                    'crear' => $permiso->puede_crear,
                    'editar' => $permiso->puede_editar,
                    'eliminar' => $permiso->puede_eliminar,
                    'exportar_excel' => $permiso->puede_exportar_excel,
                    'exportar_pdf' => $permiso->puede_exportar_pdf
                ];
            });
    }

    public function puedeVer($modulo)
    {
        return $this->tienePermiso($modulo, 'ver');
    }

    public function puedeCrear($modulo)
    {
        return $this->tienePermiso($modulo, 'crear');
    }

    public function puedeEditar($modulo)
    {
        return $this->tienePermiso($modulo, 'editar');
    }

    public function puedeEliminar($modulo)
    {
        return $this->tienePermiso($modulo, 'eliminar');
    }

    // Scopes
    public function scopeConPermisos($query)
    {
        return $query->with('permisos');
    }

    public function scopeAdministradores($query)
    {
        return $query->whereHas('permisos', function ($q) {
            $q->where('modulo', 'configuracion')
                ->where('puede_editar', true);
        });
    }
}
