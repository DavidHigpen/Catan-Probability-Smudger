class Game {
  constructor(players = [], citiesAndKnights = false) {
    this.gameId = Math.random().toString(16).slice(2);
    this.players = players.filter(Boolean);
    this.person = "";
    this.citiesAndKnights = citiesAndKnights;
    this.current_turn = 0;
    this.barb_ship_counter = 0;

    this.CONSTANT_POWER = 1.5;
    this.CONSTANT_REMOVE = this.CONSTANT_POWER / 36;
    this.prob = { 2: 1 / 36, 3: 2 / 36, 4: 3 / 36, 5: 4 / 36, 6: 5 / 36, 7: 6 / 36, 8: 5 / 36, 9: 4 / 36, 10: 3 / 36, 11: 2 / 36, 12: 1 / 36, };
    this.probIncr = {};
    for (let i = 2; i < 13; i++) {
      this.probIncr[i] = this.prob[i] * this.CONSTANT_REMOVE;
    }

    this.prevTurnStack = [];
    this.turnTimes = Array(this.players.length)
      .fill(null)
      .map(() => []);
  }

  normalize() {
    let totalprob = 0;
    for (let i = 2; i < 13; i++) {
        totalprob += this.prob[i];
    }
    for (let i = 2; i < 13; i++) {
        this.prob[i] /= totalprob;
    }
  }

  redistribute(number) {
    let adjustProb = this.CONSTANT_REMOVE;
    if (this.prob[number] < adjustProb) {
      adjustProb = this.prob[number];
    }
    this.prob[number] -= adjustProb;

    for (let i = 2; i <= 12; i++) {
      this.prob[i] += (adjustProb * this.probIncr[i]) / adjustProb;
    }
    this.normalize();
  }

  rollDice() {
    let rand = Math.random();
    let search = 0.0;

    for (let i = 2; i <= 12; i++) {
      search += this.prob[i];
      if (rand < search) {
        this.redistribute(i);
        return i;
      }
    }
  }

  rollRedDie(roll) {
    if (roll < 7) {
      return Math.floor(Math.random() * (roll - 1)) + 1;
    } else {
      return Math.floor(Math.random() * (7 - (roll - 6))) + (roll - 6);
    }
  }

  rollActionDie() {
    let roll = Math.floor(Math.random() * 6) + 1;
    if (roll <= 3) return "Barbarians";
    if (roll === 4) return "Blue";
    if (roll === 5) return "Green";
    return "Yellow";
  }

  turn(time = null, skip = false) {
    this.handleTime(time);
    const prev = this.prevTurnStack[this.prevTurnStack.length - 1] || null;
    const turn = {
      roll: 0,
      red: "",
      action: "",
      player: "",
      probs: {},
      probLabels: [],
      turnLength: 0,
      currTurn: prev ? prev.currTurn + 1 : 0,
      barbLevel: prev ? prev.barbLevel % 7 : 0,
    };

    if (skip) {
      turn.roll = "Turn Skipped";
    } else {
      turn.roll = this.rollDice();
      turn.red = this.rollRedDie(turn.roll);
    }

    turn.player = this.players[turn.currTurn % this.players.length];
    turn.action = this.rollActionDie();

    if (turn.action === "Barbarians") {
      turn.barbLevel++;
    }

    for (let i = 2; i <= 12; i++) {
      turn.probLabels.push(`${Math.round(this.prob[i] * 100)}%`);
    }

    turn.probs = { ...this.prob };

    this.prevTurnStack.push(turn);

    return {
      turn: turn,
      averageTurns: this.getAverageTurns(),
    };
  }

  undoTurn() {
    if (this.prevTurnStack.length > 1) {
      this.prevTurnStack.pop();
      const prev = this.prevTurnStack[this.prevTurnStack.length - 1];
      this.prob = { ...prev.probs };
      return {
        turn: prev,
        averageTurns: this.getAverageTurns(),
      };
    }
    return false;
  }

  handleTime(time) {
    if (this.prevTurnStack.length === 0 || time === null) return;
    let turn = this.prevTurnStack[this.prevTurnStack.length - 1];
    turn.turnLength = time;

    const playerIndex = turn.currTurn % this.players.length;
    const roundIndex = Math.floor(turn.currTurn / this.players.length);
    const playerTimes = this.turnTimes[playerIndex];

    if (playerTimes.length > roundIndex) {
      playerTimes[roundIndex] = time;
    } else {
      playerTimes.push(time);
    }
  }

  getAverageTurns() {
    let msg = "Turn Averages:<br>";
    this.players.forEach((player, i) => {
      const times = this.turnTimes[i];
      if (times.length > 0) {
        const avg = times.reduce((a, b) => a + b, 0) / times.length;
        const minutes = Math.floor(avg / 60);
        const seconds = Math.floor(avg % 60)
          .toString()
          .padStart(2, "0");
        msg += `${player}: ${minutes}:${seconds}<br>`;
      } else {
        msg += `${player}: 0:00<br>`;
      }
    });
    return msg.slice(0, -4);
  }
}

function plotRandomNums(n) {
  let rolled = {};
  for (let i = 2; i <= 12; i++) rolled[i] = 0;
  for (let i = 0; i < n; i++) {
    let number = Math.floor(Math.random() * 6) + Math.floor(Math.random() * 6) + 2;
    rolled[number] += 1;
  }
  return rolled;
}

function plotSmudged(n) {
  tempGame = new Game();
  let rolled = {};
  for (let i = 2; i <= 12; i++) rolled[i] = 0;
  for (let i = 0; i < n; i++) rolled[tempGame.rollDice()] += 1;
  return rolled;
}
