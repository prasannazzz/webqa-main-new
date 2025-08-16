import * as XLSX from 'xlsx';
import { PartNumber, QAReport } from '../contexts/QADataContext';

export interface ExcelRow {
  [key: string]: string | number | boolean | null | undefined;
}

export interface SheetData {
  sheetName: string;
  data: ExcelRow[];
  rowCount: number;
}

export const processExcelFile = async (file: File): Promise<QAReport> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const workbook = XLSX.read(arrayBuffer, { 
          type: 'array',
          codepage: 65001, // UTF-8 encoding
          cellText: false,
          cellDates: true
        });

        const partNumbers: PartNumber[] = [];
        const sheetStats = new Map<string, { totalRows: number; processedRows: number }>();
        
        // Process each sheet
        workbook.SheetNames.forEach((sheetName, sheetIndex) => {
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
            header: 1,
            raw: false,
            defval: ''
          }) as string[][];
          
          // Initialize sheet stats
          const totalRows = Math.max(0, jsonData.length - 1); // Subtract 1 for header row
          sheetStats.set(sheetName, { totalRows, processedRows: 0 });
          
          // Process each row in the sheet (skip header row)
          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            
            // Count this as a processed row regardless of content
            const stats = sheetStats.get(sheetName)!;
            stats.processedRows++;
            
            if (row && row[0]) { // Assuming part number is in first column
              const partNumber = String(row[0]).trim();
              if (partNumber) {
                const issues = analyzePartNumber(partNumber);
                const status = issues.length > 0 ? 'pending' : 'corrected';
                
                partNumbers.push({
                  id: `${Date.now()}-${sheetIndex}-${i}`,
                  partNumber,
                  status: status as 'pending' | 'corrected' | 'invalid',
                  issues,
                  lastModified: new Date().toISOString(),
                  reportDate: new Date().toISOString(),
                  sheetName
                });
              } else {
                // Create placeholder entries for empty rows to maintain sheet representation
                partNumbers.push({
                  id: `${Date.now()}-${sheetIndex}-${i}-empty`,
                  partNumber: '',
                  status: 'invalid',
                  issues: ['Empty Row'],
                  lastModified: new Date().toISOString(),
                  reportDate: new Date().toISOString(),
                  sheetName
                });
              }
            } else if (row && row.some(cell => cell && String(cell).trim())) {
              // Row has some data but no part number in first column
              partNumbers.push({
                id: `${Date.now()}-${sheetIndex}-${i}-nopart`,
                partNumber: '',
                status: 'invalid',
                issues: ['No Part Number'],
                lastModified: new Date().toISOString(),
                reportDate: new Date().toISOString(),
                sheetName
              });
            }
          }
          
          // If sheet has no data rows, create a placeholder entry
          if (totalRows === 0) {
            partNumbers.push({
              id: `${Date.now()}-${sheetIndex}-empty-sheet`,
              partNumber: '',
              status: 'invalid',
              issues: ['Empty Sheet'],
              lastModified: new Date().toISOString(),
              reportDate: new Date().toISOString(),
              sheetName
            });
          }
        });
        
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
  
  // Check for incorrect naming convention (should start with specific patterns)
  if (partNumber && !partNumber.match(/^(PN|PART|ASM|DWG)/i)) {
    issues.push('Incorrect Naming');
  }
  
  // Simulate surface body detection (this would need real SolidWorks integration)
  if (Math.random() < 0.1) { // 10% chance for demo purposes
    issues.push('Surface Body');
  }
  
  return issues;
};