document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('#login-form-id');
    const loginButton = document.querySelector('#login-button');

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const email = document.querySelector('input[placeholder="Enter your Email"]').value;
            const password = document.querySelector('input[placeholder="Enter your Password"]').value;

            // Basic validation
            if (!email || !password) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Oops...',
                    text: 'Please fill in all fields.',
                });
                return;
            }

            // Disable button to prevent multiple clicks
            loginButton.disabled = true;
            loginButton.textContent = 'Signing In...';

            // Prepare the data to send
            const loginData = {
                email: email,
                password: password
            };

            try {
                const response = await fetch('/login1', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(loginData)
                });

                const result = await response.json();

                if (response.ok) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Login Successful',
                        text: 'You are being redirected...',
                        timer: 2000,
                        showConfirmButton: false,
                        willClose: () => {
                            // Redirect to home page
                            window.location.href = `/stuhome?id=${result.id}`;

                            // Replace the login page in history stack with the home page
                            window.history.replaceState(null, null, `/stuhome?id=${result.id}`);
                        }
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Login Failed',
                        text: result.message,
                    });
                    loginButton.disabled = false;
                    loginButton.textContent = 'Sign In';
                }
            } catch (error) {
                console.error('Error:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'An error occurred during login. Please try again.',
                });
                loginButton.disabled = false;
                loginButton.textContent = 'Sign In';
            }
        });
    }
});
