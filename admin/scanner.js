import { Html5Qrcode } from 'html5-qrcode';

const messageElement = document.getElementById('scan-message');
const errorElement = document.getElementById('scanner-error');
let scanner;
let scanInProgress = false;

function showMessage(message, success) {
    messageElement.textContent = message;
    messageElement.className = `w-full rounded-lg border-2 px-4 py-5 text-center text-xl font-black ${
        success ? 'border-emerald-300 bg-emerald-700 text-white' : 'border-red-300 bg-red-800 text-white'
    }`;
}

function hideMessage() {
    messageElement.classList.add('hidden');
    messageElement.textContent = '';
}

function showError(message) {
    errorElement.textContent = message;
    errorElement.classList.remove('hidden');
}

async function startScanner() {
    if (!scanner) scanner = new Html5Qrcode('qr-reader');
    await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        handleScan
    );
}

async function handleScan(decodedText) {
    if (scanInProgress) return;
    scanInProgress = true;
    errorElement.classList.add('hidden');

    try {
        await scanner.pause(true);
        await scanner.stop();

        const response = await fetch(`/api/admin/precommandes/ref/${encodeURIComponent(decodedText)}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'REMIS' })
        });
        const data = await response.json();
        if (!response.ok || !data.success) {
            throw new Error(data.message || `Erreur HTTP ${response.status}`);
        }

        showMessage(`Commande de ${data.firstName} validée`, true);
    } catch (error) {
        console.error('Erreur validation commande scannée :', error);
        showMessage(error.message || 'Impossible de valider cette commande.', false);
    }

    window.setTimeout(async () => {
        hideMessage();
        scanInProgress = false;
        try {
            await startScanner();
        } catch (error) {
            console.error('Erreur redémarrage caméra :', error);
            showError('Impossible de relancer la caméra. Rechargez la page pour réessayer.');
        }
    }, 2000);
}

async function initializeScanner() {
    try {
        const response = await fetch('/api/admin/check-auth', { cache: 'no-store' });
        if (!response.ok) {
            window.location.assign('/admin.html');
            return;
        }
        const data = await response.json();
        if (!data.authenticated) {
            window.location.assign('/admin.html');
            return;
        }
        await startScanner();
    } catch (error) {
        console.error('Erreur initialisation scanner :', error);
        showError(error.message || 'Impossible de démarrer le scanner.');
    }
}

initializeScanner();
