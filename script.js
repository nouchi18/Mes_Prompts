document.addEventListener("DOMContentLoaded", () => {
    const grid = document.getElementById('grid');
    const counter = document.getElementById('counter');
    const searchInput = document.getElementById('searchInput');
    const adminPanel = document.getElementById('adminPanel');
    const adminForm = document.getElementById('adminForm');
    
    let currentEditingCard = null;
    let currentImages = [];
    let currentImgIdx = 0;

    // --- RENDU GRILLE ---
    const renderLibrary = () => {
        grid.innerHTML = "";
        promptDatabase.forEach(data => {
            const card = document.createElement('article');
            card.className = 'card';
            card.setAttribute('data-style', data.styles);
            card.innerHTML = `
                <img src="${data.images[0]}" class="card-img">
                <div class="card-content">
                    <div class="card-header">${data.title}</div>
                    <p class="prompt-text">${data.prompt.substring(0, 80)}...</p>
                    <div class="full-data-hidden" style="display:none;">${JSON.stringify(data)}</div>
                    <button class="btn-copy">Copier</button>
                </div>
            `;
            grid.appendChild(card);
        });
        updateStats();
    };

    // --- SLIDER ---
    const updateSlider = () => {
        document.getElementById('modalImg').src = currentImages[currentImgIdx];
        document.querySelectorAll('.thumb-item').forEach((t, i) => {
            t.classList.toggle('active', i === currentImgIdx);
        });
    };

    document.getElementById('prevImg').onclick = () => {
        currentImgIdx = (currentImgIdx - 1 + currentImages.length) % currentImages.length;
        updateSlider();
    };

    document.getElementById('nextImg').onclick = () => {
        currentImgIdx = (currentImgIdx + 1) % currentImages.length;
        updateSlider();
    };

    // --- CLICS ET MODALES ---
    document.addEventListener('click', (e) => {
        const card = e.target.closest('.card');
        
        if (card && !e.target.closest('.admin-controls') && !e.target.classList.contains('btn-copy')) {
            const data = JSON.parse(card.querySelector('.full-data-hidden').innerText);
            currentImages = data.images;
            currentImgIdx = 0;
            
            document.getElementById('modalTitle').innerText = data.title;
            document.getElementById('modalDescription').innerText = data.prompt;
            
            const thumbContainer = document.getElementById('thumbnailContainer');
            thumbContainer.innerHTML = "";
            currentImages.forEach((img, i) => {
                const thumb = document.createElement('img');
                thumb.src = img;
                thumb.className = 'thumb-item';
                thumb.onclick = () => { currentImgIdx = i; updateSlider(); };
                thumbContainer.appendChild(thumb);
            });

            updateSlider();
            document.getElementById('promptModal').style.display = "block";
        }

        if (e.target.classList.contains('btn-copy')) {
            const text = e.target.id === "modalCopyBtn" ? 
                document.getElementById('modalDescription').innerText : 
                JSON.parse(e.target.closest('.card').querySelector('.full-data-hidden').innerText).prompt;
            navigator.clipboard.writeText(text).then(() => {
                const prev = e.target.innerText; e.target.innerText = "✓ Copié !";
                setTimeout(() => e.target.innerText = prev, 2000);
            });
        }

        if (e.target.classList.contains('modal-close') || e.target.classList.contains('modal')) {
            document.querySelectorAll('.modal').forEach(m => m.style.display = "none");
        }
    });

    // --- ADMIN (Bouton +) ---
    document.getElementById('openAdmin').onclick = () => {
        currentEditingCard = null;
        adminForm.reset();
        document.getElementById('adminModalTitle').innerText = "Ajouter un Prompt";
        document.getElementById('generatedCodeSection').style.display = 'none';
        adminForm.style.display = 'block';
        adminPanel.style.display = 'block';
    };

    document.getElementById('btnSaveAction').onclick = () => {
        const lines = document.getElementById('adminImg').value.split('\n').filter(l => l.trim() !== "");
        const newItem = {
            title: document.getElementById('adminTitle').value.toUpperCase(),
            styles: document.getElementById('adminStyles').value.toLowerCase(),
            images: lines.length ? lines : ["Images/default.png"],
            prompt: document.getElementById('adminPrompt').value
        };

        const currentData = [];
        if (!currentEditingCard) currentData.push(newItem);
        
        document.querySelectorAll('.card').forEach(c => {
            if (currentEditingCard === c) currentData.push(newItem);
            else currentData.push(JSON.parse(c.querySelector('.full-data-hidden').innerText));
        });

        document.getElementById('generatedCode').value = `const promptDatabase = ${JSON.stringify(currentData, null, 4)};`;
        document.getElementById('generatedCodeSection').style.display = 'block';
        adminForm.style.display = 'none';
    };

    const updateStats = () => {
        const visible = [...document.querySelectorAll('.card')].filter(c => c.style.display !== "none").length;
        counter.innerText = `${visible} Prompt(s) affiché(s)`;
    };

    renderLibrary();
});