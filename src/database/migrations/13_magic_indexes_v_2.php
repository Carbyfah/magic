<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * MIGRACIÓN ÍNDICES MAGIC TRAVEL v3.0 - LIMPIA
     * Índices actualizados para estructura simplificada
     * Sin tabla facturas, datetime unificado
     * CON SOPORTE PARA TOURS
     */
    public function up()
    {
        $this->createOnlyMissingIndexes();
    }

    /**
     * Crear índices actualizados según nueva estructura
     */
    private function createOnlyMissingIndexes()
    {
        // ÍNDICES DE REPORTES (actualizados con tours)
        DB::statement('CREATE INDEX idx_reserva_ingresos ON reserva(created_at, reserva_situacion, agencia_id, reserva_monto)');
        DB::statement('CREATE INDEX idx_reserva_fecha_creacion ON reserva(created_at, reserva_situacion)');
        DB::statement('CREATE INDEX idx_reserva_fecha_viaje_ruta ON reserva(ruta_activada_id, created_at)');
        DB::statement('CREATE INDEX idx_reserva_fecha_viaje_tour ON reserva(tour_activado_id, created_at)');
        DB::statement('CREATE INDEX idx_dashboard_ocupacion_ruta ON ruta_activada(ruta_activada_fecha_hora, estado_id, ruta_activada_situacion)');
        DB::statement('CREATE INDEX idx_reserva_servicio_ruta ON reserva(ruta_activada_id, reserva_situacion, created_at)');
        DB::statement('CREATE INDEX idx_reserva_servicio_tour ON reserva(tour_activado_id, reserva_situacion, created_at)');

        // ÍNDICES DE PERFORMANCE (actualizados con tours)
        DB::statement('CREATE INDEX idx_usuario_persona ON usuario(persona_id, usuario_situacion)');
        DB::statement('CREATE INDEX idx_reserva_ruta_join ON reserva(ruta_activada_id, reserva_situacion, estado_id)');
        DB::statement('CREATE INDEX idx_reserva_tour_join ON reserva(tour_activado_id, reserva_situacion, estado_id)');
        DB::statement('CREATE INDEX idx_ruta_activada_servicio ON ruta_activada(servicio_id, ruta_activada_situacion)');
        DB::statement('CREATE INDEX idx_tour_activado_servicio ON tour_activado(servicio_id, tour_activado_situacion)');
        DB::statement('CREATE INDEX idx_ruta_activada_vehiculo ON ruta_activada(vehiculo_id, ruta_activada_situacion)');
        DB::statement('CREATE INDEX idx_tour_activado_persona ON tour_activado(persona_id, tour_activado_situacion)');
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

        // ÍNDICES DE BÚSQUEDA Y FILTRADO (tours)
        DB::statement('CREATE INDEX idx_tour_activado_fecha ON tour_activado(tour_activado_fecha_hora, tour_activado_situacion)');
        DB::statement('CREATE INDEX idx_tour_activado_codigo ON tour_activado(tour_activado_codigo)');
        DB::statement('CREATE INDEX idx_tour_activado_descripcion ON tour_activado(tour_activado_descripcion)');
        DB::statement('CREATE INDEX idx_tour_activado_punto_encuentro ON tour_activado(tour_activado_punto_encuentro)');

        // ÍNDICES DE RELACIONES FK (tours)
        DB::statement('CREATE INDEX idx_tour_activado_servicio_fk ON tour_activado(servicio_id)');
        DB::statement('CREATE INDEX idx_tour_activado_persona_fk ON tour_activado(persona_id)');
        DB::statement('CREATE INDEX idx_reserva_tour_fk ON reserva(tour_activado_id)');

        // ÍNDICES DE TIMESTAMPS (actualizados con tours)
        DB::statement('CREATE INDEX idx_reserva_timestamps ON reserva(created_at, updated_at)');
        DB::statement('CREATE INDEX idx_ruta_activada_timestamps ON ruta_activada(created_at, updated_at)');
        DB::statement('CREATE INDEX idx_tour_activado_timestamps ON tour_activado(created_at, updated_at)');

        // ÍNDICES DE SOFT DELETES (actualizados con tours)
        DB::statement('CREATE INDEX idx_persona_deleted ON persona(deleted_at)');
        DB::statement('CREATE INDEX idx_reserva_deleted ON reserva(deleted_at)');
        DB::statement('CREATE INDEX idx_ruta_activada_deleted ON ruta_activada(deleted_at)');
        DB::statement('CREATE INDEX idx_tour_activado_deleted ON tour_activado(deleted_at)');

        // ÍNDICES COMPUESTOS ESPECÍFICOS PARA TOURS
        DB::statement('CREATE INDEX idx_tour_fecha_servicio ON tour_activado(tour_activado_fecha_hora, servicio_id, tour_activado_situacion)');
        DB::statement('CREATE INDEX idx_reserva_tour_fecha ON reserva(tour_activado_id, created_at, reserva_situacion)');

        // ÍNDICES PARA REPORTES UNIFICADOS (rutas y tours)
        DB::statement('CREATE INDEX idx_reserva_tipo_servicio ON reserva(ruta_activada_id, tour_activado_id, reserva_situacion)');
        DB::statement('CREATE INDEX idx_reserva_monto_fecha ON reserva(reserva_monto, created_at, reserva_situacion)');
        DB::statement('CREATE INDEX idx_reserva_pasajeros ON reserva(reserva_cantidad_adultos, reserva_cantidad_ninos, reserva_situacion)');

        // ÍNDICES PARA OPTIMIZAR VISTAS
        DB::statement('CREATE INDEX idx_ruta_activada_completo ON ruta_activada(ruta_activada_situacion, estado_id, ruta_activada_fecha_hora)');
        DB::statement('CREATE INDEX idx_reserva_activas ON reserva(reserva_situacion, created_at)');
    }

    /**
     * Rollback - Eliminar índices creados
     */
    public function down()
    {
        // Índices para optimizar vistas
        DB::statement('DROP INDEX idx_reserva_activas ON reserva');
        DB::statement('DROP INDEX idx_ruta_activada_completo ON ruta_activada');

        // Índices para reportes unificados
        DB::statement('DROP INDEX idx_reserva_pasajeros ON reserva');
        DB::statement('DROP INDEX idx_reserva_monto_fecha ON reserva');
        DB::statement('DROP INDEX idx_reserva_tipo_servicio ON reserva');

        // Índices compuestos específicos para tours
        DB::statement('DROP INDEX idx_reserva_tour_fecha ON reserva');
        DB::statement('DROP INDEX idx_tour_fecha_servicio ON tour_activado');

        // Índices de soft deletes
        DB::statement('DROP INDEX idx_tour_activado_deleted ON tour_activado');
        DB::statement('DROP INDEX idx_ruta_activada_deleted ON ruta_activada');
        DB::statement('DROP INDEX idx_reserva_deleted ON reserva');
        DB::statement('DROP INDEX idx_persona_deleted ON persona');

        // Índices de timestamps
        DB::statement('DROP INDEX idx_tour_activado_timestamps ON tour_activado');
        DB::statement('DROP INDEX idx_ruta_activada_timestamps ON ruta_activada');
        DB::statement('DROP INDEX idx_reserva_timestamps ON reserva');

        // Índices de relaciones FK (tours)
        DB::statement('DROP INDEX idx_reserva_tour_fk ON reserva');
        DB::statement('DROP INDEX idx_tour_activado_persona_fk ON tour_activado');
        DB::statement('DROP INDEX idx_tour_activado_servicio_fk ON tour_activado');

        // Índices de búsqueda y filtrado (tours)
        DB::statement('DROP INDEX idx_tour_activado_punto_encuentro ON tour_activado');
        DB::statement('DROP INDEX idx_tour_activado_descripcion ON tour_activado');
        DB::statement('DROP INDEX idx_tour_activado_codigo ON tour_activado');
        DB::statement('DROP INDEX idx_tour_activado_fecha ON tour_activado');

        // Índices de performance originales
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
        DB::statement('DROP INDEX idx_tour_activado_persona ON tour_activado');
        DB::statement('DROP INDEX idx_ruta_activada_vehiculo ON ruta_activada');
        DB::statement('DROP INDEX idx_tour_activado_servicio ON tour_activado');
        DB::statement('DROP INDEX idx_ruta_activada_servicio ON ruta_activada');
        DB::statement('DROP INDEX idx_reserva_tour_join ON reserva');
        DB::statement('DROP INDEX idx_reserva_ruta_join ON reserva');
        DB::statement('DROP INDEX idx_usuario_persona ON usuario');

        // Índices de reportes
        DB::statement('DROP INDEX idx_reserva_servicio_tour ON reserva');
        DB::statement('DROP INDEX idx_reserva_servicio_ruta ON reserva');
        DB::statement('DROP INDEX idx_dashboard_ocupacion_ruta ON ruta_activada');
        DB::statement('DROP INDEX idx_reserva_fecha_viaje_tour ON reserva');
        DB::statement('DROP INDEX idx_reserva_fecha_viaje_ruta ON reserva');
        DB::statement('DROP INDEX idx_reserva_fecha_creacion ON reserva');
        DB::statement('DROP INDEX idx_reserva_ingresos ON reserva');
    }
};
