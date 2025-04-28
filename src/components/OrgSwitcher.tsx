import { Building2 } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Organization interface
interface Organization {
  id: string;
  name: string;
  type?: string; // Added type field
  fullAccess: boolean;
}

interface OrgSwitcherProps {
  currentOrg: string;
  onOrgChange: (orgId: string) => void;
}

// Default organization that should always have full access
const DEFAULT_ORG_ID = "Pittaluga";  // Changed to capital P for consistency
const DEFAULT_ORG_NAME = "Pittaluga & fratelli";

export function OrgSwitcher({ currentOrg, onOrgChange }: OrgSwitcherProps) {
  const [organizations, setOrganizations] = useState<Organization[]>([
    { id: DEFAULT_ORG_ID, name: DEFAULT_ORG_NAME, type: 'producer', fullAccess: true },
    { id: "supermarket", name: "Supermarket", type: 'retailer', fullAccess: false },
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrgName, setSelectedOrgName] = useState<string>(DEFAULT_ORG_NAME);

  // Helper function to get organization name by ID
  const getOrgNameById = (orgId: string): string => {
    const org = organizations.find(org => org.id === orgId);
    return org ? org.name : orgId;
  };

  // Update the selected organization name whenever currentOrg changes
  useEffect(() => {
    setSelectedOrgName(getOrgNameById(currentOrg));
  }, [currentOrg, organizations]);

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('http://localhost:8090/api/organizations');
        
        if (!response.ok) {
          throw new Error('Failed to fetch organizations');
        }
        
        let data = await response.json();
        
        // Set access permissions based on organization type and handle special cases
        data = data.map(org => {
          // Special case: Ensure Pittaluga always has full access
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
        
        // If current org is not in the fetched list or we're starting fresh, select Pittaluga & fratelli
        if (data.length > 0 && (!currentOrg || !data.some(org => org.id === currentOrg))) {
          // Find Pittaluga or the first org with full access, or just the first org
          const defaultOrg = data.find(org => org.id === DEFAULT_ORG_ID) || 
                           data.find(org => org.fullAccess) || 
                           data[0];
          onOrgChange(defaultOrg.id);
        }
        
        // Update selected organization name
        setSelectedOrgName(getOrgNameById(currentOrg));
      } catch (error) {
        console.error('Error fetching organizations:', error);
        setError('Failed to load organizations');
        
        // Fallback to default organizations already in state
        
        // Ensure we select Pittaluga on error
        if (currentOrg !== DEFAULT_ORG_ID) {
          onOrgChange(DEFAULT_ORG_ID);
        }
        
        setSelectedOrgName(DEFAULT_ORG_NAME);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrganizations();
  }, [currentOrg, onOrgChange]);

  return (
    <Select 
      value={currentOrg}
      onValueChange={onOrgChange}
      disabled={isLoading}
    >
      <SelectTrigger className="w-[200px] bg-white">
        <Building2 className="mr-2 h-4 w-4" />
        <span className="text-sm truncate">
          {isLoading ? "Loading..." : selectedOrgName}
        </span>
      </SelectTrigger>
      <SelectContent>
        {error && (
          <div className="text-red-500 p-2 text-xs">{error}</div>
        )}
        {organizations.map((org) => (
          <SelectItem key={org.id} value={org.id}>
            <div className="flex items-center">
              <span>{org.name}</span>
              {!org.fullAccess && (
                <span className="ml-2 text-xs text-muted-foreground">(Limited Access)</span>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
