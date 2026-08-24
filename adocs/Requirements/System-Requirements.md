# System Requirements

## 1. Purpose

The CKKC Electrical Supply Management System will centralize the
business's operational processes and reduce reliance on manual Excel
records.

The system will primarily focus on:

- Inventory
- Sales
- Purchasing
- Expenses
- Profitability

Supporting modules will include:

- Customers
- Suppliers
- Quotations
- Client Purchase Orders
- Supplier Purchase Orders
- Historical pricing
- Fabrication / product records

The system is intended to support the operational side of the business
and will not replace the client's existing accounting system.

---

# 2. User Roles

The initial system will support four primary user roles:

## 2.1 Owner / Admin

The Owner / Admin should have access to overall business information
and system management.

Expected access includes:

- Dashboard
- Customers
- Suppliers
- Products
- Quotations
- Client POs
- Supplier POs
- Purchases
- Inventory
- Sales
- Expenses
- Reports
- User management

---

## 2.2 Sales

Sales users should primarily access:

- Customers
- Quotations
- Client POs
- Sales
- Sales history
- Customer-related information

Sales users should be able to prepare and manage customer quotations
and track customer orders.

---

## 2.3 Purchasing

Purchasing users should primarily access:

- Suppliers
- Products / Materials
- Supplier POs
- Purchases
- Purchase history
- Inventory receiving

Purchasing users should be able to identify suppliers based on the
products they provide.

---

## 2.4 Accounting

Accounting users should primarily access:

- Expenses
- Financial records
- Profitability reports
- Business reports

The system should complement the existing accounting system rather
than replace it.

---

# 3. Customer Management

The system shall allow users to maintain customer information.

### Required capabilities

- Create customer
- View customer
- Edit customer
- Search customer
- View customer history

Customer records should support the relationship between the customer
and:

- Quotations
- Client POs
- Sales
- Related transactions

---

# 4. Supplier Management

The system shall provide a centralized supplier database.

Users should be able to:

- Create supplier records
- Edit supplier information
- Search suppliers
- View supplier details
- View purchase history
- Identify products supplied by each supplier

Supplier records should include:

- Supplier name
- Contact information
- Products supplied
- Purchase history
- Historical pricing
- Local / International classification

### Important Requirement

The system should support product-based supplier searching.

Example:

