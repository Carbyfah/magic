<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tour;

class ToursController extends Controller
{
    /**
     * Listar tours con filtros básicos
     * GET /api/tours
     */

    public function index()
    {
        $tours = Tour::with('agencia')->paginate(15);
        return TourResource::collection($tours);
    }

    public function store(TourRequest $request)
    {
        $tour = Tour::create($request->validated());
        return new TourResource($tour);
    }
}
