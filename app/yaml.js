"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeYamlFile = exports.readProfileFiles = exports.readYamlFile = void 0;
const fs_1 = require("fs");
const yaml = require("js-yaml");
const path = require("path");
function readYamlFile(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield fs_1.promises.readFile(filePath, 'utf8');
            return yaml.load(data);
        }
        catch (err) {
            throw err;
        }
    });
}
exports.readYamlFile = readYamlFile;
function readProfileFiles(profilesPath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const files = yield fs_1.promises.readdir(profilesPath);
            const yamlFiles = files.filter(file => file.endsWith('.yaml') || file.endsWith('.yml'));
            const fileContents = yield Promise.all(yamlFiles.map((file) => __awaiter(this, void 0, void 0, function* () {
                const content = yield readYamlFile(path.join(profilesPath, file));
                return { fileName: file, content };
            })));
            return fileContents;
        }
        catch (err) {
            throw err;
        }
    });
}
exports.readProfileFiles = readProfileFiles;
function writeYamlFile(filePath, yamlString) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // const yamlData = convertToYaml(data);
            yield fs_1.promises.writeFile(filePath, yamlString, 'utf8');
        }
        catch (err) {
            throw err;
        }
    });
}
exports.writeYamlFile = writeYamlFile;
//# sourceMappingURL=yaml.js.map