from anthropic import Anthropic
from pathlib import Path
import json
import os
from dotenv import load_dotenv

load_dotenv()

def generate_blog(blog_outline):
    """Generate a blog post from an outline"""

    api_key = os.getenv("ANTHROPIC_API_KEY")
    client = Anthropic(api_key=api_key)

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
        10. Write compelling meta description to boost Click-through rate (CTR)
        11. Content should meet Experience, Expertise, Authoritativeness, and Trustworthiness (EEAT) guidelines
        12. Add enough context to answer the query and make it more engaging and helpful for the reader.

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
    prompt = prompt_template.format(outline=blog_outline)

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

        # Save the blog content
        output_dir = Path('outputs/blogs')
        output_dir.mkdir(exist_ok=True)

        blog_path = output_dir / 'blog_post.md'
        with open(blog_path, 'w', encoding='utf-8') as f:
            f.write(blog_content)  # Your generated blog content

        print(f"✓ Blog saved to: {blog_path}")

        return {
            'status': 'success',
            'message': 'Blog post generated successfully',
            'content': blog_content
        }

    except Exception as e:
        print(f"Error generating blog: {str(e)}")
        return {
            'status': 'error',
            'message': str(e)
        }

if __name__ == "__main__":
    blog_outline = input("Enter the blog outline: ")
    generate_blog(blog_outline)
