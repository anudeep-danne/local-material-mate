import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Welcome = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 px-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-gray-900">
            Welcome to <span className="text-primary">RawMate 2.0</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-lg mx-auto">
            Complete farm-to-consumer supply chain platform connecting farmers, distributors, retailers, and consumers
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link to="/farmer-login">Get Started as Farmer</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
            <Link to="/distributor-login">Get Started as Distributor</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
            <Link to="/retailer-login">Get Started as Retailer</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
            <Link to="/consumer-login">Get Started as Consumer</Link>
          </Button>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Complete Supply Chain Traceability</h2>
          <div className="flex items-center justify-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Farmer</span>
            </div>
            <span>→</span>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Distributor</span>
            </div>
            <span>→</span>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span>Retailer</span>
            </div>
            <span>→</span>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span>Consumer</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;