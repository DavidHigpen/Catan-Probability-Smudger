from typing import List, Tuple
import random
from modules.constants import *

class Game:
    def __init__(self):
        self.players = []
        self.person: str = ''
        self.cities_and_knights: bool = False
        self.current_turn: int = 0
        self.barb_ship_counter: int = 0

        self.prob = {
            2: 1 / 36, 3: 2 / 36, 4: 3 / 36, 5: 4 / 36, 6: 5 / 36,
            7: 6 / 36, 8: 5 / 36, 9: 4 / 36, 10: 3 / 36, 11: 2 / 36, 12: 1 / 36
        }

    def redistribute(self, number):  
        # Removes constant probability from the rolled number and redistributes across other numbers. If the rolled number has less than the removed amount, it redistributes the correct amount
        adjustProb = CONSTANT_REMOVE
        if(self.prob[number] < CONSTANT_REMOVE):
            adjustProb = self.prob[number]
        self.prob[number] -= adjustProb
        for i in range(2, 13):
            self.prob[i] += adjustProb * probIncr[i] / CONSTANT_REMOVE
            
    def roll_dice(self, roll = 0):
        # Generates a random number and finds which roll that number represents to generate a pseudorandom roll with our adjusted probability distribution. It then calls the redistribute function
        rand = random.random()
        search = 0.0
        if(roll != 0):
            self.redistribute(roll)
            return roll
        for i in range(2, 13):
            search += self.prob.get(i)
            if(rand < search):
                self.redistribute(i)
                return i
            
    def roll_red_die(self, roll):
        # Generates a random dice roll for the red die
        if(roll < 7):
            red = random.randint(1, roll - 1)
        else:
            red = random.randint(roll - 6, 6)
        return red

    def roll_boat_die(self):
        # Randomly select a roll for the boat die. 1/2 chance it is barbarians, and 1/6 chance for each color
        roll = random.randint(1,6)
        if(roll <= 3):
            return "Barbarians"
        if(roll == 4):
            return "🟦 Blue"
        if(roll == 5):
            return "🟩 Green"
        return "🟨 Yellow"