document.addEventListener("DOMContentLoaded", () => {
    const styleButtons = document.querySelectorAll('.style-card');
    const searchInput = document.getElementById('searchInput');
    const grid = document.getElementById('grid');
    const counter = document.getElementById('counter');
    const modal = document.getElementById('promptModal');
    const adminPanel = document.getElementById('adminPanel');

    // --- 1. FONCTION DE FILTRAGE UNIFIÉE ---
    const applyFilters = () => {
        const activeFilter = document.querySelector('.style-card.active').getAttribute('data-filter');
        const searchTerm = searchInput.value.toLowerCase().trim();
        const allCards = document.querySelectorAll('.card');
        let visibleCount = 0;

        allCards.forEach(card => {
            const cardStyles = (card.getAttribute('data-style') || "").toLowerCase();
            const cardTitle = card.querySelector('.card-header').innerText.toLowerCase();
            const fullPrompt = card.querySelector('.full-prompt-hidden').innerText.toLowerCase();
            
            // On cherche dans les styles, le titre et le prompt complet
            const matchesFilter = activeFilter === 'all' || cardStyles.split(' ').includes(activeFilter);
            const matchesSearch = searchTerm === "" || 
                                 cardStyles.includes(searchTerm) || 
                                 cardTitle.includes(searchTerm) || 
                                 fullPrompt.includes(searchTerm);

            if (matchesFilter && matchesSearch) {
                card.style.display = 'block';
                visibleCount++;
                
                // Générer l'aperçu si vide
                const preview = card.querySelector('.prompt-text');
                if (preview && preview.innerText === "") {
                    const text = card.querySelector('.full-prompt-hidden').innerText.trim();
                    preview.innerText = text.length > 100 ? text.substring(0, 100) + "..." : text;
                }
            } else {
                card.style.display = 'none';
            }
        });
        
        counter.innerText = `${visibleCount} Prompt(s) affiché(s)`;
    };

    // --- 2. ÉCOUTEURS D'ÉVÉNEMENTS ---
    searchInput.addEventListener('input', applyFilters);

    styleButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            styleButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            applyFilters();
        });
    });

    // --- 3. MODALES ET COPIE ---
    document.addEventListener('click', (e) => {
        const card = e.target.closest('.card');
        
        // Ouvrir modale
        if (card && !e.target.classList.contains('btn-copy')) {
            document.getElementById('modalImg').src = card.querySelector('.card-img').src;
            document.getElementById('modalTitle').innerText = card.querySelector('.card-header').innerText;
            document.getElementById('modalDescription').innerText = card.querySelector('.full-prompt-hidden').innerText;
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }

        // Copier texte
        if (e.target.classList.contains('btn-copy')) {
            const isModalBtn = e.target.id === 'modalCopyBtn';
            const text = isModalBtn ? 
                         document.getElementById('modalDescription').innerText : 
                         e.target.closest('.card-content').querySelector('.full-prompt-hidden').innerText;
            
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

        // Fermer modales
        if (e.target.classList.contains('modal-close') || e.target === modal || e.target === adminPanel) {
            modal.style.display = 'none';
            adminPanel.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    // --- 4. ADMINISTRATION ---
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
</article>`.trim();

        grid.insertAdjacentHTML('afterbegin', cardHTML);
        document.getElementById('generatedCodeSection').style.display = 'block';
        document.getElementById('generatedCode').value = cardHTML;
        
        applyFilters();
        alert("Carte ajoutée ! Pensez à copier le code pour votre fichier HTML.");
    });

    // Initialisation
    applyFilters();
});