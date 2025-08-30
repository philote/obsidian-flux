/**
 * Journal Management for Obsidian Flux module
 * Handles FoundryVTT Journal Entry and Page CRUD operations
 */
export class JournalManager {
  /**
   * Create a new journal entry
   * @param {string} journalName - Name for the journal
   * @param {Folder|null} parentFolder - Parent folder (optional)
   * @param {boolean} playerObserve - Whether players can observe
   * @param {Object} moduleFlags - Module flags for identification
   * @returns {Promise<JournalEntry>} Created journal entry
   */
  static async createJournal(journalName, parentFolder, playerObserve, moduleFlags) {
    const entryData = {
      name: journalName,
      folder: parentFolder?.id,
      ...(playerObserve && {ownership:{default: CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER}})
    };   

    const entry = (await JournalEntry.create(entryData)) ?? new JournalEntry();
    await entry.setFlag(moduleFlags.SCOPE, moduleFlags.JOURNAL, true);
    return entry;
  }

  /**
   * Create a new journal page within a journal entry
   * @param {string} pageName - Name for the page
   * @param {string} content - Markdown content for the page
   * @param {JournalEntry} journalEntry - Parent journal entry
   * @returns {Promise<JournalEntryPage>} Created journal page
   */
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

  /**
   * Update content of an existing journal page
   * @param {JournalEntryPage} page - Page to update
   * @param {string} content - New markdown content
   */
  static async updateJournalPage(page, content) {
    if (page === undefined || page === null) return;
    await page.update({ text: { markdown: content } });
  }

  /**
   * Find existing journal by name and folder
   * @param {string} journalName - Name to search for
   * @param {Folder|null} parentFolder - Parent folder to search in
   * @returns {JournalEntry|null} Found journal or null
   */
  static findJournalByName(journalName, parentFolder) {
    return game.journal?.find(
      (j) => j.name === journalName && j.folder === parentFolder
    ) ?? null;
  }

  /**
   * Find existing journal page by name within a journal
   * @param {JournalEntry} journal - Journal to search in
   * @param {string} pageName - Page name to find
   * @returns {JournalEntryPage|null} Found page or null
   */
  static findJournalPage(journal, pageName) {
    return journal.pages.find((p) => p.name === pageName) ?? null;
  }
}