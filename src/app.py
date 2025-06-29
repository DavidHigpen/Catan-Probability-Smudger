from flask import Flask, render_template, request
from modules.gameFlask import GameFlask

app = Flask(__name__)

@app.route("/")
def hello_world():
    return render_template('index.html')

@app.route('/roll_dice_ajax', methods=['POST'])
def roll_dice_ajax():
    if(not game):
        return {"error": "No game in progress"}, 500
    result = game.flaskTurn()
    probLabels = [str(round(game.prob[i] * 100)) + "%" for i in range(2, 13)]
    probs = [(game.prob[i] * 100) for i in range(2, 13)]
    if game.cities_and_knights:
        roll, red, barbarian = result
        return {"roll": roll, "prob": probs, "probLabels": probLabels, "red": red, "barbarian": barbarian[0]}
    roll = result
    return {"roll": roll, "prob": probs, "probLabels": probLabels}


@app.route('/new_game', methods=['POST'])
def new_game():
    global game
    game = GameFlask()
    data = request.json
    player_count, players = game.flaskInit(data["players"].split(","), data["ck"])
    if player_count > 1:
        return {"player_count": player_count, "players" : players}
    else:
        return {"error": "Please enter at least 2 players"}, 500