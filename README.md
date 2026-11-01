# Go Fish Online

Multiplayer Go Fish for 2–6 players that runs entirely in the browser. No server is needed, so it's hosted free on GitHub Pages.

**Play:** https://whipsmartmacoy.github.io/go-fish-online/

## How to play with friends
1. Open the link, type your name and press **Create a game**.
2. Press **Copy invite link** and send it to friends (or tell them the 5-letter room code).
3. When everyone has joined, the creator presses **Start game**.
4. Keep the creator's tab open: their browser runs the game.

## Rules
- 2–3 players get 7 cards each, 4–6 players get 5.
- On your turn, ask another player for a rank you already hold.
- If they have it, they hand over all of those cards and you go again.
- If not, "go fish": draw from the pond. If you draw the rank you asked for, go again.
- Four of a kind makes a book. Most books when all 13 are made wins.

## How it works
The player who creates the game is the host. Their browser deals the cards, checks every move and sends each player only their own hand. Other players connect directly to the host using [PeerJS](https://peerjs.com/) (WebRTC), which uses PeerJS's free public service to introduce the players to each other.

## Turning on GitHub Pages
Settings → Pages → Branch: `main`, folder `/ (root)` → Save.
