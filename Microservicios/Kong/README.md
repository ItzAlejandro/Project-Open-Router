# API Gateway - Kong (DB-less)

## **Descripción**
Este proyecto demuestra la implementación de **Kong** como API Gateway en modo **DB-less**, gestionando y enroutando solicitudes a microservicios en una arquitectura basada en contenedores.

## **Requisitos Previos**

Antes de ejecutar la configuración, asegúrate de contar con:

- **Docker y Docker Compose** instalados.
- **Microservicios funcionales** dentro del mismo entorno.
- **Configuración en YAML** para definir las rutas y servicios.

Puedes verificar las versiones de Docker con:
```sh
docker --version
docker-compose --version
```

## **Instalación y Configuración**

### **1. Explicación de qué es un API Gateway y su importancia en la integración empresarial**
Un **API Gateway** actúa como un punto único de entrada para las solicitudes a microservicios, gestionando la autenticación, balanceo de carga, seguridad y monitoreo. Es crucial en arquitecturas de microservicios para mejorar la escalabilidad y la gestión de tráfico.

### **2. Comparación de Kong y Apache APISIX en términos de arquitectura, características y rendimiento**
| Característica     | Kong                 | Apache APISIX           |
|-------------------|---------------------|-------------------------|
| Arquitectura      | Basado en Nginx + Lua | Basado en OpenResty + etcd |
| Base de datos     | PostgreSQL o DB-less | etcd (requerido) |
| Plugins          | Amplia variedad      | Extensible con Lua y Wasm |
| Rendimiento      | Alto rendimiento     | Optimizado con soporte nativo de gRPC |

### **3. Casos de uso recomendados para cada herramienta**
- **Kong**: Ideal para entornos híbridos, con necesidad de integración rápida y compatibilidad con plugins existentes.
- **Apache APISIX**: Recomendado para entornos de alto rendimiento con integración nativa en Kubernetes y compatibilidad con Wasm.

### **4. Consideraciones para implementación en producción**
- **Uso de autenticación** con JWT o OAuth2.
- **Configuración de Rate Limiting** para controlar tráfico.
- **Habilitación de registros y monitoreo** con herramientas como Prometheus y Grafana.

### **5. Repositorio con un ejemplo práctico**
Incluye:
- **Definición del API Gateway con Kong** en `docker-compose.yml`.
- **Configuración de servicios y rutas** en `kong.yml`.

### **6. Instalación y configuración de Kong**
Para incluir Kong en `docker-compose.yml`:

```yaml
services:
  kong:
    image: kong:latest
    container_name: kong
    ports:
      - "8000:8000"
      - "8001:8001"
    environment:
      KONG_DATABASE: "off"
      KONG_DECLARATIVE_CONFIG: "/usr/local/kong/kong.yml"
    volumes:
      - ./kong/kong.yml:/usr/local/kong/kong.yml
    networks:
      - my-network

networks:
  my-network:
    driver: bridge
```

### **7. Creación de una API expuesta y protegida con autenticación**
Ejemplo de configuración en `kong.yml` para exponer un servicio con autenticación:

```yaml
_format_version: "2.1"
services:
  - name: example-service
    url: http://example:8080
    routes:
      - name: example-route
        paths:
          - /api/example
        strip_path: false
plugins:
  - name: key-auth
    service: example-service
```

### **8. Pruebas funcionales con herramientas como Postman o cURL**
Para probar la API Gateway con `cURL`:

```sh
curl -X GET http://localhost:8000/api/example
```

Para probar la autenticación:

```sh
curl -X GET http://localhost:8000/api/example -H "apikey: YOUR_API_KEY"
```
