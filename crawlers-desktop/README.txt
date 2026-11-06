CRAWLERS DESKTOP  -  creatures that roam over your whole screen
================================================================

What it is
  A see-through overlay that sits on top of every window on every screen. The creatures run, fight and
  mess with the words they find on screen. It is VISUAL ONLY: it never changes, clicks, types into or
  deletes anything in your apps or files. Your mouse and keyboard go straight through it.

How to start (Windows)
  1. Install Node.js (the LTS version) from https://nodejs.org   (one time)
  2. Double-click  start-windows.bat
     The first run installs what it needs (about a minute, needs internet). After that it starts at once.
  Mac / Linux: run  ./start-mac-linux.sh   (on a Mac, allow "Screen Recording" for Electron when asked,
  and the app only reads the screen to find words).

How to stop it  (it is always easy)
  - Press  Ctrl + Alt + Q  anywhere
  - or right-click / click the tray icon (near the clock) and choose Quit
  - or close it from Task Manager. It never starts by itself and never hides.

Hotkeys
  Ctrl+Alt+Q  quit        Ctrl+Alt+P  pause / resume
  Ctrl+Alt+H  heal the screen (undo all effects)        Ctrl+Alt+Space  special move

Tray menu
  Pick the creature (centipede, spider, fire hero, speedster, chomper, stick gang, starship, tank,
  Terrarian, or the endless-waves arena), turn screen-text reading on or off, pixel outline, reduced
  effects (lighter on the CPU), and show the "how to quit" banner again.

How it finds words
  About every second it takes a screenshot of each screen, reads the text with OCR (tesseract.js), and
  gives the creatures those word boxes. Words they "destroy" are only covered up and redrawn on the
  overlay. After about 30 seconds the effects fade and the screen is back to normal. Everything stays on
  your computer. The only download is the English OCR language file the first time it runs.

Good to know
  - Mouse clicks cannot be detected through the overlay, so special moves fire from the hotkey
    (Ctrl+Alt+Space) and automatically every 15 seconds while you are moving the mouse.
  - OCR is not perfect: some words are missed, and covered words may look slightly off on busy backgrounds.
  - Reading the screen uses some CPU. If your PC feels slow, turn off "Read screen text" or "Pixel outline",
    or turn on "Reduced effects".
  - Full-screen games that take exclusive control of the display can hide the overlay.
  - This build was tested in a simulated environment only. Please try it and report any error you see.

Credits
  Effects and critter animations use PixelFX (MIT license), see PIXELFX-LICENSE.txt.
