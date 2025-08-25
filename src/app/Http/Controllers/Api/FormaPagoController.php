<?php

namespace App\Http\Controllers\Api;

use App\Models\FormaPago;
use App\Http\Resources\FormaPagoResource;

class FormaPagoController extends BaseCatalogoController
{
    public function __construct()
    {
        $this->model = FormaPago::class;
        $this->resource = FormaPagoResource::class;
        $this->searchField = 'nombre_forma';

        $this->storeRules = [
            'codigo' => 'required|string|max:10|unique:formas_pago,codigo',
            'nombre_forma' => 'required|string|max:100',
            'descripcion' => 'nullable|string',
            'requiere_comprobante' => 'boolean',
            'genera_credito' => 'boolean',
            'dias_credito' => 'integer|min:0'
        ];

        $this->updateRules = [
            'codigo' => 'sometimes|required|string|max:10|unique:formas_pago,codigo',
            'nombre_forma' => 'sometimes|required|string|max:100',
            'descripcion' => 'sometimes|nullable|string',
            'requiere_comprobante' => 'sometimes|boolean',
            'genera_credito' => 'sometimes|boolean',
            'dias_credito' => 'sometimes|integer|min:0'
        ];

        $this->relationships = [];
    }
}
