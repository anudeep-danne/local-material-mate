import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { VendorSidebar } from "@/components/VendorSidebar";
import { VendorAccountInfo } from "@/components/VendorAccountInfo";

const AccountSettings = () => {
  return (
    <>
      {/* Header */}
      <header className="h-16 flex items-center border-b bg-card/50 backdrop-blur-sm px-4 md:px-6">
        <SidebarTrigger className="mr-4" />
        <h1 className="text-xl md:text-2xl font-semibold text-foreground">Account Settings</h1>
      </header>

      {/* Content */}
      <div className="p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4 md:space-y-6">
            {/* Page Header */}
            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">Account Information</h2>
              <p className="text-sm md:text-base text-muted-foreground">
                Manage your account details and business information.
              </p>
            </div>

            {/* Account Information Form */}
            <VendorAccountInfo />
          </div>
        </div>
      </div>
    </>
  );
};

export default AccountSettings; 