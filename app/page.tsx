'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const [username, setUsername] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setIsLoggedIn(true);
      setUsername(storedUsername);
    }
  }, []);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      localStorage.setItem('username', username.trim());
      setIsLoggedIn(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('username');
    setIsLoggedIn(false);
    setUsername('');
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Hackathon Ideas Platform
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Share innovative ideas, form teams, and bring your hackathon projects to life
          </p>
        </div>

        {!isLoggedIn ? (
          /* Registration Form */
          <div className="max-w-md mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
              <h2 className="text-2xl font-bold mb-6 text-center">Get Started</h2>
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium mb-2">
                    Choose a Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder="Enter your username"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-900 text-lg"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition-all text-lg"
                >
                  Continue
                </button>
              </form>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 text-center">
                No password required - just pick a unique username
              </p>
            </div>
          </div>
        ) : (
          /* Dashboard for Logged In Users */
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 mb-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-3xl font-bold">Welcome back, {username}!</h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Ready to explore ideas and hackathons?
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mt-8">
                {/* Ideas Card */}
                <button
                  onClick={() => router.push('/ideas')}
                  className="group bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-xl p-6 text-left hover:shadow-xl transition-all transform hover:-translate-y-1"
                >
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-2xl">
                      💡
                    </div>
                    <h3 className="text-2xl font-bold ml-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      Browse Ideas
                    </h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">
                    Discover innovative hackathon ideas, vote on your favorites, and share your own creative concepts
                  </p>
                  <div className="mt-4 text-blue-600 dark:text-blue-400 font-semibold flex items-center">
                    Explore Ideas
                    <span className="ml-2 transform group-hover:translate-x-2 transition-transform">→</span>
                  </div>
                </button>

                {/* Hackathons Card */}
                <button
                  onClick={() => router.push('/hackathons')}
                  className="group bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 rounded-xl p-6 text-left hover:shadow-xl transition-all transform hover:-translate-y-1"
                >
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center text-2xl">
                      🚀
                    </div>
                    <h3 className="text-2xl font-bold ml-4 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      Hackathons
                    </h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">
                    Join or create hackathons, form teams with other participants, and turn ideas into reality
                  </p>
                  <div className="mt-4 text-purple-600 dark:text-purple-400 font-semibold flex items-center">
                    View Hackathons
                    <span className="ml-2 transform group-hover:translate-x-2 transition-transform">→</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Features Section */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center">
                <div className="text-4xl mb-3">📝</div>
                <h4 className="font-bold mb-2">Share Ideas</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Post your hackathon ideas and get feedback from the community
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center">
                <div className="text-4xl mb-3">👥</div>
                <h4 className="font-bold mb-2">Form Teams</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Connect with others and build teams around the best ideas
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center">
                <div className="text-4xl mb-3">🏆</div>
                <h4 className="font-bold mb-2">Compete</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Participate in hackathons and showcase your projects
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
