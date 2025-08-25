<?php

namespace App\Http\Controllers\Api;

use App\Models\TipoLicencia;
use App\Http\Resources\TipoLicenciaResource;

class TipoLicenciaController extends BaseCatalogoController
{
    public function __construct()
    {
        $this->model = TipoLicencia::class;
        $this->resource = TipoLicenciaResource::class;
        $this->searchField = 'nombre_tipo';

        $this->storeRules = [
            'codigo' => 'required|string|max:5|unique:tipos_licencia,codigo',
            'nombre_tipo' => 'required|string|max:100',
            'descripcion' => 'nullable|string'
        ];

        $this->updateRules = [
            'codigo' => 'sometimes|required|string|max:5|unique:tipos_licencia,codigo',
            'nombre_tipo' => 'sometimes|required|string|max:100',
            'descripcion' => 'sometimes|nullable|string'
        ];

        $this->relationships = [];
    }
}
