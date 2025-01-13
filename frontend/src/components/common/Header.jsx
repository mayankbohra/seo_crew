import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Header() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        try {
            await signOut();
            navigate('/login');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <header className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16 sm:h-20">
                    {/* Logo and Title */}
                    <div className="flex items-center">
                        <motion.img
                            src="/logo.svg"
                            alt="SEO Blog Writer Logo"
                            className="h-8 w-8 sm:h-10 sm:w-10"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        />
                        <motion.h1
                            className="ml-2 sm:ml-3 text-lg sm:text-2xl font-bold text-gray-900 tracking-tight"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <span className="hidden xs:inline">SEO Blog Writer</span>
                            <span className="xs:hidden">SEO Writer</span>
                        </motion.h1>
                    </div>

                    {/* User Menu */}
                    {user && (
                        <div className="flex items-center space-x-4">
                            <div className="hidden sm:block">
                                <p className="text-sm text-gray-600">
                                    Welcome, <span className="font-medium text-gray-900">{user.email}</span>
                                </p>
                            </div>
                            <motion.button
                                onClick={handleSignOut}
                                className="inline-flex items-center px-3 sm:px-4 py-2 border border-transparent
                                         text-sm font-medium rounded-md text-white bg-indigo-600
                                         hover:bg-indigo-700 focus:outline-none focus:ring-2
                                         focus:ring-offset-2 focus:ring-indigo-500"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <span className="hidden sm:inline">Sign Out</span>
                                <span className="sm:hidden">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </span>
                            </motion.button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
