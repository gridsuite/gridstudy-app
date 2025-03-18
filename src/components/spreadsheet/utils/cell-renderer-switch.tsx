import React, { useState, useCallback } from 'react';
import { Switch, Tooltip } from '@mui/material';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { setModificationActivated } from 'services/study/network-modifications';
import { useSelector } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { AppState } from 'redux/reducer';

const CellRendererSwitch = (props: any) => {
    const { data, api, colDef, node } = props; // Access grid context
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const [isLoading, setIsLoading] = useState(false);
    const { snackError } = useSnackMessage();

    const modificationUuid = data?.modificationInfos?.uuid; // Get the UUID of the modification
    const modificationActivated = data?.modificationInfos?.activated; // Check if the modification is activated

    const updateModification = useCallback(
        (activated: boolean) => {
            setModificationActivated(studyUuid, currentNode?.id, modificationUuid, activated)
                .catch((err) => {
                    snackError({ messageTxt: err.message, messageId: 'networkModificationActivationError' });
                })
                .finally(() => {
                    setIsLoading(false);
                });
        },
        [studyUuid, currentNode?.id, modificationUuid, snackError]
    );

    const toggleModificationActive = useCallback(() => {
        setIsLoading(true);
        const updatedActivated = !modificationActivated;

        // Update the grid data with the new activated status
        api.stopEditing(); // Stop editing mode
        node.setDataValue(colDef.field, updatedActivated); // Set the new value in the grid data

        // Trigger the API to update the state on the server (or whatever data source you're using)
        updateModification(updatedActivated);
    }, [modificationActivated, updateModification, api, node, colDef.field]);

    return (
        <Tooltip title={<FormattedMessage id={modificationActivated ? 'disable' : 'enable'} />} arrow>
            <span>
                <Switch
                    size="small"
                    disabled={isLoading}
                    checked={modificationActivated}
                    onClick={toggleModificationActive} // Handle toggle
                />
            </span>
        </Tooltip>
    );
};

export default CellRendererSwitch;
