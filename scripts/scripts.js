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

window.onload = function () {
  transaction_record();
};

function load_trac() {
  localStorage.setItem("allTransactions", JSON.stringify(transactions));
}

function load_summary() {
  localStorage.setItem("summary", JSON.stringify(summary));
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
  console.log("recent 5 updated");
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
  console.log("render complete!");
}

function print_trac() {
  for (let ele of transactions) console.log(ele);
}

function clearAll() {
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
}

function transaction_record() {
  transactions = JSON.parse(localStorage.getItem("allTransactions")) || [];
  summary = JSON.parse(localStorage.getItem("summary")) || {};
  top_5();
  render_summary();
  render_rows();
  if (transactions.length === 0) {
    section5.style.display = "none";
    section6.style.display = "flex";
  } else if (transactions.length > 0) {
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
  load_summary();
}

function delete_row(button) {
  let tr = button.parentNode;
  let idele = tr.firstElementChild;
  let index = Number(idele.innerHTML) - 1;
  console.log(index);
  if (index >= 0) {
    transactions.splice(index, 1);
  }
  load_trac();
  transaction_record();
  update_summary2();
}


const ctx2 = document.getElementById("myChart2");

let summary2 = JSON.parse(localStorage.getItem("summary")) || {};
console.log(summary2)

new Chart(ctx2, {
  type: "bar",
  data: {
    labels: ["BALANCE","INCOME","EXPENSE","BUDGET","AMOUNT"],
    datasets: [
      {
        label: "# of Votes",
        data: [Number(summary2.balance),summary2.income,summary2.expense,summary2.budget,summary2.expensive_amount],
        borderWidth: 2,
      },
    ],
  },
  options: {
    scales: {
      y: {
        min:0,
        max:100000
      },
    },
  },
});
