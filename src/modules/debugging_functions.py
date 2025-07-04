from modules.game import Game
from modules.constants import *
import matplotlib.pyplot as plt
import random
import numpy as np

def plot_rand(trials):
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
    game = Game()
    rolls = []
    for i in range(trials):
        rolls.append(game.roll_dice())
    bins = np.arange(2, 14) - 0.5
    plt.hist(rolls, bins=bins, density=False)
    plt.xlabel('Rolls')
    plt.ylabel('Count')
    plt.title('Rolls Histogram')
    plt.show()
    
def plot_prob_dist(prob):
    # Print function will create and print a histogram representing the likelyhood that each number gets rolled
    numbers = list(prob.keys())
    probs = list(prob.values())
    
    plt.bar(numbers, probs)
    plt.xlabel('Number')
    plt.ylabel('Probability')
    plt.title('Distribution of Probability')
    plt.show()
    
def check_sum(prob):
    # Used for debugging. If the total probability is not 1, it is not adjusting probabilities correctly. Slight slight variation due to rounding errors
    total = 0.0
    for i in range(2, 13):
        total += prob[i]
    if abs(total - 1) > 1e-9:
        raise ValueError("Total probability is not 1.")


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