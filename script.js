// ===== 1. SELECT ELEMENTS =====
const menuBtn = document.getElementById('menuBtn');
const navMenu = document.getElementById('navMenu');
const themeBtn = document.getElementById('themeBtn');

const budgetDisplay = document.getElementById('budgetDisplay');
const spentDisplay = document.getElementById('spentDisplay');
const remainingDisplay = document.getElementById('remainingDisplay');
const progressBar = document.getElementById('progressBar');
const budgetMessage = document.getElementById('budgetMessage');
const budgetForm = document.getElementById('budgetForm');
const budgetInput = document.getElementById('budgetInput');

const expenseForm = document.getElementById('expenseForm');
const expenseDesc = document.getElementById('expenseDesc');
const expenseAmount = document.getElementById('expenseAmount');
const expenseCategory = document.getElementById('expenseCategory');
const expenseError = document.getElementById('expenseError');
const filterCategory = document.getElementById('filterCategory');
const expenseList = document.getElementById('expenseList');

const splitForm = document.getElementById('splitForm');
const billAmount = document.getElementById('billAmount');
const peopleCount = document.getElementById('peopleCount');
const tipPercent = document.getElementById('tipPercent');
const splitResult = document.getElementById('splitResult');

const contactForm = document.getElementById('contactForm');
const contactName = document.getElementById('contactName');
const contactEmail = document.getElementById('contactEmail');
const contactMessage = document.getElementById('contactMessage');
const nameError = document.getElementById('nameError');
const emailError = document.getElementById('emailError');
const messageError = document.getElementById('messageError');
const formSuccess = document.getElementById('formSuccess');


// ===== 2. DATA AND HELPER FUNCTIONS =====
let budget = Number(localStorage.getItem('perawise-budget')) || 0;
let expenses = [];

try {
  expenses = JSON.parse(localStorage.getItem('perawise-expenses')) || [];
  if (!Array.isArray(expenses)) expenses = [];
} catch {
  expenses = [];
}

function saveData() {
  localStorage.setItem('perawise-budget', budget);
  localStorage.setItem('perawise-expenses', JSON.stringify(expenses));
}

function formatPeso(amount) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP'
  }).format(amount);
}


// ===== 3. UPDATE BUDGET SUMMARY =====
function updateSummary() {
  const spent = expenses.reduce(function (sum, item) {
    return sum + item.amount;
  }, 0);

  const remaining = budget - spent;
  const percent = budget > 0
    ? Math.min((spent / budget) * 100, 100)
    : 0;

  budgetDisplay.textContent = formatPeso(budget);
  spentDisplay.textContent = formatPeso(spent);
  remainingDisplay.textContent = formatPeso(remaining);
  remainingDisplay.classList.toggle('negative', remaining < 0);

  progressBar.style.width = percent + '%';
  progressBar.classList.remove('warning', 'danger');

  if (budget === 0) {
    budgetMessage.textContent = 'Set a budget to start tracking your spending.';
  } else if (spent > budget) {
    progressBar.classList.add('danger');
    budgetMessage.textContent =
      'Over budget by ' + formatPeso(spent - budget) + '. Time to cut back!';
  } else if (percent >= 80) {
    progressBar.classList.add('warning');
    budgetMessage.textContent =
      'Careful! You have used ' + Math.round(percent) + '% of your budget.';
  } else {
    budgetMessage.textContent = 'You are on track. Keep it up!';
  }
}


// ===== 4. DISPLAY EXPENSES =====
function renderExpenses() {
  const selected = filterCategory.value;

  const visible = expenses.filter(function (item) {
    return selected === 'All' || item.category === selected;
  });

  expenseList.innerHTML = '';

  if (visible.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'empty';
    empty.textContent = 'No expenses to show yet.';
    expenseList.appendChild(empty);
    return;
  }

  visible.forEach(function (item) {
    const li = document.createElement('li');
    li.className = 'expense-item';

    const info = document.createElement('div');
    info.className = 'expense-info';

    const title = document.createElement('strong');
    title.textContent = item.description;

    const meta = document.createElement('span');
    meta.className = 'meta';
    meta.textContent = item.category + ' • ' + item.date;

    info.append(title, meta);

    const amount = document.createElement('span');
    amount.className = 'expense-amount';
    amount.textContent = formatPeso(item.amount);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.dataset.id = item.id;
    deleteBtn.textContent = 'Delete';

    li.append(info, amount, deleteBtn);
    expenseList.appendChild(li);
  });
}


