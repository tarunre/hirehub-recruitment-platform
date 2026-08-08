document.addEventListener('DOMContentLoaded', function () {
    const changePasswordForm = document.querySelector('#changepw-form');
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email'); // Get the email from the query parameters

    changePasswordForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        const newPassword = document.querySelector('input[placeholder="Enter your Password"]').value;
        const confirmPassword = document.querySelector('input[placeholder="Confirm your Password"]').value;

        // Validate that passwords match
        if (newPassword !== confirmPassword) {
            Swal.fire({
                icon: 'warning',
                title: 'Passwords do not match',
                text: 'Please make sure both password fields are identical.',
            });
            return;
        }

        // Example: Fetch POST request to your backend endpoint
        try {
            const response = await fetch('/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email, // Include the email in the request body
                    newPassword,
                    confirmPassword
                })
            });

            const data = await response.json();
            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Password Changed Successfully',
                    text: data.message,
                    timer: 2000,
                    showConfirmButton: false
                }).then(() => {
                    window.location.href = '/login1'; // Redirect to login or another page
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: data.message,
                });
            }
        } catch (error) {
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Failed to Change Password',
                text: 'An error occurred while changing your password. Please try again.',
            });
        }
    });
});
