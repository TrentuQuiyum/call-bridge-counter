# Call Bridge Points Counter (Our House Rules)

Simple offline points counter for Call Bridge.

## Rules

- Each round must have exactly 13 total tricks
- Round 1 is bid free
  - No calls
  - Points = tricks won
  
- From Round 2 onwards:
  - Calls must be between 2 and 8
  - If call is 8 and tricks ≥ 8, score = 16
  - If tricks ≥ 2 × call, score = -call
  - Else if tricks ≥ call, score = +call
  - Else score = -call

## Run

Open `index.html` in any browser.

No internet required.