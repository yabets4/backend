import { BaseModel } from '../../models/systemAdmin.model.js';
class HRModel extends BaseModel { constructor(){ super('employees'); } }
export default new HRModel();
