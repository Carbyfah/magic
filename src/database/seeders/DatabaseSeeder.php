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
            ['codigo' => 'RUT-LIQU', 'estado' => 'Liquidar Ruta', 'descripcion' => 'Lista para liquidar con egresos'],

            // Estados para RESERVAS
            ['codigo' => 'RES-PEND', 'estado' => 'Pendiente', 'descripcion' => 'Esperando confirmación'],
            ['codigo' => 'RES-CONF', 'estado' => 'Confirmada', 'descripcion' => 'Lista para ejecutar'],
            ['codigo' => 'RES-TRAN', 'estado' => 'Transferida', 'descripcion' => 'Se transfiere a una agencia'],
            ['codigo' => 'RES-REUB', 'estado' => 'Reubicar', 'descripcion' => 'Mover a otra ruta misma empresa'],
            ['codigo' => 'RES-CANC', 'estado' => 'Cancelada', 'descripcion' => 'No se ejecutará'],

            // Estados para RESERVAS (pagos)
            ['codigo' => 'RES-PAGA', 'estado' => 'Pagada', 'descripcion' => 'Cliente pagó en caja o conductor'],
            ['codigo' => 'RES-CRCB', 'estado' => 'Confirmar Recibido', 'descripcion' => 'Conductor entregó - pendiente'],

            // Estados para CONTABILIDAD (filtros)
            ['codigo' => 'CON-COBR', 'estado' => 'Por Cobrar', 'descripcion' => 'Pendiente de cobro'],
            ['codigo' => 'CON-CBRD', 'estado' => 'Cobrados', 'descripcion' => 'Ya cobrado'],

            // Estados GENERALES
            ['codigo' => 'GEN-ACTV', 'estado' => 'Activo', 'descripcion' => 'Elemento activo en el sistema'],
            ['codigo' => 'GEN-INAC', 'estado' => 'Inactivo', 'descripcion' => 'Elemento inactivo'],
        ];

        foreach ($estados as $estado) {
            DB::table('estado')->insert([
                'estado_nombre' => $estado['estado'],
                'estado_descripcion' => $estado['descripcion'],
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }
        echo "Estados creados (incluidos nuevos para Ventas y Contabilidad)\n";
    }

    private function crearCargos()
    {
        $cargos = [
            'Desarrollador',
            'Administrador'
        ];

        foreach ($cargos as $cargo) {
            DB::table('cargo')->insert([
                'cargo_nombre' => $cargo,
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }
        echo "Cargos básicos creados (Desarrollador y Administrador)\n";
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
