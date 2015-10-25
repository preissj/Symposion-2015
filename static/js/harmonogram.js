if (!String.prototype.startsWith) {
    String.prototype.startsWith = function (searchString, position) {
        position = position || 0;
        return this.indexOf(searchString, position) === position;
    };
}

var dataJSON;

$.getJSON("/static/js/data.json", function (data) {
    dataJSON = data;
    $('#harmonogram').html("");
    for (var i = 0; i < data.events.length; i++) {
        if (data.events[i].label !== undefined) {
            $('#harmonogram')
                .append($('<tr>')
                    .append($('<td>')
                        .attr('colspan', 3)
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
                var completeTalk = dataJSON.speakers[id] && dataJSON.speakers[id].talkdesc;
                var completeSpeaker = dataJSON.speakers[id] && dataJSON.speakers[id].speakerdesc;

                $('#harmonogram')
                    .append($('<tr>')
                        .append($('<td>').html((j === 0) ? data.events[i].time : "")
                            .addClass((j === 0) ? "time" : undefined)
                            .addClass("firstCol"))
                        .append($('<td>').html(event.room).addClass("room"))
                        .append($('<td>')
                            .addClass("singleEvent")
                            .click(function () {
                                if (completeTalk || completeSpeaker) handleClick(id);
                            })
                            .append($('<span>')
                                .html(speaker ? (speaker + " – ") : "")
                                .addClass("speaker")
                                .addClass((completeTalk || completeSpeaker) ? "" : "invalid")
                            )
                            .append($('<span>')
                                .html(talk)
                                .addClass("talk")
                                .addClass((completeTalk || completeSpeaker) ? "" : "invalid")
                            ))
                    );
            });
        }
    }

    $('#section1').ripples({ //.demo
        resolution: 512,
        dropRadius: 20,
        perturbance: 0.005,
        interactive: true
    });
});

var handleClick = function (name) {
    $('#modal').css({
        "visibility": "visible",
        "opacity": 1
    }).click(function () {
        //$('#modal').css("visibility", "hidden");
        $('#modal').css("visibility", "hidden");
        $('#modal').css("opacity", "0");
        $('body').removeClass("noscroll").width("100%");
    });
    $('body').width($('body').width());
    $('body').addClass("noscroll");
    var desc = nameToDescription(name);
    $('#modal').html(desc ? desc : "Nepodařilo se načíst popis.");
};

var nameToDescription = function (name) {
    var info = dataJSON.speakers[name];
    if (info === undefined) {
        return "-chybí popis-";
    }
    var str = '<img id="cross" src="/static/images/close.svg">';
    var talkname;
    if (!name.startsWith('_')) {
        talkname = "Téma: " + info.talkname;
        str += "<h2>" + name + "</h2>";
        if (info.speakerdesc) {
            str += "<p class=\"speakerdesc\"><span class=\"speakername\">" +
                (info.fullname ? info.fullname : name) + "</span>";
            str += (info.speakerdesc.startsWith(",") ? "" : " ") + info.speakerdesc + "</p>";
        }
    } else {
        talkname = name.substring(1);
    }
    str += "<h2 class=\"talkname\">" + talkname + "</h2>";
    if (info.talkdesc) {
        str += "<p class=\"talkdesc\">";
        str += info.talkdesc;
        str += "</p>";
    } else {
        if (str === "") {
            str = "-popis chybí-";
        }
    }
    return str;
};
