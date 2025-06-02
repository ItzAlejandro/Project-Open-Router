from pydantic import BaseModel, Field


class ModelRouter(BaseModel):
    name : str = Field(default='Name', min_length=3)
    idModel :str
    description : str
    idOrigin: str
    pricingType: str
    editable: bool
    complete : bool