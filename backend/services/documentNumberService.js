const DocumentCounter = require("../models/DocumentCounter");
const Settings = require("../models/Settings");

const DOCUMENT_CONFIG = {
  quotation: {
    prefixField: "quotationPrefix",
    startingNumberField: "quotationStartingNumber",
  },

  invoice: {
    prefixField: "invoicePrefix",
    startingNumberField: "invoiceStartingNumber",
  },
};

const PAD_LENGTH = 6;

const generateDocumentNumber = async (
  documentType,
  year = new Date().getFullYear()
) => {
  const config = DOCUMENT_CONFIG[documentType];

  if (!config) {
    throw new Error(`Unsupported document type: ${documentType}`);
  }

  const settings = await Settings.findOne();

  if (!settings) {
    throw new Error("System settings not found");
  }

  const salesInvoicing = settings.salesInvoicing || {};

  const prefix = salesInvoicing[config.prefixField];
  const startingNumber = salesInvoicing[config.startingNumberField];

  if (!prefix) {
    throw new Error(`Prefix is not configured for ${documentType}`);
  }

  if (!Number.isInteger(startingNumber) || startingNumber < 1) {
    throw new Error(
      `Starting number is not configured correctly for ${documentType}`
    );
  }

  // Initialize the yearly counter if it does not exist yet.
  // A unique index on { documentType, year } protects against
  // concurrent initialization.
  let counter = await DocumentCounter.findOne({
    documentType,
    year,
  });

  if (!counter) {
    try {
      counter = await DocumentCounter.create({
        documentType,
        year,
        sequence: startingNumber - 1,
      });
    } catch (error) {
      // Another request may have created the counter at the same time.
      // In that case, simply fetch the existing counter.
      if (error?.code === 11000) {
        counter = await DocumentCounter.findOne({
          documentType,
          year,
        });
      } else {
        throw error;
      }
    }
  }

  // Atomically increment the sequence.
  counter = await DocumentCounter.findOneAndUpdate(
    {
      documentType,
      year,
    },
    {
      $inc: {
        sequence: 1,
      },
    },
    {
      returnDocument: "after",
    }
  );

  if (!counter) {
    throw new Error(`Failed to generate counter for ${documentType}`);
  }

  const paddedSequence = String(counter.sequence).padStart(
    PAD_LENGTH,
    "0"
  );

  return `${prefix}${year}-${paddedSequence}`;
};

module.exports = {
  generateDocumentNumber,
};