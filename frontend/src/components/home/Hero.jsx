import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

export default function Hero() {
    const navigate = useNavigate()

    return (
        <div className="text-center py-16">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    SEO Content Generation Tool
                </h1>
                <p className="text-xl text-gray-600 mb-8">
                    Generate SEO-optimized content for your institution
                </p>
                <div className="space-x-4">
                    <motion.button
                        onClick={() => navigate('/form')}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-lg
                                hover:bg-indigo-700 transition-colors"
                    >
                        Generate Analysis & Outlines
                    </motion.button>
                </div>
            </motion.div>
        </div>
    )
}
