// analytics.js
const sourceFilter = document.getElementById('source-filter');
const timeFilter = document.getElementById('time-filter');
let categoryChart = null;
let statusChart = null;
let issuesData = [];
let lastDataHash = null; // Track data to avoid redundant redraws

document.addEventListener('DOMContentLoaded', () => {
    console.log('Analytics page loaded');
    
    if (sourceFilter) sourceFilter.addEventListener('change', updateCharts);
    if (timeFilter) timeFilter.addEventListener('change', updateCharts);
    
    const menuToggle = document.createElement('div');
    menuToggle.className = 'menu-toggle';
    menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
    document.querySelector('.header-content')?.prepend(menuToggle);
    menuToggle.addEventListener('click', () => {
        document.querySelector('.sidebar')?.classList.toggle('active');
        console.log('Sidebar toggled');
    });
    
    fetchIssuesData();
    setInterval(fetchIssuesData, 30000); // Keep live updates
});

function fetchIssuesData() {
    console.log('Fetching issues data for analytics');
    fetch('/api/issues')
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error ${response.status}`);
            return response.json();
        })
        .then(data => {
            console.log(`Received ${data.length} issues for analytics`);
            issuesData = data;
            updateCharts();
        })
        .catch(error => {
            console.error('Error fetching issues data:', error);
            showNotification('Failed to fetch analytics data', 'error');
        });
}

function filterIssuesData(data, sourceValue, timeValue) {
    console.log(`Filtering data - source: ${sourceValue}, time: ${timeValue}`);
    let filtered = [...data];
    
    if (sourceValue !== 'all') {
        filtered = filtered.filter(issue => issue.source === sourceValue);
    }
    
    const now = new Date();
    filtered = filtered.filter(issue => {
        const issueDate = new Date(issue.timestamp);
        switch (timeValue) {
            case 'today':
                return issueDate.toDateString() === now.toDateString();
            case 'week':
                const weekAgo = new Date(now);
                weekAgo.setDate(now.getDate() - 7);
                return issueDate >= weekAgo;
            case 'month':
                const monthAgo = new Date(now);
                monthAgo.setMonth(now.getMonth() - 1);
                return issueDate >= monthAgo;
            case 'all':
            default:
                return true;
        }
    });
    
    return filtered;
}

function updateSummaryStats(filteredData) {
    console.log('Updating summary stats');
    const totalIssues = filteredData.length;
    const resolvedIssues = filteredData.filter(issue => issue.status === 'resolved').length;
    const pendingIssues = filteredData.filter(issue => issue.status === 'pending').length;
    const resolutionRate = totalIssues > 0 ? ((resolvedIssues / totalIssues) * 100).toFixed(1) + '%' : '0%';
    
    document.getElementById('total-issues').textContent = totalIssues;
    document.getElementById('resolved-issues').textContent = resolvedIssues;
    document.getElementById('pending-issues').textContent = pendingIssues;
    document.getElementById('resolution-rate').textContent = resolutionRate;
}

function generateCategoryData(filteredData) {
    console.log('Generating category data');
    const categoryCounts = {};
    filteredData.forEach(issue => {
        const category = issue.category || 'Uncategorized';
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });
    return {
        labels: Object.keys(categoryCounts),
        data: Object.values(categoryCounts)
    };
}

function generateStatusData(filteredData) {
    console.log('Generating status data');
    const resolved = filteredData.filter(issue => issue.status === 'resolved').length;
    const pending = filteredData.filter(issue => issue.status === 'pending').length;
    return {
        labels: ['Resolved', 'Pending'],
        data: [resolved, pending]
    };
}

function renderCategoryChart(categoryData) {
    console.log('Rendering category chart');
    const ctx = document.getElementById('category-chart').getContext('2d');
    
    if (categoryChart) {
        categoryChart.destroy(); // Clear old chart
    }
    
    categoryChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: categoryData.labels,
            datasets: [{
                label: 'Issues by Category',
                data: categoryData.data,
                backgroundColor: 'rgba(74, 108, 247, 0.6)',
                borderColor: 'rgba(74, 108, 247, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, title: { display: true, text: 'Number of Issues' } },
                x: { title: { display: true, text: 'Category' } }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

function renderStatusChart(statusData) {
    console.log('Rendering status chart');
    const ctx = document.getElementById('status-chart').getContext('2d');
    
    if (statusChart) {
        statusChart.destroy(); // Clear old chart
    }
    
    statusChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: statusData.labels,
            datasets: [{
                label: 'Issues by Status',
                data: statusData.data,
                backgroundColor: ['rgba(46, 205, 111, 0.6)', 'rgba(245, 101, 101, 0.6)'],
                borderColor: ['rgba(46, 205, 111, 1)', 'rgba(245, 101, 101, 1)'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top' }
            }
        }
    });
}

function updateCharts() {
    const sourceValue = sourceFilter?.value || 'all';
    const timeValue = timeFilter?.value || 'all';
    
    console.log(`Updating charts with filters - source: ${sourceValue}, time: ${timeValue}`);
    
    const filteredData = filterIssuesData(issuesData, sourceValue, timeValue);
    updateSummaryStats(filteredData);
    
    const categoryData = generateCategoryData(filteredData);
    const statusData = generateStatusData(filteredData);
    
    // Simple hash to check if data changed (optional optimization)
    const dataHash = JSON.stringify(categoryData) + JSON.stringify(statusData);
    if (dataHash === lastDataHash) {
        console.log('Data unchanged, skipping chart redraw');
        return;
    }
    lastDataHash = dataHash;
    
    renderCategoryChart(categoryData);
    renderStatusChart(statusData);
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    const icon = type === 'success' ? 'check-circle' : 'error' ? 'exclamation-circle' : 'info-circle';
    notification.innerHTML = `<i class="fas fa-${icon}"></i><span>${message}</span>`;
    document.body.appendChild(notification);
    setTimeout(() => notification.classList.add('show'), 100);
    setTimeout(() => notification.remove(), 3000);
    console.log(`Notification shown: ${message} (${type})`);
}