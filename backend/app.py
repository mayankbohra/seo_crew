from flask import Flask, request, jsonify, send_file, make_response
from spire.doc import Document, FileFormat
from flask_cors import CORS
from dotenv import load_dotenv
from threading import Thread
from pathlib import Path
import atexit
import shutil
import uuid
import os

from blog_writer import generate_blog
from main import (
    run_analysis_crew,
    get_available_keywords,
    save_keyword_details,
    run_seo_crew
)

# Load environment variables
load_dotenv()
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS").split(",")

app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": os.getenv("ALLOWED_ORIGINS", "").split(","),
        "methods": ["GET", "POST", "OPTIONS", "DELETE"],
        "allow_headers": ["Content-Type", "Authorization", "Accept"],
        "supports_credentials": True,
        "expose_headers": ["Content-Type", "Authorization"],
        "max_age": 600  # Cache preflight requests for 10 minutes
    }
})

# Add CORS headers to all responses
@app.after_request
def after_request(response):
    allowed_origins = os.getenv("ALLOWED_ORIGINS", "").split(",")
    origin = request.headers.get('Origin')

    if origin in allowed_origins:
        response.headers.add('Access-Control-Allow-Origin', origin)
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,Accept')
        response.headers.add('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,DELETE')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        response.headers.add('Access-Control-Expose-Headers', 'Content-Type,Authorization')

    return response

def create_user_directory(userId):
    """Create user-specific directories"""
    user_dir = Path('outputs') / userId
    crew_dir = user_dir / 'crew'
    data_dir = user_dir / 'data'
    blogs_dir = user_dir / 'blogs'

    user_dir.mkdir(parents=True, exist_ok=True)
    crew_dir.mkdir(exist_ok=True)
    data_dir.mkdir(exist_ok=True)
    blogs_dir.mkdir(exist_ok=True)


def cleanup_user_directory(userId):
    """Clean up user-specific directory"""
    user_dir = Path('outputs') / userId
    if user_dir.exists():
        shutil.rmtree(user_dir)

def convert_markdown_to_docx(markdown_file, output_filename, userId):
    """Convert markdown file to docx and save to outputs/doc"""
    try:
        # Setup output directory
        doc_dir = Path('outputs') / userId / 'doc'
        doc_dir.mkdir(parents=True, exist_ok=True)
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

@app.route('/download/<userId>/<filename>', methods=['GET'])
def download_file(userId, filename):
    """Endpoint to download converted files"""
    try:
        if not userId:
            return jsonify({
                'status': 'error',
                'message': 'User ID is required'
            }), 400

        file_path = Path('outputs') / userId / 'doc' / filename

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

@app.route('/', methods=['GET'])
def index():
    return jsonify({
        'status': 'success',
        'message': 'Welcome to the API'
    })

