var TimeKnots = {
    draw: function (id, events, options, showEvent) {
        'use strict';

        for (var i = 0; i < events.length; i++) events[i].pos = i;

        var blocks = events.filter(function (x) {
            return x.events !== undefined;
        });
        var labels = events.filter(function (x) {
            return x.events === undefined;
        });

        var cfg = {
            width: 600,
            height: 200,
            radius: 10,
            lineWidth: 4,
            color: "#999",
            background: "#FFF",
            dateFormat: "%Y/%m/%d %H:%M:%S",
            horizontalLayout: true,
            showLabels: false,
            labelFormat: "%Y/%m/%d %H:%M:%S",
            addNow: false,
            seriesColor: d3.scale.category20(),
            dateDimension: true
        };
        var d3selection, dataSelection;

        //default configuration override
        if (options !== undefined) {
            for (var i in options) {
                cfg[i] = options[i];
            }
            cfg.width = $(id).width();
        }
        if (cfg.addNow !== false) {
            events.push({
                date: new Date(),
                name: cfg.addNowLabel || "Today"
            });
        }
        var svg = d3.select(id).append('svg').attr("width", cfg.width).attr("height", cfg.height);


        var margin = (cfg.radius) * 1.5 + cfg.lineWidth;
        var step = (((cfg.horizontalLayout) ? cfg.width : cfg.height) - 2 * margin) / (events.length);

        //CIRCLE ANIMATIONS foldstart
        var translateCircle = function (circle, x, duration) {
            if (duration === undefined) duration = 600;
            circle.transition("translation")
                .duration(duration)
                .attr("transform", "translate(" + x + ",0)");
        };

        var selectCircle = function (on, filled) {
            return function (circle) {
                circle.transition("select")
                    .duration(200)
                    .style("fill", function () {
                        if (filled) {
                            return cfg.color;
                        } else {
                            return cfg.background;
                        }
                    })
                    .attr("r", function (d) {
                        return Math.floor(cfg.radius * (on ? 1.5 : 1));
                    });
            };
        };
        //foldend

        var positionToX = function (time) {
            return time * 80;
        };

        svg.selectAll("line")
            .data(labels).enter().append("line")
            .each(function (d) {
                events[d.pos].d3 = this;
            })
            .attr("x1", function (d) {
                return positionToX(d.pos);
            })
            .attr("x2", function (d) {
                return positionToX(d.pos);
            })
            .attr("y1", Math.floor(cfg.height / 2) - cfg.radius)
            .attr("y2", Math.floor(cfg.height / 2) + cfg.radius)
            .style("stroke", cfg.color)
            .style("stroke-width", function (d) {
                return cfg.lineWidth;
            })
            .style("stroke-linecap", "round")
            .attr("class", "timeline-event");

        svg.append("line")
            .style("stroke", cfg.color)
            .style("stroke-width", cfg.lineWidth)
            .attr("x1", 0)
            .attr("y1", cfg.height / 2)
            .attr("x2", cfg.width)
            .attr("y2", cfg.height / 2);


        //CIRCLES POSITiON foldstart
        svg.selectAll("circle")
            .data(blocks).enter()
            .append("circle")
            .each(function (d) {
                events[d.pos].d3 = this;
            })
            .attr("class", "timeline-event")
            .attr("r", cfg.radius)
            .style("stroke", cfg.color)
            .style("stroke-width", cfg.lineWidth)
            .style("fill", cfg.background)
            .attr("cy", Math.floor(cfg.height / 2))
            .attr("cx", function (d) {
                return positionToX(d.pos);
                //foldend
                //CIRCLE EVENTS foldstart
            })
            .on("mouseover", function (d) {
                d3.select(this).call(selectCircle(true, (this === d3selection)));
            })
            .on("mouseout", function () {
                if (this !== d3selection)
                    d3.select(this).call(selectCircle(false, false));
            }).on("mousedown", function (d) {
                var xPos = -positionToX(d.pos) + cfg.width / 2;
                if (d3selection !== undefined) {
                    d3.select(d3selection).call(selectCircle(false, false));
                }
                d3selection = this;
                dataSelection = d;
                d3.select(this)
                    .call(selectCircle(true, true));
                d3.selectAll(".timeline-event,.timeline-label").call(translateCircle, xPos);
                showEvent(d.pos);
            });
        //foldend
        //TIME LABELS foldstart
        svg.selectAll("text")
            .data(events).enter()
            .append("text")
            .attr("class", "timeline-label")
            .text(function (d) {
                if (d.label !== undefined) return d.label;
                return d3.time.format(cfg.labelFormat)(new Date(d.time));
            })
            .style("font-weight", function (d) {
                return (d.label === undefined) ? "normal" : "bold";
            })
            .style("font-size", "100%")
            .attr("x", function (d) {
                return positionToX(d.pos) - this.getBBox().width / 2;
            })
            .attr("y", function (d) {
                return Math.floor(cfg.height / 2 - (margin / 2 + this.getBBox().height));
            });
        //foldend

        //počáteční pozice
        d3.selectAll(".timeline-event,.timeline-label")
            .call(translateCircle, cfg.width / 2 - (positionToX(events.length) / 2), 0);

        document.onkeydown = function (e) {
            if (d3selection === undefined) return;
            var nextPos = dataSelection.pos;
            if (e.keyCode == '37') { //L
                do {
                    if (nextPos === 0) return;
                    nextPos--;
                } while (events[nextPos].events === undefined);
            } else if (e.keyCode == '39') { //R
                do {
                    if (nextPos === events.length - 1) return;
                    nextPos++;
                } while (events[nextPos].events === undefined);
            }
            d3.select(d3selection).call(selectCircle(false, false));
            d3selection = events[nextPos].d3;
            dataSelection = events[nextPos];
            d3.select(d3selection)
                .call(selectCircle(true, true));
            var xPos = -positionToX(dataSelection.pos) + cfg.width / 2;
            d3.selectAll(".timeline-event,.timeline-label").call(translateCircle, xPos, 200);
            showEvent(nextPos);
        }
    }
};
