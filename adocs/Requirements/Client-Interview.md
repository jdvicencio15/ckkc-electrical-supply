# CKKC Electrical Supply
## Client Interview & Business Requirements

**Project:** CKKC Electrical Supply Management System
**Client:** CKKC Electrical Supply
**Business Type:** Electrical Supply / Fabrication / Project-Based Sales
**Years in Business:** 6 years
**Number of Users:** 4
**Primary Users:** Owner/Admin, Sales, Purchasing, Accounting
**Target Platform:** Desktop, Tablet, Mobile
**Internet Requirement:** Internet connection available
**Target Development Timeline:** 1–2 months
**Initial Project Budget:** ₱15,000

---

# 1. Business Information

## 1.1 Business Name

**CKKC Electrical Supply**

## 1.2 Business Overview

CKKC Electrical Supply handles electrical supply, equipment, fabrication,
and project-based sales.

The business receives customer inquiries through multiple channels,
including:

- Email
- Viber
- Messenger
- Mobile phone
- SMS

The business checks product availability with suppliers and prepares
quotations when the customer is likely to proceed with the purchase.

For products that are ready for trading, pricing is generally based on
the supplier cost and an applicable markup.

For fabricated products and projects, the business calculates:

- Materials
- Labor
- Other project-related expenses
- Applicable markup

Markup may vary depending on the type of product or project.

---

# 2. Current Business Process

## 2.1 Customer Inquiry

Customer inquiries may arrive through:

- Email
- Viber
- Messenger
- Phone
- SMS

The business reviews the inquiry and determines whether the request
involves:

- Existing supply/product
- Equipment
- Fabricated product
- Project-based work

---

## 2.2 Product Availability

For supply or equipment requests, the business checks:

1. Existing inventory
2. Supplier availability
3. Supplier pricing

If the required product is not available in inventory, the business
checks suppliers before purchasing.

---

## 2.3 Quotation

Once product availability and costs are known, the business prepares
a quotation.

Pricing may include:

- Supplier cost
- Materials
- Labor
- Other direct expenses
- Markup

Typical markup may start around 35% or use a multiplier such as 1.6,
depending on the product or project.

For some projects, markup may reach higher levels depending on the
complexity and costs involved.

---

## 2.4 Client Purchase Order

The customer's official order is normally represented by a
**Purchase Order (PO)**.

Verbal or message-based orders may occur, but the client PO is treated
as the official order document.

---

## 2.5 Purchasing

When materials or products are required, CKKC purchases them from
suppliers.

The purchase transaction should record:

- Product/material
- Supplier
- Quantity
- Purchase price
- Date purchased
- Local or international supplier
- Related client/order, when applicable

---

## 2.6 Inventory

All purchased materials and products should be recorded in the
inventory.

Inventory should track:

- Stock IN
- Stock OUT
- Current quantity
- Transaction history
- Purchase information

The goal is to make the movement of materials visible throughout the
operation.

---

## 2.7 Delivery

Completed orders may be delivered through:

- J&T
- Other delivery services
- Direct pickup/delivery by CKKC

Delivery-related costs should be recorded as expenses when applicable.

---

# 3. Pricing Problems

Pricing is one of the major business concerns.

Supplier prices may change because of:

- Inflation
- Supplier price changes
- Changes between quotation date and purchase date

Example problem:

1. CKKC sends a quotation to a customer.
2. Customer sends a PO several days later.
3. Supplier price has increased.
4. CKKC purchases the item at the higher price.
5. Original markup becomes smaller.
6. The sale may become less profitable or negative.

If supplier prices decrease, the transaction may become more profitable.

The system should therefore preserve historical pricing information.

---

# 4. Fabrication / Project Costing Problems

For fabricated products and projects, some expenses are not always known
at the beginning.

Materials may be:

- Forgotten during initial costing
- Discovered later
- Added during fabrication
- Purchased unexpectedly

This can cause the actual project cost to become higher than the
original estimate.

The system should help compare:

**Estimated Cost vs Actual Cost**

and:

**Estimated Profit vs Actual Profit**

---

# 5. Supplier Management Requirements

The client wants a centralized supplier database.

The system should allow users to identify suppliers based on the
products they provide.

Example:

> If CKKC needs a cable, the system should be able to show suppliers
> that provide cables.

Supplier information should include:

- Supplier name
- Contact information
- Products supplied
- Purchase history
- Historical pricing
- Local / International classification

---

# 6. Inventory Management Requirements

The current inventory process is mainly manual and visual.

The client wants all materials and products to be recorded in the
system.

The system should track:

- Product/material
- Quantity
- Stock IN
- Stock OUT
- Current stock
- Minimum stock level
- Purchase source
- Purchase price
- Purchase date
- Inventory movement history

