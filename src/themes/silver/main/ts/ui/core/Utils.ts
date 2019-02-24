/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Toolbar } from '@ephox/bridge';
import { Cell, Option } from '@ephox/katamari';
import { Editor } from 'tinymce/core/api/Editor';

type Unbinder = () => void;

const onSetupFormatToggle = (editor: Editor, name: string) => (api: Toolbar.ToolbarToggleButtonInstanceApi) => {
  const unbindCell = Cell<Option<Unbinder>>(Option.none());

  const init = () => {
    api.setActive(editor.formatter.match(name));
    const unbind = editor.formatter.formatChangedWithUnbind(name, api.setActive).unbind;
    unbindCell.set(Option.some(unbind));
  };

  // The editor may or may not have been setup yet, so check for that
  editor.formatter ? init() : editor.on('init', init);

  return () => unbindCell.get().each((unbind) => unbind());
};

export {
  onSetupFormatToggle
};