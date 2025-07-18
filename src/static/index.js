var gameSetup = false; // first roll has occured
var gameInProgress = false; // game has been setup

var citiesKnights = false; 
var showDist = false;
var showTime = false;
var showAverageTime = false;
var playerCount = 0; // number of players
var players = [];
var allRolls = {2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0};
var currTurnLength = 0;
var firstRoll = true;
var clockIntervalId = null;
var game_id = "";
var spamPrevent = false;

$(document).ready(function() {
    if(isMobile()) {
        $("#player-text").text("Tap anywhere to setup the game");
    } else {
        $("#player-text").text("Hit \"New Game\" to get started");
    }

    document.querySelectorAll('.dropdown-menu').forEach(menu => {
        menu.addEventListener('click', function(event) {
            event.stopPropagation();
        });
    });

    $(document).on("click", "button, a", function() {
        $(this).blur();
    });

    // $("#textOutputDiv").on("touchstart", function (e) {
    //     if(!gameSetup) {
    //         $('.new-game-modal').modal('show');
    //     }
    //     doTurn();
    // });

    $(document).keydown(function(event) {
        if(event.key === "Enter") {
            if($('.how-it-works-modal').is(':visible')) {
                rollExamples();
            } else {
                doTurn();
            }
        }
    });

    $(".rollBtn").click(function() {
        doTurn();
    });

    $(".skipBtn").click(function () {
        doTurn(true);
    });

    $(".newGameBtn").click(function() {
        $('.new-game-modal').modal('show');
    });

    $(".howItWorksBtn").click(function() {
        rollExamples();
        $('.how-it-works-modal').modal('show');
    });

    $("#rerollBtn").click(function() {
        rollExamples();
    });

    $(".finishBtn").click(function() {
        finishGame();
    });

    $(".pauseBtn").click(function() {
        if(!gameInProgress) return;
        if(clockIntervalId !== null) {
            clearInterval(clockIntervalId);
            clockIntervalId = null;
            $(".pauseBtn").text("Resume");
        } else {
            resetClockInterval();
        }
    })

    $(".toggleDist").click(function() {
        showDist = $(".toggleDist").is(":checked");
        if(gameSetup) {
            $("#probDist").toggle(showDist);
        }
    });

    $("#new-game-form").submit(function(event) {
        startGame(event);
        if(citiesKnights) {
            $(".undoBtn").css("width", "40%");
            $(".skipBtn").show();
        } else {
            $(".undoBtn").css("width", "90%");
            $(".skipBtn").hide();
        }
    });

    $(".undoBtn").click(function() {
        if(!gameInProgress) return;
        undoTurn();
    });

    $(".toggleTime1").click(function() {
        showTime = $(".toggleTime1").is(":checked");
        if(gameInProgress) {
            $("#time-text").toggle(showTime);
            updateTime();
        }
    })

    $(".toggleTime2").click(function() {
        showAverageTime = $(".toggleTime2").is(":checked");
        if(gameInProgress && showAverageTime) {
            $("#avg-time-text").show();
            populateTurnAverages();
        }
    })

    resetClockInterval();
});

function rollExamples() {
    if(!spamTimer()) return;
    fetch('/get_turns', {
        method: 'GET',
    })
    .then(response => response.json())
    .then(data => {
        createPlot(data.real, Object.values(data.real).map(roll => roll.toString()), $("#real").width(), $("#real").height(), "real", 15);
        createPlot(data.smudged, Object.values(data.smudged).map(roll => roll.toString()), $("#smudged").width(), $("#smudged").height(), "smudged", 15);
    })
}

