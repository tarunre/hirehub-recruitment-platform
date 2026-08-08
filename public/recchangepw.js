document.addEventListener('DOMContentLoaded', function () {
    const changePasswordForm = document.querySelector('#changepw-form');
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email'); // Get the email from the query parameters

    changePasswordForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        const newPassword = document.querySelector('input[placeholder="Enter your Password"]').value;
        const confirmPassword = document.querySelector('input[placeholder="Confirm your Password"]').value;

        if (newPassword !== confirmPassword) {
            Swal.fire({
                icon: 'warning',
                title: 'Password Mismatch',
                text: 'The new passwords do not match. Please try again.',
            });
            return;
        }

        // Example: Fetch POST request to your backend endpoint
        try {
            const response = await fetch('/rec-change-password', {
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
                    title: 'Password Changed',
                    text: 'Your password has been changed successfully.',
                    timer: 2000,
                    showConfirmButton: false
                }).then(() => {
                    window.location.href = '/rlogin';
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Change Failed',
                    text: data.message || 'Failed to change password. Please try again.',
                });
            }
        } catch (error) {
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'An error occurred while changing the password. Please try again.',
            });
        }
    });
});
