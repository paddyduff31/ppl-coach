using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PplCoach.Domain.Entities;

namespace PplCoach.Infrastructure.Data.Configurations;

internal class WorkoutTemplateItemConfiguration : IEntityTypeConfiguration<WorkoutTemplateItem>
{
    public void Configure(EntityTypeBuilder<WorkoutTemplateItem> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Notes).HasMaxLength(500);
        builder.HasOne(e => e.Movement)
            .WithMany()
            .HasForeignKey(e => e.MovementId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
