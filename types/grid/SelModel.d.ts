export default interface SelModel {
  activeCell?: boolean;
  allowDeselect?: boolean;
  checkOnly?: boolean;
  continueEditOnEnter?: 'right'|'bottom';
  disabled?: boolean;
  keyNavigation?: boolean;
  memory?: boolean;
  selectBottomCellAfterEdit?: boolean;
  selectBottomCellOnDown?: boolean;
  selectLeftCellOnLeftEnd?: boolean;
  selectRightCellOnEnd?: boolean;
  selectUpCellOnUp?: boolean;
  selectLeafsOnly?: boolean;
  type?: string;
}