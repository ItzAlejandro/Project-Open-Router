# microservicio plays

# Crear el entorno virtual
 python -m venv venv
# Activar el entorno virtual
source venv/Scripts/activate
# Instalar los requerimientos
pip install -r requirements.txt
# Ejecución
uvicorn main:app --reload




SIEMPRE REINICIAR EL PLAY POR LO QUE SE BUGEA AL DESPLEGAR