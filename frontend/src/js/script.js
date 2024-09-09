var accountsGlobal;
var categoriesGlobal;
$(() => {
  $("#add_new_account").on("click", function () {
    createNewAccount();
  });
  loadServerData();

  $("#transactions_button").on("click", function () {
    createNewTransaction();
  });

  $("#create_category_button").on("click", function () {
    let accountCategory = $("#new_category").val().trim().toLowerCase();
    let settings = {
      url: "http://localhost:3000/categories",
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: { newCategory: accountCategory },
    };

    $.ajax(settings).done(function () {
      $("#new_category").val("");
      loadServerData();
    });
  });
});

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
        accountsGlobal = accounts;
        resolve(accounts);
      })
      .fail(function (error) {
        reject(error);
      });
  });
}

async function loadServerData() {
  let accounts = await getAccounts();
  let categories = await getCategories();
  let transactions = await getTransactions();

  fillTransactionsTable(transactions);
  buildNewTransactionAccounts(accounts);
  buildAccountSummary(calculateAccountsBalance(accounts));
  buildFilterAccount(accounts);
  categoryOptions(categories);
}

function fillTransactionsTable(transactions) {
  if (accountsGlobal.length > 0) {
    $("#table_body").empty();

    accountsGlobal.forEach((account) => {
      if (account.transactions.length > 0) {
        account.transactions.forEach((transaction) => {
          let transCategory = "";
          categoriesGlobal.forEach((category) => {
            if (category.id == transaction.categoryId) {
              transCategory = category.name;
            }
          });

          let transferToAcc = "";
          let transferFromAcc = account.username;
          accountsGlobal.forEach((acc) => {
            if (acc.id == transaction.accountIdFrom) {
              transferFromAcc = acc.username;
            }
            if (acc.id == transaction.accountIdTo) {
              transferToAcc = acc.username;
            }
          });

          let tr = $("<tr>").append(
            $("<td>").text(account.id),
            $("<td>").text(account.username),
            $("<td>").text(transaction.type),
            $("<td>").text(transCategory),
            $("<td>").text(transaction.description),
            $("<td>").text(transaction.amount),
            $("<td>").text(transferFromAcc),
            $("<td>").text(transferToAcc)
          );

          $("#table_body").append(tr);
        });
      }
    });
  }
}

function buildNewTransactionAccounts(accounts) {
  let chooseOption = $("#select_account").find("option").first();

  $("#select_account").empty().append(chooseOption.clone());
  $("#transfer_to").empty().append(chooseOption);
  console.log($("#select_account"));
  accounts.forEach((account) => {
    let option = $("<option>", {
      value: account.id,
    }).html(
      account.username.charAt(0).toUpperCase() + account.username.slice(1)
    );

    $("#select_account").append(option.clone());
    $("#transfer_to").append(option.clone());
  });
}

async function getCategories() {
  return new Promise((resolve, reject) => {
    $.ajax("http://localhost:3000/categories")
      .done(function (categories) {
        categoriesGlobal = categories;
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
    barColors.push("#FFB780");
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
      "danger"
    );
  } else {
    loadServerData();
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
  }
}

$(".radio-transaction").on("change", function () {
  if ($("#deposit").is(":checked") || $("#withdraw").is(":checked")) {
    $("#div_transfer_to").addClass("d-none");
  } else if ($("#transfer").is(":checked")) {
    $("#div_transfer_to").removeClass("d-none");
  }
});

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
      console.log("transfer");
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
  let allOption = $("#filter_account").find("option").first();

  $("#filter_account").empty().append(allOption);

  accounts.forEach((account) => {
    let option = $("<option>", {
      value: account.id,
    }).html(
      account.username.charAt(0).toUpperCase() + account.username.slice(1)
    );

    $("#filter_account").append(option);
  });
}
