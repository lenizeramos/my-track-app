import { getAllCategoriesFN, addNewCategory } from "../models/categories.js";

export const getCategories = async (req, res) => {
  try {
    const allCategories = await getAllCategoriesFN();
    res.status(200).json(allCategories);
  } catch (error) {
    res.status(500).json(`Error ${error}`);
  }
};

export const addCategory = async (req, res) => {
  const { newCategory } = req.body;
  try {
    if (!newCategory) {
      res.status(400).json("Invalid data");
    } else {
      const categoryAdded = await addNewCategory(newCategory);
      res.status(201).json(categoryAdded);
    }
  } catch (error) {
    res.status(500).json(`Error ${error}`);
  }
};