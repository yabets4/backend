import { BaseModel } from '../../models/systemAdmin.model.js';

export default class TenantUserService {
  constructor(companyPrefix) {
    this.prefix = companyPrefix; // e.g., "abebe"
    this.userModel = new BaseModel('users'); // Base table name without prefix
  }

  // Create the prefixed users table if it doesn't exist
  async ensureUserTable() {
    await this.userModel.createTableIfNotExists(this.prefix);
  }

  // Bulk create users for this tenant
  async createUsers(users) {
    const created = [];
    for (const user of users) {
      const row = await this.userModel.create(this.prefix, user);
      created.push(row);
    }
    return created;
  }
}
