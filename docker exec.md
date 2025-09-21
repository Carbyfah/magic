# Comandos para migraciones

<!-- Para entrar al servidor de la base de datos, usa este comando: -->

docker exec -it magictravel_mysql mysql -u root -p

<!-- la contraseña de root de MySQL es: -->

root_secure_2025

<!-- Una vez dentro de MySQL, puedes seleccionar la base de datos: -->

USE magictravel_v_2;

<!-- Y verificar las tablas actuales: -->

SHOW TABLES;

<!-- Si confirmas, aquí están los comandos para limpiar completamente: -->

-- Deshabilitar verificación de FK temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Eliminar todas las tablas principales
DROP TABLE IF EXISTS reserva;
DROP TABLE IF EXISTS ruta_activada;
DROP TABLE IF EXISTS usuario;
DROP TABLE IF EXISTS contactos_agencia;
DROP TABLE IF EXISTS vehiculo;
DROP TABLE IF EXISTS persona;
DROP TABLE IF EXISTS agencia;
DROP TABLE IF EXISTS ruta;
DROP TABLE IF EXISTS servicio;
DROP TABLE IF EXISTS estado;
DROP TABLE IF EXISTS rol;
DROP TABLE IF EXISTS tipo_persona;

-- Eliminar todas las tablas de auditoría
DROP TABLE IF EXISTS reserva_auditoria;
DROP TABLE IF EXISTS ruta_activada_auditoria;
DROP TABLE IF EXISTS usuario_auditoria;
DROP TABLE IF EXISTS contactos_agencia_auditoria;
DROP TABLE IF EXISTS vehiculo_auditoria;
DROP TABLE IF EXISTS persona_auditoria;
DROP TABLE IF EXISTS agencia_auditoria;
DROP TABLE IF EXISTS ruta_auditoria;
DROP TABLE IF EXISTS servicio_auditoria;
DROP TABLE IF EXISTS estado_auditoria;
DROP TABLE IF EXISTS rol_auditoria;
DROP TABLE IF EXISTS tipo_persona_auditoria;

-- Eliminar vistas
DROP VIEW IF EXISTS v_ingresos_diarios;
DROP VIEW IF EXISTS v_reservas_completas;
DROP VIEW IF EXISTS v_ocupacion_rutas;

-- Reactivar verificación de FK
SET FOREIGN_KEY_CHECKS = 1;

<!-- Ahora sal de MySQL y vamos a ejecutar las nuevas migraciones desde Laravel: -->

EXIT;
docker exec -it magictravel_php bash

<!-- Veamos el estado actual: -->

php artisan migrate:status

<!-- Si aparecen como "Ran", necesitamos resetear el registro de migraciones. Ejecuta: -->

<!-- # Ver qué migraciones están registradas -->

php artisan migrate:status

<!-- # Si las migraciones aparecen como ejecutadas, resetea el estado -->

php artisan migrate:reset

<!-- # Luego ejecuta las migraciones nuevamente -->

php artisan migrate

<!-- si se desea eliminar migraciones -->

docker exec -it magictravel_mysql mysql -u root -p
Contraseña: root_secure_2025

<!-- Luego ejecuta: -->

USE magictravel_v_2;

<!-- -- Limpiar solo las migraciones de Magic Travel, manteniendo las de Laravel -->

DELETE FROM migrations WHERE migration LIKE '%magic%';

<!-- -- Verificar que solo queden las migraciones de Laravel -->

<!-- SELECT * FROM migrations; -->

<!-- Sal de MySQL: -->

EXIT;

<!-- Entra nuevamente al contenedor PHP: -->

docker exec -it magictravel_php bash
cd /var/www/html

<!-- Ahora ejecuta las migraciones: -->

php artisan migrate

<!-- Entra a MySQL: -->

<!-- eliminar la db -->

docker exec -it magictravel_mysql mysql -u root -p
Contraseña: root_secure_2025

<!-- Elimina y recrea la base de datos: -->
<!-- sql-- Eliminar la base de datos completa -->

DROP DATABASE IF EXISTS magictravel_v_2;

<!-- -- Recrear la base de datos vacía -->

CREATE DATABASE magictravel_v_2 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

<!-- -- Otorgar permisos al usuario de aplicación -->

<!-- GRANT ALL PRIVILEGES ON magictravel_v_2.* TO 'mt_app'@'%'; -->

FLUSH PRIVILEGES;

<!-- -- Verificar que se creó correctamente -->

SHOW DATABASES;

<!-- Sal de MySQL: -->

EXIT;

<!-- Ahora entra al contenedor PHP y ejecuta las migraciones desde cero: -->

docker exec -it magictravel_php bash
cd /var/www/html
php artisan migrate
php artisan db:seed

<!-- # 1. Copiar archivo local al contenedor -->

docker cp C:\magic\magic\backend\database\migrations\16_agencias_optimizadas.php magictravel_php:/var/www/html/database/migrations/

<!-- # 2. Ver status de migraciones (opcional) -->

docker exec -it magictravel_php php artisan migrate:status

<!-- # 3. Ejecutar migración específica -->

docker exec -it magictravel_php php artisan migrate --path=database/migrations/16_agencias_optimizadas.php

PROTOCOLO DE MIGRACIONES DOCKER - MAGIC TRAVEL
Basado en tu experiencia, aquí están los códigos documentados:
FLUJO NORMAL (3 comandos básicos)

<!-- # 1. Copiar archivo local al contenedor -->

docker cp C:\magic\magic\backend\database\migrations\[ARCHIVO].php magictravel_php:/var/www/html/database/migrations/

<!-- # 2. Ver status de migraciones (opcional) -->

docker exec -it magictravel_php php artisan migrate:status

<!-- # 3. Ejecutar migración específica -->

docker exec -it magictravel_php php artisan migrate --path=database/migrations/[ARCHIVO].php
PROTOCOLO DE RECUPERACIÓN (cuando falla a medias)

<!-- # 1. Ver qué migraciones están registradas -->

docker exec -it magictravel_php php artisan migrate:status

<!-- # 2. Si la migración aparece como "Pending" (falló parcialmente) -->
<!-- # Limpiar objetos residuales manualmente: -->

docker exec -it magictravel_mysql mysql -u root -p'root_secure_2025' magictravel_v_2

<!-- # 3. En MySQL, eliminar todo lo que pudo haberse creado: -->

DROP VIEW IF EXISTS [nombre_vista];
DROP INDEX IF EXISTS [nombre_indice] ON [tabla];
EXIT;

<!-- # 4. Recopiar archivo corregido y ejecutar -->

docker cp C:\magic\magic\backend\database\migrations\[ARCHIVO].php magictravel_php:/var/www/html/database/migrations/
docker exec -it magictravel_php php artisan migrate --path=database/migrations/[ARCHIVO].php
ROLLBACK ESPECÍFICO (si se equivoca)

<!-- # Rollback de las últimas N migraciones -->

docker exec -it magictravel_php php artisan migrate:rollback --step=1

<!-- # Restaurar migración eliminada por error -->

docker exec -it magictravel_php php artisan migrate --path=database/migrations/[ARCHIVO_CORRECTO].php
ÉXITO CONFIRMADO: La optimización de agencias se ejecutó correctamente en 227ms. Ahora podemos probar si mejora el rendimiento del controlador
