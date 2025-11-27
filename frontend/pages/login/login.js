document.addEventListener('DOMContentLoaded', () => {
    const loginView = document.getElementById('login-view');
    const signupView = document.getElementById('signup-view');
    const showSignup = document.getElementById('show-signup');
    const showLogin = document.getElementById('show-login');

    // Constrói a URL do backend dinamicamente para ser mais resiliente.
    const currentHost = window.location.host;
    const backendHost = currentHost.replace(/^\d+/, '3000');
    const backendUrl = `https://${backendHost}`;

    showSignup.addEventListener('click', (e) => {
        e.preventDefault();
        loginView.style.display = 'none';
        signupView.style.display = 'block';
    });

    showLogin.addEventListener('click', (e) => {
        e.preventDefault();
        signupView.style.display = 'none';
        loginView.style.display = 'block';
    });

    // Formulário de Login
    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            const response = await fetch(`${backendUrl}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                const { token } = await response.json();
                localStorage.setItem('token', token);
                window.location.href = '../page6/index.html'; 
            } else {
                alert('Falha no login. Verifique seu email e senha.');
            }
        } catch (error) {
            console.error('Erro durante o login:', error);
            alert('Ocorreu um erro durante o login. Por favor, tente novamente.');
        }
    });

    // Formulário de Cadastro
    const signupForm = document.getElementById('signup-form');
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('signup-username').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;

        try {
            const response = await fetch(`${backendUrl}/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });

            if (response.ok) {
                alert('Cadastro realizado com sucesso! Por favor, faça o login.');
                signupForm.reset();
                showLogin.click();
            } else {
                const errorMsg = await response.text();
                alert(`Falha no cadastro: ${errorMsg}`);
            }
        } catch (error) {
            console.error('Erro durante o cadastro:', error);
            alert('Ocorreu um erro durante o cadastro. Por favor, tente novamente.');
        }
    });
});