import json, re

def parseo_text(respuesta: str):
    """
    Parsea el texto recibido de Kafka y devuelve un diccionario con los datos
    relevantes (move, reason, player, mensaje final).
    """

    try:
        datos_json = json.loads(respuesta)
        
        datos = {
            'move': datos_json.get('move'),
            'reason': datos_json.get('reason'),
            'player': datos_json.get('player'),
            'Mensaje correspondiente si gana o empata': datos_json.get('Corresponding message if you win or tie')
        }
        return datos

    except json.JSONDecodeError:
        datos = {}
        datos['move'] = _get_match(respuesta, r'"move":\s*"?(?P<move>\d+)"?', int)
        datos['reason'] = _get_match(respuesta, r'"reason":\s*"([^"]+)"')
        datos['player'] = _get_match(respuesta, r'"player":\s*"([^"]+)"')
        datos['Mensaje correspondiente si gana o empata'] = _get_match(respuesta, r'"Corresponding message if you win or tie":\s*"([^"]+)"')
        return datos

def _get_match(texto, pattern, cast=lambda x: x):
    match = re.search(pattern, texto)
    return cast(match.group(1)) if match else None

def _occupied_position(move, game_moves):
    try:
        move = int(move)
        return any(jugada.get("move") == move for jugada in game_moves)
    except:
        return True

def _is_winner(mensaje: str, num_movimientos: int, num_max_movimientos) -> bool:
    """
    Solo permite que alguien gane si hay al menos 5 movimientos en el juego.
    Si supera el maximo de movimientos declara un empate 'Tie!'
    """
    if num_movimientos < 5:
        return False
    if num_movimientos> num_max_movimientos:
        return False

    if mensaje:
        mensaje = mensaje.strip().lower()
        return mensaje in ['i won!', 'won', 'tie!', 'tie', 'empate', 'sí', 'si']
    return False
