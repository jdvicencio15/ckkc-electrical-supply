# System Entities

## 1. Purpose

This document identifies the major business entities required by the
CKKC Electrical Supply Management System.

The entities are derived from:

- Client Interview
- Business Process
- System Requirements

This document defines the business meaning and relationships of each
entity.

Database schemas, field types, indexes, and MongoDB implementation are
not defined yet.

---

# 2. Entity Overview

The initial system contains the following major entities:

### Core / Master Data

- User
- Customer
- Supplier
- Product
- Category

### Sales / Customer Transactions

- Quotation
- Client PO
- Sale

### Purchasing

- Supplier PO
- Purchase

### Inventory

- Inventory Movement

### Financial / Operational

- Expense
- Commission

### Fabrication / Project History

- Fabrication Record
- Product Design Record

---

# 3. User

Represents a person who can access the system.

## Purpose

Used for authentication and role-based access control.

## Main Information

- User identity
- Login credentials
- Role
- Account status

## Roles

- Owner / Admin
- Sales
- Purchasing
- Accounting

## Relationships

```text
User
 └── creates / updates business records


 Create:
adocs/
└── Requirements/
    ├── Client-Interview.md
    ├── Business-Process.md
    ├── System-Requirements.md
    └── Entities.md
Then paste this:
# System Entities

## 1. Purpose

This document identifies the major business entities required by the
CKKC Electrical Supply Management System.

The entities are derived from:

- Client Interview
- Business Process
- System Requirements

This document defines the business meaning and relationships of each
entity.

Database schemas, field types, indexes, and MongoDB implementation are
not defined yet.

---

# 2. Entity Overview

The initial system contains the following major entities:

### Core / Master Data

- User
- Customer
- Supplier
- Product
- Category

### Sales / Customer Transactions

- Quotation
- Client PO
- Sale

### Purchasing

- Supplier PO
- Purchase

### Inventory

- Inventory Movement

### Financial / Operational

- Expense
- Commission

### Fabrication / Project History

- Fabrication Record
- Product Design Record

---

# 3. User

Represents a person who can access the system.

## Purpose

Used for authentication and role-based access control.

## Main Information

- User identity
- Login credentials
- Role
- Account status

## Roles

- Owner / Admin
- Sales
- Purchasing
- Accounting

## Relationships

User
 └── creates / updates business records

#4 Customer
Represents a customer or client who purchases products or services from
CKKC.
Purpose
Centralize customer information and connect customers to their
transactions.
Related Entities
Customer
 ├── Quotations
 ├── Client POs
 └── Sales
 
5. Supplier
Represents a company or individual supplier that provides products or
materials to CKKC.
Purpose
Centralize supplier information and historical purchasing information.
Main Business Information
- Supplier name
- Contact information
- Local / International classification
Related Entities
Supplier
 ├── Supplier POs
 └── Purchases
A supplier may provide multiple products.
A product may be available from multiple suppliers.
Therefore:
Supplier ←→ Product
is a many-to-many business relationship.
6. Product
Represents an electrical product, equipment item, material, or other
inventory item handled by CKKC.
Purpose
Centralize product information used across purchasing, inventory,
quotations, and sales.
Examples
- Electrical cables
- Electrical components
- Equipment
- Fabrication materials
Related Entities
Product
 ├── Quotations
 ├── Client PO items
 ├── Supplier PO items
 ├── Purchases
 ├── Inventory Movements
 └── Sales
7. Category
Represents a classification used to organize products/materials.
Purpose
Allow products to be grouped and filtered.
Examples may include:
- Cable
- Electrical Equipment
- Panelboard
- Accessories
- Fabrication Materials
Categories may be expanded as the business grows.
8. Quotation
Represents a price quotation prepared by CKKC for a customer.
Purpose
Record the price offered to a customer and preserve historical
quotation information.
Important Information
A quotation may contain:
- Customer
- Quotation number
- Date
- Products/materials
- Quantities
- Selling prices
- Supplier cost/reference cost
- Materials
- Labor
- Other direct expenses
- Markup
- Total quotation amount
- Status
Historical Requirement
Quotations must remain available even if the customer does not proceed.
Historical quotation information may be used for future quotations.
Relationships
Customer
   ↓
Quotation
   ↓
Products / Materials
A quotation may later result in a Client PO.
9. Client PO
Represents a Purchase Order received by CKKC from a customer.
Purpose
Represent the customer's official order.
Important Information
- Customer
- PO number
- Date
- Products/materials
- Quantities
- Related quotation
- Status
Relationship
Customer
   ↓
Client PO
   ↓
Sale
A Client PO may also lead to purchasing when required products are not
available.
Client PO
   ↓
Need to Purchase
   ↓
Supplier PO
TBD
The following behavior has not yet been confirmed:
- Partial fulfillment
- Multiple deliveries
- Multiple sales per Client PO
10. Supplier PO
Represents a Purchase Order created by CKKC and sent to a supplier.
Purpose
Record purchasing requests made by CKKC.
Important Information
- Supplier
- PO number
- Date
- Products/materials
- Quantities
- Expected purchase price
- Related customer order when applicable
- Status
Relationship
CKKC
 ↓
Supplier PO
 ↓
Supplier
 ↓
Purchase
A Supplier PO is different from a Client PO.
11. Purchase
Represents the actual purchase transaction made by CKKC from a
supplier.
Purpose
Record the actual products/materials purchased and their actual cost.
Important Information
- Supplier
- Product/material
- Quantity
- Actual purchase price
- Purchase date
- Local / International supplier
- Related Supplier PO
- Related Client PO/order when applicable
Important Business Rule
The actual purchase price must be preserved.
Historical purchase prices must not be overwritten when the supplier
changes pricing.
Example:
Product: Cable

Purchase 1 → ₱100
Purchase 2 → ₱120
Purchase 3 → ₱115
Each purchase retains its own historical cost.
12. Inventory Movement
Represents a movement of stock into or out of inventory.
Purpose
Maintain an auditable history of inventory changes.
Movement Types
Stock IN
Examples:
- Purchase received
- Other approved stock additions
Stock OUT
Examples:
- Sale
- Material usage
- Other approved stock deductions
Important Information
- Product
- Quantity
- Movement type
- Date
- Related transaction
- Reference
- User who recorded the movement
Conceptual Flow
Purchase / Receiving
        ↓
     Stock IN
        ↓
    Inventory

Sale / Usage
        ↓
    Stock OUT
        ↓
    Inventory
Current stock can be derived from inventory movements or maintained
through a controlled inventory balance.
13. Sale
Represents a completed or recorded sales transaction with a customer.
Purpose
Record revenue and provide the basis for profitability analysis.
Important Information
- Customer
- Client PO reference
- Products/materials
- Quantities
- Selling price
- Cost information
- Related expenses
- Commission
- Profit
- Profit margin
- Date
Relationship
Customer
   ↓
Client PO
   ↓
Sale
However, not every sale necessarily requires a new purchase.
Example:
Existing Inventory
       ↓
      Sale
14. Expense
Represents a business expense recorded by CKKC.
Main Categories
Direct / Order-Related Expense
An expense associated with a specific customer order or project.
Examples:
- Delivery
- Project manpower
- Consumables
- Other order-related expenses
Operating / Office Expense
An expense related to general business operations.
Examples:
- Office expenses
- Equipment
- Supplies
- Laptop
- Other operational expenses
Relationships
An expense may optionally be related to:
- Customer order
- Sale
- Project
- Other business activity
15. Commission
Represents the commission associated with a Purchase Order.
Current Business Rule
The client mentioned a:
5% commission per Purchase Order
Purpose
Allow commission to be included in profitability calculations.
TBD
The calculation basis has not yet been confirmed.
Possible bases:
- Sales amount
- Client PO amount
- Gross profit
- Other
The commission entity should therefore remain flexible enough to support
the final business rule.
16. Fabrication Record
Represents a fabrication or project-based job.
Purpose
Preserve information about fabricated products and project costing.
Potential Information
Estimated
- Materials
- Labor
- Other expenses
- Markup
- Estimated cost
- Estimated profit
Actual
- Actual materials
- Actual labor
- Actual expenses
- Additional costs
- Actual cost
- Actual profit
Status
🟡 The business requirement is confirmed, but full fabrication/project
management is considered a future expansion unless included in the MVP.
17. Product Design Record
Represents a saved design or specification for a previously created
fabricated product.
Example
Panelboard Design
      ↓
Saved Design
      ↓
Future Requirement
      ↓
Retrieve Previous Design
Purpose
Prevent CKKC from recreating previously developed designs from scratch.
Status
Historical product/design records are confirmed.
Advanced design management remains a potential future feature.
18. Entity Relationships
The major relationships can be represented conceptually as:
Customer
   │
   ├──────────────→ Quotation
   │
   ├──────────────→ Client PO
   │                      │
   │                      ↓
   │                     Sale
   │
   └──────────────→ Sales History


Supplier
   │
   ├──────────────→ Supplier PO
   │                      │
   │                      ↓
   │                   Purchase
   │
   └──────────────→ Purchase History


Product
   │
   ├──────────────→ Quotation Items
   ├──────────────→ Client PO Items
   ├──────────────→ Supplier PO Items
   ├──────────────→ Purchases
   ├──────────────→ Inventory Movements
   └──────────────→ Sale Items
19. Core Transaction Chain
The primary business relationships are:
Customer
   ↓
Quotation
   ↓
Client PO
   ↓
 ┌───────────────┐
 ↓               ↓
Existing Stock   Need Purchase
 ↓               ↓
 │          Supplier PO
 │               ↓
 │            Purchase
 │               ↓
 │        Inventory Movement
 └───────→ Sale
              ↓
          Expenses
              ↓
          Commission
              ↓
         Profitability
Not every transaction follows the complete chain.
For example:
Existing Stock
     ↓
   Sale
may happen without a new purchase.
20. Master Data vs Transaction Data
Master Data
These entities represent relatively persistent business information:
- User
- Customer
- Supplier
- Product
- Category
Transaction Data
These entities represent business activities:
- Quotation
- Client PO
- Supplier PO
- Purchase
- Sale
- Inventory Movement
- Expense
- Commission
Historical / Project Data
These entities preserve reusable business knowledge:
- Fabrication Record
- Product Design Record
21. MVP Entities
The initial MVP should prioritize the entities required for:
Inventory + Sales + Purchasing + Expenses + Profitability
Core MVP
- User
- Customer
- Supplier
- Product
- Category
- Quotation
- Client PO
- Supplier PO
- Purchase
- Inventory Movement
- Sale
- Expense
- Commission
Supporting / Limited MVP
- Fabrication Record
- Product Design Record
These may initially be implemented as basic historical records rather
than a complete project management system.
22. Entities Requiring Further Validation
The following areas may require refinement before database schema design:
Inventory Costing
The costing method is still TBD:
- Latest cost
- Average cost
- FIFO
Client PO Fulfillment
Still TBD:
- One PO → one sale
- One PO → multiple sales
- Partial fulfillment
- Multiple deliveries
Supplier Receiving
Still TBD:
- One Supplier PO → one purchase
- One Supplier PO → multiple receiving transactions
- Partial receiving
Payments
Payment-related entities are intentionally not finalized yet because
the client's current payment workflow has not been fully documented.
Potential future entities may include:
- Customer Payment
- Supplier Payment
- Accounts Receivable
- Accounts Payable
These should not be added to the core database until the business
requirements are confirmed.
23. Important Design Principle
The system should represent actual business transactions rather than
forcing every transaction into a single workflow.
For example:
Scenario A — Existing Stock

Client PO
   ↓
Sale
   ↓
Stock OUT
Scenario B — Need to Purchase

Client PO
   ↓
Supplier PO
   ↓
Purchase
   ↓
Stock IN
   ↓
Sale
   ↓
Stock OUT
Scenario C — General Stock Purchase

Supplier PO
   ↓
Purchase
   ↓
Stock IN
The database design must support these different scenarios.