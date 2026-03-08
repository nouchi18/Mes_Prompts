document.addEventListener("DOMContentLoaded", () => {
    // --- ÉLÉMENTS DU DOM ---
    const grid = document.getElementById('grid');
    const counter = document.getElementById('counter');
    const searchInput = document.getElementById('searchInput');
    const adminPanel = document.getElementById('adminPanel');
    const genCodeSection = document.getElementById('generatedCodeSection');
    const genCodeTextArea = document.getElementById('generatedCode');
    const btnCopyDB = document.getElementById('btnCopyDB');
    const closeAdminModeBtn = document.getElementById('closeAdminMode');
    const adminForm = document.getElementById('adminForm');
    
    let currentEditingCard = null;

    // --- 1. GÉNÉRATION DE LA BILBIOTHÈQUE (Depuis database.js) ---
    const renderLibrary = () => {
        grid.innerHTML = "";
        promptDatabase.forEach((data) => {
            const card = document.createElement('article');
            card.className = 'card';
            card.setAttribute('data-style', data.styles);
            card.innerHTML = `
                <img src="${data.img}" class="card-img" alt="${data.title}">
                <div class="card-content">
                    <div class="card-header">${data.title}</div>
                    <p class="prompt-text">${data.prompt.substring(0, 100)}...</p>
                    <div class="full-prompt-hidden" style="display:none;">${data.prompt}</div>
                    <button class="btn-copy">Copier</button>
                </div>
            `;
            grid.appendChild(card);
        });
        updateStats();
    };

    // --- 2. GÉNÉRATION AUTOMATIQUE DU CODE DATABASE ---
    const generateNewDatabaseCode = () => {
        const currentData = [];
        // On scanne toutes les cartes présentes pour reconstruire le tableau
        document.querySelectorAll('.card').forEach(card => {
            currentData.push({
                title: card.querySelector('.card-header').innerText,
                styles: card.getAttribute('data-style'),
                img: card.querySelector('.card-img').src,
                prompt: card.querySelector('.full-prompt-hidden').innerText
            });
        });

        // Formatage du texte pour database.js
        const codeContent = `const promptDatabase = ${JSON.stringify(currentData, null, 4)};`;
        
        genCodeTextArea.value = codeContent;
        genCodeSection.style.display = 'block';
        adminPanel.style.display = 'block'; // On ouvre la modale pour montrer le code
    };

    // --- 3. RECHERCHE ET FILTRES ---
    const updateStats = () => {
        const visible = [...document.querySelectorAll('.card')].filter(c => c.style.display !== "none").length;
        counter.innerText = `${visible} Prompt(s) affiché(s)`;
    };

    const filterLibrary = () => {
        const activeStyle = document.querySelector('.style-card.active').getAttribute('data-filter');
        const term = searchInput.value.toLowerCase().trim();

        document.querySelectorAll('.card').forEach(card => {
            const styles = (card.getAttribute('data-style') || "").toLowerCase();
            const content = card.innerText.toLowerCase();
            const fullPrompt = card.querySelector('.full-prompt-hidden').innerText.toLowerCase();

            const matchesStyle = activeStyle === "all" || styles.split(' ').includes(activeStyle);
            const matchesSearch = term === "" || content.includes(term) || fullPrompt.includes(term);

            card.style.display = (matchesStyle && matchesSearch) ? "block" : "none";
        });
        updateStats();
    };

    searchInput.addEventListener('input', filterLibrary);

    document.querySelectorAll('.style-card').forEach(btn => {
        btn.onclick = () => {
            searchInput.value = ""; // On vide la recherche lors d'un clic style
            document.querySelectorAll('.style-card').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterLibrary();
        };
    });

    // --- 4. MODE ADMIN (Touche M) ---
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
                        document.getElementById('adminModalTitle').innerText = "Modifier le Prompt";
                        document.getElementById('adminTitle').value = card.querySelector('.card-header').innerText;
                        document.getElementById('adminStyles').value = card.getAttribute('data-style');
                        document.getElementById('adminImg').value = card.querySelector('.card-img').src;
                        document.getElementById('adminPrompt').value = card.querySelector('.full-prompt-hidden').innerText;
                        genCodeSection.style.display = 'none';
                        adminPanel.style.display = "block";
                    };

                    const delBtn = document.createElement('button');
                    delBtn.className = 'btn-delete-card';
                    delBtn.innerText = 'SUPPRIMER';
                    delBtn.onclick = (ev) => {
                        ev.stopPropagation();
                        if (confirm("Supprimer ce prompt ? Un code de mise à jour sera généré.")) {
                            card.remove();
                            generateNewDatabaseCode();
                            updateStats();
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

    // --- 5. ENREGISTREMENT (AJOUT OU ÉDITION) ---
    document.getElementById('btnSaveAction').onclick = () => {
        const title = document.getElementById('adminTitle').value.toUpperCase() || "PORTRAIT";
        const styles = document.getElementById('adminStyles').value.toLowerCase();
        const img = document.getElementById('adminImg').value || "Images/placeholder.png";
        const promptText = document.getElementById('adminPrompt').value;

        if (!promptText) return alert("Le texte du prompt est vide !");

        if (currentEditingCard) {
            // Mode Édition
            currentEditingCard.querySelector('.card-header').innerText = title;
            currentEditingCard.setAttribute('data-style', styles);
            currentEditingCard.querySelector('.card-img').src = img;
            currentEditingCard.querySelector('.full-prompt-hidden').innerText = promptText;
            currentEditingCard.querySelector('.prompt-text').innerText = promptText.substring(0, 100) + "...";
        } else {
            // Mode Ajout
            const newCard = document.createElement('article');
            newCard.className = 'card';
            newCard.setAttribute('data-style', styles);
            newCard.innerHTML = `
                <img src="${img}" class="card-img" alt="${title}">
                <div class="card-content">
                    <div class="card-header">${title}</div>
                    <p class="prompt-text">${promptText.substring(0, 100)}...</p>
                    <div class="full-prompt-hidden" style="display:none;">${promptText}</div>
                    <button class="btn-copy">Copier</button>
                </div>
            `;
            grid.insertBefore(newCard, grid.firstChild);
        }

        generateNewDatabaseCode();
        updateStats();
        if (closeAdminModeBtn.style.display === "flex") toggleAdminUI(true);
    };

    // --- 6. INTERACTIONS (CLICS & COPIE) ---
    document.getElementById('openAdmin').onclick = () => {
        currentEditingCard = null;
        document.getElementById('adminModalTitle').innerText = "Ajouter un Prompt";
        adminForm.reset();
        genCodeSection.style.display = 'none';
        adminPanel.style.display = 'block';
    };

    document.addEventListener('click', (e) => {
        const card = e.target.closest('.card');
        // Ouvrir Modale Visualisation
        if (card && !e.target.closest('.admin-controls') && !e.target.classList.contains('btn-copy')) {
            document.getElementById('modalImg').src = card.querySelector('.card-img').src;
            document.getElementById('modalTitle').innerText = card.querySelector('.card-header').innerText;
            document.getElementById('modalDescription').innerText = card.querySelector('.full-prompt-hidden').innerText;
            document.getElementById('promptModal').style.display = "block";
        }
        // Bouton Copier
        if (e.target.classList.contains('btn-copy') && !e.target.closest('.admin-form')) {
            const text = e.target.id === "modalCopyBtn" ? 
                document.getElementById('modalDescription').innerText : 
                e.target.closest('.card-content').querySelector('.full-prompt-hidden').innerText;
            
            navigator.clipboard.writeText(text).then(() => {
                const prev = e.target.innerText;
                e.target.innerText = "✓ Copié !";
                setTimeout(() => e.target.innerText = prev, 2000);
            });
        }
        // Fermer Modales
        if (e.target.classList.contains('modal-close') || e.target.classList.contains('modal')) {
            document.querySelectorAll('.modal').forEach(m => m.style.display = "none");
        }
    });

    // Bouton Copier Database
    btnCopyDB.onclick = () => {
        navigator.clipboard.writeText(genCodeTextArea.value).then(() => {
            alert("Tableau Database copié ! Remplacez le contenu de database.js");
        });
    };

    closeAdminModeBtn.onclick = () => toggleAdminUI(false);

    // Initialisation au chargement
    renderLibrary();
});