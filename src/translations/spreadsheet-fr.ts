/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const spreadsheetFr = {
    'spreadsheet/column/button': 'Afficher / masquer colonnes',
    'spreadsheet/column/dialog/title': 'Liste des colonnes',
    'spreadsheet/collection/save/title': 'Liste des tableurs',
    'spreadsheet/column/dialog/check_all': 'Sélectionner tout / aucun',
    'spreadsheet/custom_column/add_columns': 'Ajouter une colonne',
    'spreadsheet/custom_column/edit_columns': 'Éditer une colonne',
    'spreadsheet/custom_column/column_name': 'Nom de la colonne',
    'spreadsheet/custom_column/column_id': 'ID de la colonne',
    'spreadsheet/custom_column/column_type': 'Type de la colonne',
    'spreadsheet/custom_column/column_precision': 'Précision',
    'spreadsheet/custom_column/column_content': 'Entrer la formule',
    'spreadsheet/custom_column/column_dependencies': 'Entrer les dépendances de la formule',
    'spreadsheet/custom_column/column_content_description': `Le contenu d'une colonne est décrit avec des noms de variables (pour faire référence aux données du réseau), des IDs de colonnes (pour faire référence au contenu d'une autre colonne) et des opérateurs proposés par la librairie <Link>MathJS</Link> (pour transformer les données du réseau). Exemple : maxP - p pour afficher la réserve de puissance active dans le tableur des groupes`,
    'spreadsheet/custom_column/error/id_not_conform':
        'Un ID de colonne ne doit contenir ni espace ni caractère spécial et ne doit pas commencer par un chiffre',
    'spreadsheet/custom_column/error/id_le_60': 'Un ID de colonne ne peut dépasser 60 caractères',
    'spreadsheet/custom_column/error/name_le_60': 'Un nom de colonne ne peut dépasser 60 caractères',
    'spreadsheet/custom_column/update_custom_column': 'Modifier colonne',
    'spreadsheet/custom_column/delete_custom_column': 'Supprimer colonne',
    'spreadsheet/custom_column/delete_custom_column_confirmation':
        'Êtes-vous sûr de vouloir supprimer la colonne "{columnName}" ?',
    'spreadsheet/custom_column/delete_column_error': 'Erreur lors de la suppression de la colonne',
    'spreadsheet/custom_column/column_id_already_exist': 'Id de colonne déjà existant',
    'spreadsheet/custom_column/column_name_already_exist': 'Nom de colonne déjà existant',
    'spreadsheet/custom_column/dependencies': "La formule fait référence à d'autres colonnes",
    'spreadsheet/custom_column/nodes': 'Nœuds',
    'spreadsheet/custom_column/option/parameter': 'Paramétrer',
    'spreadsheet/custom_column/option/refresh': 'Recharger',
    'spreadsheet/custom_column/option/refresh/tooltip':
        'Recharger les données de cette feuille pour les autres nœuds paramétrés ({aliases})',
    'spreadsheet/custom_column/parameter_nodes': 'Paramétrer les alias de nœuds',
    'spreadsheet/custom_column/add_alias': 'Ajouter un alias',
    'spreadsheet/custom_column/creates_cyclic_dependency':
        'Les dépendances de la colonne créent un cycle de dépendances',
    'spreadsheet/custom_column/error_saving_or_updating_column':
        'Erreur lors de la sauvegarde ou de la mise à jour de la colonne',
    'spreadsheet/save/button': 'Enregistrer',
    'spreadsheet/reset/button': 'Réinitialiser',
    'spreadsheet/save/options/model': 'En tant que modèle',
    'spreadsheet/save/options/collection': 'Collection',
    'spreadsheet/save/options/csv': 'Export CSV',
    'spreadsheet/save/dialog_title': 'Enregistrer un modèle de tableur',
    'spreadsheet/collection/save/collection_name_dialog_title': 'Enregistrer une collection de tableurs',
    'spreadsheet/save/error_message': 'Une erreur est survenue lors de la création du modèle de tableur',
    'spreadsheet/collection/save/error': 'Une erreur est survenue lors de la création de la collection de tableurs',
    'spreadsheet/save/confirmation_message': "Création d'un modèle de tableur dans {folderName}",
    'spreadsheet/collection/save/success': 'Collection de tableurs créée dans {folderName}',
    'spreadsheet/create_new_spreadsheet/create_empty_spreadsheet': 'Créer une feuille de calcul vide',
    'spreadsheet/create_new_spreadsheet/apply_spreadsheet_model': 'Appliquer un modèle de tableur',
    'spreadsheet/create_new_spreadsheet/apply_spreadsheet_collection': 'Appliquer une collection de tableurs',
    'spreadsheet/create_new_spreadsheet/replace_collection_confirmation':
        "Vous êtes sur le point de remplacer le contenu actuel de l'onglet 'Tableur'. Ce contenu sera perdu si vous ne le sauvegardez pas d'abord dans GridExplore. Souhaitez-vous poursuivre sans sauvegarder le contenu actuel?",
    'spreadsheet/create_new_spreadsheet/add_button_tooltip': 'Ajouter feuille de calcul',
    'spreadsheet/create_new_spreadsheet/empty_spreadsheet_option': 'Ajouter une feuille',
    'spreadsheet/create_new_spreadsheet/apply_model_option': 'Choisir un modèle',
    'spreadsheet/create_new_spreadsheet/apply_collection_option': 'Choisir une collection',
    'spreadsheet/create_new_spreadsheet/select_spreadsheet_model': 'Modèle de tableur',
    'spreadsheet/create_new_spreadsheet/select_spreadsheet_collection': 'Collection de tableurs',
    'spreadsheet/create_new_spreadsheet/spreadsheet_name': 'Nom du tableur',
    'spreadsheet/create_new_spreadsheet/equipment_type': "Type d'équipement",
    'spreadsheet/create_new_spreadsheet/spreadsheet_name_already_exists': 'Ce nom de tableur existe déjà',
    'spreadsheet/create_new_spreadsheet/must_select_spreadsheet_model': 'Vous devez sélectionner un modèle de tableur',
    'spreadsheet/create_new_spreadsheet/must_select_spreadsheet_collection':
        'Vous devez sélectionner une collection de tableurs',
    'spreadsheet/create_new_spreadsheet/must_select_only_one_spreadsheet_model':
        'Vous devez sélectionner un seul modèle de tableur',
    'spreadsheet/create_new_spreadsheet/must_select_only_one_spreadsheet_collection':
        'Vous devez sélectionner une seule collection de tableurs',
    'spreadsheet/create_new_spreadsheet/error_loading_model': 'Erreur lors de la récupération du modèle de tableur',
    'spreadsheet/create_new_spreadsheet/error_loading_collection':
        'Erreur lors de la récupération de la collection de tableurs',
    'spreadsheet/create_new_spreadsheet/error_adding_spreadsheet': "Erreur lors de l'ajout du tableur",
    'spreadsheet/reset_spreadsheet_collection/error_resetting_collection':
        'Erreur lors de la réinitialisation de la collection de tableurs',
    'spreadsheet/parameter_aliases/node_name': 'Nom du nœud',
    'spreadsheet/parameter_aliases/node_alias': 'Alias du nœud',
    'spreadsheet/parameter_aliases/max_characters_reached': 'Ne doit pas dépasser 10 caractères',
    'spreadsheet/parameter_aliases/no_special_characters': 'Ne doit pas contenir de caractères spéciaux',
    'spreadsheet/parameter_aliases/node_doesnt_exist': 'Aucun nœud avec ce nom',
    'spreadsheet/parameter_aliases/unique_aliases': 'Les alias doivent être unique',
    'spreadsheet/parameter_aliases/unique_node_names': 'Chaque nœud ne peut avoir qu’un seul alias',
    'spreadsheet/filter/config': 'Filtres Gridsuite',
    'spreadsheet/remove_spreadsheet_confirmation': 'Êtes-vous sûr de vouloir supprimer le tableur {spreadsheetName} ?',
    'spreadsheet/remove_spreadsheet_error': 'Erreur lors de la suppression du tableur',
    'spreadsheet/reorder_columns/error': 'Erreur lors du réordonnancement des colonnes',
    'spreadsheet/reorder_tabs_error': 'Erreur lors du réordonnancement des onglets',
    'spreadsheet/rename/label': 'Renommer',
    'spreadsheet/delete/label': 'Supprimer',
    'spreadsheet/rename_spreadsheet_error': 'Erreur lors du renommage du tableur',
    'spreadsheet/rename_dialog_title': 'Renommer le tableur',
    'spreadsheet/spreadsheet_name_le_60': 'Le nom du tableur ne peut dépasser 60 caractères',

    // calculations
    'spreadsheet/calculation/sum': 'Somme',
    'spreadsheet/calculation/average': 'Moyenne',
    'spreadsheet/calculation/min': 'Minimum',
    'spreadsheet/calculation/max': 'Maximum',
    'spreadsheet/calculation/sum_abbrev': 'Som',
    'spreadsheet/calculation/average_abbrev': 'Moy',
    'spreadsheet/calculation/min_abbrev': 'Min',
    'spreadsheet/calculation/max_abbrev': 'Max',

    // Column types
    TEXT: 'Texte',
    NUMBER: 'Nombre',
    BOOLEAN: 'Booléen',
    ENUM: 'Enum',
};

export default spreadsheetFr;
