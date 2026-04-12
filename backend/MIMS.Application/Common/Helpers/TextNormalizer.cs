using System.Text.RegularExpressions;

namespace MIMS.Application.Common.Helpers;

public static class TextNormalizer
{
    private static readonly Regex MultipleSpaces = new(@"\s+", RegexOptions.Compiled);

    public static string Normalize(string input)
    {
        var trimmed = input.Trim();
        var collapsed = MultipleSpaces.Replace(trimmed, " ");
        return collapsed.ToLowerInvariant();
    }
}
