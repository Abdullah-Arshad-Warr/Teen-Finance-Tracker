 document.addEventListener('DOMContentLoaded', function () {
            // --- DOM Element Selection ---
            const pages = document.querySelectorAll('.page-content');
            const navLinks = document.querySelectorAll('.nav-item');
            const pageTitle = document.getElementById('page-title');
            const menuButton = document.getElementById('menu-button');
            const sidebar = document.getElementById('sidebar');
            const sidebarOverlay = document.getElementById('sidebar-overlay');
            
            // Authentication Elements
            const authModal = document.getElementById('auth-modal');
            const authTitle = document.getElementById('auth-title');
            const authMessage = document.getElementById('auth-message');
            const loginForm = document.getElementById('login-form');
            const signupForm = document.getElementById('signup-form');
            const toggleAuthButton = document.getElementById('toggle-auth-button');
            const toggleAuthText = document.getElementById('toggle-auth-text');
            const closeAuthButton = document.getElementById('close-auth-button');
            const headerAuthButton = document.getElementById('header-auth-button');
            const logoutButton = document.getElementById('logout-button');
            const userLevelXp = document.getElementById('user-level-xp');

            // Transaction Elements
            const transactionModal = document.getElementById('transaction-modal');
            const transactionForm = document.getElementById('transaction-form');
            const transactionTitle = document.getElementById('transaction-title');
            const closeTransactionButton = document.getElementById('close-transaction-button');
            const addTransactionButton = document.getElementById('add-transaction-button');
            const dashboardAddTransactionButton = document.getElementById('dashboard-add-transaction-button');
            const transactionTableBody = document.getElementById('transaction-table-body');
            
            // Delete Confirmation Modal Elements
            const deleteConfirmModal = document.getElementById('delete-confirm-modal');
            const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
            const cancelDeleteBtn = document.getElementById('cancel-delete-btn');


            // Chatbot Elements
            const chatbotButton = document.getElementById('chatbot-button');
            const chatbotModal = document.getElementById('chatbot-modal');
            const closeChatbotButton = document.getElementById('close-chatbot-button');

            // Learn Page Elements
            const learnTabButtons = document.querySelectorAll('#learn-page .tab-button');
            const learnTabContents = document.querySelectorAll('#learn-page .tab-content');
            const exploreArticlesButton = document.getElementById('explore-articles-button');
            const exploreTriviaButton = document.getElementById('explore-trivia-button');

            // Article Reader Elements
            const articleReaderTitle = document.getElementById('article-reader-title');
            const articleReaderContent = document.getElementById('article-reader-content');
            const backToArticlesButton = document.getElementById('back-to-articles-button');
            
            // Dashboard Display
            const moneyInDisplay = document.getElementById('money-in');
            const moneyOutDisplay = document.getElementById('money-out');
            const currentBalanceDisplay = document.getElementById('current-balance');

            // --- State ---
            let isLoggedIn = false; 
            let budgetDoughnutChart, spendingPieChart;
            let transactionIdToDelete = null;

            // --- Data ---
            const data = {
                transactions: [
                    { id: 1, date: '2024-07-22', desc: 'Pocket Money', cat: 'Income', amount: 50.00 },
                    { id: 2, date: '2024-07-21', desc: 'Boba Tea', cat: 'Food & Drink', amount: -6.50 },
                    { id: 3, date: '2024-07-20', desc: 'Movie Ticket', cat: 'Entertainment', amount: -15.00 },
                    { id: 4, date: '2024-07-19', desc: 'Gaming Store', cat: 'Hobbies', amount: -25.00 },
                    { id: 5, date: '2024-07-18', desc: 'Pizza Night', cat: 'Food & Drink', amount: -12.00 },
                    { id: 6, date: '2024-07-15', desc: 'Initial Deposit', cat: 'Savings', amount: 320.75 },
                ],
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
            
            // --- Helper Functions ---
            const formatCurrency = (amount) => `$${Math.abs(amount).toFixed(2)}`;

            // --- Authentication Functions ---
            function showAuthMessage(message, isError = true) {
                authMessage.textContent = message;
                authMessage.classList.remove('hidden');
                authMessage.classList.toggle('text-red-500', isError);
                authMessage.classList.toggle('text-green-500', !isError);
            }

            function handleLogin(e) {
                e.preventDefault();
                if (login_email.value && login_password.value) {
                    isLoggedIn = true;
                    showAuthMessage('Login successful!', false);
                    updateAuthUI();
                    setTimeout(() => {
                        hideAuthModal();
                        navigateTo(window.location.hash || '#dashboard');
                    }, 1500);
                } else {
                    showAuthMessage('Please enter both email and password.');
                }
            }

            function handleSignup(e) {
                e.preventDefault();
                if (signup_email.value && signup_password.value && signup_confirm_password.value) {
                    if (signup_password.value === signup_confirm_password.value) {
                        isLoggedIn = true;
                        showAuthMessage('Signup successful!', false);
                        updateAuthUI();
                        setTimeout(() => {
                            hideAuthModal();
                            navigateTo(window.location.hash || '#dashboard');
                        }, 1500);
                    } else {
                        showAuthMessage('Passwords do not match.');
                    }
                } else {
                    showAuthMessage('Please fill in all fields.');
                }
            }

            function handleLogout() {
                isLoggedIn = false;
                updateAuthUI();
                navigateTo('#dashboard');
            }

            function updateAuthUI() {
                headerAuthButton.classList.toggle('hidden', isLoggedIn);
                logoutButton.classList.toggle('hidden', !isLoggedIn);
                userLevelXp.classList.toggle('hidden', !isLoggedIn);
            }

            function showAuthModal() {
                authModal.classList.remove('hidden');
                setTimeout(() => authModal.classList.remove('opacity-0'), 10);
                showLoginPage();
            }

            function hideAuthModal() {
                authModal.classList.add('opacity-0');
                setTimeout(() => authModal.classList.add('hidden'), 300);
            }
            
            function showLoginPage() {
                loginForm.classList.remove('hidden');
                signupForm.classList.add('hidden');
                authTitle.textContent = 'Login';
                toggleAuthText.textContent = "Don't have an account?";
                toggleAuthButton.textContent = "Sign Up";
                authMessage.classList.add('hidden');
            }

            function showSignupPage() {
                loginForm.classList.add('hidden');
                signupForm.classList.remove('hidden');
                authTitle.textContent = 'Sign Up';
                toggleAuthText.textContent = "Already have an account?";
                toggleAuthButton.textContent = "Login";
                authMessage.classList.add('hidden');
            }

            // --- Navigation ---
            function navigateTo(hash, tabId = null) {
                const targetPageId = hash.substring(1) + '-page';
                pages.forEach(p => p.classList.add('hidden'));
                const targetPage = document.getElementById(targetPageId) || document.getElementById('dashboard-page');
                targetPage.classList.remove('hidden');

                navLinks.forEach(link => {
                    const isActive = link.getAttribute('href') === hash;
                    link.classList.toggle('active', isActive);
                    if (isActive) pageTitle.textContent = link.querySelector('span').textContent;
                });

                sidebar.classList.add('-translate-x-full');
                sidebarOverlay.style.display = 'none';

                if (hash === '#learn' && tabId) {
                    learnTabButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.tabTarget === tabId));
                    learnTabContents.forEach(content => content.classList.toggle('active', content.id === tabId));
                }
            }

            function showArticle(articleId) {
                const article = data.articles.find(a => a.id === articleId);
                if (article) {
                    articleReaderTitle.textContent = article.title;
                    articleReaderContent.innerHTML = article.content;
                    navigateTo('#article-reader');
                } else {
                    navigateTo('#learn', 'articles-tab-content');
                }
            }
            
            // --- Transaction Management ---
            function showTransactionModal(transaction = null) {
                transactionForm.reset();
                if (transaction) {
                    transactionTitle.textContent = 'Edit Transaction';
                    document.getElementById('transaction-id').value = transaction.id;
                    document.getElementById('transaction-desc').value = transaction.desc;
                    document.getElementById('transaction-cat').value = transaction.cat;
                    document.getElementById('transaction-amount').value = Math.abs(transaction.amount);
                    document.getElementById('transaction-date').value = transaction.date;
                    document.querySelector(`input[name="transaction-type"][value="${transaction.amount > 0 ? 'inflow' : 'outflow'}"]`).checked = true;
                } else {
                    transactionTitle.textContent = 'Add Transaction';
                    document.getElementById('transaction-id').value = '';
                    document.getElementById('transaction-date').valueAsDate = new Date();
                }
                transactionModal.classList.remove('hidden');
                setTimeout(() => transactionModal.classList.remove('opacity-0'), 10);
            }

            function hideTransactionModal() {
                transactionModal.classList.add('opacity-0');
                setTimeout(() => transactionModal.classList.add('hidden'), 300);
            }

            function handleTransactionFormSubmit(e) {
                e.preventDefault();
                const id = document.getElementById('transaction-id').value;
                const type = document.querySelector('input[name="transaction-type"]:checked').value;
                let amount = parseFloat(document.getElementById('transaction-amount').value);
                if (type === 'outflow') {
                    amount = -amount;
                }

                const transactionData = {
                    date: document.getElementById('transaction-date').value,
                    desc: document.getElementById('transaction-desc').value,
                    cat: document.getElementById('transaction-cat').value,
                    amount: amount,
                };

                if (id) { // Editing existing transaction
                    const index = data.transactions.findIndex(t => t.id == id);
                    data.transactions[index] = { ...data.transactions[index], ...transactionData };
                } else { // Adding new transaction
                    transactionData.id = Date.now();
                    data.transactions.push(transactionData);
                }
                
                updateAll();
                hideTransactionModal();
            }
            
            function showDeleteConfirmModal(id) {
                transactionIdToDelete = id;
                deleteConfirmModal.classList.remove('hidden');
                setTimeout(() => deleteConfirmModal.classList.remove('opacity-0'), 10);
            }

            function hideDeleteConfirmModal() {
                deleteConfirmModal.classList.add('opacity-0');
                setTimeout(() => deleteConfirmModal.classList.add('hidden'), 300);
                transactionIdToDelete = null;
            }

            // --- Chart Creation & Updates ---
            function createOrUpdateCharts() {
                const spendingData = data.transactions
                    .filter(t => t.amount < 0)
                    .reduce((acc, t) => {
                        acc[t.cat] = (acc[t.cat] || 0) + Math.abs(t.amount);
                        return acc;
                    }, {});

                const spendingLabels = Object.keys(spendingData);
                const spendingValues = Object.values(spendingData);
                const backgroundColors = ['#34D399', '#FBBF24', '#60A5FA', '#A78BFA', '#F87171'];

                // Doughnut Chart
                const doughnutCtx = document.getElementById('budgetDoughnutChart').getContext('2d');
                 if (budgetDoughnutChart) budgetDoughnutChart.destroy();
                budgetDoughnutChart = new Chart(doughnutCtx, {
                    type: 'doughnut',
                    data: {
                        labels: spendingLabels,
                        datasets: [{ data: spendingValues, backgroundColor: backgroundColors, borderColor: '#FFFFFF', borderWidth: 4 }]
                    },
                    options: { responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 20 } } } }
                });

                // Pie Chart
                const pieCtx = document.getElementById('spendingPieChart').getContext('2d');
                if(spendingPieChart) spendingPieChart.destroy();
                spendingPieChart = new Chart(pieCtx, {
                    type: 'pie',
                    data: {
                        labels: spendingLabels,
                        datasets: [{ data: spendingValues, backgroundColor: backgroundColors, borderColor: '#FFFFFF', borderWidth: 2 }]
                    },
                    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }
                });
            }

            // --- Dynamic Content Population & Updates ---
            function updateBalance() {
                const currentMonth = new Date().getMonth();
                const currentYear = new Date().getFullYear();

                const monthlyInflow = data.transactions
                    .filter(t => {
                        const tDate = new Date(t.date);
                        return t.amount > 0 && tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
                    })
                    .reduce((sum, t) => sum + t.amount, 0);

                const monthlyOutflow = data.transactions
                    .filter(t => {
                        const tDate = new Date(t.date);
                        return t.amount < 0 && tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
                    })
                    .reduce((sum, t) => sum + t.amount, 0);
                
                const currentBalance = data.transactions.reduce((sum, t) => sum + t.amount, 0);
                
                moneyInDisplay.textContent = formatCurrency(monthlyInflow);
                moneyOutDisplay.textContent = formatCurrency(monthlyOutflow);
                currentBalanceDisplay.textContent = formatCurrency(currentBalance);
            }

            function populateTransactions() {
                transactionTableBody.innerHTML = data.transactions
                .sort((a, b) => new Date(b.date) - new Date(a.date)) // Sort by date descending
                .map(tx => `
                    <tr class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td class="p-2 text-subtle">${tx.date}</td>
                        <td class="p-2 font-medium">${tx.desc}</td>
                        <td class="p-2 text-subtle">${tx.cat}</td>
                        <td class="p-2 text-right font-medium ${tx.amount > 0 ? 'text-green-500' : 'text-red-500'}">${tx.amount > 0 ? '+' : ''}${formatCurrency(tx.amount)}</td>
                        <td class="p-2 text-center flex justify-center items-center gap-2">
                            <button class="edit-btn text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-100 transition-colors" data-id="${tx.id}" title="Edit">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" />
                                </svg>
                            </button>
                            <button class="delete-btn text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition-colors" data-id="${tx.id}" title="Delete">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </td>
                    </tr>`).join('');
            }

            function populateSavingsGoals() {
                const container = document.getElementById('savings-goals-container');
                container.innerHTML = data.savingsGoals.map(goal => {
                    const percentage = Math.round((goal.saved / goal.target) * 100);
                    return `
                        <div class="bg-card p-6 rounded-xl shadow-lg">
                            <div class="text-4xl mb-3">${goal.icon}</div>
                            <h3 class="font-bold text-xl">${goal.name}</h3>
                            <p class="text-subtle mb-4">Saved $${goal.saved} of $${goal.target}</p>
                            <div class="w-full bg-gray-200 rounded-full h-3 mb-2"><div class="bg-primary-accent h-3 rounded-full" style="width: ${percentage}%;"></div></div>
                            <p class="text-right font-semibold text-primary-accent">${percentage}%</p>
                        </div>`;
                }).join('');
            }

            function populateArticles() {
                const container = document.getElementById('articles-container');
                container.innerHTML = data.articles.map(article => `
                    <div class="bg-card p-4 rounded-xl shadow-md border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow duration-200" data-article-id="${article.id}">
                        <h4 class="font-bold text-lg">${article.title}</h4>
                        <p class="text-subtle my-2">${article.summary}</p>
                        <button class="font-semibold text-primary-accent hover:underline mt-2 read-article-button" data-article-id="${article.id}">Read Article &rarr;</button>
                    </div>`).join('');
                
                container.addEventListener('click', (e) => {
                    const articleCard = e.target.closest('[data-article-id]');
                    if (articleCard) {
                        showArticle(articleCard.dataset.articleId);
                    }
                });
            }

            function populateBadges() {
                const container = document.getElementById('badges-container');
                container.innerHTML = data.badges.map(badge => `
                    <div class="text-center p-2 rounded-xl bg-gray-100 shadow-sm">
                        <div class="text-4xl">${badge.icon}</div>
                        <p class="text-xs font-medium mt-1">${badge.name}</p>
                    </div>`).join('');
            }

            function updateAll() {
                populateTransactions();
                updateBalance();
                createOrUpdateCharts();
            }

            // --- Event Listeners ---
            navLinks.forEach(link => link.addEventListener('click', (e) => {
                e.preventDefault();
                navigateTo(e.currentTarget.getAttribute('href'));
            }));
            window.addEventListener('hashchange', () => {
                if (window.location.hash !== '#article-reader') navigateTo(window.location.hash || '#dashboard');
            });
            menuButton.addEventListener('click', () => {
                sidebar.classList.toggle('-translate-x-full');
                sidebarOverlay.style.display = sidebar.classList.contains('-translate-x-full') ? 'none' : 'block';
            });
            sidebarOverlay.addEventListener('click', () => {
                sidebar.classList.add('-translate-x-full');
                sidebarOverlay.style.display = 'none';
            });
            chatbotButton.addEventListener('click', () => {
                chatbotModal.classList.remove('hidden');
                setTimeout(() => chatbotModal.classList.remove('opacity-0'), 10);
            });
            closeChatbotButton.addEventListener('click', () => {
                chatbotModal.classList.add('opacity-0');
                setTimeout(() => chatbotModal.classList.add('hidden'), 300);
            });
            learnTabButtons.forEach(button => button.addEventListener('click', () => navigateTo('#learn', button.dataset.tabTarget)));
            exploreArticlesButton.addEventListener('click', () => navigateTo('#learn', 'articles-tab-content'));
            exploreTriviaButton.addEventListener('click', () => navigateTo('#learn', 'trivia-tab-content'));
            backToArticlesButton.addEventListener('click', () => navigateTo('#learn', 'articles-tab-content'));
            toggleAuthButton.addEventListener('click', () => loginForm.classList.contains('hidden') ? showLoginPage() : showSignupPage());
            loginForm.addEventListener('submit', handleLogin);
            signupForm.addEventListener('submit', handleSignup);
            closeAuthButton.addEventListener('click', hideAuthModal);
            headerAuthButton.addEventListener('click', showAuthModal);
            logoutButton.addEventListener('click', handleLogout);

            // Transaction Listeners
            addTransactionButton.addEventListener('click', () => showTransactionModal());
            dashboardAddTransactionButton.addEventListener('click', () => showTransactionModal());
            closeTransactionButton.addEventListener('click', hideTransactionModal);
            transactionForm.addEventListener('submit', handleTransactionFormSubmit);
            transactionTableBody.addEventListener('click', (e) => {
                const target = e.target.closest('button');
                if (!target) return;
                
                const id = target.dataset.id;
                if (target.classList.contains('edit-btn')) {
                    const transaction = data.transactions.find(t => t.id == id);
                    showTransactionModal(transaction);
                } else if (target.classList.contains('delete-btn')) {
                    showDeleteConfirmModal(id);
                }
            });
            
            // Delete Confirmation Listeners
            cancelDeleteBtn.addEventListener('click', hideDeleteConfirmModal);
            confirmDeleteBtn.addEventListener('click', () => {
                if (transactionIdToDelete) {
                    data.transactions = data.transactions.filter(t => t.id != transactionIdToDelete);
                    updateAll();
                }
                hideDeleteConfirmModal();
            });


            // --- Initial Load ---
            function initializeApp() {
                updateAuthUI();
                navigateTo(window.location.hash || '#dashboard');
                populateSavingsGoals();
                populateArticles();
                populateBadges();
                updateAll();
            }

            initializeApp();
        });