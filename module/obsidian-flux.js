import { Logger } from './logger.js';
import { UIManager } from './ui-manager.js';
import { ImportEngine } from './import-engine.js';

export default class ObsidianFlux {
  static ID = 'obsidian-flux';

  static FLAGS = {
    FOLDER: 'obsidianFluxFolder',
    JOURNAL: 'obsidianFluxJournalEntry',
    SCOPE: 'world',
    LASTSETTINGS: 'obsidian-flux-last-settings',
  };

  static TEMPLATES = {
    IMPORTDIAG: `modules/${this.ID}/templates/import-dialog.hbs`,
  };

  // Delegate logging to Logger module
  static log = Logger.log;
  static errorHandling = Logger.error;
  static toLogMessage = Logger.toLogMessage;

  // Delegate UI management to UIManager module
  static isGM = UIManager.isGM;
  static createUIElements(html) {
    return UIManager.createUIElements(html, ObsidianFlux.ID);
  }
  static createForm = UIManager.createForm;

  // Delegate import workflow to ImportEngine
  static async importVault(event, settings) {
    return ImportEngine.importVault(event, settings, ObsidianFlux.FLAGS, ObsidianFlux.isGM);
  }  

}