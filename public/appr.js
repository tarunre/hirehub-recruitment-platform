document.addEventListener('DOMContentLoaded', () => {
    const recloginForm = document.querySelector('#rec-login');
    if (recloginForm) {
        recloginForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const email = document.querySelector('input[placeholder="Enter your Email"]').value;
            const password = document.querySelector('input[placeholder="Enter your Password"]').value;

            // Basic validation
            if (!email || !password) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Incomplete Fields',
                    text: 'Please fill in all fields.',
                });
                return;
            }

            // Prepare the data to send
            const loginData = {
                email: email,
                password: password
            };

            try {
                const response = await fetch('/rlogin', { // Updated endpoint
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
                        showConfirmButton: false
                    }).then(() => {
                        window.location.href = `/rechome?id=${result.id}`;
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Login Failed',
                        text: result.message,
                    });
                }
            } catch (error) {
                console.error('Error:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'An error occurred during login. Please try again.',
                });
            }
        });
    }
});
