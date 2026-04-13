using System.Text.RegularExpressions;

namespace MIMS.Application.Common.Helpers;

public static class PharmaceuticalTextNormalizer
{
    private sealed class NormalizerSnapshot
    {
        public required Dictionary<string, string> UnitExpansions { get; init; }
        public required List<KeyValuePair<string, string>> UnitExpansionsSorted { get; init; }
        public required Dictionary<string, string> GluedTokenExpansions { get; init; }
        public required List<KeyValuePair<string, string>> GluedTokensSorted { get; init; }
        public required Dictionary<string, string> HyphenatedDosageForms { get; init; }
        public required List<KeyValuePair<string, string>> HyphenatedDosageFormsSorted { get; init; }
        public required Dictionary<string, string> MultiWordAbbreviations { get; init; }
        public required List<KeyValuePair<string, string>> MultiWordAbbreviationsSorted { get; init; }
        public required Dictionary<string, string> SingleWordAbbreviations { get; init; }
        public required List<KeyValuePair<string, string>> SingleWordAbbreviationsSorted { get; init; }
        public required Regex SegmentPatternRegex { get; init; }
        public required Regex DosageRatioRegex { get; init; }
        public required Regex GluedNumberUnitRegex { get; init; }
        public required Regex GluedNumberTokenRegex { get; init; }
        public string? UpdatedAt { get; init; }
    }

    private static readonly Regex ConcentrationPatternRegex =
        new(@"(%)\s*(w/w|w/v|v/v)", RegexOptions.IgnoreCase | RegexOptions.Compiled);

    private static readonly object _initLock = new();
    private static volatile NormalizerSnapshot? _snapshot;

    public static bool IsInitialized => _snapshot != null;
    public static string? CurrentUpdatedAt => _snapshot?.UpdatedAt;

    public static void Initialize(
        Dictionary<string, string> unitExpansions,
        Dictionary<string, string> gluedTokens,
        Dictionary<string, string> hyphenatedForms,
        Dictionary<string, string> multiWordAbbr,
        Dictionary<string, string> singleWordAbbr,
        string? updatedAt = null)
    {
        var nextSnapshot = BuildSnapshot(unitExpansions, gluedTokens, hyphenatedForms, multiWordAbbr, singleWordAbbr, updatedAt);

        lock (_initLock)
        {
            _snapshot = nextSnapshot;
        }
    }

    /// <summary>
    /// Normalizes a pharmaceutical description string by expanding abbreviations,
    /// explaining concentration/ratio patterns, expanding units, and cleaning special characters.
    /// </summary>
    public static string Normalize(string input)
    {
        if (string.IsNullOrWhiteSpace(input))
            return string.Empty;

        var snapshot = _snapshot ?? throw new InvalidOperationException(
            "PharmaceuticalTextNormalizer has not been initialized. Ensure startup initialization has completed before normalization is used.");

        var text = input;

        // Step 1: Collapse whitespace (keep original case for now; lowercase at end)
        text = Regex.Replace(text, @"\s+", " ").Trim();

        // Step 1b: Thousands grouping — commas only between digits (e.g. 1,000 mcg, 1,000,000 iu)
        text = Regex.Replace(text, @"(?<=\d),(?=\d)", string.Empty);

        // Step 1c: Strength percentage — keep numeral and % as one token (e.g. 0.25 % -> 0.25%)
        text = Regex.Replace(text, @"(\d+\.?\d*)\s+%", "$1%");

        // Step 2: Expand concentration patterns (%w/w, %w/v, %v/v)
        text = ExpandConcentrationPatterns(text);

        // Step 3: Expand dosage ratio patterns (200mg/5mL -> 200 milligram per 5 milliliter)
        // Also handles multi-component strengths (250mg/250mg/10mg)
        text = ExpandDosageRatios(text, snapshot);

        // Step 4: Split glued number-unit tokens (500mg -> 500 milligram)
        text = ExpandGluedTokens(text, snapshot);

        // Step 5: Expand hyphenated compound dosage forms (Pwd-Inj, DT-Tab, etc.)
        text = ExpandHyphenatedDosageForms(text, snapshot);

        // Step 6: Expand multi-word abbreviations (powd for inj, film-coated tab, etc.)
        text = ExpandMultiWordAbbreviations(text, snapshot);

        // Step 7: Expand single-word abbreviations (tab, cap, inj, etc.)
        text = ExpandSingleWordAbbreviations(text, snapshot);

        // Step 8: Remove unwanted special characters
        text = RemoveSpecialCharacters(text);

        // Step 9: Lowercase, collapse spaces, trim
        text = Regex.Replace(text, @"\s+", " ").Trim().ToLowerInvariant();

        return text;
    }

