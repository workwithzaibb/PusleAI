"""
Run script for Pulse AI Backend
"""
import socket
import uvicorn
from app.config import settings


def _build_startup_banner() -> str:
    """Return an ASCII-only banner to avoid Windows console encoding errors."""
    return (
        "\n"
        "==============================================================\n"
        "                     Pulse AI Backend                         \n"
        "           Multilingual Virtual Doctor Service                \n"
        "--------------------------------------------------------------\n"
        f"  Starting server at: http://{settings.HOST}:{settings.PORT}\n"
        f"  API Docs:            http://localhost:{settings.PORT}/docs\n"
        f"  ReDoc:               http://localhost:{settings.PORT}/redoc\n"
        "==============================================================\n"
    )


def _is_port_in_use(host: str, port: int) -> bool:
    """Return True if host:port already has a listener."""
    check_host = "127.0.0.1" if host in {"0.0.0.0", "::"} else host
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.settimeout(0.4)
        return sock.connect_ex((check_host, port)) == 0


if __name__ == "__main__":
    if _is_port_in_use(settings.HOST, settings.PORT):
        print(
            f"Backend appears to already be running on http://127.0.0.1:{settings.PORT} "
            f"(port {settings.PORT} is in use)."
        )
        raise SystemExit(0)

    print(_build_startup_banner())
    
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=False
    )
