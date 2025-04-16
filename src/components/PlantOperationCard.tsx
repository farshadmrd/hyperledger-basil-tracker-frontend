
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PlantOperationCardProps {
  title: string;
  description: string;
  isDisabled?: boolean;
  onClick: () => void;
}

export function PlantOperationCard({ title, description, isDisabled, onClick }: PlantOperationCardProps) {
  return (
    <Card className={`${isDisabled ? 'opacity-50' : ''}`}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={onClick}
          disabled={isDisabled}
          className="w-full"
        >
          Execute Operation
        </Button>
      </CardContent>
    </Card>
  );
}