    private static NormalizerSnapshot BuildSnapshot(
        Dictionary<string, string>? unitExpansions,
        Dictionary<string, string>? gluedTokens,
        Dictionary<string, string>? hyphenatedForms,
        Dictionary<string, string>? multiWordAbbr,
        Dictionary<string, string>? singleWordAbbr,
        string? updatedAt)
    {
        var units = new Dictionary<string, string>(unitExpansions ?? new Dictionary<string, string>(), StringComparer.OrdinalIgnoreCase);
        var unitsSorted = units.OrderByDescending(kv => kv.Key.Length).ToList();

        var glued = new Dictionary<string, string>(gluedTokens ?? new Dictionary<string, string>(), StringComparer.OrdinalIgnoreCase);
        var gluedSorted = glued.OrderByDescending(kv => kv.Key.Length).ToList();

        var hyphenated = new Dictionary<string, string>(hyphenatedForms ?? new Dictionary<string, string>(), StringComparer.OrdinalIgnoreCase);
        var hyphenatedSorted = hyphenated.OrderByDescending(kv => kv.Key.Length).ToList();

        var multiWord = new Dictionary<string, string>(multiWordAbbr ?? new Dictionary<string, string>(), StringComparer.OrdinalIgnoreCase);
        var multiWordSorted = multiWord.OrderByDescending(kv => kv.Key.Length).ToList();

        var singleWord = new Dictionary<string, string>(singleWordAbbr ?? new Dictionary<string, string>(), StringComparer.OrdinalIgnoreCase);
        var singleWordSorted = singleWord.OrderByDescending(kv => kv.Key.Length).ToList();

        var unitAlternation = units.Count > 0
            ? string.Join("|", units.Keys.OrderByDescending(k => k.Length).Select(Regex.Escape))
            : "(?!)";

        var segmentPatternRegex = new Regex(
            @"(\d+\.?\d*)\s*(" + unitAlternation + @")(\s*/\s*(\d*\.?\d*)\s*(" + unitAlternation + @"))+",
            RegexOptions.IgnoreCase | RegexOptions.Compiled);

        var dosageRatioRegex = new Regex(
            units.Count > 0
                ? @"(\d+\.?\d*)\s*(" + unitAlternation + @")\s*/\s*(\d*\.?\d*)\s*(" + unitAlternation + @")"
                : "(?!)",
            RegexOptions.IgnoreCase | RegexOptions.Compiled);

        var gluedNumberUnitRegex = new Regex(
            units.Count > 0
                ? @"(\d+\.?\d*)\s*(" + unitAlternation + @")(?!\w)"
                : "(?!)",
            RegexOptions.IgnoreCase | RegexOptions.Compiled);

        var gluedTokenAlt = glued.Count > 0
            ? string.Join("|", gluedSorted.Select(kv => Regex.Escape(kv.Key)))
            : "(?!)";

        var gluedNumberTokenRegex = new Regex(
            @"(\d+\.?\d*)\s*(" + gluedTokenAlt + @")\b",
            RegexOptions.IgnoreCase | RegexOptions.Compiled);

        return new NormalizerSnapshot
        {
            UnitExpansions = units,
            UnitExpansionsSorted = unitsSorted,
            GluedTokenExpansions = glued,
            GluedTokensSorted = gluedSorted,
            HyphenatedDosageForms = hyphenated,
            HyphenatedDosageFormsSorted = hyphenatedSorted,
            MultiWordAbbreviations = multiWord,
            MultiWordAbbreviationsSorted = multiWordSorted,
            SingleWordAbbreviations = singleWord,
            SingleWordAbbreviationsSorted = singleWordSorted,
            SegmentPatternRegex = segmentPatternRegex,
            DosageRatioRegex = dosageRatioRegex,
            GluedNumberUnitRegex = gluedNumberUnitRegex,
            GluedNumberTokenRegex = gluedNumberTokenRegex,
            UpdatedAt = updatedAt
        };
    }

