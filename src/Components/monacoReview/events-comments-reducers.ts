export type ProposedReviewCommentEvent =
    | {
  type: "create";
  lineNumber: number;
  text: string;
  selection?: CodeSelection;
  commentType?: ReviewCommentType;
  typeState?: ReviewCommentTypeState;
  targetId?: string;
  filePath: string;
}
    | {
  type: "edit";
  text?: string;
  typeState?: ReviewCommentTypeState;
  targetId: string;
  lineNumber: number;
  filePath: string;
}
    | {
  type: "delete";
  targetId: string;
  text: string;
  lineNumber: number;
  filePath: string;
};

export type ReviewCommentEvent = ProposedReviewCommentEvent & {
  id: string;
  createdAt: number;
  createdBy: string;
  filePath: string;
};

export interface ReviewCommentStore {
  comments: Record<string, ReviewCommentState>;
  deletedCommentIds?: Set<string>;
  dirtyCommentIds?: Set<string>;
  events: ReviewCommentEvent[];
  fileComments: Record<string, Set<string>>;
}

export function commentReducer(event: ReviewCommentEvent, state: ReviewCommentStore): ReviewCommentStore {
  const dirtyLineNumbers = new Set<number>();
  const deletedCommentIds = new Set<string>();
  const dirtyCommentIds = new Set<string>();
  const events = (state.events ?? []).concat([event]);
  let comments = { ...state.comments };
  let fileComments = { ...state.fileComments };

  switch (event.type) {
    case "edit": {
      const parent = comments[event.targetId];
      if (!parent) break;

      const edit: ReviewCommentState = {
        comment: {
          ...parent.comment,
          author: event.createdBy,
          dt: event.createdAt,
          text: event.text ?? parent.comment.text,
          typeState: event.typeState === undefined ? parent.comment.typeState : event.typeState,
          filePath: parent.comment.filePath
        },
        history: parent.history.concat(parent.comment),
      };

      dirtyLineNumbers.add(edit.comment.lineNumber);
      comments[event.targetId] = edit;
      break;
    }
    case "delete": {
      const selected = comments[event.targetId];
      if (!selected) break;

      if (fileComments[selected.comment.filePath]) {
        fileComments[selected.comment.filePath].delete(event.targetId);
        if (fileComments[selected.comment.filePath].size === 0) {
          delete fileComments[selected.comment.filePath];
        }
      }

      const { [event.targetId]: _, ...remainingComments } = comments;
      comments = remainingComments;

      deletedCommentIds.add(selected.comment.id);
      dirtyLineNumbers.add(selected.comment.lineNumber);
      break;
    }
    case "create": {
      if (comments[event.id] === undefined) {
        if (!fileComments[event.filePath]) {
          fileComments[event.filePath] = new Set();
        }
        fileComments[event.filePath].add(event.id);

        comments[event.id] = new ReviewCommentState({
          author: event.createdBy,
          dt: event.createdAt,
          id: event.id,
          lineNumber: event.lineNumber,
          selection: event.selection,
          text: event.text,
          parentId: event.targetId,
          status: ReviewCommentStatus.active,
          type: event.commentType ?? ReviewCommentType.comment,
          typeState: event.typeState,
          filePath: event.filePath
        });
        dirtyLineNumbers.add(event.lineNumber);
      }
      break;
    }
  }

  if (dirtyLineNumbers.size > 0) {
    for (const cs of Object.values(state.comments)) {
      if (dirtyLineNumbers.has(cs.comment.lineNumber)) {
        dirtyCommentIds.add(cs.comment.id);
      }
    }
  }

  return { comments, dirtyCommentIds, deletedCommentIds, events, fileComments };
}

export class ReviewCommentState {
  comment: ReviewComment;
  history: ReviewComment[];

  constructor(comment: ReviewComment) {
    this.comment = comment;
    this.history = [comment];
  }
}

export interface CodeSelection {
  startColumn: number;
  endColumn: number;
  startLineNumber: number;
  endLineNumber: number;
}

export enum ReviewCommentType {
  comment = 1,
  suggestion = 2,
  task = 3,
}

export interface ReviewComment {
  id: string;
  parentId?: string;
  author: string | undefined;
  dt: number | undefined;
  lineNumber: number;
  text: string;
  selection: CodeSelection | undefined;
  status: ReviewCommentStatus;
  type: ReviewCommentType;
  typeState: ReviewCommentTypeState;
  filePath: string;
}

export enum ReviewCommentStatus {
  active = 1,
  deleted = 2,
  edit = 3,
}

export enum ReviewCommentRenderState {
  dirty = 1,
  hidden = 2,
  normal = 3,
}

export type ReviewCommentTypeState = unknown;

export function reduceComments(
    events: ReviewCommentEvent[],
    state: ReviewCommentStore = { comments: {}, events: [], fileComments: {} },
): ReviewCommentStore {
  return events.reduce((accState, event) => commentReducer(event, accState), state);
}