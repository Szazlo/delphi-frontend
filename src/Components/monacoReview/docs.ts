/* eslint-disable @typescript-eslint/no-explicit-any */
import { createReviewManager, type ReviewManager } from "./index.ts";
import type * as monacoEditor from "monaco-editor";
import * as moment from "dayjs";
import { type ReviewCommentEvent } from "./events-comments-reducers.ts";

interface WindowDoc {
  require: any;
  monaco: any;
  setView: (
    editorMode: string,
    diffMode: string,
    theme: string,
    currentUser: string,
    editorReadonly: boolean,
    commentsReadonly: boolean,
  ) => void;
  generateDifferentComments: () => void;
  generateDifferentContents: () => void;
  clearComments: () => void;
  setCurrentUser: (user: string) => void;

  toggleSummaryView: () => void;
}

const win = window as any as WindowDoc;
let reviewManager: ReviewManager | undefined;
let currentMode: string = "";
let currentDiffMode: string = "";
let currentEditor: monacoEditor.editor.IStandaloneCodeEditor | undefined;

const fooUser = "foo.user";
const barUser = "bar.user";

async function ensureMonacoIsAvailable(): Promise<string> {
  return await new Promise((resolve) => {
    if (!win.require) {
      console.warn("Unable to find a local node_modules folder - so dynamically using cdn instead");
      const github = "https://microsoft.github.io/monaco-editor";
      const loader = "/node_modules/monaco-editor/min/vs/loader.js";

      const prefix = window.location.host.includes("github") ? github : "";
      console.log("prefix", prefix);

      if (prefix !== null) {
        const scriptTag = document.createElement("script");
        scriptTag.src = prefix + loader;
        scriptTag.onload = () => {
          console.debug("Monaco loader is initialized");
          resolve(prefix);
        };
        document.body.appendChild(scriptTag);
      } else {
        document.body.innerHTML = "Unable to find monaco node_modules";
      }
    } else {
      resolve("..");
    }
  });
}

function getRandomInt(max: number): number {
  return Math.floor(Math.random() * Math.floor(max));
}

function setView(
  editorMode: string,
  diffMode: string,
  theme: string,
  currentUser: string,
  editorReadonly: boolean,
  commentsReadonly: boolean,
) {
  const idx = getRandomInt(exampleSourceCode.length / 2) * 2;

  if (editorMode !== currentMode || diffMode !== currentDiffMode) {
    const containerEditor = document.getElementById("containerEditor");
    if (containerEditor) {
      containerEditor.innerHTML = "";
    }
    if (editorMode === "editor-mode") {
      currentEditor = win.monaco.editor.create(document.getElementById("containerEditor"), {
        value: exampleSourceCode[idx],
        language: "typescript",
        glyphMargin: true,
        contextmenu: true,
        automaticLayout: true,
        readOnly: editorReadonly,
        theme,
      });
      if (currentEditor) {
        initReviewManager(currentEditor, currentUser, commentsReadonly);
      }
    } else {
      const originalModel = win.monaco.editor.createModel(exampleSourceCode[idx], "typescript");
      const modifiedModel = win.monaco.editor.createModel(exampleSourceCode[idx + 1], "typescript");

      const e = win.monaco.editor.createDiffEditor(document.getElementById("containerEditor"), {
        renderSideBySide: diffMode !== "inline-diff",
        theme,
        readOnly: editorReadonly,
        glyphMargin: true,
        contextmenu: true,
        automaticLayout: true,
      });
      e.setModel({
        original: originalModel,
        modified: modifiedModel,
      });

      initReviewManager(e.getModifiedEditor(), currentUser, commentsReadonly);
    }

    currentMode = editorMode;
    currentDiffMode = diffMode;

    // reviewManager.config.renderComment = customRenderComment;
    // reviewManager.refreshComments();
  } else if (reviewManager) {
    reviewManager.currentUser = currentUser;
    reviewManager.setReadOnlyMode(commentsReadonly);
  }
}

