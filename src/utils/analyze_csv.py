import csv
from collections import Counter

csv_path = r"C:\Users\Micha\.gemini\antigravity\scratch\tech-radar\Tech Radar inzet robots in de bouw - Blad1.csv"

with open(csv_path, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    bouwtaken = Counter()
    type_robots = Counter()
    statussen = Counter()
    for row in reader:
        bouwtaken[row['Bouwtaak']] += 1
        type_robots[row['Type Robot']] += 1
        statussen[row['Radar (Status)']] += 1

print("--- Bouwtaak ---")
for k, v in bouwtaken.most_common():
    print(f"{k}: {v}")

print("\n--- Type Robot ---")
for k, v in type_robots.most_common():
    print(f"{k}: {v}")

print("\n--- Radar (Status) ---")
for k, v in statussen.most_common():
    print(f"{k}: {v}")
