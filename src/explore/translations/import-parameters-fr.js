const import_parameters_fr = {
    'iidm.import.cgmes.allow-unsupported-tap-changers':
        "Autoriser n'importe quel type de régleur ou déphaseur",
    'iidm.import.cgmes.allow-unsupported-tap-changers.desc':
        "Autoriser n'importe quel type de régleur ou déphaseur",
    'iidm.import.cgmes.change-sign-for-shunt-reactive-power-flow-initial-state':
        "Changement du signe des flux des MCS de l'état initial",
    'iidm.import.cgmes.change-sign-for-shunt-reactive-power-flow-initial-state.desc':
        "Changement du signe des flux des MCS de l'état initial",
    'iidm.import.cgmes.convert-boundary':
        'Importer les XNodes en tant que site/poste',
    'iidm.import.cgmes.convert-boundary.desc':
        'Importer les XNodes en tant que site/poste',
    'iidm.import.cgmes.convert-sv-injections':
        'Convertir les injections du fichier SV en conso',
    'iidm.import.cgmes.convert-sv-injections.desc':
        'Convertir les injections du fichier SV en conso',
    'iidm.import.cgmes.create-busbar-section-for-every-connectivity-node':
        'Créer un SJB pour chaque noeud',
    'iidm.import.cgmes.create-busbar-section-for-every-connectivity-node.desc':
        'Créer un SJB pour chaque noeud',
    'iidm.import.cgmes.ensure-id-alias-unicity':
        "Assurer l'unicité des identifiants et des alias",
    'iidm.import.cgmes.ensure-id-alias-unicity.desc':
        "Assurer l'unicité des identifiants et des alias",
    'iidm.import.cgmes.naming-strategy':
        'Type de nommage utilisé par le fichier de mapping des identifiants',
    'iidm.import.cgmes.naming-strategy.desc':
        'Type de nommage utilisé par le fichier de mapping des identifiants',
    'iidm.import.cgmes.naming-strategy.identity': 'identity',
    'iidm.import.cgmes.naming-strategy.cgmes': 'cgmes',
    'iidm.import.cgmes.naming-strategy.cgmes-fix-all-invalid-id':
        'cgmes-fix-all-invalid-id',
    'iidm.import.cgmes.import-control-areas':
        'Importer les zones géographiques',
    'iidm.import.cgmes.import-control-areas.desc':
        'Importer les zones géographiques (Control areas)',
    'iidm.import.cgmes.profile-for-initial-values-shunt-sections-tap-positions':
        'Profil utilisé pour initialiser les valeurs des sections enclenchés des MCS et les prises courantes des régleurs et déphaseurs',
    'iidm.import.cgmes.profile-for-initial-values-shunt-sections-tap-positions.desc':
        'Profil utilisé pour initialiser les valeurs des sections enclenchés des MCS et les prises courantes des régleurs et déphaseurs',
    'iidm.import.cgmes.profile-for-initial-values-shunt-sections-tap-positions.SV':
        'SV',
    'iidm.import.cgmes.profile-for-initial-values-shunt-sections-tap-positions.SSH':
        'SSH',
    'iidm.import.cgmes.source-for-iidm-id':
        'Identifiants CGMES utilisés pour créer les identifiants IIDM',
    'iidm.import.cgmes.source-for-iidm-id.desc':
        'Identifiants CGMES utilisés pour créer les identifiants IIDM',
    'iidm.import.cgmes.source-for-iidm-id.mRID': 'mrID',
    'iidm.import.cgmes.source-for-iidm-id.rdfID': 'rdfID',
    'iidm.import.cgmes.store-cgmes-model-as-network-extension':
        "Stocker le CGMES initial en tant qu'extension",
    'iidm.import.cgmes.store-cgmes-model-as-network-extension.desc':
        "Stocker le CGMES initial en tant qu'extension",
    'iidm.import.cgmes.store-cgmes-conversion-context-as-network-extension':
        "Stocker le mapping des terminaux CGMES en IIDM en tant qu'extension",
    'iidm.import.cgmes.store-cgmes-conversion-context-as-network-extension.desc':
        "Stocker le mapping des terminaux CGMES en IIDM en tant qu'extension",
    'iidm.import.cgmes.create-active-power-control-extension':
        'Créer une extension pour la compensation',
    'iidm.import.cgmes.create-active-power-control-extension.desc':
        'Créer une extension pour la compensation',
    'iidm.import.cgmes.decode-escaped-identifiers':
        'Décoder les caractères spéciaux échappés dans les identifiants',
    'iidm.import.cgmes.decode-escaped-identifiers.desc':
        'Décoder les caractères spéciaux échappés dans les identifiants',
    'iidm.import.cgmes.create-fictitious-switches-for-disconnected-terminals-mode':
        'Créer des interrupteurs fictifs pour les terminaux déconnectés',
    'iidm.import.cgmes.create-fictitious-switches-for-disconnected-terminals-mode.desc':
        'Définir dans quel cas des interrupteurs fictifs sont créés pour les terminaux déconnectés (uniquement en node-breaker) : toujours, toujours sauf pour les organes de coupure ou jamais',
    'iidm.import.cgmes.create-fictitious-switches-for-disconnected-terminals-mode.ALWAYS':
        'Toujours',
    'iidm.import.cgmes.create-fictitious-switches-for-disconnected-terminals-mode.ALWAYS_EXCEPT_SWITCHES':
        'Toujours sauf pour les organes de coupure',
    'iidm.import.cgmes.create-fictitious-switches-for-disconnected-terminals-mode.NEVER':
        'Jamais',
    'iidm.import.cgmes.post-processors': 'Post-traitements',
    'iidm.import.cgmes.post-processors.desc': 'Post-traitements',
    'iidm.import.cgmes.post-processors.EntsoeCategory': 'EntsoeCategory',
    'iidm.import.cgmes.post-processors.PhaseAngleClock': 'PhaseAngleClock',
    'ucte.import.combine-phase-angle-regulation':
        'Combiner les lois de réglage et de déphasage',
    'ucte.import.combine-phase-angle-regulation.desc':
        'Combiner les lois de réglage et de déphasage',

    // IIDM
    'iidm.import.xml.throw-exception-if-extension-not-found':
        "Exception si une extension n'est pas connue",
    'iidm.import.xml.throw-exception-if-extension-not-found.desc':
        "Lever une exception si on essaie d'importer une extension inconnue",
    'iidm.import.xml.extensions': 'Extensions',
    'iidm.import.xml.extensions.selectionDialog.name':
        'Sélection des extensions',
    'iidm.import.xml.extensions.desc': 'Importer avec ces extensions',
    'iidm.import.xml.extensions.activePowerControl': 'Compensation',
    'iidm.import.xml.extensions.baseVoltageMapping': 'Tension nominale',
    'iidm.import.xml.extensions.branchObservability':
        'Observabilité des quadripôles',
    'iidm.import.xml.extensions.busbarSectionPosition': 'Position des SJBs',
    'iidm.import.xml.extensions.branchStatus':
        'Statut de consignation et déclenchement',
    'iidm.import.xml.extensions.cgmesControlAreas': 'Cgmes - zone géographique',
    'iidm.import.xml.extensions.cgmesDanglingLineBoundaryNode':
        'Code EIC des lignes frontières (ligne non mergée)',
    'iidm.import.xml.extensions.cgmesLineBoundaryNode':
        'Code EIC des lignes frontières (ligne complète)',
    'iidm.import.xml.extensions.cgmesSshMetadata': 'Cgmes - ssh métadonnées',
    'iidm.import.xml.extensions.cgmesSvMetadata': 'Cgmes - sv métadonnées',
    'iidm.import.xml.extensions.cgmesTapChangers':
        'Cgmes - lois de réglage et déphasage',
    'iidm.import.xml.extensions.cimCharacteristics': 'Cgmes - caractéristiques',
    'iidm.import.xml.extensions.coordinatedReactiveControl':
        'Contrôle coordonné du réactif',
    'iidm.import.xml.extensions.detail':
        'Données détaillées des consommations (fixe | affine)',
    'iidm.import.xml.extensions.discreteMeasurements':
        'Télémesures (Régleurs et Déphaseurs)',
    'iidm.import.xml.extensions.entsoeArea': 'Zone Entsoe',
    'iidm.import.xml.extensions.entsoeCategory': 'Catégorie Entsoe des groupes',
    'iidm.import.xml.extensions.generatorActivePowerControl':
        'Compensation (Groupes)',
    // to remove after powsybl september release
    'iidm.import.xml.extensions.generatorFortescue':
        'Données pour les calculs dissymétriques des groupes',
    'iidm.import.xml.extensions.generatorAsymmetrical':
        'Données pour les calculs dissymétriques des groupes',
    'iidm.import.xml.extensions.generatorShortCircuit':
        'Données de court-circuit des groupes',
    'iidm.import.xml.extensions.generatorShortCircuits':
        'Données de court-circuit des groupes (Version IIDM 1.0)',
    'iidm.import.xml.extensions.hvdcAngleDroopActivePowerControl':
        'Emulation AC pour les HVDCs',
    'iidm.import.xml.extensions.hvdcOperatorActivePowerRange':
        'Limites de transits des HVDCs',
    'iidm.import.xml.extensions.identifiableShortCircuit':
        'Données de court-circuit des postes',
    'iidm.import.xml.extensions.injectionObservability':
        'Observabilité des injections',
    // to remove after powsybl september release
    'iidm.import.xml.extensions.lineFortescue':
        'Données pour les calculs dissymétriques des lignes',
    'iidm.import.xml.extensions.lineAsymmetrical':
        'Données pour les calculs dissymétriques des lignes',
    'iidm.import.xml.extensions.linePosition':
        'Coordonnées géographiques de lignes',
    // to remove after powsybl september release
    'iidm.import.xml.extensions.loadFortescue':
        'Données pour les calculs dissymétriques des consommations',
    'iidm.import.xml.extensions.loadAsymmetrical':
        'Données pour les calculs dissymétriques des consommations',
    'iidm.import.xml.extensions.measurements': 'Télémesures',
    'iidm.import.xml.extensions.mergedXnode': 'Xnode mergé',
    'iidm.import.xml.extensions.position': 'Position des départs',
    'iidm.import.xml.extensions.secondaryVoltageControl':
        'Réglage secondaire de tension',
    'iidm.import.xml.extensions.slackTerminal': 'Noeud bilan',
    'iidm.import.xml.extensions.standbyAutomaton': 'Automate des CSPRs',
    'iidm.import.xml.extensions.startup': 'Coût de démarrage des groupes',
    'iidm.import.xml.extensions.substationPosition':
        'Coordonnées géographiques des sites',
    // to remove after powsybl september release
    'iidm.import.xml.extensions.threeWindingsTransformerFortescue':
        'Données pour les calculs dissymétriques des transformateurs à trois enroulements',
    'iidm.import.xml.extensions.threeWindingsTransformerAsymmetrical':
        'Données pour les calculs dissymétriques des transformateurs à trois enroulements',
    'iidm.import.xml.extensions.threeWindingsTransformerPhaseAngleClock':
        "Angles de phase entre les enroulements (sous forme d'horloge) pour les transformateurs à trois enroulements",
    'iidm.import.xml.extensions.threeWindingsTransformerToBeEstimated':
        'Estimation des prises des régleurs et des déphaseurs des transformateurs à trois enroulements',
    // to remove after powsybl september release
    'iidm.import.xml.extensions.twoWindingsTransformerFortescue':
        'Données pour les calculs dissymétriques des transformateurs à deux enroulements',
    'iidm.import.xml.extensions.twoWindingsTransformerAsymmetrical':
        'Données pour les calculs dissymétriques des transformateurs à deux enroulements',
    'iidm.import.xml.extensions.twoWindingsTransformerPhaseAngleClock':
        "Angle de phase entre les enroulements (sous forme d'horloge) pour les transformateurs à deux enroulements",
    'iidm.import.xml.extensions.twoWindingsTransformerToBeEstimated':
        'Estimation des prises des régleurs et des déphaseurs des transformateurs à deux enroulements',
    'iidm.import.xml.extensions.voltageLevelShortCircuits':
        'Données de court-circuit des postes (Version IIDM 1.0)',
    'iidm.import.xml.extensions.voltagePerReactivePowerControl':
        'Contrôle de la tension par le réactif',
    'iidm.import.xml.extensions.xnode': 'Code Xnode',
};

export default import_parameters_fr;
