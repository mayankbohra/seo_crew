import { motion } from 'framer-motion'
import { progressSteps } from '../../config/progress'

export default function ProgressStatus({ currentStep }) {
    const isComplete = currentStep === progressSteps.length - 1;

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-50 py-8 px-4 sm:py-12 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl mx-auto w-full"
            >
                {/* Header */}
                <div className="text-center mb-8 sm:mb-12">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
                        {isComplete ? 'Finalizing Your Content...' : 'Generating Your Content'}
                    </h2>
                    <p className="text-base sm:text-lg text-gray-600">
                        {isComplete
                            ? 'Please wait while we prepare your content for download'
                            : 'Please wait while we analyze and create optimized content for your institution'
                        }
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
                    {progressSteps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{
                                opacity: index <= currentStep ? 1 : 0.5,
                                x: 0
                            }}
                            transition={{
                                duration: 0.5,
                                delay: index * 0.1
                            }}
                            className="flex items-start mb-6 sm:mb-8 last:mb-0"
                        >
                            {/* Step Icon */}
                            <div className="relative">
                                <motion.div
                                    initial={false}
                                    animate={{
                                        scale: index <= currentStep ? 1 : 0.8,
                                        backgroundColor: index <= currentStep ? '#4F46E5' : '#E5E7EB'
                                    }}
                                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center
                                             text-lg sm:text-xl shadow-md text-white"
                                >
                                    <span>{step.icon}</span>
                                </motion.div>
                                {index < progressSteps.length - 1 && (
                                    <div className={`absolute top-10 sm:top-12 left-1/2 w-0.5 h-6 sm:h-8 transform -translate-x-1/2
                                                    ${index < currentStep ? 'bg-indigo-500' : 'bg-gray-200'}`} />
                                )}
                            </div>

                            {/* Step Content */}
                            <div className="ml-4 sm:ml-6 flex-1">
                                <h3 className={`text-base sm:text-lg font-semibold mb-1 ${
                                    index <= currentStep ? 'text-gray-900' : 'text-gray-500'
                                }`}>
                                    {step.title}
                                </h3>
                                <p className={`text-xs sm:text-sm ${
                                    index <= currentStep ? 'text-gray-600' : 'text-gray-400'
                                }`}>
                                    {step.description}
                                </p>

                                {/* Progress Animation for Current Step */}
                                {index === currentStep && (
                                    <div className="relative mt-2">
                                        <div className="h-1 bg-gray-200 rounded-full w-full" />
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: "100%" }}
                                            transition={{
                                                duration: step.duration / 1000,
                                                ease: "linear"
                                            }}
                                            className="h-1 bg-indigo-500 rounded-full absolute top-0 left-0"
                                        />
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}

                    {/* Waiting for Backend Message */}
                    {isComplete && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="mt-6 sm:mt-8 text-center text-gray-600"
                        >
                            <div className="flex items-center justify-center space-x-2">
                                <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span className="text-sm sm:text-base">Preparing your content...</span>
                            </div>
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </div>
    )
}
