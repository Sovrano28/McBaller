# Phase 4: Contracts & Invoicing - Detailed Implementation Plan

## Overview

Phase 4 focuses on building the contract and invoicing management system for organizations. This enables clubs, teams, and agents to:

- Create and manage player contracts
- Generate invoices for players or services
- Track payment history
- Monitor contract renewals and expirations

**Timeline**: Week 3
**Status**: Not Started

---

## 4.1 Contract Management System

### 4.1.1 Contract List Page (`/org/contracts`)

**Purpose**: Display all contracts for the organization with filtering and search

**Features**:

- **List View**:
  - Table/card view of all contracts
  - Columns: Player Name, Team, Start Date, End Date, Salary, Status
  - Sortable by date, salary, status
  - Status badges (Active, Expired, Terminated)
- **Filters**:
  - By Status (Active, Expired, Terminated, All)
  - By Team (if multiple teams exist)
  - By Player (search dropdown)
  - Date Range (start date, end date)
- **Search**:
  - Search by player name
  - Search by contract ID
- **Actions**:
  - Create New Contract button
  - View contract details
  - Quick actions: Renew, Terminate (for active contracts)

**UI Components**:

```typescript
// Main layout
- Header: "Contracts" title + "Create Contract" button
- Search bar with filters
- Contract table/cards
- Pagination (if many contracts)

// Contract Card/Row
- Player avatar + name
- Team badge
- Date range (start - end)
- Salary (formatted as ₦XXX,XXX)
- Status badge (color-coded)
- Actions dropdown (View, Edit, Renew, Terminate)
```

---

### 4.1.2 Create Contract Form (`/org/contracts/new`)

**Purpose**: Create new player contracts

**Form Fields**:

1. **Player Selection** (Required)

   - Dropdown/search of players in organization
   - Show player name, position, current team
   - Disable players with active contracts (or allow override)

2. **Organization Details** (Auto-filled)

   - Organization name (read-only)
   - Current user's org

3. **Team Selection** (Optional)

   - Dropdown of organization teams
   - Can be left empty if player not assigned to team yet

4. **Contract Dates** (Required)

   - Start Date (date picker)
   - End Date (date picker, optional for open-ended contracts)
   - Validation: Start date < End date

5. **Financial Terms**

   - Salary (optional, ₦ amount)
   - Currency (default: NGN, read-only for now)

6. **Contract Terms** (JSON field, structured)

   - Bonus structure (JSON object)
   - Performance clauses (textarea or structured form)
   - Termination clauses (textarea)
   - Other terms (flexible JSON)

7. **Status** (Default: "active")
   - Auto-set to "active" for new contracts
   - Cannot be changed on creation

**Validation**:

- Player must belong to organization
- Start date cannot be in the past (or allow past dates with warning)
- End date must be after start date
- Salary must be positive if provided

**Server Action**: `createContract(data: ContractCreateData)`

---

### 4.1.3 Contract Detail Page (`/org/contracts/[id]`)

**Purpose**: View full contract details with management options

**Sections**:

1. **Contract Header**

   - Contract ID
   - Status badge
   - Created date, Last updated

2. **Parties Information**

   - Player card (with link to player profile)
   - Organization card
   - Team card (if assigned)

3. **Contract Terms**

   - Start Date / End Date
   - Duration (calculated days/months/years)
   - Salary (if set)
   - Contract Terms (display formatted JSON)
   - Status with expiration warning (if expiring within 30 days)

4. **Actions Panel**

   - Edit Contract (if active)
   - Renew Contract (if expiring/expired)
   - Terminate Contract (with reason modal)
   - Download Contract PDF (future feature)

5. **History/Activity Log** (if implemented)
   - Contract modifications
   - Status changes
   - Renewals

**UI Layout**:

```
[Header with Status]
[Parties Info Cards - Side by Side]
[Contract Terms Card]
[Actions Buttons]
[Related Invoices Section] (if any invoices linked)
```

---

### 4.1.4 Contract Renewal Workflow

**Purpose**: Extend existing contracts seamlessly

**Flow**:

1. From contract detail page, click "Renew Contract"
2. Pre-fill form with current contract data
3. User updates:
   - New end date (must be after current end date)
   - Updated salary (optional)
   - Updated terms (optional)
4. System actions:
   - Mark old contract as "expired"
   - Create new contract with "active" status
   - Link renewal relationship (via terms JSON)

**Implementation**: Use `createContract()` with renewal flag

---

### 4.1.5 Contract Termination

**Purpose**: End contracts before expiration

**Flow**:

1. Click "Terminate Contract" on active contract
2. Modal with:
   - Termination date (default: today)
   - Reason (required dropdown: Mutual Agreement, Breach, Other)
   - Notes (textarea)
3. Confirmation required
4. Update contract status to "terminated"
5. Update player's teamId if contract was team-specific

