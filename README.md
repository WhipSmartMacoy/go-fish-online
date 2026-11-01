# Gin Rummy Online

Two-player Gin Rummy at a virtual card table, right in the browser. No server is needed, so it's hosted free on GitHub Pages.

**Play:** https://whipsmartmacoy.github.io/go-fish-online/

## How to play with a friend
1. Open the link, type your name and press **Create a game**.
2. Press **Copy invite link** and send it to your friend (or tell them the 5-letter room code).
3. When they've joined, press **Start match**.
4. Keep the creator's tab open: their browser runs the game.

## Rules
- Each player gets 10 cards. On your turn, draw from the deck or take the top discard, then discard one card.
  You can't discard a card you just took from the discard pile.
- **Melds** are sets of 3–4 cards of the same rank, or runs of 3+ cards in a row in one suit (ace is low).
- Cards not in a meld are **deadwood**: ace = 1, number cards = their number, face cards = 10.
- With 10 or less deadwood you can **knock** to end the hand. With 0 deadwood it's **Gin**.
- After a knock, the other player lays off loose cards onto the knocker's melds (not allowed after Gin).
- Scoring:
  - Knocker has less deadwood: knocker scores the difference.
  - Defender has equal or less deadwood: **undercut**, defender scores the difference + 25.
  - Gin: 25 + the opponent's deadwood.
- If the deck gets down to 2 cards with no knock, the hand is a draw.
- First to 100 points wins the match.

The game arranges your melds automatically (shown in yellow) and shows your deadwood as you play.

## How it works
The player who creates the game is the host. Their browser deals the cards, checks every move and sends each player only their own hand. The other player connects directly to the host using [PeerJS](https://peerjs.com/) (WebRTC).
