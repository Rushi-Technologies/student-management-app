// App script moved from index.html
const apiBase = '/api/students';

function showMessage(type, text) {
    const box = document.getElementById('messageBox');
    const alertType = type === 'error' ? 'alert-danger' : 'alert-success';
    box.innerHTML = `<div class="alert ${alertType} alert-dismissible" role="alert">` +
        `<div>${text}</div>` +
        `<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>` +
        `</div>`;
    // auto-dismiss after 5s
    setTimeout(() => { box.innerHTML = ''; }, 5000);
}

async function loadStudents() {
    try {
        const res = await fetch(apiBase);
        if (!res.ok) throw new Error(`Failed to load students: ${res.status} ${res.statusText}`);
        const students = await res.json();
        renderStudents(students);
    } catch (err) {
        showMessage('error', err.message);
    }
}

function renderStudents(students) {
    const tbody = document.getElementById('studentsTableBody');
    tbody.innerHTML = '';
    students.forEach((student, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${idx + 1}</td>
            <td>${escapeHtml(student.id || '')}</td>
            <td>${escapeHtml(student.name || '')}</td>
            <td>${escapeHtml(student.email || '')}</td>
            <td>${escapeHtml(student.phone || '')}</td>
            <td>${escapeHtml(student.gender || '')}</td>
            <td>${escapeHtml(student.age || '')}</td>
            <td>${escapeHtml(student.course || '')}</td>
            <td>
              <button type="button" class="btn btn-sm btn-info me-1" onclick="openViewModal('${student.id}','${student.name}','${student.email}','${student.phone}','${student.gender}','${student.age}','${student.course}')">View</button>
              <button type="button" class="btn btn-sm btn-primary me-1" onclick="openUpdateModal('${student.id}','${student.name}','${student.email}','${student.phone}','${student.gender}','${student.age}','${student.course}')">Update</button>
              <button type="button" class="btn btn-sm btn-danger" onclick="openDeleteModal('${student.id}')">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// basic HTML escape to avoid XSS when inserting string values
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// normalize phone to E.164-like format for Indian numbers: +91XXXXXXXXXX
function normalizePhone(raw) {
    if (!raw) return '';
    const digits = String(raw).replace(/[^0-9]/g, '');
    // if starts with 0 and 11 digits, drop leading 0
    if (/^0[6-9][0-9]{9}$/.test(digits)) {
        return '+91' + digits.slice(1);
    }
    // if 10 digits starting with 6-9
    if (/^[6-9][0-9]{9}$/.test(digits)) {
        return '+91' + digits;
    }
    // if starts with country code 91 and 12 digits
    if (/^91[6-9][0-9]{9}$/.test(digits)) {
        return '+'.concat(digits);
    }
    // fallback: return original cleaned digits (server-side will validate)
    return digits;
}

// Modal openers still populate inputs and show modals
function openUpdateModal(id, name, email, phone, gender, age, course) {
    document.getElementById('updateId').value = id || '';
    document.getElementById('updateName').value = name || '';
    document.getElementById('updateEmail').value = email || '';
    document.getElementById('updatePhone').value = phone || '';
    document.getElementById('updateGender').value = gender || '';
    document.getElementById('updateAge').value = age || '';
    document.getElementById('updateCourse').value = course || '';
    const modalEl = document.getElementById('exampleModalToggle2');
    let modal = bootstrap.Modal.getInstance(modalEl);
    if (!modal) modal = new bootstrap.Modal(modalEl);
    modal.show();
}

function openDeleteModal(id) {
    document.getElementById('deleteId').value = id || '';
    const modalEl = document.getElementById('exampleModalToggle3');
    let modal = bootstrap.Modal.getInstance(modalEl);
    if (!modal) modal = new bootstrap.Modal(modalEl);
    modal.show();
}

function openViewModal(id, name, email, phone, gender, age, course) {
    document.getElementById('viewId').value = id || '';
    document.getElementById('viewName').value = name || '';
    document.getElementById('viewEmail').value = email || '';
    document.getElementById('viewPhone').value = phone || '';
    document.getElementById('viewGender').value = gender || '';
    document.getElementById('viewAge').value = age || '';
    document.getElementById('viewCourse').value = course || '';
    const modalEl = document.getElementById('viewModal');
    let modal = bootstrap.Modal.getInstance(modalEl);
    if (!modal) modal = new bootstrap.Modal(modalEl);
    modal.show();
}

// clear create form inputs (avoid pre-filled stale values when opening modal)
function clearCreateForm() {
    const ids = ['createName','createEmail','createPhone','createGender','createAge','createCourse'];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        if (el.tagName === 'SELECT') {
            el.selectedIndex = 0; // choose first option
        } else {
            el.value = '';
        }
    });
}

// Form validation helpers: show inline messages, autofocus first invalid field
function clearValidation(form) {
    if (!form) return;
    form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
    form.querySelectorAll('.invalid-feedback').forEach(feedback => feedback.textContent = '');
}

function showFieldError(field, message) {
    if (!field) return;
    field.classList.add('is-invalid');
    const fb = field.parentElement.querySelector('.invalid-feedback');
    if (fb) fb.textContent = message;
}

function validateForm(form, mode = 'create') {
    // mode: 'create' | 'update'
    clearValidation(form);
    const firstInvalid = { el: null };

    function invalidate(el, msg) {
        if (!firstInvalid.el) firstInvalid.el = el;
        showFieldError(el, msg);
    }

    // helper to find by id inside form
    const id = (name) => form.querySelector('#' + name);

    // name: required, min len 2
    const nameEl = id(mode === 'create' ? 'createName' : 'updateName');
    if (nameEl) {
        const v = nameEl.value.trim();
        if (!v) invalidate(nameEl, 'Name is required');
        else if (v.length < 2) invalidate(nameEl, 'Name must be at least 2 characters');
    }

    // email: required and simple pattern
    const emailEl = id(mode === 'create' ? 'createEmail' : 'updateEmail');
    if (emailEl) {
        const v = emailEl.value.trim();
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!v) invalidate(emailEl, 'Email is required');
        else if (!emailPattern.test(v)) invalidate(emailEl, 'Enter a valid email address');
    }

    // phone: required for both create and update
    const phoneEl = id(mode === 'create' ? 'createPhone' : 'updatePhone');
    if (phoneEl) {
        const v = phoneEl.value.trim();
        if (!v) invalidate(phoneEl, 'Phone is required');
        else {
            // Indian phone validation: accept
            // - 10 digits starting with 6-9 (e.g. 9900012028)
            // - optional leading 0 (e.g. 09900012028)
            // - optional country code 91 (e.g. 919900012028) or +91 (will be normalized)
            const normalized = v.replace(/[^0-9]/g, '');
            const indian10 = /^[6-9][0-9]{9}$/; // 10-digit local mobile
            const leading0 = /^0[6-9][0-9]{9}$/; // 11-digit with leading 0
            const with91 = /^91[6-9][0-9]{9}$/; // 12-digit with country prefix 91
            if (!(indian10.test(normalized) || leading0.test(normalized) || with91.test(normalized))) {
                invalidate(phoneEl, 'Enter a valid Indian mobile number (10 digits) or with +91 / leading 0');
            }
        }
    }

    // age: required for both create and update; enforce min/max
    const ageEl = id(mode === 'create' ? 'createAge' : 'updateAge');
    if (ageEl) {
        const v = ageEl.value.trim();
        if (!v) invalidate(ageEl, 'Age is required');
        if (v) {
            const n = Number(v);
            if (Number.isNaN(n)) invalidate(ageEl, 'Age must be a number');
            else if (n < 18 || n > 65) invalidate(ageEl, 'Age must be between 18 and 65');
        }
    }

    // gender/course: if required in update, check
    const genderEl = id(mode === 'update' ? 'updateGender' : 'createGender');
    if (genderEl) {
        if (!genderEl.value) invalidate(genderEl, 'Gender is required');
    }

    const courseEl = id(mode === 'update' ? 'updateCourse' : 'createCourse');
    if (courseEl) {
        if (!courseEl.value) invalidate(courseEl, 'Course is required');
    }

    return firstInvalid.el;
}

