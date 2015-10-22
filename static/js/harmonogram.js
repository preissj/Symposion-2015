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
                                handleClick(id);
                            })
                            .append($('<span>')
                                .html(speaker ? (speaker + " – ") : "")
                                .addClass("speaker")
                                .addClass(completeSpeaker ? "" : "invalid"))
                            .append($('<span>')
                                .html(talk)
                                .addClass("talk")
                                .addClass(completeTalk ? "" : "invalid")))
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
    var str = "";
    var talkname;
    if (!name.startsWith('_')) {
        talkname = "Téma: " + info.talkname;
        str += "<h2>" + name + "</h2>";
        if (info.speakerdesc) {
            str += "<p class=\"speakerdesc\"><span class=\"speakername\">" +
                (info.fullname ? info.fullname : name) + "</span> ";
            str += info.speakerdesc + "</p>";
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
