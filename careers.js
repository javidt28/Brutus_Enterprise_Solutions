(function () {
    const CAREERS_EMAIL = 'info@brutusenterprise.com';
    const form = document.getElementById('careersApplyForm');
    if (!form) return;

    const nameInput = document.getElementById('applyName');
    const emailInput = document.getElementById('applyEmail');
    const phoneInput = document.getElementById('applyPhone');
    const roleSelect = document.getElementById('applyRole');
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
        const error = input.parentElement.querySelector('.error-message');
        if (error) error.textContent = message || '';
    }

    function clearError(input) {
        input.classList.remove('error');
        const error = input.parentElement.querySelector('.error-message');
        if (error) error.textContent = '';
    }

    function validateEmail(value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }

    function validateField(input) {
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
                // Allow bare domains by requiring protocol
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
            `Resume / LinkedIn: ${data.resume_link || 'N/A'}`,
            '',
            'Cover note:',
            data.message
        ].join('\n');
    }

    function openMailtoFallback(data) {
        const subject = encodeURIComponent(`Career Application: ${data.position}`);
        const body = encodeURIComponent(buildMailtoBody(data));
        window.location.href = `mailto:${CAREERS_EMAIL}?subject=${subject}&body=${body}`;
    }

    async function submitApplication(data) {
        const endpoint = `https://formsubmit.co/ajax/${CAREERS_EMAIL}`;
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            body: JSON.stringify({
                name: data.name,
                email: data.email,
                phone: data.phone || 'N/A',
                position: data.position,
                resume_link: data.resume_link || 'N/A',
                message: data.message,
                _subject: `Career Application: ${data.position} — Brutus Enterprise Solutions`,
                _template: 'table',
                _captcha: 'false'
            })
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

        const fields = [nameInput, emailInput, roleSelect, messageInput];
        let valid = true;
        fields.forEach((field) => {
            if (!validateField(field)) valid = false;
        });
        if (linkInput.value.trim() && !validateField(linkInput)) valid = false;
        if (!valid) return;

        const data = {
            name: nameInput.value.trim(),
            email: emailInput.value.trim(),
            phone: phoneInput.value.trim(),
            position: roleSelect.value,
            resume_link: linkInput.value.trim(),
            message: messageInput.value.trim()
        };

        submitBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline-flex';

        try {
            await submitApplication(data);
            form.reset();
            updateSubject();
            charCount.textContent = '0 / 2000 characters';
            [nameInput, emailInput, phoneInput, roleSelect, linkInput, messageInput].forEach((input) => {
                input.classList.remove('valid', 'error');
            });
            successEl.style.display = 'flex';
            successEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } catch (err) {
            // Fallback: open the user's email client with a prefilled message
            openMailtoFallback(data);
            errorEl.style.display = 'none';
            successEl.style.display = 'flex';
            successEl.querySelector('span').textContent =
                'Opening a Gmail draft with your application. Send it to finish, or email info@brutusenterprise.com directly.';
        } finally {
            submitBtn.disabled = false;
            btnText.style.display = 'inline';
            btnLoader.style.display = 'none';
        }
    });
})();
