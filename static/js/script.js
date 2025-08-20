// script.js
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

    const pages = document.querySelectorAll('.page-content');
    const navLinks = document.querySelectorAll('.nav-item');
    const pageTitle = document.getElementById('page-title');
    const menuButton = document.getElementById('menu-button');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const mainAppContainer = document.getElementById('main-app-container');

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
    const userNameElement = document.getElementById('user-name');
    const userAvatar = document.getElementById('user-avatar');
    const userInfoContainer = document.getElementById('user-info-container');
    const authLoadingSpinner = document.getElementById('auth-loading-spinner');
    const userAvatarInitial = document.getElementById('user-avatar-initial');

    const chatbotButton = document.getElementById('chatbot-button');
    const chatbotModal = document.getElementById('chatbot-modal');
    const closeChatbotButton = document.getElementById('close-chatbot-button');

    let isLoggedIn = false; // Initial state: not logged in

    const data = {
        transactions: [
            { date: 'Jul 22', desc: 'Pocket Money', cat: 'Income', amount: 50.00 },
            { date: 'Jul 21', desc: 'Boba Tea', cat: 'Food & Drink', amount: -6.50 },
            { date: 'Jul 20', desc: 'Movie Ticket', cat: 'Entertainment', amount: -15.00 },
            { date: 'Jul 19', desc: 'Gaming Store', cat: 'Hobbies', amount: -25.00 },
            { date: 'Jul 18', desc: 'Pizza Night', cat: 'Food & Drink', amount: -12.00 },
        ],
        savingsGoals: [
            { name: 'New Gaming Phone', target: 500, saved: 325, icon: '📱' },
            { name: 'Concert Tickets', target: 150, saved: 50, icon: '🎟️' },
            { name: 'Summer Trip Fund', target: 300, saved: 280, icon: '✈️' },
        ],
        articles: [
            { title: "What is a Credit Score?", summary: "Learn why this three-digit number is so important for your financial future." },
            { title: "Investing 101 for Teens", summary: "A simple guide to making your money grow over time." },
            { title: "The Power of Compound Interest", summary: "Discover the 'eighth wonder of the world' and how it can make you rich." },
        ],
        badges: [
            { name: 'Budget Boss', icon: '👑' },
            { name: 'Savings Starter', icon: '🌱' },
            { name: 'Money Logger', icon: '✍️' },
            { name: 'Trivia Whiz', icon: '🧠' },
        ]
    };

    // A helper function to manage the loading state of a form button
    function setFormLoading(form, isLoading) {
        const button = form.querySelector('button[type="submit"]');
        if (isLoading) {
            button.disabled = true;
            button.innerHTML = `
                <svg class="animate-spin h-5 w-5 mr-3 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10" stroke-width="4" stroke-opacity="0.25"></circle>
                    <path d="M12 2a10 10 0 0110 10" stroke-width="4" stroke-linecap="round"></path>
                </svg>
                Loading...`;
        } else {
            button.disabled = false;
            // Restore original text based on the form ID
            if (form.id === 'login-form') {
                button.textContent = 'Login';
            } else {
                button.textContent = 'Sign Up';
            }
        }
    }

    function showAuthMessage(message, isError = true) {
        authMessage.textContent = message;
        authMessage.classList.remove('hidden');
        authMessage.className = isError
            ? 'text-center text-red-500 mb-4'
            : 'text-center text-green-500 mb-4';
    }

    async function handleLogin(e) {
        e.preventDefault();
        setFormLoading(loginForm, true);
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        if (!email || !password) {
            showAuthMessage('Please enter both email and password.');
            setFormLoading(loginForm, false);
            return;
        }

        try {
            await auth.signInWithEmailAndPassword(email, password);
            showAuthMessage('Login successful!', false);
            setTimeout(hideAuthModal, 1000); // Close modal after success
        } catch (error) {
            showAuthMessage(error.message); // Display Firebase error message
        } finally {
            setFormLoading(loginForm, false);
        }
    }


    async function handleSignup(e) {
        e.preventDefault();
        setFormLoading(signupForm, true);
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm-password').value;

        if (!name || !email || !password || !confirmPassword) {
            showAuthMessage('Please fill in all fields.');
            setFormLoading(signupForm, false);
            return;
        }

        if (password !== confirmPassword) {
            showAuthMessage('Passwords do not match.');
            setFormLoading(signupForm, false);
            return;
        }

        // --- Firebase Logic ---
        try {
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // Create a new user document in Firestore using the provided name
            await db.collection("users").doc(user.uid).set({
                name: name,   // Use the name from the input field
                level: 1,
                xp: 0,
                email: user.email
            });

            showAuthMessage('Signup successful! Logging in...', false);
            setTimeout(hideAuthModal, 1500);
        } catch (error) {
            // Display specific error from Firebase (e.g., email already in use)
            showAuthMessage(error.message);
        } finally {
            // Ensure the loading state is always removed
            setFormLoading(signupForm, false);
        }
    }

    function handleLogout() {
        auth.signOut().then(() => {
            navigateTo('#dashboard'); // Go back to dashboard after logout
        });
    }

    async function fetchAndDisplayUserData(userId) {
        const userDocRef = db.collection('users').doc(userId);
        try {
            const doc = await userDocRef.get();
            if (doc.exists) {
                const userData = doc.data();
                userNameElement.textContent = userData.name || 'User';
                userLevelXp.textContent = `Level ${userData.level} | ${userData.xp} XP`;

                if (userData.name && userData.name.trim() !== '') {
                    const firstLetter = userData.name.trim().charAt(0).toUpperCase();
                    userAvatarInitial.textContent = firstLetter;
                } else {
                    // Fallback in case there is no name
                    userAvatarInitial.textContent = '?';
                }

            } else {
                console.log("No such user document!");
                userNameElement.textContent = 'User';
                userAvatarInitial.textContent = 'U'; // Fallback
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
            userNameElement.textContent = 'Guest';
            userAvatarInitial.textContent = 'G'; // Fallback on error
        } finally {
            // This logic correctly shows the container that holds our new avatar
            authLoadingSpinner.classList.add('hidden');
            userInfoContainer.classList.remove('hidden');
            userInfoContainer.classList.add('flex');
        }
    }

    // Listen for authentication state changes
    auth.onAuthStateChanged(user => {
        if (user) {
            // User is logged in
            headerAuthButton.classList.add('hidden');
            logoutButton.classList.remove('hidden');
            // Now you would fetch and display the user's data
            fetchAndDisplayUserData(user.uid);
        } else {
            // User is signed out
            authLoadingSpinner.classList.add('hidden');
            userInfoContainer.classList.add('hidden');
            logoutButton.classList.add('hidden');
            headerAuthButton.classList.remove('hidden');
        }
    });

    function showAuthModal() {
        authModal.classList.remove('hidden');
        setTimeout(() => authModal.classList.remove('opacity-0'), 10);
        showLoginPage(); // Always show login form first when modal opens
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

    // Event Listeners for Auth
    toggleAuthButton.addEventListener('click', () => {
        if (loginForm.classList.contains('hidden')) {
            showLoginPage();
        } else {
            showSignupPage();
        }
    });

    loginForm.addEventListener('submit', handleLogin);
    signupForm.addEventListener('submit', handleSignup);
    closeAuthButton.addEventListener('click', hideAuthModal);
    headerAuthButton.addEventListener('click', showAuthModal); // New button in header
    logoutButton.addEventListener('click', handleLogout); // Logout button on profile page


    function navigateTo(hash) {
        const targetPageId = hash.substring(1) + '-page';
        const targetPage = document.getElementById(targetPageId);

        pages.forEach(p => p.classList.add('hidden'));
        if (targetPage) {
            targetPage.classList.remove('hidden');
        } else {
            document.getElementById('dashboard-page').classList.remove('hidden');
        }

        navLinks.forEach(link => {
            if (link.getAttribute('href') === hash) {
                link.classList.add('active');
                pageTitle.textContent = link.querySelector('span').textContent;
            } else {
                link.classList.remove('active');
            }
        });
        // Close sidebar on navigation for mobile
        sidebar.classList.add('-translate-x-full');
        sidebarOverlay.style.display = 'none';
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const hash = e.currentTarget.getAttribute('href');
            window.location.hash = hash;
        });
    });

    window.addEventListener('hashchange', () => {
        navigateTo(window.location.hash || '#dashboard');
    });

    menuButton.addEventListener('click', () => {
        sidebar.classList.toggle('-translate-x-full');
        if (sidebar.classList.contains('-translate-x-full')) {
            sidebarOverlay.style.display = 'none';
        } else {
            sidebarOverlay.style.display = 'block';
        }
    });

    sidebarOverlay.addEventListener('click', () => {
        sidebar.classList.add('-translate-x-full');
        sidebarOverlay.style.display = 'none';
    });

    // Chatbot Modal Logic
    chatbotButton.addEventListener('click', () => {
        chatbotModal.classList.remove('hidden');
        setTimeout(() => chatbotModal.classList.remove('opacity-0'), 10);
    });
    closeChatbotButton.addEventListener('click', () => {
        chatbotModal.classList.add('opacity-0');
        setTimeout(() => chatbotModal.classList.add('hidden'), 300);
    });

    // Initial Load and UI Update
    navigateTo(window.location.hash || '#dashboard'); // Always start on dashboard

    // Chart.js Initializations
    function createDoughnutChart() {
        const ctx = document.getElementById('budgetDoughnutChart').getContext('2d');
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Food & Drink', 'Entertainment', 'Hobbies', 'Savings'],
                datasets: [{
                    data: [35, 25, 20, 20],
                    backgroundColor: ['#34D399', '#FBBF24', '#60A5FA', '#A78BFA'],
                    borderColor: '#FFFFFF',
                    borderWidth: 4,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            boxWidth: 12,
                            padding: 20,
                        }
                    },
                    tooltip: {
                        enabled: true,
                    }
                }
            }
        });
    }

    function createPieChart() {
        const ctx = document.getElementById('spendingPieChart').getContext('2d');
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Food & Drink', 'Entertainment', 'Hobbies'],
                datasets: [{
                    data: [18.50, 15.00, 25.00],
                    backgroundColor: ['#34D399', '#FBBF24', '#60A5FA'],
                    borderColor: '#FFFFFF',
                    borderWidth: 2,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                    }
                }
            }
        });
    }

    // Populate dynamic content
    function populateTransactions() {
        const tableBody = document.getElementById('transaction-table-body');
        tableBody.innerHTML = '';
        data.transactions.forEach(tx => {
            const row = `
                        <tr class="border-b border-gray-100">
                            <td class="p-2 text-subtle">${tx.date}</td>
                            <td class="p-2 font-medium">${tx.desc}</td>
                            <td class="p-2 text-subtle">${tx.cat}</td>
                            <td class="p-2 text-right font-medium ${tx.amount > 0 ? 'text-green-500' : 'text-red-500'}">
                                ${tx.amount > 0 ? '+' : ''}$${Math.abs(tx.amount).toFixed(2)}
                            </td>
                        </tr>
                    `;
            tableBody.innerHTML += row;
        });
    }

    function populateSavingsGoals() {
        const container = document.getElementById('savings-goals-container');
        container.innerHTML = '';
        data.savingsGoals.forEach(goal => {
            const percentage = Math.round((goal.saved / goal.target) * 100);
            const card = `
                        <div class="bg-card p-6 rounded-lg shadow-sm">
                            <div class="text-4xl mb-3">${goal.icon}</div>
                            <h3 class="font-bold text-xl">${goal.name}</h3>
                            <p class="text-subtle mb-4">Saved $${goal.saved} of $${goal.target}</p>
                            <div class="w-full progress-bar-bg rounded-full h-3 mb-2">
                                <div class="progress-bar-fill h-3 rounded-full" style="width: ${percentage}%;"></div>
                            </div>
                            <p class="text-right font-semibold text-primary-accent">${percentage}%</p>
                        </div>
                    `;
            container.innerHTML += card;
        });
    }

    function populateArticles() {
        const container = document.getElementById('articles-container');
        container.innerHTML = '';
        data.articles.forEach(article => {
            const card = `
                        <div class="bg-card p-4 rounded-lg shadow-sm border border-gray-200">
                            <h4 class="font-bold text-lg">${article.title}</h4>
                            <p class="text-subtle my-2">${article.summary}</p>
                            <button class="font-semibold text-primary-accent hover:underline">Read Article &rarr;</button>
                        </div>
                    `;
            container.innerHTML += card;
        });
    }

    function populateBadges() {
        const container = document.getElementById('badges-container');
        container.innerHTML = '';
        data.badges.forEach(badge => {
            const item = `
                        <div class="text-center p-2 rounded-lg bg-gray-100">
                            <div class="text-4xl">${badge.icon}</div>
                            <p class="text-xs font-medium mt-1">${badge.name}</p>
                        </div>
                    `;
            container.innerHTML += item;
        });
    }

    // Call population functions (these are called on DOMContentLoaded now that app is always visible)
    createDoughnutChart();
    createPieChart();
    populateTransactions();
    populateSavingsGoals();
    populateArticles();
    populateBadges();
});