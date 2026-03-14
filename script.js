document.addEventListener("DOMContentLoaded", () => {
    const grid = document.getElementById('grid');
    const counter = document.getElementById('counter');
    const searchInput = document.getElementById('searchInput');
    const adminPanel = document.getElementById('adminPanel');
    const genCodeArea = document.getElementById('generatedCode');
    const closeAdminModeBtn = document.getElementById('closeAdminMode');
    
    let currentGalleryImages = [];
    let currentImgIndex = 0;

    // --- 1. UTILITAIRES ---
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
        
        const searchTerms = normalizeText(searchInput.value).trim().split(/\s+/).filter(t => t !== "");
        
        document.querySelectorAll('.card').forEach(card => {
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
            // RÉINITIALISATION DE LA BARRE DE RECHERCHE
            searchInput.value = ""; 
            
            document.querySelectorAll('.style-card').forEach(b => b.classList.remove('active'));
            targetBtn.classList.add('active');
            filterLibrary();
        }
    };

    // --- 3. GÉNÉRATION INTERFACE ---
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

    // --- 4. GESTION MODALE ---
    const updateGalleryImage = (index) => {
        currentImgIndex = index;
        document.getElementById('modalImg').src = currentGalleryImages[currentImgIndex];
        document.querySelectorAll('.thumb').forEach((t, i) => t.classList.toggle('active', i === currentImgIndex));
    };

    // --- 5. ÉVÉNEMENTS ---
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
                badge.onclick = (event) => {
                    event.stopPropagation();
                    document.getElementById('promptModal').style.display = 'none';
                    activateFilter(s.toLowerCase());
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
            document.getElementById('promptModal').style.display = 'flex';
        }

        if (e.target.classList.contains('btn-copy')) {
            const text = e.target.id === "modalCopyBtn" ? 
                document.getElementById('modalDescription').innerText : 
                e.target.closest('.card-content').querySelector('.full-prompt-hidden').innerText;
            
            navigator.clipboard.writeText(text).then(() => {
                const b = e.target; const oldText = b.innerText;
                b.innerText = "✓ Copié !";
                setTimeout(() => b.innerText = oldText, 2000);
            });
        }

        if (e.target.classList.contains('modal-close') || e.target.id === 'promptModal') {
            document.getElementById('promptModal').style.display = 'none';
        }
    });

    document.querySelector('.prev-btn').onclick = () => updateGalleryImage((currentImgIndex - 1 + currentGalleryImages.length) % currentGalleryImages.length);
    document.querySelector('.next-btn').onclick = () => updateGalleryImage((currentImgIndex + 1) % currentGalleryImages.length);

    // --- RECHERCHE (TOUCHE ENTRÉE) ---
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            // Quand on utilise la recherche, on remet le filtre style sur "Tous" (# Tous)
            const allBtn = document.querySelector('.style-card[data-filter="all"]');
            if (allBtn) {
                document.querySelectorAll('.style-card').forEach(x => x.classList.remove('active'));
                allBtn.classList.add('active');
            }
            filterLibrary();
        }
    });

    // --- BOUTONS DE STYLE ---
    document.querySelectorAll('.style-card[data-filter]').forEach(btn => {
        btn.onclick = () => {
            // RÉINITIALISATION DE LA BARRE DE RECHERCHE AU CLIC SUR UN STYLE
            searchInput.value = ""; 
            
            document.querySelectorAll('.style-card').forEach(x => x.classList.remove('active'));
            btn.classList.add('active');
            filterLibrary();
        };
    });

    renderLibrary();
});