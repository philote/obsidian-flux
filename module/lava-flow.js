import { Logger } from './logger.js';
import { UIManager } from './ui-manager.js';
import { ImportEngine } from './import-engine.js';

export default class LavaFlow {
  static ID = 'lava-flow';

  static FLAGS = {
    FOLDER: 'lavaFlowFolder',
    JOURNAL: 'lavaFlowJournalEntry',
    SCOPE: 'world',
    LASTSETTINGS: 'lava-flow-last-settings',
  };

  static TEMPLATES = {
    IMPORTDIAG: `modules/${this.ID}/templates/lava-flow-import.hbs`,
  };

  // Delegate logging to Logger module
  static log = Logger.log;
  static errorHandling = Logger.error;
  static toLogMessage = Logger.toLogMessage;

  // Delegate UI management to UIManager module
  static isGM = UIManager.isGM;
  static createUIElements(html) {
    return UIManager.createUIElements(html, LavaFlow.ID);
  }
  static createForm = UIManager.createForm;

  // Delegate import workflow to ImportEngine
  static async importVault(event, settings) {
    return ImportEngine.importVault(event, settings, LavaFlow.FLAGS, LavaFlow.isGM);
  }  

}