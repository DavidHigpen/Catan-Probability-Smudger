from modules.game import Game

class GameFlask(Game):
    def flaskInit(self, players, ck):
        for player in players:
            if player:
                self.players.append(player)
        self.cities_and_knights = ck
        self.current_turn = -1
        return len(self.players), self.players

    def flaskTurn(self):
        # self.current_turn = (self.current_turn + 1) % len(self.players)
        print(self.current_turn)
        main_roll = self.roll_dice()
        # player = self.players[self.current_turn]
        if(self.cities_and_knights):
            red = self.roll_red_die(main_roll)
            boat = self.roll_boat_die()
            if(boat == "Barbarians"):
                self.barb_ship_counter += 1
            if(self.barb_ship_counter == 7):
                boat = "A"
            self.barb_ship_counter %= 7
            return main_roll, red, boat#, player
        return main_roll#, player
    
    # Prev Turn Stack
    # Next Turn Stack
    