var gameSetup = false; // first roll has occured
var gameInProgress = false; // game has been setup

var citiesKnights = false; 
var showDist = false;
var showTime = false;
var showAverageTime = false;
var allRolls = {2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0};
var currTurnLength = 0;
var firstRoll = true;
var clockIntervalId = null;
var game_id = "";
var spamPrevent = false;
var game = null;
var inputPaused = false;
var openModal = null;

// These vars are for the example distributions
var real = {};
var smudged = {};

// Page elements
const die1 = document.getElementById("die1");
const die2 = document.getElementById("die2");
const die3 = document.getElementById("die3");
const probDist = document.getElementById("probDist");
const timeText = document.getElementById("time-text");
const avgTimeText = document.getElementById("avg-time-text");
const playerTimeSummary = document.getElementById("player-time-summary");
const timeDiv = document.getElementById("timeDiv");
const skipBtn = document.getElementById("skipBtn");
const playerText = document.getElementById("player-text");
const barbBoardDiv = document.getElementById("barbBoardDiv");
const offcanvasEl = document.getElementById('offcanvasBottom');
const buttonReveal = document.getElementById("buttonReveal");
const mainRollDiv = document.getElementById("mainRollDiv");
const pauseBtn = document.getElementById("pauseBtn");
const statsDiv = document.querySelector(".statsDiv");
const diceRow = document.getElementById("dice_row");


if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').then(function (registration) {
        console.log('ServiceWorker registered:', registration);
    }).catch(function (error) {
        console.log('ServiceWorker failed:', error);
    });
}

window.addEventListener('beforeunload', function (e) {
    e.preventDefault();
});

function handleOrientationChange(e) {
    if (e.matches && isMobile()) {
        const shownModalEl = document.querySelector('.modal.show');
        if (shownModalEl) {
            openModal = bootstrap.Modal.getInstance(shownModalEl);
            openModal?.hide();
        } else {
            openModal = null;
        }

        inputPaused = true;
        bootstrap.Modal.getOrCreateInstance(document.querySelector(".rotate-modal")).show();
    } else {
        if(openModal)
            openModal.show();
        bootstrap.Modal.getOrCreateInstance(document.querySelector(".rotate-modal")).hide();
        inputPaused = false;
    }
}
const mql = window.matchMedia("(orientation: landscape)");
mql.addEventListener('change', handleOrientationChange);
handleOrientationChange(mql);

