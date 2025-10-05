import QuoteService from './quote.service.js';
import { ok, badRequest, notFound } from '../../../utils/apiResponse.js';

export async function getAllLeads(req, res) {
  try {
    const { companyID } = req.auth;
    if (!companyID) return res.status(400).json({ error: 'Company ID is required' });

    const leads = await QuoteService.getAllLeads(companyID);
    return res.json({ success: true, data: leads });
  } catch (error) {
    console.error('Error fetching leads:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

// GET all quotes
export async function getQuotes(req, res) {
  try {
    const { companyID } = req.auth; 
    const quotes = await QuoteService.list(companyID);
    console.log(quotes);
    
    return ok(res, quotes);
  } catch (error) {
    console.log(error);
    return badRequest(res, error.message);
  }
}

// GET single quote
export async function getQuote(req, res) {
  try {
    const { companyID } = req.auth; 
    const { quoteId } = req.params;
    const quote = await QuoteService.get(companyID, quoteId);
    console.log(quote);
    if (!quote) return notFound(res, "Quote not found");
    return ok(res, quote);
  } catch (error) {
    console.log(error);
    return badRequest(res, error.message);
  }
}

// POST create quote
export async function createQuote(req, res) {
  try {
    const { companyID } = req.auth; 
    const newQuote = await QuoteService.create(companyID, req.body);
    return ok(res, newQuote);
  } catch (error) {
    console.log(error);
    return badRequest(res, error.message);
  }
}

// PUT update quote
export async function updateQuote(req, res) {
  try {
    const { companyID } = req.auth; 
    const { quoteId } = req.params;
    const updated = await QuoteService.update(companyID, quoteId, req.body);
    return ok(res, updated);
  } catch (error) {
    console.log(error);
    
    return badRequest(res, error.message);
  }
}

// DELETE quote
export async function deleteQuote(req, res) {
  try {
    const { companyID } = req.auth; 
    const { quoteId } = req.params;
    await QuoteService.remove(companyID, quoteId);
    return ok(res, "Quote deleted");
  } catch (error) {
    return badRequest(res, error.message);
  }
}

// POST add attachment
export async function addQuoteAttachment(req, res) {
  try {
    const { companyID } = req.auth; 
    const { quoteId } = req.params;
    const attachment = await QuoteService.addAttachment(companyID, quoteId, req.body);
    return ok(res, attachment);
  } catch (error) {
    return badRequest(res, error.message);
  }
}

// DELETE attachment
export async function deleteQuoteAttachment(req, res) {
  try {
    const { companyID } = req.auth; 
    const { quoteId, attachmentId } = req.params;
    await QuoteService.removeAttachment(companyID, quoteId, attachmentId);
    return ok(res, "Attachment removed");
  } catch (error) {
    return badRequest(res, error.message);
  }
}

// POST add item
export async function addQuoteItem(req, res) {
  try {
    const { companyID } = req.auth; 
    const { quoteId } = req.params;
    const item = await QuoteService.addItem(companyID, quoteId, req.body);
    return ok(res, item);
  } catch (error) {
    return badRequest(res, error.message);
  }
}

// POST add item attachment
export async function addQuoteItemAttachment(req, res) {
  try {
    const { companyID } = req.auth; 
    const { quoteItemId } = req.params;
    const attachment = await QuoteService.addItemAttachment(companyID, quoteItemId, req.body);
    return ok(res, attachment);
  } catch (error) {
    return badRequest(res, error.message);
  }
}

// DELETE item attachment
export async function deleteQuoteItemAttachment(req, res) {
  try {
    const { companyID } = req.auth; 
    const { attachmentId } = req.params;
    await QuoteService.removeItemAttachment(companyID, attachmentId);
    return ok(res, "Item attachment removed");
  } catch (error) {
    return badRequest(res, error.message);
  }
}



