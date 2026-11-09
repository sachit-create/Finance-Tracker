let transactions = [];
let section5 = document.getElementById("section5");
let section6 = document.getElementById("section6");
let balance = document.getElementById("summ_balance");
let income = document.getElementById("summ_income");
let expense = document.getElementById("summ_expense");
let budget = document.getElementById("summ_budget");
let expensive = document.getElementById("summ_expensive");
let trac_rows = document.getElementById("trac_rows");
let summary = {
  balance: 0,
  income: 0,
  expense: 0,
  budget: 0,
  expensive: "none",
  expensive_amount: 0,
};

const settingsDialog = document.getElementById("settings-dialog");
const themeSelect = document.getElementById("theme-select");
const settingsStatus = document.getElementById("settings-status");
const THEME_STORAGE_KEY = "financeTrackerTheme";

window.onload = function () {
  transaction_record();
  initializeSettings();
};

function load_trac() {
  localStorage.setItem("allTransactions", JSON.stringify(transactions));
}

function load_summary() {
  localStorage.setItem("summary", JSON.stringify(summary));
}

function initializeSettings() {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  const theme = savedTheme === "light" ? "light" : "dark";
  document.documentElement.dataset.theme = theme;
  themeSelect.value = theme;

  document.getElementById("settings-button").addEventListener("click", function () {
    settingsDialog.showModal();
  });
  document.getElementById("settings-close").addEventListener("click", function () {
    settingsDialog.close();
  });
  settingsDialog.addEventListener("click", function (event) {
    if (event.target === settingsDialog) settingsDialog.close();
  });
  themeSelect.addEventListener("change", function () {
    const selectedTheme = themeSelect.value === "light" ? "light" : "dark";
    document.documentElement.dataset.theme = selectedTheme;
    localStorage.setItem(THEME_STORAGE_KEY, selectedTheme);
  });
  document.getElementById("download-csv").addEventListener("click", downloadTransactionsCsv);
  document.getElementById("reset-data").addEventListener("click", function () {
    if (!confirm("This will permanently delete all saved transactions and your budget. Continue?")) return;
    clearAll(true);
    settingsStatus.textContent = "Your transactions and budget have been reset.";
  });
}

