var gameInProgress = false;
var citiesKnights = false;
var showDist = false;
var showTime = false;
var playerCount = 0;
var players = [];
var barbLevel = 0;
var turnStart = performance.now();
var allRolls = [];
var prevRolls = [];
var nextRolls = [];
var currTurnLength = 0;
var turnCount = -1;
var turnLengths = [];
var firstRoll = true;
var clockIntervalId = null;

$(document).ready(function() {
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
        menu.addEventListener('click', function(event) {
            event.stopPropagation();
        });
    });

    $("#rollBtn").click(function() {
        rollDice();
        // $("#rollBtn").prop("disabled", true);
        setTimeout(() => {
            $("#rollBtn").prop("disabled", false);
        }, 1000);
    });

    $("#newGameBtn").click(function() {
        $('.bd-example-modal-lg').modal('show');
    });

    $("#toggleDist").click(function() {
        showDist = $("#toggleDist").is(":checked");
        if(gameInProgress) {
            $("#probDist").toggle(showDist);
        }
    });

    $("#new-game-form").submit(function(event) {
        startGame(event);
    });

    $("#undoBtn").click(function() {
        undoTurn();
        // $("#undoBtn").prop("disabled", true);
        setTimeout(() => {
            $("#undoBtn").prop("disabled", false);
        }, 1000);
    });

    $("#toggleTime1").click(function() {
        showTime = $("#toggleTime1").is(":checked");
        if(gameInProgress) {
            $("#time-text").toggle(showTime);
            updateTime();
        }
    })

    $("#toggleTime2").click(function() {
        showTime = $("#toggleTime2").is(":checked");
        if(gameInProgress) {
            $("#avg-time-text").toggle(showTime);
            updateTimeAverages();
        }
    })

    resetClockInterval();
});

function resetClockInterval() {
    clearInterval(clockIntervalId);

    clockIntervalId = setInterval(() => {
        currTurnLength += 1;
        updateTime();
    }, 1000);
}

function updateTime() {
    const durationMin = Math.floor(currTurnLength / 60);
    const durationSec = (currTurnLength) % 60;
    if(showTime && gameInProgress) {
        $("#time-text").text("Time since last turn: " + (durationMin > 0 ? durationMin + "min " : "") + durationSec.toFixed(0) + "s");
    }
}

function updateTimeAverages() {
    let message = "Average turn times: ";
    $.each(players, function(index, player) {
        message += (player + ": " + (turnLengths[index].reduce((a, b) => a + b, 0) / turnLengths[index].length).toFixed(1) + "s, ");
    });
    $("#avg-time-text").text(message);
}

function rollDice() {
    if(gameInProgress) {
        resetClockInterval(); // start counting
        if(!firstRoll && turnLengths[turnCount % playerCount].length > Math.floor(turnCount / playerCount)) {
            turnLengths[turnCount % playerCount][Math.floor(turnCount / playerCount)] = currTurnLength;
            console.log("turn timer exists already, updating list");
        } else if(!firstRoll) {
            turnLengths[turnCount % playerCount].push(currTurnLength);
            console.log("this is a new turn!");
        }
        updateTimeAverages();
        console.log(turnLengths);
        firstRoll = false;
        turnCount += 1;
        if(nextRolls.length > 1) {
            currTurnLength = turnLengths[turnCount % playerCount][Math.floor(turnCount / playerCount)];
            if(currTurnLength === undefined) {
                currTurnLength = 0;
            }
            handleTurn(nextRolls.pop());
        } else {
            $("#time-text").text("Time since last turn: 0s");
            turnStart = performance.now();
            fetch('/roll_dice_ajax', {
                method: 'POST',
            })
            .then(response => {
                if(!response.ok) {
                    alert("Error rolling dice: " + response.statusText);
                    return;
                }
                return response.json();
            })
            .then(data => {
                if(showTime) {
                    $("#time-text").show();
                }
                currTurnLength = 0;
                handleTurn(data);
                allRolls.push(data.roll);
            });
        }
    }
}

function handleTurn(currRoll) {
    if(currRoll.barbarian === "B" || currRoll.barbarian === "A") {
        barbLevel = barbLevel + 1;
    }
    barbLevel %= 7;
    setDisplay(currRoll);
    prevRolls.push(currRoll);
    updateTime();
}

