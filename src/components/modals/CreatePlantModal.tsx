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
  type?: string; // Added type field
  fullAccess: boolean;
}

// Function to get the full organization name from its ID using API data
const useOrgNameById = (orgId: string) => {
  const [orgName, setOrgName] = useState<string>(orgId);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchOrgName = async () => {
      try {
        // Add timeout to prevent infinite loading if server is down
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timed out')), 5000)
        );
        
        const fetchPromise = fetch('http://localhost:8090/api/organizations');
        
        // Race between fetch and timeout
        const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;
        
        if (!response.ok) {
          throw new Error('Failed to fetch organizations');
        }
        
        const organizations: Organization[] = await response.json();
        const org = organizations.find(org => org.id === orgId);
        if (org) {
          setOrgName(org.name);
        } else {
          // If organization not found, use the ID as fallback
          console.warn(`Organization with ID ${orgId} not found`);
          setOrgName(orgId);
        }
      } catch (error) {
        console.error('Error fetching organization name:', error);
        // Set a fallback name to prevent UI issues
        setOrgName(orgId);
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
  currentOrg: Organization; // Changed from string to Organization
  qrCode: string;
}

// Owner data interface
interface Owner {
  orgId: string;
  user: string;  // Changed from 'name' to 'user' to match the required format
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
  _id?: string;
  rev?: string;
  qrCode: string;
  creationTimestamp: number;
  station: string;  // Changed from 'origin' to 'station'
  currentStatus: string;
  temperature: string;
  humidity: string;
  currentGps: string;
  currentOwner: Owner;
  transportHistory: TransportRecord[];
  location: string;
  _version?: string;
}

export function CreatePlantModal({ open, onOpenChange, currentOrg, qrCode }: CreatePlantModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State for status options loaded from API
  const [statusOptions, setStatusOptions] = useState<string[]>([]);
  const [isLoadingStatuses, setIsLoadingStatuses] = useState(true);
  
  // State for station types loaded from API
  const [stationTypes, setStationTypes] = useState<string[]>([]);
  const [isLoadingStations, setIsLoadingStations] = useState(true);
  
  // Initialize form data based on the schema
  const [formData, setFormData] = useState<PlantData>({
    qrCode: qrCode,
    creationTimestamp: Date.now(),
    station: "greenhouse", // Default to "greenhouse"
    currentStatus: "Created", 
    temperature: "",
    humidity: "",
    currentGps: "",
    currentOwner: {
      orgId: currentOrg.id,
      user: currentOrg.name
    },
    transportHistory: [],
    location: ""
  });

  // Fetch station types from API
  useEffect(() => {
    const fetchStationTypes = async () => {
      try {
        setIsLoadingStations(true);
        
        // Add timeout to prevent infinite loading if server is down
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timed out')), 5000)
        );
        
        const fetchPromise = fetch('http://localhost:8090/api/station-types');
        
        // Race between fetch and timeout
        const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;
        
        if (!response.ok) {
          throw new Error('Failed to fetch station types');
        }
        
        const data = await response.json();
        
        // Process station types data - ensure we have string values
        const processedStationTypes = data.map((station: any) => {
          if (typeof station === 'string') {
            return station;
          } else if (typeof station === 'object' && station !== null) {
            // If it's an object, extract the name or id property
            return station.name || station.id || JSON.stringify(station);
          }
          return String(station); // Convert any other type to string
        });
        
        setStationTypes(processedStationTypes);
        
        // If greenhouse isn't in the list of station types, add it
        if (processedStationTypes.length > 0 && 
            !processedStationTypes.some(s => s.toLowerCase() === 'greenhouse')) {
          setStationTypes([...processedStationTypes, 'greenhouse']);
        } else if (processedStationTypes.length === 0) {
          // If no station types returned, use a default list
          setStationTypes(['greenhouse', 'field', 'warehouse']);
        }
        
      } catch (error) {
        console.error('Error fetching station types:', error);
        // Fallback to default station types if API fails
        setStationTypes(['greenhouse', 'field', 'warehouse']);
      } finally {
        setIsLoadingStations(false);
      }
    };

    if (open) {
      fetchStationTypes();
    }
  }, [open]);

  // Fetch status options from API
  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        setIsLoadingStatuses(true);
        
        // Add timeout to prevent infinite loading if server is down
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timed out')), 5000)
        );
        
        const fetchPromise = fetch('http://localhost:8090/api/statuses');
        
        // Race between fetch and timeout
        const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;
        
        if (!response.ok) {
          throw new Error('Failed to fetch statuses');
        }
        
        const data = await response.json();
        
        // Process status data - ensure we have string values
        // It might be coming as an array of objects with a 'name' or 'id' property
        const processedStatuses = data.map((status: any) => {
          if (typeof status === 'string') {
            return status;
          } else if (typeof status === 'object' && status !== null) {
            // If it's an object, extract the name or id property
            return status.name || status.id || JSON.stringify(status);
          }
          return String(status); // Convert any other type to string
        });
        
        setStatusOptions(processedStatuses);
        
        // Set the first status as default if available and form doesn't have a status yet
        if (processedStatuses.length > 0 && !formData.currentStatus) {
          setFormData(prev => ({ ...prev, currentStatus: processedStatuses[0] }));
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
  }, [open, formData.currentStatus]);

  // Update form data when props change (QR code or organization)
  useEffect(() => {
    if (open) {
      setFormData(prev => ({
        ...prev,
        qrCode,
        creationTimestamp: Date.now(),
        currentOwner: {
          orgId: currentOrg.id,
          user: currentOrg.name
        }
      }));
    }
  }, [qrCode, currentOrg, open]);

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
      // Create the plant payload according to the specific format required by the backend
      const plantPayload = {
        id: formData.qrCode,             // Use id instead of qrCode
        station: "greenhouse",           // Use station field as required
        currentGps: formData.currentGps, // GPS coordinates
        temperature: formData.temperature || "24", // Use default if empty
        humidity: formData.humidity || "50"        // Use default if empty
      };

      // Log what would be sent to API
      console.log("Plant data to submit:", plantPayload);

      // Make the actual API call to save the plant data
      try {
        const response = await fetch('http://localhost:8090/api/basil', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(plantPayload),
        });
        
        if (!response.ok) {
          const errorData = await response.text();
          console.error('Server error response:', errorData);
          throw new Error(`Server responded with error ${response.status}: ${errorData}`);
        }
        
        // Check if there's any content to parse
        const contentType = response.headers.get("content-type");
        let createdPlant;
        
        if (contentType && contentType.includes("application/json") && response.headers.get("content-length") !== "0") {
          try {
            createdPlant = await response.json();
            console.log("Plant successfully created:", createdPlant);
          } catch (jsonError) {
            console.warn("Response wasn't valid JSON but request succeeded:", jsonError);
            createdPlant = { message: "Plant created successfully" };
          }
        } else {
          console.log("Plant created successfully (no JSON response)");
          createdPlant = { message: "Plant created successfully" };
        }
        
        toast({
          title: "Plant Created",
          description: `Plant with ID ${formData.qrCode} has been successfully registered.`,
        });
        
        // Close modal and reset form
        onOpenChange(false);
        resetForm();
      } catch (apiError) {
        console.error("API error:", apiError);
        throw apiError; 
      }
    } catch (error) {
      console.error("Error in form submission:", error);
      toast({
        title: "Error",
        description: `Failed to create plant: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
      station: "greenhouse", // Default to "greenhouse"
      currentStatus: "Created", // Default status is now "Created"
      temperature: "", // Reset temperature
      humidity: "",    // Reset humidity
      currentGps: "",
      currentOwner: {
        orgId: currentOrg.id,
        user: currentOrg.name
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
                value={formData.currentOwner.user}
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
              <Label htmlFor="station" className="text-right">Station</Label>
              <Input
                id="station"
                name="station"
                value="Greenhouse"
                className="col-span-3 bg-gray-100"
                disabled
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
            
            {/* Status field moved to bottom and made disabled */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="currentStatus" className="text-right">Status</Label>
              <Input
                id="currentStatus"
                name="currentStatus"
                value="Created"
                className="col-span-3 bg-gray-100"
                disabled
              />
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