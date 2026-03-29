document.addEventListener("DOMContentLoaded", () => {
    const grid = document.getElementById('grid');
    const counter = document.getElementById('counter');
    const searchInput = document.getElementById('searchInput');
    const adminPanel = document.getElementById('adminPanel');
    const genCodeArea = document.getElementById('generatedCode');
    const adminForm = document.getElementById('adminForm');
    const genCodeSection = document.getElementById('generatedCodeSection');
    const openAdminBtn = document.getElementById('openAdmin');
    const closeAdminBtn = document.getElementById('closeAdmin');
    const btnSaveAction = document.getElementById('btnSaveAction');
    
    let currentGalleryImages = [];
    let currentImgIndex = 0;

    // --- 1. GÉNÉRATION GRILLE ---
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

    // --- 2. RECHERCHE ET FILTRES ---
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
            const content = card.innerText.toLowerCase();
            const matchesStyle = (activeStyle === "all" || styles.includes(activeStyle));
            const matchesSearch = (term === "" || content.includes(term));
            card.style.display = (matchesStyle && matchesSearch) ? "block" : "none";
        });
        updateStats();
    };

    // --- 3. ÉVÉNEMENTS CLAVIER (RECHERCHE + TOUCHE M) ---
    document.addEventListener('keydown', (e) => {
        // Si on n'est pas en train d'écrire dans un champ texte (input ou textarea)
        const isTyping = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';

        // Raccourci touche "m" pour l'admin
        if (e.key.toLowerCase() === 'm' && !isTyping) {
            e.preventDefault();
            if (adminPanel.style.display === 'flex') {
                adminPanel.style.display = 'none';
            } else {
                adminPanel.style.display = 'flex';
                genCodeSection.style.display = 'none';
            }
        }

        // Touche Entrée pour la recherche (uniquement si on est dans le champ de recherche)
        if (e.key === 'Enter' && e.target === searchInput) {
            e.preventDefault(); 
            filterLibrary();
        }
    });

    searchInput.addEventListener('input', () => {
        if (searchInput.value === "") filterLibrary();
    });

    // --- 4. GESTION DU MODE ADMIN (CLICS) ---
    openAdminBtn.onclick = () => {
        adminPanel.style.display = 'flex';
        genCodeSection.style.display = 'none';
    };

    closeAdminBtn.onclick = () => {
        adminPanel.style.display = 'none';
    };

    btnSaveAction.onclick = () => {
        const newPrompt = {
            title: document.getElementById('adminTitle').value,
            styles: document.getElementById('adminStyles').value,
            img: document.getElementById('adminImg').value.split(','),
            prompt: document.getElementById('adminPrompt').value
        };

        const jsonCode = JSON.stringify(newPrompt, null, 4);
        genCodeArea.value = jsonCode + ",";
        genCodeSection.style.display = 'block';
    };

    document.getElementById('btnCopyDB').onclick = () => {
        genCodeArea.select();
        document.execCommand('copy');
        alert("Code copié !");
    };

    // --- 5. ÉVÉNEMENTS CLICS (MODALE & GALERIE) ---
    const updateGalleryImage = (index) => {
        currentImgIndex = index;
        document.getElementById('modalImg').src = currentGalleryImages[currentImgIndex];
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

        if (e.target.classList.contains('btn-copy')) {
            const text = e.target.id === "modalCopyBtn" ? 
                document.getElementById('modalDescription').innerText : 
                e.target.closest('.card-content').querySelector('.full-prompt-hidden').innerText;
            
            navigator.clipboard.writeText(text).then(() => {
                const b = e.target; const old = b.innerText; b.innerText = "✓ Copié !";
                setTimeout(() => b.innerText = old, 2000);
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

    document.querySelectorAll('.style-card[data-filter]').forEach(b => {
        b.onclick = () => {
            document.querySelectorAll('.style-card').forEach(x => x.classList.remove('active'));
            b.classList.add('active'); 
            filterLibrary();
        };
    });

    renderLibrary();
});