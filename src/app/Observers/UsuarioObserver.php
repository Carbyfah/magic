<?php

namespace App\Observers;

use App\Models\User;
use App\Models\UsuarioPermiso;

class UsuarioObserver
{
    public function created(User $usuario)
    {
        $this->crearPermisosBasicos($usuario);
    }

    private function crearPermisosBasicos(User $usuario)
    {
        // Obtener módulos dinámicamente del sistema
        $modulos = $this->obtenerModulosDelSistema();

        foreach ($modulos as $modulo) {
            UsuarioPermiso::create([
                'id_usuarios' => $usuario->id_usuarios,
                'modulo' => $modulo,
                'puede_ver' => $this->esAdministrador($usuario),
                'puede_crear' => $this->esAdministrador($usuario),
                'puede_editar' => $this->esAdministrador($usuario),
                'puede_eliminar' => $this->esAdministrador($usuario),
                'puede_exportar_excel' => $this->esAdministrador($usuario),
                'puede_exportar_pdf' => $this->esAdministrador($usuario),
                'created_by' => $usuario->id_usuarios
            ]);
        }
    }

    /**
     * Obtiene módulos dinámicamente escaneando controladores Api
     */
    private function obtenerModulosDelSistema()
    {
        $controllersPath = app_path('Http/Controllers/Api');
        $controllers = glob($controllersPath . '/*Controller.php');

        $modulos = [];

        foreach ($controllers as $controller) {
            $filename = basename($controller, '.php');

            // Convertir: AgenciasController → agencias
            $modulo = strtolower(str_replace('Controller', '', $filename));

            // Excluir controladores que no son módulos de negocio
            if (!in_array($modulo, [
                'auth',           // Autenticación
                'dashboard',      // Dashboard general
                'utils',          // Utilidades
                'notificaciones', // Notificaciones del sistema
                'auditoria',      // Auditoría del sistema
                'precio',         // Servicio de precios (no módulo)
                'estadoruta',     // Servicio de estado (no módulo)
                'transferencia',  // Servicio de transferencias (no módulo)
                'permisos'        // Gestión de permisos (no módulo de negocio)
            ])) {
                $modulos[] = $modulo;
            }
        }

        return array_unique($modulos);
    }

    /**
     * Determina si el usuario debe tener permisos de administrador
     */
    private function esAdministrador(User $usuario)
    {
        // Verificar por cargo
        if ($usuario->empleado && $usuario->empleado->cargo) {
            $cargoNombre = strtolower($usuario->empleado->cargo->cargo_nombre);

            return in_array($cargoNombre, [
                'desarrollador',
                'administrador',
                'gerente general',
                'contabilidad',
                'ventas y reservaciones',
                'reservaciones',
            ]);
        }

        // Si no tiene empleado/cargo asignado, no es admin
        return false;
    }

    /**
     * Método para agregar permisos a usuarios existentes cuando se crea un nuevo módulo
     */
    public static function sincronizarPermisosExistentes()
    {
        $instance = new self();
        $modulos = $instance->obtenerModulosDelSistema();

        // Obtener todos los usuarios activos
        $usuarios = User::whereNull('deleted_at')->get();

        foreach ($usuarios as $usuario) {
            foreach ($modulos as $modulo) {
                // Solo crear si no existe el permiso
                UsuarioPermiso::firstOrCreate(
                    [
                        'id_usuarios' => $usuario->id_usuarios,
                        'modulo' => $modulo
                    ],
                    [
                        'puede_ver' => $instance->esAdministrador($usuario),
                        'puede_crear' => $instance->esAdministrador($usuario),
                        'puede_editar' => $instance->esAdministrador($usuario),
                        'puede_eliminar' => $instance->esAdministrador($usuario),
                        'puede_exportar_excel' => $instance->esAdministrador($usuario),
                        'puede_exportar_pdf' => $instance->esAdministrador($usuario),
                        'created_by' => $usuario->id_usuarios
                    ]
                );
            }
        }
    }
}
