import express, { Router } from "express";
import { getAllTransactions, addTransaction } from "../controllers/transactionsController.js";

const transactionsRouter = express.Router();

transactionsRouter.get("/", getAllTransactions);
transactionsRouter.post("/", addTransaction);

export default transactionsRouter



