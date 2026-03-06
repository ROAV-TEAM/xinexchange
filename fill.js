document.addEventListener('DOMContentLoaded', () => {
    const rateSelect = document.getElementById('rateSelect');
    const methodSection = document.getElementById('methodSection');
    const methodCards = document.querySelectorAll('.method-card');
    const detailsForm = document.getElementById('detailsForm');
    const bankFields = document.getElementById('bankFields');
    const upiFields = document.getElementById('upiFields');
    const submitBtn = document.getElementById('submitBtn');

    let selectedMethod = null;

    // Load custom rates from Supabase
    async function loadRates() {
        try {
            const { data, error } = await supabaseClient
                .from('app_config')
                .select('rate1, rate2, rate3')
                .eq('id', 1)
                .single();

            if (data) {
                if (data.rate1) rateSelect.options[1].text = data.rate1;
                if (data.rate2) rateSelect.options[2].text = data.rate2;
                if (data.rate3) rateSelect.options[3].text = data.rate3;
            }
        } catch (e) {
            console.error('Error fetching rates from supabase:', e);
        }
    }
    loadRates();

    rateSelect.addEventListener('change', (e) => {
        if (e.target.value) {
            methodSection.style.display = 'block';
            // Optional: Filter methods based on rate selection
            // Rate 1: CDM
            // Rate 2: IMPS & UPI
            // Rate 3: UPI & IMPS
            // According to prompt: "esa jab use ye select kare to ese payment method select karne ka optin ayega imps ya upi ya cdm"
            const rateVal = e.target.value;
            methodCards.forEach(card => card.style.display = 'block'); // reset

            if (rateVal === "1") {
                // Rate 1 is mostly CDM, but we let them choose if desired or hide others
                document.querySelector('[data-method="imps"]').style.display = 'none';
                document.querySelector('[data-method="upi"]').style.display = 'none';

                // auto-select CDM
                selectMethod(document.querySelector('[data-method="cdm"]'));
            } else {
                // Rate 2 & 3 are IMPS & UPI
                document.querySelector('[data-method="cdm"]').style.display = 'none';

                // Keep IMPS & UPI visible
                document.querySelector('[data-method="imps"]').style.display = 'block';
                document.querySelector('[data-method="upi"]').style.display = 'block';

                // unselect 
                if (selectedMethod === 'cdm') {
                    unselectAll();
                }
            }
        }
    });

    function unselectAll() {
        methodCards.forEach(c => c.classList.remove('active'));
        selectedMethod = null;
        detailsForm.style.display = 'none';
    }

    function selectMethod(card) {
        if (card.style.display === 'none') return;

        methodCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        selectedMethod = card.getAttribute('data-method');

        detailsForm.style.display = 'block';
        bankFields.style.display = 'none';
        upiFields.style.display = 'none';

        if (selectedMethod === 'cdm' || selectedMethod === 'imps') {
            bankFields.style.display = 'block';
        } else if (selectedMethod === 'upi') {
            upiFields.style.display = 'block';
        }
    }

    methodCards.forEach(card => {
        card.addEventListener('click', () => {
            selectMethod(card);
        });
    });

    submitBtn.addEventListener('click', (e) => {
        e.preventDefault();

        // Validate
        if (!rateSelect.value) return alert('Please select a rate');
        if (!selectedMethod) return alert('Please select a payment method');

        if (selectedMethod === 'cdm' || selectedMethod === 'imps') {
            const name = document.getElementById('bankName').value;
            const account = document.getElementById('bankAccount').value;
            const ifsc = document.getElementById('bankIfsc').value;
            if (!name || !account || !ifsc) return alert('Please fill all bank details');
        } else if (selectedMethod === 'upi') {
            const name = document.getElementById('upiName').value;
            const upiId = document.getElementById('upiId').value;
            if (!name || !upiId) return alert('Please fill all UPI details');
        }

        // Redirect to order.html
        window.location.href = 'order.html';
    });
});
