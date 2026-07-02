document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const openBtns = document.querySelectorAll('.open-rsvp-btn');
    const modal = document.getElementById('rsvp-modal');
    const closeBtn = document.getElementById('close-modal');
    const formView = document.getElementById('form-view');
    const ticketView = document.getElementById('ticket-view');
    const rsvpForm = document.getElementById('rsvp-form');
    const submitBtn = document.getElementById('submit-btn');
    const guestNameDisplay = document.getElementById('guest-name-display');
    const qrcodeContainer = document.getElementById('qrcode');
    const ticketIdDisplay = document.getElementById('ticket-id');
    const downloadBtn = document.getElementById('download-ticket');

    // Open Modal
    openBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            modal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        });
    });

    // Close Modal
    const closeModal = () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        
        // Reset view after animation
        setTimeout(() => {
            formView.style.display = 'block';
            ticketView.classList.remove('active');
            rsvpForm.reset();
            qrcodeContainer.innerHTML = ''; // Clear previous QR
        }, 400);
    };

    closeBtn.addEventListener('click', closeModal);

    // Close on overlay click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Form Submission
    rsvpForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = new FormData(rsvpForm);
        const name = formData.get('fullName');
        const email = formData.get('email');
        const phone = formData.get('phone');
        const company = formData.get('company');

        // Show loading state
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> PROCESSING...';
        submitBtn.disabled = true;

        // Simulate API call and generate QR code
        setTimeout(() => {
            // Generate a random ticket ID
            const ticketId = 'SA-' + Math.random().toString(36).substring(2, 8).toUpperCase();
            
            // Create data string for QR Code
            const qrData = JSON.stringify({
                id: ticketId,
                name: name,
                email: email,
                timestamp: new Date().toISOString()
            });

            // Update UI
            guestNameDisplay.textContent = name;
            ticketIdDisplay.textContent = 'TICKET ID: ' + ticketId;

            // Generate QR Code
            qrcodeContainer.innerHTML = '';
            new QRCode(qrcodeContainer, {
                text: qrData,
                width: 180,
                height: 180,
                colorDark: "#042419", // Emerald Dark
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });

            // Switch views
            formView.style.display = 'none';
            ticketView.classList.add('active');

            // Reset button
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;

        }, 1500); // 1.5s delay to simulate network request
    });

    // Download Ticket Action (Mock)
    downloadBtn.addEventListener('click', () => {
        alert('Ticket saved to your device!');
        closeModal();
    });

    // Smooth Scroll for links (if any anchor links added later)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});
