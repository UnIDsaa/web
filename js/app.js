document.addEventListener('DOMContentLoaded', async () => {
    // Current State
    let currentChar = null;
    let currentTab = 'events'; // 'events' or 'endings'
    let currentLang = 'both'; // 'ko', 'jp', 'both'
    let currentTheme = 'dark'; // 'dark' or 'light'
    let searchText = '';

    // Initialize Data
    const success = await dataParser.loadData();
    if (!success) {
        alert("데이터를 불러오는데 실패했습니다.");
        return;
    }

    // Render Sidebar
    uiRender.renderSidebar(dataParser.characters, (charName) => {
        currentChar = charName;
        document.getElementById('current-character-name').textContent = charName;
        document.querySelector('.bulk-actions').style.display = 'block';
        document.querySelector('.view-tabs').style.display = 'flex';
        refreshViews();
    });

    function refreshViews() {
        if (!currentChar) return;
        
        const events = dataParser.getEventsByCharacter(currentChar);
        const endings = dataParser.getEndingsByCharacter(currentChar);
        
        uiRender.renderEvents(events, searchText);
        uiRender.renderEndings(endings, searchText);
        bindCheckboxes();
    }

    function bindCheckboxes() {
        // Events
        document.querySelectorAll('.event-checkbox').forEach(cb => {
            cb.addEventListener('change', (e) => {
                stateManager.toggleEvent(e.target.dataset.id, e.target.checked);
            });
        });
        
        // Endings
        document.querySelectorAll('.ending-checkbox').forEach(cb => {
            cb.addEventListener('change', (e) => {
                stateManager.toggleEnding(e.target.dataset.id, e.target.checked);
            });
        });
    }

    // Tab Switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.view-pane').forEach(p => p.classList.remove('active'));
            
            e.target.classList.add('active');
            currentTab = e.target.dataset.target;
            document.getElementById(`${currentTab}-view`).classList.add('active');
        });
    });

    // Language Toggle
    const btnLang = document.getElementById('btn-toggle-lang');
    btnLang.addEventListener('click', () => {
        if (currentLang === 'both') {
            currentLang = 'ko';
            document.body.className = 'lang-ko';
            btnLang.textContent = '언어: 한국어만';
        } else if (currentLang === 'ko') {
            currentLang = 'jp';
            document.body.className = 'lang-jp';
            btnLang.textContent = '언어: 일본어만';
        } else {
            currentLang = 'both';
            document.body.className = 'lang-both';
            btnLang.textContent = '언어: 함께 보기';
        }
    });

    // Theme Toggle
    const btnTheme = document.getElementById('btn-toggle-theme');
    btnTheme.addEventListener('click', () => {
        if (currentTheme === 'dark') {
            currentTheme = 'light';
            document.documentElement.setAttribute('data-theme', 'light');
            btnTheme.textContent = '테마: 다크(Dark)';
        } else {
            currentTheme = 'dark';
            document.documentElement.setAttribute('data-theme', 'dark');
            btnTheme.textContent = '테마: 라이트(Light)';
        }
    });

    // Search Filtering
    const searchInput = document.getElementById('input-search');
    searchInput.addEventListener('input', (e) => {
        searchText = e.target.value;
        refreshViews();
    });

    // Bulk Actions
    document.getElementById('btn-check-all').addEventListener('click', () => {
        const checkboxes = document.querySelectorAll(`#${currentTab}-view .item-checkbox`);
        checkboxes.forEach(cb => {
            if (!cb.checked) {
                cb.checked = true;
                cb.dispatchEvent(new Event('change'));
            }
        });
    });

    document.getElementById('btn-uncheck-all').addEventListener('click', () => {
        const checkboxes = document.querySelectorAll(`#${currentTab}-view .item-checkbox`);
        checkboxes.forEach(cb => {
            if (cb.checked) {
                cb.checked = false;
                cb.dispatchEvent(new Event('change'));
            }
        });
    });

    // Import / Export / Clear
    document.getElementById('btn-export').addEventListener('click', () => {
        stateManager.exportData();
    });

    const importInput = document.getElementById('input-import');
    document.getElementById('btn-import').addEventListener('click', () => {
        importInput.click();
    });
    
    importInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            stateManager.importData(e.target.files[0], (success) => {
                if(success) {
                    alert('데이터를 성공적으로 불러왔습니다!');
                    refreshViews();
                }
            });
        }
    });

    document.getElementById('btn-clear-all').addEventListener('click', () => {
        if(confirm('모든 체크 데이터를 초기화하시겠습니까? 복구할 수 없습니다.')) {
            stateManager.clearAll();
            refreshViews();
        }
    });

});
