from app import app
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

if __name__ == '__main__':
    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("FLASK_ENV") != "production"

    if os.getenv("FLASK_ENV") == "production":
        # Production server configuration
        from waitress import serve
        print(f'Starting production server on port {port}')
        serve(app, host="0.0.0.0", port=port)
    else:
        # Development server
        print(f'Starting development server on port {port}')
        app.run(host="0.0.0.0", port=port, debug=debug)
