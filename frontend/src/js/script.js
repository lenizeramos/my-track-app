$(() => {
  $("#add_new_account").on("click", function () {
    createNewAccount();
  });

  $("#create_category_button").on("click", function () {
    createNewCategory();
  });

  $("#transactions_button").on("click", function () {
    createNewTransaction();
  });

  $("#select_account").on("change", async function () {
    buildAccountSelect(await getAccounts(), "#transfer_to", $(this).val());
  });

  $("#transfer_to").on("change", async function () {
    buildAccountSelect(await getAccounts(), "#select_account", $(this).val());
  });

  $(".radio-transaction").on("change", function () {
    if ($("#deposit").is(":checked") || $("#withdraw").is(":checked")) {
      $("#div_transfer_to").addClass("d-none");
    } else if ($("#transfer").is(":checked")) {
      $("#div_transfer_to").removeClass("d-none");
    }
  });

  loadServerData();

  $("#filter_account, #filter_category, #filter_transaction").on("change", filterTransactionsTable);
});

async function filterTransactionsTable() {
  let accountsFilter = $("#filter_account").val();
  let categoriesFilter = $("#filter_category").val();
  let transactionsFilter = $("#filter_transaction").val();

  let accounts = await getAccounts();
  let categories = await getCategories();
  let transactions = buildTransactionsWithUsernameAndCategory(
    accounts,
    categories
  );
  
  if (accountsFilter) {
    transactions = transactions.filter(
      (transaction) => transaction.accountId == accountsFilter
    );
  }

  
  if (categoriesFilter) {
    transactions = transactions.filter(
      (transaction) => transaction.categoryId == categoriesFilter
    );
  }
  if (transactionsFilter) {
    transactions = transactions.filter(
      (transaction) => transaction.type == transactionsFilter
    );
  }
  fillTransactionsTable2(transactions);
}

function appendAlertMessage(id, message, type) {
  const alertMessageId = $(id);
  const wrapper = $("<div>");
  const divAlert = $("<div>", {
    class: `alert alert-${type} alert-dismissible`,
    role: "alert",
  });
  const divMessage = $("<div>").html(`${message}`);
  const btnClose = $("<button>", {
    type: "button",
    class: "btn-close",
    "data-bs-dismiss": "alert",
    "aria-label": "Close",
  });

  divAlert.append(divMessage, btnClose);
  wrapper.append(divAlert);
  alertMessageId.html(wrapper);
}

async function createNewAccount() {
  let accountName = $("#new_account").val().trim().toLowerCase();

  if (accountName === "") {
    appendAlertMessage(
      "#alert_message_account",
      "Write the account name!",
      "warning"
    );
    return;
  }

  if (await isNewAccount(accountName)) {
    let settings = {
      url: "http://localhost:3000/accounts",
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: { newAccount: accountName },
    };
    $.ajax(settings)
      .done(function () {
        $("#new_account").val("");
        loadServerData();
        appendAlertMessage(
          "#alert_message_account",
          "Account created successfully!",
          "success"
        );
      })
      .fail(function (error) {
        console.error("Error:", error);
      });
  } else {
    appendAlertMessage(
      "#alert_message_account",
      "Account already exists!",
      "danger"
    );
  }
}

async function isNewAccount(newAccountName) {
  let accounts = await getAccounts();

  return !accounts.some(
    (account) => account.username.toLowerCase() == newAccountName.toLowerCase()
  );
}

async function getAccounts() {
  return new Promise((resolve, reject) => {
    $.ajax("http://localhost:3000/accounts")
      .done(function (accounts) {
        resolve(accounts);
      })
      .fail(function (error) {
        reject(error);
      });
  });
}

async function createNewCategory() {
  let accountCategory = $("#new_category").val().trim().toLowerCase();

  if (accountCategory === "") {
    appendAlertMessage(
      "#alert_message_category",
      "Write the category name!",
      "warning"
    );
    return;
  }

  if (await isNewCategory(accountCategory)) {
    let settings = {
      url: "http://localhost:3000/categories",
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: { newCategory: accountCategory },
    };
    $.ajax(settings)
      .done(function () {
        $("#new_category").val("");
        loadServerData();
        appendAlertMessage(
          "#alert_message_category",
          "Category created successfully!",
          "success"
        );
      })
      .fail(function (error) {
        console.error("Error:", error);
      });
  } else {
    appendAlertMessage(
      "#alert_message_category",
      "Category already exists!",
      "danger"
    );
  }
}

