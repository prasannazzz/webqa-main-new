import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { useQAData } from "../contexts/QADataContext";

const ChartsSection = () => {
  const { getChartData } = useQAData();
  const { issueDistribution, resolutionTrends } = getChartData();

  // Convert issue distribution to include percentages for pie chart
  const totalIssues = issueDistribution.reduce((sum, item) => sum + item.count, 0);
  const issueTypeData = issueDistribution.map(item => ({
    ...item,
    percentage: totalIssues > 0 ? Math.round((item.count / totalIssues) * 100) : 0
  }));

  const trendData = resolutionTrends.map(item => ({
    month: item.month,
    issues: item.newIssues,
    resolved: item.resolved
  }));

  const COLORS = ['hsl(var(--chart-warning))', 'hsl(var(--chart-accent))', 'hsl(var(--chart-info))', 'hsl(var(--chart-primary))'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Issue Types Bar Chart */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Issue Distribution</CardTitle>
          <CardDescription>
            Breakdown of part number issues by category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={issueTypeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(var(--chart-primary))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Issue Types Pie Chart */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Issue Proportion</CardTitle>
          <CardDescription>
            Relative distribution of different issue types
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={issueTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name}: ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {issueTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Trend Analysis */}
      <Card className="shadow-sm lg:col-span-2">
        <CardHeader>
          <CardTitle>Issue Resolution Trends</CardTitle>
          <CardDescription>
            Monthly comparison of new issues vs resolved issues
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="issues" 
                stroke="hsl(var(--chart-warning))" 
                name="New Issues"
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="resolved" 
                stroke="hsl(var(--chart-secondary))" 
                name="Resolved Issues"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChartsSection;