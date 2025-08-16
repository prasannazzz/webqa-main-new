import { FileSpreadsheet, FolderOpen } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQAData } from "../contexts/QADataContext";
import { processExcelFile } from "../utils/excelProcessor";
import { useState } from "react";
import { supabase, QA_BUCKET } from "@/lib/supabaseClient";

const FileUpload = () => {
  const { toast } = useToast();
  const { addReport } = useQAData();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsProcessing(true);
      try {
        toast({
          title: "Processing file...",
          description: `Analyzing ${file.name}...`,
        });

        const report = await processExcelFile(file);
        addReport(report);

        // Upload original Excel and parsed report JSON to Supabase Storage (bucket: qa-reports)
        if (supabase) {
          try {
            const folder = `${report.id}`;
            await supabase.storage.from(QA_BUCKET).upload(`${folder}/${file.name}`, file, {
              upsert: true,
              contentType: file.type || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });
            const jsonBlob = new Blob([JSON.stringify(report)], { type: 'application/json' });
            await supabase.storage.from(QA_BUCKET).upload(`${folder}/parsed.json`, jsonBlob, {
              upsert: true,
              contentType: 'application/json'
            });
          } catch (cloudErr) {
            toast({
              title: 'Cloud sync warning',
              description: 'Processed locally, but failed to sync to Supabase Storage. Check bucket permissions.',
            });
          }
        }

        toast({
          title: "File processed successfully",
          description: `Found ${report.partNumbers.length} part numbers. ${report.partNumbers.filter(pn => pn.issues.length > 0).length} issues detected.`,
        });
      } catch (error) {
        toast({
          title: "Error processing file",
          description: "Please ensure the file is a valid Excel file.",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
        // Reset the input
        event.target.value = '';
      }
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileSpreadsheet className="h-5 w-5 text-chart-primary" />
          <span>Upload QA Report</span>
        </CardTitle>
        <CardDescription>
          Upload Excel files containing part numbers and QA data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-chart-primary transition-colors">
          <img src="/copco.jpg" alt="Atlas Copco" className="h-12 w-12 mx-auto mb-4 object-contain" />
          <p className="text-muted-foreground mb-4">
            Drag and drop your Excel file here, or click to browse
          </p>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
          />
          <Button asChild className="cursor-pointer bg-primary text-white hover:bg-primary/90 border-0" disabled={isProcessing}>
            <label htmlFor="file-upload">
              {isProcessing ? "Processing..." : "Choose File"}
            </label>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FileUpload;