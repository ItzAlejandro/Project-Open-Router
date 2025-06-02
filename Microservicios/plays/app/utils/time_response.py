import time
import asyncio

async def measure_response_time(funcion_predict, *args, **kwargs):
    """
    Mide cuánto tarda en ejecutarse una predicción del modelo.
    """
    inicio = time.perf_counter()
    
    resultado = await asyncio.to_thread(funcion_predict, *args, **kwargs)
    
    fin = time.perf_counter()
    duracion = round(fin - inicio, 4)  # segundos con 4 decimales
    return resultado, duracion