```text
Need: Cable
     ↓
Search Suppliers
     ↓
Suppliers providing


5. Product / Material Management
The system shall maintain products and materials used by the business.
Product records should support:
- Product name
- Product code / SKU
- Category
- Unit
- Current stock
- Minimum stock level
- Selling price
- Description
- Status
Products/materials should be usable across:
- Quotations
- Client POs
- Supplier POs
- Purchases
- Inventory
- Sales
6. Quotation Management
The system shall allow users to create and manage quotations.
Required capabilities
- Create quotation
- Add products/materials
- Specify quantity
- Specify selling price
- Calculate totals
- Record markup
- Save quotation
- Edit quotation
- Search quotation
- View quotation history
- Track quotation status
Quotation pricing may consider:
- Supplier cost
- Materials
- Labor
- Other direct expenses
- Markup
Historical Quotations
The system must retain previous quotations even when the customer does
not proceed with the transaction.
Historical quotations should allow users to review:
- Previous supplier sources
- Previous supplier prices
- Previous quotation prices
- Previous markup
- Previous customer requests
7. Client Purchase Order Management
The system shall support Client Purchase Orders received from customers.
A Client PO represents the customer's official order.
Required capabilities
- Record Client PO
- Link Client PO to quotation when applicable
- Record PO number
- Record customer
- Record products/materials
- Record quantities
- Track PO status
- View PO history
Important Rule
A Client PO is different from a Supplier PO.
Customer
   ↓
Client PO
   ↓
CKKC
8. Supplier Purchase Order Management
The system shall support Purchase Orders created by CKKC for suppliers.
Required capabilities
- Create Supplier PO
- Select supplier
- Add products/materials
- Record quantities
- Record expected purchase price
- Track PO status
- View Supplier PO history
Important Rule
Supplier PO represents a purchase request from CKKC to a supplier.
CKKC
   ↓
Supplier PO
   ↓
Supplier
Client POs and Supplier POs must remain separate transaction types.
9. Purchasing Management
The system shall allow purchasing users to record purchases.
Purchase records should include:
- Product/material
- Supplier
- Quantity
- Purchase price
- Purchase date
- Local / International supplier
- Related Client PO/order when applicable
The system must preserve the actual purchase price.
This is important because supplier prices may change after a quotation
has been issued.
10. Receiving
The system shall record materials and products received from suppliers.
Receiving should update inventory through Stock IN.
Supplier PO
     ↓
Purchase
     ↓
Receiving
     ↓
Stock IN
     ↓
Inventory
MVP Assumption
The system may support received quantity separately from ordered
quantity to allow future partial receiving.
TBD
Exact partial-receiving workflow remains to be confirmed.
11. Inventory Management
Inventory is one of the highest priorities of the system.
The system shall provide visibility into:
- Current stock
- Stock IN
- Stock OUT
- Inventory movement history
- Purchase source
- Purchase price
- Purchase date
- Minimum stock level
Stock IN
Stock increases when purchased products/materials are received.
Stock OUT
Stock decreases when products/materials are sold, released, or otherwise
used in a business transaction.
Low Stock
The system should provide indications when inventory reaches or falls
below the minimum stock level.
12. Historical Inventory Pricing
The system must preserve historical purchase pricing.
Example:
January
Cable = ₱100

February
Cable = ₱120
The system should not overwrite historical purchase costs when a new
purchase price is recorded.
This allows the business to compare:
- Original quoted cost
- Actual purchase cost
- Selling price
- Actual profitability
TBD
The exact inventory costing method is not yet confirmed.
Possible approaches include:
- Latest cost
- Average cost
- FIFO
The final method will be determined before database implementation.
13. Sales Management
The system shall allow users to record and manage sales.
Sales records should include:
- Customer
- Client PO reference
- Products/materials
- Quantity
- Selling price
- Cost information
- Profit
- Profit margin
The system should maintain sales history.
14. Profitability Monitoring
Profitability is one of the highest priorities of the system.
The system should determine whether a transaction is:
- Profitable
- Low-margin
- Negative-profit
The system should provide a warning when a transaction may result in
negative profit.
At a high level:
Selling Price
     ↓
Actual Cost
     ↓
Direct Expenses
     ↓
Commission
     ↓
Profitability
The exact calculation will depend on the final business rules.
15. Expense Management
The system shall allow users to record business expenses.
Expenses shall be categorized into at least two major groups.
15.1 Direct / Order-Related Expenses
Examples:
- Materials
- Delivery
- Project manpower
- Consumables
- Other order-related expenses
These expenses may be associated with a specific customer order or
project.
15.2 Operating / Office Expenses
Examples:
- Office expenses
- Laptop
- Equipment
- Supplies
- Other operational expenses
These expenses are related to the overall operation of the business.
The system should report direct/order-related expenses separately from
operating expenses.
16. Commission
The client identified a 5% commission per Purchase Order.
The system should store commission information and include it in
profitability calculations where applicable.
Confirmed
- Commission rate: 5%
TBD
The calculation basis is not yet confirmed.
Possible bases:
- Sales amount
- Client PO amount
- Gross profit
- Other
17. Delivery Management
The system should support recording delivery-related information.
Orders may be delivered through:
- J&T
- Other delivery services
- Direct pickup
- Direct delivery by CKKC
Delivery-related costs should be recordable as direct/order-related
expenses when applicable.
MVP Scope
A full logistics management module is not required initially.
Delivery may initially be associated with the related sale/order.
18. Fabrication / Project Costing
Fabrication and project-based work requires a different costing approach
from regular trading products.
The system should be capable of supporting:
Estimated Cost
- Materials
- Labor
- Other project expenses
- Markup
Actual Cost
- Actual materials
- Actual labor
- Actual expenses
- Additional unexpected costs
The system should eventually support:
Estimated Cost
      vs
Actual Cost
and:
Estimated Profit
      vs
Actual Profit
MVP Scope
Full fabrication/project management is considered a future expansion
unless explicitly included in the MVP.
19. Fabrication / Product Design History
The system should retain previous fabrication and product design
information.
Example:
A previously created panelboard design should be retrievable for
future use.
This should reduce the need to recreate previous designs from scratch.
MVP Scope
Basic historical record keeping may be included.
Advanced fabrication/project management may be implemented in a future
phase.
20. Dashboard
The system shall provide a centralized business dashboard.
The dashboard should provide visibility into:
- Sales
- Expenses
- Profit
- Inventory
- Low-stock items
- Purchases
- Recent transactions
- Other important operational information
Charts and graphical summaries are desired.
21. Reports
The system shall provide reports including:
Sales
- Daily Sales Report
- Weekly Sales Summary
- Monthly Sales Report
Inventory
- Inventory Report
- Stock movement information
- Low-stock information
Expenses
- Expense Report
- Expense category summaries
Customers
- Customer Report
Suppliers
- Supplier Report
Profitability
- Profitability Report
- Profit margin
- Negative-profit transactions
22. Search and Filtering
The system should provide search and filtering for major records.
Users should be able to search or filter records such as:
- Customers
- Suppliers
- Products
- Quotations
- Client POs
- Supplier POs
- Purchases
- Sales
- Expenses
Filtering may include:
- Date
- Customer
- Supplier
- Product
- Status
- Category
23. Transaction History
The system should preserve historical business records.
Important transaction relationships should be traceable.
Example:
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
Inventory
   ↓
Sale
   ↓
Expenses
   ↓
Profitability
Not every transaction will necessarily follow the complete chain.
For example, an existing-stock sale may not require a Supplier PO or new
Purchase.
24. User Access Control
The system shall provide role-based access.
Different users should have access based on their responsibilities.
Initial roles:
- Owner / Admin
- Sales
- Purchasing
- Accounting
The system should prevent users from accessing functions outside their
assigned responsibilities where appropriate.
25. Notifications and Warnings
The system should provide important operational warnings.
Initial warning requirements include:
- Low-stock products
- Negative-profit transactions
- Other important business alerts
Additional notifications may be added in future versions.
26. Non-Functional Requirements
26.1 Platform
The system should be usable on:
- Desktop
- Tablet
- Mobile phone
26.2 Internet
The system requires an internet connection.
Offline functionality is not required for the initial version.
26.3 Usability
The system should:
- Be easy to understand
- Use clear labels
- Reduce manual computation
- Reduce duplicate data entry
- Provide clear validation messages
- Make historical information easy to retrieve
26.4 Reliability
The system should:
- Preserve historical records
- Reduce computation errors
- Prevent invalid transactions
- Maintain consistent inventory quantities
- Avoid accidental data loss
26.5 Security
The system should:
- Require authenticated access
- Use role-based permissions
- Protect user credentials
- Validate user input
- Restrict sensitive business information
27. MVP Priority
Based on the client's stated priorities, the MVP should prioritize:
Priority 1 — Inventory
- Product/material records
- Stock IN
- Stock OUT
- Current stock
- Inventory history
- Minimum stock
- Purchase source
- Historical purchase cost
Priority 2 — Sales
- Customer records
- Sales
- Client PO reference
- Selling price
- Cost
- Profit
- Profit margin
- Negative-profit warning
Priority 3 — Expenses
- Direct/order-related expenses
- Operating expenses
- Expense history
- Expense reports
Priority 4 — Profitability
- Transaction profitability
- Profit margin
- Negative-profit detection
- Profitability reports
Supporting modules:
- Suppliers
- Quotations
- Client POs
- Supplier POs
- Purchasing
- Dashboard
- Reports
28. Future Expansion
The following features are considered future expansion unless included
in the approved MVP:
- Mobile application
- Online ordering
- Payment integration
- Automatic notifications
- Advanced reports
- Full fabrication/project management
- Advanced project costing
- Advanced product/design management
29. Requirements Status
Confirmed
The following requirements are directly supported by the client
interview:
- Inventory management
- Sales management
- Expense management
- Profitability tracking
- Customer management
- Supplier management
- Product/material management
- Quotations
- Client POs
- Supplier POs
- Purchasing
- Historical pricing
- Historical quotations
- Delivery-related expenses
- 5% commission requirement
- Negative-profit warning
- Fabrication/product history
- Multiple user roles
- Dashboard
- Reports
- Desktop/tablet/mobile access
Assumptions
The following are MVP assumptions and should be revisited if actual
business usage requires different behavior:
- Client POs are linked to quotations when applicable.
- Purchases may exist without a Client PO.
- Receiving can support different ordered and received quantities.
- Delivery can initially be associated with the sale/order.
- Basic fabrication history can be stored without implementing a full
  project management module.
TBD
The following requirements remain unresolved:
- Partial Client PO fulfillment
- Multiple deliveries per Client PO
- Partial Supplier PO receiving
- Inventory costing method
- Commission calculation basis
- Customer payment workflow
- Supplier payment workflow
- Partial payments
- Customer balances
- Supplier balances
- Exact fabrication/project MVP scope
30. Scope Boundary
The initial system is an operational business management system.
It is not intended to replace the client's existing accounting
system.
The MVP focuses on:
Inventory + Sales + Purchasing + Expenses + Profitability
with supporting functionality for:
Customers + Suppliers + Quotations + Client POs + Supplier POs
Advanced accounting, payment integration, online ordering, full
project management, and other future features will be considered in
later phases.
