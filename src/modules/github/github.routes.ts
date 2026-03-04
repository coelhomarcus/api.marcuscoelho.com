import { Router } from "express";
import { handleGetContributions, handleGetStats } from "./github.controller";

const githubRouter = Router();

githubRouter.get("/contributions", handleGetContributions);
githubRouter.get("/stats", handleGetStats);

export { githubRouter };
