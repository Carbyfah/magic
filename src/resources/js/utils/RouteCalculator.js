// src/resources/js/utils/RouteCalculator.js

class RouteCalculator {
    constructor() {
        // Base de datos de carreteras principales Guatemala con velocidades
        this.carreteras = [
            // CA-1 PANAMERICANA
            { origen: "Guatemala", destino: "Chimaltenango", distancia: 54, velocidad: 70, carretera: "CA-1" },
            { origen: "Chimaltenango", destino: "Quetzaltenango", distancia: 152, velocidad: 65, carretera: "CA-1" },
            { origen: "Quetzaltenango", destino: "Huehuetenango", distancia: 84, velocidad: 60, carretera: "CA-1" },
            { origen: "Guatemala", destino: "Escuintla", distancia: 65, velocidad: 70, carretera: "CA-2" },

            // CA-9 AL ATLÁNTICO
            { origen: "Guatemala", destino: "Puerto Barrios", distancia: 308, velocidad: 65, carretera: "CA-9" },
            { origen: "Guatemala", destino: "Río Dulce", distancia: 272, velocidad: 65, carretera: "CA-9" },
            { origen: "Río Dulce", destino: "Puerto Barrios", distancia: 36, velocidad: 50, carretera: "CA-9" },
            { origen: "Río Dulce", destino: "Livingston", distancia: 28, velocidad: 35, carretera: "marítima" },

            // CA-14 AL PETÉN
            { origen: "Guatemala", destino: "Cobán", distancia: 219, velocidad: 45, carretera: "CA-14" },
            { origen: "Cobán", destino: "Flores", distancia: 347, velocidad: 40, carretera: "CA-13" },

            // REGIÓN CENTRAL
            { origen: "Guatemala", destino: "Antigua Guatemala", distancia: 45, velocidad: 60, carretera: "RN-10" },
            { origen: "Antigua Guatemala", destino: "Panajachel", distancia: 95, velocidad: 50, carretera: "regional" },
            { origen: "Guatemala", destino: "Amatitlán", distancia: 27, velocidad: 55, carretera: "CA-9" },

            // ORIENTE
            { origen: "Guatemala", destino: "Jalapa", distancia: 97, velocidad: 55, carretera: "CA-1" },
            { origen: "Guatemala", destino: "Jutiapa", distancia: 124, velocidad: 55, carretera: "CA-1" },
            { origen: "Jutiapa", destino: "Esquipulas", distancia: 106, velocidad: 50, carretera: "regional" },
            { origen: "Guatemala", destino: "Chiquimula", distancia: 174, velocidad: 55, carretera: "CA-10" },

            // SUR
            { origen: "Escuintla", destino: "Retalhuleu", distancia: 77, velocidad: 65, carretera: "CA-2" },
            { origen: "Retalhuleu", destino: "Quetzaltenango", distancia: 77, velocidad: 60, carretera: "regional" },
            { origen: "Escuintla", destino: "Mazatenango", distancia: 157, velocidad: 65, carretera: "CA-2" }
        ];

        // Velocidades promedio por tipo de carretera y región
        this.velocidadesPorTipo = {
            "autopista": 80,
            "CA-1": 65,  // Panamericana
            "CA-2": 70,  // Pacífico
            "CA-9": 65,  // Atlántico
            "CA-13": 40, // Petén
            "CA-14": 45, // Cobán
            "departamental": 45,
            "regional": 50,
            "municipal": 35,
            "montañosa": 30,
            "selva": 25,
            "marítima": 35
        };
    }

    /**
     * Calcular distancia entre dos puntos usando fórmula Haversine
     * @param {number} lat1 - Latitud punto 1
     * @param {number} lng1 - Longitud punto 1
     * @param {number} lat2 - Latitud punto 2
     * @param {number} lng2 - Longitud punto 2
     * @returns {number} Distancia en kilómetros
     */
    calcularDistanciaHaversine(lat1, lng1, lat2, lng2) {
        const R = 6371; // Radio de la Tierra en km
        const dLat = this.toRadians(lat2 - lat1);
        const dLng = this.toRadians(lng2 - lng1);

        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distancia = R * c;

        return Math.round(distancia * 100) / 100; // Redondear a 2 decimales
    }

    /**
     * Convertir grados a radianes
     * @param {number} degrees
     * @returns {number}
     */
    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    /**
     * Buscar ruta en base de datos
     * @param {string} ciudadOrigen
     * @param {string} ciudadDestino
     * @returns {object|null}
     */
    buscarRutaConocida(ciudadOrigen, ciudadDestino) {
        // Buscar ruta directa
        let ruta = this.carreteras.find(r =>
            (r.origen.toLowerCase() === ciudadOrigen.toLowerCase() &&
                r.destino.toLowerCase() === ciudadDestino.toLowerCase()) ||
            (r.destino.toLowerCase() === ciudadOrigen.toLowerCase() &&
                r.origen.toLowerCase() === ciudadDestino.toLowerCase())
        );

        return ruta;
    }

