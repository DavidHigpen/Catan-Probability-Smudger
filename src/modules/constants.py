CONSTANT_POWER = 1
CONSTANT_REMOVE = 1/36 * CONSTANT_POWER

defaultProb = {
    2: 1 / 36, 3: 2 / 36, 4: 3 / 36, 5: 4 / 36, 6: 5 / 36,
    7: 6 / 36, 8: 5 / 36, 9: 4 / 36, 10: 3 / 36, 11: 2 / 36, 12: 1 / 36
}

probIncr = {} #Each roll will change a differenet amount depending on its weight
for i in range(2, 13):
    probIncr[i] = defaultProb[i] * CONSTANT_REMOVE