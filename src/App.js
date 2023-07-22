
import './App.css';
import React, { PureComponent } from "react";
import jsPdf from 'jspdf';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { generateInvoicePdf } from './invoicePdf';

export default class PdfGenerator extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      fileSelected: false
    };
  }

  handleFileChange = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      // console.log(jsonData);
      this.setState({ jsonData, fileSelected: true });
    };

    reader.readAsArrayBuffer(file);
  }

  jsPdfGenerator=(event)=>{
    event.preventDefault();
    const { jsonData } = this.state;
    // this.generatePdf(jsonData);
    generateInvoicePdf(jsonData);
    console.log(jsonData);
  }

  generatePdf = async (data) => {
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
      doc.setFontSize(12);
      doc.text(" AAGYO Food Order: Summary and Receipt", 160, 60);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal')


      let x = 200;
      let x1 = 90;

      //Order id
      let oi = "";
      let id = data[i][0];
      oi = id.toString();
      doc.text(oi, x, x1);

      //Ordertime
      x1 = x1 + 20;
      let ot = "";
      ot = data[i][10];
      doc.text(ot, x, x1);

      //Customer Name
      x1 = x1 + 20;
      let cn = "";
      cn = data[i][2];
      if(cn!==undefined)doc.text(cn.toString(), x, x1);

      //Customer Address  // Handle long customer address
      let ca = data[i][15];
      const addressLines = doc.splitTextToSize(ca, contentWidth - x - 10);
      const addressHeight = addressLines.length * 12; // Adjust the line height as per your requirement
      if (x1 + addressHeight > contentHeight - 10) {
        doc.addPage();
        x1 = 50; // Adjust the left margin of the new page as per your requirement
      }
      let count = 0;
      for (const line of addressLines) {
        x1 += 20;
        count++;
        doc.text(line, x, x1);
      }

      //Restorant name
      x1 = x1 + 20;
      let rn = "";
      rn = data[i][1];
      doc.text(rn, x, x1);

      //Restorant Add
      x1 = x1 + 20;
      let ra = "";
      // ra=data[i][];
      doc.text(ra, x, x1);


      doc.setFont('helvetica', 'bold')
      let y = 90;
      doc.text("Order ID:", 30, y);
      y += 20;
      doc.text("Order Time: ", 30, y);
      y += 20;
      doc.text("Customer Name: ", 30, y);
      y += 20;
      doc.text("Customer Address: ", 30, y);
      y = y + count * 20;
      doc.text("Restaurant Name: ", 30, y);
      y += 20;
      doc.text("Restaurant Address:", 30, y);
      doc.setFont('helvetica', 'normal')



      //Horizontal line
      x1 = x1 + 40;
      const lineY = x1; // Adjust the position of the line as per your requirement
      const lineWidth = 30;
      const lineColor = [200, 200, 200]; // Gray color

      doc.setDrawColor(lineColor[0], lineColor[1], lineColor[2]);
      doc.setFillColor(lineColor[0], lineColor[1], lineColor[2]);
      doc.rect(marginLeft, lineY, contentWidth, lineWidth, "F");

      //Table
      doc.setFont('helvetica', 'bold')
      let t = x1 + 16
      doc.text("Item", 30, t);
      doc.text("Quantity", 230, t);
      doc.text("Unit Price", 340, t);
      doc.text("Total Price", 450, t);
      doc.setFont('helvetica', 'normal')


      let inputString = data[i][14];
      const productRegex = /Product Name\s*:\s*([^|]+)\s*\|[^|]+\|[^|]+\| Quantity\s*:\s*(\d+)\s*\| Total Price\s*:\s*\$([\d.]+)/g;
      let match;
      const products = [];

      while ((match = productRegex.exec(inputString)) !== null) {
        const productName = match[1].trim();
        const quantity = match[2].trim();
        const totalPrice = match[3].trim();

        products.push([productName, quantity, totalPrice]);
      }

      //lines
      doc.rect(marginLeft, x1, contentWidth, .5, "F");
      doc.rect(marginLeft, x1 + 30, contentWidth, .5, "F");


      let x3 = t + 30;

      let total = 0; 
      for (let k = 0; k < products.length; k++) {

        if(x3-10>contentHeight){
          doc.addPage();
          x3=50;
          doc.rect(marginLeft, marginTop, contentWidth, contentHeight);
        }

        doc.text(products[k][0], 30, x3);
        doc.text(products[k][1], 230, x3);

        const quantityValue = parseInt(products[k][1]);
        const totalPriceValue = parseFloat(products[k][2]);
        let unitPrice = totalPriceValue / quantityValue;

        total+=totalPriceValue;

        doc.text(unitPrice.toString(), 340, x3);
        doc.text(products[k][2], 450, x3);
        x3 += 15;
      }
      
      
      x3 = x3 - 10;

      if(x3+15>contentHeight){
        doc.addPage();
        x3=30;
        doc.rect(marginLeft, marginTop, contentWidth, contentHeight);
      }
      else{
        doc.rect(marginLeft, x3, contentWidth, .5, "F");
      }

      x3 += 15;
      doc.text("Delivery Charge Subtotal", 30, x3);
      doc.text(data[i][6].toString(), 450, x3);

      total+=data[i][6];
      
      if(x3+15>contentHeight){
        doc.addPage();
        x3=30;
        doc.rect(marginLeft, marginTop, contentWidth, contentHeight);
      }
      x3 += 15;
      doc.text("Restaurant Packaging Charges", 30, x3);
      doc.text("10", 450, x3);

      total+=10;
      console.log(total);
      
      if(x3+15>contentHeight){
        doc.addPage();
        x3=30;
        doc.rect(marginLeft, marginTop, contentWidth, contentHeight);
      }
      x3 += 15;
      doc.text("Taxes", 30, x3);
      doc.text("xx", 450, x3);

      //Horizontal line
      x3 = x3 + 15;
      const lY = x3; // Adjust the position of the line as per your requirement
      const lineW = 22;

      doc.setDrawColor(lineColor[0], lineColor[1], lineColor[2]);
      doc.setFillColor(lineColor[0], lineColor[1], lineColor[2]);
      doc.rect(marginLeft, lY, contentWidth, lineW, "F");

      x3 += 12;
      const textColor = [0, 128, 0]; // RGB color values (Red: 0, Green: 128, Blue: 0)
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.text("Total", 30, x3);
      doc.text("xx", 450, x3);
      doc.setTextColor(0,0,0);


      if(x3+180>contentHeight){
        doc.addPage();
        x3=10;
        doc.rect(marginLeft, marginTop, contentWidth, contentHeight);
      }

      //Terms $ Conditions :
      doc.setFont('helvetica', 'bold')
      x3+=35
      doc.text("Terms $ Conditions :", 30, x3);      
      doc.setFont('helvetica', 'normal')


      x3+=20;
      doc.text("1. W. e. f. 1 January 2022, for items ordered where AAGYO is obligated to raise a tax invoice on behalf of the Restaurant, it can be", 30, x3);
      x3+=10;
      doc.text("downloaded from the link provided in email containing order summary. For other products in the order that are not covered in AAGYO", 40, x3);
      x3+=10;
      doc.text("issued tax invoice, tax invoice will be provided by the Restaurant Partner directly.", 40, x3);

      x3+=20;
      doc.text("2. The delivery charge and delivery surge are collected by AAGYO on behalf of the person or entity undertaking delivery of this order.", 30, x3);

      x3+=20;
      doc.text("3. If you have any issued or queries in respect of your order, please contact the customer chat support through AAGYO platform.", 30, x3);

      x3+=20;
      doc.text("4. In case you need to get more information about restaurant's FSSAI status, please visit https://foscos.fssai.gov.in/ and use the FBO", 30, x3);
      x3+=10;
      doc.text("Search option with the FSSAI License / Registration number", 40, x3);

      x3+=20;
      doc.text("5. Please note that we never ask for any bank account details such as CVV, account number, UPI Pin etc. across our other support", 30, x3);
      x3+=10;
      doc.text("channels. For your safety please do not share these details with anyone over any medium.", 40, x3);



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





  render() {
    return (
      <div className="container">
        <form className='form'>
          <label className="file-input-label">
            <p className='p'>Choose Excel File:</p>
            <input type="file" onChange={this.handleFileChange} accept=".xlsx, .xls" className="file-input" />
          </label>
          {/* <label className="file-input-label">
            <span>Choose Excel File For Invoice Format:</span>
            <input type="file" onChange={this.handleFileChange} accept=".xlsx, .xls" className="file-input" />
          </label> */}
          <button disabled={!this.state.fileSelected} onClick={this.jsPdfGenerator} className="generate-btn">
            Generate PDF
          </button>
        </form>
      </div>
    );
  }
}
