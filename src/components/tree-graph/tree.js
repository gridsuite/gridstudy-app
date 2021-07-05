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
                fitView: true,
                linkCenter: true,
                modes: {
                    default: [
                        {
                            type: 'collapse-expand',
                            onChange: function onChange(item, collapsed) {
                                const data = item.getModel();
                                data.collapsed = collapsed;
                                return true;
                            },
                        },
                        'drag-canvas',
                        'zoom-canvas',
                    ],
                },
                defaultNode: {
                    type: 'rect',
                    size: [100,20],
                    anchorPoints: [
                        [0, 0],
                        [1, 1],
                    ],
                },
                defaultEdge: {
                    type: 'cubic-vertical',
                },
                layout: {
                    type: 'compactBox',
                    direction: 'TB',
                    getId: function getId(d) {
                        return d.id;
                    },
                    getHeight: function getHeight() {
                        return 16;
                    },
                    getWidth: function getWidth() {
                        return 16;
                    },
                    getVGap: function getVGap() {
                        return 30;
                    },
                    getHGap: function getHGap() {
                        return 50;
                    },
                },
            });
        }
        graph.data(data);
        graph.render();
    }, []);

    return (<div ref={ref}/>);
};

export default Tree;