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
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(PplCoachDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }
}
