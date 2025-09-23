import PricingTierService from "./pricingTier.service.js";

export default class PricingTierController {
  static async fetchAll(req, res) {
    try {
      const tiers = await PricingTierService.getAllTiers();
      res.json(tiers);
    } catch (err) {
      console.error("Controller fetchAll error:", err);
      res.status(500).json({ error: err.message });
    }
  }

  static async fetchOne(req, res) {
    try {
      const { tier_id } = req.params;
      const tier = await PricingTierService.getTierById(tier_id);
      res.json(tier);
    } catch (err) {
      console.error("Controller fetchOne error:", err);
      res.status(500).json({ error: err.message });
    }
  }

  static async create(req, res) {
    try {
      const tier = await PricingTierService.createTier(req.body);
      res.json(tier);
    } catch (err) {
      console.error("Controller create error:", err);
      res.status(500).json({ error: err.message });
    }
  }

  static async update(req, res) {
    try {
      const { tier_id } = req.params;
      const tier = await PricingTierService.updateTier(tier_id, req.body);
      res.json(tier);
    } catch (err) {
      console.error("Controller update error:", err);
      res.status(500).json({ error: err.message });
    }
  }

  static async delete(req, res) {
    try {
      const { tier_id } = req.params;
      await PricingTierService.deleteTier(tier_id);
      res.json({ success: true });
    } catch (err) {
      console.error("Controller delete error:", err);
      res.status(500).json({ error: err.message });
    }
  }
}
