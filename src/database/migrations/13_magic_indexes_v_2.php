<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * MIGRACIÓN ÍNDICES MAGIC TRAVEL v2.0 - SOLO NUEVOS
     * Crear únicamente índices que NO existen para evitar duplicados
     */
    public function up()
    {
        $this->createOnlyMissingIndexes();
    }

    /**
     * Crear solo índices que faltan según análisis previo
     */
    private function createOnlyMissingIndexes()
    {
        // ÍNDICES DE REPORTES (nuevos)
        DB::statement('CREATE INDEX idx_reserva_ingresos ON reserva(created_at, reserva_situacion, agencia_id, reserva_monto)');
        DB::statement('CREATE INDEX idx_reserva_fecha_creacion ON reserva(created_at, reserva_situacion)');
        DB::statement('CREATE INDEX idx_reserva_fecha_viaje ON reserva(ruta_activada_id, created_at)');
        DB::statement('CREATE INDEX idx_facturas_fecha ON facturas(facturas_fecha, facturas_situacion)');
        DB::statement('CREATE INDEX idx_dashboard_ocupacion ON ruta_activada(ruta_activada_fecha, estado_id, ruta_activada_situacion)');
        DB::statement('CREATE INDEX idx_reserva_servicio ON reserva(ruta_activada_id, reserva_situacion, created_at)');

        // ÍNDICES DE PERFORMANCE (nuevos)
        DB::statement('CREATE INDEX idx_usuario_persona ON usuario(persona_id, usuario_situacion)');
        DB::statement('CREATE INDEX idx_reserva_ruta_join ON reserva(ruta_activada_id, reserva_situacion, estado_id)');
        DB::statement('CREATE INDEX idx_ruta_activada_servicio ON ruta_activada(servicio_id, ruta_activada_situacion)');
        DB::statement('CREATE INDEX idx_ruta_activada_vehiculo ON ruta_activada(vehiculo_id, ruta_activada_situacion)');
        DB::statement('CREATE INDEX idx_reserva_cliente ON reserva(reserva_nombres_cliente, reserva_apellidos_cliente, reserva_situacion)');
        DB::statement('CREATE INDEX idx_reserva_agencia ON reserva(agencia_id, reserva_situacion)');
        DB::statement('CREATE INDEX idx_reserva_telefono ON reserva(reserva_telefono_cliente)');
        DB::statement('CREATE INDEX idx_contactos_agencia_rel ON contactos_agencia(agencia_id, contactos_agencia_situacion)');
        DB::statement('CREATE INDEX idx_persona_nombres ON persona(persona_nombres, persona_apellidos, persona_situacion)');
        DB::statement('CREATE INDEX idx_persona_email ON persona(persona_email)');
        DB::statement('CREATE INDEX idx_persona_telefono ON persona(persona_telefono)');
        DB::statement('CREATE INDEX idx_agencia_telefono ON agencia(agencia_telefono)');
        DB::statement('CREATE INDEX idx_ruta_origen_destino ON ruta(ruta_origen, ruta_destino, ruta_situacion)');
        DB::statement('CREATE INDEX idx_vehiculo_capacidad ON vehiculo(vehiculo_capacidad, vehiculo_situacion)');
        DB::statement('CREATE INDEX idx_reserva_timestamps ON reserva(created_at, updated_at)');
        DB::statement('CREATE INDEX idx_ruta_activada_timestamps ON ruta_activada(created_at, updated_at)');
        DB::statement('CREATE INDEX idx_facturas_timestamps ON facturas(created_at, updated_at)');
        DB::statement('CREATE INDEX idx_persona_deleted ON persona(deleted_at)');
        DB::statement('CREATE INDEX idx_reserva_deleted ON reserva(deleted_at)');
        DB::statement('CREATE INDEX idx_ruta_activada_deleted ON ruta_activada(deleted_at)');
    }

    /**
     * Rollback - Eliminar solo los índices nuevos
     */
    public function down()
    {
        DB::statement('DROP INDEX idx_ruta_activada_deleted ON ruta_activada');
        DB::statement('DROP INDEX idx_reserva_deleted ON reserva');
        DB::statement('DROP INDEX idx_persona_deleted ON persona');
        DB::statement('DROP INDEX idx_facturas_timestamps ON facturas');
        DB::statement('DROP INDEX idx_ruta_activada_timestamps ON ruta_activada');
        DB::statement('DROP INDEX idx_reserva_timestamps ON reserva');
        DB::statement('DROP INDEX idx_vehiculo_capacidad ON vehiculo');
        DB::statement('DROP INDEX idx_ruta_origen_destino ON ruta');
        DB::statement('DROP INDEX idx_agencia_telefono ON agencia');
        DB::statement('DROP INDEX idx_persona_telefono ON persona');
        DB::statement('DROP INDEX idx_persona_email ON persona');
        DB::statement('DROP INDEX idx_persona_nombres ON persona');
        DB::statement('DROP INDEX idx_contactos_agencia_rel ON contactos_agencia');
        DB::statement('DROP INDEX idx_reserva_telefono ON reserva');
        DB::statement('DROP INDEX idx_reserva_agencia ON reserva');
        DB::statement('DROP INDEX idx_reserva_cliente ON reserva');
        DB::statement('DROP INDEX idx_ruta_activada_vehiculo ON ruta_activada');
        DB::statement('DROP INDEX idx_ruta_activada_servicio ON ruta_activada');
        DB::statement('DROP INDEX idx_reserva_ruta_join ON reserva');
        DB::statement('DROP INDEX idx_usuario_persona ON usuario');
        DB::statement('DROP INDEX idx_reserva_servicio ON reserva');
        DB::statement('DROP INDEX idx_dashboard_ocupacion ON ruta_activada');
        DB::statement('DROP INDEX idx_facturas_fecha ON facturas');
        DB::statement('DROP INDEX idx_reserva_fecha_viaje ON reserva');
        DB::statement('DROP INDEX idx_reserva_fecha_creacion ON reserva');
        DB::statement('DROP INDEX idx_reserva_ingresos ON reserva');
    }
};
