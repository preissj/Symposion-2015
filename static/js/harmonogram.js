if (!String.prototype.startsWith) {
    String.prototype.startsWith = function (searchString, position) {
        position = position || 0;
        return this.indexOf(searchString, position) === position;
    };
}

$(document).ready(function () {
    $("#arrow").click(function () {
        $('html, body').animate({
            scrollTop: $("#section2").offset().top
        }, 600);
    });
    $(".toHarmonogram").click(function () {
        $('html, body').animate({
            scrollTop: $("#section3").offset().top
        }, 600);
    });
});

var dataJSON;

$.getJSON("/static/js/data.json", function (data) {
    dataJSON = data;
    //$('.harmonogram').html("");
    var curTable = undefined;
    var headers = [];
    for (var i = 0; i < data.events.length; i++) {
        if (data.events[i].label !== undefined) {
            if (curTable) curTable.appendTo($('#section3'));
            curTable = $('<table>').addClass('harmonogram');
            curTable
                .append($('<tr>')
                    .append($('<td>')
                        .attr('colspan', 3)
                        .html(data.events[i].label)
                        .addClass("label")));
        }
        if (data.events[i].headers !== undefined) {
            headers = data.events[i].headers;
            var added = $('<tr>');
            added.append($('<td>'));
            $.each(headers, function (index, val) {
                added.append($('<td>').html(val).addClass('roomHeader'));
            });
            added.appendTo(curTable);
        }
        if (data.events[i].label === undefined) {
            var added = $('<tr>').append(
                $('<td>').html(data.events[i].time)
                .addClass("time")
                .addClass("firstCol"));
            data.events[i].events.forEach(function (event, j) {
                if ($.isEmptyObject(event)) { //"padding"
                    added.append($('<td>'));
                    return;
                }
                var id = event.speaker;
                var speaker, talk;

                if (id.charAt(0) === '_') { //bez přednášejícího
                    speaker = undefined;
                    talk = id.substring(1);
                } else {
                    speaker = id;
                    if (data.speakers[speaker]) {
                        talk = data.speakers[speaker].talkname + " – "; //en dash, ne pomlcka
                    } else { //chybějící název
                        talk = "?";
                    }
                }
                var completeTalk = data.speakers[id] && data.speakers[id].talkdesc;
                var completeSpeaker = data.speakers[id] && data.speakers[id].speakerdesc;
                added.append($('<td>')
                    .addClass("singleEvent")
                    .attr('roomName', event.room ? (event.room) : "")
                    .click(function () {
                        if (completeTalk || completeSpeaker) handleClick(id);
                    })
                    .append($('<span>')
                        .html(talk)
                        .addClass("talk")
                        .addClass((completeTalk || completeSpeaker) ? "" : "invalid")
                        .addClass(completeTalk ? "" : "missingText")
                    )
                    .append($('<span>')
                        .html(speaker ? speaker : "")
                        .addClass("speaker")
                        .addClass((completeTalk || completeSpeaker) ? "" : "invalid")
                        .addClass(completeSpeaker ? "" : "missingText")
                    )
                );
                /*$('#harmonogram')
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
                                .html(talk)
                                .addClass("talk")
                                .addClass((completeTalk || completeSpeaker) ? "" : "invalid")
                                .addClass(completeTalk ? "" : "missingText")
                            )
                            .append($('<span>')
                                .html(speaker ? speaker : "")
                                .addClass("speaker")
                                .addClass((completeTalk || completeSpeaker) ? "" : "invalid")
                                .addClass(completeSpeaker ? "" : "missingText")
                            )
                        )
                    );*/
            });
            added.appendTo(curTable);
        }
    }
    if (curTable) curTable.appendTo($('#section3'));

    $('#section1').ripples({
        resolution: 512,
        dropRadius: 20,
        perturbance: 0.005,
        interactive: true
    });
});

var handleClick = function (name) {
    $('#modal').css({
        "visibility": "visible",
        "opacity": 1,
        "overflow-y": "scroll"
    });
    $('body').width($('body').width());
    $('body').addClass("noscroll");
    var desc = nameToDescription(name);
    $('#modal-inner').html(desc ? desc : "Nepodařilo se načíst popis.")
        .click(function (event) {
            event.stopPropagation();
        });
    $(document).keydown(function (e) { //escape = click
        if (e.keyCode === 27) $('#modal').click();
    });
    $('#modal').click(function () {
        $('#modal').css({
            "visibility": "hidden",
            "opacity": 0,
            "overflow-y": "hidden"
        });
        $('body').removeClass("noscroll").width("100%");
    });
};

var nameToDescription = function (name) {
    var info = dataJSON.speakers[name];
    if (info === undefined) {
        return "-chybí popis-";
    }
    var str = '';
    if (!name.startsWith('_')) {
        str += "<h1>" + name + "</h1>";
        if (info.speakerdesc) {
            str += "<p class=\"speakerdesc\"><span class=\"speakername\">" +
                (info.fullname ? info.fullname : name) + "</span>";
            str += (info.speakerdesc.startsWith(",") ? "" : " ") + info.speakerdesc + "</p>";
        }
        str += "<h2>Téma: " + info.talkname + "</h2>";
    } else {
        str += "<h1>" + name.substring(1) + "</h1>";
    }

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
