import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase, QA_BUCKET } from '@/lib/supabaseClient';

export interface PartNumber {
  id: string;
  partNumber: string;
  status: 'pending' | 'corrected' | 'invalid';
  issues: string[];
  lastModified: string;
  reportDate: string;
}

export interface QAReport {
  id: string;
  filename: string;
  uploadDate: string;
  partNumbers: PartNumber[];
}

interface QADataContextType {
  reports: QAReport[];
  partNumbers: PartNumber[];
  addReport: (report: QAReport) => void;
  updatePartNumber: (id: string, updates: Partial<PartNumber>) => void;
  removePartNumber: (id: string) => void;
  getStats: () => {
    totalParts: number;
    missingExtensions: number;
    surfaceBodies: number;
    correctedParts: number;
    invalidParts: number;
  };
  getChartData: () => {
    issueDistribution: Array<{ name: string; count: number }>;
    resolutionTrends: Array<{ month: string; newIssues: number; resolved: number }>;
  };
}

const QADataContext = createContext<QADataContextType | undefined>(undefined);

export const useQAData = () => {
  const context = useContext(QADataContext);
  if (!context) {
    throw new Error('useQAData must be used within a QADataProvider');
  }
  return context;
};

export const QADataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [reports, setReports] = useState<QAReport[]>([]);
  const [partNumbers, setPartNumbers] = useState<PartNumber[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedReports = localStorage.getItem('qaReports');
    const savedPartNumbers = localStorage.getItem('qaPartNumbers');
    
    if (savedReports) {
      setReports(JSON.parse(savedReports));
    }
    if (savedPartNumbers) {
      setPartNumbers(JSON.parse(savedPartNumbers));
    }
  }, []);

  // Load state from Supabase Storage if available (overrides local state)
  useEffect(() => {
    const loadFromSupabase = async () => {
      if (!supabase) return;
      try {
        const { data, error } = await supabase.storage.from(QA_BUCKET).download('state.json');
        if (error) throw error;
        const text = await data.text();
        const parsed = JSON.parse(text) as { reports: QAReport[]; partNumbers: PartNumber[] };
        setReports(parsed.reports ?? []);
        setPartNumbers(parsed.partNumbers ?? []);
        // keep localStorage in sync for offline fallback
        localStorage.setItem('qaReports', JSON.stringify(parsed.reports ?? []));
        localStorage.setItem('qaPartNumbers', JSON.stringify(parsed.partNumbers ?? []));
      } catch (e) {
        // If remote state not found, keep using local data. It will be migrated on first save.
      }
    };
    loadFromSupabase();
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('qaReports', JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
    localStorage.setItem('qaPartNumbers', JSON.stringify(partNumbers));
  }, [partNumbers]);

  // Persist full state to Supabase Storage (state.json)
  const supabaseWarnedRef = useRef(false);
  useEffect(() => {
    const persist = async () => {
      if (!supabase) return;
      try {
        const payload = { reports, partNumbers };
        const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
        await supabase.storage.from(QA_BUCKET).upload('state.json', blob, {
          cacheControl: '3600',
          upsert: true,
          contentType: 'application/json'
        });
      } catch (err) {
        if (!supabaseWarnedRef.current) {
          console.warn('Failed to persist state to Supabase. Ensure the qa-reports bucket exists and public upload is allowed.', err);
          supabaseWarnedRef.current = true;
        }
      }
    };
    persist();
  }, [reports, partNumbers]);

  const addReport = (report: QAReport) => {
    setReports(prev => [...prev, report]);
    setPartNumbers(prev => [...prev, ...report.partNumbers]);
  };

  const updatePartNumber = (id: string, updates: Partial<PartNumber>) => {
    setPartNumbers(prev => prev.map(pn => 
      pn.id === id ? { ...pn, ...updates, lastModified: new Date().toISOString() } : pn
    ));
  };

  const removePartNumber = (id: string) => {
    setPartNumbers(prev => prev.filter(pn => pn.id !== id));
  };

  const getStats = () => {
    const totalParts = partNumbers.length;
    const missingExtensions = partNumbers.filter(pn => 
      pn.issues.includes('Missing Extension')
    ).length;
    const surfaceBodies = partNumbers.filter(pn => 
      pn.issues.includes('Surface Body')
    ).length;
    const correctedParts = partNumbers.filter(pn => 
      pn.status === 'corrected'
    ).length;
    const invalidParts = partNumbers.filter(pn => 
      pn.status === 'invalid'
    ).length;

    return {
      totalParts,
      missingExtensions,
      surfaceBodies,
      correctedParts,
      invalidParts
    };
  };

  const getChartData = () => {
    const issueDistribution = [
      { name: 'Missing Extension', count: partNumbers.filter(pn => pn.issues.includes('Missing Extension')).length },
      { name: 'Surface Body', count: partNumbers.filter(pn => pn.issues.includes('Surface Body')).length },
      { name: 'Invalid Format', count: partNumbers.filter(pn => pn.issues.includes('Invalid Format')).length },
      { name: 'Non-10-Digit', count: partNumbers.filter(pn => pn.issues.includes('Non-10-Digit')).length }
    ];

    // Group by month for trends
    const monthlyData = new Map<string, { newIssues: number; resolved: number }>();
    
    partNumbers.forEach(pn => {
      const month = new Date(pn.lastModified).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      });
      
      if (!monthlyData.has(month)) {
        monthlyData.set(month, { newIssues: 0, resolved: 0 });
      }
      
      const data = monthlyData.get(month)!;
      if (pn.status === 'corrected') {
        data.resolved++;
      } else if (pn.status === 'pending') {
        data.newIssues++;
      }
    });

    const resolutionTrends = Array.from(monthlyData.entries()).map(([month, data]) => ({
      month,
      ...data
    }));

    return {
      issueDistribution,
      resolutionTrends
    };
  };

  return (
    <QADataContext.Provider value={{
      reports,
      partNumbers,
      addReport,
      updatePartNumber,
      removePartNumber,
      getStats,
      getChartData
    }}>
      {children}
    </QADataContext.Provider>
  );
};