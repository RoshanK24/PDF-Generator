import React, { PureComponent } from "react";
import jsPdf from 'jspdf';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';

export async function generateInvoicePdf(data){
    const zip = new JSZip();
    for (let i = 1; i < data.length; i++) {
      if(data[i][0]===undefined) break;
      const doc = new jsPdf("p", "pt", "a4");

      const marginLeft = 20;
      const marginTop = 30;
      const contentWidth = doc.internal.pageSize.width - 2 * marginLeft;
      const contentHeight = doc.internal.pageSize.height - 2 * marginTop;

      doc.rect(marginLeft, marginTop, contentWidth, contentHeight);




      doc.setFont('helvetica', 'bold')
      doc.setFontSize(30);
      doc.text(" AAGYO", 30, 70);
      doc.setFontSize(9);


      let y = 100;
      doc.setFontSize(12);
      doc.text("Tax Invoice", 260, y);
      y += 40;
      doc.text("Tax Invoice on behalf of - ", 30, y);
      doc.setFontSize(9);
      y += 20;
      doc.text("Legal Entity Name :", 30, y);
      y += 15;
      doc.text("Restaurant Name :", 30, y);
      y += 15;
      doc.text("Restaurant Address : ", 30, y);
      y += 15;
      doc.text("Restaurant GSTIN :", 30, y);
      y += 15;
      doc.text("Restaurant FSSAI :", 30, y);
      y += 15;
      doc.text("Invoice No. :", 30, y);
      y += 15;
      doc.text("Invoice Date :", 30, y);

      y += 20;
      doc.text("Customer Name :", 30, y);
      y += 15;
      doc.text("Delivery Address :", 30, y);
      y += 15;
      doc.text("State name & Place of Supply :", 30, y);

      y += 20;
      doc.text("HSN Code :", 30, y);
      y += 15;
      doc.text("Service Description :", 30, y);
      doc.setFont('helvetica', 'normal')

      doc.text("ORIGINAL FOR Recipient", 240, 120);





      // doc.save(`${data[i][0]}_${data[i][2]}.pdf`);

      const fileName = `${data[i][0]}_${data[i][2]}.pdf`;
      const pdfDataUri = doc.output('datauristring');
      const pdfData = pdfDataUri.split(',')[1]; // Extract the base64 data from the URI
      zip.file(fileName, pdfData, { base64: true });
    }
    // Generate the zip file
    const content = await zip.generateAsync({ type: 'blob' });

    // Download the zip file
    const zipFileName = 'pdf_files.zip';
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(content);
    downloadLink.download = zipFileName;
    downloadLink.click();
  }