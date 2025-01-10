import { useState } from 'react'

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    return (
        <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50">
            <nav className="container mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-indigo-600">
                        SEO Content AI
                    </div>

                    <div className="hidden md:flex space-x-8">
                        <a href="#features" className="text-gray-600 hover:text-indigo-600 transition-colors">
                            Features
                        </a>
                        <a href="#process" className="text-gray-600 hover:text-indigo-600 transition-colors">
                            How it Works
                        </a>
                        <a href="#benefits" className="text-gray-600 hover:text-indigo-600 transition-colors">
                            Benefits
                        </a>
                    </div>
                </div>
            </nav>
        </header>
    )
}
