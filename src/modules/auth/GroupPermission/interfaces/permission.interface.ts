export interface MainMenuPermission {
  menu_id: string;
  view: string;
  key: string;
}

export interface SubMenuPermission {
  upper_menu_id: string;
  menu_id: string;
  create: string;
  read: string;
  update: string;
  delete: string;
  rowCount: number;
  key: string;
}

export interface MainMenuResult {
  menu_id: string;
  menu_name: string;
}

export interface SubMenuResult {
  upper_menu_id: string;
  upper_menu_name: string;
  menu_id: string;
  menu_name: string;
}

export interface GroupPermissionResponse {
  id: number;
  all_grant: string;
  group_name: string;
  main_menu: { data: MainMenuResult[] };
  sub_menu: { data: SubMenuResult[] };
}
