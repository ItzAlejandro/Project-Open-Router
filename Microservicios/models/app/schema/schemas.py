#Deserializar Models
def individual_serial(model) -> dict:
    return{
        "id": str(model["_id"]),
        "name" : model["name"],
        "idModel" : model["idModel"],
        "description" : model["description"],
        "idOrigin" : model["idOrigin"],
        "pricingType" : model["pricingType"],
        "editable" : model["editable"],
        "complete" : model["complete"],
    }

def list_serial(models)-> list:
    return [individual_serial(model) for model in models]

def url_serial(model) -> dict:
    return{
        "id": str(model["_id"]),
        "url" : model["url"],
    }

def list_url(models)-> list:
    return [url_serial(model) for model in models]
