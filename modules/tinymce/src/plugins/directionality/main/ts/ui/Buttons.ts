import { Optional } from '@ephox/katamari';
import { Attribute, SugarNode, SugarElement, SelectorFind } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import { NodeChangeEvent } from 'tinymce/core/api/EventTypes';
import { Toolbar } from 'tinymce/core/api/ui/Ui';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';

// if the block is a list item, we need to get the parent of the list itself
const getNormalizedBlock = (element: SugarElement<Element>, isListItem: boolean): SugarElement<Element> => {
  const normalizedElement = isListItem ? SelectorFind.ancestor(element, 'ol,ul') : Optional.some(element);
  return normalizedElement.getOr(element);
};

const isListItem = SugarNode.isTag('li');

const getNodeChangeHandler = (editor: Editor, dir: 'ltr' | 'rtl') => (api: Toolbar.ToolbarToggleButtonInstanceApi) => {
  const nodeChangeHandler = (e: EditorEvent<NodeChangeEvent>) => {
    const blockElement = SugarElement.fromDom(e.element);
    const isBlockElementListItem = isListItem(blockElement);
    const normalizedBlock = getNormalizedBlock(blockElement, isBlockElementListItem);
    const currentDirection = Attribute.get(normalizedBlock, 'dir');
    if (currentDirection === dir) {
      api.setActive(true);
    } else {
      api.setActive(false);
    }
  };
  editor.on('NodeChange', nodeChangeHandler);

  return () => editor.off('NodeChange', nodeChangeHandler);
};

const register = (editor: Editor): void => {
  editor.ui.registry.addToggleButton('ltr', {
    tooltip: 'Left to right',
    icon: 'ltr',
    onAction: () => editor.execCommand('mceDirectionLTR'),
    onSetup: getNodeChangeHandler(editor, 'ltr')
  });

  editor.ui.registry.addToggleButton('rtl', {
    tooltip: 'Right to left',
    icon: 'rtl',
    onAction: () => editor.execCommand('mceDirectionRTL'),
    onSetup: getNodeChangeHandler(editor, 'rtl')
  });
};

export {
  register
};
