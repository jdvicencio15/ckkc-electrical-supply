# Database Design

## 1. Purpose

This document defines the proposed database architecture for the CKKC
Electrical Supply Management System.

The design is based on:

- Client Interview
- Business Process
- System Requirements
- System Entities

The database will use MongoDB with Mongoose.

This document defines:

- Collections
- Document structure
- Relationships
- References
- Embedded documents
- Historical data requirements
- Inventory costing approach
- Transaction relationships

Actual Mongoose schemas and implementation code will be created only
after this design has been reviewed.

---

# 2. Database Design Principles

The database should prioritize:

- Historical accuracy
- Traceability
- Data integrity
- Simple querying
- Clear relationships
- Business transaction history
- Inventory accuracy
- Profitability calculation

The system should preserve important historical values instead of
depending entirely on current master data.

For example:

If a product currently costs ₱150 but was purchased previously at ₱100,
the old purchase must continue to show ₱100.

---

# 3. Proposed Collections

The Phase 1 MVP will contain the following collections.

## Core / Master Data

- users
- customers
- suppliers
- products
- categories
- supplierPricing

## Sales

- quotations
- clientPos
- sales

## Purchasing

- supplierPos
- purchases

## Inventory

- inventoryMovements

## Financial / Operational

- expenses
- commissions

---

## Phase 2 Collections

The following collections are intentionally excluded from the Phase 1
MVP:

- fabricationRecords
- productDesignRecords
- billOfMaterials
- projectTemplates

These will be designed separately when Phase 2 development is approved.

Phase 2 may also include:

- Advanced profitability
- Advanced analytics
- Automatic notifications
- Mobile application
- Other advanced project-related features

---

# 4. Users Collection

## Collection

