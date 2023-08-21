/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import PropTypes from 'prop-types';
import DirectoryItemSelector from 'components/directory-item-selector';
import { elementType } from '@gridsuite/commons-ui';
import { getFilterById } from 'services/filter';
import { FILTER_TYPES } from 'components/network/constants';
import CriteriaBasedFilterEditionDialog from './criteria-based/criteria-based-filter-edition-dialog';
import ExplicitNamingFilterEditionDialog from './explicit-naming/explicit-naming-filter-edition-dialog';
import { useState } from 'react';
import { useIntl } from 'react-intl';

const EditFilterDialog = ({ open, onClose }) => {
    const intl = useIntl();

    const [openDialog, setOpenDialog] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState({
        id: null,
        name: null,
        type: null,
    });
    const [activeDirectory, setActiveDirectory] = useState(null);
    const useSelectedFilter = (filter) => {
        if (filter && filter.length > 0) {
            getFilterById(filter[0].id).then((res) => {
                setSelectedFilter({
                    id: filter[0].id,
                    name: filter[0].name,
                    type: res.type,
                });
                setOpenDialog(true);
            });
        } else {
            onClose();
        }
    };

    const getRootDirectorys = (roots) => {
        const directory = roots?.filter((item) => {
            const isExist = item.children.filter(
                (child) => child.elementUuid === selectedFilter.id
            );
            return isExist.length > 0 ? item : null;
        });
        if (directory && directory.length > 0) {
            setActiveDirectory(directory[0].elementUuid);
        }
    };

    function renderDialog(filter) {
        if (FILTER_TYPES.CRITERIA_BASED.id === filter.type) {
            return (
                <>
                    <CriteriaBasedFilterEditionDialog
                        id={filter.id}
                        open={openDialog}
                        onClose={() => setOpenDialog(false)}
                        titleId={'editFilter'}
                        name={filter.name}
                        activeDirectory={activeDirectory}
                    />
                </>
            );
        } else {
            return (
                <>
                    <ExplicitNamingFilterEditionDialog
                        id={filter.id}
                        open={openDialog}
                        onClose={() => setOpenDialog(false)}
                        titleId={'editFilter'}
                        name={filter.name}
                        activeDirectory={activeDirectory}
                    />
                </>
            );
        }
    }

    return (
        <>
            <DirectoryItemSelector
                open={open}
                onClose={useSelectedFilter}
                types={[elementType.FILTER]}
                title={intl.formatMessage({ id: 'FiltersListsSelection' })}
                onlyLeaves={true}
                multiselect={false}
                getRootDirectorys={getRootDirectorys}
            />
            {openDialog && renderDialog(selectedFilter)}
        </>
    );
};

EditFilterDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default EditFilterDialog;
