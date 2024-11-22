/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const spreadsheetFr = {
    'spreadsheet/custom_column/add_columns': 'Ajouter colonnes personnalisées',
    'spreadsheet/custom_column/column_name': 'Nom colonne',
    'spreadsheet/custom_column/column_content': 'Contenu colonne',
    'spreadsheet/custom_column/column_content_tooltip': `Le contenu d'une colonne est décrit avec des noms de variables (pour faire référence aux données du réseau) et des opérateurs proposés par la librairie MathJS (pour transformer les données du réseau). Exemple : maxP - p pour afficher la réserve de puissance active dans le tableur des groupes`,
    'spreadsheet/custom_column/error/not_unique': 'Les noms de colonne doivent être uniques',
    'spreadsheet/custom_column/save_columns': 'Enregistrer',
    'spreadsheet/custom_column/save_dialog_title': 'Enregistrer un modèle de tableur',
    'spreadsheet/custom_column/save_error_message': 'Une erreur est survenue lors de la création du modèle de tableur',
    'spreadsheet/custom_column/save_confirmation_message': "Création d'un modèle de tableur dans {folderName}",
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
