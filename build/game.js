import * as buildStage from "./buildStage"
import BuildStage from "./buildStage"
import ReadJsonBuildStage from "./readJsonBuildStage"
import DeleteDirectoryBuildStage from "./deleteDirectoryBuildStage"
import CreateDirectoryBuildStage from "./createDirectoryBuildStage"
import ZipDirectoryBuildStage from "./zipDirectoryBuildStage"
import GenerateMetadataHeaderBuildStage from "./generateMetadataHeaderBuildStage"
import addWasmBuildStages from "./wasm/addWasmBuildStages"

export default class Game extends BuildStage {
  constructor(parent, name, oneOff) {
    super(parent, name, [], false)
    this.oneOff = oneOff
    this.files = []

    const metadata = new ReadJsonBuildStage(
      this,
      `metadata`,
      () => [`games`, name, `metadata.json`],
      []
    )

    const deleteTempDirectory = new DeleteDirectoryBuildStage(
      this,
      `deleteTempDirectory`,
      () => [`games`, name, `temp`],
      [metadata]
    )

    const createTempDirectory = new CreateDirectoryBuildStage(
      this,
      `createTempDirectory`,
      () => [`games`, name, `temp`],
      [deleteTempDirectory]
    )

    const deleteDistDirectory = new DeleteDirectoryBuildStage(
      this,
      `deleteDistDirectory`,
      () => [`games`, name, `dist`],
      [metadata]
    )

    const createDistDirectory = new CreateDirectoryBuildStage(
      this,
      `createDistDirectory`,
      () => [`games`, name, `dist`],
      [deleteDistDirectory]
    )

    const generateMetadataHeader = new GenerateMetadataHeaderBuildStage(
      this,
      metadata,
      createTempDirectory
    )

    addWasmBuildStages(this, metadata, createDistDirectory)

    new ZipDirectoryBuildStage(
      this,
      `wasm/zip`,
      () => [`games`, name, `dist`, `wasm`],
      () => [`dist`, `${metadata.json.applicationName}.zip`],
      [
        this.buildStage(`wasm/html`),
        this.buildStage(`wasm/bootloader`),
      ]
    )

    metadata.start()
  }

  buildStage(name) {
    return buildStage.all.find(buildStage => buildStage.name == name)
  }

  performStart() {
    this.done()
  }
}
