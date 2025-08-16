import { Upload, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQAData } from "../contexts/QADataContext";

const Header = () => {
  const { loadSampleData } = useQAData();

  return (
    <header className="bg-card border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="bg-primary p-2 rounded-lg">
              <Upload className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-card-foreground">
                SolidWorks QA Portal
              </h1>
              <p className="text-sm text-muted-foreground">
                Part Number Analysis & Tracking
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={loadSampleData}
              className="flex items-center gap-2"
            >
              <Database className="h-4 w-4" />
              Load Sample Data
            </Button>
            <div className="text-sm text-muted-foreground">
              Track • Analyze • Improve
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;