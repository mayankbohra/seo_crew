import { useState } from 'react'
import { motion } from 'framer-motion'

export default function InstituteForm({ onSubmit, onBack }) {
    const [formData, setFormData] = useState({
        institution_name: '',
        domain_url: ''
    })

    const handleSubmit = (e) => {
        e.preventDefault()
        onSubmit(formData)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-50 py-8 px-4 sm:py-12 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-xl mx-auto w-full"
            >
                {/* Header Section */}
                <div className="text-center mb-8 sm:mb-12">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
                        Let's Get Started
                    </h2>
                    <p className="text-base sm:text-lg text-gray-600">
                        Enter your institution details to begin the SEO content generation process
                    </p>
                </div>

                {/* Form Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-xl shadow-xl overflow-hidden p-6 sm:p-8"
                >
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Institution Name Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Institution Name
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={formData.institution_name}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        institution_name: e.target.value
                                    }))}
                                    className="block w-full px-4 py-3 rounded-lg border-2 border-gray-200
                                             focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                                             transition-colors text-sm sm:text-base"
                                    placeholder="e.g., Jaipuria Institute of Management"
                                    required
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                    <span className="text-gray-400 hidden sm:inline">🏛️</span>
                                </div>
                            </div>
                        </div>

                        {/* Domain URL Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Domain URL
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={formData.domain_url}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        domain_url: e.target.value
                                    }))}
                                    className="block w-full px-4 py-3 rounded-lg border-2 border-gray-200
                                             focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                                             transition-colors text-sm sm:text-base"
                                    placeholder="e.g., jaipuria.ac.in"
                                    required
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                    <span className="text-gray-400 hidden sm:inline">🌐</span>
                                </div>
                            </div>
                            <p className="mt-2 text-xs sm:text-sm text-gray-500">
                                Enter domain without http:// or https://
                            </p>
                        </div>

                        {/* Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <motion.button
                                type="button"
                                onClick={onBack}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full sm:flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg
                                         hover:bg-gray-200 transition-colors font-medium text-sm sm:text-base"
                            >
                                ← Go Back
                            </motion.button>
                            <motion.button
                                type="submit"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full sm:flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg
                                         hover:bg-indigo-700 transition-colors font-medium text-sm sm:text-base"
                            >
                                Generate Content →
                            </motion.button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </div>
    )
}
