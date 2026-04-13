## 1. Add PharmaceuticalTextNormalizer class

- [x] 1.1 Create `backend/MIMS.Application/Common/Helpers/PharmaceuticalTextNormalizer.cs` with the `NormalizerSnapshot` sealed class and all private fields (`ConcentrationPatternRegex`, `_initLock`, `_snapshot`)
- [x] 1.2 Implement `PharmaceuticalTextNormalizer.Initialize(...)` — call `BuildSnapshot(...)` and update `_snapshot` under lock
- [x] 1.3 Implement `PharmaceuticalTextNormalizer.Normalize(string input)` — full 9-step pipeline (whitespace collapse, thousands comma removal, percentage gluing, concentration expansion, dosage ratio expansion, glued token splitting, hyphenated form expansion, multi-word abbreviation expansion, single-word abbreviation expansion, special-character removal, final lowercase + trim)
- [x] 1.4 Implement all private helper methods: `BuildSnapshot`, `ExpandConcentrationPatterns`, `ExpandDosageRatios`, `ExpandSingleStrengthToken`, `ExpandGluedTokens`, `ExpandHyphenatedDosageForms`, `ExpandMultiWordAbbreviations`, `ExpandSingleWordAbbreviations`, `RemoveSpecialCharacters`, `ExpandUnit`, `ReplaceWholeWord`, `ReplaceWholeToken`

## 2. Wire up startup initialization

- [x] 2.1 In `backend/MIMS.Api/Program.cs`, add a call to `PharmaceuticalTextNormalizer.Initialize(...)` with all five hardcoded dictionaries (`unitExpansions`, `gluedTokens`, `hyphenatedForms`, `multiWordAbbr`, `singleWordAbbr`) before `app.Run()`
- [x] 2.2 Add the `using MIMS.Application.Common.Helpers;` directive to `Program.cs`

## 3. Update TextNormalizer to delegate

- [x] 3.1 Replace the body of `TextNormalizer.Normalize` in `backend/MIMS.Application/Common/Helpers/TextNormalizer.cs` with a single call to `PharmaceuticalTextNormalizer.Normalize(input)`, removing the old regex and inline logic
