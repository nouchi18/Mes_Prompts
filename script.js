document.addEventListener("DOMContentLoaded", () => {
    const grid = document.getElementById('grid');
    const counter = document.getElementById('counter');
    const searchInput = document.getElementById('searchInput');
    const adminPanel = document.getElementById('adminPanel');
    const genCodeArea = document.getElementById('generatedCode');
    const closeAdminModeBtn = document.getElementById('closeAdminMode');

    // --- 1. GÉNÉRATION DE LA GRILLE ---
    const renderLibrary = () => {
        grid.innerHTML = "";
        promptDatabase.forEach((data, index) => {
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

    // --- 2. EXPORT DATABASE (Génération du code complet) ---
    const generateNewDatabaseCode = () => {
        const currentData = [];
        document.querySelectorAll('.card').forEach(card => {
            currentData.push({
                title: card.querySelector('.card-header').innerText,
                styles: card.getAttribute('data-style'),
                img: card.querySelector('.card-img').src,
                prompt: card.querySelector('.full-prompt-hidden').innerText
            });
        });

        const code = `const promptDatabase = ${JSON.stringify(currentData, null, 4)};`;
        genCodeArea.value = code;
        adminPanel.style.display = "block";
    };

    // --- 3. RECHERCHE ET FILTRES ---
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
                    controls.appendChild(delBtn);
                    card.appendChild(controls);
                }
                controls.style.display = "flex";
            } else if (controls) {
                controls.style.display = "none";
            }
        });
        closeAdminModeBtn.style.display = show ? "flex" : "none";
    };

    closeAdminModeBtn.onclick = () => toggleAdminUI(false);

    // --- 5. MODALES ET COPIE ---
    document.addEventListener('click', (e) => {
        const card = e.target.closest('.card');
        if (card && !e.target.closest('.admin-controls') && !e.target.classList.contains('btn-copy')) {
            document.getElementById('modalImg').src = card.querySelector('.card-img').src;
            document.getElementById('modalTitle').innerText = card.querySelector('.card-header').innerText;
            document.getElementById('modalDescription').innerText = card.querySelector('.full-prompt-hidden').innerText;
            document.getElementById('promptModal').style.display = "block";
        }

        if (e.target.classList.contains('btn-copy')) {
            const text = e.target.id === "modalCopyBtn" ? 
                document.getElementById('modalDescription').innerText : 
                e.target.closest('.card-content').querySelector('.full-prompt-hidden').innerText;
            
            navigator.clipboard.writeText(text).then(() => {
                const prev = e.target.innerText;
                e.target.innerText = "✓ Copié !";
                setTimeout(() => e.target.innerText = prev, 2000);
            });
        }

        if (e.target.classList.contains('modal-close') || e.target.classList.contains('modal')) {
            document.querySelectorAll('.modal').forEach(m => m.style.display = "none");
        }
    });

    document.getElementById('btnCopyDB').onclick = () => {
        navigator.clipboard.writeText(genCodeArea.value);
        alert("Code Database copié ! Collez-le maintenant dans votre fichier database.js");
    };

    renderLibrary();
});