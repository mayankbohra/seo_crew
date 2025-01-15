import http.client
import os
import json
import base64
from crewai.tools import BaseTool
from typing import Type
from pydantic import BaseModel, Field
from dotenv import load_dotenv
import contextlib
from pathlib import Path

load_dotenv()

class SpyfuToolInput(BaseModel):
    """Input schema for SpyfuTool."""
    domain: str = Field(..., description="Domain to analyze")
    analysis_type: str = Field(..., description="Type of analysis: 'competitors' or 'rankings'")

class SpyfuTool(BaseTool):
    name: str = "SpyFu SEO Analysis Tool"
    description: str = (
        "Use this tool to get either top SEO competitors or newly ranking keywords. "
        "Set analysis_type to 'competitors' for competitor analysis or 'rankings' for newly ranking keywords."
    )
    args_schema: Type[BaseModel] = SpyfuToolInput
    output_dir: Path = Field(default_factory=lambda: Path('outputs/data'))

    def __init__(self, **data):
        super().__init__(**data)
        # Create outputs directory if it doesn't exist
        self.output_dir.mkdir(parents=True, exist_ok=True)

    def _run(self, domain: str, analysis_type: str) -> str:
        """Run the specified type of analysis"""
        if analysis_type.lower() == 'competitors':
            result = self._get_top_competitors(domain)
        elif analysis_type.lower() == 'rankings':
            result = self._get_just_made_it_keywords(domain)
        else:
            return json.dumps({"error": "Invalid analysis_type. Use 'competitors' or 'rankings'"})

        return result

    def _get_auth_headers(self):
        """Get authentication headers for SpyFu API"""
        api_id = os.getenv("SPYFU_API_ID")
        secret_key = os.getenv("SPYFU_SECRET_KEY")

        if not api_id or not secret_key:
            raise ValueError("SPYFU_API_ID and SPYFU_SECRET_KEY must be set in .env file")

        auth_string = base64.b64encode(f"{api_id}:{secret_key}".encode()).decode()
        return {
            'Authorization': f'Basic {auth_string}',
            'Accept': 'application/json'
        }

    def _clean_domain(self, domain: str) -> str:
        """Clean domain URL"""
        return domain.replace('https://', '').replace('http://', '').strip('/ ')

    def _get_top_competitors(self, domain: str) -> str:
        """Get top SEO competitors data"""
        with contextlib.closing(http.client.HTTPSConnection("www.spyfu.com")) as conn:
            headers = self._get_auth_headers()
            clean_domain = self._clean_domain(domain)

            url = (
                f"/apis/competitors_api/v2/seo/getTopCompetitors?"
                f"domain={clean_domain}&"
                f"startingRow=2&"
                f"pageSize=5&"
                f"countryCode=IN"
            )

            try:
                conn.request("GET", url, headers=headers)
                res = conn.getresponse()
                data = res.read()

                if res.status == 200:
                    return data.decode("utf-8")  # raw JSON string
                else:
                    error_msg = f"Error getting competitors: {res.status} - {data.decode('utf-8')}"
                    print(f"SpyFu API Error: {error_msg}")
                    return json.dumps({"error": error_msg})

            except Exception as e:
                error_msg = f"Error in competitors request: {str(e)}"
                print(f"Exception: {error_msg}")
                return json.dumps({"error": error_msg})

    def _get_just_made_it_keywords(self, domain: str) -> str:
        """Get newly ranking keywords data with filtered fields"""
        with contextlib.closing(http.client.HTTPSConnection("www.spyfu.com")) as conn:
            headers = self._get_auth_headers()
            clean_domain = self._clean_domain(domain)

            url = (
                f"/apis/serp_api/v2/seo/getNewlyRankedKeywords?"
                f"query={clean_domain}&"
                f"sortBy=RankChange&"
                f"sortOrder=Descending&"
                f"startingRow=1&"
                f"pageSize=10&"
                f"countryCode=IN&"
            )

            try:
                conn.request("GET", url, headers=headers)
                res = conn.getresponse()
                data = res.read()

                if res.status == 200:
                    # Parse the full response
                    full_data = json.loads(data.decode("utf-8"))

                    # Filter only required fields from results
                    filtered_results = []
                    for result in full_data.get('results', []):
                        filtered_result = {
                            'keyword': result.get('keyword'),
                            'topRankedUrl': result.get('topRankedUrl'),
                            'rank': result.get('rank'),
                            'searchVolume': result.get('searchVolume'),
                            'keywordDifficulty': result.get('keywordDifficulty'),
                            'seoClicks': result.get('seoClicks')
                        }
                        filtered_results.append(filtered_result)

                    # Create filtered response
                    filtered_data = {
                        'resultCount': full_data.get('resultCount'),
                        'results': filtered_results
                    }

                    return json.dumps(filtered_data, indent=2)
                else:
                    error_msg = f"Error getting new rankings: {res.status} - {data.decode('utf-8')}"
                    print(f"SpyFu API Error: {error_msg}")
                    return json.dumps({"error": error_msg})

            except Exception as e:
                error_msg = f"Error in new rankings request: {str(e)}"
                print(f"Exception: {error_msg}")
                return json.dumps({"error": error_msg})
