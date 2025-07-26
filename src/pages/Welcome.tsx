import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

const Welcome = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    console.log('🎉 Welcome component mounted');
  }, []);

  const handleVendorClick = () => {
    console.log('🔍 Welcome: Vendor button clicked');
    navigate('/vendor-login');
  };

  const handleSupplierClick = () => {
    console.log('🔍 Welcome: Supplier button clicked');
    navigate('/supplier-login');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="max-w-md w-full bg-card rounded-lg shadow-lg p-8 flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-4 text-center">Welcome to RawMate</h1>
        <p className="text-muted-foreground mb-8 text-center">Please select your role to continue</p>
        <div className="flex flex-col gap-4 w-full">
          <Button className="w-full text-lg py-6" onClick={handleVendorClick}>
            I'm a Vendor
          </Button>
          <Button className="w-full text-lg py-6" variant="secondary" onClick={handleSupplierClick}>
            I'm a Supplier
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Welcome; 