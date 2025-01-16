import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { runAnalysis } from '../../services/api'

export default function InstituteForm() {
    const [institutionName, setInstitutionName] = useState('')
    const [domainUrl, setDomainUrl] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        try {
            const result = await runAnalysis({
                institution_name: institutionName,
                domain_url: domainUrl.replace(/^https?:\/\//, '')
            })

            navigate('/download', {
                state: {
                    institution: institutionName,
                    domain: domainUrl,
                    analysisResult: result
                }
            })
        } catch (err) {
            console.error('Form submission error:', err)
            setError(err.message || 'Failed to start analysis')
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-xl overflow-hidden"
                >
                    <div className="p-8 sm:p-12">
                        <div className="text-center mb-8">
                            <motion.h2
                                className="text-3xl font-bold text-gray-900 mb-2"
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                Start Your Analysis
                            </motion.h2>
                            <motion.p
                                className="text-lg text-gray-600"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                Enter your institution details to begin
                            </motion.p>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg"
                            >
                                <p className="text-red-700">{error}</p>
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="relative"
                            >
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Institution Name
                                </label>
                                <div className="flex items-center">
                                    <span className="absolute left-3 text-gray-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422A12.083 12.083 0 0112 21.5a12.083 12.083 0 01-6.16-10.922L12 14z" />
                                        </svg>
                                    </span>
                                    <input
                                        type="text"
                                        value={institutionName}
                                        onChange={(e) => setInstitutionName(e.target.value)}
                                        className="w-full pl-10 px-4 py-3 rounded-lg border-2 border-gray-200
                                                 focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                                                 transition-colors bg-gray-50 hover:bg-white"
                                        placeholder="Enter institution name"
                                        required
                                    />
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="relative"
                            >
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Domain URL
                                </label>
                                <div className="flex items-center">
                                    <span className="absolute left-3 text-gray-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v16a1 1 0 01-1 1H4a1 1 0 01-1-1V4z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 11h8m-4-4v8" />
                                        </svg>
                                    </span>
                                    <input
                                        type="text"
                                        value={domainUrl}
                                        onChange={(e) => setDomainUrl(e.target.value)}
                                        className="w-full pl-10 px-4 py-3 rounded-lg border-2 border-gray-200
                                                 focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                                                 transition-colors bg-gray-50 hover:bg-white"
                                        placeholder="e.g., example.edu"
                                        required
                                    />
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                className="pt-4"
                            >
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600
                                             hover:from-indigo-700 hover:to-purple-700
                                             text-white py-3 px-4 rounded-lg
                                             focus:outline-none focus:ring-2 focus:ring-offset-2
                                             focus:ring-indigo-500 transition-all
                                             disabled:opacity-50 disabled:cursor-not-allowed
                                             shadow-lg hover:shadow-xl
                                             transform hover:-translate-y-0.5"
                                >
                                    {loading ? (
                                        <div className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Processing...
                                        </div>
                                    ) : (
                                        'Start Analysis'
                                    )}
                                </button>
                            </motion.div>
                        </form>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
