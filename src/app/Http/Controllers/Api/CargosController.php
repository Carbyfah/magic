<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CargoResource;
use App\Models\Cargo;
use Illuminate\Http\Request;

class CargosController extends Controller
{
    public function index(Request $request)
    {
        $query = Cargo::query();

        if ($request->filled('nombre')) {
            $query->where('cargo_nombre', 'like', '%' . $request->get('nombre') . '%');
        }

        $cargos = $query->orderBy('cargo_nombre')->paginate(15);

        return CargoResource::collection($cargos);
    }

    public function show(Cargo $cargo)
    {
        $cargo->load('empleados');
        return new CargoResource($cargo);
    }

    public function store(Request $request)
    {
        $request->validate([
            'cargo_nombre' => 'required|string|max:45|unique:cargo,cargo_nombre'
        ]);

        $cargo = Cargo::create([
            'cargo_nombre' => $request->cargo_nombre,
            'created_by' => $request->user()->id_usuarios ?? 1
        ]);

        return response()->json([
            'success' => true,
            'data' => new CargoResource($cargo)
        ], 201);
    }
}
