const form = document.getElementById("predict-form");
const message = document.getElementById("message");

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  message.innerHTML = "";

  const data = {
    Open: Number(form.Open.value),
    High: Number(form.High.value),
    Low: Number(form.Low.value),
    Close: Number(form.Close.value),
    Volume: Number(form.Volume.value),
    Close_lag1: Number(form.Close_lag1.value),
    Close_lag2: Number(form.Close_lag2.value),
    Close_lag3: Number(form.Close_lag3.value)
  };

  try {

    const API_URL = (window.API_BASE && window.API_BASE.trim()) ? window.API_BASE.trim() : "http://127.0.0.1:8000/predict";

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    // read raw text first to avoid json parse errors on empty responses
    const text = await response.text();
    let result = null;
    if (text) {
      try {
        result = JSON.parse(text);
      } catch (err) {
        throw new Error(`Invalid JSON response: ${text}`);
      }
    }

    if (!response.ok) {
      const errMsg = (result && (result.detail || result.message)) || text || `Request failed (${response.status})`;
      throw new Error(errMsg);
    }

    if (!result || typeof result.predicted_next_day_closing_price === 'undefined') {
      throw new Error('Server returned no prediction.');
    }

    message.innerHTML = `<div class="result">Predicted next day closing price: <strong>$${Number(result.predicted_next_day_closing_price).toFixed(4)}</strong></div>`;
  } catch (error) {
    message.innerHTML = `<div class="error">${error.message}</div>`;
  }
});
