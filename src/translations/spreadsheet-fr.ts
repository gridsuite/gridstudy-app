/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const spreadsheetFr = {
    'spreadsheet/column/button': 'Afficher / masquer colonnes',
    'spreadsheet/column/dialog/title': 'Liste des colonnes',
    'spreadsheet/column/dialog/check_all': 'Sélectionner tout / aucun',
    'spreadsheet/custom_column/add_columns': 'Ajouter une colonne',
    'spreadsheet/custom_column/edit_columns': 'Éditer une colonne',
    'spreadsheet/custom_column/column_name': 'Nom de la colonne',
    'spreadsheet/custom_column/column_content': 'Entrer la formule',
    'spreadsheet/custom_column/column_content_description': `Le contenu d'une colonne est décrit avec des noms de variables (pour faire référence aux données du réseau) et des opérateurs proposés par la librairie <Link>MathJS</Link> (pour transformer les données du réseau). Exemple : maxP - p pour afficher la réserve de puissance active dans le tableur des groupes`,
    'spreadsheet/custom_column/error/not_unique': 'Les noms de colonne doivent être uniques',
    'spreadsheet/custom_column/error/name_exceeds_length': 'Le nom de colonne ne peut dépasser 60 caractères',
    'spreadsheet/custom_column/update_custom_column': 'Modifier colonne',
    'spreadsheet/custom_column/delete_custom_column': 'Supprimer colonne',
    'spreadsheet/custom_column/delete_custom_column_confirmation':
        'Êtes-vous sûr de vouloir supprimer la colonne "{columnName}" ?',
    'spreadsheet/custom_column/column_name_already_exist': 'Nom de colonne déjà existant',
    'spreadsheet/save/button': 'Enregistrer',
    'spreadsheet/save/options/model': 'En tant que modèle',
    'spreadsheet/save/options/csv': 'Export CSV',
    'spreadsheet/save/dialog_title': 'Enregistrer un modèle de tableur',
    'spreadsheet/save/error_message': 'Une erreur est survenue lors de la création du modèle de tableur',
    'spreadsheet/save/confirmation_message': "Création d'un modèle de tableur dans {folderName}",
    'spreadsheet/create_new_spreadsheet/create_empty_spreadsheet': 'Créer une feuille de calcul vide',
    'spreadsheet/create_new_spreadsheet/apply_spreadsheet_model': 'Appliquer un modèle de tableur',
    'spreadsheet/create_new_spreadsheet/add_button_tooltip': 'Ajouter feuille de calcul',
    'spreadsheet/create_new_spreadsheet/empty_spreadsheet_option': 'Ajouter une feuille',
    'spreadsheet/create_new_spreadsheet/apply_model_option': 'Choisir un modèle',
    'spreadsheet/create_new_spreadsheet/select_spreadsheet_model': 'Modèle de tableur',
    'spreadsheet/create_new_spreadsheet/spreadsheet_name': 'Nom du tableur',
    'spreadsheet/create_new_spreadsheet/equipment_type': "Type d'équipement",
    'spreadsheet/create_new_spreadsheet/spreadsheet_name_already_exists': 'Ce nom de tableur existe déjà',
    'spreadsheet/create_new_spreadsheet/must_select_spreadsheet_model': 'Vous devez sélectionner un modèle de tableur',
    'spreadsheet/create_new_spreadsheet/must_select_only_one_spreadsheet_model':
        'Vous devez sélectionner un seul modèle de tableur',
    'spreadsheet/create_new_spreadsheet/error_loading_model': 'Erreur lors de la récupération du modèle de tableur',
};

export default spreadsheetFr;
