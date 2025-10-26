using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PplCoach.Domain.Entities;

namespace PplCoach.Infrastructure.Data.Configurations;

internal class SetLogConfiguration : IEntityTypeConfiguration<SetLog>
{
    public void Configure(EntityTypeBuilder<SetLog> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.WeightKg).HasPrecision(6, 2);
        builder.Property(e => e.RPE).HasPrecision(3, 1);
        builder.Property(e => e.Tempo).HasMaxLength(20);
        builder.Property(e => e.Notes).HasMaxLength(500);
        builder.HasOne(e => e.Movement)
            .WithMany()
            .HasForeignKey(e => e.MovementId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
