import messages_plugins_fr from '../translations/fr.json';
import messages_plugins_fr_rte from '../translations/fr_rte.json';
import messages_plugins_en from '../translations/en.json';
import messages_plugins_en_rte from '../translations/en_rte.json';
const messages_plugins = {
    fr: {
        ...messages_plugins_fr,
        ...messages_plugins_fr_rte,
    },
    en: {
        ...messages_plugins_en,
        ...messages_plugins_en_rte,
    },
};

export default messages_plugins;
