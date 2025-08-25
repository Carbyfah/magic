<?php

namespace App\Http\Controllers\Api;

use App\Models\Role;
use App\Http\Resources\RoleResource;

class RoleController extends BaseCatalogoController
{
    public function __construct()
    {
        $this->model = Role::class;
        $this->resource = RoleResource::class;
        $this->searchField = 'nombre_rol';

        $this->storeRules = [
            'codigo' => 'required|string|max:20|unique:roles,codigo',
            'nombre_rol' => 'required|string|max:100',
            'descripcion' => 'nullable|string',
            'permisos_json' => 'nullable|array',
            'nivel_jerarquia' => 'required|integer|min:1|max:10',
            'puede_autorizar' => 'boolean'
        ];

        $this->updateRules = [
            'codigo' => 'sometimes|required|string|max:20|unique:roles,codigo',
            'nombre_rol' => 'sometimes|required|string|max:100',
            'descripcion' => 'sometimes|nullable|string',
            'permisos_json' => 'sometimes|nullable|array',
            'nivel_jerarquia' => 'sometimes|required|integer|min:1|max:10',
            'puede_autorizar' => 'sometimes|boolean'
        ];

        $this->relationships = [];
    }
}
