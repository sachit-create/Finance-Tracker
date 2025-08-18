let transactions = [];

transactions = JSON.parse(localStorage.getItem("allTransactions")) || [];
render_rows();
top_5();
function load_trac(tracs) {
  localStorage.setItem("allTransactions", JSON.stringify(tracs));
}

document.getElementById("myForm").addEventListener("submit", function (e) {
  e.preventDefault();

  let date = document.getElementById("date").value;
  let description = document
    .getElementById("description")
    .value.replace(/\s+/g, " ")
    .trim();
  let category = document.getElementById("cate").value;
  let type = document.getElementById("type").value;
  let amount = Number(document.getElementById("amount").value);

  if (
    date === "" ||
    description === "" ||
    category === "" ||
    type === "" ||
    amount === "" ||
    amount === 0
  ) {
    alert("Check entered details !");
    this.reset();
    return;
  }

  let transaction = {
    date: date,
    description: description,
    category: category,
    type: type,
    amount: amount,
  };

  transactions.push(transaction);

  load_trac(transactions);

  print_trac();
  render_rows();
  top_5();
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
  let trac_rows = document.getElementById("trac_rows");
  trac_rows.innerHTML = "";

  for (let ele = transactions.length - 1; ele > -1; ele--) {
    let element = transactions[ele];
    trac_rows.innerHTML += `
            <tr>
                  <td id="id">${transactions.length - ele}</td>
                  <td id="delbydate">${element.date}</td>
                  <td>${element.description}</td>
                  <td>${element.category}</td>
                  <td class="type_inc_exp">${element.type}</td>
                  <td>&#8377;${element.amount}</td>
                  <td class="blue">EDIT</td>
                  <td class="delete"id="del">DELETE</td>
                </tr>
        `;
  }
  console.log("render complete!");
}

function print_trac() {
  for (let ele in transactions) console.log(transactions[ele]);
}

function clearAll() {
  transactions.length = 0;
  load_trac(transactions);
  print_trac();
  render_rows();
  top_5();
}
