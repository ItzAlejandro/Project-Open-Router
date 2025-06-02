from aiokafka import AIOKafkaProducer
import json

KAFKA_BOOTSTRAP_SERVERS = "kafka:9092"
KAFKA_TOPIC = "partidas"

async def get_kafka_producer():
    producer = AIOKafkaProducer(
        bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
        value_serializer=lambda v: json.dumps(v).encode("utf-8")
    )
    await producer.start()
    return producer

async def send_to_kafka(producer, message):
    try:
        print("ingresa al producer", message)
        await producer.send(KAFKA_TOPIC, message)
    except Exception as e:
        raise Exception(f"Kafka error: {e}")
