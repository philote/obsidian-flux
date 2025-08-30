import { MDFileInfo, OtherFileInfo } from './file-info.js';
import { JournalManager } from './journal-manager.js';

/**
 * Link Processing for Obsidian Flux module
 * Handles cross-reference links and backlink generation
 */
export class LinkProcessor {
  /**
   * Update all links in journal pages to point to correct FoundryVTT references
   * @param {FileInfo} fileInfo - File info containing link patterns
   * @param {JournalEntryPage[]} allPages - All journal pages to update
   */
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
          
          // Handle image resizing for OtherFileInfo (images)
          if (fileInfo instanceof OtherFileInfo) {
            link = LinkProcessor.processImageResizing(linkMatch[0], link);
          }
          
          const newContent = comparePage.text.markdown.replace(linkMatch[0], link);
          await JournalManager.updateJournalPage(allPages[i], newContent);
        }
      }
    }
  }

  /**
   * Create backlinks for all markdown files
   * @param {MDFileInfo[]} files - Array of markdown file info objects
   */
  static async createBacklinks(files) {
    for (let i = 0; i < files.length; i++) {
      const fileInfo = files[i];
      if (fileInfo.journalPage === null) continue;
      
      const backlinkFiles = LinkProcessor.findBacklinkFiles(fileInfo, files, i);
      
      if (backlinkFiles.length > 0) {
        await LinkProcessor.addBacklinksToPage(fileInfo, backlinkFiles);
      }
    }
  }

  /**
   * Check if two files have matching links
   * @param {FileInfo} fileInfo - Source file
   * @param {FileInfo} matchFileInfo - Target file to check
   * @returns {boolean} True if files have matching links
   */
  static linkMatch(fileInfo, matchFileInfo) {
    if (matchFileInfo !== fileInfo && matchFileInfo instanceof MDFileInfo) {
      const linkPatterns = fileInfo.getLinkRegex();
      for (let i = 0; i < linkPatterns.length; i++) {
        if (matchFileInfo.links.filter((l) => l.match(linkPatterns[i])).length > 0) return true;
      }
    }
    return false;
  }

  /**
   * Process image resizing syntax in links
   * @param {string} originalMatch - Original matched text
   * @param {string} link - Generated link
   * @returns {string} Link with resizing applied
   */
  static processImageResizing(originalMatch, link) {
    const resizeMatches = originalMatch.match(/\|\d+(x\d+)?\]/gi);
    if (resizeMatches !== null && resizeMatches.length > 0) {
      const dimensions = resizeMatches[0]
        .replace(/(\||\])/gi, '')
        .toLowerCase()
        .split('x');
      if (dimensions.length === 1) dimensions.push('*');
      const dimensionsString = dimensions.join('x');
      return link.replace(/\)$/gi, ` =${dimensionsString})`);
    }
    return link;
  }

  /**
   * Find files that link to the given file (backlinks)
   * @param {MDFileInfo} fileInfo - File to find backlinks for
   * @param {MDFileInfo[]} allFiles - All files to search through
   * @param {number} currentIndex - Index of current file to skip
   * @returns {MDFileInfo[]} Files that link to the given file
   */
  static findBacklinkFiles(fileInfo, allFiles, currentIndex) {
    const backlinkFiles = [];
    for (let j = 0; j < allFiles.length; j++) {
      if (j === currentIndex) continue;
      const otherFileInfo = allFiles[j];
      const page = otherFileInfo.journalPage?.pages?.contents[0];
      const link = fileInfo.getLink();
      if (page !== undefined && page !== null && link !== null && page.text.markdown.includes(link))
        backlinkFiles.push(otherFileInfo);
    }
    return backlinkFiles;
  }

  /**
   * Add backlinks section to a journal page
   * @param {MDFileInfo} fileInfo - File to add backlinks to
   * @param {MDFileInfo[]} backlinkFiles - Files that link to this file
   */
  static async addBacklinksToPage(fileInfo, backlinkFiles) {
    backlinkFiles.sort((a, b) => a.fileNameNoExt.localeCompare(b.fileNameNoExt));
    const backLinkList = backlinkFiles.map((b) => `- ${b.getLink() ?? ''}`).join('\r\n');
    const page = fileInfo.journalPage.pages.contents[0];
    const newText = `${page.text.markdown}\r\n#References\r\n${backLinkList}`;
    await page.update({ text: { markdown: newText } });
  }

  /**
   * Decode HTML entities in text
   * @param {string} html - HTML string to decode
   * @returns {string} Decoded text
   */
  static decodeHtml(html) {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  }
}