document.addEventListener("DOMContentLoaded", () => {

    offcanvasEl.addEventListener('show.bs.offcanvas', () => {
        buttonReveal.style.display = 'none';
    });

    offcanvasEl.addEventListener('hidden.bs.offcanvas', () => {
        buttonReveal.style.display = 'block';
    });


    if(!isMobile()) {
        timeText.style.fontSize = "3vw";
        avgTimeText.style.fontSize = "2vw";
        playerText.textContent = "Click anywhere or hit Enter to start new game";
    } else {
        playerText.textContent = "Tap anywhere to start new game";
    }

    setResize();

    document.querySelectorAll('.dropdown-menu').forEach(menu => {
        menu.addEventListener('click', event => event.stopPropagation());
    });

    document.addEventListener("click", e => {
        if(inputPaused) return;
        const target = e.target.closest("button, a");
        if (target) target.blur();
    });


    document.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            defaultInput();
        }
    });

    document.getElementById("mainResultsDiv").addEventListener("click", defaultInput);

    document.querySelectorAll(".newGameBtn").forEach(btn => {
        btn.addEventListener("click", () => {
            if(inputPaused) return;
            bootstrap.Modal.getOrCreateInstance(document.querySelector(".how-it-works-modal")).hide();
            bootstrap.Modal.getOrCreateInstance(document.querySelector(".new-game-modal")).show();
        });
    });


    ["howItWorksBtnDesktop", "howItWorksBtnMobile"].forEach(id => {
        document.getElementById(id).addEventListener("click", () => {
            if(inputPaused) return;
            rollExamples();
            bootstrap.Modal.getOrCreateInstance(document.querySelector(".how-it-works-modal")).show();
        });
    });

    document.getElementById("rerollBtn").addEventListener("click", rollExamples);
    
    document.getElementById("skipBtn").addEventListener("click", () => {
        doTurn(true);
        bootstrap.Offcanvas.getOrCreateInstance(document.querySelector(".offcanvas")).hide();
    });

    document.getElementById("finishBtn").addEventListener("click", () => {
        if(!gameInProgress) return;
        finishGame();
        bootstrap.Offcanvas.getOrCreateInstance(document.querySelector(".offcanvas")).hide();
    });


    document.getElementById("pauseBtn").addEventListener("click", () => {
        if (!gameInProgress) return;
        bootstrap.Offcanvas.getOrCreateInstance(document.querySelector(".offcanvas")).hide();
    
        if (clockIntervalId !== null) {
          clearInterval(clockIntervalId);
          clockIntervalId = null;
          document.getElementById("pauseBtn").textContent = "Resume";
        } else {
          resetClockInterval();
        }
      });
    
    document.getElementById("new-game-form").addEventListener("submit", event => {
        if(inputPaused) return;
        startGame(event);
        document.querySelectorAll(".undoBtn").forEach(btn => {
            btn.style.width = citiesKnights ? "40%" : "90%";
        });
        document.querySelectorAll(".skipBtn").forEach(btn => {
            btn.style.display = citiesKnights ? "inline-block" : "none";
        });
    });
    
    document.getElementById("undoBtn").addEventListener("click", () => {
        if (!gameInProgress) return;
        bootstrap.Offcanvas.getOrCreateInstance(document.querySelector(".offcanvas")).hide();
        undoTurn();
    });
    
    document.getElementById("toggleDist").addEventListener("click", () => {
        showDist = document.getElementById("toggleDist").checked;
        if (!gameInProgress) return;
    
        toggleFlex(showDist || showTime || showAverageTime, statsDiv);
        setResize();
    
        document.getElementById("probDist").style.display = showDist ? "block" : "none";
        setTimeout(drawRollProbs, 10);
      });
    
    document.getElementById("toggleTime1").addEventListener("click", () => {
        showTime = document.getElementById("toggleTime1").checked;
        if (!gameInProgress) return;
    
        document.getElementById("time-text").style.display = showTime ? "block" : "none";
        toggleFlex(showDist || showTime || showAverageTime, statsDiv);
        toggleFlex(showTime || showAverageTime, timeDiv);
        setResize();
        updateTime();
    });
    
    document.getElementById("toggleTime2").addEventListener("click", () => {
        showAverageTime = document.getElementById("toggleTime2").checked;
        if (!gameInProgress) return;
    
        document.getElementById("avg-time-text").style.display = showAverageTime ? "block" : "none";
        toggleFlex(showDist || showTime || showAverageTime, statsDiv);
        toggleFlex(showTime || showAverageTime, timeDiv);
        populateTurnAverages();
        setResize();
    });
    
        document.querySelector(".how-it-works-modal").addEventListener("shown.bs.modal", rollExamples);
        
        resetClockInterval();
        bootstrap.Modal.getOrCreateInstance(document.querySelector(".how-it-works-modal")).show();
});
    
window.addEventListener("resize", () => {
    drawExamples();
    setResize();
    if (!gameSetup) return;
    drawFinishGamePlot();
    drawRollProbs();
});

function defaultInput() {
    if(inputPaused) return;
    if (document.querySelector('.how-it-works-modal').classList.contains('show')) {
        rollExamples();
    } else if(game === null) {
        bootstrap.Modal.getOrCreateInstance(document.querySelector('.new-game-modal')).show();
    } else if(gameSetup) {
        doTurn();
    } else {
        bootstrap.Modal.getOrCreateInstance(document.querySelector('.game-finish-modal')).show();
    }
}

function rollExamples() {
    if(inputPaused) return;
    // if(!spamTimer()) return;
    real = plotRandomNums(72);
    smudged = plotSmudged(72);
    drawExamples();
}

function drawExamples() {
    let realDiv = document.getElementById("real");
    let smudgedDiv = document.getElementById("smudged");
    createPlot(real, Object.values(real).map(roll => roll.toString()), realDiv.offsetWidth, realDiv.offsetHeight, "real", 15);//, [2, 4, 6, 8, 10, 12, 10, 8, 6, 4, 2]);
    createPlot(smudged, Object.values(smudged).map(roll => roll.toString()), smudgedDiv.offsetWidth, smudgedDiv.offsetHeight, "smudged", 15);//, [2, 4, 6, 8, 10, 12, 10, 8, 6, 4, 2]);
}

