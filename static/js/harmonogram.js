$.getJSON("/static/js/data.json", function (data) {
            $('#harmonogram').html("");
            for (var i = 0; i < data.events.length; i++) {
                if (data.events[i].label !== undefined) {
                    $('#harmonogram')
                        .append($('<tr>')
                                .append($('<td>')
                                        .html(data.events[i].label).addClass("label")));
                } else {
                    data.events[i].events.forEach(function (event, j) {
                        $('#harmonogram')
                            .append($('<tr>')
                                .append($('<td>').html((j === 0) ? data.events[i].time : "")
                                        .addClass((j===0)?"time":undefined))
                                .append($('<td>').html(event.room).addClass("room"))
                                .append($('<td>')
                                        .append($('<span>')
                                                .html(event.speaker?(event.speaker+" – "):"")
                                                .addClass("speaker"))
                                        .append($('<span>').html(event.talk).addClass("talk")))
                                   );
                    });
                }
            }
        });
