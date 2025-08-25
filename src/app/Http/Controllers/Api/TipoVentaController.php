<?php

namespace App\Http\Controllers\Api;

use App\Models\TipoVenta;
use App\Http\Resources\TipoVentaResource;

class TipoVentaController extends BaseCatalogoController
{
    public function __construct()
    {
        $this->model = TipoVenta::class;
        $this->resource = TipoVentaResource::class;
        $this->searchField = 'nombre_tipo';

        $this->storeRules = [
            'codigo' => 'required|string|max:10|unique:tipos_venta,codigo',
            'nombre_tipo' => 'required|string|max:100',
            'descripcion' => 'nullable|string',
            'genera_comision' => 'boolean',
            'requiere_voucher' => 'boolean'
        ];

        $this->updateRules = [
            'codigo' => 'sometimes|required|string|max:10|unique:tipos_venta,codigo',
            'nombre_tipo' => 'sometimes|required|string|max:100',
            'descripcion' => 'sometimes|nullable|string',
            'genera_comision' => 'sometimes|boolean',
            'requiere_voucher' => 'sometimes|boolean'
        ];

        $this->relationships = [];
    }
}
