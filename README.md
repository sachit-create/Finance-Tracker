# Finance Tracker

A lightweight personal finance dashboard built with HTML, CSS, and JavaScript. It helps track daily income and expenses, manage a monthly budget, and view summary data at a glance.

## Overview

This project was created as a learning exercise to practice front-end development, DOM manipulation, local storage, and simple charting. It is designed for quick personal budgeting without needing any backend or database.

## Features

- Add transactions with date, description, category, type, and amount
- Track income and expense totals
- See current balance in real time
- Set a monthly budget
- Identify the most expensive expense category item
- View recent transaction activity
- Review all saved transactions in one table
- Data persistence using browser localStorage
- Simple bar chart summary using Chart.js

## Tech Stack

- HTML
- CSS
- JavaScript
- Chart.js

## Project Structure

```text
Finance-Tracker/
├── css/
│   ├── assets/
│   └── style.css
├── scripts/
│   └── scripts.js
├── index.html
├── README.md
├── LICENSE
└── .gitignore
```

## How to Run

1. Clone the repository:
   ```bash
   git clone https://github.com/sachit-create/Finance-Tracker.git
   ```
2. Open the project folder.
3. Open `index.html` in your browser.

## Usage

- Fill in the form to add a new transaction.
- Choose the transaction type as either income or expense.
- View the summary board and recent transactions update automatically.
- Enter a budget to compare it against spending.
- Use the table to review or delete entries.

## Notes

- This project stores data in the browser using localStorage, so it persists across reloads on the same browser.
- It is intended as a personal learning project and can be expanded with a backend or analytics features later.

## Status

- Learning project
- Front-end only
- Updated and maintained for documentation and project clarity

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
