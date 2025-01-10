import { motion } from 'framer-motion'

const steps = [
    {
        title: "Extracting user data...",
        description: "Gathering information about your institution",
        icon: "📊"
    },
    {
        title: "Finding competitors...",
        description: "Identifying top competitors in your space",
        icon: "🔍"
    },
    {
        title: "Analyzing competitor keywords...",
        description: "Discovering high-value keyword opportunities",
        icon: "📈"
    },
    {
        title: "Generating blog outlines...",
        description: "Creating strategic content plans",
        icon: "✍️"
    },
    {
        title: "Converting documents to Word format...",
        description: "Preparing downloadable files",
        icon: "📄"
    }
]

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
                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.2 }}
                            className={`flex items-start mb-8 last:mb-0 ${
                                index <= currentStep ? 'opacity-100' : 'opacity-50'
                            }`}
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
                                             text-xl shadow-md"
                                >
                                    <span>{step.icon}</span>
                                </motion.div>
                                {index < steps.length - 1 && (
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
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: "100%" }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="h-1 bg-indigo-500 mt-2 rounded-full"
                                    />
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Loading Message */}
                <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-center mt-8 text-indigo-600 font-medium"
                >
                    Processing step {currentStep + 1} of {steps.length}...
                </motion.div>
            </motion.div>
        </div>
    )
}
