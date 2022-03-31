const MAX_TITLE_LENGTH = 106;
const SEPARATOR = ' | ';

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

export const computePageTitle = (appName, study, parents) => {
    if (!study) return appName;
    let pageTitle = appName + SEPARATOR + study.elementName;
    if (!parents?.length) return pageTitle;

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
