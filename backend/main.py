from tools.spyfu_tool import SpyfuTool
from analysis_crew import AnalysisCrew
from blog_writer import generate_blog
from seo_crew import SeoCrew
from pathlib import Path
import warnings
import json
import os

warnings.filterwarnings("ignore", category=SyntaxWarning, module="pysbd")

def fetch_data_from_spyfu(domain_url: str, output_dir: Path):
    """Fetch and save data from SpyFu.

    Args:
        domain_url (str): The domain URL to fetch data for.
        output_dir (Path): The directory where the output data will be saved.
    """
    try:
        spy_tool = SpyfuTool()

        print("\nFetching user rankings...")
        user_rankings = spy_tool._get_just_made_it_keywords(domain_url)
        user_rankings_json = json.loads(user_rankings)

        with open(output_dir / 'data' / 'user_rankings.json', 'w', encoding='utf-8') as f:
            json.dump(user_rankings_json, f, indent=2, ensure_ascii=False)

        print("\nFetching competitor rankings...")
        competitors = spy_tool._get_top_competitors(domain=domain_url)
        competitors_json = json.loads(competitors)

        with open(output_dir / 'data' / 'competitors.json', 'w', encoding='utf-8') as f:
            json.dump(competitors_json, f, indent=2, ensure_ascii=False)

        rankings_data = {}
        for competitor in competitors_json['results']:
            domain = competitor['domain']
            print(f"\nFetching rankings for: {domain}")

            rankings = spy_tool._get_just_made_it_keywords(domain)
            rankings_json = json.loads(rankings)
            rankings_data[domain] = rankings_json

        with open(output_dir / 'data' / 'competitor_rankings.json', 'w', encoding='utf-8') as f:
            json.dump(rankings_data, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"Error fetching data from SpyFu: {str(e)}")
        raise


def run_analysis_crew(user_id: str, institution_name: str, domain_url: str, output_dir: Path):
    """Run the analysis crew.

    Args:
        user_id (str): Unique identifier for the user.
        institution_name (str): Name of the institution.
        domain_url (str): The domain URL to analyze.
        output_dir (Path): The directory where output data will be saved.
    """
    try:
        print(f"Running analysis for user: {user_id}")

        print("Fetching SpyFu data...")
        fetch_data_from_spyfu(domain_url, output_dir)

        crew = AnalysisCrew({
            'user_id': user_id,
            'institution_name': institution_name,
            'domain_url': domain_url,
        })
        crew.crew().kickoff()

    except Exception as e:
        print(f"Error running analysis crew: {str(e)}")
        raise


def get_available_keywords(userId: str):
    """Get list of keywords grouped by competitor domains.

    Args:
        userId (str): Unique identifier for the user.

    Returns:
        dict: A dictionary containing the status and keywords grouped by domain.
    """
    try:
        print(f"Attempting to read keywords for user: {userId}")

        file_path = f'outputs/{userId}/data/competitor_rankings.json'
        print(f"Looking for file: {file_path}")

        if not os.path.exists(file_path):
            return {
                'status': 'error',
                'message': f'Rankings file not found: {file_path}'
            }

        with open(file_path, 'r', encoding='utf-8') as f:
            rankings_data = json.load(f)

        domain_keywords = {}
        for domain, data in rankings_data.items():
            unique_keywords = set(result['keyword'] for result in data['results'])
            domain_keywords[domain] = list(unique_keywords)

        return {
            'status': 'success',
            'keywords': domain_keywords
        }
    except Exception as e:
        print(f"Error getting keywords: {str(e)}")
        return {
            'status': 'error',
            'message': str(e)
        }


def save_keyword_details(userId: str, selected_keywords: list[str]):
    """Get full details for selected keywords.

    Args:
        userId (str): Unique identifier for the user.
        selected_keywords (list[str]): List of selected keywords to get details for.
    """
    try:
        with open(f'outputs/{userId}/data/competitor_rankings.json', 'r', encoding='utf-8') as f:
            rankings_data = json.load(f)

        keyword_details = {}
        for domain in rankings_data:
            for result in rankings_data[domain]['results']:
                if result['keyword'] in selected_keywords:
                    if result['keyword'] not in keyword_details:
                        keyword_details[result['keyword']] = result

        with open(f'outputs/{userId}/data/selected_keywords_details.json', 'w', encoding='utf-8') as f:
            json.dump(keyword_details, f, indent=2, ensure_ascii=False)

    except Exception as e:
        print(f"Error getting keyword details: {str(e)}")


def run_seo_crew(userId: str, institution_name: str, domain_url: str):
    """Run the SEO crew.

    Args:
        userId (str): Unique identifier for the user.
        school_name (str): Name of the school.
        domain_url (str): The domain URL to analyze.
    """
    try:
        print(f"Running SEO crew for user: {userId}")
        crew = SeoCrew({
            'user_id': userId,
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
    output_dir = Path('outputs')
    output_dir.mkdir(exist_ok=True)
    (output_dir / 'data').mkdir(exist_ok=True)

    # # Step 1: Fetch SpyFu data
    # print("Fetching SpyFu data...")
    # fetch_data_from_spyfu(domain_url, output_dir)

    # # Step 2: Run analysis crew
    # print("\nRunning analysis crew...")
    # analysis_result = run_analysis_crew("bd79829f-34c1-492b-80a1-9c563b09c50b", institution_name, domain_url, output_dir)
    # print("Analysis complete!")

    # # Step 3: Show available keywords
    # print("\nAvailable keywords:")
    # keywords_response = get_available_keywords("bd79829f-34c1-492b-80a1-9c563b09c50b")
    # if keywords_response['status'] == 'success':
    #     print("Keywords fetched successfully")
    # else:
    #     print("Error retrieving keywords:", keywords_response['message'])

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

    # # Step 6: Run SEO crew with selected keywords
    # print("\nRunning SEO crew for selected keywords...")
    # seo_result = run_seo_crew("ef2c1a46-2511-482f-8668-935b1f219eeb", institution_name, domain_url)
    # print("SEO crew complete!")

    # # Step 7: Run blog writer crew
    # print("\nRunning blog writer")
    # blog_outline = input("Enter the blog outline: ")
    # generate_blog(blog_outline, "ef2c1a46-2511-482f-8668-935b1f219eeb")
    # print("Blog writer crew complete!")
