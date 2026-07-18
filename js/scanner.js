document.addEventListener('DOMContentLoaded', () => {
    const resultModal = document.getElementById('result-modal');
    const scannedDataContainer = document.getElementById('scanned-data');
    const scanNextBtn = document.getElementById('scan-next-btn');
    const switchCameraBtn = document.getElementById('switch-camera-btn');

    let html5QrcodeScanner;
    let isScanning = false;

    // Initialize scanner configuration
    const config = { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]
    };

    // On successful scan
    const onScanSuccess = (decodedText, decodedResult) => {
        if (!isScanning) return;
        
        // Pause scanning to prevent multiple scans
        isScanning = false;
        html5QrcodeScanner.pause();

        // Show data in modal
        scannedDataContainer.innerText = decodedText;
        
        // Display modal
        resultModal.classList.add('active');
        
        // Optional: Play a beep sound
        playBeep();
    };

    // On scan error (ignore, usually just means no QR found yet)
    const onScanFailure = (error) => {
        // console.warn(`Code scan error = ${error}`);
    };

    // Start Scanner
    html5QrcodeScanner = new Html5QrcodeScanner("reader", config, /* verbose= */ false);
    html5QrcodeScanner.render(onScanSuccess, onScanFailure);
    isScanning = true;

    // Handle "Scan Next" button
    scanNextBtn.addEventListener('click', () => {
        resultModal.classList.remove('active');
        scannedDataContainer.innerText = '';
        
        // Resume scanning
        setTimeout(() => {
            if (html5QrcodeScanner.getState() === Html5QrcodeScannerState.PAUSED) {
                html5QrcodeScanner.resume();
            }
            isScanning = true;
        }, 500);
    });

    // Custom Switch Camera logic (if needed, though HTML5-QRCode provides its own)
    switchCameraBtn.addEventListener('click', () => {
        // html5-qrcode has built-in camera switching, but it's deeply nested.
        // If we want a custom button to do it, we'd need to use Html5Qrcode directly instead of Html5QrcodeScanner.
        // For now, we will simulate a click on the internal switch button if it exists.
        const internalSwitchBtn = document.getElementById('html5-qrcode-button-camera-permission');
        if (internalSwitchBtn) {
            internalSwitchBtn.click();
        } else {
            alert('Silakan gunakan kontrol di layar kamera untuk memilih kamera.');
        }
    });

    // Simple beep sound generator
    function playBeep() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();
            
            osc.connect(gainNode);
            gainNode.connect(ctx.destination);
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, ctx.currentTime);
            
            gainNode.gain.setValueAtTime(0, ctx.currentTime);
            gainNode.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.05);
            gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
            
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.2);
        } catch(e) {
            console.error('AudioContext not supported');
        }
    }
});
