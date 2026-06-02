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

    updateProgress(stats) {
        document.getElementById('progress-stats').style.display = 'block';
        
        const eventEl = document.getElementById('event-progress');
        const endingEl = document.getElementById('ending-progress');

        const evPercent = stats.totalEvents === 0 ? 0 : Math.round((stats.collectedEvents / stats.totalEvents) * 100);
        const edPercent = stats.totalEndings === 0 ? 0 : Math.round((stats.collectedEndings / stats.totalEndings) * 100);

        eventEl.textContent = `${stats.collectedEvents}/${stats.totalEvents} (${evPercent}%)`;
        endingEl.textContent = `${stats.collectedEndings}/${stats.totalEndings} (${edPercent}%)`;
    },

    renderEvents(events, searchText, showUncheckedOnly) {
        const container = document.getElementById('events-view');
        container.innerHTML = '';
        
        if (events.length === 0) {
            container.innerHTML = '<div class="placeholder-text">표시할 이벤트가 없습니다.</div>';
            return;
        }

        events.forEach(ev => {
            // Filter by search text
            const searchStr = `${ev.Title_KO} ${ev.Title_JP} ${ev.Remarks}`.toLowerCase();
            if (searchText && !searchStr.includes(searchText.toLowerCase())) return;

            const div = document.createElement('div');
            div.className = 'list-item';
            
            const isChecked = stateManager.isEventChecked(ev.EventID);
            if (showUncheckedOnly && isChecked) return;
            
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
            div.className = 'list-item';
            
            const isChecked = stateManager.isEndingChecked(endingId);
            if (showUncheckedOnly && isChecked) return;

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
