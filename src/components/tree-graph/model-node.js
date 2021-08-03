const ModelNode = {

    draw(cfg, group) {
        // If there is style object in cfg, it should be mixed here
        const keyShape = group.addShape('rect', {
            attrs: {
                x: -75,
                y: -25,
                width: 150,
                height: 50,
                fillOpacity: 1,
                fill: '#83a0c8',
                radius: 3,
            },
            // must be assigned in G6 3.3 and later versions. it can be any value you want
            name: 'rect-shape',
            // allow the shape to response the drag events
            draggable: true,
        });
        if (cfg.label) {
            group.addShape('text', {
                attrs: {
                    x: 0, // center
                    y: 0,
                    textAlign: 'center',
                    textBaseline: 'middle',
                    text: cfg.label,
                    fill: 'white',
                },
                // must be assigned in G6 3.3 and later versions. it can be any value you want
                name: 'text-shape',
                // allow the shape to response the drag events
                draggable: true,
            });
        }
        if (cfg.hypos) {
            cfg.hypos.map((hypo, index) => {
                group.addShape('text', {
                    attrs: {
                        x: 0, // center
                        y: index * 20 + 30,
                        textAlign: 'center',
                        textBaseline: 'middle',
                        text: hypo,
                        fill: 'white',
                    },
                    // must be assigned in G6 3.3 and later versions. it can be any value you want
                    name: 'text-shape',
                    // allow the shape to response the drag events
                    draggable: true,
                });
            })
        }
        return keyShape;
    },
};

export default ModelNode;
