<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

// Ruta raíz simple
Route::get('/', function () {
    return response()->json([
        'app' => 'Magic Travel API',
        'version' => '1.0',
        'status' => 'active'
    ]);
});

// Ruta login requerida por Laravel (para redirecciones de auth)
Route::get('/login', function () {
    return response()->json([
        'error' => 'Use /api/auth/login for authentication'
    ], 401);
})->name('login');
