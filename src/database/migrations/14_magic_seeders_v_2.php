<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * MIGRACIÓN SEEDERS MAGIC TRAVEL v2.0
     * Datos iniciales necesarios para el funcionamiento del sistema
     * Orden: Estados → Tipos → Usuarios → Datos operativos
     */
    public function up()
    {
        $this->seedEstados();
        $this->seedTiposPersona();
        $this->seedRoles();
        $this->seedUsuarioAdmin();
        $this->seedServicios();
        $this->seedRutas();
        $this->seedAgencias();
        $this->seedVehiculos();
    }

    /**
     * Estados del sistema (críticos para el funcionamiento)
     */
    private function seedEstados()
    {
        $estados = [
            // Estados de Reservas
            ['RES_PEND', 'Reserva Pendiente', 'Reserva creada, esperando confirmación'],
            ['RES_CONF', 'Reserva Confirmada', 'Reserva confirmada y pagada'],
            ['RES_EJEC', 'Reserva en Ejecución', 'Servicio siendo ejecutado'],
            ['RES_FIN', 'Reserva Finalizada', 'Servicio completado exitosamente'],
            ['RES_CANC', 'Reserva Cancelada', 'Reserva cancelada por cliente o empresa'],

            // Estados de Rutas Activadas
            ['RUT_PROG', 'Ruta Programada', 'Ruta programada, esperando pasajeros'],
            ['RUT_INIC', 'Ruta Iniciada', 'Ruta en curso'],
            ['RUT_FIN', 'Ruta Finalizada', 'Ruta completada'],
            ['RUT_CANC', 'Ruta Cancelada', 'Ruta cancelada'],

            // Estados de Vehículos
            ['VEH_DISP', 'Vehículo Disponible', 'Vehículo disponible para asignación'],
            ['VEH_OCUP', 'Vehículo Ocupado', 'Vehículo en servicio'],
            ['VEH_MANT', 'Vehículo en Mantenimiento', 'Vehículo fuera de servicio'],
            ['VEH_INAR', 'Vehículo Inactivo', 'Vehículo dado de baja'],

            // Estados de Facturas
            ['FAC_PEND', 'Factura Pendiente', 'Factura generada, pendiente de envío'],
            ['FAC_ENV', 'Factura Enviada', 'Factura enviada al cliente'],
            ['FAC_PAG', 'Factura Pagada', 'Factura pagada por el cliente'],
            ['FAC_ANUL', 'Factura Anulada', 'Factura anulada']
        ];

        foreach ($estados as $index => $estado) {
            DB::table('estado')->insert([
                'estado_codigo' => $estado[0],
                'estado_estado' => $estado[1],
                'estado_descripcion' => $estado[2],
                'estado_situacion' => 1,
                'created_at' => now(),
                'created_by' => 1
            ]);
        }
    }

    /**
     * Tipos de persona
     */
    private function seedTiposPersona()
    {
        $tipos = [
            ['ADMIN', 'Administrador'],
            ['VEND', 'Vendedor'],
            ['CHOF', 'Chofer'],
            ['CLIE', 'Cliente'],
            ['CONT', 'Contacto Agencia']
        ];

        foreach ($tipos as $tipo) {
            DB::table('tipo_persona')->insert([
                'tipo_persona_codigo' => $tipo[0],
                'tipo_persona_tipo' => $tipo[1],
                'tipo_persona_situacion' => 1,
                'created_at' => now(),
                'created_by' => 1
            ]);
        }
    }

    /**
     * Roles del sistema
     */
    private function seedRoles()
    {
        $roles = [
            ['ADMIN', 'Administrador', 'Control total del sistema'],
            ['GERENTE', 'Gerente', 'Supervisión y reportes'],
            ['VENDEDOR', 'Vendedor', 'Gestión de reservas y clientes'],
            ['CHOFER', 'Chofer', 'Visualización de rutas asignadas'],
            ['OPERADOR', 'Operador', 'Operaciones diarias']
        ];

        foreach ($roles as $rol) {
            DB::table('rol')->insert([
                'rol_codigo' => $rol[0],
                'rol_rol' => $rol[1],
                'rol_descripcion' => $rol[2],
                'rol_situacion' => 1,
                'created_at' => now(),
                'created_by' => 1
            ]);
        }
    }

    /**
     * Usuario administrador inicial
     */
    private function seedUsuarioAdmin()
    {
        // Crear persona admin
        $personaId = DB::table('persona')->insertGetId([
            'persona_codigo' => 'ADMIN001',
            'persona_nombres' => 'Administrador',
            'persona_apellidos' => 'Sistema',
            'persona_telefono' => 50212345678,
            'persona_email' => 'admin@magictravel.gt',
            'persona_situacion' => 1,
            'tipo_persona_id' => 1, // ADMIN
            'created_at' => now(),
            'created_by' => 1
        ]);

        // Crear usuario admin
        DB::table('usuario')->insert([
            'usuario_codigo' => 'admin',
            'usuario_password' => password_hash('MagicTravel2025!', PASSWORD_DEFAULT),
            'usuario_situacion' => 1,
            'persona_id' => $personaId,
            'rol_id' => 1, // ADMIN
            'created_at' => now(),
            'created_by' => 1
        ]);
    }

    /**
     * Servicios básicos
     */
    private function seedServicios()
    {
        $servicios = [
            ['TRANS_STD', 'Transporte Estándar', 150.00, 120.00, 150.00],
            ['TRANS_PREM', 'Transporte Premium', 200.00, 160.00, 200.00],
            ['TOUR_ANTI', 'Tour Antigua', 250.00, 200.00, 250.00],
            ['TOUR_TIKAL', 'Tour Tikal', 350.00, 280.00, 350.00],
            ['TOUR_ATIT', 'Tour Atitlán', 300.00, 240.00, 300.00],
            ['SHUTTLE', 'Shuttle Aeroporto', 100.00, 80.00, 100.00]
        ];

        foreach ($servicios as $servicio) {
            DB::table('servicio')->insert([
                'servicio_codigo' => $servicio[0],
                'servicio_servicio' => $servicio[1],
                'servicio_precio_normal' => $servicio[2],
                'servicio_precio_descuento' => $servicio[3],
                'servicio_precio_total' => $servicio[4],
                'servicio_situacion' => 1,
                'created_at' => now(),
                'created_by' => 1
            ]);
        }
    }

    /**
     * Rutas principales
     */
    private function seedRutas()
    {
        $rutas = [
            ['GUATE_ANTI', 'Guatemala - Antigua', 'Ciudad de Guatemala', 'Antigua Guatemala'],
            ['GUATE_ATIT', 'Guatemala - Atitlán', 'Ciudad de Guatemala', 'Lago de Atitlán'],
            ['ANTI_ATIT', 'Antigua - Atitlán', 'Antigua Guatemala', 'Lago de Atitlán'],
            ['GUATE_TIKAL', 'Guatemala - Tikal', 'Ciudad de Guatemala', 'Tikal, Petén'],
            ['AERO_GUATE', 'Aeroporto - Guatemala', 'Aeroporto Internacional', 'Ciudad de Guatemala'],
            ['AERO_ANTI', 'Aeroporto - Antigua', 'Aeroporto Internacional', 'Antigua Guatemala'],
            ['GUATE_XELA', 'Guatemala - Quetzaltenango', 'Ciudad de Guatemala', 'Quetzaltenango'],
            ['ANTI_XELA', 'Antigua - Quetzaltenango', 'Antigua Guatemala', 'Quetzaltenango']
        ];

        foreach ($rutas as $ruta) {
            DB::table('ruta')->insert([
                'ruta_codigo' => $ruta[0],
                'ruta_ruta' => $ruta[1],
                'ruta_origen' => $ruta[2],
                'ruta_destino' => $ruta[3],
                'ruta_situacion' => 1,
                'created_at' => now(),
                'created_by' => 1
            ]);
        }
    }

    /**
     * Agencias colaboradoras
     */
    private function seedAgencias()
    {
        $agencias = [
            ['GUAT001', 'Turismo Guatemala S.A.', '12345678-9', 'info@turismoguate.com', 50212345678],
            ['MAYA001', 'Maya World Tours', '87654321-0', 'reservas@mayaworld.com', 50287654321],
            ['ANTI001', 'Antigua Tours & Travel', '11223344-5', 'ventas@antiguatours.com', 50311223344],
            ['ATIT001', 'Atitlán Adventure', '55667788-9', 'info@atitlanadventure.com', 50455667788],
            ['INTER001', 'International Guatemala', '99887766-4', 'sales@interguate.com', 50599887766]
        ];

        foreach ($agencias as $agencia) {
            $agenciaId = DB::table('agencia')->insertGetId([
                'agencia_codigo' => $agencia[0],
                'agencia_razon_social' => $agencia[1],
                'agencia_nit' => $agencia[2],
                'agencia_email' => $agencia[3],
                'agencia_telefono' => $agencia[4],
                'agencia_situacion' => 1,
                'created_at' => now(),
                'created_by' => 1
            ]);

            // Contacto principal de cada agencia
            DB::table('contactos_agencia')->insert([
                'contactos_agencia_codigo' => $agencia[0] . '-CONT01',
                'contactos_agencia_nombres' => 'Gerente',
                'contactos_agencia_apellidos' => 'Comercial',
                'contactos_agencia_cargo' => 'Gerente de Ventas',
                'contactos_agencia_telefono' => $agencia[4],
                'contactos_agencia_situacion' => 1,
                'agencia_id' => $agenciaId,
                'created_at' => now(),
                'created_by' => 1
            ]);
        }
    }

    /**
     * Vehículos de la flota
     */
    private function seedVehiculos()
    {
        $vehiculos = [
            ['VEH001', 'P-123ABC', 'Toyota', 'Hiace', 15, 1], // VEH_DISP
            ['VEH002', 'P-456DEF', 'Mercedes', 'Sprinter', 20, 1],
            ['VEH003', 'P-789GHI', 'Nissan', 'Urvan', 12, 1],
            ['VEH004', 'P-012JKL', 'Toyota', 'Coaster', 25, 1],
            ['VEH005', 'P-345MNO', 'Hyundai', 'H350', 18, 1],
            ['VEH006', 'P-678PQR', 'Toyota', 'Hiace', 15, 3], // VEH_MANT
            ['VEH007', 'P-901STU', 'Mercedes', 'Sprinter', 20, 1],
            ['VEH008', 'P-234VWX', 'Nissan', 'Urvan', 12, 1]
        ];

        foreach ($vehiculos as $vehiculo) {
            DB::table('vehiculo')->insert([
                'vehiculo_codigo' => $vehiculo[0],
                'vehiculo_placa' => $vehiculo[1],
                'vehiculo_marca' => $vehiculo[2],
                'vehiculo_modelo' => $vehiculo[3],
                'vehiculo_capacidad' => $vehiculo[4],
                'vehiculo_situacion' => 1,
                'estado_id' => $vehiculo[5], // Estado del vehículo
                'created_at' => now(),
                'created_by' => 1
            ]);
        }
    }

    /**
     * Rollback - Limpiar todos los datos
     */
    public function down()
    {
        // Eliminar en orden inverso por dependencias FK
        DB::table('vehiculo')->truncate();
        DB::table('contactos_agencia')->truncate();
        DB::table('agencia')->truncate();
        DB::table('ruta')->truncate();
        DB::table('servicio')->truncate();
        DB::table('usuario')->truncate();
        DB::table('persona')->truncate();
        DB::table('rol')->truncate();
        DB::table('tipo_persona')->truncate();
        DB::table('estado')->truncate();
    }
};
