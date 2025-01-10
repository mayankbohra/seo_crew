import { motion } from 'framer-motion';

export default function ProgressBar({ progress }) {
    return (
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <motion.div
                className="h-full bg-indigo-600"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
            />
        </div>
    );
}
