document.addEventListener("DOMContentLoaded", () => {
    const grid = document.getElementById('grid');
    const counter = document.getElementById('counter');
    const searchInput = document.getElementById('searchInput');
    const adminPanel = document.getElementById('adminPanel');
    const genCodeArea = document.getElementById('generatedCode');
    const closeAdminModeBtn = document.getElementById('closeAdminMode');
    const adminForm = document.getElementById('adminForm');
    const adminModalTitle = document.getElementById('adminModalTitle');
    const genCodeSection = document.getElementById('generatedCodeSection');
    
    let currentGalleryImages = [];
    let currentImgIndex = 0;
    let currentEditingCard = null;

    // --- 1. GÉNÉRATION GRILLE ---
    const renderLibrary = () => {
        grid.innerHTML = "";
        promptDatabase.forEach(data => grid.appendChild(createCardElement(data)));
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

    // --- 2. GESTION GALERIE ---
    const updateGalleryImage = (index) => {
        currentImgIndex = index;
        document.getElementById('modalImg').src = currentGalleryImages[currentImgIndex];
        document.querySelectorAll('.thumb').forEach((t, i) => t.classList.toggle('active', i === currentImgIndex));
    };

    // --- 3. RECHERCHE ET FILTRES ---
    const updateStats = () => {
        const visible = [...document.querySelectorAll('.card')].filter(c => c.style.display !== "none").length;
        counter.innerText = `${visible} Prompt(s) affiché(s)`;
    };

    const filterLibrary = () => {
        const activeStyle = document.querySelector('.style-card.active').getAttribute('data-filter');
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

    // --- 4. MODE ADMIN (Touche M) ---
    document.addEventListener('keydown', e => {
        if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
        if (e.key.toLowerCase() === 'm' && prompt("Accès Admin :") === "1234") toggleAdminUI(true);
    });

    const toggleAdminUI = show => {
        document.querySelectorAll('.card').forEach(card => {
            let controls = card.querySelector('.admin-controls');
            if (show) {
                if (!controls) {
                    controls = document.createElement('div');
                    controls.className = 'admin-controls';
                    controls.innerHTML = `<button class="btn-edit-card">MODIFIER</button><button class="btn-delete-card">SUPPRIMER</button>`;
                    
                    controls.querySelector('.btn-edit-card').onclick = ev => {
                        ev.stopPropagation();
                        currentEditingCard = card;
                        adminForm.style.display = 'block';
                        document.getElementById('adminTitle').value = card.querySelector('.card-header').innerText;
                        document.getElementById('adminStyles').value = card.getAttribute('data-style');
                        document.getElementById('adminImg').value = card.querySelector('.card-img').getAttribute('data-all-imgs');
                        document.getElementById('adminPrompt').value = card.querySelector('.full-prompt-hidden').innerText;
                        adminPanel.style.display = 'block';
                    };
                    controls.querySelector('.btn-delete-card').onclick = ev => {
                        ev.stopPropagation();
                        if(confirm("Supprimer ?")) { card.remove(); generateNewDatabaseCode(); }
                    };
                    card.appendChild(controls);
                }
                controls.style.display = 'flex';
            } else if (controls) controls.style.display = 'none';
        });
        closeAdminModeBtn.style.display = show ? "flex" : "none";
    };

    // --- 5. EXPORT DATABASE ---
    const generateNewDatabaseCode = (newItem = null) => {
        const currentData = [];
        if (newItem && !currentEditingCard) currentData.push(newItem);
        document.querySelectorAll('.card').forEach(card => {
            if (currentEditingCard === card && newItem) currentData.push(newItem);
            else {
                const imgAttr = card.querySelector('.card-img').getAttribute('data-all-imgs');
                currentData.push({
                    title: card.querySelector('.card-header').innerText,
                    styles: card.getAttribute('data-style'),
                    img: imgAttr.includes(',') ? imgAttr.split(',') : [imgAttr],
                    prompt: card.querySelector('.full-prompt-hidden').innerText
                });
            }
        });
        genCodeArea.value = `const promptDatabase = ${JSON.stringify(currentData, null, 4)};`;
        genCodeSection.style.display = 'block';
        adminForm.style.display = 'none';
    };

    // --- 6. ÉVÉNEMENTS ---
    document.getElementById('btnSaveAction').onclick = () => {
        const imgInput = document.getElementById('adminImg').value;
        generateNewDatabaseCode({
            title: document.getElementById('adminTitle').value.toUpperCase(),
            styles: document.getElementById('adminStyles').value.toLowerCase(),
            img: imgInput.split(',').map(s => s.trim()),
            prompt: document.getElementById('adminPrompt').value
        });
    };

    document.addEventListener('click', e => {
        const card = e.target.closest('.card');
        
        // Clic sur une carte
        if (card && !e.target.closest('.admin-controls') && !e.target.classList.contains('btn-copy')) {
            const imgData = card.querySelector('.card-img').getAttribute('data-all-imgs');
            currentGalleryImages = imgData.split(',');
            currentImgIndex = 0;

            document.getElementById('modalTitle').innerText = card.querySelector('.card-header').innerText;
            document.getElementById('modalDescription').innerText = card.querySelector('.full-prompt-hidden').innerText;
            
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
            const text = e.target.id === "modalCopyBtn" ? document.getElementById('modalDescription').innerText : e.target.closest('.card-content').querySelector('.full-prompt-hidden').innerText;
            navigator.clipboard.writeText(text).then(() => {
                const b = e.target; const old = b.innerText; b.innerText = "✓ Copié !";
                setTimeout(() => b.innerText = old, 2000);
            });
        }

        // Fermer modales
        if (e.target.classList.contains('modal-close') || e.target.classList.contains('modal')) {
            document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
        }
    });

    document.querySelector('.prev-btn').onclick = () => updateGalleryImage((currentImgIndex - 1 + currentGalleryImages.length) % currentGalleryImages.length);
    document.querySelector('.next-btn').onclick = () => updateGalleryImage((currentImgIndex + 1) % currentGalleryImages.length);
    
    document.getElementById('btnCopyDB').onclick = () => {
        navigator.clipboard.writeText(genCodeArea.value).then(() => { alert("Database copiée !"); adminPanel.style.display='none'; location.reload(); });
    };

    searchInput.addEventListener('input', filterLibrary);
    document.querySelectorAll('.style-card').forEach(b => b.onclick = () => {
        document.querySelectorAll('.style-card').forEach(x => x.classList.remove('active'));
        b.classList.add('active'); filterLibrary();
    });

    document.getElementById('openAdmin').onclick = () => {
        currentEditingCard = null; adminForm.style.display='block';
        ['adminTitle','adminStyles','adminImg','adminPrompt'].forEach(id => document.getElementById(id).value = "");
        adminPanel.style.display='block';
    };

    closeAdminModeBtn.onclick = () => toggleAdminUI(false);
    renderLibrary();
});