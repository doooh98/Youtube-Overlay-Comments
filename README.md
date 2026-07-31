# YouTube Overlay Comments

A Chrome extension that displays timestamped YouTube comments directly on the video screen.

![Demo Screenshot](https://github.com/doooh98/Youtube-Overlay-Comments/assets/77437338/ee6c2ec3-7d90-4861-90f2-1677a5385f2b)

---

## Installation

### Manual Installation (Developer Mode)

1. **Download the Repository**  
   [Download the zip file](https://github.com/doooh98/Youtube-Overlay-Comments/archive/refs/heads/main.zip) of this project and extract it to a preferred folder on your computer.

2. **Configure API Key**  
   Obtain a **YouTube Data API v3 key** (you can follow [this video tutorial](https://www.youtube.com/watch?v=SIm2W9TtzR0) up to 1:00). Paste your generated key into the `api.js` file.

3. **Open Chrome Extensions Page**  
   Open Google Chrome, navigate to `chrome://extensions/` in your address bar, and toggle on **Developer mode** in the top-right corner.

   ![Enable Developer Mode](https://github.com/doooh98/Youtube-Overlay-Comments/assets/77437338/99e10d20-b4dd-4355-9826-47721627b48e)

4. **Load the Unpacked Extension**  
   Click the **Load unpacked** button in the top-left menu.

   ![Click Load Unpacked](https://github.com/doooh98/Youtube-Overlay-Comments/assets/77437338/e1e296bd-3d50-4569-94cc-80e80c91ae0b)

5. **Select Folder & Enable**  
   Select the extracted project folder. Ensure the extension is switched **ON** in your list of installed extensions.

---

## Usage

Navigate to any video on YouTube—the extension will launch automatically and overlay timestamped comments on the video. Enjoy!

---

## Credits & Acknowledgments

This project was originally initiated at [EchoLab](https://echolab.cs.vt.edu/) to research how draggable, timestamped comment overlays affect user experience during video playback. While initial user testing indicated that draggable interface elements added unintended friction—leading to a pause in active research—the core overlay functionality remains fully open and usable.

Special thanks to **[Prof. SangWon Lee](https://echolab.cs.vt.edu/sangwonlee/)** and **[Emily Altland](https://github.com/ealtland99)** for their valuable guidance, feedback, and support throughout this project.