function populateTurnAverages() {
    let turnsMessage = game.getAverageTurns();
    timeText.innerHTML = turnsMessage;
    playerTimeSummary.innerHTML = turnsMessage;
}


function init() {
    die1.style.display = "none";
    die2.style.display = "none";
    die3.style.display = "none";
    probDist.style.display = "none";
    barbBoardDiv.style.display = "none";
    timeText.style.display = "none";
    avgTimeText.style.display = "none";

    requestAnimationFrame(() => {
        let width = probDist.offsetWidth;
        let height = probDist.offsetHeight;
        createPlot([0.02777, 0.05555, 0.083333, 0.11111, 0.13888, 0.1666, 0.13888, 0.1111, 0.083333, 0.05555, 0.02777], ["3%", "6%", "8%", "11%", "14%", "17%", "14%", "11%", "8%", "6%", "3%"], width, height, "probDist", .26);
    });

    gameSetup = true;
    gameInProgress = false;
    allRolls = {2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0};
    currTurnLength = 0;

    if (citiesKnights) {
        diceRow.style.aspectRatio = "3/1";
        timeDiv.style.flexDirection = "row";
        skipBtn.style.display = "inline-block";
        mainRollDiv.style.height = "50%";
        mainRollDiv.style.width = "90%";
    } else {
        diceRow.style.aspectRatio = "2/1";
        timeDiv.style.flexDirection = "column";
        skipBtn.style.display = "none";
        mainRollDiv.style.height = "26%";
        mainRollDiv.style.width = "60%";
    }

    if(!isHorizontal() && showDist && (showAverageTime || showTime)){
        timeDiv.style.flexDirection = "column";
    } else {
        timeDiv.style.flexDirection = "row";
    }
}

function resetClockInterval() {
    pauseBtn.textContent = "Pause";
    clearInterval(clockIntervalId);

    clockIntervalId = setInterval(() => {
        currTurnLength += 1;
        updateTime();
    }, 1000);
}

function updateTime() {
    const durationMin = Math.floor(currTurnLength / 60);
    const durationSec = Math.floor((currTurnLength) % 60);
    if(showTime && gameInProgress) {
        timeText.innerHTML = "Timer:<br>" + durationMin + ":" + (durationSec < 10 ? "0" : "") + durationSec;
    }
}

function startGame(event = null) {
    mainRollDiv.style.display = "none";
    if(event)
        event.preventDefault(); 

    var player1 = document.querySelector("input[name='player1']").value.trim();
    var player2 = document.querySelector("input[name='player2']").value.trim();
    var player3 = document.querySelector("input[name='player3']").value.trim();
    var player4 = document.querySelector("input[name='player4']").value.trim();
    var player5 = document.querySelector("input[name='player5']").value.trim();
    var player6 = document.querySelector("input[name='player6']").value.trim();

    if([player1, player2, player3, player4, player5, player6].filter(Boolean).length < 2) {
        alert("Please enter at least two players.");
        return;
    }

    citiesKnights = document.getElementById("citiesKnights").checked;
    let randomPlayer = document.getElementById("randomPlayer").checked;
    game = new Game([player1, player2, player3, player4, player5, player6], citiesKnights);

    bootstrap.Modal.getOrCreateInstance(document.querySelector('.new-game-modal')).hide();
    document.querySelector(".button-container").style.display = "block";

    drawBarbBoard(0);
    init();
    selectStartingPlayer(randomPlayer);
}

