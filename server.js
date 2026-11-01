// Go Fish server: serves the page and runs the game. The server holds all cards,
// so players only ever see their own hand.
const http = require('http');
const fs = require('fs');
const path = require('path');
const { WebSocketServer } = require('ws');

const PORT = process.env.PORT || 3000;
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const SUITS = ['♠', '♥', '♦', '♣'];
const MAX_PLAYERS = 6;

const server = http.createServer((req, res) => {
  fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
    if (err) { res.writeHead(500); return res.end('error'); }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(data);
  });
});
const wss = new WebSocketServer({ server });

// ---- Game state ----
let players = [];   // { id, name, ws, hand: [{rank,suit}], books: [rank] }
let deck = [];
let turn = 0;       // index into players
let started = false;
let winnerText = '';
let log = [];
let nextId = 1;

const addLog = (t) => { log.push(t); if (log.length > 40) log.shift(); };

function newDeck() {
  const d = [];
  for (const r of RANKS) for (const s of SUITS) d.push({ rank: r, suit: s });
  for (let i = d.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [d[i], d[j]] = [d[j], d[i]]; }
  return d;
}

const sortHand = (h) => h.sort((a, b) => RANKS.indexOf(a.rank) - RANKS.indexOf(b.rank));

// Remove any complete sets of four from a player's hand.
function checkBooks(p) {
  for (const r of RANKS) {
    if (p.hand.filter(c => c.rank === r).length === 4) {
      p.hand = p.hand.filter(c => c.rank !== r);
      p.books.push(r);
      addLog(`📚 ${p.name} completed a book of ${r}s!`);
    }
  }
}

const totalBooks = () => players.reduce((n, p) => n + p.books.length, 0);

function endGame() {
  started = false;
  const best = Math.max(...players.map(p => p.books.length));
  const winners = players.filter(p => p.books.length === best).map(p => p.name);
  winnerText = winners.length > 1
    ? `It's a tie between ${winners.join(' and ')} with ${best} books!`
    : `${winners[0]} wins with ${best} books!`;
  addLog('🏆 ' + winnerText);
}

// Move to the next player who can play. A player with no cards draws one if possible.
function startTurn(index) {
  for (let tries = 0; tries < players.length; tries++) {
    const p = players[index % players.length];
    if (p.hand.length === 0 && deck.length > 0) {
      p.hand.push(deck.pop()); sortHand(p.hand);
      addLog(`${p.name} had no cards and drew one.`);
    }
    if (p.hand.length > 0) { turn = index % players.length; return; }
    index++;
  }
  endGame(); // nobody can play
}

function startGame() {
  deck = newDeck();
  const handSize = players.length <= 3 ? 7 : 5;
  for (const p of players) {
    p.hand = deck.splice(0, handSize); p.books = [];
    sortHand(p.hand); checkBooks(p);
  }
  started = true; winnerText = ''; log = [];
  addLog(`New game! ${handSize} cards each.`);
  startTurn(Math.floor(Math.random() * players.length));
}

function handleAsk(asker, targetId, rank) {
  if (!started || players[turn] !== asker) return;
  const target = players.find(p => p.id === targetId);
  if (!target || target === asker || !RANKS.includes(rank)) return;
  if (!asker.hand.some(c => c.rank === rank)) return; // must hold the rank you ask for

  const got = target.hand.filter(c => c.rank === rank);
  let goAgain = false;
  if (got.length > 0) {
    target.hand = target.hand.filter(c => c.rank !== rank);
    asker.hand.push(...got);
    addLog(`${asker.name} asked ${target.name} for ${rank}s and got ${got.length}! 🎉`);
    goAgain = true;
  } else {
    addLog(`${asker.name} asked ${target.name} for ${rank}s. Go fish! 🐟`);
    if (deck.length > 0) {
      const card = deck.pop();
      asker.hand.push(card);
      if (card.rank === rank) { addLog(`${asker.name} fished the ${rank} they wanted and goes again!`); goAgain = true; }
    } else {
      addLog('The pond is empty.');
    }
  }
  sortHand(asker.hand);
  checkBooks(asker);

  if (totalBooks() === 13) return endGame();
  startTurn(goAgain ? turn : turn + 1);
}

// Send each player a view of the game that hides other players' cards.
function broadcast() {
  for (const p of players) {
    if (p.ws.readyState !== 1) continue;
    p.ws.send(JSON.stringify({
      type: 'state',
      you: p.id,
      started, winnerText, log,
      deckCount: deck.length,
      turnId: started ? players[turn]?.id : null,
      hand: p.hand,
      players: players.map(o => ({ id: o.id, name: o.name, cardCount: o.hand.length, books: o.books }))
    }));
  }
}

wss.on('connection', (ws) => {
  if (players.length >= MAX_PLAYERS || started) {
    ws.send(JSON.stringify({ type: 'error', message: started ? 'A game is in progress. Try again when it ends.' : 'The table is full (6 players).' }));
    return ws.close();
  }
  const p = { id: String(nextId++), name: 'Player ' + nextId, ws, hand: [], books: [] };
  p.name = 'Player ' + p.id;
  players.push(p);
  addLog(`${p.name} joined.`);
  broadcast();

  ws.on('message', (raw) => {
    let msg; try { msg = JSON.parse(raw); } catch { return; }
    if (msg.type === 'name' && typeof msg.name === 'string' && msg.name.trim()) {
      const old = p.name; p.name = msg.name.trim().slice(0, 16);
      addLog(`${old} is now ${p.name}.`);
    }
    if (msg.type === 'start' && !started && players.length >= 2) startGame();
    if (msg.type === 'ask') handleAsk(p, msg.targetId, msg.rank);
    broadcast();
  });

  ws.on('close', () => {
    const idx = players.indexOf(p);
    if (idx === -1) return;
    players.splice(idx, 1);
    addLog(`${p.name} left.`);
    if (started) {
      started = false; winnerText = '';
      for (const o of players) { o.hand = []; o.books = []; }
      addLog('Game stopped because a player left. Press Start to play again.');
    }
    broadcast();
  });
});

server.listen(PORT, () => console.log(`Go Fish running at http://localhost:${PORT}`));
