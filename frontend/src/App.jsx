import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Hero from './components/home/Hero';
import Features from './components/home/Features';
import ProcessFlow from './components/home/ProcessFlow';
import InstituteForm from './components/forms/InstituteForm';
import ProgressStatus from './components/progress/ProgressStatus';
import DownloadPage from './components/download/DownloadPage';
import BlogGenerationForm from './components/forms/BlogGenerationForm';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './components/auth/LoginPage';
import Header from './components/common/Header';
import SetPassword from './components/auth/SetPassword';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import BlogGeneration from './components/blog/BlogGeneration';

// PrivateRoute component
function PrivateRoute({ children }) {
    const { user } = useAuth();
    return user ? children : <Navigate to="/login" />;
}

// PublicRoute component for auth pages
function PublicRoute({ children }) {
    const { user } = useAuth();
    return !user ? children : <Navigate to="/" />;
}

function App() {
    return (
        <ErrorBoundary>
            <AuthProvider>
                <Router>
                    <div className="min-h-screen flex flex-col">
                        <Header />
                        <main className="flex-grow">
                            <Routes>
                                <Route path="/" element={
                                    <PrivateRoute>
                                        <div>
                                            <Hero />
                                            <Features />
                                            <ProcessFlow />
                                        </div>
                                    </PrivateRoute>
                                } />
                                <Route path="/form" element={
                                    <PrivateRoute>
                                        <InstituteForm />
                                    </PrivateRoute>
                                } />
                                <Route path="/login" element={
                                    <PublicRoute>
                                        <LoginPage />
                                    </PublicRoute>
                                } />
                                <Route path="/progress" element={
                                    <PrivateRoute>
                                        <ProgressStatus />
                                    </PrivateRoute>
                                } />
                                <Route path="/download" element={
                                    <PrivateRoute>
                                        <DownloadPage />
                                    </PrivateRoute>
                                } />
                                <Route path="/generate-blog" element={
                                    <PrivateRoute>
                                        <BlogGenerationForm />
                                    </PrivateRoute>
                                } />
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
                                <Route path="/blog" element={<BlogGeneration />} />
                            </Routes>
                        </main>
                    </div>
                </Router>
            </AuthProvider>
        </ErrorBoundary>
    );
}

export default App;