function setDisplay(data) {
    $("#player-text").text("It is " + players[turnCount % playerCount] + "'s turn");
    if(citiesKnights) {
        if(data.barbarian === "B") {
            $("#barb-text").text("Barbarians Advance");
        } else if(data.barbarian === "A") {
            $("#barb-text").text("Barbarian Attack!");
            barbLevel = 7;
        } else {
            $("#barb-text").text(data.barbarian + " " + data.red);
        }
        $("#barbBoard").prop("src", "/static/Barb" + (barbLevel + 1) + ".png");
    }
    console.log(barbLevel);
    $("#roll-text").text("Roll: " + data.roll);
    createPlot(data.prob, data.probLabels);
}

function undoTurn() {
    if(gameInProgress && prevRolls.length > 1) {
        resetClockInterval();
        console.log(turnLengths);
        turnCount -= 1;
        const lastRoll = prevRolls[prevRolls.length - 2];
        currTurnLength = turnLengths[turnCount % playerCount][Math.floor(turnCount / playerCount)];
        updateTime();
        if(prevRolls[prevRolls.length - 1].barbarian === "B" || prevRolls[prevRolls.length - 1].barbarian === "A") {
            barbLevel -= 1;
        }
        nextRolls.push(prevRolls.pop());
        setDisplay(lastRoll);
    } else {
        alert("No turns to undo.");
    }
}

function startGame(event) {
    event.preventDefault(); // Prevent the default form submission

    // Retrieve values from the input fields
    var player1 = $("input[name='player1']").val();
    var player2 = $("input[name='player2']").val();
    var player3 = $("input[name='player3']").val();
    var player4 = $("input[name='player4']").val();
    var player5 = $("input[name='player5']").val();
    var player6 = $("input[name='player6']").val();

    // Retrieve the checkbox value
    citiesKnights = $("#citiesKnights").is(":checked");
    $("#barbBoard").toggle(citiesKnights);
    $("#barb-text").toggle(citiesKnights);

    // You can now send this data to the server via AJAX or process it further
    $.ajax({
        url: '/new_game',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            players: [player1, player2, player3, player4, player5, player6].join(","),
            ck: citiesKnights
        }),
        success: function(response) {
            playerCount = response.player_count;
            console.log("Game started successfully! Player count: " + playerCount);
            $('.bd-example-modal-lg').modal('hide');
            $("#player-text").text("Hit 'Roll Dice' to start " + response.players[0] + "'s turn");
            init();
            turnLengths = response.players.map(() => [0]);
            players = response.players;
        },
        error: function(xhr) {
            console.error("Error starting game:", xhr.status, xhr.responseJSON?.error || xhr.responseText);

            alert("Error: " + (xhr.responseJSON?.error || "An unexpected error occurred"));
 
        }
    });

}

function init() {
    $("#barb-text").text("");
    $("#roll-text").text("");
    createPlot([2.777, 5.555, 8.3333, 11.111, 13.888, 16.66, 13.888, 11.11, 8.3333, 5.555, 2.777], ["3%", "6%", "8%", "11%", "14%", "17%", "14%", "11%", "8%", "6%", "3%"]);
    $("#barbBoard").prop("src", "/static/Barb1.png");
    $("#barbBoard").toggle(citiesKnights);
    $("#time-text").toggle(false);
    $("#avg-time-text").toggle(false);
    gameInProgress = true;
    barbLevel = 0;
    turnStart = performance.now();
    allRolls = [];
    prevRolls = [];
    nextRolls = [];
    currTurnLength = 0;
    turnCount = -1;
    turnLengths = [];
    firstRoll = true;
}

function createPlot(prob, probLabels) {
    var graphData = [
        {
        type: "bar",
        y: Object.values(prob),
        x: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        texttemplate: probLabels,
        textposition: 'top'
        },
    ];

    color = "rgba(0, 0, 0, 0.5)";
    var layout = { 
        margin: {
            b: 40, t: 40, l: 40, r: 40,
        },
        xaxis: {
            // tickmode: 'array',
            tickvals: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
            ticktext: ["2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
        },
        yaxis: {
            visible: false,
            autorange: false,
            range: [0, 26],
            // showgrid: false,
        },
        width: $("#resultDiv").width() * 0.7,
        height: $("#resultDiv").height() * 0.3,
        paper_bgcolor: 'rgba(255, 255, 255, 0)', 
        plot_bgcolor: 'rgba(255, 255, 255, 0)'

    };
    var config = { staticPlot: true };
    Plotly.newPlot("probDist", graphData, layout, config);
}