function generateDifferentContents(): void {
  const idx = getRandomInt(exampleSourceCode.length / 2) * 2;

  if (currentMode.startsWith("standard")) {
    currentEditor?.setValue(exampleSourceCode[idx]);
  } else {
    const e = currentEditor as any;
    e.getModel().modified.setValue(exampleSourceCode[idx]);
    e.getModel().modified.setValue(exampleSourceCode[idx + 1]);
  }
}

const exampleSourceCode: string[] = [];

async function fetchSourceCode(url: string) {
  const response = await fetch(url);
  const exampleText = await response.text();

  const modifiedText = exampleText.replace(new RegExp("string", "g"), "string /* String!*/");

  const longLines =
    "A very very long line of text A very very long line of text A very very long line of text A very very long line of text A very very long line of text A very very long line of text A very very long line of text A very very long line of text A very very long line of text A very very long line of text A very very long line of text A very very long line of text \nA very very long line of text A very very long line of text A very very long line of text A very very long line of text A very very long line of text A very very long line of text A very very long line of text A very very long line of text A very very long line of text A very very long line of text A very very long line of text ";

  exampleSourceCode.push(url + "\n" + longLines + exampleText);
  exampleSourceCode.push(url + "\n" + longLines + modifiedText);
}

async function init() {
  console.log("[init] 123");

  const prefix = await ensureMonacoIsAvailable();
  await fetchSourceCode("../src/index.ts");
  await fetchSourceCode("../src/docs.ts");
  await fetchSourceCode("../src/index.test.ts");

  win.require.config({
    paths: { vs: prefix + "/node_modules/monaco-editor/min/vs" },
  });

  win.require(["vs/editor/editor.main"], function () {
    setView("editor-mode", "", "vs-dark", fooUser, false, false);

    window.dispatchEvent(new Event("monaco-ready"));
  });
}

function initReviewManager(editor: monacoEditor.editor.IStandaloneCodeEditor, currentUser: string, readOnly: boolean) {
  reviewManager = createReviewManager(
    editor,
    currentUser,
    createRandomComments(),
    (updatedComments) => {
      renderComments(updatedComments);
    },
    {
      editButtonEnableRemove: true,
      formatDate: (createdAt: Date | string) => moment(createdAt).format("YY-MM-DD HH:mm"),
      readOnly,
      verticalOffset: 5,
      commentIndentOffset: 10,
    },
    true,
  );
  renderComments(reviewManager.events);
}

// function customRenderComment(isActive: boolean, comment: ReviewCommentIterItem) {
//   const div = document.createElement("div")
//   div.style.backgroundColor = isActive ? "yellow" : "grey";
//   div.style.border = "1px solid red";
//   div.style.margin = "2px";
//   div.style.left = "45px";

//   div.innerText = JSON.stringify(comment.state.comment.text);
//   return div as HTMLElement;
// }

function generateDifferentComments() {
  if (reviewManager) {
    reviewManager.load(createRandomComments());
    renderComments(reviewManager.events);
  }
}

function setCurrentUser(user: string) {
  if (reviewManager) {
    reviewManager.currentUser = user;
  }
}

