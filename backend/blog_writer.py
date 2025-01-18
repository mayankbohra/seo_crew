from pathlib import Path
import json
import os
from dotenv import load_dotenv
from google import genai
from google.genai.types import Tool, GenerateContentConfig, GoogleSearch

load_dotenv()

def show_json(obj):
    print(json.dumps(obj.model_dump(exclude_none=True), indent=2))

def show_parts(r: genai.types.GenerateContentResponse, path: str, filename: str):
    parts = r.candidates[0].content.parts
    if parts is None:
        finish_reason = r.candidates[0].finish_reason
        print(f'{finish_reason=}')
        return

    with open(path / filename, 'w', encoding='utf-8') as f:
        for part in r.candidates[0].content.parts:
            if part.text:
                f.write(part.text)
            elif part.executable_code:
                f.write(f'```python\n{part.executable_code.code}\n```\n')
            else:
                f.write(show_json(part) + '\n')

        # Write search metadata if available
        grounding_metadata = r.candidates[0].grounding_metadata
        if grounding_metadata and grounding_metadata.search_entry_point:
            f.write("\n--- Search Results Used ---\n")
            f.write(grounding_metadata.search_entry_point.rendered_content + '\n')

def generate_blog(blog_outline, user_id):
    """Generate a blog post from an outline using Gemini with Google Search"""
    try:
        client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
        google_search_tool = Tool(google_search=GoogleSearch())

        # First, perform a search to gather information
        search_prompt = f"""
            Search for current information, statistics, and expert insights about:
            {blog_outline}

            Focus on:
            1. Recent statistics and data
            2. Expert opinions and research
            3. Current trends and developments
            4. Best practices and examples
        """

        # Generate content with explicit search step
        search_response = client.models.generate_content(
            model='gemini-2.0-flash-exp',
            contents=search_prompt,
            config=GenerateContentConfig(
                tools=[google_search_tool],
                response_modalities=["TEXT"],
                temperature=0.3,  # Lower temperature for factual search
            )
        )

        # Save search results
        output_dir = Path('outputs') / str(user_id) / 'blogs'
        output_dir.mkdir(parents=True, exist_ok=True)
        show_parts(search_response, output_dir, 'search_logs.md')

        # Use the search results in the blog generation
        blog_prompt = """
            You are an expert SEO content writer for Jaipuria Institute of
            Management. Using the research results above, write a detailed blog post.

            Follow these guidelines:
            1. Use Google Search to find current statistics, studies, and expert opinions
            2. Use proper markdown formatting with headers, lists, etc.
            3. Follow the exact structure from the outline
            4. Write in proper bullet points and paragraphs.
            5. Naturally incorporate the target keyword and its variations
            6. Focus on providing value and establishing Jaipuria's expertise
            7. Include relevant examples and actionable insights
            8. Make content factual and avoid controversial topics
            9. Don't compare with or mention other institutions
            10. Write compelling meta description to boost Click-through rate (CTR)
            11. Content should meet Experience, Expertise, Authoritativeness, and Trustworthiness (EEAT) guidelines
            12. Add enough context to answer the query and make it more engaging and helpful for the reader
            13. Include recent statistics and data points from your search results

            Blog Outline:
            {outline}

            Format the output as:
            # [Blog Title]

            **Meta Description**: [compelling meta description with target keyword]
            **Target Keyword**: [main keyword from outline]
            **Word Count**: [actual word count]

            [Complete blog post content in markdown format...]
        """

        prompt = blog_prompt.format(outline=blog_outline)

        # Generate the final blog content
        blog_response = client.models.generate_content(
            model='gemini-2.0-flash-exp',
            contents=[
                search_response,  # Include search results
                prompt            # Include blog prompt
            ],
            config=GenerateContentConfig(
                response_modalities=["TEXT"],
                temperature=0.7,
                candidate_count=1,
                max_output_tokens=4000,
            )
        )

        show_parts(blog_response, output_dir, 'blog_logs.md')
        blog_content = blog_response.text

        # Save the final blog content
        blog_path = output_dir / 'blog_post.md'
        with open(blog_path, 'w', encoding='utf-8') as f:
            f.write(blog_content)

        print(f"✓ Blog saved to: {blog_path}")

        return {
            'status': 'success',
            'message': 'Blog post generated successfully with Google Search integration',
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
    generate_blog(blog_outline, "ef2c1a46-2511-482f-8668-935b1f219eeb")
