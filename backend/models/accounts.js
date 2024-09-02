const accounts = [{ id: 1, username: "John", transactions: [] }];

export const getAllAccounts = () => {
    return accounts;
};

export const addNewAccount = async (username) => {
    const savedAccount = { username, id: accounts.length + 1, transactions: [] };
    await accounts.push(savedAccount);
    return savedAccount;
};

export const validateAccount = (accountId) => {
    return accounts.find((acc) => acc.id === accountId);
};