import { BaseModel } from '../../models/systemAdmin.model.js';
class FinanceModel extends BaseModel { constructor(){ super('transactions'); } }
export default new FinanceModel();
