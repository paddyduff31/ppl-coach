using Microsoft.EntityFrameworkCore;
using PplCoach.Domain.Entities;

namespace PplCoach.Infrastructure.Data;

public class PplCoachDbContext : DbContext
{
    public PplCoachDbContext(DbContextOptions<PplCoachDbContext> options) : base(options)
    {
    }

    public DbSet<UserProfile> UserProfiles { get; set; }
    public DbSet<EquipmentItem> EquipmentItems { get; set; }
    public DbSet<Movement> Movements { get; set; }
    public DbSet<WorkoutTemplate> WorkoutTemplates { get; set; }
    public DbSet<WorkoutTemplateItem> WorkoutTemplateItems { get; set; }
    public DbSet<WorkoutSession> WorkoutSessions { get; set; }
    public DbSet<SetLog> SetLogs { get; set; }
    public DbSet<BodyMetric> BodyMetrics { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<UserProfile>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(255);
            entity.Property(e => e.DisplayName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.BodyweightKg).HasPrecision(5, 2);
            entity.Property(e => e.HeightCm).HasPrecision(5, 2);
            entity.HasIndex(e => e.Email).IsUnique();
        });

        modelBuilder.Entity<EquipmentItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.MaxLoadKg).HasPrecision(6, 2);
        });

        modelBuilder.Entity<Movement>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
        });

        modelBuilder.Entity<WorkoutTemplate>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.HasMany(e => e.Items)
                .WithOne(e => e.WorkoutTemplate)
                .HasForeignKey(e => e.WorkoutTemplateId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<WorkoutTemplateItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Notes).HasMaxLength(500);
            entity.HasOne(e => e.Movement)
                .WithMany()
                .HasForeignKey(e => e.MovementId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<WorkoutSession>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Notes).HasMaxLength(1000);
            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasMany(e => e.SetLogs)
                .WithOne(e => e.Session)
                .HasForeignKey(e => e.SessionId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<SetLog>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.WeightKg).HasPrecision(6, 2);
            entity.Property(e => e.RPE).HasPrecision(3, 1);
            entity.Property(e => e.Tempo).HasMaxLength(20);
            entity.Property(e => e.Notes).HasMaxLength(500);
            entity.HasOne(e => e.Movement)
                .WithMany()
                .HasForeignKey(e => e.MovementId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<BodyMetric>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Value).HasPrecision(8, 3);
            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        base.OnModelCreating(modelBuilder);
    }
}