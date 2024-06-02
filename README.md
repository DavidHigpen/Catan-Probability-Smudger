# Catan-Probability-Smudger

## About

### My Problem
I enjoy playing The Settlers of Catan with my family, however one time I was playing and the numbers of my hexes just weren't getting rolled. The second problem is that *certain* familiy members would take forever on their turns and when I told them that they took 3 times longer than me, they simply denied it...

### My Solution
To solve the first problem, I decided to make a python program to manipulate the probability such that certain numbers can be due to come up. The program utilizes the libraries time, random, matplotlib, and numpy to create a more normal distribution of dice rolls. Whenever a certain number is rolled, it decreses the likelyhood of that number gets rolled again proportional to how likely it is to get rolled in the first place. It then increases each other probability for each other roll. Addionally, it will manage dice rolls for the Cities and Knights variant of Catan. To solve my second problem, I had the program ask the user for the names of each player and keep track of whos turn it is. At the end of the program it will print the average time each player took. I can't force people to finish quickly but I can make a program to show them how long they take.

## Installation
1. Clone this repo to your local machine.
```bash
git clone https://github.com/DavidHigpen/Catan-Probability-Smuddger.git
```
2. Install the required libraries: `matplotlib` and `numpy`.
```bash
pip install numpy matplotlib
```
3. Run the main program file: `python3 main.py`.

## Useage
- After running the program, the program will prompt you to add all players

- It will also prompt you asking if you want the additional Cities and Knights functionality

    - If you choose to inlcude this, it will roll the additional die and manage the barbarian board

- Once you're ready to start rolling, hit enter and game will being

| Command | Action |
| --- | --- |
| "done", "exit", "quit" | Finishes the game |
| "pause", "p", "-p" | Pauses the timer, resumes with same player |
| "dist", "d", "-d" | Prints the probability that each number will be rolled |
| "times" | Prints the current average time for each player |
| "time" | Prints the length of the current turn |
| [roll] | Manually select roll for the next turn |
| [player name] | Skip to entered player's turn |
| [player name] -n | Skip to entered player's turn without rolling |