---

### 4.1.6 Contract Server Actions (`lib/actions/contracts.ts`)

**Functions to Create**:

```typescript
// Get all contracts for organization
export async function getOrganizationContracts(
  organizationId: string,
  filters?: {
    status?: "active" | "expired" | "terminated";
    teamId?: string;
    playerId?: string;
    startDate?: Date;
    endDate?: Date;
  }
): Promise<Contract[]>;

// Get single contract
export async function getContract(
  organizationId: string,
  contractId: string
): Promise<Contract | null>;

// Create new contract
export async function createContract(
  organizationId: string,
  data: {
    playerId: string;
    teamId?: string;
    startDate: Date;
    endDate?: Date;
    salary?: number;
    terms?: object;
  }
): Promise<{ success: boolean; contract?: Contract; error?: string }>;

// Update contract
export async function updateContract(
  organizationId: string,
  contractId: string,
  data: Partial<ContractData>
): Promise<{ success: boolean; contract?: Contract; error?: string }>;

// Renew contract
export async function renewContract(
  organizationId: string,
  contractId: string,
  newEndDate: Date,
  updatedSalary?: number
): Promise<{ success: boolean; contract?: Contract; error?: string }>;

// Terminate contract
export async function terminateContract(
  organizationId: string,
  contractId: string,
  terminationDate: Date,
  reason: string,
  notes?: string
): Promise<{ success: boolean; error?: string }>;

// Get contracts expiring soon (for dashboard alerts)
export async function getExpiringContracts(
  organizationId: string,
  daysAhead: number = 30
): Promise<Contract[]>;
```

---

## 4.2 Invoice Management System (Frontend Only)

### 4.2.1 Invoice List Page (`/org/billing/invoices`)

**Purpose**: View all invoices with filtering and status tracking

**Features**:

- **List View**:
  - Table view with: Invoice #, Player/Recipient, Amount, Due Date, Status, Created Date
  - Color-coded status badges:
    - Draft (gray)
    - Sent (blue)
    - Paid (green)
    - Overdue (red)
    - Void (muted)
- **Filters**:
  - By Status (all statuses)
  - By Player (dropdown)
  - By Date Range (created date, due date)
  - By Amount Range
- **Search**:
  - By invoice number
  - By player name
- **Quick Stats Cards**:
  - Total Outstanding (sent + overdue)
  - Total Paid (this month)
  - Overdue Count
  - Average Invoice Amount

**Actions**:

- Create Invoice button
- View invoice details
- Send invoice (draft → sent)
- Mark as paid (manual, for frontend-only)
- Void invoice

---

### 4.2.2 Create Invoice Form (`/org/billing/invoices/new`)

**Purpose**: Generate new invoices

**Form Fields**:

1. **Invoice Details**
   - Invoice Number (auto-generated: INV-YYYYMMDD-XXX or manual entry)
   - Invoice Date (default: today)
2. **Recipient** (Optional)
   - Link to Player (dropdown of org players)
   - Or leave empty for general organization invoice
3. **Financial Details**
   - Amount (required, ₦)
   - Currency (default: NGN, read-only)
   - Due Date (date picker, default: 30 days from today)
4. **Description/Items** (Textarea or structured)
   - Invoice description
   - Line items (future: structured line items)
5. **Status** (Default: "draft")
   - Start as draft
   - Can change to "sent" after creation

**Auto-generation**:

- Invoice number format: `INV-{YYYYMMDD}-{0001}` (sequential per org)
- Check for duplicates

**Server Action**: `createInvoice(data: InvoiceCreateData)`

---

### 4.2.3 Invoice Detail Page (`/org/billing/invoices/[id]`)

**Purpose**: View and manage individual invoices

**Sections**:

1. **Invoice Header**

   - Invoice Number (prominent)
   - Status badge
   - Created date, Due date

2. **Invoice Details**

   - Recipient (Player name or "General")
   - Organization info (billing address, contact)
   - Amount (large, prominent)
   - Currency
   - Description/Items list

3. **Payment Status**

   - Due date with overdue indicator
   - Paid status
   - Payment history (if any payments recorded)

4. **Actions**:

   - Edit Invoice (if draft)
   - Send Invoice (draft → sent)
   - Mark as Paid (manual, frontend-only)
   - Void Invoice
   - Download PDF (future)
   - Pay Button (disabled, grayed out with "Coming Soon" tooltip)

5. **Payment History Table**
   - Payment attempts
   - Amount paid
   - Payment method
   - Status
   - Date

---

### 4.2.4 Invoice Status Management

**Status Flow**:

```
Draft → Sent → Paid
  ↓       ↓
Void   Overdue (auto-detected)
```

**Status Changes**:

