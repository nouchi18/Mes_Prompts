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
    
    let currentGalleryImages = [];
    let currentImgIndex = 0;
    let isAdminMode = false; // État du mode édition

    // --- 1. GÉNÉRATION DE LA GRILLE ---
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
        card.setAttribute('data-index', index);
        
        const mainImg = Array.isArray(data.img) ? data.img[0] : data.img;
        const allImgs = Array.isArray(data.img) ? data.img.join(',') : data.img;

        card.innerHTML = `
            <div class="admin-controls" style="${isAdminMode ? 'display:flex' : 'display:none'}">
                <button class="btn-edit-card" onclick="editCard(${index})">Modifier</button>
                <button class="btn-delete-card" onclick="deleteCard(${index})">Supprimer</button>
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

    // --- 2. LOGIQUE DU MODE ADMIN (TOUCHE M) ---
    const toggleAdminMode = () => {
        isAdminMode = !isAdminMode;
        // On affiche ou cache les boutons sur toutes les cartes existantes
        document.querySelectorAll('.admin-controls').forEach(el => {
            el.style.display = isAdminMode ? 'flex' : 'none';
        });
        
        // Petit indicateur visuel (optionnel)
        console.log("Mode Admin : " + (isAdminMode ? "Activé" : "Désactivé"));
    };

    document.addEventListener('keydown', (e) => {
        const isTyping = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
        
        // Touche "m" pour activer/désactiver les boutons Modifier/Supprimer
        if (e.key.toLowerCase() === 'm' && !isTyping) {
            e.preventDefault();
            toggleAdminMode();
        }

        if (e.key === 'Enter' && e.target === searchInput) {
            e.preventDefault(); 
            filterLibrary();
        }
    });

    // Fonctions globales pour les boutons (appelées par onclick dans le HTML injecté)
    window.editCard = (index) => {
        const data = promptDatabase[index];
        document.getElementById('adminTitle').value = data.title;
        document.getElementById('adminStyles').value = data.styles;
        document.getElementById('adminImg').value = Array.isArray(data.img) ? data.img.join(',') : data.img;
        document.getElementById('adminPrompt').value = data.prompt;
        adminPanel.style.display = 'flex';
    };

    window.deleteCard = (index) => {
        if(confirm("Supprimer ce prompt ? (Il faudra copier le nouveau code database après)")) {
            promptDatabase.splice(index, 1);
            renderLibrary();
            generateNewDatabaseCode();
        }
    };

    const generateNewDatabaseCode = () => {
        const fullCode = "const promptDatabase = " + JSON.stringify(promptDatabase, null, 4) + ";";
        genCodeArea.value = fullCode;
        genCodeSection.style.display = 'block';
        adminPanel.style.display = 'flex';
    };

    // --- 3. RECHERCHE ET FILTRES ---
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

    // --- 4. AUTRES ÉVÉNEMENTS ---
    openAdminBtn.onclick = () => { adminPanel.style.display = 'flex'; genCodeSection.style.display = 'none'; };
    closeAdminBtn.onclick = () => { adminPanel.style.display = 'none'; };

    btnSaveAction.onclick = () => {
        // Logique de génération pour un seul item
        const newPrompt = {
            title: document.getElementById('adminTitle').value,
            styles: document.getElementById('adminStyles').value,
            img: document.getElementById('adminImg').value.split(','),
            prompt: document.getElementById('adminPrompt').value
        };
        genCodeArea.value = JSON.stringify(newPrompt, null, 4) + ",";
        genCodeSection.style.display = 'block';
    };

    // --- 5. INITIALISATION ---
    renderLibrary();

    // Réaffiche tout si on efface manuellement le texte de recherche
    searchInput.addEventListener('input', (e) => {
        if (e.target.value === "") filterLibrary();
    });

    // Filtres par boutons
    document.querySelectorAll('.style-card[data-filter]').forEach(b => {
        b.onclick = () => {
            document.querySelectorAll('.style-card').forEach(x => x.classList.remove('active'));
            b.classList.add('active'); 
            filterLibrary();
        };
    });
});