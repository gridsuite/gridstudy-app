import React from 'react';
import Tree from 'react-d3-tree';
import orgChartJson from '../data/poc-hypos-data.json';
import { useCallback, useState } from 'react';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';

const containerStyles = {
    width: '100vw',
    height: '100vh',
};

const useStyles = makeStyles((theme) => ({
    rootPaper: {
        background: '#83a0c8',
    },
    nodePaper: {
        background: 'grey',
    },
}));

const useCenteredTree = () => {
    const [translate, setTranslate] = useState({ x: 0, y: 0 });
    const containerRef = useCallback((containerElem) => {
        if (containerElem !== null) {
            const { width, height } = containerElem.getBoundingClientRect();
            setTranslate({ x: width / 2, y: height / 2 });
        }
    }, []);
    return [translate, containerRef];
};

function Root(props) {
    const classes = useStyles();
    let rootForeignObjectProps = { ...props.foreignObjectProps };
    rootForeignObjectProps.width = 100;
    rootForeignObjectProps.x = -50;
    return (
        <foreignObject {...rootForeignObjectProps}>
            <Paper
                variant="outlined"
                elevation={1}
                className={classes.rootPaper}
            >
                <Button
                    variant="contained"
                    color="primary"
                    onClick={props.toggleNode}
                    disableElevation
                >
                    {props.nodeDatum.name}
                </Button>
            </Paper>
        </foreignObject>
    );
}

function Node(props) {
    const classes = useStyles();
    let nodeForeignObjectProps = { ...props.foreignObjectProps };
    nodeForeignObjectProps.width = 200;
    nodeForeignObjectProps.height = 100;
    nodeForeignObjectProps.y = -100;
    return (
        <>
            <circle r={10} onClick={props.toggleNode} />
            <foreignObject {...nodeForeignObjectProps}>
                <Paper
                    variant="outlined"
                    elevation={1}
                    className={classes.nodePaper}
                >
                    {props.nodeDatum.hypos.map((hyp) => (
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={props.toggleNode}
                            fullWidth
                        >
                            {hyp}
                        </Button>
                    ))}
                </Paper>
            </foreignObject>
        </>
    );
}

// Here we're using `renderCustomNodeElement` render a component that uses
// both SVG and HTML tags side-by-side.
// This is made possible by `foreignObject`, which wraps the HTML tags to
// allow for them to be injected into the SVG namespace.
const renderForeignObjectNode = ({
    nodeDatum,
    toggleNode,
    foreignObjectProps,
}) => {
    return (
        <g>
            {nodeDatum.__rd3t.depth === 0 && (
                <Root
                    nodeDatum={nodeDatum}
                    toggleNode={toggleNode}
                    foreignObjectProps={foreignObjectProps}
                />
            )}
            {nodeDatum.__rd3t.depth > 0 && (
                <Node
                    nodeDatum={nodeDatum}
                    toggleNode={toggleNode}
                    foreignObjectProps={foreignObjectProps}
                />
            )}
        </g>
    );
};

const HypothesisTree = (props) => {
    const [translate, containerRef] = useCenteredTree();
    const nodeSize = { x: 250, y: 200 };
    const foreignObjectProps = {
        width: nodeSize.x,
        height: nodeSize.y,
        x: -100,
        y: 0,
    };

    const customPathFunc = (linkDatum, orientation) => {
        const { source, target } = linkDatum;
        return orientation === 'horizontal'
            ? // ? `M${source.y},${source.x}L${target.y-source.y*3/5},${source.x}Q${target.y},${source.x},${target.y},${target.x}`
              // : `M${source.x},${source.y}L${target.x-source.x*3/5},${source.y}Q${target.x},${source.y},${target.x},${target.y}`;
              `M${source.y},${source.x}L${
                  source.y + ((target.y - source.y) * 9) / 10
              },${source.x}Q${target.y},${source.x},${target.y},${target.x}`
            : `M${source.x},${source.y}L${
                  source.x + ((target.x - source.x) * 9) / 10
              },${source.y}Q${target.x},${source.y},${target.x},${target.y}`;
    };

    return (
        <div style={containerStyles} ref={containerRef}>
            <Tree
                data={orgChartJson}
                translate={translate}
                nodeSize={nodeSize}
                renderCustomNodeElement={(rd3tProps) =>
                    renderForeignObjectNode({
                        ...rd3tProps,
                        foreignObjectProps,
                    })
                }
                orientation="vertical"
                pathFunc={customPathFunc}
            />
        </div>
    );
};

export default HypothesisTree;
