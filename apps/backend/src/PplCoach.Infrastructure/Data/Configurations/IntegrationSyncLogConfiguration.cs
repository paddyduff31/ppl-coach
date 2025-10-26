using System.Collections.Generic;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PplCoach.Domain.Entities;

namespace PplCoach.Infrastructure.Data.Configurations;

internal class IntegrationSyncLogConfiguration : IEntityTypeConfiguration<IntegrationSyncLog>
{
    public void Configure(EntityTypeBuilder<IntegrationSyncLog> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.ErrorMessage);
        builder.Property(e => e.SyncCursor);
        builder.Property(e => e.Metadata)
            .HasConversion(
                v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                v => JsonSerializer.Deserialize<Dictionary<string, object>>(v, (JsonSerializerOptions?)null) ?? new());
    }
}
