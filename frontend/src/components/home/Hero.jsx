import { motion } from 'framer-motion'

export default function Hero({ onGetStarted }) {
    return (
        <div className="text-center py-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
                SEO Content Generation Tool
            </h1>
            <p className="text-xl text-gray-600 mb-8">
                Generate SEO-optimized content for your institution
            </p>
            <div className="space-x-4">
                <button
                    onClick={onGetStarted}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg
                             hover:bg-indigo-700 transition-colors"
                >
                    Generate Analysis & Outlines
                </button>
                <button
                    onClick={() => window.location.href = '/generate-blog'}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg
                             hover:bg-green-700 transition-colors"
                >
                    Generate Blog Posts
                </button>
            </div>
        </div>
    );
}
