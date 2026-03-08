document.addEventListener("DOMContentLoaded", () => {
    const styleButtons = document.querySelectorAll('.style-card');
    const searchInput = document.getElementById('searchInput');
    const grid = document.getElementById('grid');
    const counter = document.getElementById('counter');
    const modal = document.getElementById('promptModal');
    const adminPanel = document.getElementById('adminPanel');
    const editPanel = document.getElementById('editPanel');
    const closeAdminModeBtn = document.getElementById('closeAdminMode');
    let currentEditingCard = null;

    // --- 1. FILTRAGE ---
    const updateDisplay = (mode) => {
        const activeFilter = document.querySelector('.style-card.active').getAttribute('data-filter');
        const searchTerm = searchInput.value.toLowerCase().trim();
        const cards = document.querySelectorAll('.card');
        let count = 0;

        cards.forEach(card => {
            const styles = (card.getAttribute('data-style') || "").toLowerCase();
            const content = card.innerText.toLowerCase();
            const fullText = card.querySelector('.full-prompt-hidden').innerText.toLowerCase();

            let isVisible = (mode === 'search' && searchTerm !== "") ? 
                (content.includes(searchTerm) || fullText.includes(searchTerm)) : 
                (activeFilter === 'all' || styles.split(' ').includes(activeFilter));

            if (isVisible) {
                card.style.display = 'block';
                count++;
                const preview = card.querySelector('.prompt-text');
                if (preview && preview.innerText === "") {
                    const full = card.querySelector('.full-prompt-hidden').innerText.trim();
                    preview.innerText = full.length > 100 ? full.substring(0, 100) + "..." : full;
                }
            } else {
                card.style.display = 'none';
            }
        });
        counter.innerText = `${count} Prompt(s) affiché(s)`;
    };

    searchInput.addEventListener('input', () => {
        if(searchInput.value !== "") {
            styleButtons.forEach(b => b.classList.remove('active'));
            document.querySelector('[data-filter="all"]').classList.add('active');
            updateDisplay('search');
        } else { updateDisplay('style'); }
    });

    styleButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            searchInput.value = "";
            styleButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            updateDisplay('style');
        });
    });

    // --- 2. MODE ADMIN & SUPPRESSION ---
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        if (e.key.toLowerCase() === 'm') {
            const pass = prompt("Code Administrateur :");
            if (pass === "1234") { toggleAdminVisuals(true); }
        }
    });

    const toggleAdminVisuals = (show) => {
        document.querySelectorAll('.card').forEach(card => {
            let controls = card.querySelector('.admin-controls');
            if (show) {
                if (!controls) {
                    controls = document.createElement('div');
                    controls.className = 'admin-controls';
                    
                    // Bouton Modifier
                    const editBtn = document.createElement('button');
                    editBtn.className = 'btn-edit-card';
                    editBtn.innerText = 'MODIFIER';
                    editBtn.onclick = (ev) => { ev.stopPropagation(); openEditModal(card); };

                    // Bouton Supprimer
                    const deleteBtn = document.createElement('button');
                    deleteBtn.className = 'btn-delete-card';
                    deleteBtn.innerText = 'SUPPRIMER';
                    deleteBtn.onclick = (ev) => { 
                        ev.stopPropagation(); 
                        if(confirm("Supprimer définitivement cette carte ?")) {
                            card.remove();
                            updateDisplay('style');
                        }
                    };

                    controls.appendChild(editBtn);
                    controls.appendChild(deleteBtn);
                    card.appendChild(controls);
                }
                controls.classList.add('admin-visible');
            } else if (controls) {
                controls.classList.remove('admin-visible');
            }
        });
        closeAdminModeBtn.style.display = show ? 'flex' : 'none';
    };

    closeAdminModeBtn.onclick = () => toggleAdminVisuals(false);

    const openEditModal = (card) => {
        currentEditingCard = card;
        document.getElementById('editTitle').value = card.querySelector('.card-header').innerText;
        document.getElementById('editStyles').value = card.getAttribute('data-style');
        document.getElementById('editImg').value = card.querySelector('.card-img').src;
        document.getElementById('editPrompt').value = card.querySelector('.full-prompt-hidden').innerText;
        editPanel.style.display = 'block';
    };

    document.getElementById('updatePrompt').onclick = () => {
        const title = document.getElementById('editTitle').value.toUpperCase();
        const styles = document.getElementById('editStyles').value;
        const img = document.getElementById('editImg').value;
        const promptText = document.getElementById('editPrompt').value;

        currentEditingCard.querySelector('.card-header').innerText = title;
        currentEditingCard.setAttribute('data-style', styles);
        currentEditingCard.querySelector('.card-img').src = img;
        currentEditingCard.querySelector('.full-prompt-hidden').innerText = promptText;
        currentEditingCard.querySelector('.prompt-text').innerText = promptText.substring(0, 100) + "...";

        document.getElementById('editCodeSection').style.display = 'block';
        document.getElementById('editGeneratedCode').value = currentEditingCard.outerHTML.replace(' admin-visible', '');
        alert("Carte mise à jour localement !");
    };

    // --- 3. MODALES & COPIE ---
    document.addEventListener('click', (e) => {
        const card = e.target.closest('.card');
        if (card && !e.target.closest('.admin-controls') && !e.target.classList.contains('btn-copy')) {
            document.getElementById('modalImg').src = card.querySelector('.card-img').src;
            document.getElementById('modalTitle').innerText = card.querySelector('.card-header').innerText;
            document.getElementById('modalDescription').innerText = card.querySelector('.full-prompt-hidden').innerText;
            modal.style.display = 'block';
        }

        if (e.target.classList.contains('btn-copy')) {
            const text = e.target.id === 'modalCopyBtn' ? 
                document.getElementById('modalDescription').innerText : 
                e.target.closest('.card-content').querySelector('.full-prompt-hidden').innerText;
            navigator.clipboard.writeText(text).then(() => {
                const prev = e.target.innerText;
                e.target.innerText = "✓ Copié !";
                setTimeout(() => e.target.innerText = prev, 2000);
            });
        }

        if (e.target.classList.contains('modal-close') || e.target.classList.contains('modal')) {
            modal.style.display = 'none';
            adminPanel.style.display = 'none';
            editPanel.style.display = 'none';
        }
    });

    document.getElementById('openAdmin').onclick = () => adminPanel.style.display = 'block';

    document.getElementById('savePrompt').onclick = () => {
        const title = document.getElementById('newTitle').value.toUpperCase() || "PORTRAIT";
        const styles = document.getElementById('newStyles').value.toLowerCase();
        const img = document.getElementById('newImg').value || "Images/placeholder.png";
        const promptText = document.getElementById('newPrompt').value;

        const cardHTML = `<article class="card" data-style="${styles}"><img src="${img}" class="card-img" alt="${title}"><div class="card-content"><div class="card-header">${title}</div><p class="prompt-text"></p><div class="full-prompt-hidden" style="display:none;">${promptText}</div><button class="btn-copy">Copier</button></div></article>`;
        grid.insertAdjacentHTML('afterbegin', cardHTML);
        document.getElementById('generatedCodeSection').style.display = 'block';
        document.getElementById('generatedCode').value = cardHTML;
        updateDisplay('style');
    };

    updateDisplay('style');
});