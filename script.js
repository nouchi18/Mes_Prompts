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

    // --- 1. FONCTIONS DE BASE ---
    const updateStats = () => {
        const visible = [...document.querySelectorAll('.card')].filter(c => c.style.display !== "none").length;
        counter.innerText = `${visible} Prompt(s) affiché(s)`;
    };

    const filterLibrary = () => {
        const activeBtn = document.querySelector('.style-card.active');
        const activeStyle = activeBtn ? activeBtn.getAttribute('data-filter') : "all";
        const term = searchInput.value.toLowerCase();
        
        document.querySelectorAll('.card').forEach(card => {
            const styles = card.getAttribute('data-style').toLowerCase();
            const content = card.innerText.toLowerCase();
            const matchesStyle = activeStyle === "all" || styles.includes(activeStyle);
            const matchesSearch = term === "" || content.includes(term);
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

    // --- 2. GÉNÉRATION DE LA GRILLE ---
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

    // --- 3. GALERIE MODALE ---
    const updateGalleryImage = (index) => {
        currentImgIndex = index;
        document.getElementById('modalImg').src = currentGalleryImages[currentImgIndex];
        document.querySelectorAll('.thumb').forEach((t, i) => t.classList.toggle('active', i === currentImgIndex));
    };

    // --- 4. ÉVÉNEMENTS ---
    document.addEventListener('click', e => {
        const card = e.target.closest('.card');
        
        // Ouvrir Modale
        if (card && !e.target.closest('.admin-controls') && !e.target.classList.contains('btn-copy')) {
            const imgData = card.querySelector('.card-img').getAttribute('data-all-imgs');
            currentGalleryImages = imgData.split(',');
            
            const modalBody = document.querySelector('.modal-right .modal-body');
            const modalDesc = document.getElementById('modalDescription');
            
            // Titre
            document.getElementById('modalTitle').innerText = card.querySelector('.card-header').innerText;

            // Badges de Style cliquables
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
                badge.onclick = () => {
                    document.getElementById('promptModal').style.display = 'none';
                    activateFilter(s.toLowerCase());
                };
                stylesWrapper.appendChild(badge);
            });
            modalBody.insertBefore(stylesWrapper, modalDesc);

            // Description & Galerie
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
            document.getElementById('promptModal').style.display = 'flex';
        }

        // Bouton Copier
        if (e.target.classList.contains('btn-copy')) {
            const text = e.target.id === "modalCopyBtn" ? 
                document.getElementById('modalDescription').innerText : 
                e.target.closest('.card-content').querySelector('.full-prompt-hidden').innerText;
            
            navigator.clipboard.writeText(text).then(() => {
                const b = e.target; const old = b.innerText; b.innerText = "✓ Copié !";
                setTimeout(() => b.innerText = old, 2000);
            });
        }

        // Fermeture
        if (e.target.classList.contains('modal-close') || e.target.id === 'promptModal') {
            document.getElementById('promptModal').style.display = 'none';
        }
    });

    // Navigation Galerie
    document.querySelector('.prev-btn').onclick = () => updateGalleryImage((currentImgIndex - 1 + currentGalleryImages.length) % currentGalleryImages.length);
    document.querySelector('.next-btn').onclick = () => updateGalleryImage((currentImgIndex + 1) % currentGalleryImages.length);

    // Filtres barre latérale
    document.querySelectorAll('.style-card[data-filter]').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.style-card').forEach(x => x.classList.remove('active'));
            btn.classList.add('active');
            filterLibrary();
        };
    });

    searchInput.addEventListener('input', filterLibrary);
    renderLibrary();
});