function doTurn(skip = false) {
    // if(!spamTimer()) return;
    if(!gameSetup) return;
    if(!gameInProgress) { // First turn
        buttonReveal.style.display = "block";
        timeDiv.style.display = (showTime || showAverageTime) ? "block" : "none"
        timeText.style.display = (showTime) ? "block" : "none"
        avgTimeText.style.display = (showAverageTime) ? "block" : "none"
        if(citiesKnights) die3.style.display = "block";
        setBarbBoardVisible();
        mainRollDiv.style.display = "flex";

        toggleFlex((showDist || showTime || showAverageTime), statsDiv);
        toggleFlex((showTime || showAverageTime), timeDiv);
        probDist.style.display = showDist ? "block" : "none";
    }
    if(skip) {
        diceRow.style.justifyContent = "center";
    } else {
        diceRow.style.justifyContent = "space-between";
    }
    setResize();
    gameInProgress = true;
    resetClockInterval(); // start counting
    let currTurn = game.turn(Math.round(currTurnLength), skip);
    if(showTime) {
        timeText.style.display = "block";
    }
    handleTurn(currTurn.turn);
    // adjustBarbBoardSize();
    avgTimeText.innerHTML = currTurn.averageTurns;

    allRolls[currTurn.turn.roll] += 1;
}

function undoTurn() {
    // if(!spamTimer()) return;
    let currTurn = game.undoTurn();
    if(!currTurn) {
        startGame();
        return;
    }
    handleTurn(currTurn.turn);
}

function handleTurn(currRoll) {
    currTurnLength = currRoll.turnLength;
    setDisplay(currRoll);
    updateTime();
}

function finishGame() {
    const finishModalEl = document.querySelector('.game-finish-modal');
    const finishModal = bootstrap.Modal.getOrCreateInstance(finishModalEl);
    finishModal.show();

    game.handleTime(currTurnLength);
    finishModalEl.addEventListener('shown.bs.modal', function () {
        drawFinishGamePlot();
    }, { once: true });
    document.getElementById("total-rolls-text").innerHTML = "Total Rolls: " + Object.values(allRolls).reduce((a, b) => a + b, 0);
    populateTurnAverages();
    clearInterval(clockIntervalId);
}

function setDisplay(data) {
    playerText.textContent = "It is " + data.player + "'s turn";
    if(citiesKnights) {
        if(data.action === "Barbarians") {
            drawDie(12, die3);
        } else if (data.action === "Yellow") {
            drawDie(13, die3);
        } else if (data.action === "Blue") {
            drawDie(14, die3);
        } else {
            drawDie(15, die3);
        }
        drawBarbBoard(data.barbLevel);
    }
    if(data.roll === "Turn Skipped") {
        die1.style.display = "none";
        die2.style.display = "none";
    } else {
        die1.style.display = "block";
        die2.style.display = "block";
        drawDie(6 + data.roll - data.red - 1, die1);
        drawDie(data.red - 1, die2);
    }
    if(showDist)
        drawRollProbs();
}

function drawBarbBoard(level) {
    const col = level % 2;
    const row = Math.floor(level / 2);
    barbBoardDiv.style.backgroundPosition = `${col * 100}% ${row * 100 / 3}%`;
}

function drawDie(roll, die) {
    const col = roll % 4;
    const row = Math.floor(roll / 4);
    die.style.backgroundPosition = `${col * 100 / 3}% ${row * 100 / 3}%`;
}

function createPlot(values, labels, width, height, divName, minmax, realValues = null) {
    var graphData = [
        {
            type: "bar",
            y: Object.values(values),
            x: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
            texttemplate: labels,
            textposition: 'top',
            // marker: { color: "rgba(0, 60, 255, 0.93)" },
        },
    ];

    var overlayGraph = [
        {
            type: "bar",
            y: realValues,
            // y: [0.02777, 0.05555, 0.083333, 0.11111, 0.13888, 0.1666, 0.13888, 0.1111, 0.083333, 0.05555, 0.02777],
            x: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
            // texttemplate: ["3%", "6%", "8%", "11%", "14%", "17%", "14%", "11%", "8%", "6%", "3%"],
            textposition: 'top',
            marker: { color: "rgba(200,200,200,0.4)" },
        }
    ]

    color = "rgba(0, 0, 0, 0.5)";
    let max = Math.max(minmax, ...Object.values(values));
    var layout = { 
        margin: {
            b: 2, t: 2, l: 2, r: 2,
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
        },
        barmode: "overlay",
        bargap: 0.1,
        showlegend: false
    };
    var config = { staticPlot: true };

    let data = graphData;
    if (realValues) {
        // data = overlayGraph.concat(graphData); // or [...overlayGraph, ...graphData]
        data = graphData.concat(overlayGraph);
    }
    Plotly.newPlot(divName, data, layout, config);
}

