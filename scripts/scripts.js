(() => {
  "use strict";

  const STORAGE_KEYS = {
    transactions: "allTransactions",
    summary: "summary",
    theme: "financeTrackerTheme",
  };
  const DEFAULT_SUMMARY = {
    balance: 0,
    income: 0,
    expense: 0,
    budget: 0,
    expensive: "none",
    expensive_amount: 0,
  };

  const elements = {
    form: document.getElementById("myForm"),
    date: document.getElementById("date"),
    description: document.getElementById("description"),
    category: document.getElementById("cate"),
    type: document.getElementById("type"),
    amount: document.getElementById("amount"),
    recentRows: document.getElementById("recent_5_data"),
    transactionRows: document.getElementById("trac_rows"),
    transactionsSection: document.getElementById("section5"),
    emptySection: document.getElementById("section6"),
    balance: document.getElementById("summ_balance"),
    income: document.getElementById("summ_income"),
    expense: document.getElementById("summ_expense"),
    budget: document.getElementById("summ_budget"),
    expensive: document.getElementById("summ_expensive"),
    budgetInput: document.getElementById("budget_input"),
    chartCanvas: document.getElementById("myChart2"),
    settingsButton: document.getElementById("settings-button"),
    settingsDialog: document.getElementById("settings-dialog"),
    settingsClose: document.getElementById("settings-close"),
    themeSelect: document.getElementById("theme-select"),
    downloadButton: document.getElementById("download-csv"),
    resetButton: document.getElementById("reset-data"),
    settingsStatus: document.getElementById("settings-status"),
  };

  let transactions = [];
  let summary = { ...DEFAULT_SUMMARY };
  let chart = null;

  function readStoredJson(key, fallback) {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : fallback;
    } catch (error) {
      console.warn(`Could not read ${key} from local storage.`, error);
      return fallback;
    }
  }

  function saveJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Could not save ${key} to local storage.`, error);
      setSettingsStatus("Could not save changes in this browser.");
      return false;
    }
  }

  function setSettingsStatus(message) {
    if (elements.settingsStatus) elements.settingsStatus.textContent = message;
  }

  function loadSavedData() {
    const storedTransactions = readStoredJson(STORAGE_KEYS.transactions, []);
    transactions = Array.isArray(storedTransactions) ? storedTransactions : [];

    const storedSummary = readStoredJson(STORAGE_KEYS.summary, {});
    summary = { ...DEFAULT_SUMMARY, ...(storedSummary && typeof storedSummary === "object" ? storedSummary : {}) };
    recalculateSummary();
  }

  function saveTransactions() {
    saveJson(STORAGE_KEYS.transactions, transactions);
  }

  function saveSummary() {
    saveJson(STORAGE_KEYS.summary, summary);
  }

  function calculateSummary() {
    const totals = transactions.reduce((result, transaction) => {
      const amount = Number(transaction.amount) || 0;
      if (String(transaction.type).toUpperCase() === "INCOME") {
        result.income += amount;
      } else {
        result.expense += amount;
      }
      if (String(transaction.type).toUpperCase() === "EXPENSE" && amount > result.expensiveAmount) {
        result.expensiveAmount = amount;
        result.expensive = transaction.description || "none";
      }
      return result;
    }, { income: 0, expense: 0, expensive: "none", expensiveAmount: 0 });

    return {
      ...summary,
      income: totals.income,
      expense: totals.expense,
      balance: totals.income - totals.expense,
      expensive: totals.expensive,
      expensive_amount: totals.expensiveAmount,
      budget: Number(summary.budget) || 0,
    };
  }

  function recalculateSummary() {
    summary = calculateSummary();
  }

  function initializeSettings() {
    if (!elements.settingsButton || !elements.settingsDialog) return;

    let savedTheme = "dark";
    try {
      savedTheme = localStorage.getItem(STORAGE_KEYS.theme) === "light" ? "light" : "dark";
    } catch (error) {
      // Use the default theme if browser storage is disabled.
    }
    applyTheme(savedTheme, false);

    elements.settingsButton.addEventListener("click", openSettings);
    elements.settingsClose?.addEventListener("click", closeSettings);
    elements.settingsDialog.addEventListener("click", (event) => {
      if (event.target === elements.settingsDialog) closeSettings();
    });
    elements.themeSelect?.addEventListener("change", () => {
      applyTheme(elements.themeSelect.value, true);
      setSettingsStatus("Theme preference saved.");
    });
    elements.downloadButton?.addEventListener("click", downloadTransactionsCsv);
    elements.resetButton?.addEventListener("click", resetAllData);
  }

  function openSettings() {
    const dialog = elements.settingsDialog;
    if (!dialog) return;
    setSettingsStatus("");
    if (typeof dialog.showModal === "function") {
      if (!dialog.open) dialog.showModal();
    } else {
      // Fallback for browsers without the native dialog methods.
      dialog.setAttribute("open", "");
      dialog.classList.add("settings-dialog-open");
    }
  }

  function closeSettings() {
    const dialog = elements.settingsDialog;
    if (!dialog) return;
    if (typeof dialog.close === "function" && dialog.open) {
      dialog.close();
    } else {
      dialog.removeAttribute("open");
      dialog.classList.remove("settings-dialog-open");
    }
  }

  function applyTheme(theme, persist) {
    const selectedTheme = theme === "light" ? "light" : "dark";
    document.documentElement.dataset.theme = selectedTheme;
    if (elements.themeSelect) elements.themeSelect.value = selectedTheme;
    if (persist) {
      try {
        localStorage.setItem(STORAGE_KEYS.theme, selectedTheme);
      } catch (error) {
        setSettingsStatus("Theme changed for this visit, but could not be saved.");
      }
    }
  }

  function csvCell(value) {
    let text = String(value == null ? "" : value);
    // Avoid spreadsheet formula injection from user-provided text fields.
    if (/^[\s]*[=+@\-]/.test(text)) text = `'${text}`;
    return `"${text.replace(/"/g, '""')}"`;
  }

  function downloadTransactionsCsv() {
    const headers = ["id", "date", "description", "category", "type", "amount"];
    const rows = transactions.map((transaction, index) => [
      index + 1,
      transaction.date,
      transaction.description,
      transaction.category,
      transaction.type,
      transaction.amount,
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map(csvCell).join(","))
      .join("\r\n");
    const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = "finance-transactions.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
    setSettingsStatus(transactions.length ? "Your CSV download has started." : "Downloaded an empty CSV; there are no transactions yet.");
  }

  function handleTransactionSubmit(event) {
    event.preventDefault();

    const date = elements.date.value;
    const description = elements.description.value.replace(/\s+/g, " ").trim();
    const category = elements.category.value;
    const type = elements.type.value;
    const amount = Number(elements.amount.value);

    if (!date || !description || !category || !type || !Number.isFinite(amount) || amount <= 0) {
      alert("Check entered details!");
      return;
    }

    transactions.push({
      date,
      description: description.toUpperCase(),
      category: category.toUpperCase(),
      type: type.toUpperCase(),
      amount,
    });
    recalculateSummary();
    persistAndRender();
    elements.form.reset();
  }

  function persistAndRender() {
    saveTransactions();
    saveSummary();
    render();
  }

  function render() {
    renderRecentTransactions();
    renderTransactionTable();
    renderSummary();
    renderChart();

    const hasTransactions = transactions.length > 0;
    if (elements.transactionsSection) elements.transactionsSection.style.display = hasTransactions ? "flex" : "none";
    if (elements.emptySection) elements.emptySection.style.display = hasTransactions ? "none" : "flex";
  }

  function renderRecentTransactions() {
    if (!elements.recentRows) return;
    elements.recentRows.replaceChildren();

    transactions.slice(-5).reverse().forEach((transaction) => {
      const row = document.createElement("tr");
      [transaction.description, transaction.category, `₹${transaction.amount}`].forEach((value) => {
        const cell = document.createElement("td");
        cell.textContent = value == null ? "" : String(value);
        row.appendChild(cell);
      });
      elements.recentRows.appendChild(row);
    });
  }

  function renderTransactionTable() {
    if (!elements.transactionRows) return;
    elements.transactionRows.replaceChildren();

    transactions.forEach((transaction, index) => {
      const row = document.createElement("tr");
      const values = [index + 1, transaction.date, transaction.description, transaction.category];
      values.forEach((value) => {
        const cell = document.createElement("td");
        cell.textContent = value == null ? "" : String(value);
        row.appendChild(cell);
      });

      const typeCell = document.createElement("td");
      typeCell.className = "type_inc_exp";
      typeCell.textContent = String(transaction.type || "").toUpperCase();
      typeCell.style.color = typeCell.textContent === "EXPENSE" ? "red" : "green";
      row.appendChild(typeCell);

      const amountCell = document.createElement("td");
      amountCell.textContent = `₹${Number(transaction.amount) || 0}`;
      row.appendChild(amountCell);

      const editCell = document.createElement("td");
      editCell.className = "blue";
      editCell.textContent = "EDIT";
      row.appendChild(editCell);

      const deleteCell = document.createElement("td");
      deleteCell.className = "delete";
      deleteCell.textContent = "DELETE";
      deleteCell.setAttribute("role", "button");
      deleteCell.tabIndex = 0;
      deleteCell.setAttribute("aria-label", `Delete transaction ${index + 1}`);
      deleteCell.addEventListener("click", () => deleteTransaction(index));
      deleteCell.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          deleteTransaction(index);
        }
      });
      row.appendChild(deleteCell);
      elements.transactionRows.appendChild(row);
    });
  }

  function renderSummary() {
    if (elements.balance) elements.balance.textContent = `BALANCE : ₹${summary.balance}`;
    if (elements.income) elements.income.textContent = `INCOME : ₹${summary.income}`;
    if (elements.expense) elements.expense.textContent = `EXPENSE : ₹${summary.expense}`;
    if (elements.budget) elements.budget.textContent = `BUDGET : ₹${summary.budget}`;
    if (elements.expensive) elements.expensive.textContent = `EXPENSIVE : ${summary.expensive}`;
  }

  function addBudget() {
    const amount = Number(elements.budgetInput?.value.trim());
    if (elements.budgetInput) elements.budgetInput.value = "";
    if (!Number.isFinite(amount) || amount <= 0) {
      alert("Enter a valid budget!");
      return;
    }
    summary.budget = amount;
    saveSummary();
    renderSummary();
    renderChart();
  }

  function deleteTransaction(index) {
    if (index < 0 || index >= transactions.length) return;
    transactions.splice(index, 1);
    recalculateSummary();
    persistAndRender();
  }

  function clearAll() {
    transactions = [];
    summary = { ...DEFAULT_SUMMARY };
    persistAndRender();
    setSettingsStatus("All saved transactions and your budget have been cleared.");
  }

  function resetAllData() {
    if (!confirm("This will permanently delete all saved transactions and your budget. Continue?")) return;
    clearAll();
    setSettingsStatus("Your transactions and budget have been reset.");
  }

  function renderChart() {
    if (!elements.chartCanvas || typeof Chart === "undefined") return;
    const values = [summary.balance, summary.income, summary.expense, summary.budget, summary.expensive_amount]
      .map((value) => Number(value) || 0);

    if (chart) {
      chart.data.datasets[0].data = values;
      chart.update();
      return;
    }

    chart = new Chart(elements.chartCanvas, {
      type: "bar",
      data: {
        labels: ["BALANCE", "INCOME", "EXPENSE", "BUDGET", "AMOUNT"],
        datasets: [{ label: "Finance summary", data: values, borderWidth: 2 }],
      },
      options: { scales: { y: { min: 0, max: 100000 } }, responsive: true, maintainAspectRatio: false },
    });
  }

  // Keep the existing inline HTML actions working while the script is reorganized.
  window.addBudget = addBudget;
  window.clearAll = clearAll;
  window.delete_row = (button) => {
    const row = button?.closest("tr");
    const index = row ? Array.from(row.parentElement.children).indexOf(row) : -1;
    deleteTransaction(index);
  };

  elements.form?.addEventListener("submit", handleTransactionSubmit);
  loadSavedData();
  render();
  initializeSettings();
})();
