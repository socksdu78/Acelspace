import Chart from 'chart.js/auto';

const statusElement = document.getElementById('analytics-status');

function showStatus(message, isError = false) {
    statusElement.textContent = message;
    statusElement.classList.remove('hidden', 'border-red-900', 'bg-red-100', 'text-red-950');
    if (isError) statusElement.classList.add('border-red-900', 'bg-red-100', 'text-red-950');
}

async function loadAnalytics() {
    try {
        const authResponse = await fetch('/api/admin/check-auth', { cache: 'no-store' });
        if (!authResponse.ok) {
            window.location.replace('/admin.html');
            return;
        }

        const response = await fetch('/api/admin/analytics', { cache: 'no-store' });
        const data = await response.json();
        if (response.status === 401) {
            window.location.replace('/admin.html');
            return;
        }
        if (!response.ok) {
            throw new Error(data.message || `HTTP ${response.status}`);
        }
        if (!Array.isArray(data.dates) || !Array.isArray(data.pageviews)
            || !Array.isArray(data.topPages?.labels) || !Array.isArray(data.topPages?.data)) {
            throw new Error('Les données Analytics reçues sont invalides.');
        }

        renderCharts(data);
    } catch (error) {
        console.error('Erreur de chargement des statistiques Analytics :', error);
        showStatus(`Impossible de charger les statistiques : ${error.message}`, true);
    }
}

function renderCharts(data) {
    const chartFont = { family: 'Inter, system-ui, sans-serif', weight: '600' };
    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#0f172a',
                titleFont: chartFont,
                bodyFont: chartFont,
                padding: 12,
                displayColors: false
            }
        }
    };

    new Chart(document.getElementById('visits-chart'), {
        type: 'line',
        data: {
            labels: data.dates,
            datasets: [{
                label: 'Visites',
                data: data.pageviews,
                borderColor: '#0284c7',
                backgroundColor: 'rgba(14, 165, 233, 0.18)',
                pointBackgroundColor: '#0e7490',
                pointBorderColor: '#f6f3eb',
                pointBorderWidth: 3,
                pointRadius: 5,
                pointHoverRadius: 7,
                borderWidth: 3,
                fill: true,
                tension: 0.35
            }]
        },
        options: {
            ...commonOptions,
            scales: {
                x: { grid: { display: false }, ticks: { color: '#334155', font: chartFont } },
                y: { beginAtZero: true, grid: { color: 'rgba(100, 116, 139, 0.18)' }, ticks: { precision: 0, color: '#334155', font: chartFont } }
            }
        }
    });

    new Chart(document.getElementById('pages-chart'), {
        type: 'bar',
        data: {
            labels: data.topPages.labels,
            datasets: [{
                label: 'Pages vues',
                data: data.topPages.data,
                backgroundColor: ['#0284c7', '#0891b2', '#38bdf8'],
                borderColor: ['#075985', '#155e75', '#0369a1'],
                borderWidth: 2,
                borderRadius: 6,
                maxBarThickness: 64
            }]
        },
        options: {
            ...commonOptions,
            scales: {
                x: { grid: { display: false }, ticks: { color: '#334155', font: chartFont } },
                y: { beginAtZero: true, grid: { color: 'rgba(100, 116, 139, 0.18)' }, ticks: { precision: 0, color: '#334155', font: chartFont } }
            }
        }
    });
}

loadAnalytics();
