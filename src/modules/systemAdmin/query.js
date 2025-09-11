// queries.js
export const tenantQueries = (prefix) => [
  // 1. Location (no dependencies)
  `CREATE TABLE IF NOT EXISTS ${prefix}_location (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    address TEXT,
    contact VARCHAR(100),
    operational_hours VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);`,

  // 2. Users (no dependencies)
  `
  CREATE TABLE IF NOT EXISTS ${prefix}_users (
      id BIGSERIAL PRIMARY KEY,
      user_id VARCHAR(20) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      phone VARCHAR(50),
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50),
      created_at TIMESTAMP DEFAULT NOW()
  );

  CREATE SEQUENCE IF NOT EXISTS ${prefix}_user_seq START 1;

  CREATE OR REPLACE FUNCTION generate_user_id()
  RETURNS TRIGGER AS $$
  BEGIN
      NEW.user_id := 'USR' || LPAD(nextval('${prefix}_user_seq')::TEXT, 3, '0');
      RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  CREATE TRIGGER set_user_id
  BEFORE INSERT ON ${prefix}_users
  FOR EACH ROW
  EXECUTE FUNCTION generate_user_id();
  `,

  // 3. Customers (no dependencies)
  `
CREATE TABLE IF NOT EXISTS ${prefix}_customers (
    id BIGSERIAL PRIMARY KEY,
    customer_id VARCHAR(20) UNIQUE NOT NULL,
    customer_type VARCHAR(20) NOT NULL CHECK (customer_type IN ('Individual', 'Company')),
    name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255),
    contact_phone VARCHAR(50),
    job_title VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(50),
    billing_address TEXT NOT NULL,
    shipping_address TEXT,
    tin_number VARCHAR(50),
    photo_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION generate_customer_id()
RETURNS TRIGGER AS $$
DECLARE
    last_id VARCHAR(20);
    last_num INT;
BEGIN
    SELECT customer_id INTO last_id
    FROM ${prefix}_customers
    ORDER BY id DESC
    LIMIT 1;

    IF last_id IS NULL THEN
        last_num := 1;
    ELSE
        last_num := CAST(SUBSTRING(last_id FROM 6) AS INT) + 1;
    END IF;

    NEW.customer_id := 'CUST-' || LPAD(last_num::TEXT, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_customer_id
BEFORE INSERT ON ${prefix}_customers
FOR EACH ROW
WHEN (NEW.customer_id IS NULL)
EXECUTE FUNCTION generate_customer_id();

CREATE OR REPLACE FUNCTION validate_customer_fields()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.customer_type = 'Company' THEN
        IF NEW.contact_name IS NULL OR NEW.contact_phone IS NULL OR NEW.job_title IS NULL THEN
            RAISE EXCEPTION 'Company customers must have contact_name, contact_phone, and job_title.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_customer_fields
BEFORE INSERT OR UPDATE ON ${prefix}_customers
FOR EACH ROW
EXECUTE FUNCTION validate_customer_fields();
`,

  // 4. Products (no dependencies)
  `
  CREATE TABLE IF NOT EXISTS ${prefix}_products (
    id BIGSERIAL PRIMARY KEY,
    product_id VARCHAR(50) UNIQUE NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Active',
    uom VARCHAR(50),
    product_type VARCHAR(50),
    cost_price NUMERIC(12,2),
    price NUMERIC(12,2),
    description TEXT,
    tags TEXT[],
    length NUMERIC(10,2),
    width NUMERIC(10,2),
    height NUMERIC(10,2),
    dimension_unit VARCHAR(20),
    weight_value NUMERIC(10,2),
    weight_unit VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
`,

  // 5. Employees + related tables (depends on location)
  `
  CREATE SEQUENCE IF NOT EXISTS ${prefix}_employee_id_seq START 1;

  CREATE TABLE IF NOT EXISTS ${prefix}_employees (
      id BIGSERIAL PRIMARY KEY,
      employee_id VARCHAR(50) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      phone_number VARCHAR(50),
      address TEXT,
      date_of_birth DATE,
      gender VARCHAR(20),
      marital_status VARCHAR(20),
      department VARCHAR(100),
      job_title VARCHAR(100),
      hire_date DATE,
      location VARCHAR(100),
      employee_type VARCHAR(50),
      contract_type VARCHAR(50),
      base_salary NUMERIC(12,2),
      pay_frequency VARCHAR(50),
      bank_account VARCHAR(100),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
  );

  CREATE OR REPLACE FUNCTION ${prefix}_generate_employee_id()
  RETURNS TRIGGER AS $$
  BEGIN
      NEW.employee_id := 'EMP' || LPAD(nextval('${prefix}_employee_id_seq')::TEXT, 6, '0');
      RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  CREATE TRIGGER set_employee_id
  BEFORE INSERT ON ${prefix}_employees
  FOR EACH ROW
  WHEN (NEW.employee_id IS NULL)
  EXECUTE FUNCTION ${prefix}_generate_employee_id();

  CREATE TABLE IF NOT EXISTS ${prefix}_employee_emergency_contacts (
      id BIGSERIAL PRIMARY KEY,
      employee_id VARCHAR(50) REFERENCES ${prefix}_employees(employee_id) ON DELETE CASCADE,
      contact_name VARCHAR(255) NOT NULL,
      relationship VARCHAR(50),
      phone VARCHAR(50)
  );

  CREATE TABLE IF NOT EXISTS ${prefix}_employee_skills (
      id BIGSERIAL PRIMARY KEY,
      employee_id VARCHAR(50) REFERENCES ${prefix}_employees(employee_id) ON DELETE CASCADE,
      skill_name VARCHAR(100) NOT NULL
  );

  CREATE TABLE IF NOT EXISTS ${prefix}_employee_certifications (
      id BIGSERIAL PRIMARY KEY,
      employee_id VARCHAR(50) REFERENCES ${prefix}_employees(employee_id) ON DELETE CASCADE,
      certification_name VARCHAR(255) NOT NULL,
      issued_by VARCHAR(255),
      expiry_date DATE,
      attachment_url TEXT
  );
  `,

  // 6. Attendance & Shifts & Leave Requests & Tools (depends on employees & location)
  `
  CREATE TABLE IF NOT EXISTS ${prefix}_employee_attendance (
      id SERIAL PRIMARY KEY,
      employee_id VARCHAR(20) NOT NULL REFERENCES ${prefix}_employees(employee_id) ON DELETE CASCADE,
      attendance_date DATE NOT NULL,
      clock_in TIME,
      clock_out TIME,
      break_minutes INT DEFAULT 0,
      total_hours DECIMAL(5,2) GENERATED ALWAYS AS (
          EXTRACT(EPOCH FROM (clock_out - clock_in))/3600 - (break_minutes/60.0)
      ) STORED,
      notes TEXT,
      gps_lat DECIMAL(10,7),
      gps_lon DECIMAL(10,7)
  );

  CREATE TABLE IF NOT EXISTS ${prefix}_shift (
    id BIGSERIAL PRIMARY KEY,
    employee_id VARCHAR(50) REFERENCES ${prefix}_employees(employee_id) ON DELETE CASCADE,
    shift_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    location_name VARCHAR(255) REFERENCES ${prefix}_location(name) ON DELETE SET NULL,
    notes TEXT
  );

  CREATE TABLE IF NOT EXISTS ${prefix}_leave_requests (
    id BIGSERIAL PRIMARY KEY,
    employee_id VARCHAR(50) REFERENCES ${prefix}_employees(employee_id) ON DELETE CASCADE,
    leave_type VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    number_of_days INT GENERATED ALWAYS AS (end_date - start_date + 1) STORED,
    reason TEXT,
    approver_comments TEXT,
    status VARCHAR(50) DEFAULT 'Pending',
    created_by VARCHAR(50) REFERENCES ${prefix}_users(user_id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS ${prefix}_assigned_tools (
    id BIGSERIAL PRIMARY KEY,
    employee_id VARCHAR(50) REFERENCES ${prefix}_employees(employee_id) ON DELETE CASCADE,
    asset_name VARCHAR(255) NOT NULL,
    assignment_date DATE NOT NULL,
    return_date DATE,
    status VARCHAR(50) DEFAULT 'Assigned',
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );
`,

  // 7. Orders (depends on customers & products)
  `
CREATE TABLE IF NOT EXISTS ${prefix}_orders (
    id BIGSERIAL PRIMARY KEY,
    order_id VARCHAR(20) UNIQUE NOT NULL,
    customer_id VARCHAR(20) NOT NULL REFERENCES ${prefix}_customers(customer_id),
    order_date TIMESTAMP DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'Pending',
    billing_address TEXT NOT NULL,
    shipping_address TEXT NOT NULL,
    total_amount NUMERIC(12,2) DEFAULT 0,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS ${prefix}_order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id VARCHAR(20) NOT NULL REFERENCES ${prefix}_orders(order_id) ON DELETE CASCADE,
    product_id VARCHAR(50) NOT NULL REFERENCES ${prefix}_products(product_id),
    quantity NUMERIC(10,2) NOT NULL,
    unit_price NUMERIC(12,2) NOT NULL,  
    line_total NUMERIC(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED
);

CREATE OR REPLACE FUNCTION generate_order_id()
RETURNS TRIGGER AS $$
DECLARE
    last_id VARCHAR(20);
    last_num INT;
BEGIN
    SELECT order_id INTO last_id
    FROM ${prefix}_orders
    ORDER BY id DESC
    LIMIT 1;

    IF last_id IS NULL THEN
        last_num := 1;
    ELSE
        last_num := CAST(SUBSTRING(last_id FROM 5) AS INT) + 1;
    END IF;

    NEW.order_id := 'ORD-' || LPAD(last_num::TEXT, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_order_id
BEFORE INSERT ON ${prefix}_orders
FOR EACH ROW
WHEN (NEW.order_id IS NULL)
EXECUTE FUNCTION generate_order_id();

CREATE OR REPLACE FUNCTION update_order_total()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE ${prefix}_orders
    SET total_amount = COALESCE((
        SELECT SUM(line_total)
        FROM ${prefix}_order_items
        WHERE order_id = NEW.order_id
    ), 0)
    WHERE order_id = NEW.order_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_order_total_insert
AFTER INSERT OR UPDATE ON ${prefix}_order_items
FOR EACH ROW
EXECUTE FUNCTION update_order_total();

CREATE TRIGGER trg_update_order_total_delete
AFTER DELETE ON ${prefix}_order_items
FOR EACH ROW
EXECUTE FUNCTION update_order_total();
`,

  // 8. Raw Materials & Movements (no order dependency, but movements references raw_material & employees)
  `
CREATE TABLE IF NOT EXISTS ${prefix}_raw_material (
    id BIGSERIAL PRIMARY KEY,
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    uom VARCHAR(50),
    cost_price NUMERIC(12,2) NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    total_cost NUMERIC(12,2) GENERATED ALWAYS AS (cost_price * quantity) STORED,
    min_stock_level INT,
    shelf_life INTERVAL,
    supplier VARCHAR(255),
    location VARCHAR(255),
    specifications TEXT,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ${prefix}_material_movements (
    id BIGSERIAL PRIMARY KEY,
    sku VARCHAR(50) NOT NULL REFERENCES ${prefix}_raw_material(sku) ON DELETE CASCADE,
    quantity NUMERIC(12, 2) NOT NULL,
    employee_id VARCHAR(20) REFERENCES ${prefix}_employees(employee_id),
    movement_type VARCHAR(50) NOT NULL,
    movement_date TIMESTAMP NOT NULL DEFAULT NOW(),
    from_location VARCHAR(100),
    to_location VARCHAR(100),
    source_location VARCHAR(100),
    destination_document VARCHAR(100),
    project_id BIGINT REFERENCES ${prefix}_projects(id),
    supplier_id BIGINT REFERENCES ${prefix}_suppliers(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
`,

  // 9. Leads (depends on users for assignment, optional)
  `
CREATE TABLE IF NOT EXISTS ${prefix}_leads (
    id BIGSERIAL PRIMARY KEY,
    lead_id VARCHAR(20) UNIQUE NOT NULL,
    lead_type VARCHAR(20) NOT NULL CHECK (lead_type IN ('Individual', 'Company')),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    contact_person_name VARCHAR(150),
    contact_person_email VARCHAR(255),
    contact_person_job_title VARCHAR(100),
    phone VARCHAR(20) NOT NULL,
    address TEXT,
    assigned_to VARCHAR(100),
    lead_source VARCHAR(100),
    referred_by VARCHAR(150),
    status VARCHAR(50),
    priority VARCHAR(20),
    service_requested VARCHAR(255),
    notes TEXT,
    attachments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`,

  // 10. Roles & RBAC (depends on users)
  `
CREATE TABLE IF NOT EXISTS ${prefix}_roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    permissions JSONB DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS ${prefix}_rbac (
    id SERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES ${prefix}_users(id) ON DELETE CASCADE,
    roles JSONB DEFAULT '[]'
);
`
];
