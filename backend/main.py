from fastapi import FastAPI, HTTPException, Response
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pickle
import numpy as np

app = FastAPI()

# Enable CORS so browsers can send preflight OPTIONS requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")

with open("Final_Stock_Tesla_closing_price.pkl", "rb") as f:
    next_day_closing_price = pickle.load(f)
    

class StockInput(BaseModel):
    Open:float
    High:float
    Low:float
    Close:float
    Volume:float
    Close_lag1:float
    Close_lag2:float
    Close_lag3:float
    
@app.get("/", response_class=FileResponse)
def welcome():
    return FileResponse("static/index.html")


@app.options("/predict")
def predict_options():
    return Response(status_code=200)

@app.post("/predict")
def predict(data:StockInput):
    try:
        input_data = np.array([[
            data.Open,
            data.High,
            data.Low,
            data.Close,
            data.Volume,
            data.Close_lag1,
            data.Close_lag2,
            data.Close_lag3
        ]])

        prediction = next_day_closing_price.predict(input_data)
        return {"predicted_next_day_closing_price": float(prediction.flat[0])}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))