let chartInstance;
const teamColors = {
    "Sunrisers Hyderabad": "orange",
    "Mumbai Indians": "lightblue",
    "Royal Challengers Bengaluru": "red",
    "Kolkata Knight Riders": "purple",
    "Punjab Kings": "maroon",
    "Chennai Super Kings": "yellow",
    "Rajasthan Royals": "pink",
    "Delhi Capitals": "darkblue",
    "Lucknow Super Giants": "cyan",
    "Gujarat Titans": "navy"
};

function drawPieChart(win, loss, battingTeam, bowlingTeam, position = 'above') {
    // Remove existing chart
    const oldChart = document.getElementById('predictionChart');
    if (oldChart && chartInstance) {
        chartInstance.destroy();
        oldChart.remove();
    }

    // Create new canvas
    const canvas = document.createElement('canvas');
    canvas.id = 'predictionChart';
    canvas.width = 300;
    canvas.height = 300;

    // Find the image
    const img = document.querySelector('.vk-img');
    if (!img) {
        console.error("Image with class '.vk-img' not found!");
        return;
    }

    // Insert chart above or below image
    if (position === 'above') {
        img.parentNode.insertBefore(canvas, img);
    } else {
        img.parentNode.insertBefore(canvas, img.nextSibling);
    }

    // Colors
    const winColor = teamColors[battingTeam] || '#4CAF50';
    const lossColor = teamColors[bowlingTeam] || '#F44336';

    // Draw chart
    const ctx = canvas.getContext('2d');
    chartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: [`${battingTeam} (Win)`, `${bowlingTeam} (Win)`],
            datasets: [{
                data: [win, loss],
                backgroundColor: [winColor, lossColor],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#333',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return `${context.label}: ${context.parsed}%`;
                        }
                    }
                }
            }
        }
    });
}


function isValidOvers(overs) {
    const oversFloat = parseFloat(overs);
    if (isNaN(oversFloat) || oversFloat < 0 || oversFloat > 20) return false;

    const [whole, decimal] = overs.split('.');
    if (decimal && (parseInt(decimal) > 5 || decimal.length > 1)) return false;

    return true;
}

function showOversError(show) {
    const oversError = document.getElementById('oversError');
    oversError.style.display = show ? 'block' : 'none';
}

async function predict_lr() {
    const overs = document.getElementById('overs').value;
    if (!isValidOvers(overs)) {
        showOversError(true);
        return;
    } else {
        showOversError(false);
    }

    const data = {
        batting_team: document.getElementById('batting_team').value,
        bowling_team: document.getElementById('bowling_team').value,
        city: document.getElementById('city').value,
        target: document.getElementById('target').value,
        score: document.getElementById('score').value,
        overs,
        wickets: document.getElementById('wickets').value
    };

    const res = await fetch('/predict-lr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    const result = await res.json();

    document.getElementById('result_lr').innerHTML = `
        <h3>${data.batting_team}: ${result.win}%</h3>
        <h3>${data.bowling_team}: ${result.loss}%</h3>
    `;

    drawPieChart(result.win, result.loss, data.batting_team, data.bowling_team, 'above');
}

async function predict_rfc() {
    const overs = document.getElementById('overs').value;
    if (!isValidOvers(overs)) {
        showOversError(true);
        return;
    } else {
        showOversError(false);
    }

    const data = {
        batting_team: document.getElementById('batting_team').value,
        bowling_team: document.getElementById('bowling_team').value,
        city: document.getElementById('city').value,
        target: document.getElementById('target').value,
        score: document.getElementById('score').value,
        overs,
        wickets: document.getElementById('wickets').value
    };

    const res = await fetch('/predict-rfc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    const result = await res.json();

    document.getElementById('result_rfc').innerHTML = `
        <h3>${data.batting_team}: ${result.win}%</h3>
        <h3>${data.bowling_team}: ${result.loss}%</h3>
    `;

    drawPieChart(result.win, result.loss, data.batting_team, data.bowling_team, 'below');
}

document.getElementById('predictionForm').addEventListener('submit', function (e) {
    e.preventDefault(); // prevent page reload
    const form = e.target;

    if (!form.checkValidity()) {
        form.reportValidity(); // show native validation errors
        return;
    }

    predict_lr(); // call your prediction function
});
