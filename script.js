const PCCentApp = (function () {
    // initial acc
    //localStorage.clear()
    const initialUsers = [
        { id: 'deanGo', pass: 'pcc123', name: 'Ronald Go', email: 'dean@pcc.edu', role: 'dean' },
        { id: 'gsu', pass: 'pcc123', name: 'GSU Account', email: 'gsu@pcc.edu', role: 'gsu' },
        { id: 'msAlmeda', pass: 'pcc123', name: 'Almeda Asuncion', email: 'teacher@pcc.edu', role: 'teacher' },
        { id: '24-0547', pass: 'pcc123', name: 'Trestan Pacalioga', email: 'student@pcc.edu', role: 'student' }
    ];

    let preRegisteredUsers = JSON.parse(localStorage.getItem('pccentUsers')) || initialUsers;

    // saving initial acc
    if (preRegisteredUsers.length === initialUsers.length && !localStorage.getItem('pccentUsers')) {
        localStorage.setItem('pccentUsers', JSON.stringify(preRegisteredUsers));
    }

    // helper function to save
    const saveUsers = () => localStorage.setItem('pccentUsers', JSON.stringify(preRegisteredUsers));

    const locations = [
        { name: 'Aula Minor', min: 300, max: 500, type: 'large' },
        { name: 'Classroom', min: 1, max: 40, type: 'small', rooms: 100 },
        { name: 'Ground', min: 501, max: 2000, type: 'huge' },
        { name: 'Gym', min: 101, max: 500, type: 'large' },
        { name: 'Mini Stage', min: 1, max: 20, type: 'tiny' },
        { name: 'SPC', min: 41, max: 100, type: 'medium' },
        { name: 'Stage', min: 10, max: 40, type: 'small' },
        { name: 'Tahanan ni Maria', min: 10, max: 50, type: 'medium' },
        { name: 'Veranda', min: 20, max: 60, type: 'medium' },
    ];

    let events = JSON.parse(localStorage.getItem('events')) || [];

    const saveEvents = () => localStorage.setItem('events', JSON.stringify(events));

    const isEventDone = (event) => {
        const eventEndTime = new Date(`${event.date}T${event.endTime}:00`).getTime();
        const now = new Date().getTime();
        return eventEndTime < now;
    }

    const handlePasswordChange = (e) => {
        e.preventDefault();
        const user = getCurrentUser();

        const currentPass = document.getElementById('currentPassword').value;
        const newPass = document.getElementById('newPassword').value;
        const confirmPass = document.getElementById('confirmPassword').value;

        const msg = document.getElementById('passwordMessage');
        const errMsg = document.getElementById('passwordErrorMessage');

        msg.style.display = 'none';
        errMsg.style.display = 'none';

        if (currentPass !== user.pass) {
            errMsg.textContent = 'Error: The Current Password you entered is incorrect.';
            errMsg.style.display = 'block';
            return;
        }

        if (newPass !== confirmPass) {
            errMsg.textContent = 'Error: New Password and Confirm Password do not match.';
            errMsg.style.display = 'block';
            return;
        }

        const userIndex = preRegisteredUsers.findIndex(u => u.id === user.id);
        if (userIndex !== -1) {
            preRegisteredUsers[userIndex].pass = newPass;

            const updatedUser = { ...user, pass: newPass };

            localStorage.setItem('pccentUsers', JSON.stringify(preRegisteredUsers));
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));

            msg.textContent = 'Success! Your password has been updated.';
            msg.style.display = 'block';

            document.getElementById('changePasswordForm').reset();
        }
    };

    // login & logout
    const handleLogin = (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        const errorMessage = document.getElementById('errorMessage');

        const user = preRegisteredUsers.find(
            u => (u.id === username || u.email === username) && u.pass === password
        );

        if (user) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            window.location.href = 'dashboard.html';
        } else {
            errorMessage.textContent = 'Invalid username/email or password.';
            errorMessage.style.display = 'block';
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    };

    const getCurrentUser = () => JSON.parse(localStorage.getItem('currentUser'));

    const setPageTitle = (title) => {
        document.getElementById('pageTitle').textContent = `PCCent - ${title}`;
        const headerTitle = document.getElementById('mainHeaderTitle');
        if (headerTitle) headerTitle.textContent = title;
    };

    const renderContent = (html) => {
        document.getElementById('appContent').innerHTML = html;
        document.querySelector('.main-content').scrollTop = 0;
    };

    const displayRole = (role) => {
        switch (role) {
            case 'dean': return 'Dean (Admin)';
            case 'gsu': return 'GSU (Admin)';
            case 'teacher': return 'PCC Teacher';
            case 'student': return 'PCC Student';
            default: return 'User';
        }
    }

    const getStatusClass = (status) => {
        switch (status) {
            case 'PENDING_DEAN':
                return 'status-pending_dean';
            case 'PENDING_GSU':
                return 'status-pending_head';
            case 'APPROVED':
                return 'status-approved';
            case 'REJECTED':
                return 'status-rejected';
            case 'CANCELLED':
                return 'status-rejected';
            default:
                return '';
        }
    };

    const calculateCost = (eventData) => {
        let totalCost = 0;
        let details = [];

        details.push({ item: 'Event Request', cost: 0 });

        // chairs
        const extraChairs = Math.max(0, eventData.chairs - 30);
        if (extraChairs > 0) {
            const chairCost = Math.ceil(extraChairs / 20) * 100;
            totalCost += chairCost;
            details.push({ item: `Extra Chairs (${eventData.chairs} total)`, cost: chairCost });
        } else {
            details.push({ item: 'Default Chairs (30)', cost: 0 });
        }

        // microphone
        const extraMics = Math.max(0, eventData.microphone - 2);
        if (extraMics > 0) {
            const micCost = extraMics * 100;
            totalCost += micCost;
            details.push({ item: `Extra Microphones (${eventData.microphone} total)`, cost: micCost });
        } else {
            details.push({ item: 'Default Microphones (2)', cost: 0 });
        }

        // sound system
        if (eventData.soundSystem) {
            totalCost += 300;
            details.push({ item: 'Sound System (₱300)', cost: 300 });
        }

        // staff
        if (eventData.staff) {
            const start = new Date(`${eventData.date}T${eventData.startTime}:00`);
            const end = new Date(`${eventData.date}T${eventData.endTime}:00`);
            if (end > start) {
                const durationHours = Math.ceil((end - start) / (1000 * 60 * 60));
                const staffCost = durationHours * 70;
                totalCost += staffCost;
                details.push({ item: `Staff (${durationHours} hours @ ₱70/hr)`, cost: staffCost });
            }
        }

        details.push({ item: 'TOTAL', cost: totalCost });

        return { totalCost, details };
    };

    const isConflict = (newRequest) => {
        const newStart = new Date(`${newRequest.date}T${newRequest.startTime}:00`);
        const newEnd = new Date(`${newRequest.date}T${newRequest.endTime}:00`);

        const newEndBuffer = new Date(newEnd.getTime() + 30 * 60000);

        return events.some(existingEvent => {
            if (existingEvent.location !== newRequest.location || existingEvent.status === 'REJECTED' || existingEvent.status === 'CANCELLED') {
                return false;
            }

            const existingStart = new Date(`${existingEvent.date}T${existingEvent.startTime}:00`);
            const existingEnd = new Date(`${existingEvent.date}T${existingEvent.endTime}:00`);
            const existingEndBuffer = new Date(existingEnd.getTime() + 30 * 60000);

            const startsBeforeExistingEnds = newStart < existingEndBuffer;
            const endsAfterExistingStarts = newEndBuffer > existingStart;

            return startsBeforeExistingEnds && endsAfterExistingStarts;
        });
    };

    const renderNav = (userRole) => {
        const navContainer = document.getElementById('sidebarNav');
        const isUser = userRole === 'student' || userRole === 'teacher';

        let navHtml = `
            <a href="#" data-view="home" class="nav-link active"><i class="fas fa-home"></i> Home</a>
        `;

        if (isUser) {
            navHtml += `
                <a href="#" data-view="request" class="nav-link"><i class="fas fa-calendar-plus"></i> Request</a>
                <a href="#" data-view="status" class="nav-link"><i class="fas fa-list-alt"></i> Status</a>
            `;
        } else {
            navHtml += `
                <a href="#" data-view="forApproval" class="nav-link"><i class="fas fa-hourglass-half"></i> For Approval</a>
                <a href="#" data-view="approved" class="nav-link"><i class="fas fa-check-circle"></i> Approved Events</a>
                <a href="#" data-view="rejected" class="nav-link"><i class="fas fa-times-circle"></i> Rejected Events</a>
                <a href="#" data-view="record" class="nav-link"><i class="fas fa-folder"></i> Record</a>
            `;
        }

        navHtml += `
            <a href="#" data-view="profile" class="nav-link"><i class="fas fa-user"></i> Profile</a>
        `;

        navContainer.innerHTML = `<nav>${navHtml}</nav>`;

        navContainer.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const view = link.getAttribute('data-view');
                document.querySelectorAll('.nav-link').forEach(a => a.classList.remove('active'));
                link.classList.add('active');
                loadView(view);
            });
        });
    };

    const loadView = (view) => {
        const user = getCurrentUser();
        if (!user) return handleLogout();

        setPageTitle(view.charAt(0).toUpperCase() + view.slice(1).replace(/([A-Z])/g, ' $1'));

        switch (view) {
            case 'home':
                renderHome(user.role);
                break;
            case 'profile':
                renderProfile(user);
                break;
            case 'request':
                renderRequestForm();
                break;
            case 'status':
                renderStatusView(user.id);
                break;
            case 'forApproval':
                renderApprovalView(user.role);
                break;
            case 'approved':
                renderAdminEvents('APPROVED');
                break;
            case 'rejected':
                renderAdminEvents('REJECTED');
                break;
            case 'record':
                renderRecord('RECORD');
                break;
            default:
                renderContent('<h2>404 Not Found</h2><p>The requested page does not exist.</p>');
        }
    };

    const renderHome = () => {
        setPageTitle('Upcoming Events');

        const upcomingEvents = events
            .filter(e => e.status === 'APPROVED' || e.status === 'PENDING_GSU')
            .filter(e => !isEventDone(e))
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        let content = `
            <div class="content-section">
                <div class="content-card">
                    <h3>All Upcoming Events</h3>
                    ${upcomingEvents.length > 0 ? `<div class="event-list">` : `<p>No upcoming events currently approved or pending final approval.</p>`}
                    ${upcomingEvents.map(e => `
                        <div class="event-card">
                            <h4>${e.name} (${e.location}${e.room ? ` - Room ${e.room}` : ''})</h4>
                            <p class="event-desc">${e.description}</p>
                            <div class="event-details">
                                <p><strong>Date:</strong> ${e.date} | <strong>Time:</strong> ${e.startTime} - ${e.endTime}</p>
                                <p><strong>Requested By:</strong> ${e.requesterName}</p>
                                <span class="event-status ${getStatusClass(e.status)}">${e.status.replace('_', ' ')}</span>
                            </div>
                        </div>
                    `).join('')}
                    ${upcomingEvents.length > 0 ? `</div>` : ``}
                </div>
            </div>
        `;
        renderContent(content);
    };

    const renderProfile = (user) => {
        setPageTitle('My Profile');
        const content = `
        <div class="content-section">
            <div class="content-card">
                <h3>User Details</h3>
                <div class="profile-details">
                    <div class="profile-picture">
                        ${user.name.charAt(0)}
                    </div>
                    <div>
                        <div class="detail-item"><strong>Full Name:</strong> ${user.name}</div>
                        <div class="detail-item"><strong>Email:</strong> ${user.email}</div>
                        <div class="detail-item"><strong>User Type:</strong> ${displayRole(user.role)}</div>
                        <div class="detail-item"><strong>User ID:</strong> ${user.id}</div>
                    </div>
                </div>
            </div>

            <div class="content-card" style="margin-top: 30px;">
                <h3>Change Password</h3>
                <form id="changePasswordForm">
                    <div id="passwordMessage" class="success-message" style="display:none;"></div>
                    <div id="passwordErrorMessage" class="error-message" style="display:none;"></div>

                    <div class="input-group">
                        <label for="currentPassword">Current Password *</label>
                        <input type="password" id="currentPassword" name="currentPassword" required>
                    </div>

                    <div class="input-group">
                        <label for="newPassword">New Password *</label>
                        <input type="password" id="newPassword" name="newPassword" required>
                    </div>

                    <div class="input-group">
                        <label for="confirmPassword">Confirm New Password *</label>
                        <input type="password" id="confirmPassword" name="confirmPassword" required>
                    </div>

                    <button type="submit" class="btn primary" style="width: auto;">Update Password</button>
                </form>
            </div>
        </div>
    `;
        renderContent(content);

        document.getElementById('changePasswordForm').addEventListener('submit', handlePasswordChange);
    };

    const renderRequestForm = () => {
        setPageTitle('New Event Request');
        const user = getCurrentUser();

        const now = new Date();
        const today = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
            .toISOString()
            .split('T')[0];

        const generateAndSetTimeOptions = (selectedDate) => {
            const startTimeSelect = document.getElementById('startTime');
            const endTimeSelect = document.getElementById('endTime');
            let timeOptionsHtml = '<option value="">Select Time</option>';

            const now = new Date();
            const isToday = selectedDate === today;

            for (let h = 7; h <= 22; h++) {
                for (let m of [0, 30]) {
                    // maximum time is 22:00 (10:00 PM)
                    if (h === 22 && m > 0) continue;

                    const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

                    if (isToday) {
                        const slotTime = new Date(`${selectedDate}T${timeStr}:00`);

                        if (slotTime.getTime() < now.getTime()) {
                            continue;
                        }
                    }

                    timeOptionsHtml += `<option value="${timeStr}">${timeStr}</option>`;
                }
            }

            if (startTimeSelect) startTimeSelect.innerHTML = timeOptionsHtml;
            if (endTimeSelect) endTimeSelect.innerHTML = timeOptionsHtml;
        };


        let content = `
            <div class="content-section">
                <div class="content-card">
                    <h3>Submit a New Request</h3>
                    <form id="eventRequestForm">
                        <div id="requestFormMessage" class="error-message" style="display:none;"></div>

                        <div class="input-group">
                            <label for="eventName">Event Name *</label>
                            <input type="text" id="eventName" name="eventName" required>
                        </div>
                        
                        <div class="input-group">
                            <label for="eventDescription">Event Description</label>
                            <textarea id="eventDescription" name="eventDescription" rows="3"></textarea>
                        </div>

                        <div class="input-group">
                            <label for="personCount">Number of People * (Must be 1 or more)</label>
                            <input type="number" id="personCount" name="personCount" min="1" required>
                        </div>

                        <div class="input-group">
                            <label for="location">Location *</label>
                            <select id="location" name="location" required disabled>
                                <option value="">Input Person Count first</option>
                            </select>
                        </div>
                        
                        <div class="input-group" id="classroomRoomGroup" style="display:none;">
                            <label for="classroomRoom">Classroom Room Number (1-100) *</label>
                            <input type="number" id="classroomRoom" name="classroomRoom" min="1" max="100">
                        </div>

                        <div class="input-group">
                            <label for="date">Date * (Mon-Sat only, Today or Future)</label>
                            <input type="date" id="date" name="date" min="${today}" required>
                        </div>
                        
                        <div class="input-group">
                            <label for="startTime">Start Time * (7:00am - 10:00pm, Future Only)</label>
                            <select id="startTime" name="startTime" required>
                                <option value="">Select Date First</option>
                            </select>
                        </div>

                        <div class="input-group">
                            <label for="endTime">End Time * (7:00am - 10:00pm, Future Only)</label>
                            <select id="endTime" name="endTime" required>
                                <option value="">Select Date First</option>
                            </select>
                        </div>

                        <h4>Additional Resources (Fees Apply)</h4>
                        <div class="input-group">
                            <label for="chairs">Chairs (Default 30, free)</label>
                            <input type="number" id="chairs" name="chairs" min="30" value="30">
                            <small>₱100 per 20 additional chairs (above 30).</small>
                        </div>
                        
                        <div class="input-group">
                            <label for="microphone">Microphones (Default 2, free)</label>
                            <input type="number" id="microphone" name="microphone" min="2" value="2">
                            <small>₱100 per 1 additional microphone (above 2).</small>
                        </div>

                        <div class="input-group">
                            <input type="checkbox" id="soundSystem" name="soundSystem" style="width: auto; margin-right: 10px;">
                            <label for="soundSystem" style="display: inline;">Sound System (₱300)</label>
                        </div>
                        
                        <div class="input-group">
                            <input type="checkbox" id="staff" name="staff" style="width: auto; margin-right: 10px;">
                            <label for="staff" style="display: inline;">Staff (₱70 per staff hour)</label>
                        </div>
                        
                        <button type="submit" class="btn primary">Submit Request</button>
                    </form>
                </div>
            </div>
        `;
        renderContent(content);

        // setup form logic
        const form = document.getElementById('eventRequestForm');
        const personCountInput = document.getElementById('personCount');
        const locationSelect = document.getElementById('location');
        const dateInput = document.getElementById('date');
        const classroomRoomGroup = document.getElementById('classroomRoomGroup');
        const classroomRoomInput = document.getElementById('classroomRoom');
        const errorMessage = document.getElementById('requestFormMessage');
        const modalContainer = document.getElementById('modal-container');
        const modalContent = document.getElementById('modalContent');
        const confirmRequestBtn = document.getElementById('confirmRequestBtn');
        const closeModalBtn = document.getElementById('closeModalBtn');
        let finalRequestData = null; // store data

        generateAndSetTimeOptions(today);
        dateInput.value = today;

        personCountInput.addEventListener('input', () => {
            const count = parseInt(personCountInput.value);
            locationSelect.innerHTML = '<option value="">Select Location</option>';
            locationSelect.disabled = true;

            if (count > 0) {
                const availableLocations = locations.filter(loc => count >= loc.min && count <= loc.max);
                availableLocations.forEach(loc => {
                    const option = document.createElement('option');
                    option.value = loc.name;
                    option.textContent = `${loc.name} (${loc.min}-${loc.max} persons)`;
                    locationSelect.appendChild(option);
                });
                locationSelect.disabled = false;
            }
            classroomRoomGroup.style.display = 'none';
            classroomRoomInput.removeAttribute('required');
        });

        locationSelect.addEventListener('change', () => {
            if (locationSelect.value === 'Classroom') {
                classroomRoomGroup.style.display = 'block';
                classroomRoomInput.setAttribute('required', 'required');
            } else {
                classroomRoomGroup.style.display = 'none';
                classroomRoomInput.removeAttribute('required');
            }
        });

        dateInput.addEventListener('change', () => {
            const selectedDateValue = dateInput.value;
            if (!selectedDateValue) {
                errorMessage.style.display = 'none';
                generateAndSetTimeOptions('');
                return;
            }

            const date = new Date(selectedDateValue + 'T00:00:00'); // T00:00:00 prevents timezone issues
            if (date.getDay() === 0) { // Sunday is 0
                errorMessage.textContent = 'Event requests are not allowed on Sundays.';
                errorMessage.style.display = 'block';
                dateInput.value = '';
                generateAndSetTimeOptions('');
            } else {
                errorMessage.style.display = 'none';
                generateAndSetTimeOptions(selectedDateValue);
            }
        });


        form.addEventListener('submit', (e) => {
            e.preventDefault();
            errorMessage.style.display = 'none';

            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            if (data.startTime >= data.endTime) {
                errorMessage.textContent = 'End Time must be after Start Time.';
                errorMessage.style.display = 'block';
                return;
            }

            const now = new Date();
            const eventStart = new Date(`${data.date}T${data.startTime}:00`);

            if (eventStart.getTime() < now.getTime()) {
                errorMessage.textContent = 'The selected Date and Start Time is in the past. Please select a future time.';
                errorMessage.style.display = 'block';
                return;
            }

            if (new Date(data.date + 'T00:00:00').getDay() === 0) {
                errorMessage.textContent = 'Sunday dates are not allowed.';
                errorMessage.style.display = 'block';
                return;
            }

            const eventData = {
                ...data,
                personCount: parseInt(data.personCount),
                chairs: parseInt(data.chairs),
                microphone: parseInt(data.microphone),
                soundSystem: data.soundSystem === 'on',
                staff: data.staff === 'on',
            };

            if (isConflict(eventData)) {
                errorMessage.textContent = `Time conflict detected! The location ${eventData.location} is busy during that period.`;
                errorMessage.style.display = 'block';
                return;
            }

            const { totalCost, details } = calculateCost(eventData);

            const eventNameValue = document.getElementById('eventName').value.trim();
            const eventDescriptionValue = document.getElementById('eventDescription').value.trim();

            // final data
            finalRequestData = {
                id: Date.now().toString(),
                name: eventNameValue || "Untitled Event",
                description: eventDescriptionValue || "No description provided.",
                personCount: parseInt(data.personCount),
                location: data.location,
                room: data.location === 'Classroom' ? data.classroomRoom : null,
                date: data.date,
                startTime: data.startTime,
                endTime: data.endTime,
                chairs: parseInt(data.chairs),
                microphone: parseInt(data.microphone),
                soundSystem: data.soundSystem === 'on',
                staff: data.staff === 'on',
                totalCost,
                items: details,
                requesterId: user.id,
                requesterName: user.name,
                status: 'PENDING_DEAN',
                approvedBy: {
                    dean: false,
                    gsu: false
                },
                signatures: {}
            };

            let detailsHtml = details.map(d =>
                `<p><strong>${d.item}:</strong> ₱${d.cost.toLocaleString('en-US')}</p>`
            ).join('');

            modalContent.innerHTML = `
                <div class="detail-item"><strong>Event:</strong> ${finalRequestData.name}</div>
                <div class="detail-item"><strong>Location:</strong> ${finalRequestData.location}${finalRequestData.room ? ` (Room ${finalRequestData.room})` : ''}</div>
                <div class="detail-item"><strong>Date:</strong> ${finalRequestData.date}</div>
                <div class="detail-item"><strong>Time:</strong> ${finalRequestData.startTime} - ${finalRequestData.endTime}</div>
                <div class="detail-item"><strong>Attendees:</strong> ${finalRequestData.personCount}</div>
                
                <h4 style="margin-top: 20px; color: var(--primary-dark);">Cost Breakdown:</h4>
                <div style="border: 1px dashed var(--border-color); padding: 15px; border-radius: 8px; font-size: 0.9em;">
                    ${detailsHtml}
                </div>
                <h3 style="margin-top: 15px; color: var(--error-color);">TOTAL PAYMENT DUE: ₱${totalCost.toLocaleString('en-US')}</h3>
                <p style="margin-top: 10px; color: var(--text-light); font-style: italic;">Note: You will be contacted for payment arrangements upon final approval.</p>
            `;
            modalContainer.style.display = 'flex';
        });

        closeModalBtn.onclick = () => {
            modalContainer.style.display = 'none';
            finalRequestData = null;
        };

        confirmRequestBtn.onclick = () => {
            events.push(finalRequestData);
            saveEvents();
            modalContainer.style.display = 'none';
            alert('Request submitted successfully and is now pending Dean approval.');
            loadView('status');
        };
    };

    const setupSignaturePad = (event, role, callback) => {
        const modal = document.getElementById('signatureModal');
        const canvas = document.getElementById('signatureCanvas');
        const ctx = canvas.getContext('2d');
        const clearBtn = document.getElementById('clearSignatureBtn');
        const confirmBtn = document.getElementById('confirmSignatureBtn');
        const closeBtn = document.getElementById('closeSignatureModalBtn');
        const prompt = document.getElementById('signaturePrompt');

        prompt.textContent = `Please, ${role.toUpperCase()}, draw your signature below:`;

        let drawing = false;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#000';

        const cleanupListeners = () => {
            canvas.removeEventListener('mousedown', startPosition);
            canvas.removeEventListener('mouseup', endPosition);
            canvas.removeEventListener('mousemove', draw);
            canvas.removeEventListener('touchstart', startPosition);
            canvas.removeEventListener('touchend', endPosition);
            canvas.removeEventListener('touchmove', draw);
        };

        const startPosition = (e) => {
            drawing = true;
            draw(e);
        };

        const endPosition = () => {
            drawing = false;
            ctx.beginPath();
        };

        const draw = (e) => {
            if (!drawing) return;
            if (e.touches) e.preventDefault();

            const rect = canvas.getBoundingClientRect();
            const x = (e.clientX || e.touches[0].clientX) - rect.left;
            const y = (e.clientY || e.touches[0].clientY) - rect.top;

            ctx.lineTo(x, y);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x, y);
        };

        canvas.addEventListener('mousedown', startPosition);
        canvas.addEventListener('mouseup', endPosition);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('touchstart', startPosition);
        canvas.addEventListener('touchend', endPosition);
        canvas.addEventListener('touchmove', draw);

        clearBtn.onclick = () => ctx.clearRect(0, 0, canvas.width, canvas.height);

        confirmBtn.onclick = () => {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
            const isCanvasBlank = !imageData.some(channel => channel !== 0);

            if (isCanvasBlank) {
                alert("Please draw your signature before confirming.");
                return;
            }

            const signatureDataURL = canvas.toDataURL('image/png');
            modal.style.display = 'none';
            cleanupListeners();
            callback(signatureDataURL);
        };

        closeBtn.onclick = () => {
            modal.style.display = 'none';
            cleanupListeners();
        };

        modal.style.display = 'flex';
    };

    const downloadEventApprovalPDF = (event, signatures) => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        doc.setFontSize(12);
        let y = 20;
        const lineSpacing = 7;
        const maxPageBottom = 270;
        const signatureGap = 25;

        // signature names
        const deanName = "Ronald Go";
        const gsuUser = preRegisteredUsers.find(u => u.role === 'gsu') || { name: "GSU President Name" };
        const gsuPresidentName = gsuUser.name;

        doc.text("PASIG CATHOLIC COLLEGE", 105, y, { align: "center" });
        y += lineSpacing;
        doc.text("OFFICE OF THE DEAN", 105, y, { align: "center" });
        y += 15;

        doc.text(`Date: ${event.date}`, 10, y);
        y += lineSpacing;
        doc.text(`To: ${event.requesterName}`, 10, y);
        y += lineSpacing;
        doc.text("Subject: Notification of Event Request Approval", 10, y);
        y += 15;

        let introBody = `Dear ${event.requesterName},

We are pleased to inform you that your request for the event titled "${event.name}" has been reviewed and approved by the College Administration. 

Event Details:
- Date: ${event.date}
- Time: ${event.startTime} - ${event.endTime}
- Location: ${event.location}${event.room ? ` - Room ${event.room}` : ''}

The following resources have been allocated for your event, and associated costs are as listed below:`;

        const introLines = doc.splitTextToSize(introBody, 180);
        introLines.forEach(line => {
            doc.text(line, 10, y);
            y += lineSpacing;
        });
        y += lineSpacing / 2; // small gap before list

        if (event.items && event.items.length > 0) {
            event.items.forEach((item, index) => {
                // FIX: Sanitize the item description to prevent garbled text (₱ and @ are the culprits)
                let displayItem = item.item;
                displayItem = displayItem.replace(/₱/g, 'PhP ').replace(/@/g, 'at ');

                const itemLine = `${index + 1}. ${displayItem}: PhP ${item.cost.toLocaleString('en-US')}`;
                doc.text(itemLine, 15, y); // 15 for slight indent
                y += lineSpacing;
            });
        } else {
            doc.text("No additional costs.", 15, y);
            y += lineSpacing;
        }

        y += lineSpacing; // gap after list

        let conclusionBody = `Please ensure compliance with all college policies and guidelines during your event. If there is a payment required, arrangements will be communicated separately; otherwise, no payment is necessary.

We wish you a successful and well-coordinated event.

Sincerely,
`;
        const conclusionLines = doc.splitTextToSize(conclusionBody, 180);
        conclusionLines.forEach(line => {
            doc.text(line, 10, y);
            y += lineSpacing;
        });

        const requiredSignatureHeight = 4 * lineSpacing;

        if ((y + signatureGap + requiredSignatureHeight) > maxPageBottom) {
            doc.addPage();
            y = 20;
        } else {
            y += signatureGap;
        }

        // --- Corrected and standardized Signature Block Logic ---
        const lineY = y; // Y coordinate for the underscore line
        const titleY = lineY + lineSpacing; // Y coordinate for the title (Dean / GSU President)
        const nameY = lineY + (lineSpacing * 2); // Y coordinate for the printed name
        const imageY = lineY - 14; // Y coordinate for the signature image
        const imageWidth = 50;
        const imageHeight = 15;

        // Dean's Signature (Left)
        const deanX = 10;
        doc.text("_______________________", deanX, lineY);
        if (signatures.dean) {
            doc.addImage(signatures.dean, 'PNG', deanX, imageY, imageWidth, imageHeight);
        }
        doc.text("Dean", deanX, titleY);
        doc.text(deanName, deanX, nameY);

        // GSU President's Signature (Right)
        const gsuX = 140;
        doc.text("_______________________", gsuX, lineY);
        if (signatures.gsu) {
            doc.addImage(signatures.gsu, 'PNG', gsuX, imageY, imageWidth, imageHeight);
        }
        doc.text("GSU President", gsuX, titleY);
        doc.text(gsuPresidentName, gsuX, nameY);
        // --- END Signature Block Logic ---

        doc.save(`${event.name.replace(/\s+/g, '_')}_Approval.pdf`);
    };

    const handleApprove = (eventId, role) => {
        const eventIndex = events.findIndex(ev => ev.id === eventId);
        if (eventIndex === -1) return;
        const event = events[eventIndex];

        // launch signature modal
        setupSignaturePad(event, role, (signatureDataURL) => {

            // update status ang signature data
            const currentEvent = events[eventIndex];
            currentEvent.approvedBy[role] = true;
            currentEvent.signatures[role] = signatureDataURL; // store the signature data

            let approvalStage = role === 'dean' ? 'Dean' : 'GSU';
            let nextStatus = '';

            if (role === 'dean') {
                nextStatus = 'PENDING_GSU';
            } else if (role === 'gsu') {
                nextStatus = 'APPROVED';
            }

            currentEvent.status = nextStatus;
            saveEvents();

            alert(`Event ID ${eventId} approved by ${approvalStage}. It is now ${nextStatus.replace('_', ' ')}.`);

            if (nextStatus === 'APPROVED') {
                downloadEventApprovalPDF(currentEvent, currentEvent.signatures);
            }

            loadView('forApproval'); // reload view
        });
    };

    const handleDelete = (eventId, reloadView) => {
        if (confirm('WARNING: Are you sure you want to permanently delete this event record? This action cannot be undone.')) {
            const eventIndex = events.findIndex(e => e.id === eventId);
            if (eventIndex !== -1) {
                const eventName = events[eventIndex].name;
                events.splice(eventIndex, 1);
                saveEvents();
                alert(`Event record for "${eventName}" deleted successfully.`);
                loadView(reloadView);
            }
        }
    };


    const renderStatusView = (userId) => {
        setPageTitle('My Event Status');
        const myRequests = events
            .filter(e => e.requesterId === userId)
            .sort((a, b) => new Date(b.id) - new Date(a.id)); // sort by newest first

        const generateListHtml = (filter) => {
            const filteredRequests = myRequests.filter(e => {
                if (filter === 'ALL') return true;
                if (filter === 'WAITING') return e.status.includes('PENDING');
                return e.status === filter;
            });

            return filteredRequests.map(e => {
                let actionButton = `
                    ${!e.status.includes('PENDING') ? `<button class="btn secondary view-btn" data-id="${e.id}">View Details</button>` : ''}
                    ${e.status.includes('PENDING') ? `<button class="btn reject cancel-btn" data-id="${e.id}">Cancel/Withdraw</button>` : ''}
                `;

                return `
                    <div class="event-card">
                        <h4>${e.name} (${e.location}${e.room ? ` - Room ${e.room}` : ''})</h4>
                        <div class="event-details">
                            <p><strong>Date:</strong> ${e.date} | <strong>Time:</strong> ${e.startTime} - ${e.endTime}</p>
                            <p><strong>Total Cost:</strong> ₱${e.totalCost?.toLocaleString('en-US') ?? '0'}</p>
                            <p><strong>Description:</strong> ${e.description
                        ? e.description.substring(0, 100) + (e.description.length > 100 ? '...' : '')
                        : 'No description provided'
                    }</p>
                            <span class="event-status ${getStatusClass(e.status)}">${e.status.replace('_', ' ')}</span>
                        </div>
                        <div class="event-actions">
                            ${actionButton}
                        </div>
                    </div>
                `;
            }).join('') || '<p>No events match the current filter.</p>';
        };

        const content = `
            <div class="content-section">
                <div class="content-card">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h3>My Requests</h3>
                        <div class="input-group" style="margin-bottom: 0; width: 200px;">
                            <select id="statusFilter" class="form-select">
                                <option value="ALL">All Statuses</option>
                                <option value="APPROVED">Approved</option>
                                <option value="REJECTED">Rejected</option>
                                <option value="WAITING">Waiting (Pending)</option>
                            </select>
                        </div>
                    </div>
                    
                    <div id="requestList" class="event-list">
                        ${generateListHtml('ALL')}
                    </div>
                </div>
            </div>
        `;
        renderContent(content);

        const renderEventDetails = (event) => {
            const detailsHtml = `
                <div class="event-details-view">
                    <h3>${event.name}</h3>
                    <p><strong>Date:</strong> ${event.date}</p>
                    <p><strong>Time:</strong> ${event.startTime} - ${event.endTime}</p>
                    <p><strong>Location:</strong> ${event.location}${event.room ? ` - Room ${event.room}` : ''}</p>
                    <p><strong>Total Cost:</strong> ₱${event.totalCost?.toLocaleString('en-US') ?? '0'}</p>
                    <p><strong>Description:</strong> ${event.description || 'No description provided'}</p>
                    <p><strong>Status:</strong> ${event.status.replace('_', ' ')}</p>   

                    ${event.status === 'APPROVED' ?
                    `<button class="btn secondary" id="downloadPdfBtn">Download Approval PDF</button><br><br>` :
                    `<i>Download available upon final approval.</i><br><br>`}
                
                    <button class="btn secondary back-btn">Back</button>
                </div>
            `;
            renderContent(detailsHtml);

            const downloadBtn = document.getElementById('downloadPdfBtn');
            if (downloadBtn) {
                downloadBtn.addEventListener('click', () => {
                    downloadEventApprovalPDF(event, event.signatures || {});
                });
            }

            document.querySelector('.back-btn').addEventListener('click', () => {
                renderStatusView(userId);
            });
        };

        const statusFilter = document.getElementById('statusFilter');
        const requestList = document.getElementById('requestList');

        statusFilter.addEventListener('change', (e) => {
            requestList.innerHTML = generateListHtml(e.target.value);
        });

        requestList.addEventListener('click', (e) => {
            if (e.target.classList.contains('view-btn')) {
                const eventId = e.target.getAttribute('data-id');
                const event = myRequests.find(e => e.id == eventId);
                if (event) renderEventDetails(event);
            }

            if (e.target.classList.contains('cancel-btn')) {
                const eventId = e.target.getAttribute('data-id');
                if (confirm('WARNING: Are you sure you want to cancel/withdraw this request? This action will permanently delete the event record.')) {
                    const eventIndex = events.findIndex(e => e.id === eventId);
                    if (eventIndex !== -1) {
                        const eventName = events[eventIndex].name;
                        events.splice(eventIndex, 1);
                        saveEvents();
                        alert(`Event request for "${eventName}" has been cancelled and its record has been permanently deleted.`);
                        loadView('status'); // reload
                    }
                }
            }
        });
    };

    const renderRecord = (filter) => {
        setPageTitle(filter === 'RECORD' ? 'All Event Records' : `${filter} Events`);

        let filteredEvents = events.sort((a, b) => new Date(b.id) - new Date(a.id));

        let content = `
        <div class="content-section">
            <div class="content-card">
                <h3>All Event Records</h3>
                ${filteredEvents.length > 0 ? `<div class="event-list" id="recordList">` : `<p>No event records found.</p>`}
                ${filteredEvents.map(e => {
            let actionButtons = `<button class="btn secondary view-btn" data-id="${e.id}">View Details</button>`;

            const canDelete = e.status !== 'APPROVED' || (e.status === 'APPROVED' && isEventDone(e));

            if (canDelete) {
                actionButtons += `<button class="btn reject delete-btn" data-id="${e.id}">Delete Record</button>`;
            }

            return `
                        <div class="event-card">
                            <h4>${e.name} (${e.location}${e.room ? ` - Room ${e.room}` : ''})</h4>
                            <div class="event-details">
                                <p><strong>Date:</strong> ${e.date}</p>
                                <p><strong>Time:</strong> ${e.startTime} - ${e.endTime}</p>
                                <p><strong>Requested By:</strong> ${e.requesterName}</p>
                                <p><strong>Status:</strong> <span class="${getStatusClass(e.status)}">${e.status.replace('_', ' ')}</span></p>
                                <p><strong>Total Cost:</strong> ₱${e.totalCost?.toLocaleString('en-US') ?? '0'}</p>
                            </div>
                            <div class="event-actions">
                                ${actionButtons}
                            </div>
                        </div>
                    `;
        }).join('')}
                ${filteredEvents.length > 0 ? `</div>` : ``}
            </div>
        </div>
    `;

        renderContent(content);

        const recordList = document.getElementById('recordList');
        if (recordList) {
            recordList.addEventListener('click', (e) => {
                const eventId = e.target.getAttribute('data-id');
                const eventData = events.find(ev => ev.id === eventId);

                if (e.target.classList.contains('view-btn') && eventData) {
                    const detailsHtml = `
                        <div class="content-section">
                            <div class="content-card">
                                <h3>${eventData.name}</h3>
                                <p><strong>Description:</strong> ${eventData.description || 'No description provided.'}</p>
                                <p><strong>Date:</strong> ${eventData.date}</p>
                                <p><strong>Time:</strong> ${eventData.startTime} - ${eventData.endTime}</p>
                                <p><strong>Location:</strong> ${eventData.location}${eventData.room ? ` - Room ${eventData.room}` : ''}</p>
                                <p><strong>Attendees:</strong> ${eventData.personCount}</p>
                                <p><strong>Total Cost:</strong> ₱${eventData.totalCost?.toLocaleString('en-US') ?? '0'}</p>
                                <p><strong>Requested By:</strong> ${eventData.requesterName}</p>
                                <p><strong>Status:</strong> <span class="${getStatusClass(eventData.status)}">${eventData.status.replace('_', ' ')}</span></p>
                                <button class="btn secondary" id="backToRecord">Back to Records</button>
                            </div>
                        </div>
                    `;
                    renderContent(detailsHtml);
                    document.getElementById('backToRecord').addEventListener('click', () => loadView('record'));
                }

                if (e.target.classList.contains('delete-btn')) {
                    handleDelete(eventId, 'record');
                }
            });
        }
    };


    const renderAdminEvents = (filterStatus) => {
        const today = new Date().toISOString().split('T')[0];
        let pageTitle = '';
        let filteredEvents = [];

        if (filterStatus === 'APPROVED') {
            pageTitle = 'Approved Events';
            filteredEvents = events.filter(e => e.status === 'APPROVED' && !isEventDone(e));
        } else if (filterStatus === 'REJECTED') {
            pageTitle = 'Rejected Events';
            filteredEvents = events.filter(e => e.status === 'REJECTED' || e.status === 'CANCELLED');
        }

        setPageTitle(pageTitle);

        let content = `
            <div class="content-section">
                <div class="content-card">
                    <h3>${pageTitle}</h3>
                    ${filteredEvents.length > 0 ? `<div class="event-list" id="${filterStatus}List">` : `<p>No events found in this status.</p>`}
                    ${filteredEvents.map(e => {
            let deleteButtonHtml = '';

            if (filterStatus === 'REJECTED') {
                deleteButtonHtml = `<button class="btn reject delete-btn" data-id="${e.id}">Delete Record</button>`;
            }

            return `
                            <div class="event-card">
                                <h4>${e.name} (${e.location}${e.room ? ` - Room ${e.room}` : ''})</h4>
                                <div class="event-details">
                                    <p><strong>Date:</strong> ${e.date} | <strong>Time:</strong> ${e.startTime} - ${e.endTime}</p>
                                    <p><strong>Requested By:</strong> ${e.requesterName}</p>
                                    <p><strong>Status:</strong> <span class="event-status ${getStatusClass(e.status)}">${e.status.replace('_', ' ')}</span></p>
                                </div>
                                <div class="event-actions">
                                    ${deleteButtonHtml}
                                </div>
                            </div>
                        `;
        }).join('')}
                    ${filteredEvents.length > 0 ? `</div>` : ``}
                </div>
            </div>
        `;
        renderContent(content);

        const listContainer = document.getElementById(`${filterStatus}List`);
        listContainer?.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-btn')) {
                const eventId = e.target.getAttribute('data-id');
                handleDelete(eventId, filterStatus.toLowerCase());
            }
        });
    };

    const renderApprovalView = (userRole) => {
        setPageTitle('Events For Approval');

        let targetStatus = userRole === 'dean' ? 'PENDING_DEAN' : 'PENDING_GSU';
        let approvalStage = userRole === 'dean' ? 'Dean' : 'GSU';

        const eventsForApproval = events
            .filter(e => e.status === targetStatus)
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        let content = `
            <div class="content-section">
                <div class="content-card">
                    <h3>Requests Awaiting ${approvalStage} Approval</h3>
                    ${eventsForApproval.length > 0 ? `<div class="event-list" id="approvalList">` : `<p>No events currently awaiting your approval.</p>`}
                    ${eventsForApproval.map(e => `
                        <div class="event-card">
                            <h4>${e.name} (${e.location}${e.room ? ` - Room ${e.room}` : ''})</h4>
                            <div class="event-details">
                                <p><strong>Date:</strong> ${e.date} | <strong>Time:</strong> ${e.startTime} - ${e.endTime}</p>
                                <p><strong>Requested By:</strong> ${e.requesterName}</p>
                                <p><strong>Attendees:</strong> ${e.personCount}</p>
                                <p><strong>Total Fee:</strong> ₱${e.totalCost.toLocaleString('en-US')}</p>
                            </div>
                            <div class="event-actions">
                                <button class="btn approve approve-btn" data-id="${e.id}" data-role="${userRole}">Approve</button>
                                <button class="btn reject reject-btn" data-id="${e.id}">Reject</button>
                                <button class="btn secondary view-btn" data-id="${e.id}">View Details</button>
                            </div>
                        </div>
                    `).join('')}
                    ${eventsForApproval.length > 0 ? `</div>` : ``}
                </div>
            </div>
        `;
        renderContent(content);

        const renderAdminEventDetails = (event, userRole) => {
            const itemsHtml = event.items.map(i => `<p>${i.item}: ₱${i.cost.toLocaleString('en-US')}</p>`).join('');

            const detailsHtml = `
                <div class="content-section">
                    <div class="content-card">
                        <h3>${event.name}</h3>
                        <p><strong>Description:</strong> ${event.description || 'No description provided.'}</p>
                        <p><strong>Date:</strong> ${event.date}</p>
                        <p><strong>Time:</strong> ${event.startTime} - ${event.endTime}</p>
                        <p><strong>Location:</strong> ${event.location}${event.room ? ` - Room ${event.room}` : ''}</p>
                        <p><strong>Attendees:</strong> ${event.personCount}</p>
                        <p><strong>Requested By:</strong> ${event.requesterName}</p>
                        <p><strong>Status:</strong> <span class="${getStatusClass(event.status)}">${event.status.replace('_', ' ')}</span></p>

                        <h4 style="margin-top: 20px;">Cost Breakdown:</h4>
                        <div style="border: 1px dashed var(--border-color); padding: 10px; margin-bottom: 20px;">
                            ${itemsHtml}
                            <p><strong>TOTAL: ₱${event.totalCost.toLocaleString('en-US')}</strong></p>
                        </div>

                        ${event.status === userRole.toUpperCase() ? `
                            <button class="btn approve approve-btn" data-id="${event.id}" data-role="${userRole}" style="margin-right: 10px;">Approve</button>
                            <button class="btn reject reject-btn" data-id="${event.id}" style="margin-right: 10px;">Reject</button>
                        ` : ''}
                        <button class="btn secondary back-btn">Back to Approvals</button>
                    </div>
                </div>
            `;
            renderContent(detailsHtml);

            document.querySelector('.back-btn').addEventListener('click', () => loadView('forApproval'));

            document.querySelectorAll('.approve-btn, .reject-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const eventId = e.target.getAttribute('data-id');
                    if (e.target.classList.contains('approve-btn')) {
                        handleApprove(eventId, userRole);
                    } else if (e.target.classList.contains('reject-btn')) {
                        if (confirm(`Are you sure you want to reject this request?`)) {
                            const eventIndex = events.findIndex(ev => ev.id === eventId);
                            if (eventIndex !== -1) {
                                events[eventIndex].status = 'REJECTED';
                                saveEvents();
                                alert(`Event ID ${eventId} rejected.`);
                                loadView('forApproval');
                            }
                        }
                    }
                });
            });
        };

        document.getElementById('approvalList')?.addEventListener('click', (e) => {
            const eventId = e.target.getAttribute('data-id');
            const eventIndex = events.findIndex(ev => ev.id === eventId);
            const eventData = events.find(ev => ev.id === eventId);

            if (eventIndex === -1) return;

            if (e.target.classList.contains('approve-btn')) {
                handleApprove(eventId, userRole);
            }

            if (e.target.classList.contains('reject-btn')) {
                if (confirm(`Are you sure you want to reject this request?`)) {
                    events[eventIndex].status = 'REJECTED';
                    saveEvents();
                    alert(`Event ID ${eventId} rejected.`);
                    loadView('forApproval'); // reload
                }
            }

            if (e.target.classList.contains('view-btn')) {
                if (eventData) renderAdminEventDetails(eventData, userRole);
            }
        });
    };

    const initDashboard = () => {
        const user = getCurrentUser();
        if (!user) return;

        // update user info
        const userInfoText = `Welcome, ${user.name} (${displayRole(user.role)})`;
        document.getElementById('userInfoDesktop').textContent = userInfoText;
        document.getElementById('userInfoMobile').textContent = userInfoText;

        // nav depends on role
        renderNav(user.role);

        // load home
        loadView('home');

        // for logout
        document.getElementById('desktopLogoutBtn').addEventListener('click', handleLogout);
        document.getElementById('mobileLogoutBtn').addEventListener('click', handleLogout);
    };

    const initLogin = () => {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', handleLogin);
        }
    }

    // auto run
    document.addEventListener('DOMContentLoaded', initLogin);

    return {
        initDashboard: initDashboard
    };

})();