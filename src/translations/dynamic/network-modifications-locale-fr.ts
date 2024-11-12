/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const network_modifications_locale_fr = {
    'network_modifications.modificationsCount':
        '{hide, select, false {{count, plural, =0 {aucune modification} =1 {# modification} other {# modifications}}} other {...}}',
    'network_modifications.EQUIPMENT_DELETION': 'Suppression de {computedLabel}',
    'network_modifications.BY_FILTER_DELETION': 'Suppression par filtre ({computedLabel})',
    'network_modifications.SUBSTATION_CREATION': 'Création du site {computedLabel}',
    'network_modifications.SUBSTATION_MODIFICATION': 'Modification du site {computedLabel}',
    'network_modifications.VOLTAGE_LEVEL_CREATION': 'Création du poste {computedLabel}',
    'network_modifications.VOLTAGE_LEVEL_MODIFICATION': 'Modification du poste {computedLabel}',
    'network_modifications.LINE_SPLIT_WITH_VOLTAGE_LEVEL': "Création d'une coupure {computedLabel}",
    'network_modifications.LINE_ATTACH_TO_VOLTAGE_LEVEL': "Création d'un piquage {computedLabel}",
    'network_modifications.LINES_ATTACH_TO_SPLIT_LINES': 'Passage de piquage en coupure {computedLabel}',
    'network_modifications.LOAD_SCALING': 'Variation plan de consommation {computedLabel}',
    'network_modifications.DELETE_VOLTAGE_LEVEL_ON_LINE': "Suppression d'une coupure {computedLabel}",
    'network_modifications.DELETE_ATTACHING_LINE': "Suppression d'un piquage {computedLabel}",
    'network_modifications.LOAD_CREATION': 'Création de la charge {computedLabel}',
    'network_modifications.LOAD_MODIFICATION': 'Modification de la charge {computedLabel}',
    'network_modifications.BATTERY_CREATION': 'Création de batterie {computedLabel}',
    'network_modifications.BATTERY_MODIFICATION': 'Modification de batterie {computedLabel}',
    'network_modifications.GENERATOR_CREATION': 'Création du générateur {computedLabel}',
    'network_modifications.GENERATOR_MODIFICATION': 'Modification du générateur {computedLabel}',
    'network_modifications.LINE_CREATION': 'Création de la ligne {computedLabel}',
    'network_modifications.LINE_MODIFICATION': 'Modification de la ligne {computedLabel}',
    'network_modifications.TWO_WINDINGS_TRANSFORMER_CREATION':
        'Création du transformateur à 2 enroulements {computedLabel}',
    'network_modifications.TWO_WINDINGS_TRANSFORMER_MODIFICATION':
        'Modification du transformateur à 2 enroulements {computedLabel}',
    'network_modifications.OPERATING_STATUS_MODIFICATION':
        "{action, select, TRIP {Déclenchement de {computedLabel}} LOCKOUT {Consignation de {computedLabel}} ENERGISE_END_ONE {Mise sous tension à vide de {computedLabel} depuis {energizedEnd}} ENERGISE_END_TWO {Mise sous tension à vide de {computedLabel} depuis {energizedEnd}} SWITCH_ON {Mise en service de {computedLabel}} other {Modification du statut opérationnel de l'équipement {computedLabel}}}",
    'network_modifications.SHUNT_COMPENSATOR_CREATION': "Création d'un moyen de compensation {computedLabel}",
    'network_modifications.SHUNT_COMPENSATOR_MODIFICATION': "Modification d'un moyen de compensation {computedLabel}",
    'network_modifications.STATIC_VAR_COMPENSATOR_CREATION': "Création d'un CSPR {computedLabel}",
    'network_modifications.GENERATOR_SCALING': 'Variation plan de production {computedLabel}',
    'network_modifications.VSC_CREATION': 'Création de la HVDC (VSC) {computedLabel}',
    'network_modifications.VSC_MODIFICATION': 'Modification de la HVDC (VSC) {computedLabel}',
    'network_modifications.GROOVY_SCRIPT': 'Modification par script',
    'network_modifications.EQUIPMENT_ATTRIBUTE_MODIFICATION':
        "{equipmentAttributeName, select, open {{equipmentAttributeValue, select, true {Ouverture de {computedLabel}} other {Fermeture de {computedLabel}}}} other {Modification de l'equipement {computedLabel}}}",
    'network_modifications.creatingModification': 'Création de la modification en cours ...',
    'network_modifications.deletingModification': 'Suppression de la modification en cours ...',
    'network_modifications.updatingModification': 'Mise à jour de la modification en cours ...',
    'network_modifications.stashingModification': 'Mise en corbeille de la modification en cours ...',
    'network_modifications.restoringModification': 'Restauration de la modification en cours ...',
    'network_modifications.modifications': 'Mise à jour de la liste des modifications en cours ...',
    'network_modifications.GENERATION_DISPATCH': 'Démarrage de groupes {computedLabel}',
    'network_modifications.VOLTAGE_INIT_MODIFICATION': 'Initialisation du plan de tension {computedLabel}',
    'network_modifications.TABULAR_MODIFICATION': 'Modification tabulaire - {computedLabel}',
    'network_modifications.tabular.GENERATOR_MODIFICATION': 'modifications de générateurs',
    'network_modifications.tabular.LOAD_MODIFICATION': 'modifications de consommations',
    'network_modifications.BY_FORMULA_MODIFICATION': 'Modification par formule {computedLabel}',
    'network_modifications.MODIFICATION_BY_ASSIGNMENT': 'Modification par filtre {computedLabel}',
    'network_modifications.tabular.LINE_MODIFICATION': 'modifications de lignes',
    'network_modifications.tabular.BATTERY_MODIFICATION': 'modifications de batteries',
    'network_modifications.tabular.VOLTAGE_LEVEL_MODIFICATION': 'modifications de postes',
    'network_modifications.tabular.TWO_WINDINGS_TRANSFORMER_MODIFICATION':
        'modifications de transformateurs à 2 enroulements',
    'network_modifications.tabular.SHUNT_COMPENSATOR_MODIFICATION': 'modifications de MCS linéaires',
    'network_modifications.tabular.SUBSTATION_MODIFICATION': 'modifications de sites',
    'network_modifications.TABULAR_CREATION': 'Création tabulaire - {computedLabel}',
    'network_modifications.tabular.GENERATOR_CREATION': 'créations de générateurs',
};

export default network_modifications_locale_fr;
