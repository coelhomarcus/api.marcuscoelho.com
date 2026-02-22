import express from "express";
import cors from "cors";
import { contactRouter } from "./modules/contact/contact.routes";

const app = express();

app.use(cors({ origin: ["https://marcuscoelho.com"] }));
app.use(express.json());

app.use("/contact", contactRouter);

export { app };
