import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ProgressBar from './ProgressBar';
import KeywordSelection from '../keywords/KeywordSelection';
import { getKeywords, saveKeywords, runSeo } from '../../services/api';

export default function ProgressStatus() {
    const location = useLocation();
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [keywords, setKeywords] = useState([]);

    useEffect(() => {
        const state = location.state;
        if (!state?.institution || !state?.domain) {
            navigate('/');
            return;
        }

        // If analysis is complete, redirect to download page
        if (state.analysisResult?.markdown?.analysis) {
            navigate('/download', {
                state: {
                    ...state,
                    currentStep: 2
                }
            });
            return;
        }

        // Get keywords after analysis is complete
        const fetchKeywords = async () => {
            try {
                const result = await getKeywords();
                if (result.status === 'success') {
                    setKeywords(result.keywords);
                    setCurrentStep(2);
                }
            } catch (err) {
                setError(err.message);
            }
        };

        fetchKeywords();
    }, [location.state, navigate]);

    const handleKeywordSubmit = async (selectedKeywords) => {
        setIsLoading(true);
        setError(null);
        try {
            await saveKeywords(selectedKeywords);

            const result = await runSeo({
                institution_name: location.state.institution,
                domain_url: location.state.domain
            });

            if (result.status === 'success') {
                navigate('/download', {
                    state: {
                        ...location.state,
                        seoResult: result,
                        currentStep: 3
                    }
                });
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">
                        Content Generation Progress
                    </h1>
                    <p className="mt-2 text-lg text-gray-600">
                        Analyzing and generating content for {location.state?.institution}
                    </p>
                </div>

                <ProgressBar currentStep={currentStep} />

                {error && (
                    <div className="mt-4 p-4 bg-red-50 rounded-md">
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                {currentStep === 2 && keywords.length > 0 && (
                    <KeywordSelection
                        keywords={keywords}
                        onSubmit={handleKeywordSubmit}
                        isLoading={isLoading}
                        disabled={isLoading}
                    />
                )}
            </div>
        </div>
    );
}
