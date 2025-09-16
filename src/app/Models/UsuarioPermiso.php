<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class UsuarioPermiso extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'usuarios_permisos';
    protected $primaryKey = 'id_usuarios_permisos';

    protected $fillable = [
        'id_usuarios',
        'modulo',
        'puede_ver',
        'puede_crear',
        'puede_editar',
        'puede_eliminar',
        'created_by'
    ];

    protected $casts = [
        'puede_ver' => 'boolean',
        'puede_crear' => 'boolean',
        'puede_editar' => 'boolean',
        'puede_eliminar' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime'
    ];

    // Módulos disponibles en el sistema
    public static $modulosDisponibles = [
        'reservas' => 'Reservas',
        'rutas' => 'Rutas',
        'tours' => 'Tours',
        'vehiculos' => 'Vehículos',
        'empleados' => 'Empleados',
        'reportes' => 'Reportes',
        'configuracion' => 'Configuración',
        'agencias' => 'Agencias',
        'ventas' => 'Ventas',
        'contabilidad' => 'Contabilidad'
    ];

    // Relaciones
    public function usuario()
    {
        return $this->belongsTo(User::class, 'id_usuarios', 'id_usuarios');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by', 'id_usuarios');
    }

    // Scopes
    public function scopePorUsuario($query, $usuarioId)
    {
        return $query->where('id_usuarios', $usuarioId);
    }

    public function scopePorModulo($query, $modulo)
    {
        return $query->where('modulo', $modulo);
    }

    public function scopeConAcceso($query, $accion)
    {
        return $query->where("puede_{$accion}", true);
    }

    // Métodos estáticos de utilidad
    public static function tienePermiso($usuarioId, $modulo, $accion)
    {
        return self::where('id_usuarios', $usuarioId)
            ->where('modulo', $modulo)
            ->where("puede_{$accion}", true)
            ->exists();
    }

    public static function obtenerPermisosUsuario($usuarioId)
    {
        return self::where('id_usuarios', $usuarioId)
            ->get()
            ->keyBy('modulo')
            ->map(function ($permiso) {
                return [
                    'ver' => $permiso->puede_ver,
                    'crear' => $permiso->puede_crear,
                    'editar' => $permiso->puede_editar,
                    'eliminar' => $permiso->puede_eliminar
                ];
            });
    }
}
