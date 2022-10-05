import datetime
import os
import requests

with open(f"./backup.log", "a+") as f:
    data = os.popen("curl -s https://weekgame.ntuee.org/api/leaderboard").read()
    f.write(str(datetime.datetime.now()) + data + "\n")

requests.post("https://weekgame.ntuee.org/api/reloadLeaderboard")
