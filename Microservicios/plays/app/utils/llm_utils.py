from langchain_openai import ChatOpenAI

def create_llm(model_data, api_key, is_openrouter=False):
    if is_openrouter:
        return ChatOpenAI(
            openai_api_key=api_key,
            openai_api_base="https://openrouter.ai/api/v1",
            model_name=model_data["idModel"],
            temperature=0.7
        )
    return ChatOpenAI(
        model=model_data["idModel"],
        openai_api_key=api_key,
        temperature=0.7
    )
