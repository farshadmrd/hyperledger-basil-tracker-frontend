import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Organization interface
interface Organization {
  id: string;
  name: string;
  fullAccess: boolean;
}

// Function to get the full organization name from its ID using API data
const useOrgNameById = (orgId: string) => {
  const [orgName, setOrgName] = useState<string>(orgId);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchOrgName = async () => {
      try {
        const response = await fetch('http://localhost:8090/api/organizations');
        if (!response.ok) {
          throw new Error('Failed to fetch organizations');
        }
        
        const organizations: Organization[] = await response.json();
        const org = organizations.find(org => org.id === orgId);
        if (org) {
          setOrgName(org.name);
        }
      } catch (error) {
        console.error('Error fetching organization name:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrgName();
  }, [orgId]);

  return { orgName, isLoading };
};

interface CreatePlantModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentOrg: string;
  qrCode: string;
}

// Owner data interface
interface Owner {
  orgId: string;
  name: string;
}

// Transport history record interface
interface TransportRecord {
  timestamp: number;
  gps: string;
  temperature: string;
  humidity: string;
  owner: Owner;
}

// Interface based on the provided schema
interface PlantData {
  qrCode: string;
  creationTimestamp: number;
  origin: string;
  currentStatus: string;
  temperature: string; // Added temperature field
  humidity: string;    // Added humidity field
  currentGps: string;
  currentOwner: Owner;
  transportHistory: TransportRecord[];
  location: string;
  id?: string;
}

export function CreatePlantModal({ open, onOpenChange, currentOrg, qrCode }: CreatePlantModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { orgName: fullOrgName, isLoading: isLoadingOrg } = useOrgNameById(currentOrg);
  
  // State for status options loaded from API
  const [statusOptions, setStatusOptions] = useState<string[]>([]);
  const [isLoadingStatuses, setIsLoadingStatuses] = useState(true);
  
  // Initialize form data based on the schema
  const [formData, setFormData] = useState<PlantData>({
    qrCode: qrCode,
    creationTimestamp: Date.now(),
    origin: "",
    currentStatus: "",
    temperature: "", // Initialize temperature
    humidity: "",    // Initialize humidity
    currentGps: "",
    currentOwner: {
      orgId: currentOrg,
      name: fullOrgName
    },
    transportHistory: [],
    location: ""
  });

  // Fetch status options from API
  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        setIsLoadingStatuses(true);
        const response = await fetch('http://localhost:8090/api/statuses');
        
        if (!response.ok) {
          throw new Error('Failed to fetch statuses');
        }
        
        const data = await response.json();
        setStatusOptions(data);
        
        // Set the first status as default if available and form doesn't have a status yet
        if (data.length > 0 && !formData.currentStatus) {
          setFormData(prev => ({ ...prev, currentStatus: data[0] }));
        }
      } catch (error) {
        console.error('Error fetching statuses:', error);
        // Fallback to default statuses if API fails
        const fallbackStatuses = ["active", "dormant", "harvested", "transit", "diseased"];
        setStatusOptions(fallbackStatuses);
        
        if (!formData.currentStatus) {
          setFormData(prev => ({ ...prev, currentStatus: fallbackStatuses[0] }));
        }
      } finally {
        setIsLoadingStatuses(false);
      }
    };

    if (open) {
      fetchStatuses();
    }
  }, [open]);

  // Update form data when props change (QR code or organization)
  useEffect(() => {
    if (open && !isLoadingOrg) {
      setFormData(prev => ({
        ...prev,
        qrCode,
        creationTimestamp: Date.now(),
        currentOwner: {
          orgId: currentOrg,
          name: fullOrgName
        }
      }));
    }
  }, [qrCode, currentOrg, open, fullOrgName, isLoadingOrg]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Handle nested properties
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent] && typeof prev[parent] === 'object' ? prev[parent] : {}),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create initial transport history entry
      const initialTransport: TransportRecord = {
        timestamp: Date.now(),
        gps: formData.currentGps,
        temperature: formData.temperature, // Use temperature from formData
        humidity: formData.humidity,       // Use humidity from formData
        owner: formData.currentOwner
      };

      // Add to transport history
      const plantPayload = {
        ...formData,
        transportHistory: [initialTransport]
      };

      // BREAKPOINT: This will pause execution when DevTools is open
      debugger;

      // Log what would be sent to API
      console.log("Plant data to submit:", plantPayload);

      // Here you would make your API call to save the plant data
      // For simulation purposes only
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: "Plant Created",
        description: `QR Code ${formData.qrCode} has been successfully registered to ${fullOrgName}.`,
      });
      
      // Close modal and reset form
      onOpenChange(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create plant. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form logic
  const resetForm = () => {
    setFormData({
      qrCode: qrCode,
      creationTimestamp: Date.now(),
      origin: "",
      currentStatus: "",
      temperature: "", // Reset temperature
      humidity: "",    // Reset humidity
      currentGps: "",
      currentOwner: {
        orgId: currentOrg,
        name: fullOrgName
      },
      transportHistory: [],
      location: ""
    });
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      onOpenChange(newOpen);
    }}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Plant Tracking</DialogTitle>
          <DialogDescription>
            Register a new plant with auto-generated QR code: {qrCode}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Owner Name field moved to the top and made disabled */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="currentOwner.name" className="text-right">Owner</Label>
              <Input
                id="currentOwner.name"
                name="currentOwner.name"
                value={isLoadingOrg ? "Loading..." : formData.currentOwner.name}
                className="col-span-3 bg-gray-100"
                disabled
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="qrCode" className="text-right">QR Code</Label>
              <Input
                id="qrCode"
                name="qrCode"
                value={formData.qrCode}
                className="col-span-3 bg-gray-100"
                placeholder="Auto-generated QR code"
                disabled
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="origin" className="text-right">Origin</Label>
              <Input
                id="origin"
                name="origin"
                value={formData.origin}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="Plant origin"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">Location</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="Current location"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="currentGps" className="text-right">GPS Coordinates</Label>
              <Input
                id="currentGps"
                name="currentGps"
                value={formData.currentGps}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="Example: 37.7749,-122.4194"
                required
              />
            </div>
            
            {/* Temperature field */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="temperature" className="text-right">Temperature</Label>
              <Input
                id="temperature"
                name="temperature"
                value={formData.temperature}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="Example: 24.5°C"
              />
            </div>
            
            {/* Humidity field */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="humidity" className="text-right">Humidity</Label>
              <Input
                id="humidity"
                name="humidity"
                value={formData.humidity}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="Example: 65%"
              />
            </div>
            
            {/* Status field moved to bottom */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="currentStatus" className="text-right">Status</Label>
              <Select
                value={formData.currentStatus}
                onValueChange={(value) => handleSelectChange("currentStatus", value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingStatuses ? (
                    <SelectItem value="">Loading...</SelectItem>
                  ) : (
                    statusOptions.map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Plant"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}