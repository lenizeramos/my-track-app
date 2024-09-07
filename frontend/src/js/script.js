$(() => {
  $("#add_new_account").on("click", function () {
    createNewAccount();
  });
  loadAccounts();
  $("#create-category-button").on("click", function () {
    let accountCategory = $("#new_category").val().trim().toLowerCase();
    let allCategories = { newCategory: accountCategory };
    let settings = {
      url: "http://localhost:3000/categories",
      method: "POST",
      timeout: 0,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: allCategories,
    };
    
    $.ajax(settings).done(function () {
      $("#new_category").val("");
      loadCategory();
    })
  } )
  loadCategory();
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

function loadCategory() {
  let settings = {
    url: "http://localhost:3000/categories",
    method: "GET",
    timeout: 0,
  };
  $.ajax(settings).done(function (allCategories) {
    categoryOptions(allCategories);
  })
}

function categoryOptions(allCategories) {
  let chooseCategory = $("#select_category").find("option").first();
  $("#select_category").empty().append(chooseCategory);
  allCategories.forEach((e) => {
    let diferentOption = $("<option>", {
      value: e.id,
    }).html(e.name.charAt(0).toUpperCase() + e.name.slice(1)
  );
  $("#select_category").append(diferentOption);
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
