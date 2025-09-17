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
        'puede_exportar_excel',
        'puede_exportar_pdf',
        'created_by'
    ];

    protected $casts = [
        'puede_ver' => 'boolean',
        'puede_crear' => 'boolean',
        'puede_editar' => 'boolean',
        'puede_eliminar' => 'boolean',
        'puede_exportar_excel' => 'boolean',
        'puede_exportar_pdf' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime'
    ];

    // DINÁMICO: Obtener módulos del sistema automáticamente
    public static function getModulosDisponibles()
    {
        $controllersPath = app_path('Http/Controllers/Api');
        $controllers = glob($controllersPath . '/*Controller.php');

        $modulos = [];

        foreach ($controllers as $controller) {
            $filename = basename($controller, '.php');
            $modulo = strtolower(str_replace('Controller', '', $filename));

            // Excluir controladores que no son módulos de negocio
            if (!in_array($modulo, [
                'auth',
                'dashboard',
                'utils',
                'notificaciones',
                'auditoria',
                'precio',
                'estadoruta',
                'transferencia',
                'permisos'
            ])) {
                $nombre = ucfirst($modulo);
                $modulos[$modulo] = $nombre;
            }
        }

        return $modulos;
    }

    // Resto de métodos sin cambios...
    public function usuario()
    {
        return $this->belongsTo(User::class, 'id_usuarios', 'id_usuarios');
    }

    public static function tienePermiso($usuarioId, $modulo, $accion)
    {
        return self::where('id_usuarios', $usuarioId)
            ->where('modulo', $modulo)
            ->where("puede_{$accion}", true)
            ->exists();
    }
}
