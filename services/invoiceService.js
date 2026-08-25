const PDFDocument = require('pdfkit');

// Helper: format currency
const formatCurrency = (amount) => {
  return 'INR ' + Number(amount || 0).toLocaleString('en-IN');
};

const generateInvoice = (order, user) => {
  const doc = new PDFDocument({
    size: 'A4',
    margin: 50,
    info: {
      Title: `Invoice ${order.invoiceNumber}`,
      Author: 'SOLESYNTAX',
      Subject: 'Order Invoice'
    }
  });

  // ================================================================
  //  BRAND COLOURS (match your SOLESYNTAX theme)
  // ================================================================
  const colors = {
    primary: '#88c8bc',
    primaryDark: '#66a59b',
    secondary: '#46698f',
    accent: '#ff6b6b',
    text: '#1a1a2e',
    light: '#f8f9fa',
    border: '#e0e0e0',
    success: '#28a745',
    warning: '#ffc107'
  };

  // ================================================================
  //  PAGE BACKGROUND (subtle watermark / header)
  // ================================================================
  // Light header stripe
  doc
    .rect(0, 0, doc.page.width, 120)
    .fill(colors.light);

  // ================================================================
  //  HEADER: LOGO + BRAND NAME
  // ================================================================
  doc
    .fillColor(colors.primary)
    .fontSize(32)
    .font('Helvetica-Bold')
    .text('SOLESYNTAX', 50, 40, {
      align: 'center'
    });

  // Subtitle line
  doc
    .fillColor(colors.secondary)
    .fontSize(12)
    .font('Helvetica')
    .text('Premium Footwear', 50, 80, {
      align: 'center'
    });

  // ================================================================
  //  DIVIDER LINE
  // ================================================================
  doc
    .moveTo(50, 110)
    .lineTo(550, 110)
    .strokeColor(colors.primary)
    .lineWidth(1.5)
    .stroke();

  // ================================================================
  //  INVOICE TITLE
  // ================================================================
  doc
    .moveDown(0.8)
    .fillColor(colors.text)
    .fontSize(22)
    .font('Helvetica-Bold')
    .text('INVOICE', 50, 120, {
      align: 'left'
    });

  // ================================================================
  //  INVOICE INFO (right aligned)
  // ================================================================
  const invoiceY = 125;
  doc
    .fillColor(colors.text)
    .fontSize(9)
    .font('Helvetica');

  // Invoice details in a grid-like format
  const infoX = 350;
  const infoSpacing = 18;
  doc
    .text(`Invoice #: ${order.invoiceNumber}`, infoX, invoiceY, { align: 'right' })
    .text(`Order ID: ${order._id}`, infoX, invoiceY + infoSpacing, { align: 'right' })
    .text(`Date: ${new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`, infoX, invoiceY + infoSpacing * 2, { align: 'right' })
    .text(`Payment: ${order.paymentMethod}`, infoX, invoiceY + infoSpacing * 3, { align: 'right' });

  // ================================================================
  //  BILL TO SECTION
  // ================================================================
  doc
    .moveDown(1.5)
    .fillColor(colors.secondary)
    .fontSize(13)
    .font('Helvetica-Bold')
    .text('BILL TO', 50, 190);

  doc
    .fillColor(colors.text)
    .fontSize(10)
    .font('Helvetica')
    .text(order.address.name, 50, 210)
    .text(order.address.addressLine1, 50, 225);

  if (order.address.addressLine2) {
    doc.text(order.address.addressLine2, 50, 240);
  }

  const addrY = order.address.addressLine2 ? 255 : 240;
  doc
    .text(`${order.address.city}, ${order.address.state} - ${order.address.pincode}`, 50, addrY)
    .text(`Phone: ${order.address.phone}`, 50, addrY + 15);

  // ================================================================
  //  ORDER ITEMS TABLE (with borders & header)
  // ================================================================
  const tableTop = order.address.addressLine2 ? 300 : 285;
  const tableLeft = 50;
  const colWidths = [30, 230, 80, 60, 80];
  const colPositions = [tableLeft, tableLeft + 30, tableLeft + 260, tableLeft + 340, tableLeft + 400];
  const rowHeight = 22;
  let currentY = tableTop;

  // ----- Table Header -----
  const headerY = currentY;
  doc
    .rect(tableLeft, headerY, 500, 22)
    .fill(colors.primary);

  doc
    .fillColor('#ffffff')
    .fontSize(10)
    .font('Helvetica-Bold');

  doc
    .text('#', colPositions[0], headerY + 4, { width: colWidths[0], align: 'center' })
    .text('Product', colPositions[1], headerY + 4, { width: colWidths[1], align: 'left' })
    .text('Size', colPositions[2], headerY + 4, { width: colWidths[2], align: 'center' })
    .text('Qty', colPositions[3], headerY + 4, { width: colWidths[3], align: 'center' })
    .text('Amount', colPositions[4], headerY + 4, { width: colWidths[4], align: 'right' });

  // ----- Table Rows -----
  currentY += rowHeight;
  doc
    .fillColor(colors.text)
    .fontSize(9)
    .font('Helvetica');

  order.orderItems.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    const isEven = index % 2 === 0;

    // Alternating row background
    if (isEven) {
      doc
        .rect(tableLeft, currentY, 500, rowHeight)
        .fill(colors.light);
    }

    // Row border (bottom line)
    doc
      .rect(tableLeft, currentY, 500, rowHeight)
      .strokeColor(colors.border)
      .lineWidth(0.5)
      .stroke();

    // Row data
    doc
      .fillColor(colors.text)
      .text((index + 1).toString(), colPositions[0], currentY + 4, { width: colWidths[0], align: 'center' })
      .text(item.name, colPositions[1], currentY + 4, { width: colWidths[1], align: 'left' })
      .text(item.size, colPositions[2], currentY + 4, { width: colWidths[2], align: 'center' })
      .text(item.quantity.toString(), colPositions[3], currentY + 4, { width: colWidths[3], align: 'center' })
      .text(formatCurrency(itemTotal), colPositions[4], currentY + 4, { width: colWidths[4], align: 'right' });

    currentY += rowHeight;
  });

  // ----- Table Footer (total line) -----
  doc
    .rect(tableLeft, currentY, 500, 1)
    .fill(colors.primary);

  currentY += 8;

  // ================================================================
  //  SUMMARY SECTION (right aligned)
  // ================================================================
  const summaryX = 350;
  const summaryY = currentY + 4;

  doc
    .fontSize(10)
    .font('Helvetica');

  const summarySpacing = 20;
  doc
    .text(`Subtotal: ${formatCurrency(order.totalPrice)}`, summaryX, summaryY, { align: 'right' })
    .text(`Shipping: ${formatCurrency(order.shipping || 0)}`, summaryX, summaryY + summarySpacing, { align: 'right' })
    .text(`Discount: -${formatCurrency(order.couponDiscount || 0)}`, summaryX, summaryY + summarySpacing * 2, { align: 'right' });

  // ----- Grand Total (highlighted) – FIXED SECTION -----
  const totalY = summaryY + summarySpacing * 3 + 8;   // increased from 6 to give more space
  const boxWidth = 220;                               // slightly wider for 5-digit amounts
  const boxX = summaryX - 10;
  doc
    .rect(boxX, totalY - 4, boxWidth, 32)             // increased height for readability
    .fill(colors.secondary);

  doc
    .fillColor('#ffffff')
    .fontSize(18)                                     // slightly larger font
    .font('Helvetica-Bold')
    .text(`TOTAL: ${formatCurrency(order.finalAmount)}`, summaryX, totalY + 2, { align: 'right' });

  // ================================================================
  // FOOTER
  // ================================================================
  const addFooter = () => {
    const footerY = doc.page.height - 60;

    doc.save();

    // Divider
    doc
      .moveTo(50, footerY - 20)
      .lineTo(550, footerY - 20)
      .strokeColor(colors.border)
      .lineWidth(1)
      .stroke();

    // Thank you message
    doc
      .fillColor(colors.text)
      .fontSize(9)
      .font('Helvetica')
      .text(
        'Thank you for shopping with SOLESYNTAX!',
        50,
        footerY,
        {
          width: 500,
          align: 'center'
        }
      );

    // Support message
    doc
      .fillColor(colors.text)
      .fontSize(8)
      .font('Helvetica')
      .text(
        'For any queries, contact us at support@solesyntax.com',
        50,
        footerY + 16,
        {
          width: 500,
          align: 'center'
        }
      );

    doc.restore();
  };

  addFooter();

  return doc;
};

module.exports = {
  generateInvoice
};