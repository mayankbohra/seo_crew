import { motion } from 'framer-motion'

const benefits = [
    {
        title: "Save Time",
        description: "Automate content research and creation process",
        icon: "⚡"
    },
    {
        title: "Improve Rankings",
        description: "Create content optimized for search engines",
        icon: "📈"
    },
    {
        title: "Stay Competitive",
        description: "Keep track of competitor strategies and adapt quickly",
        icon: "🎯"
    }
]

export default function Benefits() {
    return (
        <section id="benefits" className="py-20">
            <div className="container mx-auto px-6">
                <h2 className="text-4xl font-bold text-center mb-12">
                    Why Choose Us
                </h2>
                <div className="grid md:grid-cols-3 gap-8">
                    {benefits.map((benefit, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.2 }}
                            className="text-center p-6"
                        >
                            <div className="text-4xl mb-4">{benefit.icon}</div>
                            <h3 className="text-xl font-semibold mb-2">
                                {benefit.title}
                            </h3>
                            <p className="text-gray-600">
                                {benefit.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
