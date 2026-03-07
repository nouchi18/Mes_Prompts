document.addEventListener("DOMContentLoaded", () => {
    const styleButtons = document.querySelectorAll('.style-card');
    const grid = document.getElementById('grid');
    const counter = document.getElementById('counter');
    const modal = document.getElementById('promptModal');
    const adminPanel = document.getElementById('adminPanel');

    // --- 1. MISE À JOUR DES APERÇUS ET COMPTEUR ---
    const updateUI = () => {
        const allCards = document.querySelectorAll('.card');
        let visibleCount = 0;

        allCards.forEach(card => {
            // Générer l'aperçu texte s'il est vide
            const fullPrompt = card.querySelector('.full-prompt-hidden');
            const preview = card.querySelector('.prompt-text');
            if (fullPrompt && preview) {
                const text = fullPrompt.innerText.trim();
                preview.innerText = text.length > 120 ? text.substring(0, 120) + "..." : text;
            }
            
            if (card.style.display !== 'none') visibleCount++;
        });
        
        if (counter) counter.innerText = `${visibleCount} Prompt(s) affiché(s)`;
    };

    // --- 2. FILTRAGE ---
    styleButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.getAttribute('data-filter');
            styleButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            document.querySelectorAll('.card').forEach(card => {
                const cardStyles = (card.getAttribute('data-style') || "").split(' ');
                if (filter === 'all' || cardStyles.includes(filter)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
            updateUI();
        });
    });

    // --- 3. MODALES (LECTURE & FERMETURE) ---
    document.addEventListener('click', (e) => {
        // Ouvrir modale de lecture
        const card = e.target.closest('.card');
        if (card && !e.target.classList.contains('btn-copy')) {
            document.getElementById('modalImg').src = card.querySelector('.card-img').src;
            document.getElementById('modalTitle').innerText = card.querySelector('.card-header').innerText;
            document.getElementById('modalDescription').innerText = card.querySelector('.full-prompt-hidden').innerText;
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }

        // Fermer les modales
        if (e.target.classList.contains('modal-close') || e.target === modal || e.target === adminPanel) {
            modal.style.display = 'none';
            adminPanel.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    // --- 4. ADMINISTRATION (AJOUT) ---
    document.getElementById('openAdmin').onclick = () => adminPanel.style.display = 'block';
    
    document.getElementById('savePrompt').addEventListener('click', () => {
        const title = document.getElementById('newTitle').value.toUpperCase() || "PORTRAIT";
        const styles = document.getElementById('newStyles').value.toLowerCase();
        const img = document.getElementById('newImg').value || "Images/placeholder.png";
        const prompt = document.getElementById('newPrompt').value;

        if (!prompt) return alert("Veuillez coller un prompt !");

        const cardHTML = `
            <article class="card" data-style="${styles}">
                <img src="${img}" class="card-img" alt="${title}">
                <div class="card-content">
                    <div class="card-header">${title}</div>
                    <p class="prompt-text"></p>
                    <div class="full-prompt-hidden" style="display:none;">${prompt}</div>
                    <button class="btn-copy">Copier</button>
                </div>
            </article>`.replace(/^\s+/gm, '');

        grid.insertAdjacentHTML('afterbegin', cardHTML);
        document.getElementById('generatedCodeSection').style.display = 'block';
        document.getElementById('generatedCode').value = cardHTML;
        
        updateUI();
        alert("Carte ajoutée temporairement ! Copiez le code généré pour le coller dans index.html.");
    });

    // --- 5. COPIE ---
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-copy')) {
            let text = "";
            if (e.target.id === 'modalCopyBtn') {
                text = document.getElementById('modalDescription').innerText;
            } else {
                text = e.target.closest('.card-content').querySelector('.full-prompt-hidden').innerText;
            }
            
            navigator.clipboard.writeText(text).then(() => {
                const original = e.target.innerText;
                e.target.innerText = "✓ Copié !";
                e.target.style.background = "#10b981";
                setTimeout(() => {
                    e.target.innerText = original;
                    e.target.style.background = "";
                }, 2000);
            });
        }
    });

    // Init au chargement
    updateUI();
});