document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const openCoverBtn = document.getElementById('open-cover-btn');
    const cover = document.getElementById('invitation-cover');
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

    // Cover Page Logic
    if (openCoverBtn && cover) {
        // Prevent browser from remembering scroll position on refresh
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }
        window.scrollTo(0, 0);

        openCoverBtn.addEventListener('click', () => {
            cover.style.transform = 'translateY(-100vh)';
            document.body.classList.remove('locked');
            
            setTimeout(() => {
                cover.style.display = 'none';
            }, 1200);
        });
    }

    function lockScroll() {
        document.body.style.overflow = 'hidden';
    }

    function unlockScroll() {
        document.body.style.overflow = '';
    }

    // Open Modal
    openBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            modal.classList.add('active');
            lockScroll();
        });
    });

    // Close Modal
    const closeModal = () => {
        modal.classList.remove('active');
        unlockScroll();
        
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

        // Generate a random ticket ID
        const ticketId = 'SA-' + Math.random().toString(36).substring(2, 8).toUpperCase();
        
        // Data payload to send — must use the SAME Apps Script URL as scanner.js
        const requestData = {
            action: 'register',
            ticketId: ticketId,
            fullName: name,
            email: email,
            phone: phone,
            company: company
        };

        const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz8nJMp0P3IhJWG1nUYlo7H99dCunE8J3wWQeFWlagiISxIteSqX8lKJq2_xefoQVY/exec';
        const N8N_WEBHOOK_URL = 'https://n8n.feldi.web.id/webhook-test/8e78d5d3-ef1c-4c08-a57d-ad3bc9b6ff26';

        // Real API call to Google Sheets
        fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', // Critical for Google Apps Script
            body: JSON.stringify(requestData),
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            }
        })
        .then(() => {
            // 1. Trigger n8n Webhook to send Email & Barcode
            const n8nParams = new URLSearchParams({
                ticketId: ticketId,
                fullName: name,
                email: email,
                phone: phone,
                company: company
            }).toString();
            
            fetch(`${N8N_WEBHOOK_URL}?${n8nParams}`, {
                method: 'GET',
                mode: 'no-cors' // Use no-cors to prevent blocking the UI if n8n has CORS issues
            }).catch(err => console.error("Webhook n8n error:", err));

            // 2. Continue UI update for Ticket view
            
            // QR hanya perlu ticket id agar scanner mudah match ke kolom Sheet
            const qrData = JSON.stringify({
                id: ticketId,
                name: name,
                email: email,
                timestamp: new Date().toISOString()
            });

            // Update UI
            guestNameDisplay.textContent = name;
            ticketIdDisplay.textContent = name.toUpperCase();

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
        })
        .catch(error => {
            console.error('Error:', error);
            alert("Connection error. Please try again later.");
        })
        .finally(() => {
            // Reset button
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
        }); // 1.5s delay to simulate network request
    });

    // Download Ticket Action (Real Implementation with html2canvas)
    downloadBtn.addEventListener('click', () => {
        if (typeof html2canvas === 'undefined') {
            alert('Library html2canvas belum dimuat. Silakan refresh halaman.');
            return;
        }

        const originalBtnText = downloadBtn.innerHTML;
        downloadBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> SAVING...';
        downloadBtn.disabled = true;

        // Hide the download button itself from being captured
        downloadBtn.style.display = 'none';

        // Disable animation to prevent html2canvas capturing fading opacity
        const originalAnimation = ticketView.style.animation;
        ticketView.style.animation = 'none';

        html2canvas(ticketView, {
            backgroundColor: '#FAF7F2', // Match the modal background
            scale: 2, // High resolution
            logging: false
        }).then(canvas => {
            // Restore styles
            ticketView.style.animation = originalAnimation;
            downloadBtn.style.display = 'block';
            downloadBtn.innerHTML = originalBtnText;
            downloadBtn.disabled = false;

            // Trigger download
            const image = canvas.toDataURL("image/png");
            const link = document.createElement('a');
            link.download = 'SekarAyu_Ticket_' + ticketIdDisplay.textContent + '.png';
            link.href = image;
            link.click();
            
        }).catch(err => {
            console.error("Error saving ticket:", err);
            ticketView.style.animation = originalAnimation;
            downloadBtn.style.display = 'block';
            downloadBtn.innerHTML = originalBtnText;
            downloadBtn.disabled = false;
            alert("Terjadi kesalahan saat menyimpan tiket.");
        });
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

    // PDF Modal Logic
    const pdfModal = document.getElementById('pdf-modal');
    const openPdfBtn = document.getElementById('open-pdf-btn');
    const closePdfBtn = document.getElementById('close-pdf-modal');

    if (openPdfBtn && pdfModal && closePdfBtn) {
        openPdfBtn.addEventListener('click', (e) => {
            e.preventDefault();
            pdfModal.classList.add('active');
            lockScroll();
        });

        closePdfBtn.addEventListener('click', () => {
            pdfModal.classList.remove('active');
            unlockScroll();
        });

        pdfModal.addEventListener('click', (e) => {
            if (e.target === pdfModal) {
                pdfModal.classList.remove('active');
                unlockScroll();
            }
        });
    }
});
