document.addEventListener("DOMContentLoaded", () => {
    const grid = document.getElementById('grid');
    const counter = document.getElementById('counter');
    const searchInput = document.getElementById('searchInput');
    const adminPanel = document.getElementById('adminPanel');
    const openAdminBtn = document.getElementById('openAdmin');
    const closeAdminBtn = document.getElementById('closeAdmin');
    const btnSaveAction = document.getElementById('btnSaveAction');
    const genCodeArea = document.getElementById('generatedCode');
    const genCodeSection = document.getElementById('generatedCodeSection');
    const btnCopyDB = document.getElementById('btnCopyDB');
    
    let currentGalleryImages = [];
    let currentImgIndex = 0;
    let isAdminMode = false;

    // --- 1. GÉNÉRATION GRILLE ---
    const renderLibrary = () => {
        grid.innerHTML = "";
        if (typeof promptDatabase !== 'undefined') {
            promptDatabase.forEach((data, index) => grid.appendChild(createCardElement(data, index)));
        }
        updateStats();
    };

    const createCardElement = (data, index) => {
        const card = document.createElement('article');
        card.className = 'card';
        card.setAttribute('data-style', data.styles);
        const mainImg = Array.isArray(data.img) ? data.img[0] : data.img;
        const allImgs = Array.isArray(data.img) ? data.img.join(',') : data.img;

        card.innerHTML = `
            <div class="admin-controls" style="display: ${isAdminMode ? 'flex' : 'none'}">
                <button class="btn-edit-card" data-idx="${index}">Modifier</button>
                <button class="btn-delete-card" data-idx="${index}">Supprimer</button>
            </div>
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

    // --- 2. RECHERCHE ET FILTRES ---
    const filterLibrary = () => {
        const activeBtn = document.querySelector('.style-card.active');
        const activeStyle = activeBtn ? activeBtn.getAttribute('data-filter') : "all";
        const term = searchInput.value.toLowerCase().trim();
        
        document.querySelectorAll('.card').forEach(card => {
            const styles = card.getAttribute('data-style').toLowerCase();
            const content = card.innerText.toLowerCase();
            const matchesStyle = (activeStyle === "all" || styles.includes(activeStyle));
            const matchesSearch = (term === "" || content.includes(term));
            card.style.display = (matchesStyle && matchesSearch) ? "block" : "none";
        });
        updateStats();
    };

    const updateStats = () => {
        const visible = [...document.querySelectorAll('.card')].filter(c => c.style.display !== "none").length;
        counter.innerText = `${visible} Prompt(s) affiché(s)`;
    };

    // --- 3. CLAVIER (ENTRÉE & M) ---
    document.addEventListener('keydown', (e) => {
        const isTyping = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';

        if (e.key.toLowerCase() === 'm' && !isTyping) {
            e.preventDefault();
            isAdminMode = !isAdminMode;
            document.querySelectorAll('.admin-controls').forEach(ctrl => {
                ctrl.style.display = isAdminMode ? 'flex' : 'none';
            });
        }

        if (e.key === 'Enter' && e.target === searchInput) {
            e.preventDefault();
            filterLibrary();
        }
    });

    searchInput.addEventListener('input', () => { if (searchInput.value === "") filterLibrary(); });

    // --- 4. ADMIN ACTIONS ---
    openAdminBtn.onclick = () => { adminPanel.style.display = 'flex'; genCodeSection.style.display = 'none'; };
    closeAdminBtn.onclick = () => { adminPanel.style.display = 'none'; };

    btnSaveAction.onclick = () => {
        const newPrompt = {
            title: document.getElementById('adminTitle').value,
            styles: document.getElementById('adminStyles').value,
            img: document.getElementById('adminImg').value.split(','),
            prompt: document.getElementById('adminPrompt').value
        };
        genCodeArea.value = JSON.stringify(newPrompt, null, 4) + ",";
        genCodeSection.style.display = 'block';
    };

    btnCopyDB.onclick = function() {
        navigator.clipboard.writeText(genCodeArea.value).then(() => {
            const oldText = this.innerText;
            this.innerText = "✓ Code copié !";
            setTimeout(() => { this.innerText = oldText; }, 2000);
        });
    };

    // --- 5. CLICS GLOBAUX ---
    const updateGalleryImage = (index) => {
        currentImgIndex = index;
        document.getElementById('modalImg').src = currentGalleryImages[currentImgIndex];
        document.querySelectorAll('.thumb').forEach((t, i) => t.classList.toggle('active', i === currentImgIndex));
    };

    document.addEventListener('click', e => {
        if (e.target.classList.contains('btn-edit-card')) {
            const data = promptDatabase[e.target.dataset.idx];
            document.getElementById('adminTitle').value = data.title;
            document.getElementById('adminStyles').value = data.styles;
            document.getElementById('adminImg').value = data.img.join(',');
            document.getElementById('adminPrompt').value = data.prompt;
            adminPanel.style.display = 'flex';
            return;
        }

        if (e.target.classList.contains('btn-delete-card')) {
            if(confirm("Supprimer ?")) {
                promptDatabase.splice(e.target.dataset.idx, 1);
                renderLibrary();
                genCodeArea.value = "const promptDatabase = " + JSON.stringify(promptDatabase, null, 4) + ";";
                genCodeSection.style.display = 'block';
                adminPanel.style.display = 'flex';
            }
            return;
        }

        const card = e.target.closest('.card');
        if (card && !e.target.closest('.admin-controls') && !e.target.classList.contains('btn-copy')) {
            const imgData = card.querySelector('.card-img').getAttribute('data-all-imgs');
            currentGalleryImages = imgData.split(',');
            document.getElementById('modalTitle').innerText = card.querySelector('.card-header').innerText;
            document.getElementById('modalDescription').innerText = card.querySelector('.full-prompt-hidden').innerText;
            
            const thumbContainer = document.getElementById('modalThumbs');
            thumbContainer.innerHTML = "";
            if (currentGalleryImages.length > 1) {
                currentGalleryImages.forEach((src, i) => {
                    const t = document.createElement('img');
                    t.src = src; t.className = `thumb ${i===0?'active':''}`;
                    t.onclick = () => updateGalleryImage(i);
                    thumbContainer.appendChild(t);
                });
            }
            updateGalleryImage(0);
            document.getElementById('promptModal').style.display = 'flex';
        }

        if (e.target.classList.contains('btn-copy')) {
            const text = e.target.closest('.card-content').querySelector('.full-prompt-hidden').innerText;
            navigator.clipboard.writeText(text).then(() => {
                const b = e.target; const old = b.innerText; b.innerText = "✓ Copié !";
                setTimeout(() => b.innerText = old, 2000);
            });
        }

        if (e.target.classList.contains('modal-close') || e.target.id === 'promptModal' || e.target.id === 'adminPanel') {
            document.getElementById('promptModal').style.display = 'none';
            adminPanel.style.display = 'none';
        }

        if (e.target.classList.contains('prev-btn')) {
            currentImgIndex = (currentImgIndex - 1 + currentGalleryImages.length) % currentGalleryImages.length;
            updateGalleryImage(currentImgIndex);
        }
        if (e.target.classList.contains('next-btn')) {
            currentImgIndex = (currentImgIndex + 1) % currentGalleryImages.length;
            updateGalleryImage(currentImgIndex);
        }
    });

    document.querySelectorAll('.style-card[data-filter]').forEach(b => {
        b.onclick = () => {
            document.querySelectorAll('.style-card').forEach(x => x.classList.remove('active'));
            b.classList.add('active'); 
            filterLibrary();
        };
    });

    renderLibrary();
});