@app.route('/run/analysis', methods=['POST'])
def run_analysis():
    try:
        data = request.json
        institution_name = data.get('institution_name')
        domain_url = data.get('domain_url')

        # unique user ID
        userId = str(uuid.uuid4())
        # Create user directories
        create_user_directory(userId)

        output_dir = Path('outputs') / userId

        try:
            result = Thread(target=run_analysis_crew, args=(userId, institution_name, domain_url, output_dir))
            result.start()
            result.join()

            print("Analysis crew run complete")

            # Clean the analysis markdown file
            analysis_path = output_dir / 'crew' / '1_analysis.md'
            if analysis_path.exists():
                with open(analysis_path, 'r', encoding='utf-8') as f:
                    analysis_content = f.readlines()
                analysis_content = [line for line in analysis_content if line.strip() != '```markdown' and line.strip() != '```']
                with open(analysis_path, 'w', encoding='utf-8') as f:
                    f.writelines(analysis_content)

            markdown_content = {}
            if analysis_path.exists():
                with open(analysis_path, 'r', encoding='utf-8') as f:
                    markdown_content['analysis'] = f.read()

            docx_files = {}
            for file_info in [
                ('1_analysis.md', 'analysis.docx', 'analysis')
            ]:
                md_file = output_dir / 'crew' / file_info[0]
                if md_file.exists():
                    print(f"Converting {md_file} to {file_info[1]}")
                    if convert_markdown_to_docx(md_file, file_info[1], userId):
                        docx_files[file_info[2]] = file_info[1]
                else:
                    print(f"Warning: {md_file} not found")

            return jsonify({
                'status': 'success',
                'message': 'Analysis completed successfully',
                'userId': userId,
                'docxFiles': docx_files,
                'markdown': markdown_content
            })

        except Exception as e:
            print(f"Error during analysis: {str(e)}")
            return jsonify({
                'status': 'error',
                'message': f'Analysis error: {str(e)}'
            }), 500

    except Exception as e:
        print(f"Error in /run/analysis: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@app.route('/keywords/<userId>', methods=['GET'])
def get_keywords(userId):
    try:
        if not userId:
            return jsonify({
                'status': 'error',
                'message': 'User ID is required'
            }), 400

        keywords = get_available_keywords(userId)
        return jsonify({
            'status': 'success',
            'keywords': keywords
        })

    except Exception as e:
        print(f"Error in /keywords: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@app.route('/keywords/save/<userId>', methods=['POST'])
def save_keywords(userId):
    try:
        data = request.json
        keywords = data.get('keywords', [])

        if not userId:
            return jsonify({
                'status': 'error',
                'message': 'User ID is required'
            }), 400

        save_keyword_details(userId, keywords)
        return jsonify({'status': 'success'})

    except Exception as e:
        print(f"Error in /keywords/save: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@app.route('/run/seo/<userId>', methods=['POST'])
def run_seo(userId):
    try:
        data = request.json
        institution_name = data.get('institution_name')
        domain_url = data.get('domain_url')

        if not userId:
            return jsonify({
                'status': 'error',
                'message': 'User ID is required'
            }), 400

        try:
            result = Thread(target=run_seo_crew, args=(userId, institution_name, domain_url))
            result.start()
            result.join()

            crew_dir = Path('outputs') / userId / 'crew'

            # Clean the ad copies markdown file
            ad_copies_path = crew_dir / '2_ad_copies.md'
            if ad_copies_path.exists():
                with open(ad_copies_path, 'r', encoding='utf-8') as f:
                    ad_content = f.readlines()
                ad_content = [line for line in ad_content if line.strip() != '```markdown' and line.strip() != '```']
                with open(ad_copies_path, 'w', encoding='utf-8') as f:
                    f.writelines(ad_content)

            # Clean the blog post outlines markdown file
            outlines_path = crew_dir / '3_blog_post_outlines.md'
            if outlines_path.exists():
                with open(outlines_path, 'r', encoding='utf-8') as f:
                    outlines_content = f.readlines()
                outlines_content = [line for line in outlines_content if line.strip() != '```markdown' and line.strip() != '```']
                with open(outlines_path, 'w', encoding='utf-8') as f:
                    f.writelines(outlines_content)

            markdown_content = {}
            ad_path = crew_dir / '2_ad_copies.md'
            if ad_path.exists():
                with open(ad_path, 'r', encoding='utf-8') as f:
                    markdown_content['ad'] = f.read()

            outlines_path = crew_dir / '3_blog_post_outlines.md'
            if outlines_path.exists():
                with open(outlines_path, 'r', encoding='utf-8') as f:
                    markdown_content['outlines'] = f.read()

            docx_files = {}
            for file_info in [
                ('2_ad_copies.md', 'ad_copies.docx', 'ad'),
                ('3_blog_post_outlines.md', 'blog_post_outlines.docx', 'outlines')
            ]:
                md_file = crew_dir / file_info[0]
                if md_file.exists():
                    print(f"Converting {md_file} to {file_info[1]}")
                    if convert_markdown_to_docx(md_file, file_info[1], userId):
                        docx_files[file_info[2]] = file_info[1]
                else:
                    print(f"Warning: {md_file} not found")

            return jsonify({
                'status': 'success',
                'markdown': markdown_content,
                'docxFiles': docx_files
            })

        except Exception as e:
            print(f"Error in /run/seo: {str(e)}")
            return jsonify({
                'status': 'error',
                'message': str(e)
            }), 500

    except Exception as e:
        print(f"Error in /run/seo: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/generate-blog/<user_id>', methods=['POST'])
def generate_blog_endpoint(user_id):
    try:
        data = request.json
        outline = data.get('outline')

        if not outline:
            return jsonify({
                'status': 'error',
                'message': 'No outline provided'
            }), 400

        # Create user-specific directories if they don't exist
        user_dir = Path('outputs') / str(user_id)
        blogs_dir = user_dir / 'blogs'
        blogs_dir.mkdir(parents=True, exist_ok=True)

        # Generate blog
        result = generate_blog(outline, user_id)

        if result['status'] == 'success':
            # Convert markdown to docx
            blog_md = blogs_dir / 'blog_post.md'
            if blog_md.exists():
                output_filename = 'blog_post.docx'
                convert_markdown_to_docx(blog_md, output_filename, user_id)

                return jsonify({
                    'status': 'success',
                    'message': 'Blog post generated successfully',
                    'docxFile': output_filename
                })
            else:
                return jsonify({
                    'status': 'error',
                    'message': 'Blog file not generated'
                }), 500
        else:
            return jsonify({
                'status': 'error',
                'message': result.get('message', 'Failed to generate blog post')
            }), 500

    except Exception as e:
        print(f"Error in generate_blog_endpoint: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/markdown/<path:filename>/<userId>')
def serve_markdown(filename, userId):
    try:
        # Determine the correct directory based on the file
        if filename == 'blog_post.md':
            file_path = Path('outputs') / userId / 'blogs' / filename
        else:
            file_path = Path('outputs') / userId / 'crew' / filename

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

@app.route('/cleanup/<user_id>', methods=['DELETE'])
def cleanup_user_data(user_id):
    try:
        print(f"Cleaning up user data for {user_id}")
        user_dir = Path('outputs') / str(user_id)
        if user_dir.exists():
            try:
                shutil.rmtree(user_dir)
                print(f"Successfully deleted directory: {user_dir}")
            except PermissionError as pe:
                print(f"Permission error while deleting: {pe}")
                os.system(f'rm -rf "{user_dir}"')
            except Exception as e:
                print(f"Error while deleting directory: {e}")
                raise

        print(f"User data cleaned up successfully for {user_id}")
        return jsonify({
            'status': 'success',
            'message': 'User data cleaned up successfully'
        })
    except Exception as e:
        print(f"Error cleaning up user data: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

if __name__ == '__main__':
    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("FLASK_ENV") != "production"
    app.run(host="0.0.0.0", port=port, debug=debug)
