<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Models\Servicio;
use App\Models\Reserva;
use App\Models\Caja;
use App\Models\User;
use App\Observers\ServicioObserver;
use App\Observers\ReservaObserver;
use App\Observers\CajaObserver;
use App\Observers\UsuarioObserver;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Registrar servicios en el contenedor - FASE 1
        $this->app->singleton(\App\Services\PrecioService::class);
        $this->app->singleton(\App\Services\CapacidadService::class);

        // Registrar servicios - FASE 2
        $this->app->singleton(\App\Services\EstadoRutaService::class);

        // Registrar servicios - FASE 3
        $this->app->singleton(\App\Services\TransferenciaService::class);
        $this->app->singleton(\App\Services\PagoService::class);
        $this->app->singleton(\App\Services\VentasService::class);

        // Registrar servicios - FASE 4
        $this->app->singleton(\App\Services\LiquidacionService::class);
        $this->app->singleton(\App\Services\ReportesService::class);

        // Registrar servicios - FASE 5
        $this->app->singleton(\App\Services\ContabilidadService::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Registrar observers
        Servicio::observe(ServicioObserver::class);
        Reserva::observe(ReservaObserver::class);
        Caja::observe(CajaObserver::class);
        User::observe(UsuarioObserver::class);
    }
}
