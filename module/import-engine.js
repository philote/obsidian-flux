import { FileInfo, MDFileInfo, OtherFileInfo } from './file-info.js';
import { FolderInfo } from './folder-info.js';
import { LavaFlowSettings } from './lava-flow-settings.js';
import { createOrGetFolder } from './util.js';
import { Logger } from './logger.js';
import { JournalManager } from './journal-manager.js';
import { LinkProcessor } from './link-processor.js';

/**
 * Core Import Engine for Lava Flow module
 * Handles the main import workflow and file processing
 */
export class ImportEngine {
  /**
   * Main import vault workflow
   * @param {Event} event - Triggering event
   * @param {LavaFlowSettings} settings - Import settings
   * @param {Object} moduleFlags - Module flags for identification
   * @param {Function} isGMFn - Function to check if user is GM
   */
  static async importVault(event, settings, moduleFlags, isGMFn) {
    if (!isGMFn()) return;
    Logger.log('Begin import...', true);

    try {
      await ImportEngine.saveSettings(settings, moduleFlags);

      if (settings.vaultFiles == null) return;

      if (settings.importNonMarkdown) {
        await ImportEngine.validateUploadLocation(settings);
      }

      const rootFoundryFolder = await createOrGetFolder(settings.rootFolderName);

      const rootFolder = ImportEngine.createFolderStructure(settings.vaultFiles);
      await ImportEngine.importFolder(rootFolder, settings, rootFoundryFolder, moduleFlags);

      const importedFiles = rootFolder.getFilesRecursive();

      const allJournals = importedFiles
        .filter((f) => f.journalPage !== null)
        .map((f) => f.journalPage);
      for (let i = 0; i < importedFiles.length; i++) await LinkProcessor.updateLinks(importedFiles[i], allJournals);

      if (settings.createIndexFile || settings.createBacklinks) {
        const mdFiles = importedFiles.filter((f) => f instanceof MDFileInfo);
        if (settings.createIndexFile) await ImportEngine.createIndexFile(settings, mdFiles, rootFoundryFolder, moduleFlags);

        if (settings.createBacklinks) await LinkProcessor.createBacklinks(mdFiles);
      }

      if(settings.useTinyMCE)
        await ImportEngine.convertAllToHTML(allJournals);

      Logger.log('Import complete.', true);
    } catch (e) {
      Logger.error(e);
    }
  }

  /**
   * Create folder structure from FileList
   * @param {FileList} fileList - Files to process
   * @returns {FolderInfo} Root folder structure
   */
  static createFolderStructure(fileList) {
    const rootFolder = new FolderInfo('');
    for (let i = 0; i < fileList.length; i++) {
      const file = FileInfo.get(fileList[i]);
      if (file.isHidden() || file.isCanvas()) continue;
      let parentFolder = rootFolder;
      for (let j = 0; j < file.directories.length; j++) {
        const folderName = file.directories[j];
        const matches = parentFolder.childFolders.filter((f) => f.name === folderName);
        const currentFolder = matches.length > 0 ? matches[0] : new FolderInfo(folderName);
        if (matches.length < 1) parentFolder.childFolders.push(currentFolder);
        parentFolder = currentFolder;
      }
      parentFolder.files.push(file);
    }
    return rootFolder;
  }

  /**
   * Save import settings for future use
   * @param {LavaFlowSettings} settings - Settings to save
   * @param {Object} moduleFlags - Module flags
   */
  static async saveSettings(settings, moduleFlags) {
    const savedSettings = new LavaFlowSettings();
    Object.assign(savedSettings, settings);
    savedSettings.vaultFiles = null;
    await game.user?.setFlag(moduleFlags.SCOPE, moduleFlags.LASTSETTINGS, savedSettings);
  }

  /**
   * Import a folder and its contents
   * @param {FolderInfo} folder - Folder to import
   * @param {LavaFlowSettings} settings - Import settings
   * @param {Folder|null} parentFolder - Parent FoundryVTT folder
   * @param {Object} moduleFlags - Module flags
   */
  static async importFolder(folder, settings, parentFolder, moduleFlags) {
    const hasMDFiles = folder.files.filter((f) => f instanceof MDFileInfo).length > 0;
    const combineFiles =
      settings.combineNotes && hasMDFiles && (!settings.combineNotesNoSubfolders || folder.childFolders.length < 1);

    let parentJournal = null;

    const oneJournalPerFile =
      !combineFiles &&
      folder.name !== '' &&
      folder.getFilesRecursive().filter((f) => f instanceof MDFileInfo).length > 0;

    if (combineFiles) {
      parentJournal = await JournalManager.createJournal(folder.name, parentFolder, settings.playerObserve, moduleFlags);
    }

    if (
      oneJournalPerFile ||
      (combineFiles &&
        folder.childFolders.filter(
          (childFolder) => childFolder.getFilesRecursive().filter((f) => f instanceof MDFileInfo).length > 0,
        ).length > 0)
    ) {
      parentFolder = await createOrGetFolder(folder.name, parentFolder?.id);
    }

    for (let i = 0; i < folder.files.length; i++) {
      await ImportEngine.importFile(folder.files[i], settings, parentFolder, parentJournal, moduleFlags);
    }

    for (let i = 0; i < folder.childFolders.length; i++) {
      await ImportEngine.importFolder(folder.childFolders[i], settings, parentFolder, moduleFlags);
    }
  }

