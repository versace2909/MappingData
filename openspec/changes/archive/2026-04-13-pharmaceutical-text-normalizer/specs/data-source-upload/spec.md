## MODIFIED Requirements

### Requirement: Description normalization
The backend SHALL populate `normalize_column_data` by normalizing the `description_column_data` value using the pharmaceutical text normalizer, which expands units, dosage-form abbreviations, concentration patterns, and glued tokens into canonical long-form English text before lowercasing and whitespace collapsing.

#### Scenario: Normalization applied on insert
- **WHEN** a `data_source_detail` row is inserted
- **THEN** `normalize_column_data` SHALL be the result of calling `PharmaceuticalTextNormalizer.Normalize(description_column_data)`, which expands known pharmaceutical abbreviations and units, removes special characters, and returns fully lowercase, whitespace-collapsed text

#### Scenario: Simple description normalized
- **WHEN** `description_column_data` is `"Amoxicillin 500mg Cap"`
- **THEN** `normalize_column_data` SHALL be `"amoxicillin 500 milligram capsule"`

#### Scenario: Empty description yields empty normalized value
- **WHEN** `description_column_data` is empty or whitespace
- **THEN** `normalize_column_data` SHALL be `string.Empty`