function csvCell(value) {
  let text = String(value == null ? "" : value);
  // Prevent spreadsheet formula execution for user-entered values.
  if (/^[\s]*[=+@\-]/.test(text)) text = "'" + text;
  return '"' + text.replace(/"/g, '""') + '"';
}

function downloadTransactionsCsv() {
  const headers = ["id", "date", "description", "category", "type", "amount"];
  const rows = transactions.map(function (transaction, index) {
    return [index + 1, transaction.date, transaction.description, transaction.category, transaction.type, transaction.amount];
  });
  const csv = [headers, ...rows].map(function (row) {
    return row.map(csvCell).join(",");
  }).join("\r\n");
  const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" });
  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = "finance-transactions.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(downloadUrl);
  settingsStatus.textContent = transactions.length
    ? "Your CSV download has started."
    : "Downloaded an empty CSV; there are no transactions yet.";
}

document.getElementById("myForm").addEventListener("submit", function (e) {
  e.preventDefault();

  let date = document.getElementById("date").value;
  let description = String(
    document.getElementById("description").value.replace(/\s+/g, " ").trim()
  );
  let category = String(document.getElementById("cate").value);
  let type = document.getElementById("type").value;
  let amount = Number(document.getElementById("amount").value);

  if (
    date === "" ||
    description === "" ||
    category === "" ||
    type === "" ||
    amount === "" ||
    amount === 0 ||
    isNaN(amount)
  ) {
    alert("Check entered details !");
    return;
  }

  let transaction = {
    date: date,
    description: description.toUpperCase(),
    category: category.toUpperCase(),
    type: type.toUpperCase(),
    amount: amount,
  };

  transactions.push(transaction);

  update_summary(transaction);
  load_trac();
  transaction_record();
  this.reset();
});

function top_5() {
  let recent_5_ele = document.getElementById("recent_5_data");
  recent_5_ele.innerHTML = "";

  let lastFive = transactions.slice(-5).reverse();

  for (let recent of lastFive) {
    recent_5_ele.innerHTML += `
    <tr>
        <td>${recent.description}</td>
        <td>${recent.category}</td>
        <td>&#8377;${recent.amount}</td>
    </tr>
  `;
  }
}

function render_rows() {
  trac_rows.innerHTML = "";

  for (let ele of transactions) {
    let index = transactions.indexOf(ele);
    trac_rows.innerHTML += `
            <tr>
                  <td id="id">${index + 1}</td>
                  <td id="delbydate">${ele.date}</td>
                  <td>${ele.description}</td>
                  <td>${ele.category}</td>
                  <td class="type_inc_exp">${ele.type}</td>
                  <td>&#8377;${ele.amount}</td>
                  <td class="blue">EDIT</td>
                  <td class="delete" id="del" onclick="delete_row(this)">DELETE</td>
                </tr>
        `;
    type_color(ele.type);
  }
}

function print_trac() {
  for (let ele of transactions) console.log(ele);
}

function clearAll(confirmed) {
  if (!confirmed && !confirm("Clear all saved transactions and reset your budget? This cannot be undone.")) return;
  transactions.length = 0;
  summary.budget = 0;
  summary.expense = 0;
  summary.expensive = "none";
  summary.income = 0;
  summary.balance = 0;
  summary.expensive_amount = 0;
  load_trac();
  load_summary();
  transaction_record();
  settingsStatus.textContent = "All saved transactions and budget have been cleared.";
}

function transaction_record() {
  transactions = JSON.parse(localStorage.getItem("allTransactions")) || [];
  summary = JSON.parse(localStorage.getItem("summary")) || {
    balance: 0,
    income: 0,
    expense: 0,
    budget: 0,
    expensive: "none",
    expensive_amount: 0,
  };
  top_5();
  render_summary();
  render_rows();
  renderChart();
  if (transactions.length === 0) {
    section5.style.display = "none";
    section6.style.display = "flex";
  } else {
    section6.style.display = "none";
    section5.style.display = "flex";
  }
}

function type_color() {
  const inc_exp = document.getElementsByClassName("type_inc_exp");

  for (let i = 0; i < inc_exp.length; i++) {
    let element = inc_exp[i];
    let value = element.innerHTML.trim();
    if (value === "EXPENSE") {
      element.style.color = "red";
    } else {
      element.style.color = "green";
    }
  }
}

function update_summary(transaction) {
  let discription_check = transaction.description;
  let type_check = transaction.type;
  let amount_check = transaction.amount;

  if (type_check === "INCOME") {
    summary.balance += amount_check;
    summary.income += amount_check;
  } else {
    if (summary.balance > amount_check) summary.balance -= amount_check;
    summary.expense += amount_check;
  }

  if (amount_check > summary.expensive_amount && type_check === "EXPENSE") {
    summary.expensive_amount = amount_check;
    summary.expensive = discription_check;
  }

  load_summary();
  render_summary();
  renderChart();
}

function reset_summary() {
  load_summary();
  summary.budget = 0;
  summary.expense = 0;
  summary.expensive = "none";
  summary.income = 0;
  summary.balance = 0;
  summary.expensive_amount = 0;
}

function update_summary2() {
  reset_summary();

  for (let ele of transactions) {
    if (ele.type === "INCOME") {
      summary.balance += ele.amount;
      summary.income += ele.amount;
    } else {
      if (summary.balance > ele.amount) summary.balance -= ele.amount;
      summary.expense += ele.amount;
    }

    if (ele.amount > summary.expensive_amount && ele.type === "EXPENSE") {
      summary.expensive = ele.description;
      summary.expensive_amount = ele.amount;
    }
  }
  render_summary();
  renderChart();
  load_summary();
}

function render_summary() {
  balance.innerHTML = `BALANCE : &#8377;${summary.balance}`;
  income.innerHTML = `INCOME : &#8377;${summary.income}`;
  expense.innerHTML = `EXPENSE : &#8377;${summary.expense}`;
  render_budget();
  expensive.innerHTML = `EXPENSIVE : ${summary.expensive}`;
}

function render_budget() {
  budget.innerHTML = `BUDGET : &#8377;${summary.budget}`;
}

function addBudget() {
  let budget = Number(document.getElementById("budget_input").value.trim());
  document.getElementById("budget_input").value = "";
  if (budget === 0 || isNaN(budget) || budget === "") {
    alert("enter a valid budget!");
    return;
  }
  summary.budget = budget;
  render_budget();
  renderChart();
  load_summary();
}

function delete_row(button) {
  let tr = button.parentNode;
  let idele = tr.firstElementChild;
  let index = Number(idele.innerHTML) - 1;
  if (index >= 0) {
    transactions.splice(index, 1);
  }
  load_trac();
  transaction_record();
  update_summary2();
}

const ctx2 = document.getElementById("myChart2");
let chart2 = null;

function renderChart() {
  if (!ctx2 || typeof Chart === "undefined") return;

  const chartValues = [
    Number(summary.balance || 0),
    Number(summary.income || 0),
    Number(summary.expense || 0),
    Number(summary.budget || 0),
    Number(summary.expensive_amount || 0),
  ];

  if (chart2) {
    chart2.data.datasets[0].data = chartValues;
    chart2.update();
    return;
  }

  chart2 = new Chart(ctx2, {
    type: "bar",
    data: {
      labels: ["BALANCE", "INCOME", "EXPENSE", "BUDGET", "AMOUNT"],
      datasets: [
        {
          label: "Finance summary",
          data: chartValues,
          borderWidth: 2,
        },
      ],
    },
    options: {
      scales: {
        y: {
          min: 0,
          max: 100000,
        },
      },
    },
  });
}
