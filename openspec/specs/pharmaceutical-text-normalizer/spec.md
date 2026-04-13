### Requirement: Pharmaceutical text normalizer initialization
The system SHALL initialize `PharmaceuticalTextNormalizer` exactly once at application startup before any requests are served, by calling `PharmaceuticalTextNormalizer.Initialize(...)` with hardcoded lookup dictionaries for unit expansions, glued tokens, hyphenated dosage forms, multi-word abbreviations, and single-word abbreviations.

#### Scenario: Startup initializes the normalizer
- **WHEN** the application starts and `Program.cs` executes before `app.Run()`
- **THEN** `PharmaceuticalTextNormalizer.Initialize(...)` SHALL be called with all five lookup dictionaries and the normalizer SHALL be ready to process text

#### Scenario: Normalize called before initialization
- **WHEN** `PharmaceuticalTextNormalizer.Normalize(input)` is called before `Initialize` has been called
- **THEN** the method SHALL throw an `InvalidOperationException` with a message indicating initialization has not occurred

---

### Requirement: Whitespace and numeric pre-processing
The normalizer SHALL perform pre-processing on the input string before domain-specific expansions: collapse consecutive whitespace to a single space, remove thousands-grouping commas between digits (e.g. `1,000` → `1000`), and merge a numeral immediately followed by a space and `%` into a single token (e.g. `0.25 %` → `0.25%`).

#### Scenario: Thousands commas removed
- **WHEN** input contains `1,000 mcg`
- **THEN** the normalizer SHALL produce output containing `1000`

#### Scenario: Percentage merged
- **WHEN** input contains `0.25 %`
- **THEN** the normalizer SHALL treat it as `0.25%` before subsequent steps

---

### Requirement: Concentration pattern expansion
The normalizer SHALL expand concentration-type suffixes attached to `%` — specifically `w/w`, `w/v`, and `v/v` — into their long-form equivalents (`weight per weight`, `weight per volume`, `volume per volume`), case-insensitively.

#### Scenario: Weight per volume concentration expanded
- **WHEN** input contains `5%w/v`
- **THEN** the normalizer SHALL produce output containing `5% weight per volume`

#### Scenario: Volume per volume concentration expanded
- **WHEN** input contains `10% v/v`
- **THEN** the normalizer SHALL produce output containing `10% volume per volume`

---

### Requirement: Dosage ratio expansion
The normalizer SHALL expand dosage ratio patterns (number+unit `/` number+unit) into long-form text using `per` as the separator. Multi-component strengths (three or more slash-separated tokens) SHALL be joined with ` / `.

#### Scenario: Two-part ratio expanded with per
- **WHEN** input contains `200mg/5mL`
- **THEN** the normalizer SHALL produce output containing `200 milligram per 5 milliliter`

#### Scenario: Three-part strength joined with slash
- **WHEN** input contains `250mg/250mg/10mg`
- **THEN** the normalizer SHALL produce output containing `250 milligram / 250 milligram / 10 milligram`

---

### Requirement: Glued number-unit token splitting
The normalizer SHALL split tokens where a number is directly adjacent to a known unit abbreviation (e.g. `500mg` → `500 milligram`) or a known glued suffix (e.g. `60millioncells` → `60 million cells`).

#### Scenario: Milligram token split
- **WHEN** input contains `500mg`
- **THEN** the normalizer SHALL produce output containing `500 milligram`

#### Scenario: Million cells token split
- **WHEN** input contains `60millioncells`
- **THEN** the normalizer SHALL produce output containing `60 million cells`

---

### Requirement: Hyphenated dosage form expansion
The normalizer SHALL expand known hyphenated compound dosage-form codes (e.g. `DT-Tab`, `Pwd-Inj`, `FC-Tab`) into their full English equivalents as whole tokens (not as substrings of longer words).

#### Scenario: Dispersible tablet code expanded
- **WHEN** input contains `DT-Tab`
- **THEN** the normalizer SHALL produce output containing `dispersible tablet`

#### Scenario: Powder for injection code expanded
- **WHEN** input contains `Pwd-Inj`
- **THEN** the normalizer SHALL produce output containing `powder for injection`

---

### Requirement: Multi-word abbreviation expansion
The normalizer SHALL expand known multi-word pharmaceutical abbreviations (e.g. `powd for inj`, `film-coated tab`, `oral susp`) into their full forms, matching them case-insensitively at word boundaries.

#### Scenario: Powder for injection multi-word expanded
- **WHEN** input contains `powd for inj`
- **THEN** the normalizer SHALL produce output containing `powder for injection`

#### Scenario: Film-coated tablet multi-word expanded
- **WHEN** input contains `film-coated tab`
- **THEN** the normalizer SHALL produce output containing `film-coated tablet`

---

### Requirement: Single-word abbreviation expansion
The normalizer SHALL expand known single-word pharmaceutical abbreviations (e.g. `tab`, `cap`, `inj`, `susp`, `soln`) into their full forms, matching them case-insensitively at word boundaries.

#### Scenario: Tablet abbreviation expanded
- **WHEN** input contains standalone `tab`
- **THEN** the normalizer SHALL produce output containing `tablet`

#### Scenario: Injection abbreviation expanded
- **WHEN** input contains standalone `inj`
- **THEN** the normalizer SHALL produce output containing `injection`

---

### Requirement: Special character removal
The normalizer SHALL strip bracket characters while keeping their content (e.g. `[Banned]` → `Banned`), convert bare `/` to ` / `, replace commas with spaces, and replace any remaining unrecognised characters with spaces so adjacent tokens do not merge.

#### Scenario: Brackets stripped, content preserved
- **WHEN** input contains `[Banned]`
- **THEN** the normalizer SHALL produce output containing `banned` (after lowercasing) without bracket characters

#### Scenario: Parentheses content preserved
- **WHEN** input contains `tablet(Cyanocobalamin)`
- **THEN** the normalizer SHALL produce output where `tablet` and `cyanocobalamin` are separated by whitespace

---

### Requirement: Output lowercasing and whitespace normalization
The normalizer SHALL convert the fully expanded text to lowercase and collapse any consecutive whitespace to a single space, trimming leading and trailing whitespace.

#### Scenario: Output is lowercase
- **WHEN** any input is normalized
- **THEN** the output SHALL contain no uppercase characters

#### Scenario: Output has no consecutive spaces
- **WHEN** expansions introduce extra spaces
- **THEN** the final output SHALL contain no runs of more than one space and SHALL have no leading or trailing whitespace

---

### Requirement: Empty input handling
The normalizer SHALL return an empty string when the input is null, empty, or whitespace-only.

#### Scenario: Null or whitespace input returns empty
- **WHEN** input is `null`, `""`, or `"   "`
- **THEN** the normalizer SHALL return `string.Empty`
