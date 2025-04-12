// script.js

const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');
const sourceFilter = document.getElementById('source-filter');
const issuesTable = document.getElementById('issues-table');
const modal = document.getElementById('issue-modal');
const closeModal = document.querySelector('.close-modal');
const modalResolveBtn = document.getElementById('modal-resolve');
const modalDeleteBtn = document.getElementById('modal-delete');
const emailTab = document.getElementById('email-tab');
const whatsappTab = document.getElementById('whatsapp-tab');

let currentIssueId = null;
let currentIssueSource = null;

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing event listeners');
    if (searchInput) searchInput.addEventListener('input', filterIssues);
    if (categoryFilter) categoryFilter.addEventListener('change', filterIssues);
    if (sourceFilter) sourceFilter.addEventListener('change', filterIssues);

    if (emailTab) {
        emailTab.addEventListener('click', (e) => {
            e.preventDefault();
            sourceFilter.value = 'email';
            filterIssues();
            setActiveTab(emailTab);
            console.log('Switched to Email tab');
        });
    }
    
    if (whatsappTab) {
        whatsappTab.addEventListener('click', (e) => {
            e.preventDefault();
            sourceFilter.value = 'whatsapp';
            filterIssues();
            setActiveTab(whatsappTab);
            console.log('Switched to WhatsApp tab');
        });
    }

    if (closeModal) closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
        console.log('Modal closed');
    });
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
            console.log('Modal closed by clicking outside');
        }
    });

    if (modalResolveBtn) modalResolveBtn.addEventListener('click', () => {
        if (currentIssueId) {
            console.log(`Resolving issue: ${currentIssueId}`);
            resolveIssue(currentIssueId).then(() => {
                modal.style.display = 'none';
            });
        } else {
            console.log('No issue ID selected for resolve');
            showNotification('No issue selected to resolve', 'error');
        }
    });

    if (modalDeleteBtn) modalDeleteBtn.addEventListener('click', () => {
        if (currentIssueId) {
            console.log(`Deleting issue: ${currentIssueId}`);
            deleteIssue(currentIssueId).then(() => {
                modal.style.display = 'none';
            });
        } else {
            console.log('No issue ID selected for delete');
            showNotification('No issue selected to delete', 'error');
        }
    });

    const menuToggle = document.createElement('div');
    menuToggle.className = 'menu-toggle';
    menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
    document.querySelector('.header-content')?.prepend(menuToggle);
    menuToggle.addEventListener('click', () => {
        document.querySelector('.sidebar')?.classList.toggle('active');
        console.log('Sidebar toggled');
    });

    fetchIssues();
    setInterval(fetchIssues, 10000); // Live updates every 10 seconds
    console.log('Initial fetch and interval set');
});

function setActiveTab(tab) {
    document.querySelectorAll('.sidebar nav ul li a').forEach(item => item.classList.remove('active'));
    tab.classList.add('active');
    console.log(`Active tab set to: ${tab.textContent}`);
}

function filterIssues() {
    console.log('Filtering issues');
    const searchTerm = (searchInput?.value || '').toLowerCase();
    const categoryValue = categoryFilter?.value || 'all';
    const sourceValue = sourceFilter?.value || 'all';
    const rows = issuesTable.querySelectorAll('tbody tr:not(.no-results)');
    let visibleRows = 0;

    rows.forEach(row => {
        const from = row.querySelector('td:nth-child(2)')?.textContent.toLowerCase() || '';
        const subject = row.querySelector('td:nth-child(3)')?.textContent.toLowerCase() || '';
        const body = row.querySelector('td:nth-child(4)')?.textContent.toLowerCase() || '';
        const to = row.querySelector('td:nth-child(5)')?.textContent.toLowerCase() + "@gmail.com" || '';
        console.log(to);
        const category = row.getAttribute('data-category') || 'Uncategorized';
        const source = row.getAttribute('data-source') || 'email';

        const matchesSearch = from.includes(searchTerm) || subject.includes(searchTerm) || body.includes(searchTerm);
        const matchesCategory = categoryValue === 'all' || category === categoryValue;
        const matchesSource = sourceValue === 'all' || source === sourceValue;

        row.style.display = matchesSearch && matchesCategory && matchesSource ? '' : 'none';
        if (matchesSearch && matchesCategory && matchesSource) visibleRows++;
    });

    const noResultsRow = issuesTable.querySelector('.no-results');
    if (visibleRows === 0 && !noResultsRow) {
        const tr = document.createElement('tr');
        tr.className = 'no-results';
        tr.innerHTML = '<td colspan="6">No matching issues found</td>';
        issuesTable.querySelector('tbody').appendChild(tr);
    } else if (visibleRows > 0 && noResultsRow) {
        noResultsRow.remove();
    }
    console.log(`Filtered: ${visibleRows} rows visible`);
}

