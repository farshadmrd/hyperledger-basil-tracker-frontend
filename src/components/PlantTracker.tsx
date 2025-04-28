import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

interface PlantData {
  name: string;
  species: string;
  wateringFrequency: number;
}

interface PlantState {
  id: string;
  moisture: number;
  lastWatered: string;
  status: string;
}

interface BasilRecord {
  id: string;
  name: string;
  plantedDate: string;
  harvestDate: string | null;
  health: string;
  notes: string | null;
}

export default function PlantTracker() {
  const { toast } = useToast();
  const [plantData, setPlantData] = useState<PlantData>({
    name: "",
    species: "",
    wateringFrequency: 7,
  });
  const [showPlantState, setShowPlantState] = useState(false);
  const [plantId, setPlantId] = useState<string>("");
  const [showBasilRecords, setShowBasilRecords] = useState(false);

  const createPlantMutation = useMutation({
    mutationFn: async (data: PlantData) => {
      const response = await fetch('https://your-api-endpoint.com/plants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create plant');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Plant created",
        description: `${plantData.name} has been added to your tracking list`,
      });
      
      // Reset form
      setPlantData({
        name: "",
        species: "",
        wateringFrequency: 7,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create plant: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const { data: plantState, isLoading: isLoadingState, error: plantStateError, refetch } = useQuery({
    queryKey: ['plantState', plantId],
    queryFn: async () => {
      if (!plantId) return null;
      
      const response = await fetch(`https://your-api-endpoint.com/plants/${plantId}/state`);
      if (!response.ok) {
        throw new Error('Failed to get plant state');
      }
      return response.json() as Promise<PlantState>;
    },
    enabled: false, // Don't run the query automatically
  });

  const { 
    data: basilRecords, 
    isLoading: isLoadingBasil, 
    error: basilError,
    refetch: refetchBasil
  } = useQuery({
    queryKey: ['basilRecords'],
    queryFn: async () => {
      const response = await fetch('http://localhost:8090/api/basil');
      if (!response.ok) {
        throw new Error('Failed to get basil records');
      }
      return response.json() as Promise<BasilRecord[]>;
    },
    enabled: false, // Don't run the query automatically
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createPlantMutation.mutate(plantData);
  };

  const handleGetPlantState = () => {
    setShowPlantState(true);
    refetch();
  };

  const handleGetBasilRecords = () => {
    setShowBasilRecords(true);
    refetchBasil();
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Create Plant Tracking</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Plant Name</Label>
          <Input 
            id="name"
            value={plantData.name}
            onChange={(e) => setPlantData({...plantData, name: e.target.value})}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="species">Species</Label>
          <Input 
            id="species"
            value={plantData.species}
            onChange={(e) => setPlantData({...plantData, species: e.target.value})}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="watering">Watering Frequency (days)</Label>
          <Input 
            id="watering"
            type="number"
            value={plantData.wateringFrequency}
            onChange={(e) => setPlantData({...plantData, wateringFrequency: parseInt(e.target.value)})}
            min={1}
            required
          />
        </div>
        
        <Button 
          type="submit" 
          disabled={createPlantMutation.isPending}
        >
          {createPlantMutation.isPending ? "Creating..." : "Create Plant"}
        </Button>
      </form>

      <div className="mt-8 border-t pt-4">
        <h3 className="text-xl font-semibold mb-3">Get Plant State</h3>
        <div className="flex gap-3 mb-4">
          <Input
            placeholder="Enter Plant ID"
            value={plantId}
            onChange={(e) => setPlantId(e.target.value)}
          />
          <Button 
            onClick={handleGetPlantState} 
            disabled={!plantId || isLoadingState}
          >
            {isLoadingState ? "Loading..." : "Get Plant State"}
          </Button>
        </div>

        {showPlantState && (
          <div className="mt-2">
            {plantStateError && (
              <p className="text-red-500">Error: {plantStateError.message}</p>
            )}
            {plantState && (
              <div className="p-4 border rounded-md bg-gray-50">
                <h4 className="font-bold">Plant State</h4>
                <p>Moisture: {plantState.moisture}%</p>
                <p>Last Watered: {new Date(plantState.lastWatered).toLocaleDateString()}</p>
                <p>Status: {plantState.status}</p>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="mt-8 border-t pt-4">
        <h3 className="text-xl font-semibold mb-3">Basil Records</h3>
        <Button 
          onClick={handleGetBasilRecords} 
          disabled={isLoadingBasil}
          className="mb-4"
        >
          {isLoadingBasil ? "Loading..." : "Get All Basil Records"}
        </Button>

        {showBasilRecords && (
          <div className="mt-2">
            {basilError && (
              <p className="text-red-500">Error: {(basilError as Error).message}</p>
            )}
            {basilRecords && basilRecords.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-2 px-4 border-b text-left">ID</th>
                      <th className="py-2 px-4 border-b text-left">Name</th>
                      <th className="py-2 px-4 border-b text-left">Planted Date</th>
                      <th className="py-2 px-4 border-b text-left">Harvest Date</th>
                      <th className="py-2 px-4 border-b text-left">Health</th>
                      <th className="py-2 px-4 border-b text-left">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {basilRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="py-2 px-4 border-b">{record.id}</td>
                        <td className="py-2 px-4 border-b">{record.name}</td>
                        <td className="py-2 px-4 border-b">{new Date(record.plantedDate).toLocaleDateString()}</td>
                        <td className="py-2 px-4 border-b">
                          {record.harvestDate ? new Date(record.harvestDate).toLocaleDateString() : 'Not harvested'}
                        </td>
                        <td className="py-2 px-4 border-b">{record.health}</td>
                        <td className="py-2 px-4 border-b">{record.notes || 'No notes'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No basil records found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}