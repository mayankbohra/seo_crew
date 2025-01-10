import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Hero from './components/home/Hero';
import Features from './components/home/Features';
import ProcessFlow from './components/home/ProcessFlow';
import InstituteForm from './components/forms/InstituteForm';
import ProgressStatus from './components/progress/ProgressStatus';
import DownloadPage from './components/download/DownloadPage';
import BlogGenerationForm from './components/forms/BlogGenerationForm';
import { startCrewExecution } from './services/api';

// Buffer polyfill for base64 conversion
const bufferFromBase64 = base64String => {
    try {
        // Add padding if needed
        const paddedString = base64String.padEnd(base64String.length + (4 - base64String.length % 4) % 4, '=');

        // Decode base64
        const binary = window.atob(paddedString);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes;
    } catch (error) {
        console.error('Base64 conversion error:', error);
        throw new Error('Failed to convert document data');
    }
};

function App() {
    const [showForm, setShowForm] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [currentStep, setCurrentStep] = useState(-1);
    const [downloadFiles, setDownloadFiles] = useState({
        analysis: null,
        outlines: null
    });
    const navigate = useNavigate();

    // Progress simulation
    useEffect(() => {
        let timeoutIds = [];

        if (processing && currentStep < 3) {
            // Schedule step increments
            timeoutIds.push(setTimeout(() => setCurrentStep(1), 10000));  // Finding competitors
            timeoutIds.push(setTimeout(() => setCurrentStep(2), 20000)); // Analyzing keywords
            timeoutIds.push(setTimeout(() => setCurrentStep(3), 25000)); // Generating outlines
        }

        // Cleanup timeouts if component unmounts or processing stops
        return () => timeoutIds.forEach(id => clearTimeout(id));
    }, [processing]);

    const handleSubmit = async (formData) => {
        setProcessing(true);
        setCurrentStep(0);

        try {
            const result = await startCrewExecution(formData);
            if (!result.docxFiles) {
                throw new Error('No document files received from server');
            }
            setDownloadFiles(result.docxFiles);
            setProcessing(false);
            navigate('/download', { state: { downloadFiles: result.docxFiles } });
        } catch (error) {
            console.error('Error:', error);
            setProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Routes>
                <Route path="/" element={
                    !showForm && !processing ? (
                        <>
                            <Hero onGetStarted={() => setShowForm(true)} />
                            <Features />
                            <ProcessFlow />
                        </>
                    ) : showForm && !processing ? (
                        <InstituteForm onSubmit={handleSubmit} onBack={() => setShowForm(false)} />
                    ) : (
                        <ProgressStatus currentStep={currentStep} />
                    )
                } />
                <Route path="/download" element={<DownloadPage />} />
                <Route path="/generate-blog" element={<BlogGenerationForm />} />
            </Routes>
        </div>
    );
}

// Wrap only the outer component with Router
function AppWrapper() {
    return (
        <Router>
            <App />
        </Router>
    );
}

export default AppWrapper;
