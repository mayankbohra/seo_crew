from flask import Flask, request, jsonify, send_file, make_response
from flask_cors import CORS
from main import run_crew
import os
from pathlib import Path
import atexit
from spire.doc import Document, FileFormat
from blog_writer import generate_blog
from flask_cors import cross_origin

app = Flask(__name__)
CORS(app)

# Store active threads/processes
active_processes = []

def convert_markdown_to_docx(markdown_file, output_filename):
    """Convert markdown file to docx and save to outputs/doc"""
    try:
        # Setup output directory
        doc_dir = Path('outputs/doc')
        doc_dir.mkdir(exist_ok=True)
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
        file_path = Path('outputs/doc') / filename
        return send_file(
            file_path,
            as_attachment=True,
            download_name=filename,
            mimetype='application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        )
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Error downloading file: {str(e)}'
        }), 404

@app.route('/run', methods=['POST'])
def run():
    try:
        data = request.json
        institution_name = data.get('institution_name')
        domain_url = data.get('domain_url')

        # Run the crew
        result = run_crew(institution_name, domain_url)
        print("Crew run complete")

        # Convert markdown files to docx
        crew_dir = Path('outputs/crew')
        docx_files = {}

        # Convert analysis
        analysis_filename = 'analysis.docx'
        analysis_md = crew_dir / '1_analysis.md'
        if analysis_md.exists():
            if convert_markdown_to_docx(analysis_md, analysis_filename):
                docx_files['analysis'] = analysis_filename

        # Convert outlines
        outlines_filename = 'blog_post_outlines.docx'
        outlines_md = crew_dir / '2_blog_post_outlines.md'
        if outlines_md.exists():
            if convert_markdown_to_docx(outlines_md, outlines_filename):
                docx_files['outlines'] = outlines_filename

        return jsonify({
            'status': 'success',
            'markdown': result.get('markdown', {}),  # Pass markdown content
            'docxFiles': docx_files  # Pass docx filenames
        })

    except Exception as e:
        print(f"Error in /run: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/generate-blog', methods=['POST'])
def generate_blog_post():
    try:
        data = request.json
        blog_outline = data.get('blogOutline')

        if not blog_outline:
            return jsonify({
                'status': 'error',
                'message': 'Blog outline is required'
            }), 400

        # Generate blog post
        blog_content = generate_blog(blog_outline, "blog_post")
        if not blog_content:
            return jsonify({
                'status': 'error',
                'message': 'Failed to generate blog post'
            }), 500

        # Convert markdown to docx
        blog_md = Path('outputs/blogs/blog_post.md')
        if blog_md.exists():
            output_filename = 'blog_post.docx'
            if convert_markdown_to_docx(blog_md, output_filename):
                return jsonify({
                    'status': 'success',
                    'docxFile': output_filename
                })

        return jsonify({
            'status': 'error',
            'message': 'Failed to generate blog post'
        }), 500

    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/markdown/<filename>')
@cross_origin()
def serve_markdown(filename):
    """Serve markdown files"""
    try:
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
        response.headers['Access-Control-Allow-Origin'] = '*'
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