function viewIssue(issueId) {
    console.log(`Viewing issue: ${issueId}`);
    currentIssueId = issueId;
    const row = document.querySelector(`tr[data-issue-id="${issueId}"]`);
    if (!row) {
        console.error(`Row not found for issue ${issueId}`);
        showNotification('Issue not found', 'error');
        return;
    }

    const source = row.getAttribute('data-source');
    currentIssueSource = source;
    document.getElementById('modal-source').textContent = source === 'whatsapp' ? 'WhatsApp' : 'Email';
    document.getElementById('modal-from').textContent = row.querySelector('td:nth-child(2)')?.textContent || 'Unknown';
    document.getElementById('modal-subject').textContent = row.querySelector('td:nth-child(3)')?.textContent || 'N/A';
    document.getElementById('modal-body').textContent = row.querySelector('td:nth-child(4)')?.textContent || 'N/A';
    document.getElementById('modal-to').textContent = row.querySelector('td:nth-child(5)')?.textContent.replace(" ","")+"@gmail.com" || 'N/A';
    
    document.getElementById('modal-category').textContent = row.getAttribute('data-category') || 'Uncategorized';
    document.getElementById('modal-timestamp').textContent = formatDate(row.getAttribute('data-timestamp'));
    document.getElementById('modal-resolve').style.display = row.classList.contains('resolved') ? 'none' : 'block';
    document.getElementById('subject-row').style.display = source === 'whatsapp' ? 'none' : '';
    modal.style.display = 'block';
}

function formatDate(dateString) {
    if (!dateString) return 'Not available';
    try {
        return new Date(dateString).toLocaleString();
    } catch (e) {
        console.error('Date format error:', e);
        return dateString;
    }
}

function resolveIssue(issueId) {
    console.log(`Attempting to resolve issue: ${issueId}`);
    return fetch(`/api/issues/${issueId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(response => {
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Issue not found on server');
            }
            throw new Error(`HTTP error ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Resolve response:', data);
        if (data.success) {
            showNotification('Issue marked as resolved', 'success');
            fetchIssues(); // Refresh immediately
        } else {
            showNotification(`Failed to resolve issue: ${data.error || 'Unknown error'}`, 'error');
        }
    })
    .catch(error => {
        console.error('Resolve error:', error);
        showNotification(`Error resolving issue: ${error.message}`, 'error');
    });
}

function deleteIssue(issueId) {
    console.log(`Attempting to delete issue: ${issueId}`);
    if (!confirm('Are you sure you want to delete this issue?')) return Promise.resolve();
    return fetch(`/api/issues/${issueId}/delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(response => {
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Issue not found on server');
            }
            throw new Error(`HTTP error ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Delete response:', data);
        if (data.success) {
            showNotification('Issue deleted successfully', 'success');
            fetchIssues(); // Refresh immediately
        } else {
            showNotification(`Failed to delete issue: ${data.error || 'Unknown error'}`, 'error');
        }
    })
    .catch(error => {
        console.error('Delete error:', error);
        showNotification(`Error deleting issue: ${error.message}`, 'error');
    });
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    const icon = type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle';
    notification.innerHTML = `<i class="fas fa-${icon}"></i><span>${message}</span>`;
    document.body.appendChild(notification);
    setTimeout(() => notification.classList.add('show'), 100);
    setTimeout(() => notification.remove(), 3000);
    console.log(`Notification shown: ${message} (${type})`);
}

function fetchIssues() {
    console.log('Fetching issues from /api/issues');
    fetch('/api/issues')
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error ${response.status}`);
            return response.json();
        })
        .then(issues => {
            console.log(`Received ${issues.length} issues:`, issues);
            renderIssues(issues);
        })
        .catch(error => {
            console.error('Fetch error:', error);
            showNotification('Failed to fetch issues', 'error');
        });
}

function renderIssues(issues) {
    console.log('Rendering issues');
    const tbody = issuesTable.querySelector('tbody');
    tbody.innerHTML = ''; // Clear existing rows

    if (issues.length === 0) {
        tbody.innerHTML = '<tr class="no-results"><td colspan="6">No issues found</td></tr>';
        console.log('No issues to render');
        return;
    }

    issues.forEach(issue => {
        const tr = document.createElement('tr');
        tr.setAttribute('data-issue-id', issue.id);
        tr.setAttribute('data-source', issue.source);
        tr.setAttribute('data-category', issue.category);
        tr.setAttribute('data-timestamp', issue.timestamp);
        if (issue.status === 'resolved') tr.classList.add('resolved');

        const categoryClass = issue.category.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-');
        tr.innerHTML = `
            <td><span class="source-badge ${issue.source}">${issue.source === 'whatsapp' ? 'WhatsApp' : 'Email'}</span></td>
            <td>${issue.from}</td>
            <td class="subject-cell">${issue.subject}</td>
            <td class="body-cell">${issue.body}</td>
            
            <td><span class="category-badge ${categoryClass}" ${issue.status === 'resolved' ? 'data-resolved="true"' : ''}>${issue.category}</span></td>
            <td class="actions">
                <button class="btn-view" title="View Details" onclick="viewIssue('${issue.id}')"><i class="fas fa-eye"></i></button>
                ${issue.status === 'resolved' ? 
                    '<span class="resolved-text"><i class="fas fa-check-double"></i> Resolved</span>' :
                    `<button class="btn-resolve" title="Mark as Resolved" onclick="resolveIssue('${issue.id}')"><i class="fas fa-check"></i></button>
                     <button class="btn-delete" title="Delete" onclick="deleteIssue('${issue.id}')"><i class="fas fa-trash"></i></button>`
                }
            </td>
        `;
        tbody.appendChild(tr);
    });

    filterIssues();
    console.log(`Rendered ${issues.length} issues`);
}