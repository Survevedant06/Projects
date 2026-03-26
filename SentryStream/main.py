import uvicorn
import os

if __name__ == "__main__":
    # Ensure we are in the project root
    uvicorn.run("app.main:app", host="0.0.0.0", port=8080, reload=True)
