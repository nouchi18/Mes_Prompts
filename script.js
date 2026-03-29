document.addEventListener("DOMContentLoaded", () => {
    const grid = document.getElementById('grid');
    const counter = document.getElementById('counter');
    const searchInput = document.getElementById('searchInput');
    
    let currentGalleryImages = [];
    let currentImgIndex = 0;

    // --- 1. GÉNÉRATION DE LA GRILLE ---
    const renderLibrary = () => {
        grid.innerHTML = "";
        if (typeof promptDatabase !== 'undefined') {
            promptDatabase.forEach(data => grid.appendChild(createCardElement(data)));
        }
        updateStats();
    };

    const createCardElement = (data) => {
        const card = document.createElement('article');
        card.className = 'card';
        card.setAttribute('data-style', data.styles);
        const mainImg = Array.isArray(data.img) ? data.img[0] : data.img;
        const allImgs = Array.isArray(data.img) ? data.img.join(',') : data.img;

        card.innerHTML = `
            <img src="${mainImg}" class="card-img" data-all-imgs="${allImgs}">
            <div class="card-content">
                <div class="card-header">${data.title}</div>
                <p class="prompt-text">${data.prompt.substring(0, 100)}...</p>
                <div class="full-prompt-hidden" style="display:none;">${data.prompt}</div>
                <button class="btn-copy">Copier</button>
            </div>
        `;
        return card;
    };

    // --- 2. LOGIQUE DE FILTRAGE ---
    const updateStats = () => {
        const visible = [...document.querySelectorAll('.card')].filter(c => c.style.display !== "none").length;
        counter.innerText = `${visible} Prompt(s) affiché(s)`;
    };

    const filterLibrary = () => {
        const activeBtn = document.querySelector('.style-card.active');
        const activeStyle = activeBtn ? activeBtn.getAttribute('data-filter') : "all";
        const term = searchInput.value.toLowerCase().trim();
        
        document.querySelectorAll('.card').forEach(card => {
            const styles = card.getAttribute('data-style').toLowerCase();
            const title = card.querySelector('.card-header').innerText.toLowerCase();
            const promptContent = card.querySelector('.full-prompt-hidden').innerText.toLowerCase();
            
            const matchesStyle = (activeStyle === "all" || styles.includes(activeStyle));
            const matchesSearch = (term === "" || title.includes(term) || promptContent.includes(term));
            
            card.style.display = (matchesStyle && matchesSearch) ? "block" : "none";
        });
        updateStats();
    };

    // --- 3. GESTION DES ÉVÉNEMENTS RECHERCHE (CORRIGÉ) ---
    
    // Empêche le bug du "une fois sur deux" (rechargement de page)
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Empêche le navigateur de rafraîchir la page
            filterLibrary();
        }
    });

    // Réaffiche tout si on efface manuellement le texte
    searchInput.addEventListener('input', (e) => {
        if (e.target.value === "") {
            filterLibrary();
        }
    });

    // --- 4. GESTION DES FILTRES (BOUTONS) ---
    document.querySelectorAll('.style-card[data-filter]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.style-card').forEach(x => x.classList.remove('active'));
            btn.classList.add('active'); 
            filterLibrary();
        });
    });

    // --- 5. MODALE ET GALERIE ---
    const updateGalleryImage = (index) => {
        currentImgIndex = index;
        const modalImg = document.getElementById('modalImg');
        if(modalImg && currentGalleryImages[currentImgIndex]) {
            modalImg.src = currentGalleryImages[currentImgIndex];
        }
        document.querySelectorAll('.thumb').forEach((t, i) => t.classList.toggle('active', i === currentImgIndex));
    };

    document.addEventListener('click', e => {
        const card = e.target.closest('.card');
        
        // Ouverture de la modale
        if (card && !e.target.classList.contains('btn-copy')) {
            const imgData = card.querySelector('.card-img').getAttribute('data-all-imgs');
            currentGalleryImages = imgData.split(',');
            
            document.getElementById('modalTitle').innerText = card.querySelector('.card-header').innerText;
            document.getElementById('modalDescription').innerText = card.querySelector('.full-prompt-hidden').innerText;
            
            const thumbContainer = document.getElementById('modalThumbs');
            thumbContainer.innerHTML = "";
            
            if (currentGalleryImages.length > 1) {
                document.querySelectorAll('.nav-btn').forEach(b => b.style.display = 'block');
                currentGalleryImages.forEach((src, i) => {
                    const t = document.createElement('img');
                    t.src = src; 
                    t.className = `thumb ${i === 0 ? 'active' : ''}`;
                    t.onclick = () => updateGalleryImage(i);
                    thumbContainer.appendChild(t);
                });
            } else {
                document.querySelectorAll('.nav-btn').forEach(b => b.style.display = 'none');
            }
            
            updateGalleryImage(0);
            document.getElementById('promptModal').style.display = 'flex';
        }

        // Bouton Copier
        if (e.target.classList.contains('btn-copy')) {
            const text = e.target.id === "modalCopyBtn" ? 
                document.getElementById('modalDescription').innerText : 
                e.target.closest('.card-content').querySelector('.full-prompt-hidden').innerText;
            
            navigator.clipboard.writeText(text).then(() => {
                const b = e.target; 
                const oldText = b.innerText; 
                b.innerText = "✓ Copié !";
                setTimeout(() => b.innerText = oldText, 2000);
            });
        }

        // Fermeture Modale
        if (e.target.classList.contains('modal-close') || e.target.id === 'promptModal') {
            document.getElementById('promptModal').style.display = 'none';
        }

        // Navigation Galerie
        if (e.target.classList.contains('prev-btn')) {
            let idx = currentImgIndex - 1;
            if (idx < 0) idx = currentGalleryImages.length - 1;
            updateGalleryImage(idx);
        }
        if (e.target.classList.contains('next-btn')) {
            let idx = currentImgIndex + 1;
            if (idx >= currentGalleryImages.length) idx = 0;
            updateGalleryImage(idx);
        }
    });

    // Lancement initial
    renderLibrary();
});