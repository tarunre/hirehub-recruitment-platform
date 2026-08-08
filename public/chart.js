


document.addEventListener('DOMContentLoaded', function() {
    const chart = document.querySelector('.chart');

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                chart.classList.add('visible');
                chart.classList.remove('hidden');
            } else {
                chart.classList.remove('visible');
                chart.classList.add('hidden');
            }
        });
    }, {
        threshold: 0.5 // Adjust the threshold value as needed
    });

    observer.observe(chart);
});




function initChart() {
    // Code to initialize the chart and animations
    // For example, assuming you're using Chart.js or similar:
    var ctx = document.getElementById('myChart').getContext('2d');
    var myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
            datasets: [{
                label: '# of Votes',
                data: [12, 19, 3, 5, 2, 3],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

var copy = document.querySelector(".logos-slide").cloneNode(true);
document.querySelector(".logos").appendChild(copy);
var copy1 = document.querySelector(".logos1-slide").cloneNode(true);
document.querySelector(".logos1").appendChild(copy1);
var copy2 = document.querySelector(".logos2-slide").cloneNode(true);
document.querySelector(".logos2").appendChild(copy2);
      