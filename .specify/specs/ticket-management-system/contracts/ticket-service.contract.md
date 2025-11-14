# Ticket Service Contract

## Overview

This contract defines the interface for the Ticket Service in the enhanced IT Helpdesk CRM system. All implementations must adhere to these specifications to ensure consistency and testability.

## Service Interface

### TicketService Class

```typescript
interface ITicketService {
  // Create a new ticket with validation
  createTicket(data: CreateTicketData): Promise<Ticket>;
  
  // Retrieve tickets with filtering and pagination
  getTickets(filter: TicketFilter, page: number, limit: number): Promise<TicketListResponse>;
  
  // Assign a ticket to a user
  assignTicket(ticketId: number, userId: number, assignment: TicketAssignment): Promise<Ticket>;
  
  // Update ticket status with resolution tracking
  updateTicketStatus(ticketId: number, status: TicketStatus, resolutionData?: ResolutionData): Promise<Ticket>;
  
  // Generate unique ticket number
  generateTicketNumber(): Promise<string>;
}
```

### Data Types

```typescript
// Base ticket entity
interface Ticket {
  id: number;
  ticket_number: string;
  title: string;
  description: string;
  category_id: number;
  priority: TicketPriority; // 1=High, 2=Medium, 3=Low
  status: TicketStatus; // Open, In Progress, Resolved, Closed, Reopened
  customer_name?: string;
  customer_email?: string;
  customer_impact: CustomerImpact; // High, Medium, Low
  assigned_to?: number;
  created_by: number;
  created_at: Date;
  updated_at: Date;
  due_date?: Date;
  estimated_resolution_time?: number;
  actual_resolution_time?: number;
  resolution_summary?: string;
  tags: string[];
  reopened_count: number;
  sla_breached: boolean;
}

// Ticket creation data
interface CreateTicketData {
  title: string;
  description: string;
  category_id: number;
  priority: TicketPriority;
  customer_name?: string;
  customer_email?: string;
  customer_impact: CustomerImpact;
  estimated_resolution_time?: number;
}

// Ticket filter options
interface TicketFilter {
  status?: TicketStatus[];
  category_id?: number;
  assigned_to?: number;
  search?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
}

// Ticket assignment data
interface TicketAssignment {
  user_id: number;
  notes?: string;
}

// Resolution data
interface ResolutionData {
  summary: string;
  actual_time: number;
}

// Ticket list response
interface TicketListResponse {
  tickets: Ticket[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

// Enums
enum TicketPriority {
  High = 1,
  Medium = 2,
  Low = 3
}

enum TicketStatus {
  Open = 'Open',
  InProgress = 'In Progress',
  Resolved = 'Resolved',
  Closed = 'Closed',
  Reopened = 'Reopened'
}

enum CustomerImpact {
  High = 'High',
  Medium = 'Medium',
  Low = 'Low'
}
```

## Validation Rules

### Ticket Creation Validation
- `title` is required, max 200 characters
- `description` is required, max 2000 characters
- `category_id` must be a valid category ID
- `priority` must be 1, 2, or 3
- `customer_impact` must be High, Medium, or Low if provided
- `estimated_resolution_time` must be positive integer if provided

### Ticket Update Validation
- `status` must be a valid TicketStatus
- `resolution_data.summary` is required when status is 'Resolved'
- `resolution_data.actual_time` must be positive integer when status is 'Resolved'

### Business Rules

1. **Ticket Number Generation**: Format must be TKT-YYYYMMDD-XXXX where XXXX is a random 4-digit number
2. **Priority Assignment**: High priority tickets must be assigned within 1 hour, Medium within 4 hours, Low within 24 hours
3. **Status Transitions**: Only specific transitions are allowed:
   - Open → In Progress
   - In Progress → Resolved
   - Resolved → Closed
   - Closed → Reopened (with admin approval)
   - Any status → Open (for reassignment)
4. **Assignment Rules**: Tickets can only be assigned to users with appropriate permissions
5. **SLA Calculation**: Due date is calculated based on priority:
   - High: 8 business hours
   - Medium: 24 business hours
   - Low: 72 business hours

## Error Handling

### Error Codes
- `TICKET_001`: Invalid ticket data
- `TICKET_002`: Ticket not found
- `TICKET_003`: Unauthorized access
- `TICKET_004`: Assignment failed
- `TICKET_005`: Invalid status transition
- `TICKET_006`: Resolution data required for resolved tickets

### Error Response Format
```typescript
interface ErrorResponse {
  error: string;
  code: string;
  details?: any;
  timestamp: string;
}
```

## Performance Requirements

### Response Times
- All ticket operations must respond within 500ms for 95% of requests
- Database queries must be optimized with proper indexing
- Ticket list retrieval must support pagination for up to 10,000 tickets

### Concurrency
- Service must handle concurrent ticket modifications using database row-level locking
- WebSocket notifications must be delivered within 100ms of status changes

## Testing Requirements

### Unit Tests
- All service methods must have unit tests with >80% code coverage
- Validation rules must be tested with valid and invalid inputs
- Error scenarios must be tested for all error codes

### Integration Tests
- Complete ticket creation workflow must be testable
- Ticket assignment with notifications must be testable
- Status transitions with audit trail must be testable
- Concurrent modification handling must be testable

This contract provides the foundation for implementing a robust, testable ticket management service that meets the requirements of the enhanced IT Helpdesk CRM system.