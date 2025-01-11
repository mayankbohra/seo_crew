import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Hero from './components/home/Hero';
import Features from './components/home/Features';
import ProcessFlow from './components/home/ProcessFlow';
import InstituteForm from './components/forms/InstituteForm';
import ProgressStatus from './components/progress/ProgressStatus';
import DownloadPage from './components/download/DownloadPage';
import BlogGenerationForm from './components/forms/BlogGenerationForm';
import { startCrewExecution } from './services/api';
import ErrorBoundary from './components/ErrorBoundary';
import { useNavigate } from 'react-router-dom';
import { stepTimings, totalDuration } from './config/progress';

// Separate component for home page content
function HomeContent({ showForm, processing, currentStep, onGetStarted, onSubmit, onBack }) {
    if (!showForm && !processing) {
        return (
            <>
                <Hero onGetStarted={onGetStarted} />
                <Features />
                <ProcessFlow />
            </>
        );
    }
    if (showForm && !processing) {
        return <InstituteForm onSubmit={onSubmit} onBack={onBack} />;
    }
    return <ProgressStatus currentStep={currentStep} />;
}

// Main content wrapper with navigation
function MainContent() {
    const [showForm, setShowForm] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [currentStep, setCurrentStep] = useState(-1);
    const navigate = useNavigate();

    // Progress simulation using stepTimings
    useEffect(() => {
        let timeoutIds = [];

        if (processing) {
            // Schedule each step based on accumulated timings
            stepTimings.forEach(({ step, time }) => {
                timeoutIds.push(setTimeout(() => {
                    setCurrentStep(step);
                    console.log(`Starting step ${step} at ${time}ms`); // For debugging
                }, time));
            });

            // Schedule completion
            timeoutIds.push(setTimeout(() => {
                setProcessing(false);
                if (location.state?.downloadFiles && location.state?.markdownContent) {
                    navigate('/download', {
                        state: location.state
                    });
                }
            }, totalDuration + 1000)); // Add 1 second buffer for smooth transition
        }

        return () => timeoutIds.forEach(clearTimeout);
    }, [processing]);

    const handleSubmit = async (formData) => {
        setProcessing(true);
        setCurrentStep(0);

        try {
            const result = await startCrewExecution(formData);
            if (result.status === 'error') {
                throw new Error(result.message);
            }

            // Store the result but don't navigate yet - let the progress complete
            location.state = {
                downloadFiles: result.docxFiles,
                markdownContent: result.markdown
            };

        } catch (error) {
            console.error('Error:', error);
            setProcessing(false);
            setCurrentStep(-1);
            alert('An error occurred: ' + error.message);
        }
    };

    return (
        <Routes>
            <Route path="/" element={
                <HomeContent
                    showForm={showForm}
                    processing={processing}
                    currentStep={currentStep}
                    onGetStarted={() => setShowForm(true)}
                    onSubmit={handleSubmit}
                    onBack={() => setShowForm(false)}
                />
            } />
            <Route path="/download" element={<DownloadPage />} />
            <Route path="/generate-blog" element={<BlogGenerationForm />} />
        </Routes>
    );
}

// App component with router
function App() {
    return (
        <ErrorBoundary>
            <Router>
                <div className="min-h-screen bg-gray-50">
                    <MainContent />
                </div>
            </Router>
        </ErrorBoundary>
    );
}

export default App;
