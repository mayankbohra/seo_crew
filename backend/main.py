from crew import SeoCrew
from tools.spyfu_tool import SpyfuTool
import warnings
from pathlib import Path
import json

warnings.filterwarnings("ignore", category=SyntaxWarning, module="pysbd")


def fetch_data_from_spyfu(domain_url, output_dir):
    spy_tool = SpyfuTool()

    # Fetch user rankings
    print("\nFetching user rankings...")
    user_rankings = spy_tool._get_just_made_it_keywords(domain_url)
    user_rankings_json = json.loads(user_rankings)

    with open(output_dir / 'data' / 'user_rankings.json', 'w', encoding='utf-8') as f:
        json.dump(user_rankings_json, f, indent=2, ensure_ascii=False)

    # Fetch competitor data
    print("\nFetching competitor rankings...")
    competitors = spy_tool._get_top_competitors(domain=domain_url)
    competitors_json = json.loads(competitors)

    with open(output_dir / 'data' / 'competitors.json', 'w', encoding='utf-8') as f:
        json.dump(competitors_json, f, indent=2, ensure_ascii=False)

    # Get rankings for each competitor
    rankings_data = {}
    for competitor in competitors_json['results']:
        domain = competitor['domain']
        print(f"\nFetching rankings for: {domain}")

        rankings = spy_tool._get_just_made_it_keywords(domain)
        rankings_json = json.loads(rankings)
        rankings_data[domain] = rankings_json

    with open(output_dir / 'data' / 'competitor_rankings.json', 'w', encoding='utf-8') as f:
        json.dump(rankings_data, f, indent=2, ensure_ascii=False)


def remove_markdown_code_blocks(file_path):
    if file_path.exists():
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        content = content.replace('```markdown', '').replace('```', '')
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)


def run_crew(institution_name, domain_url):
    """
    Run the crew with given institution details.
    """
    try:
        # Create outputs directory
        output_dir = Path('outputs')
        output_dir.mkdir(exist_ok=True)
        (output_dir / 'data').mkdir(exist_ok=True)
        (output_dir / 'crew').mkdir(exist_ok=True)

        # Prepare input data
        inputs = {
            'institution_name': institution_name,
            'domain_url': domain_url,
        }

        fetch_data_from_spyfu(inputs['domain_url'], output_dir)

        # Initialize and run the crew
        crew = SeoCrew()
        crew.setup(inputs)
        crew.crew().kickoff()

        crew_dir = Path('outputs/crew')
        # Clean up markdown files
        remove_markdown_code_blocks(crew_dir / '1_analysis.md')
        remove_markdown_code_blocks(crew_dir / '2_ad_copies.md')
        remove_markdown_code_blocks(crew_dir / '3_blog_post_outlines.md')

        markdown_content = {}
        
        analysis_path = crew_dir / '1_analysis.md'
        if analysis_path.exists():
            with open(analysis_path, 'r', encoding='utf-8') as f:
                markdown_content['analysis'] = f.read()

        ad_path = crew_dir / '2_ad_copies.md'
        if ad_path.exists():
            with open(ad_path, 'r', encoding='utf-8') as f:
                markdown_content['ad'] = f.read()

        outlines_path = crew_dir / '3_blog_post_outlines.md'
        if outlines_path.exists():
            with open(outlines_path, 'r', encoding='utf-8') as f:
                outlines_content = f.read()
                # Ensure proper formatting
                if not outlines_content.startswith('# Blog Post Outline'):
                    outlines_content = outlines_content.replace('# Blog Outline', '# Blog Post Outline')
                markdown_content['outlines'] = outlines_content

        return {
            'status': 'success',
            'message': 'Crew execution completed successfully',
            'markdown': markdown_content
        }

    except Exception as e:
        print(f"Error running crew: {str(e)}")
        raise

if __name__ == "__main__":
    # For testing
    result = run_crew(
        institution_name="Jaipuria Institute of Management",
        domain_url="jaipuria.ac.in"
    )
    print(result)
