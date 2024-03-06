# Catan-Probability-Smudger

## About

### My Problem
I enjoy playing The Settlers of Catan with my family, however one time I was playing and the numbers of my hexes just weren't getting rolled. The second problem is that *certain* familiy members would take forever on their turns and when I told them that they took 3 times longer than me, they simply denied it...

### My Solution
To solve the first problem, I decided to make a python program to manipulate the probability such that certain numbers can be due to come up. The program utilizes the libraries time, random, matplotlib, and numpy to create a more normal distribution of dice rolls. Whenever a certain number is rolled, it decreses the likelyhood of that number gets rolled again proportional to how likely it is to get rolled in the first place. It then increases each other probability for each other roll. Addionally, it will manage dice rolls for the Cities and Knights variant of Catan. To solve my second problem, I had the program ask the user for the names of each player and keep track of whos turn it is. At the end of the program it will print the average time each player took. I can't force people to finish quickly but I can make a program to show them how long they take.

## Functions

### Gameplay function:
- **play_game(displayPlots = False)**: Main function will run other function and keep track of timer

### Debugging and graphing functions:
- **plot_rand(trials)**: Creates a histogram that contains the results of randomly rolling 'trials' rolls.
- **plot_trials(trials)**: Creates a histogram that contains the results of rolling 'trials' rolls using the algorithm held in the program.
- **plot_prob_dist()**: Creates a histogram that displays the dictionary 'prob'. This shows how likely each number is to be rolled at the current moment.
- **check_sum()**: Sums up all probabilites in 'prob' and prints the total. If the total is not close to 1, it throws an error.

### Printing functions:
- **print_dict()**: Prints the probability of getting rolled for each number in list form.
- **print_help()**: Prints instructions on how to use the program to the user.
- **print_barb_board(level)**: Prints a board representing the barbarian counter for Cities and Knights.

### Probability functions:
- **find_player(people, person)**: Given a player name, return its index in people. People is a list of lists where people[n][0] contains the name of each player.
- **redistribute(number)**: Distributes 'number' amount of probability across each roll such that each is each increases by the proportional amount.
- **roll_dice(roll = 0)**: Generates a number using the distributions from 'prob'
- **roll_red_die(roll)**: Given the roll, generates a random number that represents the red die
- **roll_boat_die()**: Generates a random roll for the boat die for Cities and Knights

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