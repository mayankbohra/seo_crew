from anthropic import Anthropic
from pathlib import Path
import json
import os
from dotenv import load_dotenv

load_dotenv()

def generate_blog(outline, output_filename=None):
    """Generate a blog post from an outline"""

    api_key = os.getenv("ANTHROPIC_API_KEY")
    client = Anthropic(api_key=api_key)

    output_dir = Path('outputs/blogs')
    output_dir.mkdir(parents=True, exist_ok=True)

    # Hardcoded prompt template
    prompt_template = """
        You are an expert SEO content writer for Jaipuria Institute of
        Management. Write a detailed blog post based on the outline below.

        Follow these guidelines:
        1. Write in a professional, authoritative tone
        2. Use proper markdown formatting with headers, lists, etc.
        3. Stay within the specified word count
        4. Naturally incorporate the target keyword and its variations
        5. Focus on providing value and establishing Jaipuria's expertise
        6. Include relevant examples and actionable insights
        7. Follow the exact structure from the outline
        8. Make content factual and avoid controversial topics
        9. Don't compare with or mention other institutions

        Blog Outline:
        {outline}

        Format the output as:
        # [Blog Title]

        **Meta Description**: [meta description]
        **Target Keyword**: [keyword]
        **Word Count**: [actual word count]

        [Complete blog post content in markdown format...]
    """

    # Combine prompt template with outline
    prompt = prompt_template.format(outline=outline)

    try:
        # Generate content using Claude
        response = client.messages.create(
            model="claude-3-5-sonnet-20240620",
            max_tokens=4000,
            temperature=0.7,
            system="You are an expert SEO content writer for Jaipuria Institute of Management.",
            messages=[{
                "role": "user",
                "content": prompt
            }]
        )

        blog_content = response.content[0].text

        # Save to file
        if output_filename:
            output_path = output_dir / f"{output_filename}.md"
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(blog_content)
            print(f"✓ Blog saved to: {output_path}")
            return True
        return blog_content

    except Exception as e:
        print(f"Error generating blog: {str(e)}")
        return False
