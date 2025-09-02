@extends('vouchers.layouts.pdf')

@section('title', 'Voucher de Reserva')

@section('content')
    <div class="header">
        <h1>MAGIC TRAVEL</h1>
        <h2>VOUCHER DE RESERVA</h2>
        <p style="font-size: 16px; font-weight: bold; color: #e74c3c;">{{ $reserva->reserva_codigo }}</p>
    </div>

    <div class="info-section">
        <h3>DATOS DEL CLIENTE</h3>
        <div class="info-grid">
            <div class="info-col">
                <div class="info-row">
                    <strong>Cliente:</strong> {{ $reserva->nombre_completo_cliente }}
                </div>
                <div class="info-row">
                    <strong>Teléfono:</strong> {{ $reserva->formatearTelefono() }}
                </div>
                <div class="info-row">
                    <strong>Email:</strong> {{ $reserva->reserva_email_cliente ?: 'No proporcionado' }}
                </div>
            </div>
            <div class="info-col">
                <div class="info-row">
                    <strong>NIT:</strong> {{ $reserva->reserva_cliente_nit ?: 'C/F' }}
                </div>
                <div class="info-row">
                    <strong>Fecha Reserva:</strong> {{ $reserva->created_at->format('d/m/Y H:i') }}
                </div>
                <div class="info-row">
                    <strong>Estado:</strong> {{ $reserva->estado_nombre }}
                </div>
            </div>
        </div>
    </div>

    <div class="info-section">
        <h3>DETALLES DEL VIAJE</h3>
        <div class="info-grid">
            <div class="info-col">
                <div class="info-row">
                    <strong>Ruta:</strong> {{ $reserva->rutaActivada->ruta->ruta_origen }} →
                    {{ $reserva->rutaActivada->ruta->ruta_destino }}
                </div>
                {{-- CAMBIO: Usar el campo unificado ruta_activada_fecha_hora del modelo --}}
                <div class="info-row">
                    <strong>Fecha Viaje:</strong> {{ $reserva->rutaActivada->ruta_activada_fecha_hora->format('d/m/Y') }}
                </div>
                <div class="info-row">
                    <strong>Hora:</strong> {{ $reserva->rutaActivada->ruta_activada_fecha_hora->format('H:i') }}
                </div>
            </div>
            <div class="info-col">
                <div class="info-row">
                    <strong>Adultos:</strong> {{ $reserva->reserva_cantidad_adultos }}
                </div>
                <div class="info-row">
                    <strong>Niños:</strong> {{ $reserva->reserva_cantidad_ninos ?: '0' }}
                </div>
                <div class="info-row">
                    {{-- CAMBIO: Calcular total pasajeros usando la nueva lógica sin campo calculado --}}
                    <strong>Total PAX:</strong>
                    {{ $reserva->reserva_cantidad_adultos + ($reserva->reserva_cantidad_ninos ?: 0) }}
                </div>
            </div>
        </div>
    </div>

    @if ($reserva->reserva_direccion_abordaje)
        <div class="info-section">
            <h3>PUNTO DE ABORDAJE</h3>
            <p style="padding: 10px; background: #f8f9fa; border-left: 4px solid #17a2b8;">
                {{ $reserva->reserva_direccion_abordaje }}
            </p>
        </div>
    @endif

    <div class="info-section">
        <h3>INFORMACIÓN COMERCIAL</h3>
        <div class="info-grid">
            <div class="info-col">
                <div class="info-row">
                    <strong>Servicio:</strong> {{ $reserva->formatearServicio() }}
                </div>
                <div class="info-row">
                    <strong>Vehículo:</strong> {{ $reserva->formatearVehiculo() }}
                </div>
            </div>
            <div class="info-col">
                <div class="info-row">
                    <strong>Tipo Venta:</strong> {{ $reserva->tipo_venta }}
                </div>
                @if ($reserva->agencia)
                    <div class="info-row">
                        <strong>Agencia:</strong> {{ $reserva->agencia_nombre }}
                    </div>
                @endif
            </div>
        </div>
    </div>

    <div class="info-section" style="text-align: center; background: #e8f5e8; padding: 20px; border-radius: 8px;">
        <h3 style="background: none; border: none; margin: 0 0 10px 0; color: #27ae60;">MONTO TOTAL</h3>
        <p style="font-size: 24px; font-weight: bold; color: #27ae60;">
            Q. {{ number_format($reserva->reserva_monto, 2) }}
        </p>
    </div>

    @if ($reserva->reserva_notas)
        <div class="info-section">
            <h3>OBSERVACIONES</h3>
            <p style="padding: 10px; background: #fff3cd; border-left: 4px solid #ffc107;">
                {{ $reserva->reserva_notas }}
            </p>
        </div>
    @endif

    <div class="info-section" style="background: #f8f9fa; padding: 10px; border-radius: 8px; margin-top: 15px;">
        <h3 style="background: none; border: none; color: #dc3545; text-align: center;">INSTRUCCIONES IMPORTANTES</h3>
        <ul style="margin: 10px 0; padding-left: 20px;">
            <li>Presentarse 10 minutos antes de la hora de salida</li>
            <li>Portar documento de identidad vigente</li>
            <li>Este voucher es su comprobante de reserva</li>
            <li>En caso de cancelación, contactar con 24 horas de anticipación</li>
        </ul>
    </div>
@endsection
