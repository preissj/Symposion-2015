var TimeKnots = {
    draw: function (id, events, showEvent) {
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
            radius: 15,
            lineWidth: 4,
            color: "#66D",
            background: "#FFF",
            dateFormat: "%Y/%m/%d %H:%M:%S",
            horizontalLayout: true,
            showLabels: false,
            labelFormat: "%Y/%m/%d %H:%M:%S",
            addNow: false,
            seriesColor: d3.scale.category20(),
            dateDimension: true,
            step: 80,
            hoveredCoef: 1.5,
            selectedCoef: 1.5,
            minPadding: 70,
            scrollBound: 1000,
            labelHeight: 15,
            translateDuration: 400,
        };
        var inTransition = false;
        var lastX = 0;
        var d3selection, dataSelection;
        var calculateWidths = function () {
            cfg.width = $(id).width();
            cfg.margin = (cfg.radius) * 1.6 + cfg.lineWidth;
            cfg.step = (Math.max(cfg.scrollBound, cfg.width) - 2 * cfg.margin) / (events.length);
        };
        calculateWidths();
        var positionToX = function (time) {
            return time * cfg.step;
        };
        if (cfg.addNow !== false) {
            events.push({
                date: new Date(),
                name: cfg.addNowLabel || "Today"
            });
        }
        var svg = d3.select(id).append('svg').attr("width", cfg.width).attr("height", cfg.height);
        //CIRCLE ANIMATIONS foldstart
        var translateCircle = function (circle, x, duration) {
            if (duration === undefined) duration = cfg.translateDuration;
            circle.transition("translation")
                .duration(duration)
                .attr("transform", "translate(" + x + ",0)")
                .each("end", function () {
                    inTransition = false;
                });
        };

        var toBounds = function (x) {
            var res = Math.min(cfg.margin, x);
            res = Math.max(cfg.width - positionToX(events.length), res);
            return res;
        };

        var translateAll = function (x, duration) {
            if (cfg.width >= cfg.scrollBound) return;
            inTransition = true;
            x = toBounds(x);
            d3.selectAll(".timeline-event,.timeline-label")
                .call(translateCircle, x, duration);
            lastX = x;
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
                    .attr("r", Math.floor(cfg.radius * (on ? (filled ? cfg.selectedCoef : cfg.hoveredCoef) : 1)));
            };
        };
        //foldend

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

        var axisLine = svg.append("line")
            .style("stroke", cfg.color)
            .style("stroke-width", cfg.lineWidth)
            .attr("class", "axis-line")
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
                translateAll(xPos);
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
                return d.time;
            })
            .style("font-weight", function (d) {
                return (d.label === undefined) ? "normal" : "bold";
            })
            .style("font-size", "100%")
            .attr("x", function (d) {
                return positionToX(d.pos) - this.getBBox().width / 2;
            })
            .attr("y", function (d) {
                return Math.floor(cfg.height / 2 - (cfg.labelHeight + this.getBBox().height));
            });
        //foldend

        //počáteční pozice
        var resetPositions = function () {
            var x = (cfg.margin < cfg.scrollBound) ? (positionToX(0.75)) : (cfg.width / 2 - (positionToX(events.length - 1) / 2));
            x = toBounds(x);
            d3.selectAll(".timeline-event,.timeline-label").call(translateCircle, x, 0);
            lastX = x;
        };
        resetPositions();

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
            translateAll(xPos, 200);
            showEvent(nextPos);
        };
        $(window).resize(function () {
            calculateWidths();
            svg.attr("width", cfg.width);
            axisLine.attr("x2", cfg.width);
            svg.selectAll(".timeline-event")
                .attr("x1", function (d) {
                    return positionToX(d.pos);
                })
                .attr("x2", function (d) {
                    return positionToX(d.pos);
                })
                .attr("cx", function (d) {
                    return positionToX(d.pos);
                });
            svg.selectAll(".timeline-label")
                .attr("x", function (d) {
                    return positionToX(d.pos) - this.getBBox().width / 2;
                });
            resetPositions();
        });

        var drag = d3.behavior.drag()
            .on("drag", dragmove).on("dragstart", dragstart);
        //.on("touchmove", dragmove).on("touchstart", dragstart);

        svg.call(drag);

        var moved = 0; //record the translate x moved by the g which contains the bars.
        var dragStartX = 0; //record teh point from where the drag started
        var oldTranslateX = 0;
        var discard = false;

        function dragstart(d) {
            d3.event.sourceEvent.stopPropagation();
            if (inTransition) {
                discard = true;
                return;
            }
            discard = false;
            oldTranslateX = lastX;
            dragStartX = undefined;
            $("#debugdiv").html("");
        }

        function dragmove(d) {
            d3.event.sourceEvent.stopPropagation();
            if (discard) return;
            if (dragStartX === undefined) dragStartX = d3.event.x;
            translateAll(d3.event.x - dragStartX + oldTranslateX, 0);
            moved = toBounds(moved);
        };
    }
};
