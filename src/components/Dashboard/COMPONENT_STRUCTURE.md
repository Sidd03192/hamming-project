# Box List Components - Visual Structure

## Component Hierarchy

```
BoxList (Container)
├── Header
│   ├── Title: "Redaction Boxes"
│   └── Count Badge: Shows number of boxes
│
└── Items Container (Scrollable)
    └── BoxListItem[] (Multiple items)
        ├── Header
        │   ├── Label (h3)
        │   └── Sensitivity Badge
        │
        ├── Geometry Info Panel
        │   ├── Position: X%, Y%
        │   └── Size: W%, H%
        │
        └── Actions
            ├── Focus Button (secondary)
            ├── Edit Button (secondary)
            └── Delete Button (danger)
```

## Visual Layout

### BoxList Container
```
┌─────────────────────────────────────┐
│  Redaction Boxes            [3]     │ ← Sticky Header
├─────────────────────────────────────┤
│                                     │
│  ┌───────────────────────────────┐ │
│  │ BoxListItem 1                 │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ BoxListItem 2 (Selected)      │ │ ← Highlighted
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ BoxListItem 3                 │ │
│  └───────────────────────────────┘ │
│                                     │
│         ↕ Scrollable                │
└─────────────────────────────────────┘
```

### BoxListItem Card
```
┌─────────────────────────────────────────┐
│  Social Security Number      [HIGH]     │ ← Label + Badge
├─────────────────────────────────────────┤
│  ┌───────────────────────────────────┐  │
│  │ Position: X: 25.0%, Y: 35.0%      │  │ ← Geometry Panel
│  │ Size:     W: 15.0%, H: 5.0%       │  │
│  └───────────────────────────────────┘  │
├─────────────────────────────────────────┤
│  [ 👁 Focus ]  [ Edit ]  [ Delete ]     │ ← Action Buttons
└─────────────────────────────────────────┘
```

## State Variations

### 1. Normal State
- White background (#ffffff)
- Gray border (#e5e7eb)
- Subtle shadow

### 2. Hover State
- Darker border (#cbd5e1)
- Larger shadow
- Slight upward translation (-2px)
- Brighter sensitivity badge

### 3. Selected State
- Blue border (#2563eb)
- Light blue background (#eff6ff)
- Enhanced shadow with blue tint
- Geometry panel with blue background

## Sensitivity Badge Colors

### Low Sensitivity
```
┌──────────┐
│   LOW    │  Background: #d1fae5 (Light Green)
└──────────┘  Text: #065f46 (Dark Green)
              Border: #6ee7b7
```

### Medium Sensitivity
```
┌──────────┐
│   MED    │  Background: #fef3c7 (Light Yellow)
└──────────┘  Text: #92400e (Dark Brown)
              Border: #fcd34d
```

### High Sensitivity
```
┌──────────┐
│   HIGH   │  Background: #fee2e2 (Light Red)
└──────────┘  Text: #991b1b (Dark Red)
              Border: #fca5a5
```

## Empty States

### No Boxes
```
┌─────────────────────────────────────┐
│                                     │
│           ┌───┐                     │
│           │ X │  Large Icon         │
│           └───┘                     │
│                                     │
│    No redaction boxes yet           │
│                                     │
│    Start by drawing a redaction    │
│    box on the document              │
│                                     │
└─────────────────────────────────────┘
```

### No Search Results
```
┌─────────────────────────────────────┐
│                                     │
│           ┌───┐                     │
│           │ 🔍│  Search Icon        │
│           └───┘                     │
│                                     │
│    No boxes match your search       │
│                                     │
│    Try adjusting your search        │
│    filters                          │
│                                     │
└─────────────────────────────────────┘
```

## Responsive Behavior

### Desktop (> 640px)
- Full layout as shown
- Three buttons in a row
- Horizontal geometry info

### Mobile (≤ 640px)
- Reduced padding
- Buttons stack vertically
- Full width buttons
- Smaller text sizes
- Smaller empty state icons

## Dark Mode

### Color Adjustments
- Background: #1f2937 (Dark Gray)
- Text: #f9fafb (Light Gray)
- Borders: #374151 (Medium Gray)
- Selected: #1e3a8a (Dark Blue)
- Badges: Darker versions with lighter text

## Interaction Flow

```
User Action          Component Response
───────────────────────────────────────────
Click Focus     →    onBoxFocus(boxId)
                     → Highlight box on canvas
                     → Scroll to box

Click Edit      →    onBoxEdit(boxId)
                     → Open edit modal
                     → Pre-fill form

Click Delete    →    onBoxDelete(boxId)
                     → Show confirmation
                     → Remove from list

Hover Item      →    Border darkens
                     → Shadow grows
                     → Slight lift effect

Select Item     →    Blue border
                     → Blue background
                     → Persist until deselect
```

## CSS Class Structure

### BoxList Classes
```
.box-list
├── .box-list--empty
├── .box-list__header
│   ├── .box-list__title
│   └── .box-list__count
├── .box-list__items
└── .box-list__empty-state
    ├── .empty-state__icon
    ├── .empty-state__title
    └── .empty-state__description
```

### BoxListItem Classes
```
.box-list-item
├── .box-list-item--selected
├── .box-list-item__header
│   ├── .box-list-item__label
│   └── .sensitivity-badge
│       ├── .sensitivity-badge--low
│       ├── .sensitivity-badge--med
│       └── .sensitivity-badge--high
├── .box-list-item__geometry
│   └── .geometry-info
│       ├── .geometry-info__label
│       └── .geometry-info__value
└── .box-list-item__actions
    └── .box-list-item__btn
        └── .box-list-item__btn--focus
```

## Z-Index Layers

```
Layer 10: .box-list__header (Sticky header)
Layer 1:  .box-list-item (Cards)
Layer 0:  .box-list (Container)
```

## Animation Timing

- Hover transitions: 200ms ease-in-out
- Empty state fade-in: 500ms ease-in-out
- Transform effects: Instant with transition
- Scrollbar hover: 200ms ease-in-out

This structure ensures a clean, maintainable, and accessible component hierarchy.
