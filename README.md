# Go Fish Online

Multiplayer Go Fish for 2–6 players in the browser.

## Run it on your computer
1. Install Node.js (version 18 or newer).
2. In this folder, run:
   ```
   npm install
   npm start
   ```
3. Open http://localhost:3000 in two or more browser tabs, then press **Start game**.

## Put it online with Render
1. Upload `server.js`, `index.html`, `package.json` and `README.md` to a new GitHub repository (not `node_modules`).
2. On render.com, create a **Web Service** from that repository.
3. Language: Node · Build command: `npm install` · Start command: `npm start` · Instance type: Free.
4. Share the `.onrender.com` link with friends.

## How it works
The server deals and holds every card, checks every move, and sends each player only their own hand, so nobody can peek at other players' cards.

## Rules
- 2–3 players get 7 cards each, 4–6 players get 5.
- On your turn, ask another player for a rank you already hold.
- If they have it, they hand over all of those cards and you go again.
- If not, "go fish": draw from the pond. If you draw the rank you asked for, go again.
- Four of a kind makes a book. Most books when all 13 are made wins.
