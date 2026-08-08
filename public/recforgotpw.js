function showotpform(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const enteredOtpElement = document.getElementById('enteredOtp');
    const enteredOtp = enteredOtpElement ? enteredOtpElement.value : '';

    if (!enteredOtp) {
        // Send OTP
        fetch('/send-otp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'OTP Sent',
                        text: 'OTP has been sent to your email.',
                    });
                    document.getElementById('otpform').style.display = 'flex';
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'There was an error sending the OTP. Please try again.',
                    });
                }
            })
            .catch(error => {
                console.error('Error:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error sending OTP. Please check your network connection.',
                });
            });
    } else {
        // Verify OTP
        verifyOtp(event);
    }
}

function verifyOtp(event) {
    event.preventDefault(); // Prevent form from submitting and page from reloading

    const enteredOtp = document.getElementById('enteredOtp').value;
    const email = document.getElementById('email').value;
    fetch('/rec-forgot-verify-otp', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ otp: enteredOtp, email })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'OTP Verified',
                    text: 'OTP verified successfully. Redirecting...',
                    timer: 2000,
                    showConfirmButton: false
                }).then(() => {
                    const encodedEmail = encodeURIComponent(data.email); // Encode the email to ensure URL safety
                    window.location.href = `/recchangepw?email=${encodedEmail}`; // Redirect with email query parameter
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Invalid OTP',
                    text: 'The OTP you entered is invalid. Please try again.',
                });
            }
        })
        .catch(error => {
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to verify OTP. Please check your network connection.',
            });
        });
}
