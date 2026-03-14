document.addEventListener("DOMContentLoaded", () => {
    // --- ÉLÉMENTS DU DOM ---
    const grid = document.getElementById('grid');
    const counter = document.getElementById('counter');
    const searchInput = document.getElementById('searchInput');
    const adminPanel = document.getElementById('adminPanel');
    const genCodeArea = document.getElementById('generatedCode');
    const closeAdminModeBtn = document.getElementById('closeAdminMode');
    
    let currentGalleryImages = [];
    let currentImgIndex = 0;

    // --- 1. UTILITAIRES DE TEXTE ---
    const normalizeText = (text) => {
        if (!text) return "";
        // Supprime les accents et passe en minuscule pour une recherche fiable
        return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    };

    const updateStats = () => {
        const cards = document.querySelectorAll('.card');
        const visible = [...cards].filter(c => c.style.display !== "none").length;
        counter.innerText = `${visible} Prompt(s) affiché(s)`;
    };

    // --- 2. LOGIQUE DE FILTRAGE ---
    const filterLibrary = () => {
        const activeBtn = document.querySelector('.style-card.active');
        const activeStyle = activeBtn ? activeBtn.getAttribute('data-filter') : "all";
        
        // Préparation des termes de recherche (recherche croisée)
        const searchTermRaw = searchInput.value;
        const searchTerms = normalizeText(searchTermRaw).trim().split(/\s+/).filter(t => t !== "");
        
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            const cardStyles = card.getAttribute('data-style').toLowerCase();
            const cardContent = normalizeText(card.innerText);
            
            // Vérification du style (via bouton)
            const matchesStyle = (activeStyle === "all" || cardStyles.includes(activeStyle));
            
            // Vérification des mots (via barre de recherche) : tous les mots doivent être présents
            const matchesSearch = searchTerms.every(term => cardContent.includes(term));

            // Application immédiate de l'affichage
            card.style.display = (matchesStyle && matchesSearch) ? "block" : "none";
        });
        updateStats();
    };

    const resetStylesToAll = () => {
        const allBtn = document.querySelector('.style-card[data-filter="all"]');
        const currentActive = document.querySelector('.style-card.active');
        
        // On ne réinitialise que si on n'est pas déjà sur "Tous" pour éviter les calculs inutiles
        if (allBtn && currentActive !== allBtn) {
            document.querySelectorAll('.style-card').forEach(x => x.classList.remove('active'));
            allBtn.classList.add('active');
        }
    };

    // --- 3. GESTION DES ÉVÉNEMENTS DE RECHERCHE ---
    
    // Événement principal : chaque lettre tapée
    searchInput.addEventListener('input', () => {
        // Si l'utilisateur commence à chercher, on annule le filtre par catégorie
        if (searchInput.value.trim() !== "") {
            resetStylesToAll();
        }
        filterLibrary();
    });

    // Touche Entrée : Empêche le comportement par défaut et valide le filtre
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            filterLibrary();
        }
    });

    // Boutons de style de la page principale
    document.querySelectorAll('.style-card[data-filter]').forEach(btn => {
        btn.onclick = () => {
            // Un clic sur un style vide la recherche textuelle
            searchInput.value = ""; 
            document.querySelectorAll('.style-card').forEach(x => x.classList.remove('active'));
            btn.classList.add('active');
            filterLibrary();
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

    const activateFilterFromModal = (filterValue) => {
        // On simule un clic sur le filtre de la page
        const targetBtn = document.querySelector(`.style-card[data-filter="${filterValue}"]`);
        if (targetBtn) {
            searchInput.value = ""; 
            document.querySelectorAll('.style-card').forEach(b => b.classList.remove('active'));
            targetBtn.classList.add('active');
            filterLibrary();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // --- 5. INITIALISATION ET ACTIONS ---
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

    // Événement global pour les clics (Modale, Copie)
    document.addEventListener('click', e => {
        const card = e.target.closest('.card');
        
        // Ouvrir la modale
        if (card && !e.target.closest('.admin-controls') && !e.target.classList.contains('btn-copy')) {
            const imgData = card.querySelector('.card-img').getAttribute('data-all-imgs');
            currentGalleryImages = imgData.split(',');
            
            const modalBody = document.querySelector('.modal-right .modal-body');
            const modalDesc = document.getElementById('modalDescription');
            document.getElementById('modalTitle').innerText = card.querySelector('.card-header').innerText;

            // Badges de style dans la modale
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
                    document.getElementById('promptModal').style.display = 'none';
                    activateFilterFromModal(s.toLowerCase());
                };
                stylesWrapper.appendChild(badge);
            });
            modalBody.insertBefore(stylesWrapper, modalDesc);

            modalDesc.innerText = card.querySelector('.full-prompt-hidden').innerText;
            
            // Miniatures
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
            document.getElementById('promptModal').style.display = 'flex';
        }

        // Action Copier
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

        // Fermeture Modale
        if (e.target.classList.contains('modal-close') || e.target.id === 'promptModal') {
            document.getElementById('promptModal').style.display = 'none';
        }
    });

    // Flèches de navigation
    document.querySelector('.prev-btn').onclick = () => updateGalleryImage((currentImgIndex - 1 + currentGalleryImages.length) % currentGalleryImages.length);
    document.querySelector('.next-btn').onclick = () => updateGalleryImage((currentImgIndex + 1) % currentGalleryImages.length);

    // Initialisation
    renderLibrary();
});