namespace PplCoach.Domain.Exceptions;

public class BusinessRuleViolationException : Exception
{
    public string? ErrorCode { get; }

    public BusinessRuleViolationException(string message) : base(message)
    {
    }

    public BusinessRuleViolationException(string message, string errorCode) : base(message)
    {
        ErrorCode = errorCode;
    }

    public BusinessRuleViolationException(string message, Exception innerException) : base(message, innerException)
    {
    }

    public BusinessRuleViolationException(string message, string errorCode, Exception innerException) : base(message, innerException)
    {
        ErrorCode = errorCode;
    }
}
