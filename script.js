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
    
    // Eléments Galerie
    const modalImg = document.getElementById('modalImg');
    const thumbnailsContainer = document.getElementById('thumbnails');
    const prevBtn = document.getElementById('prevImg');
    const nextBtn = document.getElementById('nextImg');
    
    let currentEditingCard = null;
    let currentImages = [];
    let currentImgIndex = 0;

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
        
        // Gérer si img est un tableau ou une string
        const firstImg = Array.isArray(data.img) ? data.img[0] : data.img;
        const allImgs = Array.isArray(data.img) ? data.img.join(',') : data.img;

        card.innerHTML = `
            <img src="${firstImg}" class="card-img" alt="${data.title}">
            <div class="card-content">
                <div class="card-header">${data.title || "SANS TITRE"}</div>
                <p class="prompt-text">${data.prompt.substring(0, 100)}...</p>
                <div class="full-prompt-hidden" style="display:none;">${data.prompt}</div>
                <div class="all-imgs-hidden" style="display:none;">${allImgs}</div>
                <button class="btn-copy">Copier</button>
            </div>
        `;
        return card;
    };

    // --- NAVIGATION GALERIE ---
    const updateGallery = () => {
        modalImg.src = currentImages[currentImgIndex];
        
        // Update thumbnails active state
        document.querySelectorAll('.thumb').forEach((thumb, idx) => {
            thumb.classList.toggle('active', idx === currentImgIndex);
        });

        // Cacher les flèches si une seule image
        const showNav = currentImages.length > 1;
        prevBtn.style.display = showNav ? "flex" : "none";
        nextBtn.style.display = showNav ? "flex" : "none";
        thumbnailsContainer.style.display = showNav ? "flex" : "none";
    };

    prevBtn.onclick = (e) => {
        e.stopPropagation();
        currentImgIndex = (currentImgIndex - 1 + currentImages.length) % currentImages.length;
        updateGallery();
    };

    nextBtn.onclick = (e) => {
        e.stopPropagation();
        currentImgIndex = (currentImgIndex + 1) % currentImages.length;
        updateGallery();
    };

    const generateNewDatabaseCode = (newItem = null) => {
        const currentData = [];
        if (newItem && !currentEditingCard) currentData.push(newItem);

        document.querySelectorAll('.card').forEach(card => {
            if (currentEditingCard === card && newItem) {
                currentData.push(newItem);
            } else {
                const imgAttr = card.querySelector('.all-imgs-hidden').innerText;
                const imgData = imgAttr.includes(',') ? imgAttr.split(',') : imgAttr;
                currentData.push({
                    title: card.querySelector('.card-header').innerText,
                    styles: card.getAttribute('data-style'),
                    img: imgData,
                    prompt: card.querySelector('.full-prompt-hidden').innerText
                });
            }
        });

        const code = `const promptDatabase = ${JSON.stringify(currentData, null, 4)};`;
        genCodeArea.value = code;
        genCodeSection.style.display = 'block';
    };

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

    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
        if (e.key.toLowerCase() === 'm') {
            const pass = prompt("Accès Administrateur :");
            if (pass === "1234") toggleAdminUI(true);
        }
        // Navigation clavier pour la galerie
        if (document.getElementById('promptModal').style.display === "block") {
            if (e.key === "ArrowLeft") prevBtn.click();
            if (e.key === "ArrowRight") nextBtn.click();
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
                        document.getElementById('adminImg').value = card.querySelector('.all-imgs-hidden').innerText;
                        document.getElementById('adminPrompt').value = card.querySelector('.full-prompt-hidden').innerText;
                        genCodeSection.style.display = 'none';
                        adminPanel.style.display = "block";
                    };
                    const delBtn = document.createElement('button');
                    delBtn.className = 'btn-delete-card'; delBtn.innerText = 'SUPPRIMER';
                    delBtn.onclick = (ev) => {
                        ev.stopPropagation();
                        if (confirm("Supprimer ce prompt définitivement ?")) {
                            card.remove(); updateStats(); generateNewDatabaseCode();
                            adminModalTitle.innerText = "🗑️ Card supprimée !";
                            adminForm.style.display = 'none'; adminPanel.style.display = 'block';
                        }
                    };
                    controls.append(editBtn, delBtn); card.appendChild(controls);
                }
                controls.style.display = "flex";
            } else if (controls) {
                controls.style.display = "none";
            }
        });
        closeAdminModeBtn.style.display = show ? "flex" : "none";
    };

    document.getElementById('btnSaveAction').onclick = () => {
        const title = document.getElementById('adminTitle').value.trim().toUpperCase() || "SANS TITRE";
        const styles = document.getElementById('adminStyles').value.toLowerCase();
        const imgVal = document.getElementById('adminImg').value || "Images/default.png";
        const promptText = document.getElementById('adminPrompt').value;

        const imgData = imgVal.includes(',') ? imgVal.split(',').map(s => s.trim()) : imgVal;

        if (!promptText) { alert("Le contenu du prompt est obligatoire."); return; }

        const tempEntry = { title, styles, img: imgData, prompt: promptText };
        generateNewDatabaseCode(tempEntry);
        adminForm.style.display = 'none';
        adminModalTitle.innerText = "🚀 Code prêt !";
    };

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
        
        if (card && !e.target.closest('.admin-controls') && !e.target.classList.contains('btn-copy')) {
            const imgAttr = card.querySelector('.all-imgs-hidden').innerText;
            currentImages = imgAttr.includes(',') ? imgAttr.split(',') : [imgAttr];
            currentImgIndex = 0;

            document.getElementById('modalTitle').innerText = card.querySelector('.card-header').innerText;
            document.getElementById('modalDescription').innerText = card.querySelector('.full-prompt-hidden').innerText;
            
            // Créer miniatures
            thumbnailsContainer.innerHTML = "";
            currentImages.forEach((src, idx) => {
                const thumb = document.createElement('img');
                thumb.src = src;
                thumb.className = 'thumb';
                thumb.onclick = (ev) => {
                    ev.stopPropagation();
                    currentImgIndex = idx;
                    updateGallery();
                };
                thumbnailsContainer.appendChild(thumb);
            });

            updateGallery();
            document.getElementById('promptModal').style.display = "block";
        }

        if (e.target.classList.contains('btn-copy')) {
            const text = e.target.id === "modalCopyBtn" ? 
                document.getElementById('modalDescription').innerText : 
                e.target.closest('.card-content').querySelector('.full-prompt-hidden').innerText;
            navigator.clipboard.writeText(text).then(() => {
                const prev = e.target.innerText; e.target.innerText = "✓ Copié !";
                setTimeout(() => e.target.innerText = prev, 2000);
            });
        }

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
    renderLibrary();
});