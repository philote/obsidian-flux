import { FileInfo, MDFileInfo, OtherFileInfo } from './file-info.js';
import { FolderInfo } from './folder-info.js';
import { LavaFlowForm } from './lava-flow-form.js';
import { LavaFlowSettings } from './lava-flow-settings.js';
import { createOrGetFolder } from './util.js';

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

  static log(msg, notify = false) {
    console.log(LavaFlow.toLogMessage(msg));
    if (notify) ui?.notifications?.info(LavaFlow.toLogMessage(msg));
  }

  static errorHandling(e) {
    console.error(LavaFlow.toLogMessage(e.stack));
    ui?.notifications?.error(LavaFlow.toLogMessage('Unexpected error. Please see the console for more details.'));
  }

  static toLogMessage(msg) {
    return `Lava Flow | ${msg}`;
  }

  static isGM() {
    return game.user?.isGM ?? false;
  }

  static createUIElements(html) {
    if (!LavaFlow.isGM()) return;

    LavaFlow.log('Creating UI elements...', false);
    
    const isV13 = game?.release?.generation >= 13;
    
    LavaFlow.log(`Detected Foundry version: ${game?.release?.generation || 'unknown'}, using v13 mode: ${isV13}`, false);
    
    const $html = isV13 ? $(html) : html;
    
    const className = `${LavaFlow.ID}-btn`;
    const tooltip = game.i18n.localize('OBSIDIAN-FLUX.button-label');
    
    const buttonHtml = isV13 
      ? `<button type="button" class="${className}" data-action="importVault"><i class="fas fa-upload"></i><span>${tooltip}</span></button>`
      : `<div class="${LavaFlow.ID}-row action-buttons flexrow"><button class="${className}"><i class="fas fa-upload"></i> ${tooltip}</button></div>`;
    
    const button = $(buttonHtml);
    
    button.on('click', function () {
      LavaFlow.createForm();
    });
    
    if (isV13) {
      $html.find('.header-actions').append(button);
    } else {
      $html.find('.header-actions:first-child').after(button);
    }
    
    LavaFlow.log('Creating UI elements complete.', false);
  }

  static createForm() {
    if (!LavaFlow.isGM()) return;
    new LavaFlowForm().render(true);
  }

  static async importVault(event, settings) {
    if (!LavaFlow.isGM()) return;
    LavaFlow.log('Begin import...', true);

    try {
      await this.saveSettings(settings);

      if (settings.vaultFiles == null) return;

      if (settings.importNonMarkdown) {
        await LavaFlow.validateUploadLocation(settings);
      }

      const rootFoundryFolder = await createOrGetFolder(settings.rootFolderName);

      const rootFolder = LavaFlow.createFolderStructure(settings.vaultFiles);
      await LavaFlow.importFolder(rootFolder, settings, rootFoundryFolder);

      const importedFiles = rootFolder.getFilesRecursive();

      const allJournals = importedFiles
        .filter((f) => f.journalPage !== null)
        .map((f) => f.journalPage);
      for (let i = 0; i < importedFiles.length; i++) await LavaFlow.updateLinks(importedFiles[i], allJournals);

      if (settings.createIndexFile || settings.createBacklinks) {
        const mdFiles = importedFiles.filter((f) => f instanceof MDFileInfo);
        if (settings.createIndexFile) await LavaFlow.createIndexFile(settings, mdFiles, rootFoundryFolder);

        if (settings.createBacklinks) await LavaFlow.createBacklinks(mdFiles);
      }

      if(settings.useTinyMCE)
        await LavaFlow.ConvertAllToHTML(allJournals);

      LavaFlow.log('Import complete.', true);
    } catch (e) {
      LavaFlow.errorHandling(e);
    }
  }  

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

  static async saveSettings(settings) {
    const savedSettings = new LavaFlowSettings();
    Object.assign(savedSettings, settings);
    savedSettings.vaultFiles = null;
    await game.user?.setFlag(LavaFlow.FLAGS.SCOPE, LavaFlow.FLAGS.LASTSETTINGS, savedSettings);
  }

  static async importFolder(folder, settings, parentFolder) {
    const hasMDFiles = folder.files.filter((f) => f instanceof MDFileInfo).length > 0;
    const combineFiles =
      settings.combineNotes && hasMDFiles && (!settings.combineNotesNoSubfolders || folder.childFolders.length < 1);

    let parentJournal = null;

    const oneJournalPerFile =
      !combineFiles &&
      folder.name !== '' &&
      folder.getFilesRecursive().filter((f) => f instanceof MDFileInfo).length > 0;

    if (combineFiles) {
      parentJournal = await this.createJournal(folder.name, parentFolder, settings.playerObserve);
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
      await this.importFile(folder.files[i], settings, parentFolder, parentJournal);
    }

    for (let i = 0; i < folder.childFolders.length; i++) {
      await this.importFolder(folder.childFolders[i], settings, parentFolder);
    }
  }

  static async importFile(file, settings, rootFolder, parentJournal) {
    if (file instanceof MDFileInfo) {
      await this.importMarkdownFile(file, settings, rootFolder, parentJournal);
    } else if (settings.importNonMarkdown && file instanceof OtherFileInfo) {
      await this.importOtherFile(file, settings);
    }
  }

  static async importMarkdownFile(file, settings, parentFolder, parentJournal) {
    const pageName = file.fileNameNoExt;
    const journalName = parentJournal?.name ?? pageName;
    const journal =
      parentJournal ??
      game.journal?.find(
        (j) => j.name === journalName && j.folder === parentFolder,
      ) ??
      (await LavaFlow.createJournal(journalName, parentFolder, settings.playerObserve));

    const fileContent = await LavaFlow.getFileContent(file);

    let journalPage = journal.pages.find((p) => p.name === pageName) ?? null;

    if (journalPage !== null && settings.overwrite) await LavaFlow.updateJournalPage(journalPage, fileContent);
    else if (journalPage === null || (!settings.overwrite && !settings.ignoreDuplicate))
      journalPage = await LavaFlow.createJournalPage(pageName, fileContent, journal);

    file.journalPage = journalPage;
  }

  static async importOtherFile(file, settings) {
    const source = settings.useS3 ? 's3' : 'data';
    const body = settings.useS3 ? { bucket: settings.s3Bucket } : {};
    const uploadResponse = await FilePicker.upload(source, settings.mediaFolder, file.originalFile, body);
    if (uploadResponse?.path) file.uploadPath = decodeURI(uploadResponse.path);
  }

  static async validateUploadLocation(settings) {
    if (settings.useS3) {
      if (settings.s3Bucket === null || settings.s3Region === null) throw new Error('S3 settings are invalid.');
    } else {
      try {
        await FilePicker.browse('data', settings.mediaFolder);
        return;
      } catch (error) {
        LavaFlow.log(`Error accessing filepath ${settings.mediaFolder}: ${error.message}`, false);
      }

      await FilePicker.createDirectory('data', settings.mediaFolder);
    }
  }

  static async createIndexFile(settings, files, rootFolder) {
    const indexJournalName = 'Index';
    const indexJournal = game.journal?.find((j) => j.name === indexJournalName && j.folder === rootFolder);
    const mdDictionary = files.filter((d) => d instanceof MDFileInfo);
    const directories = [...new Set(mdDictionary.map((d) => LavaFlow.getIndexTopDirectory(d)))];
    directories.sort();
    let content = '';
    for (let j = 0; j < directories.length; j++) {
      content += `<h1>${directories[j]}</h1>`;
      const journals = mdDictionary
        .filter((d) => LavaFlow.getIndexTopDirectory(d) === directories[j])
        .map((d) => d.journalPage);
      content += `<ul>${journals.map((journal) => `<li>${journal?.link ?? ''}</li>`).join('\n')}</ul>`;
    }
    if (indexJournal != null) await LavaFlow.updateJournalPage(indexJournal, content);
    else {
      const journal = await LavaFlow.createJournal(indexJournalName, rootFolder, settings.playerObserve);
      await LavaFlow.createJournalPage(indexJournalName, content, journal);
    }
  }

  static getIndexTopDirectory(fileInfo) {
    return fileInfo.directories.length > 1 ? fileInfo.directories[1] : 'Uncatergorized';
  }

  static async createBacklinks(files) {
    for (let i = 0; i < files.length; i++) {
      const fileInfo = files[i];
      if (fileInfo.journalPage === null) continue;
      const backlinkFiles = [];
      for (let j = 0; j < files.length; j++) {
        if (j === i) continue;
        const otherFileInfo = files[j];
        const page = otherFileInfo.journalPage?.pages?.contents[0];
        const link = fileInfo.getLink();
        if (page !== undefined && page !== null && link !== null && page.text.markdown.includes(link))
          backlinkFiles.push(otherFileInfo);
      }
      if (backlinkFiles.length > 0) {
        backlinkFiles.sort((a, b) => a.fileNameNoExt.localeCompare(b.fileNameNoExt));
        const backLinkList = backlinkFiles.map((b) => `- ${b.getLink() ?? ''}`).join('\r\n');
        const page = fileInfo.journalPage.pages.contents[0];
        const newText = `${page.text.markdown}\r\n#References\r\n${backLinkList}`;
        page.update({ text: { markdown: newText } });
      }
    }
  }

  static linkMatch(fileInfo, matchFileInfo) {
    if (matchFileInfo !== fileInfo && matchFileInfo instanceof MDFileInfo) {
      const linkPatterns = fileInfo.getLinkRegex();
      for (let i = 0; i < linkPatterns.length; i++) {
        if (matchFileInfo.links.filter((l) => l.match(linkPatterns[i])).length > 0) return true;
      }
    }
    return false;
  }

  static decodeHtml(html) {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  }

  static async createJournal(journalName, parentFolder, playerObserve) {
    const entryData = {
      name: journalName,
      folder: parentFolder?.id,
      ...(playerObserve && {ownership:{default: CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER}})
    };   

    const entry = (await JournalEntry.create(entryData)) ?? new JournalEntry();
    await entry.setFlag(LavaFlow.FLAGS.SCOPE, LavaFlow.FLAGS.JOURNAL, true);
    return entry;
  }

  static async createJournalPage(pageName, content, journalEntry) {
    const page = await JournalEntryPage.create(
      {
        name: pageName,
        text: { markdown: content, format: CONST.JOURNAL_ENTRY_PAGE_FORMATS.MARKDOWN },
      },
      { parent: journalEntry },
    );
    await page.setFlag("core","sheetClass","core.MarkdownJournalPageSheet");
    return page;
  }

  static async updateJournalPage(page, content) {
    if (page === undefined || page === null) return;
    await page.update({ text: { markdown: content } });
  }

  static async getFileContent(file) {
    let originalText = await file.originalFile.text();
    if (originalText !== null && originalText.length > 6)
      originalText = originalText.replace(/^---\r?\n([^-].*\r?\n)+---(\r?\n)+/, '');
    originalText = originalText.replace(/^#[0-9A-Za-z]+\b/gm, ' $&');
    return originalText;
  }

  static async updateLinks(fileInfo, allPages) {
    const linkPatterns = fileInfo.getLinkRegex();
    for (let i = 0; i < allPages.length; i++) {
      const comparePage = allPages[i];

      for (let j = 0; j < linkPatterns.length; j++) {
        const pattern = linkPatterns[j];
        const linkMatches = comparePage.text.markdown.matchAll(pattern);
        if (linkMatches === null) continue;
        for (const linkMatch of linkMatches) {
          const alias = (linkMatch[2] ?? '|').split('|')[1].trim();
          let link = fileInfo.getLink(alias);
          if (link === null) continue;
          if (fileInfo instanceof OtherFileInfo) {
            const resizeMatches = linkMatch[0].match(/\|\d+(x\d+)?\]/gi);
            if (resizeMatches !== null && resizeMatches.length > 0) {
              const dimensions = resizeMatches[0]
                .replace(/(\||\])/gi, '')
                .toLowerCase()
                .split('x');
              if (dimensions.length === 1) dimensions.push('*');
              const dimensionsString = dimensions.join('x');
              link = link.replace(/\)$/gi, ` =${dimensionsString})`);
            }
          }
          const newContent = comparePage.text.markdown.replace(linkMatch[0], link);
          await LavaFlow.updateJournalPage(allPages[i], newContent);
        }
      }
    }
  }

  static async ConvertAllToHTML(allJournals) {
    const promises = allJournals.map((j) => LavaFlow.ConvertToHTML(j));
    await Promise.all(promises);
  }
  
  static async ConvertToHTML(page){
    await Promise.all([
      page.update({
        text: { markdown: "", format: CONST.JOURNAL_ENTRY_PAGE_FORMATS.HTML },
      }),
      page.setFlag("core","sheetClass","core.JournalTextTinyMCESheet")
    ])
  }
}