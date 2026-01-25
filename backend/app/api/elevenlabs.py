import os
import requests
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel
import traceback

router = APIRouter(prefix="/elevenlabs", tags=["ElevenLabs"])

# Store your API key securely (in production, use environment variables)
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", "sk_cdb0ab76ca630997d0fed8e6e490a8bfd763bd8e5c1f3ca8")
BASE_URL = "https://api.elevenlabs.io/v1"

class ConversationRequest(BaseModel):
    agent_id: str
    message: str
    session_id: str = None
    history: list = None
    # Add more fields as needed

@router.post("/conversation")
def elevenlabs_conversation(req: ConversationRequest):
    """
    Proxy a conversation message to ElevenLabs Conversational API and return the response.
    """
    url = f"{BASE_URL}/conversations"
    headers = {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json"
    }
    payload = {
        "agent_id": req.agent_id,
        "message": req.message,
    }
    if req.session_id:
        payload["session_id"] = req.session_id
    if req.history:
        payload["history"] = req.history

    try:
        print(f"[DEBUG] Sending to ElevenLabs: {payload}")
        response = requests.post(url, headers=headers, json=payload, stream=True)
        print(f"[DEBUG] ElevenLabs status: {response.status_code}")
        if response.status_code != 200:
            try:
                print(f"[DEBUG] ElevenLabs error: {response.text}")
                return JSONResponse(status_code=response.status_code, content=response.json())
            except Exception:
                print(f"[DEBUG] ElevenLabs error (non-JSON): {response.text}")
                return JSONResponse(status_code=response.status_code, content={"error": response.text})
        # Stream audio or text response
        return StreamingResponse(response.iter_content(chunk_size=8192), media_type=response.headers.get("content-type", "application/octet-stream"))
    except Exception as e:
        print(f"[ERROR] Exception in elevenlabs_conversation: {e}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))
