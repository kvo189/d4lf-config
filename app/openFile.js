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
exports.openFile = void 0;
const { shell } = require('electron');
const fs = require('fs').promises; // Use promises API for simpler async handling
function openFile(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield fs.access(filePath);
            const result = yield shell.openPath(filePath);
            if (result) {
                console.error('Error opening file:', result);
                throw new Error(`Error opening file ${result}`);
            }
        }
        catch (error) {
            console.error('Failed to open file:', error);
            throw error;
        }
    });
}
exports.openFile = openFile;
//# sourceMappingURL=openFile.js.map