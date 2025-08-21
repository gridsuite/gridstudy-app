/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useState } from 'react';
import { Box, Button, ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import { UUID } from 'crypto';
import { Search, Public, Upload, SaveOutlined } from '@mui/icons-material';
import {
    DirectoryItemSelector,
    ElementType,
    EquipmentInfos,
    OverflowableText,
    TreeViewFinderNodeProps,
} from '@gridsuite/commons-ui';
import { TopBarEquipmentSearchDialog } from 'components/top-bar-equipment-seach-dialog/top-bar-equipment-search-dialog';
import { EQUIPMENT_TYPES } from '../utils/equipment-types';
import { useSelector } from 'react-redux';
import { AppState } from 'redux/reducer';

const styles = {
    container: {
        padding: 1,
        marginLeft: 1,
    },
    content: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
};

interface DiagramGridHeaderProps {
    onLoad: (elementUuid: UUID, elementType: ElementType, elementName: string) => void;
    onSearch: (element: EquipmentInfos) => void;
    onLayoutSave: () => void;
    onMap?: () => void;
}

export const DiagramGridHeader = (props: DiagramGridHeaderProps) => {
    const { onLoad, onSearch, onMap, onLayoutSave } = props;

    const intl = useIntl();

    const [isLoadSelectorOpen, setIsLoadSelectorOpen] = useState(false);
    const [isDialogSearchOpen, setIsDialogSearchOpen] = useState(false);
    const mapOpen = useSelector((state: AppState) => state.mapOpen);

    const selectElement = (selectedElements: TreeViewFinderNodeProps[]) => {
        if (selectedElements.length > 0 && selectedElements[0].type) {
            onLoad(selectedElements[0].id, selectedElements[0].type, selectedElements[0].name);
        }
        setIsLoadSelectorOpen(false);
    };
    return (
        <Box sx={styles.container}>
            <Box sx={styles.content}>
                <Box display="flex" alignItems="center" gap={1}>
                    <OverflowableText text={intl.formatMessage({ id: 'AddNewCard' })} />
                    <ToggleButtonGroup size="small">
                        <Tooltip title={<FormattedMessage id="AddFromGridexplore" />}>
                            <ToggleButton value="upload" onClick={() => setIsLoadSelectorOpen(true)}>
                                <Upload fontSize="small" />
                            </ToggleButton>
                        </Tooltip>
                        <Tooltip title={<FormattedMessage id="equipment_search/label" />}>
                            <ToggleButton value="search" onClick={() => setIsDialogSearchOpen(true)}>
                                <Search fontSize="small" />
                            </ToggleButton>
                        </Tooltip>
                        <Tooltip title={<FormattedMessage id="OpenMapCard" />}>
                            <span>
                                <ToggleButton value="map" disabled={!onMap} onClick={onMap}>
                                    <Public fontSize="small" />
                                </ToggleButton>
                            </span>
                        </Tooltip>
                    </ToggleButtonGroup>
                </Box>
                <Box>
                    <Tooltip title={<FormattedMessage id="SaveGridLayout" />}>
                        <Button startIcon={<SaveOutlined />} sx={{ textTransform: 'uppercase' }} onClick={onLayoutSave}>
                            <FormattedMessage id="SaveGridLayout" />
                        </Button>
                    </Tooltip>
                </Box>
            </Box>
            <DirectoryItemSelector
                open={isLoadSelectorOpen}
                onClose={selectElement}
                types={[ElementType.DIAGRAM_CONFIG, ElementType.FILTER]}
                equipmentTypes={[EQUIPMENT_TYPES.VOLTAGE_LEVEL]}
                title={intl.formatMessage({
                    id: 'AddFromGridexplore',
                })}
                multiSelect={false}
            />
            {!mapOpen && (
                <TopBarEquipmentSearchDialog
                    showVoltageLevelDiagram={onSearch}
                    isDialogSearchOpen={isDialogSearchOpen}
                    setIsDialogSearchOpen={setIsDialogSearchOpen}
                    disablCenterSubstation={true}
                />
            )}
        </Box>
    );
};

export default DiagramGridHeader;
