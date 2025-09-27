namespace PplCoach.Domain.Exceptions;

public class ExternalServiceException : Exception
{
    public string? ServiceName { get; }

    public ExternalServiceException(string serviceName) : base($"External service '{serviceName}' is currently unavailable")
    {
        ServiceName = serviceName;
    }

    public ExternalServiceException(string serviceName, string message) : base(message)
    {
        ServiceName = serviceName;
    }

    public ExternalServiceException(string serviceName, string message, Exception innerException) : base(message, innerException)
    {
        ServiceName = serviceName;
    }
}
