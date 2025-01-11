import { motion } from 'framer-motion'
import { progressSteps } from '../../config/progress'

export default function ProgressStatus({ currentStep }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-50 py-12 px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl mx-auto"
            >
                {/* Header */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        Generating Your Content
                    </h2>
                    <p className="text-lg text-gray-600">
                        Please wait while we analyze and create optimized content for your institution
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {progressSteps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{
                                opacity: index <= currentStep ? 1 : 0.5,
                                x: 0
                            }}
                            transition={{ delay: index * 0.2 }}
                            className={`flex items-start mb-8 last:mb-0`}
                        >
                            {/* Step Icon */}
                            <div className="relative">
                                <motion.div
                                    initial={false}
                                    animate={{
                                        scale: index <= currentStep ? 1 : 0.8,
                                        backgroundColor: index <= currentStep ? '#4F46E5' : '#E5E7EB'
                                    }}
                                    className="w-12 h-12 rounded-full flex items-center justify-center
                                             text-xl shadow-md text-white"
                                >
                                    <span>{step.icon}</span>
                                </motion.div>
                                {index < progressSteps.length - 1 && (
                                    <div className={`absolute top-12 left-1/2 w-0.5 h-8 transform -translate-x-1/2
                                                    ${index < currentStep ? 'bg-indigo-500' : 'bg-gray-200'}`} />
                                )}
                            </div>

                            {/* Step Content */}
                            <div className="ml-6 flex-1">
                                <h3 className={`text-lg font-semibold mb-1 ${
                                    index <= currentStep ? 'text-gray-900' : 'text-gray-500'
                                }`}>
                                    {step.title}
                                </h3>
                                <p className={`text-sm ${
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
                </div>
            </motion.div>
        </div>
    )
}
