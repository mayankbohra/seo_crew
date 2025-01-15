from crew import SeoCrew
from analysis_crew import AnalysisCrew
from tools.spyfu_tool import SpyfuTool
import warnings
from pathlib import Path
import json

warnings.filterwarnings("ignore", category=SyntaxWarning, module="pysbd")

def fetch_data_from_spyfu(domain_url, output_dir):
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

def get_available_keywords():
    """Get list of all unique keywords from competitor rankings"""
    try:
        with open('outputs/data/competitor_rankings.json', 'r', encoding='utf-8') as f:
            rankings_data = json.load(f)

        keywords = set()
        for domain in rankings_data:
            for result in rankings_data[domain]['results']:
                keywords.add(result['keyword'])

        return sorted(list(keywords))
    except Exception as e:
        print(f"Error getting keywords: {str(e)}")
        return []

def get_keyword_details(selected_keywords):
    """Get full details for selected keywords"""
    try:
        with open('outputs/data/competitor_rankings.json', 'r', encoding='utf-8') as f:
            rankings_data = json.load(f)

        keyword_details = {}
        for domain in rankings_data:
            for result in rankings_data[domain]['results']:
                if result['keyword'] in selected_keywords:
                    if result['keyword'] not in keyword_details:
                        keyword_details[result['keyword']] = result

        return keyword_details
    except Exception as e:
        print(f"Error getting keyword details: {str(e)}")
        return {}

def run_analysis_crew(institution_name, domain_url):
    """Run the analysis crew"""
    try:
        crew = AnalysisCrew()
        crew.setup({'institution_name': institution_name, 'domain_url': domain_url})
        result = crew.crew().kickoff()
        return result
    except Exception as e:
        print(f"Error running analysis crew: {str(e)}")
        raise

def run_seo_crew(institution_name, domain_url, selected_keywords):
    """Run the SEO crew with selected keywords"""
    try:
        keyword_details = get_keyword_details(selected_keywords)

        crew = SeoCrew()
        crew.setup({
            'institution_name': institution_name,
            'domain_url': domain_url,
            'keyword_details': keyword_details
        })
        result = crew.crew().kickoff()
        return result
    except Exception as e:
        print(f"Error running SEO crew: {str(e)}")
        raise

if __name__ == "__main__":
    # Test the workflow
    institution_name = "Jaipuria Institute of Management"
    domain_url = "jaipuria.ac.in"
    output_dir = Path('outputs')
    output_dir.mkdir(exist_ok=True)
    (output_dir / 'data').mkdir(exist_ok=True)

    # Step 1: Fetch SpyFu data
    print("Fetching SpyFu data...")
    fetch_data_from_spyfu(domain_url, output_dir)

    # Step 2: Run analysis crew
    print("\nRunning analysis crew...")
    analysis_result = run_analysis_crew(institution_name, domain_url)
    print("Analysis complete!")

    # Step 3: Show available keywords
    print("\nAvailable keywords:")
    keywords = get_available_keywords()
    for i, keyword in enumerate(keywords, 1):
        print(f"{i}. {keyword}")

    # Step 4: Get user input for keyword selection
    print("\nEnter the numbers of keywords you want to target (comma-separated):")
    selections = input("> ").strip().split(',')
    selected_keywords = [keywords[int(i.strip()) - 1] for i in selections if i.strip().isdigit() and 0 < int(i) <= len(keywords)]

    if not selected_keywords:
        print("No valid keywords selected!")
        exit(1)

    print("\nSelected keywords:", selected_keywords)

    # Step 5: Run SEO crew with selected keywords
    print("\nRunning SEO crew for selected keywords...")
    seo_result = run_seo_crew(institution_name, domain_url, selected_keywords)
    print("SEO crew complete!")
