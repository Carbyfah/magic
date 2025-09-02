@extends('vouchers.layouts.pdf')

@section('title', 'Lista de Pasajeros')

@section('content')
    <div class="header">
        <h1>MAGIC TRAVEL</h1>
        <h2>LISTA DE PASAJEROS</h2>
        <p style="font-size: 16px; font-weight: bold; color: #e74c3c;">{{ $rutaActivada->ruta_activada_codigo }}</p>
    </div>

    <div class="info-section">
        <h3>INFORMACIÓN DE LA RUTA</h3>
        <div class="info-grid">
            <div class="info-col">
                <div class="info-row">
                    <strong>Ruta:</strong> {{ $rutaActivada->ruta->ruta_origen }} → {{ $rutaActivada->ruta->ruta_destino }}
                </div>
                {{-- CAMBIO: Usar el campo unificado ruta_activada_fecha_hora en lugar de campos separados --}}
                <div class="info-row">
                    <strong>Fecha:</strong> {{ $rutaActivada->ruta_activada_fecha_hora->format('d/m/Y') }}
                </div>
                <div class="info-row">
                    <strong>Hora:</strong> {{ $rutaActivada->ruta_activada_fecha_hora->format('H:i') }}
                </div>
            </div>
            <div class="info-col">
                <div class="info-row">
                    <strong>Vehículo:</strong> {{ $rutaActivada->vehiculo->vehiculo_placa }}
                    ({{ $rutaActivada->vehiculo->vehiculo_marca }})
                </div>
                <div class="info-row">
                    <strong>Capacidad:</strong> {{ $rutaActivada->vehiculo->vehiculo_capacidad }} pasajeros
                </div>
                <div class="info-row">
                    <strong>Servicio:</strong> {{ $rutaActivada->servicio->servicio_servicio }}
                </div>
            </div>
        </div>
    </div>

    <div class="info-section">
        <h3>RESUMEN DE OCUPACIÓN</h3>
        <div class="info-grid">
            <div class="info-col">
                <div class="info-row">
                    <strong>Total Reservas:</strong> {{ $totales['total_reservas'] }}
                </div>
                <div class="info-row">
                    <strong>Total Pasajeros:</strong> {{ $totales['total_pasajeros'] }}
                </div>
            </div>
            <div class="info-col">
                <div class="info-row">
                    <strong>Confirmadas:</strong> {{ $totales['confirmadas'] }}
                </div>
                <div class="info-row">
                    <strong>Pendientes:</strong> {{ $totales['pendientes'] }}
                </div>
            </div>
        </div>
    </div>

    <div class="info-section">
        <h3>LISTA DE PASAJEROS</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <thead>
                <tr style="background: #f8f9fa; border-bottom: 2px solid #dee2e6;">
                    <th
                        style="padding: 8px; text-align: left; font-size: 11px; font-weight: bold; border-right: 1px solid #dee2e6;">
                        CLIENTE</th>
                    <th
                        style="padding: 8px; text-align: center; font-size: 11px; font-weight: bold; border-right: 1px solid #dee2e6;">
                        TELÉFONO</th>
                    <th
                        style="padding: 8px; text-align: center; font-size: 11px; font-weight: bold; border-right: 1px solid #dee2e6;">
                        PAX</th>
                    <th
                        style="padding: 8px; text-align: left; font-size: 11px; font-weight: bold; border-right: 1px solid #dee2e6;">
                        PUNTO ABORDAJE</th>
                    <th style="padding: 8px; text-align: center; font-size: 11px; font-weight: bold;">NOTAS</th>
                </tr>
            </thead>
            <tbody>
                @forelse($reservas as $index => $reserva)
                    <tr
                        style="border-bottom: 1px solid #e9ecef; {{ $index % 2 == 0 ? 'background: #ffffff;' : 'background: #f8f9fa;' }}">
                        <td style="padding: 8px; font-size: 10px; border-right: 1px solid #e9ecef; vertical-align: top;">
                            <strong>{{ $reserva->reserva_nombres_cliente }}
                                {{ $reserva->reserva_apellidos_cliente }}</strong><br>
                            <span style="color: #6c757d; font-size: 9px;">{{ $reserva->reserva_codigo }}</span>
                            @if ($reserva->agencia)
                                <br><span
                                    style="color: #17a2b8; font-size: 9px; font-style: italic;">{{ $reserva->agencia->agencia_razon_social }}</span>
                            @endif
                        </td>
                        <td style="padding: 8px; text-align: center; font-size: 10px; border-right: 1px solid #e9ecef;">
                            {{ substr($reserva->reserva_telefono_cliente, 0, 4) }}-{{ substr($reserva->reserva_telefono_cliente, 4) }}
                        </td>
                        <td
                            style="padding: 8px; text-align: center; font-size: 12px; font-weight: bold; border-right: 1px solid #e9ecef;">
                            {{-- CAMBIO: Calcular total pasajeros directamente sin campo eliminado --}}
                            {{ $reserva->reserva_cantidad_adultos + ($reserva->reserva_cantidad_ninos ?? 0) }}
                            @if ($reserva->reserva_cantidad_ninos > 0)
                                <br><span
                                    style="font-size: 8px; color: #6c757d;">({{ $reserva->reserva_cantidad_adultos }}A +
                                    {{ $reserva->reserva_cantidad_ninos }}N)</span>
                            @endif
                        </td>
                        <td style="padding: 8px; font-size: 10px; border-right: 1px solid #e9ecef;">
                            {{ $reserva->reserva_direccion_abordaje ?: 'No especificado' }}
                        </td>
                        <td style="padding: 8px; font-size: 10px; text-align: left;">
                            @if ($reserva->reserva_notas)
                                <span
                                    style="color: #dc3545; font-weight: bold; background: #fee2e2; padding: 2px 4px; border-radius: 3px;">
                                    {{ $reserva->reserva_notas }}
                                </span>
                            @else
                                <span style="color: #6c757d; font-style: italic;">Sin notas</span>
                            @endif
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="5" style="padding: 20px; text-align: center; color: #6c757d; font-style: italic;">
                            No hay reservas para esta ruta
                        </td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>

    @if ($totales['total_reservas'] > 0)
        <div class="info-section" style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin-top: 20px;">
            <h3 style="background: none; border: none; color: #1565c0; text-align: center; margin: 0 0 10px 0;">INFORMACIÓN
                PARA EL CONDUCTOR</h3>
            <div style="font-size: 10px; line-height: 1.6;">
                <ul style="margin: 0; padding-left: 15px;">
                    <li><strong>Verificar identidad</strong> de cada pasajero antes del abordaje</li>
                    <li><strong>Confirmar punto de recogida</strong> con cada cliente</li>
                    <li><strong>Capacidad máxima del vehículo:</strong> {{ $rutaActivada->vehiculo->vehiculo_capacidad }}
                        pasajeros</li>
                    <li><strong>Total a transportar:</strong> {{ $totales['total_pasajeros'] }} pasajeros</li>
                    <li><strong>Espacio disponible:</strong>
                        {{ $rutaActivada->vehiculo->vehiculo_capacidad - $totales['total_pasajeros'] }} asientos libres
                    </li>
                    @if ($totales['pendientes'] > 0)
                        <li style="color: #d97706;"><strong>Atención:</strong> {{ $totales['pendientes'] }} reservas
                            pendientes de confirmación</li>
                    @endif
                </ul>
            </div>
        </div>
    @endif
@endsection
