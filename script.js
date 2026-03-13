document.addEventListener("DOMContentLoaded", () => {
    // --- ÉLÉMENTS DU DOM ---
    const grid = document.getElementById('grid');
    const counter = document.getElementById('counter');
    const searchInput = document.getElementById('searchInput');
    const adminPanel = document.getElementById('adminPanel');
    const genCodeArea = document.getElementById('generatedCode');
    const closeAdminModeBtn = document.getElementById('closeAdminMode');
    const adminForm = document.getElementById('adminForm');
    const adminModalTitle = document.getElementById('adminModalTitle');
    const genCodeSection = document.getElementById('generatedCodeSection');
    
    // --- VARIABLES D'ÉTAT ---
    let currentEditingCard = null;
    let currentPromptImages = []; // Stocke les images du prompt ouvert
    let currentImageIndex = 0;    // Index de l'image affichée dans le slider

    /**
     * 1. GÉNÉRATION DE LA GRILLE
     * Affiche toutes les cartes à partir de la database.
     */
    const renderLibrary = () => {
        grid.innerHTML = "";
        // Utilisation de la variable globale promptDatabase définie dans database.js
        promptDatabase.forEach((data) => {
            const card = createCardElement(data);
            grid.appendChild(card);
        });
        updateStats();
    };

    /**
     * Crée l'élément HTML d'une carte.
     */
    const createCardElement = (data) => {
        const card = document.createElement('article');
        card.className = 'card';
        card.setAttribute('data-style', data.styles);
        
        // On prend la première image du tableau comme couverture
        const coverImg = (data.images && data.images.length > 0) ? data.images[0] : "Images/default.png";
        
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

    /**
     * 2. GESTION DU SLIDER (MODALE)
     * Gère l'affichage des images et la navigation.
     */
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
        
        // Mise à jour de l'image principale
        modalImg.src = currentPromptImages[currentImageIndex];

        // Génération des miniatures
        thumbContainer.innerHTML = "";
        currentPromptImages.forEach((src, index) => {
            const thumb = document.createElement('img');
            thumb.src = src;
            thumb.className = `thumb-item ${index === currentImageIndex ? 'active' : ''}`;
            thumb.onclick = (e) => {
                e.stopPropagation();
                currentImageIndex = index;
                renderSlider();
            };
            thumbContainer.appendChild(thumb);
        });
    };

    // Navigation flèches
    document.getElementById('prevImg').onclick = (e) => {
        e.stopPropagation();
        currentImageIndex = (currentImageIndex - 1 + currentPromptImages.length) % currentPromptImages.length;
        renderSlider();
    };

    document.getElementById('nextImg').onclick = (e) => {
        e.stopPropagation();
        currentImageIndex = (currentImageIndex + 1) % currentPromptImages.length;
        renderSlider();
    };

    /**
     * 3. RECHERCHE ET FILTRES
     */
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

    /**
     * 4. MODE ADMIN (Touche M)
     */
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
                        const data = JSON.parse(card.querySelector('.full-data-hidden').innerText);
                        
                        adminModalTitle.innerText = "Modifier le Prompt";
                        adminForm.style.display = 'block';
                        document.getElementById('adminTitle').value = data.title;
                        document.getElementById('adminStyles').value = data.styles;
                        // Transformation du tableau en texte ligne par ligne pour le textarea
                        document.getElementById('adminImg').value = data.images.join('\n');
                        document.getElementById('adminPrompt').value = data.prompt;
                        
                        genCodeSection.style.display = 'none';
                        adminPanel.style.display = "block";
                    };

                    const delBtn = document.createElement('button');
                    delBtn.className = 'btn-delete-card';
                    delBtn.innerText = 'SUPPRIMER';
                    delBtn.onclick = (ev) => {
                        ev.stopPropagation();
                        if (confirm("Supprimer ce prompt ?")) {
                            card.remove();
                            updateStats();
                            generateNewDatabaseCode(); 
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

    /**
     * 5. GÉNÉRATION DU CODE DATABASE
     */
    const generateNewDatabaseCode = (newItem = null) => {
        const currentData = [];
        
        // Si nouvel ajout, il va en haut
        if (newItem && !currentEditingCard) {
            currentData.push(newItem);
        }

        document.querySelectorAll('.card').forEach(card => {
            if (currentEditingCard === card && newItem) {
                currentData.push(newItem);
            } else {
                const data = JSON.parse(card.querySelector('.full-data-hidden').innerText);
                currentData.push(data);
            }
        });

        const code = `const promptDatabase = ${JSON.stringify(currentData, null, 4)};`;
        genCodeArea.value = code;
        genCodeSection.style.display = 'block';
        adminForm.style.display = 'none';
        adminModalTitle.innerText = "🚀 Code prêt !";
    };

    document.getElementById('btnSaveAction').onclick = () => {
        const title = document.getElementById('adminTitle').value.trim().toUpperCase() || "SANS TITRE";
        const styles = document.getElementById('adminStyles').value.toLowerCase();
        // Récupération des lignes pour en faire un tableau d'images
        const images = document.getElementById('adminImg').value.split('\n').filter(img => img.trim() !== "");
        const promptText = document.getElementById('adminPrompt').value;

        if (!promptText) return alert("Le prompt est obligatoire.");

        const tempEntry = { title, styles, images: images.length ? images : ["Images/default.png"], prompt: promptText };
        generateNewDatabaseCode(tempEntry);
    };

    /**
     * 6. GESTION DES CLICS GLOBAUX
     */
    document.getElementById('openAdmin').onclick = (e) => {
        e.stopPropagation();
        currentEditingCard = null; 
        adminModalTitle.innerText = "Ajouter un Prompt";
        adminForm.reset(); // Vide tous les champs (y compris le textarea)
        genCodeSection.style.display = 'none';
        adminForm.style.display = 'block';
        adminPanel.style.display = 'block';
    };

    document.addEventListener('click', (e) => {
        const card = e.target.closest('.card');
        
        // Clic sur carte -> Ouverture modale slider
        if (card && !e.target.closest('.admin-controls') && !e.target.classList.contains('btn-copy')) {
            const data = JSON.parse(card.querySelector('.full-data-hidden').innerText);
            openModal(data);
        }

        // Bouton Copier (Grille ou Modale)
        if (e.target.classList.contains('btn-copy')) {
            let text = "";
            if (e.target.id === "modalCopyBtn") {
                text = document.getElementById('modalDescription').innerText;
            } else {
                const data = JSON.parse(e.target.closest('.card').querySelector('.full-data-hidden').innerText);
                text = data.prompt;
            }
            
            navigator.clipboard.writeText(text).then(() => {
                const prev = e.target.innerText; e.target.innerText = "✓ Copié !";
                setTimeout(() => e.target.innerText = prev, 2000);
            });
        }

        // Fermer modales (clic sur croix ou fond)
        if (e.target.classList.contains('modal-close') || e.target.classList.contains('modal')) {
            document.querySelectorAll('.modal').forEach(m => m.style.display = "none");
        }
    });

    document.getElementById('btnCopyDB').onclick = () => {
        navigator.clipboard.writeText(genCodeArea.value).then(() => {
            alert("Code copié ! Remplacez le contenu de database.js.");
            adminPanel.style.display = 'none';
        });
    };

    closeAdminModeBtn.onclick = () => toggleAdminUI(false);
    
    // Initialisation
    renderLibrary();
});