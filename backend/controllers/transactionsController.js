import { getAllAccounts } from "../models/accounts.js";
import { addNewTransaction, validateTransaction } from "../models/transactions.js";


export const getAllTransactions = async (req, res) => {
  try {
    const accounts = await getAllAccounts();
    let allTransactions = [];
    accounts.forEach((account) => {
      allTransactions = [...allTransactions, account.transactions];
    });
    res.status(200).json(allTransactions);
  } catch (error) {
    res.status(500).json(`Error ${error}`);
  }
};


export const addTransaction = async (req, res) => {

  const { newTransaction } = req.body;
  const newTransactionObj = JSON.parse(newTransaction);

  try {
    const isValidTransaction = await validateTransaction(newTransactionObj);

    if (isValidTransaction !== 'validated') {
      res.status(400).json(isValidTransaction);
    } else {
      const accounts = await getAllAccounts();
      const transaction = await addNewTransaction(newTransactionObj, accounts);
      res.status(201).json(transaction);
    }
  } catch (error) {
    res.status(500).json(`Error ${error}`);
  }
};




