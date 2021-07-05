import React, {useEffect} from "react";
import ReactDOM from 'react-dom';
import G6 from "@antv/g6";

const Tree = ({data}) => {
    const ref = React.useRef(null);
    let graph = null;

    useEffect(() => {
        if (!graph) {
            graph = new G6.TreeGraph({
                container: ReactDOM.findDOMNode(ref.current),
                width: 1200,
                height: 800,
                modes: {
                    default: ['drag-canvas', 'zoom-canvas'],
                    edit: ['click-select'],
                },
                layout: {
                    type: 'compactBox',
                    direction: 'TB', // H / V / LR / RL / TB / BT
                    nodeSep: 50,
                    rankSep: 100,
                },
                defaultNode: {
                    type: 'node',
                    labelCfg: {
                        style: {
                            fill: '#000000A6',
                            fontSize: 10,
                        },
                    },
                    style: {
                        stroke: '#72CC4A',
                        width: 150,
                    },
                },
                defaultEdge: {
                    type: 'polyline',
                },
            });
        }
        graph.data(data);
        graph.render();
    }, []);

    return (<div ref={ref}/>);
};

export default Tree;