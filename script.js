document.addEventListener("DOMContentLoaded", () => {
    const grid = document.getElementById('grid');
    const counter = document.getElementById('counter');
    const searchInput = document.getElementById('searchInput');
    const adminPanel = document.getElementById('adminPanel');
    
    let currentEditingCard = null;
    let currentImages = [];
    let currentImgIdx = 0;

    // --- RENDU ---
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

    // --- MODALE & SLIDER ---
    const updateSlider = () => {
        document.getElementById('modalImg').src = currentImages[currentImgIdx];
        document.querySelectorAll('.thumb-item').forEach((t, i) => {
            t.classList.toggle('active', i === currentImgIdx);
        });
    };

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
            navigator.clipboard.writeText(text);
            e.target.innerText = "✓ Copié !";
            setTimeout(() => e.target.innerText = "Copier", 2000);
        }

        if (e.target.classList.contains('modal-close') || e.target.classList.contains('modal')) {
            document.querySelectorAll('.modal').forEach(m => m.style.display = "none");
        }
    });

    document.getElementById('prevImg').onclick = () => {
        currentImgIdx = (currentImgIdx - 1 + currentImages.length) % currentImages.length;
        updateSlider();
    };

    document.getElementById('nextImg').onclick = () => {
        currentImgIdx = (currentImgIdx + 1) % currentImages.length;
        updateSlider();
    };

    // --- ADMIN ---
    document.getElementById('openAdmin').onclick = () => {
        currentEditingCard = null;
        document.getElementById('adminForm').reset();
        document.getElementById('generatedCodeSection').style.display = 'none';
        adminPanel.style.display = 'block';
    };

    document.getElementById('btnSaveAction').onclick = () => {
        const images = document.getElementById('adminImg').value.split('\n').filter(l => l.trim() !== "");
        const newItem = {
            title: document.getElementById('adminTitle').value.toUpperCase(),
            styles: document.getElementById('adminStyles').value.toLowerCase(),
            images: images,
            prompt: document.getElementById('adminPrompt').value
        };

        const currentDB = [];
        if (!currentEditingCard) currentDB.push(newItem);
        
        document.querySelectorAll('.card').forEach(c => {
            currentDB.push(JSON.parse(c.querySelector('.full-data-hidden').innerText));
        });

        document.getElementById('generatedCode').value = `const promptDatabase = ${JSON.stringify(currentDB, null, 4)};`;
        document.getElementById('generatedCodeSection').style.display = 'block';
    };

    const updateStats = () => {
        const visible = [...document.querySelectorAll('.card')].filter(c => c.style.display !== "none").length;
        counter.innerText = `${visible} Prompt(s) affiché(s)`;
    };

    renderLibrary();
});