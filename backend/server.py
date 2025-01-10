from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from main import run_crew
import os
from pathlib import Path
import atexit
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Configure CORS for production
CORS(app, resources={
    r"/*": {
        "origins": os.getenv("ALLOWED_ORIGINS").split(","),
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# Store active threads/processes
active_processes = []

@app.before_request
def before_request():
    if not request.is_secure and os.getenv("FLASK_ENV") == "production":
        url = request.url.replace('http://', 'https://', 1)
        return redirect(url, code=301)

@app.errorhandler(404)
def not_found_error(error):
    return jsonify({
        'status': 'error',
        'message': 'Resource not found'
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'status': 'error',
        'message': 'Internal server error'
    }), 500

@app.route('/run', methods=['POST'])
def run():
    try:
        data = request.json
        institution_name = data.get('institution_name')
        domain_url = data.get('domain_url')

        # Run the crew
        result = run_crew(institution_name, domain_url)

        # Read the generated markdown files
        output_dir = Path('outputs/crew')
        markdown_content = {
            'analysis': read_file(output_dir / '1_analysis.md'),
            'outlines': read_file(output_dir / '2_blog_post_outlines.md'),
            'blog_posts': read_file(output_dir / '3_blog_posts.md')
        }

        return jsonify({
            'status': 'success',
            'markdownContent': markdown_content
        })

    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

def read_file(file_path):
    try:
        if file_path.exists():
            with open(file_path, 'r', encoding='utf-8') as f:
                return f.read()
        return ''
    except Exception as e:
        print(f"Error reading {file_path}: {str(e)}")
        return ''

def cleanup():
    """Cleanup function to run when server shuts down"""
    for process in active_processes:
        try:
            process.terminate()
        except:
            pass

# Register cleanup function
atexit.register(cleanup)

if __name__ == '__main__':
    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("FLASK_ENV") != "production"

    if os.getenv("FLASK_ENV") == "production":
        # Production server configuration
        from waitress import serve
        logger.info(f'Starting production server on port {port}')
        serve(app, host="0.0.0.0", port=port)
    else:
        # Development server
        logger.info(f'Starting development server on port {port}')
        app.run(host="0.0.0.0", port=port, debug=debug)
