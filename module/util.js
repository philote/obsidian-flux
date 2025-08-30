import ObsidianFlux from './obsidian-flux.js';

export async function createOrGetFolder(folderName, parentFolderID = null) {
  if (folderName == null || folderName === '') return null;
  const folder = (await getFolder(folderName, parentFolderID)) ?? (await createFolder(folderName, parentFolderID));
  return folder;
}

export async function getFolder(folderName, parentFolderID) {
  if (parentFolderID !== null) {
    const parent = game.folders?.get(parentFolderID);
    const matches = parent.children.filter((c) => c.folder.name === folderName) ?? [];
    return matches.length > 0 ? matches[0].folder : null;
  } else {
    return (
      game.folders?.find((f) => f.type === 'JournalEntry' && f.depth === 1 && f.name === folderName) ?? null
    );
  }
}

export async function createFolder(folderName, parentFolderID) {
  const folder = await Folder.create({
    name: folderName,
    type: 'JournalEntry',
    folder: parentFolderID,
  });
  await folder?.setFlag(ObsidianFlux.FLAGS.SCOPE, ObsidianFlux.FLAGS.FOLDER, true);
  return folder ?? null;
}