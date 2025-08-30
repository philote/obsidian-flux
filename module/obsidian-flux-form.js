import ObsidianFlux from './obsidian-flux.js';
import { ObsidianFluxSettings } from './obsidian-flux-settings.js';

export class ObsidianFluxForm extends FormApplication {
  constructor() {
    super(ObsidianFluxForm.defaultOptions);
    this.vaultFiles = null;
  }

  static get defaultOptions() {
    const defaults = super.defaultOptions;

    const overrides = {
      height: 600,
      id: `${ObsidianFlux.ID}-form`,
      template: ObsidianFlux.TEMPLATES.IMPORTDIAG,
      title: 'Import Obsidian MD Vault',
      importSettings:
        game.user?.getFlag(ObsidianFlux.FLAGS.SCOPE, ObsidianFlux.FLAGS.LASTSETTINGS) ??
        new ObsidianFluxSettings(),
      classes: [],
      closeOnSubmit: true,
      submitOnChange: false,
      submitOnClose: false,
      editable: true,
      baseApplication: '',
      width: 500,
      top: null,
      left: null,
      popOut: true,
      minimizable: false,
      resizable: true,
      dragDrop: [],
      tabs: [],
      filters: [],
      scrollY: [],
      scale: null,
      sheetConfig: false,
    };

    const mergedOptions = foundry.utils.mergeObject(defaults, overrides);

    return mergedOptions;
  }

  async _updateObject(event, formData) {
    formData.vaultFiles = this.vaultFiles;
    await ObsidianFlux.importVault(event, formData);
  }

  getData(options) {
    return options.importSettings;
  }

  activateListeners() {
    const prefix = ObsidianFluxForm.defaultOptions?.importSettings?.idPrefix ?? '';

    this.setInverseToggle(`#${prefix}overwrite`, `#${prefix}ignoreDuplicateDiv`);
    this.setToggle(`#${prefix}importNonMarkdown`, `#${prefix}nonMarkdownOptions`);
    this.setToggle(`#${prefix}useS3`, `#${prefix}s3Options`);
    this.setToggle(`#${prefix}combineNotes`, `#${prefix}combineNotesOptions`);

    const vaultFilesID = `#${prefix}vaultFiles`;
    $(vaultFilesID).on('change', (event) => {
      this.vaultFiles = event.target.files;
    });
  }

  setInverseToggle(checkBoxID, toggleDivID) {
    this.setToggle(checkBoxID, toggleDivID, true);
  }

  setToggle(checkBoxID, toggleDivID, inverse = false) {
    $(checkBoxID).change(function () {
      const checkbox = this;
      $(toggleDivID).toggle((!inverse && checkbox.checked) || (inverse && !checkbox.checked));
    });
  }
}