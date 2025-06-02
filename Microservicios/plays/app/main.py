from fastapi import FastAPI, WebSocket
from kafka import KafkaConsumer
from routes.plays import routerPlays
from routes.reportExcel import routerReporteExcel

import asyncio
import threading

app = FastAPI(
    title="Games",
    description="Microservicio",
    version="0.0.1"
)

app.include_router(routerPlays)
app.include_router(routerReporteExcel)
@app.get('/')
def read_root():
    return {"hello":"PLAYS"}



websockets = []

@app.websocket("/ws/partidas")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    websockets.append(websocket)  # Añadir el cliente WebSocket a la lista
    print(f"Nuevo cliente conectado: {websocket.client}")
    try:
        while True:
            await asyncio.sleep(1)
    except Exception as e:
        print(f"Error en WebSocket: {e}")
    finally:
        websockets.remove(websocket)  # Eliminar WebSocket de la lista cuando se desconecte
        print(f"Cliente desconectado: {websocket.client}")
    #websockets.remove(websocket)  # Eliminar WebSocket de la lista cuando se desconecte

# Función Kafka Consumer
def kafka_listener():
    consumer = KafkaConsumer(
        'partidas',  # Tópico de Kafka
        bootstrap_servers='Kafka:9092',  # Dirección del servidor Kafka
        auto_offset_reset='earliest',  # Para comenzar desde el principio del topic
        group_id='game-group'  # Grupo de consumidores (puedes cambiarlo si lo deseas)
    )
    print("Esperando mensajes de Kafka...")

    for message in consumer:
        data = message.value.decode('utf-8')
        print(f"Mensaje recibido de Kafka: {data}")
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        loop.run_until_complete(send_to_websockets(data))

async def send_to_websockets(data: str):
    for ws in websockets:
        try:
            await ws.send_text(data)
        except Exception as e:
            print(f"No se pudo enviar el mensaje a {ws.client}: {e}")

@app.on_event("startup")
def startup_event():
    threading.Thread(target=kafka_listener, daemon=True).start()

