using System.Collections.Generic;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PplCoach.Domain.Entities;

namespace PplCoach.Infrastructure.Data.Configurations;

internal class ExternalWorkoutConfiguration : IEntityTypeConfiguration<ExternalWorkout>
{
    public void Configure(EntityTypeBuilder<ExternalWorkout> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.ExternalId).IsRequired().HasMaxLength(100);
        builder.Property(e => e.Name).IsRequired().HasMaxLength(200);
        builder.Property(e => e.Description);
        builder.Property(e => e.ActivityType).IsRequired().HasMaxLength(50);
        builder.Property(e => e.CaloriesBurned).HasPrecision(8, 2);
        builder.Property(e => e.DistanceMeters).HasPrecision(10, 2);
        builder.Property(e => e.RawData)
            .HasConversion(
                v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                v => JsonSerializer.Deserialize<Dictionary<string, object>>(v, (JsonSerializerOptions?)null) ?? new());
        builder.HasOne(e => e.Integration)
            .WithMany()
            .HasForeignKey(e => e.IntegrationId)
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(e => e.ImportedSession)
            .WithMany()
            .HasForeignKey(e => e.ImportedSessionId)
            .OnDelete(DeleteBehavior.SetNull);
        builder.HasIndex(e => new { e.IntegrationId, e.ExternalId }).IsUnique();
    }
}
