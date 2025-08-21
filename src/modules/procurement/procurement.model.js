import { BaseModel } from '../../models/systemAdmin.model.js';
class ProcurementModel extends BaseModel { constructor(){ super('purchase_orders'); } }
export default new ProcurementModel();
