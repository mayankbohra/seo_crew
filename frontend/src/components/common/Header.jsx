import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

export default function Header() {
    const { signOut, user } = useAuth();

    return (
        <header className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-4">
                    {/* Logo/Brand */}
                    <div className="flex items-center">
                        <img
                            src="/logo.svg"
                            alt="SEO Blog Writer"
                            className="h-8 w-8 mr-3"
                        />
                        <span className="text-xl font-semibold text-gray-900">
                            SEO Blog Writer
                        </span>
                    </div>

                    {/* User Menu */}
                    <div className="flex items-center space-x-4">
                        <div className="text-sm text-gray-600">
                            {user?.email}
                        </div>
                        <motion.button
                            onClick={signOut}
                            className="inline-flex items-center px-4 py-2 border border-transparent
                                     rounded-md shadow-sm text-sm font-medium text-white
                                     bg-indigo-600 hover:bg-indigo-700 focus:outline-none
                                     focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                                     transition-colors duration-200"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 mr-2"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                />
                            </svg>
                            Sign Out
                        </motion.button>
                    </div>
                </div>
            </div>
        </header>
    );
}
