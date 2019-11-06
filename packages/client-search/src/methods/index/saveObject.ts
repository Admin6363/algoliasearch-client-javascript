import { createWaitablePromise, WaitablePromise } from '@algolia/client-common';
import { RequestOptions } from '@algolia/transporter';

import { SaveObjectResponse, SaveObjectsOptions, SearchIndex } from '../..';
import { HasWaitTask } from '.';
import { HasSaveObjects, saveObjects } from './saveObjects';

export const saveObject = <TSearchIndex extends SearchIndex>(
  base: TSearchIndex
): TSearchIndex & HasWaitTask & HasSaveObjects & HasSaveObject => {
  return {
    ...saveObjects(base),
    saveObject(
      object: object,
      requestOptions?: RequestOptions & SaveObjectsOptions
    ): Readonly<WaitablePromise<SaveObjectResponse>> {
      return createWaitablePromise<SaveObjectResponse>(
        this.saveObjects([object], requestOptions).then<SaveObjectResponse>(response => {
          return {
            objectID: response[0].objectIDs[0],
            taskID: response[0].taskID,
          };
        })
      ).onWait((response, waitRequestOptions) =>
        this.waitTask(response.taskID, waitRequestOptions)
      );
    },
  };
};

export type HasSaveObject = {
  readonly saveObject: (
    object: object,
    requestOptions?: RequestOptions & SaveObjectsOptions
  ) => Readonly<WaitablePromise<SaveObjectResponse>>;
};
