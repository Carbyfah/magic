<?php

namespace App\Http\Controllers\Api;

use App\Models\Pais;
use App\Http\Resources\PaisResource;

class PaisController extends BaseCatalogoController
{
    public function __construct()
    {
        $this->model = Pais::class;
        $this->resource = PaisResource::class;
        $this->searchField = 'nombre_pais';

        $this->storeRules = [
            'nombre_pais' => 'required|string|max:100',
            'codigo_iso2' => 'required|string|size:2|unique:paises,codigo_iso2',
            'codigo_iso3' => 'required|string|size:3|unique:paises,codigo_iso3',
            'codigo_telefono' => 'nullable|string|max:5'
        ];

        $this->updateRules = [
            'nombre_pais' => 'sometimes|required|string|max:100',
            'codigo_iso2' => 'sometimes|required|string|size:2|unique:paises,codigo_iso2',
            'codigo_iso3' => 'sometimes|required|string|size:3|unique:paises,codigo_iso3',
            'codigo_telefono' => 'sometimes|nullable|string|max:5'
        ];

        $this->relationships = [];
    }
}