  /**
   * Import a single file
   * @param {FileInfo} file - File to import
   * @param {LavaFlowSettings} settings - Import settings
   * @param {Folder|null} rootFolder - Root folder
   * @param {JournalEntry|null} parentJournal - Parent journal entry
   * @param {Object} moduleFlags - Module flags
   */
  static async importFile(file, settings, rootFolder, parentJournal, moduleFlags) {
    if (file instanceof MDFileInfo) {
      await ImportEngine.importMarkdownFile(file, settings, rootFolder, parentJournal, moduleFlags);
    } else if (settings.importNonMarkdown && file instanceof OtherFileInfo) {
      await ImportEngine.importOtherFile(file, settings);
    }
  }

  /**
   * Import a markdown file as journal entry
   * @param {MDFileInfo} file - Markdown file to import
   * @param {LavaFlowSettings} settings - Import settings
   * @param {Folder|null} parentFolder - Parent folder
   * @param {JournalEntry|null} parentJournal - Parent journal entry
   * @param {Object} moduleFlags - Module flags
   */
  static async importMarkdownFile(file, settings, parentFolder, parentJournal, moduleFlags) {
    const pageName = file.fileNameNoExt;
    const journalName = parentJournal?.name ?? pageName;
    const journal =
      parentJournal ??
      JournalManager.findJournalByName(journalName, parentFolder) ??
      (await JournalManager.createJournal(journalName, parentFolder, settings.playerObserve, moduleFlags));

    const fileContent = await ImportEngine.getFileContent(file);

    let journalPage = JournalManager.findJournalPage(journal, pageName);

    if (journalPage !== null && settings.overwrite) await JournalManager.updateJournalPage(journalPage, fileContent);
    else if (journalPage === null || (!settings.overwrite && !settings.ignoreDuplicate))
      journalPage = await JournalManager.createJournalPage(pageName, fileContent, journal);

    file.journalPage = journalPage;
  }

  /**
   * Import a non-markdown file (typically images)
   * @param {OtherFileInfo} file - File to import
   * @param {LavaFlowSettings} settings - Import settings
   */
  static async importOtherFile(file, settings) {
    const source = settings.useS3 ? 's3' : 'data';
    const body = settings.useS3 ? { bucket: settings.s3Bucket } : {};
    const uploadResponse = await FilePicker.upload(source, settings.mediaFolder, file.originalFile, body);
    if (uploadResponse?.path) file.uploadPath = decodeURI(uploadResponse.path);
  }

  /**
   * Validate upload location exists or can be created
   * @param {LavaFlowSettings} settings - Import settings
   */
  static async validateUploadLocation(settings) {
    if (settings.useS3) {
      if (settings.s3Bucket === null || settings.s3Region === null) throw new Error('S3 settings are invalid.');
    } else {
      try {
        await FilePicker.browse('data', settings.mediaFolder);
        return;
      } catch (error) {
        Logger.log(`Error accessing filepath ${settings.mediaFolder}: ${error.message}`, false);
      }

      await FilePicker.createDirectory('data', settings.mediaFolder);
    }
  }

  /**
   * Create an index file listing all imported content
   * @param {LavaFlowSettings} settings - Import settings
   * @param {FileInfo[]} files - Imported files
   * @param {Folder|null} rootFolder - Root folder
   * @param {Object} moduleFlags - Module flags
   */
  static async createIndexFile(settings, files, rootFolder, moduleFlags) {
    const indexJournalName = 'Index';
    const indexJournal = game.journal?.find((j) => j.name === indexJournalName && j.folder === rootFolder);
    const mdDictionary = files.filter((d) => d instanceof MDFileInfo);
    const directories = [...new Set(mdDictionary.map((d) => ImportEngine.getIndexTopDirectory(d)))];
    directories.sort();
    let content = '';
    for (let j = 0; j < directories.length; j++) {
      content += `<h1>${directories[j]}</h1>`;
      const journals = mdDictionary
        .filter((d) => ImportEngine.getIndexTopDirectory(d) === directories[j])
        .map((d) => d.journalPage);
      content += `<ul>${journals.map((journal) => `<li>${journal?.link ?? ''}</li>`).join('\n')}</ul>`;
    }
    if (indexJournal != null) await JournalManager.updateJournalPage(indexJournal, content);
    else {
      const journal = await JournalManager.createJournal(indexJournalName, rootFolder, settings.playerObserve, moduleFlags);
      await JournalManager.createJournalPage(indexJournalName, content, journal);
    }
  }

  /**
   * Get top-level directory for index organization
   * @param {FileInfo} fileInfo - File info
   * @returns {string} Directory name
   */
  static getIndexTopDirectory(fileInfo) {
    return fileInfo.directories.length > 1 ? fileInfo.directories[1] : 'Uncatergorized';
  }

  /**
   * Get file content with front matter removed
   * @param {FileInfo} file - File to read
   * @returns {Promise<string>} Processed content
   */
  static async getFileContent(file) {
    let originalText = await file.originalFile.text();
    if (originalText !== null && originalText.length > 6)
      originalText = originalText.replace(/^---\r?\n([^-].*\r?\n)+---(\r?\n)+/, '');
    originalText = originalText.replace(/^#[0-9A-Za-z]+\b/gm, ' $&');
    return originalText;
  }

  /**
   * Convert all journal entries to HTML format
   * @param {JournalEntryPage[]} allJournals - Journal pages to convert
   */
  static async convertAllToHTML(allJournals) {
    const promises = allJournals.map((j) => ImportEngine.convertToHTML(j));
    await Promise.all(promises);
  }

  /**
   * Convert a single journal page to HTML
   * @param {JournalEntryPage} page - Journal page to convert
   */
  static async convertToHTML(page) {
    await Promise.all([
      page.update({
        text: { markdown: "", format: CONST.JOURNAL_ENTRY_PAGE_FORMATS.HTML },
      }),
      page.setFlag("core","sheetClass","core.JournalTextTinyMCESheet")
    ])
  }
}