## MODIFIED Requirements

### Requirement: Navigable status gate on list rows
Mapping Name cells SHALL always be clickable links to `/mappings-list/{id}`, regardless of status. The status-based gate and tooltip on non-navigable statuses are removed.

#### Scenario: Status is any value
- **WHEN** a mapping row has any status (New, Processing, Mapping, Verifying, Verified, or other)
- **THEN** the Mapping Name cell SHALL render as a `<Link>` to `/mappings-list/{id}`
