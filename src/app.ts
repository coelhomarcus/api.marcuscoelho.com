import express from "express";
import cors from "cors";
import { contactRouter } from "./modules/contact/contact.routes";
import { githubRouter } from "./modules/github/github.routes";

const app = express();

app.use(cors({ origin: ["https://marcuscoelho.com", "https://www.marcuscoelho.com"] }));
// app.use(cors({ origin: "*" }));
app.use(express.json());

app.use("/contact", contactRouter);
app.use("/github", githubRouter);

export { app };
