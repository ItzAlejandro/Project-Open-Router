from fastapi import APIRouter,  HTTPException
from fastapi.responses import  JSONResponse
from models.partidas import Partida
from config.database import partidas_collection, collection_name, collection_response
from langchain.prompts import PromptTemplate
from langchain.memory import ConversationBufferMemory
from langchain.chains import LLMChain
from utils.llm_utils import create_llm
from utils.time_response import measure_response_time
from utils.board import generate_board
from utils.move_parser import _is_winner, _occupied_position, parseo_text
from services.kafka_producer import get_kafka_producer, send_to_kafka
from fastapi import HTTPException
import json
import asyncio
import re

routerPlays =APIRouter()

@routerPlays.post('/partidas', tags=['partidas'])
async def insertar_partida(partida: Partida):
    try:
        partida_dict = dict(partida)  
        partida_dict['fecha'] = partida_dict['fecha'].isoformat() 

        model1 = await collection_name.find_one({"idModel": partida.ia1})
        model2 = await collection_name.find_one({"idModel": partida.ia2})

        if not model1:
            raise HTTPException(status_code=404, detail="Verifique el modelo 1")
        if not model2:
            raise HTTPException(status_code=404, detail="Verifique el modelo 2")
        
        result = await partidas_collection.insert_one(partida_dict)
        partida_id = str(result.inserted_id)
        partida_dict["_id"] = partida_id

        

        llm_1 = create_llm(model1, partida.apikey if model1["idOrigin"] == "openRouter" else partida.apiKeyOpenAi, model1["idOrigin"] == "openRouter")
        llm_2 = create_llm(model2, partida.apikey if model2["idOrigin"] == "openRouter" else partida.apiKeyOpenAi, model2["idOrigin"] == "openRouter")

        template_1 = """
        -[REGLAS DEL JUEGO]
        Eres un experto en juegos tradicionales por turnos, como el tres en raya, damas o ajedrez. Estás participando en una partida simulada contra otro modelo de lenguaje. Tu objetivo es jugar estratégicamente, analizar cada jugada y seguir las reglas definidas por el usuario.
        Está prohibido seleccionar una posición ya utilizada.
        Si el modelo anterior eligió una posición, **no la puedes repetir bajo ninguna circunstancia**.
        Si lo haces, tu jugada será inválida.
        Debes esperar tu turno: solo puedes jugar después de que el modelo anterior haya hecho su jugada.
        "Recuerda que NO puedes ganar si no hay al menos 5 jugadas previas. No inventes resultados."
        **Historial de la conversación**:
        {chat_history_1}
        Instrucciones:
         - Piensa y responde como si fueras un jugador profesional.
         - El Tablero empieza por primera vez vacio
         - No pongas "I won!" si no has ganado

        Formato esperado (usa exactamente este formato para responder):

        "Mensaje correspondiente si gana o empata"

            "move": "Número de celda (1-9)",
            "reason": "Explica por qué seleccionaste esa posición.",
            "player":"X" (debes usar únicamente esta ficha),
            "Corresponding message if you win or tie": "I won!" OR "Tie!" OR "NO

        Es tu turno:
        - Modelo 2: {input}
        - Modelo 1:
        """

        final_template_1 = template_1.replace("[REGLAS DEL JUEGO]", partida.prompt)

        template_2 = """
        -[REGLAS DEL JUEGO]
        Eres un experto en juegos tradicionales por turnos, como el tres en raya, damas o ajedrez. Estás participando en una partida simulada contra otro modelo de lenguaje. Tu objetivo es jugar estratégicamente, analizar cada jugada y seguir las reglas definidas por el usuario.
        Está prohibido seleccionar una posición ya utilizada.
        Si el modelo anterior eligió una posición, **no la puedes repetir bajo ninguna circunstancia**.
        Si lo haces, tu jugada será inválida.
        Debes esperar tu turno: solo puedes jugar después de que el modelo anterior haya hecho su jugada.
        "Recuerda que NO puedes ganar si no hay al menos 5 jugadas previas. No inventes resultados."
        **Historial de la conversación**:
        {chat_history_2}
        "Formato esperado:
         Please use this format for the answer

        "Mensaje correspondiente si gana o empata"

	    "move": "Número de celda (1-9)",
	    "reason": "Explica por qué seleccionaste esa posición.",
        "player": "O" (debes usar únicamente esta ficha),
        "Corresponding message if you win or tie": "I won!" OR "Tie!" OR "NO

        Es tu turno:
        - Modelo 1: {input}
        - Modelo 2:
        """

        final_template_2 = template_2.replace("[REGLAS DEL JUEGO]", partida.prompt)
        prompt_1 = PromptTemplate(
            input_variables=["chat_history_1", "input"],
            template=final_template_1
        )
        prompt_2 = PromptTemplate(
            input_variables=["chat_history_2", "input"],
            template=final_template_2
        )
        memory_llm1 = ConversationBufferMemory(memory_key="chat_history_1", return_messages=True)
        memory_llm2 = ConversationBufferMemory(memory_key="chat_history_2", return_messages=True)

        conversation_1 = LLMChain(llm=llm_1, prompt=prompt_1, memory=memory_llm1, verbose=True)
        conversation_2 = LLMChain(llm=llm_2, prompt=prompt_2, memory=memory_llm2, verbose=True)
        try:
            producer = await get_kafka_producer()
           
            num_max_partidas = min(partida.numberGames, 5)
            print('EL TIIPO',partida.gameType)
            num_max_partidas = partida.numberGames * 2 if partida.gameType == "double" else partida.numberGames
            print('EL TIIPO',num_max_partidas)

            for i in range(num_max_partidas):
                print(f" Iniciando partida número {i+1}")
                if partida.gameType == "single":
                    modelo_inicia = conversation_1
                    modelo_responde = conversation_2
                    modelo_inicia_llm = model1
                    modelo_responde_llm = model2
                else:
                    # DOUBLE: se turnan
                    if i % 2 == 0:
                        modelo_inicia = conversation_1
                        modelo_responde = conversation_2
                        modelo_inicia_llm = model1
                        modelo_responde_llm = model2
                    else:
                        modelo_inicia = conversation_2
                        modelo_responde = conversation_1
                        modelo_inicia_llm = model2
                        modelo_responde_llm = model1   

                
                game_moves = []
                winner = None
                while True:
                    # Movimiento del Modelo 1
                    try:
                        print("Llamando a predict MODELO 1...")
                        if len(game_moves) >= 12:
                            winner = "Tie!"
                            break
                        tablero_actual = generate_board(game_moves)
                        mensaje_anterior = "Que inicie el juego" if not game_moves else response_responde
                        input_text = f"Estado del Tablero:\n{tablero_actual}\n\nMensaje anterior:\n{mensaje_anterior}"

                        if modelo_inicia == conversation_1:
                            kwargs_inicia = {
                                "chat_history_1": memory_llm1.buffer,
                                "input": input_text
                            }
                        else:
                            kwargs_inicia = {
                                "chat_history_2": memory_llm2.buffer,
                                "input": input_text
                            }

                        # Llama con **kwargs correctamente
                        response_inicia, duracion_1 = await measure_response_time(
                            modelo_inicia.predict,
                            **kwargs_inicia)

                        move_inicia = _parse_move(response_inicia, modelo_inicia_llm["name"], partida_id, duracion_1,i+1, game_moves)                
                        move_inicia["codeUnique"] = partida_dict['codeUnique']
                    except Exception as e:
                        print("Error al predecir MODELO 1:", e)

                    await send_to_kafka(producer, move_inicia)

                    await collection_response.insert_one(move_inicia)
                    game_moves.append(move_inicia)

                    if "I won!" in response_inicia:
                        winner = modelo_inicia_llm["name"]
                        break
                    elif "Tie!" in response_inicia:
                        winner = "Tie!"
                        break

                    try:
                        print("Llamando a predict modelo 2...")
                        tablero_actual = generate_board(game_moves)
                        input_text = f"Estado del Tablero:\n{tablero_actual}\n\nMensaje anterior:\n{response_inicia}"
                        # Movimiento del Modelo 2
                        if len(game_moves) >= 12:
                            winner = "Tie!"
                            break
                        if modelo_responde == conversation_2:
                            kwargs_responde = {
                                "chat_history_2": memory_llm2.buffer,
                                "input": response_inicia
                            }
                        else:
                            kwargs_responde = {
                                "chat_history_1": memory_llm1.buffer,
                                "input": response_inicia
                            }

                        response_responde, duracion_2 = await measure_response_time(
                            modelo_responde.predict,
                            **kwargs_responde
                        )

                        move_responde  = _parse_move(response_responde, modelo_responde_llm['name'], partida_id, duracion_2,i+1, game_moves)
                        move_responde["codeUnique"] = partida_dict['codeUnique']
                    except Exception as e:
                        print("Error al predecir MODELO 2:", e)

                    await send_to_kafka(producer, move_responde)
                    await collection_response.insert_one(move_responde)
                    game_moves.append(move_responde)

                    if "I won!" in response_responde:
                        winner = model2["name"]
                        break
                    elif "Tie!" in response_responde:
                        winner = "Tie!"
                        break
                print(f'Memoria con informacion: memoria : { memory_llm1.buffer}  MemoriaModelo2: {memory_llm2.buffer}')
                memory_llm1.clear()
                memory_llm2.clear()
                print(f'Memoria vacia: memoria:{ memory_llm1.buffer}  MemoriaModelo2: {memory_llm2.buffer}')
            await producer.stop()
            history_json = [
                {"role": getattr(msg, "role", "unknown"), "content": msg.content} 
                for msg in conversation_1.memory.chat_memory.messages
            ]
            
            return JSONResponse(
                status_code=201,
                content={
                    "message": "Se agregó una nueva partida",
                    "partida": partida_dict,
                    "console": history_json
                }
            )
        finally:
            await producer.stop()
    except HTTPException as he:
        return JSONResponse(status_code=he.status_code, content={"message": he.detail})
    except Exception as e:
        return JSONResponse(status_code=500, content={"message": "Error interno", "error": str(e)})


