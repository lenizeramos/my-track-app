import { getAllAccounts, addNewAccount } from "../models/accounts.js";


export const getAccounts = async (req, res) => {
  try {
    const accounts = await getAllAccounts();
    res.status(200).json(accounts);
  }
  catch (error) {
    res.status(500).json(error);
  }

};

export const addAccount = async (req, res) => {
  const { newAccount } = req.body;


  try {
    if (!newAccount) {
      res.status(400).json("Invalid data");
    } else {
      const accountAdded = await addNewAccount(newAccount);
      res.status(201).json(accountAdded);
    }
  } catch (error) {
    res.status(500).json(`Error ${error}`);
  }
};
