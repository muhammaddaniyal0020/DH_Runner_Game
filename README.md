# 🏃 The D&H Forest Runner

A bright, colorful **3D endless runner** built with Three.js — dodge obstacles, grab power-ups, pick from 10 unique characters, and race friends in real-time multiplayer.

🔗 **Play it live:** [dh-runner.vercel.app](https://dh-runner.vercel.app)

---

## ✨ Features

- **3D endless runner** rendered with [Three.js](https://threejs.org/) — daylight forest environment with dynamic lighting and shadows
- **10 playable characters**, each with their own look and named ability (e.g. Street Speed, Kickflip, Endurance, Stealth Dash, Hover, Star Power, Plunder, and more)
- **Power-ups** you can pick up mid-run:
  - 🛡️ **God Mode** — temporary invincibility
  - 🚀 **Jet Pack** — fly above obstacles
  - 🧲 **Magnet** — auto-collect nearby coins
  - 👟 **Super Shoes** — safely smash through obstacles while jumping
- **Startup boosters** — choose a head-start power-up before you begin
- **Coins, combos, and a live score/speed HUD**
- **Real-time multiplayer** — create or join a room with a 4-character code and race other players over WebSockets
- **Responsive controls** — arrow keys / WASD on desktop, swipe gestures on mobile
- **Original sound effects** generated with the Web Audio API (no external audio files needed for SFX)
- Animated main menu, character select carousel, and credits screen

---

## 🎮 Controls

| Action | Desktop | Mobile |
|---|---|---|
| Change lane | `←` / `→` or `A` / `D` | Swipe left / right |
| Jump | `↑`, `W`, or `Space` | Swipe up |
| Duck | `↓` or `S` | Swipe down |

---

## 🕹️ How to Play

1. Open the game and choose **Single Player** or **Multiplayer** from the main menu.
2. Pick your character from the character select screen.
3. (Optional) Choose a startup booster to begin the run with a head start.
4. Dodge cars, hurdles, and other obstacles while collecting coins and power-ups.
5. Chain coin pickups for **combo** score multipliers.
6. Survive as long as you can — your run speed increases over time, and your best score is saved locally.

### Multiplayer
- Select **Multiplayer**, then **Create Room** to get a shareable 4-character room code, or **Join Room** to enter one.
- Once everyone in the lobby is marked **Ready**, the race begins — see other players' positions and name tags live as you run.

---

## 🛠️ Tech Stack

- **Rendering:** [Three.js](https://threejs.org/) (r128) for the 3D scene, characters, and environment
- **Frontend:** Vanilla HTML / CSS / JavaScript (no build step required)
- **Audio:** Web Audio API for procedurally generated sound effects
- **Multiplayer:** WebSocket-based real-time server (see [`/server`](./server))
- **Fonts:** Google Fonts (Fredoka One, Nunito)

---

## 📁 Project Structure

```
DH_Runner_Game/
├── index.html      # Main game entry point
├── assets/         # Images, textures, and other static assets
├── Music/          # Background music tracks
├── server/         # WebSocket multiplayer server
└── README.md
```

---

## 🚀 Running Locally

The game itself is a static site with no build step:

```bash
git clone https://github.com/muhammaddaniyal0020/DH_Runner_Game.git
cd DH_Runner_Game
```

Then simply open `index.html` in your browser, or serve it locally, e.g.:

```bash
npx serve .
```

### Enabling Multiplayer Locally

Multiplayer requires the WebSocket server in [`/server`](./server) to be running. By default the client connects to:

```
ws://localhost:3000
```

Start the server (from the `server` directory, following its own setup instructions), then launch the game — multiplayer rooms will work against your local server.

To point the game at a deployed server instead, update the `SERVER_URL` constant in `index.html`.

---

## 🌐 Deployment

The live version is deployed on [Vercel](https://vercel.com): **[dh-runner.vercel.app](https://dh-runner.vercel.app)**

---

## 👨‍💻 Developers

- **Muhammad Daniyal** — [GitHub](https://github.com/muhammaddaniyal0020) · [LinkedIn](https://www.linkedin.com/in/muhammad-daniyal-557b36293/)
- **Syeda Dua Bukhari** — [GitHub](https://github.com/syeda-duaa) · [LinkedIn](https://www.linkedin.com/in/syeda-duaa-bukhariri-783911352/)
- **Bushra Javed** — [GitHub](https://github.com/Bushra844) · [LinkedIn](https://www.linkedin.com/in/bushra-javed-9a5516372/)

---

## 🤝 Contributing

Contributions, bug reports, and feature suggestions are welcome! Feel free to open an issue or submit a pull request.

## 📄 License

No license has been specified for this repository yet. Feel free to reach out to the repository owner if you'd like to use this project.
