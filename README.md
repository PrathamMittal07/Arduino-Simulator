# Arduino-Simulator
A web-based Arduino simulator built with React.js &amp; Fabric.js for FOSSEE Internship 2026, IIT Bombay. Features drag-and-drop components, intelligent orthogonal wiring, real-time logic simulation, and dynamic C++ code generation for risk-free electronics learning.
# Web-Based Interactive Arduino Simulator ⚡

### FOSSEE Internship Project 2026 | IIT Bombay

![Project Status](https://img.shields.io/badge/Status-Active_Development-green)
![Tech Stack](https://img.shields.io/badge/Stack-React_|_Fabric.js-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 📖 About The Project

This project is a **browser-based simulation environment for the Arduino Uno microcontroller**, developed as part of the **FOSSEE Internship 2026 at IIT Bombay**.

The simulator aims to democratize electronics education by providing a "Safe Zone" for students to experiment with circuit logic without the risk of damaging physical hardware. It features a drag-and-drop interface, intelligent orthogonal wiring, real-time logic simulation, and dynamic C++ code generation.

---

## 🚀 Key Features

* **🧩 Component Library:**
    * **Arduino Uno R3:** The central microcontroller unit.
    * **Breadboard:** For visual organization of circuits.
    * **LEDs (Red):** Digital output visualization with dynamic glow effects.
    * **Push Buttons:** Momentary digital input control.
    * **Potentiometers:** Analog input simulation via UI sliders.

* **🔌 Intelligent Wiring System:**
    * **Auto-Snap Connections:** Wires automatically connect components to assigned pins.
    * **Orthogonal Routing:** Implements an algorithm to route wires cleanly (90-degree bends) around the board, avoiding visual clutter ("Ghost Wires").
    * **Z-Index Management:** Ensures wires always remain visible on top of components.

* **⚡ Logic Simulation Engine:**
    * Runs a JavaScript-based approximation of the Arduino runtime at **20Hz**.
    * Supports **Digital I/O** (Button → LED) and **Analog Input** (Potentiometer → Blink Speed).
    * Real-time visual feedback (LEDs glow/shadow updates).

* **📝 Dynamic Code Generation:**
    * Real-time analysis of the visual canvas.
    * Automatically generates valid **Arduino C++ (`.ino`)** code.
    * Constructs `void setup()` and `void loop()` based on active connections.

* **🛡️ Error Prevention:**
    * **Pin Mutual Exclusion:** The UI prevents assigning the same pin to multiple components simultaneously.

---

## 🛠️ Technology Stack

* **Frontend Framework:** [React.js](https://reactjs.org/) - For UI components, state management, and the simulation loop.
* **Canvas Engine:** [Fabric.js](http://fabricjs.com/) - For the interactive object model, drag-and-drop, and vector graphics rendering.
* **Styling:** CSS3 with CSS Variables for a responsive Dark Mode theme.

---


## 💻 Getting Started

Follow these steps to run the simulator locally.

### Prerequisites
* Node.js (v14 or higher)
* npm or yarn

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/PrathamMittal07/Arduino-Simulator.git
    cd arduino-simulator
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Start the development server**
    ```bash
    npm start
    ```

4.  Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

---

## 🎮 How to Use

1.  **Add Components:** Click on components in the **Sidebar** (Arduino, Breadboard, LED, etc.) to drop them onto the canvas.
2.  **Configure Pins:** Use the dropdown menus in the Sidebar to assign specific pins (e.g., LED to D10, Button to D2).
3.  **Check Wiring:** The simulator automatically draws orthogonal wires. Move components to see the wires adjust.
4.  **Simulate:** Click the **Start** button in the toolbar.
    * *Click the Button* on canvas to toggle the LED.
    * *Slide the Potentiometer control* in the sidebar to change blink speed.
5.  **Get Code:** Look at the **Code Panel** to copy the generated `.ino` code for use with real hardware.

---

## 🔮 Future Scope

* Integration of **WebAssembly (AVR-GCC)** for compiling and running actual C++ code in the browser.
* Support for **Servo Motors** and **LCD Screens**.
* Cloud-based saving and sharing of projects.

---

## 👤 Author

**Pratham Mittal**
* **College:** VIT Bhopal University
* **Registration No:** 23BCE10309

---

## 🙏 Acknowledgments

* **FOSSEE Team, IIT Bombay** for their guidance and mentorship.
* The open-source communities behind **React** and **Fabric.js**.

---

MIT License. Copyright (c) 2026 Pratham Mittal.
