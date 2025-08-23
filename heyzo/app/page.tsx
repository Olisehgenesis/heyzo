import Navigation from './components/Navigation';
import Link from 'next/link';
import { 
  User, 
  Shield, 
  CheckCircle, 
  Zap, 
  Globe, 
  Wallet, 
  Code, 
  Rocket,
  Settings,
  TrendingUp,
  Calendar,
  Star
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl mb-8 shadow-2xl">
            <Zap className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-6xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
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
            className="group bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-6 px-12 rounded-2xl text-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-blue-500/25"
          >
            <div className="flex items-center justify-center space-x-3">
              <User className="w-8 h-8" />
              <span>User Dashboard</span>
            </div>
            <p className="text-blue-100 text-sm mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              Claim rewards & build streaks
            </p>
          </Link>
          
          <Link
            href="/admin"
            className="group bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-6 px-12 rounded-2xl text-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-purple-500/25"
          >
            <div className="flex items-center justify-center space-x-3">
              <Shield className="w-8 h-8" />
              <span>Admin Panel</span>
            </div>
            <p className="text-purple-100 text-sm mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              Manage pools & distributions
            </p>
          </Link>
        </div>

        {/* App Features */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-12 mb-16 border border-white/20">
          <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">What is HeyZo?</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                <User className="w-6 h-6 text-blue-600 mr-3" />
                For Users
              </h3>
              <ul className="space-y-4 text-gray-600">
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Connect MetaMask wallet to Celo network</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Claim tokens daily from available pools</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Build streaks for boosted rewards</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>View real-time pool information</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Donate to pools to support the community</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Track claim cooldowns and streaks</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                <Shield className="w-6 h-6 text-purple-600 mr-3" />
                For Admins
              </h3>
              <ul className="space-y-4 text-gray-600">
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-purple-500 mt-0.5 flex-shrink-0" />
                  <span>Create and manage token pools</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-purple-500 mt-0.5 flex-shrink-0" />
                  <span>Set distribution amounts and limits</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-purple-500 mt-0.5 flex-shrink-0" />
                  <span>Send tokens directly to users</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-purple-500 mt-0.5 flex-shrink-0" />
                  <span>Fund pools to increase rewards</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-purple-500 mt-0.5 flex-shrink-0" />
                  <span>Withdraw funds from pools</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-purple-500 mt-0.5 flex-shrink-0" />
                  <span>Monitor pool balances and usage</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-12 mb-16 border border-white/20">
          <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300">
                <TrendingUp className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Connect & Explore</h3>
              <p className="text-gray-600 leading-relaxed">
                Connect your MetaMask wallet to the Celo network and explore available token pools. 
                View pool balances, claim limits, and your current streak status.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300">
                <Calendar className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Claim Daily</h3>
              <p className="text-gray-600 leading-relaxed">
                Claim tokens from pools every day within the cooldown period. 
                Each claim resets your timer and potentially increases your streak.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300">
                <Star className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Build & Earn</h3>
              <p className="text-gray-600 leading-relaxed">
                Maintain daily claims to build streaks. Longer streaks unlock boosted rewards, 
                with +10% bonus for every 10 consecutive days of claiming. Users can also donate 
                to pools to support the community and increase available rewards.
              </p>
            </div>
          </div>
        </div>

        {/* Technology Stack */}
        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-3xl shadow-2xl p-12 mb-16 text-white border border-gray-700/50">
          <h2 className="text-4xl font-bold mb-8 text-center">Built with Modern Tech</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="group">
              <div className="bg-blue-600/20 border border-blue-500/30 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-600/30 transition-all duration-300">
                <Globe className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Celo Blockchain</h3>
              <p className="text-gray-300 text-sm">Fast, low-cost transactions</p>
            </div>
            
            <div className="group">
              <div className="bg-orange-600/20 border border-orange-500/30 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-600/30 transition-all duration-300">
                <Wallet className="w-8 h-8 text-orange-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">MetaMask</h3>
              <p className="text-gray-300 text-sm">Secure wallet integration</p>
            </div>
            
            <div className="group">
              <div className="bg-purple-600/20 border border-purple-500/30 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-600/30 transition-all duration-300">
                <Zap className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Viem</h3>
              <p className="text-gray-300 text-sm">Type-safe blockchain interactions</p>
            </div>
            
            <div className="group">
              <div className="bg-green-600/20 border border-green-500/30 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:bg-green-600/30 transition-all duration-300">
                <Code className="w-8 h-8 text-green-400" />
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
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 px-10 rounded-xl text-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25 flex items-center justify-center space-x-2"
            >
              <Rocket className="w-5 h-5" />
              <span>Start Claiming Rewards</span>
            </Link>
            <Link
              href="/admin"
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-4 px-10 rounded-xl text-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-purple-500/25 flex items-center justify-center space-x-2"
            >
              <Settings className="w-5 h-5" />
              <span>Manage System</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
