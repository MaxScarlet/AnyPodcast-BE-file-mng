import fse from "fs-extra";
import path from "path";
import packs from "./package-lock.json";

const rootFolder = process.cwd();
const initialFolder = path.join(rootFolder, "node_modules");
const distrFolder = path.join(rootFolder, "dist");

const packKeys = Object.keys(packs.packages);
packKeys.forEach((packNameFull: string) => {
	if (packNameFull) {
		const d = packs.packages[packNameFull];
		const packName = packNameFull.replace("node_modules/", "");
		let pathTo;
		if (d.dev) {
			console.log(`${packName} ...dev package, skipped.`);
		} else {
			const pathFrom = path.join(initialFolder, packName);
			pathTo = path.join(distrFolder, "node_modules", packName);
			fse.copySync(pathFrom, pathTo, { overwrite: true });
			console.log(`${packName} ...copied as-is.`);
		}
	}
});
