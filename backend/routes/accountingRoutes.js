const express = require("express");
const router = express.Router();

const {
  getAccounts,
  getAccountById,
  createAccount,
  updateAccount,
  deleteAccount,
  getJournalEntries,
  getJournalEntryById,
  createJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
  getGeneralLedger,
  getTrialBalance,
} = require("../controllers/accountingController");

const authorize = require("../middleware/authorize");
const protect = require("../middleware/authMiddleware");

const {
  chartOfAccountValidator,
  chartOfAccountUpdateValidator,
  journalEntryValidator,
  journalEntryUpdateValidator,
} = require("../validators/accountingValidator");

const validationMiddleware = require("../middleware/validationMiddleware");

/*
|--------------------------------------------------------------------------
| Chart of Accounts
|--------------------------------------------------------------------------
*/

router.get(
  "/accounts",
  protect,
  authorize("owner", "admin", "accounting"),
  getAccounts
);

router.get(
  "/accounts/:id",
  protect,
  authorize("owner", "admin", "accounting"),
  getAccountById
);

router.post(
  "/accounts",
  protect,
  authorize("owner", "admin", "accounting"),
  chartOfAccountValidator,
  validationMiddleware,
  createAccount
);

router.put(
  "/accounts/:id",
  protect,
  authorize("owner", "admin", "accounting"),
  chartOfAccountUpdateValidator,
  validationMiddleware,
  updateAccount
);

router.delete(
  "/accounts/:id",
  protect,
  authorize("owner", "admin", "accounting"),
  deleteAccount
);

/*
|--------------------------------------------------------------------------
| Journal Entries
|--------------------------------------------------------------------------
*/

router.get(
  "/journal-entries",
  protect,
  authorize("owner", "admin", "accounting"),
  getJournalEntries
);

router.get(
  "/journal-entries/:id",
  protect,
  authorize("owner", "admin", "accounting"),
  getJournalEntryById
);

router.post(
  "/journal-entries",
  protect,
  authorize("owner", "admin", "accounting"),
  journalEntryValidator,
  validationMiddleware,
  createJournalEntry
);

router.put(
  "/journal-entries/:id",
  protect,
  authorize("owner", "admin", "accounting"),
  journalEntryUpdateValidator,
  validationMiddleware,
  updateJournalEntry
);

router.delete(
  "/journal-entries/:id",
  protect,
  authorize("owner", "admin", "accounting"),
  deleteJournalEntry
);

/*
|--------------------------------------------------------------------------
| Accounting Reports
|--------------------------------------------------------------------------
*/

router.get(
  "/ledger",
  protect,
  authorize("owner", "admin", "accounting"),
  getGeneralLedger
);

router.get(
  "/trial-balance",
  protect,
  authorize("owner", "admin", "accounting"),
  getTrialBalance
);

module.exports = router;