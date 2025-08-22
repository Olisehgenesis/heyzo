import Navigation from './components/Navigation';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            HeyZo
          </h1>
          <p className="text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            A revolutionary decentralized reward system built on the Celo blockchain. 
            Users earn tokens daily, build streaks, and get boosted rewards while admins 
            manage pools and distributions seamlessly.
          </p>
        </div>

        {/* Main Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-20">
          <Link
            href="/user"
            className="group bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-6 px-12 rounded-2xl text-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-2xl"
          >
            <div className="flex items-center justify-center space-x-3">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>User Dashboard</span>
            </div>
            <p className="text-blue-100 text-sm mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              Claim rewards & build streaks
            </p>
          </Link>
          
          <Link
            href="/admin"
            className="group bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-6 px-12 rounded-2xl text-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-2xl"
          >
            <div className="flex items-center justify-center space-x-3">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Admin Panel</span>
            </div>
            <p className="text-purple-100 text-sm mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              Manage pools & distributions
            </p>
          </Link>
        </div>

        {/* App Features */}
        <div className="bg-white rounded-2xl shadow-xl p-12 mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">What is HeyZo?</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">For Users</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start space-x-3">
                  <svg className="w-6 h-6 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Connect MetaMask wallet to Celo network</span>
                </li>
                <li className="flex items-start space-x-3">
                  <svg className="w-6 h-6 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Claim tokens daily from available pools</span>
                </li>
                <li className="flex items-start space-x-3">
                  <svg className="w-6 h-6 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Build streaks for boosted rewards</span>
                </li>
                <li className="flex items-start space-x-3">
                  <svg className="w-6 h-6 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>View real-time pool information</span>
                </li>
                <li className="flex items-start space-x-3">
                  <svg className="w-6 h-6 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Track claim cooldowns and streaks</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">For Admins</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start space-x-3">
                  <svg className="w-6 h-6 text-purple-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Create and manage token pools</span>
                </li>
                <li className="flex items-start space-x-3">
                  <svg className="w-6 h-6 text-purple-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Set distribution amounts and limits</span>
                </li>
                <li className="flex items-start space-x-3">
                  <svg className="w-6 h-6 text-purple-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Send tokens directly to users</span>
                </li>
                <li className="flex items-start space-x-3">
                  <svg className="w-6 h-6 text-purple-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Withdraw funds from pools</span>
                </li>
                <li className="flex items-start space-x-3">
                  <svg className="w-6 h-6 text-purple-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Monitor pool balances and usage</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-2xl shadow-xl p-12 mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-3xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Connect & Explore</h3>
              <p className="text-gray-600 leading-relaxed">
                Connect your MetaMask wallet to the Celo network and explore available token pools. 
                View pool balances, claim limits, and your current streak status.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-3xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Claim Daily</h3>
              <p className="text-gray-600 leading-relaxed">
                Claim tokens from pools every day within the cooldown period. 
                Each claim resets your timer and potentially increases your streak.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-3xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Build & Earn</h3>
              <p className="text-gray-600 leading-relaxed">
                Maintain daily claims to build streaks. Longer streaks unlock boosted rewards, 
                with +10% bonus for every 10 consecutive days of claiming.
              </p>
            </div>
          </div>
        </div>

        {/* Technology Stack */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl shadow-xl p-12 mb-16 text-white">
          <h2 className="text-4xl font-bold mb-8 text-center">Built with Modern Tech</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="bg-blue-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">🌐</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Celo Blockchain</h3>
              <p className="text-gray-300 text-sm">Fast, low-cost transactions</p>
            </div>
            
            <div>
              <div className="bg-orange-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">🦊</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">MetaMask</h3>
              <p className="text-gray-300 text-sm">Secure wallet integration</p>
            </div>
            
            <div>
              <div className="bg-purple-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">⚡</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Viem</h3>
              <p className="text-gray-300 text-sm">Type-safe blockchain interactions</p>
            </div>
            
            <div>
              <div className="bg-green-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">⚛️</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">React + Next.js</h3>
              <p className="text-gray-300 text-sm">Modern web framework</p>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join the HeyZo ecosystem today and start earning rewards while building your streak!
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              href="/user"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 px-10 rounded-xl text-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              🚀 Start Claiming Rewards
            </Link>
            <Link
              href="/admin"
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-4 px-10 rounded-xl text-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              ⚙️ Manage System
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