async function isNewCategory(newCategoryName) {
  let categories = await getCategories();

  return !categories.some(
    (category) => category.name.toLowerCase() == newCategoryName.toLowerCase()
  );
}

async function getCategories() {
  return new Promise((resolve, reject) => {
    $.ajax("http://localhost:3000/categories")
      .done(function (categories) {
        resolve(categories);
      })
      .fail(function (error) {
        reject(error);
      });
  });
}

function categoryOptions(allCategories) {
  let chooseCategory = $("#select_category").find("option").first();
  $("#select_category").empty().append(chooseCategory);
  allCategories.forEach((e) => {
    let diferentOption = $("<option>", {
      value: e.id,
    }).html(e.name.charAt(0).toUpperCase() + e.name.slice(1));
    $("#select_category").append(diferentOption);
  });
}

async function loadServerData() {
  let accounts = await getAccounts();
  let categories = await getCategories();
  let transactions = buildTransactionsWithUsernameAndCategory(
    accounts,
    categories
  );

  fillTransactionsTable2(transactions);
  buildNewTransactionAccounts(accounts);
  buildAccountSummary(calculateAccountsBalance(accounts));
  buildFilterAccount(accounts);
  categoryOptions(categories);
  buildFilterCategories(categories);
}

function buildTransactionsWithUsernameAndCategory(accounts, categories) {
  transactions = [];

  accounts.forEach((account) => {
    account.transactions.forEach((transaction) => {
      transaction.username = account.username;
      transaction.category = categories.find(
        (category) => category.id == transaction.categoryId
      ).name;
      if (transaction.accountIdFrom) {
        transaction.accountFrom = accounts.find(
          (acc) => acc.id == transaction.accountIdFrom
        ).username;
      }

      if (transaction.accountIdTo) {
        transaction.accountTo = accounts.find(
          (acc) => acc.id == transaction.accountIdTo
        ).username;
      }
      transactions.push(transaction);
    });
  });

  return transactions;
}

function fillTransactionsTable2(transactions) {
  $("#table_body").empty();

  transactions.forEach((transaction) => {
    let tr = $("<tr>").append(
      $("<td>").text(transaction.id),
      $("<td>").text(transaction.username),
      $("<td>").text(transaction.type),
      $("<td>").text(transaction.category),
      $("<td>").text(transaction.description),
      $("<td>").text(transaction.amount),
      $("<td>").text(transaction.accountFrom),
      $("<td>").text(transaction.accountTo)
    );

    $("#table_body").append(tr);
  });
}

function buildNewTransactionAccounts(accounts) {
  buildAccountSelect(accounts, "#select_account");
  buildAccountSelect(accounts, "#select_category");
  buildAccountSelect(accounts, "#transfer_to");
}

function buildAccountSelect(accounts, selectID, idAccountToBeSkipped) {
  let chooseOption = $(selectID).find("option").first();
  let selected = $(selectID).val();
  $(selectID).empty().append(chooseOption);

  accounts.forEach((account) => {
    if (account.id != idAccountToBeSkipped) {
      let option;
      if (account.id == selected) {
        option = $("<option>", {
          value: account.id,
          selected: true,
        }).html(
          account.username.charAt(0).toUpperCase() + account.username.slice(1)
        );
      } else {
        option = $("<option>", {
          value: account.id,
        }).html(
          account.username.charAt(0).toUpperCase() + account.username.slice(1)
        );
      }

      $(selectID).append(option);
    }
  });
}

function buildCategorySelect(categories, selectID) {
  let chooseOption = $(selectID).find("option").first();

  $(selectID).empty().append(chooseOption);

  categories.forEach((category) => {
    let option;

    option = $("<option>", {
      value: category.id,
    }).html(category.name.charAt(0).toUpperCase() + category.name.slice(1));

    $(selectID).append(option);
  });
}

