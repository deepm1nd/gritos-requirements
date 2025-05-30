// requirements_web_frontend/src/components/RelationshipGraph.jsx
import { h } from 'preact';
import { useEffect, useRef, useMemo } from 'preact/hooks';
import * as d3 from 'd3';

const RelationshipGraph = ({ graphData }) => {
    const svgRef = useRef(null);
    const tooltipRef = useRef(null);

    // Memoize processed data to avoid re-computation if graphData reference is stable
    const processedNodes = useMemo(() => graphData.nodes.map(n => ({ ...n })), [graphData.nodes]);
    const processedLinks = useMemo(() => graphData.links.map(l => ({ ...l })), [graphData.links]);

    useEffect(() => {
        if (!svgRef.current || !graphData || !processedNodes.length) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove(); // Clear previous render

        const parent = svgRef.current.parentElement;
        const width = parent.clientWidth;
        const height = parent.clientHeight || 600; // Default height if parent has no intrinsic height

        svg.attr('width', width).attr('height', height);
        // svg.attr('viewBox', [-width / 2, -height / 2, width, height]); // Alternative viewBox approach

        // Tooltip div
        const tooltip = d3.select(tooltipRef.current);

        // --- Simulation ---
        const simulation = d3.forceSimulation(processedNodes)
            .force("link", d3.forceLink(processedLinks).id(d => d.id).distance(100).strength(0.5))
            .force("charge", d3.forceManyBody().strength(-400))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("collide", d3.forceCollide().radius(d => (d.type === 'External/Block' ? 20 : 30) + 5).iterations(2)); // Radius based on type + padding

        // --- Markers for directed links ---
        svg.append('defs').selectAll('marker')
            .data(['end']) // Different marker types can be defined here
            .enter().append('marker')
            .attr('id', String)
            .attr('viewBox', '0 -5 10 10')
            .attr('refX', 22) // Adjust based on node radius + desired gap
            .attr('refY', 0)
            .attr('markerWidth', 6)
            .attr('markerHeight', 6)
            .attr('orient', 'auto')
            .append('path')
            .attr('d', 'M0,-5L10,0L0,5')
            .attr('fill', '#999');

        // --- Main graph group for zoom ---
        const g = svg.append("g").attr("class", "everything");

        // --- Links ---
        const link = g.append("g")
            .attr("class", "links")
            .selectAll("line")
            .data(processedLinks)
            .join("line")
            .attr("stroke", "#999")
            .attr("stroke-opacity", 0.6)
            .attr("stroke-width", 1.5)
            .attr("marker-end", "url(#end)");

        // --- Link Labels ---
        const linkLabel = g.append("g")
            .attr("class", "link-labels")
            .selectAll(".link-label")
            .data(processedLinks)
            .join("text")
            .attr("class", "link-label")
            .style("font-size", "8px")
            .style("fill", "#555")
            .style("pointer-events", "none")
            .text(d => d.type);

        // --- Nodes ---
        const nodeColor = (d) => {
            if (d.type === 'Functional') return '#63b3ed'; // Blue
            if (d.type === 'Non-Functional') return '#f6ad55'; // Orange
            if (d.type === 'External/Block') return '#a0aec0'; // Gray
            if (d.type === 'SYS' || d.type === 'BLK') return '#718096'; // Darker Gray for SysML
            return '#cbd5e0'; // Default
        };

        const node = g.append("g")
            .attr("class", "nodes")
            .selectAll("circle")
            .data(processedNodes)
            .join("circle")
            .attr("r", d => d.type === 'External/Block' ? 12 : 18) // Smaller radius for external/blocks
            .attr("fill", nodeColor)
            .attr("stroke", "#fff")
            .attr("stroke-width", 1.5);

        // --- Node Labels ---
        const nodeLabel = g.append("g")
            .attr("class", "node-labels")
            .selectAll(".node-label")
            .data(processedNodes)
            .join("text")
            .attr("class", "node-label")
            .text(d => d.name || d.id)
            .attr("text-anchor", "middle")
            .attr("dy", d => (d.type === 'External/Block' ? -16 : -22)) // Position above node
            .style("font-size", "10px")
            .style("fill", "#333")
            .style("pointer-events", "none");

        // --- Tooltip Events for Nodes ---
        node.on('mouseover', (event, d) => {
            tooltip.transition().duration(200).style('opacity', .9);
            tooltip.html(
                `<strong>ID:</strong> ${d.id}<br/>` +
                `<strong>Name:</strong> ${d.name || 'N/A'}<br/>` +
                `<strong>Type:</strong> ${d.type || 'N/A'}<br/>` +
                `<strong>Status:</strong> ${d.status || 'N/A'}`
            )
            .style('left', (event.pageX + 15) + 'px')
            .style('top', (event.pageY - 28) + 'px');
        })
        .on('mouseout', () => {
            tooltip.transition().duration(500).style('opacity', 0);
        });
        
        // --- Tooltip Events for Links ---
        link.on('mouseover', (event, d) => {
            tooltip.transition().duration(200).style('opacity', .9);
            const sourceNode = processedNodes.find(n => n.id === d.source.id || n.id === d.source);
            const targetNode = processedNodes.find(n => n.id === d.target.id || n.id === d.target);
            tooltip.html(
                `<strong>Type:</strong> ${d.type}<br/>` +
                `<strong>From:</strong> ${sourceNode?.name || d.source.id || d.source}<br/>` +
                `<strong>To:</strong> ${targetNode?.name || d.target.id || d.target}`
            )
            .style('left', (event.pageX + 15) + 'px')
            .style('top', (event.pageY - 28) + 'px');
        })
        .on('mouseout', () => {
            tooltip.transition().duration(500).style('opacity', 0);
        });


        // --- Drag Functionality ---
        const drag = d3.drag()
            .on("start", (event, d) => {
                if (!event.active) simulation.alphaTarget(0.3).restart();
                d.fx = d.x;
                d.fy = d.y;
            })
            .on("drag", (event, d) => {
                d.fx = event.x;
                d.fy = event.y;
            })
            .on("end", (event, d) => {
                if (!event.active) simulation.alphaTarget(0);
                d.fx = null;
                d.fy = null;
            });
        node.call(drag);

        // --- Zoom Functionality ---
        const zoom = d3.zoom()
            .scaleExtent([0.1, 4])
            .on("zoom", (event) => {
                g.attr("transform", event.transform);
            });
        svg.call(zoom);
        
        // Initial zoom to fit (optional, can be tricky to get right)
        // Example: svg.call(zoom.transform, d3.zoomIdentity.translate(width/2, height/2).scale(0.5).translate(-width/2, -height/2));


        // --- Tick Function for Simulation ---
        simulation.on("tick", () => {
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            node
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);

            nodeLabel
                .attr("x", d => d.x)
                .attr("y", d => d.y + (d.type === 'External/Block' ? -16 : -22)); // Keep label above node during simulation

            linkLabel
                .attr("x", d => (d.source.x + d.target.x) / 2)
                .attr("y", d => (d.source.y + d.target.y) / 2);
        });

        // Resize observer for responsiveness
        const resizeObserver = new ResizeObserver(() => {
            const newWidth = parent.clientWidth;
            const newHeight = parent.clientHeight || 600;
            svg.attr('width', newWidth).attr('height', newHeight);
            simulation.force("center", d3.forceCenter(newWidth / 2, newHeight / 2)).restart();
        });
        resizeObserver.observe(parent);

        return () => {
            simulation.stop();
            resizeObserver.unobserve(parent);
        };

    }, [graphData, processedNodes, processedLinks]); // Rerun effect if graphData changes

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <svg ref={svgRef} style={{ display: 'block' }}></svg>
            <div 
                ref={tooltipRef} 
                className="tooltip bg-gray-700 text-white p-2 rounded-md shadow-lg text-xs"
                style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
            ></div>
        </div>
    );
};

export default RelationshipGraph;