    private static string ExpandConcentrationPatterns(string text)
    {
        var concentrationMap = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            { "w/w", "weight per weight" },
            { "w/v", "weight per volume" },
            { "v/v", "volume per volume" },
        };

        return ConcentrationPatternRegex.Replace(text, match =>
        {
            var percent = match.Groups[1].Value;
            var pattern = match.Groups[2].Value;
            if (concentrationMap.TryGetValue(pattern, out var expanded))
                return percent + " " + expanded;
            return match.Value;
        });
    }

    private static string ExpandDosageRatios(string text, NormalizerSnapshot snapshot)
    {
        text = snapshot.SegmentPatternRegex.Replace(text, match =>
        {
            var fullMatch = match.Value;
            // Split on / to count segments
            var parts = Regex.Split(fullMatch, @"\s*/\s*");
            if (parts.Length == 2)
            {
                // Two-part ratio -> use "per"
                return snapshot.DosageRatioRegex.Replace(fullMatch, ratioMatch =>
                {
                    var num1 = ratioMatch.Groups[1].Value;
                    var unit1 = ratioMatch.Groups[2].Value;
                    var num2 = ratioMatch.Groups[3].Value;
                    var unit2 = ratioMatch.Groups[4].Value;

                    var expandedUnit1 = ExpandUnit(unit1, snapshot);
                    var expandedUnit2 = ExpandUnit(unit2, snapshot);

                    var left = num1 + " " + expandedUnit1;
                    var right = string.IsNullOrEmpty(num2)
                        ? expandedUnit2
                        : num2 + " " + expandedUnit2;

                    return left + " per " + right;
                });
            }

            var expandedParts = new List<string>();
            foreach (var part in parts)
            {
                expandedParts.Add(ExpandSingleStrengthToken(part.Trim(), snapshot));
            }

            return string.Join(" / ", expandedParts);
        });

        text = snapshot.DosageRatioRegex.Replace(text, ratioMatch =>
        {
            var num1 = ratioMatch.Groups[1].Value;
            var unit1 = ratioMatch.Groups[2].Value;
            var num2 = ratioMatch.Groups[3].Value;
            var unit2 = ratioMatch.Groups[4].Value;

            var expandedUnit1 = ExpandUnit(unit1, snapshot);
            var expandedUnit2 = ExpandUnit(unit2, snapshot);

            var left = num1 + " " + expandedUnit1;
            var right = string.IsNullOrEmpty(num2)
                ? expandedUnit2
                : num2 + " " + expandedUnit2;

            return left + " per " + right;
        });

        return text;
    }

    private static string ExpandSingleStrengthToken(string token, NormalizerSnapshot snapshot)
    {
        // Expand a token like "250mg" or "60millioncells" into "250 milligram"
        var result = snapshot.GluedNumberTokenRegex.Replace(token, tokenMatch =>
        {
            var num = tokenMatch.Groups[1].Value;
            var suffix = tokenMatch.Groups[2].Value;
            if (snapshot.GluedTokenExpansions.TryGetValue(suffix, out var expanded))
                return num + " " + expanded;
            return tokenMatch.Value;
        });

        result = snapshot.GluedNumberUnitRegex.Replace(result, unitMatch =>
        {
            var num = unitMatch.Groups[1].Value;
            var unit = unitMatch.Groups[2].Value;
            return num + " " + ExpandUnit(unit, snapshot);
        });

        return result;
    }

    private static string ExpandGluedTokens(string text, NormalizerSnapshot snapshot)
    {
        // Expand special glued tokens first (millioncells, billioncells, etc.)
        text = snapshot.GluedNumberTokenRegex.Replace(text, match =>
        {
            var num = match.Groups[1].Value;
            var suffix = match.Groups[2].Value;
            if (snapshot.GluedTokenExpansions.TryGetValue(suffix, out var expanded))
                return num + " " + expanded;
            return match.Value;
        });

        // Then expand number+unit tokens (500mg -> 500 milligram)
        text = snapshot.GluedNumberUnitRegex.Replace(text, match =>
        {
            var num = match.Groups[1].Value;
            var unit = match.Groups[2].Value;
            return num + " " + ExpandUnit(unit, snapshot);
        });

        return text;
    }

    private static string ExpandHyphenatedDosageForms(string text, NormalizerSnapshot snapshot)
    {
        foreach (var kv in snapshot.HyphenatedDosageFormsSorted)
        {
            text = ReplaceWholeToken(text, kv.Key, kv.Value);
        }

        return text;
    }

    private static string ExpandMultiWordAbbreviations(string text, NormalizerSnapshot snapshot)
    {
        foreach (var kv in snapshot.MultiWordAbbreviationsSorted)
        {
            var pattern = @"(?<=\s|^)" + Regex.Escape(kv.Key) + @"(?=\s|$|,|\.)";
            text = Regex.Replace(text, pattern, kv.Value, RegexOptions.IgnoreCase);
        }

        return text;
    }

    private static string ExpandSingleWordAbbreviations(string text, NormalizerSnapshot snapshot)
    {
        foreach (var kv in snapshot.SingleWordAbbreviationsSorted)
        {
            text = ReplaceWholeWord(text, kv.Key, kv.Value);
        }

        return text;
    }

    private static string RemoveSpecialCharacters(string text)
    {
        // Strip brackets but keep content: [Banned] -> Banned
        text = Regex.Replace(text, @"\[([^\]]*)\]", " $1 ");

        // Convert remaining slashes to spaced separators (ingredient separators)
        // Already-expanded " / " stays as " / "; bare "/" becomes " / "
        text = Regex.Replace(text, @"\s*/\s*", " / ");

        // Commas are list/clause separators — turn into space so words do not merge
        text = text.Replace(",", " ");

        // Replace unrecognized characters with space so adjacent tokens do not merge (e.g. tablet(Cyanocobalamin) -> tablet cyanocobalamin)
        text = Regex.Replace(text, @"[^\p{L}\p{N}\p{M}\s.%/\-]", " ");

        return text;
    }

    private static string ExpandUnit(string unit, NormalizerSnapshot snapshot)
    {
        if (snapshot.UnitExpansions.TryGetValue(unit, out var expanded))
            return expanded;
        return unit;
    }

    private static string ReplaceWholeWord(string text, string word, string replacement)
    {
        var pattern = @"\b" + Regex.Escape(word) + @"\b";
        return Regex.Replace(text, pattern, replacement, RegexOptions.IgnoreCase);
    }

    /// <summary>
    /// Replaces a whole word (bounded by word boundaries or whitespace/start/end)
    /// with its expansion, case-insensitively.
    /// </summary>
    private static string ReplaceWholeToken(string text, string token, string replacement)
    {
        var pattern = @"(?<=\s|^)" + Regex.Escape(token) + @"(?=\s|$|,|\.)";
        return Regex.Replace(text, pattern, replacement, RegexOptions.IgnoreCase);
    }
}