// CRUD operations using REST API
async function createStudent() {
    // run custom inline validation first (shows inline messages), autofocus first invalid field
    const createForm = document.querySelector('#exampleModalToggle1 form');
    const firstInvalid = validateForm(createForm, 'create');
    if (firstInvalid) {
        firstInvalid.focus();
        return;
    }

    const student = {
        name: document.getElementById('createName').value.trim(),
        email: document.getElementById('createEmail').value.trim(),
        phone: normalizePhone(document.getElementById('createPhone').value.trim()),
        gender: document.getElementById('createGender').value,
        age: parseInt(document.getElementById('createAge').value, 10) || null,
        course: document.getElementById('createCourse').value
    };
    try {
        const res = await fetch(apiBase, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(student)
        });
        if (!res.ok) {
            // try to parse structured server validation errors
            const contentType = res.headers.get('Content-Type') || '';
            let payload = null;
            if (contentType.includes('application/json')) {
                try { payload = await res.json(); } catch (e) { payload = null; }
            } else {
                payload = await res.text();
            }
            // map server-side field errors into form if possible
            const createForm = document.querySelector('#exampleModalToggle1 form');
            const mapped = mapServerErrorsToForm(createForm, 'create', payload);
            if (mapped) {
                // focus/visual on first mapped field
                mapped.focus();
                applyInvalidVisual(mapped);
                return;
            }
            const errText = typeof payload === 'string' ? payload : JSON.stringify(payload);
            throw new Error(errText || `${res.status} ${res.statusText}`);
        }
        const data = await res.json();
        showMessage('success', `Student created (ID: ${data.id})`);
        // close modal
        const modalEl = document.getElementById('exampleModalToggle1');
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
        // reload list
        loadStudents();
    } catch (err) {
        showMessage('error', err.message || 'Failed to create student');
    }
}

