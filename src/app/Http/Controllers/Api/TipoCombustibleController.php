<?php

namespace App\Http\Controllers\Api;

use App\Models\TipoCombustible;
use App\Http\Resources\TipoCombustibleResource;

class TipoCombustibleController extends BaseCatalogoController
{
    public function __construct()
    {
        $this->model = TipoCombustible::class;
        $this->resource = TipoCombustibleResource::class;
        $this->searchField = 'nombre_combustible';

        $this->storeRules = [
            'codigo' => 'required|string|max:10|unique:tipos_combustible,codigo',
            'nombre_combustible' => 'required|string|max:50',
            'unidad_medida' => 'required|string|max:10'
        ];

        $this->updateRules = [
            'codigo' => 'sometimes|required|string|max:10|unique:tipos_combustible,codigo',
            'nombre_combustible' => 'sometimes|required|string|max:50',
            'unidad_medida' => 'sometimes|required|string|max:10'
        ];

        $this->relationships = [];
    }
}
