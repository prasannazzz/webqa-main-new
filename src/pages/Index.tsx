import Header from "../components/Header";
import FileUpload from "../components/FileUpload";
import StatsCards from "../components/StatsCards";
import ChartsSection from "../components/ChartsSection";
import SearchFilter from "../components/SearchFilter";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* File Upload Section */}
        <FileUpload />
        
        {/* Statistics Cards */}
        <StatsCards />
        
        {/* Charts Section */}
        <ChartsSection />
        
        {/* Search and Filter Section */}
        <SearchFilter />
      </main>
    </div>
  );
};

export default Index;
