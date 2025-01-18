from tools.spyfu_tool import SpyfuTool
from analysis_crew import AnalysisCrew
from blog_writer import generate_blog
from seo_crew import SeoCrew
from pathlib import Path
import warnings
import json

warnings.filterwarnings("ignore", category=SyntaxWarning, module="pysbd")

def fetch_data_from_spyfu(domain_url: str, output_dir: Path):
    """Fetch and save data from SpyFu"""
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


def run_analysis_crew(user_id: str, institution_name: str, domain_url: str, output_dir: Path):
    """Run the analysis crew"""
    try:
        print(f"Running analysis for user: {user_id}")

        print("Fetching SpyFu data...")
        fetch_data_from_spyfu(domain_url, output_dir)

        crew = AnalysisCrew(user_id)
        crew.setup({
            'institution_name': institution_name,
            'domain_url': domain_url,
        })
        crew.crew().kickoff()

    except Exception as e:
        print(f"Error running analysis crew: {str(e)}")
        raise


def get_available_keywords(userId: str):
    """Get list of all unique keywords from competitor rankings"""
    try:
        with open(f'outputs/{userId}/data/competitor_rankings.json', 'r', encoding='utf-8') as f:
            rankings_data = json.load(f)

        keywords = set()
        for domain in rankings_data:
            for result in rankings_data[domain]['results']:
                keywords.add(result['keyword'])

        return sorted(list(keywords))
    except Exception as e:
        print(f"Error getting keywords: {str(e)}")
        return []


def save_keyword_details(userId: str, selected_keywords: list[str]):
    """Get full details for selected keywords"""
    try:
        with open(f'outputs/{userId}/data/competitor_rankings.json', 'r', encoding='utf-8') as f:
            rankings_data = json.load(f)

        keyword_details = {}
        for domain in rankings_data:
            for result in rankings_data[domain]['results']:
                if result['keyword'] in selected_keywords:
                    if result['keyword'] not in keyword_details:
                        keyword_details[result['keyword']] = result

        # save keyword details to json file
        with open(f'outputs/{userId}/data/selected_keywords_details.json', 'w', encoding='utf-8') as f:
            json.dump(keyword_details, f, indent=2, ensure_ascii=False)

    except Exception as e:
        print(f"Error getting keyword details: {str(e)}")


def run_seo_crew(userId: str, institution_name: str, domain_url: str):
    """Run the SEO crew"""
    try:
        print(f"Running SEO crew for user: {userId}")
        crew = SeoCrew(userId)
        crew.setup({
            'institution_name': institution_name,
            'domain_url': domain_url
        })
        crew.crew().kickoff()
    except Exception as e:
        print(f"Error running SEO crew: {str(e)}")
        raise


if __name__ == "__main__":
    # Test the workflow
    institution_name = "Jaipuria Institute of Management"
    domain_url = "jaipuria.ac.in"
    # output_dir = Path('outputs')
    # output_dir.mkdir(exist_ok=True)
    # (output_dir / 'data').mkdir(exist_ok=True)

    # # Step 1: Fetch SpyFu data
    # print("Fetching SpyFu data...")
    # fetch_data_from_spyfu(domain_url, output_dir)

    # # Step 2: Run analysis crew
    # print("\nRunning analysis crew...")
    # analysis_result = run_analysis_crew(institution_name, domain_url)
    # print("Analysis complete!")

    # # Step 3: Show available keywords
    # print("\nAvailable keywords:")
    # keywords = get_available_keywords()
    # for i, keyword in enumerate(keywords, 1):
    #     print(f"{i}. {keyword}")

    # # Step 4: Get user input for keyword selection
    # print("\nEnter the numbers of keywords you want to target (comma-separated):")
    # selections = input("> ").strip().split(',')
    # selected_keywords = [keywords[int(i.strip()) - 1] for i in selections if i.strip().isdigit() and 0 < int(i) <= len(keywords)]

    # if not selected_keywords:
    #     print("No valid keywords selected!")
    #     exit(1)

    # print("\nSelected keywords:", selected_keywords)

    # # Step 5: Save keyword details
    # print("\nSaving keyword details...")
    # save_keyword_details(selected_keywords)

    # Step 6: Run SEO crew with selected keywords
    print("\nRunning SEO crew for selected keywords...")
    seo_result = run_seo_crew("ef2c1a46-2511-482f-8668-935b1f219eeb", institution_name, domain_url)
    print("SEO crew complete!")

    # Step 7: Run blog writer crew
    print("\nRunning blog writer")
    blog_outline = input("Enter the blog outline: ")
    generate_blog(blog_outline, "ef2c1a46-2511-482f-8668-935b1f219eeb")
    print("Blog writer crew complete!")
