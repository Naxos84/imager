module.exports = {
    get(language, key) {
        console.log("Getting translation for ", language);
        const l = language.split("-")[0];

        try {
            const messages = require(`./messages_${l}.json`);
            if (messages) {
                if (messages[key]) {
                    return messages[key]
                }
            }
            return key;
        } catch (e) {
            console.error(`Missing messages file for ${language}. `, e.message);
            return key;
        }
    }
}
