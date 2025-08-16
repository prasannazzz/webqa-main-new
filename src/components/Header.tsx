import { Upload, Database, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQAData } from "../contexts/QADataContext";

const Header = () => {
  const { loadSampleData, clearAllData } = useQAData();

  return (
    <header className="border-b border-white/20 shadow-lg backdrop-blur-sm" style={{background: 'var(--gradient-background)'}}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 hover:backdrop-brightness-110 transition-all duration-300">
          <div className="flex items-center space-x-3">
            <img src="/copco.jpg" alt="Atlas Copco" className="h-10 w-10 object-contain rounded" />
            <div>
              <h1 className="text-xl font-bold text-white">
                SolidWorks QA Portal
              </h1>
              <p className="text-sm text-white/80">
                Part Number Analysis & Tracking
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={loadSampleData}
              className="flex items-center gap-2 border-white/30 text-white bg-white/10 hover:bg-white/20 hover:border-white/50 transition-all duration-200 backdrop-blur-sm"
            >
              <Database className="h-4 w-4" />
              Load Sample Data
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={clearAllData}
              className="flex items-center gap-2 border-white/30 text-white bg-white/10 hover:bg-white/20 hover:border-white/50 transition-all duration-200 backdrop-blur-sm"
            >
              <Trash2 className="h-4 w-4" />
              Clear Data
            </Button>
            <div className="text-sm text-white/80">
              Track • Analyze • Improve
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;