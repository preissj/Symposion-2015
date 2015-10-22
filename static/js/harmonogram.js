var dataJSON;

$.getJSON("/static/js/data.json", function (data) {
    dataJSON = data;
    $('#harmonogram').html("");
    for (var i = 0; i < data.events.length; i++) {
        if (data.events[i].label !== undefined) {
            $('#harmonogram')
                .append($('<tr>')
                    .append($('<td>')
                        .attr('colspan', 2)
                        .html(data.events[i].label).addClass("label")));
        } else {
            data.events[i].events.forEach(function (event, j) {
                var id = event.speaker;
                var speaker, talk;

                if (id.charAt(0) === '_') { //bez přednášejícího
                    speaker = undefined;
                    talk = id.substring(1);
                } else {
                    speaker = id;
                    if (dataJSON.speakers[speaker]) {
                        talk = dataJSON.speakers[speaker].talkname;
                    } else { //chybějící název
                        talk = "?";
                    }
                }
                var complete = dataJSON.speakers[id] && dataJSON.speakers[id].talkdesc;

                $('#harmonogram')
                    .append($('<tr>')
                        .append($('<td>').html((j === 0) ? data.events[i].time : "")
                            .addClass((j === 0) ? "time" : undefined)
                            .addClass("firstCol"))
                        .append($('<td>').html(event.room).addClass("room"))
                        .append($('<td>')
                            .addClass(complete ? "" : "invalid")
                            .addClass("singleEvent")
                            .click(function () {
                                handleClick(id);
                            })
                            .append($('<span>')
                                .html(speaker ? (speaker + " – ") : "")
                                .addClass("speaker"))
                            .append($('<span>').html(talk).addClass("talk")))
                    );
            });
        }
    }
    /*
        $('.demo').ripples({ //.demo
            resolution: 512,
            dropRadius: 20,
            perturbance: 0.005,
            interactive: true
        });*/
});

var handleClick = function (name) {
    $('#overlay').css("visibility", "visible").click(function () {
        $('#overlay').css("visibility", "hidden");
        $('#modal').css("visibility", "hidden");
    });
    $('#modal').css("visibility", "visible").html(nameToDescription(name));

}

var nameToDescription = function (name) {
    var info = dataJSON.speakers[name];
    if (info === undefined) {
        return "-chybí popis-";
    }
    return info.talkdesc;
};
