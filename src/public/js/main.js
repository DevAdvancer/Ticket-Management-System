// DOM Elements
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const ticketSystem = document.getElementById('ticketSystem');
const showRegister = document.getElementById('showRegister');
const showLogin = document.getElementById('showLogin');
const ticketsContainer = document.getElementById('tickets');
const newTicketBtn = document.getElementById('newTicket');
const newTicketSection = document.getElementById('newTicketSection');
const userRoleElement = document.getElementById('userRole');

let isAdmin = false;

// Event Listeners
showRegister.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
});

showLogin.addEventListener('click', (e) => {
    e.preventDefault();
    registerForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
});

// New Ticket Form
newTicketBtn.addEventListener('click', () => {
    if (isAdmin) {
        alert('Admins cannot create tickets');
        return;
    }

    const newTicketForm = document.createElement('div');
    newTicketForm.className = 'bg-white p-6 rounded-lg shadow-lg mb-6';
    newTicketForm.innerHTML = `
        <div class="flex items-center mb-4">
            <svg class="h-6 w-6 text-green-600 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            <h3 class="text-xl font-semibold">Create New Ticket</h3>
        </div>
        <form id="createTicketForm" class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input type="text" name="title" required class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea name="description" required rows="4" class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"></textarea>
            </div>
            <div class="flex gap-4">
                <button type="submit" class="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center">
                    <svg class="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    Submit Ticket
                </button>
                <button type="button" class="cancel-ticket bg-gray-500 text-white py-2 px-6 rounded-lg hover:bg-gray-600 transition duration-200 flex items-center">
                    <svg class="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                    Cancel
                </button>
            </div>
        </form>
    `;
    
    ticketsContainer.insertBefore(newTicketForm, ticketsContainer.firstChild);
    
    // Cancel button handler
    newTicketForm.querySelector('.cancel-ticket').addEventListener('click', () => {
        newTicketForm.remove();
    });
    
    document.getElementById('createTicketForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        try {
            const response = await fetch('/api/tickets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: formData.get('title'),
                    description: formData.get('description'),
                }),
            });

            if (response.ok) {
                loadTickets();
                newTicketForm.remove();
            } else {
                const data = await response.json();
                alert(data.message || 'Failed to create ticket');
            }
        } catch (error) {
            console.error('Error creating ticket:', error);
            alert('An error occurred while creating the ticket');
        }
    });
});

// Login Form
document.getElementById('login').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: formData.get('username'),
                password: formData.get('password'),
            }),
        });

        const data = await response.json();
        if (response.ok) {
            isAdmin = data.role === 'admin';
            userRoleElement.querySelector('.role-text').textContent = isAdmin ? 'Admin' : 'User';
            if (isAdmin) {
                newTicketSection.classList.add('hidden');
            }
            loginForm.classList.add('hidden');
            ticketSystem.classList.remove('hidden');
            loadTickets();
        } else {
            alert('Login failed. Please check your credentials.');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('An error occurred during login.');
    }
});

// Register Form
document.getElementById('register').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: formData.get('username'),
                password: formData.get('password'),
            }),
        });

        if (response.ok) {
            alert('Registration successful! Please login.');
            registerForm.classList.add('hidden');
            loginForm.classList.remove('hidden');
        } else {
            const data = await response.json();
            alert(data.message || 'Registration failed. Please try again.');
        }
    } catch (error) {
        console.error('Registration error:', error);
        alert('An error occurred during registration.');
    }
});

// Logout
document.getElementById('logout').addEventListener('click', async () => {
    try {
        await fetch('/api/auth/logout', { method: 'POST' });
        ticketSystem.classList.add('hidden');
        loginForm.classList.remove('hidden');
        isAdmin = false;
        newTicketSection.classList.remove('hidden');
    } catch (error) {
        console.error('Logout error:', error);
    }
});

// Load Tickets
async function loadTickets() {
    try {
        const response = await fetch('/api/tickets');
        if (response.ok) {
            const tickets = await response.json();
            displayTickets(tickets);
        }
    } catch (error) {
        console.error('Error loading tickets:', error);
    }
}

