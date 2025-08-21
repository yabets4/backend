### Auth
POST /api/public/auth/login { company, email, password } -> { token }

### Using tenant routes
All secured routes require:
- Authorization: Bearer <token>
- token must contain `tenantPrefix`
- Alternatively for some public reads, send `X-Company: <prefix>`

### Modules (CRUD)
GET    /api/tenant/products
GET    /api/tenant/products/:id
POST   /api/tenant/products
PUT    /api/tenant/products/:id
PATCH  /api/tenant/products/:id
DELETE /api/tenant/products/:id

... same pattern for /crm, /users, /projects, /inventory, /hr, /finance, /procurement, /reports, /notifications
