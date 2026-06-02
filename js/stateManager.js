const stateManager = {
    state: {
        checkedEvents: {},
        checkedEndings: {}
    },

    init() {
        const savedState = localStorage.getItem('kamo_check_state');
        if (savedState) {
            try {
                this.state = JSON.parse(savedState);
                if (!this.state.checkedEvents) this.state.checkedEvents = {};
                if (!this.state.checkedEndings) this.state.checkedEndings = {};
            } catch (e) {
                console.error("Failed to parse saved state", e);
            }
        }
    },

    save() {
        localStorage.setItem('kamo_check_state', JSON.stringify(this.state));
    },

    toggleEvent(eventId, isChecked) {
        if (isChecked) {
            this.state.checkedEvents[eventId] = true;
        } else {
            delete this.state.checkedEvents[eventId];
        }
        this.save();
    },

    isEventChecked(eventId) {
        return !!this.state.checkedEvents[eventId];
    },

    toggleEnding(endingId, isChecked) {
        if (isChecked) {
            this.state.checkedEndings[endingId] = true;
        } else {
            delete this.state.checkedEndings[endingId];
        }
        this.save();
    },

    isEndingChecked(endingId) {
        return !!this.state.checkedEndings[endingId];
    },

    exportData() {
        const dataStr = JSON.stringify(this.state, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const exportFileDefaultName = 'kamokate_save.json';

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    },

    importData(file, callback) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedState = JSON.parse(e.target.result);
                if (importedState.checkedEvents) {
                    this.state.checkedEvents = { ...this.state.checkedEvents, ...importedState.checkedEvents };
                }
                if (importedState.checkedEndings) {
                    this.state.checkedEndings = { ...this.state.checkedEndings, ...importedState.checkedEndings };
                }
                this.save();
                if(callback) callback(true);
            } catch (err) {
                console.error("Invalid JSON file", err);
                if(callback) callback(false);
            }
        };
        reader.readAsText(file);
    },

    clearAll() {
        this.state.checkedEvents = {};
        this.state.checkedEndings = {};
        this.save();
    },

    exportCSV(eventsData, uncheckedOnly) {
        if (!window.Papa) {
            alert('PapaParse 라이브러리를 찾을 수 없습니다.');
            return;
        }

        let targetEvents = eventsData.map(ev => {
            return {
                ...ev,
                "달성여부": this.isEventChecked(ev.EventID) ? 'O' : 'X'
            };
        });

        if (uncheckedOnly) {
            targetEvents = targetEvents.filter(ev => ev["달성여부"] === 'X');
        }

        const csvStr = Papa.unparse(targetEvents);
        
        // 엑셀에서 한글이 깨지지 않도록 UTF-8 BOM 추가
        const bom = "\uFEFF";
        const blob = new Blob([bom + csvStr], { type: 'text/csv;charset=utf-8;' });
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', uncheckedOnly ? 'kamokate_unchecked_events.csv' : 'kamokate_all_events_status.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

stateManager.init();
