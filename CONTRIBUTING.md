# Contributing to Obsidian Flux

Thank you for your interest in contributing to Obsidian Flux! This guide will help you get started with development and contributing to the project.

## Prerequisites

- **Node.js** (v14 or higher)
- **FoundryVTT** (v12-v13)
- Basic knowledge of JavaScript ES6+ and FoundryVTT module development

## Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/philote/obsidian-flux.git
   cd obsidian-flux
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up FoundryVTT development environment**
   - Link or copy the module to your FoundryVTT modules directory
   - The module should be located at `[FoundryVTT]/Data/modules/obsidian-flux/`

4. **Build styles**
   ```bash
   npm run build    # One-time scss build
   npm run watch    # Watch for scss changes during development
   ```