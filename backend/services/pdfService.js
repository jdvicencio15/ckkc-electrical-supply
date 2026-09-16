
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

  // =========================
  // MONEY FORMAT
  // =========================
  // PDFKit's default Helvetica font does not
  // reliably support the ₱ Unicode character.
  // Use PHP to avoid broken glyph rendering.
  const currency = settings?.currency || "PHP";

 const formatMoney = (value) => {
  const amount = Number(value || 0);

  return `${currency} ${amount.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

  const businessName =
    settings?.businessName || "Business Name";

  const businessEmail =
    settings?.businessEmail || "";

  const contactNumber =
    settings?.contactNumber || "";

  const businessAddress =
    settings?.businessAddress || "";

  const systemName =
    settings?.appearance?.systemName || "System";

  const footer =
    settings?.salesInvoicing?.documentFooter || "";

  // =========================
  // HEADER
  // =========================

  doc
    .fontSize(20)
    .font("Helvetica-Bold")
    .text(businessName);

  doc
    .fontSize(9)
    .font("Helvetica")
    .fillColor("#555555");

  if (businessAddress) {
    doc.text(businessAddress);
  }

  if (businessEmail) {
    doc.text(businessEmail);
  }

  if (contactNumber) {
    doc.text(contactNumber);
  }

  doc.fillColor("#000000");

  doc.moveDown(1);

  // =========================
  // DOCUMENT TITLE
  // =========================

  doc
    .fontSize(22)
    .font("Helvetica-Bold")
    .text("QUOTATION", {
      align: "right",
    });

  doc
    .fontSize(10)
    .font("Helvetica")
    .text(
      `Quotation No.: ${quotation.quotationNumber}`,
      {
        align: "right",
      },
    );

  doc.text(
    `Date: ${new Date(
      quotation.quotationDate,
    ).toLocaleDateString("en-PH")}`,
    {
      align: "right",
    },
  );

  doc.moveDown(1.5);

  // =========================
  // CUSTOMER
  // =========================

  doc
    .fontSize(10)
    .font("Helvetica-Bold")
    .text("Bill / Quote To:");

  doc
    .fontSize(11)
    .font("Helvetica")
    .text(
      quotation.customerId?.name ||
        "Customer",
    );

  if (quotation.customerId?.customerCode) {
    doc
      .fontSize(9)
      .fillColor("#555555")
      .text(
        `Customer Code: ${quotation.customerId.customerCode}`,
      );
  }

  doc.fillColor("#000000");

  doc.moveDown(1.5);

  // =========================
  // TABLE
  // =========================

  const tableTop = doc.y;

  const columns = {
    item: 50,
    description: 135,
    qty: 350,
    unit: 395,
    price: 440,
    amount: 500,
  };

  doc
    .fontSize(8)
    .font("Helvetica-Bold");

  doc.text("Item", columns.item, tableTop);

  doc.text(
    "Description",
    columns.description,
    tableTop,
  );

  doc.text(
    "Qty",
    columns.qty,
    tableTop,
    {
      width: 35,
      align: "right",
    },
  );

  doc.text(
    "Unit",
    columns.unit,
    tableTop,
    {
      width: 40,
      align: "center",
    },
  );

  doc.text(
    "Unit Price",
    columns.price,
    tableTop,
    {
      width: 55,
      align: "right",
    },
  );

  doc.text(
    "Amount",
    columns.amount,
    tableTop,
    {
      width: 45,
      align: "right",
    },
  );

  doc
    .moveTo(50, tableTop + 15)
    .lineTo(545, tableTop + 15)
    .stroke();

  let y = tableTop + 25;

  doc
    .font("Helvetica")
    .fontSize(8);

  quotation.items.forEach((item, index) => {
    const quantity =
      Number(item.quantity || 0);

    const unitPrice =
      Number(item.quotedUnitPrice || 0);

    const amount =
      quantity * unitPrice;

    if (y > 700) {
      doc.addPage();

      y = 50;
    }

    doc.text(
      String(index + 1),
      columns.item,
      y,
      {
        width: 70,
      },
    );

    doc.text(
      item.description || "",
      columns.description,
      y,
      {
        width: 205,
      },
    );

    doc.text(
      quantity.toFixed(2),
      columns.qty,
      y,
      {
        width: 35,
        align: "right",
      },
    );

    doc.text(
      item.unitCode || "",
      columns.unit,
      y,
      {
        width: 40,
        align: "center",
      },
    );

    doc.text(
      formatMoney(unitPrice),
      columns.price,
      y,
      {
        width: 55,
        align: "right",
      },
    );

    doc.text(
      formatMoney(amount),
      columns.amount,
      y,
      {
        width: 45,
        align: "right",
      },
    );

    y += 24;
  });

  // =========================
  // TOTALS
  // =========================

  y += 10;

  doc
    .moveTo(330, y)
    .lineTo(545, y)
    .stroke();

  y += 15;

  doc
    .fontSize(9)
    .font("Helvetica");

  doc.text(
    "Subtotal:",
    370,
    y,
    {
      width: 100,
      align: "right",
    },
  );

  doc.text(
    formatMoney(quotation.subtotal),
    475,
    y,
    {
      width: 70,
      align: "right",
    },
  );

  y += 18;

  if (Number(quotation.taxRate || 0) > 0) {
    doc.text(
      `VAT (${quotation.taxRate}%):`,
      370,
      y,
      {
        width: 100,
        align: "right",
      },
    );

    doc.text(
      formatMoney(quotation.taxAmount),
      475,
      y,
      {
        width: 70,
        align: "right",
      },
    );

    y += 18;
  }

  doc
    .font("Helvetica-Bold")
    .fontSize(11);

  doc.text(
    "TOTAL:",
    370,
    y,
    {
      width: 100,
      align: "right",
    },
  );

  doc.text(
    formatMoney(quotation.total),
    475,
    y,
    {
      width: 70,
      align: "right",
    },
  );

  y += 35;

  // =========================
  // PAYMENT TERMS
  // =========================

  const paymentTerms =
    settings?.salesInvoicing
      ?.defaultPaymentTerms;

  if (paymentTerms) {
    doc
      .fontSize(9)
      .font("Helvetica-Bold")
      .text("Payment Terms:");

    doc
      .font("Helvetica")
      .text(paymentTerms);

    y = doc.y + 20;
  }

  // =========================
  // DOCUMENT FOOTER
  // =========================

  if (footer) {
    doc
      .fontSize(8)
      .fillColor("#666666")
      .text(
        footer,
        50,
        740,
        {
          width: 495,
          align: "center",
        },
      );
  }

  doc
    .fontSize(7)
    .fillColor("#999999")
    .text(
      systemName,
      50,
      765,
      {
        width: 495,
        align: "center",
      },
    );

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

  // =========================
  // MONEY FORMAT
  // =========================

  const currency = settings?.currency || "PHP";

  const formatMoney = (value) => {
    const amount = Number(value || 0);

    return `${currency} ${amount.toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

 const subtotalLabel =
  invoice.pricingMode === "inclusive"
    ? "Subtotal (VAT Inclusive)"
    : "Subtotal";

const vatLabel =
  invoice.pricingMode === "inclusive"
    ? `VAT Included (${invoice.taxRate}%)`
    : `VAT (${invoice.taxRate}%)`;


  const businessName =
    settings?.businessName || "Business Name";

  const businessEmail =
    settings?.businessEmail || "";

  const contactNumber =
    settings?.contactNumber || "";

  const businessAddress =
    settings?.businessAddress || "";

  const systemName =
    settings?.appearance?.systemName || "System";

  const footer =
    settings?.salesInvoicing?.documentFooter || "";

  // =========================
  // HEADER
  // =========================

  doc
    .fontSize(20)
    .font("Helvetica-Bold")
    .text(businessName);

  doc
    .fontSize(9)
    .font("Helvetica")
    .fillColor("#555555");

  if (businessAddress) {
    doc.text(businessAddress);
  }

  if (businessEmail) {
    doc.text(businessEmail);
  }

  if (contactNumber) {
    doc.text(contactNumber);
  }

  doc.fillColor("#000000");

  doc.moveDown(1);

  // =========================
  // DOCUMENT TITLE
  // =========================

  doc
    .fontSize(22)
    .font("Helvetica-Bold")
    .text("INVOICE", {
      align: "right",
    });

  doc
    .fontSize(10)
    .font("Helvetica")
    .text(
      `Invoice No.: ${invoice.invoiceNumber}`,
      {
        align: "right",
      },
    );

  doc.text(
    `Date: ${new Date(
      invoice.invoiceDate,
    ).toLocaleDateString("en-PH")}`,
    {
      align: "right",
    },
  );

  if (invoice.dueDate) {
    doc.text(
      `Due Date: ${new Date(
        invoice.dueDate,
      ).toLocaleDateString("en-PH")}`,
      {
        align: "right",
      },
    );
  }

  doc.moveDown(1.5);

  // =========================
  // CUSTOMER
  // =========================

  doc
    .fontSize(10)
    .font("Helvetica-Bold")
    .text("Bill To:");

  doc
    .fontSize(11)
    .font("Helvetica")
    .text(
      invoice.customerId?.name ||
        "Customer",
    );

  if (invoice.customerId?.customerCode) {
    doc
      .fontSize(9)
      .fillColor("#555555")
      .text(
        `Customer Code: ${invoice.customerId.customerCode}`,
      );
  }

  doc.fillColor("#000000");

  doc.moveDown(1.5);

  // =========================
  // TABLE
  // =========================

  const tableTop = doc.y;

  const columns = {
    item: 50,
    description: 135,
    qty: 350,
    unit: 395,
    price: 440,
    amount: 500,
  };

  doc
    .fontSize(8)
    .font("Helvetica-Bold");

  doc.text(
    "Item",
    columns.item,
    tableTop,
  );

  doc.text(
    "Description",
    columns.description,
    tableTop,
  );

  doc.text(
    "Qty",
    columns.qty,
    tableTop,
    {
      width: 35,
      align: "right",
    },
  );

  doc.text(
    "Unit",
    columns.unit,
    tableTop,
    {
      width: 40,
      align: "center",
    },
  );

  doc.text(
    "Unit Price",
    columns.price,
    tableTop,
    {
      width: 55,
      align: "right",
    },
  );

  doc.text(
    "Amount",
    columns.amount,
    tableTop,
    {
      width: 45,
      align: "right",
    },
  );

  doc
    .moveTo(50, tableTop + 15)
    .lineTo(545, tableTop + 15)
    .stroke();

  let y = tableTop + 25;

  doc
    .font("Helvetica")
    .fontSize(8);

  invoice.items.forEach((item, index) => {
    const quantity =
      Number(item.quantity || 0);

    const unitPrice =
      Number(item.unitPrice || 0);

    const amount =
      quantity * unitPrice;

    if (y > 700) {
      doc.addPage();

      y = 50;
    }

    doc.text(
      String(index + 1),
      columns.item,
      y,
      {
        width: 70,
      },
    );

    doc.text(
      item.description || "",
      columns.description,
      y,
      {
        width: 205,
      },
    );

    doc.text(
      quantity.toFixed(2),
      columns.qty,
      y,
      {
        width: 35,
        align: "right",
      },
    );

    doc.text(
      item.unitCode || "",
      columns.unit,
      y,
      {
        width: 40,
        align: "center",
      },
    );

    doc.text(
      formatMoney(unitPrice),
      columns.price,
      y,
      {
        width: 55,
        align: "right",
      },
    );

    doc.text(
      formatMoney(amount),
      columns.amount,
      y,
      {
        width: 45,
        align: "right",
      },
    );

    y += 24;
  });

  // =========================
  // TOTALS
  // =========================

  y += 10;

  doc
    .moveTo(330, y)
    .lineTo(545, y)
    .stroke();

  y += 15;

  doc
    .fontSize(9)
    .font("Helvetica");

  doc.text(
    subtotalLabel,
    370,
    y,
    {
      width: 100,
      align: "right",
    },
  );

  doc.text(
    formatMoney(invoice.subtotal),
    475,
    y,
    {
      width: 70,
      align: "right",
    },
  );

  y += 18;

 if (
  Number(invoice.taxRate || 0) > 0 &&
  Number(invoice.taxAmount || 0) > 0
) {
    doc.text(
        vatLabel,
      370,
      y,
      {
        width: 100,
        align: "right",
      },
    );

    doc.text(
      formatMoney(invoice.taxAmount),
      475,
      y,
      {
        width: 70,
        align: "right",
      },
    );

    y += 18;
  }

  doc
    .font("Helvetica-Bold")
    .fontSize(11);

  doc.text(
    "TOTAL:",
    370,
    y,
    {
      width: 100,
      align: "right",
    },
  );

  doc.text(
    formatMoney(invoice.totalAmount),
    455,
    y,
    {
      width: 90,
      align: "right",
    },
  );

  y += 35;

  // =========================
  // PAYMENT TERMS
  // =========================

  const paymentTerms =
    settings?.salesInvoicing
      ?.defaultPaymentTerms;

  if (paymentTerms) {
    doc
      .fontSize(9)
      .font("Helvetica-Bold")
      .text("Payment Terms:");

    doc
      .font("Helvetica")
      .text(paymentTerms);

    y = doc.y + 20;
  }

  // =========================
  // DOCUMENT FOOTER
  // =========================

  if (footer) {
    doc
      .fontSize(8)
      .fillColor("#666666")
      .text(
        footer,
        50,
        740,
        {
          width: 495,
          align: "center",
        },
      );
  }

  doc
    .fontSize(7)
    .fillColor("#999999")
    .text(
      systemName,
      50,
      765,
      {
        width: 495,
        align: "center",
      },
    );

  doc.end();
};

module.exports = {
  generateQuotationPDF,
  generateInvoicePDF,
};



