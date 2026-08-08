const slidingPage = document.getElementById('sliding-page');

window.onload = function () {
  setTimeout(function () {
    slidingPage.classList.add('active');
  }, 5000); // Delay animation by 1 second
}

document.getElementById('menu-toggle').addEventListener('click', function() {
  var navBarUl = document.querySelector('#nav-bar ul');
  navBarUl.classList.toggle('show');
  this.classList.toggle('active'); // Toggle the active class on the button
  this.textContent = this.classList.contains('active') ? '✖' : '☰'; // Change button content
})


const openButton = document.getElementById('open-button');
const openButton1 = document.getElementById('open-button1');
const frame = document.getElementById('frame');
const frame1 = document.getElementById('frame1');
const closeButton = document.getElementById('close-button');
const closeButton1 = document.getElementById('close-button1');
const overlay = document.getElementById('overlay');

const alumni_btn=document.getElementById('alumni-btn');
const rankings_btn=document.getElementById('rankings-btn');
const dev_btn=document.getElementById('dev-btn');
const frame_alumni=document.getElementById('frame-alumni');
const frame_rankings=document.getElementById('frame-rankings');
const frame_develop=document.getElementById('frame-develop');
const alumni_close=document.getElementById('alumni-close');
const rankings_close=document.getElementById('rankings-close');
const develop_close=document.getElementById('develop-close');

function disableScrolling() {
  document.body.style.overflow = 'hidden';
}

function enableScrolling() {
  document.body.style.overflow = '';
}

function showFrame(frame) {
  frame.classList.add('visible');
  overlay.classList.add('visible');
  disableScrolling();
}

openButton.addEventListener('click', function () {
  showFrame(frame);
});

openButton1.addEventListener('click', function () {
  showFrame(frame1);
});

alumni_btn.addEventListener('click', function () {
  showFrame(frame_alumni);
});

rankings_btn.addEventListener('click', function () {
  showFrame(frame_rankings);
});

dev_btn.addEventListener('click', function () {
  showFrame(frame_develop);
});

closeButton.addEventListener('click', function () {
  frame.classList.remove('visible'); // Close frame
  overlay.classList.remove('visible'); // Hide overlay
  enableScrolling(); // Enable background scrolling
});

closeButton1.addEventListener('click', function () {
  frame1.classList.remove('visible'); // Close frame1
  overlay.classList.remove('visible'); // Hide overlay
  enableScrolling(); // Enable background scrolling
});

alumni_close.addEventListener('click', function () {
  frame_alumni.classList.remove('visible');
  overlay.classList.remove('visible');
  enableScrolling();
});

rankings_close.addEventListener('click', function () {
  frame_rankings.classList.remove('visible');
  overlay.classList.remove('visible');
  enableScrolling();
});

develop_close.addEventListener('click', function () {
  frame_develop.classList.remove('visible');
  overlay.classList.remove('visible');
  enableScrolling();
});

overlay.addEventListener('click', function () {
  frame.classList.remove('visible'); // Close frame
  frame1.classList.remove('visible'); // Close frame1
  frame_alumni.classList.remove('visible');
  frame_rankings.classList.remove('visible');
  frame_develop.classList.remove('visible');
  overlay.classList.remove('visible'); // Hide overlay
  enableScrolling(); // Enable background scrolling
});

window.addEventListener('DOMContentLoaded', function() {
  var cdp = document.getElementById('cdp');
  var clg = document.getElementById('clg');
  var navBar = document.getElementById('nav-bar');
  

  function updateNavbarPosition() {
      var isLogoPresent = cdp || clg;
      if (!isLogoPresent && window.pageYOffset > navBar.offsetTop) {
          navBar.classList.add('fixed-navbar');
      } else {
          navBar.classList.remove('fixed-navbar');
      }
  }

  window.addEventListener('scroll', function() {
      updateNavbarPosition();
  });

  // Call the function once to set the initial state
  updateNavbarPosition();
});

document.getElementById('pdf-link').addEventListener('click', function() {
  window.open('C:\BTP PROJECT\brochure.pdf', '_blank');
});


window.addEventListener('scroll', function() {
  const infoBox = document.querySelector('.dirmsg');
  const scrollPosition = window.scrollY || document.documentElement.scrollTop;

  if (scrollPosition > 200) { // Adjust this value to determine when the animation should trigger
      infoBox.classList.add('show');
  } else {
      infoBox.classList.remove('show');
  }
});

window.addEventListener('scroll', function() {
  const infoBox = document.getElementById('dirmsg');
  const scrollPosition = window.scrollY || document.documentElement.scrollTop;

  if (scrollPosition > 200) { // Adjust this value to determine when the animation should trigger
      infoBox.classList.add('show');
  } else {
      infoBox.classList.remove('show');
  }
});


(function() {
	const items = document.querySelectorAll('.timeline li');
	
	function isItemInViewport(el) {
		let rect = el.getBoundingClientRect();
		
		return (
			rect.top >= 0 && 
			rect.left >= 0 && 
			rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && 
			rect.right <= (window.innerWidth || document.documentElement.clientWidth)
		);
	}
	
	function slideIn() {
		for(let i = 0; i < items.length; i++) {
			if(isItemInViewport(items[i])) {
				items[i].classList.add('slide-in');
			} else {
				items[i].classList.remove('slide-in');
			};
		};
	}
	
	window.addEventListener('load', slideIn);
	window.addEventListener('scroll', slideIn);
	window.addEventListener('resize', slideIn);
}());

