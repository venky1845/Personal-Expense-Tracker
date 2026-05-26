async function registerUser() {

    let username = document.getElementById("registerUsername").value.trim();
    let email = document.getElementById("registerEmail").value.trim();
    let password = document.getElementById("registerPassword").value;
    let confirmPassword = document.getElementById("confirmPassword").value;

    let message = document.getElementById("message");

    message.innerHTML = "";

    if (!username || !email || !password || !confirmPassword) {
        message.innerHTML = "<div class='error'>All fields are required</div>";
        return;
    }

    if (password !== confirmPassword) {
        message.innerHTML = "<div class='error'>Passwords do not match</div>";
        return;
    }

    let response = await fetch("/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username,
            email,
            password
        })
    });

    let data = await response.json();

    if (response.status === 201) {

        message.innerHTML =
            "<div class='success'>Registration successful</div>";

        setTimeout(() => {
            window.location.href = "login.html";
        }, 1500);

    } else {
        message.innerHTML =
            `<div class='error'>${data.message}</div>`;
    }
}

async function loginUser() {

    let username = document.getElementById("loginUsername").value.trim();

    let password = document.getElementById("loginPassword").value;

    let message = document.getElementById("loginMessage");

    let response = await fetch("/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
            username,
            password
        })
    });

    let data = await response.json();

    if (response.status === 200) {

        localStorage.setItem("username", data.username);

        window.location.href = "dashboard.html";

    } else {

        message.innerHTML =
            "<div class='error'>Invalid username or password</div>";
    }
}

async function loadDashboard() {

    let response = await fetch("/expenses/summary", {
        method: "GET",
        credentials: "include"
    });

    if (response.status === 401) {
        window.location.href = "login.html";
        return;
    }

    let data = await response.json();

    document.getElementById("welcome").innerText = `Welcome, ${data.username}!`;
    document.getElementById("totalAmount").innerText    = `₹${data.total_amount.toFixed(2)}`;
    document.getElementById("highestExpense").innerText = `₹${data.highest_expense.toFixed(2)}`;
    document.getElementById("totalExpenses").innerText  = data.total_expenses;
    document.getElementById("totalCategories").innerText = data.categories.length;

    // Category breakdown with progress bars
    let categoryContainer = document.getElementById("categories");
    categoryContainer.innerHTML = "";

    let maxVal = Math.max(...data.categories.map(c => parseFloat(c.total)), 1);

    data.categories.forEach(cat => {
        let pct = ((parseFloat(cat.total) / maxVal) * 100).toFixed(1);
        categoryContainer.innerHTML += `
            <div class="bar-item">
                <div class="bar-label">
                    <span>${cat.category}</span>
                    <span>₹${parseFloat(cat.total).toFixed(2)}</span>
                </div>
                <div class="bar-track">
                    <div class="bar-fill" style="width:${pct}%"></div>
                </div>
            </div>
        `;
    });

    let expRes = await fetch("/expenses", { credentials: "include" });
    let expenses = await expRes.json();
    let recent = expenses.slice(0, 5);

    let recentTable = document.getElementById("recentTable");
    recentTable.innerHTML = "";

    if (recent.length === 0) {
        recentTable.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--muted);">No expenses yet</td></tr>`;
    } else {
        recent.forEach(exp => {
            let dateStr = exp.date ? exp.date.split("T")[0] : "";
            recentTable.innerHTML += `
                <tr>
                    <td>${exp.title}</td>
                    <td>₹${parseFloat(exp.amount).toFixed(2)}</td>
                    <td>${exp.category}</td>
                    <td>${dateStr}</td>
                </tr>
            `;
        });
    }
}

