'use client';

import React, { useState } from 'react';
import { Download, FileText, Table as TableIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ExportButtonProps {
  data: any[];
  headers: string[];
  pdfData: any[][];
  fileName: string;
  title: string;
}

export default function ExportButton({ data, headers, pdfData, fileName, title }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      const { exportToExcel } = await import('@/lib/export-utils');
      exportToExcel(data, fileName);
      toast.success('Excel report exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export Excel report');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      const { exportToPDF } = await import('@/lib/export-utils');
      exportToPDF(headers, pdfData, fileName, title);
      toast.success('PDF report exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export PDF report');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handleExportExcel}
        disabled={isExporting || data.length === 0}
        className="flex items-center gap-2 text-sm font-medium text-green-600 hover:text-green-700 px-3 py-2 rounded-lg hover:bg-green-50 transition-colors disabled:opacity-50"
      >
        {isExporting ? <Loader2 size={16} className="animate-spin" /> : <TableIcon size={16} />}
        Excel
      </button>
      <button
        onClick={handleExportPDF}
        disabled={isExporting || pdfData.length === 0}
        className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
      >
        {isExporting ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
        PDF
      </button>
    </div>
  );
}
