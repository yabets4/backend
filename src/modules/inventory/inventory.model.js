import { BaseModel } from '../../models/systemAdmin.model.js';
class InventoryModel extends BaseModel { constructor(){ super('inventory_items'); } }
export default new InventoryModel();
