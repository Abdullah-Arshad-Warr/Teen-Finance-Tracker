document.addEventListener('DOMContentLoaded', function () {

    const firebaseConfig = {
        apiKey: "AIzaSyClOs9cRAQWogZE6aJFcyGhxqor7jdqTp8",
        authDomain: "teen-finance-tracker.firebaseapp.com",
        projectId: "teen-finance-tracker",
        storageBucket: "teen-finance-tracker.firebasestorage.app",
        messagingSenderId: "528082447121",
        appId: "1:528082447121:web:97ff558a1b5ea893d77ab0",
        measurementId: "G-T9949ZH2NG"
    };

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const db = firebase.firestore();

    // --- App State & Data ---
    const state = {
        isLoggedIn: false,
        currentUser: null,
        itemToDelete: null,
        chatHistory: [],
        isAdmin: false,
        charts: {
            budgetDoughnut: null,
            spendingPie: null,
            incomeSources: null, // <-- ADDED
        }
    };

    // --- All data for the application is stored here. ---
    const data = {
        transactions: [], // Firestore will now populate this.,
        savingsGoals: [],
        monthlyBudget: null, // Will store the current month's budget
        budgetCategories: {
            needs: ['Groceries', 'Transportation', 'Housing', 'Utilities'],
            wants: ['Entertainment', 'Dining Out', 'Shopping', 'Hobbies'],
            savings: ['Emergency Fund', 'Long-term Savings', 'Investments']
        },
        articles: [],

        triviaQuestions: [],
        triviaProgress: {
            answeredCorrectly: new Set(),
            answeredWrongly: new Set(),
            currentSession: {
                questions: [],
                currentIndex: 0,
                score: 0,
                totalQuestions: 0
            }
        }
    };

    // --- DOM Element Cache ---
    // Caching all DOM elements we need to interact with for performance.
    const elements = {
        globalLoader: document.getElementById('global-loader'),
        pages: document.querySelectorAll('.page-content'),
        navLinks: document.querySelectorAll('.nav-item'),
        pageTitle: document.getElementById('page-title'),
        menuButton: document.getElementById('menu-button'),
        sidebar: document.getElementById('sidebar'),
        sidebarOverlay: document.getElementById('sidebar-overlay'),

        // Modals
        authModal: document.getElementById('auth-modal'),
        transactionModal: document.getElementById('transaction-modal'),
        deleteConfirmModal: document.getElementById('delete-confirm-modal'),
        chatbotModal: document.getElementById('chatbot-modal'),

        // Auth Form
        authTitle: document.getElementById('auth-title'),
        authMessage: document.getElementById('auth-message'),
        loginForm: document.getElementById('login-form'),
        signupForm: document.getElementById('signup-form'),
        toggleAuthButton: document.getElementById('toggle-auth-button'),
        toggleAuthText: document.getElementById('toggle-auth-text'),
        closeAuthButton: document.getElementById('close-auth-button'),
        headerAuthButton: document.getElementById('header-auth-button'),
        logoutButton: document.getElementById('logout-button'),


        // Transaction Form
        transactionForm: document.getElementById('transaction-form'),
        transactionTitle: document.getElementById('transaction-title'),
        closeTransactionButton: document.getElementById('close-transaction-button'),
        addTransactionButton: document.getElementById('add-transaction-button'),
        dashboardAddTransactionButton: document.getElementById('dashboard-add-transaction-button'),
        transactionTableBody: document.getElementById('transaction-table-body'),

        // Delete Confirm
        confirmDeleteBtn: document.getElementById('confirm-delete-btn'),
        cancelDeleteBtn: document.getElementById('cancel-delete-btn'),

        // Chatbot
        chatbotButton: document.getElementById('chatbot-button'),
        closeChatbotButton: document.getElementById('close-chatbot-button'),
        chatbotInput: document.getElementById('chatbot-input'),
        chatbotSend: document.getElementById('chatbot-send'),
        chatbotMessages: document.getElementById('chatbot-messages'),
        chatbotTyping: document.getElementById('chatbot-typing'),

        // Learn Page
        learnTabButtons: document.querySelectorAll('#learn-page .tab-button'),
        learnTabContents: document.querySelectorAll('#learn-page .tab-content'),
        exploreArticlesButton: document.getElementById('explore-articles-button'),
        exploreTriviaButton: document.getElementById('explore-trivia-button'),

        // Article Reader
        articleReaderTitle: document.getElementById('article-reader-title'),
        articleReaderContent: document.getElementById('article-reader-content'),
        backToArticlesButton: document.getElementById('back-to-articles-button'),

        // Dashboard Display
        moneyInDisplay: document.getElementById('money-in'),
        moneyOutDisplay: document.getElementById('money-out'),
        currentBalanceDisplay: document.getElementById('current-balance'),
        topGoalContent: document.getElementById('top-goal-content'),
        topGoalEmptyState: document.getElementById('top-goal-empty-state'),
        topGoalName: document.getElementById('top-goal-name'),
        topGoalSavedText: document.getElementById('top-goal-saved-text'),
        topGoalProgressBar: document.getElementById('top-goal-progress-bar'),
        topGoalDetails: document.getElementById('top-goal-details'),

        // FIND THIS SECTION AND ADD THE NEW ELEMENTS:


        // ADD THESE NEW LINES:
        // User Dropdown Elements
        userDropdownContainer: document.getElementById('user-dropdown-container'),
        userDropdownButton: document.getElementById('user-dropdown-button'),
        userDropdownMenu: document.getElementById('user-dropdown-menu'),
        userNameDropdown: document.getElementById('user-name-dropdown'),
        userAvatarDropdown: document.getElementById('user-avatar-dropdown'),
        userAvatarInitialDropdown: document.getElementById('user-avatar-initial-dropdown'),
        dropdownLogoutButton: document.getElementById('dropdown-logout-button'),

        //Savings Goals
        goalModal: document.getElementById('goal-modal'),
        goalForm: document.getElementById('goal-form'),
        goalTitle: document.getElementById('goal-title'),
        closeGoalButton: document.getElementById('close-goal-button'),
        addGoalButton: document.getElementById('add-goal-button'),
        viewAllGoalsButton: document.getElementById('view-all-goals-button'),
        savingsGoalsContainer: document.getElementById('savings-goals-container'),

        // Admin Page
        adminPage: document.getElementById('admin-page'),
        adminLoginView: document.getElementById('admin-login-view'),
        adminContentView: document.getElementById('admin-content-view'),
        adminLoginForm: document.getElementById('admin-login-form'),
        adminLoginError: document.getElementById('admin-login-error'),
        adminArticlesTableBody: document.getElementById('admin-articles-table-body'),
        addArticleButton: document.getElementById('add-article-button'),
        adminViewToggleButtons: document.querySelectorAll('.admin-view-toggle'),
        adminArticlesView: document.getElementById('admin-articles-management'),
        adminTriviaView: document.getElementById('admin-trivia-management'),
        adminTriviaTableBody: document.getElementById('admin-trivia-table-body'),
        addTriviaButton: document.getElementById('add-trivia-button'),

        // Article Modal
        articleModal: document.getElementById('article-modal'),
        articleModalTitle: document.getElementById('article-modal-title'),
        closeArticleModal: document.getElementById('close-article-modal'),
        articleForm: document.getElementById('article-form'),

        // Trivia Modal
        triviaModal: document.getElementById('trivia-modal'),
        triviaModalTitle: document.getElementById('trivia-modal-title'),
        closeTriviaModal: document.getElementById('close-trivia-modal'),
        triviaForm: document.getElementById('trivia-form'),
    };

    // --- Helper Functions ---
    const formatCurrency = (amount) => {
        if (amount < 0) {
            return `-$${Math.abs(amount).toFixed(2)}`;
        }
        return `$${amount.toFixed(2)}`;
    };

    function setFormLoading(form, isLoading) {
        const button = form.querySelector('button[type="submit"]');
        if (isLoading) {
            button.disabled = true;
            button.innerHTML = `<svg class="animate-spin h-5 w-5 mr-3 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10" stroke-width="4" stroke-opacity="0.25"></circle><path d="M12 2a10 10 0 0110 10" stroke-width="4" stroke-linecap="round"></path></svg> Loading...`;
        } else {
            button.disabled = false;
            button.textContent = form.id === 'login-form' ? 'Login' : 'Sign Up';
        }
    }

    // --- UI Update Functions ---
    // This object holds all functions that directly manipulate the UI.
    const ui = {

        hideGlobalLoader() {
            const loader = elements.globalLoader;
            if (loader) {
                loader.classList.add('opacity-0');
                setTimeout(() => {
                    loader.style.display = 'none';
                }, 350);
            }
        },
        // Generic modal functions to reduce redundant code.
        showModal(modalElement) {
            modalElement.classList.remove('hidden');
            setTimeout(() => modalElement.classList.remove('opacity-0'), 10);
        },

        hideModal(modalElement) {
            modalElement.classList.add('opacity-0');
            setTimeout(() => modalElement.classList.add('hidden'), 300);
        },

        // Specific modal handlers that might need to do something before showing.
        showAuthModal() {
            ui.showLoginPage();
            ui.showModal(elements.authModal);
        },

        showTransactionModal(transaction = null) {
            elements.transactionForm.reset();
            const categorySelect = document.getElementById('transaction-cat');

            if (transaction) {
                elements.transactionTitle.textContent = 'Edit Transaction';
                document.getElementById('transaction-id').value = transaction.id;
                document.getElementById('transaction-desc').value = transaction.desc;
                document.getElementById('transaction-cat').value = transaction.cat;
                document.getElementById('transaction-amount').value = Math.abs(transaction.amount);
                document.getElementById('transaction-date').value = transaction.date;
                document.querySelector(`input[name="transaction-type"][value="${transaction.amount > 0 ? 'inflow' : 'outflow'}"]`).checked = true;
            } else {
                elements.transactionTitle.textContent = 'Add Transaction';
                document.getElementById('transaction-id').value = '';
                document.getElementById('transaction-date').valueAsDate = new Date();
            }

            // Populate category dropdown with budget categories and savings goals
            app.populateCategoryRecommendations(categorySelect);

            ui.showModal(elements.transactionModal);
        },

        showDeleteConfirmModal(id, type) {
            state.itemToDelete = { id, type };
            this.showModal(elements.deleteConfirmModal);
        },

        // Functions to switch between login and signup forms.
        showLoginPage() {
            elements.loginForm.classList.remove('hidden');
            elements.signupForm.classList.add('hidden');
            elements.authTitle.textContent = 'Login';
            elements.toggleAuthText.textContent = "Don't have an account?";
            elements.toggleAuthButton.textContent = "Sign Up";
            elements.authMessage.classList.add('hidden');
        },

        showSignupPage() {
            elements.loginForm.classList.add('hidden');
            elements.signupForm.classList.remove('hidden');
            elements.authTitle.textContent = 'Sign Up';
            elements.toggleAuthText.textContent = "Already have an account?";
            elements.toggleAuthButton.textContent = "Login";
            elements.authMessage.classList.add('hidden');
        },

        showAuthMessage(message, isError = true) {
            elements.authMessage.textContent = message;
            elements.authMessage.classList.remove('hidden');
            elements.authMessage.classList.toggle('text-red-500', isError);
            elements.authMessage.classList.toggle('text-green-500', !isError);
        },

        // REPLACE THIS ENTIRE FUNCTION:
        updateHeaderForAuthState(user) {
            if (user && user.firestoreData) {
                // Logged In State
                const { name } = user.firestoreData;
                const displayName = name || 'User';
                const initial = displayName.trim().charAt(0).toUpperCase() || '?';

                // Update dropdown with user info
                elements.userNameDropdown.textContent = displayName;
                elements.userAvatarInitialDropdown.textContent = initial;

                // Show dropdown, hide login button
                elements.userDropdownContainer.classList.remove('hidden');
                elements.headerAuthButton.classList.add('hidden');

            } else {
                // Logged Out State
                elements.userDropdownContainer.classList.add('hidden');
                elements.headerAuthButton.classList.remove('hidden');
            }
        },
        updateTransactionControls(isLoggedIn) {
            const displayStyle = isLoggedIn ? 'flex' : 'none';
            elements.addTransactionButton.style.display = displayStyle;
            elements.dashboardAddTransactionButton.style.display = isLoggedIn ? 'block' : 'none';

            // Ensure header auth elements are visible
            if (isLoggedIn) {
                elements.userDropdownContainer.classList.remove('hidden');
                elements.headerAuthButton.classList.add('hidden');
            } else {
                elements.userDropdownContainer.classList.add('hidden');
                elements.headerAuthButton.classList.remove('hidden');
            }
        },

        updateTopGoalDisplay() {
            // Always hide content if not logged in
            if (!state.isLoggedIn) {
                elements.topGoalContent.classList.add('hidden');
                elements.topGoalEmptyState.classList.remove('hidden');
                elements.topGoalEmptyState.innerHTML = `
        <p class="mb-2">Please log in to view your savings goals!</p>
        <button class="font-semibold text-primary-accent hover:underline" onclick="document.getElementById('header-auth-button').click()">Login Now</button>
    `;
                return;
            }

            if (data.savingsGoals.length === 0) {
                elements.topGoalContent.classList.add('hidden');
                elements.topGoalEmptyState.classList.remove('hidden');
                elements.topGoalEmptyState.innerHTML = `
        <p>No savings goals yet!</p>
        <a href="#savings" class="font-semibold text-primary-accent hover:underline mt-2 inline-block">Create one now</a>
    `;
                return;
            }

            elements.topGoalContent.classList.remove('hidden');
            elements.topGoalEmptyState.classList.add('hidden');

            // Find goal closest to completion (highest percentage)
            const topGoal = [...data.savingsGoals].sort((a, b) => {
                const percA = a.target > 0 ? a.saved / a.target : 0;
                const percB = b.target > 0 ? b.saved / b.target : 0;
                return percB - percA;
            })[0];

            const percentage = topGoal.target > 0 ? Math.round((topGoal.saved / topGoal.target) * 100) : 0;

            elements.topGoalName.textContent = topGoal.name;
            elements.topGoalSavedText.textContent = `Saving for this goal!`;
            elements.topGoalProgressBar.style.width = `${percentage}%`;
            elements.topGoalDetails.innerHTML = `
            <span class="text-primary-accent">${formatCurrency(topGoal.saved)} / ${formatCurrency(topGoal.target)}</span>
            <span>${percentage}%</span>`;
        },

        updateSmartAlerts() {
            const alertsContainer = document.getElementById('smart-alerts');
            if (!alertsContainer) return;

            const alerts = [];

            // Check for savings goals without budget allocation
            if (data.savingsGoals.length > 0 && data.monthlyBudget) {
                data.savingsGoals.forEach(goal => {
                    const hasCategory = Object.keys(data.monthlyBudget.categories).some(cat =>
                        cat.toLowerCase().includes(goal.name.toLowerCase())
                    );

                    if (!hasCategory && goal.saved < goal.target) {
                        alerts.push({
                            type: 'info',
                            icon: '💡',
                            message: `Consider adding "${goal.name}" to your budget to track savings progress!`,
                            action: () => {
                                document.getElementById('manage-budget-button').click();
                            }
                        });
                    }
                });
            }

            // Check for budget categories with no transactions
            if (data.monthlyBudget) {
                const currentMonth = new Date().getMonth();
                const currentYear = new Date().getFullYear();

                Object.keys(data.monthlyBudget.categories).forEach(category => {
                    const hasTransactions = data.transactions.some(t => {
                        const d = new Date(t.date);
                        return t.cat === category &&
                            d.getMonth() === currentMonth &&
                            d.getFullYear() === currentYear;
                    });

                    if (!hasTransactions) {
                        alerts.push({
                            type: 'warning',
                            icon: '📊',
                            message: `No transactions yet for "${category}". Add one to track your budget!`,
                            action: () => {
                                elements.dashboardAddTransactionButton.click();
                            }
                        });
                    }
                });
            }

            // Render alerts
            if (alerts.length === 0) {
                alertsContainer.innerHTML = '';
                return;
            }

            alertsContainer.innerHTML = alerts.slice(0, 3).map(alert => `
        <div class="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg flex items-start gap-3 cursor-pointer hover:bg-blue-100 transition-colors"
             onclick="this.remove()">
            <span class="text-2xl">${alert.icon}</span>
            <div class="flex-1">
                <p class="text-sm text-gray-700">${alert.message}</p>
            </div>
            <button class="text-gray-400 hover:text-gray-600">&times;</button>
        </div>
    `).join('');
        },
        // Populates the transaction table with data.
        populateTransactions() {
            if (data.transactions.length === 0) {
                const message = state.isLoggedIn ?
                    'No transactions yet. Click "Add Transaction" to get started!' :
                    'Please log in to see and manage your transactions.';
                elements.transactionTableBody.innerHTML = `<tr><td colspan="5" class="text-center p-8 text-subtle">${message}</td></tr>`;
                return;
            }

            elements.transactionTableBody.innerHTML = data.transactions
                .map(tx => `
                    <tr class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td class="p-2 text-subtle">${tx.date}</td>
                        <td class="p-2 font-medium truncate-text" style="max-width: 200px;" title="${tx.desc}">${tx.desc}</td>
                        <td class="p-2 text-subtle">${tx.cat}</td>
                        <td class="p-2 text-right font-medium ${tx.amount > 0 ? 'text-green-500' : 'text-red-500'}">${tx.amount > 0 ? '+' : ''}${formatCurrency(tx.amount)}</td>
                        <td class="p-2 text-center flex justify-center items-center gap-2">
                            ${state.isLoggedIn ? `
                            <button class="edit-btn text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-100 transition-colors" data-id="${tx.id}" title="Edit"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg></button>
                            <button class="delete-btn text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition-colors" data-id="${tx.id}" title="Delete"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                            ` : ''}
                        </td>
                    </tr>`).join('');
        },

        // Calculates and displays the current balance and monthly totals.
        updateBalance() {
            // These calculations remain the same, but now are for the current month only
            const monthlyInflow = data.transactions
                .filter(t => t.amount > 0)
                .reduce((sum, t) => sum + t.amount, 0);

            const monthlyOutflow = data.transactions
                .filter(t => t.amount < 0)
                .reduce((sum, t) => sum + t.amount, 0);

            const currentBalance = monthlyInflow + monthlyOutflow;

            elements.moneyInDisplay.textContent = formatCurrency(monthlyInflow);
            elements.moneyOutDisplay.textContent = formatCurrency(Math.abs(monthlyOutflow)); // Keep money out display positive
            elements.currentBalanceDisplay.textContent = formatCurrency(currentBalance);

            // Dynamically change the color to red if the balance is negative
            elements.currentBalanceDisplay.classList.toggle('text-red-500', currentBalance < 0);
            elements.currentBalanceDisplay.classList.toggle('text-main-heading', currentBalance >= 0);
        },

        // Creates or updates the charts.
        // Enhanced chart creation (replace the existing createOrUpdateCharts function)
        createOrUpdateCharts() {
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();

            // --- Enhanced Budget Chart with Budget vs Spending Comparison ---
            if (data.monthlyBudget) {
                const spending = data.transactions
                    .filter(t => {
                        const d = new Date(t.date);
                        return t.amount < 0 && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
                    })
                    .reduce((acc, t) => {
                        acc[t.cat] = (acc[t.cat] || 0) + Math.abs(t.amount);
                        return acc;
                    }, {});

                const budgetLabels = [];
                const budgetData = [];
                const budgetColors = [];

                Object.entries(data.monthlyBudget.categories).forEach(([category, budgetAmount]) => {
                    const spent = spending[category] || 0;
                    const percentage = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;

                    budgetLabels.push(`${category} (${percentage.toFixed(0)}%)`);
                    budgetData.push(spent);

                    // Color based on budget status
                    if (percentage >= 100) {
                        budgetColors.push('#EF4444'); // Red - over budget
                    } else if (percentage >= 80) {
                        budgetColors.push('#F59E0B'); // Orange - near budget
                    } else {
                        budgetColors.push('#20C997'); // Green - under budget
                    }
                });

                const budgetChartConfig = {
                    labels: budgetLabels,
                    datasets: [{
                        label: 'Spending vs Budget',
                        data: budgetData,
                        backgroundColor: budgetColors,
                        borderColor: '#FFFFFF',
                        borderWidth: 2
                    }]
                };

                // Create the budget chart
                const budgetChartCanvas = document.getElementById('budgetDoughnutChart');
                if (budgetChartCanvas) {
                    if (state.charts.budgetDoughnut) state.charts.budgetDoughnut.destroy();
                    state.charts.budgetDoughnut = new Chart(budgetChartCanvas.getContext('2d'), {
                        type: 'doughnut',
                        data: budgetChartConfig,
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            cutout: '70%',
                            plugins: {
                                legend: {
                                    position: 'bottom',
                                    labels: {
                                        boxWidth: 12,
                                        padding: 15,
                                        font: { size: 11 }
                                    }
                                },
                                tooltip: {
                                    callbacks: {
                                        label: function (context) {
                                            const category = context.label.split(' (')[0];
                                            const spent = context.parsed;
                                            const budget = data.monthlyBudget.categories[category];
                                            return `${category}: ${formatCurrency(spent)} of ${formatCurrency(budget)}`;
                                        }
                                    }
                                }
                            }
                        }
                    });
                }
            }

            // --- Spending Data Calculation (for the spending pie chart) ---
            const spendingData = data.transactions
                .filter(t => {
                    const d = new Date(t.date);
                    return t.amount < 0 && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
                })
                .reduce((acc, t) => {
                    acc[t.cat] = (acc[t.cat] || 0) + Math.abs(t.amount);
                    return acc;
                }, {});

            const spendingCanvas = document.getElementById('spendingPieChart');
            if (spendingCanvas) {
                const chartContainer = spendingCanvas.parentElement;

                // Check if there's no spending data
                if (Object.keys(spendingData).length === 0) {
                    // Hide canvas and show message
                    spendingCanvas.style.display = 'none';

                    // Remove existing message if any
                    const existingMessage = chartContainer.querySelector('.no-data-message');
                    if (existingMessage) existingMessage.remove();

                    // Add no data message
                    const noDataMessage = document.createElement('div');
                    noDataMessage.className = 'no-data-message text-center py-12';
                    noDataMessage.innerHTML = `
                <div class="text-6xl mb-4">📊</div>
                <p class="text-subtle text-lg font-medium mb-2">No spending data yet</p>
                <p class="text-subtle text-sm">Add some outflow transactions to see your spending breakdown!</p>
            `;
                    chartContainer.appendChild(noDataMessage);

                    // Destroy existing chart
                    if (state.charts.spendingPie) {
                        state.charts.spendingPie.destroy();
                        state.charts.spendingPie = null;
                    }
                } else {
                    // Show canvas and remove message
                    spendingCanvas.style.display = 'block';
                    const existingMessage = chartContainer.querySelector('.no-data-message');
                    if (existingMessage) existingMessage.remove();

                    const spendingChartConfig = {
                        labels: Object.keys(spendingData),
                        datasets: [{
                            data: Object.values(spendingData),
                            backgroundColor: ['#F87171', '#FBBF24', '#60A5FA', '#A78BFA', '#34D399'],
                            borderColor: '#FFFFFF',
                            borderWidth: 2
                        }]
                    };

                    if (state.charts.spendingPie) state.charts.spendingPie.destroy();
                    state.charts.spendingPie = new Chart(spendingCanvas.getContext('2d'), {
                        type: 'pie',
                        data: spendingChartConfig,
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            borderWidth: 2,
                            plugins: {
                                legend: {
                                    position: 'right',
                                    labels: {
                                        boxWidth: 12,
                                        padding: 15
                                    }
                                }
                            }
                        }
                    });
                }
            }

            // --- Income Data Calculation ---
            const incomeData = data.transactions
                .filter(t => {
                    const d = new Date(t.date);
                    return t.amount > 0 && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
                })
                .reduce((acc, t) => {
                    acc[t.cat] = (acc[t.cat] || 0) + t.amount;
                    return acc;
                }, {});

            const incomeCanvas = document.getElementById('incomeSourcesChart');
            if (incomeCanvas) {
                const chartContainer = incomeCanvas.parentElement;

                // Check if there's no income data
                if (Object.keys(incomeData).length === 0) {
                    // Hide canvas and show message
                    incomeCanvas.style.display = 'none';

                    // Remove existing message if any
                    const existingMessage = chartContainer.querySelector('.no-data-message');
                    if (existingMessage) existingMessage.remove();

                    // Add no data message
                    const noDataMessage = document.createElement('div');
                    noDataMessage.className = 'no-data-message text-center py-12';
                    noDataMessage.innerHTML = `
                <div class="text-6xl mb-4">💰</div>
                <p class="text-subtle text-lg font-medium mb-2">No income data yet</p>
                <p class="text-subtle text-sm">Add some inflow transactions to see your income sources!</p>
            `;
                    chartContainer.appendChild(noDataMessage);

                    // Destroy existing chart
                    if (state.charts.incomeSources) {
                        state.charts.incomeSources.destroy();
                        state.charts.incomeSources = null;
                    }
                } else {
                    // Show canvas and remove message
                    incomeCanvas.style.display = 'block';
                    const existingMessage = chartContainer.querySelector('.no-data-message');
                    if (existingMessage) existingMessage.remove();

                    const incomeChartConfig = {
                        labels: Object.keys(incomeData),
                        datasets: [{
                            data: Object.values(incomeData),
                            backgroundColor: ['#20C997', '#48BB78', '#38A169', '#2F855A'],
                            borderColor: '#FFFFFF',
                            borderWidth: 2
                        }]
                    };

                    if (state.charts.incomeSources) state.charts.incomeSources.destroy();
                    state.charts.incomeSources = new Chart(incomeCanvas.getContext('2d'), {
                        type: 'pie',
                        data: incomeChartConfig,
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            borderWidth: 2,
                            plugins: {
                                legend: {
                                    position: 'right',
                                    labels: {
                                        boxWidth: 12,
                                        padding: 15
                                    }
                                }
                            }
                        }
                    });
                }
            }
        },

        // Populates other sections of the UI.
        populateSavingsGoals() {

            elements.addGoalButton.classList.toggle('hidden', !state.isLoggedIn);

            if (data.savingsGoals.length === 0) {
                const message = state.isLoggedIn ?
                    'You have no savings goals yet. Click "Add Goal" to create one!' :
                    'Please log in to manage your savings goals.';
                elements.savingsGoalsContainer.innerHTML = `<p class="text-subtle col-span-full text-center">${message}</p>`;
                return;
            }

            elements.savingsGoalsContainer.innerHTML = data.savingsGoals.map(goal => {
                const percentage = goal.target > 0 ? Math.round((goal.saved / goal.target) * 100) : 0;
                return `
        <div class="bg-card p-6 rounded-xl shadow-lg flex flex-col">
            <div class="flex-grow">
                <div class="text-4xl mb-3">${goal.icon}</div>
                <h3 class="font-bold text-xl truncate-text" title="${goal.name}">${goal.name}</h3>
                <p class="text-subtle mb-4">Saved ${formatCurrency(goal.saved)} of ${formatCurrency(goal.target)}</p>
                <div class="w-full bg-gray-200 rounded-full h-3 mb-2">
                    <div class="bg-primary-accent h-3 rounded-full" style="width: ${percentage}%;"></div>
                </div>
                <p class="text-right font-semibold text-primary-accent">${percentage}%</p>
            </div>
            <div class="mt-4 pt-4 border-t border-gray-100 flex justify-end gap-2">
                <button class="edit-goal-btn p-2 rounded-full hover:bg-blue-100 text-blue-500 transition-colors" data-id="${goal.id}" title="Edit Goal"><svg class="h-5 w-5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"/></svg></button>
                <button class="delete-goal-btn p-2 rounded-full hover:bg-red-100 text-red-500 transition-colors" data-id="${goal.id}" title="Delete Goal"><svg class="h-5 w-5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
            </div>
        </div>`;
            }).join('');
        },
        populateArticles() {
            const container = document.getElementById('articles-container');

            // Check if articles array is empty or doesn't exist
            if (!data.articles || data.articles.length === 0) {
                container.innerHTML = `
            <div class="text-center p-8 text-subtle bg-gray-50 rounded-lg">
                <p class="mb-2 text-lg font-semibold">No Articles Available Yet</p>
                <p>It looks like our library is currently empty. Please check back soon for helpful financial tips and guides! 📚</p>
            </div>`;
            } else {
                container.innerHTML = data.articles.map(article => `
            <div class="bg-card p-4 rounded-xl shadow-md border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow duration-200" data-article-id="${article.id}">
                <h4 class="font-bold text-lg truncate-text" title="${article.title}">${article.title}</h4>
                <p class="text-subtle my-2 line-clamp-2">${article.summary}</p>
                <button class="font-semibold text-primary-accent hover:underline mt-2">Read Article &rarr;</button>
            </div>`).join('');
            }
        },

        showGoalModal(goal = null) {
            elements.goalForm.reset();
            if (goal) {
                elements.goalTitle.textContent = 'Edit Savings Goal';
                document.getElementById('goal-id').value = goal.id;
                document.getElementById('goal-name').value = goal.name;
                document.getElementById('goal-icon').value = goal.icon;
                document.getElementById('goal-target').value = goal.target;
                document.getElementById('goal-saved').value = goal.saved;
            } else {
                elements.goalTitle.textContent = 'Add Savings Goal';
                document.getElementById('goal-id').value = '';
            }
            this.showModal(elements.goalModal);
        },
        showChatBotModal() {
            state.chatbotMessages = []; // Clear previous messages
            let initialMessageHTML;
            const userName = state.currentUser?.firestoreData?.name;

            if (userName) {
                // Logged-in state
                initialMessageHTML = `
            <div class="flex justify-start">
                <div class="bg-gray-200 text-main-heading p-3 rounded-lg max-w-xs">
                    Hi <strong>${userName}</strong>! I'm FinFlow AI, your personal financial assistant. How can I help you today? Ask me about your budget, savings, or spending! 💡
                </div>
            </div>`;
            } else {
                // Logged-out state
                initialMessageHTML = `
            <div class="flex justify-start">
                <div class="bg-gray-200 text-main-heading p-3 rounded-lg max-w-xs">
                    Hi there! I'm Trackee AI. Please <strong>log in</strong> to get personalized advice based on your financial data. I can help you understand your spending and reach your goals! 🚀
                </div>
            </div>`;
            }

            // Reset the chat window with the new initial message
            elements.chatbotMessages.innerHTML = initialMessageHTML;

            // Ensure the typing indicator is appended after reset and is hidden
            elements.chatbotMessages.appendChild(elements.chatbotTyping);
            elements.chatbotTyping.classList.add('hidden');

            // Show the modal
            this.showModal(elements.chatbotModal);
        },

        // --- Admin Page Functions ---
        showAdminLogin() {
            this.hideAllViews(elements.adminPage);
            elements.adminLoginView.classList.remove('hidden');
        },

        async renderAdminView() {
            this.hideAllViews(elements.adminPage);
            elements.adminContentView.classList.remove('hidden');

            // Fetch data in parallel
            await Promise.all([app.loadArticles(true), app.loadTrivia(true)]);

            this.showArticlesTable();
            this.showTriviaTable();
        },

        showArticlesTable() {
            const loadingHTML = `<tr><td colspan="3" class="text-center p-8 text-subtle">
                <svg class="animate-spin h-6 w-6 mx-auto mb-2 text-primary-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10" stroke-width="4" stroke-opacity="0.25"></circle>
                    <path d="M12 2a10 10 0 0110 10" stroke-width="4" stroke-linecap="round"></path>
                </svg>
                Loading...
            </td></tr>`;
            elements.adminArticlesTableBody.innerHTML = loadingHTML;

            // Populate Articles Table
            if (data.articles.length === 0) {
                elements.adminArticlesTableBody.innerHTML = `<tr><td colspan="3" class="text-center p-8 text-subtle">No articles found. Add one!</td></tr>`;
            } else {
                elements.adminArticlesTableBody.innerHTML = data.articles.map(article => `
                    <tr class="border-b border-gray-100">
                        <td class="p-3 font-medium">${article.title}</td>
                        <td class="p-3 text-subtle">${article.summary}</td>
                        <td class="p-3 text-center">
                            <button class="edit-article-btn text-blue-500 hover:text-blue-700 p-2" data-id="${article.id}" title="Edit">Edit</button>
                            <button class="delete-article-btn text-red-500 hover:text-red-700 p-2" data-id="${article.id}" title="Delete">Delete</button>
                        </td>
                    </tr>
                `).join('');
            }
        },

        showTriviaTable() {
            const loadingHTML = `<tr><td colspan="3" class="text-center p-8 text-subtle">
                <svg class="animate-spin h-6 w-6 mx-auto mb-2 text-primary-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10" stroke-width="4" stroke-opacity="0.25"></circle>
                    <path d="M12 2a10 10 0 0110 10" stroke-width="4" stroke-linecap="round"></path>
                </svg>
                Loading...
            </td></tr>`;
            elements.adminTriviaTableBody.innerHTML = loadingHTML;

            if (data.triviaQuestions.length === 0) {
                elements.adminTriviaTableBody.innerHTML = `<tr><td colspan="3" class="text-center p-8 text-subtle">No trivia questions found. Add one!</td></tr>`;
            } else {
                elements.adminTriviaTableBody.innerHTML = data.triviaQuestions.map(q => `
                    <tr class="border-b border-gray-100">
                        <td class="p-3 font-medium truncate-text" style="max-width: 400px;" title="${q.question}">${q.question}</td>
                        <td class="p-3 text-subtle">${q.options[q.correct]}</td>
                        <td class="p-3 text-center">
                            <button class="edit-trivia-btn text-blue-500 hover:text-blue-700 p-2" data-id="${q.id}" title="Edit">Edit</button>
                            <button class="delete-trivia-btn text-red-500 hover:text-red-700 p-2" data-id="${q.id}" title="Delete">Delete</button>
                        </td>
                    </tr>
                `).join('');
            }
        },

        hideAllViews(page) {
            page.querySelectorAll('#admin-login-view, #admin-content-view, #admin-articles-management, #admin-trivia-management').forEach(view => {
                view.classList.add('hidden');
            });
        },

        showArticleModal(article = null) {
            elements.articleForm.reset();
            if (article) {
                elements.articleModalTitle.textContent = 'Edit Article';
                document.getElementById('article-id').value = article.id;
                document.getElementById('article-title').value = article.title;
                document.getElementById('article-summary').value = article.summary;
                document.getElementById('article-content').value = article.content;
            } else {
                elements.articleModalTitle.textContent = 'Add Article';
                document.getElementById('article-id').value = '';
            }
            this.showModal(elements.articleModal);
        },

        showTriviaModal(trivia = null) {
            elements.triviaForm.reset();
            if (trivia) {
                elements.triviaModalTitle.textContent = 'Edit Trivia Question';
                document.getElementById('trivia-id').value = trivia.id;
                document.getElementById('trivia-question-text').value = trivia.question;
                document.getElementById('trivia-option-0').value = trivia.options[0];
                document.getElementById('trivia-option-1').value = trivia.options[1];
                document.getElementById('trivia-option-2').value = trivia.options[2];
                document.getElementById('trivia-option-3').value = trivia.options[3];
                document.getElementById('trivia-correct-answer').value = trivia.correct;
                document.getElementById('trivia-explanation').value = trivia.explanation;
            } else {
                elements.triviaModalTitle.textContent = 'Add Trivia Question';
                document.getElementById('trivia-id').value = '';
            }
            this.showModal(elements.triviaModal);
        },
    };

    // --- App Logic & Event Handlers ---
    // This object holds the main application logic.
    const app = {
        // Handles navigation between pages.
        navigateTo(hash, tabId = null) {
            if (!hash) hash = '#dashboard';
            if (hash.startsWith('#admin')) {
                hash = '#admin'; // Normalize to just #admin
            }
            window.location.hash = hash;
            const targetPageId = (hash.substring(1) || 'dashboard') + '-page';
            elements.pages.forEach(p => p.classList.add('hidden'));
            const targetPage = document.getElementById(targetPageId)
            if (targetPage) {
                targetPage.classList.remove('hidden');
            } else {
                document.getElementById('dashboard-page').classList.remove('hidden');
            }
            if (hash === '#admin') {
                if (state.isAdmin) {
                    ui.renderAdminView();
                } else {
                    ui.showAdminLogin();
                }
            } else if (hash === '#dashboard' || hash === '#budget') {
                // A small delay ensures the page container is visible before the chart tries to render.
                setTimeout(() => ui.createOrUpdateCharts(), 50);
            }

            elements.navLinks.forEach(link => {
                if (link.getAttribute('href') === hash) {
                    link.classList.add('active');
                    elements.pageTitle.textContent = link.querySelector('span').textContent;
                } else {
                    link.classList.remove('active');
                }
            });

            elements.sidebar.classList.add('-translate-x-full');
            elements.sidebarOverlay.style.display = 'none';
            document.body.classList.remove('sidebar-open');

            if (hash === '#learn' && tabId) {
                elements.learnTabButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.tabTarget === tabId));
                elements.learnTabContents.forEach(content => content.classList.toggle('active', content.id === tabId));
            }
        },

        populateCategoryRecommendations(inputElement) {
            // Find or create the datalist
            let datalist = document.getElementById('category-suggestions');
            if (!datalist) {
                datalist = document.createElement('datalist');
                datalist.id = 'category-suggestions';
                inputElement.parentNode.appendChild(datalist);
            }

            // Clear existing options
            datalist.innerHTML = '';

            const categories = new Set();

            // Add budget categories if they exist
            if (data.monthlyBudget && data.monthlyBudget.categories) {
                Object.keys(data.monthlyBudget.categories).forEach(cat => {
                    categories.add(`💰 ${cat}`);
                });
            }

            // Add savings goal categories
            data.savingsGoals.forEach(goal => {
                categories.add(`🎯 Savings: ${goal.name}`);
            });

            // Add common default categories
            const defaults = ['Income', 'Salary', 'Allowance', 'Gift', 'Side Hustle', 'Other'];
            defaults.forEach(cat => categories.add(cat));

            // Add recently used categories from transactions
            data.transactions.slice(0, 10).forEach(t => {
                if (t.cat) categories.add(t.cat);
            });

            // Convert to sorted array and populate datalist
            const sortedCategories = Array.from(categories).sort();

            sortedCategories.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat;
                datalist.appendChild(option);
            });
        },

        showAdminView(viewToShow) {
            elements.adminArticlesView.classList.add('hidden');
            elements.adminTriviaView.classList.add('hidden');
            elements.adminViewToggleButtons.forEach(btn => {
                const isActive = btn.dataset.view === viewToShow;
                btn.classList.toggle('border-primary-accent', isActive);
                btn.classList.toggle('text-primary-accent', isActive);
                btn.classList.toggle('border-transparent', !isActive);
                btn.classList.toggle('text-subtle', !isActive);
            });

            if (viewToShow === 'articles') {
                elements.adminArticlesView.classList.remove('hidden');
            } else if (viewToShow === 'trivia') {
                elements.adminTriviaView.classList.remove('hidden');
            }
        },

        showArticle(articleId) {
            const article = data.articles.find(a => a.id === articleId);
            if (article) {
                elements.articleReaderTitle.textContent = article.title;
                elements.articleReaderContent.innerHTML = article.content;
                app.navigateTo('#article-reader');
            }
        },

        // Authentication handlers.
        async handleLogin(e) {
            e.preventDefault();
            setFormLoading(elements.loginForm, true);

            try {
                const email = document.getElementById('login-email').value;
                const password = document.getElementById('login-password').value;
                if (!email || !password) throw new Error('Please enter both email and password.');

                await auth.signInWithEmailAndPassword(email, password);
                ui.showAuthMessage('Login successful! Loading your data...', false);

                // Wait a moment for Firebase auth state to update, then close modal
                setTimeout(() => {
                    ui.hideModal(elements.authModal);
                }, 1000);
            } catch (error) {
                ui.showAuthMessage(error.message);
                setFormLoading(elements.loginForm, false);
            }
            // Note: Don't reset loading state here - let the auth state handler do it
        },

        async handleSignup(e) {
            e.preventDefault();
            setFormLoading(elements.signupForm, true);

            try {
                const name = document.getElementById('signup-name').value;
                const email = document.getElementById('signup-email').value;
                const password = document.getElementById('signup-password').value;
                const confirmPassword = document.getElementById('signup-confirm-password').value;
                if (!name || !email || !password || !confirmPassword) throw new Error('Please fill in all fields.');
                if (password !== confirmPassword) throw new Error('Passwords do not match.');

                const userCredential = await auth.createUserWithEmailAndPassword(email, password);
                await db.collection("users").doc(userCredential.user.uid).set({
                    name,
                    email
                });
                ui.showAuthMessage('Signup successful! Setting up your account...', false);

                // Wait a moment then close modal
                setTimeout(() => {
                    ui.hideModal(elements.authModal);
                }, 1500);
            } catch (error) {
                ui.showAuthMessage(error.message);
                setFormLoading(elements.signupForm, false);
            }
            // Note: Don't reset loading state here - let the auth state handler do it
        },

        handleLogout() {
            auth.signOut();
            app.navigateTo('#dashboard'); // Navigate home on logout
        },

        async fetchUserData(uid) {
            try {
                const userDoc = await db.collection('users').doc(uid).get();
                return userDoc.exists ? userDoc.data() : null;
            } catch (error) {
                console.error("Error fetching user data:", error);
                return null;
            }
        },

        async loadUserTransactions() {
            if (!state.isLoggedIn) {
                data.transactions = [];
                app.updateAll();
                return;
            }
            const uid = state.currentUser.uid;
            const now = new Date();

            // Calculate the start of the current month
            const firstDayOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const firstDayISO = firstDayOfCurrentMonth.toISOString().split('T')[0]; // e.g., "2023-10-01"

            // CALCULATE THE END BOUNDARY (start of next month)
            const firstDayOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            const firstDayOfNextMonthISO = firstDayOfNextMonth.toISOString().split('T')[0]; // e.g., "2023-11-01"

            try {
                const snapshot = await db.collection('users').doc(uid).collection('transactions').where('date', '>=', firstDayISO).where('date', '<', firstDayOfNextMonthISO).orderBy('date', 'desc').get();
                data.transactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                app.updateAll();
            } catch (error) {
                console.error("Error loading transactions:", error);
                data.transactions = [];
                app.updateAll();
            }
        },

        async loadUserSavingsGoals() {
            if (!state.isLoggedIn) {
                data.savingsGoals = [];
                ui.populateSavingsGoals();
                ui.updateTopGoalDisplay(); // Also update dashboard display
                return;
            }
            const uid = state.currentUser.uid;
            try {
                const snapshot = await db.collection('users').doc(uid).collection('savingsGoals').orderBy('name').get();
                data.savingsGoals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            } catch (error) {
                console.error("Error loading savings goals:", error);
                data.savingsGoals = [];
                ui.populateSavingsGoals();
            } finally {
                ui.populateSavingsGoals();
                ui.updateTopGoalDisplay();
            }
        },
        async handleGoalFormSubmit(e) {
            e.preventDefault();
            if (!state.isLoggedIn) return;

            const uid = state.currentUser.uid;
            const id = document.getElementById('goal-id').value;

            const goalData = {
                name: document.getElementById('goal-name').value,
                icon: document.getElementById('goal-icon').value,
                target: parseFloat(document.getElementById('goal-target').value) || 0,
                saved: parseFloat(document.getElementById('goal-saved').value) || 0,
            };

            if (goalData.saved > goalData.target) {
                goalData.saved = goalData.target;
            }

            const formButton = elements.goalForm.querySelector('button[type="submit"]');
            formButton.disabled = true;
            formButton.textContent = 'Saving...';

            try {
                const collectionRef = db.collection('users').doc(uid).collection('savingsGoals');
                if (id) {
                    await collectionRef.doc(id).update(goalData);
                } else {
                    await collectionRef.add(goalData);

                    // ADD THIS: Show recommendation to add budget category
                    if (data.monthlyBudget) {
                        const addToBudget = confirm(
                            `💡 Would you like to add "${goalData.name}" as a budget category to track spending towards this goal?`
                        );

                        if (addToBudget) {
                            // Suggest 10% of target as monthly budget
                            const suggestedAmount = (goalData.target * 0.1).toFixed(2);
                            const amount = prompt(
                                `How much do you want to budget monthly for "${goalData.name}"?`,
                                suggestedAmount
                            );

                            if (amount && parseFloat(amount) > 0) {
                                data.monthlyBudget.categories[goalData.name] = parseFloat(amount);
                                await app.saveBudget(data.monthlyBudget);
                                ui.createOrUpdateCharts();
                                app.updateBudgetDisplay();
                            }
                        }
                    }
                }
                await this.loadUserSavingsGoals();
                ui.hideModal(elements.goalModal);
            } catch (error) {
                console.error("Error saving goal:", error);
                alert("There was an error saving your goal.");
            } finally {
                formButton.disabled = false;
                formButton.textContent = 'Save Goal';
            }
        },


        // Transaction form submission handler.
        async handleTransactionFormSubmit(e) {
            e.preventDefault();
            if (!state.isLoggedIn) {
                ui.showAuthModal();
                return;
            }

            const uid = state.currentUser.uid;
            const formButton = elements.transactionForm.querySelector('button[type="submit"]');
            formButton.disabled = true;
            formButton.textContent = 'Saving...';

            const id = document.getElementById('transaction-id').value;
            const type = document.querySelector('input[name="transaction-type"]:checked').value;
            let amount = parseFloat(document.getElementById('transaction-amount').value);
            if (type === 'outflow') amount = -amount;

            const category = document.getElementById('transaction-cat').value;

            const transactionData = {
                date: document.getElementById('transaction-date').value,
                desc: document.getElementById('transaction-desc').value,
                cat: category,
                amount: amount,
            };

            try {
                if (id) {
                    await db.collection('users').doc(uid).collection('transactions').doc(id).update(transactionData);
                } else {
                    await db.collection('users').doc(uid).collection('transactions').add(transactionData);

                    // Check if this is a savings goal transaction
                    const matchingGoal = data.savingsGoals.find(g =>
                        category.toLowerCase().includes(g.name.toLowerCase())
                    );

                    if (matchingGoal && amount > 0) {
                        const updateGoal = confirm(
                            `💡 This looks like it's for your "${matchingGoal.name}" goal!\n\nWould you like to add $${amount.toFixed(2)} to your saved amount?`
                        );

                        if (updateGoal) {
                            const newSaved = Math.min(matchingGoal.saved + amount, matchingGoal.target);
                            await db.collection('users').doc(uid).collection('savingsGoals').doc(matchingGoal.id).update({
                                saved: newSaved
                            });
                            await app.loadUserSavingsGoals();
                        }
                    }

                    // Check budget warnings for outflows
                    if (amount < 0 && data.monthlyBudget) {
                        const budgetAmount = data.monthlyBudget.categories[category];
                        if (budgetAmount) {
                            const currentMonth = new Date().getMonth();
                            const currentYear = new Date().getFullYear();

                            const categorySpending = data.transactions
                                .filter(t => {
                                    const d = new Date(t.date);
                                    return t.cat === category &&
                                        t.amount < 0 &&
                                        d.getMonth() === currentMonth &&
                                        d.getFullYear() === currentYear;
                                })
                                .reduce((sum, t) => sum + Math.abs(t.amount), 0);

                            const newTotal = categorySpending + Math.abs(amount);
                            const percentage = (newTotal / budgetAmount) * 100;

                            if (percentage >= 100) {
                                alert(`⚠️ Warning: You've exceeded your budget for "${category}"!\n\nBudget: $${budgetAmount.toFixed(2)}\nSpent: $${newTotal.toFixed(2)}`);
                            } else if (percentage >= 80) {
                                alert(`⚠️ Heads up: You've used ${percentage.toFixed(0)}% of your "${category}" budget.`);
                            }
                        }
                    }
                }

                await app.loadUserTransactions();
                ui.hideModal(elements.transactionModal);
            } catch (error) {
                console.error("Error saving transaction: ", error);
                alert("There was an error saving your transaction.");
            } finally {
                formButton.disabled = false;
                formButton.textContent = 'Save Transaction';
            }
        },
        async confirmDelete() {
            if (!state.itemToDelete) {
                console.error("confirmDelete called with no item to delete.");
                ui.hideModal(elements.deleteConfirmModal);
                return;
            }

            const deleteButton = elements.confirmDeleteBtn;

            deleteButton.disabled = true;
            deleteButton.textContent = 'Deleting...';

            const { id, type } = state.itemToDelete;

            try {
                if (type === 'transaction') {
                    const uid = state.currentUser.uid;
                    await db.collection('users').doc(uid).collection('transactions').doc(id).delete();
                    await this.loadUserTransactions();
                } else if (type === 'goal') {
                    const uid = state.currentUser.uid;
                    await db.collection('users').doc(uid).collection('savingsGoals').doc(id).delete();
                    await this.loadUserSavingsGoals();
                } else if (type === 'article') {
                    // This is the new logic for deleting an article
                    if (!state.isAdmin) throw new Error("Admin access required.");
                    const response = await fetch(`/api/articles/${id}`, { method: 'DELETE' });
                    if (!response.ok) {
                        const err = await response.json();
                        throw new Error(err.error || 'Failed to delete article.');
                    }
                    // Reload the articles and re-render the admin view
                    await this.loadArticles(true);
                    ui.showArticlesTable();
                } else if (type === 'trivia') {
                    if (!state.isAdmin) throw new Error("Admin access required.");
                    const response = await fetch(`/api/trivia/${id}`, { method: 'DELETE' });
                    if (!response.ok) {
                        const err = await response.json();
                        throw new Error(err.error || 'Failed to delete trivia question.');
                    }
                    await this.loadTrivia(true); // Reload and render admin view
                    ui.showTriviaTable();
                }
            } catch (error) {
                console.error(`Error deleting ${type}:`, error);
                alert(`Could not delete the ${type}. Please try again.`);
            } finally {
                deleteButton.disabled = false;
                deleteButton.textContent = 'Delete';
                // This block runs whether the delete succeeded or failed.
                ui.hideModal(elements.deleteConfirmModal);
                state.itemToDelete = null; // Clear the state variable after the operation.
            }
        },
        // A single function to update all dynamic parts of the UI.
        updateAll() {
            ui.populateTransactions();
            ui.updateBalance();
            ui.createOrUpdateCharts();
            this.updateBudgetDisplay();
            ui.updateSmartAlerts(); // ADD THIS LINE
        },
        async handleChatbotSend() {
            const message = elements.chatbotInput.value.trim();
            if (!message) return;

            // --- Part 1: Update UI and local history with user's message ---

            // Add user message to our local history state
            state.chatHistory.push({ role: 'user', parts: [{ text: message }] });

            const userMessageHTML = `
        <div class="flex justify-end">
            <div class="bg-primary-accent text-white p-3 rounded-lg max-w-xs">
                ${message}
            </div>
        </div>`;
            elements.chatbotMessages.insertAdjacentHTML('beforeend', userMessageHTML);
            elements.chatbotInput.value = '';

            // Create a new container for the bot's response
            const botResponseContainer = document.createElement('div');
            botResponseContainer.className = 'flex justify-start';
            botResponseContainer.innerHTML = `<div class="bot-reply bg-gray-200 text-main-heading p-3 rounded-lg max-w-xs"><span class="typing-cursor"></span></div>`;
            elements.chatbotMessages.appendChild(botResponseContainer);

            // Scroll to show the latest messages
            elements.chatbotMessages.scrollTop = elements.chatbotMessages.scrollHeight;

            // --- Part 2: Fetch and process the stream with full history ---
            const botReplyBubble = botResponseContainer.querySelector('.bot-reply');
            let fullReply = ''; // Variable to accumulate the full response

            try {
                const userName = state.currentUser?.firestoreData?.name || "Friend";
                const response = await fetch('/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        // Send the entire history
                        history: state.chatHistory,
                        context: { name: userName, transactions: data.transactions, savingsGoals: data.savingsGoals, monthlyBudget: data.monthlyBudget }
                    })
                });

                if (!response.ok) throw new Error(`Server error: ${response.statusText}`);

                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let firstChunk = true;

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value);
                    fullReply += chunk; // Accumulate the response

                    if (firstChunk) {
                        botReplyBubble.innerHTML = ''; // Remove typing cursor
                        firstChunk = false;
                    }

                    botReplyBubble.innerHTML += chunk.replace(/\n/g, '<br>'); // Render newlines
                    elements.chatbotMessages.scrollTop = elements.chatbotMessages.scrollHeight;
                }

                // Add the complete AI response to our local history once streaming is done
                state.chatHistory.push({ role: 'model', parts: [{ text: fullReply }] });

            } catch (error) {
                console.error("Chatbot stream error:", error);
                botReplyBubble.innerHTML = `<span class="text-red-600">Error: ${error.message}</span>`;
                // We don't add the error to history
            } finally {
                elements.chatbotMessages.scrollTop = elements.chatbotMessages.scrollHeight;
            }
        },

        async loadArticles() {
            try {
                const response = await fetch('/api/articles');
                data.articles = await response.json();
                ui.populateArticles(); // Always update the main view
            } catch (error) {
                console.error("Failed to load articles:", error);
            }
        },

        async loadTrivia() {
            try {
                const response = await fetch('/api/trivia');
                data.triviaQuestions = await response.json();
            } catch (error) {
                console.error("Failed to load trivia:", error);
            }
        },

        async handleAdminLogin(e) {
            e.preventDefault();
            const password = document.getElementById('admin-password').value;
            elements.adminLoginError.classList.add('hidden');

            try {
                const response = await fetch('/admin/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password })
                });

                if (response.ok) {
                    state.isAdmin = true;
                    ui.renderAdminView();
                } else {
                    const err = await response.json();
                    elements.adminLoginError.textContent = err.error || "Login failed.";
                    elements.adminLoginError.classList.remove('hidden');
                }
            } catch (error) {
                elements.adminLoginError.textContent = "A network error occurred.";
                elements.adminLoginError.classList.remove('hidden');
            }
        },

        async handleArticleFormSubmit(e) {
            e.preventDefault();
            // Get a reference to the save button
            const saveButton = elements.articleForm.querySelector('button[type="submit"]');

            // --- 1. SET LOADING STATE ---
            // Disable the button to prevent multiple clicks
            saveButton.disabled = true;
            // Update button content to show a spinner and loading text
            saveButton.innerHTML = `
        <svg class="animate-spin h-5 w-5 mr-3 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" stroke-width="4" stroke-opacity="0.25"></circle>
            <path d="M12 2a10 10 0 0110 10" stroke-width="4" stroke-linecap="round"></path>
        </svg>
        Saving...`;
            const id = document.getElementById('article-id').value;
            const articleData = {
                title: document.getElementById('article-title').value,
                summary: document.getElementById('article-summary').value,
                content: document.getElementById('article-content').value,
            };

            const url = id ? `/api/articles/${id}` : '/api/articles';
            const method = id ? 'PUT' : 'POST';

            try {
                const response = await fetch(url, {
                    method: method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(articleData)
                });
                if (!response.ok) throw new Error('Failed to save article.');
                await this.loadArticles(true); // Reload and render admin view
                ui.showArticlesTable();
                ui.hideModal(elements.articleModal);
            } catch (error) {
                alert(error.message);
            } finally {
                // This 'finally' block runs whether the 'try' succeeded or failed.
                // Restore the original text
                saveButton.textContent = 'Save Article';
                // Re-enable the button
                saveButton.disabled = false;
            }
        },

        async handleTriviaFormSubmit(e) {
            e.preventDefault();
            const saveButton = elements.triviaForm.querySelector('button[type="submit"]');
            saveButton.disabled = true;
            saveButton.innerHTML = `<svg class="animate-spin h-5 w-5 mr-3 inline-block" ...></svg> Saving...`;

            const id = document.getElementById('trivia-id').value;
            const triviaData = {
                question: document.getElementById('trivia-question-text').value,
                options: [
                    document.getElementById('trivia-option-0').value,
                    document.getElementById('trivia-option-1').value,
                    document.getElementById('trivia-option-2').value,
                    document.getElementById('trivia-option-3').value,
                ],
                correct: parseInt(document.getElementById('trivia-correct-answer').value),
                explanation: document.getElementById('trivia-explanation').value,
            };

            const url = id ? `/api/trivia/${id}` : '/api/trivia';
            const method = id ? 'PUT' : 'POST';

            try {
                const response = await fetch(url, {
                    method: method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(triviaData)
                });
                if (!response.ok) throw new Error('Failed to save trivia question.');
                await this.loadTrivia(true); // Reload and render admin view
                ui.showTriviaTable();
                ui.hideModal(elements.triviaModal);
            } catch (error) {
                alert(error.message);
            } finally {
                saveButton.textContent = 'Save Question';
                saveButton.disabled = false;
            }
        },

        // Trivia Game Functions
        initTriviaGame() {
            const setupScreen = document.getElementById('trivia-setup');
            const gameScreen = document.getElementById('trivia-game');
            const resultsScreen = document.getElementById('trivia-results');

            // Show setup screen by default
            setupScreen.classList.remove('hidden');
            gameScreen.classList.add('hidden');
            resultsScreen.classList.add('hidden');
        },

        startTriviaGame(questionCount) {
            const totalQuestions = data.triviaQuestions.length;
            const correctlyAnswered = data.triviaProgress.answeredCorrectly;
            const wronglyAnswered = data.triviaProgress.answeredWrongly;

            // Available questions: unanswered + previously wrong answers
            const availableQuestions = data.triviaQuestions.filter(q =>
                !correctlyAnswered.has(q.id) || wronglyAnswered.has(q.id)
            );

            if (availableQuestions.length === 0) {
                alert('🎉 Congrats! You\'ve mastered all questions! Reset your progress to play again.');
                return;
            }

            // Select random questions
            const selectedQuestions = this.shuffleArray([...availableQuestions]).slice(0, Math.min(questionCount, availableQuestions.length));

            // Initialize session
            data.triviaProgress.currentSession = {
                questions: selectedQuestions,
                currentIndex: 0,
                score: 0,
                totalQuestions: selectedQuestions.length
            };

            // Show game screen
            document.getElementById('trivia-setup').classList.add('hidden');
            document.getElementById('trivia-game').classList.remove('hidden');
            document.getElementById('trivia-results').classList.add('hidden');

            this.displayCurrentQuestion();
        },

        shuffleArray(array) {
            const shuffled = [...array];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            return shuffled;
        },

        displayCurrentQuestion() {
            const session = data.triviaProgress.currentSession;
            const question = session.questions[session.currentIndex];

            if (!question) {
                this.showTriviaResults();
                return;
            }

            // Update progress
            document.getElementById('current-question-num').textContent = session.currentIndex + 1;
            document.getElementById('total-questions').textContent = session.totalQuestions;
            document.getElementById('current-score').textContent = session.score;

            const progressPercent = ((session.currentIndex) / session.totalQuestions) * 100;
            document.getElementById('progress-bar').style.width = `${progressPercent}%`;

            // Display question
            document.getElementById('trivia-question').textContent = question.question;

            // Display options
            const optionsContainer = document.getElementById('trivia-options');
            optionsContainer.innerHTML = question.options.map((option, index) => `
        <button class="trivia-option w-full text-left p-4 border-2 border-gray-300 rounded-xl hover:border-primary-accent hover:bg-green-50 transition-all duration-200 font-medium" data-index="${index}">
            <span class="mr-3 text-primary-accent font-bold">${String.fromCharCode(65 + index)})</span>
            ${option}
        </button>
    `).join('');

            // Hide feedback
            document.getElementById('trivia-feedback').classList.add('hidden');

            // Bind option clicks
            document.querySelectorAll('.trivia-option').forEach(btn => {
                btn.addEventListener('click', (e) => this.handleAnswerSelection(e, question));
            });
        },

        handleAnswerSelection(e, question) {
            const selectedIndex = parseInt(e.currentTarget.dataset.index);
            const isCorrect = selectedIndex === question.correct;
            const session = data.triviaProgress.currentSession;

            // Disable all options
            document.querySelectorAll('.trivia-option').forEach(btn => {
                btn.disabled = true;
                btn.classList.remove('hover:border-primary-accent', 'hover:bg-green-50');
            });

            // Highlight correct and incorrect answers
            document.querySelectorAll('.trivia-option').forEach((btn, index) => {
                if (index === question.correct) {
                    btn.classList.add('border-green-500', 'bg-green-100');
                } else if (index === selectedIndex && !isCorrect) {
                    btn.classList.add('border-red-500', 'bg-red-100');
                }
            });

            // Update score and progress
            if (isCorrect) {
                session.score++;
                data.triviaProgress.answeredCorrectly.add(question.id);
                data.triviaProgress.answeredWrongly.delete(question.id);
            } else {
                data.triviaProgress.answeredWrongly.add(question.id);
            }

            // Show feedback
            const feedbackContainer = document.getElementById('trivia-feedback');
            const feedbackText = document.getElementById('feedback-text');
            const correctAnswer = document.getElementById('correct-answer');

            if (isCorrect) {
                feedbackText.textContent = '🎉 Correct! Great job!';
                feedbackText.className = 'font-semibold mb-2 text-green-600';
                correctAnswer.textContent = '';
            } else {
                feedbackText.textContent = '❌ Not quite right, but you\'re learning!';
                feedbackText.className = 'font-semibold mb-2 text-red-600';
                correctAnswer.textContent = `💡 Correct answer: ${question.options[question.correct]}. ${question.explanation}`;
            }

            feedbackContainer.classList.remove('hidden');

            // Update current score display
            document.getElementById('current-score').textContent = session.score;
        },

        nextQuestion() {
            const session = data.triviaProgress.currentSession;
            session.currentIndex++;

            if (session.currentIndex >= session.totalQuestions) {
                this.showTriviaResults();
            } else {
                this.displayCurrentQuestion();
            }
        },

        showTriviaResults() {
            const session = data.triviaProgress.currentSession;
            const percentage = Math.round((session.score / session.totalQuestions) * 100);

            // Hide game screen, show results
            document.getElementById('trivia-game').classList.add('hidden');
            document.getElementById('trivia-results').classList.remove('hidden');

            // Update results display
            document.getElementById('final-score').textContent = `${session.score}/${session.totalQuestions}`;
            document.getElementById('score-percentage').textContent = `${percentage}%`;

            // Dynamic emoji and title based on performance
            const resultsEmoji = document.getElementById('results-emoji');
            const resultsTitle = document.getElementById('results-title');

            if (percentage >= 90) {
                resultsEmoji.textContent = '🏆';
                resultsTitle.textContent = 'Money Master!';
            } else if (percentage >= 70) {
                resultsEmoji.textContent = '🎉';
                resultsTitle.textContent = 'Well Done!';
            } else if (percentage >= 50) {
                resultsEmoji.textContent = '👍';
                resultsTitle.textContent = 'Not Bad!';
            } else {
                resultsEmoji.textContent = '📚';
                resultsTitle.textContent = 'Keep Learning!';
            }
        },

        resetTriviaProgress() {
            if (confirm('Are you sure you want to reset all your trivia progress? This will allow you to see all questions again.')) {
                data.triviaProgress.answeredCorrectly.clear();
                data.triviaProgress.answeredWrongly.clear();
                data.triviaProgress.currentSession = {
                    questions: [],
                    currentIndex: 0,
                    score: 0,
                    totalQuestions: 0
                };
                this.initTriviaGame();
            }
        },


        // Centralized event listener setup.
        bindEvents() {
            // Navigation
            elements.navLinks.forEach(link => link.addEventListener('click', (e) => { e.preventDefault(); app.navigateTo(e.currentTarget.getAttribute('href')); }));
            window.addEventListener('hashchange', () => app.navigateTo(window.location.hash || '#dashboard'));
            elements.menuButton.addEventListener('click', () => {
                elements.sidebar.classList.toggle('-translate-x-full');
                elements.sidebarOverlay.style.display = 'block';
                document.body.classList.add('sidebar-open');
            });
            elements.sidebarOverlay.addEventListener('click', () => {
                elements.sidebar.classList.add('-translate-x-full');
                elements.sidebarOverlay.style.display = 'none';
                document.body.classList.remove('sidebar-open');
            });
            elements.viewAllGoalsButton.addEventListener('click', () => app.navigateTo('#savings'));

            // Modals
            elements.closeAuthButton.addEventListener('click', () => ui.hideModal(elements.authModal));
            elements.closeTransactionButton.addEventListener('click', () => ui.hideModal(elements.transactionModal));
            elements.closeChatbotButton.addEventListener('click', () => ui.hideModal(elements.chatbotModal));
            elements.cancelDeleteBtn.addEventListener('click', () => ui.hideModal(elements.deleteConfirmModal));
            elements.chatbotSend.addEventListener('click', () => app.handleChatbotSend());
            elements.chatbotInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    app.handleChatbotSend();
                }
            });

            // Authentication
            elements.headerAuthButton.addEventListener('click', ui.showAuthModal);
            elements.toggleAuthButton.addEventListener('click', () => elements.loginForm.classList.contains('hidden') ? ui.showLoginPage() : ui.showSignupPage());
            elements.loginForm.addEventListener('submit', app.handleLogin); // Connect to new async function
            elements.signupForm.addEventListener('submit', app.handleSignup); // Connect to new async function
            elements.dropdownLogoutButton.addEventListener('click', app.handleLogout);
            elements.userDropdownButton.addEventListener('click', (e) => {
                e.stopPropagation();
                elements.userDropdownMenu.classList.toggle('hidden');
            });
            document.addEventListener('click', (e) => {
                if (!elements.userDropdownContainer.contains(e.target)) {
                    elements.userDropdownMenu.classList.add('hidden');
                }
            });
            elements.closeAuthButton.addEventListener('click', () => ui.hideModal(elements.authModal));

            // Transactions
            elements.addTransactionButton.addEventListener('click', () => ui.showTransactionModal());
            elements.dashboardAddTransactionButton.addEventListener('click', () => ui.showTransactionModal());
            elements.transactionForm.addEventListener('submit', app.handleTransactionFormSubmit);
            elements.confirmDeleteBtn.addEventListener('click', app.confirmDelete.bind(app));
            elements.transactionTableBody.addEventListener('click', (e) => {
                const target = e.target.closest('button');
                if (!target) return;
                const id = target.dataset.id;
                if (target.classList.contains('edit-btn')) {
                    ui.showTransactionModal(data.transactions.find(t => t.id == id));
                } else if (target.classList.contains('delete-btn')) {
                    ui.showDeleteConfirmModal(id, 'transaction');
                }
            });

            // Savings Goals
            document.getElementById('dashboard-page').addEventListener('click', (e) => {
                if (e.target.classList.contains('view-all-goals-link')) {
                    e.preventDefault();

                    app.navigateTo('#savings').then(() => {
                        elements.addGoalButton.click();
                    });
                }
            });
            elements.viewAllGoalsButton.addEventListener('click', () => app.navigateTo('#savings'));
            elements.closeGoalButton.addEventListener('click', () => ui.hideModal(elements.goalModal));
            elements.addGoalButton.addEventListener('click', () => ui.showGoalModal());
            elements.goalForm.addEventListener('submit', (e) => app.handleGoalFormSubmit(e));

            // Event delegation for dynamically created goal buttons
            elements.savingsGoalsContainer.addEventListener('click', (e) => {
                const target = e.target.closest('button');
                if (!target) return;

                const id = target.dataset.id;
                const goal = data.savingsGoals.find(g => g.id === id);

                if (target.classList.contains('edit-goal-btn') && goal) {
                    ui.showGoalModal(goal);
                } else if (target.classList.contains('delete-goal-btn')) {
                    ui.showDeleteConfirmModal(id, 'goal');
                }
            });

            // Learn & Play
            elements.chatbotButton.addEventListener('click', () => ui.showChatBotModal());
            elements.chatbotSend.addEventListener('click', () => app.handleChatbotSend());
            elements.chatbotInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault(); // Prevents form submission or new lines
                    app.handleChatbotSend();
                }
            });
            elements.learnTabButtons.forEach(button => button.addEventListener('click', () => app.navigateTo('#learn', button.dataset.tabTarget)));
            elements.exploreArticlesButton.addEventListener('click', () => app.navigateTo('#learn', 'articles-tab-content'));
            elements.exploreTriviaButton.addEventListener('click', () => app.navigateTo('#learn', 'trivia-tab-content'));
            elements.backToArticlesButton.addEventListener('click', () => app.navigateTo('#learn', 'articles-tab-content'));
            document.getElementById('articles-container').addEventListener('click', (e) => {
                const articleCard = e.target.closest('[data-article-id]');
                if (articleCard) app.showArticle(articleCard.dataset.articleId);
            });
            // Trivia Game Events
            document.querySelectorAll('.question-count-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const count = parseInt(e.target.dataset.count);
                    app.startTriviaGame(count);
                });
            });

            document.getElementById('back-to-setup').addEventListener('click', () => {
                app.initTriviaGame();
            });

            document.getElementById('next-question-btn').addEventListener('click', () => {
                app.nextQuestion();
            });

            document.getElementById('play-again-btn').addEventListener('click', () => {
                const lastQuestionCount = data.triviaProgress.currentSession.totalQuestions;
                app.startTriviaGame(lastQuestionCount);
            });

            document.getElementById('back-to-setup-btn').addEventListener('click', () => {
                app.initTriviaGame();
            });

            document.getElementById('reset-progress-btn').addEventListener('click', () => {
                app.resetTriviaProgress();
            });

            // Budget Management Events
            document.getElementById('create-first-budget-button').addEventListener('click', () => {
                app.resetBudgetModal();
                ui.showModal(document.getElementById('budget-modal'));
            });

            document.getElementById('manage-budget-button').addEventListener('click', () => {
                if (data.monthlyBudget) {
                    app.showEditBudgetMode();
                } else {
                    app.resetBudgetModal();
                }
                ui.showModal(document.getElementById('budget-modal'));
            });

            document.getElementById('close-budget-button').addEventListener('click', () => {
                ui.hideModal(document.getElementById('budget-modal'));
            });

            // Admin Panel & Article Management
            elements.adminLoginForm.addEventListener('submit', (e) => app.handleAdminLogin(e));
            elements.addArticleButton.addEventListener('click', () => ui.showArticleModal());
            elements.closeArticleModal.addEventListener('click', () => ui.hideModal(elements.articleModal));
            elements.articleForm.addEventListener('submit', (e) => app.handleArticleFormSubmit(e));

            elements.adminArticlesTableBody.addEventListener('click', (e) => {
                const target = e.target;
                const articleId = target.dataset.id;
                if (target.classList.contains('edit-article-btn')) {
                    const article = data.articles.find(a => a.id === articleId);
                    if (article) ui.showArticleModal(article);
                } else if (target.classList.contains('delete-article-btn')) {
                    ui.showDeleteConfirmModal(articleId, 'article');
                }
                app.showAdminView('articles');
            });
            // --- Trivia Admin Events ---
            elements.adminViewToggleButtons.forEach(btn => {
                btn.addEventListener('click', () => app.showAdminView(btn.dataset.view));
            });
            elements.addTriviaButton.addEventListener('click', () => ui.showTriviaModal());
            elements.closeTriviaModal.addEventListener('click', () => ui.hideModal(elements.triviaModal));
            elements.triviaForm.addEventListener('submit', (e) => app.handleTriviaFormSubmit(e));

            elements.adminTriviaTableBody.addEventListener('click', (e) => {
                const target = e.target;
                const triviaId = target.dataset.id;
                if (target.classList.contains('edit-trivia-btn')) {
                    const question = data.triviaQuestions.find(q => q.id === triviaId);
                    if (question) ui.showTriviaModal(question);
                } else if (target.classList.contains('delete-trivia-btn')) {
                    ui.showDeleteConfirmModal(triviaId, 'trivia');
                }
            });
        },

        // Initial application setup.
        async init() {
            app.bindEvents();
            app.initializeBudgetModal();
            await app.loadArticles();  // ADD await
            await app.loadTrivia();    // ADD await
            ui.populateSavingsGoals();
            ui.populateArticles();
            app.updateAll();
            app.initTriviaGame();
            if (!auth.currentUser) {
                app.navigateTo(window.location.hash || '#dashboard');
            }
        },

        // Budget Management Functions
        async loadUserBudget() {
            if (!state.isLoggedIn) {
                data.monthlyBudget = null;
                this.updateBudgetDisplay();
                return;
            }

            const uid = state.currentUser.uid;
            const now = new Date();
            const monthKey = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;

            try {
                const budgetDoc = await db.collection('users').doc(uid).collection('budgets').doc(monthKey).get();
                if (budgetDoc.exists) {
                    data.monthlyBudget = { id: budgetDoc.id, ...budgetDoc.data() };
                } else {
                    data.monthlyBudget = null;
                }
            } catch (error) {
                console.error("Error loading budget:", error);
                data.monthlyBudget = null;
            } finally {
                this.updateBudgetDisplay();
            }
        },

        async saveBudget(budgetData) {
            if (!state.isLoggedIn) return;

            const uid = state.currentUser.uid;
            const now = new Date();
            const monthKey = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;

            try {
                await db.collection('users').doc(uid).collection('budgets').doc(monthKey).set({
                    ...budgetData,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    month: monthKey
                });
                await this.loadUserBudget();
            } catch (error) {
                console.error("Error saving budget:", error);
                throw error;
            }
        },

        async deleteBudget() {
            if (!state.isLoggedIn || !data.monthlyBudget) return;

            const uid = state.currentUser.uid;
            const now = new Date();
            const monthKey = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;

            try {
                await db.collection('users').doc(uid).collection('budgets').doc(monthKey).delete();
                data.monthlyBudget = null;
                this.updateBudgetDisplay();
            } catch (error) {
                console.error("Error deleting budget:", error);
                throw error;
            }
        },

        updateBudgetDisplay() {
            const noBudgetState = document.getElementById('no-budget-state');
            const budgetOverview = document.getElementById('budget-overview');

            if (!data.monthlyBudget) {
                noBudgetState.classList.remove('hidden');
                budgetOverview.classList.add('hidden');
                return;
            }

            noBudgetState.classList.add('hidden');
            budgetOverview.classList.remove('hidden');

            // Calculate spending by category
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();

            const spending = data.transactions
                .filter(t => {
                    const d = new Date(t.date);
                    return t.amount < 0 && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
                })
                .reduce((acc, t) => {
                    acc[t.cat] = (acc[t.cat] || 0) + Math.abs(t.amount);
                    return acc;
                }, {});

            const totalBudget = Object.values(data.monthlyBudget.categories).reduce((sum, amount) => sum + amount, 0);
            const totalSpent = Object.values(spending).reduce((sum, amount) => sum + amount, 0);
            const spentPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

            // Update display elements
            document.getElementById('total-budget-amount').textContent = formatCurrency(totalBudget);
            document.getElementById('total-spent-amount').textContent = formatCurrency(totalSpent);

            const progressBar = document.getElementById('overall-budget-progress');
            const statusText = document.getElementById('budget-status-text');

            // Set progress bar width and color
            progressBar.style.width = `${Math.min(spentPercentage, 100)}%`;

            if (spentPercentage >= 100) {
                progressBar.className = 'bg-red-500 h-3 rounded-full transition-all duration-500';
                statusText.textContent = 'Over budget';
                statusText.className = 'text-center text-sm font-medium text-red-500';
            } else if (spentPercentage >= 80) {
                progressBar.className = 'bg-orange-500 h-3 rounded-full transition-all duration-500';
                statusText.textContent = 'Near budget limit';
                statusText.className = 'text-center text-sm font-medium text-orange-500';
            } else {
                progressBar.className = 'bg-primary-accent h-3 rounded-full transition-all duration-500';
                statusText.textContent = 'On track';
                statusText.className = 'text-center text-sm font-medium text-primary-accent';
            }
        },

        initializeBudgetModal() {
            let selectedMethod = null;
            let currentStep = 1;

            // Method selection
            document.querySelectorAll('.budget-method-card').forEach(card => {
                card.addEventListener('click', () => {
                    document.querySelectorAll('.budget-method-card').forEach(c =>
                        c.classList.remove('border-primary-accent', 'bg-green-50'));
                    card.classList.add('border-primary-accent', 'bg-green-50');
                    selectedMethod = card.dataset.method;
                    document.getElementById('next-to-step-2').disabled = false;
                    document.getElementById('next-to-step-2').classList.remove('opacity-50', 'cursor-not-allowed');
                });
            });

            // Step navigation
            document.getElementById('next-to-step-2').addEventListener('click', () => {
                if (selectedMethod) {
                    document.getElementById('budget-step-1').classList.add('hidden');
                    document.getElementById('budget-step-2').classList.remove('hidden');
                    currentStep = 2;
                }
            });

            document.getElementById('back-to-step-1').addEventListener('click', () => {
                document.getElementById('budget-step-2').classList.add('hidden');
                document.getElementById('budget-step-1').classList.remove('hidden');
                currentStep = 1;
            });

            document.getElementById('next-to-step-3').addEventListener('click', () => {
                document.getElementById('budget-step-2').classList.add('hidden');
                document.getElementById('budget-step-3').classList.remove('hidden');
                currentStep = 3;
                this.setupCategoriesStep(selectedMethod);
            });

            document.getElementById('back-to-step-2').addEventListener('click', () => {
                document.getElementById('budget-step-3').classList.add('hidden');
                document.getElementById('budget-step-2').classList.remove('hidden');
                currentStep = 2;
            });

            // Income calculation
            document.getElementById('monthly-income').addEventListener('input', (e) => {
                const income = parseFloat(e.target.value) || 0;
                const nextBtn = document.getElementById('next-to-step-3');

                if (income > 0) {
                    nextBtn.disabled = false;
                    nextBtn.classList.remove('opacity-50', 'cursor-not-allowed');

                    if (selectedMethod === '50-30-20') {
                        document.getElementById('income-breakdown').classList.remove('hidden');
                        document.getElementById('needs-amount').textContent = formatCurrency(income * 0.5);
                        document.getElementById('wants-amount').textContent = formatCurrency(income * 0.3);
                        document.getElementById('savings-amount').textContent = formatCurrency(income * 0.2);
                    }
                } else {
                    nextBtn.disabled = true;
                    nextBtn.classList.add('opacity-50', 'cursor-not-allowed');
                    document.getElementById('income-breakdown').classList.add('hidden');
                }
            });

            // Save budget
            document.getElementById('save-budget').addEventListener('click', async () => {
                await this.handleBudgetSave(selectedMethod);
            });

            // Update budget
            document.getElementById('update-budget').addEventListener('click', async () => {
                await this.handleBudgetUpdate();
            });

            // Delete budget
            document.getElementById('delete-budget').addEventListener('click', async () => {
                if (confirm('Are you sure you want to delete this budget? This action cannot be undone.')) {
                    try {
                        await this.deleteBudget();
                        ui.hideModal(document.getElementById('budget-modal'));
                    } catch (error) {
                        alert('Error deleting budget. Please try again.');
                    }
                }
            });
        },

        setupCategoriesStep(method) {
            // Reset the flag first
            data.includeSavingsGoalsInBudget = false;

            // Show savings goals suggestion BEFORE populating categories
            if (data.savingsGoals.length > 0) {
                const goalNames = data.savingsGoals.map(g => g.name).join(', ');
                const addGoals = confirm(
                    `💡 You have savings goals: ${goalNames}\n\nWould you like to include these in your budget?`
                );

                if (addGoals) {
                    data.includeSavingsGoalsInBudget = true;
                }
            }

            // NOW populate based on method
            if (method === '50-30-20') {
                document.getElementById('rule-categories').classList.remove('hidden');
                document.getElementById('custom-categories').classList.add('hidden');
                this.populate50302Categories();
            } else {
                document.getElementById('rule-categories').classList.add('hidden');
                document.getElementById('custom-categories').classList.remove('hidden');
                this.populateCustomCategories();
            }
        },

        populate50302Categories() {
            const income = parseFloat(document.getElementById('monthly-income').value) || 0;

            const categoryTypes = {
                needs: { amount: income * 0.5, container: 'needs-categories' },
                wants: { amount: income * 0.3, container: 'wants-categories' },
                savings: { amount: income * 0.2, container: 'savings-categories' }
            };

            Object.entries(categoryTypes).forEach(([type, config]) => {
                const container = document.getElementById(config.container);
                let categories = [...data.budgetCategories[type]];

                // Add savings goals to savings category
                if (type === 'savings' && data.includeSavingsGoalsInBudget) {
                    data.savingsGoals.forEach(goal => {
                        categories.push(goal.name);
                    });
                }

                const amountPerCategory = config.amount / categories.length;

                container.innerHTML = categories.map(category => `
            <div class="flex items-center gap-2">
                <input type="text" value="${category}" class="flex-1 p-2 border border-gray-300 rounded category-name" readonly>
                <input type="number" value="${amountPerCategory.toFixed(2)}" step="0.01" min="0" class="w-24 p-2 border border-gray-300 rounded category-amount">
                <button class="remove-category text-red-500 hover:text-red-700">&times;</button>
            </div>
        `).join('');
            });

            this.bindCategoryEvents();
        },

        populateCustomCategories() {
            const container = document.getElementById('custom-categories-container');

            // Start with one empty row
            let initialHTML = `
        <div class="flex items-center gap-2">
           <input type="text" placeholder="Category name" class="flex-1 p-2 text-sm border border-gray-300 rounded category-name">
<input type="number" placeholder="Amount" step="0.01" min="0" class="w-20 md:w-24 p-2 text-sm border border-gray-300 rounded category-amount"> <button class="remove-category text-red-500 hover:text-red-700">&times;</button>
        </div>
    `;

            // Add savings goals if the flag is set
            if (data.includeSavingsGoalsInBudget && data.savingsGoals.length > 0) {
                const income = parseFloat(document.getElementById('monthly-income').value) || 0;
                const suggestedAmountPerGoal = income > 0 ? (income * 0.15) / data.savingsGoals.length : 50;

                data.savingsGoals.forEach(goal => {
                    initialHTML += `
                <div class="flex items-center gap-2">
                    <input type="text" value="${goal.name}" class="flex-1 p-2 border border-gray-300 rounded category-name">
                    <input type="number" value="${suggestedAmountPerGoal.toFixed(2)}" step="0.01" min="0" class="w-24 p-2 border border-gray-300 rounded category-amount">
                    <button class="remove-category text-red-500 hover:text-red-700">&times;</button>
                </div>
            `;
                });
            }

            container.innerHTML = initialHTML;

            document.getElementById('add-custom-category').addEventListener('click', () => {
                const newRow = document.createElement('div');
                newRow.className = 'flex items-center gap-2';
                newRow.innerHTML = `
           <input type="text" placeholder="Category name" class="flex-1 p-2 text-sm border border-gray-300 rounded category-name">
<input type="number" placeholder="Amount" step="0.01" min="0" class="w-20 md:w-24 p-2 text-sm border border-gray-300 rounded category-amount">  <button class="remove-category text-red-500 hover:text-red-700">&times;</button>
        `;
                container.appendChild(newRow);
                this.bindCategoryEvents();
            });

            this.bindCategoryEvents();
        },
        bindCategoryEvents() {
            document.querySelectorAll('.remove-category').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.target.closest('.flex').remove();
                });
            });

            document.querySelectorAll('.add-category-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const type = e.target.dataset.type;
                    const container = document.getElementById(`${type}-categories`);
                    const newRow = document.createElement('div');
                    newRow.className = 'flex items-center gap-2';
                    newRow.innerHTML = `
               <input type="text" placeholder="Category name" class="flex-1 p-2 text-sm border border-gray-300 rounded category-name">
<input type="number" placeholder="Amount" step="0.01" min="0" class="w-20 md:w-24 p-2 text-sm border border-gray-300 rounded category-amount">
<button class="remove-category text-red-500 hover:text-red-700">&times;</button>
            `;
                    container.appendChild(newRow);
                    this.bindCategoryEvents();
                });
            });
        },

        async handleBudgetSave(method) {
            const categories = {};

            // Collect all category data
            document.querySelectorAll('.category-name').forEach((nameInput, index) => {
                const amountInput = document.querySelectorAll('.category-amount')[index];
                const name = nameInput.value.trim();
                const amount = parseFloat(amountInput.value) || 0;

                if (name && amount > 0) {
                    categories[name] = amount;
                }
            });

            if (Object.keys(categories).length === 0) {
                alert('Please add at least one category with an amount greater than 0.');
                return;
            }

            const budgetData = {
                method,
                monthlyIncome: parseFloat(document.getElementById('monthly-income').value) || 0,
                categories,
                totalBudget: Object.values(categories).reduce((sum, amount) => sum + amount, 0)
            };

            try {
                const saveBtn = document.getElementById('save-budget');
                saveBtn.disabled = true;
                saveBtn.textContent = 'Saving...';

                await this.saveBudget(budgetData);
                ui.hideModal(document.getElementById('budget-modal'));
                this.resetBudgetModal();
            } catch (error) {
                alert('Error saving budget. Please try again.');
            } finally {
                const saveBtn = document.getElementById('save-budget');
                saveBtn.disabled = false;
                saveBtn.textContent = 'Save Budget';
            }
        },

        async handleBudgetUpdate() {
            const categories = {};

            document.querySelectorAll('#edit-categories-container .category-row').forEach(row => {
                const nameInput = row.querySelector('.category-name');
                const amountInput = row.querySelector('.category-amount');
                const name = nameInput.value.trim();
                const amount = parseFloat(amountInput.value) || 0;

                if (name && amount > 0) {
                    categories[name] = amount;
                }
            });

            if (Object.keys(categories).length === 0) {
                alert('Please add at least one category with an amount greater than 0.');
                return;
            }

            const budgetData = {
                ...data.monthlyBudget,
                categories,
                totalBudget: Object.values(categories).reduce((sum, amount) => sum + amount, 0)
            };

            try {
                const updateBtn = document.getElementById('update-budget');
                updateBtn.disabled = true;
                updateBtn.textContent = 'Updating...';

                await this.saveBudget(budgetData);
                ui.hideModal(document.getElementById('budget-modal'));
            } catch (error) {
                alert('Error updating budget. Please try again.');
            } finally {
                const updateBtn = document.getElementById('update-budget');
                updateBtn.disabled = false;
                updateBtn.textContent = 'Update Budget';
            }
        },

        resetBudgetModal() {
            // Reset all steps
            document.getElementById('budget-step-1').classList.remove('hidden');
            document.getElementById('budget-step-2').classList.add('hidden');
            document.getElementById('budget-step-3').classList.add('hidden');
            document.getElementById('budget-edit-mode').classList.add('hidden');

            // Reset form data
            document.querySelectorAll('.budget-method-card').forEach(card => {
                card.classList.remove('border-primary-accent', 'bg-green-50');
            });

            document.getElementById('monthly-income').value = '';
            document.getElementById('income-breakdown').classList.add('hidden');
            document.getElementById('next-to-step-2').disabled = true;
            document.getElementById('next-to-step-2').classList.add('opacity-50', 'cursor-not-allowed');
            document.getElementById('next-to-step-3').disabled = true;
            document.getElementById('next-to-step-3').classList.add('opacity-50', 'cursor-not-allowed');
        },

        showEditBudgetMode() {
            if (!data.monthlyBudget) return;

            // Hide setup steps, show edit mode
            document.getElementById('budget-step-1').classList.add('hidden');
            document.getElementById('budget-step-2').classList.add('hidden');
            document.getElementById('budget-step-3').classList.add('hidden');
            document.getElementById('budget-edit-mode').classList.remove('hidden');

            // Populate edit form with current budget
            const container = document.getElementById('edit-categories-container');
            container.innerHTML = Object.entries(data.monthlyBudget.categories).map(([name, amount]) => `
        <div class="category-row flex items-center gap-2">
            <input type="text" value="${name}" class="flex-1 p-2 border border-gray-300 rounded category-name">
            <input type="number" value="${amount}" step="0.01" min="0" class="w-24 p-2 border border-gray-300 rounded category-amount">
            <button class="remove-category text-red-500 hover:text-red-700">&times;</button>
        </div>
    `).join('');

            // Add new category button
            const addButton = document.createElement('button');
            addButton.className = 'text-primary-accent hover:underline mt-2';
            addButton.textContent = '+ Add Category';
            addButton.addEventListener('click', () => {
                const newRow = document.createElement('div');
                newRow.className = 'category-row flex items-center gap-2';
                newRow.innerHTML = `
           <input type="text" placeholder="Category name" class="flex-1 p-2 text-sm border border-gray-300 rounded category-name">
<input type="number" placeholder="Amount" step="0.01" min="0" class="w-20 md:w-24 p-2 text-sm border border-gray-300 rounded category-amount">
 <button class="remove-category text-red-500 hover:text-red-700">&times;</button>
        `;
                container.appendChild(newRow);
                this.bindEditCategoryEvents();
            });
            container.appendChild(addButton);

            this.bindEditCategoryEvents();
        },

        bindEditCategoryEvents() {
            document.querySelectorAll('#edit-categories-container .remove-category').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.target.closest('.category-row').remove();
                });
            });
        }
    };

    auth.onAuthStateChanged(async (user) => {
        try {
            if (user) {
                state.isLoggedIn = true;
                state.currentUser = { uid: user.uid, email: user.email };

                // IMPORTANT: Fetch Firestore data FIRST before updating UI
                state.currentUser.firestoreData = await app.fetchUserData(user.uid);

                // NOW update the header with the correct user data
                ui.updateHeaderForAuthState(state.currentUser);
                ui.updateTransactionControls(state.isLoggedIn);

                // Load all user-specific data in parallel
                await Promise.all([
                    app.loadUserTransactions(),
                    app.loadUserSavingsGoals(),
                    app.loadUserBudget()
                ]);

                // Force a complete UI refresh
                app.updateAll();

            } else {
                state.isLoggedIn = false;
                state.currentUser = null;

                // Clear all data
                await Promise.all([
                    app.loadUserTransactions(),
                    app.loadUserSavingsGoals(),
                    app.loadUserBudget()
                ]);

                // Update UI for logged out state
                ui.updateHeaderForAuthState(null);
                ui.updateTransactionControls(state.isLoggedIn);
            }
        } catch (error) {
            console.error("Error during auth state processing:", error);
            alert('Error loading your data. Please refresh the page.');
        } finally {
            ui.hideGlobalLoader();
        }
    });

    // --- Start the App ---
    app.init();
});