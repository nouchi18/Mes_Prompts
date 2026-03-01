document.addEventListener("DOMContentLoaded", () => {
    const styleButtons = document.querySelectorAll('.style-card');
    const cards = document.querySelectorAll('.card');
    const counter = document.getElementById('counter');
    const modal = document.getElementById('promptModal');
    const closeModal = document.querySelector('.modal-close');
    const modalCopyBtn = document.getElementById('modalCopyBtn');

    // --- 1. FILTRAGE (Gère plusieurs styles) ---
    styleButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.getAttribute('data-filter');
            
            // Mise à jour de l'apparence des boutons de filtre
            styleButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            let visibleCount = 0;

            cards.forEach(card => {
                // On récupère la chaîne data-style (ex: "portrait cinematic")
                const cardStylesRaw = card.getAttribute('data-style') || "";
                
                // On la transforme en tableau : ["portrait", "cinematic"]
                const cardStylesArray = cardStylesRaw.split(' ');

                // La carte est affichée si le filtre est "all" 
                // OU si le tableau de styles contient le filtre sélectionné
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

    // --- 2. GESTION DE LA MODALE ---
    cards.forEach(card => {
        card.addEventListener('click', (e) => {
            // Ne pas ouvrir la modale si on clique spécifiquement sur le bouton "Copier" de la carte
            if (e.target.classList.contains('btn-copy')) return;

            const imgElement = card.querySelector('.card-img');
            const headerElement = card.querySelector('.card-header');
            const hiddenPrompt = card.querySelector('.full-prompt-hidden');

            if (imgElement && headerElement && hiddenPrompt) {
                document.getElementById('modalImg').src = imgElement.src;
                document.getElementById('modalTitle').innerText = headerElement.innerText;
                document.getElementById('modalDescription').innerText = hiddenPrompt.innerText;

                modal.style.display = 'block';
                document.body.style.overflow = 'hidden'; // Empêche le scroll en arrière-plan
            }
        });
    });

    // Fermeture de la modale
    const closeAllModals = () => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    };

    if (closeModal) {
        closeModal.onclick = closeAllModals;
    }

    window.onclick = (e) => { 
        if (e.target == modal) closeAllModals(); 
    };

    // --- 3. SYSTÈME DE COPIE (Presse-papier) ---
    const handleCopy = (btnElement, text) => {
        navigator.clipboard.writeText(text).then(() => {
            const originalText = btnElement.innerText;
            btnElement.innerText = "✓ Copié !";
            btnElement.style.background = "#10b981"; // Vert succès

            setTimeout(() => {
                btnElement.innerText = originalText;
                btnElement.style.background = ""; // Retour couleur originale
            }, 2000);
        }).catch(err => {
            console.error('Erreur lors de la copie : ', err);
        });
    };

    // Gestion du clic sur les boutons "Copier" des cartes
    document.querySelectorAll('.btn-copy').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Empêche l'ouverture de la modale
            const cardContent = btn.closest('.card-content');
            const fullText = cardContent.querySelector('.full-prompt-hidden').innerText;
            handleCopy(btn, fullText);
        });
    });

    // Gestion du clic sur le bouton "Copier" à l'intérieur de la modale
    if (modalCopyBtn) {
        modalCopyBtn.addEventListener('click', () => {
            const text = document.getElementById('modalDescription').innerText;
            handleCopy(modalCopyBtn, text);
        });
    }
});