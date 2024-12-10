const showSnackbar = (message, type = 'success') => {
    const snackbar = document.createElement('div');
    snackbar.className = `toast align-items-center text-bg-${type} border-0 show`;
    snackbar.style.position = 'fixed';
    snackbar.style.bottom = '20px';
    snackbar.style.right = '20px';
    snackbar.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>`;
    document.body.appendChild(snackbar);
    setTimeout(() => snackbar.remove(), 3000);
};

// Funktion zur Überprüfung der URL-Parameter
const checkForError = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get('error');
    if (errorParam) {
        let message;
        switch (errorParam) {
            case '1':
                message = 'Ungültige Anmeldedaten. Bitte erneut versuchen.';
                break;
            case '2':
                message = 'Dein Konto ist gesperrt.';
                break;
            default:
                message = 'Ein unbekannter Fehler ist aufgetreten.';
        }

        showSnackbar(message, 'danger');
    }
};

document.addEventListener('DOMContentLoaded', checkForError);