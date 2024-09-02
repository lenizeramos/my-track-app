import express, { Router } from "express";
import { getCategories, addCategory } from "../controllers/categoriesController.js";

const categoriesRouter = express.Router();

categoriesRouter.get("/", getCategories);
categoriesRouter.post("/", addCategory);


export default categoriesRouter;