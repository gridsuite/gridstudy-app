/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const MAX_TITLE_LENGTH = 300;
const MAX_STUDY_NAME_LENGTH = 200;
const SEPARATOR = ' | ';

export const computeFullPath = (parents: string[]) => {
    return parents.reduce((path, parent) => `${path}/${parent}`, '');
};

const computePath = (parents: string[], maxAllowedPathSize: number) => {
    let testedPath = '';
    let path = '';

    for (const parent of parents) {
        testedPath += '/' + parent;
        if (testedPath.length > maxAllowedPathSize) {
            return '...' + path;
        }

        path = testedPath;
    }

    return path;
};

const computePageTitleWithFirstDirectory = (pageTitle: string, parents: string[]) => {
    return pageTitle + (parents.length > 1 ? '...' : '') + '/' + parents[0];
};

const computePageTitleWithFullPath = (pageTitle: string, parents: string[]) => {
    const maxAllowedPathSize = MAX_TITLE_LENGTH - pageTitle.length - '...'.length;

    pageTitle = pageTitle + computePath(parents, maxAllowedPathSize);

    return pageTitle;
};

const limitChar = (str: string, limit: number) => {
    return str.length > limit ? str.substring(0, limit) + '...' : str;
};

export const computePageTitle = (appName: string, studyName?: string | null, parents?: string[] | null) => {
    if (!studyName) {
        return appName;
    }
    let pageTitle = limitChar(studyName, MAX_STUDY_NAME_LENGTH);
    if (!parents?.length) {
        return pageTitle;
    }

    pageTitle = pageTitle + SEPARATOR;
    // Rule 1 : if first repository causes exceeding of the maximum number of characters, truncates this repository name
    const titleWithFirstDir = computePageTitleWithFirstDirectory(pageTitle, parents);

    if (titleWithFirstDir.length > MAX_TITLE_LENGTH) {
        return titleWithFirstDir.substring(0, MAX_TITLE_LENGTH - ' ...'.length) + ' ...';
    } else {
        // Rule 2 : Otherwise, display the path to the study up to the allowed character limit
        return computePageTitleWithFullPath(pageTitle, parents);
    }
};
