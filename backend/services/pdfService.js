
const PDFDocument = require("pdfkit");

const generateQuotationPDF = ({
  quotation,
  settings,
  res,
}) => {
  const doc = new PDFDocument({
    size: "A4",
    margin: 50,
    bufferPages: true,
  });

  res.setHeader("Content-Type", "application/pdf");

  res.setHeader(
    "Content-Disposition",
    `inline; filename="${quotation.quotationNumber}.pdf"`,
  );

  doc.pipe(res);

  // ============================================================
  // CONFIG / HELPERS
  // ============================================================

  const currency = settings?.currency || "PHP";

  const currencySymbols = {
    PHP: "PHP\u00A0",
    USD: "$",
  };

  const currencySymbol =
    settings?.currencySymbol ||
    currencySymbols[currency] ||
    currency;

  const formatMoney = (value) => {
    const amount = Number(value || 0);

    return `${currencySymbol}${amount.toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // ============================================================
  // QUOTATION PRICING LABELS
  // ============================================================

  const subtotalLabel =
    quotation.pricingMode === "inclusive"
      ? "Subtotal (VAT Inclusive)"
      : "Subtotal";

  const vatLabel =
    quotation.pricingMode === "inclusive"
      ? `VAT Included (${Number(quotation.taxRate || 0)}%)`
      : `VAT (${Number(quotation.taxRate || 0)}%)`;

  // ============================================================
  // SETTINGS
  // ============================================================

  const businessName =
    settings?.businessName || "Business Name";

  const businessEmail =
    settings?.businessEmail || "";

  const contactNumber =
    settings?.contactNumber || "";

  const businessAddress =
    settings?.businessAddress || "";

  const systemName =
    settings?.appearance?.systemName ||
    settings?.systemName ||
    "System";

  const documentFooter =
    settings?.salesInvoicing?.documentFooter ||
    "Thank you for your business.";

  const paymentTerms =
    settings?.salesInvoicing?.defaultPaymentTerms || "";

  // ============================================================
  // COLORS / PAGE
  // ============================================================

  const darkColor = "#111827";
  const mutedColor = "#64748B";
  const borderColor = "#CBD5E1";
  const lightBg = "#F8FAFC";

  const pageLeft = 50;
  const pageRight = 545;
  const pageWidth = pageRight - pageLeft;

  const bottomContentLimit = 690;

  // ============================================================
  // HEADER
  // ============================================================

  const headerTop = 45;

  // BUSINESS NAME
  doc
    .font("Helvetica-Bold")
    .fontSize(20)
    .fillColor(darkColor)
    .text(
      businessName,
      pageLeft,
      headerTop,
      {
        width: 290,
      },
    );

  // BUSINESS INFORMATION
  let businessInfoY = headerTop + 28;

  doc
    .font("Helvetica")
    .fontSize(8.5)
    .fillColor(mutedColor);

  if (businessAddress) {
    doc.text(
      businessAddress,
      pageLeft,
      businessInfoY,
      {
        width: 280,
      },
    );

    businessInfoY += 13;
  }

  if (businessEmail) {
    doc.text(
      businessEmail,
      pageLeft,
      businessInfoY,
      {
        width: 280,
      },
    );

    businessInfoY += 13;
  }

  if (contactNumber) {
    doc.text(
      contactNumber,
      pageLeft,
      businessInfoY,
      {
        width: 280,
      },
    );
  }

  // ============================================================
  // QUOTATION HEADER BLOCK
  // ============================================================

  doc
    .font("Helvetica-Bold")
    .fontSize(24)
    .fillColor(darkColor)
    .text(
      "QUOTATION",
      350,
      headerTop,
      {
        width: 195,
        align: "right",
      },
    );

  doc
    .font("Helvetica-Bold")
    .fontSize(9)
    .fillColor(darkColor)
    .text(
      quotation.quotationNumber || "—",
      350,
      headerTop + 34,
      {
        width: 195,
        align: "right",
      },
    );

  doc
    .font("Helvetica")
    .fontSize(8.5)
    .fillColor(mutedColor)
    .text(
      `Quotation Date: ${formatDate(
        quotation.quotationDate,
      )}`,
      350,
      headerTop + 50,
      {
        width: 195,
        align: "right",
      },
    );

  // STATUS
  if (quotation.status) {
    doc.text(
      `Status: ${String(quotation.status)
        .charAt(0)
        .toUpperCase()}${String(quotation.status).slice(1)}`,
      350,
      headerTop + 64,
      {
        width: 195,
        align: "right",
      },
    );
  }

  // DIVIDER
  doc
    .moveTo(pageLeft, 125)
    .lineTo(pageRight, 125)
    .lineWidth(1.2)
    .strokeColor(borderColor)
    .stroke();

  doc
    .lineWidth(1)
    .fillColor(darkColor)
    .strokeColor(borderColor);

  // ============================================================
  // QUOTE TO / PAYMENT TERMS
  // ============================================================

  const infoTop = 145;

  // QUOTE TO
  doc
    .roundedRect(
      pageLeft,
      infoTop,
      310,
      82,
      6,
    )
    .fillColor(lightBg)
    .fill();

  doc
    .roundedRect(
      pageLeft,
      infoTop,
      310,
      82,
      6,
    )
    .strokeColor(borderColor)
    .stroke();

  doc
    .font("Helvetica-Bold")
    .fontSize(8)
    .fillColor(darkColor)
    .text(
      "QUOTE TO",
      pageLeft + 14,
      infoTop + 12,
    );

  doc
    .font("Helvetica-Bold")
    .fontSize(11)
    .fillColor(darkColor)
    .text(
      quotation.customerId?.name || "Customer",
      pageLeft + 14,
      infoTop + 29,
      {
        width: 280,
      },
    );

  if (quotation.customerId?.customerCode) {
    doc
      .font("Helvetica")
      .fontSize(8.5)
      .fillColor(mutedColor)
      .text(
        `Customer Code: ${quotation.customerId.customerCode}`,
        pageLeft + 14,
        infoTop + 48,
        {
          width: 280,
        },
      );
  }

  // PAYMENT TERMS
  doc
    .roundedRect(
      375,
      infoTop,
      170,
      82,
      6,
    )
    .fillColor(lightBg)
    .fill();

  doc
    .roundedRect(
      375,
      infoTop,
      170,
      82,
      6,
    )
    .strokeColor(borderColor)
    .stroke();

  doc
    .font("Helvetica-Bold")
    .fontSize(8)
    .fillColor(darkColor)
    .text(
      "PAYMENT TERMS",
      389,
      infoTop + 12,
    );

  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .fillColor(darkColor)
    .text(
      paymentTerms || "—",
      389,
      infoTop + 31,
      {
        width: 140,
      },
    );

  // ============================================================
  // ITEMS TABLE
  // ============================================================

  const tableTop = 255;

  const columns = {
    item: 50,
    product: 78,
    qty: 315,
    unit: 360,
    price: 395,
    amount: 480,
  };

  const tableWidths = {
    item: 28,
    product: 225,
    qty: 45,
    unit: 35,
    price: 80,
    amount: 70,
  };

  const drawTableHeader = (y) => {
    doc
      .moveTo(pageLeft, y + 20)
      .lineTo(pageRight, y + 20)
      .lineWidth(0.8)
      .strokeColor(borderColor)
      .stroke();

    doc
      .font("Helvetica-Bold")
      .fontSize(7.5)
      .fillColor(darkColor);

    doc.text(
      "#",
      columns.item,
      y + 3,
      {
        width: tableWidths.item,
      },
    );

    doc.text(
      "PRODUCT / DESCRIPTION",
      columns.product,
      y + 3,
      {
        width: tableWidths.product,
      },
    );

    doc.text(
      "QTY",
      columns.qty,
      y + 3,
      {
        width: tableWidths.qty,
        align: "right",
      },
    );

    doc.text(
      "UNIT",
      columns.unit,
      y + 3,
      {
        width: tableWidths.unit,
        align: "center",
      },
    );

    doc.text(
      "UNIT PRICE",
      columns.price,
      y + 3,
      {
        width: tableWidths.price,
        align: "right",
      },
    );

    doc.text(
      "AMOUNT",
      columns.amount,
      y + 3,
      {
        width: tableWidths.amount,
        align: "right",
      },
    );
  };

  drawTableHeader(tableTop);

  let y = tableTop + 30;

  const items = Array.isArray(quotation.items)
    ? quotation.items
    : [];

  items.forEach((item, index) => {
    const quantity =
      Number(item.quantity || 0);

    // IMPORTANT:
    // Customer-facing quotation uses quotedUnitPrice.
    const unitPrice =
      Number(item.quotedUnitPrice || 0);

    const amount =
      quantity * unitPrice;

    const productName =
      item.productId?.name ||
      item.description ||
      "—";

    const description =
      item.description &&
      item.description !== productName
        ? item.description
        : "";

    const productHeight =
      doc.heightOfString(
        productName,
        {
          width: tableWidths.product,
        },
      );

    const descriptionHeight =
      description
        ? doc.heightOfString(
            description,
            {
              width: tableWidths.product,
            },
          )
        : 0;

    const rowHeight =
      Math.max(
        28,
        productHeight +
          descriptionHeight +
          12,
      );

    // NEW PAGE
    if (
      y + rowHeight >
      bottomContentLimit
    ) {
      doc.addPage();

      y = 55;

      drawTableHeader(y);

      y += 30;
    }

    // ALTERNATING BACKGROUND
    if (index % 2 === 0) {
      doc
        .rect(
          pageLeft,
          y - 5,
          pageWidth,
          rowHeight,
        )
        .fillColor(lightBg)
        .fill();
    }

    // ITEM NUMBER
    doc
      .font("Helvetica")
      .fontSize(8.5)
      .fillColor(darkColor)
      .text(
        String(index + 1),
        columns.item,
        y,
        {
          width: tableWidths.item,
        },
      );

    // PRODUCT
    doc
      .font("Helvetica-Bold")
      .fontSize(8.5)
      .fillColor(darkColor)
      .text(
        productName,
        columns.product,
        y,
        {
          width: tableWidths.product,
        },
      );

    // DESCRIPTION
    if (description) {
      doc
        .font("Helvetica")
        .fontSize(7.5)
        .fillColor(mutedColor)
        .text(
          description,
          columns.product,
          y + productHeight + 2,
          {
            width: tableWidths.product,
          },
        );
    }

    // QTY
    doc
      .font("Helvetica")
      .fontSize(8.5)
      .fillColor(darkColor)
      .text(
        quantity.toFixed(2),
        columns.qty,
        y,
        {
          width: tableWidths.qty,
          align: "right",
        },
      );

    // UNIT
    doc
      .font("Helvetica")
      .fontSize(8.5)
      .fillColor(darkColor)
      .text(
        item.unitCode ||
          item.unitId?.code ||
          "—",
        columns.unit,
        y,
        {
          width: tableWidths.unit,
          align: "center",
        },
      );

    // QUOTED UNIT PRICE
    doc
      .font("Helvetica")
      .fontSize(8.5)
      .fillColor(darkColor)
      .text(
        formatMoney(unitPrice),
        columns.price,
        y,
        {
          width: tableWidths.price,
          align: "right",
          lineBreak: false,
        },
      );

    // AMOUNT
    doc
      .font("Helvetica-Bold")
      .fontSize(8.5)
      .fillColor(darkColor)
      .text(
        formatMoney(amount),
        columns.amount,
        y,
        {
          width: tableWidths.amount,
          align: "right",
          lineBreak: false,
        },
      );

    // ROW DIVIDER
    doc
      .moveTo(
        pageLeft,
        y + rowHeight - 5,
      )
      .lineTo(
        pageRight,
        y + rowHeight - 5,
      )
      .lineWidth(0.5)
      .strokeColor(borderColor)
      .stroke();

    y += rowHeight;
  });

  // ============================================================
  // FINANCIAL SUMMARY
  // ============================================================

  y += 10;

  if (y > 610) {
    doc.addPage();

    y = 55;
  }

  const summaryX = 325;
  const summaryWidth = 220;
  const labelWidth = 105;
  const valueX = 435;
  const valueWidth = 100;

  // SUMMARY BORDER
  doc
    .moveTo(summaryX, y)
    .lineTo(pageRight, y)
    .lineWidth(1)
    .strokeColor(borderColor)
    .stroke();

  y += 13;

  // SUBTOTAL
  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor(mutedColor)
    .text(
      subtotalLabel,
      summaryX,
      y,
      {
        width: labelWidth,
        align: "right",
      },
    );

  doc
    .font("Helvetica")
    .fillColor(darkColor)
    .text(
      formatMoney(quotation.subtotal),
      valueX,
      y,
      {
        width: valueWidth,
        align: "right",
        lineBreak: false,
      },
    );

  y += 19;

  // VAT
  if (
    Number(quotation.taxRate || 0) > 0 &&
    Number(quotation.taxAmount || 0) > 0
  ) {
    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor(mutedColor)
      .text(
        vatLabel,
        summaryX,
        y,
        {
          width: labelWidth,
          align: "right",
        },
      );

    doc
      .fillColor(darkColor)
      .text(
        formatMoney(quotation.taxAmount),
        valueX,
        y,
        {
          width: valueWidth,
          align: "right",
          lineBreak: false,
        },
      );

    y += 19;
  }

  // ============================================================
  // LABOR COST
  // ============================================================
  //
  // IMPORTANT:
  // Only show this if your business rule says the customer
  // should see labor as part of the quotation.
  //

  if (Number(quotation.laborCost || 0) > 0) {
    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor(mutedColor)
      .text(
        "Labor",
        summaryX,
        y,
        {
          width: labelWidth,
          align: "right",
        },
      );

    doc
      .fillColor(darkColor)
      .text(
        formatMoney(quotation.laborCost),
        valueX,
        y,
        {
          width: valueWidth,
          align: "right",
          lineBreak: false,
        },
      );

    y += 19;
  }

  // ============================================================
  // OTHER DIRECT COSTS
  // ============================================================

  if (Number(quotation.otherDirectCosts || 0) > 0) {
    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor(mutedColor)
      .text(
        "Other Direct Costs",
        summaryX,
        y,
        {
          width: labelWidth,
          align: "right",
        },
      );

    doc
      .fillColor(darkColor)
      .text(
        formatMoney(quotation.otherDirectCosts),
        valueX,
        y,
        {
          width: valueWidth,
          align: "right",
          lineBreak: false,
        },
      );

    y += 19;
  }

  // ============================================================
  // TOTAL
  // ============================================================

  const quotationTotal =
    quotation.total ??
    quotation.totalAmount ??
    0;

  doc
    .roundedRect(
      summaryX,
      y - 4,
      summaryWidth,
      38,
      5,
    )
    .lineWidth(0.8)
    .strokeColor(borderColor)
    .stroke();

  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .fillColor(darkColor)
    .text(
      "TOTAL",
      summaryX + 12,
      y + 8,
      {
        width: 80,
        align: "left",
      },
    );

  doc
    .font("Helvetica-Bold")
    .fontSize(12)
    .fillColor(darkColor)
    .text(
      formatMoney(quotationTotal),
      summaryX + 95,
      y + 8,
      {
        width: 103,
        align: "right",
        lineBreak: false,
      },
    );

  y += 52;



  // ============================================================
  // FOOTER
  // ============================================================

  const footerY = 755;

  doc
    .moveTo(pageLeft, footerY - 8)
    .lineTo(pageRight, footerY - 8)
    .lineWidth(0.5)
    .strokeColor(borderColor)
    .stroke();

  doc
    .font("Helvetica")
    .fontSize(7.5)
    .fillColor(mutedColor)
    .text(
      documentFooter,
      pageLeft,
      footerY,
      {
        width: 300,
        align: "left",
      },
    );

  doc
    .fontSize(7)
    .fillColor(mutedColor)
    .text(
      systemName,
      pageRight - 150,
      footerY,
      {
        width: 150,
        align: "right",
      },
    );

  // ============================================================
  // PAGE NUMBERS
  // ============================================================

  const range = doc.bufferedPageRange();

  for (let i = 0; i < range.count; i++) {
    doc.switchToPage(i);

    doc
      .font("Helvetica")
      .fontSize(7)
      .fillColor(mutedColor)
      .text(
        `Page ${i + 1} of ${range.count}`,
        pageLeft,
        770,
        {
          width: pageWidth,
          align: "center",
        },
      );
  }

  doc.end();
};

const generateInvoicePDF = ({
  invoice,
  settings,
  res,
}) => {
  const doc = new PDFDocument({
    size: "A4",
    margin: 50,
    bufferPages: true,
  });

  res.setHeader("Content-Type", "application/pdf");

  res.setHeader(
    "Content-Disposition",
    `inline; filename="${invoice.invoiceNumber}.pdf"`,
  );

  doc.pipe(res);

  // ============================================================
  // CONFIG / HELPERS
  // ============================================================

const currency = settings?.currency || "PHP";

const currencySymbols = {
  PHP: "PHP\u00A0",
  USD: "$",
};

const currencySymbol =
  settings?.currencySymbol ||
  currencySymbols[currency] ||
  currency;

const formatMoney = (value) => {
  const amount = Number(value || 0);

  return `${currencySymbol}${amount.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // ============================================================
  // TAX / PRICING LABELS
  // ============================================================

  const subtotalLabel =
    invoice.pricingMode === "inclusive"
      ? "Subtotal (VAT Inclusive)"
      : "Subtotal";

  const vatLabel =
    invoice.pricingMode === "inclusive"
      ? `VAT Included (${Number(invoice.taxRate || 0)}%)`
      : `VAT (${Number(invoice.taxRate || 0)}%)`;

  // ============================================================
  // SETTINGS
  // ============================================================

  const businessName =
    settings?.businessName || "Business Name";

  const businessEmail =
    settings?.businessEmail || "";

  const contactNumber =
    settings?.contactNumber || "";

  const businessAddress =
    settings?.businessAddress || "";

  const systemName =
    settings?.appearance?.systemName ||
    settings?.systemName ||
    "System";

  const documentFooter =
    settings?.salesInvoicing?.documentFooter ||
    "Thank you for your business.";

  const paymentTerms =
    settings?.salesInvoicing?.defaultPaymentTerms || "";

  // ============================================================
  // COLORS / PAGE
  // ============================================================

  const darkColor = "#111827";
  const mutedColor = "#64748B";
  const borderColor = "#CBD5E1";
  const lightBg = "#F8FAFC";

  const pageLeft = 50;
  const pageRight = 545;
  const pageWidth = pageRight - pageLeft;

  const bottomContentLimit = 690;

  // ============================================================
  // HEADER
  // ============================================================

  const headerTop = 45;

  // Business name
  doc
    .font("Helvetica-Bold")
    .fontSize(20)
    .fillColor(darkColor)
    .text(
      businessName,
      pageLeft,
      headerTop,
      {
        width: 290,
      },
    );

  // Business information
  let businessInfoY = headerTop + 28;

  doc
    .font("Helvetica")
    .fontSize(8.5)
    .fillColor(mutedColor);

  if (businessAddress) {
    doc.text(
      businessAddress,
      pageLeft,
      businessInfoY,
      {
        width: 280,
      },
    );

    businessInfoY += 13;
  }

  if (businessEmail) {
    doc.text(
      businessEmail,
      pageLeft,
      businessInfoY,
      {
        width: 280,
      },
    );

    businessInfoY += 13;
  }

  if (contactNumber) {
    doc.text(
      contactNumber,
      pageLeft,
      businessInfoY,
      {
        width: 280,
      },
    );
  }

  // ============================================================
  // INVOICE HEADER BLOCK
  // ============================================================

  doc
    .font("Helvetica-Bold")
    .fontSize(24)
    .fillColor(darkColor)
    .text(
      "INVOICE",
      350,
      headerTop,
      {
        width: 195,
        align: "right",
      },
    );

  doc
    .font("Helvetica-Bold")
    .fontSize(9)
    .fillColor(darkColor)
    .text(
      invoice.invoiceNumber || "—",
      350,
      headerTop + 34,
      {
        width: 195,
        align: "right",
      },
    );

  doc
    .font("Helvetica")
    .fontSize(8.5)
    .fillColor(mutedColor)
    .text(
      `Invoice Date: ${formatDate(invoice.invoiceDate)}`,
      350,
      headerTop + 50,
      {
        width: 195,
        align: "right",
      },
    );

  if (invoice.dueDate) {
    doc.text(
      `Due Date: ${formatDate(invoice.dueDate)}`,
      350,
      headerTop + 64,
      {
        width: 195,
        align: "right",
      },
    );
  }

  // Divider
  doc
    .moveTo(pageLeft, 125)
    .lineTo(pageRight, 125)
    .lineWidth(1.2)
    .strokeColor(borderColor)
    .stroke();

  doc
    .lineWidth(1)
    .fillColor(darkColor)
    .strokeColor(borderColor);

  // ============================================================
  // BILL TO / PAYMENT TERMS
  // ============================================================

  const infoTop = 145;

  // Bill To background
  doc
    .roundedRect(
      pageLeft,
      infoTop,
      310,
      82,
      6,
    )
    .fillColor(lightBg)
    .fill();

  doc
    .roundedRect(
      pageLeft,
      infoTop,
      310,
      82,
      6,
    )
    .strokeColor(borderColor)
    .stroke();

  doc
    .font("Helvetica-Bold")
    .fontSize(8)
    .fillColor(darkColor)
    .text(
      "BILL TO",
      pageLeft + 14,
      infoTop + 12,
    );

  doc
    .font("Helvetica-Bold")
    .fontSize(11)
    .fillColor(darkColor)
    .text(
      invoice.customerId?.name || "Customer",
      pageLeft + 14,
      infoTop + 29,
      {
        width: 280,
      },
    );

  if (invoice.customerId?.customerCode) {
    doc
      .font("Helvetica")
      .fontSize(8.5)
      .fillColor(mutedColor)
      .text(
        `Customer Code: ${invoice.customerId.customerCode}`,
        pageLeft + 14,
        infoTop + 48,
        {
          width: 280,
        },
      );
  }

  // Payment Terms background
  doc
    .roundedRect(
      375,
      infoTop,
      170,
      82,
      6,
    )
    .fillColor(lightBg)
    .fill();

  doc
    .roundedRect(
      375,
      infoTop,
      170,
      82,
      6,
    )
    .strokeColor(borderColor)
    .stroke();

  doc
    .font("Helvetica-Bold")
    .fontSize(8)
    .fillColor(darkColor)
    .text(
      "PAYMENT TERMS",
      389,
      infoTop + 12,
    );

  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .fillColor(darkColor)
    .text(
      paymentTerms || "—",
      389,
      infoTop + 31,
      {
        width: 140,
      },
    );

  if (invoice.dueDate) {
    doc
      .font("Helvetica")
      .fontSize(8)
      .fillColor(mutedColor)
      .text(
        `Due ${formatDate(invoice.dueDate)}`,
        389,
        infoTop + 50,
        {
          width: 140,
        },
      );
  }

  // ============================================================
  // ITEMS TABLE
  // ============================================================

  const tableTop = 255;

const columns = {
  item: 50,
  product: 78,
  qty: 315,
  unit: 360,
  price: 395,
  amount: 480,
};

const tableWidths = {
  item: 28,
  product: 225,
  qty: 45,
  unit: 35,
  price: 80,
  amount: 70,
};

  const drawTableHeader = (y) => {
    doc
      .moveTo(pageLeft, y + 20)
      .lineTo(pageRight, y + 20)
      .lineWidth(0.8)
      .strokeColor(borderColor)
      .stroke();

    doc
      .font("Helvetica-Bold")
      .fontSize(7.5)
      .fillColor(darkColor);

    doc.text(
      "#",
      columns.item,
      y + 3,
      {
        width: tableWidths.item,
      },
    );

    doc.text(
      "PRODUCT / DESCRIPTION",
      columns.product,
      y + 3,
      {
        width: tableWidths.product,
      },
    );

    doc.text(
      "QTY",
      columns.qty,
      y + 3,
      {
        width: tableWidths.qty,
        align: "right",
      },
    );

    doc.text(
      "UNIT",
      columns.unit,
      y + 3,
      {
        width: tableWidths.unit,
        align: "center",
      },
    );

    doc.text(
      "UNIT PRICE",
      columns.price,
      y + 3,
      {
        width: tableWidths.price,
        align: "right",
      },
    );

    doc.text(
      "AMOUNT",
      columns.amount,
      y + 3,
      {
        width: tableWidths.amount,
        align: "right",
      },
    );
  };

  drawTableHeader(tableTop);

  let y = tableTop + 30;

  const items = Array.isArray(invoice.items)
    ? invoice.items
    : [];

  items.forEach((item, index) => {
    const quantity =
      Number(item.quantity || 0);

    const unitPrice =
      Number(item.unitPrice || 0);

    const amount =
      quantity * unitPrice;

    const productName =
      item.productId?.name ||
      item.description ||
      "—";

    const description =
      item.description &&
      item.description !== productName
        ? item.description
        : "";

    const productHeight =
      doc.heightOfString(
        productName,
        {
          width: tableWidths.product,
        },
      );

    const descriptionHeight =
      description
        ? doc.heightOfString(
            description,
            {
              width: tableWidths.product,
            },
          )
        : 0;

    const rowHeight =
      Math.max(
        28,
        productHeight +
          descriptionHeight +
          12,
      );

    // New page
    if (
      y + rowHeight >
      bottomContentLimit
    ) {
      doc.addPage();

      y = 55;

      drawTableHeader(y);

      y += 30;
    }

    // Alternating row background
    if (index % 2 === 0) {
      doc
        .rect(
          pageLeft,
          y - 5,
          pageWidth,
          rowHeight,
        )
        .fillColor(lightBg)
        .fill();
    }

    // Item number
    doc
      .font("Helvetica")
      .fontSize(8.5)
      .fillColor(darkColor)
      .text(
        String(index + 1),
        columns.item,
        y,
        {
          width: tableWidths.item,
        },
      );

    // Product
    doc
      .font("Helvetica-Bold")
      .fontSize(8.5)
      .fillColor(darkColor)
      .text(
        productName,
        columns.product,
        y,
        {
          width: tableWidths.product,
        },
      );

    // Description
    if (description) {
      doc
        .font("Helvetica")
        .fontSize(7.5)
        .fillColor(mutedColor)
        .text(
          description,
          columns.product,
          y + productHeight + 2,
          {
            width: tableWidths.product,
          },
        );
    }

    // Qty
    doc
      .font("Helvetica")
      .fontSize(8.5)
      .fillColor(darkColor)
      .text(
        quantity.toFixed(2),
        columns.qty,
        y,
        {
          width: tableWidths.qty,
          align: "right",
        },
      );

    // Unit
    doc.text(
      item.unitCode ||
        item.unitId?.code ||
        "—",
      columns.unit,
      y,
      {
        width: tableWidths.unit,
        align: "center",
      },
    );

    // Unit price
    doc.text(
      formatMoney(unitPrice),
      columns.price,
      y,
      {
        width: tableWidths.price,
        align: "right",
      },
    );

    // Amount
    doc
      .font("Helvetica-Bold")
      .text(
        formatMoney(amount),
        columns.amount,
        y,
        {
          width: tableWidths.amount,
          align: "right",
        },
      );

    // Row divider
    doc
      .moveTo(
        pageLeft,
        y + rowHeight - 5,
      )
      .lineTo(
        pageRight,
        y + rowHeight - 5,
      )
      .lineWidth(0.5)
      .strokeColor(borderColor)
      .stroke();

    y += rowHeight;
  });

  // ============================================================
  // FINANCIAL SUMMARY
  // ============================================================

  y += 10;

  if (y > 610) {
    doc.addPage();
    y = 55;
  }

const summaryX = 325;
const summaryWidth = 220;
const labelWidth = 105;
const valueX = 435;
const valueWidth = 100;

  // Summary top border
  doc
    .moveTo(summaryX, y)
    .lineTo(pageRight, y)
    .lineWidth(1)
    .strokeColor(borderColor)
    .stroke();

  y += 13;

  // Subtotal
  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor(mutedColor)
    .text(
      subtotalLabel,
      summaryX,
      y,
      {
        width: labelWidth,
        align: "right",
      },
    );

  doc
    .font("Helvetica")
    .fillColor(darkColor)
    .text(
      formatMoney(invoice.subtotal),
      valueX,
      y,
      {
        width: valueWidth,
        align: "right",
      },
    );

  y += 19;

  // VAT
  if (
    Number(invoice.taxRate || 0) > 0 &&
    Number(invoice.taxAmount || 0) > 0
  ) {
    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor(mutedColor)
      .text(
        vatLabel,
        summaryX,
        y,
        {
          width: labelWidth,
          align: "right",
        },
      );

    doc
      .fillColor(darkColor)
      .text(
        formatMoney(invoice.taxAmount),
        valueX,
        y,
        {
          width: valueWidth,
          align: "right",
        },
      );

    y += 19;
  }

  // Net Amount
  if (
    invoice.netAmount !== undefined &&
    invoice.netAmount !== null
  ) {
    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor(mutedColor)
      .text(
        "Net Amount",
        summaryX,
        y,
        {
          width: labelWidth,
          align: "right",
        },
      );

    doc
      .fillColor(darkColor)
      .text(
        formatMoney(invoice.netAmount),
        valueX,
        y,
        {
          width: valueWidth,
          align: "right",
        },
      );

    y += 19;
  }

  // Total box
doc
  .roundedRect(
    summaryX,
    y - 4,
    summaryWidth,
    38,
    5,
  )
  .lineWidth(0.8)
  .strokeColor(borderColor)
  .stroke();

// TOTAL label
doc
  .font("Helvetica-Bold")
  .fontSize(10)
  .fillColor(darkColor)
  .text(
    "TOTAL",
    summaryX + 12,
    y + 8,
    {
      width: 80,
      align: "left",
    },
  );

// Total amount
doc
  .font("Helvetica-Bold")
  .fontSize(12)
  .fillColor(darkColor)
  .text(
    formatMoney(invoice.totalAmount),
    summaryX + 95,
    y + 8,
    {
      width: 103,
      align: "right",
      lineBreak: false,
    },
  );

  // ============================================================
  // FOOTER
  // ============================================================

  const footerY = 755;

  doc
    .moveTo(pageLeft, footerY - 8)
    .lineTo(pageRight, footerY - 8)
    .lineWidth(0.5)
    .strokeColor(borderColor)
    .stroke();

  doc
    .font("Helvetica")
    .fontSize(7.5)
    .fillColor(mutedColor)
    .text(
      documentFooter,
      pageLeft,
      footerY,
      {
        width: 300,
        align: "left",
      },
    );

  doc
    .fontSize(7)
    .fillColor(mutedColor)
    .text(
      systemName,
      pageRight - 150,
      footerY,
      {
        width: 150,
        align: "right",
      },
    );

  // ============================================================
  // PAGE NUMBERS
  // ============================================================

  const range = doc.bufferedPageRange();

  for (let i = 0; i < range.count; i++) {
    doc.switchToPage(i);

    doc
      .font("Helvetica")
      .fontSize(7)
      .fillColor(mutedColor)
      .text(
        `Page ${i + 1} of ${range.count}`,
        pageLeft,
        770,
        {
          width: pageWidth,
          align: "center",
        },
      );
  }

  doc.end();
};


const generateSupplierPOPDF = ({
  supplierPO,
  settings,
  res,
}) => {
  const doc = new PDFDocument({
    size: "A4",
    margin: 50,
    bufferPages: true,
  });

  res.setHeader("Content-Type", "application/pdf");

  res.setHeader(
    "Content-Disposition",
    `inline; filename="${supplierPO.poNumber}.pdf"`,
  );

  doc.pipe(res);

  // ============================================================
  // CONFIG / HELPERS
  // ============================================================

  const currency = settings?.currency || "PHP";

  const currencySymbols = {
    PHP: "PHP\u00A0",
    USD: "$",
  };

  const currencySymbol =
    settings?.currencySymbol ||
    currencySymbols[currency] ||
    currency;

  const formatMoney = (value) => {
    const amount = Number(value || 0);

    return `${currencySymbol}${amount.toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // ============================================================
  // SETTINGS
  // ============================================================

  const businessName =
    settings?.businessName || "Business Name";

  const businessEmail =
    settings?.businessEmail || "";

  const contactNumber =
    settings?.contactNumber || "";

  const businessAddress =
    settings?.businessAddress || "";

  const systemName =
    settings?.appearance?.systemName ||
    settings?.systemName ||
    "System";

  const documentFooter =
    settings?.salesInvoicing?.documentFooter ||
    "Thank you for your business.";

  // ============================================================
  // COLORS / PAGE
  // ============================================================

  const darkColor = "#111827";
  const mutedColor = "#64748B";
  const borderColor = "#CBD5E1";
  const lightBg = "#F8FAFC";

  const pageLeft = 50;
  const pageRight = 545;
  const pageWidth = pageRight - pageLeft;

  const bottomContentLimit = 690;

  // ============================================================
  // HEADER
  // ============================================================

  const headerTop = 45;

  // Business name
  doc
    .font("Helvetica-Bold")
    .fontSize(20)
    .fillColor(darkColor)
    .text(
      businessName,
      pageLeft,
      headerTop,
      {
        width: 290,
      },
    );

  // Business information
  let businessInfoY = headerTop + 28;

  doc
    .font("Helvetica")
    .fontSize(8.5)
    .fillColor(mutedColor);

  if (businessAddress) {
    doc.text(
      businessAddress,
      pageLeft,
      businessInfoY,
      {
        width: 280,
      },
    );

    businessInfoY += 13;
  }

  if (businessEmail) {
    doc.text(
      businessEmail,
      pageLeft,
      businessInfoY,
      {
        width: 280,
      },
    );

    businessInfoY += 13;
  }

  if (contactNumber) {
    doc.text(
      contactNumber,
      pageLeft,
      businessInfoY,
      {
        width: 280,
      },
    );
  }

  // ============================================================
  // SUPPLIER PO HEADER BLOCK
  // ============================================================

  doc
    .font("Helvetica-Bold")
    .fontSize(22)
    .fillColor(darkColor)
    .text(
      "SUPPLIER PO",
      350,
      headerTop,
      {
        width: 195,
        align: "right",
      },
    );

  doc
    .font("Helvetica-Bold")
    .fontSize(9)
    .fillColor(darkColor)
    .text(
      supplierPO.poNumber || "—",
      350,
      headerTop + 34,
      {
        width: 195,
        align: "right",
      },
    );

  doc
    .font("Helvetica")
    .fontSize(8.5)
    .fillColor(mutedColor)
    .text(
      `PO Date: ${formatDate(
        supplierPO.supplierPODate,
      )}`,
      350,
      headerTop + 50,
      {
        width: 195,
        align: "right",
      },
    );

  // Status
  doc
    .font("Helvetica-Bold")
    .fontSize(8.5)
    .fillColor(darkColor)
    .text(
      `Status: ${
        supplierPO.status
          ? supplierPO.status.toUpperCase()
          : "—"
      }`,
      350,
      headerTop + 65,
      {
        width: 195,
        align: "right",
      },
    );

  // Divider
  doc
    .moveTo(pageLeft, 125)
    .lineTo(pageRight, 125)
    .lineWidth(1.2)
    .strokeColor(borderColor)
    .stroke();

  doc
    .lineWidth(1)
    .fillColor(darkColor)
    .strokeColor(borderColor);

  // ============================================================
  // SUPPLIER / CLIENT PO
  // ============================================================

  const infoTop = 145;

  // Supplier block
  doc
    .roundedRect(
      pageLeft,
      infoTop,
      310,
      82,
      6,
    )
    .fillColor(lightBg)
    .fill();

  doc
    .roundedRect(
      pageLeft,
      infoTop,
      310,
      82,
      6,
    )
    .strokeColor(borderColor)
    .stroke();

  doc
    .font("Helvetica-Bold")
    .fontSize(8)
    .fillColor(darkColor)
    .text(
      "SUPPLIER",
      pageLeft + 14,
      infoTop + 12,
    );

  doc
    .font("Helvetica-Bold")
    .fontSize(11)
    .fillColor(darkColor)
    .text(
      supplierPO.supplierId?.name ||
        "Supplier",
      pageLeft + 14,
      infoTop + 29,
      {
        width: 280,
      },
    );

  if (supplierPO.supplierId?.supplierCode) {
    doc
      .font("Helvetica")
      .fontSize(8.5)
      .fillColor(mutedColor)
      .text(
        `Supplier Code: ${supplierPO.supplierId.supplierCode}`,
        pageLeft + 14,
        infoTop + 48,
        {
          width: 280,
        },
      );
  }

  // Related Client PO block
  doc
    .roundedRect(
      375,
      infoTop,
      170,
      82,
      6,
    )
    .fillColor(lightBg)
    .fill();

  doc
    .roundedRect(
      375,
      infoTop,
      170,
      82,
      6,
    )
    .strokeColor(borderColor)
    .stroke();

  doc
    .font("Helvetica-Bold")
    .fontSize(8)
    .fillColor(darkColor)
    .text(
      "RELATED CLIENT PO",
      389,
      infoTop + 12,
    );

  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .fillColor(darkColor)
    .text(
      supplierPO.relatedClientPOId?.poNumber ||
        "—",
      389,
      infoTop + 31,
      {
        width: 140,
      },
    );

  // ============================================================
  // ITEMS TABLE
  // ============================================================

  const tableTop = 255;

  const columns = {
    item: 50,
    product: 78,
    qty: 315,
    unit: 360,
    cost: 395,
    amount: 480,
  };

  const tableWidths = {
    item: 28,
    product: 225,
    qty: 45,
    unit: 35,
    cost: 80,
    amount: 70,
  };

  const drawTableHeader = (y) => {
    doc
      .moveTo(pageLeft, y + 20)
      .lineTo(pageRight, y + 20)
      .lineWidth(0.8)
      .strokeColor(borderColor)
      .stroke();

    doc
      .font("Helvetica-Bold")
      .fontSize(7.5)
      .fillColor(darkColor);

    doc.text(
      "#",
      columns.item,
      y + 3,
      {
        width: tableWidths.item,
      },
    );

    doc.text(
      "PRODUCT / DESCRIPTION",
      columns.product,
      y + 3,
      {
        width: tableWidths.product,
      },
    );

    doc.text(
      "QTY",
      columns.qty,
      y + 3,
      {
        width: tableWidths.qty,
        align: "right",
      },
    );

    doc.text(
      "UNIT",
      columns.unit,
      y + 3,
      {
        width: tableWidths.unit,
        align: "center",
      },
    );

    doc.text(
      "UNIT COST",
      columns.cost,
      y + 3,
      {
        width: tableWidths.cost,
        align: "right",
      },
    );

    doc.text(
      "AMOUNT",
      columns.amount,
      y + 3,
      {
        width: tableWidths.amount,
        align: "right",
      },
    );
  };

  drawTableHeader(tableTop);

  let y = tableTop + 30;

  const items = Array.isArray(supplierPO.items)
    ? supplierPO.items
    : [];

  items.forEach((item, index) => {
    const quantity =
      Number(item.quantity || 0);

    const unitCost =
      Number(item.expectedUnitCost || 0);

    const amount =
      quantity * unitCost;

    const productName =
      item.productId?.name ||
      item.description ||
      "—";

    const description =
      item.description &&
      item.description !== productName
        ? item.description
        : "";

    const productHeight =
      doc.heightOfString(
        productName,
        {
          width: tableWidths.product,
        },
      );

    const descriptionHeight =
      description
        ? doc.heightOfString(
            description,
            {
              width: tableWidths.product,
            },
          )
        : 0;

    const rowHeight =
      Math.max(
        28,
        productHeight +
          descriptionHeight +
          12,
      );

    // New page
    if (
      y + rowHeight >
      bottomContentLimit
    ) {
      doc.addPage();

      y = 55;

      drawTableHeader(y);

      y += 30;
    }

    // Alternating row background
    if (index % 2 === 0) {
      doc
        .rect(
          pageLeft,
          y - 5,
          pageWidth,
          rowHeight,
        )
        .fillColor(lightBg)
        .fill();
    }

    // Item number
    doc
      .font("Helvetica")
      .fontSize(8.5)
      .fillColor(darkColor)
      .text(
        String(index + 1),
        columns.item,
        y,
        {
          width: tableWidths.item,
        },
      );

    // Product
    doc
      .font("Helvetica-Bold")
      .fontSize(8.5)
      .fillColor(darkColor)
      .text(
        productName,
        columns.product,
        y,
        {
          width: tableWidths.product,
        },
      );

    // Description
    if (description) {
      doc
        .font("Helvetica")
        .fontSize(7.5)
        .fillColor(mutedColor)
        .text(
          description,
          columns.product,
          y + productHeight + 2,
          {
            width: tableWidths.product,
          },
        );
    }

    // Quantity
    doc
      .font("Helvetica")
      .fontSize(8.5)
      .fillColor(darkColor)
      .text(
        quantity.toFixed(2),
        columns.qty,
        y,
        {
          width: tableWidths.qty,
          align: "right",
        },
      );

    // Unit
    doc
      .text(
        item.unitCode ||
          item.unitId?.code ||
          "—",
        columns.unit,
        y,
        {
          width: tableWidths.unit,
          align: "center",
        },
      );

    // Unit Cost
    doc
      .text(
        formatMoney(unitCost),
        columns.cost,
        y,
        {
          width: tableWidths.cost,
          align: "right",
        },
      );

    // Amount
    doc
      .font("Helvetica-Bold")
      .text(
        formatMoney(amount),
        columns.amount,
        y,
        {
          width: tableWidths.amount,
          align: "right",
        },
      );

    // Row divider
    doc
      .moveTo(
        pageLeft,
        y + rowHeight - 5,
      )
      .lineTo(
        pageRight,
        y + rowHeight - 5,
      )
      .lineWidth(0.5)
      .strokeColor(borderColor)
      .stroke();

    y += rowHeight;
  });

  // ============================================================
  // FINANCIAL SUMMARY
  // ============================================================

  y += 10;

  if (y > 610) {
    doc.addPage();

    y = 55;
  }

const summaryX = 325;
const summaryWidth = 220;

  // Summary top border
  doc
    .moveTo(summaryX, y)
    .lineTo(pageRight, y)
    .lineWidth(1)
    .strokeColor(borderColor)
    .stroke();

  y += 13;

  

  // Total box
  doc
    .roundedRect(
      summaryX,
      y - 4,
      summaryWidth,
      38,
      5,
    )
    .lineWidth(0.8)
    .strokeColor(borderColor)
    .stroke();

  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .fillColor(darkColor)
    .text(
      "TOTAL",
      summaryX + 12,
      y + 8,
      {
        width: 80,
        align: "left",
      },
    );

  doc
    .font("Helvetica-Bold")
    .fontSize(12)
    .fillColor(darkColor)
    .text(
      formatMoney(supplierPO.totalAmount),
      summaryX + 95,
      y + 8,
      {
        width: 103,
        align: "right",
        lineBreak: false,
      },
    );

  // ============================================================
  // FOOTER
  // ============================================================

  const footerY = 755;

  doc
    .moveTo(pageLeft, footerY - 8)
    .lineTo(pageRight, footerY - 8)
    .lineWidth(0.5)
    .strokeColor(borderColor)
    .stroke();

  doc
    .font("Helvetica")
    .fontSize(7.5)
    .fillColor(mutedColor)
    .text(
      documentFooter,
      pageLeft,
      footerY,
      {
        width: 300,
        align: "left",
      },
    );

  doc
    .fontSize(7)
    .fillColor(mutedColor)
    .text(
      systemName,
      pageRight - 150,
      footerY,
      {
        width: 150,
        align: "right",
      },
    );

  // ============================================================
  // PAGE NUMBERS
  // ============================================================

  const range = doc.bufferedPageRange();

  for (
    let i = 0;
    i < range.count;
    i++
  ) {
    doc.switchToPage(i);

    doc
      .font("Helvetica")
      .fontSize(7)
      .fillColor(mutedColor)
      .text(
        `Page ${i + 1} of ${range.count}`,
        pageLeft,
        770,
        {
          width: pageWidth,
          align: "center",
        },
      );
  }

  doc.end();
};

module.exports = {
  generateQuotationPDF,
  generateInvoicePDF,
  generateSupplierPOPDF,
};



