<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     * Crea el usuario desarrollador administrador para Magic Travel
     */
    public function run(): void
    {
        echo "Iniciando seeding de Magic Travel...\n";

        $this->crearUsuarioDesarrollador();

        echo "Seeding completado exitosamente.\n";
    }

    /**
     * Crear usuario desarrollador administrador
     */
    private function crearUsuarioDesarrollador()
    {
        // Verificar que no exista ya el usuario desarrollador
        $existeUsuario = DB::table('usuario')->where('usuario_codigo', 'DEV-ADMIN-001')->exists();

        if ($existeUsuario) {
            echo "Usuario desarrollador ya existe, saltando creación...\n";
            return;
        }

        // PASO 1: Crear/Verificar Tipo de Persona "Administrador"
        $tipoPersonaId = DB::table('tipo_persona')->where('tipo_persona_codigo', 'ADMIN')->value('tipo_persona_id');

        if (!$tipoPersonaId) {
            $tipoPersonaId = DB::table('tipo_persona')->insertGetId([
                'tipo_persona_codigo' => 'ADMIN',
                'tipo_persona_tipo' => 'Administrador',
                'tipo_persona_situacion' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ]);
            echo "Tipo persona 'Administrador' creado con ID: {$tipoPersonaId}\n";
        }

        // PASO 2: Crear/Verificar Rol "Administrador"
        $rolId = DB::table('rol')->where('rol_codigo', 'ADMIN')->value('rol_id');

        if (!$rolId) {
            $rolId = DB::table('rol')->insertGetId([
                'rol_codigo' => 'ADMIN',
                'rol_rol' => 'Administrador',
                'rol_descripcion' => 'Administrador del sistema con acceso completo',
                'rol_situacion' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ]);
            echo "Rol 'Administrador' creado con ID: {$rolId}\n";
        }

        // PASO 3: Crear Estados básicos si no existen
        $this->crearEstadosBasicos();

        // PASO 4: Crear Persona del Desarrollador
        $personaId = DB::table('persona')->insertGetId([
            'persona_codigo' => 'DEV-ADMIN-001',
            'persona_nombres' => 'Desarrollador',
            'persona_apellidos' => 'Sistema Magic Travel',
            'persona_telefono' => 50212345678, // Número genérico Guatemala
            'persona_email' => 'admin@magictravel.gt',
            'persona_situacion' => 1,
            'tipo_persona_id' => $tipoPersonaId,
            'created_at' => now(),
            'updated_at' => now()
        ]);
        echo "Persona desarrollador creada con ID: {$personaId}\n";

        // PASO 5: Crear Usuario con contraseña hasheada
        $passwordPlano = 'MagicTravel2025!'; // Contraseña segura
        $passwordHash = Hash::make($passwordPlano);

        $usuarioId = DB::table('usuario')->insertGetId([
            'usuario_codigo' => 'DEV-ADMIN-001',
            'usuario_password' => $passwordHash,
            'usuario_situacion' => 1,
            'persona_id' => $personaId,
            'rol_id' => $rolId,
            'created_at' => now(),
            'updated_at' => now()
        ]);

        // MOSTRAR INFORMACIÓN DEL USUARIO CREADO
        echo "\n" . str_repeat("=", 60) . "\n";
        echo "USUARIO DESARROLLADOR ADMINISTRADOR CREADO EXITOSAMENTE\n";
        echo str_repeat("=", 60) . "\n";
        echo "ID Usuario: {$usuarioId}\n";
        echo "Código: DEV-ADMIN-001\n";
        echo "Contraseña: {$passwordPlano}\n";
        echo "Email: admin@magictravel.gt\n";
        echo "Rol: Administrador (acceso completo)\n";
        echo "Estado: Activo\n";
        echo str_repeat("=", 60) . "\n";
        echo "IMPORTANTE: Cambie la contraseña después del primer login\n";
        echo str_repeat("=", 60) . "\n\n";
    }

    /**
     * Crear estados específicos de Magic Travel con códigos contextuales
     */
    private function crearEstadosBasicos()
    {
        // Estados para VEHÍCULOS (prefijo VEH-)
        $estadosVehiculos = [
            ['codigo' => 'VEH-DISP', 'estado' => 'Disponible', 'descripcion' => 'Puede asignarse a rutas'],
            ['codigo' => 'VEH-MANT', 'estado' => 'Mantenimiento', 'descripcion' => 'En taller o reparación'],
            ['codigo' => 'VEH-ASIG', 'estado' => 'Asignado', 'descripcion' => 'En ruta activa']
        ];

        // Estados para RUTAS ACTIVADAS (prefijo RUT-)
        $estadosRutas = [
            ['codigo' => 'RUT-ACTV', 'estado' => 'Activada', 'descripcion' => 'Puede recibir reservas'],
            ['codigo' => 'RUT-LLEN', 'estado' => 'Llena', 'descripcion' => 'Capacidad completa'],
            ['codigo' => 'RUT-EJEC', 'estado' => 'Ejecución', 'descripcion' => 'En viaje'],
            ['codigo' => 'RUT-CERR', 'estado' => 'Cerrada', 'descripcion' => 'Completada']
        ];

        // Estados para TOURS ACTIVADOS (prefijo TOU-)
        $estadosTours = [
            ['codigo' => 'TOU-ACTV', 'estado' => 'Activado', 'descripcion' => 'Puede recibir reservas'],
            ['codigo' => 'TOU-EJEC', 'estado' => 'En Ejecución', 'descripcion' => 'Tour en progreso'],
            ['codigo' => 'TOU-CERR', 'estado' => 'Cerrado', 'descripcion' => 'Tour completado']
        ];

        // Estados para RESERVAS (prefijo RES-)
        $estadosReservas = [
            ['codigo' => 'RES-PEND', 'estado' => 'Pendiente', 'descripcion' => 'Esperando confirmación'],
            ['codigo' => 'RES-CONF', 'estado' => 'Confirmada', 'descripcion' => 'Listo para facturar'],
            ['codigo' => 'RES-CANC', 'estado' => 'Cancelada', 'descripcion' => 'No se puede modificar']
        ];

        // Estados para FACTURAS (prefijo FAC-) - opcional
        $estadosFacturas = [
            ['codigo' => 'FAC-PEND', 'estado' => 'Pendiente', 'descripcion' => 'Pendiente de pago'],
            ['codigo' => 'FAC-PAGA', 'estado' => 'Pagada', 'descripcion' => 'Pago completado'],
            ['codigo' => 'FAC-ANUL', 'estado' => 'Anulada', 'descripcion' => 'Factura anulada']
        ];

        // Combinar todos los estados
        $todosLosEstados = array_merge(
            $estadosVehiculos,
            $estadosRutas,
            $estadosTours,
            $estadosReservas,
            $estadosFacturas
        );

        echo "Creando estados específicos de Magic Travel con códigos contextuales...\n";

        foreach ($todosLosEstados as $estado) {
            $existe = DB::table('estado')->where('estado_codigo', $estado['codigo'])->exists();

            if (!$existe) {
                DB::table('estado')->insert([
                    'estado_codigo' => $estado['codigo'],
                    'estado_estado' => $estado['estado'],
                    'estado_descripcion' => $estado['descripcion'],
                    'estado_situacion' => 1,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
                echo "Estado '{$estado['estado']}' ({$estado['codigo']}) creado\n";
            }
        }

        echo "Estados de Magic Travel creados exitosamente con códigos contextuales\n";
    }
}
