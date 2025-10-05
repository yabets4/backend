import { Router } from "express";
import { getAllLeads, getQuotes,
  getQuote,
  createQuote,
  updateQuote,
  deleteQuote,
  addQuoteAttachment,
  deleteQuoteAttachment,
  addQuoteItem,
  addQuoteItemAttachment,
  deleteQuoteItemAttachment, } from "./quote.controller.js";

const r = Router();

r.get("/leads/", getAllLeads);
r.get("/", getQuotes);                  // GET all quotes
r.get("/:quoteId", getQuote);           // GET single quote
r.post("/", createQuote);               // CREATE quote
r.put("/:quoteId", updateQuote);        // UPDATE quote
r.delete("/:quoteId", deleteQuote);     // DELETE quote

// Quote attachments
r.post("/:quoteId/attachments", addQuoteAttachment);               // add attachment
r.delete("/:quoteId/attachments/:attachmentId", deleteQuoteAttachment); // remove attachment

// Quote items
r.post("/:quoteId/items", addQuoteItem);                           // add item to quote

// Quote item attachments
r.post("/items/:quoteItemId/attachments", addQuoteItemAttachment);           // add attachment to an item
r.delete("/items/attachments/:attachmentId", deleteQuoteItemAttachment);     // remove attachment from an item


export default r;
