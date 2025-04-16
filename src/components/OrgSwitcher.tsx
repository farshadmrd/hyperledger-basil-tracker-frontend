
import { Building2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const organizations = [
  { id: "philadog", name: "Philadog & Trade", fullAccess: true },
  { id: "supermarket", name: "Supermarket", fullAccess: false },
];

interface OrgSwitcherProps {
  currentOrg: string;
  onOrgChange: (orgId: string) => void;
}

export function OrgSwitcher({ currentOrg, onOrgChange }: OrgSwitcherProps) {
  return (
    <Select defaultValue={currentOrg} onValueChange={onOrgChange}>
      <SelectTrigger className="w-[200px] bg-white">
        <Building2 className="mr-2 h-4 w-4" />
        <SelectValue placeholder="Select organization" />
      </SelectTrigger>
      <SelectContent>
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