function populateTurnAverages() {
    fetch(`/get_turn_averages?game_id=${game_id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => {
                throw new Error(err.error || "Unknown error");
            }).catch(() => {
                throw new Error("Failed to fetch turn averages.");
            });
        }
        return response.json();
    })
    .then(data => {
        $("#modal-time-text").html(data.averageTurns);
        $("#player-time-summary").html(data.averageTurns);
    })
    .catch(error => {
        console.error("Error fetching turn averages:", error.message);
        $("#modal-time-text").html("Error fetching averages.");
        $("#player-time-summary").html("Error fetching averages.");
    });
}


function init() {
    $("#die1, #die2, #die3").hide();
    // $("#barbBoard").prop("src", "/static/Barb1.png");
    setBarbBoardVisible();
    $("#probDist").toggle(showDist);
    let width = isMobile() ? "80vh" : $("#textOutputDiv").width() * 0.8;
    let height = isMobile() ? "17vh" : $("#textOutputDiv").height() * 0.3;
    createPlot([0.02777, 0.05555, 0.083333, 0.11111, 0.13888, 0.1666, 0.13888, 0.1111, 0.083333, 0.05555, 0.02777], ["3%", "6%", "8%", "11%", "14%", "17%", "14%", "11%", "8%", "6%", "3%"], width, height, "probDist", .26);
    // createPlot([0.02777, 0.05555, 0.083333, 0.11111, 0.13888, 0.1666, 0.13888, 0.1111, 0.083333, 0.05555, 0.02777], ["3%", "6%", "8%", "11%", "14%", "17%", "14%", "11%", "8%", "6%", "3%"], $("#probDist").width(), $("#probDist").height(), "probDist", .26);

    $("#time-text").toggle(false);
    $("#avg-time-text").toggle(false);
    gameSetup = true;
    gameInProgress = false;
    allRolls = {2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0};
    currTurnLength = 0;
}

function resetClockInterval() {
    $(".pauseBtn").text("Pause");
    clearInterval(clockIntervalId);

    clockIntervalId = setInterval(() => {
        currTurnLength += 0.1;
        updateTime();
    }, 100);
}

function updateTime() {
    const durationMin = Math.floor(currTurnLength / 60);
    const durationSec = Math.floor((currTurnLength) % 60);
    if(showTime && gameInProgress) {
        $("#time-text").text("Time since last turn: " + durationMin + ":" + (durationSec < 10 ? "0" : "") + durationSec);
            // (durationMin > 0 ? durationMin + "min " : "") + durationSec.toFixed(0) + "s");
    }
}

function startGame(event = null) {
    $("#buttonReveal").show();
    if(event)
        event.preventDefault(); 

    var player1 = $("input[name='player1']").val();
    var player2 = $("input[name='player2']").val();
    var player3 = $("input[name='player3']").val();
    var player4 = $("input[name='player4']").val();
    var player5 = $("input[name='player5']").val();
    var player6 = $("input[name='player6']").val();

    citiesKnights = $("#citiesKnights").is(":checked");
    setBarbBoardVisible();
    if(!isMobile()) {
        $("#playerBoardDiv").width("50%");
    }
    $("#barb-text").toggle(citiesKnights);

    fetch('/new_game', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            players: [player1, player2, player3, player4, player5, player6].join(","),
            ck: citiesKnights,
            game_id: game_id, 
        }),
    })
    .then(response => {
        if(!response.ok) {
            throw new Error("Failed to start game");
        }
        return response.json();
    })
    .then((data) => {
        playerCount = data.playerCount;
        $('.new-game-modal').modal('hide');
        $("#player-text").text("Hit 'Roll Dice' to start " + data.players[0] + "'s turn");
        init();
        players = data.players;
        game_id = data.game_id;
    })
    .catch((error) => {
        console.error("Error starting the game:", error);
        alert("There was an error starting the game. Please try again.");
    });
}

function doTurn(skip = false) {
    if(!spamTimer()) return;
    if(!gameSetup) return;
    if(!gameInProgress) {
        $("#time-text").toggle(showTime);
        $("#avg-time-text").toggle(showAverageTime);
        // $("#die1, #die2").show();
        if(citiesKnights) $("#die3").show();
    }
    gameInProgress = true;
    resetClockInterval(); // start counting
    fetch('/do_turn_ajax', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            time: Math.round(currTurnLength),
            skip: skip,
            game_id: game_id,
        })
    })
    .then(response => {
        if(!response.ok) {
            throw new Error("Failed to roll dice");
        }
        return response.json();
    })
    .then((data) => {
        if(showTime) {
            $("#time-text").show();
        }
        handleTurn(data.turn);
        $("#avg-time-text").html(data.averageTurns);

        allRolls[data.turn.roll] += 1;
    })
    .catch((error) => {
        console.error("Error rolling the dice:", error);
        alert("There was an error rolling the dice. Please try again.");
    })
}

function undoTurn() {
    if(!spamTimer()) return;
    fetch('/undo_turn_ajax', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            game_id: game_id,
        }),
    })
    .then(response => {
        if(!response.ok) {
            throw new Error("Failed to undo turn");
        }
        return response.json();
    })
    .then((data) => {
        if('Status' in data) {
            startGame();
            return;
        }
        handleTurn(data.turn);
    })
}

function handleTurn(currRoll) {
    currTurnLength = currRoll.turnLength;
    setDisplay(currRoll);
    updateTime();
}

function finishGame() {
    if($("#player-text").text().trim() === "Hit \"New Game\" to get started") return;
    if(gameInProgress && !confirm("Would you like to finish the game? You will not be able to undo turns or roll again.")) return;
    $('.game-finish-modal').modal('show');
    gameSetup = false;
    gameInProgress = false;
    createPlot(allRolls, Object.values(allRolls).map(roll => roll.toString()), $("#dice-roll-chart").width() * 0.8, $("#dice-roll-chart").height(), "dice-roll-chart", 1);
    $("#total-rolls-text").html("Total Rolls: " + Object.values(allRolls).reduce((a, b) => a + b, 0));
    populateTurnAverages();
    $("#buttonReveal").hide();
}

function setDisplay(data) {
    $("#player-text").text("It is " + data.player + "'s turn");
    if(citiesKnights) {
        if(data.barbarian === "Barb") {
            drawDie(12, "die3");
        } else if (data.barbarian === "A") {
            drawDie(12, "die3");
            data.barbLevel = 7;
        } else if (data.barbarian === "Y") {
            drawDie(13, "die3");
        } else if (data.barbarian === "B") {
            drawDie(14, "die3");
        } else {
            drawDie(15, "die3");
        }
        // $("#barbBoard").prop("src", "/static/Barb" + (data.barbLevel + 1) + ".png");
        drawBarbBoard(data.barbLevel);
    }
    // $("#roll-text").text("Roll: " + data.roll);
    if(data.roll === "Turn Skipped") {
        $("#die1, #die2").hide();
    } else {
        $("#die1, #die2").show();
        drawDie(6 + data.roll - data.red - 1, "die1");
        drawDie(data.red - 1, "die2");
    }
    let width = isMobile() ? "80vh" : $("#textOutputDiv").width() * 0.8;
    let height = isMobile() ? "17vh" : $("#textOutputDiv").height() * 0.3;
    createPlot(data.probs, data.probLabels, width, height, "probDist", .26);
}

function drawBarbBoard(level) {
    console.log("setting barb board to level " + level);
    const col = level % 2;
    const row = Math.floor(level / 2);
    $("#barbBoardDiv").css("background-position", `${col * 100}% ${row * 100 / 3}%`);
}

function drawDie(roll, divName) {
    const col = roll % 4;
    const row = Math.floor(roll / 4);
    $("#" + divName).css("background-position", `${col * 100 / 3}% ${row * 100 / 3}%`);
}

function createPlot(values, labels, width, height, divName, minmax) {
    var graphData = [
        {
        type: "bar",
        y: Object.values(values),
        x: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        texttemplate: labels,
        textposition: 'top'
        },
    ];

    color = "rgba(0, 0, 0, 0.5)";
    let max = Math.max(minmax, ...Object.values(values));
    var layout = { 
        margin: {
            b: 0, t: 0, l: 0, r: 0,
        },
        xaxis: {
            tickvals: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
            ticktext: ["2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
            automargin: true,
        },
        yaxis: {
            visible: false,
            autorange: false,
            range: [0, max],
        },
        width: width,
        height: height,
        paper_bgcolor: 'rgba(255, 255, 255, 0)', 
        plot_bgcolor: 'rgba(255, 255, 255, 0)',
        font: {
            color: 'white',
        }

    };
    var config = { staticPlot: true };
    Plotly.newPlot(divName, graphData, layout, config);
}

function spamTimer(wait = 250) {
    if(spamPrevent) return false;
    spamPrevent = true;
    setTimeout(() => {
        spamPrevent = false;
    }, wait);
    return true;
}

function isMobile() {
  return window.innerWidth < 768;
}

function setBarbBoardVisible() {
    if(citiesKnights) {
        $("#barbBoardDiv").css("display", "flex");
    } else  {
        $("#barbBoardDiv").css("display", "none");
    }
}