    /**
     * Determinar tipo de carretera basado en ubicación
     * @param {string} ciudadOrigen
     * @param {string} ciudadDestino
     * @param {number} distancia
     * @returns {string}
     */
    determinarTipoCarretera(ciudadOrigen, ciudadDestino, distancia) {
        const ciudadesImportantes = [
            "Guatemala", "Quetzaltenango", "Antigua Guatemala",
            "Escuintla", "Puerto Barrios", "Cobán", "Flores", "Huehuetenango"
        ];

        const esImportanteOrigen = ciudadesImportantes.some(c =>
            ciudadOrigen.toLowerCase().includes(c.toLowerCase()));
        const esImportanteDestino = ciudadesImportantes.some(c =>
            ciudadDestino.toLowerCase().includes(c.toLowerCase()));

        // Si ambas son ciudades importantes y distancia > 100km
        if (esImportanteOrigen && esImportanteDestino && distancia > 100) {
            return "CA-1"; // Carretera principal
        }

        // Rutas hacia el Petén (norte)
        if (ciudadDestino.toLowerCase().includes("flores") ||
            ciudadDestino.toLowerCase().includes("petén")) {
            return "selva";
        }

        // Rutas montañosas (occidente)
        if (ciudadDestino.toLowerCase().includes("huehuetenango") ||
            ciudadDestino.toLowerCase().includes("quetzaltenango") ||
            ciudadOrigen.toLowerCase().includes("huehuetenango")) {
            return "montañosa";
        }

        // Rutas costeras
        if (ciudadDestino.toLowerCase().includes("livingston") ||
            ciudadDestino.toLowerCase().includes("puerto")) {
            return "regional";
        }

        // Por defecto según distancia
        if (distancia > 200) return "CA-1";
        if (distancia > 100) return "departamental";
        if (distancia > 50) return "regional";

        return "municipal";
    }

    /**
     * Calcular tiempo de viaje considerando factores reales
     * @param {number} distancia - Distancia en km
     * @param {string} tipoCarretera
     * @param {string} horaInicio - Hora en formato HH:MM
     * @returns {object}
     */
    calcularTiempoViaje(distancia, tipoCarretera, horaInicio = null) {
        let velocidadBase = this.velocidadesPorTipo[tipoCarretera] || 45;

        // Factor de tráfico por hora (si se proporciona)
        if (horaInicio) {
            const hora = parseInt(horaInicio.split(':')[0]);

            // Horas pico en Guatemala: 7-9 AM, 5-7 PM
            if ((hora >= 7 && hora <= 9) || (hora >= 17 && hora <= 19)) {
                velocidadBase *= 0.7; // Reducir velocidad 30% en hora pico
            }
            // Horas nocturnas: velocidad reducida por seguridad
            else if (hora >= 22 || hora <= 5) {
                velocidadBase *= 0.8; // Reducir velocidad 20% de noche
            }
        }

        // Factor de paradas (cada 100km aproximadamente 15 minutos)
        const minutosParadas = Math.floor(distancia / 100) * 15;

        // Tiempo base de viaje
        const tiempoBase = (distancia / velocidadBase) * 60; // En minutos

        // Tiempo total incluyendo paradas
        const tiempoTotal = Math.round(tiempoBase + minutosParadas);

        return {
            tiempoMinutos: tiempoTotal,
            tiempoHoras: Math.round(tiempoTotal / 60 * 100) / 100,
            velocidadPromedio: Math.round(velocidadBase),
            minutosParadas: minutosParadas,
            factorTrafico: horaInicio ? this.obtenerFactorTrafico(horaInicio) : 1.0
        };
    }

    /**
     * Obtener factor de tráfico por hora
     * @param {string} horaInicio
     * @returns {number}
     */
    obtenerFactorTrafico(horaInicio) {
        const hora = parseInt(horaInicio.split(':')[0]);

        if ((hora >= 7 && hora <= 9) || (hora >= 17 && hora <= 19)) {
            return 0.7; // Tráfico pesado
        } else if (hora >= 22 || hora <= 5) {
            return 0.8; // Precaución nocturna
        } else {
            return 1.0; // Tráfico normal
        }
    }

    /**
     * Calcular hora de llegada estimada
     * @param {string} horaSalida - Formato HH:MM
     * @param {number} tiempoMinutos
     * @returns {string} Hora en formato HH:MM
     */
    calcularHoraLlegada(horaSalida, tiempoMinutos) {
        if (!horaSalida) return null;

        const [horas, minutos] = horaSalida.split(':').map(Number);
        const salidaMinutos = horas * 60 + minutos;
        const llegadaMinutos = salidaMinutos + tiempoMinutos;

        const horasLlegada = Math.floor(llegadaMinutos / 60) % 24;
        const minutosLlegada = llegadaMinutos % 60;

        return `${horasLlegada.toString().padStart(2, '0')}:${minutosLlegada.toString().padStart(2, '0')}`;
    }

