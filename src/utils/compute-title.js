/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const MAX_TITLE_LENGTH = 106;
const SEPARATOR = ' | ';

export const computeFullPath = (parents) => {
    let path = '';

    for (let i = 0; i < parents.length; i++) {
        path = '/' + parents[i] + path;
    }

    return path;
};

const computePath = (parents, maxAllowedPathSize) => {
    let testedPath = '';
    let path = '';

    for (let i = 0; i < parents.length; i++) {
        testedPath = '/' + parents[i] + testedPath;
        if (testedPath.length > maxAllowedPathSize) {
            return '...' + path;
        }

        path = testedPath;
    }

    return path;
};

const computePageTitleWithFirstDirectory = (pageTitle, parents) => {
    return pageTitle + (parents.length > 1 ? '...' : '') + '/' + parents[0];
};

const computePageTitleWithFullPath = (pageTitle, parents) => {
    const maxAllowedPathSize =
        MAX_TITLE_LENGTH - pageTitle.length - '...'.length;

    pageTitle = pageTitle + computePath(parents, maxAllowedPathSize);

    return pageTitle;
};

const limitChar = (str, limit) => {
    return str.length > limit ? str.substring(0, limit) + '...' : str;
};

export const computePageTitle = (appName, studyName, parents) => {
    if (!studyName) {
        return appName;
    }
    let pageTitle = appName + SEPARATOR + limitChar(studyName, 30);
    if (!parents?.length) {
        return pageTitle;
    }

    pageTitle = pageTitle + SEPARATOR;
    // Rule 1 : if first repository causes exceeding of the maximum number of characters, truncates this repository name
    const titleWithFirstDir = computePageTitleWithFirstDirectory(
        pageTitle,
        parents
    );

    if (titleWithFirstDir.length > MAX_TITLE_LENGTH) {
        return (
            titleWithFirstDir.substring(0, MAX_TITLE_LENGTH - ' ...'.length) +
            ' ...'
        );
    } else {
        // Rule 2 : Otherwise, display the path to the study up to the allowed character limit
        return computePageTitleWithFullPath(pageTitle, parents);
    }
};
