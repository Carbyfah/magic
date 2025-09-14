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

        $this->crearAgencias();
        $this->crearEstados();
        $this->crearCargos();
        $this->crearEmpleados();
        $this->crearUsuarios();

        echo "Seeding completo exitoso.\n";
    }

    private function crearAgencias()
    {
        DB::table('agencias')->insert([
            'agencias_nombre' => 'Magic Travel',
            'created_at' => now(),
            'updated_at' => now()
        ]);
        echo "Agencia Magic Travel creada\n";
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
            ['codigo' => 'RES-TRAN', 'estado' => 'Transferida', 'descripcion' => 'Se transfiere a una agencia'],
            ['codigo' => 'RES-CANC', 'estado' => 'Cancelada', 'descripcion' => 'No se ejecutará'],

            // Estados para FACTURAS
            ['codigo' => 'FAC-PEND', 'estado' => 'Pendiente', 'descripcion' => 'Pendiente de pago'],
            ['codigo' => 'FAC-PAGA', 'estado' => 'Pagada', 'descripcion' => 'Pago completado'],
            ['codigo' => 'FAC-ANUL', 'estado' => 'Anulada', 'descripcion' => 'Factura anulada'],
        ];

        foreach ($estados as $estado) {
            DB::table('estado')->insert([
                'estado_nombre' => $estado['estado'],
                'estado_descripcion' => $estado['descripcion'],
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }
        echo "Estados creados\n";
    }

    private function crearCargos()
    {
        DB::table('cargo')->insert([
            'cargo_nombre' => 'Desarrollador',
            'created_at' => now(),
            'updated_at' => now()
        ]);
        echo "Cargo Desarrollador creado\n";
    }

    private function crearEmpleados()
    {
        $agenciaMagicTravel = DB::table('agencias')->where('agencias_nombre', 'Magic Travel')->value('id_agencias');
        $cargoDesarrollador = DB::table('cargo')->where('cargo_nombre', 'Desarrollador')->value('id_cargo');

        DB::table('empleados')->insert([
            'empleados_nombres' => 'Desarrollador',
            'empleados_apellidos' => 'Magic Travel',
            'id_agencias' => $agenciaMagicTravel,
            'id_cargo' => $cargoDesarrollador,
            'created_at' => now(),
            'updated_at' => now()
        ]);
        echo "Empleado Desarrollador creado\n";
    }

    private function crearUsuarios()
    {
        $empleadoDesarrollador = DB::table('empleados')->where('empleados_nombres', 'Desarrollador')->value('id_empleados');

        DB::table('usuarios')->insert([
            'usuarios_nombre' => 'Desarrollador',
            'usuarios_correo' => 'carbyfah@gmail.com',
            'usuario_password' => Hash::make('Desarrollador2025!'),
            'id_empleados' => $empleadoDesarrollador,
            'created_at' => now(),
            'updated_at' => now()
        ]);

        echo "\n" . str_repeat("=", 60) . "\n";
        echo "USUARIO CREADO:\n";
        echo "Email: carbyfah@gmail.com\n";
        echo "Password: Desarrollador2025!\n";
        echo str_repeat("=", 60) . "\n";
    }
}