// ===== 5. SAVE BUDGET =====
budgetForm.addEventListener('submit', function (event) {
  event.preventDefault();

  const value = parseFloat(budgetInput.value);

  if (!Number.isFinite(value) || value <= 0) {
    alert('Please enter a budget greater than zero.');
    return;
  }

  budget = value;
  saveData();
  updateSummary();
  budgetForm.reset();
});


// ===== 6. ADD AN EXPENSE =====
expenseForm.addEventListener('submit', function (event) {
  event.preventDefault();

  const description = expenseDesc.value.trim();
  const amount = parseFloat(expenseAmount.value);
  const category = expenseCategory.value;

  if (description === '' || !Number.isFinite(amount) || amount <= 0) {
    expenseError.textContent =
      'Enter a description and an amount greater than zero.';
    return;
  }

  expenseError.textContent = '';

  const newExpense = {
    id: Date.now(),
    description: description,
    amount: amount,
    category: category,
    date: new Date().toLocaleDateString('en-PH')
  };

  expenses.unshift(newExpense);
  saveData();
  renderExpenses();
  updateSummary();
  expenseForm.reset();
});


// ===== 7. DELETE EXPENSES AND FILTER =====
expenseList.addEventListener('click', function (event) {
  if (event.target.classList.contains('delete-btn')) {
    const id = Number(event.target.dataset.id);

    expenses = expenses.filter(function (item) {
      return item.id !== id;
    });

    saveData();
    renderExpenses();
    updateSummary();
  }
});

filterCategory.addEventListener('change', renderExpenses);


// ===== 8. BILL SPLITTER =====
splitForm.addEventListener('submit', function (event) {
  event.preventDefault();

  const bill = parseFloat(billAmount.value);
  const people = parseInt(peopleCount.value, 10);
  const tipRate = parseFloat(tipPercent.value) || 0;

  if (
    !Number.isFinite(bill) || bill <= 0 ||
    !Number.isInteger(people) || people < 1 ||
    !Number.isFinite(tipRate) || tipRate < 0
  ) {
    splitResult.textContent =
      'Please enter a valid bill, number of people, and tip.';
    return;
  }

  const total = bill + bill * (tipRate / 100);
  const perPerson = total / people;

  splitResult.textContent =
    `Total with tip: ${formatPeso(total)} | Each person pays: ${formatPeso(perPerson)}`;
});


// ===== 9. CONTACT FORM VALIDATION =====
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

contactForm.addEventListener('submit', function (event) {
  event.preventDefault();

  const name = contactName.value.trim();
  const email = contactEmail.value.trim();
  const message = contactMessage.value.trim();

  let isValid = true;

  nameError.textContent = '';
  emailError.textContent = '';
  messageError.textContent = '';
  formSuccess.textContent = '';

  if (name.length < 2) {
    nameError.textContent = 'Please enter your name (at least 2 letters).';
    isValid = false;
  }

  if (!isValidEmail(email)) {
    emailError.textContent = 'Please enter a valid email address.';
    isValid = false;
  }

  if (message.length < 10) {
    messageError.textContent = 'Your message should be at least 10 characters.';
    isValid = false;
  }

  if (isValid) {
    formSuccess.textContent =
      `Thank you, ${name}! Your message has been received.`;
    contactForm.reset();
  }
});


// ===== 10. MOBILE MENU AND DARK MODE =====
menuBtn.addEventListener('click', function () {
  navMenu.classList.toggle('open');
});

navMenu.addEventListener('click', function (event) {
  if (event.target.tagName === 'A') {
    navMenu.classList.remove('open');
  }
});

function applyTheme(isDark) {
  document.body.classList.toggle('dark', isDark);
  themeBtn.textContent = isDark ? 'Light Mode' : 'Dark Mode';
}

themeBtn.addEventListener('click', function () {
  const isDark = !document.body.classList.contains('dark');
  applyTheme(isDark);

  localStorage.setItem(
    'perawise-theme',
    isDark ? 'dark' : 'light'
  );
});


// ===== 11. START THE APP =====
applyTheme(localStorage.getItem('perawise-theme') === 'dark');

document.getElementById('year').textContent = new Date().getFullYear();

updateSummary();
renderExpenses();