from crewai import Agent, Crew, Task, LLM
from crewai.project import CrewBase, agent, crew, task, before_kickoff
from crewai_tools import FileReadTool, SerperDevTool, WebsiteSearchTool
from dotenv import load_dotenv
from pathlib import Path
import os

load_dotenv()
serper_api_key = os.getenv("SERPER_API_KEY")

openai = LLM(
    model="gpt-4o",
    api_key=os.getenv("OPENAI_API_KEY")
)

anthropic = LLM(
    model="claude-3-5-sonnet-20240620",
    api_key=os.getenv("ANTHROPIC_API_KEY")
)

@CrewBase
class SeoCrew():
	"""SEO Analysis Crew"""

	agents_config = 'config/agents.yaml'
	tasks_config = 'config/tasks.yaml'

	def __init__(self):
		# Create outputs directory structure
		self.output_dir = Path('outputs')
		self.output_dir.mkdir(exist_ok=True)
		(self.output_dir / 'crew').mkdir(exist_ok=True)

		self.inputs = {}

		super().__init__()

	@before_kickoff
	def setup(self, inputs):
		"""Initialize data from inputs before running tasks"""
		self.inputs = inputs

	@agent
	def data_analyst_agent(self) -> Agent:
		return Agent(
			config=self.agents_config['data_analyst'],
            tools=[
                FileReadTool(
					name="Read competitor rankings data",
					description="Read the competitor_rankings.json file",
					file_path=self.output_dir / 'data' / 'competitor_rankings.json',
					encoding='utf-8',
					errors='ignore'
				),
				FileReadTool(
					name="Read user rankings data",
					description="Read the user_rankings.json file",
					file_path=self.output_dir / 'data' / 'user_rankings.json',
					encoding='utf-8',
					errors='ignore'
				)
			],
			llm=openai,
			verbose=False
	)

	@agent
	def ad_copy_specialist_agent(self) -> Agent:
		return Agent(
			config=self.agents_config['ad_copy_specialist'],
			tools=[
				FileReadTool(
					name="Read rankings data",
					description="Read the rankings.json file for keyword analysis",
					file_path=self.output_dir / 'data' / 'competitor_rankings.json',
					encoding='utf-8',
					errors='ignore'
				),
				SerperDevTool(),
				WebsiteSearchTool()
			],
			llm=anthropic,
			verbose=True
		)

	@agent
	def blog_outline_strategist_agent(self) -> Agent:
		return Agent(
			config=self.agents_config['blog_outline_strategist'],
			tools=[
                FileReadTool(
					name="Read ad copies",
					description="Read the ad_copies.md file",
					file_path=self.output_dir / 'crew' / '2_ad_copies.md',
					encoding='utf-8',
					errors='ignore'
				),
				FileReadTool(
					name="Read rankings data",
					description="Read the rankings.json file",
					file_path=self.output_dir / 'data' / 'competitor_rankings.json',
					encoding='utf-8',
					errors='ignore'
				),
				SerperDevTool(),
				WebsiteSearchTool()
			],
			llm=anthropic,
			verbose=True
		)


	@task
	def analyze_keyword_rankings_data_task(self) -> Task:
		return Task(
			config=self.tasks_config['analyze_keyword_rankings_data'],
			agent=self.data_analyst_agent(),
			output_file=str(self.output_dir / 'crew' / '1_analysis.md')
		)

	@task
	def generate_ad_copies_task(self) -> Task:
		return Task(
			config=self.tasks_config['generate_ad_copies'],
			agent=self.ad_copy_specialist_agent(),
			context=[self.analyze_keyword_rankings_data_task()],
			output_file=str(self.output_dir / 'crew' / '2_ad_copies.md')
		)

	@task
	def generate_blog_post_outlines_task(self) -> Task:
		return Task(
			config=self.tasks_config['generate_blog_post_outlines'],
			agent=self.blog_outline_strategist_agent(),
			context=[self.analyze_keyword_rankings_data_task(), self.generate_ad_copies_task()],
			output_file=str(self.output_dir / 'crew' / '3_blog_post_outlines.md')
		)


	@crew
	def crew(self) -> Crew:
		return Crew(
			agents=self.agents,
			tasks=self.tasks,
			verbose=True
		)
