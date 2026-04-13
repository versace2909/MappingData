namespace MIMS.Application.Common.Extensions;

public static class StringExtensions
{
    public static double CalculateWordAppearancePercentage(this string source, string target)
    {
        var sourceSplit = source.Split(' ', StringSplitOptions.RemoveEmptyEntries).ToHashSet();
        if (sourceSplit.Count == 0)
            return 0;

        var targetSplit = target.Split(' ', StringSplitOptions.RemoveEmptyEntries).ToHashSet();
        return (double)sourceSplit.Intersect(targetSplit).Count() / sourceSplit.Count;
    }
}
