document.addEventListener("DOMContentLoaded", () => {
    const styleButtons = document.querySelectorAll('.style-card');
    const cards = document.querySelectorAll('.card');
    const counter = document.getElementById('counter');
    const modal = document.getElementById('promptModal');
    const closeModal = document.querySelector('.modal-close');
    const modalCopyBtn = document.getElementById('modalCopyBtn');

    // --- 1. FILTRAGE ---
    styleButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.getAttribute('data-filter');
            
            styleButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            let visibleCount = 0;

            cards.forEach(card => {
                const style = card.getAttribute('data-style');
                if (filter === 'all' || style === filter) {
                    card.style.display = 'block';
                    visibleCount++;
                } else {
                    card.style.display = 'none';
                }
            });
            
            if (counter) counter.innerText = `${visibleCount} Prompt(s) affiché(s)`;
        });
    });

    // --- 2. MODALE ---
    cards.forEach(card => {
        card.addEventListener('click', (e) => {
            // Ne pas ouvrir la modale si on clique sur le bouton "Copier"
            if (e.target.classList.contains('btn-copy')) return;

            const imgSrc = card.querySelector('.card-img').src;
            const title = card.querySelector('.card-header').innerText;
            const fullText = card.querySelector('.full-prompt-hidden').innerText;

            document.getElementById('modalImg').src = imgSrc;
            document.getElementById('modalTitle').innerText = title;
            document.getElementById('modalDescription').innerText = fullText;

            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });
    });

    const closeAllModals = () => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    };

    closeModal.onclick = closeAllModals;
    window.onclick = (e) => { if (e.target == modal) closeAllModals(); };

    // --- 3. COPIE ---
    const handleCopy = (btnElement, text) => {
        navigator.clipboard.writeText(text).then(() => {
            const originalText = btnElement.innerText;
            btnElement.innerText = "✓ Copié !";
            btnElement.style.background = "#10b981";

            setTimeout(() => {
                btnElement.innerText = originalText;
                btnElement.style.background = "";
            }, 2000);
        });
    };

    // Boutons sur les cartes
    document.querySelectorAll('.btn-copy').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const text = btn.closest('.card-content').querySelector('.full-prompt-hidden').innerText;
            handleCopy(btn, text);
        });
    });

    // Bouton dans la modale
    if (modalCopyBtn) {
        modalCopyBtn.addEventListener('click', () => {
            const text = document.getElementById('modalDescription').innerText;
            handleCopy(modalCopyBtn, text);
        });
    }
});