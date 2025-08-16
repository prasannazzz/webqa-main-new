import { Search, Filter, Download, Edit, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useQAData, PartNumber } from "../contexts/QADataContext";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";


const SearchFilter = () => {
  const { partNumbers, updatePartNumber, removePartNumber } = useQAData();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredPartNumbers = partNumbers.filter(pn => {
    const matchesSearch = pn.partNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || pn.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleMarkCorrected = (id: string) => {
    updatePartNumber(id, { status: 'corrected', issues: [] });
    toast({
      title: "Part number corrected",
      description: "Status updated successfully",
    });
  };

  const handleRemovePart = (id: string) => {
    removePartNumber(id);
    toast({
      title: "Part number removed",
      description: "Part number has been removed from the system",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "corrected":
        return "bg-chart-secondary text-white";
      case "invalid":
        return "bg-chart-warning text-white";
      default:
        return "bg-chart-accent text-white";
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Search className="h-5 w-5 text-chart-primary" />
          <span>Part Number Search</span>
        </CardTitle>
        <CardDescription>
          Search and manage part numbers from uploaded reports
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input 
              placeholder="Search part numbers..." 
              className="w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="corrected">Corrected</SelectItem>
              <SelectItem value="invalid">Invalid</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export ({filteredPartNumbers.length})
          </Button>
        </div>

        {/* Results Table */}
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-3 font-medium">Part Number</th>
                <th className="text-left p-3 font-medium">Status</th>
                <th className="text-left p-3 font-medium">Issues</th>
                <th className="text-left p-3 font-medium">Last Modified</th>
                <th className="text-left p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPartNumbers.map((part) => (
                <tr key={part.id} className="border-b hover:bg-muted/50">
                  <td className="p-3 font-mono">{part.partNumber}</td>
                  <td className="p-3">
                    <Badge className={getStatusColor(part.status)}>
                      {part.status}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {part.issues.map((issue, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {issue}
                        </Badge>
                      ))}
                      {part.issues.length === 0 && (
                        <span className="text-muted-foreground text-sm">No issues</span>
                      )}
                    </div>
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {new Date(part.lastModified).toLocaleDateString()}
                  </td>
                  <td className="p-3">
                    <div className="flex space-x-2">
                      {part.status === 'pending' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleMarkCorrected(part.id)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Mark Corrected
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleRemovePart(part.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default SearchFilter;