// Display Tickets
function displayTickets(tickets) {
    const ticketElements = tickets.map(ticket => {
        const ticketElement = document.createElement('div');
        ticketElement.className = 'bg-white p-6 rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl';
        
        let adminControls = '';
        if (isAdmin) {
            adminControls = `
                <div class="mt-6 space-y-4">
                    <div class="flex items-center gap-4">
                        <select class="status-select px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent" data-ticket-id="${ticket._id}">
                            <option value="pending" ${ticket.status === 'pending' ? 'selected' : ''}>Pending</option>
                            <option value="ongoing" ${ticket.status === 'ongoing' ? 'selected' : ''}>Ongoing</option>
                            <option value="resolved" ${ticket.status === 'resolved' ? 'selected' : ''}>Resolved</option>
                            <option value="rejected" ${ticket.status === 'rejected' ? 'selected' : ''}>Rejected</option>
                        </select>
                        <button class="delete-ticket bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition duration-200 flex items-center" data-ticket-id="${ticket._id}">
                            <svg class="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                            Delete Ticket
                        </button>
                    </div>
                    <div class="flex gap-4">
                        <input type="text" class="comment-input flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Add a comment...">
                        <button class="add-comment bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700 transition duration-200 flex items-center" data-ticket-id="${ticket._id}">
                            <svg class="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                            </svg>
                            Add Comment
                        </button>
                    </div>
                </div>
            `;
        }

        ticketElement.innerHTML = `
            <div class="flex justify-between items-start">
                <div class="flex items-start">
                    <svg class="h-6 w-6 text-blue-600 mr-3 mt-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/>
                    </svg>
                    <h3 class="text-xl font-semibold text-gray-800">${ticket.title}</h3>
                </div>
                <span class="inline-block px-3 py-1 text-sm rounded-full ${getStatusColor(ticket.status)}">
                    ${ticket.status}
                </span>
            </div>
            <p class="text-gray-600 mt-3 ml-9">${ticket.description}</p>
            <p class="text-sm text-gray-500 mt-2 ml-9 flex items-center">
                <svg class="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
                Created by: ${ticket.creator.username}
            </p>
            ${adminControls}
            ${ticket.comments && ticket.comments.length > 0 ? `
                <div class="mt-6 border-t border-gray-200 pt-4">
                    <h4 class="font-medium text-gray-800 mb-3 flex items-center">
                        <svg class="h-5 w-5 text-gray-600 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/>
                        </svg>
                        Comments
                    </h4>
                    <div class="space-y-3">
                        ${ticket.comments.map(comment => `
                            <div class="bg-gray-50 p-3 rounded-lg">
                                <p class="text-gray-700">${comment.content}</p>
                                <p class="text-sm text-gray-500 mt-1 flex items-center">
                                    <svg class="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                                    </svg>
                                    By ${comment.admin.username}
                                </p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
        `;

        if (isAdmin) {
            // Status change
            ticketElement.querySelector('.status-select').addEventListener('change', async (e) => {
                const ticketId = e.target.dataset.ticketId; const newStatus = e.target.value;
                try {
                    const response = await fetch(`/api/tickets/${ticketId}/status`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ status: newStatus }),
                    });
                    if (response.ok) {
                        loadTickets();
                    }
                } catch (error) {
                    console.error('Error updating status:', error);
                }
            });

            // Delete ticket
            ticketElement.querySelector('.delete-ticket').addEventListener('click', async (e) => {
                if (confirm('Are you sure you want to delete this ticket?')) {
                    const ticketId = e.target.dataset.ticketId;
                    try {
                        const response = await fetch(`/api/tickets/${ticketId}`, {
                            method: 'DELETE',
                        });
                        if (response.ok) {
                            loadTickets();
                        } else {
                            const data = await response.json();
                            alert(data.message || 'Failed to delete ticket');
                        }
                    } catch (error) {
                        console.error('Error deleting ticket:', error);
                    }
                }
            });

            // Add comment
            ticketElement.querySelector('.add-comment').addEventListener('click', async (e) => {
                const ticketId = e.target.dataset.ticketId;
                const commentInput = e.target.parentElement.querySelector('.comment-input');
                const content = commentInput.value.trim();
                
                if (content) {
                    try {
                        const response = await fetch(`/api/tickets/${ticketId}/comments`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ content }),
                        });
                        if (response.ok) {
                            commentInput.value = '';
                            loadTickets();
                        }
                    } catch (error) {
                        console.error('Error adding comment:', error);
                    }
                }
            });
        }

        return ticketElement;
    });

    ticketsContainer.innerHTML = '';
    ticketElements.forEach(element => ticketsContainer.appendChild(element));
}

// Helper function for status colors
function getStatusColor(status) {
    const colors = {
        pending: 'bg-yellow-100 text-yellow-800',
        ongoing: 'bg-blue-100 text-blue-800',
        resolved: 'bg-green-100 text-green-800',
        rejected: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
}