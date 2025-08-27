<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\HasAudit;
use Carbon\Carbon;

class Factura extends Model
{
    use SoftDeletes, HasAudit;

    protected $table = 'facturas';
    protected $primaryKey = 'facturas_id';

    protected $fillable = [
        'facturas_codigo',
        'facturas_url',
        'facturas_hash',
        'facturas_fecha',
        'facturas_situacion',
        'usuario_id',
        'servicio_id',
        'reserva_id'
    ];

    protected $casts = [
        'facturas_fecha' => 'datetime',
        'facturas_situacion' => 'boolean',
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
        'fecha_formateada',
        'tiene_archivo',
        'nombre_archivo'
    ];

    /**
     * Relaciones
     */
    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'usuario_id', 'usuario_id');
    }

    public function servicio()
    {
        return $this->belongsTo(Servicio::class, 'servicio_id', 'servicio_id');
    }

    public function reserva()
    {
        return $this->belongsTo(Reserva::class, 'reserva_id', 'reserva_id');
    }

    /**
     * Atributos calculados
     */
    public function getEsActivoAttribute()
    {
        return $this->facturas_situacion === true;
    }

    public function getFechaFormateadaAttribute()
    {
        return $this->facturas_fecha ?
            Carbon::parse($this->facturas_fecha)->format('d/m/Y H:i') :
            null;
    }

    public function getTieneArchivoAttribute()
    {
        return !empty($this->facturas_url);
    }

    public function getNombreArchivoAttribute()
    {
        if (!$this->facturas_url) {
            return null;
        }

        return basename($this->facturas_url);
    }

    /**
     * Scopes
     */
    public function scopeActivo($query)
    {
        return $query->where('facturas_situacion', true);
    }

    public function scopePorCodigo($query, $codigo)
    {
        return $query->where('facturas_codigo', $codigo);
    }

    public function scopeHoy($query)
    {
        return $query->whereDate('facturas_fecha', now()->toDateString());
    }

    public function scopeDelMes($query, $mes = null, $anio = null)
    {
        $mes = $mes ?? now()->month;
        $anio = $anio ?? now()->year;

        return $query->whereMonth('facturas_fecha', $mes)
            ->whereYear('facturas_fecha', $anio);
    }

    public function scopeEntreFechas($query, $fechaInicio, $fechaFin)
    {
        return $query->whereBetween('facturas_fecha', [$fechaInicio, $fechaFin]);
    }

    public function scopeConArchivo($query)
    {
        return $query->whereNotNull('facturas_url');
    }

    public function scopeSinArchivo($query)
    {
        return $query->whereNull('facturas_url');
    }

    public function scopePorUsuario($query, $usuarioId)
    {
        return $query->where('usuario_id', $usuarioId);
    }

    public function scopePorServicio($query, $servicioId)
    {
        return $query->where('servicio_id', $servicioId);
    }

    /**
     * Métodos de negocio
     */
    public function generarCodigoUnico()
    {
        $fecha = $this->facturas_fecha ?
            Carbon::parse($this->facturas_fecha)->format('Ymd') :
            now()->format('Ymd');

        $numero = str_pad($this->facturas_id ?? 0, 4, '0', STR_PAD_LEFT);

        return 'FAC-' . $fecha . '-' . $numero;
    }

    public function generarHash()
    {
        $data = $this->facturas_codigo .
            $this->reserva_id .
            $this->usuario_id .
            ($this->facturas_fecha ? $this->facturas_fecha->timestamp : time());

        return hash('sha256', $data);
    }

    public function establecerFecha()
    {
        if (!$this->facturas_fecha) {
            $this->facturas_fecha = now();
            $this->save();
        }
    }

    public function establecerHash()
    {
        if (!$this->facturas_hash) {
            $this->facturas_hash = $this->generarHash();
            $this->save();
        }
    }

    public function getMontoFacturado()
    {
        return $this->reserva ? $this->reserva->reserva_monto : 0;
    }

    public function getClienteFacturado()
    {
        return $this->reserva ? [
            'nombre' => $this->reserva->nombre_completo_cliente,
            'telefono' => $this->reserva->telefono_formateado,
            'email' => $this->reserva->reserva_email_cliente,
            'nit' => $this->reserva->reserva_cliente_nit
        ] : null;
    }

    public function getVendedor()
    {
        return $this->usuario ? $this->usuario->nombre_completo : 'Usuario no disponible';
    }

    public function esDelMesActual()
    {
        return $this->facturas_fecha &&
            Carbon::parse($this->facturas_fecha)->isCurrentMonth();
    }

    public function esDeHoy()
    {
        return $this->facturas_fecha &&
            Carbon::parse($this->facturas_fecha)->isToday();
    }

    public function puedeEditarse()
    {
        // Las facturas solo pueden editarse el mismo día de creación
        return $this->esDeHoy() && !$this->tiene_archivo;
    }

    public function puedeAnularse()
    {
        // Las facturas pueden anularse dentro de 24 horas
        return $this->facturas_fecha &&
            Carbon::parse($this->facturas_fecha)->diffInHours(now()) < 24;
    }

    public function establecerURL($url)
    {
        $this->facturas_url = $url;
        $this->save();

        return $this;
    }

    public function anular()
    {
        if (!$this->puedeAnularse()) {
            throw new \Exception('Esta factura no puede ser anulada');
        }

        $this->facturas_situacion = false;
        $this->save();

        return $this;
    }

    public function validarIntegridad()
    {
        $hashCalculado = $this->generarHash();

        return $this->facturas_hash === $hashCalculado;
    }

    public function esFacturaDeAgencia()
    {
        return $this->reserva && $this->reserva->es_agencia;
    }

    public function getTipoFactura()
    {
        return $this->esFacturaDeAgencia() ? 'Agencia' : 'Cliente Directo';
    }

    public function resumenCompleto()
    {
        return [
            'factura' => [
                'codigo' => $this->facturas_codigo,
                'fecha' => $this->fecha_formateada,
                'hash' => $this->facturas_hash,
                'tiene_archivo' => $this->tiene_archivo,
                'nombre_archivo' => $this->nombre_archivo,
                'url' => $this->facturas_url
            ],
            'cliente' => $this->getClienteFacturado(),
            'monto' => $this->getMontoFacturado(),
            'tipo' => $this->getTipoFactura(),
            'vendedor' => $this->getVendedor(),
            'servicio' => $this->servicio ? [
                'nombre' => $this->servicio->servicio_servicio,
                'codigo' => $this->servicio->servicio_codigo
            ] : null,
            'reserva' => $this->reserva ? [
                'codigo' => $this->reserva->reserva_codigo,
                'pasajeros' => $this->reserva->total_pasajeros
            ] : null,
            'permisos' => [
                'puede_editarse' => $this->puedeEditarse(),
                'puede_anularse' => $this->puedeAnularse()
            ]
        ];
    }

    public function generarNombreArchivo()
    {
        $cliente = $this->reserva ?
            str_replace(' ', '_', $this->reserva->nombre_completo_cliente) :
            'Cliente';

        $fecha = $this->facturas_fecha ?
            Carbon::parse($this->facturas_fecha)->format('Y-m-d') :
            now()->format('Y-m-d');

        return "Factura_{$this->facturas_codigo}_{$cliente}_{$fecha}.pdf";
    }

    public static function totalFacturadoMes($mes = null, $anio = null)
    {
        return self::activo()
            ->delMes($mes, $anio)
            ->join('reserva', 'facturas.reserva_id', '=', 'reserva.reserva_id')
            ->sum('reserva.reserva_monto');
    }

    public static function cantidadFacturasMes($mes = null, $anio = null)
    {
        return self::activo()
            ->delMes($mes, $anio)
            ->count();
    }
}