async function logoutUser() {

    await fetch("/logout", {
        method: "GET",
        credentials: "include"
    });

    window.location.href = "login.html";
}
async function loadExpenses() {

    let response = await fetch("/expenses", {
        credentials: "include"
    });

    if(response.status === 401){
        window.location.href = "login.html";
        return;
    }

    let expenses = await response.json();

    let table = document.getElementById("expenseTable");

    table.innerHTML = "";

    expenses.forEach(expense => {

        let dateStr = expense.date ? expense.date.split("T")[0] : "";

        table.innerHTML += `
            <tr>
                <td>${expense.title}</td>
                <td>₹${expense.amount}</td>
                <td>${expense.category}</td>
                <td>${dateStr}</td>
                <td style="display:flex; gap:8px; flex-wrap:wrap;">
                    <button class="edit-btn" onclick="editExpense(${expense.id}, '${expense.title}', '${expense.amount}', '${expense.category}', '${dateStr}', \`${expense.note || ""}\`)">
                        Edit
                    </button>
                    <button onclick="deleteExpense(${expense.id})">
                        Delete
                    </button>
                </td>
            </tr>
        `;
    });
}
async function saveExpense(){

    let id       = document.getElementById("expenseId").value;
    let title    = document.getElementById("title").value.trim();
    let amount   = document.getElementById("amount").value;
    let category = document.getElementById("category").value;
    let date     = document.getElementById("date").value;
    let note     = document.getElementById("note").value.trim();

    if (!title || !amount || !date) {
        alert("Title, amount and date are required.");
        return;
    }

    if (parseFloat(amount) <= 0) {
        alert("Amount must be a positive number.");
        return;
    }

    let isEdit  = id !== "";
    let url     = isEdit ? `/expenses/${id}` : "/expenses";
    let method  = isEdit ? "PUT" : "POST";

    let response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title, amount, category, date, note })
    });

    let data = await response.json();
    alert(data.message);

    cancelEdit();
    loadExpenses();
}
async function deleteExpense(id){

    if (!confirm("Are you sure you want to delete this expense?")) return;

    let response = await fetch(`/expenses/${id}`, {

        method: "DELETE",

        credentials: "include"
    });

    let data = await response.json();

    alert(data.message);

    loadExpenses();
}
async function filterExpenses(){

    let category = document.getElementById("filterCategory").value;
    let fromDate = document.getElementById("filterFrom").value;
    let toDate   = document.getElementById("filterTo").value;

    let params = new URLSearchParams();
    if (category) params.append("category", category);
    if (fromDate) params.append("from", fromDate);
    if (toDate)   params.append("to",   toDate);

    let response = await fetch(`/expenses/filter?${params.toString()}`, {
        credentials: "include"
    });

    let expenses = await response.json();
    let table = document.getElementById("expenseTable");
    table.innerHTML = "";

    if (expenses.length === 0) {
        table.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--muted);">No expenses found</td></tr>`;
        return;
    }

    expenses.forEach(expense => {
        let dateStr = expense.date ? expense.date.split("T")[0] : "";
        table.innerHTML += `
            <tr>
                <td>${expense.title}</td>
                <td>₹${parseFloat(expense.amount).toFixed(2)}</td>
                <td>${expense.category}</td>
                <td>${dateStr}</td>
                <td style="display:flex; gap:8px; flex-wrap:wrap;">
                    <button class="edit-btn" onclick="editExpense(${expense.id}, '${expense.title}', '${expense.amount}', '${expense.category}', '${dateStr}', \`${expense.note || ""}\`)">Edit</button>
                    <button onclick="deleteExpense(${expense.id})">Delete</button>
                </td>
            </tr>
        `;
    });
}

function clearFilter() {
    document.getElementById("filterCategory").value = "";
    document.getElementById("filterFrom").value = "";
    document.getElementById("filterTo").value   = "";
    loadExpenses();
}

function clearMsg() {
    let m = document.getElementById("message");
    if (m) m.innerHTML = "";
}
function editExpense(id, title, amount, category, date, note) {

    document.getElementById("expenseId").value   = id;
    document.getElementById("title").value       = title;
    document.getElementById("amount").value      = amount;
    document.getElementById("category").value    = category;
    document.getElementById("date").value        = date;
    document.getElementById("note").value        = note;

    document.getElementById("saveBtn").innerText = "Update Expense";
    document.getElementById("cancelBtn").style.display = "inline-flex";

    window.scrollTo({ top: 0, behavior: "smooth" });
}

function cancelEdit() {

    document.getElementById("expenseId").value   = "";
    document.getElementById("title").value       = "";
    document.getElementById("amount").value      = "";
    document.getElementById("date").value        = "";
    document.getElementById("note").value        = "";
    document.getElementById("category").value    = "Food";

    document.getElementById("saveBtn").innerText = "Save Expense";
    document.getElementById("cancelBtn").style.display = "none";
}

if (window.location.pathname.includes("dashboard.html")) {
    loadDashboard();
}