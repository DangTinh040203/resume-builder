# Resume Editor & Live Preview

The core editing experience: a sectioned form on the left, a live PDF preview on the right, and one-keystroke save. State lives in Redux; the preview is a pure function of that state.

**Key files (`apps/fe`):**
`app/[locale]/(main-layout)/builder/page.tsx`, `components/builder-screen/*` (forms, `template-preview`, `template-format`, `resume-control`), `stores/features/resume.slice.ts`, `stores/features/template.slice.ts`, `hooks/useSyncResume.ts`, `hooks/useGlobalSaveShortcut.ts`.

---

## Data flow

```mermaid
flowchart LR
    Form["Section form<br/>(react-hook-form)"] -->|"dispatch(updateResume)"| RS["resume slice"]
    Fmt["TemplateFormat panel"] -->|"updateTemplateConfigFormat"| TS["template slice"]
    RS --> Sel["selectors<br/>resumeSelector / templateFormatSelector"]
    TS --> Sel
    Sel --> Prev["TemplatePreview<br/>@react-pdf/renderer"]
    Prev --> View["Live PDF in browser"]
```

- A field edit calls `dispatch(updateResume(partial))` — a shallow merge into `state.resume`.
- The template settings panel dispatches `updateTemplateConfigFormat(Partial<Format>)`.
- `TemplatePreview` subscribes via `resumeSelector` + `templateFormatSelector`, so any change re-renders the PDF immediately. The `previewMode` flag swaps the center pane between the form and a full-page preview.

---

## Section reordering (dnd-kit)

```mermaid
sequenceDiagram
    autonumber
    participant U as User drag
    participant DC as DndContext / SortableContext
    participant H as onDragEnd
    participant T as template slice
    participant P as TemplatePreview
    U->>DC: drop a section
    DC->>H: { active, over }
    H->>H: arrayMove(sectionOrder, from, to)
    H->>T: updateTemplateConfigFormat({ sectionOrder })
    T->>P: re-render in new order
```

`hiddenSections` works the same way — toggling visibility dispatches a format update, and the section registry skips hidden keys when rendering.

---

## Save flow (Ctrl/Cmd+S or Save button)

```mermaid
sequenceDiagram
    autonumber
    participant K as useGlobalSaveShortcut
    participant S as useSyncResume.sync()
    participant Svc as ResumeService
    participant BE as POST /resumes/:id
    participant R as resume slice

    K->>S: Ctrl/Cmd+S (preventDefault)
    S->>S: guard — skip if already syncing
    S->>Svc: updateResume(id, resumeState)
    Svc->>BE: POST with Bearer token
    BE-->>Svc: updated Resume
    Svc->>R: dispatch(setResume(updated))
    Note over S: isSyncing toggles for UI feedback
```

`useSyncResume` returns `{ sync, isSyncing, resume }` and uses a ref flag to prevent overlapping requests. The backend response replaces local state via `setResume`, so server-generated ids/timestamps flow back in.

---

## The `Format` object

`template.slice` holds a `Format` that fully describes presentation — typography (`fontSize`, `fontFamily`, `titleSize`, `lineHeight`, `fontWeight`, `letterSpacing`), layout (`sectionSpacing`, `margin`, `columnLayout`, `sectionOrder`, `hiddenSections`, `headerStyle`), and appearance (`color` default `#1e3a8a`, `theme`, `borderStyle`, `dateFormat` default `MM/YYYY`). The `use-template-0{1..5}-style` hooks turn this object into `@react-pdf/renderer` StyleSheets, so changing a slider re-styles the preview without touching resume content.

Next: [PDF Export →](pdf-export.md)
