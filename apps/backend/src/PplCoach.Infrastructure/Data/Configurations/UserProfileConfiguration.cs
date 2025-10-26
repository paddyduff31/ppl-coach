using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PplCoach.Domain.Entities;

namespace PplCoach.Infrastructure.Data.Configurations;

internal class UserProfileConfiguration : IEntityTypeConfiguration<UserProfile>
{
    public void Configure(EntityTypeBuilder<UserProfile> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Email).IsRequired().HasMaxLength(255);
        builder.Property(e => e.DisplayName).IsRequired().HasMaxLength(100);
        builder.Property(e => e.BodyweightKg).HasPrecision(5, 2);
        builder.Property(e => e.HeightCm).HasPrecision(5, 2);
        builder.HasIndex(e => e.Email).IsUnique();
    }
}
