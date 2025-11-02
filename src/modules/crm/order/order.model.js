import pool from "../../../loaders/db.loader.js";

export const OrderModel = {
  async getLeadsWithQuotes(companyId) {
    try {
      // 1. Fetch all leads
      const leadsQuery = `
        SELECT 
          lead_id,
          name,
          address,
          email,
          primary_phone as phone
        FROM leads
        WHERE company_id = $1
        ORDER BY name ASC
      `;
      const { rows: leads } = await pool.query(leadsQuery, [companyId]);

      // 2. Fetch all relevant quotes for the company
      const quotesQuery = `
        SELECT * 
        FROM quotes 
        WHERE company_id = $1 AND lead_id IS NOT NULL AND status = 'Accepted' 
        ORDER BY created_at DESC
      `;
      const { rows: quotes } = await pool.query(quotesQuery, [companyId]);

      // 3. Fetch all quote items for the company
      const quoteItemsQuery = `
        SELECT * 
        FROM quote_items 
        WHERE company_id = $1
      `;
      const { rows: quoteItems } = await pool.query(quoteItemsQuery, [companyId]);

      // 4. Create a map of items by quote_id
      const itemsByQuote = quoteItems.reduce((acc, item) => {
        if (!acc[item.quote_id]) {
          acc[item.quote_id] = [];
        }
        acc[item.quote_id].push(item);
        return acc;
      }, {});

      // 5. Create a map of quotes (with their items) by lead_id
      const quotesByLead = quotes.reduce((acc, quote) => {
        if (!acc[quote.lead_id]) {
          acc[quote.lead_id] = [];
        }
        // Attach items to the quote
        quote.items = itemsByQuote[quote.quote_id] || [];
        acc[quote.lead_id].push(quote);
        return acc;
      }, {});

      // 6. Combine leads with their quotes
      return leads.map(lead => ({
        ...lead,
        quotes: quotesByLead[lead.lead_id] || []
      }));
    } catch (error) {
      console.error('Error fetching leads with quotes:', error);
      throw new Error('Could not fetch leads with quotes');
    }
  },

  /**
   * Creates a new sales order and its associated items in a transaction.
   * @param {string} companyId - The ID of the company.
   * @param {object} data - The order data.
   * @returns {Promise<object>} The newly created order with its items.
   */
  async create(companyId, data) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Get and increment the next order number
      const { rows: companyRows } = await client.query(
        `UPDATE companies SET next_order_number = next_order_number + 1 WHERE company_id = $1 RETURNING next_order_number`,
        [companyId]
      );
      const orderNumber = companyRows[0].next_order_number;
      const order_id = `ORD-${String(orderNumber).padStart(3, '0')}`;

      // 2. Create the main order record
      const orderQuery = `
        INSERT INTO orders (company_id, order_id, quote_id, lead_id, status, order_date, delivery_date, total_amount)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *;
      `;
      const orderValues = [
        companyId, order_id, data.quote_id, data.lead_id, data.status || 'Pending',
        data.orderDate, data.delivery_date || null, data.totalAmount || 0
      ];
      const { rows: orderRows } = await client.query(orderQuery, orderValues);
      const newOrder = orderRows[0];

      // 3. Create the order items
      const createdItems = [];
      if (data.orderItems && data.orderItems.length > 0) {
        for (const item of data.orderItems) {
          const itemQuery = `
            INSERT INTO order_items (company_id, order_id, quote_id, product_name, quantity, unit_price, description)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
          `;
          const itemValues = [
            companyId, order_id, data.quote_id, item.name, item.quantity, item.unit_price, item.description || null
          ];
          const { rows: itemRows } = await client.query(itemQuery, itemValues);
          createdItems.push(itemRows[0]);
        }
      }

      await client.query('COMMIT');
      newOrder.items = createdItems;
      return newOrder;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creating order:', error);
      throw new Error('Could not create order');
    } finally {
      client.release();
    }
  },

  /**
   * Fetches all orders for a company.
   * @param {string} companyId - The ID of the company.
   * @returns {Promise<Array>} A list of all orders.
   */
  async findAll(companyId) {
    // Fetch all orders and attach their order_items in a single follow-up query
    const query = `
      SELECT o.*, l.name as customer_name
      FROM orders o
      LEFT JOIN leads l ON o.company_id = l.company_id AND o.lead_id = l.lead_id
      WHERE o.company_id = $1 ORDER BY o.created_at DESC
    `;
    const { rows } = await pool.query(query, [companyId]);

    // Fetch all order items for this company and group them by order_id
    const { rows: itemRows } = await pool.query(
      'SELECT * FROM order_items WHERE company_id = $1 ORDER BY id',
      [companyId]
    );

    const itemsByOrder = itemRows.reduce((acc, item) => {
      if (!acc[item.order_id]) acc[item.order_id] = [];
      acc[item.order_id].push(item);
      return acc;
    }, {});

    // Attach items array (empty if none) to each order row
    return rows.map(order => ({
      ...order,
      items: itemsByOrder[order.order_id] || []
    }));
  },

  /**
   * Fetches a single order by its ID, including its items.
   * @param {string} companyId - The ID of the company.
   * @param {string} orderId - The ID of the order.
   * @returns {Promise<object|null>} The order object or null if not found.
   */
  async findById(companyId, orderId) {
    const query = `
      SELECT o.*, l.name as customer_name
      FROM orders o
      LEFT JOIN leads l ON o.company_id = l.company_id AND o.lead_id = l.lead_id
      WHERE o.company_id = $1 AND o.order_id = $2`;
    const { rows: orderRows } = await pool.query(query, [companyId, orderId]);
    if (orderRows.length === 0) {
      return null;
    }
    const order = orderRows[0];

    const { rows: itemRows } = await pool.query('SELECT * FROM order_items WHERE company_id = $1 AND order_id = $2 ORDER BY id', [companyId, orderId]);
    order.items = itemRows;

    return order;
  },

  /**
   * Updates an order. For simplicity, this example only updates the status.
   * A full implementation would handle updating items as well.
   * @param {string} companyId - The ID of the company.
   * @param {string} orderId - The ID of the order to update.
   * @param {object} data - The data to update.
   * @returns {Promise<object|null>} The updated order object or null if not found.
   */
  async update(companyId, orderId, data) {
    // Full update with transactional handling of items.
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const { status, delivery_date, total_amount, order_date, quote_id } = data;
      const { rows } = await client.query(
        `UPDATE orders SET 
           status = COALESCE($3, status), 
           delivery_date = COALESCE($4, delivery_date),
           total_amount = COALESCE($5, total_amount),
           order_date = COALESCE($6, order_date),
           updated_at = NOW()
         WHERE company_id = $1 AND order_id = $2
         RETURNING *`,
        [companyId, orderId, status, delivery_date, total_amount, order_date]
      );

      if (rows.length === 0) {
        await client.query('ROLLBACK');
        return null;
      }

      // If items provided in payload, reconcile them by deleting existing and inserting new ones.
      const incomingItems = data.items && data.items.length ? data.items : (data.orderItems || []);
      const createdItems = [];
      if (incomingItems && incomingItems.length > 0) {
        // Remove existing items for this order
        await client.query('DELETE FROM order_items WHERE company_id = $1 AND order_id = $2', [companyId, orderId]);

        for (const item of incomingItems) {
          const itemQuery = `
            INSERT INTO order_items (company_id, order_id, quote_id, product_name, quantity, unit_price, description)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
          `;
          const itemValues = [
            companyId,
            orderId,
            item.quote_id || quote_id || data.quote_id || null,
            item.product_name || item.name || item.item || null,
            item.quantity ?? item.qty ?? 1,
            item.unit_price ?? item.price ?? item.unit_price ?? 0,
            item.description || null,
          ];
          const { rows: itemRows } = await client.query(itemQuery, itemValues);
          createdItems.push(itemRows[0]);
        }
      }

      await client.query('COMMIT');

      // Build updated order object (include items)
      const updatedOrder = rows[0];
      updatedOrder.items = createdItems.length ? createdItems : (await (async () => {
        const { rows: itemRows } = await pool.query('SELECT * FROM order_items WHERE company_id = $1 AND order_id = $2 ORDER BY id', [companyId, orderId]);
        return itemRows;
      })());

      return updatedOrder;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error updating order with items:', error);
      throw new Error('Could not update order');
    } finally {
      client.release();
    }
  },

  async remove(companyId, orderId) {
    const { rowCount } = await pool.query(
      'DELETE FROM orders WHERE company_id = $1 AND order_id = $2',
      [companyId, orderId]
    );
    return rowCount > 0;
  }
};