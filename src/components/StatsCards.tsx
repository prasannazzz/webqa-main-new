import { AlertTriangle, CheckCircle, XCircle, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQAData } from "../contexts/QADataContext";

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  description: string;
}

const StatCard = ({ title, value, icon, color, description }: StatCardProps) => (
  <Card className="shadow-sm hover:shadow-md transition-shadow">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">
        {title}
      </CardTitle>
      <div className={color}>
        {icon}
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-card-foreground">{value}</div>
      <p className="text-xs text-muted-foreground mt-1">
        {description}
      </p>
    </CardContent>
  </Card>
);

const StatsCards = () => {
  const { getStats } = useQAData();
  const statsData = getStats();

  const stats = [
    {
      title: "Total Parts",
      value: statsData.totalParts,
      icon: <FileText className="h-4 w-4" />,
      color: "text-chart-primary",
      description: "Parts analyzed"
    },
    {
      title: "Missing Extensions",
      value: statsData.missingExtensions,
      icon: <AlertTriangle className="h-4 w-4" />,
      color: "text-chart-warning",
      description: "Parts without file extensions"
    },
    {
      title: "Surface Bodies",
      value: statsData.surfaceBodies,
      icon: <XCircle className="h-4 w-4" />,
      color: "text-chart-accent",
      description: "Parts with surface body issues"
    },
    {
      title: "Corrected Parts",
      value: statsData.correctedParts,
      icon: <CheckCircle className="h-4 w-4" />,
      color: "text-chart-secondary",
      description: "Issues resolved"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
};

export default StatsCards;