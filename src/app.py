from flask import Flask, render_template, request
from modules.gameFlask import GameFlask
from modules.game import Game
import random
import uuid

app = Flask(__name__)
gameStates = {}

@app.after_request
def add_cache_control(response):
    if request.path.startswith('/static/'):
        if request.path.endswith('.png'):
            response.headers['Cache-Control'] = 'public, max-age=31536000'
        else:
            response.headers['Cache-Control'] = 'no-store'
    return response

@app.route("/")
def hello_world():
    return render_template('index.html')

@app.route('/new_game', methods=['POST'])
def new_game():
    # data = request.json["session"]
    data = request.json
    game_id = data["game_id"]
    if(not game_id):
        game_id = str(uuid.uuid4())
    game = GameFlask(data["players"].split(","), data["ck"])
    gameStates[game_id] = game
    if game.playerCount > 1:
        return {"playerCount" : game.playerCount, "players": game.players, "game_id": game_id}
    else:
        return {"error": "Please enter at least 2 players"}, 500

@app.route('/do_turn_ajax', methods=['POST'])
def do_turn_ajax():
    data = request.json
    game = gameStates.get(data["game_id"])
    if(not game):
        return {"error": "No game in progress"}, 500
    result = game.flaskTurn(data["time"], data["skip"])
    return result

@app.route('/undo_turn_ajax', methods=['POST'])
def undo_turn_ajax():
    data = request.json
    game = gameStates.get(data["game_id"])
    result = game.undoTurn()
    if(result):
        return result
    return {"error": "No turn to undo"}, 500

@app.route('/get_turn_averages', methods=['GET'])
def get_turn_averages():
    game_id = request.args.get("game_id")
    game = gameStates.get(game_id)
    if not game:
        return {"error": "No game in progress"}, 500
    return {"averageTurns": game.getAverageTurns()}

@app.route('/get_turns', methods=['GET'])
def get_turns():
    return {"real": getRandomNums(72), "smudged": getSmudged(72)}


def getRandomNums(n):
    rolled = {i : 0 for i in range(2, 13)}
    for i in range(n):
        rolled[random.randint(1, 6) + random.randint(1, 6)] += 1
    return rolled

def getSmudged(n):
    game = Game()
    rolled = {i : 0 for i in range(2, 13)}
    for i in range(n):
        rolled[game.roll_dice()] += 1
    return rolled