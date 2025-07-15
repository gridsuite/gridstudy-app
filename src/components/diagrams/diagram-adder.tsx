/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { forwardRef, useState, Ref, MouseEventHandler, TouchEventHandler } from 'react';
import { Box, IconButton, Theme, Tooltip } from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import { UUID } from 'crypto';
import { Search, Public, Upload, Save } from '@mui/icons-material';
import {
    DirectoryItemSelector,
    ElementType,
    EquipmentInfos,
    mergeSx,
    TreeViewFinderNodeProps,
} from '@gridsuite/commons-ui';
import { TopBarEquipmentSearchDialog } from 'components/top-bar-equipment-seach-dialog/top-bar-equipment-search-dialog';

const styles = {
    card: (theme: Theme) => ({
        display: 'flex',
        flexDirection: 'column',
    }),
    adderContent: (theme: Theme) => ({
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.palette.mode === 'light' ? theme.palette.background.paper : theme.palette.grey[900],
        borderRadius: theme.spacing(2),
        border:
            theme.palette.mode === 'light'
                ? `1px solid ${theme.palette.grey[500]}`
                : `1px solid ${theme.palette.grey[800]}`,
    }),
};

interface ReactGridLayoutCustomChildComponentProps {
    style?: React.CSSProperties;
    className?: string;
    onMouseDown?: MouseEventHandler<HTMLElement>;
    onMouseUp?: MouseEventHandler<HTMLElement>;
    onTouchEnd?: TouchEventHandler<HTMLElement>;
    children?: React.ReactNode;
}

interface DiagramAdderProps extends ReactGridLayoutCustomChildComponentProps {
    onLoad: (elementUuid: UUID, elementType: ElementType, elementName: string) => void;
    onSearch: (element: EquipmentInfos) => void;
    onLayoutSave: () => void;
    onMap?: () => void;
    key: string;
}

export const DiagramAdder = forwardRef((props: DiagramAdderProps, ref: Ref<HTMLDivElement>) => {
    const { onLoad, onSearch, onMap, onLayoutSave, ...reactGridLayoutCustomChildComponentProps } = props;
    const { style, children, ...otherProps } = reactGridLayoutCustomChildComponentProps;

    const intl = useIntl();

    const [isLoadSelectorOpen, setIsLoadSelectorOpen] = useState(false);
    const [isDialogSearchOpen, setIsDialogSearchOpen] = useState(false);

    const selectElement = (selectedElements: TreeViewFinderNodeProps[]) => {
        if (selectedElements.length > 0 && selectedElements[0].type) {
            onLoad(selectedElements[0].id, selectedElements[0].type, selectedElements[0].name);
        }
        setIsLoadSelectorOpen(false);
    };

    return (
        <Box sx={mergeSx(style, styles.card)} ref={ref} {...otherProps}>
            <Box sx={styles.adderContent}>
                <FormattedMessage id="AddNewCard" />
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Tooltip title={<FormattedMessage id="AddFromGridexplore" />}>
                        <IconButton onClick={() => setIsLoadSelectorOpen(true)}>
                            <Upload />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={<FormattedMessage id="equipment_search/label" />}>
                        <IconButton onClick={() => setIsDialogSearchOpen(true)}>
                            <Search />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={<FormattedMessage id="OpenMapCard" />}>
                        <span>
                            <IconButton disabled={!onMap} onClick={onMap}>
                                <Public />
                            </IconButton>
                        </span>
                    </Tooltip>
                    <Tooltip title={<FormattedMessage id="SaveGridLayout" />}>
                        <IconButton onClick={() => onLayoutSave()}>
                            <Save />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>
            <DirectoryItemSelector
                open={isLoadSelectorOpen}
                onClose={selectElement}
                types={[ElementType.DIAGRAM_CONFIG, ElementType.FILTER]}
                title={intl.formatMessage({
                    id: 'AddFromGridexplore',
                })}
                multiSelect={false}
            />
            <TopBarEquipmentSearchDialog
                showVoltageLevelDiagram={onSearch}
                isDialogSearchOpen={isDialogSearchOpen}
                setIsDialogSearchOpen={setIsDialogSearchOpen}
                disableEventSearch
            />
            {children}
        </Box>
    );
});

export default DiagramAdder;
