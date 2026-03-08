document.addEventListener("DOMContentLoaded", () => {
    const grid = document.getElementById('grid');
    const styleButtons = document.querySelectorAll('.style-card');
    const searchInput = document.getElementById('searchInput');
    const counter = document.getElementById('counter');
    const adminPanel = document.getElementById('adminPanel');
    const genCodeSection = document.getElementById('generatedCodeSection');
    const genCodeTextArea = document.getElementById('generatedCode');
    let currentEditingCard = null;

    // --- 1. FONCTION DE GÉNÉRATION DE CODE PROPRE ---
    const generateFullGridCode = () => {
        const gridClone = grid.cloneNode(true);
        // Supprimer les contrôles admin et les classes temporaires avant export
        gridClone.querySelectorAll('.admin-controls').forEach(el => el.remove());
        gridClone.querySelectorAll('.admin-visible').forEach(el => el.classList.remove('admin-visible'));
        gridClone.querySelectorAll('.card').forEach(card => {
            card.style.display = ""; // Réinitialiser le style de visibilité pour l'export
        });

        const cleanHTML = gridClone.innerHTML.trim();
        genCodeSection.style.display = 'block';
        genCodeTextArea.value = cleanHTML;
        adminPanel.style.display = 'block'; // Ouvrir la modale pour montrer le code
    };

    // --- 2. FILTRAGE ET RECHERCHE ---
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
            } else { card.style.display = 'none'; }
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

    // --- 3. MODE ADMIN (Touche 'M') ---
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
                    
                    const editBtn = document.createElement('button');
                    editBtn.className = 'btn-edit-card'; editBtn.innerText = 'MODIFIER';
                    editBtn.onclick = (ev) => { ev.stopPropagation(); openEditModal(card); };

                    const delBtn = document.createElement('button');
                    delBtn.className = 'btn-delete-card'; delBtn.innerText = 'SUPPRIMER';
                    delBtn.onclick = (ev) => { 
                        ev.stopPropagation(); 
                        if(confirm("Supprimer cette carte ? Un code de mise à jour sera généré.")) {
                            card.remove();
                            updateDisplay('style');
                            generateFullGridCode(); // GÉNÉRATION AUTO APRÈS SUPPRESSION
                        }
                    };

                    controls.append(editBtn, delBtn);
                    card.appendChild(controls);
                }
                controls.classList.add('admin-visible');
            } else if (controls) { controls.classList.remove('admin-visible'); }
        });
        document.getElementById('closeAdminMode').style.display = show ? 'flex' : 'none';
    };

    const openEditModal = (card) => {
        currentEditingCard = card;
        document.getElementById('adminModalTitle').innerText = "Modifier le Prompt";
        document.getElementById('adminTitle').value = card.querySelector('.card-header').innerText;
        document.getElementById('adminStyles').value = card.getAttribute('data-style');
        document.getElementById('adminImg').value = card.querySelector('.card-img').src;
        document.getElementById('adminPrompt').value = card.querySelector('.full-prompt-hidden').innerText;
        adminPanel.style.display = 'block';
    };

    document.getElementById('btnSaveAction').onclick = () => {
        const title = document.getElementById('adminTitle').value.toUpperCase();
        const styles = document.getElementById('adminStyles').value.toLowerCase();
        const img = document.getElementById('adminImg').value;
        const promptText = document.getElementById('adminPrompt').value;

        if (currentEditingCard) {
            // MODE ÉDITION
            currentEditingCard.querySelector('.card-header').innerText = title;
            currentEditingCard.setAttribute('data-style', styles);
            currentEditingCard.querySelector('.card-img').src = img;
            currentEditingCard.querySelector('.full-prompt-hidden').innerText = promptText;
            currentEditingCard.querySelector('.prompt-text').innerText = promptText.substring(0, 100) + "...";
        } else {
            // MODE AJOUT
            const html = `<article class="card" data-style="${styles}"><img src="${img}" class="card-img"><div class="card-content"><div class="card-header">${title}</div><p class="prompt-text"></p><div class="full-prompt-hidden" style="display:none;">${promptText}</div><button class="btn-copy">Copier</button></div></article>`;
            grid.insertAdjacentHTML('afterbegin', html);
        }
        generateFullGridCode();
        updateDisplay('style');
    };

    // --- 4. COPIE ET MODALES ---
    document.getElementById('btnCopyFullGrid').onclick = () => {
        navigator.clipboard.writeText(genCodeTextArea.value).then(() => {
            alert("Code de la grille copié ! Collez-le maintenant dans votre fichier index.html.");
        });
    };

    document.addEventListener('click', (e) => {
        const card = e.target.closest('.card');
        if (card && !e.target.closest('.admin-controls') && !e.target.classList.contains('btn-copy')) {
            document.getElementById('modalImg').src = card.querySelector('.card-img').src;
            document.getElementById('modalTitle').innerText = card.querySelector('.card-header').innerText;
            document.getElementById('modalDescription').innerText = card.querySelector('.full-prompt-hidden').innerText;
            document.getElementById('promptModal').style.display = 'block';
        }

        if (e.target.classList.contains('btn-copy') && !e.target.closest('.admin-form')) {
            const text = e.target.id === 'modalCopyBtn' ? 
                document.getElementById('modalDescription').innerText : 
                e.target.closest('.card-content').querySelector('.full-prompt-hidden').innerText;
            navigator.clipboard.writeText(text).then(() => {
                const prev = e.target.innerText; e.target.innerText = "✓ Copié !";
                setTimeout(() => e.target.innerText = prev, 2000);
            });
        }

        if (e.target.classList.contains('modal-close') || e.target.classList.contains('modal')) {
            document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
            currentEditingCard = null; // Reset editing state
            genCodeSection.style.display = 'none';
        }
    });

    document.getElementById('openAdmin').onclick = () => {
        currentEditingCard = null;
        document.getElementById('adminModalTitle').innerText = "Ajouter un Prompt";
        document.getElementById('adminForm').reset();
        adminPanel.style.display = 'block';
    };

    document.getElementById('closeAdminMode').onclick = () => toggleAdminVisuals(false);

    updateDisplay('style');
});