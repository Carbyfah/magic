<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\HasAudit;

class Reserva extends Model
{
    use SoftDeletes, HasAudit;

    protected $table = 'reserva';
    protected $primaryKey = 'reserva_id';

    protected $fillable = [
        'reserva_codigo',
        'reserva_nombres_cliente',
        'reserva_apellidos_cliente',
        'reserva_cliente_nit',
        'reserva_telefono_cliente',
        'reserva_email_cliente',
        'reserva_cantidad_adultos',
        'reserva_cantidad_ninos',
        'reserva_direccion_abordaje',
        'reserva_notas',
        'reserva_monto',
        'reserva_situacion',
        'usuario_id',
        'estado_id',
        'agencia_id',
        'ruta_activada_id'
    ];

    protected $casts = [
        'reserva_cliente_nit' => 'integer',
        'reserva_telefono_cliente' => 'integer',
        'reserva_cantidad_adultos' => 'integer',
        'reserva_cantidad_ninos' => 'integer',
        'reserva_monto' => 'decimal:2',
        'reserva_situacion' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    protected $hidden = [
        'created_by',
        'updated_by',
        'deleted_at'
    ];

    protected $appends = [
        'es_activo',
        'nombre_completo_cliente',
        'telefono_formateado',
        'total_pasajeros',
        'es_agencia',
        'tipo_cliente'
    ];

    /**
     * Relaciones
     */
    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'usuario_id', 'usuario_id');
    }

    public function estado()
    {
        return $this->belongsTo(Estado::class, 'estado_id', 'estado_id');
    }

    public function agencia()
    {
        return $this->belongsTo(Agencia::class, 'agencia_id', 'agencia_id');
    }

    public function rutaActivada()
    {
        return $this->belongsTo(RutaActivada::class, 'ruta_activada_id', 'ruta_activada_id');
    }

    public function facturas()
    {
        return $this->hasMany(Factura::class, 'reserva_id', 'reserva_id');
    }

    public function facturaActiva()
    {
        return $this->hasOne(Factura::class, 'reserva_id', 'reserva_id')
            ->where('facturas_situacion', true)
            ->latest();
    }

    /**
     * Atributos calculados
     */
    public function getEsActivoAttribute()
    {
        return $this->reserva_situacion === true;
    }

    public function getNombreCompletoClienteAttribute()
    {
        return trim(($this->reserva_nombres_cliente ?? '') . ' ' . ($this->reserva_apellidos_cliente ?? ''));
    }

    public function getTelefonoFormateadoAttribute()
    {
        if (!$this->reserva_telefono_cliente) {
            return null;
        }

        $telefono = (string) $this->reserva_telefono_cliente;

        // Formato guatemalteco: +502 1234-5678
        if (strlen($telefono) === 11 && substr($telefono, 0, 3) === '502') {
            return '+502 ' . substr($telefono, 3, 4) . '-' . substr($telefono, 7);
        }

        return $telefono;
    }

    public function getTotalPasajerosAttribute()
    {
        return $this->reserva_cantidad_adultos + ($this->reserva_cantidad_ninos ?? 0);
    }

    public function getEsAgenciaAttribute()
    {
        return $this->agencia_id !== null;
    }

    public function getTipoClienteAttribute()
    {
        return $this->es_agencia ? 'Agencia' : 'Directo';
    }

    /**
     * Scopes
     */
    public function scopeActivo($query)
    {
        return $query->where('reserva_situacion', true);
    }

    public function scopePorCodigo($query, $codigo)
    {
        return $query->where('reserva_codigo', $codigo);
    }

    public function scopeHoy($query)
    {
        return $query->whereDate('created_at', now()->toDateString());
    }

    public function scopeDeAgencias($query)
    {
        return $query->whereNotNull('agencia_id');
    }

    public function scopeDirectas($query)
    {
        return $query->whereNull('agencia_id');
    }

    public function scopePendientes($query)
    {
        return $query->whereHas('estado', function ($q) {
            $q->where('estado_codigo', 'RES_PEND');
        });
    }

    public function scopeConfirmadas($query)
    {
        return $query->whereHas('estado', function ($q) {
            $q->where('estado_codigo', 'RES_CONF');
        });
    }

    public function scopeEjecutandose($query)
    {
        return $query->whereHas('estado', function ($q) {
            $q->where('estado_codigo', 'RES_EJEC');
        });
    }

    public function scopeFinalizadas($query)
    {
        return $query->whereHas('estado', function ($q) {
            $q->where('estado_codigo', 'RES_FIN');
        });
    }

    public function scopeCanceladas($query)
    {
        return $query->whereHas('estado', function ($q) {
            $q->where('estado_codigo', 'RES_CANC');
        });
    }

    public function scopeBuscarCliente($query, $termino)
    {
        return $query->where(function ($q) use ($termino) {
            $q->where('reserva_nombres_cliente', 'like', "%{$termino}%")
                ->orWhere('reserva_apellidos_cliente', 'like', "%{$termino}%")
                ->orWhere('reserva_telefono_cliente', 'like', "%{$termino}%")
                ->orWhere('reserva_email_cliente', 'like', "%{$termino}%");
        });
    }

    /**
     * Métodos de negocio
     */
    public function estaPendiente()
    {
        return $this->estado && $this->estado->estado_codigo === 'RES_PEND';
    }

    public function estaConfirmada()
    {
        return $this->estado && $this->estado->estado_codigo === 'RES_CONF';
    }

    public function seEstaEjecutando()
    {
        return $this->estado && $this->estado->estado_codigo === 'RES_EJEC';
    }

    public function estaFinalizada()
    {
        return $this->estado && $this->estado->estado_codigo === 'RES_FIN';
    }

    public function estaCancelada()
    {
        return $this->estado && $this->estado->estado_codigo === 'RES_CANC';
    }

    public function cambiarEstado($nuevoEstadoCodigo)
    {
        $nuevoEstado = Estado::where('estado_codigo', $nuevoEstadoCodigo)->first();

        if (!$nuevoEstado) {
            throw new \Exception("Estado {$nuevoEstadoCodigo} no encontrado");
        }

        if ($this->estado && !$this->estado->permiteTransicion($nuevoEstadoCodigo)) {
            throw new \Exception("Transición no válida de {$this->estado->estado_codigo} a {$nuevoEstadoCodigo}");
        }

        $this->estado_id = $nuevoEstado->estado_id;
        $this->save();

        return $this;
    }

    public function confirmar()
    {
        return $this->cambiarEstado('RES_CONF');
    }

    public function ejecutar()
    {
        return $this->cambiarEstado('RES_EJEC');
    }

    public function finalizar()
    {
        return $this->cambiarEstado('RES_FIN');
    }

    public function cancelar()
    {
        return $this->cambiarEstado('RES_CANC');
    }

    public function generarCodigoUnico()
    {
        $prefijo = $this->es_agencia ? 'AG' : 'DR';
        $fecha = $this->created_at ? $this->created_at->format('ymd') : now()->format('ymd');
        $numero = str_pad($this->reserva_id ?? 0, 4, '0', STR_PAD_LEFT);

        return $prefijo . '-' . $fecha . '-' . $numero;
    }

    public function tieneFactura()
    {
        return $this->facturas()->where('facturas_situacion', true)->exists();
    }

    public function calcularMonto()
    {
        if (!$this->rutaActivada || !$this->rutaActivada->servicio) {
            return 0;
        }

        return $this->rutaActivada->servicio->calcularPrecio(
            $this->reserva_cantidad_adultos,
            $this->reserva_cantidad_ninos,
            $this->es_agencia
        );
    }

    public function tieneTelefonoValido()
    {
        return $this->reserva_telefono_cliente &&
            strlen((string) $this->reserva_telefono_cliente) >= 8;
    }

    public function tieneEmailValido()
    {
        return $this->reserva_email_cliente &&
            filter_var($this->reserva_email_cliente, FILTER_VALIDATE_EMAIL);
    }

    public function datosCompletos()
    {
        return !empty($this->reserva_nombres_cliente) &&
            !empty($this->reserva_apellidos_cliente) &&
            $this->reserva_cantidad_adultos > 0 &&
            $this->tieneTelefonoValido();
    }

    public function linkWhatsApp($mensaje = null)
    {
        if (!$this->tieneTelefonoValido()) {
            return null;
        }

        $telefono = (string) $this->reserva_telefono_cliente;
        $mensaje_encoded = $mensaje ? urlencode($mensaje) : '';

        return "https://wa.me/{$telefono}" . ($mensaje ? "?text={$mensaje_encoded}" : '');
    }

    public function mensajeWhatsAppConfirmacion()
    {
        if (!$this->rutaActivada) {
            return null;
        }

        return "Hola {$this->reserva_nombres_cliente}, tu reserva {$this->reserva_codigo} ha sido confirmada. " .
            "Detalles: {$this->total_pasajeros} pasajeros para el servicio del " .
            "{$this->rutaActivada->ruta_activada_fecha->format('d/m/Y')} a las " .
            "{$this->rutaActivada->ruta_activada_hora->format('H:i')}. " .
            "Monto: Q{$this->reserva_monto}. ¡Gracias por elegir Magic Travel!";
    }

    public function resumenCompleto()
    {
        return [
            'reserva' => [
                'codigo' => $this->reserva_codigo,
                'cliente' => $this->nombre_completo_cliente,
                'telefono' => $this->telefono_formateado,
                'email' => $this->reserva_email_cliente,
                'pasajeros' => [
                    'adultos' => $this->reserva_cantidad_adultos,
                    'ninos' => $this->reserva_cantidad_ninos,
                    'total' => $this->total_pasajeros
                ],
                'monto' => $this->reserva_monto,
                'tipo_cliente' => $this->tipo_cliente,
                'direccion_abordaje' => $this->reserva_direccion_abordaje,
                'notas' => $this->reserva_notas
            ],
            'servicio' => $this->rutaActivada && $this->rutaActivada->servicio ? [
                'nombre' => $this->rutaActivada->servicio->servicio_servicio,
                'fecha' => $this->rutaActivada->ruta_activada_fecha->format('d/m/Y'),
                'hora' => $this->rutaActivada->ruta_activada_hora->format('H:i'),
                'ruta' => $this->rutaActivada->ruta ? $this->rutaActivada->ruta->ruta_completa : null
            ] : null,
            'estado' => $this->estado ? $this->estado->estado_estado : 'Sin estado',
            'vendedor' => $this->usuario ? $this->usuario->nombre_completo : 'Sin vendedor',
            'agencia' => $this->agencia ? $this->agencia->agencia_razon_social : null,
            'facturado' => $this->tieneFactura()
        ];
    }
}
