from pathlib import Path
from crewai import Agent, Crew, Task, LLM
from crewai.project import CrewBase, agent, crew, task, before_kickoff
from crewai_tools import FileReadTool
import os

openai = LLM(
    model="gpt-4o",
    api_key=os.getenv("OPENAI_API_KEY")
)

@CrewBase
class AnalysisCrew():
    """Analysis Crew"""

    agents_config = 'config/agents.yaml'
    tasks_config = 'config/tasks.yaml'

    def __init__(self):
        # Create outputs directory structure
        self.output_dir = Path('outputs')
        self.output_dir.mkdir(exist_ok=True)
        (self.output_dir / 'crew').mkdir(exist_ok=True)

        super().__init__()

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


    @task
    def analyze_keyword_rankings_data_task(self) -> Task:
        return Task(
            config=self.tasks_config['analyze_keyword_rankings_data'],
            agent=self.data_analyst_agent(),
            output_file=str(self.output_dir / 'crew' / '1_analysis.md')
        )


    @crew
    def crew(self) -> Crew:
        return Crew(
            agents=self.agents,
            tasks=self.tasks,
            verbose=True
        )
