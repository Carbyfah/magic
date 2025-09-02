@extends('vouchers.layouts.pdf')

@section('title', 'Factura')

@section('content')
    <div class="header">
        <h1>MAGIC TRAVEL</h1>
        <h2>FACTURA</h2>
        <p style="font-size: 16px; font-weight: bold; color: #e74c3c;">No. {{ $reserva->reserva_codigo }}</p>
        <p style="font-size: 12px; color: #666;">Serie: A | Fecha: {{ now()->format('d/m/Y') }}</p>
    </div>

    <div class="info-section">
        <h3>DATOS FISCALES</h3>
        <div class="info-grid">
            <div class="info-col">
                <div class="info-row">
                    <strong>Emisor:</strong> Magic Travel Guatemala
                </div>
                <div class="info-row">
                    <strong>NIT:</strong> 1234567-8
                </div>
                <div class="info-row">
                    <strong>Dirección:</strong> Guatemala, Guatemala
                </div>
            </div>
            <div class="info-col">
                <div class="info-row">
                    <strong>Cliente:</strong> {{ $datosFactura['cliente']['nombre_completo'] }}
                </div>
                <div class="info-row">
                    <strong>NIT Cliente:</strong> {{ $datosFactura['cliente']['nit'] ?: 'C/F' }}
                </div>
                <div class="info-row">
                    <strong>Teléfono:</strong> {{ $datosFactura['cliente']['telefono'] }}
                </div>
            </div>
        </div>
    </div>

    <div class="info-section">
        <h3>DETALLES DEL SERVICIO</h3>
        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr style="background: #f8f9fa;">
                    <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">DESCRIPCIÓN</th>
                    <th style="padding: 10px; border: 1px solid #ddd; text-align: center;">CANT.</th>
                    <th style="padding: 10px; border: 1px solid #ddd; text-align: right;">PRECIO</th>
                    <th style="padding: 10px; border: 1px solid #ddd; text-align: right;">TOTAL</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="padding: 10px; border: 1px solid #ddd;">
                        {{ $datosFactura['servicio']['nombre'] }}<br>
                        <small style="color: #666;">{{ $datosFactura['servicio']['ruta'] }}</small><br>
                        <small style="color: #666;">Fecha: {{ $datosFactura['servicio']['fecha_viaje'] }} -
                            {{ $datosFactura['servicio']['hora_viaje'] }}</small>
                    </td>
                    <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">
                        {{ $datosFactura['pasajeros']['total'] }} PAX
                        @if ($datosFactura['pasajeros']['ninos'] > 0)
                            <br><small>({{ $datosFactura['pasajeros']['adultos'] }}A +
                                {{ $datosFactura['pasajeros']['ninos'] }}N)</small>
                        @endif
                    </td>
                    <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">
                        Q.
                        {{ number_format($datosFactura['montos']['subtotal'] / $datosFactura['pasajeros']['total'], 2) }}
                    </td>
                    <td style="padding: 10px; border: 1px solid #ddd; text-align: right; font-weight: bold;">
                        Q. {{ number_format($datosFactura['montos']['subtotal'], 2) }}
                    </td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="info-section">
        <div class="info-grid">
            <div class="info-col">
                <div class="info-row">
                    <strong>Tipo Venta:</strong> {{ $datosFactura['venta']['tipo'] }}
                </div>
                @if ($datosFactura['venta']['agencia'])
                    <div class="info-row">
                        <strong>Agencia:</strong> {{ $datosFactura['venta']['agencia'] }}
                    </div>
                @endif
                <div class="info-row">
                    <strong>Vendedor:</strong> {{ $datosFactura['venta']['vendedor'] }}
                </div>
            </div>
            <div class="info-col" style="text-align: right;">
                <div class="info-row">
                    <strong>Subtotal:</strong> Q. {{ number_format($datosFactura['montos']['subtotal'], 2) }}
                </div>
                <div class="info-row" style="font-size: 16px; color: #27ae60;">
                    <strong>TOTAL:</strong> Q. {{ number_format($datosFactura['montos']['total'], 2) }}
                </div>
            </div>
        </div>
    </div>

    <div class="info-section" style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
        <h3 style="background: none; border: none; text-align: center; margin: 0;">CONDICIONES</h3>
        <ul style="margin: 10px 0; padding-left: 20px; font-size: 11px;">
            <li>Factura válida por servicios de transporte turístico</li>
            <li>No se aceptan devoluciones después de la fecha del viaje</li>
            <li>Para reclamos comunicarse en un plazo no mayor a 48 horas</li>
        </ul>
    </div>
@endsection
