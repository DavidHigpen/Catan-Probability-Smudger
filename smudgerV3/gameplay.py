from printing_functions import *
from debugging_functions import *
from probability_functions import *
import time


def play_game(displayPlots = False):
    """Main function. When called it will ask for user names and ask if we are playing the Citis and Knights expansion. From there will play the game until one of the keywords are entered

    Args:
        displayPlots (bool, optional): If true, it will display a histogram showing the updated distribution after each roll. If in VSCode, run in interactive window. Defaults to False.
    """
    people = []
    person = ""
    keywords = ("exit", "quit", "done")
    #This while loop will ask for player names and add them to the list 'people'
    while (True):
        person = input("Enter a player, type \"done\" to be done: ")
        if(person == "done"):
            if(not people):
                print("You need at least one player")
                continue
            break
        people.append([person])
    CaK = True if (input("Are you playing Cities and Knights? (y/n)") == "y") else False
    input(f"Hit enter to start {people[0][0]}'s turn")
    turnIndex = 0
    barbShipCounter = 0
    
    while(True):
        #Keeps a timer
        start = time.perf_counter()
        roll = roll_dice()
        print("\nRoll is", roll)
        #Optional Cities and Knights additional rolls
        if(CaK):
            red = roll_red_die(roll)
            boat = roll_boat_die()
            if(boat == "Barbarians"):
                barbShipCounter += 1
                print("⚔️ Barbarians advance")
            else:
                print(boat, red)
            print_barb_board(barbShipCounter)
            if(barbShipCounter == 7):
                barbShipCounter = 0
        #Optional histogram display
        if(displayPlots): plot_prob_dist()
        print()
        person = input("Hit enter for next roll (-h for help): ")
        if(person == "-h"):
            person = "pause"
            print_help()
        elif(person in keywords):
            end = time.perf_counter()
            people[turnIndex].append(end-start)
            break
        end = time.perf_counter()
        if(person == "pause"):
            person = input("Hit enter to resume with next player")
        elif(person != "" and find_player(people, person) != -1):
            turnIndex = find_player(people, person)
        else:
            turnIndex += 1
            if turnIndex >= len(people):
                turnIndex = 0
        print(f"It is now {people[turnIndex][0]}'s turn")
        people[turnIndex-1].append(end-start)
        check_sum()
    
    #Prints average turn time for each player
    for player in people:
        if(len(player) == 1):
            print("Remainding players did not play a turn")
            return
        print(f"{player[0]}'s average was {(sum(player[1:])/(len(player)-1))}")