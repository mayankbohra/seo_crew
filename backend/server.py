from flask import Flask, request, jsonify
from flask_cors import CORS
from main import run_crew
import os
from pathlib import Path
import atexit

app = Flask(__name__)
CORS(app)

# Store active threads/processes
active_processes = []

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
    # Run without debug mode for production
    app.run(port=5000, debug=False)
