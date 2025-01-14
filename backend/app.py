from flask import Flask, request, jsonify, send_file, make_response
from flask_cors import CORS, cross_origin
from main import run_crew
import os
from pathlib import Path
import atexit
from spire.doc import Document, FileFormat
from blog_writer import generate_blog
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS").split(",")

app = Flask(__name__)
# Configure CORS properly
CORS(app, resources={
    r"/*": {
        "origins": ALLOWED_ORIGINS,
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "expose_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True,
        "max_age": 600
    }
})

# Add CORS headers to all responses
@app.after_request
def after_request(response):
    # Get the origin from the request
    origin = request.headers.get('Origin')

    # If the origin is in our allowed origins, set the CORS headers
    if origin in ALLOWED_ORIGINS:
        response.headers.add('Access-Control-Allow-Origin', origin)
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response

# Store active threads/processes
active_processes = []

def ensure_directories():
    """Create necessary output directories if they don't exist"""
    directories = [
        'outputs',
        'outputs/crew',
        'outputs/data',
        'outputs/doc',
        'outputs/blogs'
    ]

    for dir_path in directories:
        Path(dir_path).mkdir(parents=True, exist_ok=True)

def convert_markdown_to_docx(markdown_file, output_filename):
    """Convert markdown file to docx and save to outputs/doc"""
    try:
        # Ensure directories exist
        ensure_directories()

        # Setup output directory
        doc_dir = Path('outputs/doc')
        output_path = doc_dir / output_filename

        doc = Document()
        doc.LoadFromFile(str(markdown_file))
        doc.SaveToFile(str(output_path), FileFormat.Docx2016)
        doc.Dispose()

        print(f"✓ Saved to: {output_path}")
        return output_path

    except Exception as e:
        print(f"Error converting {markdown_file}: {str(e)}")
        return None

@app.route('/download/<filename>')
def download_file(filename):
    """Endpoint to download converted files"""
    try:
        # Ensure directories exist
        ensure_directories()

        file_path = Path('outputs/doc') / filename

        # Log the attempt
        print(f"Attempting to download: {file_path}")

        if not file_path.exists():
            print(f"File not found: {file_path}")
            return jsonify({
                'status': 'error',
                'message': f'File not found: {filename}'
            }), 404

        # Log successful file access
        print(f"File found, sending: {file_path}")

        return send_file(
            file_path,
            as_attachment=True,
            download_name=filename,
            mimetype='application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        )
    except Exception as e:
        print(f"Error in download_file: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Error downloading file: {str(e)}'
        }), 500

@app.route('/run', methods=['POST'])
def run():
    try:
        # Ensure directories exist
        ensure_directories()

        data = request.json
        institution_name = data.get('institution_name')
        domain_url = data.get('domain_url')

        # Run the crew
        result = run_crew(institution_name, domain_url)
        print("Crew run complete")

        # Convert markdown files to docx
        crew_dir = Path('outputs/crew')
        docx_files = {}

        # Check if files exist before conversion
        for file_info in [
            ('1_analysis.md', 'analysis.docx', 'analysis'),
            ('3_blog_post_outlines.md', 'blog_post_outlines.docx', 'outlines'),
            ('2_ad_copies.md', 'ad_copies.docx', 'ad')
        ]:
            md_file = crew_dir / file_info[0]
            if md_file.exists():
                print(f"Converting {md_file} to {file_info[1]}")
                if convert_markdown_to_docx(md_file, file_info[1]):
                    docx_files[file_info[2]] = file_info[1]
            else:
                print(f"Warning: {md_file} not found")

        return jsonify({
            'status': 'success',
            'markdown': result.get('markdown', {}),
            'docxFiles': docx_files
        })

    except Exception as e:
        print(f"Error in /run: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/generate-blog', methods=['POST'])
def generate_blog_endpoint():
    try:
        data = request.json
        blog_outline = data.get('blogOutline')

        if not blog_outline:
            return jsonify({
                'status': 'error',
                'message': 'Blog outline is required'
            }), 400

        # Generate the blog
        result = generate_blog(blog_outline)

        if result['status'] == 'success':
            # Convert markdown to docx
            blog_md = Path('outputs/blogs/blog_post.md')
            if blog_md.exists():
                output_filename = 'blog_post.docx'
                if convert_markdown_to_docx(blog_md, output_filename):
                    return jsonify({
                        'status': 'success',
                        'message': 'Blog post generated successfully',
                        'docxFile': output_filename
                    })

        return jsonify({
            'status': 'error',
            'message': result.get('message', 'Failed to generate blog post')
        }), 500

    except Exception as e:
        print(f"Error generating blog: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/markdown/<path:filename>')
def serve_markdown(filename):
    try:
        # Determine the correct directory based on the file
        if filename == 'blog_post.md':
            file_path = Path('outputs/blogs') / filename
        else:
            file_path = Path('outputs/crew') / filename

        if not file_path.exists():
            return jsonify({
                'status': 'error',
                'message': 'File not found'
            }), 404

        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        response = make_response(content)
        response.headers['Content-Type'] = 'text/markdown'
        return response

    except Exception as e:
        print(f"Error serving markdown: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

def cleanup():
    """Cleanup function to run when server shuts down"""
    for process in active_processes:
        try:
            process.terminate()
        except:
            pass

# Register cleanup function
atexit.register(cleanup)
