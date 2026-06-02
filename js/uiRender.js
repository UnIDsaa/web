const uiRender = {
    renderSidebar(characters, onSelectChar) {
        const sidebar = document.getElementById('character-list');
        sidebar.innerHTML = '';
        
        // Convert Set to Array
        Array.from(characters).forEach(charName => {
            const div = document.createElement('div');
            div.className = 'char-item';
            div.textContent = charName;
            div.dataset.char = charName;
            div.addEventListener('click', () => {
                document.querySelectorAll('.char-item').forEach(el => el.classList.remove('active'));
                div.classList.add('active');
                onSelectChar(charName);
            });
            sidebar.appendChild(div);
        });
    },

    createBadgeHTML(tags) {
        if (!tags || tags.length === 0) return '';
        return `<div class="badge-container">
            ${tags.map(tag => `<span class="badge">${tag}</span>`).join('')}
        </div>`;
    },

    renderTabs(mode, currentTab, onTabClick) {
        const container = document.getElementById('dynamic-view-tabs');
        if (!container) return;
        container.innerHTML = '';
        
        let tabs = [];
        if (mode === 'all') {
            tabs = [
                { id: 'events', name: '이벤트 전체' },
                { id: 'endings', name: '엔딩 전체' }
            ];
        } else {
            tabs = [
                { id: 'weekday', name: '중일' },
                { id: 'holiday', name: '휴일' },
                { id: 'conversation', name: '대화' },
                { id: 'endgame', name: '종반' },
                { id: 'endings', name: '엔딩' }
            ];
        }

        tabs.forEach(t => {
            const btn = document.createElement('button');
            btn.className = `tab-btn ${t.id === currentTab ? 'active' : ''}`;
            btn.dataset.target = t.id;
            btn.textContent = t.name;
            btn.addEventListener('click', () => onTabClick(t.id));
            container.appendChild(btn);
        });
    },

    updateProgress(stats) {
        document.getElementById('progress-stats').style.display = 'block';
        
        const eventEl = document.getElementById('event-progress');
        const endingEl = document.getElementById('ending-progress');

        const evPercent = stats.totalEvents === 0 ? 0 : Math.round((stats.collectedEvents / stats.totalEvents) * 100);
        const edPercent = stats.totalEndings === 0 ? 0 : Math.round((stats.collectedEndings / stats.totalEndings) * 100);

        eventEl.textContent = `${stats.collectedEvents}/${stats.totalEvents} (${evPercent}%)`;
        endingEl.textContent = `${stats.collectedEndings}/${stats.totalEndings} (${edPercent}%)`;
    },

    renderEvents(events, searchText, showUncheckedOnly, currentTab, viewMode) {
        const container = document.getElementById('events-view');
        container.innerHTML = '';
        
        let targetEvents = events;
        
        if (viewMode === 'tab') {
            targetEvents = events.filter(ev => {
                const numId = parseInt(ev.EventID.split('_')[1], 10);
                if (currentTab === 'weekday') return numId >= 1 && numId < 50;
                if (currentTab === 'holiday') return numId >= 50 && numId < 100;
                if (currentTab === 'conversation') return numId >= 100 && numId < 200;
                if (currentTab === 'endgame') return numId >= 200 && numId < 300;
                return false;
            });
        }

        if (targetEvents.length === 0) {
            container.innerHTML = '<div class="placeholder-text">표시할 이벤트가 없습니다.</div>';
            return;
        }

        targetEvents.forEach(ev => {
            // Filter by search text
            const searchStr = `${ev.Title_KO} ${ev.Title_JP} ${ev.Remarks}`.toLowerCase();
            if (searchText && !searchStr.includes(searchText.toLowerCase())) return;

            const div = document.createElement('div');
            
            const isChecked = stateManager.isEventChecked(ev.EventID);
            if (showUncheckedOnly && isChecked) return;
            
            div.className = `list-item ${isChecked ? 'checked' : ''}`;
            
            const tags = dataParser.extractTags(ev.Remarks);

            div.innerHTML = `
                <input type="checkbox" class="item-checkbox event-checkbox" data-id="${ev.EventID}" ${isChecked ? 'checked' : ''}>
                <div class="item-content">
                    <div class="item-id">ID: ${ev.EventID}</div>
                    <div class="item-title">
                        <span class="lang-ko">${ev.Title_KO}</span> 
                        <span class="lang-jp">${ev.Title_JP}</span>
                    </div>
                    <div class="item-remarks">
                        <span class="lang-ko">${ev.Remarks}</span>
                    </div>
                    ${this.createBadgeHTML(tags)}
                </div>
            `;
            container.appendChild(div);
        });
    },

    renderEndings(endings, searchText, showUncheckedOnly) {
        const container = document.getElementById('endings-view');
        container.innerHTML = '';
        
        if (endings.length === 0) {
            container.innerHTML = '<div class="placeholder-text">표시할 엔딩이 없습니다.</div>';
            return;
        }

        endings.forEach(ed => {
            // Create unique ID for ending
            const endingId = `${ed.Character_KO}_${ed.EndingType_KO}_${ed.Version_KO || 'single'}`;
            
            const searchStr = `${ed.EndingType_KO} ${ed.EndingType_JP} ${ed.Version_KO} ${ed.Version_JP}`.toLowerCase();
            if (searchText && !searchStr.includes(searchText.toLowerCase())) return;

            const div = document.createElement('div');
            
            const isChecked = stateManager.isEndingChecked(endingId);
            if (showUncheckedOnly && isChecked) return;

            div.className = `list-item ${isChecked ? 'checked' : ''}`;

            div.innerHTML = `
                <input type="checkbox" class="item-checkbox ending-checkbox" data-id="${endingId}" ${isChecked ? 'checked' : ''}>
                <div class="item-content">
                    <div class="item-title">
                        <span class="lang-ko">${ed.EndingType_KO}</span> 
                        <span class="lang-jp">${ed.EndingType_JP}</span>
                    </div>
                    <div class="item-remarks">
                        <span class="lang-ko">${ed.Version_KO}</span>
                        <span class="lang-jp"><br>${ed.Version_JP}</span>
                    </div>
                </div>
            `;
            container.appendChild(div);
        });
    }
};
