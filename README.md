# Catan-Probability-Smudger

Uses the libraries random, matplotlib, and numpy to create a more normalized distribution of dice rolls
Whenever a certain number is rolled, it decreses the likelyhood of that number gets rolled again proportional to how likely it is to get rolled. It then increases each other probability for each other roll.

The function plot_trials(trials) will roll the dice with the pseudo-random algorithm I developed trials times and graph how many times each number got rolled. It will then graph a histogram displaying this distribution.

The function plot_avg(trials) will simulate rolling two fair dice (using python's random library) and plot those rolls on a histogram.

After comparing the two plots, my algorithm provides a more consistant and normalized distribution.


The function play_game() is the main function. While the game is running, the user can either hit enter in the terminal to generate a dice roll or enter a roll manually (for special cards or events). The game ends when "quit" is entered.
