(function () {
    const CAREERS_EMAIL = 'info@brutusenterprise.com';
    const MAX_RESUME_BYTES = 5 * 1024 * 1024;
    const ALLOWED_RESUME_TYPES = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    const ALLOWED_RESUME_EXTENSIONS = ['.pdf', '.doc', '.docx'];

    const form = document.getElementById('careersApplyForm');
    if (!form) return;

    const nameInput = document.getElementById('applyName');
    const emailInput = document.getElementById('applyEmail');
    const phoneInput = document.getElementById('applyPhone');
    const roleSelect = document.getElementById('applyRole');
    const resumeInput = document.getElementById('applyResume');
    const resumeNameEl = document.getElementById('applyResumeName');
    const resumeClearBtn = document.getElementById('applyResumeClear');
    const linkInput = document.getElementById('applyLink');
    const messageInput = document.getElementById('applyMessage');
    const subjectInput = document.getElementById('applySubject');
    const charCount = document.getElementById('applyCharCount');
    const submitBtn = document.getElementById('applySubmitBtn');
    const successEl = document.getElementById('applySuccess');
    const errorEl = document.getElementById('applyError');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');

    function setRole(role) {
        if (!role || !roleSelect) return;
        const match = Array.from(roleSelect.options).find((opt) => opt.value === role);
        if (match) {
            roleSelect.value = role;
            updateSubject();
        }
    }

    function updateSubject() {
        const role = roleSelect.value || 'General Inquiry';
        subjectInput.value = `Career Application: ${role} — Brutus Enterprise Solutions`;
    }

    function scrollToApply() {
        const applySection = document.getElementById('apply');
        if (!applySection) return;
        const offsetTop = applySection.offsetTop - 80;
        window.scrollTo({ top: Math.max(0, offsetTop), behavior: 'smooth' });
        setTimeout(() => nameInput && nameInput.focus({ preventScroll: true }), 500);
    }

    document.querySelectorAll('.apply-role-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            setRole(btn.getAttribute('data-role'));
            scrollToApply();
        });
    });

    const params = new URLSearchParams(window.location.search);
    if (params.get('role')) setRole(params.get('role'));

    roleSelect.addEventListener('change', updateSubject);
    updateSubject();

    if (messageInput && charCount) {
        messageInput.addEventListener('input', () => {
            const count = messageInput.value.length;
            charCount.textContent = `${count} / 2000 characters`;
            charCount.style.color = count > 2000 ? '#dc2626' : '';
        });
    }

    function showError(input, message) {
        input.classList.add('error');
        input.classList.remove('valid');
        const group = input.closest('.form-group') || input.parentElement;
        const error = group.querySelector('.error-message');
        if (error) error.textContent = message || '';
    }

    function clearError(input) {
        input.classList.remove('error');
        const group = input.closest('.form-group') || input.parentElement;
        const error = group.querySelector('.error-message');
        if (error) error.textContent = '';
    }

    function validateEmail(value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }

    function getResumeFile() {
        return resumeInput.files && resumeInput.files[0] ? resumeInput.files[0] : null;
    }

    function hasAllowedResumeExtension(fileName) {
        const lower = fileName.toLowerCase();
        return ALLOWED_RESUME_EXTENSIONS.some((ext) => lower.endsWith(ext));
    }

    function updateResumeUI() {
        const file = getResumeFile();
        if (file) {
            resumeNameEl.textContent = file.name;
            resumeClearBtn.hidden = false;
            resumeInput.classList.add('valid');
            resumeInput.classList.remove('error');
        } else {
            resumeNameEl.textContent = 'Choose file';
            resumeClearBtn.hidden = true;
            resumeInput.classList.remove('valid', 'error');
        }
    }

    function validateResume() {
        clearError(resumeInput);
        const file = getResumeFile();

        if (!file) {
            showError(resumeInput, 'Please upload your resume');
            return false;
        }

        if (!hasAllowedResumeExtension(file.name) && !ALLOWED_RESUME_TYPES.includes(file.type)) {
            showError(resumeInput, 'Upload a PDF or Word document (.pdf, .doc, .docx)');
            return false;
        }

        if (file.size > MAX_RESUME_BYTES) {
            showError(resumeInput, 'Resume must be 5 MB or smaller');
            return false;
        }

        resumeInput.classList.add('valid');
        return true;
    }

    function validateField(input) {
        if (input === resumeInput) return validateResume();

        const value = input.value.trim();
        clearError(input);

        if (input.required && !value) {
            showError(input, 'This field is required');
            return false;
        }

        if (input === emailInput && value && !validateEmail(value)) {
            showError(input, 'Enter a valid email address');
            return false;
        }

        if (input === linkInput && value) {
            try {
                // eslint-disable-next-line no-new
                new URL(value);
            } catch (_) {
                showError(input, 'Enter a full URL including https://');
                return false;
            }
        }

        if (value) input.classList.add('valid');
        return true;
    }

    resumeInput.addEventListener('change', () => {
        updateResumeUI();
        validateResume();
    });

    resumeClearBtn.addEventListener('click', () => {
        resumeInput.value = '';
        updateResumeUI();
        clearError(resumeInput);
    });

    [nameInput, emailInput, roleSelect, linkInput, messageInput].forEach((input) => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => {
            if (input.classList.contains('error')) validateField(input);
        });
        input.addEventListener('change', () => {
            if (input.classList.contains('error')) validateField(input);
        });
    });

    function buildMailtoBody(data) {
        return [
            `Name: ${data.name}`,
            `Email: ${data.email}`,
            `Phone: ${data.phone || 'N/A'}`,
            `Position: ${data.position}`,
            `LinkedIn / Portfolio: ${data.resume_link || 'N/A'}`,
            `Resume file: ${data.resume_name || 'Attached separately'}`,
            '',
            data.message ? 'Cover note:' : 'Cover note: (none)',
            data.message || '',
            '',
            '(Please attach your resume to this email before sending.)'
        ].join('\n');
    }

    function openMailtoFallback(data) {
        const subject = encodeURIComponent(`Career Application: ${data.position}`);
        const body = encodeURIComponent(buildMailtoBody(data));
        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(CAREERS_EMAIL)}&su=${subject}&body=${body}`;
        const opened = window.open(gmailUrl, '_blank', 'noopener,noreferrer');
        if (!opened) {
            window.location.href = `mailto:${CAREERS_EMAIL}?subject=${subject}&body=${body}`;
        }
    }

    async function submitApplication(data) {
        const endpoint = `https://formsubmit.co/ajax/${CAREERS_EMAIL}`;
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('email', data.email);
        formData.append('phone', data.phone || 'N/A');
        formData.append('position', data.position);
        formData.append('linkedin_or_portfolio', data.resume_link || 'N/A');
        formData.append('message', data.message);
        formData.append('_subject', `Career Application: ${data.position} — Brutus Enterprise Solutions`);
        formData.append('_template', 'table');
        formData.append('_captcha', 'false');
        formData.append('attachment', data.resume_file, data.resume_file.name);

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                Accept: 'application/json'
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error('FormSubmit request failed');
        }

        const result = await response.json();
        if (result.success === 'false' || result.success === false) {
            throw new Error(result.message || 'Submission failed');
        }
        return result;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        successEl.style.display = 'none';
        errorEl.style.display = 'none';
        successEl.querySelector('span').textContent =
            "Application sent. We'll review it and get back to you soon.";

        const fields = [nameInput, emailInput, roleSelect];
        let valid = true;
        fields.forEach((field) => {
            if (!validateField(field)) valid = false;
        });
        if (!validateResume()) valid = false;
        if (linkInput.value.trim() && !validateField(linkInput)) valid = false;
        if (!valid) return;

        const resumeFile = getResumeFile();
        const data = {
            name: nameInput.value.trim(),
            email: emailInput.value.trim(),
            phone: phoneInput.value.trim(),
            position: roleSelect.value,
            resume_link: linkInput.value.trim(),
            message: messageInput.value.trim() || 'N/A',
            resume_file: resumeFile,
            resume_name: resumeFile ? resumeFile.name : ''
        };

        submitBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline-flex';

        try {
            await submitApplication(data);
            form.reset();
            updateSubject();
            updateResumeUI();
            charCount.textContent = '0 / 2000 characters';
            [nameInput, emailInput, phoneInput, roleSelect, resumeInput, linkInput, messageInput].forEach((input) => {
                input.classList.remove('valid', 'error');
            });
            successEl.style.display = 'flex';
            successEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } catch (err) {
            openMailtoFallback(data);
            errorEl.style.display = 'none';
            successEl.style.display = 'flex';
            successEl.querySelector('span').textContent =
                'Opening a Gmail draft with your details. Please attach your resume file before sending, or email info@brutusenterprise.com directly.';
        } finally {
            submitBtn.disabled = false;
            btnText.style.display = 'inline';
            btnLoader.style.display = 'none';
        }
    });
})();
