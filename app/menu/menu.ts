import { Menu } from 'electron';

export function buildMenu() {
  const menu = Menu.getApplicationMenu(); // get default menu
  if (!menu) return;
  const newMenuItems = menu.items
    .filter(menuItem => menuItem.role?.toLowerCase() !== 'help') // remove "Help" menu
    .map(menuItem => {
      // Existing logic to modify the 'ViewMenu' item
      if (process.env.NODE_ENV === 'production' && menuItem.role?.toLowerCase() === 'viewMenu'.toLowerCase()) {
        if (!menuItem.submenu) return menuItem;
        const newViewSub = Menu.buildFromTemplate(
          menuItem.submenu.items.slice(4)
        );
        return Object.assign({}, menuItem, { submenu: newViewSub });
      }
      return menuItem;
    });

  const newMenu = Menu.buildFromTemplate(newMenuItems);
  Menu.setApplicationMenu(newMenu);
  return newMenu;
}
