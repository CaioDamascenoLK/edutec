document.addEventListener('DOMContentLoaded', () => {
    const loginView = document.getElementById('login-view');
    const signupView = document.getElementById('signup-view');
    const showSignup = document.getElementById('show-signup');
    const showLogin = document.getElementById('show-login');

    const backendUrl = 'http://localhost:3333';

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
                window.location.href = '../frontend/index.html'; 
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
        sendUser();
    });

    async function sendUser() {
        const name = document.querySelector("#signup-username").value;
        const email = document.querySelector("#signup-email").value;
        const password = document.querySelector("#signup-password").value;

        const user = {
            name,
            email,
            password
        }

        const response = await fetch(`${backendUrl}/cadastrar`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ user }) 
        })

        const data = await response.json()
        alert(data.mensage)

        window.location.href = "../frontend/index.html"
    }
});