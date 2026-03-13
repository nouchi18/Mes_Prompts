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
    
    // Variables pour la galerie
    let currentGalleryImages = [];
    let currentImgIndex = 0;
    let currentEditingCard = null;

    // --- 1. GÉNÉRATION DE LA GRILLE ---
    const renderLibrary = () => {
        grid.innerHTML = "";
        promptDatabase.forEach((data) => {
            const card = createCardElement(data);
            grid.appendChild(card);
        });
        updateStats();
    };

    const createCardElement = (data) => {
        const card = document.createElement('article');
        card.className = 'card';
        card.setAttribute('data-style', data.styles);
        
        // Gestion de l'image principale (si array ou string)
        const mainImg = Array.isArray(data.img) ? data.img[0] : data.img;
        // On stocke tous les liens d'images dans un attribut data pour les récupérer plus tard
        const allImgs = Array.isArray(data.img) ? data.img.join(',') : data.img;

        card.innerHTML = `
            <img src="${mainImg}" class="card-img" alt="${data.title}" data-all-imgs="${allImgs}">
            <div class="card-content">
                <div class="card-header">${data.title || "SANS TITRE"}</div>
                <p class="prompt-text">${data.prompt.substring(0, 100)}...</p>
                <div class="full-prompt-hidden" style="display:none;">${data.prompt}</div>
                <button class="btn-copy">Copier</button>
            </div>
        `;
        return card;
    };

    // --- 2. EXPORT DATABASE ---
    const generateNewDatabaseCode = (newItem = null) => {
        const currentData = [];
        if (newItem && !currentEditingCard) currentData.push(newItem);

        document.querySelectorAll('.card').forEach(card => {
            if (currentEditingCard === card && newItem) {
                currentData.push(newItem);
            } else {
                const imgAttr = card.querySelector('.card-img').getAttribute('data-all-imgs');
                currentData.push({
                    title: card.querySelector('.card-header').innerText,
                    styles: card.getAttribute('data-style'),
                    img: imgAttr.includes(',') ? imgAttr.split(',') : [imgAttr],
                    prompt: card.querySelector('.full-prompt-hidden').innerText
                });
            }
        });

        const code = `const promptDatabase = ${JSON.stringify(currentData, null, 4)};`;
        genCodeArea.value = code;
        genCodeSection.style.display = 'block';
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

    searchInput.addEventListener('input', filterLibrary);
    document.querySelectorAll('.style-card').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.style-card').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterLibrary();
        };
    });

    // --- 4. MODE ADMIN ---
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
                    editBtn.className = 'btn-edit-card';
                    editBtn.innerText = 'MODIFIER';
                    editBtn.onclick = (ev) => {
                        ev.stopPropagation();
                        currentEditingCard = card;
                        adminModalTitle.innerText = "Modifier le Prompt";
                        adminForm.style.display = 'block';
                        document.getElementById('adminTitle').value = card.querySelector('.card-header').innerText;
                        document.getElementById('adminStyles').value = card.getAttribute('data-style');
                        document.getElementById('adminImg').value = card.querySelector('.card-img').getAttribute('data-all-imgs');
                        document.getElementById('adminPrompt').value = card.querySelector('.full-prompt-hidden').innerText;
                        genCodeSection.style.display = 'none';
                        adminPanel.style.display = "block";
                    };

                    const delBtn = document.createElement('button');
                    delBtn.className = 'btn-delete-card';
                    delBtn.innerText = 'SUPPRIMER';
                    delBtn.onclick = (ev) => {
                        ev.stopPropagation();
                        if (confirm("Supprimer ce prompt définitivement ?")) {
                            card.remove();
                            updateStats();
                            generateNewDatabaseCode(); 
                            adminModalTitle.innerText = "🗑️ Card supprimée ! Code mis à jour :";
                            adminForm.style.display = 'none';
                            adminPanel.style.display = 'block';
                        }
                    };
                    controls.append(editBtn, delBtn);
                    card.appendChild(controls);
                }
                controls.style.display = "flex";
            } else if (controls) {
                controls.style.display = "none";
            }
        });
        closeAdminModeBtn.style.display = show ? "flex" : "none";
    };

    // --- 5. SAUVEGARDE ADMIN ---
    document.getElementById('btnSaveAction').onclick = () => {
        const title = document.getElementById('adminTitle').value.trim().toUpperCase() || "SANS TITRE";
        const styles = document.getElementById('adminStyles').value.toLowerCase();
        const imgInput = document.getElementById('adminImg').value || "Images/default.png";
        const promptText = document.getElementById('adminPrompt').value;

        if (!promptText) { alert("Le contenu du prompt est obligatoire."); return; }

        // Conversion de l'input texte en tableau d'images
        const imgArray = imgInput.split(',').map(s => s.trim()).filter(s => s !== "");

        const tempEntry = { title, styles, img: imgArray, prompt: promptText };
        generateNewDatabaseCode(tempEntry);
        adminForm.style.display = 'none';
        adminModalTitle.innerText = "🚀 Code prêt à être copié !";
    };

    // --- 6. GESTION DE LA GALERIE ---
    const updateGalleryImage = (index) => {
        currentImgIndex = index;
        const modalImg = document.getElementById('modalImg');
        modalImg.src = currentGalleryImages[currentImgIndex];
        
        // Update thumbnails
        document.querySelectorAll('.thumb').forEach((t, i) => {
            t.classList.toggle('active', i === currentImgIndex);
        });
    };

    // --- 7. CLICS & MODALES ---
    document.getElementById('openAdmin').onclick = (e) => {
        e.stopPropagation();
        currentEditingCard = null; 
        adminModalTitle.innerText = "Ajouter un Prompt";
        adminForm.style.display = 'block';
        document.getElementById('adminTitle').value = "";
        document.getElementById('adminStyles').value = "";
        document.getElementById('adminImg').value = "";
        document.getElementById('adminPrompt').value = "";
        genCodeSection.style.display = 'none';
        adminPanel.style.display = 'block';
    };

    document.addEventListener('click', (e) => {
        const card = e.target.closest('.card');
        
        // Ouverture Modale View
        if (card && !e.target.closest('.admin-controls') && !e.target.classList.contains('btn-copy')) {
            const imgData = card.querySelector('.card-img').getAttribute('data-all-imgs');
            currentGalleryImages = imgData.split(',');
            currentImgIndex = 0;

            document.getElementById('modalTitle').innerText = card.querySelector('.card-header').innerText;
            document.getElementById('modalDescription').innerText = card.querySelector('.full-prompt-hidden').innerText;
            
            // Setup Galerie
            const thumbContainer = document.getElementById('modalThumbs');
            thumbContainer.innerHTML = "";
            
            if (currentGalleryImages.length > 1) {
                document.querySelectorAll('.nav-btn').forEach(b => b.style.display = "block");
                currentGalleryImages.forEach((src, i) => {
                    const thumb = document.createElement('img');
                    thumb.src = src;
                    thumb.className = `thumb ${i === 0 ? 'active' : ''}`;
                    thumb.onclick = () => updateGalleryImage(i);
                    thumbContainer.appendChild(thumb);
                });
            } else {
                document.querySelectorAll('.nav-btn').forEach(b => b.style.display = "none");
            }

            updateGalleryImage(0);
            document.getElementById('promptModal').style.display = "block";
        }

        // Copie Presse-papier
        if (e.target.classList.contains('btn-copy')) {
            const text = e.target.id === "modalCopyBtn" ? 
                document.getElementById('modalDescription').innerText : 
                e.target.closest('.card-content').querySelector('.full-prompt-hidden').innerText;
            navigator.clipboard.writeText(text).then(() => {
                const prev = e.target.innerText; e.target.innerText = "✓ Copié !";
                setTimeout(() => e.target.innerText = prev, 2000);
            });
        }

        // Fermeture Modale
        if (e.target.classList.contains('modal-close') || e.target.classList.contains('modal')) {
            document.querySelectorAll('.modal').forEach(m => m.style.display = "none");
        }
    });

    // Navigation Galerie
    document.querySelector('.prev-btn').onclick = (e) => {
        e.stopPropagation();
        let next = currentImgIndex - 1;
        if (next < 0) next = currentGalleryImages.length - 1;
        updateGalleryImage(next);
    };

    document.querySelector('.next-btn').onclick = (e) => {
        e.stopPropagation();
        let next = currentImgIndex + 1;
        if (next >= currentGalleryImages.length) next = 0;
        updateGalleryImage(next);
    };

    document.getElementById('btnCopyDB').onclick = () => {
        navigator.clipboard.writeText(genCodeArea.value).then(() => {
            alert("Code copié ! Remplacez le contenu de database.js.");
            adminPanel.style.display = 'none';
            location.reload(); // Recharger pour voir les changements
        });
    };

    closeAdminModeBtn.onclick = () => toggleAdminUI(false);
    renderLibrary();
});