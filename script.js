document.addEventListener("DOMContentLoaded", () => {
    const styleButtons = document.querySelectorAll('.style-card');
    const cards = document.querySelectorAll('.card');
    const counter = document.getElementById('counter');
    const modal = document.getElementById('promptModal');
    const closeModal = document.querySelector('.modal-close');
    const modalCopyBtn = document.getElementById('modalCopyBtn');

    // --- 1. GÉNÉRATION AUTOMATIQUE DES APERÇUS (PROMPT-TEXT) ---
    // Cette section extrait le début du "full-prompt-hidden" pour l'afficher sur la carte
    cards.forEach(card => {
        const fullPromptElement = card.querySelector('.full-prompt-hidden');
        const previewElement = card.querySelector('.prompt-text');

        if (fullPromptElement && previewElement) {
            const fullText = fullPromptElement.innerText.trim();
            const limit = 120; // Nombre de caractères maximum pour l'aperçu
            
            const previewText = fullText.length > limit 
                ? fullText.substring(0, limit) + "..." 
                : fullText;
            
            previewElement.innerText = previewText;
        }
    });

    // --- 2. FILTRAGE (Gère plusieurs styles) ---
    styleButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.getAttribute('data-filter');
            
            styleButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            let visibleCount = 0;

            cards.forEach(card => {
                const cardStylesRaw = card.getAttribute('data-style') || "";
                const cardStylesArray = cardStylesRaw.split(' ');

                if (filter === 'all' || cardStylesArray.includes(filter)) {
                    card.style.display = 'block';
                    visibleCount++;
                } else {
                    card.style.display = 'none';
                }
            });
            
            if (counter) counter.innerText = `${visibleCount} Prompt(s) affiché(s)`;
        });
    });

    // --- 3. GESTION DE LA MODALE ---
    cards.forEach(card => {
        card.addEventListener('click', (e) => {
            // Ne pas ouvrir la modale si on clique sur le bouton "Copier"
            if (e.target.classList.contains('btn-copy')) return;

            const imgElement = card.querySelector('.card-img');
            const headerElement = card.querySelector('.card-header');
            const hiddenPrompt = card.querySelector('.full-prompt-hidden');

            if (imgElement && headerElement && hiddenPrompt) {
                document.getElementById('modalImg').src = imgElement.src;
                document.getElementById('modalTitle').innerText = headerElement.innerText;
                document.getElementById('modalDescription').innerText = hiddenPrompt.innerText;

                modal.style.display = 'block';
                document.body.style.overflow = 'hidden'; // Bloque le scroll
            }
        });
    });

    const closeAllModals = () => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    };

    if (closeModal) closeModal.onclick = closeAllModals;
    window.onclick = (e) => { if (e.target == modal) closeAllModals(); };

    // --- 4. SYSTÈME DE COPIE ---
    const handleCopy = (btnElement, text) => {
        navigator.clipboard.writeText(text).then(() => {
            const originalText = btnElement.innerText;
            btnElement.innerText = "✓ Copié !";
            btnElement.style.background = "#10b981"; // Vert succès

            setTimeout(() => {
                btnElement.innerText = originalText;
                btnElement.style.background = ""; 
            }, 2000);
        }).catch(err => {
            console.error('Erreur lors de la copie : ', err);
        });
    };

    // Boutons des cartes
    document.querySelectorAll('.btn-copy').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); 
            const cardContent = btn.closest('.card-content');
            const fullText = cardContent.querySelector('.full-prompt-hidden').innerText;
            handleCopy(btn, fullText);
        });
    });

    // Bouton de la modale
    if (modalCopyBtn) {
        modalCopyBtn.addEventListener('click', () => {
            const text = document.getElementById('modalDescription').innerText;
            handleCopy(modalCopyBtn, text);
        });
    }
});