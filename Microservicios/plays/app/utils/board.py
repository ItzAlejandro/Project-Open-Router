def generate_board(movimientos: list) -> str:
    """
    Crea una representación visual del tablero de 3x3.
    Args:
        movimientos (list): Lista de movimientos ya realizados.
    Returns:
        str: Tablero en forma de texto.
    """
    tablero = [" " for _ in range(9)]
    for mov in movimientos:
        try:
            idx = int(mov.get("move")) - 1
            if 0 <= idx < 9:
                ficha = mov.get("player", "?")
                tablero[idx] = ficha
        except:
            continue

    filas = [
        f"{tablero[0]} | {tablero[1]} | {tablero[2]}",
        f"{tablero[3]} | {tablero[4]} | {tablero[5]}",
        f"{tablero[6]} | {tablero[7]} | {tablero[8]}"
    ]
    return "\n---------\n".join(filas)
