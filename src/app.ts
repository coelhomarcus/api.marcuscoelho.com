import express from "express";
import { contactRouter } from "./modules/contact/contact.routes";

const app = express();

app.use(express.json());

app.use("/contact", contactRouter);

export { app };
