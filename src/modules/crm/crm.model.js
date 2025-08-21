import { BaseModel } from '../../models/systemAdmin.model.js';
class CRMModel extends BaseModel { constructor(){ super('customers'); } }
export default new CRMModel();
