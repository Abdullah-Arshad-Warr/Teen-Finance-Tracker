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
        transactionIdToDelete: null,
        charts: {
            budgetDoughnut: null,
            spendingPie: null,
            incomeSources: null, // <-- ADDED
        }
    };

    // --- All data for the application is stored here. ---
    const data = {
        transactions: [], // Firestore will now populate this.,
        savingsGoals: [
            { name: 'New Gaming Phone', target: 500, saved: 325, icon: '📱' },
            { name: 'Concert Tickets', target: 150, saved: 50, icon: '🎟️' },
            { name: 'Summer Trip Fund', target: 300, saved: 280, icon: '✈️' },
        ],
        articles: [
            {
                id: 'credit-score',
                title: "What is a Credit Score?",
                summary: "Learn why this three-digit number is so important for your financial future.",
                content: `<p class="mb-4">A credit score is a three-digit number that lenders use to decide how likely you are to pay back borrowed money. This score typically ranges from 300 to 850, with higher scores indicating a lower risk to lenders.</p><p class="mb-4">Why is it important? A good credit score can help you:</p><ul class="list-disc list-inside mb-4"><li>Get approved for loans and credit cards.</li><li>Qualify for lower interest rates on loans (like car loans or mortgages).</li><li>Rent an apartment (landlords often check credit).</li><li>Even get better rates on insurance.</li></ul><p class="mb-4">Your credit score is primarily built on your payment history, the amount of debt you have, the length of your credit history, new credit, and credit mix. Paying bills on time and keeping credit card balances low are key to building a strong score.</p><p>Starting early to understand and build good credit habits is crucial for your long-term financial health.</p>`
            },
            {
                id: 'investing-100',
                title: "Investing 101 for Teens",
                summary: "A simple guide to making your money grow over time.",
                content: `<p class="mb-4">Investing might sound complicated, but it's really just putting your money to work so it can grow over time. For teens, starting early can give you a huge advantage thanks to something called "compound interest" (more on that in another article!).</p><p class="mb-4">Some simple ways teens can start exploring investing include:</p><ul class="list-disc list-inside mb-4"><li><strong>Savings Accounts:</strong> While not high-growth, they're safe and teach you about interest.</li><li><strong>Custodial Accounts:</strong> An adult sets up an investment account in your name. This lets you own investments like stocks and bonds.</li><li><strong>Mutual Funds/ETFs:</strong> These are like baskets of different investments, making it easy to diversify without picking individual stocks.</li></ul><p class="mb-4">The golden rule of investing is to start small, invest regularly, and be patient. Don't put all your eggs in one basket, and always do your research before putting your money into anything.</p><p>Learning about investing now can set you up for significant wealth building in the future.</p>`
            },
            {
                id: 'compound-interest',
                title: "The Power of Compound Interest",
                summary: "Discover the 'eighth wonder of the world' and how it can make you rich.",
                content: `<p class="mb-4">Albert Einstein reportedly called compound interest the "eighth wonder of the world." So, what is it?</p><p class="mb-4"><strong>Compound interest is interest on interest.</strong> It means that the interest you earn on your initial investment also starts earning interest. This creates an accelerating growth effect, especially over long periods.</p><p class="mb-4">Let's say you invest $100 and earn 10% interest. After one year, you have $110. In the second year, you don't just earn interest on the original $100; you earn it on the new total of $110. So, you earn $11, making your total $121. This might seem small, but over decades, it can turn modest savings into substantial wealth.</p><p class="mb-4">The key takeaways for teens:</p><ul class="list-disc list-inside mb-4"><li><strong>Start Early:</strong> The longer your money has to compound, the more it grows.</li><li><strong>Invest Regularly:</strong> Even small, consistent contributions add up significantly.</li></ul><p>Compound interest is a powerful tool for building wealth, and the earlier you harness it, the greater its magic will be.</p>`
            },
        ],
        badges: [
            { name: 'Budget Boss', icon: '👑' },
            { name: 'Savings Starter', icon: '🌱' },
            { name: 'Money Logger', icon: '✍️' },
            { name: 'Trivia Whiz', icon: '🧠' },
        ]
    };

    // --- DOM Element Cache ---
    // Caching all DOM elements we need to interact with for performance.
    const elements = {
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
        userLevelXp: document.getElementById('user-level-xp'),

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

        //Profile Displat
        userNameElement: document.getElementById('user-name'),
        userAvatarInitial: document.getElementById('user-avatar-initial'),
        userInfoContainer: document.getElementById('user-info-container'),
        authLoadingSpinner: document.getElementById('auth-loading-spinner'),
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
            ui.showModal(elements.transactionModal);
        },

        showDeleteConfirmModal(id) {
            state.transactionIdToDelete = id;
            ui.showModal(elements.deleteConfirmModal);
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

        updateHeaderForAuthState(user) {
            if (user && user.firestoreData) {
                // Logged In State
                const { name, level, xp } = user.firestoreData;
                elements.userNameElement.textContent = name || 'User';
                elements.userLevelXp.textContent = `Level ${level} | ${xp} XP`;
                elements.userAvatarInitial.textContent = name?.trim().charAt(0).toUpperCase() || '?';

                elements.authLoadingSpinner.classList.add('hidden');
                elements.headerAuthButton.classList.add('hidden');
                elements.userInfoContainer.classList.remove('hidden');
                elements.userInfoContainer.classList.add('flex');
                elements.logoutButton.classList.remove('hidden');

            } else {
                // Logged Out State
                elements.authLoadingSpinner.classList.add('hidden');
                elements.userInfoContainer.classList.add('hidden');
                elements.logoutButton.classList.add('hidden');
                elements.headerAuthButton.classList.remove('hidden');
            }
        },

        updateTransactionControls(isLoggedIn) {
            const displayStyle = isLoggedIn ? 'flex' : 'none';
            elements.addTransactionButton.style.display = displayStyle;
            elements.dashboardAddTransactionButton.style.display = isLoggedIn ? 'block' : 'none';
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
                        <td class="p-2 font-medium">${tx.desc}</td>
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
        createOrUpdateCharts() {
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();

            // --- Spending Data Calculation ---
            const spendingData = data.transactions
                .filter(t => {
                    const d = new Date(t.date);
                    return t.amount < 0 && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
                })
                .reduce((acc, t) => {
                    acc[t.cat] = (acc[t.cat] || 0) + Math.abs(t.amount);
                    return acc;
                }, {});

            const spendingChartConfig = {
                labels: Object.keys(spendingData),
                datasets: [{
                    data: Object.values(spendingData),
                    backgroundColor: ['#F87171', '#FBBF24', '#60A5FA', '#A78BFA', '#34D399'],
                    borderColor: '#FFFFFF'
                }]
            };

            // --- Income Data Calculation (NEW) ---
            const incomeData = data.transactions
                .filter(t => {
                    const d = new Date(t.date);
                    return t.amount > 0 && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
                })
                .reduce((acc, t) => {
                    acc[t.cat] = (acc[t.cat] || 0) + t.amount;
                    return acc;
                }, {});

            const incomeChartConfig = {
                labels: Object.keys(incomeData),
                datasets: [{
                    data: Object.values(incomeData),
                    backgroundColor: ['#20C997', '#48BB78', '#38A169', '#2F855A'],
                    borderColor: '#FFFFFF'
                }]
            };

            // --- Chart Rendering ---
            if (state.charts.budgetDoughnut) state.charts.budgetDoughnut.destroy();
            state.charts.budgetDoughnut = new Chart(document.getElementById('budgetDoughnutChart').getContext('2d'), {
                type: 'doughnut', data: spendingChartConfig, options: { responsive: true, maintainAspectRatio: false, cutout: '70%', borderWidth: 4, plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 20 } } } }
            });

            if (state.charts.spendingPie) state.charts.spendingPie.destroy();
            state.charts.spendingPie = new Chart(document.getElementById('spendingPieChart').getContext('2d'), {
                type: 'pie', data: spendingChartConfig, options: { responsive: true, maintainAspectRatio: false, borderWidth: 2, plugins: { legend: { position: 'right' } } }
            });

            // --- New Income Chart Rendering ---
            if (state.charts.incomeSources) state.charts.incomeSources.destroy();
            state.charts.incomeSources = new Chart(document.getElementById('incomeSourcesChart').getContext('2d'), {
                type: 'pie', data: incomeChartConfig, options: { responsive: true, maintainAspectRatio: false, borderWidth: 2, plugins: { legend: { position: 'right' } } }
            });
        },

        // Populates other sections of the UI.
        populateSavingsGoals() {
            document.getElementById('savings-goals-container').innerHTML = data.savingsGoals.map(goal => {
                const percentage = Math.round((goal.saved / goal.target) * 100);
                return `<div class="bg-card p-6 rounded-xl shadow-lg"><div class="text-4xl mb-3">${goal.icon}</div><h3 class="font-bold text-xl">${goal.name}</h3><p class="text-subtle mb-4">Saved $${goal.saved} of $${goal.target}</p><div class="w-full bg-gray-200 rounded-full h-3 mb-2"><div class="bg-primary-accent h-3 rounded-full" style="width: ${percentage}%;"></div></div><p class="text-right font-semibold text-primary-accent">${percentage}%</p></div>`;
            }).join('');
        },
        populateArticles() {
            document.getElementById('articles-container').innerHTML = data.articles.map(article => `
                        <div class="bg-card p-4 rounded-xl shadow-md border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow duration-200" data-article-id="${article.id}">
                            <h4 class="font-bold text-lg">${article.title}</h4><p class="text-subtle my-2">${article.summary}</p>
                            <button class="font-semibold text-primary-accent hover:underline mt-2">Read Article &rarr;</button>
                        </div>`).join('');
        },
        populateBadges() {
            document.getElementById('badges-container').innerHTML = data.badges.map(badge => `<div class="text-center p-2 rounded-xl bg-gray-100 shadow-sm"><div class="text-4xl">${badge.icon}</div><p class="text-xs font-medium mt-1">${badge.name}</p></div>`).join('');
        },
    };

    // --- App Logic & Event Handlers ---
    // This object holds the main application logic.
    const app = {
        // Handles navigation between pages.
        navigateTo(hash, tabId = null) {
            const targetPageId = (hash.substring(1) || 'dashboard') + '-page';
            elements.pages.forEach(p => p.classList.add('hidden'));
            const targetPage = document.getElementById(targetPageId)
            if (targetPage) {
                targetPage.classList.remove('hidden');
            } else {
                document.getElementById('dashboard-page').classList.remove('hidden');
            }

            elements.navLinks.forEach(link => {
                const isActive = link.getAttribute('href') === hash;
                link.classList.toggle('active', isActive);
                if (isActive) elements.pageTitle.textContent = link.querySelector('span').textContent;
            });

            elements.sidebar.classList.add('-translate-x-full');
            elements.sidebarOverlay.style.display = 'none';

            if (hash === '#learn' && tabId) {
                elements.learnTabButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.tabTarget === tabId));
                elements.learnTabContents.forEach(content => content.classList.toggle('active', content.id === tabId));
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
                ui.showAuthMessage('Login successful!', false);
                setTimeout(() => ui.hideModal(elements.authModal), 1000);
            } catch (error) {
                ui.showAuthMessage(error.message);
            } finally {
                setFormLoading(elements.loginForm, false);
            }
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
                    name, level: 1, xp: 0, email
                });
                ui.showAuthMessage('Signup successful!', false);
                setTimeout(() => ui.hideModal(elements.authModal), 1500);
            } catch (error) {
                ui.showAuthMessage(error.message);
            } finally {
                setFormLoading(elements.signupForm, false);
            }
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
                const snapshot = await db.collection('users').doc(uid).collection('transactions').where('date', '>=', firstDayISO).where('date','<',firstDayOfNextMonthISO).orderBy('date', 'desc').get();
                data.transactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                app.updateAll();
            } catch (error) {
                console.error("Error loading transactions:", error);
                data.transactions = [];
                app.updateAll();
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

            const transactionData = {
                date: document.getElementById('transaction-date').value,
                desc: document.getElementById('transaction-desc').value,
                cat: document.getElementById('transaction-cat').value,
                amount: amount,
            };

            try {
                if (id) {
                    await db.collection('users').doc(uid).collection('transactions').doc(id).update(transactionData);
                } else {
                    await db.collection('users').doc(uid).collection('transactions').add(transactionData);
                }
                await app.loadUserTransactions(); // Reload all data and update UI
                ui.hideModal(elements.transactionModal);
            } catch (error) {
                console.error("Error saving transaction: ", error);
                alert("There was an error saving your transaction.");
            } finally {
                formButton.disabled = false;
                formButton.textContent = 'Save Transaction';
            }
        },

        // Deletes a transaction after confirmation.
        async confirmDelete() {
            if (state.transactionIdToDelete && state.isLoggedIn) {
                const uid = state.currentUser.uid;
                try {
                    await db.collection('users').doc(uid).collection('transactions').doc(state.transactionIdToDelete).delete();
                    await app.loadUserTransactions(); // Reload and re-render
                } catch (error) {
                    console.error("Error deleting transaction: ", error);
                    alert("Could not delete the transaction.");
                }
            }
            ui.hideModal(elements.deleteConfirmModal);
            state.transactionIdToDelete = null;
        },
        // A single function to update all dynamic parts of the UI.
        updateAll() {
            ui.populateTransactions();
            ui.updateBalance();
            ui.createOrUpdateCharts();
        },

        // Centralized event listener setup.
        bindEvents() {
            // Navigation
            elements.navLinks.forEach(link => link.addEventListener('click', (e) => { e.preventDefault(); app.navigateTo(e.currentTarget.getAttribute('href')); }));
            window.addEventListener('hashchange', () => app.navigateTo(window.location.hash || '#dashboard'));
            elements.menuButton.addEventListener('click', () => { elements.sidebar.classList.toggle('-translate-x-full'); elements.sidebarOverlay.style.display = 'block'; });
            elements.sidebarOverlay.addEventListener('click', () => { elements.sidebar.classList.add('-translate-x-full'); elements.sidebarOverlay.style.display = 'none'; });

            // Modals
            elements.closeAuthButton.addEventListener('click', () => ui.hideModal(elements.authModal));
            elements.closeTransactionButton.addEventListener('click', () => ui.hideModal(elements.transactionModal));
            elements.closeChatbotButton.addEventListener('click', () => ui.hideModal(elements.chatbotModal));
            elements.cancelDeleteBtn.addEventListener('click', () => ui.hideModal(elements.deleteConfirmModal));
            elements.chatbotButton.addEventListener('click', () => ui.showModal(elements.chatbotModal));

            // Authentication
            elements.headerAuthButton.addEventListener('click', ui.showAuthModal);
            elements.toggleAuthButton.addEventListener('click', () => elements.loginForm.classList.contains('hidden') ? ui.showLoginPage() : ui.showSignupPage());
            elements.loginForm.addEventListener('submit', app.handleLogin); // Connect to new async function
            elements.signupForm.addEventListener('submit', app.handleSignup); // Connect to new async function
            elements.logoutButton.addEventListener('click', app.handleLogout); // Connect to new Firebase function
            elements.closeAuthButton.addEventListener('click', () => ui.hideModal(elements.authModal));

            // Transactions
            elements.addTransactionButton.addEventListener('click', () => ui.showTransactionModal());
            elements.dashboardAddTransactionButton.addEventListener('click', () => ui.showTransactionModal());
            elements.transactionForm.addEventListener('submit', app.handleTransactionFormSubmit);
            elements.confirmDeleteBtn.addEventListener('click', app.confirmDelete);
            elements.transactionTableBody.addEventListener('click', (e) => {
                const target = e.target.closest('button');
                if (!target) return;
                const id = target.dataset.id;
                if (target.classList.contains('edit-btn')) {
                    ui.showTransactionModal(data.transactions.find(t => t.id == id));
                } else if (target.classList.contains('delete-btn')) {
                    ui.showDeleteConfirmModal(id);
                }
            });

            // Learn & Play
            elements.chatbotButton.addEventListener('click', () => ui.showModal(elements.chatbotModal));
            elements.learnTabButtons.forEach(button => button.addEventListener('click', () => app.navigateTo('#learn', button.dataset.tabTarget)));
            elements.exploreArticlesButton.addEventListener('click', () => app.navigateTo('#learn', 'articles-tab-content'));
            elements.exploreTriviaButton.addEventListener('click', () => app.navigateTo('#learn', 'trivia-tab-content'));
            elements.backToArticlesButton.addEventListener('click', () => app.navigateTo('#learn', 'articles-tab-content'));
            document.getElementById('articles-container').addEventListener('click', (e) => {
                const articleCard = e.target.closest('[data-article-id]');
                if (articleCard) app.showArticle(articleCard.dataset.articleId);
            });
        },

        // Initial application setup.
        init() {
            app.bindEvents();
            ui.populateSavingsGoals();
            ui.populateArticles();
            ui.populateBadges();
            app.updateAll();
            if (!auth.currentUser) {
                app.navigateTo(window.location.hash || '#dashboard');
            }
        }
    };

    auth.onAuthStateChanged(async (user) => {
        if (user) {
            state.isLoggedIn = true;
            state.currentUser = { uid: user.uid, email: user.email };
            // Fetch the user's data from Firestore and attach it
            state.currentUser.firestoreData = await app.fetchUserData(user.uid);
            // Now update the UI with the complete user object
            ui.updateHeaderForAuthState(state.currentUser);
            ui.updateTransactionControls(true);
            await app.loadUserTransactions();
        } else {
            state.isLoggedIn = false;
            state.currentUser = null;
            // Update the UI to its logged-out state
            ui.updateHeaderForAuthState(null);
            ui.updateTransactionControls(false);
            await app.loadUserTransactions(); // Will clear data and update the UI
        }
    });

    // --- Start the App ---
    app.init();
});