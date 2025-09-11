<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * MIGRACIÓN AUDITORÍA MAGIC TRAVEL v3.0 - LIMPIA
     * Sin tabla facturas, campos datetime unificados, sin campos calculados
     */
    public function up()
    {
        $this->createAuditTables();
        $this->createAuditTriggers();
    }

    private function createAuditTables()
    {
        // 1. Auditoría Tipo Persona
        Schema::create('tipo_persona_auditoria', function (Blueprint $table) {
            $table->id('auditoria_id');
            // Campos originales
            $table->unsignedBigInteger('tipo_persona_id');
            $table->string('tipo_persona_codigo', 45);
            $table->string('tipo_persona_tipo', 45)->nullable();
            $table->boolean('tipo_persona_situacion');
            $table->timestamp('original_created_at')->nullable();
            $table->timestamp('original_updated_at')->nullable();
            $table->unsignedBigInteger('original_created_by')->nullable();
            $table->unsignedBigInteger('original_updated_by')->nullable();
            $table->timestamp('original_deleted_at')->nullable();
            // Metadatos auditoría
            $table->enum('accion', ['INSERT', 'UPDATE', 'DELETE']);
            $table->unsignedBigInteger('usuario_modificacion');
            $table->timestamp('fecha_modificacion')->useCurrent();
            $table->string('ip_modificacion', 45)->nullable();

            $table->index(['tipo_persona_id', 'fecha_modificacion'], 'idx_tipo_pers_audit');
            $table->index('usuario_modificacion', 'idx_tipo_pers_user');
        });

        // 2. Auditoría Rol
        Schema::create('rol_auditoria', function (Blueprint $table) {
            $table->id('auditoria_id');
            $table->unsignedBigInteger('rol_id');
            $table->string('rol_codigo', 45);
            $table->string('rol_rol', 45);
            $table->string('rol_descripcion', 100)->nullable();
            $table->boolean('rol_situacion');
            $table->timestamp('original_created_at')->nullable();
            $table->timestamp('original_updated_at')->nullable();
            $table->unsignedBigInteger('original_created_by')->nullable();
            $table->unsignedBigInteger('original_updated_by')->nullable();
            $table->timestamp('original_deleted_at')->nullable();
            $table->enum('accion', ['INSERT', 'UPDATE', 'DELETE']);
            $table->unsignedBigInteger('usuario_modificacion');
            $table->timestamp('fecha_modificacion')->useCurrent();
            $table->string('ip_modificacion', 45)->nullable();

            $table->index(['rol_id', 'fecha_modificacion'], 'idx_rol_audit');
            $table->index('usuario_modificacion', 'idx_rol_user');
        });

        // 3. Auditoría Estado
        Schema::create('estado_auditoria', function (Blueprint $table) {
            $table->id('auditoria_id');
            $table->unsignedBigInteger('estado_id');
            $table->string('estado_codigo', 45);
            $table->string('estado_estado', 45);
            $table->string('estado_descripcion', 45)->nullable();
            $table->boolean('estado_situacion');
            $table->timestamp('original_created_at')->nullable();
            $table->timestamp('original_updated_at')->nullable();
            $table->unsignedBigInteger('original_created_by')->nullable();
            $table->unsignedBigInteger('original_updated_by')->nullable();
            $table->timestamp('original_deleted_at')->nullable();
            $table->enum('accion', ['INSERT', 'UPDATE', 'DELETE']);
            $table->unsignedBigInteger('usuario_modificacion');
            $table->timestamp('fecha_modificacion')->useCurrent();
            $table->string('ip_modificacion', 45)->nullable();

            $table->index(['estado_id', 'fecha_modificacion'], 'idx_estado_audit');
            $table->index('usuario_modificacion', 'idx_estado_user');
        });

        // 13. Auditoría Tour Activado
        Schema::create('tour_activado_auditoria', function (Blueprint $table) {
            $table->id('auditoria_id');
            $table->unsignedBigInteger('tour_activado_id');
            $table->string('tour_activado_codigo', 45);
            $table->dateTime('tour_activado_fecha_hora');
            $table->string('tour_activado_descripcion', 255)->nullable();
            $table->string('tour_activado_punto_encuentro', 255)->nullable();
            $table->decimal('tour_activado_duracion_horas', 4, 2)->nullable();
            $table->boolean('tour_activado_situacion');
            $table->unsignedBigInteger('persona_id')->nullable();
            $table->unsignedBigInteger('servicio_id');
            $table->timestamp('original_created_at')->nullable();
            $table->timestamp('original_updated_at')->nullable();
            $table->unsignedBigInteger('original_created_by')->nullable();
            $table->unsignedBigInteger('original_updated_by')->nullable();
            $table->timestamp('original_deleted_at')->nullable();
            $table->enum('accion', ['INSERT', 'UPDATE', 'DELETE']);
            $table->unsignedBigInteger('usuario_modificacion');
            $table->timestamp('fecha_modificacion')->useCurrent();
            $table->string('ip_modificacion', 45)->nullable();

            $table->index(['tour_activado_id', 'fecha_modificacion'], 'idx_tour_act_audit');
            $table->index('usuario_modificacion', 'idx_tour_act_user');
        });

        // 4. Auditoría Servicio
        Schema::create('servicio_auditoria', function (Blueprint $table) {
            $table->id('auditoria_id');
            $table->unsignedBigInteger('servicio_id');
            $table->string('servicio_codigo', 45);
            $table->string('servicio_servicio', 100)->nullable();
            $table->decimal('servicio_precio_normal', 10, 2)->nullable();
            $table->decimal('servicio_precio_descuento', 10, 2)->nullable();
            $table->boolean('servicio_situacion');
            $table->timestamp('original_created_at')->nullable();
            $table->timestamp('original_updated_at')->nullable();
            $table->unsignedBigInteger('original_created_by')->nullable();
            $table->unsignedBigInteger('original_updated_by')->nullable();
            $table->timestamp('original_deleted_at')->nullable();
            $table->enum('accion', ['INSERT', 'UPDATE', 'DELETE']);
            $table->unsignedBigInteger('usuario_modificacion');
            $table->timestamp('fecha_modificacion')->useCurrent();
            $table->string('ip_modificacion', 45)->nullable();

            $table->index(['servicio_id', 'fecha_modificacion'], 'idx_servicio_audit');
            $table->index('usuario_modificacion', 'idx_servicio_user');
        });

        // 5. Auditoría Ruta
        Schema::create('ruta_auditoria', function (Blueprint $table) {
            $table->id('auditoria_id');
            $table->unsignedBigInteger('ruta_id');
            $table->string('ruta_codigo', 45);
            $table->string('ruta_ruta', 45);
            $table->string('ruta_origen', 100);
            $table->string('ruta_destino', 100);
            $table->boolean('ruta_situacion');
            $table->timestamp('original_created_at')->nullable();
            $table->timestamp('original_updated_at')->nullable();
            $table->unsignedBigInteger('original_created_by')->nullable();
            $table->unsignedBigInteger('original_updated_by')->nullable();
            $table->timestamp('original_deleted_at')->nullable();
            $table->enum('accion', ['INSERT', 'UPDATE', 'DELETE']);
            $table->unsignedBigInteger('usuario_modificacion');
            $table->timestamp('fecha_modificacion')->useCurrent();
            $table->string('ip_modificacion', 45)->nullable();

            $table->index(['ruta_id', 'fecha_modificacion'], 'idx_ruta_audit');
            $table->index('usuario_modificacion', 'idx_ruta_user');
        });

        // 6. Auditoría Agencia
        Schema::create('agencia_auditoria', function (Blueprint $table) {
            $table->id('auditoria_id');
            $table->unsignedBigInteger('agencia_id');
            $table->string('agencia_codigo', 45);
            $table->string('agencia_razon_social', 45);
            $table->string('agencia_nit', 45)->nullable();
            $table->string('agencia_email', 45)->nullable();
            $table->bigInteger('agencia_telefono')->nullable();
            $table->boolean('agencia_situacion');
            $table->timestamp('original_created_at')->nullable();
            $table->timestamp('original_updated_at')->nullable();
            $table->unsignedBigInteger('original_created_by')->nullable();
            $table->unsignedBigInteger('original_updated_by')->nullable();
            $table->timestamp('original_deleted_at')->nullable();
            $table->enum('accion', ['INSERT', 'UPDATE', 'DELETE']);
            $table->unsignedBigInteger('usuario_modificacion');
            $table->timestamp('fecha_modificacion')->useCurrent();
            $table->string('ip_modificacion', 45)->nullable();

            $table->index(['agencia_id', 'fecha_modificacion'], 'idx_agencia_audit');
            $table->index('usuario_modificacion', 'idx_agencia_user');
        });

        // 7. Auditoría Persona
        Schema::create('persona_auditoria', function (Blueprint $table) {
            $table->id('auditoria_id');
            $table->unsignedBigInteger('persona_id');
            $table->string('persona_codigo', 45);
            $table->string('persona_nombres', 100);
            $table->string('persona_apellidos', 100);
            $table->bigInteger('persona_telefono')->nullable();
            $table->string('persona_email', 45)->nullable();
            $table->boolean('persona_situacion');
            $table->unsignedBigInteger('tipo_persona_id');
            $table->timestamp('original_created_at')->nullable();
            $table->timestamp('original_updated_at')->nullable();
            $table->unsignedBigInteger('original_created_by')->nullable();
            $table->unsignedBigInteger('original_updated_by')->nullable();
            $table->timestamp('original_deleted_at')->nullable();
            $table->enum('accion', ['INSERT', 'UPDATE', 'DELETE']);
            $table->unsignedBigInteger('usuario_modificacion');
            $table->timestamp('fecha_modificacion')->useCurrent();
            $table->string('ip_modificacion', 45)->nullable();

            $table->index(['persona_id', 'fecha_modificacion'], 'idx_persona_audit');
            $table->index('usuario_modificacion', 'idx_persona_user');
        });

        // 8. Auditoría Vehículo
        Schema::create('vehiculo_auditoria', function (Blueprint $table) {
            $table->id('auditoria_id');
            $table->unsignedBigInteger('vehiculo_id');
            $table->string('vehiculo_codigo', 45);
            $table->string('vehiculo_placa', 45);
            $table->string('vehiculo_marca', 45);
            $table->string('vehiculo_modelo', 45)->nullable();
            $table->integer('vehiculo_capacidad');
            $table->boolean('vehiculo_situacion');
            $table->unsignedBigInteger('estado_id');
            $table->timestamp('original_created_at')->nullable();
            $table->timestamp('original_updated_at')->nullable();
            $table->unsignedBigInteger('original_created_by')->nullable();
            $table->unsignedBigInteger('original_updated_by')->nullable();
            $table->timestamp('original_deleted_at')->nullable();
            $table->enum('accion', ['INSERT', 'UPDATE', 'DELETE']);
            $table->unsignedBigInteger('usuario_modificacion');
            $table->timestamp('fecha_modificacion')->useCurrent();
            $table->string('ip_modificacion', 45)->nullable();

            $table->index(['vehiculo_id', 'fecha_modificacion'], 'idx_vehiculo_audit');
            $table->index('usuario_modificacion', 'idx_vehiculo_user');
        });

        // 9. Auditoría Contactos Agencia
        Schema::create('contactos_agencia_auditoria', function (Blueprint $table) {
            $table->id('auditoria_id');
            $table->unsignedBigInteger('contactos_agencia_id');
            $table->string('contactos_agencia_codigo', 45);
            $table->string('contactos_agencia_nombres', 100);
            $table->string('contactos_agencia_apellidos', 100);
            $table->string('contactos_agencia_cargo', 45);
            $table->bigInteger('contactos_agencia_telefono');
            $table->boolean('contactos_agencia_situacion');
            $table->unsignedBigInteger('agencia_id');
            $table->timestamp('original_created_at')->nullable();
            $table->timestamp('original_updated_at')->nullable();
            $table->unsignedBigInteger('original_created_by')->nullable();
            $table->unsignedBigInteger('original_updated_by')->nullable();
            $table->timestamp('original_deleted_at')->nullable();
            $table->enum('accion', ['INSERT', 'UPDATE', 'DELETE']);
            $table->unsignedBigInteger('usuario_modificacion');
            $table->timestamp('fecha_modificacion')->useCurrent();
            $table->string('ip_modificacion', 45)->nullable();

            $table->index(['contactos_agencia_id', 'fecha_modificacion'], 'idx_contactos_audit');
            $table->index('usuario_modificacion', 'idx_contactos_user');
        });

        // 10. Auditoría Usuario
        Schema::create('usuario_auditoria', function (Blueprint $table) {
            $table->id('auditoria_id');
            $table->unsignedBigInteger('usuario_id');
            $table->string('usuario_codigo', 45);
            $table->string('usuario_password', 500);
            $table->boolean('usuario_situacion');
            $table->unsignedBigInteger('persona_id');
            $table->unsignedBigInteger('rol_id');
            $table->timestamp('original_created_at')->nullable();
            $table->timestamp('original_updated_at')->nullable();
            $table->unsignedBigInteger('original_created_by')->nullable();
            $table->unsignedBigInteger('original_updated_by')->nullable();
            $table->timestamp('original_deleted_at')->nullable();
            $table->enum('accion', ['INSERT', 'UPDATE', 'DELETE']);
            $table->unsignedBigInteger('usuario_modificacion');
            $table->timestamp('fecha_modificacion')->useCurrent();
            $table->string('ip_modificacion', 45)->nullable();

            $table->index(['usuario_id', 'fecha_modificacion'], 'idx_usuario_audit');
            $table->index('usuario_modificacion', 'idx_usuario_user');
        });

        // 11. Auditoría Ruta Activada - CORREGIDA SIN HORA SEPARADA
        Schema::create('ruta_activada_auditoria', function (Blueprint $table) {
            $table->id('auditoria_id');
            $table->unsignedBigInteger('ruta_activada_id');
            $table->string('ruta_activada_codigo', 45);
            $table->dateTime('ruta_activada_fecha_hora');
            $table->boolean('ruta_activada_situacion');
            $table->unsignedBigInteger('persona_id');
            $table->unsignedBigInteger('estado_id');
            $table->unsignedBigInteger('servicio_id');
            $table->unsignedBigInteger('ruta_id');
            $table->unsignedBigInteger('vehiculo_id');
            $table->timestamp('original_created_at')->nullable();
            $table->timestamp('original_updated_at')->nullable();
            $table->unsignedBigInteger('original_created_by')->nullable();
            $table->unsignedBigInteger('original_updated_by')->nullable();
            $table->timestamp('original_deleted_at')->nullable();
            $table->enum('accion', ['INSERT', 'UPDATE', 'DELETE']);
            $table->unsignedBigInteger('usuario_modificacion');
            $table->timestamp('fecha_modificacion')->useCurrent();
            $table->string('ip_modificacion', 45)->nullable();

            $table->index(['ruta_activada_id', 'fecha_modificacion'], 'idx_ruta_act_audit');
            $table->index('usuario_modificacion', 'idx_ruta_act_user');
        });

        // 12. Auditoría Reserva - CORREGIDA SIN TOTAL PASAJEROS
        Schema::create('reserva_auditoria', function (Blueprint $table) {
            $table->id('auditoria_id');
            $table->unsignedBigInteger('reserva_id');
            $table->string('reserva_codigo', 45);
            $table->string('reserva_nombres_cliente', 100);
            $table->string('reserva_apellidos_cliente', 100);
            $table->bigInteger('reserva_cliente_nit')->nullable();
            $table->bigInteger('reserva_telefono_cliente');
            $table->string('reserva_email_cliente', 80)->nullable();
            $table->integer('reserva_cantidad_adultos');
            $table->integer('reserva_cantidad_ninos')->nullable();
            $table->string('reserva_direccion_abordaje', 255)->nullable();
            $table->string('reserva_notas', 255)->nullable();
            $table->decimal('reserva_monto', 10, 2)->nullable();
            $table->boolean('reserva_situacion');
            $table->unsignedBigInteger('usuario_id');
            $table->unsignedBigInteger('estado_id');
            $table->unsignedBigInteger('agencia_id')->nullable();
            $table->unsignedBigInteger('ruta_activada_id')->nullable();
            $table->unsignedBigInteger('tour_activado_id')->nullable();
            $table->timestamp('original_created_at')->nullable();
            $table->timestamp('original_updated_at')->nullable();
            $table->unsignedBigInteger('original_created_by')->nullable();
            $table->unsignedBigInteger('original_updated_by')->nullable();
            $table->timestamp('original_deleted_at')->nullable();
            $table->enum('accion', ['INSERT', 'UPDATE', 'DELETE']);
            $table->unsignedBigInteger('usuario_modificacion');
            $table->timestamp('fecha_modificacion')->useCurrent();
            $table->string('ip_modificacion', 45)->nullable();

            $table->index(['reserva_id', 'fecha_modificacion'], 'idx_reserva_audit');
            $table->index('usuario_modificacion', 'idx_reserva_user');
        });
    }

    private function createAuditTriggers()
    {
        $tables = [
            'tipo_persona',
            'rol',
            'estado',
            'servicio',
            'ruta',
            'agencia',
            'persona',
            'vehiculo',
            'contactos_agencia',
            'ruta_activada',
            'reserva',
            'tour_activado'
        ];

        foreach ($tables as $table) {
            $this->createTriggersForTable($table);
        }
    }

    private function createTriggersForTable($table)
    {
        $primaryKey = $table . '_id';
        $auditTable = $table . '_auditoria';

        // 1. TRIGGER INSERT
        DB::unprepared("
            CREATE TRIGGER tr_{$table}_insert
            AFTER INSERT ON {$table}
            FOR EACH ROW
            BEGIN
                INSERT INTO {$auditTable} (
                    {$this->getAllColumnNames($table)},
                    accion,
                    usuario_modificacion,
                    fecha_modificacion,
                    ip_modificacion
                ) VALUES (
                    {$this->getNewColumnValues($table)},
                    'INSERT',
                    COALESCE(NEW.created_by, @user_id, 1),
                    NOW(),
                    CONNECTION_ID()
                );
            END
        ");

        // 2. TRIGGER UPDATE
        DB::unprepared("
            CREATE TRIGGER tr_{$table}_update
            AFTER UPDATE ON {$table}
            FOR EACH ROW
            BEGIN
                -- Solo auditar si NO es cambio de situación 1->0 (eso lo maneja el trigger delete)
                IF NOT (OLD.{$table}_situacion = 1 AND NEW.{$table}_situacion = 0) THEN
                    INSERT INTO {$auditTable} (
                        {$this->getAllColumnNames($table)},
                        accion,
                        usuario_modificacion,
                        fecha_modificacion,
                        ip_modificacion
                    ) VALUES (
                        {$this->getNewColumnValues($table)},
                        'UPDATE',
                        COALESCE(NEW.updated_by, @user_id, 1),
                        NOW(),
                        CONNECTION_ID()
                    );
                END IF;
            END
        ");

        // 3. TRIGGER DELETE LÓGICO (situación 1->0)
        DB::unprepared("
            CREATE TRIGGER tr_{$table}_delete
            AFTER UPDATE ON {$table}
            FOR EACH ROW
            BEGIN
                -- Solo si cambió situación de 1 a 0 (delete lógico)
                IF OLD.{$table}_situacion = 1 AND NEW.{$table}_situacion = 0 THEN
                    INSERT INTO {$auditTable} (
                        {$this->getAllColumnNames($table)},
                        accion,
                        usuario_modificacion,
                        fecha_modificacion,
                        ip_modificacion
                    ) VALUES (
                        {$this->getOldColumnValues($table)},
                        'DELETE',
                        COALESCE(NEW.updated_by, @user_id, 1),
                        NOW(),
                        CONNECTION_ID()
                    );
                END IF;
            END
        ");
    }

    private function getAllColumnNames($table)
    {
        // Mapeo de columnas por tabla - CORREGIDO
        $columns = [
            'tipo_persona' => 'tipo_persona_id, tipo_persona_codigo, tipo_persona_tipo, tipo_persona_situacion, original_created_at, original_updated_at, original_created_by, original_updated_by, original_deleted_at',
            'rol' => 'rol_id, rol_codigo, rol_rol, rol_descripcion, rol_situacion, original_created_at, original_updated_at, original_created_by, original_updated_by, original_deleted_at',
            'estado' => 'estado_id, estado_codigo, estado_estado, estado_descripcion, estado_situacion, original_created_at, original_updated_at, original_created_by, original_updated_by, original_deleted_at',
            'servicio' => 'servicio_id, servicio_codigo, servicio_servicio, servicio_precio_normal, servicio_precio_descuento, servicio_situacion, original_created_at, original_updated_at, original_created_by, original_updated_by, original_deleted_at',
            'ruta' => 'ruta_id, ruta_codigo, ruta_ruta, ruta_origen, ruta_destino, ruta_situacion, original_created_at, original_updated_at, original_created_by, original_updated_by, original_deleted_at',
            'agencia' => 'agencia_id, agencia_codigo, agencia_razon_social, agencia_nit, agencia_email, agencia_telefono, agencia_situacion, original_created_at, original_updated_at, original_created_by, original_updated_by, original_deleted_at',
            'persona' => 'persona_id, persona_codigo, persona_nombres, persona_apellidos, persona_telefono, persona_email, persona_situacion, tipo_persona_id, original_created_at, original_updated_at, original_created_by, original_updated_by, original_deleted_at',
            'vehiculo' => 'vehiculo_id, vehiculo_codigo, vehiculo_placa, vehiculo_marca, vehiculo_modelo, vehiculo_capacidad, vehiculo_situacion, estado_id, original_created_at, original_updated_at, original_created_by, original_updated_by, original_deleted_at',
            'contactos_agencia' => 'contactos_agencia_id, contactos_agencia_codigo, contactos_agencia_nombres, contactos_agencia_apellidos, contactos_agencia_cargo, contactos_agencia_telefono, contactos_agencia_situacion, agencia_id, original_created_at, original_updated_at, original_created_by, original_updated_by, original_deleted_at',
            'usuario' => 'usuario_id, usuario_codigo, usuario_password, usuario_situacion, persona_id, rol_id, original_created_at, original_updated_at, original_created_by, original_updated_by, original_deleted_at',
            'ruta_activada' => 'ruta_activada_id, ruta_activada_codigo, ruta_activada_fecha_hora, ruta_activada_situacion, persona_id, estado_id, servicio_id, ruta_id, vehiculo_id, original_created_at, original_updated_at, original_created_by, original_updated_by, original_deleted_at',
            'reserva' => 'reserva_id, reserva_codigo, reserva_nombres_cliente, reserva_apellidos_cliente, reserva_cliente_nit, reserva_telefono_cliente, reserva_email_cliente, reserva_cantidad_adultos, reserva_cantidad_ninos, reserva_direccion_abordaje, reserva_notas, reserva_monto, reserva_situacion, usuario_id, estado_id, agencia_id, ruta_activada_id, tour_activado_id, original_created_at, original_updated_at, original_created_by, original_updated_by, original_deleted_at',
            'tour_activado' => 'tour_activado_id, tour_activado_codigo, tour_activado_fecha_hora, tour_activado_descripcion, tour_activado_punto_encuentro, tour_activado_duracion_horas, tour_activado_situacion, persona_id, servicio_id, original_created_at, original_updated_at, original_created_by, original_updated_by, original_deleted_at'
        ];

        return $columns[$table];
    }

    private function getNewColumnValues($table)
    {
        $values = [
            'tipo_persona' => 'NEW.tipo_persona_id, NEW.tipo_persona_codigo, NEW.tipo_persona_tipo, NEW.tipo_persona_situacion, NEW.created_at, NEW.updated_at, NEW.created_by, NEW.updated_by, NEW.deleted_at',
            'rol' => 'NEW.rol_id, NEW.rol_codigo, NEW.rol_rol, NEW.rol_descripcion, NEW.rol_situacion, NEW.created_at, NEW.updated_at, NEW.created_by, NEW.updated_by, NEW.deleted_at',
            'estado' => 'NEW.estado_id, NEW.estado_codigo, NEW.estado_estado, NEW.estado_descripcion, NEW.estado_situacion, NEW.created_at, NEW.updated_at, NEW.created_by, NEW.updated_by, NEW.deleted_at',
            'servicio' => 'NEW.servicio_id, NEW.servicio_codigo, NEW.servicio_servicio, NEW.servicio_precio_normal, NEW.servicio_precio_descuento, NEW.servicio_situacion, NEW.created_at, NEW.updated_at, NEW.created_by, NEW.updated_by, NEW.deleted_at',
            'ruta' => 'NEW.ruta_id, NEW.ruta_codigo, NEW.ruta_ruta, NEW.ruta_origen, NEW.ruta_destino, NEW.ruta_situacion, NEW.created_at, NEW.updated_at, NEW.created_by, NEW.updated_by, NEW.deleted_at',
            'agencia' => 'NEW.agencia_id, NEW.agencia_codigo, NEW.agencia_razon_social, NEW.agencia_nit, NEW.agencia_email, NEW.agencia_telefono, NEW.agencia_situacion, NEW.created_at, NEW.updated_at, NEW.created_by, NEW.updated_by, NEW.deleted_at',
            'persona' => 'NEW.persona_id, NEW.persona_codigo, NEW.persona_nombres, NEW.persona_apellidos, NEW.persona_telefono, NEW.persona_email, NEW.persona_situacion, NEW.tipo_persona_id, NEW.created_at, NEW.updated_at, NEW.created_by, NEW.updated_by, NEW.deleted_at',
            'vehiculo' => 'NEW.vehiculo_id, NEW.vehiculo_codigo, NEW.vehiculo_placa, NEW.vehiculo_marca, NEW.vehiculo_modelo, NEW.vehiculo_capacidad, NEW.vehiculo_situacion, NEW.estado_id, NEW.created_at, NEW.updated_at, NEW.created_by, NEW.updated_by, NEW.deleted_at',
            'contactos_agencia' => 'NEW.contactos_agencia_id, NEW.contactos_agencia_codigo, NEW.contactos_agencia_nombres, NEW.contactos_agencia_apellidos, NEW.contactos_agencia_cargo, NEW.contactos_agencia_telefono, NEW.contactos_agencia_situacion, NEW.agencia_id, NEW.created_at, NEW.updated_at, NEW.created_by, NEW.updated_by, NEW.deleted_at',
            'usuario' => 'NEW.usuario_id, NEW.usuario_codigo, NEW.usuario_password, NEW.usuario_situacion, NEW.persona_id, NEW.rol_id, NEW.created_at, NEW.updated_at, NEW.created_by, NEW.updated_by, NEW.deleted_at',
            'ruta_activada' => 'NEW.ruta_activada_id, NEW.ruta_activada_codigo, NEW.ruta_activada_fecha_hora, NEW.ruta_activada_situacion, NEW.persona_id, NEW.estado_id, NEW.servicio_id, NEW.ruta_id, NEW.vehiculo_id, NEW.created_at, NEW.updated_at, NEW.created_by, NEW.updated_by, NEW.deleted_at',
            'reserva' => 'NEW.reserva_id, NEW.reserva_codigo, NEW.reserva_nombres_cliente, NEW.reserva_apellidos_cliente, NEW.reserva_cliente_nit, NEW.reserva_telefono_cliente, NEW.reserva_email_cliente, NEW.reserva_cantidad_adultos, NEW.reserva_cantidad_ninos, NEW.reserva_direccion_abordaje, NEW.reserva_notas, NEW.reserva_monto, NEW.reserva_situacion, NEW.usuario_id, NEW.estado_id, NEW.agencia_id, NEW.ruta_activada_id, NEW.tour_activado_id, NEW.created_at, NEW.updated_at, NEW.created_by, NEW.updated_by, NEW.deleted_at',
            'tour_activado' => 'NEW.tour_activado_id, NEW.tour_activado_codigo, NEW.tour_activado_fecha_hora, NEW.tour_activado_descripcion, NEW.tour_activado_punto_encuentro, NEW.tour_activado_duracion_horas, NEW.tour_activado_situacion, NEW.persona_id, NEW.servicio_id, NEW.created_at, NEW.updated_at, NEW.created_by, NEW.updated_by, NEW.deleted_at'
        ];

        return $values[$table];
    }

    private function getOldColumnValues($table)
    {
        $values = [
            'tipo_persona' => 'OLD.tipo_persona_id, OLD.tipo_persona_codigo, OLD.tipo_persona_tipo, OLD.tipo_persona_situacion, OLD.created_at, OLD.updated_at, OLD.created_by, OLD.updated_by, OLD.deleted_at',
            'rol' => 'OLD.rol_id, OLD.rol_codigo, OLD.rol_rol, OLD.rol_descripcion, OLD.rol_situacion, OLD.created_at, OLD.updated_at, OLD.created_by, OLD.updated_by, OLD.deleted_at',
            'estado' => 'OLD.estado_id, OLD.estado_codigo, OLD.estado_estado, OLD.estado_descripcion, OLD.estado_situacion, OLD.created_at, OLD.updated_at, OLD.created_by, OLD.updated_by, OLD.deleted_at',
            'servicio' => 'OLD.servicio_id, OLD.servicio_codigo, OLD.servicio_servicio, OLD.servicio_precio_normal, OLD.servicio_precio_descuento, OLD.servicio_situacion, OLD.created_at, OLD.updated_at, OLD.created_by, OLD.updated_by, OLD.deleted_at',
            'ruta' => 'OLD.ruta_id, OLD.ruta_codigo, OLD.ruta_ruta, OLD.ruta_origen, OLD.ruta_destino, OLD.ruta_situacion, OLD.created_at, OLD.updated_at, OLD.created_by, OLD.updated_by, OLD.deleted_at',
            'agencia' => 'OLD.agencia_id, OLD.agencia_codigo, OLD.agencia_razon_social, OLD.agencia_nit, OLD.agencia_email, OLD.agencia_telefono, OLD.agencia_situacion, OLD.created_at, OLD.updated_at, OLD.created_by, OLD.updated_by, OLD.deleted_at',
            'persona' => 'OLD.persona_id, OLD.persona_codigo, OLD.persona_nombres, OLD.persona_apellidos, OLD.persona_telefono, OLD.persona_email, OLD.persona_situacion, OLD.tipo_persona_id, OLD.created_at, OLD.updated_at, OLD.created_by, OLD.updated_by, OLD.deleted_at',
            'vehiculo' => 'OLD.vehiculo_id, OLD.vehiculo_codigo, OLD.vehiculo_placa, OLD.vehiculo_marca, OLD.vehiculo_modelo, OLD.vehiculo_capacidad, OLD.vehiculo_situacion, OLD.estado_id, OLD.created_at, OLD.updated_at, OLD.created_by, OLD.updated_by, OLD.deleted_at',
            'contactos_agencia' => 'OLD.contactos_agencia_id, OLD.contactos_agencia_codigo, OLD.contactos_agencia_nombres, OLD.contactos_agencia_apellidos, OLD.contactos_agencia_cargo, OLD.contactos_agencia_telefono, OLD.contactos_agencia_situacion, OLD.agencia_id, OLD.created_at, OLD.updated_at, OLD.created_by, OLD.updated_by, OLD.deleted_at',
            'usuario' => 'OLD.usuario_id, OLD.usuario_codigo, OLD.usuario_password, OLD.usuario_situacion, OLD.persona_id, OLD.rol_id, OLD.created_at, OLD.updated_at, OLD.created_by, OLD.updated_by, OLD.deleted_at',
            'ruta_activada' => 'OLD.ruta_activada_id, OLD.ruta_activada_codigo, OLD.ruta_activada_fecha_hora, OLD.ruta_activada_situacion, OLD.persona_id, OLD.estado_id, OLD.servicio_id, OLD.ruta_id, OLD.vehiculo_id, OLD.created_at, OLD.updated_at, OLD.created_by, OLD.updated_by, OLD.deleted_at',
            'reserva' => 'OLD.reserva_id, OLD.reserva_codigo, OLD.reserva_nombres_cliente, OLD.reserva_apellidos_cliente, OLD.reserva_cliente_nit, OLD.reserva_telefono_cliente, OLD.reserva_email_cliente, OLD.reserva_cantidad_adultos, OLD.reserva_cantidad_ninos, OLD.reserva_direccion_abordaje, OLD.reserva_notas, OLD.reserva_monto, OLD.reserva_situacion, OLD.usuario_id, OLD.estado_id, OLD.agencia_id, OLD.ruta_activada_id, OLD.tour_activado_id, OLD.created_at, OLD.updated_at, OLD.created_by, OLD.updated_by, OLD.deleted_at',
            'tour_activado' => 'OLD.tour_activado_id, OLD.tour_activado_codigo, OLD.tour_activado_fecha_hora, OLD.tour_activado_descripcion, OLD.tour_activado_punto_encuentro, OLD.tour_activado_duracion_horas, OLD.tour_activado_situacion, OLD.persona_id, OLD.servicio_id, OLD.created_at, OLD.updated_at, OLD.created_by, OLD.updated_by, OLD.deleted_at'
        ];

        return $values[$table];
    }

    /**
     * Rollback - Eliminar triggers y tablas de auditoría
     */
    public function down()
    {
        $tables = [
            'tipo_persona',
            'rol',
            'estado',
            'servicio',
            'ruta',
            'agencia',
            'persona',
            'vehiculo',
            'contactos_agencia',
            'usuario',
            'ruta_activada',
            'reserva',
            'tour_activado'
        ];

        // Eliminar triggers
        foreach ($tables as $table) {
            DB::unprepared("DROP TRIGGER IF EXISTS tr_{$table}_insert");
            DB::unprepared("DROP TRIGGER IF EXISTS tr_{$table}_update");
            DB::unprepared("DROP TRIGGER IF EXISTS tr_{$table}_delete");
        }

        // Eliminar tablas de auditoría
        foreach (array_reverse($tables) as $table) {
            Schema::dropIfExists($table . '_auditoria');
        }
    }
};
