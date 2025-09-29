import ObsidianFlux from './obsidian-flux.js';

export class ObsidianFluxSettings {
  constructor() {
    this.rootFolderName = null;
    this.vaultFiles = null;
    this.imageDirectory = null;
    this.overwrite = true;
    this.ignoreDuplicate = false;
    this.idPrefix = `${ObsidianFlux.ID}-`;
    this.playerObserve = false;
    this.excludeGMOnly = false;
    this.createIndexFile = false;
    this.createBacklinks = true;
    this.importNonMarkdown = true;
    this.useS3 = false;
    this.s3Bucket = null;
    this.s3Region = null;
    this.mediaFolder = 'img';
    this.combineNotes = false;
    this.combineNotesNoSubfolders = true;
    this.useTinyMCE = false;
  }
}