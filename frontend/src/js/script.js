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

  //console.log(transactions);

  buildNewTransactionAccounts(accounts);
  buildAccountSummary(accounts, "$0.00");
  buildFilterAccount(accounts);
  categoryOptions(categories);
  balance(transactions);
}

function buildNewTransactionAccounts(accounts) {
  let chooseOption = $("#select_account").find("option").first();

  $("#select_account").empty().append(chooseOption);

  accounts.forEach((account) => {
    let option = $("<option>", {
      value: account.id,
    }).html(
      account.username.charAt(0).toUpperCase() + account.username.slice(1)
    );

    $("#select_account").append(option);
  });
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

function balance(transactions) {
  //WORKING on this
}

function buildAccountSummary(accounts, balance) {
  $("#account_summary_table tbody").empty();

  accounts.forEach((account) => {
    let tableRow = $(`<tr>
                    <td>${
                      account.username.charAt(0).toUpperCase() +
                      account.username.slice(1)
                    }</td>
                    <td>${balance}</td>
                  </tr>`);

    $("#account_summary_table tbody").append(tableRow);
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
    var radioOptionChecked = $("input[name='transaction']:checked").val();

    switch (radioOptionChecked) {
      case "deposit":
        createNewTransfer("Deposit", null, null);
        break;
      case "withdraw":
        createNewTransfer("Withdraw", null, null);
        break;
      case "transfer":
        var transferFrom = $("#transfer_from").val();
        var transferTo = $("#transfer_to").val();
        createNewTransfer("Transfer", transferFrom, transferTo);
        break;
    }
  }
}

$(".radio-transaction").on("change", function () {
  if ($("#deposit").is(":checked") || $("#withdraw").is(":checked")) {
  } else if ($("#transfer").is(":checked")) {
  }
});

function validateTransferData() {
  var transactionType = $("#select_account").val();
  var categoryType = $("#select_category").val();
  var descriptionText = $("#description").val();
  var amountQuantity = $("#amount").val();
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
    accountIdFrom: transferFrom,
    accountIdTo: transferTo,
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

      let tr = $("<tr>").append(
        $("<td>").html(accountId),
        $("<td>").html($("#select_account option:selected").html()),
        $("<td>").html(type),
        $("<td>").html($("#select_category option:selected").html()),
        $("<td>").html(descriptionText),
        $("<td>").html(amountQuantity)
      );

      $("#table_body").append(tr);

      $("#description").val("").html("");
      $("#amount").val("").html("");
      $("#select_account option[value=null]").prop("selected", true);
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
