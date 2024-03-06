from constants import *

def print_dict():
    """Used for debugging. Prints the probability each number gets rolled in the form of a list
    """
    print("\n")
    for i in range(2, 13):
        print(i, ":", prob[i])
    print("\n")
    
def print_help():
    """Prints commands the the user can do
    """
    print("Timer is paused\n")
    print("Commands:")
    print(f"\"done\" - finishes game")
    print(f"\"pause\" - pauses the game timer")
    print(f"[player name] - skips to a specific player")
    print()
    
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