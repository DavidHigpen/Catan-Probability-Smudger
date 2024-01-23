import random
import matplotlib.pyplot as plt
import numpy as np

prob = {
    2: 1 / 36, 3: 2 / 36, 4: 3 / 36, 5: 4 / 36, 6: 5 / 36,
    7: 6 / 36, 8: 5 / 36, 9: 4 / 36, 10: 3 / 36, 11: 2 / 36, 12: 1 / 36
}

CONSTANT_POWER = 1
CONSTANT_REMOVE = 1/36 * CONSTANT_POWER

probIncr = {}
for i in range(2, 13):
    probIncr[i] = prob[i] * CONSTANT_REMOVE


def red_dice(roll):
    if(roll < 7):
        red = random.randint(1, roll - 1)
    else:
        red = random.randint(roll - 6, 6)
    return red


def yellow_dice(roll, redRoll):
    return roll - redRoll


def show_prob_dist():
    numbers = list(prob.keys())
    probs = list(prob.values())
    
    # Plotting the histogram
    plt.bar(numbers, probs)
    plt.xlabel('Number')
    plt.ylabel('Probability')
    plt.title('Distribution of Probability')
    plt.show()


def check_sum():
    total = 0.0
    for i in range(2, 13):
        total += prob[i]
    print(total)

def print_dict():
    print("\n")
    for i in range(2, 13):
        print(i, ":", prob[i])
    print("\n")
        
def add_back():
    for i in range(2, 13):
        prob[i] += probIncr[i]


def redistribute(number):  
    if(prob[number] < CONSTANT_REMOVE):
        adjustProb = prob[number]
        prob[number] = 0.0
        #totalProb = 0.0
        for i in range(2, 13):
            prob[i] = prob[i] + adjustProb * probIncr[i] / CONSTANT_REMOVE
            #totalProb += prob[i]
    else:
        prob[number] -= CONSTANT_REMOVE
        add_back()
    
            

def roll_dice(roll = 0):
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
    rolls = []
    for i in range(trials):
        rolls.append(random.randint(1, 6) + random.randint(1, 6))
    bins = np.arange(2, 14) - 0.5
    plt.hist(rolls, bins=bins, density=False)
    plt.xlabel('Rolls')
    plt.ylabel('Count')
    plt.title('Actual Rolls Histogram')
    plt.show()
        
def plot_trials(trials):
    rolls = []
    for i in range(trials):
        rolls.append(roll_dice())
    bins = np.arange(2, 14) - 0.5
    plt.hist(rolls, bins=bins, density=False)
    plt.xlabel('Rolls')
    plt.ylabel('Count')
    plt.title('Fudged Probability Histogram')
    plt.show()

def play_game():
    while(True):
        show_prob_dist()
        userIn = input("hit enter to roll dice")
        if(userIn == 'quit'):
            break
        try:
            if(int(userIn) >= 2 and int(userIn) <= 12):
                print("You entered", roll_dice(int(userIn)))
        except:
            roll = roll_dice()
            red = red_dice(roll)
            print("Roll is", roll, "Red is", red, "Yellow is", yellow_dice(roll, red))
        #print_dict()
        #check_sum()

tests = 150
plot_avg(tests)
plot_trials(tests)
#play_game()