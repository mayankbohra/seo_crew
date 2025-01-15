import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import Header from './components/common/Header';
import SetPassword from './components/auth/SetPassword';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';

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
    const { signOut } = useAuth();

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
        <div className="min-h-screen bg-gray-50">
            <Header />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                    <Route path="/set-password" element={<SetPassword />} />
                    <Route path="/forgot-password" element={
                        <PublicRoute>
                            <ForgotPassword />
                        </PublicRoute>
                    } />
                    <Route path="/reset-password" element={
                        <PublicRoute>
                            <ResetPassword />
                        </PublicRoute>
                    } />
                </Routes>
            </main>
        </div>
    );
}

// Protected Route component
const ProtectedRoute = ({ children }) => {
    const { user, loading, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            navigate('/login', { replace: true });
        }
    }, [loading, isAuthenticated, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null; // Will be redirected by useEffect
    }

    return children;
};

// Public Route component
const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    // Allow access to auth confirmation route even if user is logged in
    if (location.pathname.startsWith('/auth/confirm')) {
        return children;
    }

    if (user) {
        return <Navigate to="/" replace />;
    }

    return children;
};

function App() {
    return (
        <ErrorBoundary>
            <AuthProvider>
                <Router>
                    <Routes>
                        {/* Auth confirmation route */}
                        <Route path="/auth/confirm" element={
                            <PublicRoute>
                                <SetPassword />
                            </PublicRoute>
                        } />

                        {/* Set password route */}
                        <Route path="/set-password" element={
                            <PublicRoute>
                                <SetPassword />
                            </PublicRoute>
                        } />

                        {/* Default route - redirects to login if not authenticated */}
                        <Route path="/" element={
                            <ProtectedRoute>
                                <MainContent />
                            </ProtectedRoute>
                        } />

                        {/* Public Route - Login */}
                        <Route path="/login" element={
                            <PublicRoute>
                                <LoginPage />
                            </PublicRoute>
                        } />

                        {/* Other Protected Routes */}
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

                        {/* Catch all route - redirect to login */}
                        <Route path="*" element={<Navigate to="/login" replace />} />
                    </Routes>
                </Router>
            </AuthProvider>
        </ErrorBoundary>
    );
}

export default App;
