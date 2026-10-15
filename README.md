# Project VC Goal Builder

A single-file web tool for teachers writing IEPs for emergent and AAC learners. The teacher screens a student on the Project VC scales (Yes, No, or Don't know), selects one target skill, and builds a measurable annual goal with short-term objectives and benchmarks. The tool also drafts a PLAAFP, suggests TEKS alignment, and prints a data sheet.

The tool is not an assessment. It documents what the student uses and needs on the IEP, and it does not score, rate, or assign a funding tier. All output is draft language for review by the ARD committee.

Nothing is saved or sent. Entries clear when the page closes. Output leaves the tool by copy, print, or download.

## Use

Open `index.html` in a browser. No server or install is needed.

When the page runs outside the Claude app, the download buttons are hidden. Copy and print still work.

## Build from source

```
python3 build.py
```

This joins `src/skills.js`, `core.js`, `docs.js`, `views.js` and `app.js`, the stylesheet, and `data/appdata.json` into a self-contained `index.html`.

| Path | Contents |
| --- | --- |
| `src/skills.js` | Goal-ready skill bank for Project VC levels E1, E2 and T3 on all five scales: wording, measure options, defaults, tags, what-counts examples, and optional access conditions. |
| `src/core.js` | State, bottom-up screening, communication forms and functions, AAC section, goal and criterion logic, TEKS defaults. |
| `src/docs.js` | Credits text, PLAAFP model, goal and objective text, data sheets. |
| `src/views.js` | Screen rendering for each step. |
| `src/app.js` | Event handling, copy, print, and download. |
| `data/appdata.json` | Project VC indicators and examples, and the TEKS crosswalk. |

Skills at T4 and above do not have a bank entry yet. They use the original Project VC wording with generic count and percent measures.

## Sources and credit

**Project VC progress monitoring scales and Evidence Tracker.** Project VC © 2026 Center for Literacy and Disability Studies, Department of Health Sciences, UNC-Chapel Hill, licensed under CC BY-SA 4.0 (https://creativecommons.org/licenses/by-sa/4.0). Source documents: Progress Monitoring Tool Scale Packet, All Scales (revised March 2026) and Evidence Tracker, All Scales. This tool adapts that material: screening questions are asked from the simplest level up, each indicator is paired with a goal-ready skill statement and measurement options, and goal, objective, and data sheet wording is generated from them. Indicator wording is reproduced from the packet. Share-alike applies to the Project VC content reproduced here.

**Goal components and benchmark rules.** Goal components (timeframe, conditions, behavior, criterion), objective and benchmark requirements, and progress reporting follow the TEA Question and Answer Document: IEP Measurable Annual Goals (revised October 2026), which cites 19 TAC §89.1055 and 34 CFR §300.320. Copyright © 2026 Texas Education Agency. All rights reserved.

**Standards-based IEP and PLAAFP elements.** PLAAFP essential elements from the 2025-26 Texas Education Agency Standards-Based IEP Process Training. Copyright © 2025 Texas Education Agency. All rights reserved.

**Equipment and technology language.** Descriptors for equipment and technology (Factor D of Domain 1, Curriculum and Instruction Supports, and Domain 3, Communication Supports) are adapted from the Texas Education Agency New Intensity of Services Funding Model (June 2026). This tool does not score the rubric or assign a funding tier. Funding classifications do not determine placement, location, or services. ARD committees make those decisions individually.

**TEKS alignment.** Texas Essential Knowledge and Skills for English Language Arts and Reading (Kindergarten to Grade 8 adopted May 10, 2017; English I to IV adopted June 23, 2017, as amended 6/2019), from the TEA K-12 English Language Arts and Reading Vertical Alignment (06/2019) and the TEA Early Childhood Education Division Language and Literacy Vertical Alignment, Birth to Grade 2. The links between Project VC indicators and TEKS threads are a draft crosswalk prepared for this tool. The ARD committee should confirm each alignment against the current TEKS.

**Communication checklists.** The communication forms and functions checklist and the AAC system checklist are informal teacher documentation tools. They are not standardized assessments.

## License

No license has been chosen. Because the tool reproduces Project VC content (CC BY-SA 4.0), any license for this repository needs to keep that content under CC BY-SA 4.0 with attribution. The Texas Education Agency materials listed above are marked all rights reserved, so confirm their reuse terms before making this repository public or sharing it widely.
