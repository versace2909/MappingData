namespace MIMS.Application.Common.Helpers;

public static class TextNormalizer
{
    public static string Normalize(string input)
    {
        return PharmaceuticalTextNormalizer.Normalize(input);
    }
}
