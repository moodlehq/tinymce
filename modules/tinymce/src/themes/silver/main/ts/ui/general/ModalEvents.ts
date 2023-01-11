import { CustomEvent } from '@ephox/alloy';
import { Id } from '@ephox/katamari';

// tslint:disable-next-line:no-empty-interface
export interface ModalFullscreenEvent extends CustomEvent {

}

const modalFullscreenEvent = Id.generate('modal-fullscreen');

export {
  modalFullscreenEvent
};
