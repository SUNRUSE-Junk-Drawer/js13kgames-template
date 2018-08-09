import * as path from "path"
import recursiveReaddir from "recursive-readdir"
import InstancedBuildStage from "./instancedBuildStage"

export default class FileSearchBuildStage extends InstancedBuildStage {
  constructor(parent, name, dependencies, disabled, instanceFactory, searchPathFactory) {
    super(parent, name, dependencies, disabled, instanceFactory)
    this.searchPathFactory = searchPathFactory
  }

  getInstanceNames() {
    recursiveReaddir(path.join.apply(path, this.searchPathFactory()), (error, files) => this.handle(error, () => this.gotInstanceNames(files)))
  }
}
