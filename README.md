# SEO Content Generation Tool

## Introduction
Welcome to the SEO Content Generation Tool, a powerful application designed to help educational institutions enhance their online presence. This tool provides comprehensive SEO analysis, generates high-quality content, and creates effective ad copies to boost your institution's visibility and engagement. With features like competitor analysis, SEO optimization, ad copy creation, and content generation, you can easily improve your digital marketing strategies and attract more students.

## Features
- **Competitor Analysis**: Analyze top competitors' keywords and content strategies to identify opportunities for improvement.
- **SEO Optimization**: Generate content optimized for search engines to improve visibility and ranking.
- **Content Generation**: Create high-quality blog posts with AI assistance, tailored to specific keywords and topics.
- **Ad Copy Creation**: Develop compelling ad copies for platforms like Google and Meta Ads.
- **Content Strategy**: Generate strategic blog outlines based on high-performing keywords.

## Usage Instructions

### Navigating the Application
1. **Home Page**:
   - The home page features a welcoming Hero section with a brief introduction to the tool.
   - Click on "Generate Analysis & Outlines" to start using the tool.

2. **Institute Form**:
   - Enter your institution's name and domain URL in the provided fields.
   - Click "Start Analysis" to initiate the SEO analysis process.
   - Wait for the analysis to complete, which may take a few moments.

3. **Analysis Results**:
   - Once the analysis is complete, you will be redirected to the Analysis Results Page.
   - Here, you can view the analysis results, select keywords, and generate content.
   - Use the tabs to switch between analysis, keywords, ads and blog outlines content.

4. **Blog Generation**:
   - Navigate to the Blog Outlines section to create detailed blog posts for any particular outline.
   - Click "Generate Blog Post" to create and download your content.

## Getting Started

### Sign Up or Log In
1. **Visit the Application**: Open your web browser and go to the application URL.
2. **Sign Up**:
   - Click on the "Sign Up" button on the homepage.
   - Enter your email address and create a password.
   - Verify your email by entering the OTP sent to your inbox.
   - Complete the registration process by following the on-screen instructions.
3. **Log In**:
   - Click on the "Log In" button.
   - Enter your registered email and password.
   - Click "Sign In" to access the application.

## Installation & Setup

### Prerequisites
- **Node.js** v18+ and **npm** v9+ for the frontend.
- **Python** 3.10+ and **pip** v23+ for the backend.

### Frontend Setup
1. Clone the repository and navigate to the `frontend` directory.
2. Install dependencies using:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `frontend` directory with the following variables:
   - `VITE_API_URL`: Base URL for backend API (default: http://localhost:5000)
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
   - `VITE_ALLOWED_EMAIL_DOMAIN`: Allowed email domain for registration (e.g., jaipuria.ac.in)
4. Start the development server:
   ```bash
   npm run dev
   ```

### Backend Setup
1. Navigate to the `backend` directory.
2. Install dependencies using:
   ```bash
   pip install -r requirements.txt
   ```
3. Create a `.env` file in the `backend` directory with the following variables:
   - `OPENAI_API_KEY`: OpenAI API key for content generation
   - `ANTHROPIC_API_KEY`: Anthropic API key for Claude AI
   - `GEMINI_API_KEY`: Google's Gemini API key
   - `AGENTOPS_API_KEY`: AgentOps API key for monitoring
   - `SERPER_API_KEY`: Serper API key for search results
   - `SPYFU_API_ID`: SpyFu API ID for competitor analysis
   - `SPYFU_SECRET_KEY`: SpyFu secret key
   - `ALLOWED_ORIGINS`: Comma-separated list of allowed CORS origins
   - `FLASK_ENV`: Environment mode (development/production)
   - `PORT`: Port number for the backend server
4. Start the backend server:
   ```bash
   uvicorn app:app --reload
   ```

## API Endpoints

### API Endpoints
- **runAnalysis**: POST `/run/analysis` - Initiates an SEO analysis with provided data.
- **getKeywords**: GET `/keywords` - Fetches keywords associated with the current user.
- **saveKeywords**: POST `/keywords/save/:userId` - Saves selected keywords for the user.
- **generateBlog**: POST `/generate-blog/:userId` - Generates a blog based on the provided outline.
- **cleanupUserData**: DELETE `/cleanup/:userId` - Cleans up user data for the specified user ID.

### SpyFu API (spyfu_tool.py)
- **_get_top_competitors**: Fetches top SEO competitors for a given domain.
- **_get_newly_ranked_keywords**: Fetches newly ranking keywords for a given domain.

## Tech Stack

### Frontend
- **Vite**: Build tool for faster development.
- **React**: UI library for building user interfaces.
- **Tailwind CSS**: Utility-first CSS framework.
- **Framer Motion**: Animation library for React.

### Backend
- **Python**: Programming language for backend logic.
- **FastAPI**: Web framework for building APIs.
- **Uvicorn**: ASGI server for running FastAPI applications.

### Database & Authentication
- **Supabase**: Backend as a service for database and authentication.

## Error Handling & Troubleshooting

### Common Issues
1. **Authentication Errors**
   - Check if your Supabase credentials are correct
   - Verify the allowed email domain configuration
   - Ensure proper network connectivity

2. **API Connection Issues**
   - Verify all API keys are properly set in .env
   - Check if the backend server is running
   - Confirm CORS settings are correct

3. **Content Generation Failures**
   - Ensure all required API services (OpenAI, Anthropic, etc.) are accessible
   - Verify input data format and requirements
   - Check server logs for detailed error messages

Thank you for choosing the SEO Content Generation Tool. We are committed to helping you achieve your digital marketing goals with ease and efficiency.