The system should also provide low-stock indications.

---

# 7. Sales Requirements

The current sales records are primarily maintained using Excel.

The client wants the system to provide:

- Sales recording
- Sales history
- Customer information
- Client PO reference
- Sales pricing
- Cost information
- Profit calculation
- Profit margin
- Negative-profit warning

The system should help identify sales that are:

- Profitable
- Low-margin
- Negative-profit

The goal is to reduce transactions that result in negative profit.

---

# 8. Purchase Order Requirements

CKKC may create its own Purchase Orders when purchasing products or
materials from suppliers.

The system should distinguish between:

### Client PO

Purchase Order received from the customer.

### Supplier PO

Purchase Order created by CKKC when purchasing from a supplier.

These two transactions may be related but represent different
business transactions.

---

# 9. Expense Management

Expenses should be categorized into at least two major groups.

## 9.1 Direct / Order-Related Expenses

Expenses directly related to a customer order or project.

Examples:

- Materials
- Delivery
- Project manpower
- Consumables
- Other order-related expenses

## 9.2 Operating / Office Expenses

Expenses related to the overall business operation.

Examples:

- Office expenses
- Laptop
- Equipment
- Supplies
- Other operational expenses

The system should allow expenses to be recorded and reported
separately.

---

# 10. Commission

The client mentioned a **5% commission per Purchase Order**.

The system should record commission information and include it in
profitability calculations where applicable.

---

# 11. Current Record-Keeping Process

The business currently uses:

- Microsoft Excel
- Email
- Viber
- Messenger
- SMS
- Mobile communication

Accounting already has an existing system, but the operational
processes are not fully centralized.

Records are generally updated weekly, with monthly monitoring also
required.

---

# 12. Current Business Problems

The client identified the following problems:

- Difficult record keeping
- Manual processes take time
- Computation errors
- Missing or incomplete records
- Difficult report generation
- Inventory is difficult to monitor
- Supplier sources are difficult to track
- Pricing is difficult to manage
- Expenses are not properly monitored
- Sales may become negative-profit
- Previous quotations are difficult to retrieve
- Previous fabrication/project details are not consistently saved

---

# 13. Previous Quotation Records

The client wants previous quotations to be retained even if the
customer did not proceed with the purchase.

This would allow CKKC to review:

- Previous supplier sources
- Previous supplier prices
- Previous quotation prices
- Previous markup
- Previous customer requests

This information can help speed up future quotations.

---

# 14. Fabrication / Product Design Records

The client also wants previous fabrication and product details to be
saved.

Example:

A panelboard design that was previously created should be retrievable
so that the business does not need to recreate the same design from
scratch.

This requirement may be expanded into a future fabrication/project
management module.

---

# 15. Users and Access

The system will initially have multiple user roles.

## Owner / Admin

Access to overall business information and system management.

## Sales

Access primarily related to:

- Customers
- Quotations
- Sales
- Client POs
- Sales history

## Purchasing

Access primarily related to:

- Suppliers
- Products/materials
- Purchasing
- Supplier POs
- Purchase history
- Inventory receiving

## Accounting

Access primarily related to:

- Expenses
- Financial records
- Reports

Different users should have different permissions based on their
responsibilities.

---

# 16. Dashboard Requirements

The client wants a centralized dashboard showing an overview of the
business.

The dashboard should provide indications for:

- Sales
- Expenses
- Profit
- Inventory
- Low-stock items
- Purchases
- Recent transactions
- Other important operational information

Charts and graphical summaries are also desired.

---

# 17. Required Reports

The system should provide:

- Daily Sales Report
- Weekly Sales Summary
- Monthly Sales Report
- Inventory Report
- Expense Report
- Customer Report
- Supplier Report
- Profitability Report

---

# 18. Target Devices

The client expects the system to be usable on:

- Desktop / Computer
- Tablet
- Mobile Phone

The business has an internet connection available.

Offline functionality is not currently required.

---

# 19. Future Expansion

The business plans to grow and may require additional functionality
in the future.

Potential future features include:

- Mobile application
- Online ordering
- Payment integration
- Automatic notifications
- Advanced reports
- Fabrication/project management
- Project costing
- Product/design history

These features are not part of the initial MVP unless separately
approved.

---

# 20. Client Priority

The client's highest priorities for the initial system are:

1. Inventory
2. Sales
3. Expenses
4. Profitability

The system should primarily solve the problems around tracking
inventory, controlling sales pricing, monitoring expenses, and
determining whether transactions are profitable.

---

# 21. Initial Project Target

**Budget:** ₱15,000

**Target Duration:** Approximately 1–2 months

**Initial Objective:**

Develop a usable business management system that centralizes CKKC's
inventory, sales, purchasing, expenses, supplier information, and
profitability tracking.