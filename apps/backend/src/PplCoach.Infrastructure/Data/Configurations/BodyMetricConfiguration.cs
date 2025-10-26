using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PplCoach.Domain.Entities;

namespace PplCoach.Infrastructure.Data.Configurations;

internal class BodyMetricConfiguration : IEntityTypeConfiguration<BodyMetric>
{
    public void Configure(EntityTypeBuilder<BodyMetric> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Value).HasPrecision(8, 3);
        builder.HasOne(e => e.User)
            .WithMany()
            .HasForeignKey(e => e.UserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
