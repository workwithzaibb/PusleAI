"""
Run script for Pulse AI Backend
"""
import uvicorn
from app.config import settings

if __name__ == "__main__":
    print(f"""
    ╔══════════════════════════════════════════════════════════════╗
    ║                   🏥 Pulse AI                               ║
    ║         Multilingual Virtual Doctor Backend                  ║
    ╠══════════════════════════════════════════════════════════════╣
    ║  Starting server at: http://{settings.HOST}:{settings.PORT}             ║
    ║  API Documentation: http://localhost:{settings.PORT}/docs           ║
    ║  Alternative Docs:  http://localhost:{settings.PORT}/redoc          ║
    ╚══════════════════════════════════════════════════════════════╝
    """)
    
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=False
    )
