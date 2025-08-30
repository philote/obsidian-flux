# Obsidian Flux

<p align="center">
    <img alt="Foundry Version 12 support" src="https://img.shields.io/badge/Foundry-v12-informational">
    <img alt="Foundry Version 13 support" src="https://img.shields.io/badge/Foundry-v13-informational">
    <img alt="Latest Release Download Count" src="https://img.shields.io/github/downloads/philote/obsidian-flux/latest/total"> 
    <img alt="GitHub release (latest by date)" src="https://img.shields.io/github/v/release/philote/obsidian-flux"> 
    <img alt="GitHub last commit" src="https://img.shields.io/github/last-commit/philote/obsidian-flux">
    <img alt="GitHub Release Date" src="https://img.shields.io/github/release-date/philote/obsidian-flux?label=latest%20release" /> 
</p>
<p align="center">
    <img alt="GitHub" src="https://img.shields.io/github/license/philote/obsidian-flux"> 
    <a href="https://github.com/philote/obsidian-flux/issues">
        <img alt="GitHub issues" src="https://img.shields.io/github/issues/philote/obsidian-flux">
    </a> 
    <a href="https://github.com/philote/obsidian-flux/network">
        <img alt="GitHub forks" src="https://img.shields.io/github/forks/philote/obsidian-flux">
    </a> 
    <a href="https://github.com/philote/obsidian-flux/stargazers">
        <img alt="GitHub stars" src="https://img.shields.io/github/stars/philote/obsidian-flux">
    </a> 
</p>
<p align="center">
   	<a href='https://ko-fi.com/G2G3I91JQ' target='_blank'>
        <img height='36' style='border:0px;height:36px;' src='https://storage.ko-fi.com/cdn/kofi3.png?v=6' border='0' alt='Buy Me a Coffee at ko-fi.com' />
    </a>
</p>

### A tool for transferring Obsidian content directly into Foundry VTT journals

Obsidian Flux is a comprehensive FoundryVTT module that seamlessly imports your entire Obsidian vault directly into Foundry VTT journal entries. Built with a modular architecture, it preserves your vault's folder structure, converts Obsidian-style `[[wikilinks]]` to native FoundryVTT journal links, handles both markdown and non-markdown files (including images), and offers advanced features like automatic index generation, backlink creation, and flexible content organization options including the ability to combine multiple notes into single journals or maintain one-journal-per-file structure.

If you’ve enjoyed my work and find value in what I create, please consider supporting me with a small donation on [Ko-fi](https://ko-fi.com/G2G3I91JQ). I truly love what I do, and your support helps me dedicate time and resources to ongoing development. Every contribution, no matter the size, makes a difference and allows me to continue doing what I’m passionate about. Thank you for considering—it means the world to me.

## Screenshot
![Screenshot](assets/screenshot.webp)

## How to Install

You can install the latest released version of the module by using this manifest link in Foundry VTT. [Instructions](https://foundryvtt.com/article/tutorial/): https://github.com/philote/obsidian-flux/releases/latest/download/module.json

## Features
- **Complete Vault Import**: Import entire Obsidian vaults while preserving folder structure
- **Link Conversion**: Automatically converts Obsidian `[[wikilinks]]` to FoundryVTT journal entry links
- **Multi-Format Support**: Handles markdown files and non-markdown assets (images, PDFs, etc.)
- **Flexible Organization**: Choose between combining notes into single journals or one-journal-per-file
- **Image Support**: Import images with automatic resizing syntax conversion
- **Index Generation**: Automatically create index pages for imported content
- **Backlink Creation**: Generate backlink references between connected notes
- **Player Permissions**: Control whether imported journals are visible to players
- **Overwrite Protection**: Options to overwrite existing content or skip duplicates
- **HTML Conversion**: Optional TinyMCE HTML format conversion
- **S3 Integration**: Support for AWS S3 storage for uploaded files
- **Front Matter Handling**: Automatic removal of YAML front matter from imported notes

## TODO
- TBD

# License & Acknowledgements

This project is licensed under the MIT License.

**Acknowledgements**: This module builds upon and extends the foundational work of the [Lava Flow](https://github.com/Praxxian/lava-flow) module by Praxxian. The core import logic, link processing, and FoundryVTT integration patterns were inspired by and adapted from Lava Flow's MIT-licensed codebase. Obsidian Flux represents a complete architectural refactor with enhanced modularity, expanded feature set, and improved FoundryVTT v13 compatibility.

Icons used are from game-icons.net and are released under a Creative Commons Attribution 3.0 Unported license. https://creativecommons.org/licenses/by/3.0/
Pistol gun icon by John Colburn under CC BY 3.0
