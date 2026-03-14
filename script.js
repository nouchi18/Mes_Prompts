document.addEventListener("DOMContentLoaded", () => {
    const grid = document.getElementById('grid');
    const counter = document.getElementById('counter');
    const searchInput = document.getElementById('searchInput');
    const promptModal = document.getElementById('promptModal');
    
    let currentGalleryImages = [];
    let currentImgIndex = 0;
    let searchTimeout; // Pour stabiliser la saisie rapide

    // --- 1. UTILITAIRES ---
    const normalizeText = (text) => {
        if (!text) return "";
        return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    };

    const updateStats = () => {
        const allCards = document.querySelectorAll('.card');
        const visibleCards = Array.from(allCards).filter(c => c.style.display !== "none");
        counter.innerText = `${visibleCards.length} Prompt(s) affiché(s)`;
    };

    // --- 2. FILTRAGE PRINCIPAL ---
    const filterLibrary = () => {
        const activeBtn = document.querySelector('.style-card.active');
        const activeStyle = activeBtn ? activeBtn.getAttribute('data-filter') : "all";
        
        // On nettoie la recherche
        const query = normalizeText(searchInput.value).trim();
        const searchTerms = query.split(/\s+/).filter(t => t !== "");
        
        const allCards = document.querySelectorAll('.card');
        
        // On utilise requestAnimationFrame pour un rendu visuel fluide sans saccade
        requestAnimationFrame(() => {
            allCards.forEach(card => {
                const cardStyles = (card.getAttribute('data-style') || "").toLowerCase();
                const cardContent = normalizeText(card.innerText);
                
                const matchesStyle = (activeStyle === "all" || cardStyles.includes(activeStyle));
                const matchesSearch = searchTerms.every(term => cardContent.includes(term));

                card.style.display = (matchesStyle && matchesSearch) ? "block" : "none";
            });
            updateStats();
        });
    };

    // --- 3. ACTIONS DE RECHERCHE ---

    // Gère la saisie de texte
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        
        // On remet le filtre sur "Tous" immédiatement si on écrit
        if (searchInput.value.trim() !== "") {
            const allBtn = document.querySelector('.style-card[data-filter="all"]');
            if (allBtn && !allBtn.classList.contains('active')) {
                document.querySelectorAll('.style-card').forEach(x => x.classList.remove('active'));
                allBtn.classList.add('active');
            }
        }

        // On attend un tout petit peu que la saisie soit finie (évite le 1 fois sur 2)
        searchTimeout = setTimeout(filterLibrary, 10);
    });

    // Gère la touche Entrée (Bloque le bug du flash/disparition)
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); 
            e.stopPropagation();
            filterLibrary();
            return false;
        }
    });

    // --- 4. BOUTONS DE STYLE ---
    document.querySelectorAll('.style-card[data-filter]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            // On vide la recherche
            searchInput.value = ""; 
            // On change l'apparence
            document.querySelectorAll('.style-card').forEach(x => x.classList.remove('active'));
            btn.classList.add('active');
            // On filtre
            filterLibrary();
        });
    });

    // --- 5. INITIALISATION ET MODALE ---
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

    const renderLibrary = () => {
        grid.innerHTML = "";
        if (typeof promptDatabase !== 'undefined') {
            promptDatabase.forEach(data => grid.appendChild(createCardElement(data)));
        }
        updateStats();
    };

    // Fonctions Modale (Minimalistes pour éviter les bugs)
    const updateGalleryImage = (index) => {
        currentImgIndex = index;
        const modalImg = document.getElementById('modalImg');
        if (modalImg && currentGalleryImages[index]) {
            modalImg.src = currentGalleryImages[index];
            document.querySelectorAll('.thumb').forEach((t, i) => t.classList.toggle('active', i === index));
        }
    };

    document.addEventListener('click', e => {
        const card = e.target.closest('.card');
        
        if (card && !e.target.closest('.admin-controls') && !e.target.classList.contains('btn-copy')) {
            const imgData = card.querySelector('.card-img').getAttribute('data-all-imgs');
            currentGalleryImages = imgData.split(',');
            
            const modalBody = document.querySelector('.modal-right .modal-body');
            const modalDesc = document.getElementById('modalDescription');
            document.getElementById('modalTitle').innerText = card.querySelector('.card-header').innerText;

            let stylesWrapper = modalBody.querySelector('.styles-grid');
            if (stylesWrapper) stylesWrapper.remove();
            stylesWrapper = document.createElement('div');
            stylesWrapper.className = 'styles-grid';
            
            const styles = card.getAttribute('data-style').split(' ');
            styles.forEach(s => {
                if(s.trim() === "") return;
                const badge = document.createElement('button');
                badge.className = 'modal-badge';
                badge.innerText = `# ${s}`;
                badge.onclick = (ev) => {
                    ev.stopPropagation();
                    promptModal.style.display = 'none';
                    searchInput.value = "";
                    const target = document.querySelector(`.style-card[data-filter="${s.toLowerCase()}"]`);
                    if(target) target.click();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                };
                stylesWrapper.appendChild(badge);
            });
            modalBody.insertBefore(stylesWrapper, modalDesc);
            modalDesc.innerText = card.querySelector('.full-prompt-hidden').innerText;
            
            const thumbContainer = document.getElementById('modalThumbs');
            thumbContainer.innerHTML = "";
            if (currentGalleryImages.length > 1) {
                document.querySelectorAll('.nav-btn').forEach(b => b.style.display = 'block');
                currentGalleryImages.forEach((src, i) => {
                    const t = document.createElement('img');
                    t.src = src; t.className = `thumb ${i===0?'active':''}`;
                    t.onclick = () => updateGalleryImage(i);
                    thumbContainer.appendChild(t);
                });
            } else {
                document.querySelectorAll('.nav-btn').forEach(b => b.style.display = 'none');
            }
            updateGalleryImage(0);
            promptModal.style.display = 'flex';
        }

        if (e.target.classList.contains('btn-copy')) {
            const isModal = e.target.id === "modalCopyBtn";
            const text = isModal ? 
                document.getElementById('modalDescription').innerText : 
                e.target.closest('.card-content').querySelector('.full-prompt-hidden').innerText;
            
            navigator.clipboard.writeText(text).then(() => {
                const b = e.target; const old = b.innerText;
                b.innerText = "✓ Copié !";
                setTimeout(() => b.innerText = old, 2000);
            });
        }

        if (e.target.classList.contains('modal-close') || e.target.id === 'promptModal') {
            promptModal.style.display = 'none';
        }
    });

    document.querySelector('.prev-btn').onclick = () => updateGalleryImage((currentImgIndex - 1 + currentGalleryImages.length) % currentGalleryImages.length);
    document.querySelector('.next-btn').onclick = () => updateGalleryImage((currentImgIndex + 1) % currentGalleryImages.length);

    renderLibrary();
});