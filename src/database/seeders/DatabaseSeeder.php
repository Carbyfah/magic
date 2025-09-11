<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        echo "Iniciando seeding completo de Magic Travel...\n";

        $this->crearTiposPersona();
        $this->crearRoles();
        $this->crearEstados();
        $this->crearPersonas();
        $this->crearUsuarios();

        echo "Seeding completo exitoso.\n";
    }

    private function crearTiposPersona()
    {
        $tipos = [
            ['codigo' => 'EMP', 'tipo' => 'Empleado', 'descripcion' => 'Personal interno de Magic Travel'],
            ['codigo' => 'COND', 'tipo' => 'Conductor', 'descripcion' => 'Conductores de vehículos'],
            ['codigo' => 'GUIA', 'tipo' => 'Guía', 'descripcion' => 'Guías turísticos internos'],
            ['codigo' => 'ADMIN', 'tipo' => 'Administrador', 'descripcion' => 'Personal administrativo'],
        ];

        foreach ($tipos as $tipo) {
            DB::table('tipo_persona')->insert([
                'tipo_persona_codigo' => $tipo['codigo'],
                'tipo_persona_tipo' => $tipo['tipo'],
                'tipo_persona_situacion' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }
        echo "Tipos de persona creados\n";
    }

    private function crearRoles()
    {
        $roles = [
            ['codigo' => 'ADMIN', 'rol' => 'Administrador', 'descripcion' => 'Acceso completo al sistema'],
            ['codigo' => 'OPER', 'rol' => 'Operador', 'descripcion' => 'Gestión operacional'],
            ['codigo' => 'VEND', 'rol' => 'Vendedor', 'descripcion' => 'Gestión comercial y reservas'],
        ];

        foreach ($roles as $rol) {
            DB::table('rol')->insert([
                'rol_codigo' => $rol['codigo'],
                'rol_rol' => $rol['rol'],
                'rol_descripcion' => $rol['descripcion'],
                'rol_situacion' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }
        echo "Roles creados\n";
    }

    private function crearEstados()
    {
        $estados = [
            // Estados para VEHÍCULOS
            ['codigo' => 'VEH-DISP', 'estado' => 'Disponible', 'descripcion' => 'Puede asignarse a rutas'],
            ['codigo' => 'VEH-MANT', 'estado' => 'Mantenimiento', 'descripcion' => 'En taller o reparación'],
            ['codigo' => 'VEH-ASIG', 'estado' => 'Asignado', 'descripcion' => 'En ruta activa'],

            // Estados para RUTAS ACTIVADAS
            ['codigo' => 'RUT-ACTV', 'estado' => 'Activada', 'descripcion' => 'Puede recibir reservas'],
            ['codigo' => 'RUT-LLEN', 'estado' => 'Llena', 'descripcion' => 'Capacidad completa'],
            ['codigo' => 'RUT-EJEC', 'estado' => 'Ejecución', 'descripcion' => 'En viaje'],
            ['codigo' => 'RUT-CERR', 'estado' => 'Cerrada', 'descripcion' => 'Completada'],

            // Estados para RESERVAS
            ['codigo' => 'RES-PEND', 'estado' => 'Pendiente', 'descripcion' => 'Esperando confirmación'],
            ['codigo' => 'RES-CONF', 'estado' => 'Confirmada', 'descripcion' => 'Lista para ejecutar'],
            ['codigo' => 'RES-CANC', 'estado' => 'Cancelada', 'descripcion' => 'No se ejecutará'],

            // Estados para FACTURAS
            ['codigo' => 'FAC-PEND', 'estado' => 'Pendiente', 'descripcion' => 'Pendiente de pago'],
            ['codigo' => 'FAC-PAGA', 'estado' => 'Pagada', 'descripcion' => 'Pago completado'],
            ['codigo' => 'FAC-ANUL', 'estado' => 'Anulada', 'descripcion' => 'Factura anulada'],
        ];

        foreach ($estados as $estado) {
            DB::table('estado')->insert([
                'estado_codigo' => $estado['codigo'],
                'estado_estado' => $estado['estado'],
                'estado_descripcion' => $estado['descripcion'],
                'estado_situacion' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }
        echo "Estados creados\n";
    }


    private function crearPersonas()
    {
        $tipoAdmin = DB::table('tipo_persona')->where('tipo_persona_codigo', 'ADMIN')->value('tipo_persona_id');
        $tipoEmpleado = DB::table('tipo_persona')->where('tipo_persona_codigo', 'EMP')->value('tipo_persona_id');
        $tipoConductor = DB::table('tipo_persona')->where('tipo_persona_codigo', 'COND')->value('tipo_persona_id');
        $tipoGuia = DB::table('tipo_persona')->where('tipo_persona_codigo', 'GUIA')->value('tipo_persona_id');

        $personas = [
            ['codigo' => 'PER-001', 'nombres' => 'Admin', 'apellidos' => 'Sistema', 'telefono' => 50212345678, 'email' => 'admin@magictravel.gt', 'tipo' => $tipoAdmin],
            ['codigo' => 'PER-002', 'nombres' => 'Carlos', 'apellidos' => 'Operador', 'telefono' => 50123456789, 'email' => 'operador@magictravel.gt', 'tipo' => $tipoEmpleado],
            ['codigo' => 'PER-003', 'nombres' => 'María', 'apellidos' => 'Vendedora', 'telefono' => 50234567890, 'email' => 'vendedora@magictravel.gt', 'tipo' => $tipoEmpleado],
            ['codigo' => 'PER-004', 'nombres' => 'José', 'apellidos' => 'García', 'telefono' => 50345678901, 'email' => 'conductor1@magictravel.gt', 'tipo' => $tipoConductor],
            ['codigo' => 'PER-005', 'nombres' => 'Ana', 'apellidos' => 'López', 'telefono' => 50456789012, 'email' => 'guia1@magictravel.gt', 'tipo' => $tipoGuia],
        ];

        foreach ($personas as $persona) {
            DB::table('persona')->insert([
                'persona_codigo' => $persona['codigo'],
                'persona_nombres' => $persona['nombres'],
                'persona_apellidos' => $persona['apellidos'],
                'persona_telefono' => $persona['telefono'],
                'persona_email' => $persona['email'],
                'persona_situacion' => 1,
                'tipo_persona_id' => $persona['tipo'],
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }
        echo "Personas creadas\n";
    }

    private function crearUsuarios()
    {
        $rolAdmin = DB::table('rol')->where('rol_codigo', 'ADMIN')->value('rol_id');
        $rolOperador = DB::table('rol')->where('rol_codigo', 'OPER')->value('rol_id');
        $rolVendedor = DB::table('rol')->where('rol_codigo', 'VEND')->value('rol_id');

        $personaAdmin = DB::table('persona')->where('persona_codigo', 'PER-001')->value('persona_id');
        $personaOperador = DB::table('persona')->where('persona_codigo', 'PER-002')->value('persona_id');
        $personaVendedora = DB::table('persona')->where('persona_codigo', 'PER-003')->value('persona_id');

        $usuarios = [
            ['codigo' => 'USR-001', 'password' => 'MagicTravel2025!', 'persona_id' => $personaAdmin, 'rol_id' => $rolAdmin],
            ['codigo' => 'USR-002', 'password' => 'Operador123!', 'persona_id' => $personaOperador, 'rol_id' => $rolOperador],
            ['codigo' => 'USR-003', 'password' => 'Vendedora123!', 'persona_id' => $personaVendedora, 'rol_id' => $rolVendedor],
        ];

        foreach ($usuarios as $usuario) {
            DB::table('usuario')->insert([
                'usuario_codigo' => $usuario['codigo'],
                'usuario_password' => Hash::make($usuario['password']),
                'usuario_situacion' => 1,
                'persona_id' => $usuario['persona_id'],
                'rol_id' => $usuario['rol_id'],
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }

        echo "\n" . str_repeat("=", 60) . "\n";
        echo "USUARIOS CREADOS:\n";
        echo "Admin: USR-001 / MagicTravel2025!\n";
        echo "Operador: USR-002 / Operador123!\n";
        echo "Vendedora: USR-003 / Vendedora123!\n";
        echo str_repeat("=", 60) . "\n";
    }
}
