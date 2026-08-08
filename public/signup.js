var coll = document.getElementsByClassName("collapsible");
var i;

for (i = 0; i < coll.length; i++) {
    coll[i].addEventListener("click", function () {
        this.classList.toggle("active");
        var content = this.nextElementSibling;
        if (content.style.maxHeight) {
            content.style.maxHeight = null;
        } else {
            content.style.maxHeight = content.rollHeight + "px";
        }
    });
}

function showotpform(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const name = document.getElementById('name').value;
    const roll = document.getElementById('roll').value;
    const password = document.getElementById('password').value;
    const enteredOtpElement = document.getElementById('enteredOtp');
    const enteredOtp = enteredOtpElement ? enteredOtpElement.value : '';

    if (!enteredOtp) {

        const batchStr = roll.slice(0,4);
        const program1 = roll.slice(4,7);

        const batch = parseInt(batchStr, 10);
        const program = program1.toUpperCase();

        console.log(batch);
        console.log(program);

        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth();

        const thirdYearBatch = currentYear - 2;
        const fourthYearBatch = currentYear - 3;

        const fourYearPrograms = ["BCS","EEE","MSC"];
        const fiveYearPrograms = ["IMG","IMT"];

        if(fourYearPrograms.includes(program)){
            if( !((batch < (currentYear-2)) || (batch == (currentYear-2) && (currentMonth > 4))) ) {
                console.log("akkada");
                alert('Access denied. Only pre-final and final-year students are allowed.');
                return;

            }
        }

        if(fiveYearPrograms.includes(program)){
            if( !((batch < (currentYear-3)) || (batch == (currentYear-3) && (currentMonth > 4))) ) {
                console.log("ikkada");
                alert('Access denied. Only pre-final and final students are allowed.');
                return;
            }
        }

        console.log("ekkadooo");

        // Send OTP
        fetch('/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email , name, roll, password})
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('OTP sent to your email');
                    document.getElementById('otpform').style.display = 'block';
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
        Signupverify(event);
        console.log('hey2')
    }
}

let otpFromServer = ''

function Signupverify(event) {
    console.log('hey3')
    event.preventDefault(); // Prevent form from submitting and page from reloading

    const enteredOtp = document.getElementById('enteredOtp').value;
    const email = document.getElementById('email').value;
    const name = document.getElementById('name').value;
    const roll = document.getElementById('roll').value;
    const password = document.getElementById('password').value;

        fetch('/signup-verify-otp', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ otp: enteredOtp , email, name, roll, password})
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('OTP verified successfully');
                window.location.href = '/login1'; 
            } else {
                alert('Invalid OTP');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error verifying OTP');
        });

}

