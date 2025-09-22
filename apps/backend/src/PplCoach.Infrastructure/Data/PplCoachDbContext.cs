using Microsoft.EntityFrameworkCore;
using PplCoach.Domain.Entities;

namespace PplCoach.Infrastructure.Data;

public class PplCoachDbContext(DbContextOptions<PplCoachDbContext> options) : DbContext(options)
{
    public DbSet<UserProfile> UserProfiles { get; set; }
    public DbSet<EquipmentItem> EquipmentItems { get; set; }
    public DbSet<Movement> Movements { get; set; }
    public DbSet<WorkoutTemplate> WorkoutTemplates { get; set; }
    public DbSet<WorkoutTemplateItem> WorkoutTemplateItems { get; set; }
    public DbSet<WorkoutSession> WorkoutSessions { get; set; }
    public DbSet<SetLog> SetLogs { get; set; }
    public DbSet<BodyMetric> BodyMetrics { get; set; }
    public DbSet<ThirdPartyIntegration> ThirdPartyIntegrations { get; set; }
    public DbSet<IntegrationSyncLog> IntegrationSyncLogs { get; set; }
    public DbSet<ExternalWorkout> ExternalWorkouts { get; set; }

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

        modelBuilder.Entity<ThirdPartyIntegration>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ExternalUserId).IsRequired().HasMaxLength(100);
            entity.Property(e => e.AccessToken).IsRequired();
            entity.Property(e => e.RefreshToken);
            entity.Property(e => e.SyncCursor);
            entity.Property(e => e.Metadata)
                .HasConversion(
                    v => System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions?)null),
                    v => System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(v, (System.Text.Json.JsonSerializerOptions?)null) ?? new());
            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasMany(e => e.SyncLogs)
                .WithOne(e => e.Integration)
                .HasForeignKey(e => e.IntegrationId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasIndex(e => new { e.UserId, e.Type }).IsUnique();
        });

        modelBuilder.Entity<IntegrationSyncLog>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ErrorMessage);
            entity.Property(e => e.SyncCursor);
            entity.Property(e => e.Metadata)
                .HasConversion(
                    v => System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions?)null),
                    v => System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(v, (System.Text.Json.JsonSerializerOptions?)null) ?? new());
        });

        modelBuilder.Entity<ExternalWorkout>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ExternalId).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Description);
            entity.Property(e => e.ActivityType).IsRequired().HasMaxLength(50);
            entity.Property(e => e.CaloriesBurned).HasPrecision(8, 2);
            entity.Property(e => e.DistanceMeters).HasPrecision(10, 2);
            entity.Property(e => e.RawData)
                .HasConversion(
                    v => System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions?)null),
                    v => System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(v, (System.Text.Json.JsonSerializerOptions?)null) ?? new());
            entity.HasOne(e => e.Integration)
                .WithMany()
                .HasForeignKey(e => e.IntegrationId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(e => e.ImportedSession)
                .WithMany()
                .HasForeignKey(e => e.ImportedSessionId)
                .OnDelete(DeleteBehavior.SetNull);
            entity.HasIndex(e => new { e.IntegrationId, e.ExternalId }).IsUnique();
        });

        base.OnModelCreating(modelBuilder);
    }
}