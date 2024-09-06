$(() => {
  createNewAccount();
  loadAccounts();

  $("#transactions_button").on("click", function(){
    createNewTransaction();
    
  });
});

function createNewAccount() {
  $("#add_new_account").on("click", function () {
    let accountName = $("#new_account").val().trim().toLowerCase();
    let account = { newAccount: accountName };

    let settings = {
      url: "http://localhost:3000/accounts",
      method: "POST",
      timeout: 0,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: account,
    };

    $.ajax(settings)
      .done(function (response) {
        console.log(response);
        $("#new_account").val("");
        loadAccounts();
      })
      .fail(function (error) {
        console.error("Error:", error);
      });
  });
}

function loadAccounts() {
  let settings = {
    url: "http://localhost:3000/accounts",
    method: "GET",
    timeout: 0,
  };

  $.ajax(settings)
    .done(function (accounts) {
      buildHTMLOptionsAccount(accounts);
      addAcountSummary(accounts, "$0.00");
    })
    .fail(function (error) {
      console.error("Error:", error);
    });
}

function buildHTMLOptionsAccount(accounts) {
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

function addAcountSummary(accounts, balance) {
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
    console.log("You should fill all the fields");
  }else{
    var radioOptionChecked = $("input[name='transaction']:checked").val();

    switch (radioOptionChecked) {
      case "deposit":
          createNewDeposit();
        break;
      case "withdraw":
          createNewWithdraw();
        break;
      case "transfer":
          createNewTransfer();
        break;
    
    }
  }
}

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

async function createNewTransfer(){
  
}