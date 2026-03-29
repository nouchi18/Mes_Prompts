document.addEventListener("DOMContentLoaded", () => {
    const grid = document.getElementById('grid');
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

    // --- 1. FONCTION AUTO-TITRE ---
    const autoGenerateTitle = (prompt) => {
        const stopWords = ['un', 'une', 'le', 'la', 'les', 'de', 'du', 'des', 'au', 'aux', 'et', 'pour', 'avec', 'dans', 'sur'];
        const words = prompt.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").split(/\s+/);
        const keywords = words.filter(word => word.length > 3 && !stopWords.includes(word));
        const final = keywords.slice(0, 3).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
        return final || "NOUVEAU PROMPT";
    };

    // --- 2. RENDU DE LA GRILLE ---
    const renderLibrary = () => {
        grid.innerHTML = "";
        if (typeof promptDatabase !== 'undefined') {
            promptDatabase.forEach((data, index) => {
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
                grid.appendChild(card);
            });
        }
        updateStats();
    };

    // --- 3. FILTRAGE STABLE ---
    const filterLibrary = () => {
        const activeBtn = document.querySelector('.style-card.active');
        const activeStyle = activeBtn ? activeBtn.getAttribute('data-filter').toLowerCase() : "all";
        const term = searchInput.value.toLowerCase().trim();
        
        document.querySelectorAll('.card').forEach(card => {
            const cardStyles = card.getAttribute('data-style').toLowerCase();
            const cardTitle = card.querySelector('.card-header').innerText.toLowerCase();
            const cardPrompt = card.querySelector('.full-prompt-hidden').innerText.toLowerCase();
            
            const matchesCat = (activeStyle === "all" || cardStyles.includes(activeStyle));
            const matchesSearch = (term === "" || cardTitle.includes(term) || cardStyles.includes(term) || cardPrompt.includes(term));
            
            card.style.display = (matchesCat && matchesSearch) ? "block" : "none";
        });
        updateStats();
    };

    const updateStats = () => {
        const visible = [...document.querySelectorAll('.card')].filter(c => c.style.display !== "none").length;
        document.getElementById('counter').innerText = `${visible} Prompt(s) affiché(s)`;
    };

    // --- 4. CLAVIER (ENTRÉE & M) ---
    document.addEventListener('keydown', (e) => {
        const isTyping = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
        if (e.key.toLowerCase() === 'm' && !isTyping) {
            e.preventDefault();
            isAdminMode = !isAdminMode;
            document.querySelectorAll('.admin-controls').forEach(c => c.style.display = isAdminMode ? 'flex' : 'none');
        }
        if (e.key === 'Enter' && e.target.id === 'searchInput') {
            e.preventDefault();
            filterLibrary();
        }
    });

    searchInput.addEventListener('input', () => { if (searchInput.value === "") filterLibrary(); });

    // --- 5. ACTIONS ADMINISTRATION ---
    btnSaveAction.onclick = () => {
        const titleInput = document.getElementById('adminTitle');
        const promptText = document.getElementById('adminPrompt').value;
        let finalTitle = titleInput.value.trim() || autoGenerateTitle(promptText);
        titleInput.value = finalTitle;

        const newPrompt = {
            title: finalTitle.toUpperCase(),
            styles: document.getElementById('adminStyles').value,
            img: document.getElementById('adminImg').value.split(','),
            prompt: promptText
        };
        genCodeArea.value = JSON.stringify(newPrompt, null, 4) + ",";
        genCodeSection.style.display = 'block';
    };

    // Bouton de copie Database
    btnCopyDB.onclick = function() {
        navigator.clipboard.writeText(genCodeArea.value).then(() => {
            const old = this.innerText;
            this.innerText = "✓ Code copié !";
            setTimeout(() => this.innerText = old, 2000);
        });
    };

    // --- 6. GESTION DES CLICS GLOBAUX ---
    document.addEventListener('click', e => {
        // MODIFIER
        if (e.target.classList.contains('btn-edit-card')) {
            const idx = e.target.getAttribute('data-idx');
            const data = promptDatabase[idx];
            document.getElementById('adminTitle').value = data.title;
            document.getElementById('adminStyles').value = data.styles;
            document.getElementById('adminImg').value = Array.isArray(data.img) ? data.img.join(',') : data.img;
            document.getElementById('adminPrompt').value = data.prompt;
            adminPanel.style.display = 'flex';
            genCodeSection.style.display = 'none';
            return;
        }

        // SUPPRIMER
        if (e.target.classList.contains('btn-delete-card')) {
            if(confirm("Supprimer ce prompt ?")) {
                const idx = e.target.getAttribute('data-idx');
                promptDatabase.splice(idx, 1);
                renderLibrary();
                // Génère le code complet pour mise à jour manuelle du fichier JS
                genCodeArea.value = "const promptDatabase = " + JSON.stringify(promptDatabase, null, 4) + ";";
                genCodeSection.style.display = 'block';
                adminPanel.style.display = 'flex';
            }
            return;
        }

        // COPIER PROMPT
        if (e.target.classList.contains('btn-copy') && e.target.id !== 'btnCopyDB') {
            const text = (e.target.id === "modalCopyBtn") ? document.getElementById('modalDescription').innerText : e.target.closest('.card-content').querySelector('.full-prompt-hidden').innerText;
            navigator.clipboard.writeText(text).then(() => {
                const b = e.target; const old = b.innerText; b.innerText = "✓ Copié !";
                setTimeout(() => b.innerText = old, 2000);
            });
            return;
        }

        // OUVERTURE MODALE VISU
        const card = e.target.closest('.card');
        if (card && !e.target.closest('.admin-controls') && !e.target.classList.contains('btn-copy')) {
            const imgData = card.querySelector('.card-img').getAttribute('data-all-imgs');
            currentGalleryImages = imgData.split(',');
            document.getElementById('modalTitle').innerText = card.querySelector('.card-header').innerText;
            document.getElementById('modalDescription').innerText = card.querySelector('.full-prompt-hidden').innerText;
            
            const prevBtn = document.querySelector('.prev-btn');
            const nextBtn = document.querySelector('.next-btn');
            const thumbContainer = document.getElementById('modalThumbs');
            
            thumbContainer.innerHTML = "";
            
            if (currentGalleryImages.length > 1) {
                prevBtn.style.display = nextBtn.style.display = 'block';
                currentGalleryImages.forEach((src, i) => {
                    const t = document.createElement('img');
                    t.src = src; t.className = `thumb ${i===0?'active':''}`;
                    t.onclick = () => {
                        currentImgIndex = i;
                        document.getElementById('modalImg').src = src;
                        document.querySelectorAll('.thumb').forEach((th, idx) => th.classList.toggle('active', idx === i));
                    };
                    thumbContainer.appendChild(t);
                });
            } else {
                prevBtn.style.display = nextBtn.style.display = 'none';
            }
            
            currentImgIndex = 0;
            document.getElementById('modalImg').src = currentGalleryImages[0];
            document.getElementById('promptModal').style.display = 'flex';
        }

        // FERMETURES
        if (e.target.classList.contains('modal-close') || e.target.id === 'promptModal' || e.target.classList.contains('closeModal')) {
            document.getElementById('promptModal').style.display = 'none';
            adminPanel.style.display = 'none';
        }

        // NAVIGATION GALERIE
        if (e.target.classList.contains('prev-btn')) {
            currentImgIndex = (currentImgIndex - 1 + currentGalleryImages.length) % currentGalleryImages.length;
            document.getElementById('modalImg').src = currentGalleryImages[currentImgIndex];
            document.querySelectorAll('.thumb').forEach((th, idx) => th.classList.toggle('active', idx === currentImgIndex));
        }
        if (e.target.classList.contains('next-btn')) {
            currentImgIndex = (currentImgIndex + 1) % currentGalleryImages.length;
            document.getElementById('modalImg').src = currentGalleryImages[currentImgIndex];
            document.querySelectorAll('.thumb').forEach((th, idx) => th.classList.toggle('active', idx === currentImgIndex));
        }
    });

    openAdminBtn.onclick = () => { adminPanel.style.display = 'flex'; genCodeSection.style.display = 'none'; };
    closeAdminBtn.onclick = () => { adminPanel.style.display = 'none'; };

    document.querySelectorAll('.style-card').forEach(b => b.onclick = () => {
        document.querySelectorAll('.style-card').forEach(x => x.classList.remove('active'));
        b.classList.add('active'); filterLibrary();
    });

    renderLibrary();
});