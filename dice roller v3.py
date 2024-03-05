import time
import random
import matplotlib.pyplot as plt
import numpy as np

def findPlayer(people, person):
    """Return index of the list where person is in people

    Args:
        people (list of lists of strings)): 2d array where people[n][0] is the name of each player
        person (string): 

    Returns:
        int: returns index of player if they are in list, otherwise returns -1
    """
    for i in range(len(people)):
        if person == people[i][0]:
            return i
    return -1


#Global constants that need to be accessable by many functions
prob = {
    2: 1 / 36, 3: 2 / 36, 4: 3 / 36, 5: 4 / 36, 6: 5 / 36,
    7: 6 / 36, 8: 5 / 36, 9: 4 / 36, 10: 3 / 36, 11: 2 / 36, 12: 1 / 36
}

CONSTANT_POWER = 1
CONSTANT_REMOVE = 1/36 * CONSTANT_POWER

probIncr = {} #Each roll will change a differenet amount depending on its weight
for i in range(2, 13):
    probIncr[i] = prob[i] * CONSTANT_REMOVE

def print_barb_board(level):
    """Prints the barbarian board for Cities and Knights

    Args:
        level (int): represents how far the ship is to getting to the end of the countdown
    """
    print("+---+---+---+---+---+---+---+---+")
    for i in range(2):
        print("|", end = "")
        for j in range(level):
            print("   |", end = "")
        print(" B |", end = "")
        for j in range(7 - level):
            print("   |", end = "")
        print()
    print("+---+---+---+---+---+---+---+---+")
    if(level == 7):
        print("🔥🔥🔥 BARBARIAN ATTACK 🔥🔥🔥")
    else:
        print("")


def red_die(roll):
    """Generates a random dice roll for the red die

    Args:
        roll (int): represents the already found total for the dice roll

    Returns:
        int: random int so that each number is equally likely to come up given the already calculated roll
    """
    if(roll < 7):
        red = random.randint(1, roll - 1)
    else:
        red = random.randint(roll - 6, 6)
    return red

def roll_boat_die():
    """Randomly select a roll for the boat die. 1/2 chance it is barbarians, and 1/6 chance for each color

    Returns:
        string: The resulting die roll
    """
    roll = random.randint(1,6)
    if(roll >= 1 and roll <= 3):
        return "Barbarians"
    if(roll == 4):
        return "🟦 Blue"
    if(roll == 5):
        return "🟩 Green"
    return "🟨 Yellow"

def show_prob_dist():
    #Print function will create and print a histogram representing the likelyhood that each number gets rolled
    numbers = list(prob.keys())
    probs = list(prob.values())
    
    plt.bar(numbers, probs)
    plt.xlabel('Number')
    plt.ylabel('Probability')
    plt.title('Distribution of Probability')
    plt.show()


def check_sum():
    """Used for debugging. If the total probability is not 1, it is not adjusting probabilities correctly. Slight slight variation due to rounding errors
    """
    total = 0.0
    for i in range(2, 13):
        total += prob[i]
    print(total)

def print_dict():
    """Used for debugging. Prints the probability each number gets rolled in the form of a list
    """
    print("\n")
    for i in range(2, 13):
        print(i, ":", prob[i])
    print("\n")


def redistribute(number):  
    """Removes constant probability from the rolled number and redistributes across other numbers. If the rolled number has less than the removed amount, it redistributes the correct amount

    Args:
        number (int): represents the number that was rolled.
    """
    adjustProb = CONSTANT_REMOVE
    if(prob[number] < CONSTANT_REMOVE):
        adjustProb = prob[number]
    prob[number] -= adjustProb
    for i in range(2, 13):
        prob[i] += adjustProb * probIncr[i] / CONSTANT_REMOVE
            

def roll_dice(roll = 0):
    """Generates a random number and finds which roll that number represents to generate a pseudorandom roll with our adjusted probability distribution. It then calls the redistribute function

    Args:
        roll (int, optional): If user wants to manually roll dice, they may enter their roll here. Defaults to 0.

    Returns:
        int: The pseudorandomly generated number
    """
    rand = random.random()
    search = 0.0
    #print(rand)
    if(roll != 0):
        redistribute(roll)
        return roll
    for i in range(2, 13):
        search += prob.get(i)
        if(rand < search):
            redistribute(i)
            return i

def plot_avg(trials):
    """Used for debugging/display. Uses actual "random" number generation to generate dice rolls and prints a histogram representing how frequently each number got rolled on a large scale

    Args:
        trials (int): Represents the number of random numbers to generate. 150 displays the difference well
    """
    rolls = []
    for i in range(trials):
        rolls.append(random.randint(1, 6) + random.randint(1, 6))
    bins = np.arange(2, 14) - 0.5
    plt.hist(rolls, bins=bins, density=False)
    plt.xlabel('Rolls')
    plt.ylabel('Count')
    plt.title('Rolls Perfect Histogram')
    plt.show()
        
def plot_trials(trials):
    """Used for debugging/display. Uses my algorithm to generate pseudorandom numbers to create a more natural distribution. Displays results on histogram

    Args:
        trials (int): Represents hte number of random numbers to generate. 150 displays the difference well
    """
    rolls = []
    for i in range(trials):
        rolls.append(roll_dice())
    bins = np.arange(2, 14) - 0.5
    plt.hist(rolls, bins=bins, density=False)
    plt.xlabel('Rolls')
    plt.ylabel('Count')
    plt.title('Rolls Histogram')
    plt.show()
    
def printHelp():
    """Prints commands the the user can do
    """
    print("Timer is paused\n")
    print("Commands:")
    print(f"\"done\" - finishes game")
    print(f"\"pause\" - pauses the game timer")
    print(f"[player name] - skips to a specific player")
    print()


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
            red = red_die(roll)
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
        if(displayPlots): show_prob_dist()
        print()
        person = input("Hit enter for next roll (-h for help): ")
        if(person == "-h"):
            person = "pause"
            printHelp()
        elif(person in keywords):
            end = time.perf_counter()
            people[turnIndex].append(end-start)
            break
        end = time.perf_counter()
        if(person == "pause"):
            person = input("Hit enter to resume with next player")
        elif(person != "" and findPlayer(people, person) != -1):
            turnIndex = findPlayer(people, person)
        else:
            turnIndex += 1
            if turnIndex >= len(people):
                turnIndex = 0
        print(f"It is now {people[turnIndex][0]}'s turn")
        people[turnIndex-1].append(end-start)
    
    #Prints average turn time for each player
    for player in people:
        if(len(player) == 1):
            print("Remainding players did not play a turn")
            return
        print(f"{player[0]}'s average was {(sum(player[1:])/(len(player)-1))}")
        
play_game()