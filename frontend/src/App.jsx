import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import { stepTimings, totalDuration, progressSteps } from './config/progress';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './components/auth/LoginPage';

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
    const [simulationComplete, setSimulationComplete] = useState(false);
    const [backendData, setBackendData] = useState(null);
    const navigate = useNavigate();

    // Effect to handle navigation when both simulation and backend are ready
    useEffect(() => {
        if (simulationComplete && backendData) {
            setProcessing(false);
            navigate('/download', {
                state: backendData
            });
        }
    }, [simulationComplete, backendData, navigate]);

    // Progress simulation using stepTimings
    useEffect(() => {
        let timeoutIds = [];

        if (processing) {
            let accumulatedTime = 0;

            // Schedule each step with its full duration
            progressSteps.forEach((step, index) => {
                timeoutIds.push(setTimeout(() => {
                    setCurrentStep(index);
                }, accumulatedTime));

                accumulatedTime += step.duration;
            });

            // Mark simulation as complete after all steps
            timeoutIds.push(setTimeout(() => {
                setSimulationComplete(true);
            }, accumulatedTime));
        }

        return () => timeoutIds.forEach(clearTimeout);
    }, [processing]);

    const handleSubmit = async (formData) => {
        if (processing) return; // Prevent multiple submissions

        setProcessing(true);
        setSimulationComplete(false);
        setBackendData(null);

        try {
            const result = await startCrewExecution(formData);

            if (result.status === 'success') {
                setBackendData({
                    downloadFiles: result.docxFiles,
                    markdownContent: result.markdown
                });
            } else {
                throw new Error(result.message || 'Failed to process request');
            }
        } catch (error) {
            console.error('Error:', error);
            setProcessing(false);
            setCurrentStep(-1);
            setSimulationComplete(false);
            // Handle error (show error message to user)
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

// Protected Route component
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" />;
    }

    return children;
};

// App component with router
function App() {
    return (
        <ErrorBoundary>
            <AuthProvider>
                <Router>
                    <div className="min-h-screen bg-gray-50">
                        <Routes>
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/" element={
                                <ProtectedRoute>
                                    <MainContent />
                                </ProtectedRoute>
                            } />
                            <Route path="/download" element={
                                <ProtectedRoute>
                                    <DownloadPage />
                                </ProtectedRoute>
                            } />
                            <Route path="/generate-blog" element={
                                <ProtectedRoute>
                                    <BlogGenerationForm />
                                </ProtectedRoute>
                            } />
                        </Routes>
                    </div>
                </Router>
            </AuthProvider>
        </ErrorBoundary>
    );
}

export default App;
