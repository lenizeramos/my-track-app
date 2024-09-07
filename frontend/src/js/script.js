$(() => {
  $("#add_new_account").on("click", function () {
    createNewAccount();
  });
  loadAccounts();

  $("#transactions_button").on("click", function(){
    createNewTransaction();
    
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
      "#alertMessageAccount",
      "Write the account name!",
      "warning"
    );
    return
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
        loadAccounts();
        appendAlertMessage(
          "#alertMessageAccount",
          "Account created successfully!",
          "success"
        );
      })
      .fail(function (error) {
        console.error("Error:", error);
      });
  } else {
    appendAlertMessage(
      "#alertMessageAccount",
      "Account already exists!",
      "danger"
    );
    console.log();
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

async function loadAccounts() {
  let accounts = await getAccounts();
  buildNewTransactionAccounts(accounts);
  buildAccountSummary(accounts, "$0.00");
  buildFilterAccount(accounts);
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

function createNewTransaction(){
  if(!validateTransferData()) {
    appendAlertMessage(
      "#alertMessageTransaction",
      "First you must fill in all the fields",
      "danger"
    );
  }else{
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

$(".radio-transaction").on("change", function(){
  console.log($(".radio-transaction").find(":checked").val());
});

function validateTransferData(){
  var transactionType = $("#select_account").val();
  var categoryType = $("#select_category").val();
  var descriptionText = $("#description").val();
  var amountQuantity = $("#amount").val();
  if(
    transactionType == null ||
    categoryType == null ||
    descriptionText == "" ||
    amountQuantity == ""
  ){
    return false;
  }else{
    return true;
  }
}

async function createNewTransfer(type, transferFrom, transferTo){
  var accountId = $("#select_account").val();
  var categoryType = $("#select_category").val();
  var descriptionText = $("#description").val();
  var amountQuantity = $("#amount").val();
  
  var newTransaction = {
      "accountId":parseInt(accountId),
      "accountIdFrom":transferFrom,
      "accountIdTo":transferTo,
      "type":type,
      "amount":parseInt(amountQuantity),
      "categoryId":parseInt(categoryType),
      "description":descriptionText
  };

  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

  const urlencoded = new URLSearchParams();
  urlencoded.append("newTransaction", JSON.stringify(newTransaction));

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded,
    redirect: "follow"
  };

  fetch("http://localhost:3000/transactions", requestOptions)
    .then((response) => {
      $("#description").val("").html("");
      $("#amount").val("").html("");
      $('#select_account option[value=null]').prop('selected', true);
      $('#select_category option[value=null]').prop('selected', true);

      appendAlertMessage(
        "#alertMessageTransaction",
        "Transfer successfully completed!",
        "success"
      );
    })
    .catch((error) => console.error(error));

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
