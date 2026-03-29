document.addEventListener("DOMContentLoaded", () => {
    // Éléments de l'interface principale
    const grid = document.getElementById('grid');
    const counter = document.getElementById('counter');
    const searchInput = document.getElementById('searchInput');
    
    // Éléments du mode Administration
    const adminPanel = document.getElementById('adminPanel');
    const openAdminBtn = document.getElementById('openAdmin');
    const closeAdminBtn = document.getElementById('closeAdmin');
    const btnSaveAction = document.getElementById('btnSaveAction');
    const genCodeArea = document.getElementById('generatedCode');
    const genCodeSection = document.getElementById('generatedCodeSection');
    const btnCopyDB = document.getElementById('btnCopyDB');
    
    let currentGalleryImages = [];
    let currentImgIndex = 0;

    // --- 1. GÉNÉRATION DE LA GRILLE ---
    const renderLibrary = () => {
        grid.innerHTML = "";
        if (typeof promptDatabase !== 'undefined') {
            promptDatabase.forEach(data => grid.appendChild(createCardElement(data)));
        }
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

    // --- 2. LOGIQUE DE FILTRAGE ---
    const updateStats = () => {
        const visible = [...document.querySelectorAll('.card')].filter(c => c.style.display !== "none").length;
        counter.innerText = `${visible} Prompt(s) affiché(s)`;
    };

    const filterLibrary = () => {
        const activeBtn = document.querySelector('.style-card.active');
        const activeStyle = activeBtn ? activeBtn.getAttribute('data-filter') : "all";
        const term = searchInput.value.toLowerCase().trim();
        
        document.querySelectorAll('.card').forEach(card => {
            const styles = card.getAttribute('data-style').toLowerCase();
            const title = card.querySelector('.card-header').innerText.toLowerCase();
            const promptContent = card.querySelector('.full-prompt-hidden').innerText.toLowerCase();
            
            const matchesStyle = (activeStyle === "all" || styles.includes(activeStyle));
            const matchesSearch = (term === "" || title.includes(term) || promptContent.includes(term));
            
            card.style.display = (matchesStyle && matchesSearch) ? "block" : "none";
        });
        updateStats();
    };

    // --- 3. ÉVÉNEMENTS RECHERCHE & CLAVIER ---
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); 
            filterLibrary();
        }
    });

    searchInput.addEventListener('input', (e) => {
        if (e.target.value === "") filterLibrary();
    });

    // Raccourci touche "m" pour ouvrir l'admin (optionnel)
    document.addEventListener('keydown', (e) => {
        if (e.key.toLowerCase() === 'm' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
            adminPanel.style.display = adminPanel.style.display === 'flex' ? 'none' : 'flex';
        }
    });

    // --- 4. GESTION DU MODE ADMIN (LE BOUTON +) ---
    openAdminBtn.addEventListener('click', () => {
        adminPanel.style.display = 'flex';
        genCodeSection.style.display = 'none';
    });

    closeAdminBtn.addEventListener('click', () => {
        adminPanel.style.display = 'none';
    });

    btnSaveAction.addEventListener('click', () => {
        const newPrompt = {
            title: document.getElementById('adminTitle').value,
            styles: document.getElementById('adminStyles').value,
            img: document.getElementById('adminImg').value.split(','),
            prompt: document.getElementById('adminPrompt').value
        };

        const jsonCode = JSON.stringify(newPrompt, null, 4);
        genCodeArea.value = jsonCode + ",";
        genCodeSection.style.display = 'block';
    });

    btnCopyDB.addEventListener('click', () => {
        genCodeArea.select();
        navigator.clipboard.writeText(genCodeArea.value).then(() => {
            alert("Code copié ! Ajoutez-le dans votre fichier database.js");
        });
    });

    // --- 5. FILTRES (BOUTONS) ---
    document.querySelectorAll('.style-card[data-filter]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.style-card').forEach(x => x.classList.remove('active'));
            btn.classList.add('active'); 
            filterLibrary();
        });
    });

    // --- 6. MODALE ET GALERIE ---
    const updateGalleryImage = (index) => {
        currentImgIndex = index;
        const modalImg = document.getElementById('modalImg');
        if(modalImg && currentGalleryImages[currentImgIndex]) {
            modalImg.src = currentGalleryImages[currentImgIndex];
        }
        document.querySelectorAll('.thumb').forEach((t, i) => t.classList.toggle('active', i === currentImgIndex));
    };

    document.addEventListener('click', e => {
        const card = e.target.closest('.card');
        
        if (card && !e.target.classList.contains('btn-copy')) {
            const imgData = card.querySelector('.card-img').getAttribute('data-all-imgs');
            currentGalleryImages = imgData.split(',');
            
            document.getElementById('modalTitle').innerText = card.querySelector('.card-header').innerText;
            document.getElementById('modalDescription').innerText = card.querySelector('.full-prompt-hidden').innerText;
            
            const thumbContainer = document.getElementById('modalThumbs');
            thumbContainer.innerHTML = "";
            
            if (currentGalleryImages.length > 1) {
                document.querySelectorAll('.nav-btn').forEach(b => b.style.display = 'block');
                currentGalleryImages.forEach((src, i) => {
                    const t = document.createElement('img');
                    t.src = src; 
                    t.className = `thumb ${i === 0 ? 'active' : ''}`;
                    t.onclick = () => updateGalleryImage(i);
                    thumbContainer.appendChild(t);
                });
            } else {
                document.querySelectorAll('.nav-btn').forEach(b => b.style.display = 'none');
            }
            
            updateGalleryImage(0);
            document.getElementById('promptModal').style.display = 'flex';
        }

        if (e.target.classList.contains('btn-copy')) {
            const text = e.target.id === "modalCopyBtn" ? 
                document.getElementById('modalDescription').innerText : 
                e.target.closest('.card-content').querySelector('.full-prompt-hidden').innerText;
            
            navigator.clipboard.writeText(text).then(() => {
                const b = e.target; 
                const oldText = b.innerText; 
                b.innerText = "✓ Copié !";
                setTimeout(() => b.innerText = oldText, 2000);
            });
        }

        if (e.target.classList.contains('modal-close') || e.target.id === 'promptModal') {
            document.getElementById('promptModal').style.display = 'none';
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

    renderLibrary();
});