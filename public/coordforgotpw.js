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
                    alert('OTP sent to your email');
                    document.getElementById('otpform').style.display = 'flex';
                } else {
                    alert('Error sending OTP');
                }
            })
            .catch(error => {
                console.error('Error:', error); 
                alert('Error sending OTP');
            });
    } else {
        // Verify OTP
        verifyOtp(event);
    }
}

let otpFromServer = ''

function verifyOtp(event) {
    event.preventDefault(); // Prevent form from submitting and page from reloading

    const enteredOtp = document.getElementById('enteredOtp').value;
    const email = document.getElementById('email').value;
    fetch('/verify-otp', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ otp: enteredOtp, email })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('OTP verified successfully');
                const email = encodeURIComponent(data.email); // Encode the email to ensure URL safety
                window.location.href = `/reset-password?email=${email}`; // Redirect with email query parameter
            } else {
                alert('Invalid OTP');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to verify OTP');
        });
}
