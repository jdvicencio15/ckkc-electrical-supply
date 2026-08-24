# Business Process

## 1. Purpose

This document describes the business processes of CKKC Electrical Supply
based on the client interview.

The purpose is to translate the current business operations into a
structured system flow before database and application development.

This document focuses on business behavior and transaction flow.

Database schemas and technical implementation are intentionally excluded
from this document.

---

# 2. Business Overview

CKKC Electrical Supply operates in electrical supply, equipment,
fabrication, and project-based sales.

The business handles both:

- Ready-to-trade products
- Fabricated products
- Project-based work

Customer inquiries may arrive through:

- Email
- Viber
- Messenger
- Mobile phone
- SMS

The business currently relies heavily on Excel and manual processes.

The initial system will centralize the operational processes that are
currently distributed across different tools.

---

# 3. High-Level Business Flow

The primary business flow for regular supply transactions is:

```text
Customer Inquiry
       ↓
Quotation
       ↓
Client PO
       ↓
Availability / Cost Check
       ↓
 ┌─────┴─────┐
 ↓           ↓
Stock       Need to Purchase
Available       ↓
 ↓          Supplier PO
 │              ↓
 │           Purchase
 │              ↓
 │           Receiving
 │              ↓
 └────────→ Inventory
                ↓
           Fulfillment
                ↓
              Sale
                ↓
      Direct / Order Expenses
                ↓
           Commission
                ↓
          Profitability


For fabrication and project-based work:

Project Requirement
       ↓
Cost Estimation
       ↓
Quotation
       ↓
Client PO
       ↓
Project Execution
       ↓
Actual Materials
Actual Labor
Actual Expenses
       ↓
Actual Cost
       ↓
Actual Profit

4. Customer Inquiry
4.1 Process
The process begins when a customer submits an inquiry.
The inquiry may be received through:
- Email
- Viber
- Messenger
- Mobile phone
- SMS
The business determines what type of request the customer has.
Possible request types include:
- Existing product
- Electrical equipment
- Fabricated product
- Project-based requirement
Status
✅ Confirmed from client interview.

5. Product and Supplier Availability
For supply and equipment requests, CKKC checks the availability and
cost of the requested products.
The business checks:
1. Existing inventory
2. Supplier availability
3. Supplier pricing
If the product is already available in inventory, existing stock may be
used.
If the product is not available, the business checks suppliers before
purchasing.
Important Business Requirement
Supplier information should be searchable based on the products they
provide.

Required Product: Cable
        ↓
Search Suppliers
        ↓
Supplier A
Supplier B
Supplier C


6. Quotation
Once availability and costs are known, CKKC prepares a quotation.
Quotation pricing may consider:
- Supplier cost
- Materials
- Labor
- Other direct expenses
- Markup
Markup may vary depending on the product or project.
The client mentioned that markup may commonly start around 35% or use
a multiplier such as 1.6, but markup is not necessarily fixed.
Important Pricing Rule
The quotation price represents the price offered to the customer at the
time of quotation.
Supplier prices may change after the quotation is issued.
Therefore, historical quotation pricing must be preserved.
Status
✅ Confirmed from client interview.

7. Client Purchase Order
The customer's official order is normally represented by a
Client Purchase Order (Client PO).
Verbal or message-based orders may occur, but the Client PO is treated
as the official order document.

Quotation
    ↓
Customer Decision
    ↓
Client PO
The Client PO represents the customer's order to CKKC.
Status
✅ Confirmed.
MVP Assumption
🟡 The system will maintain a relationship between the Client PO and
the quotation from which it originated when applicable.
TBD
🔴 The exact handling of partial fulfillment and multiple deliveries
has not been confirmed.

8. Supplier Purchase Order
CKKC may create its own Purchase Order when purchasing products or
materials from suppliers.
This is different from the Client PO.
Customer
   ↓
Client PO
   ↓
CKKC
   ↓
Supplier PO
   ↓
Supplier

The system must distinguish between:
Client PO
Purchase Order received from the customer.
Supplier PO
Purchase Order created by CKKC and sent to a supplier.
These represent different business transactions.
Status
✅ Confirmed from client interview.


9. Purchasing
When materials or products are required, CKKC purchases them from
suppliers.
A purchase should record:
- Product/material
- Supplier
- Quantity
- Purchase price
- Purchase date
- Local / international supplier
- Related client/order when applicable
Purchases may be associated with a specific customer order when the
purchase was made to fulfill that order.
Status
✅ Confirmed.
MVP Assumption
🟡 The system will allow purchases to exist independently from a Client
PO because the business may purchase inventory for general stock.

10. Receiving
Purchased materials and products must be received before they become
available inventory.
Supplier PO
    ↓
Purchase
    ↓
Receiving
    ↓
Stock IN
    ↓
Inventory
The system should record the quantity actually received.
Important
The purchase quantity and received quantity should be treated as
separate concepts if partial receiving is required.
Status
🟡 Receiving is implied by the inventory requirement but partial
receiving has not been confirmed.
MVP Assumption
The system may support recording received quantities independently from
ordered quantities to allow future partial receiving.
11. Inventory
All purchased materials and products should be recorded in inventory.
Inventory must provide visibility into:
- Current quantity
- Stock IN
- Stock OUT
- Transaction history
- Purchase source
- Purchase price
- Purchase date
- Minimum stock level
The purpose is to make material movement visible throughout the
operation.
Stock IN
Products enter inventory through receiving.

Purchase / Receiving
        ↓
      Stock IN
        ↓
 Inventory Quantity +

 Stock OUT
Products leave inventory when used, sold, or released as part of a
business transaction.

Sale / Fulfillment
        ↓
     Stock OUT
        ↓
 Inventory Quantity -

 Status
✅ Inventory requirements are confirmed.
TBD
🔴 The exact costing method for products purchased at different prices
has not been confirmed.

12. Historical Product Cost
Supplier prices may change over time.
Example:
January
Cable = ₱100

February
Cable = ₱120

The system must preserve historical purchase prices.
This is necessary because the actual cost of a transaction may differ
from a previous quotation.
Business Problem

Quotation
   ↓
Supplier Cost = ₱100
   ↓
Customer PO arrives later
   ↓
Supplier Cost = ₱120
   ↓
Actual Purchase Cost increases
   ↓
Original Margin decreases

The system should therefore allow comparison between:
- Quoted cost
- Actual purchase cost
- Selling price
- Actual profit
Status
✅ Historical pricing requirement is confirmed.

13. Sales / Fulfillment
After products or materials are available, CKKC fulfills the customer
order.
The sale should record:
- Customer
- Client PO reference
- Products/materials
- Quantity
- Selling price
- Cost information
- Profit
- Profit margin
The system should identify transactions as:
- Profitable
- Low-margin
- Negative-profit
Negative Profit Warning
The system should warn users when a transaction may result in
negative profit.

Selling Price
      ↓
Compare Against
      ↓
Actual Cost + Applicable Expenses + Commission
      ↓
Profitability Check

tatus
✅ Sales and profitability requirements are confirmed.
TBD
🔴 Exact fulfillment behavior for partial deliveries has not been
confirmed.


14. Delivery
Completed orders may be delivered through:
- J&T
- Other delivery services
- Direct pickup
- Direct delivery by CKKC
Delivery-related costs should be recorded as expenses when applicable.
Status
✅ Confirmed.
MVP Assumption
🟡 Delivery may initially be represented through the sale/expense
process rather than as a separate complex logistics module.


15. Direct / Order-Related Expenses
Expenses directly related to a customer order or project should be
tracked separately.
Examples:
- Materials
- Delivery
- Project manpower
- Consumables
- Other order-related expenses
These expenses may affect the profitability of the related transaction.

Customer Order
      ↓
Direct Expenses
      ↓
Transaction Profitability

Status
✅ Confirmed.


16. Operating / Office Expenses
The business also has expenses that are not directly related to a
specific customer order.
Examples:
- Office expenses
- Laptop
- Equipment
- Supplies
- Other operational expenses
These should be recorded separately from direct/order-related expenses.

Operating Expense
       ↓
Overall Business Profitability
Status
✅ Confirmed.


17. Commission
The client identified a 5% commission per Purchase Order.
The exact calculation basis has not yet been confirmed.
Current Requirement
The system should be capable of recording commission information and
including it in profitability calculations.
Status
🟡 Commission requirement is confirmed.
🔴 Commission calculation basis is TBD.
Possible bases:
- Sales amount
- Client PO amount
- Gross profit
- Other basis


18. Profitability
Profitability is one of the highest priorities of the system.
The system should help determine whether a transaction is:
- Profitable
- Low-margin
- Negative-profit
At a high level:
Sales Revenue
      ↓
- Actual Product / Material Cost
      ↓
- Direct / Order Expenses
      ↓
- Applicable Commission
      ↓
Transaction Profit

Operating expenses may then be considered when evaluating overall
business profitability.

Transaction Profit
      ↓
- Operating Expenses
      ↓
Overall Business Profitability

The exact accounting treatment will be finalized during implementation
and should not replace the client's existing accounting system.

19. Fabrication / Project Costing
Fabrication and project-based work has a different costing process from
regular trading products.
Initial estimates may include:
- Materials
- Labor
- Other project-related expenses
- Markup
During fabrication, additional materials or expenses may be
discovered.
Examples:
- Forgotten materials
- Additional materials
- Unexpected purchases
- Additional labor
- Other project expenses
Therefore, the system should support comparison between:
Estimated Cost
      vs
Actual Cost
and:
Estimated Profit
      vs
Actual Profit
Status
✅ The business problem is confirmed.
Scope
🟡 Full fabrication/project management is identified as a potential
future module.
Unless included in the MVP scope, the initial system should preserve
the necessary information without attempting to implement a complete
project-management system.
20. Historical Quotations
Previous quotations must be retained even when the customer does not
proceed.
Historical quotations may be used to review:
- Previous supplier sources
- Previous supplier prices
- Previous quotation prices
- Previous markup
- Previous customer requests
This allows future quotations to be prepared more efficiently.
Status
✅ Confirmed.
21. Fabrication / Product Design History
Previous fabrication and product design details should be retained.
Example:
Previous Panelboard Design
        ↓
Save Design / Details
        ↓
Future Customer Requirement
        ↓
Retrieve Previous Design
This can prevent the business from recreating the same design from
scratch.
Status
✅ Requirement confirmed.
Scope
🟡 Advanced fabrication/project management may remain a future module.
22. End-to-End Regular Supply Transaction
The complete regular supply flow can be represented as:
Customer Inquiry
       ↓
Availability Check
       ↓
Supplier / Cost Check
       ↓
Quotation
       ↓
Client PO
       ↓
Stock Check
       ↓
 ┌─────┴─────┐
 ↓           ↓
Stock       Need Purchase
Available       ↓
 ↓          Supplier PO
 │              ↓
 │           Purchase
 │              ↓
 │           Receiving
 │              ↓
 └────────→ Inventory
                ↓
            Fulfillment
                ↓
               Sale
                ↓
        Direct Expenses
                ↓
           Commission
                ↓
          Profitability
23. End-to-End Fabrication / Project Transaction
Customer Requirement
        ↓
Project / Fabrication Assessment
        ↓
Estimated Cost
        ↓
Estimated Markup
        ↓
Quotation
        ↓
Client PO
        ↓
Project Execution
        ↓
Actual Materials
Actual Labor
Actual Expenses
        ↓
Actual Cost
        ↓
Actual Revenue
        ↓
Actual Profit
24. Business Priorities
The client's highest priorities are:
1. Inventory
2. Sales
3. Expenses
4. Profitability
The system should prioritize these areas in the MVP.
Other features should support these core objectives rather than
introduce unnecessary complexity.
25. Confirmed vs Assumed vs TBD
Confirmed
- Customer inquiries
- Quotations
- Client POs
- Supplier POs
- Purchasing
- Inventory
- Sales
- Delivery
- Direct/order-related expenses
- Operating expenses
- Supplier management
- Historical pricing
- Profitability tracking
- Negative-profit warning
- Historical quotations
- Fabrication/product history
- 5% commission requirement
- Multiple user roles
- Required business reports
Assumptions for MVP
- Client POs will be linked to quotations when applicable.
- Purchases may exist without a Client PO for general inventory.
- Receiving will be tracked separately enough to support future partial
  receiving.
- Delivery may initially be handled within fulfillment/sales rather than
  as a full logistics module.
- Fabrication/project management will remain limited unless explicitly
  included in MVP scope.
TBD
- Client PO partial fulfillment
- Multiple deliveries per Client PO
- Supplier PO partial receiving
- Inventory costing method
- Exact 5% commission calculation basis
- Customer payment workflow
- Supplier payment workflow
- Partial payments
- Customer balances
- Supplier balances
- Exact fabrication/project module scope
26. Scope Boundary
The initial system is an operational management system.
It is not intended to replace the client's existing accounting system.
The MVP should focus on:
Inventory + Sales + Purchasing + Expenses + Profitability
with supporting functionality for:
Customers + Suppliers + Quotations + Client POs + Supplier POs
Advanced features such as:
- Full accounting
- Payment integration
- Online ordering
- Mobile application
- Advanced project management
- Advanced fabrication management
may be implemented in future phases.