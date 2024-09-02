import express from "express";
import cors from "cors";
import accountRouter from "./routes/accountRoutes.js";
import categoriesRouter from "./routes/categoriesRoutes.js";
import transactionsRouter from "./routes/transactionRoutes.js";

const app = express();
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/accounts', accountRouter);
app.use('/categories', categoriesRouter);
app.use('/transactions', transactionsRouter,);

export default app;