export class FolderInfo {
  constructor(name) {
    this.name = name;
    this.files = [];
    this.childFolders = [];
  }

  getFilesRecursive() {
    const allFiles = [];
    this.files.forEach((f) => allFiles.push(f));
    this.childFolders.forEach((folder) => folder.getFilesRecursive().forEach((f) => allFiles.push(f)));
    return allFiles;
  }
}