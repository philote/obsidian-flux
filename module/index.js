import ObsidianFlux from './obsidian-flux.js';

Hooks.on('renderJournalDirectory', function (app, html) {
  try {
    ObsidianFlux.createUIElements(html);
  } catch (e) {
    ObsidianFlux.errorHandling(e);
  }
});