# Data Model: Enhanced Ticket Management System

## Overview

This document outlines the database schema enhancements required to implement the comprehensive ticket management system. The changes extend the existing `log_komplain` table and add new tables to support advanced ticketing functionality.

## Enhanced Tables

### 1. Enhanced log_komplain Table

The existing `log_komplain` table will be enhanced with the following new columns:

```sql
ALTER TABLE log_komplain 
ADD COLUMN category_id INTEGER REFERENCES ticket_categories(id),
ADD COLUMN priority INTEGER DEFAULT 3 COMMENT '1=High, 2=Medium, 3=Low',
ADD COLUMN status VARCHAR(20) DEFAULT 'Open' COMMENT 'Open, In Progress, Resolved, Closed, Reopened',
ADD COLUMN assigned_to INTEGER REFERENCES users(id),
ADD COLUMN estimated_resolution_time INTEGER COMMENT 'Estimated resolution time in hours',
ADD COLUMN actual_resolution_time INTEGER COMMENT 'Actual resolution time in hours',
ADD COLUMN resolution_summary TEXT COMMENT 'Summary of resolution provided by agent',
ADD COLUMN customer_impact VARCHAR(20) DEFAULT 'Medium' COMMENT 'High, Medium, Low impact level',
ADD COLUMN tags TEXT[] COMMENT 'JSON array of tags for categorization',
ADD COLUMN due_date TIMESTAMP COMMENT 'Target resolution date based on priority',
ADD COLUMN resolved_at TIMESTAMP COMMENT 'Timestamp when ticket was resolved',
ADD COLUMN reopened_count INTEGER DEFAULT 0 COMMENT 'Number of times ticket was reopened',
ADD COLUMN sla_breached BOOLEAN DEFAULT FALSE COMMENT 'True if resolution exceeded SLA time';
```

### 2. New ticket_categories Table

```sql
CREATE TABLE ticket_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  color VARCHAR(7) DEFAULT '#000000' COMMENT 'Hex color for UI display',
  icon VARCHAR(50) COMMENT 'Icon identifier for UI',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default categories
INSERT INTO ticket_categories (name, description, color, icon) VALUES
('Hardware', 'Hardware-related issues and equipment problems', '#dc3545', 'monitor'),
('Software', 'Software applications and system issues', '#3b82f6', 'code'),
('Network', 'Network connectivity and infrastructure issues', '#059669', 'wifi'),
('Account', 'User account and access issues', '#8b5cf6', 'user'),
('Other', 'Issues not fitting other categories', '#6b7280', 'more-horizontal');
```

### 3. Enhanced users Table

```sql
ALTER TABLE users 
ADD COLUMN role_id INTEGER REFERENCES roles(id),
ADD COLUMN is_active BOOLEAN DEFAULT TRUE COMMENT 'Whether user account is active',
ADD COLUMN last_login TIMESTAMP COMMENT 'Timestamp of last user login',
ADD COLUMN phone VARCHAR(20) COMMENT 'User phone number',
ADD COLUMN department VARCHAR(100) COMMENT 'User department',
ADD COLUMN avatar_url TEXT COMMENT 'URL to user avatar image';
```

### 4. New roles Table

```sql
CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  permissions TEXT[] NOT NULL COMMENT 'JSON array of permissions',
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default roles
INSERT INTO roles (name, permissions, description) VALUES
('Admin', '["*"]', 'Full system access with all permissions'),
('Agent', '["tickets:create", "tickets:read", "tickets:update", "tickets:assign", "tickets:close"]', 'Helpdesk agent with ticket management permissions'),
('Viewer', '["tickets:read"]', 'Read-only access to tickets'),
('Manager', '["tickets:create", "tickets:read", "tickets:update", "tickets:assign", "tickets:close", "users:read", "users:update"]', 'Team manager with additional user management permissions');
```

### 5. New ticket_status_history Table

```sql
CREATE TABLE ticket_status_history (
  id SERIAL PRIMARY KEY,
  ticket_id INTEGER NOT NULL REFERENCES log_komplain(id) ON DELETE CASCADE,
  old_status VARCHAR(20) NOT NULL,
  new_status VARCHAR(20) NOT NULL,
  changed_by INTEGER NOT NULL REFERENCES users(id),
  changed_at TIMESTAMP DEFAULT NOW(),
  notes TEXT COMMENT 'Optional notes about the status change'
);

-- Index for performance
CREATE INDEX idx_ticket_status_history_ticket_id ON ticket_status_history(ticket_id);
CREATE INDEX idx_ticket_status_history_changed_at ON ticket_status_history(changed_at);
```

### 6. New notifications Table

```sql
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ticket_id INTEGER REFERENCES log_komplain(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL COMMENT 'Type of notification: ticket_assigned, status_updated, etc.',
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for performance
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_ticket_id ON notifications(ticket_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
```

## Database Indexes

To ensure optimal performance with the enhanced schema, create the following indexes:

```sql
-- Performance indexes for log_komplain table
CREATE INDEX idx_log_komplain_status ON log_komplain(status);
CREATE INDEX idx_log_komplain_category ON log_komplain(category_id);
CREATE INDEX idx_log_komplain_assigned_to ON log_komplain(assigned_to);
CREATE INDEX idx_log_komplain_created_at ON log_komplain(created_at);
CREATE INDEX idx_log_komplain_priority ON log_komplain(priority);
CREATE INDEX idx_log_komplain_due_date ON log_komplain(due_date);

-- Composite index for common queries
CREATE INDEX idx_log_komplain_status_assigned ON log_komplain(status, assigned_to);
CREATE INDEX idx_log_komplain_category_status ON log_komplain(category_id, status);

-- Full-text search index for ticket content
CREATE INDEX idx_log_komplain_search ON log_komplain USING gin(to_tsvector('title || '' || ' ' || description));
```

## Data Relationships

```mermaid
erDiagram
    users ||--o{ has_one }--| roles
    users ||--o{ has_many }--| log_komplain
    users ||--o{ has_many }--| ticket_status_history
    users ||--o{ has_many }--| notifications
    log_komplain ||--o{ has_many }--| ticket_status_history
    ticket_categories ||--o{ has_many }--| log_komplain
```

## Migration Strategy

### Phase 1: Schema Updates
1. Create new tables (ticket_categories, roles, ticket_status_history, notifications)
2. Add new columns to existing tables (log_komplain, users)
3. Insert default data for categories and roles
4. Create performance indexes

### Phase 2: Data Migration
1. Migrate existing log_komplain data to new schema
2. Map existing status values to new status system
3. Create default assignments for unassigned tickets
4. Validate data integrity after migration

### Phase 3: Validation
1. Verify all foreign key constraints
2. Test ticket creation with new schema
3. Validate status transitions are properly recorded
4. Test performance with new indexes

## Security Considerations

1. All user roles and permissions stored in JSON format for flexible access control
2. Audit trail maintained through ticket_status_history table
3. Sensitive data (passwords) properly hashed and not exposed in logs
4. Row-level security implemented for ticket updates

This enhanced data model provides the foundation for implementing a comprehensive ticket management system with proper categorization, workflow management, and audit capabilities while maintaining performance and security standards.