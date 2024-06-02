from typing import List, Tuple
import time

from modules.people import Person
from modules.probability_functions import roll_dice, roll_red_die, roll_boat_die
from modules.print_functions import print_barb_board, print_dict, print_help

class Game:
    players: List[Person] = []
    person: str = ''
    cities_and_knights: bool = False
    current_turn: int = 0
    barb_ship_counter: int = 0

    def __init__(self):
        self.create_people()
        self.ask_cities_and_knights()
        input(f"Hit enter to start {self.players[0].name}'s turn")
        self.normal_turn()
        self.play_game()

    def create_people(self) -> None:
        while(True):
            person: str = input('Enter a player, type "done" to be done: ')
            if(not person):
                print('Please enter a valid player name')
            if(person.lower() == 'done'):
                if(not self.players):
                    print('Please enter more players')
                    continue
                break
            self.players.append(Person(person))

    def ask_cities_and_knights(self):
        self.cities_and_knights = input("Are you playing Cities and Knights? (y/n)") == "y"

    def play_game(self):
        while(True):
            self.do_turn()

    def end_turn(self):
        end = time.perf_counter()
        self.players[self.current_turn].add_time(end - self.start)
        self.current_turn = (self.current_turn + 1) % len(self.players)
    

    def normal_turn(self, roll: int = None):
        print(f"It is now {self.players[self.current_turn].name}'s turn")
        self.start = time.perf_counter()
        if roll == None:
            roll = roll_dice()
        print("\nRoll is", roll)
        if(self.cities_and_knights):
            self.cities_and_knights_turn(roll)
        

    def cities_and_knights_turn(self, roll):
        red = roll_red_die(roll)
        boat = roll_boat_die()
        if(boat == "Barbarians"):
            self.barb_ship_counter += 1
            print("⚔️ Barbarians advance")
        else:
            print(boat, red)
        print_barb_board(self.barb_ship_counter)
        self.barb_ship_counter %= 7


    def do_turn(self):
        command = input("Hit enter for next roll (-h for help): ")
        if command == '':
            self.end_turn()
            self.normal_turn()
        elif command in ('-h', 'help', 'h'):
            print_help()
        elif command in ('exit', 'quit', 'done'):
            end = time.perf_counter()
            self.players[self.current_turn].add_time(end - self.start)
            self.print_times()
            exit()
        elif command in ('-p', 'pause', 'p'):
            paused_time = time.perf_counter() - self.start
            input('Timer is paused, hit enter to resume turn')
            self.start = time.perf_counter() - paused_time
        elif command in ('dist', 'd'):
            print_dict()
        elif command in ('time'):
            print(f'{self.players[self.current_turn].name}\'s timer is at {time.perf_counter() - self.start:.2f} seconds')
        elif command in ('times'):
            self.print_times()
        elif command.isdigit() and int(command) >= 2 and int(command) <= 12:
            self.end_turn()
            self.normal_turn(int(command))
        elif self.find_player(command) != -1:
            self.end_turn()
            self.current_turn = self.find_player(command)
            self.normal_turn()
        else:
            print('Invalid command')
        
            
        


    def find_player(self, person):
        """Return index of the list where person is in people

        Args:
            people (list of lists of strings)): 2d array where people[n][0] is the name of each player
            person (string): 

        Returns:
            int: returns index of player if they are in list, otherwise returns -1
        """
        for i in range(len(self.players)):
            if person == self.players[i].name:
                return i
        return -1

    def print_times(self) -> None:
        print()
        for player in self.players:
            print(f'{player.name}\'s average time was {player.get_average():.2f} seconds')
        print()