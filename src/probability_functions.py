from constants import *
import random

def find_player(people, person):
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
        
def roll_red_die(roll):
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