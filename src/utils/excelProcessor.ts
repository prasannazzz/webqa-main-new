import * as XLSX from 'xlsx';
import { PartNumber, QAReport } from '../contexts/QADataContext';

export const processExcelFile = async (file: File): Promise<QAReport> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { 
          type: 'array',
          codepage: 65001, // UTF-8 encoding
          cellText: false,
          cellDates: true
        });
        
        // Get the first worksheet
        const worksheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[worksheetName];
        
        // Convert to JSON with proper encoding
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          header: 1,
          raw: false,
          defval: ''
        }) as string[][];
        
        // Process the data to extract part numbers
        const partNumbers: PartNumber[] = [];
        
        // Skip header row and process data
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (row && row[0]) { // Assuming part number is in first column
            const partNumber = String(row[0]).trim();
            if (partNumber) {
              const issues = analyzePartNumber(partNumber);
              const status = issues.length > 0 ? 'pending' : 'corrected';
              
              partNumbers.push({
                id: `${Date.now()}-${i}`,
                partNumber,
                status: status as 'pending' | 'corrected' | 'invalid',
                issues,
                lastModified: new Date().toISOString(),
                reportDate: new Date().toISOString()
              });
            }
          }
        }
        
        const report: QAReport = {
          id: `report-${Date.now()}`,
          filename: file.name,
          uploadDate: new Date().toISOString(),
          partNumbers
        };
        
        resolve(report);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
};

const analyzePartNumber = (partNumber: string): string[] => {
  const issues: string[] = [];
  
  // Check for missing extension
  if (!partNumber.includes('.')) {
    issues.push('Missing Extension');
  }
  
  // Check for non-10-digit format (assuming part numbers should be 10 digits)
  const digitsOnly = partNumber.replace(/\D/g, '');
  if (digitsOnly.length !== 10) {
    issues.push('Non-10-Digit');
  }
  
  // Check for invalid format (allow Unicode characters)
  if (!/^[\w\u00C0-\u024F\u1E00-\u1EFF._-]+$/.test(partNumber)) {
    issues.push('Invalid Format');
  }
  
  // Simulate surface body detection (this would need real SolidWorks integration)
  if (Math.random() < 0.1) { // 10% chance for demo purposes
    issues.push('Surface Body');
  }
  
  return issues;
};