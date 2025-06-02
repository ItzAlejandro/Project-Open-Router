def individual_game(model) -> dict:
    return{
        "id": str(model["_id"]),
        "name" : model["name"],
        "description" : model["description"],
        "rulesheet" : model["rulesheet"],
        "players" : model["players"],
        "editable": model["editable"]
    }

def list_game(games)-> list:
    return [individual_game(game) for game in games]