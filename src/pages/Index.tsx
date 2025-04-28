import { useState, useEffect } from "react";
import { OrgSwitcher } from "@/components/OrgSwitcher";
import { PlantOperationCard } from "@/components/PlantOperationCard";
import { toast } from "@/components/ui/use-toast";
import { CreatePlantModal } from "@/components/modals/CreatePlantModal";

// Store generated QR codes to check for uniqueness
const generatedQRCodes = new Set<string>();

// Default organization that should always have full access
const DEFAULT_ORG_ID = "Pittaluga";  // Updated to capital P for consistency
const DEFAULT_ORG_NAME = "Pittaluga & fratelli";

// Organization interface
interface Organization {
  id: string;
  name: string;
  type?: string; // Added type field
  fullAccess: boolean;
}

const Index = () => {
  const [currentOrg, setCurrentOrg] = useState(DEFAULT_ORG_ID);
  const [createPlantModalOpen, setCreatePlantModalOpen] = useState(false);
  const [generatedQRCode, setGeneratedQRCode] = useState("");
  const [organizations, setOrganizations] = useState<Organization[]>([
    { id: DEFAULT_ORG_ID, name: DEFAULT_ORG_NAME, type: 'producer', fullAccess: true },
    { id: "supermarket", name: "Supermarket", type: 'retailer', fullAccess: false },
  ]);
  const [isFullAccess, setIsFullAccess] = useState(true);

  // Fetch organizations and determine access rights
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const response = await fetch('http://localhost:8090/api/organizations');
        
        if (!response.ok) {
          throw new Error('Failed to fetch organizations');
        }
        
        let data = await response.json();
        
        // Set access based on organization type and handle special cases
        data = data.map((org: Organization) => {
          // Special case: Pittaluga always has full access
          if (org.id.toLowerCase() === DEFAULT_ORG_ID.toLowerCase() || 
              org.name.toLowerCase().includes('pittaluga')) {
            return { ...org, id: DEFAULT_ORG_ID, fullAccess: true, type: org.type || 'producer' };
          }
          
          // Set access based on organization type: producer = full access, retailer = limited access
          if (org.type) {
            const isFullAccess = org.type.toLowerCase() === 'producer';
            return { ...org, fullAccess: isFullAccess };
          }
          
          return org;
        });
        
        setOrganizations(data);
      } catch (error) {
        console.error('Error fetching organizations:', error);
        // Keep default organizations
      }
    };

    fetchOrganizations();
  }, []);

  // Update access rights when the current organization changes
  useEffect(() => {
    const currentOrgData = organizations.find(org => org.id === currentOrg);
    // DEFAULT_ORG always has full access, and fall back to true if org not found
    setIsFullAccess(currentOrgData ? currentOrgData.fullAccess : currentOrg === DEFAULT_ORG_ID);
  }, [currentOrg, organizations]);

  // Function to get the full organization name from its ID
  const getOrgNameById = (orgId: string): string => {
    const org = organizations.find(org => org.id === orgId);
    return org ? org.name : orgId;
  };

  // Function to generate a random 5-digit QR code
  const generateUniqueQRCode = (): string => {
    let qrCode: string;
    do {
      // Generate a random 5-digit number
      const randomNum = Math.floor(10000 + Math.random() * 90000);
      qrCode = randomNum.toString();
    } while (generatedQRCodes.has(qrCode));
    
    // Store the new code for future uniqueness checks
    generatedQRCodes.add(qrCode);
    return qrCode;
  };

  const handleOperation = async (operation: string) => {
    toast({
      title: "Operation Triggered",
      description: `${operation} operation was triggered.`,
    });

    // Open the modal for Create Plant Tracking
    if (operation === "Create Plant Tracking") {
      // Generate a unique QR code
      const newQRCode = generateUniqueQRCode();
      setGeneratedQRCode(newQRCode);
      setCreatePlantModalOpen(true);
      return;
    }

    // Handle the Get Plant History operation
    if (operation === "Get Plant History") {
      try {
        const response = await fetch('http://localhost:8090/api/basil');
        if (!response.ok) {
          throw new Error('Failed to fetch basil records');
        }
        const basilRecords = await response.json();
        console.log("All Basil Records:", basilRecords);
        
        toast({
          title: "Basil Records Retrieved",
          description: `Found ${basilRecords.length} basil records. Check console for details.`,
        });
      } catch (error) {
        console.error("Error fetching basil records:", error);
        toast({
          title: "Error",
          description: `Failed to fetch basil records: ${(error as Error).message}`,
          variant: "destructive",
        });
      }
    }
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

      {/* Modal for creating plant tracking */}
      <CreatePlantModal 
        open={createPlantModalOpen} 
        onOpenChange={setCreatePlantModalOpen} 
        currentOrg={currentOrg}
        qrCode={generatedQRCode}
      />
    </div>
  );
};

export default Index;
