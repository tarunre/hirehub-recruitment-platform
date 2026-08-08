var coll = document.getElementsByClassName("collapsible");
var i;

for (i = 0; i < coll.length; i++) {
  coll[i].addEventListener("click", function() {
    this.classList.toggle("active");
    var content = this.nextElementSibling;
    if (content.style.maxHeight){
        content.style.maxHeight = null;
    } else {
        content.style.maxHeight = content.scrollHeight + "px";
    } 
  });
}



function showotpform(event) {
  event.preventDefault();
  const email = document.getElementById('email').value;
  const name = document.getElementById('name').value;
  const company = document.getElementById('company').value;
  const mobile= document.getElementById('mobile').value;
  const password = document.getElementById('password').value;
  const enteredOtpElement = document.getElementById('enteredOtp');
  const enteredOtp = enteredOtpElement ? enteredOtpElement.value : '';

  if (!enteredOtp) {
      // Send OTP
      fetch('/rsignup', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email , name, company, mobile, password})
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

          console.log('hey1')
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
  const company = document.getElementById('company').value;
  const mobile = document.getElementById('mobile').value;
  const password = document.getElementById('password').value;
  
  fetch('/rsignup-verify-otp', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ otp: enteredOtp , email, name, company, mobile, password})
  })
      .then(response => response.json())
      .then(data => {
          if (data.success) {
              alert('OTP verified successfully');
              window.location.href = '/rlogin'; 
          } else {
              alert('Invalid OTP');
          }
      })
      .catch(error => {
          console.error('Error:', error);
          alert('Error verifying OTP');
      });

}

