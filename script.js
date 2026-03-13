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
    
    // Variables pour le slider
    let currentImages = [];
    let currentImgIndex = 0;
    let currentEditingCard = null;

    const renderLibrary = () => {
        grid.innerHTML = "";
        promptDatabase.forEach((data, index) => {
            const card = createCardElement(data, index);
            grid.appendChild(card);
        });
        updateStats();
    };

    const createCardElement = (data, index) => {
        // Gérer si data.img est un tableau ou une string pour l'affichage de la carte (on prend la 1ère image)
        const mainImg = Array.isArray(data.img) ? data.img[0] : data.img;
        const allImgsStr = Array.isArray(data.img) ? data.img.join(',') : data.img;

        const card = document.createElement('article');
        card.className = 'card';
        card.setAttribute('data-style', data.styles);
        card.setAttribute('data-index', index);
        card.innerHTML = `
            <img src="${mainImg}" class="card-img" alt="${data.title}">
            <div class="card-content">
                <div class="card-header">${data.title || "SANS TITRE"}</div>
                <p class="prompt-text">${data.prompt.substring(0, 100)}...</p>
                <div class="full-prompt-hidden" style="display:none;">${data.prompt}</div>
                <div class="all-images-hidden" style="display:none;">${allImgsStr}</div>
                <button class="btn-copy">Copier</button>
            </div>
        `;
        return card;
    };

    // --- LOGIQUE SLIDER ---
    const updateSlider = () => {
        const modalImg = document.getElementById('modalImg');
        const thumbs = document.querySelectorAll('.thumb-img');
        
        modalImg.src = currentImages[currentImgIndex];
        
        thumbs.forEach((t, i) => {
            t.classList.toggle('active', i === currentImgIndex);
        });

        // Cacher/Afficher les flèches si besoin
        const wrapper = document.querySelector('.modal-slider-wrapper');
        if (currentImages.length <= 1) {
            wrapper.classList.add('single-image');
        } else {
            wrapper.classList.remove('single-image');
        }
    };

    // --- RECHERCHE ET FILTRES ---
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

    searchInput.addEventListener('input', filterLibrary);
    document.querySelectorAll('.style-card').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.style-card').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterLibrary();
        };
    });

    // --- ACTIONS CLICS (CARTE & MODALE) ---
    document.addEventListener('click', (e) => {
        const card = e.target.closest('.card');
        
        // Ouvrir modale
        if (card && !e.target.closest('.admin-controls') && !e.target.classList.contains('btn-copy')) {
            const rawImgs = card.querySelector('.all-images-hidden').innerText;
            currentImages = rawImgs.split(',');
            currentImgIndex = 0;

            document.getElementById('modalTitle').innerText = card.querySelector('.card-header').innerText;
            document.getElementById('modalDescription').innerText = card.querySelector('.full-prompt-hidden').innerText;
            
            // Générer miniatures
            const thumbContainer = document.getElementById('thumbContainer');
            thumbContainer.innerHTML = "";
            if (currentImages.length > 1) {
                currentImages.forEach((src, idx) => {
                    const img = document.createElement('img');
                    img.src = src;
                    img.className = 'thumb-img';
                    img.onclick = () => { currentImgIndex = idx; updateSlider(); };
                    thumbContainer.appendChild(img);
                });
            }

            updateSlider();
            document.getElementById('promptModal').style.display = "block";
        }

        // Navigation Slider
        if (e.target.classList.contains('slider-prev')) {
            currentImgIndex = (currentImgIndex - 1 + currentImages.length) % currentImages.length;
            updateSlider();
        }
        if (e.target.classList.contains('slider-next')) {
            currentImgIndex = (currentImgIndex + 1) % currentImages.length;
            updateSlider();
        }

        // Copier
        if (e.target.classList.contains('btn-copy')) {
            const text = e.target.id === "modalCopyBtn" ? 
                document.getElementById('modalDescription').innerText : 
                e.target.closest('.card-content').querySelector('.full-prompt-hidden').innerText;
            navigator.clipboard.writeText(text).then(() => {
                const prev = e.target.innerText; e.target.innerText = "✓ Copié !";
                setTimeout(() => e.target.innerText = prev, 2000);
            });
        }

        // Fermer modales
        if (e.target.classList.contains('modal-close') || e.target.classList.contains('modal')) {
            document.querySelectorAll('.modal').forEach(m => m.style.display = "none");
        }
    });

    // --- ADMIN ---
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
        if (e.key.toLowerCase() === 'm') {
            const pass = prompt("Accès Administrateur :");
            if (pass === "1234") toggleAdminUI(true);
        }
    });

    const toggleAdminUI = (show) => {
        document.querySelectorAll('.card').forEach(card => {
            let controls = card.querySelector('.admin-controls');
            if (show) {
                if (!controls) {
                    controls = document.createElement('div');
                    controls.className = 'admin-controls';
                    const editBtn = document.createElement('button');
                    editBtn.className = 'btn-edit-card'; editBtn.innerText = 'MODIFIER';
                    editBtn.onclick = (ev) => {
                        ev.stopPropagation();
                        currentEditingCard = card;
                        adminModalTitle.innerText = "Modifier le Prompt";
                        adminForm.style.display = 'block';
                        document.getElementById('adminTitle').value = card.querySelector('.card-header').innerText;
                        document.getElementById('adminStyles').value = card.getAttribute('data-style');
                        document.getElementById('adminImg').value = card.querySelector('.all-images-hidden').innerText;
                        document.getElementById('adminPrompt').value = card.querySelector('.full-prompt-hidden').innerText;
                        genCodeSection.style.display = 'none';
                        adminPanel.style.display = "block";
                    };
                    const delBtn = document.createElement('button');
                    delBtn.className = 'btn-delete-card'; delBtn.innerText = 'SUPPRIMER';
                    delBtn.onclick = (ev) => {
                        ev.stopPropagation();
                        if (confirm("Supprimer ?")) { card.remove(); updateStats(); generateNewDatabaseCode(); }
                    };
                    controls.append(editBtn, delBtn);
                    card.appendChild(controls);
                }
                controls.style.display = "flex";
            } else if (controls) { controls.style.display = "none"; }
        });
        closeAdminModeBtn.style.display = show ? "flex" : "none";
    };

    document.getElementById('btnSaveAction').onclick = () => {
        const title = document.getElementById('adminTitle').value.trim().toUpperCase() || "SANS TITRE";
        const styles = document.getElementById('adminStyles').value.toLowerCase();
        const imgInput = document.getElementById('adminImg').value;
        const promptText = document.getElementById('adminPrompt').value;

        if (!promptText) return alert("Prompt obligatoire.");

        // Transformer l'input img en tableau si virgules présentes
        const img = imgInput.includes(',') ? imgInput.split(',').map(s => s.trim()) : imgInput;

        const tempEntry = { title, styles, img, prompt: promptText };
        generateNewDatabaseCode(tempEntry);
        adminForm.style.display = 'none';
        adminModalTitle.innerText = "🚀 Code prêt !";
    };

    const generateNewDatabaseCode = (newItem = null) => {
        const currentData = [];
        if (newItem && !currentEditingCard) currentData.push(newItem);

        document.querySelectorAll('.card').forEach(card => {
            if (currentEditingCard === card && newItem) {
                currentData.push(newItem);
            } else {
                const rawImgs = card.querySelector('.all-images-hidden').innerText;
                const imgData = rawImgs.includes(',') ? rawImgs.split(',') : rawImgs;
                currentData.push({
                    title: card.querySelector('.card-header').innerText,
                    styles: card.getAttribute('data-style'),
                    img: imgData,
                    prompt: card.querySelector('.full-prompt-hidden').innerText
                });
            }
        });
        genCodeArea.value = `const promptDatabase = ${JSON.stringify(currentData, null, 4)};`;
        genCodeSection.style.display = 'block';
    };

    document.getElementById('openAdmin').onclick = () => {
        currentEditingCard = null;
        adminModalTitle.innerText = "Ajouter un Prompt";
        adminForm.reset();
        adminPanel.style.display = 'block';
    };

    document.getElementById('btnCopyDB').onclick = () => {
        navigator.clipboard.writeText(genCodeArea.value).then(() => {
            alert("Code copié !");
            adminPanel.style.display = 'none';
        });
    };

    closeAdminModeBtn.onclick = () => toggleAdminUI(false);
    renderLibrary();
});