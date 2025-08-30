import { Logger } from './logger.js';
import { LavaFlowForm } from './lava-flow-form.js';

/**
 * UI Management for Lava Flow module
 * Handles FoundryVTT UI element creation and version-specific rendering
 */
export class UIManager {
  /**
   * Create UI elements in the Journal Directory
   * @param {HTMLElement|JQuery} html - The HTML element to modify
   * @param {string} moduleId - Module ID for button styling
   */
  static createUIElements(html, moduleId = 'lava-flow') {
    if (!UIManager.isGM()) return;

    Logger.log('Creating UI elements...', false);
    
    const isV13 = UIManager.detectFoundryV13();
    
    Logger.log(`Detected Foundry version: ${game?.release?.generation || 'unknown'}, using v13 mode: ${isV13}`, false);
    
    const $html = isV13 ? $(html) : html;
    const button = UIManager.createImportButton(moduleId, isV13);
    
    UIManager.attachButtonHandler(button);
    UIManager.insertButtonIntoUI($html, button, isV13);
    
    Logger.log('Creating UI elements complete.', false);
  }

  /**
   * Create and render the import form
   */
  static createForm() {
    if (!UIManager.isGM()) return;
    new LavaFlowForm().render(true);
  }

  /**
   * Check if current user is a Game Master
   * @returns {boolean} True if user is GM
   */
  static isGM() {
    return game.user?.isGM ?? false;
  }

  /**
   * Detect if running FoundryVTT v13 or later
   * @returns {boolean} True if v13+
   */
  static detectFoundryV13() {
    return game?.release?.generation >= 13;
  }

  /**
   * Create the import button element
   * @param {string} moduleId - Module ID for CSS classes
   * @param {boolean} isV13 - Whether running v13+
   * @returns {JQuery} Button element
   */
  static createImportButton(moduleId, isV13) {
    const className = `${moduleId}-btn`;
    const tooltip = game.i18n.localize('OBSIDIAN-FLUX.button-label');
    
    const buttonHtml = isV13 
      ? `<button type="button" class="${className}" data-action="importVault"><i class="fas fa-upload"></i><span>${tooltip}</span></button>`
      : `<div class="${moduleId}-row action-buttons flexrow"><button class="${className}"><i class="fas fa-upload"></i> ${tooltip}</button></div>`;
    
    return $(buttonHtml);
  }

  /**
   * Attach click handler to button
   * @param {JQuery} button - Button element
   */
  static attachButtonHandler(button) {
    button.on('click', function () {
      UIManager.createForm();
    });
  }

  /**
   * Insert button into the appropriate UI location
   * @param {JQuery} $html - HTML container
   * @param {JQuery} button - Button to insert
   * @param {boolean} isV13 - Whether running v13+
   */
  static insertButtonIntoUI($html, button, isV13) {
    if (isV13) {
      $html.find('.header-actions').append(button);
    } else {
      $html.find('.header-actions:first-child').after(button);
    }
  }
}