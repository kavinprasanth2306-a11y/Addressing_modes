# 8086 Memory Architect

A modern, web-based calculator for an **8086 Effective & Physical Address Engine**. This tool provides a clean, "glassmorphism" inspired user interface to calculate physical memory addresses based on various addressing modes of the Intel 8086 microprocessor.

## Features

- **Multiple Addressing Modes Supported**:
  - Direct
  - Indirect
  - Register Direct
  - Register Indirect
  - Immediate
  - Displacement
  - Stack
- **Real-time Telemetry & Calculation Breakdown**:
  - Displays Segment Shift (e.g., `DS × 10H`)
  - Calculates Effective Address (16-bit) based on selected registers, displacement, or immediate data.
  - Computes the final Physical Address (20-bit).
- **Modern UI Edge**:
  - Sleek "Glass" panel design.
  - Responsive layouts and minimalist neon aesthetic.
  - Smooth micro-animations for an interactive user experience.

## Usage

1. **Select an Architecture Mode** from the dropdown menu (e.g., Register Indirect).
2. **Enter Hexadecimal Values** for the required Segment register (DS, CS, SS, ES) and any necessary General-Purpose, Pointer, or Data values.
3. Click **"Execute Calculation"** to generate the memory mapping.
4. View the step-by-step breakdown of the EA and PA calculations in the **Telemetry Panel**.

## Installation & Running

This is a static web application consisting of pure HTML, CSS, and vanilla JavaScript.
No complex build steps or dependencies are required.

To run it locally:
1. Clone the repository:
   ```bash
   git clone https://github.com/kavinprasanth2306-a11y/Addressing_modes.git
   ```
2. Open the `index.html` file in your preferred web browser.

## Tech Stack

- **HTML5** (Structure)
- **Vanilla CSS3** (Styling, Animations, Glassmorphism effects)
- **Vanilla JavaScript** (Address calculation logic, DOM manipulation)
- **Fonts**: Outfit & JetBrains Mono

## License

Please refer to the `LICENSE` file in the repository for more details.
