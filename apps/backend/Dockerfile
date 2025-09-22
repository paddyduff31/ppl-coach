FROM mcr.microsoft.com/dotnet/sdk:8.0 AS development

WORKDIR /app

# Copy csproj files and restore dependencies
COPY src/PplCoach.Api/PplCoach.Api.csproj src/PplCoach.Api/
COPY src/PplCoach.Application/PplCoach.Application.csproj src/PplCoach.Application/
COPY src/PplCoach.Domain/PplCoach.Domain.csproj src/PplCoach.Domain/
COPY src/PplCoach.Infrastructure/PplCoach.Infrastructure.csproj src/PplCoach.Infrastructure/
COPY tests/PplCoach.Tests/PplCoach.Tests.csproj tests/PplCoach.Tests/
COPY PplCoach.sln .

RUN dotnet restore

# Copy source code
COPY . .

# Build and run in development mode
WORKDIR /app/src/PplCoach.Api
EXPOSE 8080

CMD ["dotnet", "run", "--urls", "http://0.0.0.0:8080"]