```text
users

Purpose
Stores users who can access the system.

Main Fields
_id
firstName
lastName
email
passwordHash
role
status
createdAt
updatedAt
Role Values
owner
sales
purchasing
accounting

Relationships
Users may be referenced by transaction records to identify who created
or modified a record.
createdBy → User
updatedBy → User

5. Customers Collection
Collection
customers
Purpose
Stores customer information.
Main Fields
_id
customerCode
name
contactPerson
email
phone
address
status
createdAt
updatedAt
Relationships
Customer
 ├── Quotations
 ├── Client POs
 └── Sales
Transactions should reference the customer rather than duplicating the
entire customer document.
Example:
customerId → customers._id

6. Suppliers Collection
Collection
suppliers
Purpose
Stores supplier information.
Main Fields
_id
supplierCode
name
contactPerson
email
phone
address
supplierType
status
createdAt
updatedAt
Supplier Type
local
international
Relationships
Supplier
 ├── Supplier POs
 └── Purchases
Products supplied by a supplier are represented through supplier pricing
records and purchasing history.

7. Categories Collection
Collection
categories
Purpose
Classifies products and materials.
Main Fields
_id
name
description
status
createdAt
updatedAt
Example Categories
Cable
Electrical Equipment
Panelboard
Accessories
Fabrication Materials
Categories may be expanded as the business grows.

8. Products Collection
Collection
products
Purpose
Stores products and materials handled by CKKC.
Main Fields
_id
sku
name
description
categoryId
unit
minimumStock
currentStock
status
createdAt
updatedAt
Important Rule
The Product document represents the current state of the product.
It should NOT be used to overwrite historical purchase prices.
Historical purchase costs belong to purchase transaction records.
For example:
Current Product Cost = ₱150

Historical Purchase Cost = ₱100
The historical purchase must continue to show ₱100 even if the current
product or supplier pricing changes.
9. Supplier Pricing Collection
Collection
supplierPricing
Purpose
Stores supplier pricing information for specific products or materials.
This allows CKKC to compare supplier prices when preparing quotations
or planning purchases.
Main Fields
_id
supplierId
productId
unitCost
currency
effectiveDate
isActive
createdAt
updatedAt
Relationships
Supplier
   ↓
Supplier Pricing
   ↓
Product
A supplier may provide multiple products.
A product may be available from multiple suppliers.
Therefore:
Supplier ←→ Product
is a many-to-many business relationship.
The supplierPricing collection represents this relationship for the
MVP.
Historical Pricing
Supplier pricing history should be preserved when prices change.
Example:
Supplier A
Cable
₱100
effectiveDate: January 2026

Supplier A
Cable
₱115
effectiveDate: March 2026

Supplier A
Cable
₱120
effectiveDate: June 2026
The system should not overwrite historical pricing if the business
needs to review previous supplier prices.
Actual purchase prices must still be stored separately in the
purchases collection.
10. Quotations Collection
Collection
quotations
Purpose
Stores quotations prepared for customers.
Document Structure
A quotation should contain a header and embedded line items.
Conceptually:
Quotation
 ├── quotationNumber
 ├── customerId
 ├── quotationDate
 ├── status
 ├── items[]
 │    ├── productId
 │    ├── description
 │    ├── quantity
 │    ├── unitPrice
 │    ├── supplierCost
 │    └── markup
 ├── laborCost
 ├── otherDirectCosts
 ├── subtotal
 ├── total
 └── createdBy
Why Embed Items?
Quotation items belong specifically to the quotation.
Embedding them keeps the quotation document together and preserves the
historical quoted values.
11. Historical Quotation Pricing
Quotation line items should preserve important historical values.
For example:
supplierCostAtQuotation
quotedUnitPrice
markup
should be stored in the quotation item.
The system must not depend on the current product price or current
supplier pricing to reconstruct an old quotation.
Example
Current Product Cost:
₱150
Old Quotation:
Supplier Cost = ₱100
Quoted Price  = ₱160
The old quotation must continue to show:
Supplier Cost = ₱100
Quoted Price  = ₱160
even after the product's current pricing changes.
12. Client POs Collection
Collection
clientPos
Purpose
Stores Purchase Orders received from customers.
Document Structure
ClientPO
 ├── poNumber
 ├── customerId
 ├── quotationId
 ├── poDate
 ├── status
 ├── items[]
 │    ├── productId
 │    ├── description
 │    ├── quantity
 │    └── agreedUnitPrice
 ├── totalAmount
 └── createdBy
Important Rule
The Client PO should preserve the customer's agreed order values.
It should not simply copy the current product selling price.
The Client PO should retain the price and quantities agreed upon at the
time the customer placed the order.
13. Supplier POs Collection
Collection
supplierPos
Purpose
Stores Purchase Orders created by CKKC and sent to suppliers.
Document Structure
SupplierPO
 ├── poNumber
 ├── supplierId
 ├── supplierPODate
 ├── status
 ├── relatedClientPOId
 ├── items[]
 │    ├── productId
 │    ├── description
 │    ├── quantity
 │    └── expectedUnitCost
 ├── totalAmount
 └── createdBy
Important Rule
relatedClientPOId should be optional.
This supports both customer-related purchases and general inventory
purchases.
Customer-Related Purchase
Client PO
    ↓
Supplier PO
General Inventory Purchase
Supplier PO
    ↓
Purchase
A Supplier PO does not require a related Client PO.
14. Purchases Collection
Collection
purchases
Purpose
Stores actual purchases from suppliers.
A Purchase represents what was actually purchased, not merely what was
ordered.
Document Structure
Purchase
 ├── purchaseNumber
 ├── supplierId
 ├── supplierPOId
 ├── relatedClientPOId
 ├── purchaseDate
 ├── items[]
 │    ├── productId
 │    ├── quantity
 │    ├── actualUnitCost
 │    └── totalCost
 ├── totalAmount
 └── createdBy
Important Rule
actualUnitCost must represent the actual purchase cost.
Example:
Supplier PO Expected Cost = ₱100
Actual Purchase Cost      = ₱120
The Purchase must record:
actualUnitCost = ₱120
The original Supplier PO remains unchanged.
This preserves the difference between the expected supplier price and
the actual purchase price.
15. Receiving Design
Receiving is closely related to purchasing.
For the MVP, receiving information may be stored inside the Purchase
transaction.
Example:
Purchase
 ├── orderedQuantity
 ├── receivedQuantity
 └── actualUnitCost
However, if partial receiving becomes a confirmed business requirement,
receiving should become a separate transaction entity.
Possible future structure:
Supplier PO
     ↓
Purchase
     ↓
Receiving
     ↓
Inventory Movement
Current Decision
Partial receiving is still TBD.
Therefore, a separate receivings collection is NOT required for the
initial database design.
The MVP should avoid introducing a separate receiving workflow until
the actual business process is confirmed.

16. Inventory Movements Collection
Collection:
inventoryMovements
Purpose
Maintains the complete audit trail of all stock changes.
Document Structure
InventoryMovement
├── productId
├── type
├── quantity
├── unitCost
├── referenceType
├── referenceId
├── date
├── notes
└── createdBy
Movement Types
IN
OUT
ADJUSTMENT
Reference Types
PURCHASE
SALE
ADJUSTMENT
Example
type = IN
quantity = 100
unitCost = ₱100
referenceType = PURCHASE
referenceId = Purchase._id
The referenceId allows the inventory movement to be traced back to the transaction that caused the stock change.
17. Current Stock
The system needs to maintain the current quantity of each product.
The initial design will maintain:
products.currentStock
while also preserving the complete inventory movement history.
Conceptual Flow
Stock IN
   +
Stock OUT
   +
Adjustments
   ↓
Current Stock
Important Rule
currentStock should never be changed arbitrarily.
Stock changes should originate from valid inventory transactions.
For example:
Purchase completed
      ↓
Inventory Movement
      ↓
IN
      ↓
Product.currentStock increases
and:
Sale completed/released
      ↓
Inventory Movement
      ↓
OUT
      ↓
Product.currentStock decreases
Inventory movements provide the audit trail needed to verify the current stock balance.
18. Inventory Costing
Inventory costing is one of the most important business decisions affecting profitability calculations.
The system must support historical purchase costs.
Example
Purchase 1 → 100 units @ ₱100
Purchase 2 → 100 units @ ₱120
The system must not simply assume that the product's current cost is the cost of every unit in inventory.
Initial Design Decision
For the Phase 1 MVP, the system will preserve the actual purchase cost associated with each inventory movement.
Example:
Inventory Movement 1
100 units
₱100/unit

Inventory Movement 2
100 units
₱120/unit
The exact costing method used to determine the cost of goods sold remains:
TBD
Possible methods:
- FIFO
- Weighted Average Cost
- Specific Cost
- Latest Cost
Recommendation
FIFO or Weighted Average Cost should be evaluated before implementing automated profitability calculations.
The chosen costing method should be implemented in the business logic rather than modifying historical purchase records.
19. Sales Collection
Collection:
sales
Purpose
Stores completed or recorded sales transactions.
Document Structure
Sale
├── salesNumber
├── customerId
├── clientPOId
├── saleDate
├── status
├── items[]
│   ├── productId
│   ├── description
│   ├── quantity
│   ├── unitPrice
│   ├── unitCost
│   └── profit
├── subtotal
├── directExpenses
├── commission
├── totalAmount
├── totalCost
├── totalProfit
└── createdBy
Historical Values
The Sale must preserve the values that were valid at the time of the transaction:
- Selling price
- Cost used for profitability calculation
- Quantity sold
- Direct expenses
- Commission
- Calculated profit
The system should not recalculate historical sales using the current product price or current product cost.
Example
Product Current Cost = ₱150

Historical Sale:
Quantity = 10
Selling Price = ₱180
Cost Used = ₱120
Profit = ₱600
Even if the product's current cost later becomes ₱150, the historical sale must continue to use the recorded cost of ₱120.
20. Sale → Inventory
When a sale is completed or released, the system should create a Stock OUT inventory movement.
Conceptual Flow
Sale
  ↓
Inventory Movement
  ↓
OUT
  ↓
Product.currentStock decreases
The inventory movement must reference the related Sale.
Example:
referenceType = SALE
referenceId = Sale._id
This allows the system to trace exactly which sale caused the inventory reduction.
21. Expenses Collection
Collection:
expenses
Purpose
Stores business expenses.
Document Structure
Expense
├── expenseDate
├── category
├── description
├── amount
├── saleId
├── clientPOId
├── referenceType
├── referenceId
└── createdBy
Categories
DIRECT
OPERATING
Direct Expenses
Direct expenses may be associated with a specific transaction.
Example:
Expense
├── category = DIRECT
├── amount = ₱5,000
├── referenceType = SALE
└── referenceId = Sale._id
Operating Expenses
Operating expenses may not be associated with any particular sale or Client PO.
Example:
Expense
├── category = OPERATING
├── amount = ₱10,000
└── referenceId = null
Transaction references should therefore remain optional.
22. Commissions Collection
Collection:
commissions
Purpose
Stores commission information related to sales or Client POs.
Proposed Structure
Commission
├── clientPOId
├── saleId
├── rate
├── baseAmount
├── commissionAmount
└── createdAt
Current Business Rule
The initial commission rate is:
5%
However, the final basis for calculating the commission is still:
TBD
Possible calculation bases include:
- Sales Amount
- Client PO Amount
- Gross Profit
- Other business-defined amount
Design Rule
The commission calculation should be centralized in the business logic.
The database should store the actual values used for the calculation:
rate
baseAmount
commissionAmount
This allows the business rule to change later without redesigning the entire database.
23. Fabrication Records — Phase 2
Fabrication and project costing are excluded from the Phase 1 MVP.
A potential future structure is:
FabricationRecord
├── projectName
├── customerId
├── description
├── estimatedCost
├── actualCost
├── estimatedProfit
├── actualProfit
├── status
├── notes
└── createdAt
This entity will be designed and implemented separately when the Fabrication / Project Costing module is approved for Phase 2.
The Phase 1 database will not depend on this collection.
24. Product Design Records — Phase 2
Product design history is excluded from the Phase 1 MVP.
A potential future structure is:
ProductDesignRecord
├── name
├── customerId
├── description
├── designReference
├── notes
├── status
└── createdAt
The actual design file/document storage mechanism will be determined during Phase 2 planning.
The Phase 1 database will not depend on this collection.
25. Entity Relationship Summary
The following represents the main relationships between the Phase 1 entities.
Customer
Customer
├──< Quotations
├──< Client POs
└──< Sales
Supplier
Supplier
├──< Supplier POs
└──< Purchases
Product
Product
├──< Quotation Items
├──< Client PO Items
├──< Supplier PO Items
├──< Purchase Items
├──< Inventory Movements
└──< Sale Items
Category
Category
└──< Products
Client PO
Client PO
├──→ Customer
├──→ Quotation
├──< Sales
└──→ Supplier POs (optional)
Supplier PO
Supplier PO
├──→ Supplier
├──< Purchases
└──→ Client PO (optional)
Purchase
Purchase
├──→ Supplier
├──→ Supplier PO
└──< Inventory Movements
Sale
Sale
├──→ Customer
├──→ Client PO
├──< Inventory Movements
├──< Expenses
└──→ Commission
Expense
Expense
├──→ Sale (optional)
├──→ Client PO (optional)
└──→ Reference Transaction (optional)
Phase 2 entities such as Fabrication Records are intentionally excluded from the Phase 1 relationship model.
26. Transaction Traceability
The database should allow users to trace important business transactions from their origin through the resulting inventory and profitability records.
Example Full Transaction Flow
Customer
   ↓
Quotation
   ↓
Client PO
   ↓
Supplier PO
   ↓
Purchase
   ↓
Inventory IN
   ↓
Sale
   ↓
Inventory OUT
   ↓
Expenses
   ↓
Commission
   ↓
Profitability
The complete chain is optional.
A transaction may start at different points depending on the business process.
Example 1 — Customer-Driven Purchase
Client PO
   ↓
Supplier PO
   ↓
Purchase
   ↓
Inventory IN
Example 2 — General Inventory Purchase
Supplier PO
   ↓
Purchase
   ↓
Inventory IN
Example 3 — Existing Inventory Sale
Existing Inventory
   ↓
Sale
   ↓
Inventory OUT
The database should support these different transaction flows without requiring every transaction to have a complete chain.
27. Historical Data Rules
Historical transactions must preserve the values that were valid at the time the transaction occurred.
The system should never depend solely on current master data to reconstruct historical transactions.
Quotation
Preserve:
- Supplier cost at quotation time
- Quoted unit price
- Markup
- Quantity
- Other quotation-specific values
Client PO
Preserve:
- Agreed unit price
- Ordered quantity
- Other agreed transaction values
Supplier PO
Preserve:
- Expected unit cost
- Ordered quantity
Purchase
Preserve:
- Actual purchase price
- Purchased quantity
- Actual transaction totals
Sale
Preserve:
- Selling price
- Cost used for profitability calculation
- Quantity sold
- Profit
Important Rule
Changes to the current Product record must never alter historical transactions.
28. Data Ownership Rules
Master data represents the current state of the business.
Transaction data represents historical business events.
Therefore:
Product
= Current product information
while:
Purchase
= Historical purchase event
and:
Sale
= Historical sales event
This separation prevents changes to current master data from altering historical records.
Example
If:
Current Product Cost = ₱150
but a previous purchase was:
Purchase Cost = ₱100
the historical Purchase must continue to show:
₱100
even after the Product's current cost is changed to ₱150.
29. Payment Entities
Payment-related collections are intentionally excluded from the initial Phase 1 database design.
Potential future entities include:
customerPayments
supplierPayments
accountsReceivable
accountsPayable
These entities should only be introduced after the client's actual customer payment and supplier payment workflows have been confirmed.
The Phase 1 MVP will focus on transaction, inventory, expense, commission, and profitability tracking.
30. Indexing Considerations
Indexes will be designed after the core schemas are finalized.
Likely indexed fields include:
Users
users.email
Customers
customers.customerCode
customers.name
Suppliers
suppliers.supplierCode
suppliers.name
Products
products.sku
products.name
Quotations
quotations.quotationNumber
quotations.customerId
Client POs
clientPos.poNumber
clientPos.customerId
Supplier POs
supplierPos.poNumber
supplierPos.supplierId
Purchases
purchases.purchaseNumber
purchases.supplierId
Sales
sales.salesNumber
sales.customerId
sales.clientPOId
Inventory Movements
inventoryMovements.productId
inventoryMovements.referenceId
inventoryMovements.date
Exact indexes and compound indexes will be finalized during implementation based on actual query patterns.
31. Data Integrity Considerations
The system should prevent or detect the following:
- Duplicate transaction numbers
- Duplicate product SKUs
- Duplicate customer codes
- Duplicate supplier codes
- Negative inventory where not allowed
- Invalid product references
- Invalid customer references
- Invalid supplier references
- Invalid user references
- Invalid transaction relationships
- Accidental deletion of historical transactions
Historical Transaction Protection
Historical transactions should preferably be:
- Archived
- Soft-deleted
- Marked as cancelled/voided
rather than permanently deleted.
This is especially important for:
- Purchases
- Sales
- Client POs
- Supplier POs
- Inventory Movements
- Expenses
The system should maintain an audit trail whenever possible.
32. MongoDB Design Considerations
The system will use MongoDB with Mongoose.
The design will generally follow two approaches:
Embed
Use embedded documents for transaction line items that belong directly to a parent transaction.
Examples:
Quotation.items[]
ClientPO.items[]
SupplierPO.items[]
Purchase.items[]
Sale.items[]
This keeps transaction-specific data together and preserves historical values.
Reference
Use MongoDB ObjectId references for independent entities.
Examples:
customerId
supplierId
productId
categoryId
quotationId
clientPOId
supplierPOId
This provides a balance between document simplicity, queryability, and relationship traceability.
33. Database Design Status
Confirmed Design Decisions
The following decisions are currently confirmed:
- MongoDB will be used.
- Mongoose will be used.
- Transaction line items will generally be embedded.
- Master entities will generally be referenced.
- Historical transaction values will be preserved.
- Inventory movements will provide stock audit history.
- Current stock will be maintained on the Product document.
- Payment entities are excluded from the Phase 1 MVP.
- Full fabrication/project management is excluded from the Phase 1 MVP.
- Product design history is excluded from the Phase 1 MVP.
- BOM and project templates are excluded from the Phase 1 MVP.
TBD / Requires Business Validation
The following still require business or technical validation:
- Inventory costing method
- Partial Client PO fulfillment
- Multiple Sales per Client PO
- Partial Supplier PO receiving
- Multiple receiving transactions
- Commission calculation basis
- Customer payment workflow
- Supplier payment workflow
- Exact Phase 2 fabrication/project scope
- Exact Phase 2 BOM requirements
- Advanced profitability calculation rules
Final Scope Reminder
The database design is intended to support the Phase 1 MVP:
Login & User Roles
Dashboard
Customers
Suppliers
Products / Materials
Supplier Pricing
Quotation
Sales / Client PO
Purchase Orders
Inventory IN / OUT
Expenses
Profit Calculation
Basic Reports
Responsive UI
Phase 2 will be handled separately:
Fabrication / Project Costing
BOM
Project Templates
Design History
Advanced Profitability
Automatic Notifications
Advanced Analytics
Mobile App
Other Future Features
No Mongoose schemas or implementation code should be created until this database design has been reviewed and the remaining TBD business rules have been confirmed.




