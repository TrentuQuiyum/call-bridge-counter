# Call Bridge Points Counter

Simple offline points counter for Call Bridge.

Rules implemented:
- Round 1 is bid free (no calls, no points)
- From Round 2: call range 2 to 8
- If call is 8 and tricks >= 8, score = 16
- If tricks >= 2 * call, score = -call
- Else if tricks >= call, score = +call
- Else score = -call

## Run
Just double click `index.html`.

## Optional
You can host it on GitHub Pages:
- Push to GitHub
- Settings -> Pages
- Deploy from branch -> main -> root