def _parse_move(response, model_name, partida_id, duracion_2 , juego_number, game_moves=[]):
    print(f"Respuesta: {response},--- Modelo: {model_name}, partida: {partida_id}, numeroJuego: {juego_number} tiempo: {duracion_2}")
    # Limpiar la respuesta
    response = response.strip()
    try:
        # Extraer el JSON de la respuesta
        json_match = re.search(r'```(?:json)?\s*({.*?})\s*```', response, re.DOTALL)
        
        if json_match:
            json_str = json_match.group(1)
            try:
                move_data = json.loads(json_str)
            except json.JSONDecodeError as e:
                print(f"Error al parsear JSON extraído: {e}")
                print(f"JSON extraído: {json_str}")
                return _error_response(response, partida_id, model_name, duracion_2,juego_number)
        else:
            try:
                move_data = json.loads(response)
            except json.JSONDecodeError as e:
                print(f"Error al parsear JSON directamente: {e}")
                print(f"Respuesta recibida: {response}")
                if not response.startswith("{"):
                    response = '""' + response + '""'
                resp_new = parseo_text(response)
                print("Respuesta Nueva: ", resp_new)
                return {
                    "idPartida": partida_id,
                    "move":  resp_new.get('move', ''),
                    "reason": resp_new.get('reason', ''),
                    "model": model_name,
                    "player":resp_new.get('player', ''),
                    "is_winner":  _is_winner(resp_new.get('Mensaje correspondiente si gana o empata', ''), len(game_moves),12),
                    "invalido": _occupied_position(resp_new.get('move'), game_moves),
                    "tiempo_respuesta": duracion_2,
                    "juego_number" : juego_number
                }
        message = move_data.get('Corresponding message if you win or tie', '')
        move = move_data.get('move')
        invalido = _occupied_position(move, game_moves)
        return {
            "idPartida": partida_id,
            "move": move_data.get('move'),
            "reason": move_data.get('reason', ''),
            "result": message,
            "model": model_name,
            "player": move_data.get('player', ''),
            "is_winner": _is_winner(message, len(game_moves),12),
            "invalido": invalido,
            "tiempo_respuesta": duracion_2,
            "juego_number" : juego_number
        }
    except Exception as e:
        print(f"Error inesperado en _parse_move: {e}")
        return {
            "idPartida": partida_id,
            "move": None,
            "reason": f"Error en parseo de movimiento: {str(e)}",
            "model": model_name,
            "player": None,
            "is_winner": False,
            "invalido": True,
            "tiempo_respuesta": duracion_2,
            "juego_number" : juego_number
        }
    

def _error_response(response, partida_id, model_name ,duracion_2, juego_number):
    return {
        "idPartida": partida_id,
        "move": None,
        "reason": "Error en parseo de movimiento",
        "model": model_name,
        "player": None,
        "is_winner": False,
        "invalido": True,
        "tiempo_respuesta": duracion_2,
        "juego_number" : juego_number
    }
