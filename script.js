document.addEventListener("DOMContentLoaded", () => {
    // --- ÉLÉMENTS DU DOM ---
    const grid = document.getElementById('grid');
    const counter = document.getElementById('counter');
    const searchInput = document.getElementById('searchInput');
    const promptModal = document.getElementById('promptModal');
    
    let currentGalleryImages = [];
    let currentImgIndex = 0;

    // --- 1. UTILITAIRES ---

    // Normalise le texte (minuscules et suppression des accents)
    const normalizeText = (text) => {
        if (!text) return "";
        return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    };

    const updateStats = () => {
        const cards = document.querySelectorAll('.card');
        const visible = [...cards].filter(c => c.style.display !== "none").length;
        counter.innerText = `${visible} Prompt(s) affiché(s)`;
    };

    const resetStylesToAll = () => {
        const allBtn = document.querySelector('.style-card[data-filter="all"]');
        const currentActive = document.querySelector('.style-card.active');
        if (allBtn && currentActive !== allBtn) {
            document.querySelectorAll('.style-card').forEach(x => x.classList.remove('active'));
            allBtn.classList.add('active');
        }
    };

    // --- 2. LOGIQUE DE FILTRAGE ---

    const filterLibrary = () => {
        const activeBtn = document.querySelector('.style-card.active');
        const activeStyle = activeBtn ? activeBtn.getAttribute('data-filter') : "all";
        
        // Recherche croisée : on sépare les mots de la barre de recherche
        const searchTerms = normalizeText(searchInput.value).trim().split(/\s+/).filter(t => t !== "");
        
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            const cardStyles = card.getAttribute('data-style').toLowerCase();
            const cardContent = normalizeText(card.innerText);
            
            const matchesStyle = (activeStyle === "all" || cardStyles.includes(activeStyle));
            const matchesSearch = searchTerms.every(term => cardContent.includes(term));

            card.style.display = (matchesStyle && matchesSearch) ? "block" : "none";
        });
        updateStats();
    };

    const activateFilter = (filterValue) => {
        const targetBtn = document.querySelector(`.style-card[data-filter="${filterValue}"]`);
        if (targetBtn) {
            searchInput.value = ""; // Vider la recherche lors d'un clic sur un style
            document.querySelectorAll('.style-card').forEach(b => b.classList.remove('active'));
            targetBtn.classList.add('active');
            filterLibrary();
        }
    };

    // --- 3. GESTION DES ÉVÉNEMENTS RECHERCHE ---

    // Recherche en direct
    searchInput.addEventListener('input', () => {
        if (searchInput.value.trim() !== "") {
            resetStylesToAll(); // Priorité à la recherche : on repasse sur "Tous"
        }
        filterLibrary();
    });

    // Gestion de la touche Entrée
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // EMPÊCHE LE RECHARGEMENT (FLASH) DE LA PAGE
            filterLibrary();
        }
    });

    // Filtres par boutons de la page
    document.querySelectorAll('.style-card[data-filter]').forEach(btn => {
        btn.onclick = () => {
            activateFilter(btn.getAttribute('data-filter'));
        };
    });

    // --- 4. MODALE ET GALERIE ---

    const updateGalleryImage = (index) => {
        currentImgIndex = index;
        const modalImg = document.getElementById('modalImg');
        if (modalImg) {
            modalImg.src = currentGalleryImages[currentImgIndex];
            document.querySelectorAll('.thumb').forEach((t, i) => {
                t.classList.toggle('active', i === currentImgIndex);
            });
        }
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

    const renderLibrary = () => {
        grid.innerHTML = "";
        if (typeof promptDatabase !== 'undefined') {
            promptDatabase.forEach(data => grid.appendChild(createCardElement(data)));
        }
        updateStats();
    };

    // Gestionnaire de clics globaux
    document.addEventListener('click', e => {
        const card = e.target.closest('.card');
        
        // Ouvrir modale
        if (card && !e.target.closest('.admin-controls') && !e.target.classList.contains('btn-copy')) {
            const imgData = card.querySelector('.card-img').getAttribute('data-all-imgs');
            currentGalleryImages = imgData.split(',');
            
            const modalBody = document.querySelector('.modal-right .modal-body');
            const modalDesc = document.getElementById('modalDescription');
            document.getElementById('modalTitle').innerText = card.querySelector('.card-header').innerText;

            // Badges dynamiques dans la modale
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
                    activateFilter(s.toLowerCase());
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                };
                stylesWrapper.appendChild(badge);
            });
            modalBody.insertBefore(stylesWrapper, modalDesc);

            modalDesc.innerText = card.querySelector('.full-prompt-hidden').innerText;
            
            // Miniatures galerie
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

        // Bouton copier
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

        // Fermeture modale
        if (e.target.classList.contains('modal-close') || e.target.id === 'promptModal') {
            promptModal.style.display = 'none';
        }
    });

    // Navigation galerie
    document.querySelector('.prev-btn').onclick = () => updateGalleryImage((currentImgIndex - 1 + currentGalleryImages.length) % currentGalleryImages.length);
    document.querySelector('.next-btn').onclick = () => updateGalleryImage((currentImgIndex + 1) % currentGalleryImages.length);

    renderLibrary();
});