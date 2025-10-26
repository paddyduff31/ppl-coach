using System.Collections.Generic;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PplCoach.Domain.Entities;

namespace PplCoach.Infrastructure.Data.Configurations;

internal class ThirdPartyIntegrationConfiguration : IEntityTypeConfiguration<ThirdPartyIntegration>
{
    public void Configure(EntityTypeBuilder<ThirdPartyIntegration> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.ExternalUserId).IsRequired().HasMaxLength(100);
        builder.Property(e => e.AccessToken).IsRequired();
        builder.Property(e => e.RefreshToken);
        builder.Property(e => e.SyncCursor);
        builder.Property(e => e.Metadata)
            .HasConversion(
                v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                v => JsonSerializer.Deserialize<Dictionary<string, object>>(v, (JsonSerializerOptions?)null) ?? new());
        builder.HasOne(e => e.User)
            .WithMany()
            .HasForeignKey(e => e.UserId)
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasMany(e => e.SyncLogs)
            .WithOne(e => e.Integration)
            .HasForeignKey(e => e.IntegrationId)
            .OnDelete(DeleteBehavior.Cascade);
        builder.HasIndex(e => new { e.UserId, e.Type }).IsUnique();
    }
}
