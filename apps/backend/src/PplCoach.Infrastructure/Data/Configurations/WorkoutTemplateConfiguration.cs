using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PplCoach.Domain.Entities;

namespace PplCoach.Infrastructure.Data.Configurations;

internal class WorkoutTemplateConfiguration : IEntityTypeConfiguration<WorkoutTemplate>
{
    public void Configure(EntityTypeBuilder<WorkoutTemplate> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Name).IsRequired().HasMaxLength(100);
        builder.HasMany(e => e.Items)
            .WithOne(e => e.WorkoutTemplate)
            .HasForeignKey(e => e.WorkoutTemplateId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
