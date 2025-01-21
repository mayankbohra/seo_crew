from pathlib import Path
from crewai import Agent, Crew, Task, LLM
from crewai.project import CrewBase, agent, crew, task, before_kickoff
from crewai_tools import FileReadTool
import os

openai = LLM(
    model="gpt-4o",
    api_key=os.getenv("OPENAI_API_KEY")
)

gemini = LLM(
    model="gemini/gemini-2.0-flash-exp",
    api_key=os.getenv("GEMINI_API_KEY")
)

anthropic = LLM(
    model="claude-3-5-sonnet-20241022",
    api_key=os.getenv("ANTHROPIC_API_KEY")
)

@CrewBase
class AnalysisCrew():
    """Analysis Crew"""

    agents_config = 'config/agents.yaml'
    tasks_config = 'config/tasks.yaml'

    def __init__(self, user_id: str):
        # Use user-specific output directory
        self.user_id = user_id
        self.output_dir = Path('outputs') / str(user_id)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        (self.output_dir / 'crew').mkdir(exist_ok=True)

        self.inputs = {}

        super().__init__()

    @before_kickoff
    def setup(self, inputs):
        """Initialize data before running tasks"""
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
            llm=anthropic,
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
