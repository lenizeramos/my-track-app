import express, { Router } from "express";
import { getAccounts, addAccount } from "../controllers/accountsController.js";

const accountRouter = express.Router();

accountRouter.get("/", getAccounts);
accountRouter.post("/", addAccount);

export default accountRouter;