- **Draft → Sent**: Manual action, updates timestamp
- **Sent → Paid**: Manual or automatic (when payment gateway integrated)
- **Overdue**: Auto-detected when due date passes and status is "sent"
- **Void**: Can void from any status except "paid"

**Overdue Detection**:

- Background job or on-page-load check
- Update status to "overdue" if due date passed and status = "sent"

---

### 4.2.5 Invoice Server Actions (`lib/actions/invoices.ts`)

**Functions to Create**:

```typescript
// Get all invoices for organization
export async function getOrganizationInvoices(
  organizationId: string,
  filters?: {
    status?: "draft" | "sent" | "paid" | "overdue" | "void";
    playerId?: string;
    startDate?: Date;
    endDate?: Date;
  }
): Promise<Invoice[]>;

// Get single invoice
export async function getInvoice(
  organizationId: string,
  invoiceId: string
): Promise<Invoice | null>;

// Generate next invoice number
export async function generateInvoiceNumber(
  organizationId: string
): Promise<string>;

// Create new invoice
export async function createInvoice(
  organizationId: string,
  data: {
    invoiceNumber: string;
    playerId?: string;
    amount: number;
    currency?: string;
    dueDate: Date;
    description?: string;
  }
): Promise<{ success: boolean; invoice?: Invoice; error?: string }>;

// Update invoice
export async function updateInvoice(
  organizationId: string,
  invoiceId: string,
  data: Partial<InvoiceData>
): Promise<{ success: boolean; invoice?: Invoice; error?: string }>;

// Send invoice (draft → sent)
export async function sendInvoice(
  organizationId: string,
  invoiceId: string
): Promise<{ success: boolean; error?: string }>;

// Mark invoice as paid (manual)
export async function markInvoiceAsPaid(
  organizationId: string,
  invoiceId: string,
  paidAt: Date
): Promise<{ success: boolean; error?: string }>;

// Void invoice
export async function voidInvoice(
  organizationId: string,
  invoiceId: string,
  reason?: string
): Promise<{ success: boolean; error?: string }>;

// Check and update overdue invoices
export async function updateOverdueInvoices(
  organizationId: string
): Promise<number>; // Returns count of updated invoices
```

---

## 4.3 Payment History & Tracking

### 4.3.1 Payment History Page (`/org/billing/payments`)

**Purpose**: Track all payment transactions

**Features**:

- **Payment List**:
  - Table with: Invoice #, Player/Recipient, Amount, Method, Status, Date
  - Status badges: Pending, Succeeded, Failed, Refunded
- **Filters**:
  - By Status
  - By Payment Method (Paystack, Bank Transfer, Mobile Money, Cash)
  - By Date Range
  - By Invoice
- **Search**:
  - By transaction ID
  - By invoice number
  - By player name

**Summary Cards**:

- Total Revenue (succeeded payments)
- Pending Payments
- Failed Payments
- Payment Methods Breakdown

---

### 4.3.2 Payment Detail View

**Purpose**: View individual payment details

**Shows**:

- Payment ID
- Linked Invoice (with link)
- Amount and currency
- Payment method
- Status with timestamp
- Transaction ID (if from gateway)
- Payment date/time
- Metadata (JSON from payment gateway, if any)
- Related transactions (refunds, adjustments)

---

### 4.3.3 Payment Server Actions (`lib/actions/payments.ts`)

**Functions** (Read-only for now, write operations later):

```typescript
// Get all payments for organization
export async function getOrganizationPayments(
  organizationId: string,
  filters?: {
    status?: "pending" | "succeeded" | "failed" | "refunded";
    method?: string;
    startDate?: Date;
    endDate?: Date;
  }
): Promise<Payment[]>;

// Get single payment
export async function getPayment(
  organizationId: string,
  paymentId: string
): Promise<Payment | null>;

// Get payment statistics
export async function getPaymentStats(
  organizationId: string,
  period?: "day" | "week" | "month" | "year"
): Promise<{
  total: number;
  succeeded: number;
  pending: number;
  failed: number;
  byMethod: Record<string, number>;
}>;
```

---

## 4.4 Database Operations & Relationships

### Contract Operations

- **Create**: Insert into `contracts` table
- **Update**: Modify existing contract
- **Terminate**: Update status + set endDate to termination date
- **Renew**: Create new contract, expire old one
- **Query**: Filter by organizationId (row-level security)

### Invoice Operations

- **Create**: Insert into `invoices` table with auto-generated invoice number
- **Update**: Modify invoice details (if draft)
- **Status Change**: Update status field
- **Overdue Detection**: Query invoices where `dueDate < now()` AND `status = 'sent'`
- **Query**: Filter by organizationId (row-level security)

### Payment Operations (Read-only Phase 4)

- **Query**: Read payments linked to organization invoices
- **Stats**: Aggregate payment data
- **No Create/Update**: Payment creation happens in Phase 5 (payment gateway integration)

---

