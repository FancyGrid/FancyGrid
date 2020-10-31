export default interface GridToGrid {
  dragGroup?: string;
  droppable?: boolean;
  dropGroup?: string;
  dropNotOkCls?: string;
  dropOkCls?: string;
  dropZoneCls?: string;
  onDrop?: Function;
}