function spamTimer(wait = 50) {
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

function isHorizontal() {
    return window.innerWidth > window.innerHeight;
}

function setBarbBoardVisible() {
    if(citiesKnights) {
        barbBoardDiv.style.display = "flex";
    } else {
        barbBoardDiv.style.display = "none";
    }
}

function drawRollProbs() {
    if(!game.prevTurnStack.length) return;
    requestAnimationFrame(() => {
        let turn = game.prevTurnStack[game.prevTurnStack.length - 1];
        const width = probDist.clientWidth;
        const height = probDist.clientHeight;
        createPlot(turn.probs, turn.probLabels, width, height, "probDist", .26, [0.02777, 0.05555, 0.083333, 0.11111, 0.13888, 0.1666, 0.13888, 0.1111, 0.083333, 0.05555, 0.02777]);
    });
}

function drawFinishGamePlot() {
    const diceRollChart = document.getElementById("dice-roll-chart");
    const width = diceRollChart.clientWidth;
    const height = diceRollChart.clientHeight;
    createPlot( allRolls, Object.values(allRolls).map((roll) => roll.toString()), width, height, "dice-roll-chart", 1);
}

function toggleFlex(bool, div) {
    if(bool) {
        div.style.display = "flex";
    } else {
        div.style.display = "none";
    }
}

function setResize() {
    if(isHorizontal()) {
        document.querySelectorAll(".offcanvas").forEach(el => {
            el.classList.remove("offcanvas-bottom");
            el.classList.add("offcanvas-end");
        });
        buttonReveal.textContent = "◀";
    } else {
        buttonReveal.textContent = "▲";
        const leftEl = document.getElementById("left");
        if (leftEl) { leftEl.textContent = leftEl.textContent.replace("left", "top"); }
        const rightEl = document.getElementById("right");
        if (rightEl) { rightEl.textContent = rightEl.textContent.replace("right", "bottom"); }
        document.querySelectorAll(".offcanvas").forEach(el => {
            el.classList.remove("offcanvas-end");
            el.classList.add("offcanvas-bottom");
        });
    }

    if(!isHorizontal() && showDist && (showAverageTime || showTime)){
        timeDiv.style.flexDirection = "column";
    } else {
        timeDiv.style.flexDirection = "row";
    }

    let maxHeight = barbBoardDiv.parentElement.clientHeight;
    let maxWidth = barbBoardDiv.parentElement.clientWidth * 0.8;

    if (isHorizontal()) {
        maxWidth /= 2;
    } else {
        const siblingDivs = Array.from(barbBoardDiv.parentElement.children).filter(el => el !== barbBoardDiv);
        maxHeight -= siblingDivs.reduce((sum, el) => sum + el.clientHeight, 0);

    }

    if ((maxHeight * 6.05) / 5.54 > maxWidth) {
        barbBoardDiv.style.height = "auto";
        barbBoardDiv.style.width = maxWidth + "px";
    } else {
        barbBoardDiv.style.height = maxHeight + "px";
        barbBoardDiv.style.width = "auto";
    }

}

function selectStartingPlayer(random) {
    const players = game.players;
    let tick = 0;

    if (random) {
        buttonReveal.style.display = "none";
        inputPaused = true;
        const maxSpeed = Math.floor(Math.random() * players.length * 10) + 200;
        let speed = 10;
        playerText.textContent = players[0];

        function spin() {
            if (speed < maxSpeed) {
                playerText.textContent = players[tick % players.length];
                tick++;
                speed += 10;
                setTimeout(spin, speed);
            } else {
                const finalIndex = (tick - 1) % players.length;
                setTimeout(() => setStartingDisplay(finalIndex), 500);
                console.log(finalIndex);
            }
        }

        setTimeout(spin, 1000);
    } else {
        setStartingDisplay(0);
    }
}

function setStartingDisplay(index) {
    if(isMobile()) {
        playerText.textContent = "Tap to start " + game.players[index] + "'s first roll";
    } else {
        playerText.textContent = "Click anywhere or hit Enter to start " + game.players[index] + "'s first roll";
    }
    game.players = game.players.slice(index).concat(game.players.slice(0, index));
    inputPaused = false;
}