## 4.5 UI Components to Build

### Contract Components

1. `ContractCard` - Display contract summary
2. `ContractForm` - Create/edit contract form
3. `ContractDetailView` - Full contract display
4. `ContractStatusBadge` - Status indicator with colors
5. `RenewContractModal` - Renewal workflow modal
6. `TerminateContractModal` - Termination confirmation modal

### Invoice Components

1. `InvoiceTable` - Data table for invoice list
2. `InvoiceForm` - Create/edit invoice form
3. `InvoiceDetailView` - Full invoice display
4. `InvoiceStatusBadge` - Status indicator
5. `PayButton` - Disabled button with "Coming Soon" tooltip
6. `InvoiceNumberGenerator` - Auto-generate invoice numbers

### Payment Components

1. `PaymentHistoryTable` - Payment transaction list
2. `PaymentDetailView` - Individual payment view
3. `PaymentStatsCards` - Summary statistics
4. `PaymentMethodBadge` - Method indicator

---

## 4.6 Integration Points

### With Existing Features

1. **Player Management**:

   - Link contracts to players (already in schema)
   - Show active contract on player detail page
   - Link invoices to players

2. **Team Management**:

   - Assign contracts to teams
   - Show contracts per team

3. **Dashboard**:

   - Add "Expiring Contracts" alert
   - Add "Overdue Invoices" count
   - Add "Pending Payments" widget

4. **Player Detail Page** (`/org/players/[id]`):
   - Show contract history in Contracts tab
   - Show invoice history in Invoices tab (already implemented, but will show real data)

---

## 4.7 Validation & Security

### Contract Validation

- ✅ Player must belong to organization
- ✅ Team (if provided) must belong to organization
- ✅ Start date must be valid
- ✅ End date must be after start date (if provided)
- ✅ Salary must be positive (if provided)

### Invoice Validation

- ✅ Invoice number must be unique
- ✅ Player (if provided) must belong to organization
- ✅ Amount must be positive
- ✅ Due date must be in future or today

### Authorization Checks

- ✅ All server actions verify organization membership
- ✅ Users can only access their organization's contracts/invoices
- ✅ Row-level filtering by organizationId in all queries

---

## 4.8 Future Enhancements (Post-Phase 4)

### Phase 5+ Features

- Payment gateway integration (Paystack)
- PDF generation for contracts and invoices
- Email notifications for invoice sending
- Automated overdue detection job
- Contract renewal reminders
- Invoice templates
- Recurring invoices
- Payment reconciliation
- Financial reporting and analytics

---

## 4.9 Implementation Checklist

### Contract Management

- [ ] Create `/org/contracts` list page
- [ ] Create `/org/contracts/new` form page
- [ ] Create `/org/contracts/[id]` detail page
- [ ] Build `lib/actions/contracts.ts` server actions
- [ ] Add contract filters and search
- [ ] Implement contract renewal workflow
- [ ] Implement contract termination workflow
- [ ] Add contract status badges
- [ ] Integrate with player detail page

### Invoice Management

- [ ] Create `/org/billing/invoices` list page
- [ ] Create `/org/billing/invoices/new` form page
- [ ] Create `/org/billing/invoices/[id]` detail page
- [ ] Build `lib/actions/invoices.ts` server actions
- [ ] Implement invoice number generation
- [ ] Add invoice status management (send, mark paid, void)
- [ ] Implement overdue detection
- [ ] Add invoice filters and search
- [ ] Create disabled "Pay" button with tooltip
- [ ] Integrate with player detail page

### Payment History

- [ ] Create `/org/billing/payments` list page
- [ ] Build `lib/actions/payments.ts` server actions (read-only)
- [ ] Add payment filters and search
- [ ] Create payment statistics cards
- [ ] Link payments to invoices

### Dashboard Integration

- [ ] Add expiring contracts widget
- [ ] Add overdue invoices alert
- [ ] Add pending payments count
- [ ] Add contract/invoice quick links

### Testing

- [ ] Test contract creation with various scenarios
- [ ] Test contract renewal workflow
- [ ] Test contract termination
- [ ] Test invoice creation and status changes
- [ ] Test overdue detection
- [ ] Test authorization and security
- [ ] Test edge cases (concurrent contracts, etc.)

---

## Estimated Timeline

- **Contract Management**: 2-3 days
- **Invoice Management**: 2-3 days
- **Payment History**: 1 day
- **Integration & Polish**: 1-2 days
- **Testing**: 1 day

**Total**: ~1 week (5-7 working days)

---

## Notes

- All payment operations in Phase 4 are **manual/frontend-only**
- Payment gateway integration is **Phase 5**
- PDF generation is **future enhancement**
- Email notifications are **future enhancement**
- All monetary values in **Nigerian Naira (₦)**
- Contract terms stored as **flexible JSON** for extensibility
