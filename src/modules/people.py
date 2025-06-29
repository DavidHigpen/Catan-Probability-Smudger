from typing import List

class Person:

    def __init__(self, name: str) -> None:
        self.name: str = name
        self.turns: List[float] = []

    def add_time(self, time: float) -> None:
        self.turns.append(time)

    def get_average(self) -> float:
        if(len(self.turns) == 0):
            return 0
        return sum(self.turns) / len(self.turns)
