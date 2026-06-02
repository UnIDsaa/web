const dataParser = {
    eventsData: [],
    endingsData: [],
    characters: new Set(),

    async loadData() {
        try {
            const [eventsRes, endingsRes] = await Promise.all([
                fetch('data/kamokate_event_checklist_revised.csv'),
                fetch('data/kamokate_true_ending_checklist.csv')
            ]);
            
            const eventsCsv = await eventsRes.text();
            const endingsCsv = await endingsRes.text();

            this.eventsData = Papa.parse(eventsCsv, { header: true, skipEmptyLines: true }).data;
            this.endingsData = Papa.parse(endingsCsv, { header: true, skipEmptyLines: true }).data;

            // Extract unique characters based on Korean name to group them
            this.eventsData.forEach(row => {
                if(row.Character_KO) this.characters.add(row.Character_KO);
            });
            this.endingsData.forEach(row => {
                if(row.Character_KO) this.characters.add(row.Character_KO);
            });

            console.log("Data loaded", this.eventsData.length, "events", this.endingsData.length, "endings");
            return true;
        } catch (e) {
            console.error("Failed to load CSV data", e);
            return false;
        }
    },

    getEventsByCharacter(charNameKo) {
        return this.eventsData.filter(row => row.Character_KO === charNameKo);
    },

    getEndingsByCharacter(charNameKo) {
        return this.endingsData.filter(row => row.Character_KO === charNameKo);
    },
    
    // Cross-check utility: find mentioned characters in remarks
    // Kamokate characters short names often appear like ヴ(바), タ(타), リ(리), ロ(로), サ(사), グ(그), モ(모), テ(틴), ル(루), ト(톳), ユ(유)
    // We will parse Remarks for Korean tags like 바, 타, 리, 로...
    extractTags(remarksKo) {
        const tags = [];
        if(!remarksKo) return tags;
        
        const keywords = {
            '바': '바일', '타': '타낫세', '리': '릴리아노', '로': '로니카', '사': '사냐',
            '그': '그레오니', '모': '모제라', '틴': '틴토아', '루': '루죤', '톳': '토즈', '유': '유리리에'
        };

        // Simple match: if remarks contain "바 「" or "바 " or exact match in list
        for (const [key, fullName] of Object.entries(keywords)) {
            if (remarksKo.includes(key + ' 「') || remarksKo.includes(key + ' 호') || remarksKo.includes(key + ' 인')) {
                tags.push(fullName);
            }
        }
        
        // Also check if full name is directly mentioned
        for (const fullName of Object.values(keywords)) {
            if (remarksKo.includes(fullName) && !tags.includes(fullName)) {
                tags.push(fullName);
            }
        }
        
        return tags;
    }
};
