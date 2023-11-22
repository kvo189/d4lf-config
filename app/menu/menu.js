"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildMenu = void 0;
const electron_1 = require("electron");
function buildMenu() {
    const menu = electron_1.Menu.getApplicationMenu(); // get default menu
    if (!menu)
        return;
    const newMenuItems = menu.items
        .filter(menuItem => { var _a; return ((_a = menuItem.role) === null || _a === void 0 ? void 0 : _a.toLowerCase()) !== 'help'; }) // remove "Help" menu
        .map(menuItem => {
        var _a;
        // Existing logic to modify the 'ViewMenu' item
        if (process.env.NODE_ENV === 'production' && ((_a = menuItem.role) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === 'viewMenu'.toLowerCase()) {
            if (!menuItem.submenu)
                return menuItem;
            const newViewSub = electron_1.Menu.buildFromTemplate(menuItem.submenu.items.slice(4));
            return Object.assign({}, menuItem, { submenu: newViewSub });
        }
        return menuItem;
    });
    const newMenu = electron_1.Menu.buildFromTemplate(newMenuItems);
    electron_1.Menu.setApplicationMenu(newMenu);
    return newMenu;
}
exports.buildMenu = buildMenu;
//# sourceMappingURL=menu.js.map