    /**
     * Función principal para calcular ruta completa
     * @param {object} origen - { nombre, ciudad, latitud, longitud }
     * @param {object} destino - { nombre, ciudad, latitud, longitud }
     * @param {string} horaSalida - Formato HH:MM (opcional)
     * @returns {object}
     */
    calcularRuta(origen, destino, horaSalida = null) {
        // 1. Buscar ruta conocida primero
        const rutaConocida = this.buscarRutaConocida(origen.ciudad, destino.ciudad);

        let distancia, tipoCarretera, velocidadPromedio;

        if (rutaConocida) {
            // Usar datos de ruta conocida
            distancia = rutaConocida.distancia;
            tipoCarretera = rutaConocida.carretera;
            velocidadPromedio = rutaConocida.velocidad;
        } else {
            // Calcular usando coordenadas
            distancia = this.calcularDistanciaHaversine(
                origen.latitud, origen.longitud,
                destino.latitud, destino.longitud
            );

            // Factor de corrección para rutas por carretera (no línea recta)
            distancia = distancia * 1.3; // 30% más por rutas reales
            distancia = Math.round(distancia * 100) / 100;

            tipoCarretera = this.determinarTipoCarretera(origen.ciudad, destino.ciudad, distancia);
            velocidadPromedio = this.velocidadesPorTipo[tipoCarretera] || 45;
        }

        // 2. Calcular tiempo de viaje
        const tiempoInfo = this.calcularTiempoViaje(distancia, tipoCarretera, horaSalida);

        // 3. Calcular hora de llegada
        const horaLlegada = horaSalida ?
            this.calcularHoraLlegada(horaSalida, tiempoInfo.tiempoMinutos) : null;

        // 4. Generar resumen de ruta
        const resumen = this.generarResumenRuta(origen, destino, distancia, tiempoInfo, tipoCarretera);

        return {
            origen: origen,
            destino: destino,
            distancia_km: distancia,
            duracion_minutos: tiempoInfo.tiempoMinutos,
            duracion_horas: tiempoInfo.tiempoHoras,
            hora_salida: horaSalida,
            hora_llegada_estimada: horaLlegada,
            tipo_carretera: tipoCarretera,
            velocidad_promedio: tiempoInfo.velocidadPromedio,
            factor_trafico: tiempoInfo.factorTrafico,
            minutos_paradas: tiempoInfo.minutosParadas,
            resumen: resumen,
            calculado_con: rutaConocida ? 'base_datos' : 'coordenadas'
        };
    }

    /**
     * Generar resumen legible de la ruta
     * @param {object} origen
     * @param {object} destino
     * @param {number} distancia
     * @param {object} tiempoInfo
     * @param {string} tipoCarretera
     * @returns {string}
     */
    generarResumenRuta(origen, destino, distancia, tiempoInfo, tipoCarretera) {
        const horas = Math.floor(tiempoInfo.tiempoMinutos / 60);
        const minutos = tiempoInfo.tiempoMinutos % 60;

        let tiempoStr = '';
        if (horas > 0) {
            tiempoStr = `${horas}h ${minutos}min`;
        } else {
            tiempoStr = `${minutos} minutos`;
        }

        const tiposCarretera = {
            "CA-1": "Carretera Panamericana",
            "CA-2": "Carretera del Pacífico",
            "CA-9": "Carretera al Atlántico",
            "CA-13": "Carretera al Petén",
            "departamental": "carretera departamental",
            "regional": "carretera regional",
            "municipal": "carretera municipal",
            "montañosa": "carretera de montaña",
            "selva": "carretera por selva"
        };

        const descripcionCarretera = tiposCarretera[tipoCarretera] || "carretera local";

        return `${distancia} km por ${descripcionCarretera}, tiempo estimado: ${tiempoStr} (velocidad promedio: ${tiempoInfo.velocidadPromedio} km/h)`;
    }

    /**
     * Validar datos de lugares
     * @param {object} lugar
     * @returns {boolean}
     */
    validarLugar(lugar) {
        return lugar &&
            lugar.nombre &&
            lugar.ciudad &&
            typeof lugar.latitud === 'number' &&
            typeof lugar.longitud === 'number' &&
            lugar.latitud >= 13.5 && lugar.latitud <= 18.0 && // Rangos Guatemala
            lugar.longitud >= -92.5 && lugar.longitud <= -88.0;
    }

    /**
     * Función pública para usar en componentes
     * @param {object} puntoOrigen
     * @param {object} puntoDestino
     * @param {string} horaSalida
     * @returns {object|null}
     */
    static calcular(puntoOrigen, puntoDestino, horaSalida = null) {
        const calculator = new RouteCalculator();

        // Validar datos
        if (!calculator.validarLugar(puntoOrigen) || !calculator.validarLugar(puntoDestino)) {
            console.error('Datos de lugares inválidos:', { puntoOrigen, puntoDestino });
            return null;
        }

        return calculator.calcularRuta(puntoOrigen, puntoDestino, horaSalida);
    }
}

export default RouteCalculator;
