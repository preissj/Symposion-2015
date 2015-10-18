var TimeKnots = {
    draw: function (id, events, options, showEvent) {
        'use strict';
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
        
        
        //Calculate times in terms of timestamps
        var minValue, maxValue, timestamps;
        if (!cfg.dateDimension) {
            timestamps = events.map(function (d) {
                return d.value;
            }); //new Date(d.date).getTime()});
            maxValue = d3.max(timestamps);
            minValue = d3.min(timestamps);
        } else {
            timestamps = events.map(function (d) {
                return Date.parse(d.date);
            }); //new Date(d.date).getTime()});
            maxValue = d3.max(timestamps);
            minValue = d3.min(timestamps);
        }
        var margin = (d3.max(events.map(function (d) {
            return d.radius;
        })) || cfg.radius) * 1.5 + cfg.lineWidth;
        var step = (((cfg.horizontalLayout) ? cfg.width : cfg.height) - 2 * margin) / (maxValue - minValue);
        var series = [];
        if (maxValue == minValue) {
            step = 0;
            if (cfg.horizontalLayout) {
                margin = cfg.width / 2;
            } else {
                margin = cfg.height / 2;
            }
        }
        var xscale = d3.scale.linear().domain([minValue, maxValue]).range([minValue, maxValue]);
        var zoom = d3.behavior.zoom().scaleExtent([1, 1]).x(xscale)
        .on('zoom', function() {
            svg.selectAll('circle').attr("cx", function (d) {
                if (cfg.horizontalLayout) {
                    var datum = (cfg.dateDimension) ? new Date(d.date).getTime() : d.value;
                    var x = step * (datum - minValue) + margin;
                    return xscale(x);
                }
                return cfg.width / 2;
            });
        });
        //svg.call(zoom);
        
        svg.append("line")
            .style("stroke", cfg.color)
            .style("stroke-width", cfg.lineWidth)
            .attr("x1", 0)
            .attr("y1", cfg.height / 2)
            .attr("x2", cfg.width)
            .attr("y2", cfg.height / 2);

        //CIRCLE ANIMATIONS foldstart
        var translateCircle = function (circle, x) {
            circle.transition("translation")
                .duration(600)
                .attr("transform", "translate(" + x + ",0)");
        };

        var selectCircle = function (on, filled) {
            return function (circle) {
                circle.transition("select")
                    .duration(200)
                    .style("fill", function (d) {
                        if (filled) {
                            return (d.color !== undefined) ? d.color : cfg.color;
                        } else {
                            return (d.color !== undefined) ? d.background : cfg.background;
                        }
                    })
                    .attr("r", function (d) {
                        var coef = on ? 1.5 : 1;
                        if (d.radius !== undefined) {
                            return Math.floor(d.radius * coef);
                        }
                        return Math.floor(cfg.radius * coef);
                    });
            };
        };
        //foldend

        //CIRCLES POSITiON foldstart
        svg.selectAll("circle")
            .data(events).enter()
            .append("circle")
            .attr("class", "timeline-event")
            .attr("r", function (d) {
                if (d.radius !== undefined) {
                    return d.radius;
                }
                return cfg.radius;
            })
            .style("stroke", function (d) {
                if (d.color !== undefined) {
                    return d.color;
                }
                if (d.series !== undefined) {
                    if (series.indexOf(d.series) < 0) {
                        series.push(d.series);
                    }
                    console.log(d.series, series, series.indexOf(d.series));
                    return cfg.seriesColor(series.indexOf(d.series));
                }
                return cfg.color;
            })
            .style("stroke-width", function (d) {
                if (d.lineWidth !== undefined) {
                    return d.lineWidth;
                }
                return cfg.lineWidth;
            })
            .style("fill", function (d) {
                if (d.background !== undefined) {
                    return d.background;
                }
                return cfg.background;
            })
            .attr("cy", function (d) {
                if (cfg.horizontalLayout) {
                    return Math.floor(cfg.height / 2);
                }
                var datum = (cfg.dateDimension) ? new Date(d.date).getTime() : d.value;
                return Math.floor(step * (datum - minValue) + margin);
            })
            .attr("cx", function (d) {
                if (cfg.horizontalLayout) {
                    var datum = (cfg.dateDimension) ? new Date(d.date).getTime() : d.value;
                    var x = step * (datum - minValue) + margin;
                    return xscale(x);
                }
                return Math.floor(cfg.width / 2);
                //foldend
        //CIRCLE EVENTS foldstart
            }).on("mouseover", function (d) {
                d3.select(this).call(selectCircle(true, (this===d3selection)));
            })
            .on("mouseout", function () {
                if (this !== d3selection)
                    d3.select(this).call(selectCircle(false, false));
            }).on("mousedown", function (d) {
                var xPos = -(step * (new Date(d.date).getTime() - minValue) + margin) + cfg.width / 2;

                if (d3selection !== undefined) {
                    d3.select(d3selection).call(selectCircle(false, false));
                }
                d3selection = this;
                dataSelection = d;

                d3.select(this)
                    .call(selectCircle(true, true));
                d3.selectAll("circle,text").call(translateCircle, xPos);
                showEvent(d);
            });
        //foldend
        //TIME LABELS foldstart
        if (cfg.showLabels !== false) {
            var format;
            if (cfg.dateDimension) {
                format = d3.time.format(cfg.labelFormat);
            } else {
                format = function (d) {
                    return d;
                }; //Should I do something else?
            }
            timestamps.forEach(function (datum) {
                var str = format(new Date(datum));
                svg.append("text")
                    .text(str).style("font-size", "100%")
                    .attr("x", function (d) {
                        if (cfg.horizontalLayout) {
                            var x = step * (datum - minValue);
                            x = d3.max([x, (margin - this.getBBox().width / 2)]); //pro první prvek
                            return x;
                        }
                        return Math.floor(this.getBBox().width / 2);
                    })
                    .attr("y", function (d) {
                        if (cfg.horizontalLayout) {
                            return Math.floor(cfg.height / 2 - (margin + this.getBBox().height));
                        }
                        return margin + this.getBBox().height / 2;
                    });
            });
        }
        //foldend
    }
};