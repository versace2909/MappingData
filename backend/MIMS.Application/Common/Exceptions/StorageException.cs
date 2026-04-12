namespace MIMS.Application.Common.Exceptions;

public class StorageException(string message, Exception? innerException = null)
    : Exception(message, innerException);