function buildAccountSummary(accounts) {
  $("#account_summary_table tbody").empty();

  let xValues = [];
  let yValues = [];
  let barColors = [];

  accounts.forEach((account) => {
    let accountName =
      account.username.charAt(0).toUpperCase() + account.username.slice(1);
    let accountBalance = account.balance.toFixed(2);

    let tableRow = $(`<tr>
                    <td>${accountName}</td>
                    <td>$${accountBalance}</td>
                  </tr>`);

    $("#account_summary_table tbody").append(tableRow);
    xValues.push(accountName);
    yValues.push(accountBalance);
    barColors.push("#99CEDC");
  });

  new Chart("my_chart", {
    type: "bar",
    data: {
      labels: xValues,
      datasets: [
        {
          backgroundColor: barColors,
          data: yValues,
        },
      ],
    },
    options: {
      legend: { display: false },
      title: {
        display: true,
        text: "",
      },
    },
  });
}

function createNewTransaction() {
  if (!validateTransferData()) {
    appendAlertMessage(
      "#alert_message_transaction",
      "You must fill in all the fields",
      "warning"
    );
  } else {
    var radioOptionChecked = $("input[name='transaction']:checked").val();

    switch (radioOptionChecked) {
      case "deposit":
        createNewTransfer("Deposit", null, null);
        break;
      case "withdraw":
        createNewTransfer("Withdraw", null, null);
        break;
      case "transfer":
        var transferFrom = $("#select_account").val();
        var transferTo = $("#transfer_to").val();
        createNewTransfer("Transfer", transferFrom, transferTo);
        break;
    }
    loadServerData();
  }
}

function validateTransferData() {
  var transactionType = $("#select_account").val();
  var transferTo = $("#transfer_to").val();
  var categoryType = $("#select_category").val();
  var descriptionText = $("#description").val();
  var amountQuantity = $("#amount").val();
  if ($("#transfer").is(":checked")) {
    if (transferTo == null) return false;
  }
  if (
    transactionType == null ||
    categoryType == null ||
    descriptionText == "" ||
    amountQuantity == ""
  ) {
    return false;
  } else {
    return true;
  }
}

async function createNewTransfer(type, transferFrom, transferTo) {
  var accountId = $("#select_account").val();
  var categoryType = $("#select_category").val();
  var descriptionText = $("#description").val();
  var amountQuantity = $("#amount").val();

  var newTransaction = {
    accountId: parseInt(accountId),
    accountIdFrom: parseInt(transferFrom),
    accountIdTo: parseInt(transferTo),
    type: type,
    amount: parseInt(amountQuantity),
    categoryId: parseInt(categoryType),
    description: descriptionText,
  };

  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

  const urlencoded = new URLSearchParams();
  urlencoded.append("newTransaction", JSON.stringify(newTransaction));

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded,
    redirect: "follow",
  };

  fetch("http://localhost:3000/transactions", requestOptions)
    .then((response) => {
      appendAlertMessage(
        "#alert_message_transaction",
        "Transaction successfully completed!",
        "success"
      );

      $("#description").val("").html("");
      $("#amount").val("").html("");
      $("#select_account option[value=null]").prop("selected", true);
      $("#transfer_to option[value=null]").prop("selected", true);
      $("#select_category option[value=null]").prop("selected", true);
    })
    .catch((error) => console.error(error));
}

async function getTransactions() {
  return new Promise((resolve, reject) => {
    $.ajax("http://localhost:3000/transactions")
      .done(function (transactions) {
        resolve(transactions);
      })
      .fail(function (error) {
        reject(error);
      });
  });
}

function calculateAccountsBalance(accounts) {
  return accounts.map((account) => {
    account.balance = account.transactions.reduce((balance, transaction) => {
      if (transaction.type == "Deposit") {
        return balance + transaction.amount;
      }

      if (transaction.type == "Withdraw") {
        return balance - transaction.amount;
      }

      if (transaction.type == "Transfer") {
        if (transaction.accountId == transaction.accountIdFrom) {
          return balance - transaction.amount;
        }
        if (transaction.accountId == transaction.accountIdTo) {
          return balance + transaction.amount;
        }
      }

      return balance;
    }, 0);

    return account;
  });
}

function buildFilterAccount(accounts) {
  buildAccountSelect(accounts, "#filter_account");
}

function buildFilterCategories(categories) {
  buildCategorySelect(categories, "#filter_category");
}
