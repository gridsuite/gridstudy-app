/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, {useEffect} from 'react';
import {useDispatch, useSelector} from "react-redux";

import Grid from '@material-ui/core/Grid';
import {makeStyles} from "@material-ui/core/styles";
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardContent from '@material-ui/core/CardContent';
import Container from '@material-ui/core/Container';
import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add';

import {ReactComponent as PowsyblLogo} from '../images/powsybl_logo.svg';
import {ReactComponent as EntsoeLogo} from '../images/entsoe_logo.svg';
import {ReactComponent as UcteLogo} from '../images/ucte_logo.svg';
import {ReactComponent as IeeeLogo} from '../images/ieee_logo.svg';
import {loadStudiesSuccess} from '../redux/actions';
import {fetchStudies} from '../utils/rest-api';
import {FormattedMessage} from "react-intl";

const useStyles = makeStyles(theme => ({
    addButton: {
        margin: theme.spacing(2),
    },
    addIcon: {
        marginRight: theme.spacing(1),
    },
    card: {
        display: 'flex',
    },
    grid: {
        flexGrow: 1,
        paddingLeft: theme.spacing(2)
    },
    logo: {
        width: 64,
        height: 64,
    },
}));

const StudyCard = (props) => {

    const classes = useStyles();

    function logo(caseFormat) {
        switch (caseFormat) {
            case 'XIIDM':
                return <PowsyblLogo className={classes.logo}/>
            case 'CGMES':
                return <EntsoeLogo className={classes.logo}/>
            case 'UCTE':
                return <UcteLogo className={classes.logo}/>
            case 'IEEE-CDF':
                return <IeeeLogo className={classes.logo}/>
            default:
                break;
        }
    }

    return (
        <Card>
            <CardActionArea onClick={() => props.onClick()} className={classes.card}>
                <div>
                    <CardContent>
                        <Typography variant="h4">
                            {props.study.studyName}
                        </Typography>
                        <Typography component="p">
                            {props.study.description}
                        </Typography>
                    </CardContent>
                </div>
                { logo(props.study.caseFormat) }
            </CardActionArea>
        </Card>
    );
};

const StudyManager = (props) => {

    const dispatch = useDispatch();

    useEffect(() => {
        fetchStudies()
            .then(studies => {
                dispatch(loadStudiesSuccess(studies));
            });
    }, []);

    const studies = useSelector(state => state.studies);

    const classes = useStyles();

    function newStudy() {
        // TODO
    }

    return (
        <Container maxWidth="lg">
            <Button variant="contained" color="primary" className={classes.addButton} onClick={() => newStudy() }>
                <AddIcon className={classes.addIcon}/>
                <FormattedMessage id="newStudy"/>
            </Button>
            <Grid container spacing={2} className={classes.grid}>
            {
                studies.map(study =>
                    <Grid item xs={3} key={study.studyName}>
                        <StudyCard study={study} onClick={() => props.onStudyClick(study.studyName)}/>
                    </Grid>
                )
            }
            </Grid>
        </Container>
    );
};

export default StudyManager;