async function updateStudent() {
    // run custom inline validation first (shows inline messages), autofocus first invalid field
    const updateForm = document.querySelector('#exampleModalToggle2 form');
    const firstInvalidUpdate = validateForm(updateForm, 'update');
    if (firstInvalidUpdate) {
        firstInvalidUpdate.focus();
        return;
    }

    const id = document.getElementById('updateId').value;
    const student = {
        id,
        name: document.getElementById('updateName').value.trim(),
        email: document.getElementById('updateEmail').value.trim(),
        phone: normalizePhone(document.getElementById('updatePhone').value.trim()),
        gender: document.getElementById('updateGender').value,
        age: parseInt(document.getElementById('updateAge').value, 10) || null,
        course: document.getElementById('updateCourse').value
    };
    try {
        const res = await fetch(`${apiBase}/${encodeURIComponent(id)}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(student)
        });
        if (!res.ok) {
            if (res.status === 404) throw new Error('Student not found');
            const contentType = res.headers.get('Content-Type') || '';
            let payload = null;
            if (contentType.includes('application/json')) {
                try { payload = await res.json(); } catch (e) { payload = null; }
            } else {
                payload = await res.text();
            }
            const updateForm = document.querySelector('#exampleModalToggle2 form');
            const mapped = mapServerErrorsToForm(updateForm, 'update', payload);
            if (mapped) { mapped.focus(); applyInvalidVisual(mapped); return; }
            const errText = typeof payload === 'string' ? payload : JSON.stringify(payload);
            throw new Error(errText || `${res.status} ${res.statusText}`);
        }
        const data = await res.json();
        showMessage('success', `Student updated (ID: ${data.id})`);
        const modalEl = document.getElementById('exampleModalToggle2');
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
        loadStudents();
    } catch (err) {
        showMessage('error', err.message || 'Failed to update student');
    }
}

async function deleteStudent() {
    const id = document.getElementById('deleteId').value;
    try {
        const res = await fetch(`${apiBase}/${encodeURIComponent(id)}`, { method: 'DELETE' });
        if (!res.ok) {
            if (res.status === 404) throw new Error('Student not found');
            const errText = await res.text();
            throw new Error(errText || `${res.status} ${res.statusText}`);
        }
        showMessage('success', `Student deleted (ID: ${id})`);
        const modalEl = document.getElementById('exampleModalToggle3');
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
        loadStudents();
    } catch (err) {
        showMessage('error', err.message || 'Failed to delete student');
    }
}

// Map server-side validation payload into inline form feedback.
// Accepts common shapes from Spring Boot or custom APIs:
// - { fieldErrors: [{field:'name', message:'...'}] }
// - { errors: [{ field: 'name', defaultMessage: '...' } ] }
// - { errors: { name: '...' } }
// - { field: 'name', message: '...' } or plain {message: '...'}
function mapServerErrorsToForm(form, mode, payload) {
    if (!form || !payload) return null;

    // helper to map field name -> input element
    function fieldEl(fieldName) {
        const id = (mode === 'create' ? 'create' : 'update') + fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
        return form.querySelector('#' + id);
    }

    // collect errors into array of {field, msg}
    const out = [];
    if (Array.isArray(payload.fieldErrors)) {
        payload.fieldErrors.forEach(fe => { out.push({ field: fe.field, msg: fe.message || fe.defaultMessage || JSON.stringify(fe) }); });
    } else if (Array.isArray(payload.errors)) {
        payload.errors.forEach(e => {
            if (e.field) out.push({ field: e.field, msg: e.message || e.defaultMessage || JSON.stringify(e) });
            else out.push({ field: null, msg: e.message || JSON.stringify(e) });
        });
    } else if (payload.errors && typeof payload.errors === 'object' && !Array.isArray(payload.errors)) {
        // map entries
        Object.keys(payload.errors).forEach(k => out.push({ field: k, msg: payload.errors[k] }));
    } else if (payload.field && payload.message) {
        out.push({ field: payload.field, msg: payload.message });
    } else if (payload.message && typeof payload.message === 'string') {
        // generic message - show as form-level error if present
        const formLevel = form.querySelector('#updateErrorMessage') || form.querySelector('#createErrorMessage');
        if (formLevel) {
            formLevel.style.display = 'block';
            formLevel.textContent = payload.message;
            return form.querySelector('input,select,textarea');
        }
        return null;
    } else {
        return null;
    }

    // apply to form controls
    let firstEl = null;
    out.forEach(item => {
        if (!item.field) return;
        const el = fieldEl(item.field);
        if (el) {
            showFieldError(el, item.msg || 'Invalid value');
            if (!firstEl) firstEl = el;
        }
    });
    return firstEl;
}

// small visual cue: shake + highlight
function applyInvalidVisual(el) {
    if (!el) return;
    el.classList.add('invalid-highlight');
    el.classList.add('shake');
    const clear = () => { el.classList.remove('shake'); };
    el.addEventListener('animationend', clear, { once: true });
}

async function deleteAllStudents() {
    const confirmation = document.getElementById('deleteAllConfirmation').value.trim();
    if (confirmation.toLowerCase() !== 'yes') {
        showMessage('error', "Type 'Yes' (case-insensitive) to confirm delete all");
        return;
    }
    try {
        const res = await fetch(apiBase, { method: 'DELETE' });
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        showMessage('success', 'All students deleted');
        const modalEl = document.getElementById('deleteAllModal4');
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
        loadStudents();
    } catch (err) {
        showMessage('error', err.message || 'Failed to delete all students');
    }
}

// wire up buttons after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    loadStudents();
    document.getElementById('createSubmit').addEventListener('click', createStudent);
    document.getElementById('updateSubmit').addEventListener('click', updateStudent);
    document.getElementById('deleteSubmit').addEventListener('click', deleteStudent);
    document.getElementById('deleteAllSubmit').addEventListener('click', deleteAllStudents);
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) refreshBtn.addEventListener('click', loadStudents);

    // ensure create modal inputs are cleared every time the modal is shown
    const createModalEl = document.getElementById('exampleModalToggle1');
    if (createModalEl) {
        createModalEl.addEventListener('show.bs.modal', () => {
            clearCreateForm();
        });
    }

    // clear inline validation feedback on input/change inside create/update forms
    const createForm = document.querySelector('#exampleModalToggle1 form');
    if (createForm) {
        createForm.addEventListener('input', (e) => {
            const t = e.target;
            if (!t) return;
            t.classList.remove('is-invalid');
            const fb = t.parentElement && t.parentElement.querySelector('.invalid-feedback');
            if (fb) fb.textContent = '';
        });
    }
    const updateForm = document.querySelector('#exampleModalToggle2 form');
    if (updateForm) {
        updateForm.addEventListener('input', (e) => {
            const t = e.target;
            if (!t) return;
            t.classList.remove('is-invalid');
            const fb = t.parentElement && t.parentElement.querySelector('.invalid-feedback');
            if (fb) fb.textContent = '';
        });
    }

    // initialize bootstrap tooltips (info icons)
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (el) {
        return new bootstrap.Tooltip(el);
    });

    // set copyright year in footer
    const y = new Date().getFullYear();
    const el = document.getElementById('copyrightYear');
    if (el) el.textContent = y;
});
