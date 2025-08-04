<?php

use Illuminate\Support\Facades\Route;

// Ruta principal que sirve la SPA React
Route::get('/', function () {
    return view('app');
});

// Todas las rutas del SPA (catch-all para React Router)
Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*');
