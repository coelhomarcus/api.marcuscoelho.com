import { Router } from "express";
import { handleCreateContact } from "./contact.controller";

const contactRouter = Router();

contactRouter.post("/", handleCreateContact);

export { contactRouter };
