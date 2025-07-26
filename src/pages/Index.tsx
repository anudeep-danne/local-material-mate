import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Utensils, Store, TruckIcon, Users } from "lucide-react";
import vendorHero from "@/assets/vendor-hero.jpg";
import supplierHero from "@/assets/supplier-hero.jpg";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-2">
              <Utensils className="h-8 w-8 text-vendor-primary" />
              <h1 className="text-2xl font-bold text-foreground">RawMate</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Welcome to <span className="text-vendor-primary">RawMate</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Connecting Indian street food vendors with quality suppliers for fresh ingredients and raw materials
          </p>
        </div>

        {/* Role Selection */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Vendor Card */}
          <Card className="overflow-hidden group hover:shadow-2xl transition-all duration-300 cursor-pointer" 
                onClick={() => navigate('/vendor/dashboard')}>
            <div className="aspect-video relative overflow-hidden">
              <img 
                src={vendorHero} 
                alt="Street food vendor" 
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <Store className="h-8 w-8 mb-2" />
                <h3 className="text-2xl font-bold">I'm a Vendor</h3>
                <p className="text-sm opacity-90">Find suppliers and order ingredients</p>
              </div>
            </div>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <TruckIcon className="h-4 w-4" />
                  <span>Browse products from local suppliers</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>Compare prices and quality ratings</span>
                </div>
                <Button 
                  variant="vendor" 
                  size="xl" 
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/vendor/dashboard');
                  }}
                >
                  Start as Vendor
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Supplier Card */}
          <Card className="overflow-hidden group hover:shadow-2xl transition-all duration-300 cursor-pointer"
                onClick={() => navigate('/supplier/dashboard')}>
            <div className="aspect-video relative overflow-hidden">
              <img 
                src={supplierHero} 
                alt="Supplier warehouse" 
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <Store className="h-8 w-8 mb-2" />
                <h3 className="text-2xl font-bold">I'm a Supplier</h3>
                <p className="text-sm opacity-90">Manage products and fulfill orders</p>
              </div>
            </div>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Store className="h-4 w-4" />
                  <span>List your products and ingredients</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <TruckIcon className="h-4 w-4" />
                  <span>Manage orders and delivery status</span>
                </div>
                <Button 
                  variant="supplier" 
                  size="xl" 
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/supplier/dashboard');
                  }}
                >
                  Start as Supplier
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="mt-20 text-center">
          <h3 className="text-2xl font-bold text-foreground mb-8">
            Why Choose RawMate?
          </h3>
          <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-vendor-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <Utensils className="h-8 w-8 text-vendor-primary" />
              </div>
              <h4 className="font-semibold mb-2">Quality Ingredients</h4>
              <p className="text-sm text-muted-foreground">Fresh, high-quality raw materials for authentic street food</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-supplier-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <TruckIcon className="h-8 w-8 text-supplier-primary" />
              </div>
              <h4 className="font-semibold mb-2">Fast Delivery</h4>
              <p className="text-sm text-muted-foreground">Quick and reliable delivery to keep your business running</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h4 className="font-semibold mb-2">Trusted Network</h4>
              <p className="text-sm text-muted-foreground">Connect with verified suppliers and vendors in your area</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;