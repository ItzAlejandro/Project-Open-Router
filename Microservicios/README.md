# Autores Kevin Bastidas - Bryan Guevara
Este documento describe los pasos para construir y ejecutar un entorno basado en Docker Compose.

## **Requisitos Previos**

Antes de comenzar, asegúrate de tener instalado lo siguiente:

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)

Puedes verificar la instalación con los siguientes comandos:
```sh
docker --version
docker-compose --version
```

## **Construcción y Ejecución**

Para construir y levantar los servicios definidos en el archivo `docker-compose.yml`, ejecuta:

```sh
docker-compose up --build
```

Este comando:
1. Construirá las imágenes necesarias.
2. Creará y ejecutará los contenedores según la configuración definida.

Si ya se han construido las imágenes previamente y solo deseas ejecutar los servicios, usa:

```sh
docker-compose up
```

Para ejecutar los contenedores en modo **detached** (en segundo plano), agrega el flag `-d`:

```sh
docker-compose up -d
```

## **Verificación**

Para asegurarte de que los contenedores están corriendo, usa:

```sh
docker ps
```

Esto mostrará la lista de contenedores en ejecución.

Para ver los logs de un servicio específico:

```sh
docker logs -f <nombre_del_servicio>
```

Ejemplo:
```sh
docker logs -f kafka
```

## **Detener y Eliminar Contenedores**

Para detener los contenedores sin eliminarlos:

```sh
docker-compose down
```

Para detener y eliminar los contenedores, junto con las redes y volúmenes creados:

```sh
docker-compose down -v
```

## **Reconstrucción Forzada**

Si necesitas reconstruir las imágenes sin usar la caché:

```sh
docker-compose build --no-cache
```

Luego, inicia nuevamente:

```sh
docker-compose up
```

## **Limpieza de Docker**

Si deseas limpiar imágenes, contenedores y volúmenes no utilizados:

```sh
docker system prune -a
```

Esto liberará espacio en disco eliminando recursos que ya no están en uso.

---
