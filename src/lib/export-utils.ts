import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportToExcel = (data: any[], fileName: string) => {
  const XLSX = require('xlsx');
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

export const exportToPDF = async (headers: string[], data: any[][], fileName: string, title: string) => {
  const doc = new jsPDF();
  
  // Try to add logo - with multiple fallback strategies
  let logoAdded = false;
  let logoWidth = 25;
  let logoHeight = 25;
  
  // Strategy 1: Try to fetch from the assets path
  try {
    const logoPath = '/assets/images/app_logo.png';
    const response = await fetch(logoPath);
    if (response.ok) {
      const logoData = await response.arrayBuffer();
      const base64 = Buffer.from(logoData).toString('base64');
      // Center the logo - calculate x position based on page width
      const pageWidth = doc.internal.pageSize.getWidth();
      const logoX = (pageWidth - logoWidth) / 2;
      doc.addImage(base64, 'PNG', logoX, 10, logoWidth, logoHeight);
      logoAdded = true;
      console.log('Logo added from assets path (centered)');
    }
  } catch (error) {
    console.log('Could not load logo from assets path:', error.message);
  }
  
  // Strategy 2: Try alternative paths if first failed
  if (!logoAdded) {
    const alternativePaths = [
      '/app_logo.png',
      '/logo.png',
      '/assets/images/logo.png'
    ];
    
    for (const path of alternativePaths) {
      try {
        const response = await fetch(path);
        if (response.ok) {
          const logoData = await response.arrayBuffer();
          const base64 = Buffer.from(logoData).toString('base64');
          // Center the logo
          const pageWidth = doc.internal.pageSize.getWidth();
          const logoX = (pageWidth - logoWidth) / 2;
          doc.addImage(base64, 'PNG', logoX, 10, logoWidth, logoHeight);
          logoAdded = true;
          console.log(`Logo added from alternative path: ${path} (centered)`);
          break;
        }
      } catch (error) {
        console.log(`Could not load logo from ${path}:`, error.message);
      }
    }
  }
  
  // Strategy 3: Add centered text-based logo if image fails
  if (!logoAdded) {
    doc.setFontSize(16);
    doc.setTextColor(41, 128, 185); // Blue color
    // Center the text
    const pageWidth = doc.internal.pageSize.getWidth();
    const textWidth = doc.getTextWidth('HHS Welfare');
    const textX = (pageWidth - textWidth) / 2;
    doc.text('HHS Welfare', textX, 20);
    console.log('Added centered text-based logo');
  }
  
  // Adjust title position
  const titleY = logoAdded ? 40 : 30;
  const dateY = titleY + 8;
  
  // Add centered title
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0); // Black color
  const titleWidth = doc.getTextWidth(title);
  const titleX = (doc.internal.pageSize.getWidth() - titleWidth) / 2;
  doc.text(title, titleX, titleY);
  
  // Add centered date
  doc.setFontSize(11);
  doc.setTextColor(100, 100, 100); // Gray color
  const dateText = `Generated on ${new Date().toLocaleDateString()}`;
  const dateWidth = doc.getTextWidth(dateText);
  const dateX = (doc.internal.pageSize.getWidth() - dateWidth) / 2;
  doc.text(dateText, dateX, dateY);
  
  autoTable(doc, {
    head: [headers],
    body: data,
    startY: dateY + 10,
    styles: { fontSize: 8 },
    headStyles: { fillStyle: [41, 128, 185], textColor: 255 },
  });
  
  doc.save(`${fileName}.pdf`);
};
