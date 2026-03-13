document.addEventListener("DOMContentLoaded", () => {
    const grid = document.getElementById('grid');
    const counter = document.getElementById('counter');
    const searchInput = document.getElementById('searchInput');
    const adminPanel = document.getElementById('adminPanel');
    const genCodeArea = document.getElementById('generatedCode');
    const closeAdminModeBtn = document.getElementById('closeAdminMode');
    const adminForm = document.getElementById('adminForm');
    
    // Variables de navigation pour la modale
    let currentPromptImages = [];
    let currentImageIndex = 0;
    let currentEditingCard = null;

    // --- 1. RENDU DE LA GRILLE ---
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
        // On affiche la première image du tableau comme couverture
        const coverImg = data.images && data.images.length > 0 ? data.images[0] : "Images/default.png";
        
        card.innerHTML = `
            <img src="${coverImg}" class="card-img" alt="${data.title}">
            <div class="card-content">
                <div class="card-header">${data.title || "SANS TITRE"}</div>
                <p class="prompt-text">${data.prompt.substring(0, 80)}...</p>
                <div class="full-data-hidden" style="display:none;">${JSON.stringify(data)}</div>
                <button class="btn-copy">Copier</button>
            </div>
        `;
        return card;
    };

    // --- 2. GESTION DE LA MODALE & SLIDER ---
    const openModal = (data) => {
        currentPromptImages = data.images || [];
        currentImageIndex = 0;

        document.getElementById('modalTitle').innerText = data.title;
        document.getElementById('modalDescription').innerText = data.prompt;
        
        renderSlider();
        document.getElementById('promptModal').style.display = "block";
    };

    const renderSlider = () => {
        const modalImg = document.getElementById('modalImg');
        const thumbContainer = document.getElementById('thumbnailContainer');
        
        // Image principale
        modalImg.src = currentPromptImages[currentImageIndex];

        // Génération des miniatures
        thumbContainer.innerHTML = "";
        currentPromptImages.forEach((src, index) => {
            const thumb = document.createElement('img');
            thumb.src = src;
            thumb.className = `thumb-item ${index === currentImageIndex ? 'active' : ''}`;
            thumb.onclick = () => {
                currentImageIndex = index;
                renderSlider();
            };
            thumbContainer.appendChild(thumb);
        });
    };

    // Contrôles Slider
    document.getElementById('prevImg').onclick = () => {
        currentImageIndex = (currentImageIndex - 1 + currentPromptImages.length) % currentPromptImages.length;
        renderSlider();
    };
    document.getElementById('nextImg').onclick = () => {
        currentImageIndex = (currentImageIndex + 1) % currentPromptImages.length;
        renderSlider();
    };

    // --- 3. RECHERCHE ET FILTRES ---
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

    searchInput.addEventListener('input', filterLibrary);
    document.querySelectorAll('.style-card').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.style-card').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterLibrary();
        };
    });

    // --- 4. MODE ADMIN (Touche M) ---
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
        if (e.key.toLowerCase() === 'm') {
            const pass = prompt("Code Admin :");
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
                    controls.innerHTML = `
                        <button class="btn-edit-card">MODIFIER</button>
                        <button class="btn-delete-card">SUPPRIMER</button>
                    `;
                    
                    controls.querySelector('.btn-edit-card').onclick = (ev) => {
                        ev.stopPropagation();
                        currentEditingCard = card;
                        const data = JSON.parse(card.querySelector('.full-data-hidden').innerText);
                        
                        document.getElementById('adminModalTitle').innerText = "Modifier le Prompt";
                        document.getElementById('adminTitle').value = data.title;
                        document.getElementById('adminStyles').value = data.styles;
                        // On transforme le tableau en texte (un lien par ligne) pour le textarea
                        document.getElementById('adminImg').value = data.images.join('\n');
                        document.getElementById('adminPrompt').value = data.prompt;
                        
                        document.getElementById('generatedCodeSection').style.display = 'none';
                        adminForm.style.display = 'block';
                        adminPanel.style.display = "block";
                    };

                    controls.querySelector('.btn-delete-card').onclick = (ev) => {
                        ev.stopPropagation();
                        if (confirm("Supprimer ?")) {
                            card.remove();
                            updateStats();
                            generateNewDatabaseCode();
                        }
                    };
                    card.appendChild(controls);
                }
                controls.style.display = "flex";
            } else if (controls) {
                controls.style.display = "none";
            }
        });
        closeAdminModeBtn.style.display = show ? "flex" : "none";
    };

    // --- 5. EXPORT DATABASE ---
    const generateNewDatabaseCode = (newItem = null) => {
        const currentData = [];
        
        // Ajout nouveau en haut de liste
        if (newItem && !currentEditingCard) currentData.push(newItem);

        document.querySelectorAll('.card').forEach(card => {
            if (currentEditingCard === card && newItem) {
                currentData.push(newItem);
            } else {
                currentData.push(JSON.parse(card.querySelector('.full-data-hidden').innerText));
            }
        });

        genCodeArea.value = `const promptDatabase = ${JSON.stringify(currentData, null, 4)};`;
        document.getElementById('generatedCodeSection').style.display = 'block';
        adminForm.style.display = 'none';
        document.getElementById('adminModalTitle').innerText = "🚀 Code mis à jour !";
    };

    document.getElementById('btnSaveAction').onclick = () => {
        const title = document.getElementById('adminTitle').value.trim().toUpperCase() || "SANS TITRE";
        const styles = document.getElementById('adminStyles').value.toLowerCase();
        // On récupère les lignes du textarea et on filtre les vides
        const images = document.getElementById('adminImg').value.split('\n').filter(l => l.trim() !== "");
        const promptText = document.getElementById('adminPrompt').value;

        if (!promptText) return alert("Prompt vide !");

        const tempEntry = { title, styles, images: images.length ? images : ["Images/default.png"], prompt: promptText };
        generateNewDatabaseCode(tempEntry);
    };

    // --- 6. GLOBAL CLICKS ---
    document.addEventListener('click', (e) => {
        const card = e.target.closest('.card');
        
        // Clic sur une carte pour ouvrir la modale
        if (card && !e.target.closest('.admin-controls') && !e.target.classList.contains('btn-copy')) {
            const data = JSON.parse(card.querySelector('.full-data-hidden').innerText);
            openModal(data);
        }

        // Bouton Copier
        if (e.target.classList.contains('btn-copy')) {
            let text = "";
            if(e.target.id === "modalCopyBtn") {
                text = document.getElementById('modalDescription').innerText;
            } else {
                const data = JSON.parse(e.target.closest('.card').querySelector('.full-data-hidden').innerText);
                text = data.prompt;
            }
            
            navigator.clipboard.writeText(text).then(() => {
                const prev = e.target.innerText;
                e.target.innerText = "✓ Copié !";
                setTimeout(() => e.target.innerText = prev, 2000);
            });
        }

        // Fermeture modales
        if (e.target.classList.contains('modal-close') || e.target.classList.contains('modal')) {
            document.querySelectorAll('.modal').forEach(m => m.style.display = "none");
        }
    });

    document.getElementById('openAdmin').onclick = (e) => {
        e.stopPropagation();
        currentEditingCard = null;
        document.getElementById('adminModalTitle').innerText = "Ajouter un Prompt";
        adminForm.reset();
        document.getElementById('generatedCodeSection').style.display = 'none';
        adminForm.style.display = 'block';
        adminPanel.style.display = 'block';
    };

    document.getElementById('btnCopyDB').onclick = () => {
        navigator.clipboard.writeText(genCodeArea.value).then(() => {
            alert("Code copié ! Remplacez le contenu de database.js.");
            adminPanel.style.display = 'none';
        });
    };

    closeAdminModeBtn.onclick = () => toggleAdminUI(false);
    
    renderLibrary();
});