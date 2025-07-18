from modules.game import Game
from dataclasses import dataclass, field # struct like object
from copy import deepcopy

@dataclass
class TurnData:
    roll: int = 0 # sum of two dice
    red: str = "" # one of the two dice
    barbarian: str = "" # barbarian dice roll
    player: str = "" # current player's name
    probs: list = field(default_factory=list) # decimal probability values
    probLabels: list = field(default_factory=list) # percentage probability values
    turnLength: int = 0 # this turn's length in seconds
    currTurn: int = -1 # index of turn
    barbLevel: int = 0 # location of barbarian boat

class GameFlask(Game):
    def __init__(self, players, ck):
        super().__init__()
        for player in players:
            if player:
                self.players.append(player)
        self.cities_and_knights = ck
        self.prevTurnStack = []
        self.nextTurnStack = []
        self.playerCount = len(self.players)
        self.turnTimes = [[] for _ in range(self.playerCount)]

    def flaskTurn(self, time = None, skip = False): # checks if there's already been a loaded turn, if not generate and return a new roll
        if(time != None and len(self.prevTurnStack) > 0):
            self.prevTurnStack[-1].turnLength = time
            self.handleTime(self.prevTurnStack[-1].currTurn, time)

        turn = deepcopy(self.prevTurnStack[-1]) if self.prevTurnStack else TurnData()
        turn.currTurn += 1 
        if(skip):
            turn.roll = "Turn Skipped"
            turn.red = ""
        else:
            turn.roll = self.roll_dice()
            turn.red = self.roll_red_die(turn.roll)
        turn.turnLength = 0
        turn.player = self.players[turn.currTurn % self.playerCount]
        turn.barbarian = self.roll_boat_die()[2]
        if(turn.barbarian == "r"):
            turn.barbLevel += 1
            turn.barbarian = "Barb"
        if(turn.barbLevel == 7):
            turn.barbarian = "A"
        turn.barbLevel %= 7

        turn.probLabels = [str(round(self.prob[i] * 100)) + "%" for i in range(2, 13)]
        turn.probs = deepcopy(self.prob) #[(self.prob[i] * 100) for i in range(2, 13)]

        self.prevTurnStack.append(turn)

        return {"turn": self.prevTurnStack[-1], "averageTurns": self.getAverageTurns()}

    def undoTurn(self): # handles stack logic and returns previous turn
        if(len(self.prevTurnStack) > 1):
            self.prevTurnStack.pop() # remove the currently shown turn
            self.prob = deepcopy(self.prevTurnStack[-1].probs) # reset the probabilities to the previous turn
            return {"turn": self.prevTurnStack[-1], "averageTurns": self.getAverageTurns()} # return the new current turn
        return False

    def handleTime(self, turn, time):
        if(len(self.turnTimes[turn % self.playerCount]) > turn // self.playerCount): # if turn existed already
            self.turnTimes[turn % self.playerCount][turn // self.playerCount] = time # update time
        else:
            self.turnTimes[turn % self.playerCount].append(time) # add new time
    
    def getAverageTurns(self):
        msg = "Turn Averages:<br>"
        for i in range(len(self.players)):
            player = self.players[i]
            if len(self.turnTimes[i]) > 0:
                avg_time = sum(self.turnTimes[i]) / len(self.turnTimes[i])
                msg += f"{player}: "
                # if(avg_time >= 60):
                msg += f"{ avg_time // 60:.0f}:{"0" if avg_time % 60 < 10 else ""}{avg_time % 60:.0f}"
                # else:
                    # msg += f"{avg_time % 60:.0f} secs"
                msg += "<br>"
            else:
                msg += f"{player}: 0:00<br>"
        return msg[:-4] 