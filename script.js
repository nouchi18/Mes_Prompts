document.addEventListener("DOMContentLoaded", () => {
    const grid = document.getElementById('grid');
    const counter = document.getElementById('counter');
    const searchInput = document.getElementById('searchInput');
    const adminPanel = document.getElementById('adminPanel');
    const genCodeArea = document.getElementById('generatedCode');
    const closeAdminModeBtn = document.getElementById('closeAdminMode');
    const adminForm = document.getElementById('adminForm');
    const genCodeSection = document.getElementById('generatedCodeSection');
    
    let currentGalleryImages = [];
    let currentImgIndex = 0;
    let currentEditingCard = null;

    // --- 1. UTILITAIRES ---

    // Supprime les accents et met en minuscule pour une recherche robuste
    const normalizeText = (text) => {
        return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    };

    const updateStats = () => {
        const visible = [...document.querySelectorAll('.card')].filter(c => c.style.display !== "none").length;
        counter.innerText = `${visible} Prompt(s) affiché(s)`;
    };

    // --- 2. FILTRAGE ET RECHERCHE ---

    const filterLibrary = () => {
        const activeBtn = document.querySelector('.style-card.active');
        const activeStyle = activeBtn ? activeBtn.getAttribute('data-filter') : "all";
        
        // Sépare la saisie en plusieurs mots (recherche croisée)
        const searchTerms = normalizeText(searchInput.value).trim().split(/\s+/).filter(t => t !== "");
        
        document.querySelectorAll('.card').forEach(card => {
            const cardStyles = card.getAttribute('data-style').toLowerCase();
            const cardContent = normalizeText(card.innerText);
            
            // Vérification du bouton de style
            const matchesStyle = activeStyle === "all" || cardStyles.includes(activeStyle);
            
            // Vérification croisée : CHAQUE mot recherché doit être présent
            const matchesSearch = searchTerms.every(term => cardContent.includes(term));

            card.style.display = (matchesStyle && matchesSearch) ? "block" : "none";
        });
        updateStats();
    };

    const activateFilter = (filterValue) => {
        const targetBtn = document.querySelector(`.style-card[data-filter="${filterValue}"]`);
        if (targetBtn) {
            document.querySelectorAll('.style-card').forEach(b => b.classList.remove('active'));
            targetBtn.classList.add('active');
            filterLibrary();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // --- 3. GÉNÉRATION DE L'INTERFACE ---

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
        promptDatabase.forEach(data => grid.appendChild(createCardElement(data)));
        updateStats();
    };

    // --- 4. GESTION DE LA MODALE ET GALERIE ---

    const updateGalleryImage = (index) => {
        currentImgIndex = index;
        const modalImg = document.getElementById('modalImg');
        modalImg.src = currentGalleryImages[currentImgIndex];
        
        document.querySelectorAll('.thumb').forEach((t, i) => {
            t.classList.toggle('active', i === currentImgIndex);
        });
    };

    // --- 5. GESTIONNAIRES D'ÉVÉNEMENTS ---

    document.addEventListener('click', e => {
        const card = e.target.closest('.card');
        
        // OUVERTURE DE LA MODALE
        if (card && !e.target.closest('.admin-controls') && !e.target.classList.contains('btn-copy')) {
            const imgData = card.querySelector('.card-img').getAttribute('data-all-imgs');
            currentGalleryImages = imgData.split(',');
            
            const modalBody = document.querySelector('.modal-right .modal-body');
            const modalDesc = document.getElementById('modalDescription');
            
            // Titre
            document.getElementById('modalTitle').innerText = card.querySelector('.card-header').innerText;

            // Badges de Style dynamiques et cliquables
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
                badge.onclick = (event) => {
                    event.stopPropagation();
                    document.getElementById('promptModal').style.display = 'none';
                    activateFilter(s.toLowerCase());
                };
                stylesWrapper.appendChild(badge);
            });
            modalBody.insertBefore(stylesWrapper, modalDesc);

            // Description
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

        // COPIE DU PROMPT
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

        // FERMETURE DES MODALES
        if (e.target.classList.contains('modal-close') || e.target.id === 'promptModal') {
            document.getElementById('promptModal').style.display = 'none';
        }
    });

    // Navigation Galerie (Flèches)
    document.querySelector('.prev-btn').onclick = () => updateGalleryImage((currentImgIndex - 1 + currentGalleryImages.length) % currentGalleryImages.length);
    document.querySelector('.next-btn').onclick = () => updateGalleryImage((currentImgIndex + 1) % currentGalleryImages.length);

    // Recherche et Filtres boutons
    searchInput.addEventListener('input', filterLibrary);
    
    document.querySelectorAll('.style-card[data-filter]').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.style-card').forEach(x => x.classList.remove('active'));
            btn.classList.add('active');
            filterLibrary();
        };
    });

    // Initialisation
    renderLibrary();
});