# S01 — începe aici

Acest pachet conţine numai traseul principal al Seminarului 1: **HTTP Detective** şi **Tiny HTTP Server**. Proiectul 3 nu este inclus în kitul principal.

## Înainte de seminar

1. Extrage complet ZIP-ul într-o cale scurtă, de exemplu `D:\TW2026\S01` sau `$HOME/TW2026/S01`.
2. Nu lucra direct din ZIP, OneDrive/iCloud sau dintr-un folder read-only.
3. Rulează `VERIFY_PACKAGE.cmd` pe Windows sau `bash VERIFY_PACKAGE.sh` pe macOS/Linux.
4. Rulează `CHECK_ENVIRONMENT.cmd` sau `bash CHECK_ENVIRONMENT.sh`.
5. Rezultatul cerut este Node.js `v24.21.0`.
6. **Nu rula `npm install`**: proiectele nu au dependenţe externe.

## Starea iniţială

Rulează `VERIFY_INITIAL_STATE`. Rezultatul corect este:

```text
P1 baseline PASS, objective 1 assertion FAIL, regression PASS
P2 baseline PASS, objective 2 assertion FAIL, regression PASS
```

Orice timeout, crash sau proces rămas activ este o problemă tehnică, nu un expected FAIL.

## Proiectul 1 — HTTP Detective

Porneşte cu `START_PROJECT_1`. Apasă butonul din pagină şi inspectează DevTools → Network. Modifici numai `02_PROJECTS/P01_HTTP_DETECTIVE/case-report.json`.

## Proiectul 2 — Tiny HTTP Server

Modifici numai `02_PROJECTS/P02_TINY_HTTP_SERVER/src/application-handler.js`. Porneşte cu `START_PROJECT_2`; opreşte serverul cu `Ctrl+C`.

## La final

Rulează `VERIFY_WORK_RESULT`. Verdictul cerut este `PASS_WORK_RESULT`.

## Predarea individuală în Moodle

Completaţi formularul din `05_MOODLE_SUBMISSION`, exportaţi PDF-ul `TW2026_S01_GRUPA_Nume_Prenume.pdf` şi încărcaţi-l individual în Assignment-ul S01. Auditul Gemini, dovada şi limita sunt obligatorii.
