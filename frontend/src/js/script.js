$(() => {
  $("#add_new_account").on("click", function () {
    createNewAccount();
  });
  loadAccounts();
});

async function createNewAccount() {
  let accountName = $("#new_account").val().trim().toLowerCase();
  let account = { newAccount: accountName };

  if (await isNewAccount(accountName)) {
    let settings = {
      url: "http://localhost:3000/accounts",
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: account,
    };
    $.ajax(settings)
      .done(function () {
        $("#new_account").val("");
        loadAccounts();
      })
      .fail(function (error) {
        console.error("Error:", error);
      });
  } else {
    console.log("Account already exists");
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
  buildFilterAccount(accounts)
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