
import { useState } from "react";
import { OrgSwitcher } from "@/components/OrgSwitcher";
import { PlantOperationCard } from "@/components/PlantOperationCard";
import { toast } from "@/components/ui/use-toast";

const Index = () => {
  const [currentOrg, setCurrentOrg] = useState("philadog");

  const isFullAccess = currentOrg === "philadog";

  const handleOperation = (operation: string) => {
    toast({
      title: "Operation Triggered",
      description: `${operation} operation was triggered.`,
    });
  };

  const operations = [
    {
      title: "Create Plant Tracking",
      description: "Create a new plant with QR code and organization ownership",
      requiresFullAccess: false,
    },
    {
      title: "Stop Plant Tracking",
      description: "Delete plant tracking for existing QR code",
      requiresFullAccess: false,
    },
    {
      title: "Update Plant State",
      description: "Update the state and GPS of an existing plant",
      requiresFullAccess: true,
    },
    {
      title: "Get Plant State",
      description: "View the current state of a plant",
      requiresFullAccess: false,
    },
    {
      title: "Get Plant History",
      description: "View the complete history of a plant",
      requiresFullAccess: false,
    },
    {
      title: "Transfer Ownership",
      description: "Transfer plant ownership to another organization",
      requiresFullAccess: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Plant Tracking System</h1>
          <OrgSwitcher currentOrg={currentOrg} onOrgChange={setCurrentOrg} />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {operations.map((op) => (
            <PlantOperationCard
              key={op.title}
              title={op.title}
              description={op.description}
              isDisabled={op.requiresFullAccess && !isFullAccess}
              onClick={() => handleOperation(op.title)}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Index;
