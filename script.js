document.addEventListener("DOMContentLoaded", () => {
    const styleButtons = document.querySelectorAll('.style-card');
    const searchInput = document.getElementById('searchInput');
    const grid = document.getElementById('grid');
    const counter = document.getElementById('counter');
    const modal = document.getElementById('promptModal');
    const adminPanel = document.getElementById('adminPanel');

    // --- 1. FONCTION DE FILTRAGE ---
    const updateDisplay = (mode) => {
        const activeFilter = document.querySelector('.style-card.active').getAttribute('data-filter');
        const searchTerm = searchInput.value.toLowerCase().trim();
        const cards = document.querySelectorAll('.card');
        let count = 0;

        cards.forEach(card => {
            const styles = (card.getAttribute('data-style') || "").toLowerCase();
            const content = card.innerText.toLowerCase();
            const fullText = card.querySelector('.full-prompt-hidden').innerText.toLowerCase();

            let isVisible = false;

            if (mode === 'search') {
                // En mode recherche : On ignore le bouton de style (sauf s'il est vide)
                isVisible = content.includes(searchTerm) || fullText.includes(searchTerm);
            } else {
                // En mode style : On affiche tout le style, on ignore la barre de recherche
                isVisible = (activeFilter === 'all' || styles.split(' ').includes(activeFilter));
            }

            if (isVisible) {
                card.style.display = 'block';
                count++;
                // Génération de l'aperçu si nécessaire
                const preview = card.querySelector('.prompt-text');
                if (preview && preview.innerText === "") {
                    const full = card.querySelector('.full-prompt-hidden').innerText.trim();
                    preview.innerText = full.length > 100 ? full.substring(0, 100) + "..." : full;
                }
            } else {
                card.style.display = 'none';
            }
        });
        counter.innerText = `${count} Prompt(s) affiché(s)`;
    };

    // --- 2. ÉCOUTEURS ---

    // Quand on tape dans la recherche
    searchInput.addEventListener('input', () => {
        // Optionnel : Désactiver le bouton de style visuellement si on veut, 
        // ou simplement forcer la recherche sur tout.
        if(searchInput.value !== "") {
            styleButtons.forEach(b => b.classList.remove('active'));
            document.querySelector('[data-filter="all"]').classList.add('active');
        }
        updateDisplay('search');
    });

    // Quand on clique sur un style
    styleButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // 1. On vide la barre de recherche
            searchInput.value = "";
            // 2. On change l'état actif
            styleButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            // 3. On affiche tout le style
            updateDisplay('style');
        });
    });

    // --- 3. MODALES ET COPIE ---
    document.addEventListener('click', (e) => {
        const card = e.target.closest('.card');
        
        if (card && !e.target.classList.contains('btn-copy')) {
            document.getElementById('modalImg').src = card.querySelector('.card-img').src;
            document.getElementById('modalTitle').innerText = card.querySelector('.card-header').innerText;
            document.getElementById('modalDescription').innerText = card.querySelector('.full-prompt-hidden').innerText;
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }

        if (e.target.classList.contains('btn-copy')) {
            const text = e.target.id === 'modalCopyBtn' ? 
                         document.getElementById('modalDescription').innerText : 
                         e.target.closest('.card-content').querySelector('.full-prompt-hidden').innerText;
            
            navigator.clipboard.writeText(text).then(() => {
                const prev = e.target.innerText;
                e.target.innerText = "✓ Copié !";
                setTimeout(() => e.target.innerText = prev, 2000);
            });
        }

        if (e.target.classList.contains('modal-close') || e.target === modal || e.target === adminPanel) {
            modal.style.display = 'none';
            adminPanel.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    document.getElementById('openAdmin').onclick = () => adminPanel.style.display = 'block';

    document.getElementById('savePrompt').addEventListener('click', () => {
        const title = document.getElementById('newTitle').value.toUpperCase() || "PORTRAIT";
        const styles = document.getElementById('newStyles').value.toLowerCase();
        const img = document.getElementById('newImg').value || "Images/placeholder.png";
        const prompt = document.getElementById('newPrompt').value;

        const cardHTML = `<article class="card" data-style="${styles}">
    <img src="${img}" class="card-img" alt="${title}">
    <div class="card-content">
        <div class="card-header">${title}</div>
        <p class="prompt-text"></p>
        <div class="full-prompt-hidden" style="display:none;">${prompt}</div>
        <button class="btn-copy">Copier</button>
    </div>
</article>`.trim();

        grid.insertAdjacentHTML('afterbegin', cardHTML);
        document.getElementById('generatedCodeSection').style.display = 'block';
        document.getElementById('generatedCode').value = cardHTML;
        updateDisplay('style');
    });

    updateDisplay('style');
});