function createRandomComments(): ReviewCommentEvent[] {
  const firstLine = Math.floor(Math.random() * 10);

  const result: ReviewCommentEvent[] = [
    {
      type: "create",
      id: "id-0",
      lineNumber: firstLine + 10,
      createdBy: fooUser,
      createdAt: new Date().getTime(),
      text: "at start 1",
      selection: {
        startColumn: 5,
        startLineNumber: firstLine + 5,
        endColumn: 10,
        endLineNumber: firstLine + 10,
      },
    },
    {
      id: "id-2-edit",
      targetId: "id-2",
      type: "edit",
      createdBy: fooUser,
      createdAt: new Date().getTime(),
      text: "EDIT EDIT at start",
    },
    {
      id: "id-1",
      type: "create",
      lineNumber: firstLine + 5,
      createdBy: fooUser,
      createdAt: new Date().getTime(),
      text: `###  Markdown Example

      Sample. This sampcle is loaded from the
      
      This sampcle is loaded from the the \`innerHTML of the\` \`<wc-markdown>\` tag
      
      <script>alert()</script>
      `,
    },
    {
      id: "id-2",
      type: "create",
      targetId: "id-1",
      lineNumber: firstLine + 5,
      createdBy: fooUser,
      createdAt: new Date().getTime(),
      text: "this code isn't very good",
    },
    {
      id: "id-3",
      type: "create",
      targetId: "id-2",
      lineNumber: firstLine + 5,
      createdBy: barUser,
      createdAt: new Date().getTime(),
      text: "I think you will find it is good enough",
    },
    {
      id: "id-4",
      targetId: "id-3",
      type: "create",
      lineNumber: firstLine + 5,
      createdBy: barUser,
      createdAt: new Date().getTime(),
      text: "I think you will find it is good enough",
    },
    {
      id: "id-5",
      targetId: "id-3",
      type: "create",
      lineNumber: firstLine + 5,
      createdBy: barUser,
      createdAt: new Date().getTime(),
      text: "I think you will find it is good enough",
    },
    {
      id: "id-6",
      targetId: "id-3",
      type: "create",
      lineNumber: firstLine + 5,
      createdBy: barUser,
      createdAt: new Date().getTime(),
      text: "I think you will find it is good enough",
    },
  ];
  return result;
}

function renderComments(events: ReviewCommentEvent[]) {
  events = events || [];
  console.log("Events::: #", events.length, events);

  const rawHtml =
    "<table><tr><td>Type</td><td>Id</td><td>Created By</td><td>Create At</td></tr>" +
    events
      .map((comment) => {
        return `<tr>
                  <td>${comment.type || "&nbsp;"}</td>
                  <td>${comment.id || "&nbsp;"}</td>
                  <td>${comment.createdBy}</td> 
                  <td>${comment.createdAt}</td>                     
                </tr>
                <tr>
                  <td colspan="4" class="comment_text">${JSON.stringify(comment) || "&nbsp;"}</td>                    
                </tr>`;
      })
      .join("") +
    "</table>";

  const activeComments = reviewManager ? Object.values(reviewManager.store.comments).map((cs) => cs.comment) : [];
  const activeHtml =
    "<table><tr><td>Id</td><td>Line Num</td><td>Created By</td><td>Create At</td></tr>" +
    activeComments
      .map(
        (comment) =>
          `<tr>
                <td>${comment.id || "&nbsp;"}</td>                                     
                <td>${comment.lineNumber}</td>
                <td>${comment.author}</td> 
                <td>${comment.dt}</td> 
            </tr>
            <tr>
                <td colspan="4" class="comment_text">${comment.text}</td>                                        
            </tr>`,
      )
      .join("") +
    "</table>";

  const commentsDiv = document.getElementById("commentsDiv");
  if (commentsDiv) commentsDiv.innerHTML = `<div><h5>Active Comments</h5>${activeHtml}</div><div>`;

  const eventsDiv = document.getElementById("eventsDiv");
  if (eventsDiv) eventsDiv.innerHTML = `<div><h5>Events</h5>${rawHtml}</div>`;
}

function clearComments() {
  reviewManager?.load([]);
  renderComments([]);
}

function toggleSummaryView() {
  const o = document.getElementById("summaryEditor");
  if (o) {
    o.style.display = o.style.display === "none" ? "" : "none";
  }

  // currentEditor.layout();
}

win.setView = setView;
win.generateDifferentComments = generateDifferentComments;
win.generateDifferentContents = generateDifferentContents;
// win.handleCommentReadonlyChange = handleCommentReadonlyChange;
win.clearComments = clearComments;
win.setCurrentUser = setCurrentUser;
win.toggleSummaryView = toggleSummaryView;

init();
